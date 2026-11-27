
import { NavLink, useNavigate } from "react-router-dom";
import { House, Users, Plus } from "lucide-react";

import { useAuth } from "../../features/auth/authProvider";
import Avatar from "../avatar";

import "./navigation.css";

export default function Navigation() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  function handleCreatePost() {
    navigate("/", {
      state: { openCreatePost: true },
    });
  }

  return (
    <nav className="main-navigation">
      <NavLink to="/" end aria-label="Hem" title="Hem">
        <House />
      </NavLink>

      <NavLink to="/groups" aria-label="Mina grupper" title="Mina grupper">
        <Users />
      </NavLink>

      <button
        type="button"
        className="create-post-nav-button"
        onClick={handleCreatePost}
        aria-label="Skapa inlägg"
        title="Skapa inlägg"
      >
        <Plus />
      </button>

      <NavLink to="/profile" aria-label="Profil" title="Profil">
        <Avatar
          src={profile?.avatar_url ?? null}
          name={profile?.display_name ?? ""}
          size={32}
          fallback="icon"
          className="navigation-avatar"
        />
      </NavLink>
    </nav>
  );
}
