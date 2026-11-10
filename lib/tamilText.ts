import "server-only";
import { createHash } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { loadGoogleFont } from "./ogFonts";

/**
 * Tamil text for the card image. next/og (Satori) draws glyphs without
 * text shaping, so Tamil comes out broken — the pulli and the ு/ூ signs
 * float loose (கு as க ு). sharp draws text with Pango and HarfBuzz, which
 * shape it properly; each Tamil line is drawn as a transparent PNG and
 * placed on the card as an image. Latin text stays with Satori.
 */
export const hasTamil = (text: string) => /[஀-௿]/.test(text);

const WEIGHT_NAME = { 400: "", 600: " SemiBold", 700: " Bold" } as const;
const files = new Map<number, Promise<string>>();

/** Catamaran (the site's Tamil font) as a file, once per weight per server. */
function fontFile(weight: 400 | 600 | 700) {
  if (!files.has(weight)) {
    files.set(
      weight,
      (async () => {
        const path = join(tmpdir(), `catamaran-${weight}.ttf`);
        if (!existsSync(path)) writeFileSync(path, Buffer.from(await loadGoogleFont("Catamaran", weight)));
        return path;
      })().catch((err) => {
        files.delete(weight);
        throw err;
      })
    );
  }
  return files.get(weight)!;
}

const escapeMarkup = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface ShapedLine {
  src: string;
  width: number;
  height: number;
}

const cache = new Map<string, Promise<ShapedLine>>();

/**
 * One Tamil line (wrapped to `maxWidth`, centred) as a PNG data URL at
 * `size` pixels. Throws if it can't be drawn — callers fall back to text.
 */
export function shapeTamil(
  text: string,
  {
    size,
    color,
    weight = 400,
    maxWidth,
    align = "centre",
  }: { size: number; color: string; weight?: 400 | 600 | 700; maxWidth: number; align?: "left" | "centre" }
): Promise<ShapedLine> {
  const key = createHash("sha1").update(JSON.stringify([text, size, color, weight, maxWidth, align])).digest("hex");
  if (!cache.has(key)) {
    cache.set(
      key,
      (async () => {
        const fontfile = await fontFile(weight);
        const png = await sharp({
          text: {
            text: `<span foreground="${color}">${escapeMarkup(text)}</span>`,
            font: `Catamaran${WEIGHT_NAME[weight]} ${size}`,
            fontfile,
            rgba: true,
            dpi: 72,
            width: Math.round(maxWidth),
            align,
            wrap: "word",
          },
        })
          .png()
          .toBuffer();
        const meta = await sharp(png).metadata();
        return { src: `data:image/png;base64,${png.toString("base64")}`, width: meta.width ?? 0, height: meta.height ?? 0 };
      })().catch((err) => {
        cache.delete(key);
        throw err;
      })
    );
    // Keep the cache from growing without bound on a long-lived server.
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
  }
  return cache.get(key)!;
}
