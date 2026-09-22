import "server-only";
import type { VenueInfo } from "./types";

export function sanitizeVenue(v: unknown): VenueInfo {
  if (!v || typeof v !== "object") return { name: "", address: "", mapsLink: "" };
  const obj = v as Record<string, unknown>;
  return {
    name: typeof obj.name === "string" ? obj.name.slice(0, 150) : "",
    address: typeof obj.address === "string" ? obj.address.slice(0, 300) : "",
    mapsLink: typeof obj.mapsLink === "string" ? obj.mapsLink.slice(0, 500) : "",
  };
}

export function sanitizeAccentColor(c: unknown): string {
  return typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c) ? c : "#b8860b";
}

export function sanitizePhotos(p: unknown): string[] {
  if (!Array.isArray(p)) return [];
  return p.filter((x): x is string => typeof x === "string").slice(0, 6);
}

export function sanitizeParentsLine(v: unknown): string {
  return typeof v === "string" ? v.slice(0, 150) : "";
}

/** A Storage download URL, or "" for no background track. Not deeply
 * validated (a bad URL just fails to play client-side, not a security
 * issue) — only bounded in length. */
export function sanitizeBackgroundMusic(v: unknown): string {
  return typeof v === "string" ? v.slice(0, 1000) : "";
}

export function sanitizeAttendingSide(v: unknown): "groom" | "bride" | "friend" | undefined {
  return v === "groom" || v === "bride" || v === "friend" ? v : undefined;
}
