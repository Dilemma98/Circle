import "./commentSection.css";

import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "../../auth/authProvider"; // justera sökvägen
import { addComment, getComments } from "../services/commentService";
import type { Comment } from "../types/comment";

interface CommentSectionProps {
  postId: string;
  onCountChange: (count: number) => void;
}

function getInitials(name: string) {
  const names = name.trim().split(/\s+/);
  return (
    (names[0]?.charAt(0) ?? "") + (names[1]?.charAt(0) ?? "")
  ).toUpperCase();
}

export default function CommentSection({
  postId,
  onCountChange,
}: CommentSectionProps) {
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getComments(postId);
        if (cancelled) return;
        setComments(data);
        onCountChange(data.length);
      } catch (err) {
        console.error("Could not load comments:", err);
        if (!cancelled) setError("Kunde inte hämta kommentarerna. Försök igen.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [postId, onCountChange]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !text.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const created = await addComment(postId, user.id, text);
      const next = [...comments, created];
      setComments(next);
      onCountChange(next.length);
      setText("");
    } catch (err) {
      console.error("Could not add comment:", err);
      setError("Kommentaren skickades inte. Försök igen.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="comment-section">
      {loading && <p className="comment-empty">Hämtar kommentarer…</p>}

      {!loading && comments.length === 0 && (
        <p className="comment-empty">Inga kommentarer än. Skriv den första.</p>
      )}

      {comments.length > 0 && (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li className="comment" key={comment.id}>
              {comment.authorAvatar ? (
                <img
                  className="comment-avatar"
                  src={comment.authorAvatar}
                  alt=""
                />
              ) : (
                <div className="comment-avatar">
                  {getInitials(comment.authorName)}
                </div>
              )}

              <div className="comment-body">
                <div className="comment-meta">
                  <strong>{comment.authorName}</strong>
                  <span>
                    {new Date(comment.createdAt).toLocaleString("sv-SE", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p>{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv en kommentar"
          aria-label="Skriv en kommentar"
          maxLength={1000}
        />
        <button type="submit" disabled={!text.trim() || sending}>
          {sending ? "Skickar…" : "Skicka"}
        </button>
      </form>

      {error && <p className="comment-error">{error}</p>}
    </section>
  );
}