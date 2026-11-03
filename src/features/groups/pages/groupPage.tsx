
import { useState } from "react";
import { useParams } from "react-router-dom";
import { mockGroups } from "../data/mockGroups";

import "./groupPage.css";

type GroupTab = "feed" | "album" | "members";

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();

  const [activeTab, setActiveTab] = useState<GroupTab>("feed");

  const group = mockGroups.find(
    (group) => group.id === groupId
  );

  if (!group) {
    return <p>Gruppen kunde inte hittas.</p>;
  }

  return (
    <div className="group-page">
      <header className="group-page-header">
        <h1>{group.name}</h1>
        <p>Här samlas era gemensamma minnen.</p>
      </header>

      <nav className="group-tabs">
        <button
          className={activeTab === "feed" ? "active" : ""}
          onClick={() => setActiveTab("feed")}
        >
          Flöde
        </button>

        <button
          className={activeTab === "album" ? "active" : ""}
          onClick={() => setActiveTab("album")}
        >
          Album
        </button>

        <button
          className={activeTab === "members" ? "active" : ""}
          onClick={() => setActiveTab("members")}
        >
          Medlemmar
        </button>
      </nav>

      <section className="group-tab-content">
        {activeTab === "feed" && <p>Gruppens flöde kommer här.</p>}
        {activeTab === "album" && <p>Gruppens fotoalbum kommer här.</p>}
        {activeTab === "members" && <p>Gruppens medlemmar kommer här.</p>}
      </section>
    </div>
  );
}
