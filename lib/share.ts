/**
 * Sharing helpers: WhatsApp deep links, personal guest links and phone
 * numbers normalised for wa.me.
 */

export const MAX_GUEST_GREETING = 60;

/**
 * Host messages (share / personal invite / reminder) are worded on the
 * server in the invitation's language, with these tokens left for the
 * browser to fill: the page origin is only known there, and the guest's
 * name differs per recipient. Kept here, not in the client component, so
 * the server page gets the real strings rather than client references.
 */
export const URL_TOKEN = "__INVITE_URL__";
export const NAME_TOKEN = "__GUEST_NAME__";

/** The `?to=` greeting on a personal invite link, cleaned for display:
 * trimmed, whitespace collapsed, control characters dropped, capped. */
export function cleanGreeting(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/\s+/g, " ") // tabs/newlines become spaces first…
    .replace(/\p{Cc}/gu, "") // …then any other control character goes
    .trim()
    .slice(0, MAX_GUEST_GREETING);
}

export function personalInviteUrl(inviteUrl: string, guest: string): string {
  const name = cleanGreeting(guest);
  if (!name) return inviteUrl;
  const url = new URL(inviteUrl);
  url.searchParams.set("to", name);
  return url.toString();
}

/** Digits in the international form wa.me expects (country code, no "+").
 * A bare 10-digit number, or one with a trunk "0", is taken as Indian.
 * Returns "" when it can't be a phone number. */
export function waPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return "";
}

/** Stored form of a guest's phone: keeps a leading "+", digits and single
 * spaces; "" if it doesn't look like a phone number at all. */
export function sanitizePhone(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim().slice(0, 24);
  if (!waPhone(trimmed)) return "";
  return trimmed.replace(/[^\d+ ]/g, "").replace(/\s+/g, " ");
}

/** WhatsApp link: to a specific number when given, otherwise WhatsApp's
 * "choose a chat" picker. Goes to api.whatsapp.com directly — the wa.me
 * short link re-encodes the text on its redirect and mangles emoji. */
export function whatsappUrl(text: string, phone?: string): string {
  const params = new URLSearchParams({ text });
  const to = phone ? waPhone(phone) : "";
  if (to) params.set("phone", to);
  return `https://api.whatsapp.com/send?${params.toString().replace(/\+/g, "%20")}`;
}
