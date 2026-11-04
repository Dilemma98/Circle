import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getGroupById,
  getGroupMembers,
  type GroupMember,
} from "../groupService";
import type { Group } from "../types/group";
import { useAuth } from "../../auth/authProvider";
import { sendInvitation } from "../../invitations/invitationService";

import "./groupPage.css";

type GroupTab = "feed" | "album" | "members";

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<GroupTab>("feed");
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const isOwner = members.some(
    (member) => member.user_id === user?.id && member.role === "owner",
  );
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => {
    async function loadGroup() {
      if (!groupId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getGroupById(groupId);
        setGroup(data);
      } catch (error) {
        console.error("Could not load group:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGroup();
  }, [groupId]);

  async function loadMembers() {
    if (!groupId) return;

    setMembersLoading(true);

    try {
      const data = await getGroupMembers(groupId);
      setMembers(data);
    } catch (error) {
      console.error("Could not load group members:", error);
    } finally {
      setMembersLoading(false);
    }
  }

  async function handleSendInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!groupId) return;

    setSendingInvitation(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      await sendInvitation(groupId, inviteEmail);

      setInviteSuccess("Inbjudan har skickats!");
      setInviteEmail("");
      setShowInviteForm(false);
    } catch (error) {
      console.error("Could not send invitation:", error);

      setInviteError(
        error instanceof Error ? error.message : "Kunde inte skicka inbjudan.",
      );
    } finally {
      setSendingInvitation(false);
    }
  }

  useEffect(() => {
    if (activeTab === "members") {
      loadMembers();
    }
  }, [activeTab, groupId]);

  if (loading) {
    return <p>Hämtar gruppen...</p>;
  }

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
        {activeTab === "members" && (
          <>
            {isOwner && (
              <div className="invite-member">
                {!showInviteForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteForm(true);
                      setInviteError("");
                      setInviteSuccess("");
                    }}
                  >
                    + Bjud in medlem
                  </button>
                ) : (
                  <form onSubmit={handleSendInvitation}>
                    <label htmlFor="inviteEmail">E-postadress</label>

                    <input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      placeholder="namn@exempel.se"
                      required
                    />

                    {inviteError && (
                      <p className="invite-error">{inviteError}</p>
                    )}

                    <div className="invite-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setShowInviteForm(false);
                          setInviteEmail("");
                          setInviteError("");
                        }}
                      >
                        Avbryt
                      </button>

                      <button type="submit" disabled={sendingInvitation}>
                        {sendingInvitation ? "Skickar..." : "Skicka inbjudan"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {inviteSuccess && <p className="invite-success">{inviteSuccess}</p>}
            <div className="group-members">
              {membersLoading ? (
                <p>Hämtar medlemmar...</p>
              ) : (
                members.map((member) => (
                  <div className="group-member" key={member.user_id}>
                    <div className="group-member-avatar">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt="" />
                      ) : (
                        <span>
                          {member.display_name?.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      )}
                    </div>

                    <div className="group-member-info">
                      <strong>
                        {member.display_name ?? "Okänd användare"}
                      </strong>

                      <span>
                        {member.role === "owner" ? "Gruppägare" : "Medlem"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
