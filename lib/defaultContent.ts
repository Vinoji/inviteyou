/**
 * Non-text seed values per template — dates/times are just example data (not
 * translated copy, since the same ISO date/time string is valid in any
 * locale; only its on-screen *formatting* is locale-aware). The translated
 * fields (story, FAQ, venue names/addresses, parent names, example
 * bride/groom names) live in messages/{locale}.json under
 * `defaultContent.<templateId>` — see lib/i18n/defaultContent.ts for the
 * locale-aware accessor that merges the two.
 */
export const DEFAULT_CONTENT_DATES: Record<
  string,
  { weddingDate: string; ceremonyTime: string; receptionTime: string }
> = {
  "traditional-gold": { weddingDate: "2027-01-24", ceremonyTime: "10:00 AM", receptionTime: "7:00 PM" },
  "minimal-modern": { weddingDate: "2026-12-12", ceremonyTime: "4:00 PM", receptionTime: "8:00 PM" },
  "floral-pastel": { weddingDate: "2027-02-14", ceremonyTime: "5:30 PM", receptionTime: "8:30 PM" },
  "elegant-bw": { weddingDate: "2026-11-21", ceremonyTime: "6:00 PM", receptionTime: "9:00 PM" },
  "beach-boho": { weddingDate: "2027-03-06", ceremonyTime: "5:00 PM", receptionTime: "8:00 PM" },
  "anniversary-emerald": { weddingDate: "2026-12-05", ceremonyTime: "7:00 PM", receptionTime: "" },
  "valentine-blush": { weddingDate: "2027-02-14", ceremonyTime: "8:00 PM", receptionTime: "" },
  "proposal-starlit": { weddingDate: "2026-12-20", ceremonyTime: "6:30 PM", receptionTime: "" },
  "birthday-confetti": { weddingDate: "2026-10-18", ceremonyTime: "6:00 PM", receptionTime: "" },
  "housewarming-terracotta": { weddingDate: "2026-11-08", ceremonyTime: "4:00 PM", receptionTime: "" },
};
