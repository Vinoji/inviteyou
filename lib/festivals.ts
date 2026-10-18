/**
 * Festival offers: each runs for a short window ending on the festival
 * (India time) and, while it runs, sets the paid tiers' prices — on the
 * site and on the payment routes alike (lib/pricing.ts reads this), so the
 * banner, the countdown and what Razorpay charges always agree. Between
 * festivals the usual price applies, so the struck-through "usual" price
 * is a price people really pay.
 *
 * Add, move or re-price a festival here; nothing else needs to change. The
 * name, greeting and wording live in messages (festivals.<id>), the look
 * in components/offers (FestivalArt, by `theme`).
 *
 * Dates from Drik Panchang and public holiday calendars. Lunar festivals
 * can shift a day by region; Eid follows the moon sighting, so its window
 * runs a couple of days past the expected date.
 */

export type FestivalTheme =
  | "diwali"
  | "karthigai"
  | "christmas"
  | "pongal"
  | "republic"
  | "valentine"
  | "shivaratri"
  | "eid"
  | "holi"
  | "ugadi"
  | "puthandu"
  | "akshaya";

export interface FestivalOffer {
  /** Messages key (festivals.<id>) and analytics id. */
  id: string;
  theme: FestivalTheme;
  /** First and last day of the offer (YYYY-MM-DD, India time, inclusive). */
  from: string;
  until: string;
  /** The festival day itself, for "Happy …" wording. */
  day: string;
  /** Prices while it runs. */
  prices: { standard: number; premium: number };
  /** Designs to show first while it runs (by template id). */
  designs?: string[];
}

/** Every festival offer: ₹49 live invitations, ₹99 3D designs. */
const FESTIVAL_PRICES = { standard: 49, premium: 99 };

export const FESTIVAL_OFFERS: FestivalOffer[] = [
  { id: "diwali2026", theme: "diwali", from: "2026-11-01", until: "2026-11-08", day: "2026-11-08", prices: FESTIVAL_PRICES },
  { id: "karthigai2026", theme: "karthigai", from: "2026-11-19", until: "2026-11-24", day: "2026-11-24", prices: FESTIVAL_PRICES, designs: ["living-temple", "lantern-night", "temple-photo-story"] },
  { id: "christmas2026", theme: "christmas", from: "2026-12-20", until: "2027-01-01", day: "2026-12-25", prices: FESTIVAL_PRICES, designs: ["chapel-bells", "church-stained-glass"] },
  { id: "pongal2027", theme: "pongal", from: "2027-01-09", until: "2027-01-17", day: "2027-01-15", prices: FESTIVAL_PRICES, designs: ["thoranam-jasmine", "temple-photo-story", "living-temple"] },
  { id: "republic2027", theme: "republic", from: "2027-01-24", until: "2027-01-26", day: "2027-01-26", prices: FESTIVAL_PRICES },
  { id: "valentine2027", theme: "valentine", from: "2027-02-08", until: "2027-02-14", day: "2027-02-14", prices: FESTIVAL_PRICES },
  { id: "shivaratri2027", theme: "shivaratri", from: "2027-03-01", until: "2027-03-06", day: "2027-03-06", prices: FESTIVAL_PRICES, designs: ["living-temple", "temple-photo-story"] },
  { id: "eid2027", theme: "eid", from: "2027-03-07", until: "2027-03-12", day: "2027-03-10", prices: FESTIVAL_PRICES, designs: ["nikah-emerald"] },
  { id: "holi2027", theme: "holi", from: "2027-03-17", until: "2027-03-22", day: "2027-03-22", prices: FESTIVAL_PRICES },
  { id: "ugadi2027", theme: "ugadi", from: "2027-04-03", until: "2027-04-07", day: "2027-04-07", prices: FESTIVAL_PRICES },
  { id: "puthandu2027", theme: "puthandu", from: "2027-04-10", until: "2027-04-14", day: "2027-04-14", prices: FESTIVAL_PRICES, designs: ["thoranam-jasmine", "temple-photo-story"] },
  { id: "akshaya2027", theme: "akshaya", from: "2027-05-04", until: "2027-05-09", day: "2027-05-08", prices: FESTIVAL_PRICES },
];

/** Start and end (epoch ms) of an offer's window, India time. */
export function festivalWindow(f: FestivalOffer): { start: number; end: number } {
  return {
    start: Date.parse(`${f.from}T00:00:00+05:30`),
    end: Date.parse(`${f.until}T23:59:59.999+05:30`),
  };
}

/** The festival offer running now, if any. */
export function activeFestival(now = Date.now()): FestivalOffer | null {
  return (
    FESTIVAL_OFFERS.find((f) => {
      const { start, end } = festivalWindow(f);
      return now >= start && now <= end;
    }) ?? null
  );
}
