
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/authProvider";
import {
  updateMyProfile,
  uploadProfileAvatar,
} from "../../auth/profileService";
import "./profilePage.css";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(
    profile?.display_name ?? ""
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Keep the input synchronized when the profile loads or changes.
  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  // Clean up temporary preview URLs.
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    console.log("selected file:", file)

    if (!file) return;

    setMessage("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Välj en JPG-, PNG- eller WebP-bild.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Bilden får vara högst 10 MB.");
      event.target.value = "";
      return;
    }

   setSelectedFile(file);
   setPreviewUrl(URL.createObjectURL(file));

   console.log("file selected successfully")

   // Allow selecting the same file again.
   event.target.value = "";
  }

  function cancelImageSelection() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage("");
  }

  async function handleUploadAvatar() {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setMessage("");

      await uploadProfileAvatar(selectedFile);
      await refreshProfile();

      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage("Profilbilden har uppdaterats!");
    } catch (error) {
      console.error("Could not upload profile image:", error);
      setMessage("Kunde inte ladda upp profilbilden.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!displayName.trim()) {
      setMessage("Du behöver ange ett visningsnamn.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await updateMyProfile({
        display_name: displayName.trim(),
      });

      await refreshProfile();

      setMessage("Profilen har uppdaterats!");
    } catch (error) {
      console.error("Could not update profile:", error);
      setMessage("Kunde inte uppdatera profilen.");
    } finally {
      setSaving(false);
    }
  }

  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Okänt";

  const emailVerified = user?.email_confirmed_at;

  return (
    <main className="profile-page">
      <header className="profile-header">
        <p className="profile-eyebrow">MITT KONTO</p>
        <h1>Min profil</h1>
        <p>Här hittar du dina personuppgifter och kontoinställningar.</p>
      </header>

      <section className="profile-overview">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {previewUrl ? (
              <img src={previewUrl} alt="Förhandsvisning av profilbild" />
            ) : profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profilbild" />
            ) : (
              <span>
                {profile?.display_name?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>

          <label
            htmlFor="avatar-upload"
            className="profile-avatar-button"
          >
            {selectedFile ? "Byt bild" : "Ändra bild"}
          </label>

          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            hidden
          />
        </div>

        <div className="profile-overview-info">
          <h2>{profile?.display_name || "Nytt konto"}</h2>
          <p>{user?.email}</p>
          <span className="profile-member-since">
            Medlem sedan {createdAt}
          </span>
        </div>
      </section>

      {selectedFile && (
        <section className="profile-image-preview">
          <p>Förhandsvisning av din nya profilbild</p>

          <div className="profile-image-actions">
            <button
              onClick={handleUploadAvatar}
              disabled={uploading}
            >
              {uploading ? "Laddar upp..." : "Spara profilbild"}
            </button>

            <button
              className="profile-cancel-button"
              onClick={cancelImageSelection}
              disabled={uploading}
            >
              Avbryt
            </button>
          </div>
        </section>
      )}

      <section className="profile-section">
        <div className="profile-section-heading">
          <h2>Personuppgifter</h2>
          <p>Information kopplad till ditt konto.</p>
        </div>

        <div className="profile-information">
          <div className="profile-information-item">
            <span>Visningsnamn</span>
            <strong>{profile?.display_name || "Inte angivet"}</strong>
          </div>

          <div className="profile-information-item">
            <span>E-postadress</span>
            <strong>{user?.email || "Okänd"}</strong>
          </div>

          <div className="profile-information-item">
            <span>Medlem sedan</span>
            <strong>{createdAt}</strong>
          </div>

          <div className="profile-information-item">
            <span>E-poststatus</span>
            <strong>
              {emailVerified ? "Verifierad" : "Ej verifierad"}
            </strong>
          </div>
        </div>
      </section>

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
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Ditt namn"
          />

          <button onClick={handleSave} disabled={saving}>
            {saving ? "Sparar..." : "Spara ändringar"}
          </button>
        </div>
      </section>

      <section className="profile-section profile-account-section">
        <div className="profile-section-heading">
          <h2>Kontoinformation</h2>
          <p>Teknisk information om ditt Circle-konto.</p>
        </div>

        <div className="profile-information-item">
          <span>Användar-ID</span>
          <code>{user?.id}</code>
        </div>
      </section>

      {message && (
        <p className="profile-message">{message}</p>
      )}
    </main>
  );
}
