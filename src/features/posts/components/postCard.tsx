import "./postCard.css";

import { useState } from "react";
import ImageLightbox from "./imageLightbox";

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
  const imageMedia = post.media.filter((media) => media.type === "image");

  return (
    <article className="post-card">
      <div className="post-card-header">
        <div className="user-avatar">E</div>

        <div className="post-card-author">
          <strong>Emma</strong>
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
    <img
      src={image.url}
      alt="Bild i inlägg"
    />

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
    </article>
  );
}
