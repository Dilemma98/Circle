import "./navigation.css";

export default function Navigation() {
  return (
    <nav className="main-navigation">
      <a href="/" className="active">
        Hem
      </a>

      <a href="/groups">
        Mina grupper
      </a>

      <a href="/profile">
        Profil
      </a>
    </nav>
  );
}
