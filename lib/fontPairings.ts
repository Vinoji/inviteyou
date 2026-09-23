export interface FontPairing {
  id: string;
  name: string;
  headingVar: string;
  bodyVar: string;
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "classic-serif",
    name: "Classic Serif",
    headingVar: "var(--font-playfair)",
    bodyVar: "var(--font-cormorant)",
  },
  {
    id: "modern-clean",
    name: "Modern Clean",
    headingVar: "var(--font-poppins)",
    bodyVar: "var(--font-inter)",
  },
  {
    id: "elegant-script",
    name: "Elegant Script",
    headingVar: "var(--font-greatvibes)",
    bodyVar: "var(--font-lato)",
  },
  {
    id: "royal-cinzel",
    name: "Royal Cinzel",
    headingVar: "var(--font-cinzel)",
    bodyVar: "var(--font-ebgaramond)",
  },
  {
    // Named in Tamil script itself so the picker shows off the actual
    // glyphs, not a Latin fallback rendering of an English label.
    id: "tamil-calligraphy",
    name: "தமிழ் எழில் (Tamil Calligraphy)",
    headingVar: "var(--font-kavivanar)",
    bodyVar: "var(--font-catamaran)",
  },
  {
    id: "tamil-classic",
    name: "தமிழ் பாரம்பரியம் (Tamil Classic)",
    headingVar: "var(--font-meera-inimai)",
    bodyVar: "var(--font-catamaran)",
  },
];

export function getFontPairing(id: string): FontPairing {
  return FONT_PAIRINGS.find((f) => f.id === id) ?? FONT_PAIRINGS[0];
}
