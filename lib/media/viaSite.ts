/**
 * Our Firebase Storage bucket sends no CORS headers, so the browser can't
 * read an uploaded file's bytes (to re-crop a photo) or route an uploaded
 * song through Web Audio (iOS volume). viaSite() rewrites such a URL to
 * the same-origin /api/media proxy, which only serves files under this
 * bucket's invitations/ folder — files that are public anyway.
 */
// Accepts the bare bucket name or the gs:// form the Firebase console shows.
export const STORAGE_BUCKET = (
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "gs://vinoji-291fa.firebasestorage.app"
).replace(/^gs:\/\//, "");

export function isOurStorageFile(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      u.hostname === "firebasestorage.googleapis.com" &&
      u.pathname.startsWith(`/v0/b/${STORAGE_BUCKET}/o/invitations%2F`) &&
      !u.pathname.includes("..") &&
      u.searchParams.get("alt") === "media"
    );
  } catch {
    return false;
  }
}

export function viaSite(url: string): string {
  return isOurStorageFile(url) ? `/api/media?u=${encodeURIComponent(url)}` : url;
}
