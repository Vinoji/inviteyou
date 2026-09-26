/**
 * Per-template motion language: how sections enter, how headings animate,
 * what sits between sections, the scroll thread, ambient particles, and
 * template-specific "moments" inside sections. Consumed via
 * MotionThemeProvider (components/invite/motion/). The design behind each
 * wedding template's theme is in docs/template-motion-prompts.md.
 */

export type ParticlePreset =
  | "marigold"
  | "jasmine"
  | "embers"
  | "inkDots"
  | "pastelPetals"
  | "butterflies"
  | "glitter"
  | "bubbles"
  | "sunGlints";

export interface MotionTheme {
  sectionEnter: "rise" | "tier" | "wipe" | "bloom" | "iris" | "wave";
  heading: "maskUp" | "letters" | "goldSweep" | "inkType" | "handwrite";
  /** maskUp only: words settle with a slight wobble (rotate 1° → 0). */
  headingWobble?: boolean;
  divider: "none" | "kolamLine" | "hairline" | "vine" | "filmStrip" | "wave";
  /** Loops quietly behind the sections listed in `ambientAt`. */
  ambient?: ParticlePreset;
  /** Where the ambient particles loop. Defaults to hero + thank-you. */
  ambientAt?: ("hero" | "rsvp" | "thanks")[];
  /** One-shot burst when a guest submits an RSVP saying they'll attend. */
  rsvpBurst?: ParticlePreset;
  /** Colour behind sections (between them, and while they enter). */
  pageBg: string;
  thread?: "gold" | "ink" | "vine" | "silver" | "rope" | null;
  /** No ornaments at all: no toran, mandapam, arches, flourishes, glow or
   * rounded cards — for templates whose identity is restraint. */
  plain?: boolean;
  /** Template-specific touches inside individual sections. */
  moments?: {
    /** Families: "doors" slide in from both sides with a thali drawn
     * between; "pressed" tilt in like pressed-flower cards; "deco" get
     * art-deco line frames that draw themselves. */
    family?: "doors" | "pressed" | "deco";
    /** Event rows: "diyas" light at the left edge; "stickyTimes" pins the
     * current event's time in big numerals; "spotlight" follows the row
     * nearest the centre; "footprints" press into sand. */
    events?: "diyas" | "stickyTimes" | "spotlight" | "footprints";
    /** Memories: "arch" brass temple-arch frames with a slow zoom; "strip"
     * a pinned horizontal strip, grayscale until centred; "masonry" a grid
     * that sharpens in, petals on the corners; "postcards" float on water. */
    gallery?: "arch" | "strip" | "masonry" | "postcards";
    /** Grateful-note story: "split" text beside the photo, lines unmasking;
     * "wreath" a flower wreath around the photo; "pin" a polaroid swinging
     * on a pin. */
    story?: "split" | "wreath" | "pin";
    /** Countdown digit style. */
    countdown?: "flip" | "bud" | "splitFlap" | "tags";
    /** A full-screen pinned countdown after the hero, days counting down as you scroll. */
    pinnedCountdown?: boolean;
    /** Photos start grayscale and warm into colour as they reach the screen's centre. */
    warmPhotos?: boolean;
    /** A mandala and paisleys turning slowly with scroll. */
    mandalaLayer?: boolean;
    /** Palm fronds swaying at the screen edges, with parallax. */
    palms?: boolean;
    /** The sky behind hero and thank-you moves from noon to dusk with scroll. */
    sky?: boolean;
    /** A faint animated film-grain overlay. */
    grain?: boolean;
  };
}

const BASE: MotionTheme = {
  sectionEnter: "rise",
  heading: "maskUp",
  divider: "none",
  pageBg: "transparent",
  thread: null,
};

const THEMES: Record<string, MotionTheme> = {
  // Prompt 1, "Kolam & Temple Bell": a temple courtyard at dawn.
  "traditional-gold": {
    sectionEnter: "tier",
    heading: "goldSweep",
    divider: "kolamLine",
    ambient: "embers",
    pageBg: "#1E1A17",
    thread: "gold",
    moments: {
      family: "doors",
      events: "diyas",
      gallery: "arch",
      countdown: "flip",
      mandalaLayer: true,
    },
  },
  // Prompt 2, "Swiss Split": an architect's wedding — white space, one hairline.
  "minimal-modern": {
    sectionEnter: "wipe",
    heading: "inkType",
    divider: "hairline",
    pageBg: "#FAFAF7",
    thread: "ink",
    plain: true,
    moments: {
      events: "stickyTimes",
      gallery: "strip",
      story: "split",
      pinnedCountdown: true,
    },
  },
  // Prompt 3, "Blooming Bud": a spring garden.
  "floral-pastel": {
    sectionEnter: "bloom",
    heading: "handwrite",
    divider: "vine",
    ambient: "pastelPetals",
    ambientAt: ["hero", "rsvp"],
    rsvpBurst: "butterflies",
    pageBg: "#FFFBF5",
    thread: "vine",
    moments: {
      family: "pressed",
      gallery: "masonry",
      story: "wreath",
      countdown: "bud",
    },
  },
  // Prompt 4, "Black Box & Silver Card": black tie, silver foil, film grain.
  "elegant-bw": {
    sectionEnter: "iris",
    heading: "maskUp",
    divider: "filmStrip",
    ambient: "glitter",
    rsvpBurst: "glitter",
    pageBg: "#0B0B0C",
    thread: "silver",
    moments: {
      family: "deco",
      events: "spotlight",
      countdown: "splitFlap",
      warmPhotos: true,
      grain: true,
    },
  },
  // Prompt 5, "Message in a Bottle": a beach at golden hour.
  "beach-boho": {
    sectionEnter: "wave",
    heading: "maskUp",
    headingWobble: true,
    divider: "wave",
    ambient: "bubbles",
    ambientAt: ["rsvp"],
    pageBg: "#1D6E7A",
    thread: "rope",
    moments: {
      events: "footprints",
      gallery: "postcards",
      story: "pin",
      countdown: "tags",
      palms: true,
      sky: true,
    },
  },
};

export function getMotionTheme(templateId: string): MotionTheme {
  return THEMES[templateId] ?? BASE;
}
