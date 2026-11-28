
import { useState } from "react";
import { signIn, signUp } from "../authService";
import { useNavigate, useSearchParams } from "react-router-dom";

import "./authPage.css";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const invitationCode = searchParams.get("invite");

  const [mode, setMode] = useState<AuthMode>(
    invitationCode ? "register" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const redirectTo = invitationCode
          ? `${window.location.origin}/invite?code=${encodeURIComponent(invitationCode)}`
          : undefined;

        const data = await signUp(
          email,
          password,
          displayName,
          redirectTo,
        );

        if (data.session && invitationCode) {
          navigate(
            `/invite?code=${encodeURIComponent(invitationCode)}`,
          );
        } else {
          setMessage(
            "Kontot har skapats! Kontrollera din e-post för att bekräfta kontot.",
          );
        }
      } else {
        await signIn(email, password);

        if (invitationCode) {
          navigate(
            `/invite?code=${encodeURIComponent(invitationCode)}`,
          );
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
              placeholder="namn@example.com"
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

          <button type="submit" disabled={loading}>
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
