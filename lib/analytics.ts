"use client";

import posthog from "posthog-js";

/**
 * Product analytics (PostHog): page views and taps are captured on their
 * own (components/analytics/Analytics.tsx); `track` adds the moments that
 * matter for the funnel. NEXT_PUBLIC_POSTHOG_KEY overrides the key ("" turns it off).
 */
// The project's public (write-only) key — made to sit in website code.
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_vC7dd65yFWCWBBf6nkWXJUSJqR4rBZXWteJrfpcZFfS4";
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export type FunnelEvent =
  | "design_opened"
  | "editor_step"
  | "free_card_downloaded"
  | "checkout_opened"
  | "payment_started"
  | "payment_failed"
  | "invitation_published"
  | "video_offer_seen"
  | "video_payment_started"
  | "video_paid"
  | "video_downloaded"
  | "whatsapp_chat_clicked";

export function track(event: FunnelEvent, props?: Record<string, string | number | boolean | undefined>) {
  if (!POSTHOG_KEY || typeof window === "undefined" || !posthog.__loaded) return;
  posthog.capture(event, props);
}
