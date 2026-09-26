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
