export interface FontPairing {
  id: string;
  name: string;
  headingVar: string;
  bodyVar: string;
}

/**
 * Every pairing's font stack ends in this fallback chain instead of just the
 * one specific webfont. `--font-catamaran` is the one loaded font in this
 * app that actually has Tamil glyphs, so it comes first as a real-glyph
 * fallback (a Latin pairing missing a character a user types still renders
 * something legible instead of tofu boxes); after that, generic system
 * font keywords cover whatever script neither the pairing nor Catamaran
 * has, using whatever the visitor's OS already ships (Noto/system CJK,
 * Devanagari, Arabic, etc.) rather than us hardcoding a font per script.
 */
const FALLBACK_SERIF =
  "var(--font-catamaran), ui-serif, Georgia, \"Noto Serif\", serif";
const FALLBACK_SANS =
  "var(--font-catamaran), ui-sans-serif, system-ui, \"Noto Sans\", sans-serif";

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "classic-serif",
    name: "Classic Serif",
    headingVar: `var(--font-playfair), ${FALLBACK_SERIF}`,
    bodyVar: `var(--font-cormorant), ${FALLBACK_SERIF}`,
  },
  {
    id: "modern-clean",
    name: "Modern Clean",
    headingVar: `var(--font-poppins), ${FALLBACK_SANS}`,
    bodyVar: `var(--font-inter), ${FALLBACK_SANS}`,
  },
  {
    id: "elegant-script",
    name: "Elegant Script",
    headingVar: `var(--font-greatvibes), ${FALLBACK_SERIF}`,
    bodyVar: `var(--font-lato), ${FALLBACK_SANS}`,
  },
  {
    id: "royal-cinzel",
    name: "Royal Cinzel",
    headingVar: `var(--font-cinzel), ${FALLBACK_SERIF}`,
    bodyVar: `var(--font-ebgaramond), ${FALLBACK_SERIF}`,
  },
  {
    // Named in Tamil script itself so the picker shows off the actual
    // glyphs, not a Latin fallback rendering of an English label.
    id: "tamil-calligraphy",
    name: "தமிழ் எழில் (Tamil Calligraphy)",
    headingVar: `var(--font-kavivanar), ${FALLBACK_SANS}`,
    bodyVar: `var(--font-catamaran), ${FALLBACK_SANS}`,
  },
  {
    id: "tamil-classic",
    name: "தமிழ் பாரம்பரியம் (Tamil Classic)",
    headingVar: `var(--font-meera-inimai), ${FALLBACK_SANS}`,
    bodyVar: `var(--font-catamaran), ${FALLBACK_SANS}`,
  },
];

export function getFontPairing(id: string): FontPairing {
  return FONT_PAIRINGS.find((f) => f.id === id) ?? FONT_PAIRINGS[0];
}
