import { TEMPLATES, getTemplateConfig } from "./templates";

/**
 * Publishing prices, by tier:
 *   free     — card image download only (TemplateConfig.free); never published
 *   standard — every other design
 *   premium  — the 3D designs (TemplateConfig.badge === "premium")
 * During the launch offer (until OFFER_ENDS_AT) each paid tier costs its
 * offer price; afterwards its usual price — on the site and on the payment
 * routes alike, so the countdown is real. Every price shown or charged
 * reads from here.
 */

export type Tier = "free" | "standard" | "premium";

/** Launch offer ends at the end of 12 November 2026, India time. */
export const OFFER_ENDS_AT = Date.parse("2026-11-12T23:59:59.999+05:30");

export const TIER_PRICES: Record<Exclude<Tier, "free">, { offer: number; usual: number }> = {
  standard: { offer: 199, usual: 299 },
  premium: { offer: 399, usual: 599 },
};

/** The standard tier's prices, for copy that names one price. */
export const OFFER_PRICE_INR = TIER_PRICES.standard.offer;
export const LIST_PRICE_INR = TIER_PRICES.standard.usual;

/** A payment started just before the offer ended may be confirmed just
 * after; the offer price is honoured for this long past the end. */
export const OFFER_GRACE_MS = 24 * 60 * 60 * 1000;

export function offerActive(now = Date.now()): boolean {
  return now <= OFFER_ENDS_AT;
}

export function templateTier(templateId: string): Tier {
  const tpl = getTemplateConfig(templateId);
  return tpl.free ? "free" : tpl.badge === "premium" ? "premium" : "standard";
}

export function isFreeTemplate(templateId: string): boolean {
  return templateTier(templateId) === "free";
}

/** A tier's price right now. */
export function tierPriceInr(tier: Tier, now = Date.now()): number {
  if (tier === "free") return 0;
  return offerActive(now) ? TIER_PRICES[tier].offer : TIER_PRICES[tier].usual;
}

/** The standard tier's price right now. */
export function standardPriceInr(now = Date.now()): number {
  return tierPriceInr("standard", now);
}

/** Price in ₹ to publish an invitation made from this template (0 = free card). */
export function templatePriceInr(templateId: string, now = Date.now()): number {
  return getTemplateConfig(templateId).price ?? tierPriceInr(templateTier(templateId), now);
}

/** The struck-through usual price during the offer, or null. */
export function templateListPriceInr(templateId: string, now = Date.now()): number | null {
  const tier = templateTier(templateId);
  if (tier === "free") return null;
  const usual = getTemplateConfig(templateId).listPrice ?? TIER_PRICES[tier].usual;
  return usual > templatePriceInr(templateId, now) ? usual : null;
}

/** Same, in paise — what Razorpay charges. */
export function templatePricePaise(templateId: string, now = Date.now()): number {
  return templatePriceInr(templateId, now) * 100;
}

/** The least a confirmed payment must cover: today's price, or the offer
 * price for payments confirmed within a day of the offer ending. */
export function minAcceptedPaise(templateId: string, now = Date.now()): number {
  return Math.min(templatePricePaise(templateId, now), templatePricePaise(templateId, now - OFFER_GRACE_MS));
}

// Tier prices of the paid designs on offer — not one-off `price` overrides
// (e.g. a payment test), which shouldn't become the advertised price.
const paidPrices = (now: number) =>
  TEMPLATES.filter((tpl) => !tpl.hidden && !tpl.free).map((tpl) => tierPriceInr(templateTier(tpl.id), now));
/** Cheapest paid design, for "from ₹…" (free card designs aside). */
export const lowestPriceInr = (now = Date.now()) => Math.min(...paidPrices(now));
/** Dearest design, for the structured-data price range. */
export const highestPriceInr = (now = Date.now()) => Math.max(...paidPrices(now));
/** Whether paid designs differ in price (so "from" is needed). */
export const pricesVary = (now = Date.now()) => paidPrices(now).some((p) => p !== lowestPriceInr(now));
