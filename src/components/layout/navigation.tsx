import { NavLink } from "react-router-dom";
import { House, Users, UserRound } from "lucide-react";

import { useAuth } from "../../features/auth/authProvider";

import "./navigation.css";

export default function Navigation() {
  const { profile } = useAuth();

  return (
    <nav className="main-navigation">
      <NavLink to="/" end aria-label="Hem" title="Hem">
        <House />
      </NavLink>

      <NavLink to="/groups" aria-label="Mina grupper" title="Mina grupper">
        <Users />
      </NavLink>

      <NavLink to="/profile" aria-label="Profil" title="Profil">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="navigation-avatar"
          />
        ) : (
          <UserRound />
        )}
      </NavLink>
    </nav>
  );
}