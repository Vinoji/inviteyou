/**
 * When a published invitation stops being public.
 *
 * An invitation is live until the end of the 10th day after its date
 * (Indian time), so guests can still revisit photos and blessings after the
 * wedding. After that the public page shows "This invitation has ended",
 * and the owner can restore it from their edit link for ₹50, which adds 30
 * days (repeatable). Invitations without a date never expire.
 *
 * The expiry is always computed from the date plus `restoredUntil`, never
 * stored on its own, so editing the date moves it and invitations published
 * before this rule existed follow it too.
 */

export const GRACE_DAYS = 10;
export const RESTORE_DAYS = 30;
export const RESTORE_PRICE_PAISE = 5000; // ₹50

const DAY_MS = 86_400_000;
/** India is UTC+5:30 all year (no daylight saving). */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export interface ExpirySource {
  weddingDate?: string;
  /** Epoch ms a paid restore keeps the invitation live until. */
  restoredUntil?: number;
}

/** Epoch ms the invitation expires at, or null if it never does. */
export function expiresAt(inv: ExpirySource): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(inv.weddingDate ?? "");
  if (!m) return null;
  // 23:59:59.999 IST on the wedding date, plus the grace days.
  const endOfDayIst = Date.UTC(+m[1], +m[2] - 1, +m[3], 23, 59, 59, 999) - IST_OFFSET_MS;
  const base = endOfDayIst + GRACE_DAYS * DAY_MS;
  return Math.max(base, inv.restoredUntil ?? 0);
}

export function isExpired(inv: ExpirySource, now = Date.now()): boolean {
  const at = expiresAt(inv);
  return at !== null && now > at;
}

/** New `restoredUntil` after one paid restore: 30 days from now, or from
 * the current expiry if that's later (restoring early never loses time). */
export function restoredUntilAfterPayment(inv: ExpirySource, now = Date.now()): number {
  return Math.max(now, expiresAt(inv) ?? now) + RESTORE_DAYS * DAY_MS;
}
