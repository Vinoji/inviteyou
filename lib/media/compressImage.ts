/**
 * Browser-side photo compression. Photos are re-encoded as JPEG at a high
 * quality and scaled so the longest side is at most PHOTO_MAX_SIDE — sharp
 * on a full-screen phone or laptop, a fraction of a camera original's size.
 * Re-encoding also drops EXIF metadata, including GPS location.
 * JPEG (not WebP) because the share-card renderer only reads JPEG/PNG.
 */
export const PHOTO_MAX_SIDE = 2000;
const JPEG_QUALITY = 0.86;

export function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
}

/** Draws a region of `img` into a canvas no larger than `maxSide`. */
export function drawScaled(
  img: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  maxSide = PHOTO_MAX_SIDE
): HTMLCanvasElement | null {
  const k = Math.min(1, maxSide / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * k));
  canvas.height = Math.max(1, Math.round(sh * k));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  // A white base, so transparent PNGs don't turn black as JPEG.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function loadImage(file: Blob): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * The whole photo, compressed. Returns the original file when the browser
 * can't decode it (e.g. HEIC outside Safari) or when compressing wouldn't
 * make it smaller.
 */
export async function compressPhoto(file: File, maxSide = PHOTO_MAX_SIDE): Promise<Blob> {
  const img = await loadImage(file);
  if (!img) return file;
  try {
    const canvas = drawScaled(img, 0, 0, img.naturalWidth, img.naturalHeight, maxSide);
    const blob = canvas && (await canvasToJpeg(canvas));
    return blob && blob.size < file.size ? blob : file;
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
