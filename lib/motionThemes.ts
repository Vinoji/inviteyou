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
  // ── Premium layout styles (lib/layoutStyles.ts) ──
  "temple-gopuram": {
    // Has its own page (premium/pathirikai): only the section entrance is used.
    sectionEnter: "rise", heading: "goldSweep", divider: "none",
    pageBg: "#5a1d10", thread: null,
    moments: { family: "doors", events: "diyas", gallery: "arch", countdown: "flip" },
  },
  "mandap-marigold": {
    sectionEnter: "bloom", heading: "letters", divider: "vine", ambient: "marigold",
    rsvpBurst: "marigold", pageBg: "#5C0A2E", thread: "gold",
    moments: { family: "doors", events: "diyas", gallery: "masonry", countdown: "bud" },
  },
  "rajwada-palace": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter",
    pageBg: "#0E1B4D", thread: "gold",
    moments: { family: "deco", events: "spotlight", gallery: "arch", countdown: "flip" },
  },
  "lotus-peacock": {
    sectionEnter: "wave", heading: "handwrite", divider: "wave", ambient: "pastelPetals",
    rsvpBurst: "pastelPetals", pageBg: "#FBF7F1", thread: "vine",
    moments: { family: "pressed", gallery: "postcards", story: "wreath", countdown: "bud" },
  },
  "nikah-emerald": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter",
    pageBg: "#062E1E", thread: "gold",
    moments: { family: "deco", events: "spotlight", gallery: "arch", countdown: "flip" },
  },
  "walima-moonlit": {
    sectionEnter: "rise", heading: "letters", divider: "none", ambient: "glitter",
    pageBg: "#070F24", thread: "silver",
    moments: { family: "deco", events: "stickyTimes", gallery: "strip", countdown: "splitFlap" },
  },
  "church-stained-glass": {
    sectionEnter: "iris", heading: "maskUp", divider: "hairline", ambient: "jasmine",
    rsvpBurst: "jasmine", pageBg: "#FCFAF5", thread: "gold",
    moments: { family: "deco", events: "spotlight", gallery: "arch", story: "split", countdown: "flip" },
  },
  "christian-garden": {
    sectionEnter: "bloom", heading: "handwrite", divider: "vine", ambient: "butterflies",
    rsvpBurst: "pastelPetals", pageBg: "#FAFAF5", thread: "vine",
    moments: { family: "pressed", gallery: "masonry", story: "wreath", countdown: "bud" },
  },
  "luxe-editorial": {
    // Has its own page (premium/editorial): only the section entrance is used.
    sectionEnter: "rise", heading: "inkType", divider: "none", pageBg: "#F4F0E9", thread: null,
    plain: true,
  },
  "watercolor-botanical": {
    sectionEnter: "bloom", heading: "handwrite", divider: "vine", ambient: "pastelPetals",
    rsvpBurst: "pastelPetals", pageBg: "#FFFBF6", thread: "vine",
    moments: { family: "pressed", gallery: "masonry", story: "wreath", countdown: "bud" },
  },
  "boho-arch": {
    sectionEnter: "rise", heading: "maskUp", headingWobble: true, divider: "wave", ambient: "sunGlints",
    pageBg: "#FBF4EC", thread: "rope",
    moments: { gallery: "postcards", story: "pin", events: "footprints", countdown: "tags" },
  },
  "velvet-gold": {
    sectionEnter: "tier", heading: "goldSweep", divider: "none", ambient: "embers",
    rsvpBurst: "glitter", pageBg: "#2A0710", thread: "gold",
    moments: { family: "deco", events: "spotlight", gallery: "strip", countdown: "flip", warmPhotos: true },
  },
  // ── Premium styles for the other occasions ──
  "engagement-sparkle": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#2B2118", thread: "gold",
    moments: { family: "deco", events: "spotlight", countdown: "flip" },
  },
  "engagement-thamboolam": {
    sectionEnter: "tier", heading: "goldSweep", divider: "kolamLine", ambient: "marigold", pageBg: "#173A18", thread: "gold",
    moments: { family: "doors", countdown: "flip" },
  },
  "engagement-rose-garden": {
    sectionEnter: "bloom", heading: "handwrite", divider: "vine", ambient: "pastelPetals", rsvpBurst: "pastelPetals", pageBg: "#FFF9F9", thread: "vine",
    moments: { family: "pressed", gallery: "masonry", story: "wreath", countdown: "bud" },
  },
  "engagement-save-the-date": {
    sectionEnter: "wipe", heading: "inkType", divider: "hairline", pageBg: "#FBF7F3", thread: "ink",
    moments: { events: "stickyTimes", gallery: "strip", story: "split" },
  },
  "engagement-mangni": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#4A0A2A", thread: "gold",
    moments: { family: "deco", events: "spotlight", countdown: "flip" },
  },
  "anniversary-golden-jubilee": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#231A06", thread: "gold",
    moments: { family: "deco", events: "spotlight", countdown: "flip" },
  },
  "anniversary-vintage-reel": {
    sectionEnter: "wave", heading: "handwrite", divider: "wave", ambient: "pastelPetals", pageBg: "#FBF3E6", thread: "vine",
    moments: { gallery: "postcards", countdown: "bud" },
  },
  "anniversary-wine-roses": {
    sectionEnter: "bloom", heading: "handwrite", divider: "vine", ambient: "pastelPetals", rsvpBurst: "pastelPetals", pageBg: "#FFF6F4", thread: "vine",
    moments: { family: "pressed", gallery: "masonry", story: "wreath", countdown: "bud" },
  },
  "anniversary-silver-jubilee": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#1C2230", thread: "gold",
    moments: { family: "deco", events: "spotlight", countdown: "flip" },
  },
  "anniversary-shashtiabdapoorthi": {
    sectionEnter: "tier", heading: "goldSweep", divider: "kolamLine", ambient: "marigold", pageBg: "#0E2A17", thread: "gold",
    moments: { family: "doors", countdown: "flip" },
  },
  "valentine-love-letter": {
    sectionEnter: "bloom", heading: "handwrite", divider: "vine", ambient: "pastelPetals", rsvpBurst: "pastelPetals", pageBg: "#FFFBF5", thread: "vine",
    moments: { family: "pressed", gallery: "masonry", story: "wreath", countdown: "bud" },
  },
  "valentine-neon-hearts": {
    sectionEnter: "rise", heading: "letters", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#0D0718", thread: "silver",
    moments: { events: "stickyTimes", gallery: "strip", countdown: "splitFlap" },
  },
  "valentine-cupid-clouds": {
    sectionEnter: "wave", heading: "handwrite", divider: "wave", ambient: "pastelPetals", pageBg: "#FFF8FC", thread: "vine",
    moments: { gallery: "postcards", countdown: "bud" },
  },
  "valentine-polaroid": {
    sectionEnter: "bloom", heading: "letters", divider: "none", ambient: "bubbles", rsvpBurst: "glitter", pageBg: "#FFF7F0", thread: null,
    moments: { gallery: "masonry", story: "pin", countdown: "tags" },
  },
  "valentine-red-roses": {
    sectionEnter: "bloom", heading: "handwrite", divider: "vine", ambient: "pastelPetals", rsvpBurst: "pastelPetals", pageBg: "#FFF7F8", thread: "vine",
    moments: { family: "pressed", gallery: "masonry", story: "wreath", countdown: "bud" },
  },
  "proposal-starry-night": {
    sectionEnter: "rise", heading: "letters", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#0E0A24", thread: "silver",
    moments: { events: "stickyTimes", gallery: "strip", countdown: "splitFlap" },
  },
  "proposal-candlelight": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#22060C", thread: "gold",
    moments: { family: "deco", events: "spotlight", countdown: "flip" },
  },
  "proposal-will-you": {
    sectionEnter: "bloom", heading: "handwrite", divider: "vine", ambient: "pastelPetals", rsvpBurst: "pastelPetals", pageBg: "#FBFCFF", thread: "vine",
    moments: { family: "pressed", gallery: "masonry", story: "wreath", countdown: "bud" },
  },
  "proposal-beach-sunset": {
    sectionEnter: "wave", heading: "handwrite", divider: "wave", ambient: "pastelPetals", pageBg: "#FFF7F0", thread: "vine",
    moments: { gallery: "postcards", countdown: "bud" },
  },
  "proposal-rose-gold-ring": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#3A2226", thread: "gold",
    moments: { family: "deco", events: "spotlight", countdown: "flip" },
  },
  "birthday-balloon-party": {
    sectionEnter: "bloom", heading: "letters", divider: "none", ambient: "bubbles", rsvpBurst: "glitter", pageBg: "#FFFDF7", thread: null,
    moments: { gallery: "masonry", story: "pin", countdown: "tags" },
  },
  "birthday-neon-night": {
    sectionEnter: "rise", heading: "letters", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#07081A", thread: "silver",
    moments: { events: "stickyTimes", gallery: "strip", countdown: "splitFlap" },
  },
  "birthday-kids-fiesta": {
    sectionEnter: "bloom", heading: "letters", divider: "none", ambient: "bubbles", rsvpBurst: "glitter", pageBg: "#FFFDF5", thread: null,
    moments: { gallery: "masonry", story: "pin", countdown: "tags" },
  },
  "birthday-golden-milestone": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#0F0D0A", thread: "gold",
    moments: { family: "deco", events: "spotlight", countdown: "flip" },
  },
  "birthday-cake-candles": {
    sectionEnter: "bloom", heading: "letters", divider: "none", ambient: "bubbles", rsvpBurst: "glitter", pageBg: "#FFF9FC", thread: null,
    moments: { gallery: "masonry", story: "pin", countdown: "tags" },
  },
  "housewarming-griha-pravesam": {
    sectionEnter: "tier", heading: "goldSweep", divider: "kolamLine", ambient: "marigold", pageBg: "#4A1A0C", thread: "gold",
    moments: { family: "doors", countdown: "flip" },
  },
  "housewarming-new-keys": {
    sectionEnter: "wipe", heading: "inkType", divider: "hairline", pageBg: "#FAFAF7", thread: "ink",
    moments: { events: "stickyTimes", gallery: "strip", story: "split" },
  },
  "housewarming-boho-nest": {
    sectionEnter: "wave", heading: "handwrite", divider: "wave", ambient: "pastelPetals", pageBg: "#FBF6EE", thread: "vine",
    moments: { gallery: "postcards", countdown: "bud" },
  },
  "housewarming-green-home": {
    sectionEnter: "wave", heading: "handwrite", divider: "wave", ambient: "pastelPetals", pageBg: "#FAFDF7", thread: "vine",
    moments: { gallery: "postcards", countdown: "bud" },
  },
  "housewarming-vastu-lamp": {
    sectionEnter: "tier", heading: "goldSweep", divider: "kolamLine", ambient: "marigold", pageBg: "#3A1A08", thread: "gold",
    moments: { family: "doors", countdown: "flip" },
  },
  "baby-twinkle-star": {
    sectionEnter: "wave", heading: "handwrite", divider: "wave", ambient: "pastelPetals", pageBg: "#F7FAFF", thread: "vine",
    moments: { gallery: "postcards", countdown: "bud" },
  },
  "baby-valaikaappu": {
    sectionEnter: "tier", heading: "goldSweep", divider: "kolamLine", ambient: "marigold", pageBg: "#4A0A2A", thread: "gold",
    moments: { family: "doors", countdown: "flip" },
  },
  "baby-teddy-hug": {
    sectionEnter: "bloom", heading: "letters", divider: "none", ambient: "bubbles", rsvpBurst: "glitter", pageBg: "#FFFCF7", thread: null,
    moments: { gallery: "masonry", story: "pin", countdown: "tags" },
  },
  "baby-naming-lotus": {
    sectionEnter: "wave", heading: "handwrite", divider: "wave", ambient: "pastelPetals", pageBg: "#FFFAF6", thread: "vine",
    moments: { gallery: "postcards", countdown: "bud" },
  },
  "baby-shower-balloons": {
    sectionEnter: "bloom", heading: "letters", divider: "none", ambient: "bubbles", rsvpBurst: "glitter", pageBg: "#FFFDFA", thread: null,
    moments: { gallery: "masonry", story: "pin", countdown: "tags" },
  },
  "corporate-gala-night": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#0A1224", thread: "gold",
    moments: { family: "deco", events: "spotlight", countdown: "flip" },
  },
  "corporate-tech-launch": {
    sectionEnter: "wipe", heading: "inkType", divider: "hairline", pageBg: "#070B1A", thread: "silver",
    moments: { events: "stickyTimes", gallery: "strip", story: "split" },
  },
  "corporate-conference": {
    sectionEnter: "wipe", heading: "inkType", divider: "hairline", pageBg: "#F8FAFF", thread: "ink",
    moments: { events: "stickyTimes", gallery: "strip", story: "split" },
  },
  "corporate-awards-night": {
    sectionEnter: "iris", heading: "goldSweep", divider: "none", ambient: "glitter", rsvpBurst: "glitter", pageBg: "#0E0C08", thread: "gold",
    moments: { family: "deco", events: "spotlight", countdown: "flip" },
  },
  "corporate-offsite": {
    sectionEnter: "wave", heading: "handwrite", divider: "wave", ambient: "pastelPetals", pageBg: "#FAFCF7", thread: "vine",
    moments: { gallery: "postcards", countdown: "bud" },
  },
  // ── Classic royal-palace layout ──
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
  // "Silk Curtain": a stage wedding — curtains, footlights, gold dust.
  "grand-reception": {
    sectionEnter: "iris",
    heading: "goldSweep",
    divider: "hairline",
    ambient: "glitter",
    rsvpBurst: "glitter",
    pageBg: "#1C0B1E",
    thread: "gold",
    moments: { family: "deco", events: "spotlight", gallery: "strip", countdown: "splitFlap", grain: true },
  },
  "silk-curtain": {
    sectionEnter: "tier",
    heading: "goldSweep",
    divider: "hairline",
    ambient: "glitter",
    rsvpBurst: "glitter",
    pageBg: "#3B0A12",
    thread: "gold",
    moments: { family: "doors", events: "spotlight", gallery: "arch", countdown: "flip" },
  },
  // "Scratch & Reveal": a keepsake card with rose-gold foil.
  "scratch-reveal": {
    sectionEnter: "iris",
    heading: "maskUp",
    divider: "hairline",
    ambient: "glitter",
    ambientAt: ["hero", "rsvp"],
    rsvpBurst: "pastelPetals",
    pageBg: "#FBF8FF",
    thread: "silver",
    moments: { gallery: "masonry", story: "pin", countdown: "splitFlap" },
  },
  // "Lantern Night": Karthigai Deepam — lamps and rising lanterns.
  "lantern-night": {
    sectionEnter: "rise",
    heading: "goldSweep",
    divider: "none",
    ambient: "embers",
    ambientAt: ["hero", "rsvp", "thanks"],
    rsvpBurst: "marigold",
    pageBg: "#0E1733",
    thread: "gold",
    moments: { events: "diyas", countdown: "flip" },
  },
  // "Thoranam & Jasmine": a Tamil wedding doorway.
  "thoranam-jasmine": {
    sectionEnter: "tier",
    heading: "goldSweep",
    divider: "kolamLine",
    ambient: "jasmine",
    rsvpBurst: "marigold",
    pageBg: "#1F3B24",
    thread: "vine",
    moments: { family: "doors", events: "diyas", gallery: "arch", mandalaLayer: true },
  },
  // "Garden Glasshouse": its own layout (components/invite/garden) — a
  // morning garden; butterflies over the hero, petals when a guest says yes.
  "botanical-garden": {
    sectionEnter: "rise",
    heading: "maskUp",
    headingWobble: true,
    divider: "none",
    ambient: "butterflies",
    ambientAt: ["hero", "rsvp"],
    rsvpBurst: "pastelPetals",
    pageBg: "#F7F2E4",
    thread: null,
  },
  // "Kasavu & Nilavilakku": a Kerala temple wedding.
  "kerala-kasavu": {
    sectionEnter: "rise",
    heading: "goldSweep",
    divider: "hairline",
    ambient: "embers",
    rsvpBurst: "marigold",
    pageBg: "#3A2A12",
    thread: "gold",
    moments: { family: "doors", events: "diyas", countdown: "flip", warmPhotos: true },
  },
  // "Pookalam": an Onam flower carpet blooming ring by ring.
  pookalam: {
    sectionEnter: "bloom",
    heading: "maskUp",
    headingWobble: true,
    divider: "vine",
    ambient: "marigold",
    rsvpBurst: "marigold",
    pageBg: "#5A1414",
    thread: "vine",
    moments: { family: "pressed", gallery: "masonry", story: "wreath", countdown: "bud", mandalaLayer: true },
  },
};

export function getMotionTheme(templateId: string): MotionTheme {
  return THEMES[templateId] ?? BASE;
}
