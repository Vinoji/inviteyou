import { DEV_PRICE_INR, OFFER_GRACE_MS, devPriceEnabled, isFreeTemplate, offerActive, templatePriceInr, templateTier } from "./pricing";

/**
 * Discount codes. Three kinds:
 *   partner   — for photographers, mandapams, makeup artists, printers…
 *               Share inviteforyou.in/?ref=CODE; their clients get the
 *               discount and each sale records the code (payments/{orderId}
 *               .coupon) so the partner's commission can be counted.
 *   returning — shown to couples who already published (e.g. engagement →
 *               wedding) on their private guest-list page.
 *   offer     — applied by itself while a launch or festival offer runs
 *               (`auto`), no typing needed.
 * A code can be for 3D designs only (`premium`) and limited to its first
 * `limit` customers — counted in Firestore couponUses/{code} when an
 * invitation is published with it (lib/couponUses.ts).
 * Codes are public by nature (they're shared), so they live here, not in a
 * secret store. Add a partner by adding a line; remove it to retire it.
 */
export interface Coupon {
  code: string;
  offInr: number;
  kind: "partner" | "returning" | "offer";
  /** Who it's for — the partner's name, or why. Shown to the buyer. */
  label: string;
  /** Last valid day (YYYY-MM-DD, India time). Leave out for no end. */
  until?: string;
  /** Only for the 3D designs. */
  premium?: true;
  /** Only for this many customers (publishes), first come first served. */
  limit?: number;
  /** Applied by itself while an offer runs. */
  auto?: true;
}

export const COUPONS: Coupon[] = [
  { code: "WEDDING50", offInr: 50, kind: "returning", label: "Welcome back" },
  // 3D designs stay ₹99 during the offer (live invitations ₹49); only the
  // partner codes below bring a 3D design down to ₹49. (INVITEFORYOU, which
  // applied itself on 3D for ₹49, is retired.)
  { code: "OVY100", offInr: 100, kind: "partner", label: "First 10 customers · 3D", premium: true, limit: 10 },
  { code: "SANJU100", offInr: 100, kind: "partner", label: "First 10 customers · 3D", premium: true, limit: 10 },
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

/** Whether this code can be used on this design at all (its uses left
 * aside — that's checked on the server). */
export function couponFits(c: Coupon, templateId: string, now = Date.now()): boolean {
  if (isFreeTemplate(templateId)) return false;
  if (c.premium && templateTier(templateId) !== "premium") return false;
  if (c.auto && !offerActive(now)) return false;
  return true;
}

/** The code applied by itself on this design right now, if any. */
export function autoCoupon(templateId: string, now = Date.now()): string {
  return COUPONS.find((c) => c.auto && couponFits(c, templateId, now) && couponOffInr(c.code, templateId, now) > 0)?.code ?? "";
}

/** ₹ off this template with this code (0 when it doesn't apply). */
export function couponOffInr(code: unknown, templateId: string, now = Date.now()): number {
  const c = findCoupon(code, now);
  if (!c || !couponFits(c, templateId, now)) return 0;
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
