import "./createPostButton.css";

interface CreatePostButtonProps {
  onClick: () => void;
}

export default function CreatePostButton({
  onClick,
}: CreatePostButtonProps) {
  return (
    <button
      className="create-post-floating-button"
      onClick={onClick}
      aria-label="Skapa inlägg"
      title="Skapa inlägg"
    >
      +
    </button>
  );
}