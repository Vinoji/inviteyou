/**
 * Printable / shareable invitation card look, per template: colours and a
 * 2D ornament drawn as SVG (rendered into the card image by
 * lib/cardImage.tsx). Every template has its own so the card matches the
 * invitation it came from — kolam for Traditional Gold, a silk valance for
 * Silk Curtain, sky lanterns for Lantern Night, and so on.
 */

export type CardMotif =
  | "kolam"
  | "minimal"
  | "floral"
  | "deco"
  | "waves"
  | "curtain"
  | "foil"
  | "lantern"
  | "thoranam"
  | "kasavu"
  | "pookalam"
  | "marquee"
  | "leaves"
  | "hearts"
  | "stars"
  | "confetti"
  | "terracotta"
  | "ring"
  | "moon"
  | "ticket";

export interface CardTheme {
  /** Full-bleed background around the card (CSS gradient). */
  bg: string;
  /** The card's own surface. */
  paper: string;
  ink: string;
  muted: string;
  /** Borders and ornaments. */
  trim: string;
  /** Names and highlights. */
  accent: string;
  motif: CardMotif;
}

const T = (
  bg: [string, string],
  paper: string,
  ink: string,
  muted: string,
  trim: string,
  accent: string,
  motif: CardMotif
): CardTheme => ({ bg: `linear-gradient(160deg, ${bg[0]}, ${bg[1]})`, paper, ink, muted, trim, accent, motif });

const THEMES: Record<string, CardTheme> = {
  // Premium layout styles — colours from their invitation palettes.
  "temple-gopuram": T(["#2a060c", "#5a1020"], "#3b0a14", "#fff6e6", "#ebc46a", "#c9962c", "#ebc46a", "kolam"),
  "mandap-marigold": T(["#5c0a2e", "#c2185b"], "#fff5ec", "#4a1026", "#8a5263", "#e0a21b", "#c2185b", "thoranam"),
  "rajwada-palace": T(["#0a1438", "#1a2b6b"], "#0e1b4d", "#fbf4e6", "#c9cde3", "#d4a437", "#f2cf73", "deco"),
  "lotus-peacock": T(["#dff0ea", "#fbe3e9"], "#fbf7f1", "#1f3a38", "#6a7f7b", "#c9a45c", "#0f766e", "floral"),
  "nikah-emerald": T(["#041f14", "#0b4430"], "#062e1e", "#fbf8ef", "#cfd8cc", "#c9a24a", "#e9cf8a", "stars"),
  "walima-moonlit": T(["#050b1c", "#0e1a3a"], "#070f24", "#f5f3ec", "#b9c1d6", "#c9a227", "#ebd27a", "moon"),
  "church-stained-glass": T(["#efe8da", "#fcfaf5"], "#ffffff", "#2a2233", "#6d6475", "#b8913a", "#7a1f3d", "deco"),
  "christian-garden": T(["#e8ebdd", "#fafaf5"], "#ffffff", "#2b3629", "#6b7866", "#b9a36a", "#5b7a5a", "leaves"),
  "luxe-editorial": T(["#e7e1d6", "#f7f4ee"], "#f7f4ee", "#111111", "#6b665e", "#b08d57", "#111111", "minimal"),
  "watercolor-botanical": T(["#f9d9c9", "#e6efe0"], "#fffbf6", "#3a3a33", "#7b7a70", "#d08c6b", "#c0674f", "floral"),
  "boho-arch": T(["#f0e0ce", "#fbf4ec"], "#fbf4ec", "#3e2518", "#8a6a57", "#c98a4b", "#b5552e", "terracotta"),
  "velvet-gold": T(["#1a0409", "#420c1b"], "#2a0710", "#fbf5ea", "#e0cfae", "#d4af37", "#f0d98a", "curtain"),
  // Premium styles for the other occasions.
  "engagement-sparkle": T(["#F3E6CC", "#FFFBF2"], "#FFFBF2", "#2B2118", "#7A6A55", "#C9A24A", "#B8860B", "ring"),
  "engagement-thamboolam": T(["#173A18", "#22521F"], "#173A18", "#FFF8E7", "#F3E3BD", "#E0A526", "#F6CD6B", "thoranam"),
  "engagement-rose-garden": T(["#F8E4E8", "#FFF9F9"], "#FFF9F9", "#3D2A33", "#7D6570", "#D98FA0", "#C0587A", "floral"),
  "engagement-save-the-date": T(["#EFE6DD", "#FBF7F3"], "#FBF7F3", "#111111", "#6E655C", "#C9A27C", "#111111", "minimal"),
  "engagement-mangni": T(["#4A0A2A", "#6B1240"], "#4A0A2A", "#FFF5F2", "#F9DDD5", "#E0A93B", "#F7D27A", "deco"),
  "anniversary-golden-jubilee": T(["#231A06", "#3A2C0E"], "#231A06", "#FFF9EA", "#F2E4C0", "#D4AF37", "#F2DC8A", "curtain"),
  "anniversary-vintage-reel": T(["#EADBC2", "#FBF3E6"], "#FBF3E6", "#3B2A1E", "#7F6A55", "#B08650", "#8B5E3C", "minimal"),
  "anniversary-wine-roses": T(["#3A0712", "#5A0E1E"], "#3A0712", "#FFF6F4", "#F6DCD8", "#D6A15C", "#F2CD96", "floral"),
  "anniversary-silver-jubilee": T(["#E6E9F0", "#F8F9FB"], "#F8F9FB", "#1C2230", "#6A7284", "#9AA3B5", "#8A94A6", "stars"),
  "anniversary-shashtiabdapoorthi": T(["#0E2A17", "#16391F"], "#0E2A17", "#FFF8E8", "#F1E2BE", "#D4A437", "#F2CF73", "kolam"),
  "valentine-love-letter": T(["#F4E8D8", "#FFFBF5"], "#FFFBF5", "#3A1A1E", "#85656A", "#C8102E", "#C8102E", "hearts"),
  "valentine-neon-hearts": T(["#0D0718", "#1C0F33"], "#0D0718", "#FFF5FA", "#F5DDEA", "#FF3D8B", "#FF9CC7", "hearts"),
  "valentine-cupid-clouds": T(["#FCE1EE", "#FFF8FC"], "#FFF8FC", "#4A2E48", "#86688A", "#E79AB8", "#E75480", "stars"),
  "valentine-polaroid": T(["#F6E1D2", "#FFF7F0"], "#FFF7F0", "#3A2020", "#85655E", "#E4572E", "#E4572E", "hearts"),
  "valentine-red-roses": T(["#4A0716", "#6E0B22"], "#4A0716", "#FFF7F8", "#F9DDE2", "#F2A0B0", "#FFD1DA", "floral"),
  "proposal-starry-night": T(["#0E0A24", "#1C1540"], "#0E0A24", "#F7F4FF", "#E4DCF7", "#C9A6FF", "#E8D8FF", "moon"),
  "proposal-candlelight": T(["#22060C", "#3A0B17"], "#22060C", "#FFF7EC", "#F3E0C6", "#E8B04A", "#F7D796", "curtain"),
  "proposal-will-you": T(["#E6EDF8", "#FBFCFF"], "#FBFCFF", "#13294B", "#5E6E88", "#1F4E8C", "#1F4E8C", "hearts"),
  "proposal-beach-sunset": T(["#FBE3D2", "#FFF7F0"], "#FFF7F0", "#3E2233", "#86657A", "#F4A261", "#E76F51", "waves"),
  "proposal-rose-gold-ring": T(["#F6E1DE", "#FFF8F6"], "#FFF8F6", "#3A2226", "#85686A", "#C98B8F", "#B76E79", "ring"),
  "birthday-balloon-party": T(["#FFF1D6", "#FFFDF7"], "#FFFDF7", "#2A2140", "#7A7090", "#FFB703", "#FF6B6B", "confetti"),
  "birthday-neon-night": T(["#07081A", "#121536"], "#07081A", "#F4FDFF", "#DDF5FA", "#00E5FF", "#8AF4FF", "stars"),
  "birthday-kids-fiesta": T(["#FFF3C4", "#FFFDF5"], "#FFFDF5", "#1D2B53", "#5E6A8A", "#FFBE0B", "#3A86FF", "confetti"),
  "birthday-golden-milestone": T(["#EFE4CC", "#FBF7EE"], "#FBF7EE", "#15120D", "#6E6450", "#C9A24A", "#C9A24A", "stars"),
  "birthday-cake-candles": T(["#FDE2F1", "#FFF9FC"], "#FFF9FC", "#3A2344", "#85678E", "#F15BB5", "#F15BB5", "confetti"),
  "housewarming-griha-pravesam": T(["#4A1A0C", "#6A2812"], "#4A1A0C", "#FFF7EA", "#F4E0C0", "#E0A526", "#F6CD6B", "kolam"),
  "housewarming-new-keys": T(["#EDEDE6", "#FAFAF7"], "#FAFAF7", "#1E2D2B", "#66706D", "#2A9D8F", "#2A9D8F", "minimal"),
  "housewarming-boho-nest": T(["#EEE3D0", "#FBF6EE"], "#FBF6EE", "#3E2A1E", "#86705E", "#C98A4B", "#B5552E", "terracotta"),
  "housewarming-green-home": T(["#E6F0DD", "#FAFDF7"], "#FAFDF7", "#1F3A24", "#667A60", "#7FB069", "#3A7D44", "leaves"),
  "housewarming-vastu-lamp": T(["#3A1A08", "#5A2A0E"], "#3A1A08", "#FFF7EA", "#F4E0C0", "#E0A526", "#F6CD6B", "kolam"),
  "baby-twinkle-star": T(["#DDE7FA", "#F7FAFF"], "#F7FAFF", "#2E3A5F", "#6E7894", "#F7D06B", "#E48AB5", "stars"),
  "baby-valaikaappu": T(["#4A0A2A", "#6B1240"], "#4A0A2A", "#FFF5F0", "#FADCD0", "#E0A21B", "#FFD166", "floral"),
  "baby-teddy-hug": T(["#F2EAF6", "#FFFCF7"], "#FFFCF7", "#3B3A5A", "#7A7890", "#E9B872", "#6FA3D8", "stars"),
  "baby-naming-lotus": T(["#F4E6E0", "#FFFAF6"], "#FFFAF6", "#2E4A48", "#6E827E", "#D9B26A", "#C87A8E", "floral"),
  "baby-shower-balloons": T(["#F3F0FA", "#FFFDFA"], "#FFFDFA", "#2E3B55", "#72809A", "#F6C177", "#5FA8C9", "confetti"),
  "corporate-gala-night": T(["#0A1224", "#142038"], "#0A1224", "#FAF7EE", "#EDE5D0", "#D4AF37", "#F0D98A", "curtain"),
  "corporate-tech-launch": T(["#070B1A", "#10173A"], "#070B1A", "#F6F7FC", "#E2E6F5", "#6C63FF", "#B4AEFF", "minimal"),
  "corporate-conference": T(["#E4EAF7", "#F8FAFF"], "#F8FAFF", "#0B1B3A", "#5E6A85", "#1D4ED8", "#1D4ED8", "minimal"),
  "corporate-awards-night": T(["#EFE4CC", "#FBF7EE"], "#FBF7EE", "#15120D", "#6E6450", "#C9A24A", "#C9A24A", "stars"),
  "corporate-offsite": T(["#E6EFE3", "#FAFCF7"], "#FAFCF7", "#1F3A2E", "#667A6E", "#D69E2E", "#2F855A", "leaves"),
  "traditional-gold": T(["#15110f", "#2b2420"], "#221c18", "#f6ecd2", "#cbb892", "#c8962e", "#e3b45a", "kolam"),
  "minimal-modern": T(["#ededea", "#f7f7f4"], "#ffffff", "#141414", "#6b7280", "#141414", "#c2410c", "minimal"),
  "floral-pastel": T(["#f9dfe6", "#e7f3ea"], "#fffafb", "#4a2d3a", "#8a6b78", "#d9a0ae", "#c0587a", "floral"),
  "elegant-bw": T(["#050505", "#1c1c1c"], "#0f0f0f", "#f5f5f5", "#a3a3a3", "#c7c7c7", "#ffffff", "deco"),
  "beach-boho": T(["#fbe0c3", "#cdeeea"], "#fffaf2", "#3b2a1e", "#8a6f58", "#d08b5b", "#2a8f84", "waves"),
  "silk-curtain": T(["#2a060c", "#551422"], "#35091a", "#fff6ea", "#e9c9a0", "#c9a54a", "#ebd08a", "curtain"),
  "scratch-reveal": T(["#e6ddf6", "#f3d9de"], "#fbf8ff", "#3e3358", "#6e6784", "#d8a7b1", "#a56c7c", "foil"),
  "lantern-night": T(["#050a1c", "#1a2550"], "#0e1733", "#fff8ee", "#c8c2d8", "#f2a33a", "#ffd48a", "lantern"),
  "thoranam-jasmine": T(["#dcefd2", "#fff1cf"], "#fffdf5", "#2f3b1d", "#6b7a4a", "#3f7d34", "#d9731f", "thoranam"),
  "kerala-kasavu": T(["#efe5c9", "#f9f2de"], "#fffbef", "#3a2a10", "#7a6640", "#c9a13b", "#a8790b", "kasavu"),
  pookalam: T(["#4a0f0f", "#8a2a1c"], "#fff7ea", "#4a1a0e", "#8a5a3c", "#e8862a", "#c0391b", "pookalam"),
  "grand-reception": T(["#12061a", "#3a1440"], "#1f0c22", "#fff3dc", "#d9b8c8", "#e8a33d", "#ffd66b", "marquee"),
  "anniversary-emerald": T(["#08301f", "#135e45"], "#fffaf0", "#1d3b2f", "#5f7a6c", "#c9a13b", "#0f6b4d", "leaves"),
  "valentine-blush": T(["#fbd3dc", "#fff0f3"], "#fffafb", "#5b1a2c", "#9a5a6c", "#e8899c", "#d6456d", "hearts"),
  "proposal-starlit": T(["#0a0f2a", "#2a2a5a"], "#141a3d", "#f7f1e3", "#c9c4e0", "#e3c77a", "#f2d58a", "stars"),
  "birthday-confetti": T(["#fcdcee", "#d9efff"], "#ffffff", "#3b1d4a", "#7a5a88", "#e0409a", "#e0409a", "confetti"),
  "housewarming-terracotta": T(["#f4d3b6", "#e9efcf"], "#fffaf2", "#4a2a14", "#8a6a4e", "#b5622a", "#b5622a", "terracotta"),
  "engagement-ring": T(["#f3cad3", "#fdf0e3"], "#fffafb", "#4a1f2a", "#8a5a66", "#c9956b", "#9c3b52", "ring"),
  "baby-moon": T(["#d4cdf5", "#fde0de"], "#fffcff", "#4b3a6b", "#8a7aa8", "#b9a3e0", "#8a6cc2", "moon"),
  "corporate-ticket": T(["#070f22", "#16264a"], "#ffffff", "#0e1a33", "#4a5876", "#2563eb", "#2563eb", "ticket"),
};

export function getCardTheme(templateId: string): CardTheme {
  return THEMES[templateId] ?? THEMES["traditional-gold"];
}

/** Whether the card surface is dark (light text, QR on a white tile). */
export function isDarkPaper(theme: CardTheme): boolean {
  const hex = theme.paper.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

const svg = (w: number, h: number, body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`)}`;

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/**
 * The ornament along the top of the card (1000×180 viewBox), as an SVG
 * data URL — plus a small ornament mirrored in the bottom corners.
 */
export function cardOrnaments(theme: CardTheme): { top: string; corner: string } {
  const { trim: t, accent: a } = theme;
  const marigold = (x: number, y: number, r = 11) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff9f1c"/><circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="#ffd166"/>`;
  const leaf = (x: number, y: number, fill = "#3f9a4a") =>
    `<path d="M${x} ${y} C${x - 14} ${y + 20} ${x - 10} ${y + 44} ${x} ${y + 56} C${x + 10} ${y + 44} ${x + 14} ${y + 20} ${x} ${y}Z" fill="${fill}" stroke="#1f5a28" stroke-width="1"/>`;
  const dotCorner = `${range(4)
    .map((i) => range(4 - i).map((j) => `<circle cx="${20 + j * 28}" cy="${120 - i * 28}" r="4" fill="${t}"/>`).join(""))
    .join("")}<path d="M10 130 Q60 60 130 10" fill="none" stroke="${t}" stroke-width="3"/>`;

  switch (theme.motif) {
    case "kolam": {
      const dots = range(9).map((i) => `<circle cx="${140 + i * 90}" cy="70" r="6" fill="${t}"/>`).join("");
      const loops = range(8)
        .map((i) => `<path d="M${140 + i * 90} 70 Q${185 + i * 90} ${i % 2 ? 130 : 10} ${230 + i * 90} 70" fill="none" stroke="${a}" stroke-width="3"/>`)
        .join("");
      return { top: svg(1000, 180, dots + loops + `<path d="M40 150 H960" stroke="${t}" stroke-width="2" stroke-dasharray="2 12" stroke-linecap="round"/>`), corner: svg(140, 140, dotCorner) };
    }
    case "minimal":
      return { top: svg(1000, 180, `<path d="M300 120 H700" stroke="${t}" stroke-width="2"/><circle cx="500" cy="120" r="6" fill="${a}"/>`), corner: svg(140, 140, "") };
    case "floral": {
      const peony = (x: number, y: number, s: number) =>
        `${range(6).map((i) => `<ellipse cx="${x}" cy="${y - 12 * s}" rx="${10 * s}" ry="${16 * s}" fill="#f4b6c4" transform="rotate(${i * 60} ${x} ${y})"/>`).join("")}<circle cx="${x}" cy="${y}" r="${8 * s}" fill="#f7d38a"/>`;
      const vine = `<path d="M60 60 Q300 150 500 90 T940 60" fill="none" stroke="#7fa88a" stroke-width="4"/>` +
        range(7).map((i) => `<ellipse cx="${130 + i * 125}" cy="${95 + (i % 2 ? 20 : -10)}" rx="16" ry="7" fill="#9cc4a4" transform="rotate(${i % 2 ? 30 : -30} ${130 + i * 125} ${95})"/>`).join("");
      return { top: svg(1000, 180, vine + peony(500, 80, 2.2) + peony(180, 70, 1.3) + peony(820, 70, 1.3)), corner: svg(140, 140, peony(60, 80, 1.6)) };
    }
    case "deco": {
      const fan = range(9).map((i) => `<path d="M500 160 L${320 + i * 45} 30" stroke="${t}" stroke-width="2"/>`).join("");
      return { top: svg(1000, 180, `${fan}<path d="M300 160 H700" stroke="${t}" stroke-width="3"/><path d="M340 40 Q500 -20 660 40" fill="none" stroke="${t}" stroke-width="2"/>`), corner: svg(140, 140, `<path d="M10 130 V60 H40 V30 H70 V10 M10 130 H80 V100 H110 V70 H130" fill="none" stroke="${t}" stroke-width="3"/>`) };
    }
    case "waves":
      return {
        top: svg(1000, 180, `<circle cx="500" cy="80" r="46" fill="#ffc86b"/><circle cx="500" cy="80" r="62" fill="none" stroke="#ffd99a" stroke-width="4"/><path d="M0 150 Q125 120 250 150 T500 150 T750 150 T1000 150" fill="none" stroke="${a}" stroke-width="5"/><path d="M0 170 Q125 140 250 170 T500 170 T750 170 T1000 170" fill="none" stroke="${t}" stroke-width="3"/>`),
        corner: svg(140, 140, `<path d="M10 110 Q45 80 80 110 T140 110" fill="none" stroke="${a}" stroke-width="4"/>`),
      };
    case "curtain": {
      const scallops = range(12).map((i) => `<path d="M${i * 84} 0 Q${i * 84 + 42} 90 ${(i + 1) * 84} 0Z" fill="#7a0f1f" stroke="${t}" stroke-width="3"/>`).join("");
      const fringe = range(60).map((i) => `<line x1="${8 + i * 16.5}" y1="100" x2="${8 + i * 16.5}" y2="${118 + (i % 2) * 6}" stroke="${t}" stroke-width="3"/>`).join("");
      return { top: svg(1000, 180, `<rect width="1000" height="40" fill="#8c1426"/>${scallops}<path d="M0 98 H1000" stroke="${t}" stroke-width="4"/>${fringe}`), corner: svg(140, 140, `<circle cx="70" cy="70" r="14" fill="${t}"/><path d="M70 84 L58 130 H82Z" fill="${t}"/>`) };
    }
    case "foil": {
      const sparkles = range(9).map((i) => `<path d="M${120 + i * 95} ${60 + (i % 3) * 25} l6 -16 l6 16 l16 6 l-16 6 l-6 16 l-6 -16 l-16 -6z" fill="${i % 2 ? t : a}"/>`).join("");
      return { top: svg(1000, 180, `<rect x="200" y="120" width="600" height="14" rx="7" fill="${t}"/>${sparkles}`), corner: svg(140, 140, `<path d="M70 40 l10 26 l26 10 l-26 10 l-10 26 l-10 -26 l-26 -10 l26 -10z" fill="${t}"/>`) };
    }
    case "lantern": {
      const lantern = (x: number, len: number, s: number) =>
        `<line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="${t}" stroke-width="2"/><rect x="${x - 16 * s}" y="${len}" width="${32 * s}" height="${44 * s}" rx="${12 * s}" fill="#ffb347"/><rect x="${x - 10 * s}" y="${len + 8 * s}" width="${20 * s}" height="${28 * s}" rx="${8 * s}" fill="#fff1b8"/>`;
      const stars = range(14).map((i) => `<circle cx="${(i * 137) % 1000}" cy="${20 + ((i * 53) % 150)}" r="2.5" fill="#fff"/>`).join("");
      return { top: svg(1000, 180, stars + lantern(200, 40, 1) + lantern(380, 80, 1.2) + lantern(620, 60, 1.1) + lantern(800, 30, 0.9)), corner: svg(140, 140, `<path d="M40 100 Q70 130 100 100 Q88 110 70 110 Q52 110 40 100Z" fill="#b5652a"/><path d="M70 60 C78 76 77 90 70 95 C63 90 62 76 70 60Z" fill="#ffd166"/>`) };
    }
    case "thoranam": {
      const items = range(21).map((i) => {
        const x = 25 + i * 47.5;
        const y = 14 + 36 * (1 - Math.pow((x - 500) / 500, 2));
        return i % 2 === 0 ? leaf(x, y, i % 4 ? "#3f9a4a" : "#2f7d3a") : `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 22}" stroke="#e8b04a" stroke-width="2"/>${marigold(x, y + 30)}`;
      }).join("");
      return { top: svg(1000, 180, `<path d="M0 14 Q500 86 1000 14" fill="none" stroke="#e8b04a" stroke-width="3"/>${items}`), corner: svg(140, 140, `${marigold(40, 100, 14)}${marigold(80, 110, 10)}<circle cx="60" cy="80" r="6" fill="#fffaf0" stroke="#e0d6b8"/>`) };
    }
    case "kasavu":
      return {
        top: svg(1000, 180, `<rect y="40" width="1000" height="26" fill="${t}"/><rect y="74" width="1000" height="6" fill="${t}"/><rect y="88" width="1000" height="2" fill="${t}"/><path d="M470 140 Q500 100 530 140" fill="none" stroke="${a}" stroke-width="3"/><circle cx="500" cy="150" r="6" fill="${a}"/>`),
        corner: svg(140, 140, `<rect x="10" y="100" width="120" height="10" fill="${t}"/><rect x="10" y="118" width="120" height="3" fill="${t}"/>`),
      };
    case "pookalam": {
      const rings = ["#c0391b", "#ff9f1c", "#ffd166", "#3f9a4a", "#fff4dc"]
        .map((c, i) => `<circle cx="500" cy="0" r="${160 - i * 26}" fill="${c}"/>`)
        .join("");
      const petals = range(16).map((i) => `<ellipse cx="500" cy="-150" rx="10" ry="20" fill="#ff9f1c" transform="rotate(${i * 22.5 - 90} 500 0)"/>`).join("");
      return { top: svg(1000, 180, rings + petals), corner: svg(140, 140, `<circle cx="70" cy="90" r="30" fill="#ff9f1c"/><circle cx="70" cy="90" r="18" fill="#ffd166"/><circle cx="70" cy="90" r="7" fill="#c0391b"/>`) };
    }
    case "marquee": {
      const bulbs = range(24).map((i) => `<circle cx="${40 + i * 40}" cy="40" r="9" fill="#fff3c4"/><circle cx="${40 + i * 40}" cy="40" r="15" fill="#ffd66b" opacity="0.35"/>`).join("");
      return { top: svg(1000, 180, `<path d="M20 40 H980" stroke="${t}" stroke-width="4"/>${bulbs}<path d="M300 180 L420 60 M700 180 L580 60" stroke="#fff3c4" stroke-width="30" opacity="0.08"/>`), corner: svg(140, 140, `${range(4).map((i) => `<circle cx="${20 + i * 34}" cy="120" r="7" fill="#fff3c4"/>`).join("")}`) };
    }
    case "leaves": {
      const laurel = (x: number, dir: number) =>
        range(7).map((i) => `<ellipse cx="${x + dir * i * 34}" cy="${110 - i * 6}" rx="16" ry="7" fill="${t}" transform="rotate(${dir * -25} ${x + dir * i * 34} ${110 - i * 6})"/>`).join("");
      return { top: svg(1000, 180, laurel(470, -1) + laurel(530, 1) + `<circle cx="500" cy="114" r="10" fill="${a}"/>`), corner: svg(140, 140, laurel(30, 1).replace(/110/g, "120")) };
    }
    case "hearts": {
      const heart = (x: number, y: number, s: number, c: string) =>
        `<path d="M${x} ${y + 12 * s} C${x - 28 * s} ${y - 8 * s} ${x - 12 * s} ${y - 26 * s} ${x} ${y - 10 * s} C${x + 12 * s} ${y - 26 * s} ${x + 28 * s} ${y - 8 * s} ${x} ${y + 12 * s}Z" fill="${c}"/>`;
      return { top: svg(1000, 180, heart(500, 90, 2.2, a) + heart(380, 70, 1, t) + heart(620, 70, 1, t) + heart(260, 110, 0.7, t) + heart(740, 110, 0.7, t)), corner: svg(140, 140, heart(70, 80, 1.3, t)) };
    }
    case "stars": {
      const star = (x: number, y: number, s: number) =>
        `<path d="M${x} ${y - 14 * s} l${4 * s} ${10 * s} l${10 * s} ${4 * s} l${-10 * s} ${4 * s} l${-4 * s} ${10 * s} l${-4 * s} ${-10 * s} l${-10 * s} ${-4 * s} l${10 * s} ${-4 * s}z" fill="${a}"/>`;
      return {
        top: svg(1000, 180, `<path d="M540 40 a48 48 0 1 0 38 70 a38 38 0 1 1 -38 -70z" fill="${a}"/>` + range(10).map((i) => star(120 + i * 85, 50 + ((i * 37) % 90), 0.6 + (i % 3) * 0.3)).join("")),
        corner: svg(140, 140, star(50, 90, 1.5) + star(100, 60, 0.8)),
      };
    }
    case "confetti": {
      const colors = ["#e0409a", "#ffb627", "#22c55e", "#3b82f6", "#a855f7"];
      const bits = range(40).map((i) => `<rect x="${(i * 97) % 1000}" y="${(i * 41) % 170}" width="${10 + (i % 3) * 4}" height="6" rx="2" fill="${colors[i % 5]}" transform="rotate(${(i * 37) % 180} ${(i * 97) % 1000} ${(i * 41) % 170})"/>`).join("");
      return { top: svg(1000, 180, bits), corner: svg(140, 140, range(8).map((i) => `<circle cx="${20 + ((i * 29) % 110)}" cy="${30 + ((i * 47) % 100)}" r="5" fill="${colors[i % 5]}"/>`).join("")) };
    }
    case "terracotta":
      return {
        top: svg(1000, 180, `<path d="M380 170 V90 A120 120 0 0 1 620 90 V170" fill="none" stroke="${t}" stroke-width="6"/><path d="M430 170 V100 A70 70 0 0 1 570 100 V170" fill="${t}" opacity="0.15"/>` + leaf(330, 90) + leaf(670, 90)),
        corner: svg(140, 140, `<path d="M40 70 H100 L92 130 H48Z" fill="${t}"/>${leaf(70, 18)}`),
      };
    case "ring":
      return {
        top: svg(1000, 180, `<ellipse cx="500" cy="120" rx="48" ry="40" fill="none" stroke="${t}" stroke-width="10"/><polygon points="500,30 522,56 500,82 478,56" fill="#f4fbff" stroke="#bfe3f5" stroke-width="3"/><path d="M380 120 H430 M570 120 H620" stroke="${t}" stroke-width="2"/>`),
        corner: svg(140, 140, `<path d="M70 50 l8 20 l20 8 l-20 8 l-8 20 l-8 -20 l-20 -8 l20 -8z" fill="${t}"/>`),
      };
    case "moon":
      return {
        top: svg(1000, 180, `<path d="M540 30 a60 60 0 1 0 48 88 a48 48 0 1 1 -48 -88z" fill="#f6d77a"/>` + range(6).map((i) => `<line x1="${250 + i * 100}" y1="0" x2="${250 + i * 100}" y2="${40 + (i % 3) * 30}" stroke="${t}" stroke-width="2"/><path d="M${250 + i * 100} ${48 + (i % 3) * 30} l5 11 l12 1 l-9 8 l3 12 l-11 -6 l-11 6 l3 -12 l-9 -8 l12 -1z" fill="#ffe9a8"/>`).join("")),
        corner: svg(140, 140, `<circle cx="50" cy="100" r="22" fill="#fff" opacity="0.9"/><circle cx="80" cy="96" r="28" fill="#fff" opacity="0.9"/>`),
      };
    case "ticket":
      return {
        top: svg(1000, 180, `<rect width="1000" height="90" fill="${t}"/>${range(40).map((i) => `<circle cx="${12 + i * 25}" cy="110" r="5" fill="${t}" opacity="0.5"/>`).join("")}`),
        corner: svg(140, 140, range(12).map((i) => `<rect x="${10 + i * 10}" y="90" width="${i % 3 ? 3 : 6}" height="40" fill="${theme.ink}"/>`).join("")),
      };
    default:
      return { top: svg(1000, 180, `<path d="M300 120 H700" stroke="${t}" stroke-width="2"/>`), corner: svg(140, 140, "") };
  }
}

/** Google Font families behind each font pairing (the card image needs the
 * font files; see lib/fontPairings.ts for the CSS side). */
export const CARD_FONTS: Record<string, { display: [string, 400 | 600 | 700]; body: [string, 400 | 600 | 700] }> = {
  "classic-serif": { display: ["Playfair Display", 700], body: ["Cormorant Garamond", 600] },
  "modern-clean": { display: ["Poppins", 600], body: ["Inter", 400] },
  "elegant-script": { display: ["Great Vibes", 400], body: ["Lato", 400] },
  "royal-cinzel": { display: ["Cinzel", 600], body: ["EB Garamond", 400] },
  "luxe-didone": { display: ["Bodoni Moda", 600], body: ["Jost", 400] },
  "tamil-calligraphy": { display: ["Kavivanar", 400], body: ["Catamaran", 400] },
  "tamil-classic": { display: ["Meera Inimai", 400], body: ["Catamaran", 400] },
};
