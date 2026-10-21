import { getTemplateConfig } from "./templates";

/**
 * Where each uploaded photo appears, per design — so the editor can label
 * every photo ("Top of the page", "Beside your story", "Gallery") and
 * suggest the shape that fits. Must follow the routing in
 * components/invite/InvitationView.tsx and each layout's use of data.photos.
 */
export type PhotoRole = "hero" | "magazineCover" | "story" | "letter" | "feature" | "gallery";
export type PhotoShape = "original" | "square" | "portrait" | "landscape";

export const MAX_PHOTOS = 6;

/** How many photos this design takes: MAX_PHOTOS, or more for photo-led
 * designs (TemplateConfig.maxPhotos). */
export function maxPhotosFor(templateId: string): number {
  return getTemplateConfig(templateId).maxPhotos ?? MAX_PHOTOS;
}

interface Plan {
  /** Roles of the first photos, in order; every later photo is "gallery". */
  lead: PhotoRole[];
}

const PREMIUM: Record<string, Plan> = {
  "temple-gopuram": { lead: ["letter"] },
  "luxe-editorial": { lead: ["magazineCover", "feature"] },
  "birthday-balloon-party": { lead: ["story"] },
  "baby-shower-balloons": { lead: ["story"] },
  "anniversary-wine-roses": { lead: [] },
  "living-temple": { lead: [] },
  // The first photo is the cover of the album; the rest fill the album.
  "photo-story": { lead: ["hero"] },
  "temple-photo-story": { lead: ["hero"] },
  "pearl-curtain": { lead: [] },
  "lilac-seal": { lead: [] },
  "pastel-palace": { lead: [] },
  "madurai-meenakshi": { lead: [] },
  "cinematic-film": { lead: [] },
  "letterpress-ivory": { lead: [] },
  "art-deco-noir": { lead: [] },
  "kolam-pathirikai": { lead: [] },
  "paisley-silk-vivah": { lead: [] },
  "jaali-velvet-nikah": { lead: [] },
  "kerala-christian-kasavu": { lead: [] },
  "blush-lace": { lead: [] },
  "lilac-seal-proposal": { lead: [] },
  "cinematic-film-proposal": { lead: [] },
  "lilac-seal-valentine": { lead: [] },
  "pastel-palace-valentine": { lead: [] },
  "cinematic-film-housewarming": { lead: [] },
  "house-blessing-card": { lead: [] },
  "corporate-formal-card": { lead: [] },
  "milestone-birthday-card": { lead: [] },
  "nichayathartham-pathirikai": { lead: [] },
  "meenakshi-nichayathartham": { lead: [] },
  "lilac-seal-engagement": { lead: [] },
  "griha-pravesam-pathirikai": { lead: [] },
  "namakaranam-card": { lead: [] },
  "valaikaappu-card": { lead: [] },
  "pastel-palace-baby-shower": { lead: [] },
  "shashtiabdapoorthi-card": { lead: [] },
  "lilac-seal-anniversary": { lead: [] },
  "cinematic-film-anniversary": { lead: [] },
  "first-birthday-card": { lead: [] },
  "pastel-palace-birthday": { lead: [] },
  "cinematic-film-birthday": { lead: [] },
  "cinematic-film-launch": { lead: [] },
  "kalyanam-rituals": { lead: [] },
  "kerala-sadya": { lead: [] },
  "manjal-pathirikai": { lead: [] },
  "maroon-pathirikai": { lead: [] },
  "kerala-sumuhurtham": { lead: [] },
  "emerald-nikah": { lead: [] },
  "ivory-nikah": { lead: [] },
  "ivory-holy-matrimony": { lead: [] },
  "royal-blue-matrimony": { lead: [] },
  "anand-karaj-ivory": { lead: [] },
  "phulkari-anand-karaj": { lead: [] },
  "jain-namokar-maroon": { lead: [] },
  "jain-kesar-ivory": { lead: [] },
};

const SHAPE: Record<PhotoRole, PhotoShape> = {
  hero: "portrait",
  magazineCover: "portrait",
  story: "portrait",
  letter: "portrait",
  feature: "landscape",
  gallery: "original",
};

function plan(templateId: string): Plan {
  if (PREMIUM[templateId]) return PREMIUM[templateId];
  const tpl = getTemplateConfig(templateId);
  // Garden, chapel and royal layouts put the first photo beside the story;
  // the classic section layout uses it as the full-screen hero.
  if (tpl.pageLayout || tpl.category === "wedding" || tpl.layout) return { lead: ["story"] };
  return { lead: ["hero"] };
}

export function photoRole(templateId: string, index: number): PhotoRole {
  return plan(templateId).lead[index] ?? "gallery";
}

/** The crop shape suggested for the photo at this position. */
export function photoShape(templateId: string, index: number): PhotoShape {
  // The round story photo of the baby-shower page.
  if (templateId === "baby-shower-balloons" && index === 0) return "square";
  return SHAPE[photoRole(templateId, index)];
}
