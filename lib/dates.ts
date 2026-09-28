/**
 * The "no past event dates" rule, shared by the editor and the API.
 *
 * New invitations need today or a later date (except categories whose date
 * is naturally in the past, like a proposal). When editing, the date the
 * invitation already has may stay as it is, even once it's past, so fixing
 * a typo after the event still works; only changing it to a new past date is
 * refused. An empty date ("to be announced") is always allowed.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date as yyyy-mm-dd, in the given time zone (default: the
 * runtime's own — the visitor's, in a browser). */
export function todayIso(timeZone?: string, now: Date = new Date()): string {
  // en-CA formats dates as yyyy-mm-dd.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** The earliest date the server accepts: yesterday in India, so a couple in
 * a time zone behind India can still pick their own "today". */
export function earliestAllowedOnServer(now: Date = new Date()): string {
  return todayIso("Asia/Kolkata", new Date(now.getTime() - 86_400_000));
}

/**
 * Whether `date` is allowed as the invitation's date.
 * @param earliest  yyyy-mm-dd; anything before it is "in the past".
 * @param saved     The date the invitation already has (when editing).
 */
export function isDateAllowed(
  date: string,
  opts: { allowPast: boolean; earliest: string; saved?: string }
): boolean {
  if (!date) return true;
  if (!ISO_DATE.test(date)) return false;
  if (opts.allowPast) return true;
  if (opts.saved && date === opts.saved) return true;
  return date >= opts.earliest; // ISO dates compare correctly as strings
}
