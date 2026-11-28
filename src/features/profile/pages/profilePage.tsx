import { useEffect, useState } from "react";
import { useAuth } from "../../auth/authProvider";
import { updateMyProfile } from "../../auth/profileService";
import { supabase } from "../../../lib/supabase";

import ProfileOverview from "../components/profileOverview";
import ProfileInformation from "../components/profileInformation";
import ProfileEditForm from "../components/profileEditForm";
import ProfileAccountActions from "../components/profileAccountActions";

import "../profilePage.css";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

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

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Could not sign out:", error);
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

      <ProfileOverview
        avatarUrl={profile?.avatar_url ?? null}
        displayName={profile?.display_name ?? ""}
        email={user?.email ?? ""}
        createdAt={createdAt}
      />

      <ProfileInformation
        displayName={profile?.display_name ?? ""}
        email={user?.email ?? ""}
        createdAt={createdAt}
        emailVerified={!!emailVerified}
      />

      <ProfileEditForm
        displayName={displayName}
        saving={saving}
        message={message}
        onDisplayNameChange={setDisplayName}
        onSave={handleSave}
      />

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

      <ProfileAccountActions onLogout={handleLogout} />
      {message && <p className="profile-message">{message}</p>}
    </main>
  );
}
