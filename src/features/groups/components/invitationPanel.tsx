
import { useState } from "react";
import { sendInvitation } from "../../invitations/invitationService";
import "./invitationPanel.css";

interface InvitationPanelProps {
  groupId: string;
}

export default function InvitationPanel({
  groupId,
}: InvitationPanelProps) {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCreateInvitation() {
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const result = await sendInvitation(groupId);
      setInvitationCode(result.invitation.code);
    } catch (error) {
      console.error("Could not create invitation:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Kunde inte skapa inbjudningskod.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyInvitation() {
    if (!invitationCode) return;

    try {
      await navigator.clipboard.writeText(invitationCode);
      setCopied(true);
      setError("");
    } catch (error) {
      console.error("Could not copy invitation code:", error);
      setError("Kunde inte kopiera koden. Försök igen.");
    }
  }

  function handleClose() {
    setInvitationCode("");
    setError("");
    setCopied(false);
  }

  const formattedCode = invitationCode.match(/.{1,4}/g)?.join("-") ?? "";

  return (
    <div className="invitation-panel">
      <div className="invitation-panel-header">
        <div className="invitation-icon">
          <span>✉</span>
        </div>

        <div className="invitation-heading">
          <h3>Bjud in till gruppen</h3>
          <p>
            Dela era minnen med fler. Skapa en personlig kod
            som du kan skicka vidare.
          </p>
        </div>
      </div>

      {!invitationCode ? (
        <div className="invitation-create">
          <div className="invitation-info">
            <span className="invitation-info-icon">ⓘ</span>
            <p>
              Den som får koden kan ange den i Circle och gå med
              i gruppen. Koden gäller i 7 dagar och kan användas en gång.
            </p>
          </div>

          {error && (
            <p className="invitation-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className="invitation-primary-button"
            onClick={handleCreateInvitation}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="invitation-spinner" />
                Skapar kod...
              </>
            ) : (
              <>
                <span>＋</span>
                Skapa inbjudningskod
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="invitation-created">
          <div className="invitation-success">
            <span className="invitation-success-icon">✓</span>
            <div>
              <strong>Din inbjudningskod är redo!</strong>
              <p>Skicka koden till personen du vill bjuda in.</p>
            </div>
          </div>

          <label htmlFor="invitation-code">Inbjudningskod</label>

          <div className="invitation-link-field">
            <input
              id="invitation-code"
              type="text"
              value={formattedCode}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
            />

            <button
              type="button"
              onClick={handleCopyInvitation}
              className={copied ? "copied" : ""}
            >
              {copied ? "✓ Kopierad" : "Kopiera"}
            </button>
          </div>

          {copied && (
            <p className="invitation-copy-feedback" role="status">
              Koden har kopierats. Du kan nu skicka den i ett meddelande.
            </p>
          )}

          {error && (
            <p className="invitation-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className="invitation-close-button"
            onClick={handleClose}
          >
            Stäng
          </button>
        </div>
      )}
    </div>
  );
}
