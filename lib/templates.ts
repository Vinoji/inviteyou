import type { CategoryId } from "./categories";

export interface TemplateMeta {
  id: string;
  name: string;
  category: CategoryId;
  tagline: string;
  description: string;
  defaultAccent: string;
  defaultFont: string;
  /** Tailwind gradient stops used for the landing page preview card. */
  cardGradient: string;
  cardTextClass: string;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "traditional-gold",
    name: "Traditional Gold",
    category: "wedding",
    tagline: "Temple motifs & rich maroon",
    description:
      "Ornamental borders, deep maroon and gold — classic South Asian wedding elegance.",
    defaultAccent: "#b8860b",
    defaultFont: "royal-cinzel",
    cardGradient: "from-amber-200 via-yellow-100 to-red-100",
    cardTextClass: "text-amber-900",
  },
  {
    id: "minimal-modern",
    name: "Minimal Modern",
    category: "wedding",
    tagline: "Clean lines, editorial calm",
    description:
      "Generous whitespace and crisp typography for a contemporary, understated invite.",
    defaultAccent: "#18181b",
    defaultFont: "modern-clean",
    cardGradient: "from-neutral-200 via-white to-neutral-100",
    cardTextClass: "text-neutral-900",
  },
  {
    id: "floral-pastel",
    name: "Floral Pastel",
    category: "wedding",
    tagline: "Blush, sage & botanicals",
    description:
      "Soft blush and sage tones with delicate floral accents for a romantic garden feel.",
    defaultAccent: "#d9738a",
    defaultFont: "classic-serif",
    cardGradient: "from-rose-100 via-pink-50 to-emerald-50",
    cardTextClass: "text-rose-900",
  },
  {
    id: "elegant-bw",
    name: "Elegant Black & White",
    category: "wedding",
    tagline: "High-contrast monochrome",
    description:
      "Fine hairline rules and dramatic contrast for a timeless, editorial black & white look.",
    defaultAccent: "#111111",
    defaultFont: "elegant-script",
    cardGradient: "from-neutral-900 via-neutral-600 to-neutral-200",
    cardTextClass: "text-white",
  },
  {
    id: "beach-boho",
    name: "Beach Boho",
    category: "wedding",
    tagline: "Terracotta & ivory warmth",
    description:
      "Warm terracotta, sand and teal for a relaxed destination or beachside celebration.",
    defaultAccent: "#c2703d",
    defaultFont: "classic-serif",
    cardGradient: "from-orange-100 via-amber-50 to-teal-50",
    cardTextClass: "text-orange-900",
  },
  {
    id: "anniversary-emerald",
    name: "Emerald Anniversary",
    category: "anniversary",
    tagline: "Deep emerald & gold",
    description:
      "Rich emerald and gold for celebrating another year of a lasting love.",
    defaultAccent: "#0f6e4f",
    defaultFont: "royal-cinzel",
    cardGradient: "from-emerald-200 via-emerald-50 to-yellow-100",
    cardTextClass: "text-emerald-900",
  },
  {
    id: "valentine-blush",
    name: "Blush Valentine",
    category: "valentine",
    tagline: "Red, blush & romance",
    description:
      "Warm reds and soft blush for a sweet, romantic Valentine's Day note.",
    defaultAccent: "#c2185b",
    defaultFont: "elegant-script",
    cardGradient: "from-rose-300 via-rose-100 to-red-100",
    cardTextClass: "text-rose-900",
  },
  {
    id: "proposal-starlit",
    name: "Starlit Proposal",
    category: "proposal",
    tagline: "Midnight blue & stars",
    description:
      "A midnight-blue, starlit scene for announcing the moment someone said yes.",
    defaultAccent: "#c9a227",
    defaultFont: "elegant-script",
    cardGradient: "from-indigo-300 via-indigo-100 to-amber-100",
    cardTextClass: "text-indigo-900",
  },
  {
    id: "birthday-confetti",
    name: "Confetti Birthday",
    category: "birthday",
    tagline: "Bright, playful & fun",
    description:
      "Bold color and confetti for a birthday party invite that isn't shy about it.",
    defaultAccent: "#e0409a",
    defaultFont: "modern-clean",
    cardGradient: "from-fuchsia-200 via-yellow-100 to-sky-100",
    cardTextClass: "text-fuchsia-900",
  },
  {
    id: "housewarming-terracotta",
    name: "Terracotta House Warming",
    category: "housewarming",
    tagline: "Warm clay & greenery",
    description:
      "Earthy terracotta and greenery for welcoming friends to your new home.",
    defaultAccent: "#b5622a",
    defaultFont: "classic-serif",
    cardGradient: "from-orange-200 via-amber-100 to-lime-100",
    cardTextClass: "text-orange-900",
  },
];

export function getTemplate(id: string): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
