import type { CategoryId } from "./categories";

/** Which opening animation plays before the invitation — see
 * components/invite/intros/registry.ts. */
export type IntroId =
  | "door"
  | "envelope"
  | "kolam"
  | "split"
  | "bloom"
  | "giftbox"
  | "bottle"
  | "curtain"
  | "scratch"
  | "lanterns"
  | "thoranam"
  | "kasavu"
  | "pookalam"
  | "spotlight"
  | "ringbox"
  | "cradle"
  | "ticket"
  | "glasshouse";

/**
 * Non-text template config. Display text (name, tagline, description) lives
 * in messages/{locale}.json under `templates.<id>` — see
 * lib/i18n/templates.ts for the locale-aware accessor.
 */
export interface TemplateConfig {
  id: string;
  category: CategoryId;
  defaultAccent: string;
  defaultFont: string;
  /** Tailwind gradient stops used for the landing page preview card. */
  cardGradient: string;
  cardTextClass: string;
  intro: IntroId;
  /** Page layout. Wedding templates use the shared royal-palace layout
   * unless they name their own here. */
  layout?: "garden";
  /** Publishing price in ₹. Leave out to use the default (PRICE_INR in
   * lib/pricing.ts). */
  price?: number;
  /** "Was" price in ₹, shown struck through beside the price. Leave out to
   * use the default (LIST_PRICE_INR in lib/pricing.ts). */
  listPrice?: number;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "traditional-gold",
    category: "wedding",
    defaultAccent: "#b8860b",
    defaultFont: "royal-cinzel",
    cardGradient: "from-amber-200 via-yellow-100 to-red-100",
    cardTextClass: "text-amber-900",
    intro: "kolam",
  },
  {
    id: "botanical-garden",
    category: "wedding",
    defaultAccent: "#2F4A2C",
    defaultFont: "classic-serif",
    cardGradient: "from-emerald-100 via-lime-50 to-amber-50",
    cardTextClass: "text-emerald-950",
    intro: "glasshouse",
    layout: "garden",
  },
  {
    id: "minimal-modern",
    category: "wedding",
    defaultAccent: "#C2410C",
    defaultFont: "modern-clean",
    cardGradient: "from-neutral-200 via-white to-neutral-100",
    cardTextClass: "text-neutral-900",
    intro: "split",
  },
  {
    id: "floral-pastel",
    category: "wedding",
    defaultAccent: "#d9738a",
    defaultFont: "classic-serif",
    cardGradient: "from-rose-100 via-pink-50 to-emerald-50",
    cardTextClass: "text-rose-900",
    intro: "bloom",
  },
  {
    id: "elegant-bw",
    category: "wedding",
    defaultAccent: "#111111",
    defaultFont: "elegant-script",
    cardGradient: "from-neutral-900 via-neutral-600 to-neutral-200",
    cardTextClass: "text-white",
    intro: "giftbox",
  },
  {
    id: "beach-boho",
    category: "wedding",
    defaultAccent: "#c2703d",
    defaultFont: "classic-serif",
    cardGradient: "from-orange-100 via-amber-50 to-teal-50",
    cardTextClass: "text-orange-900",
    intro: "bottle",
  },
  {
    id: "silk-curtain",
    category: "wedding",
    defaultAccent: "#c9a54a",
    defaultFont: "royal-cinzel",
    cardGradient: "from-rose-900 via-red-800 to-amber-700",
    cardTextClass: "text-amber-100",
    intro: "curtain",
  },
  {
    id: "scratch-reveal",
    category: "wedding",
    defaultAccent: "#a56c7c",
    defaultFont: "classic-serif",
    cardGradient: "from-violet-200 via-fuchsia-100 to-rose-100",
    cardTextClass: "text-violet-900",
    intro: "scratch",
  },
  {
    id: "lantern-night",
    category: "wedding",
    defaultAccent: "#f2a33a",
    defaultFont: "classic-serif",
    cardGradient: "from-indigo-950 via-blue-900 to-orange-700",
    cardTextClass: "text-amber-100",
    intro: "lanterns",
  },
  {
    id: "thoranam-jasmine",
    category: "wedding",
    defaultAccent: "#e0a526",
    defaultFont: "tamil-classic",
    cardGradient: "from-green-800 via-lime-100 to-amber-100",
    cardTextClass: "text-green-950",
    intro: "thoranam",
  },
  {
    id: "kerala-kasavu",
    category: "wedding",
    defaultAccent: "#b8921f",
    defaultFont: "royal-cinzel",
    cardGradient: "from-amber-50 via-yellow-50 to-amber-200",
    cardTextClass: "text-amber-900",
    intro: "kasavu",
  },
  {
    id: "pookalam",
    category: "wedding",
    defaultAccent: "#e8862a",
    defaultFont: "classic-serif",
    cardGradient: "from-orange-300 via-yellow-200 to-red-300",
    cardTextClass: "text-red-950",
    intro: "pookalam",
  },
  {
    id: "grand-reception",
    category: "wedding",
    defaultAccent: "#e8a33d",
    defaultFont: "elegant-script",
    cardGradient: "from-fuchsia-950 via-purple-900 to-amber-700",
    cardTextClass: "text-amber-100",
    intro: "spotlight",
  },
  {
    id: "anniversary-emerald",
    category: "anniversary",
    defaultAccent: "#0f6e4f",
    defaultFont: "royal-cinzel",
    cardGradient: "from-emerald-200 via-emerald-50 to-yellow-100",
    cardTextClass: "text-emerald-900",
    intro: "envelope",
  },
  {
    id: "valentine-blush",
    category: "valentine",
    defaultAccent: "#c2185b",
    defaultFont: "elegant-script",
    cardGradient: "from-rose-300 via-rose-100 to-red-100",
    cardTextClass: "text-rose-900",
    intro: "envelope",
  },
  {
    id: "proposal-starlit",
    category: "proposal",
    defaultAccent: "#c9a227",
    defaultFont: "elegant-script",
    cardGradient: "from-indigo-300 via-indigo-100 to-amber-100",
    cardTextClass: "text-indigo-900",
    intro: "envelope",
  },
  {
    id: "birthday-confetti",
    category: "birthday",
    defaultAccent: "#e0409a",
    defaultFont: "modern-clean",
    cardGradient: "from-fuchsia-200 via-yellow-100 to-sky-100",
    cardTextClass: "text-fuchsia-900",
    intro: "envelope",
  },
  {
    id: "housewarming-terracotta",
    category: "housewarming",
    defaultAccent: "#b5622a",
    defaultFont: "classic-serif",
    cardGradient: "from-orange-200 via-amber-100 to-lime-100",
    cardTextClass: "text-orange-900",
    intro: "envelope",
  },
  {
    id: "engagement-ring",
    category: "engagement",
    defaultAccent: "#9c3b52",
    defaultFont: "elegant-script",
    cardGradient: "from-rose-200 via-pink-100 to-amber-100",
    cardTextClass: "text-rose-900",
    intro: "ringbox",
  },
  {
    id: "baby-moon",
    category: "baby",
    defaultAccent: "#8a6cc2",
    defaultFont: "classic-serif",
    cardGradient: "from-violet-200 via-pink-100 to-amber-100",
    cardTextClass: "text-violet-900",
    intro: "cradle",
  },
  {
    id: "corporate-ticket",
    category: "corporate",
    defaultAccent: "#2563eb",
    defaultFont: "modern-clean",
    cardGradient: "from-slate-900 via-blue-900 to-sky-700",
    cardTextClass: "text-sky-50",
    intro: "ticket",
    // TEMP: ₹1 for live-payment testing.
    // price: 1,
  },
];

export function getTemplateConfig(id: string): TemplateConfig {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
