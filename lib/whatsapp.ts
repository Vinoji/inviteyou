/**
 * InviteForYou's WhatsApp (digits with country code). NEXT_PUBLIC_WHATSAPP_NUMBER
 * overrides it; set that to "0" to hide WhatsApp everywhere.
 */
const RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "916379792412";
export const WHATSAPP_NUMBER = RAW === "0" ? "" : RAW.replace(/\D/g, "");

/** A wa.me link that opens a chat with the business, the message typed in. */
export function whatsappUrl(text: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
