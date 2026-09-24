export type CategoryId =
  | "wedding"
  | "anniversary"
  | "valentine"
  | "proposal"
  | "birthday"
  | "housewarming";

/**
 * Category-driven config. The underlying Firestore/InvitationData schema
 * stays the wedding-shaped fields it always was (groomName/brideName,
 * ceremonyTime/Venue, receptionTime/Venue, story, groomParents/
 * brideParents) — rewriting the schema per occasion would touch every API
 * route, security rule assumption, and published document shape for
 * marginal benefit. Instead each category relabels those same fields to
 * fit ("Bride's name" becomes "Host name(s)" for a house warming) and
 * hides what doesn't apply (a birthday has no second person, so
 * `singlePerson` drops the "&" pairing and the second name field).
 * Sections that end up empty already hide themselves (Schedule only
 * renders an event card with a time or venue; Family only renders with at
 * least one parent line) — categories just steer what gets filled by
 * default and what the editor prompts for.
 *
 * All display text for each category (label, tagline, field labels, etc.)
 * lives in messages/{locale}.json under `categories.<id>` — see
 * lib/i18n/categories.ts for the locale-aware accessor.
 */
export interface CategoryConfig {
  id: CategoryId;
  singlePerson: boolean;
  /** False for categories whose date is retrospective (e.g. a proposal
   * already happened) — a countdown to a date in the past reads oddly, even
   * though the "celebration has begun" fallback it resolves to is graceful. */
  showCountdown: boolean;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "wedding", singlePerson: false, showCountdown: true },
  { id: "anniversary", singlePerson: false, showCountdown: true },
  { id: "valentine", singlePerson: false, showCountdown: true },
  { id: "proposal", singlePerson: false, showCountdown: false },
  { id: "birthday", singlePerson: true, showCountdown: true },
  { id: "housewarming", singlePerson: true, showCountdown: true },
];

export function getCategoryConfig(id: string): CategoryConfig {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
