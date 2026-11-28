
import ThemeToggle from "../../../components/common/themeToggle";

interface ProfileAccountActionsProps {
  onLogout: () => void;
}

export default function ProfileAccountActions({
  onLogout,
}: ProfileAccountActionsProps) {
  return (
    <div className="profile-account-actions">
      <ThemeToggle />

      <button
        type="button"
        className="logout"
        onClick={onLogout}
      >
        Logga ut
      </button>
    </div>
  );
}
