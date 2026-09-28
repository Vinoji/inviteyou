import "server-only";

/**
 * Fonts for the share-preview image (next/og). Its built-in font is
 * Latin-only, so Tamil names would render as empty boxes in the WhatsApp
 * preview. Each family is fetched from Google Fonts subset to exactly the
 * characters used (`text=`), which returns a small TTF that Satori reads.
 * Any failure just drops that font — the image still renders.
 */
type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 600 | 700; style: "normal" };

async function loadGoogleFont(family: string, weight: 400 | 600 | 700, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } })).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`no ttf for ${family}`);
  const res = await fetch(src, { next: { revalidate: 60 * 60 * 24 * 7 } });
  if (!res.ok) throw new Error(`font ${res.status}`);
  return res.arrayBuffer();
}

/** Serif display + Tamil fonts covering `text`, under the names "Display" and "Tamil". */
export async function ogFonts(text: string): Promise<OgFont[]> {
  const chars = Array.from(new Set(text)).join("");
  const wanted: [string, string, 400 | 600 | 700][] = [
    ["Display", "Playfair Display", 600],
    ["Display", "Playfair Display", 400],
  ];
  if (/[஀-௿]/.test(text)) wanted.push(["Tamil", "Noto Serif Tamil", 600]);
  const settled = await Promise.allSettled(
    wanted.map(async ([name, family, weight]) => ({
      name,
      data: await loadGoogleFont(family, weight, chars),
      weight,
      style: "normal" as const,
    }))
  );
  return settled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
}

/**
 * Satori (the renderer behind next/og) draws text in logical order with no
 * Indic shaping, so Tamil vowel signs that sit *before* their consonant
 * (ெ ே ை) or around it (ொ ோ ௌ) land in the wrong place. This rewrites a
 * string into visual order for the preview image only: pre-base signs move
 * in front of their consonant (or conjunct with ஷ/ஸ் ligature), and the
 * two-part signs split into their before/after pieces.
 */
export function tamilVisualOrder(text: string): string {
  const PRE: Record<string, [string, string]> = {
    "ெ": ["ெ", ""], // ெ
    "ே": ["ே", ""], // ே
    "ை": ["ை", ""], // ை
    "ொ": ["ெ", "ா"], // ொ = ெ + ா
    "ோ": ["ே", "ா"], // ோ = ே + ா
    "ௌ": ["ெ", "ௗ"], // ௌ = ெ + ௗ
  };
  const isConsonant = (c: string) => c >= "க" && c <= "ஹ";
  const chars = Array.from(text);
  const out: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    // க்ஷ (ksha) is one visual cluster: consonant + pulli + ஷ.
    const cluster =
      isConsonant(c) && chars[i + 1] === "்" && chars[i + 2] === "ஷ"
        ? c + chars[i + 1] + chars[i + 2]
        : isConsonant(c)
          ? c
          : null;
    if (cluster) {
      const next = chars[i + Array.from(cluster).length];
      if (next && PRE[next]) {
        const [before, after] = PRE[next];
        out.push(before, cluster, after);
        i += Array.from(cluster).length;
        continue;
      }
    }
    out.push(c);
  }
  return out.join("");
}
