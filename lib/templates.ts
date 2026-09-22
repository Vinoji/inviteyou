export interface TemplateMeta {
  id: string;
  name: string;
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
    tagline: "Terracotta & ivory warmth",
    description:
      "Warm terracotta, sand and teal for a relaxed destination or beachside celebration.",
    defaultAccent: "#c2703d",
    defaultFont: "classic-serif",
    cardGradient: "from-orange-100 via-amber-50 to-teal-50",
    cardTextClass: "text-orange-900",
  },
];

export function getTemplate(id: string): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
