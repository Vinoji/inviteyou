export type InvitationStatus = "pending_payment" | "published";

export interface VenueInfo {
  name: string;
  address: string;
  mapsLink?: string;
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

