import { TEMPLATES, getTemplateConfig } from "./templates";

/**
 * Publishing prices. Each template can set its own `price` (₹) in
 * lib/templates.ts; any template without one costs PRICE_INR. The payment
 * routes and every price shown on the site read from here.
 */
export const PRICE_INR = 399;
/** Default "was" price, shown struck through when it's above the price. */
export const LIST_PRICE_INR = 599;

/** Price in ₹ to publish an invitation made from this template. */
export function templatePriceInr(templateId: string): number {
  return getTemplateConfig(templateId).price ?? PRICE_INR;
}

/** The struck-through "was" price, or null when there's no offer. */
export function templateListPriceInr(templateId: string): number | null {
  const list = getTemplateConfig(templateId).listPrice ?? LIST_PRICE_INR;
  return list > templatePriceInr(templateId) ? list : null;
}

/** Same, in paise — what Razorpay charges. */
export function templatePricePaise(templateId: string): number {
  return templatePriceInr(templateId) * 100;
}

const ALL_PRICES = TEMPLATES.map((tpl) => tpl.price ?? PRICE_INR);
/** Cheapest template price, for "from ₹…" on the landing page. */
export const LOWEST_PRICE_INR = Math.min(...ALL_PRICES);
/** Dearest template price, for the structured-data price range. */
export const HIGHEST_PRICE_INR = Math.max(...ALL_PRICES);
/** Whether templates differ in price (so "from" is needed). */
export const PRICES_VARY = ALL_PRICES.some((p) => p !== LOWEST_PRICE_INR);
