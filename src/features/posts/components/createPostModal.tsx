
import "./createPostModal.css";

import useImagePreviews, {
  type ImagePreview,
} from "../hooks/useImagePreviews";

import { useState } from "react";
import type { ChangeEvent } from "react";
import type { Group } from "../../groups/types/group";
import { useAuth } from "../../auth/authProvider";

import {
  X,
  ImagePlus,
  Video,
  ChevronDown,
  Users,
  Send,
  Image as ImageIcon,
} from "lucide-react";

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
  const { profile } = useAuth();

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [content, setContent] = useState("");

  const {
    images,
    addImages,
    removeImage,
    clearImages,
    updateCaption,
  } = useImagePreviews();

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
    if (!selectedGroupId || !content.trim()) return;

    onCreatePost(
      content.trim(),
      selectedGroupId,
      images,
    );

    handleClose();
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    addImages(files);
    event.target.value = "";
  }

  const selectedGroup = groups.find(
    (group) => group.id === selectedGroupId,
  );

  const initials =
    profile?.display_name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <section
        className="create-post-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
      >
        {/* Header */}
        <header className="modal-header">
          <div>
            <h2 id="create-post-title">Skapa inlägg</h2>
            <p>Dela något med människorna i din Circle.</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={handleClose}
            aria-label="Stäng"
          >
            <X size={19} />
          </button>
        </header>

        {/* Author */}
        <div className="post-author">
          <div className="post-author-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="post-author-info">
            <strong>{profile?.display_name || "Din profil"}</strong>
            <span>Skapa ett nytt inlägg</span>
          </div>
        </div>

        {/* Group selector */}
        <div className="group-select-container">
          <label htmlFor="post-group">
            <Users size={15} />
            Dela med
          </label>

          <div className="group-select-wrapper">
            <select
              id="post-group"
              value={selectedGroupId}
              onChange={(event) =>
                setSelectedGroupId(event.target.value)
              }
            >
              <option value="">Välj en grupp</option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>

            <ChevronDown size={17} />
          </div>

          {selectedGroup && (
            <span className="selected-group-hint">
              Inlägget delas med {selectedGroup.name}.
            </span>
          )}
        </div>

        {/* Post content */}
        <div className="post-composer">
          <textarea
            className="post-textarea"
            placeholder="Vad vill du dela med dig av?"
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            autoFocus
          />
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="image-preview-section">
            <div className="image-preview-heading">
              <strong>Foton</strong>
              <span>{images.length} {images.length === 1 ? "bild" : "bilder"}</span>
            </div>

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
                      <X size={16} />
                    </button>
                  </div>

                  {/* <textarea
                    className="image-caption-input"
                    placeholder="Lägg till bildtext..."
                    value={image.caption}
                    onChange={(event) =>
                      updateCaption(image.id, event.target.value)
                    }
                    rows={2}
                  /> */}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachment options */}
        <div className="post-attachment-section">
          <span className="attachment-heading">
            Lägg till i ditt inlägg
          </span>

          <div className="post-attachments">
            <label
              htmlFor="post-images"
              className="attachment-button"
            >
              <ImagePlus size={19} />
              <span>Foton</span>
            </label>

            <input
              id="post-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              hidden
            />

            <button
              type="button"
              className="attachment-button attachment-disabled"
              disabled
              title="Videostöd kommer senare"
            >
              <Video size={19} />
              <span>Video</span>
              <small>Snart</small>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="modal-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={handleClose}
          >
            Avbryt
          </button>

          <button
            type="button"
            className="publish-button"
            disabled={!selectedGroupId || !content.trim()}
            onClick={handlePublish}
          >
            <Send size={16} />
            Publicera
          </button>
        </footer>
      </section>
    </div>
  );
}
