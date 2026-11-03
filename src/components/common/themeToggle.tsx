import "./themeToggle.css";

import { useTheme } from "../../features/theme/themeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Aktivera mörkt tema" : "Aktivera ljust tema"}
      title={theme === "light" ? "Mörkt tema" : "Ljust tema"}
    >
      <span>{theme === "light" ? "☾" : "☀"}</span>
    </button>
  );
}