
import ProfileAvatar from "./profileAvatar";

interface ProfileOverviewProps {
  avatarUrl: string | null;
  displayName: string;
  email: string;
  createdAt: string;
}

export default function ProfileOverview({
  avatarUrl,
  displayName,
  email,
  createdAt,
}: ProfileOverviewProps) {
  return (
    <section className="profile-overview">
      <ProfileAvatar
        avatarUrl={avatarUrl}
        displayName={displayName}
      />

      <div className="profile-overview-info">
        <h2>{displayName || "Nytt konto"}</h2>
        <p>{email}</p>
        <span className="profile-member-since">
          Medlem sedan {createdAt}
        </span>
      </div>
    </section>
  );
}
