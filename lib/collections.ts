import type { CategoryId } from "./categories";
import { TEMPLATES } from "./templates";

/**
 * Keyword landing pages for the traditions and functions people search
 * for — "Tamil wedding invitation", "nichayathartham invitation", "Nikah
 * invitation card"… Each is /invitations/<slug> (the same route as the
 * occasion pages), showing just the designs that fit, with its own copy
 * in messages `seoPages.<slug>` (label, metaTitle, metaDescription,
 * ogTitle, ogDescription, h1, intro, faq).
 */
export interface Collection {
  slug: string;
  /** The occasion it belongs to (breadcrumb, sample content). */
  category: CategoryId;
  /** Designs, in the order shown; retired or unknown ids are skipped. */
  templates: string[];
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "tamil-wedding-invitation",
    category: "wedding",
    templates: [
      "manjal-pathirikai",
      "kolam-pathirikai",
      "maroon-pathirikai",
      "kalyanam-rituals",
      "madurai-meenakshi",
      "temple-journey",
      "living-temple",
      "temple-photo-story",
      "temple-gopuram",
      "thoranam-jasmine",
      "lantern-night",
    ],
  },
  {
    slug: "kerala-wedding-invitation",
    category: "wedding",
    templates: ["kerala-sumuhurtham", "kerala-sadya", "kerala-christian-kasavu", "kerala-muslim-nikah", "kerala-kasavu", "pookalam"],
  },
  {
    slug: "nikah-invitation",
    category: "wedding",
    templates: ["emerald-nikah", "jaali-velvet-nikah", "ivory-nikah", "kerala-muslim-nikah", "nikah-emerald", "walima-moonlit"],
  },
  {
    slug: "christian-wedding-invitation",
    category: "wedding",
    templates: [
      "ivory-holy-matrimony",
      "royal-blue-matrimony",
      "kerala-christian-kasavu",
      "blush-lace",
      "pearl-curtain",
      "church-stained-glass",
      "christian-garden",
      "chapel-bells",
      "grand-cathedral-3d",
    ],
  },
  { slug: "anand-karaj-invitation", category: "wedding", templates: ["anand-karaj-ivory", "phulkari-anand-karaj"] },
  { slug: "jain-wedding-invitation", category: "wedding", templates: ["jain-namokar-maroon", "jain-kesar-ivory"] },
  {
    slug: "nichayathartham-invitation",
    category: "engagement",
    templates: ["nichayathartham-pathirikai", "meenakshi-nichayathartham", "engagement-thamboolam", "lilac-seal-engagement", "engagement-ring"],
  },
  {
    slug: "valaikappu-invitation",
    category: "baby",
    templates: ["valaikaappu-card", "baby-valaikaappu", "pastel-palace-baby-shower", "baby-shower-balloons", "namakaranam-card"],
  },
  {
    slug: "griha-pravesam-invitation",
    category: "housewarming",
    templates: [
      "griha-pravesam-pathirikai",
      "housewarming-griha-pravesam",
      "housewarming-vastu-lamp",
      "cinematic-film-housewarming",
      "house-blessing-card",
    ],
  },
  {
    slug: "shashtiabdapoorthi-invitation",
    category: "anniversary",
    templates: ["shashtiabdapoorthi-card", "anniversary-shashtiabdapoorthi", "anniversary-golden-jubilee"],
  },
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

/** The collection's designs that exist and aren't retired, in its order. */
export function collectionTemplateIds(c: Collection): string[] {
  const live = new Set(TEMPLATES.filter((t) => !t.hidden).map((t) => t.id));
  return c.templates.filter((id) => live.has(id));
}

/** The keyword pages that belong to an occasion (for its "see also" links). */
export function collectionsFor(category: CategoryId): Collection[] {
  return COLLECTIONS.filter((c) => c.category === category);
}
