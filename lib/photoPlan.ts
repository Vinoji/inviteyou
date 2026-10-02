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
