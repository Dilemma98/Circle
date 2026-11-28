
interface ProfileEditFormProps {
  displayName: string;
  saving: boolean;
  message: string;
  onDisplayNameChange: (value: string) => void;
  onSave: () => void;
}

export default function ProfileEditForm({
  displayName,
  saving,
  message,
  onDisplayNameChange,
  onSave,
}: ProfileEditFormProps) {
  return (
    <section className="profile-section">
      <div className="profile-section-heading">
        <h2>Redigera profil</h2>
        <p>Ändra hur ditt namn visas för andra medlemmar.</p>
      </div>

      <div className="profile-edit-form">
        <label htmlFor="display-name">Visningsnamn</label>

        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder="Ditt namn"
        />

        <button onClick={onSave} disabled={saving}>
          {saving ? "Sparar..." : "Spara ändringar"}
        </button>

        {message && (
          <p className="profile-message">{message}</p>
        )}
      </div>
    </section>
  );
}
