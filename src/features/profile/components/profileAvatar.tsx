
import { useEffect, useState } from "react";
import { uploadProfileAvatar } from "../../auth/profileService";
import { useAuth } from "../../auth/authProvider";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  displayName: string;
}

export default function ProfileAvatar({
  avatarUrl,
  displayName,
}: ProfileAvatarProps) {
  const { refreshProfile } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

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

    // Allow selecting the same file again.
    event.target.value = "";
  }

  function cancelImageSelection() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage("");
  }

  async function handleUpload() {
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

  return (
    <div className="profile-avatar-container">
      <div className="profile-avatar">
        {previewUrl ? (
          <img src={previewUrl} alt="Förhandsvisning av profilbild" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Profilbild" />
        ) : (
          <span>{displayName.charAt(0).toUpperCase() || "?"}</span>
        )}
      </div>

      <label htmlFor="avatar-upload" className="profile-avatar-button">
        {selectedFile ? "Byt bild" : "Ändra bild"}
      </label>

      <input
        id="avatar-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageSelect}
        hidden
      />

      {selectedFile && (
        <div className="profile-image-preview">
          <p>Förhandsvisning av din nya profilbild</p>

          <div className="profile-image-actions">
            <button onClick={handleUpload} disabled={uploading}>
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
        </div>
      )}

      {message && <p className="profile-message">{message}</p>}
    </div>
  );
}
