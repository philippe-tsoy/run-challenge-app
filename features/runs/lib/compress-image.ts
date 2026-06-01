const MAX_ORIGINAL_WIDTH = 1600;
const THUMB_WIDTH = 480;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality = 0.85,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function resizeToBlob(
  image: HTMLImageElement,
  maxWidth: number,
  type: string,
): Promise<Blob> {
  const scale = Math.min(1, maxWidth / image.width);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas not supported");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvasToBlob(canvas, type);
}

export async function compressImageFile(file: File): Promise<{
  original: File;
  thumbnail: File;
  width: number;
  height: number;
}> {
  const image = await loadImage(file);
  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

  const [originalBlob, thumbnailBlob] = await Promise.all([
    resizeToBlob(image, MAX_ORIGINAL_WIDTH, outputType),
    resizeToBlob(image, THUMB_WIDTH, outputType),
  ]);

  const extension = outputType === "image/png" ? "png" : "jpg";

  return {
    original: new File([originalBlob], `original.${extension}`, {
      type: outputType,
    }),
    thumbnail: new File([thumbnailBlob], `thumb.${extension}`, {
      type: outputType,
    }),
    width: image.width,
    height: image.height,
  };
}
