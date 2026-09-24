import type { CategoryId } from "./categories";

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
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "traditional-gold",
    category: "wedding",
    defaultAccent: "#b8860b",
    defaultFont: "royal-cinzel",
    cardGradient: "from-amber-200 via-yellow-100 to-red-100",
    cardTextClass: "text-amber-900",
  },
  {
    id: "minimal-modern",
    category: "wedding",
    defaultAccent: "#18181b",
    defaultFont: "modern-clean",
    cardGradient: "from-neutral-200 via-white to-neutral-100",
    cardTextClass: "text-neutral-900",
  },
  {
    id: "floral-pastel",
    category: "wedding",
    defaultAccent: "#d9738a",
    defaultFont: "classic-serif",
    cardGradient: "from-rose-100 via-pink-50 to-emerald-50",
    cardTextClass: "text-rose-900",
  },
  {
    id: "elegant-bw",
    category: "wedding",
    defaultAccent: "#111111",
    defaultFont: "elegant-script",
    cardGradient: "from-neutral-900 via-neutral-600 to-neutral-200",
    cardTextClass: "text-white",
  },
  {
    id: "beach-boho",
    category: "wedding",
    defaultAccent: "#c2703d",
    defaultFont: "classic-serif",
    cardGradient: "from-orange-100 via-amber-50 to-teal-50",
    cardTextClass: "text-orange-900",
  },
  {
    id: "anniversary-emerald",
    category: "anniversary",
    defaultAccent: "#0f6e4f",
    defaultFont: "royal-cinzel",
    cardGradient: "from-emerald-200 via-emerald-50 to-yellow-100",
    cardTextClass: "text-emerald-900",
  },
  {
    id: "valentine-blush",
    category: "valentine",
    defaultAccent: "#c2185b",
    defaultFont: "elegant-script",
    cardGradient: "from-rose-300 via-rose-100 to-red-100",
    cardTextClass: "text-rose-900",
  },
  {
    id: "proposal-starlit",
    category: "proposal",
    defaultAccent: "#c9a227",
    defaultFont: "elegant-script",
    cardGradient: "from-indigo-300 via-indigo-100 to-amber-100",
    cardTextClass: "text-indigo-900",
  },
  {
    id: "birthday-confetti",
    category: "birthday",
    defaultAccent: "#e0409a",
    defaultFont: "modern-clean",
    cardGradient: "from-fuchsia-200 via-yellow-100 to-sky-100",
    cardTextClass: "text-fuchsia-900",
  },
  {
    id: "housewarming-terracotta",
    category: "housewarming",
    defaultAccent: "#b5622a",
    defaultFont: "classic-serif",
    cardGradient: "from-orange-200 via-amber-100 to-lime-100",
    cardTextClass: "text-orange-900",
  },
];

export function getTemplateConfig(id: string): TemplateConfig {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
