import { SITE } from "./site";
import { whatsappUrl } from "./share";

/**
 * Support goes straight to the team's own inboxes — email, WhatsApp and
 * SMS to the numbers in lib/site.ts — so nothing is lost in a queue no one
 * checks. The support form (components/site/SupportForm.tsx) writes one
 * tidy message with a reference code; these build the links that open it
 * in the person's own app.
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

export function supportWhatsAppUrl(text: string): string {
  return whatsappUrl(text, SITE.contact.whatsapp);
}

export function supportMailUrl(subject: string, body: string): string {
  return `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** "?&body=" works in both iOS and Android messaging apps. */
export function supportSmsUrl(body: string): string {
  return `sms:+${SITE.contact.whatsapp}?&body=${encodeURIComponent(body)}`;
}

export function telUrl(digits: string): string {
  return `tel:+${digits}`;
}
