import { DEV_PRICE_INR, OFFER_GRACE_MS, devPriceEnabled, isFreeTemplate, templatePriceInr } from "./pricing";

/**
 * Discount codes. Two kinds:
 *   partner   — for photographers, mandapams, makeup artists, printers…
 *               Share inviteforyou.in/?ref=CODE; their clients get the
 *               discount and each sale records the code (payments/{orderId}
 *               .coupon) so the partner's commission can be counted.
 *   returning — shown to couples who already published (e.g. engagement →
 *               wedding) on their private guest-list page.
 * Codes are public by nature (they're shared), so they live here, not in a
 * secret store. Add a partner by adding a line; remove it to retire it.
 */
export interface Coupon {
  code: string;
  offInr: number;
  kind: "partner" | "returning";
  /** Who it's for — the partner's name, or why. Shown to the buyer. */
  label: string;
  /** Last valid day (YYYY-MM-DD, India time). Leave out for no end. */
  until?: string;
}

export const COUPONS: Coupon[] = [
  { code: "WEDDING50", offInr: 50, kind: "returning", label: "Welcome back" },
  // Partners — one line each, e.g.:
  // { code: "RAVISTUDIO", offInr: 20, kind: "partner", label: "Ravi Studio" },
];

/** No paid invitation goes below this after a discount. */
const FLOOR_INR = 49;

export function normalizeCode(v: unknown): string {
  return typeof v === "string" ? v.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24) : "";
}

export function findCoupon(code: unknown, now = Date.now()): Coupon | null {
  const c = COUPONS.find((x) => x.code === normalizeCode(code));
  if (!c) return null;
  if (c.until && now > Date.parse(`${c.until}T23:59:59.999+05:30`)) return null;
  return c;
}

/** ₹ off this template with this code (0 when it doesn't apply). */
export function couponOffInr(code: unknown, templateId: string, now = Date.now()): number {
  const c = findCoupon(code, now);
  if (!c || isFreeTemplate(templateId)) return 0;
  const price = templatePriceInr(templateId, now);
  return Math.max(0, Math.min(c.offInr, price - FLOOR_INR));
}

/** What the buyer pays, in ₹. `devPrice` is the ?dev_option=1 payment test
 * (lib/pricing.ts), ignored unless that is switched on. */
export function payableInr(templateId: string, code: unknown, devPrice = false, now = Date.now()): number {
  if (devPrice && devPriceEnabled() && !isFreeTemplate(templateId)) return DEV_PRICE_INR;
  return templatePriceInr(templateId, now) - couponOffInr(code, templateId, now);
}

/** The least a confirmed payment must cover, in paise: what's payable now,
 * or just before the launch offer ended (payments started in time). */
export function minAcceptedPayablePaise(templateId: string, code: unknown, devPrice = false, now = Date.now()): number {
  return (
    Math.min(payableInr(templateId, code, devPrice, now), payableInr(templateId, code, devPrice, now - OFFER_GRACE_MS)) * 100
  );
}
