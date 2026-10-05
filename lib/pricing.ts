import { TEMPLATES, getTemplateConfig } from "./templates";

/**
 * Publishing prices. Each template can set its own `price` (₹) in
 * lib/templates.ts; any template without one costs the standard price,
 * which is the launch-offer price until OFFER_ENDS_AT and the usual price
 * after it — on the site and on the payment routes alike, so the
 * countdown is real. Every price shown or charged reads from here.
 */

/** Launch offer: ₹399 until the end of 31 December 2026, India time. */
export const OFFER_PRICE_INR = 399;
export const OFFER_ENDS_AT = Date.parse("2026-12-31T23:59:59.999+05:30");
/** The usual price — the struck-through "was" price during the offer. */
export const LIST_PRICE_INR = 599;

/** A payment started just before the offer ended may be confirmed just
 * after; the offer price is honoured for this long past the end. */
const OFFER_GRACE_MS = 24 * 60 * 60 * 1000;

export function offerActive(now = Date.now()): boolean {
  return now <= OFFER_ENDS_AT;
}

/** The standard price right now. */
export function standardPriceInr(now = Date.now()): number {
  return offerActive(now) ? OFFER_PRICE_INR : LIST_PRICE_INR;
}

/** Price in ₹ to publish an invitation made from this template. */
export function templatePriceInr(templateId: string, now = Date.now()): number {
  return getTemplateConfig(templateId).price ?? standardPriceInr(now);
}

/** The struck-through "was" price, or null when there's no saving. */
export function templateListPriceInr(templateId: string, now = Date.now()): number | null {
  const list = getTemplateConfig(templateId).listPrice ?? LIST_PRICE_INR;
  return list > templatePriceInr(templateId, now) ? list : null;
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

const allPrices = (now: number) => TEMPLATES.map((tpl) => tpl.price ?? standardPriceInr(now));
/** Cheapest template price, for "from ₹…". */
export const lowestPriceInr = (now = Date.now()) => Math.min(...allPrices(now));
/** Dearest template price, for the structured-data price range. */
export const highestPriceInr = (now = Date.now()) => Math.max(...allPrices(now));
/** Whether templates differ in price (so "from" is needed). */
export const pricesVary = (now = Date.now()) => allPrices(now).some((p) => p !== lowestPriceInr(now));
