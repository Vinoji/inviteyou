/**
 * Site-wide details shown in the header, footer, help menu, Support,
 * Privacy and Terms pages. One place to edit — nothing else hardcodes
 * these. Entries left as "" are hidden rather than rendered as dead links.
 */

export const SITE = {
  name: "InviteForYou",
  /** The live domain — links, share previews, sitemap and contact email. */
  domain: "inviteforyou.in",
  url: "https://inviteforyou.in",
  /** Year the service started, for the copyright range. */
  since: 2026,
  /** Email only — no phone numbers are published, for privacy. */
  contact: {
    email: "support.inviteforyou@gmail.com",
  },
  /** Profile URLs; "" hides that icon. */
  social: {
    instagram: "https://www.instagram.com/inviteforyouofficial/",
    facebook: "https://www.facebook.com/people/Inviteforyou/61594935339271/",
    youtube: "https://www.youtube.com/@InviteForYouOfficial",
    x: "",
    pinterest: "",
    whatsapp: "",
  },
  /**
   * Walkthrough videos for the Demos page — YouTube video ids. Until
   * there are any, the page shows every template's live opening instead.
   */
  demoVideos: [] as { title: string; youtubeId: string }[],
} as const;

export type SocialId = keyof typeof SITE.social;
