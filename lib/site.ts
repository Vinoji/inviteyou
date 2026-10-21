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
   * Walkthrough videos for the Demos page: YouTube Shorts, one per design
   * (the title is the design's name; "Use this design" opens its editor).
   */
  demoVideos: [
    { youtubeId: "DJmMX0Hkw60", templateId: "madurai-meenakshi" },
    { youtubeId: "xgHPICGTL98", templateId: "pastel-palace" },
    { youtubeId: "5roOqKf-eVg", templateId: "temple-journey" },
    { youtubeId: "EzbHe7K9gkQ", templateId: "lilac-seal" },
    { youtubeId: "yk0Y8YgCMpY", templateId: "pearl-curtain" },
    { youtubeId: "dHvIqIsFQw4", templateId: "photo-story" },
    { youtubeId: "IqK47qpAgzM", templateId: "living-temple" },
    { youtubeId: "nTB0Oi_51mw", templateId: "temple-photo-story" },
  ] as { youtubeId: string; templateId: string }[],
} as const;

export type SocialId = keyof typeof SITE.social;
