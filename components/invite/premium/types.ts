import type { GuestPhoto, InvitationData, RsvpEntry } from "@/lib/types";
import type { CategoryMeta } from "@/lib/i18n/categories";

/** What every premium layout receives — the same as the royal layout. */
export interface PremiumProps {
  data: InvitationData;
  slug: string;
  mode: "preview" | "public";
  category: CategoryMeta;
  occasionTitle: string;
  coupleLabel: string;
  rsvpMessages: RsvpEntry[];
  guestPhotos: GuestPhoto[];
  guestGreeting: string;
}

/** Parses an ISO yyyy-mm-dd as a local-noon date so the day never shifts
 * across time zones when formatted. */
export function parseDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
