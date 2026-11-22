import "./themeToggle.css";

import { useTheme } from "../../features/theme/themeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div className="theme-toggle-container">
      <span className="theme-toggle-label">Mörkt läge</span>

      <button
        className={`theme-toggle ${isDark ? "active" : ""}`}
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label="Mörkt läge"
      >
        <span className="theme-toggle-slider" />
      </button>
    </div>
  );
}