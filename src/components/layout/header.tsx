import "./header.css";
import { useAuth } from "../../features/auth/authProvider";
import ThemeToggle from "../common/themeToggle";
import { supabase } from "../../lib/supabase";

export default function Header() {
  const { profile } = useAuth();

  const name = profile?.display_name ?? "";
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  console.log("header", profile);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Could not sign out:", error);
  }
  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-icon">○</span>
        <span>Circle</span>
      </div>

      <div className="header-actions">
        <ThemeToggle />

        {/* <div className="user-profile">
          {profile?.avatar_url ? (
            <img className="user-avatar" src={profile.avatar_url} alt={name} />
          ) : (
            <div className="user-avatar">{initial}</div>
          )}
        </div> */}

        <button className="dev-logout" onClick={handleLogout}>
          Logga ut
        </button>
      </div>
    </header>
  );
}
