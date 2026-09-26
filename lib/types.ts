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
  guestPhotos: boolean;
  travel: boolean;
  places: boolean;
}

export const DEFAULT_SECTIONS: SectionToggles = {
  story: true,
  family: true,
  schedule: true,
  gallery: true,
  rsvp: true,
  faq: true,
  guestPhotos: true,
  travel: true,
  places: true,
};

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Airport {
  code: string; // e.g. "MAA"
  name: string;
  distance: string; // free text, e.g. "18 km"
}

export interface Train {
  number: string;
  name: string;
  fromStation: string;
  departs: string; // free text, e.g. "6:00 AM"
  toStation: string;
  arrives: string;
  frequency: string; // e.g. "Daily"
}

/** One tab in the Travel Guide's train list, e.g. "From Chennai". */
export interface TrainRoute {
  from: string;
  trains: Train[]; // up to 3
}

/** Travel Guide section: destination city, nearby airports, suggested trains. */
export interface TravelInfo {
  city: string;
  cityCode: string; // short label under the city, e.g. "MAA"
  airports: Airport[]; // up to 3
  routes: TrainRoute[]; // up to 2
}

export const EMPTY_TRAVEL: TravelInfo = { city: "", cityCode: "", airports: [], routes: [] };

/** Drawn illustration used as a Places to Explore card's header. */
export const PLACE_SCENES = ["temple", "palace", "nature", "heritage", "beach"] as const;
export type PlaceScene = (typeof PLACE_SCENES)[number];

export interface Place {
  title: string;
  description: string;
  distance: string; // e.g. "2 km from venue"
  scene: PlaceScene;
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
  travel: TravelInfo; // Travel Guide — shown by the wedding (royal palace) layout
  places: Place[]; // up to 6 — Places to Explore, same layout
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

/** invitations/{slug}/guestPhotos/{autoId} — photos guests upload themselves. */
export interface GuestPhoto {
  uploaderName: string;
  url: string;
  createdAt: number;
}

