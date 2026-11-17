import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getGroupById,
  getGroupMembers,
  updateGroupColor,
  uploadGroupCover,
  type GroupMember,
} from "../groupService";
import type { Group } from "../types/group";
import { useAuth } from "../../auth/authProvider";
import { sendInvitation } from "../../invitations/invitationService";
import {
  getGroupPosts,
  getGroupPhotos,
} from "../../posts/services/postService";
import type { Post, GroupPhoto } from "../../posts/types/post";
import PostCard from "../../posts/components/postCard";

import "./groupPage.css";

type GroupTab = "feed" | "album" | "members";

const GROUP_COLORS = [
  { name: "Rosa", value: "#B94D79" },
  { name: "Lila", value: "#9364B8" },
  { name: "Blå", value: "#5089C6" },
  { name: "Turkos", value: "#399F99" },
  { name: "Grön", value: "#67976A" },
  { name: "Gul", value: "#B99A45" },
  { name: "Orange", value: "#C47A49" },
  { name: "Röd", value: "#C45D68" },
];

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
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [photos, setPhotos] = useState<GroupPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  const [colorSaving, setColorSaving] = useState(false);
  const [colorError, setColorError] = useState("");
  const [showEditSettings, setShowEditSettings] = useState(false);

  const [coverSaving, setCoverSaving] = useState(false);
  const [coverError, setCoverError] = useState("");

  const groupedPhotos = photos.reduce<Record<string, GroupPhoto[]>>(
    (groups, photo) => {
      const date = new Date(photo.createdAt).toLocaleDateString("sv-SE");

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(photo);

      return groups;
    },
    {},
  );

  async function handleColorChange(color: string) {
    if (!groupId || !group) return;

    try {
      setColorSaving(true);
      setColorError("");

      await updateGroupColor(groupId, color);

      setGroup((currentGroup) =>
        currentGroup ? { ...currentGroup, color } : currentGroup,
      );
    } catch (error) {
      console.error("Could not update group color:", error);
      setColorError("Kunde inte spara gruppens färg.");
    } finally {
      setColorSaving(false);
    }
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !groupId) return;

    setCoverSaving(true);
    setCoverError("");

    try {
      await uploadGroupCover(groupId, file);

      // Reload the group to get its new signed cover URL.
      const updatedGroup = await getGroupById(groupId);

      if (updatedGroup) {
        setGroup(updatedGroup);
      }
    } catch (error) {
      console.error("Could not upload group cover:", error);
      setCoverError("Det gick inte att ladda upp omslagsbilden.");
    } finally {
      setCoverSaving(false);
      event.target.value = "";
    }
  }

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

  async function loadPosts() {
    if (!groupId) return;

    setPostsLoading(true);

    try {
      const data = await getGroupPosts([groupId]);
      setPosts(data);
    } catch (error) {
      console.error("Could not load group posts:", error);
    } finally {
      setPostsLoading(false);
    }
  }

  async function loadPhotos() {
    if (!groupId) return;

    setPhotosLoading(true);

    try {
      const data = await getGroupPhotos(groupId);
      setPhotos(data);
    } catch (error) {
      console.error("Could not load group photos:", error);
    } finally {
      setPhotosLoading(false);
    }
  }

  async function handleSendInvitation() {
    if (!groupId) return;

    setSendingInvitation(true);
    setInviteError("");
    setInviteSuccess("");
    setInvitationUrl("");

    try {
      const result = await sendInvitation(groupId);

      setInvitationUrl(result.invitationUrl);
      setInviteSuccess("Inbjudningslänken har skapats!");
    } catch (error) {
      console.error("Could not create invitation:", error);

      setInviteError(
        error instanceof Error
          ? error.message
          : "Kunde inte skapa inbjudningslänk.",
      );
    } finally {
      setSendingInvitation(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  useEffect(() => {
    loadPosts();
  }, [groupId]);

  useEffect(() => {
    if (activeTab === "album") {
      loadPhotos();
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
      {group.coverImage && (
        <div className="group-cover-image">
          <img src={group.coverImage} alt={`Omslagsbild för ${group.name}`} />
        </div>
      )}
      <header className="group-page-header">
        <div className="group-page-heading">
          <div>
            <h1>{group.name}</h1>
            <p>Här samlas era gemensamma minnen.</p>
          </div>

          {isOwner && (
            <button
              type="button"
              className="edit-group-button"
              onClick={() => setShowEditSettings((current) => !current)}
            >
              <span>⚙</span>
              {showEditSettings ? "Stäng inställningar" : "Redigera grupp"}
            </button>
          )}
        </div>

        {isOwner && showEditSettings && (
          <div className="group-settings-panel">
            <div className="group-settings-section">
              <h3>Gruppens färg</h3>
              <p>Välj en färg som gör gruppen lätt att känna igen.</p>

              <div className="group-color-options">
                {GROUP_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`group-color-option ${
                      group.color === color.value ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color.value)}
                    disabled={colorSaving}
                    aria-label={`Välj färgen ${color.name}`}
                    aria-pressed={group.color === color.value}
                    title={color.name}
                  >
                    {group.color === color.value && "✓"}
                  </button>
                ))}
              </div>

              {colorError && <p className="group-color-error">{colorError}</p>}
            </div>

            <div className="group-settings-divider" />

            <div className="group-settings-section">
              <h3>Omslagsbild</h3>
              <p>Ge gruppen en egen bild som representerar er.</p>

              <label
                htmlFor="group-cover-upload"
                className="group-cover-upload-button"
              >
                <span>＋</span>
                {coverSaving ? "Laddar upp..." : "Välj omslagsbild"}
              </label>

              <input
                id="group-cover-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={coverSaving}
                onChange={handleCoverUpload}
              />

              {coverError && <p className="group-color-error">{coverError}</p>}
            </div>
          </div>
        )}
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
        {activeTab === "feed" && (
          <div className="group-feed">
            {postsLoading ? (
              <p>Hämtar inlägg...</p>
            ) : posts.length === 0 ? (
              <p>Här var det tomt! Dela ett minne med gruppen.</p>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} group={group} />
              ))
            )}
          </div>
        )}

        {activeTab === "album" && (
          <div className="group-album-container">
            {photosLoading ? (
              <p>Hämtar bilder...</p>
            ) : photos.length === 0 ? (
              <p className="group-album-empty">
                Inga bilder ännu. Dela ett foto i gruppens flöde!
              </p>
            ) : (
              Object.entries(groupedPhotos).map(([date, datePhotos]) => (
                <div className="album-date-group" key={date}>
                  <h3 className="album-date-heading">
                    {new Date(`${date}T12:00:00`).toLocaleDateString("sv-SE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>

                  <div className="group-album">
                    {datePhotos.map((photo) => (
                      <div className="group-album-photo" key={photo.id}>
                        <img
                          className="album-image"
                          src={photo.url}
                          alt={photo.caption || "Bild i gruppens album"}
                        />

                        <div className="album-photo-author">
                          {photo.authorAvatar ? (
                            <img
                              src={photo.authorAvatar}
                              alt={photo.authorName}
                            />
                          ) : (
                            <span>
                              {photo.authorName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
                      setInvitationUrl("");
                    }}
                  >
                    + Bjud in medlem
                  </button>
                ) : (
                  <div className="invite-form">
                    <h3>Bjud in till gruppen</h3>
                    <p>
                      Skapa en personlig inbjudningslänk som du kan dela via
                      SMS, Messenger eller på annat sätt.
                    </p>

                    {inviteError && (
                      <p className="invite-error">{inviteError}</p>
                    )}

                    {inviteSuccess && (
                      <p className="invite-success">{inviteSuccess}</p>
                    )}

                    {invitationUrl && (
                      <div className="invitation-link-container">
                        <input type="text" value={invitationUrl} readOnly />

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                invitationUrl,
                              );
                              setInviteSuccess("Länken har kopierats!");
                            } catch (error) {
                              console.error(
                                "Could not copy invitation link:",
                                error,
                              );
                              setInviteError("Kunde inte kopiera länken.");
                            }
                          }}
                        >
                          Kopiera länk
                        </button>
                      </div>
                    )}

                    <div className="invite-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setShowInviteForm(false);
                          setInviteError("");
                          setInviteSuccess("");
                          setInvitationUrl("");
                        }}
                      >
                        Stäng
                      </button>

                      {!invitationUrl && (
                        <button
                          type="button"
                          onClick={handleSendInvitation}
                          disabled={sendingInvitation}
                        >
                          {sendingInvitation
                            ? "Skapar länk..."
                            : "Skapa inbjudningslänk"}
                        </button>
                      )}
                    </div>
                  </div>
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
