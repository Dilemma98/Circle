import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Palette, Save, Users } from "lucide-react";
import { supabase } from "../../../lib/supabase";

import {
  getGroupById,
  getGroupMembers,
  updateGroupColor,
  updateGroupName,
  uploadGroupCover,
} from "../groupService";

import type { Group } from "../types/group";
import "./groupSettingsPage.css";

export const GROUP_COLORS = [
  { name: "Rosa", value: "#E9AFC5" },
  { name: "Lavendel", value: "#C9B2E8" },
  { name: "Blå", value: "#AFCDEB" },
  { name: "Turkos", value: "#9EDBD0" },
  { name: "Grön", value: "#B9D99F" },
  { name: "Gul", value: "#EBD58F" },
  { name: "Persika", value: "#EBC1A5" },
  { name: "Korall", value: "#E5AAA5" },
];

export default function GroupSettingsPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingColor, setSavingColor] = useState(false);
  const [savingCover, setSavingCover] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      if (!groupId) {
        setLoading(false);
        return;
      }

      try {
        const [groupData, members] = await Promise.all([
          getGroupById(groupId),
          getGroupMembers(groupId),
        ]);

        if (cancelled) return;

        setGroup(groupData);
        setGroupName(groupData?.name ?? "");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        setIsOwner(
          members.some(
            (member) => member.user_id === user?.id && member.role === "owner",
          ),
        );
      } catch (loadError) {
        console.error("Could not load group settings:", loadError);
        if (!cancelled) setError("Kunde inte hämta gruppinställningarna.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  async function handleSaveName() {
    if (!groupId || !group) return;

    const trimmedName = groupName.trim();

    if (!trimmedName) {
      setError("Gruppnamnet får inte vara tomt.");
      return;
    }

    setSavingName(true);
    setError("");
    setSuccess("");

    try {
      await updateGroupName(groupId, trimmedName);
      setGroup({ ...group, name: trimmedName });
      setGroupName(trimmedName);
      setSuccess("Gruppnamnet har sparats.");
    } catch (saveError) {
      console.error("Could not update group name:", saveError);
      setError("Kunde inte spara gruppnamnet.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleColorChange(color: string) {
    if (!groupId || !group) return;

    setSavingColor(true);
    setError("");
    setSuccess("");

    try {
      await updateGroupColor(groupId, color);
      setGroup({ ...group, color });
      setSuccess("Gruppens färg har uppdaterats.");
    } catch (saveError) {
      console.error("Could not update group color:", saveError);
      setError("Kunde inte spara gruppens färg.");
    } finally {
      setSavingColor(false);
    }
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !groupId) return;

    setSavingCover(true);
    setError("");
    setSuccess("");

    try {
      await uploadGroupCover(groupId, file);

      const updatedGroup = await getGroupById(groupId);

      if (updatedGroup) {
        setGroup(updatedGroup);
      }

      setSuccess("Omslagsbilden har uppdaterats.");
    } catch (uploadError) {
      console.error("Could not upload group cover:", uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Kunde inte ladda upp omslagsbilden.",
      );
    } finally {
      setSavingCover(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return <p>Hämtar gruppinställningar...</p>;
  }

  if (!group) {
    return <p>Gruppen kunde inte hittas.</p>;
  }

  if (!isOwner) {
    return (
      <section className="group-settings-page">
        <p>Du har inte behörighet att ändra gruppinställningarna.</p>
        <button type="button" onClick={() => navigate(`/groups/${groupId}`)}>
          Tillbaka till gruppen
        </button>
      </section>
    );
  }

  return (
    <main className="group-settings-page">
      <button
        type="button"
        className="settings-back-button"
        onClick={() => navigate(`/groups/${group.id}`)}
      >
        <ArrowLeft size={18} />
        Tillbaka till gruppen
      </button>

      <header className="settings-page-header">
        <span>GRUPP</span>
        <h1>Gruppinställningar</h1>
        <p>Här kan du anpassa och hantera din grupp.</p>
      </header>

      {error && <p className="settings-message error">{error}</p>}
      {success && <p className="settings-message success">{success}</p>}

      <section className="settings-card">
        <div className="settings-card-heading">
          <ImagePlus size={20} />
          <div>
            <h2>Omslagsbild</h2>
            <p>Välj en bild som representerar gruppen.</p>
          </div>
        </div>

        {group.coverImage && (
          <img
            className="settings-cover-preview"
            src={group.coverImage}
            alt={`Nuvarande omslagsbild för ${group.name}`}
          />
        )}

        <label htmlFor="group-cover-upload" className="settings-upload-button">
          <ImagePlus size={17} />
          {savingCover ? "Laddar upp..." : "Välj omslagsbild"}
        </label>

        <input
          id="group-cover-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          disabled={savingCover}
          onChange={handleCoverUpload}
        />
      </section>
      <section className="settings-card">
        <div className="settings-card-heading">
          <Users size={20} />
          <div>
            <h2>Gruppinformation</h2>
            <p>Ge gruppen ett namn som passar era gemensamma minnen.</p>
          </div>
        </div>

        <label htmlFor="group-name">Gruppnamn</label>
        <div className="settings-name-field">
          <input
            id="group-name"
            type="text"
            value={groupName}
            maxLength={50}
            onChange={(event) => setGroupName(event.target.value)}
          />
          <button
            type="button"
            onClick={handleSaveName}
            disabled={
              savingName || !groupName.trim() || groupName.trim() === group.name
            }
          >
            <Save size={16} />
            {savingName ? "Sparar..." : "Spara"}
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <Palette size={20} />
          <div>
            <h2>Gruppens färg</h2>
            <p>Välj en färg som gör gruppen lätt att känna igen.</p>
          </div>
        </div>

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
              disabled={savingColor}
              aria-label={`Välj färgen ${color.name}`}
              aria-pressed={group.color === color.value}
              title={color.name}
            >
              {group.color === color.value && "✓"}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
