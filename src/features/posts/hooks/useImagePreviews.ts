import { useEffect, useRef, useState } from "react";

export interface ImagePreview {
  id: string;
  file: File;
  url: string;
  caption: string;
}

export default function useImagePreviews() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const urlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      urlsRef.current.clear();
    };
  }, []);

  function addImages(files: File[]) {
    const newImages = files.map((file) => {
      const url = URL.createObjectURL(file);
      urlsRef.current.add(url);

      return {
        id: crypto.randomUUID(),
        file,
        url,
        caption: "",
      };
    });

    setImages((currentImages) => [...currentImages, ...newImages]);
  }

  function removeImage(id: string) {
    const imageToRemove = images.find((image) => image.id === id);

    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
      urlsRef.current.delete(imageToRemove.url);
    }

    setImages((currentImages) =>
      currentImages.filter((image) => image.id !== id),
    );
  }

  function updateCaption(id: string, caption: string) {
    setImages((currentImages) =>
      currentImages.map((image) =>
        image.id === id ? { ...image, caption } : image,
      ),
    );
  }

  function clearImages() {
    images.forEach((image) => {
      URL.revokeObjectURL(image.url);
      urlsRef.current.delete(image.url);
    });

    setImages([]);
  }

  return {
    images,
    addImages,
    removeImage,
    clearImages,
    updateCaption,
  };
}
