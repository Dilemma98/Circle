
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyGroups } from "../../features/groups/groupService";
import type { Group } from "../../features/groups/types/group";

import "./header.css";

export default function Header() {
  const [groups, setGroups] = useState<Group[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGroups() {
      try {
        const data = await getMyGroups();
        setGroups(data);
      } catch (error) {
        console.error("Could not load groups:", error);
      }
    }

    loadGroups();
  }, []);

  const visibleGroups = groups.slice(0, 4);
  const remainingGroups = groups.length - visibleGroups.length;

  
return (
  <header className="app-header">
    <nav className="header-groups" aria-label="Mina grupper">
      {visibleGroups.map((group) => (
        <button
          key={group.id}
          type="button"
          className="header-group-avatar"
          style={{ backgroundColor: group.color }}
          onClick={() => navigate(`/groups/${group.id}`)}
          title={group.name}
          aria-label={`Öppna gruppen ${group.name}`}
        >
          {group.coverImage && (
            <img src={group.coverImage} alt="" />
          )}
        </button>
      ))}

      {remainingGroups > 0 && (
        <button
          type="button"
          className="header-group-more"
          onClick={() => navigate("/groups")}
          aria-label={`Visa ${remainingGroups} fler grupper`}
        >
          +{remainingGroups}
        </button>
      )}
    </nav>
  </header>
);

}
