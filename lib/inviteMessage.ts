/**
 * The WhatsApp text for an invitation — shared by the guest-facing share
 * box and the couple's dashboard (general invite, personal invite and
 * reminder), so every message reads like a proper invitation card:
 * greeting, heading, the occasion, a short note, date / times / venues, the
 * link (WhatsApp shows the invitation's preview card under it) and a thank
 * you signed by the hosts. Uses WhatsApp's *bold* formatting.
 *
 * `t` is scoped to the `invite.whatsapp` namespace in the invitation's
 * language.
 */

type T = (key: string, values?: Record<string, string>) => string;

export interface WhatsAppMessageInput {
  kind: "invite" | "reminder";
  /** e.g. "Ananya & Kabir's Wedding". */
  title: string;
  /** Formatted in the invitation language, "" when unset. */
  date: string;
  events: { label: string; time: string; venue: string }[];
  url: string;
  /** Who's inviting — "Ananya & Kabir". */
  hosts: string;
  /** Personal messages open with "Dear …". */
  guest?: string;
}

export function buildWhatsAppMessage(t: T, m: WhatsAppMessageInput): string {
  const lines: string[] = [];
  if (m.guest) lines.push(t("dear", { name: m.guest }), "");
  lines.push(t(m.kind === "reminder" ? "reminderHeading" : "heading"), "");
  lines.push(`*${m.title}*`, "");
  lines.push(t(m.kind === "reminder" ? "reminderIntro" : "intro"));

  const details: string[] = [];
  if (m.date) details.push(`📅 *${m.date}*`);
  let lastVenue = "";
  for (const e of m.events) {
    if (e.time) details.push(`🕒 ${[e.label, e.time].filter(Boolean).join(" · ")}`);
    // Both events at one venue: say it once.
    if (e.venue && e.venue !== lastVenue) {
      details.push(`📍 ${e.venue}`);
      lastVenue = e.venue;
    }
  }
  if (details.length) lines.push("", ...details);

  lines.push("", t("open"), m.url, "", t("thanks"), `— ${m.hosts}`);
  return lines.join("\n");
}
