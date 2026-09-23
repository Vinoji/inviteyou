export type InvitationStatus = "pending_payment" | "published";

export interface VenueInfo {
  name: string;
  address: string;
  mapsLink?: string;
}

/**
 * Explicit per-section visibility, independent of whether a section has
 * data — a story can be filled in and still switched off. Sections still
 * also self-hide when genuinely empty (see each component), so both checks
 * apply; this is the user's own override on top of that.
 */
export interface SectionToggles {
  story: boolean;
  family: boolean;
  schedule: boolean;
  gallery: boolean;
  rsvp: boolean;
  faq: boolean;
}

export const DEFAULT_SECTIONS: SectionToggles = {
  story: true,
  family: true,
  schedule: true,
  gallery: true,
  rsvp: true,
  faq: true,
};

export interface FaqItem {
  question: string;
  answer: string;
}

/** Merges possibly-partial/missing toggles over the all-on default — safe
 * for documents published before this field existed (they just show
 * everything, same as their original behavior). */
export function withDefaultSections(
  sections: Partial<SectionToggles> | null | undefined
): SectionToggles {
  return { ...DEFAULT_SECTIONS, ...(sections ?? {}) };
}

/** Fields the user controls in the editor. */
export interface InvitationData {
  templateId: string;
  groomName: string;
  brideName: string;
  weddingDate: string; // ISO date, e.g. "2026-12-04"
  ceremonyTime: string; // free text, e.g. "10:00 AM"
  ceremonyVenue: VenueInfo;
  receptionTime: string;
  receptionVenue: VenueInfo;
  story: string;
  groomParents: string; // e.g. "Mr. & Mrs. Rajendran Kumar" — blank hides the Family section
  brideParents: string;
  accentColor: string; // hex
  fontPairing: string; // id from FONT_PAIRINGS
  photos: string[]; // Storage download URLs
  backgroundMusic: string; // Storage download URL for an optional audio track, "" = none
  sections: SectionToggles;
  faq: FaqItem[]; // up to 4 — "Things to Know" (dress code, parking, etc.)
}

/** Full document shape at invitations/{slug|draftId}. */
export interface InvitationDoc extends InvitationData {
  slug: string | null;
  status: InvitationStatus;
  viewCount: number;
  createdAt: number;
  updatedAt: number;
}

/** Never exposed to public reads — invitations/{slug}/private/meta */
export interface InvitationPrivateMeta {
  editToken: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

export type AttendingSide = "groom" | "bride" | "friend";

export interface RsvpEntry {
  guestName: string;
  guestCount: number;
  attending: boolean;
  side?: AttendingSide;
  message?: string;
  createdAt: number;
}

