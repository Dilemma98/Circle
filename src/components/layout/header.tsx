import "./header.css";

import ThemeToggle from "../common/themeToggle";

export default function Header() {
  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-icon">○</span>
        <span>Circle</span>
      </div>

      <div className="header-actions">
        <ThemeToggle />

        <div className="user-profile">
          <div className="user-avatar">E</div>
        </div>
      </div>
    </header>
  );
}
