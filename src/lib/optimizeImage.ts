export async function optimizeImage(
  file: File,
  maxSize: number,
): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("Could not create canvas context.");
  }

  context.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image compression failed."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      0.82,
    );
  });

  const optimizedFile = new File(
    [blob],
    `${file.name.replace(/\.[^/.]+$/, "")}.webp`,
    {
      type: "image/webp",
    },
  );

  bitmap.close();

  return optimizedFile;
}
