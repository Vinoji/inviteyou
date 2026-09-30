/**
 * Layout styles: what makes a premium wedding template look like itself
 * after the opening, not just recoloured. Each one gives the shared
 * royal layout (components/invite/royal) its own
 *
 * - hero composition and art (components/invite/styles/StyleHero.tsx),
 * - section emblems, frame shapes, card styles, dividers and background
 *   patterns (the `[data-layout]` blocks in royal.module.css),
 * - invocation line, lead and "weds" wording (`invite.styles.<id>` in
 *   messages), and
 * - for faith styles, event names — Muhurtham, Nikah & Walima, Holy
 *   Matrimony… (`categories.wedding.layouts.<id>`), used everywhere the
 *   events appear: the invitation, card image, WhatsApp message, calendar.
 *
 * Everything functional (RSVP, map, gallery, countdown, family, travel)
 * stays shared.
 */

export const LAYOUT_STYLES = [
  "temple",
  "mandap",
  "palace",
  "lotus",
  "nikah",
  "moonlit",
  "church",
  "garden",
  "editorial",
  "watercolor",
  "arch",
  "velvet",
  // Looks made for the other occasions (engagement, anniversary, valentine,
  // proposal, birthday, housewarming, baby, corporate).
  "sparkle",
  "thamboolam",
  "vintage",
  "roses",
  "letter",
  "neon",
  "clouds",
  "balloons",
  "kids",
  "cake",
  "keys",
  "door",
  "bangles",
  "teddy",
  "tech",
] as const;

export type LayoutStyleId = (typeof LAYOUT_STYLES)[number];

/** Styles that rename the two events (Muhurtham / Reception, Nikah / Walima…). */
const RENAMES_EVENTS = new Set<LayoutStyleId>(["temple", "mandap", "palace", "nikah", "moonlit", "church", "garden"]);

/** Styles that open with an invocation line (a blessing, verse or Bismillah). */
const HAS_INVOCATION = new Set<LayoutStyleId>(["temple", "mandap", "palace", "lotus", "nikah", "moonlit", "church", "garden"]);

export function renamesEvents(layout: LayoutStyleId | undefined): layout is LayoutStyleId {
  return Boolean(layout && RENAMES_EVENTS.has(layout));
}

export function hasInvocation(layout: LayoutStyleId): boolean {
  return HAS_INVOCATION.has(layout);
}
