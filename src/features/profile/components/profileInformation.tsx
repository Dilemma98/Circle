
interface ProfileInformationProps {
  displayName: string;
  email: string;
  createdAt: string;
  emailVerified: boolean;
}

export default function ProfileInformation({
  displayName,
  email,
  createdAt,
  emailVerified,
}: ProfileInformationProps) {
  return (
    <section className="profile-section">
      <div className="profile-section-heading">
        <h2>Personuppgifter</h2>
        <p>Information kopplad till ditt konto.</p>
      </div>

      <div className="profile-information">
        <div className="profile-information-item">
          <span>Visningsnamn</span>
          <strong>{displayName || "Inte angivet"}</strong>
        </div>

        <div className="profile-information-item">
          <span>E-postadress</span>
          <strong>{email || "Okänd"}</strong>
        </div>

        <div className="profile-information-item">
          <span>Medlem sedan</span>
          <strong>{createdAt}</strong>
        </div>

        <div className="profile-information-item">
          <span>E-poststatus</span>
          <strong>
            {emailVerified ? "Verifierad" : "Ej verifierad"}
          </strong>
        </div>
      </div>
    </section>
  );
}
