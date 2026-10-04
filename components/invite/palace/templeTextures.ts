import { canvas, grain, rosette, seeded, toTexture } from "./textures";

/**
 * Procedural textures for the Hindu temple world (Temple 3D): granite,
 * carved walls with sculpture niches, painted gopuram tiers, carved
 * mandapam pillars, a painted lotus ceiling and a kolam. Same approach as
 * textures.ts — painted on canvases at load, nothing downloaded.
 */

/** Dark speckled granite, the temple's stone. */
function granitePaint(g: CanvasRenderingContext2D, w: number, h: number, seed: number, base = "#5B534B") {
  const rand = seeded(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  grain(g, w, h, rand, 3, "rgba(230,220,200,0.35)", "rgba(10,8,6,0.45)");
  grain(g, w, h, rand, 1, "rgba(180,120,80,0.25)", "rgba(40,30,25,0.3)");
}

/** Courtyard and hall floor: big polished granite slabs. One tile = 3 × 3 m. */
function granite(size: number) {
  const [c, g] = canvas(size);
  const [hc, h] = canvas(size);
  granitePaint(g, size, size, 41, "#4E4842");
  h.fillStyle = "#909090";
  h.fillRect(0, 0, size, size);
  g.strokeStyle = "rgba(10,8,6,0.8)";
  h.strokeStyle = "#202020";
  for (const ctx of [g, h]) {
    ctx.lineWidth = size / 200;
    ctx.strokeRect(0, 0, size, size);
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();
  }
  return { map: toTexture(c, true, [7, 20]), bump: toTexture(hc, false, [7, 20]) };
}

/** A sitting figure in a niche, suggested in a few strokes (crown, halo, body). */
function figure(g: CanvasRenderingContext2D, cx: number, cy: number, s: number, body: string, trim: string) {
  g.fillStyle = trim;
  g.beginPath();
  g.arc(cx, cy - s * 0.55, s * 0.32, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = body;
  g.beginPath();
  g.arc(cx, cy - s * 0.55, s * 0.18, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.moveTo(cx - s * 0.3, cy + s * 0.5);
  g.quadraticCurveTo(cx - s * 0.35, cy - s * 0.25, cx, cy - s * 0.32);
  g.quadraticCurveTo(cx + s * 0.35, cy - s * 0.25, cx + s * 0.3, cy + s * 0.5);
  g.closePath();
  g.fill();
  g.fillStyle = trim;
  g.fillRect(cx - s * 0.38, cy + s * 0.48, s * 0.76, s * 0.08);
}

/** A niche (devakoshta) with a figure, used on walls and tiers. */
function niche(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colors: { back: string; body: string; trim: string },
  height?: CanvasRenderingContext2D
) {
  g.fillStyle = "rgba(0,0,0,0.35)";
  g.fillRect(x - w * 0.06, y - h * 0.04, w * 1.12, h * 1.08);
  g.fillStyle = colors.back;
  g.beginPath();
  g.moveTo(x, y + h);
  g.lineTo(x, y + h * 0.28);
  g.quadraticCurveTo(x + w / 2, y - h * 0.08, x + w, y + h * 0.28);
  g.lineTo(x + w, y + h);
  g.closePath();
  g.fill();
  g.strokeStyle = colors.trim;
  g.lineWidth = Math.max(1, w / 14);
  g.stroke();
  figure(g, x + w / 2, y + h * 0.58, Math.min(w, h) * 0.55, colors.body, colors.trim);
  if (height) {
    height.fillStyle = "#3a3a3a";
    height.fillRect(x, y + h * 0.2, w, h * 0.8);
    height.fillStyle = "#d0d0d0";
    figure(height, x + w / 2, y + h * 0.58, Math.min(w, h) * 0.55, "#d0d0d0", "#e8e8e8");
  }
}

/** Mandapam and enclosure walls: granite courses with carved niches and a
 * frieze of lotus rosettes. One tile = 4 m wide, full wall height. */
function carvedWall(size: number) {
  const [c, g] = canvas(size);
  const [hc, h] = canvas(size);
  granitePaint(g, size, size, 43, "#6A6157");
  h.fillStyle = "#909090";
  h.fillRect(0, 0, size, size);
  // Base mouldings
  for (const [y, hh] of [
    [0.86, 0.04],
    [0.92, 0.03],
    [0.06, 0.05],
  ] as const) {
    g.fillStyle = "rgba(255,240,215,0.18)";
    g.fillRect(0, size * y, size, size * hh);
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.fillRect(0, size * (y + hh), size, size * 0.008);
    h.fillStyle = "#d0d0d0";
    h.fillRect(0, size * y, size, size * hh);
  }
  // Two niches with pilasters
  niche(g, size * 0.12, size * 0.3, size * 0.22, size * 0.46, { back: "#3E352E", body: "#8C7F70", trim: "#A99A85" }, h);
  niche(g, size * 0.62, size * 0.3, size * 0.22, size * 0.46, { back: "#3E352E", body: "#8C7F70", trim: "#A99A85" }, h);
  for (const x of [0.02, 0.44, 0.52, 0.94]) {
    g.fillStyle = "rgba(255,240,215,0.15)";
    g.fillRect(size * x, size * 0.2, size * 0.04, size * 0.66);
    h.fillStyle = "#c8c8c8";
    h.fillRect(size * x, size * 0.2, size * 0.04, size * 0.66);
  }
  // Rosette frieze
  g.fillStyle = "rgba(255,235,200,0.35)";
  h.fillStyle = "#e0e0e0";
  for (let i = 0; i < 8; i++) {
    rosette(g, size * (0.0625 + i * 0.125), size * 0.13, size * 0.035);
    rosette(h, size * (0.0625 + i * 0.125), size * 0.13, size * 0.035);
  }
  return { map: toTexture(c, true, [10, 1]), bump: toTexture(hc, false, [10, 1]) };
}

/** A gopuram tier: rows of brightly painted niches with deities, between
 * ochre cornices — the colour of a freshly painted South Indian tower. */
function gopuramTier(size: number) {
  const rand = seeded(47);
  const [c, g] = canvas(size, size / 4);
  const w = size;
  const h = size / 4;
  g.fillStyle = "#D9A441";
  g.fillRect(0, 0, w, h);
  const palette = [
    { back: "#1F7A8C", body: "#F2C14E", trim: "#C0392B" },
    { back: "#B03A2E", body: "#F5E6C8", trim: "#F2C14E" },
    { back: "#2E8B57", body: "#F2C14E", trim: "#F5E6C8" },
    { back: "#6C3483", body: "#F5B7B1", trim: "#F2C14E" },
    { back: "#2471A3", body: "#F8C471", trim: "#E74C3C" },
  ];
  const n = 8;
  for (let i = 0; i < n; i++) {
    const nw = w / n;
    niche(g, i * nw + nw * 0.14, h * 0.18, nw * 0.72, h * 0.66, palette[Math.floor(rand() * palette.length)]);
  }
  // Cornice stripes
  g.fillStyle = "#8E2C1F";
  g.fillRect(0, 0, w, h * 0.08);
  g.fillStyle = "#F5E6C8";
  g.fillRect(0, h * 0.08, w, h * 0.03);
  g.fillStyle = "#8E2C1F";
  g.fillRect(0, h * 0.92, w, h * 0.08);
  grain(g, w, h, rand, 0.6, "rgba(255,255,255,0.15)", "rgba(0,0,0,0.15)");
  return { map: toTexture(c, true, [1, 1]) };
}

/** A carved mandapam pillar: square granite shaft with carved bands —
 * lotus, a yali, a lamp-bearer — the kind every temple corridor has. */
function carvedPillar(size: number) {
  const [c, g] = canvas(size / 4, size);
  const [hc, h] = canvas(size / 4, size);
  const w = size / 4;
  granitePaint(g, w, size, 53, "#6E655A");
  h.fillStyle = "#808080";
  h.fillRect(0, 0, w, size);
  const bands = [0.06, 0.28, 0.5, 0.72];
  bands.forEach((y, i) => {
    const y0 = size * y;
    const bh = size * 0.14;
    g.fillStyle = "rgba(0,0,0,0.3)";
    g.fillRect(0, y0, w, bh);
    h.fillStyle = "#404040";
    h.fillRect(0, y0, w, bh);
    if (i % 2 === 0) {
      g.fillStyle = "rgba(240,225,200,0.55)";
      rosette(g, w / 2, y0 + bh / 2, w * 0.32);
      h.fillStyle = "#e0e0e0";
      rosette(h, w / 2, y0 + bh / 2, w * 0.32);
    } else {
      figure(g, w / 2, y0 + bh * 0.55, w * 0.6, "rgba(240,225,200,0.55)", "rgba(255,240,215,0.4)");
      figure(h, w / 2, y0 + bh * 0.55, w * 0.6, "#d8d8d8", "#e8e8e8");
    }
    // Moulding lines
    g.fillStyle = "rgba(255,240,215,0.3)";
    g.fillRect(0, y0 - size * 0.012, w, size * 0.008);
    g.fillRect(0, y0 + bh + size * 0.004, w, size * 0.008);
  });
  return { map: toTexture(c, true), bump: toTexture(hc, false) };
}

/** The mandapam ceiling: painted panels, each a lotus in a ring of petals,
 * in temple red, ochre, turquoise and white. One panel per tile (≈ 4 m). */
function paintedCeiling(size: number) {
  const [c, g] = canvas(size);
  g.fillStyle = "#7A1F1A";
  g.fillRect(0, 0, size, size);
  g.fillStyle = "#D9A441";
  g.fillRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92);
  g.fillStyle = "#1F5F6B";
  g.fillRect(size * 0.08, size * 0.08, size * 0.84, size * 0.84);
  const cx = size / 2;
  // Petal rings
  [
    [0.4, "#F5E6C8", 16],
    [0.3, "#C0392B", 12],
    [0.2, "#F2C14E", 8],
  ].forEach(([r, col, n]) => {
    g.fillStyle = col as string;
    for (let i = 0; i < (n as number); i++) {
      const a = (i / (n as number)) * Math.PI * 2;
      g.beginPath();
      g.ellipse(
        cx + Math.cos(a) * size * (r as number) * 0.6,
        cx + Math.sin(a) * size * (r as number) * 0.6,
        size * (r as number) * 0.42,
        size * (r as number) * 0.16,
        a,
        0,
        Math.PI * 2
      );
      g.fill();
    }
  });
  g.fillStyle = "#7A1F1A";
  g.beginPath();
  g.arc(cx, cx, size * 0.07, 0, Math.PI * 2);
  g.fill();
  // Corner rosettes
  g.fillStyle = "#F2C14E";
  for (const [x, y] of [
    [0.16, 0.16],
    [0.84, 0.16],
    [0.16, 0.84],
    [0.84, 0.84],
  ]) {
    rosette(g, size * x, size * y, size * 0.05);
  }
  return { map: toTexture(c, true, [2, 10]) };
}

/** A kolam drawn in rice flour down the hall: dots with looping lines and
 * lotus motifs, white on transparent, laid over the granite. */
function kolam(size: number) {
  const [c, g] = canvas(size / 2, size);
  const w = size / 2;
  g.strokeStyle = "rgba(255,250,240,0.92)";
  g.fillStyle = "rgba(255,250,240,0.95)";
  g.lineWidth = Math.max(1.5, w / 90);
  // Border lines
  for (const x of [w * 0.06, w * 0.94]) {
    g.beginPath();
    for (let y = 0; y <= size; y += w * 0.12) {
      g.moveTo(x, y);
      g.quadraticCurveTo(x + (x < w / 2 ? 1 : -1) * w * 0.05, y + w * 0.06, x, y + w * 0.12);
    }
    g.stroke();
  }
  // Two motifs per tile: dot grid with petals woven around it
  for (let m = 0; m < 2; m++) {
    const cx = w / 2;
    const cy = size * (0.25 + m * 0.5);
    const r = w * 0.32;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.abs(i) + Math.abs(j) > 3) continue;
        g.beginPath();
        g.arc(cx + i * r * 0.32, cy + j * r * 0.32, w / 120 + 1, 0, Math.PI * 2);
        g.fill();
      }
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.ellipse(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62, r * 0.42, r * 0.17, a, 0, Math.PI * 2);
      g.stroke();
    }
    g.beginPath();
    g.arc(cx, cy, r * 1.08, 0, Math.PI * 2);
    g.stroke();
  }
  return { map: toTexture(c, true, [1, 9]) };
}

export function makeTempleTextures(size: number) {
  return {
    granite: granite(size),
    wall: carvedWall(size),
    tier: gopuramTier(size),
    pillar: carvedPillar(size),
    ceiling: paintedCeiling(size),
    kolam: kolam(size),
  };
}
