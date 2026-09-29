/**
 * Site-wide details shown in the header, footer, help menu, Support,
 * Privacy and Terms pages. One place to edit — nothing else hardcodes
 * these. Entries left as "" are hidden rather than rendered as dead links.
 *
 * TODO(owner): the social links below are still placeholders.
 */

export const SITE = {
  name: "InviteForYou",
  /** The live domain — links, share previews, sitemap and contact email. */
  domain: "inviteforyou.in",
  url: "https://inviteforyou.in",
  /** Year the service started, for the copyright range. */
  since: 2026,
  contact: {
    email: "support.inviteforyou@gmail.com",
    /** International format, digits only. WhatsApp chats and SMS go here. */
    whatsapp: "916379792412",
    /** Numbers to call, in the order shown. */
    phones: ["916379792412", "919655921680"],
  },
  /** Profile URLs; "" hides that icon. */
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
    x: "https://x.com/",
    pinterest: "https://www.pinterest.com/",
    whatsapp: "",
  },
  /**
   * Walkthrough videos for the Demos page — YouTube video ids. Until
   * there are any, the page shows every template's live opening instead.
   */
  demoVideos: [] as { title: string; youtubeId: string }[],
} as const;

export type SocialId = keyof typeof SITE.social;

/** "916379792412" → "+91 63797 92412" (Indian numbers; others as +digits). */
export function formatPhone(digits: string): string {
  const m = /^91(\d{5})(\d{5})$/.exec(digits);
  return m ? `+91 ${m[1]} ${m[2]}` : `+${digits}`;
}
