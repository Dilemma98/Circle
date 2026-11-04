import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { acceptInvitation } from "../invitationService";
import { useAuth } from "../../auth/authProvider";
import { getInvitationByToken, type Invitation } from "../invitationService";
import { signOut } from "../../auth/authService";

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();

  const navigate = useNavigate();

  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState("");

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  async function handleAcceptInvitation() {
    if (!token) return;

    setAccepting(true);
    setAcceptError("");

    try {
      const result = await acceptInvitation(token);

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

  useEffect(() => {
    async function loadInvitation() {
      if (!token) {
        setError("Inbjudningslänken är ogiltig.");
        setLoading(false);
        return;
      }

      try {
        const data = await getInvitationByToken(token);

        if (!data) {
          setError("Vi kunde inte hitta någon inbjudan.");
          return;
        }

        setInvitation(data);
      } catch (err) {
        console.error("Could not load invitation:", err);
        setError("Det gick inte att hämta inbjudan.");
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [token]);

  useEffect(() => {
    if (loading || authLoading || !invitation) return;

    if (!user) {
      navigate(`/login?invite=${token}`, { replace: true });
    }
  }, [loading, authLoading, invitation, user, token, navigate]);

  if (loading || authLoading) {
    return <p>Hämtar din inbjudan...</p>;
  }

  if (!user) {
    return <p>Du skickas vidare till registrering eller inloggning...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!invitation) {
    return <p>Inbjudan kunde inte visas.</p>;
  }

  const isExpired = new Date(invitation.expires_at) < new Date();
  const isAccepted = invitation.accepted_at !== null;
  const isWrongAccount =
    user.email?.toLowerCase() !== invitation.email.toLowerCase();

  return (
    <main>
      <h1>Du har blivit inbjuden till Circle!</h1>

      <p>
        Du har blivit inbjuden till <b>{invitation.group_name}</b>
      </p>

      {isAccepted ? (
        <p>Den här inbjudan har redan accepterats.</p>
      ) : isExpired ? (
        <p>Den här inbjudan har gått ut.</p>
      ) : isWrongAccount ? (
        <p>
          Oops, det ser ut som den här inbjudan var menad för någon annan.
        </p>
      ) : (
        <>
          <button onClick={handleAcceptInvitation} disabled={accepting}>
            {accepting ? "Accepterar..." : "Acceptera inbjudan"}
          </button>

          {acceptError && <p>{acceptError}</p>}
        </>
      )}
    </main>
  );
}
