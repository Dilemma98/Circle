import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./groupsPage.css";

import { getMyGroups, createGroup } from "../groupService";
import type { Group } from "../types/group";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreateGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = groupName.trim();

    if (!trimmedName) {
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const newGroup = await createGroup(trimmedName);

      setGroups((currentGroups) => [newGroup, ...currentGroups]);
      setGroupName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Could not create group:", error);
      setCreateError("Kunde inte skapa gruppen. Försök igen.");
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    async function loadGroups() {
      try {
        const data = await getMyGroups();
        setGroups(data);
      } catch (error) {
        console.error("Could not load groups:", error);
        setError("Kunde inte hämta dina grupper.");
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, []);

  return (
    <div className="groups-page">
      <section className="groups-page-header">
        <p className="eyebrow">DIN GEMENSKAP</p>
        <h1>Mina grupper</h1>
        <p>Här samlas människorna och minnena du delar med dem.</p>
      </section>

      <div className="groups-actions">
        <button
          type="button"
          onClick={() => setShowCreateForm((current) => !current)}
        >
          + Skapa grupp
        </button>
      </div>

      {showCreateForm && (
        <form className="create-group-form" onSubmit={handleCreateGroup}>
          <label htmlFor="groupName">Gruppnamn</label>

          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Exempelvis Familjen"
            maxLength={50}
            required
          />

          {createError && <p className="create-group-error">{createError}</p>}

          <div className="create-group-actions">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setGroupName("");
                setCreateError(null);
              }}
            >
              Avbryt
            </button>

            <button type="submit" disabled={creating}>
              {creating ? "Skapar..." : "Skapa"}
            </button>
          </div>
        </form>
      )}

      <section className="groups-list">
        {loading && <p>Hämtar dina grupper...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && groups.length === 0 && (
          <p>Du har inte gått med i någon grupp ännu.</p>
        )}

        {!loading &&
          !error &&
          groups.map((group) => (
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
