
import "./postCard.css";

import { useState } from "react";
import {
  Users,
  MessageCircle,
} from "lucide-react";

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
  const [selectedImageIndex, setSelectedImageIndex] =
    useState<number | null>(null);

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(
    post.commentCount ?? 0,
  );

  const imageMedia = post.media.filter(
    (media) => media.type === "image",
  );

  function generateInitials() {
    const names = post.authorName.trim().split(/\s+/);

    const firstInitial = names[0]?.charAt(0) ?? "";
    const secondInitial = names[1]?.charAt(0) ?? "";

    return (firstInitial + secondInitial).toUpperCase();
  }

  const imageLayout =
    imageMedia.length === 1
      ? "single"
      : imageMedia.length === 2
        ? "double"
        : imageMedia.length === 3
          ? "three"
          : "multiple";

  const formattedDate = new Date(post.createdAt).toLocaleString(
    "sv-SE",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <article className="post-card">

      {/* Post header */}
      <header className="post-card-header">
        <div className="post-card-author-avatar">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" />
          ) : (
            <span>{generateInitials()}</span>
          )}
        </div>

        <div className="post-card-author">
          <strong>{post.authorName}</strong>

          <time dateTime={post.createdAt}>
            {formattedDate}
          </time>
        </div>

       <div
  className="post-group-tag"
  style={{
    backgroundColor: `${group.color}22`,
    borderColor: `${group.color}66`,
    color: group.color,
  }}
>
  <Users size={14} />
  <span>{group.name}</span>
</div>
      </header>

      {/* Images */}
      {imageMedia.length > 0 && (
        <div
          className={`post-card-images post-card-images--${imageLayout}`}
        >
          {imageMedia.slice(0, 4).map((image, index) => (
            <button
              type="button"
              className="post-card-image-wrapper"
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              aria-label={`Visa bild ${index + 1} i helskärm`}
            >
              <img
                src={image.url}
                alt={`Bild ${index + 1} i inlägget`}
              />

              {index === 3 && imageMedia.length > 4 && (
                <span className="post-card-image-overlay">
                  +{imageMedia.length - 4}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image lightbox */}
      {selectedImageIndex !== null && (
        <ImageLightbox
          images={imageMedia}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNavigate={setSelectedImageIndex}
        />
      )}

      {/* Post content */}
      {post.content && (
        <p className="post-card-content">
          {post.content}
        </p>
      )}

      {/* Post actions */}
      <footer className="post-card-footer">
        <ReactionButton postId={post.id} />

        <button
          type="button"
          className="post-card-comment-button"
          onClick={() => setShowComments((open) => !open)}
          aria-expanded={showComments}
          aria-label={
            commentCount > 0
              ? `Kommentarer (${commentCount})`
              : "Kommentera"
          }
        >
          <MessageCircle size={20} />

          {commentCount > 0 && (
            <span>{commentCount}</span>
          )}
        </button>
      </footer>

      {/* Comments */}
      {showComments && (
        <CommentSection
          postId={post.id}
          onCountChange={setCommentCount}
        />
      )}
    </article>
  );
}
