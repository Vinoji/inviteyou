import "server-only";
import type { VenueInfo, SectionToggles, FaqItem } from "./types";
import { withDefaultSections } from "./types";

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

export function sanitizeSections(v: unknown): SectionToggles {
  const obj = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  // Only include keys that are genuinely booleans — an explicit `undefined`
  // in the spread would otherwise overwrite the default with `undefined`
  // rather than being skipped.
  const partial: Partial<SectionToggles> = {};
  for (const key of ["story", "family", "schedule", "gallery", "rsvp", "faq"] as const) {
    if (typeof obj[key] === "boolean") partial[key] = obj[key] as boolean;
  }
  return withDefaultSections(partial);
}

export function sanitizeFaq(v: unknown): FaqItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object")
    .map((x) => ({
      question: typeof x.question === "string" ? x.question.slice(0, 150) : "",
      answer: typeof x.answer === "string" ? x.answer.slice(0, 500) : "",
    }))
    .filter((x) => x.question.trim() || x.answer.trim())
    .slice(0, 4);
}
