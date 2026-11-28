
import "./postCard.css";

import { useState } from "react";
import { Users, MessageCircle } from "lucide-react";

import Avatar from "../../../components/avatar";
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

  const formattedDate = new Date(post.createdAt).toLocaleString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="post-card">
      <header className="post-card-header">
        <div className="post-card-author">
          <Avatar
            src={post.authorAvatar}
            name={post.authorName}
            size={42}
          />

          <div className="post-card-author-info">
            <span className="post-card-author-name">
              {post.authorName}
            </span>
            <time dateTime={post.createdAt}>
              {formattedDate}
            </time>
          </div>
        </div>

<div
  className="post-group-tag"
style={{
  "--tag-color": group.color || "#F4C8D7",
} as React.CSSProperties}
>
  <Users size={14} />
  <span>{group.name}</span>
</div>
      </header>

      {post.content && (
        <p className="post-card-content">{post.content}</p>
      )}

      {imageMedia.length > 0 && (
        <div className="post-card-images">
          {imageMedia.slice(0, 2).map((image, index) => (
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
                loading="lazy"
                decoding="async"
              />

              {index === 1 && imageMedia.length > 2 && (
                <span className="post-card-image-overlay">
                  +{imageMedia.length - 2}
                </span>
              )}
            </button>
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

      <footer className="post-card-footer">
        <div className="post-card-actions">
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
            <MessageCircle size={19} />
            {commentCount > 0 && <span>{commentCount}</span>}
          </button>
        </div>
      </footer>

      {showComments && (
        <CommentSection
          postId={post.id}
          onCountChange={setCommentCount}
        />
      )}
    </article>
  );
}
