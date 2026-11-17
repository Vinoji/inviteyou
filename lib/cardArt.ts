import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { SCENE_DESIGNS, artSrc } from "@/components/invite/premium/valaikappu/scenes";
import { SITE_URL } from "./seo";

/**
 * The pictures on a design's card image, like a printed invitation: a
 * figure at the head (the deity or emblem) and one at the foot (the
 * design's scene). Only designs with cut-out art have them; the others
 * keep the drawn ornaments.
 */
export interface CardArt {
  top?: string;
  bottom?: string;
  /** A ground texture for the paper. */
  paper: string;
}

const PAPER = "/art/materials/paper-grain-light.webp";
const PASTEL = { top: "/art/pastel-palace/wreath.webp", bottom: "/art/pastel-palace/swan.webp" };
const EXTRA: Record<string, { top?: string; bottom?: string }> = {
  "pastel-palace": PASTEL,
  "pastel-palace-birthday": PASTEL,
  "pastel-palace-baby-shower": PASTEL,
  "pastel-palace-valentine": PASTEL,
};

export function cardArtFor(templateId: string): CardArt {
  const scene = SCENE_DESIGNS[templateId];
  if (scene) {
    return { top: artSrc(scene, scene.intro.top), bottom: artSrc(scene, scene.screens[1].figures[0].src), paper: PAPER };
  }
  return { ...(EXTRA[templateId] ?? {}), paper: PAPER };
}

const cache = new Map<string, Promise<CardPicture | null>>();

/** A site image as a PNG data URI at most `max` px on its longer side (the
 * card renderer takes PNG/JPEG only). From disk where the files are, else
 * from the site itself (a serverless function may not carry public/). */
export interface CardPicture {
  src: string;
  width: number;
  height: number;
}

export function cardImage(src: string | undefined, max: number, format: "png" | "jpeg" = "png"): Promise<CardPicture | null> {
  if (!src) return Promise.resolve(null);
  const key = `${src}@${max}.${format}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = (async () => {
      let buf: Buffer | null = null;
      try {
        buf = await fs.readFile(path.join(process.cwd(), "public", src));
      } catch {
        try {
          const res = await fetch(`${SITE_URL}${src}`);
          if (res.ok) buf = Buffer.from(await res.arrayBuffer());
        } catch {
          // no picture — the card keeps its drawn ornaments
        }
      }
      if (!buf) return null;
      const img = sharp(buf).resize(max, max, { fit: "inside", withoutEnlargement: true });
      const { data, info } = await (format === "jpeg" ? img.jpeg({ quality: 78 }) : img.png({ compressionLevel: 8 })).toBuffer({ resolveWithObject: true });
      return { src: `data:image/${format};base64,${data.toString("base64")}`, width: info.width, height: info.height };
    })().catch(() => null);
    cache.set(key, hit);
  }
  return hit;
}
