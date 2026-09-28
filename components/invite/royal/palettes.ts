import type { CSSProperties } from "react";

/**
 * Colour roles for the royal-palace wedding layout. Every wedding template
 * shares the same layout (palace doors, toran, mandapam, arches) and only
 * swaps this palette, so each keeps its own identity — gold on granite,
 * ink on paper, peony on cream, silver on onyx, sand and sunset on sea.
 * The user's accentColor is layered on top for names and badges.
 */
export interface RoyalPalette {
  /** Darkest band colour (dark sections, door base). */
  deep: string;
  /** Slightly lighter dark (alternating dark sections, date blocks). */
  mid: string;
  /** Metallic trim. */
  gold: string;
  goldLight: string;
  goldDeep: string;
  /** Light page background and its darker tint. */
  ivory: string;
  ivory2: string;
  text: string;
  muted: string;
  /** Toran garland / petal shower colours, and its leaves. */
  flowers: [string, string, string];
  leaf: string;
  leafLight: string;
}

const PALETTES: Record<string, RoyalPalette> = {
  // Temple courtyard: granite, temple gold, brass, jasmine, banana leaf.
  "traditional-gold": {
    deep: "#1E1A17",
    mid: "#2B2420",
    gold: "#C8962E",
    goldLight: "#E3B45A",
    goldDeep: "#8C6420",
    ivory: "#FFF8EC",
    ivory2: "#F1E4C8",
    text: "#2B2418",
    muted: "#6E6250",
    flowers: ["#e8862a", "#f6c24a", "#FFF8EC"],
    leaf: "#3E6B2F",
    leafLight: "#4F8A3C",
  },
  // Swiss/architect: paper, ink, graphite; the couple's accent is the only colour.
  "minimal-modern": {
    deep: "#111111",
    mid: "#1F1F1F",
    gold: "#6B6B6B",
    goldLight: "#D9D9D4",
    goldDeep: "#111111",
    ivory: "#FAFAF7",
    ivory2: "#ECECE7",
    text: "#111111",
    muted: "#6B6B6B",
    flowers: ["#111111", "#6B6B6B", "#D9D9D4"],
    leaf: "#6B6B6B",
    leafLight: "#8A8A8A",
  },
  // Spring garden: blush, peony, sage, butter, lavender on cream.
  "floral-pastel": {
    deep: "#5E4550",
    mid: "#7A5A66",
    gold: "#E79AA8",
    goldLight: "#F6D6D6",
    goldDeep: "#B96A7C",
    ivory: "#FFFBF5",
    ivory2: "#F6E6E2",
    text: "#4A3B3F",
    muted: "#7D6A6E",
    flowers: ["#E79AA8", "#F6D6D6", "#F7E7B4"],
    leaf: "#7E9C76",
    leafLight: "#A8BFA0",
  },
  // Black tie: onyx, charcoal, silver foil, ivory — monochrome only.
  "elegant-bw": {
    deep: "#0B0B0C",
    mid: "#1C1C1F",
    gold: "#C9CCD1",
    goldLight: "#F2F3F5",
    goldDeep: "#8A8C91",
    ivory: "#F5F2EA",
    ivory2: "#E6E2D8",
    text: "#141414",
    muted: "#5E6064",
    flowers: ["#F2F3F5", "#C9CCD1", "#FFFFFF"],
    leaf: "#3D3D3D",
    leafLight: "#555555",
  },
  // Beach at golden hour: sand, driftwood, turquoise, coral, sunset gold.
  "beach-boho": {
    deep: "#1D6E7A",
    mid: "#25838F",
    gold: "#F2B45A",
    goldLight: "#FBDDA6",
    goldDeep: "#9C7C5B",
    ivory: "#FFF9F0",
    ivory2: "#EAD7B7",
    text: "#33271B",
    muted: "#75644F",
    flowers: ["#E9806E", "#F2B45A", "#FFF9F0"],
    leaf: "#2F6B5A",
    leafLight: "#3FB8AF",
  },
  // Stage curtains: maroon silk, antique gold fringe, warm footlights.
  "silk-curtain": {
    deep: "#3B0A12",
    mid: "#551422",
    gold: "#C9A54A",
    goldLight: "#EBD08A",
    goldDeep: "#8C6A22",
    ivory: "#FFF6EA",
    ivory2: "#F2DFC4",
    text: "#2E1A12",
    muted: "#6E5546",
    flowers: ["#B3122E", "#EBD08A", "#FFF6EA"],
    leaf: "#2F5D3A",
    leafLight: "#467E50",
  },
  // Grand reception: plum velvet stage, marquee gold, a hint of rose.
  "grand-reception": {
    deep: "#1C0B1E",
    mid: "#2E1230",
    gold: "#E8A33D",
    goldLight: "#FFD66B",
    goldDeep: "#9A6418",
    ivory: "#FFF6EC",
    ivory2: "#F3DFD0",
    text: "#2A1424",
    muted: "#6E5360",
    flowers: ["#FF6B8B", "#FFD66B", "#FFF6EC"],
    leaf: "#2F5D3A",
    leafLight: "#467E50",
  },
  // Keepsake card: lilac, rose-gold foil, soft lavender.
  "scratch-reveal": {
    deep: "#3E3358",
    mid: "#524574",
    gold: "#D8A7B1",
    goldLight: "#F3D9DE",
    goldDeep: "#A56C7C",
    ivory: "#FBF8FF",
    ivory2: "#ECE6F7",
    text: "#2F2940",
    muted: "#6E6784",
    flowers: ["#C9B6E4", "#F3D9DE", "#FBF8FF"],
    leaf: "#7C8F7A",
    leafLight: "#A2B39F",
  },
  // Karthigai Deepam night: midnight blue, saffron flame, lamp glow.
  "lantern-night": {
    deep: "#0E1733",
    mid: "#17234A",
    gold: "#F2A33A",
    goldLight: "#FFD48A",
    goldDeep: "#B86A12",
    ivory: "#FFF8EE",
    ivory2: "#F4E3C6",
    text: "#231A10",
    muted: "#6B5A44",
    flowers: ["#FF9933", "#FFD48A", "#FFF8EE"],
    leaf: "#2E5E3E",
    leafLight: "#3F7F52",
  },
  // Tamil doorway: mango-leaf thoranam, malli (jasmine), marigold, banana leaf.
  "thoranam-jasmine": {
    deep: "#1F3B24",
    mid: "#2A4D30",
    gold: "#E0A526",
    goldLight: "#F6CD6B",
    goldDeep: "#A8741A",
    ivory: "#FFFDF4",
    ivory2: "#F1EAD2",
    text: "#23301E",
    muted: "#5F6B52",
    flowers: ["#FFFFFF", "#F6CD6B", "#E8862A"],
    leaf: "#3E7A2F",
    leafLight: "#5FA043",
  },
  // Kerala: kasavu cream and gold zari, brass nilavilakku, sandalwood.
  "kerala-kasavu": {
    deep: "#3A2A12",
    mid: "#4E3918",
    gold: "#D4AF37",
    goldLight: "#EED98C",
    goldDeep: "#9C7A1E",
    ivory: "#FFFBEF",
    ivory2: "#F5ECD2",
    text: "#2E2415",
    muted: "#6D6049",
    flowers: ["#FFFFFF", "#EED98C", "#E8862A"],
    leaf: "#2F6B3A",
    leafLight: "#46924F",
  },
  // Onam pookalam: marigold, chethi red, thumba white, leaf green.
  pookalam: {
    deep: "#5A1414",
    mid: "#741C1C",
    gold: "#F2A900",
    goldLight: "#FFD35C",
    goldDeep: "#B87700",
    ivory: "#FFF9EC",
    ivory2: "#F7E6C4",
    text: "#2F1B10",
    muted: "#6F5543",
    flowers: ["#E8862A", "#FFD35C", "#C8102E"],
    leaf: "#2E7D32",
    leafLight: "#4CAF50",
  },
};

export function getRoyalPalette(templateId: string): RoyalPalette {
  return PALETTES[templateId] ?? PALETTES["traditional-gold"];
}

/** The palette + accent as CSS custom properties, consumed by royal.module.css. */
export function royalCssVars(p: RoyalPalette, accentColor: string): CSSProperties {
  return {
    "--rp-deep": p.deep,
    "--rp-mid": p.mid,
    "--rp-gold": p.gold,
    "--rp-gold-light": p.goldLight,
    "--rp-gold-deep": p.goldDeep,
    "--rp-ivory": p.ivory,
    "--rp-ivory-2": p.ivory2,
    "--rp-text": p.text,
    "--rp-muted": p.muted,
    "--rp-accent": accentColor,
  } as CSSProperties;
}
