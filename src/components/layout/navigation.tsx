
import { NavLink } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  return (
    <nav className="main-navigation">
      <NavLink to="/" end>
        Hem
      </NavLink>

      <NavLink to="/groups">
        Mina grupper
      </NavLink>

      <NavLink to="/profile">
        Profil
      </NavLink>
    </nav>
  );
}
