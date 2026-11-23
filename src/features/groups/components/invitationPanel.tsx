
import { useState } from "react";
import { sendInvitation } from "../../invitations/invitationService";
import "./invitationPanel.css";

interface InvitationPanelProps {
  groupId: string;
}

export default function InvitationPanel({
  groupId,
}: InvitationPanelProps) {
  const [invitationUrl, setInvitationUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCreateInvitation() {
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const result = await sendInvitation(groupId);
      setInvitationUrl(result.invitationUrl);
    } catch (error) {
      console.error("Could not create invitation:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Kunde inte skapa inbjudningslänk.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyInvitation() {
    if (!invitationUrl) return;

    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setError("");
    } catch (error) {
      console.error("Could not copy invitation link:", error);
      setError("Kunde inte kopiera länken. Försök igen.");
    }
  }

  function handleClose() {
    setInvitationUrl("");
    setError("");
    setCopied(false);
  }

  return (
    <div className="invitation-panel">
      <div className="invitation-panel-header">
        <div className="invitation-icon">
          <span>✉</span>
        </div>

        <div className="invitation-heading">
          <h3>Bjud in till gruppen</h3>
          <p>
            Dela era minnen med fler. Skapa en personlig länk
            som du kan skicka vidare.
          </p>
        </div>
      </div>

      {!invitationUrl ? (
        <div className="invitation-create">
          <div className="invitation-info">
            <span className="invitation-info-icon">ⓘ</span>
            <p>
              Den som får länken kan öppna den, skapa ett konto
              och gå med i gruppen. Länken gäller i 7 dagar.
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
                Skapar länk...
              </>
            ) : (
              <>
                <span>＋</span>
                Skapa inbjudningslänk
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="invitation-created">
          <div className="invitation-success">
            <span className="invitation-success-icon">✓</span>
            <div>
              <strong>Din inbjudan är redo!</strong>
              <p>Nu kan du dela länken med den du vill bjuda in.</p>
            </div>
          </div>

          <label htmlFor="invitation-url">Inbjudningslänk</label>

          <div className="invitation-link-field">
            <input
              id="invitation-url"
              type="text"
              value={invitationUrl}
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
              Länken har kopierats. Du kan nu klistra in den i ett meddelande.
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
