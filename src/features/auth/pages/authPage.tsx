import { useState, useEffect } from "react";
import { signIn, signUp } from "../authService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getInvitationByToken } from "../../invitations/invitationService";

import "./authPage.css";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("invite");
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>(
    invitationToken ? "register" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadInvitation() {
      if (!invitationToken) return;

      setInvitationLoading(true);

      try {
        const invitation = await getInvitationByToken(invitationToken);

        if (!invitation) {
          setError("Vi kunde inte hitta någon giltig inbjudan.");
          return;
        }

      } catch (error) {
        console.error("Could not load invitation:", error);
        setError("Det gick inte att hämta inbjudan.");
      } finally {
        setInvitationLoading(false);
      }
    }

    loadInvitation();
  }, [invitationToken]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const redirectTo = invitationToken
          ? `${window.location.origin}/invite/${invitationToken}`
          : undefined;

        const data = await signUp(email, password, displayName, redirectTo);

        if (data.session && invitationToken) {
          navigate(`/invite/${invitationToken}`);
        } else {
          setMessage(
            "Kontot har skapats! Kontrollera din e-post för att bekräfta kontot.",
          );
        }
      } else {
        await signIn(email, password);

        if (invitationToken) {
          navigate(`/invite/${invitationToken}`);
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Något gick fel. Försök igen.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Circle</h1>
        <p>En plats för era gemensamma minnen.</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Logga in
          </button>

          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Skapa konto
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="displayName">Namn</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Ditt namn"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={
                invitationLoading
                  ? "Hämtar e-postadress..."
                  : "namn@example.com"
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minst 6 tecken"
              minLength={6}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" disabled={loading || invitationLoading}>
            {loading
              ? "Vänta..."
              : mode === "login"
                ? "Logga in"
                : "Skapa konto"}
          </button>
        </form>
      </section>
    </main>
  );
}
