
import "./imageLightbox.css";
import { useRef, useState } from "react";

interface ImageLightboxProps {
  images: {
    id: string;
    url: string;
    caption?: string;
  }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;

    const currentTouchX = event.touches[0].clientX;
    const distance = currentTouchX - touchStartX.current;

    // Add resistance when reaching the first or last image.
    const canMove =
      distance < 0
        ? currentIndex < images.length - 1
        : currentIndex > 0;

    setDragOffset(canMove ? distance : distance * 0.25);
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = touchStartX.current - touchEndX;
    const minimumSwipeDistance = 50;

    if (
      swipeDistance > minimumSwipeDistance &&
      currentIndex < images.length - 1
    ) {
      onNavigate(currentIndex + 1);
    } else if (
      swipeDistance < -minimumSwipeDistance &&
      currentIndex > 0
    ) {
      onNavigate(currentIndex - 1);
    }

    touchStartX.current = null;
    setDragOffset(0);
  }

  return (
    <div className="image-lightbox" onClick={onClose}>
      <div
        className="image-lightbox-track"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="image-lightbox-slides"
          style={{
            transform: `translateX(calc(${-currentIndex * 100}% + ${dragOffset}px))`,
            transition:
              dragOffset === 0 ? "transform 0.3s ease" : "none",
          }}
        >
{images.map((image, index) => (
  <div className="image-lightbox-slide" key={image.id}>
    <div className="image-lightbox-content">
      <img
        src={image.url}
        alt={`Bild ${index + 1}`}
        draggable={false}
        onClick={(event) => event.stopPropagation()}
      />

      {image.caption && (
        <p
          className="image-lightbox-caption"
          onClick={(event) => event.stopPropagation()}
        >
          {image.caption}
        </p>
      )}
    </div>
  </div>
))}
        </div>
      </div>
    </div>
  );
}
