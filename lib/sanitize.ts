import "server-only";
import type { VenueInfo, SectionToggles, FaqItem, TravelInfo, Place, PlaceScene } from "./types";
import { withDefaultSections, PLACE_SCENES } from "./types";

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
  for (const key of ["story", "family", "schedule", "gallery", "rsvp", "faq", "guestPhotos", "travel", "places"] as const) {
    if (typeof obj[key] === "boolean") partial[key] = obj[key] as boolean;
  }
  return withDefaultSections(partial);
}

export function sanitizeUploaderName(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, 100) : "";
}

/** A Firebase Storage download URL a guest just uploaded to. Restricted to
 * that host specifically (not just "any string") so this route can't be
 * used to register arbitrary external image URLs into the gallery. */
export function sanitizeGuestPhotoUrl(v: unknown): string {
  if (typeof v !== "string" || v.length > 1000) return "";
  try {
    const parsed = new URL(v);
    if (parsed.hostname !== "firebasestorage.googleapis.com") return "";
    return v;
  } catch {
    return "";
  }
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

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

function objects(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v)
    ? v.filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object")
    : [];
}

export function sanitizeTravel(v: unknown): TravelInfo {
  const obj = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  return {
    city: str(obj.city, 80),
    cityCode: str(obj.cityCode, 12),
    airports: objects(obj.airports)
      .map((a) => ({ code: str(a.code, 8), name: str(a.name, 80), distance: str(a.distance, 40) }))
      .filter((a) => a.code.trim() || a.name.trim())
      .slice(0, 3),
    routes: objects(obj.routes)
      .map((r) => ({
        from: str(r.from, 60),
        trains: objects(r.trains)
          .map((t) => ({
            number: str(t.number, 12),
            name: str(t.name, 80),
            fromStation: str(t.fromStation, 80),
            departs: str(t.departs, 30),
            toStation: str(t.toStation, 80),
            arrives: str(t.arrives, 30),
            frequency: str(t.frequency, 30),
          }))
          .filter((t) => t.name.trim() || t.number.trim())
          .slice(0, 3),
      }))
      .filter((r) => r.from.trim() || r.trains.length > 0)
      .slice(0, 2),
  };
}

export function sanitizePlaces(v: unknown): Place[] {
  return objects(v)
    .map((p) => ({
      title: str(p.title, 80),
      description: str(p.description, 300),
      distance: str(p.distance, 40),
      scene: (PLACE_SCENES as readonly string[]).includes(p.scene as string)
        ? (p.scene as PlaceScene)
        : "heritage",
    }))
    .filter((p) => p.title.trim())
    .slice(0, 6);
}
