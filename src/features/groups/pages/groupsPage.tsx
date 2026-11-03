import "./groupsPage.css";

import { mockGroups } from "../data/mockGroups";
import { Link } from "react-router-dom";

export default function GroupsPage() {
  return (
    <div className="groups-page">
      <section className="groups-page-header">
        <p className="eyebrow">DIN GEMENSKAP</p>
        <h1>Mina grupper</h1>
        <p>Här samlas människorna och minnena du delar med dem.</p>
      </section>

      <section className="groups-list">
        {mockGroups.map((group) => (
          <Link
            to={`/groups/${group.id}`}
            className="group-card"
            key={group.id}
          >
            <h2>{group.name}</h2>
          </Link>
        ))}
      </section>
    </div>
  );
}
