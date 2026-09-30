import { SITE } from "./site";

/**
 * Support goes straight to the team's own inbox (the email in
 * lib/site.ts), so nothing is lost in a queue no one checks. The support
 * form (components/site/SupportForm.tsx) writes one tidy message with a
 * reference code; supportMailUrl opens it in the person's own mail app.
 */

export const SUPPORT_TOPICS = ["editLink", "payment", "guests", "design", "technical", "other"] as const;
export type SupportTopic = (typeof SUPPORT_TOPICS)[number];

/** A short code people can quote when they follow up, e.g. "IFY-7K2P9Q". */
export function supportReference(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O, 1/I
  return `IFY-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

export function supportMailUrl(subject: string, body: string): string {
  return `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
