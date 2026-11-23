import { useEffect, useState } from "react";

import { useAuth } from "../../auth/authProvider"; // justera sökvägen
import {
  addReaction,
  getReactionSummary,
  removeReaction,
} from "../services/reactionService";
import "./reactionButton.css";

interface ReactionButtonProps {
  postId: string;
}

export default function ReactionButton({ postId }: ReactionButtonProps) {
  const { user } = useAuth();
  const userId = user?.id;

  const [count, setCount] = useState(0);
  const [reacted, setReacted] = useState(false);
  const [busy, setBusy] = useState(false);

  const [profiles, setProfiles] = useState<
  { id: string; display_name: string; avatar_url: string | null }[]
>([]);

// useEffect(() =>{
//   console.log(user);
// })

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    getReactionSummary(postId, userId,)
      .then((summary) => {
        if (cancelled) return;
        setCount(summary.count);
        setReacted(summary.reacted);
        setProfiles(summary.profiles);
console.log("Reaction profiles:", summary.profiles);
      })
      .catch((err) => console.error("Could not load reactions:", err));

    

    return () => {
      cancelled = true;
    };
  }, [postId, userId]);

  async function handleToggle() {
    if (!userId || busy) return;

    const wasReacted = reacted;
    setBusy(true);

    // Uppdatera direkt, backa om det misslyckas
    setReacted(!wasReacted);
    setCount((c) => c + (wasReacted ? -1 : 1));

    try {
      if (wasReacted) {
        await removeReaction(postId, userId);
      } else {
        await addReaction(postId, userId);
      }
    } catch (err) {
      console.error("Could not update reaction:", err);
      setReacted(wasReacted);
      setCount((c) => c + (wasReacted ? 1 : -1));
    } finally {
      setBusy(false);
       console.log("reaktion!!!", wasReacted, "postId", postId, "userId", userId)
    }
  }

return (
  <div className="reaction-wrapper">
    <button
      type="button"
      className="reaction-button"
      onClick={handleToggle}
      aria-pressed={reacted}
      aria-label={reacted ? "Ta bort gilla" : "Gilla"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={reacted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>

      {count > 0 && <span>{count}</span>}
    </button>

    {profiles.length > 0 && (
      <div className="reaction-avatars">
        {profiles.slice(0, 4).map((profile) => (
          <div
            className="reaction-avatar"
            key={profile.id}
            title={profile.display_name}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
              />
            ) : (
              <span>
                {profile.display_name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            )}
          </div>
        ))}

        {profiles.length > 4 && (
          <span className="reaction-more">
            +{profiles.length - 4}
          </span>
        )}
      </div>
    )}
  </div>
);
}