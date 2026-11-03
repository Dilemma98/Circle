import "./createPostModal.css";

import useImagePreviews, {
  type ImagePreview,
} from "../hooks/useImagePreviews";

import { useState } from "react";
import type { Group } from "../../groups/types/group";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onCreatePost: (
  content: string,
  groupId: string,
  images: ImagePreview[],
) => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  groups,
  onCreatePost,
}: CreatePostModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [content, setContent] = useState("");
  const { images, addImages, removeImage, clearImages, updateCaption } =
    useImagePreviews();

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    setSelectedGroupId("");
    setContent("");
    clearImages();
    onClose();
  }

  function handlePublish() {
    if (!selectedGroupId) return;

    if (!content.trim()) return;

onCreatePost(
  content.trim(),
  selectedGroupId,
  images,
);

    handleClose();
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    addImages(files);
    event.target.value = "";
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <section
        className="create-post-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Skapa ett inlägg</h2>
            <p>Dela ett ögonblick med din grupp.</p>
          </div>

          <button
            className="modal-close-button"
            onClick={handleClose}
            aria-label="Stäng"
          >
            ×
          </button>
        </div>

        <div className="post-author">
          <div className="user-avatar">E</div>
          <div>
            <strong>Emma</strong>
            <span>Välj vilken grupp som ska se inlägget</span>
          </div>
        </div>

        <div className="group-select-container">
          <label htmlFor="post-group">Publicera i</label>

          <select
            id="post-group"
            value={selectedGroupId}
            onChange={(event) => setSelectedGroupId(event.target.value)}
          >
            <option value="">Välj en grupp</option>

            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          className="post-textarea"
          placeholder="Vad vill du dela med dig av?"
          rows={5}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        {images.length > 0 && (
          <div className="image-preview-list">
            {images.map((image, index) => (
  <div className="image-preview" key={image.id}>
    <div className="image-preview-image">
      <img
        src={image.url}
        alt={`Förhandsvisning ${index + 1}`}
      />

      <button
        type="button"
        className="remove-image-button"
        onClick={() => removeImage(image.id)}
        aria-label={`Ta bort ${image.file.name}`}
      >
        ×
      </button>
    </div>

    <textarea
      className="image-caption-input"
      placeholder="Skriv en bildtext..."
      value={image.caption}
      onChange={(event) =>
        updateCaption(image.id, event.target.value)
      }
      rows={2}
    />
  </div>
))}
          </div>
        )}

        <div className="post-attachments">
          <label htmlFor="post-images" className="attachment-button">
            <span>▧</span>
            Foto
          </label>

          <input
            id="post-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            hidden
          />
          <button type="button" className="attachment-button">
            <span>▷</span>
            Video
          </button>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={handleClose}>
            Avbryt
          </button>

          <button
            className="publish-button"
            disabled={!selectedGroupId || !content.trim()}
            onClick={handlePublish}
          >
            Publicera
          </button>
        </div>
      </section>
    </div>
  );
}
