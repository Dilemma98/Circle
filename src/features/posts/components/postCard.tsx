import "./postCard.css";

import { useState } from "react";
import ImageLightbox from "./imageLightbox";
import ReactionButton from "./reactionButton";
import CommentSection from "./commentSection";

import type { Post } from "../types/post";
import type { Group } from "../../groups/types/group";

interface PostCardProps {
  post: Post;
  group: Group;
}


export default function PostCard({ post, group }: PostCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);

  const imageMedia = post.media.filter((media) => media.type === "image");

  function generateInitials() {
    const names = post.authorName.trim().split(/\s+/);

    const firstInitial = names[0]?.charAt(0) ?? "";
    const secondInitial = names[1]?.charAt(0) ?? "";

    return (firstInitial + secondInitial).toUpperCase();
  }

  return (
    <article className="post-card">
      <div className="post-card-header">
        {post.authorAvatar !== null && (
          <img className="user-avatar" src={post.authorAvatar} alt="" />
        )}
        {post.authorAvatar === null && (
          <div className="user-avatar">{generateInitials()}</div>
        )}

        <div className="post-card-author">
          <strong>{post.authorName}</strong>
          <span>
            {new Date(post.createdAt).toLocaleString("sv-SE", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <span className="post-group-tag">{group.name}</span>
      </div>

      {post.media.length > 0 && (
        <div className="post-card-images">
          {imageMedia.slice(0, 2).map((image, index) => (
            <div
              className="post-card-image-wrapper"
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img src={image.url} alt="Bild i inlägg" />

              {index === 1 && imageMedia.length > 2 && (
                <div className="post-card-image-overlay">
                  +{imageMedia.length - 2}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedImageIndex !== null && (
        <ImageLightbox
          images={imageMedia}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNavigate={setSelectedImageIndex}
        />
      )}

      {post.content && <p className="post-card-content">{post.content}</p>}

      <div className="post-card-footer">
        <ReactionButton postId={post.id} />

        <button
          type="button"
          className="post-card-comment-button"
          onClick={() => setShowComments((open) => !open)}
          aria-expanded={showComments}
          aria-label={
            commentCount > 0 ? `Kommentarer (${commentCount})` : "Kommentera"
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5z" />
          </svg>
          {commentCount > 0 && <span>{commentCount}</span>}
        </button>
      </div>

      {showComments && (
        <CommentSection postId={post.id} onCountChange={setCommentCount} />
      )}
    </article>
  );
}