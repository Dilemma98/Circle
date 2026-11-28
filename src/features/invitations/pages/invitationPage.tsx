
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  acceptInvitation,
  getInvitationByCode,
  type Invitation,
} from "../invitationService";
import { useAuth } from "../../auth/authProvider";
import { UsersRound, ArrowRight, CheckCircle2 } from "lucide-react";
import "./invitationPage.css";

export default function InvitationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const codeFromUrl = searchParams.get("code") ?? "";

  const [code, setCode] = useState(codeFromUrl);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [acceptError, setAcceptError] = useState("");

  useEffect(() => {
    setCode(codeFromUrl);
  }, [codeFromUrl]);

  useEffect(() => {
    if (authLoading || user || !codeFromUrl.trim()) return;

    navigate(
      `/login?invite=${encodeURIComponent(codeFromUrl)}`,
      { replace: true },
    );
  }, [authLoading, user, codeFromUrl, navigate]);

  async function handleLookupInvitation(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase().replace(/-/g, "");

    setLoading(true);
    setError("");
    setAcceptError("");
    setInvitation(null);

    if (!/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/.test(normalizedCode)) {
      setError("Ange en giltig inbjudningskod med 8 tecken.");
      setLoading(false);
      return;
    }

    setSearchParams({ code: normalizedCode });

    if (!user) {
      navigate(
        `/login?invite=${encodeURIComponent(normalizedCode)}`,
      );
      setLoading(false);
      return;
    }

    try {
      const result = await getInvitationByCode(normalizedCode);

      if (!result) {
        setError("Vi kunde inte hitta någon inbjudan med den koden.");
        return;
      }

      setInvitation(result);
    } catch (err) {
      console.error("Could not load invitation:", err);
      setError("Det gick inte att hämta inbjudan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptInvitation() {
    if (!invitation) return;

    setAccepting(true);
    setAcceptError("");

    try {
      const result = await acceptInvitation(code);

      navigate(`/groups/${result.group.group_id}`);
    } catch (err) {
      console.error("Could not accept invitation:", err);
      setAcceptError(
        err instanceof Error
          ? err.message
          : "Det gick inte att acceptera inbjudan.",
      );
    } finally {
      setAccepting(false);
    }
  }

  const isExpired = invitation
    ? new Date(invitation.expires_at) < new Date()
    : false;

  const isAccepted = invitation?.accepted_at !== null;

  if (authLoading) {
    return <p>Kontrollerar inloggning...</p>;
  }

  if (!user && codeFromUrl) {
    return <p>Du skickas vidare till inloggningen...</p>;
  }

  return (
  <main className="invitation-page">
    <section className="invitation-card">

      <div className="invitation-heading">
        <div className="invitation-icon">
          <UsersRound size={30} />
        </div>

        <h1>Gå med i en grupp</h1>
        <p>Era gemensamma minnen börjar här.</p>
      </div>

      <div className="invitation-content">
        <form
          className="invitation-form"
          onSubmit={handleLookupInvitation}
        >
          <div className="invitation-form-heading">
            <h2>Har du fått en inbjudningskod?</h2>
            <p>
              Skriv in koden du fått från någon i gruppen.
            </p>
          </div>

          <label htmlFor="invitation-code">
            Inbjudningskod
          </label>

          <input
            id="invitation-code"
            className="invitation-code-input"
            type="text"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.toUpperCase())
            }
            placeholder="ABCD-2345"
            maxLength={9}
            autoComplete="off"
            required
          />

          {error && (
            <p className="invitation-error">{error}</p>
          )}

          <button
            className="invitation-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              "Kontrollerar koden..."
            ) : (
              <>
                Hitta min grupp
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="invitation-hint">
            <CheckCircle2 size={15} />
            Koden kan bara användas en gång.
          </p>
        </form>

        {invitation && (
          <div className="invitation-details">
            <div className="invitation-success-icon">
              <CheckCircle2 size={24} />
            </div>

            <h2>Du har blivit inbjuden!</h2>

            <p>
              Du har blivit inbjuden till{" "}
              <strong>{invitation.group_name}</strong>.
            </p>

            {isAccepted ? (
              <p>Den här inbjudan har redan accepterats.</p>
            ) : isExpired ? (
              <p>Den här inbjudan har gått ut.</p>
            ) : (
              <>
                <button
                  className="invitation-submit"
                  onClick={handleAcceptInvitation}
                  disabled={accepting}
                >
                  {accepting
                    ? "Accepterar..."
                    : "Acceptera inbjudan"}
                </button>

                {acceptError && (
                  <p className="invitation-error">
                    {acceptError}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <p className="invitation-footer">
        En privat plats för era gemensamma minnen ♡
      </p>

    </section>
  </main>
);
}
