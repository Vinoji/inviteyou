import { canvas, grain, seeded, toTexture, veins } from "./textures";

/**
 * Procedural textures for the cathedral world (Cathedral 3D): limestone
 * ashlar, a flagstone floor, stained-glass lancets and a rose window, pew
 * oak and the ivory aisle runner. Painted at load, nothing downloaded.
 */

const GLASS = ["#1B3F8B", "#B0202E", "#1F7A4D", "#D99A1E", "#5B2C83", "#1E7FA8"];

/** Pale limestone in coursed ashlar blocks. One tile = 3 × 3 m. */
function limestone(size: number) {
  const rand = seeded(61);
  const [c, g] = canvas(size);
  const [hc, h] = canvas(size);
  const rows = 6;
  const bh = size / rows;
  h.fillStyle = "#909090";
  h.fillRect(0, 0, size, size);
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? bh : 0;
    for (let x = -bh * 2 + off; x < size; x += bh * 2) {
      g.fillStyle = `hsl(${38 + rand() * 6}, ${16 + rand() * 8}%, ${74 + rand() * 8}%)`;
      g.fillRect(x, r * bh, bh * 2, bh);
    }
  }
  grain(g, size, size, rand, 1.4, "rgba(255,255,255,0.3)", "rgba(90,80,60,0.18)");
  g.strokeStyle = "rgba(90,80,60,0.55)";
  h.strokeStyle = "#303030";
  for (const ctx of [g, h]) {
    ctx.lineWidth = size / 220;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * bh);
      ctx.lineTo(size, r * bh);
      ctx.stroke();
      const off = r % 2 ? bh : 0;
      for (let x = off; x <= size; x += bh * 2) {
        ctx.beginPath();
        ctx.moveTo(x, r * bh);
        ctx.lineTo(x, (r + 1) * bh);
        ctx.stroke();
      }
    }
  }
  return { map: toTexture(c, true, [0.34, 0.34]), bump: toTexture(hc, false, [0.34, 0.34]) };
}

/** Nave floor: worn stone flags in two tones, laid diagonally. One tile = 4 × 4 m. */
function flagstones(size: number) {
  const rand = seeded(67);
  const [c, g] = canvas(size);
  const [hc, h] = canvas(size);
  g.fillStyle = "#B9AE98";
  g.fillRect(0, 0, size, size);
  h.fillStyle = "#909090";
  h.fillRect(0, 0, size, size);
  const n = 4;
  const s = size / n;
  g.save();
  h.save();
  for (const ctx of [g, h]) {
    ctx.translate(size / 2, size / 2);
    ctx.rotate(Math.PI / 4);
    ctx.translate(-size, -size);
  }
  for (let i = 0; i < n * 3; i++) {
    for (let j = 0; j < n * 3; j++) {
      g.fillStyle = (i + j) % 2 ? `hsl(35, 14%, ${66 + rand() * 6}%)` : `hsl(30, 10%, ${52 + rand() * 6}%)`;
      g.fillRect(i * s * 0.72, j * s * 0.72, s * 0.72, s * 0.72);
      h.strokeStyle = "#303030";
      h.lineWidth = size / 200;
      h.strokeRect(i * s * 0.72, j * s * 0.72, s * 0.72, s * 0.72);
    }
  }
  g.restore();
  h.restore();
  g.filter = "blur(1px)";
  veins(g, size, size, rand, 6, "rgba(80,70,55,0.6)");
  g.filter = "none";
  grain(g, size, size, rand, 1, "rgba(255,255,255,0.18)", "rgba(40,35,25,0.2)");
  return { map: toTexture(c, true, [10, 30]), bump: toTexture(hc, false, [10, 30]) };
}

/** A lancet window: jewel-coloured glass in lead came, a pointed head with
 * a quatrefoil, a central medallion. Bright where light comes through. */
function lancet(size: number, seed: number) {
  const rand = seeded(seed);
  const w = size / 4;
  const h = size;
  const [c, g] = canvas(w, h);
  g.fillStyle = "#0B0E1C";
  g.fillRect(0, 0, w, h);
  // Glass pieces
  const cols = 3;
  const rows = 14;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const color = GLASS[Math.floor(rand() * GLASS.length)];
      const grad = g.createLinearGradient(0, (r * h) / rows, 0, ((r + 1) * h) / rows);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "#ffffff22");
      g.fillStyle = color;
      g.fillRect((col * w) / cols, (r * h) / rows, w / cols, h / rows);
      g.globalAlpha = 0.25;
      g.fillStyle = "#ffffff";
      g.fillRect((col * w) / cols + 2, (r * h) / rows + 2, (w / cols) * 0.4, (h / rows) * 0.3);
      g.globalAlpha = 1;
    }
  }
  // Medallion
  const cy = h * 0.55;
  g.fillStyle = "#F2C14E";
  g.beginPath();
  g.arc(w / 2, cy, w * 0.36, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#B0202E";
  g.beginPath();
  g.arc(w / 2, cy, w * 0.26, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#FFF6DA";
  g.fillRect(w / 2 - w * 0.03, cy - w * 0.18, w * 0.06, w * 0.36);
  g.fillRect(w / 2 - w * 0.12, cy - w * 0.08, w * 0.24, w * 0.06);
  // Quatrefoil in the head
  g.fillStyle = "#1B3F8B";
  for (const [dx, dy] of [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ]) {
    g.beginPath();
    g.arc(w / 2 + dx * w * 0.12, h * 0.12 + dy * w * 0.12, w * 0.12, 0, Math.PI * 2);
    g.fill();
  }
  // Lead came
  g.strokeStyle = "#141414";
  g.lineWidth = Math.max(1.5, w / 50);
  for (let r = 0; r <= rows; r++) {
    g.beginPath();
    g.moveTo(0, (r * h) / rows);
    g.lineTo(w, (r * h) / rows);
    g.stroke();
  }
  for (let col = 0; col <= cols; col++) {
    g.beginPath();
    g.moveTo((col * w) / cols, 0);
    g.lineTo((col * w) / cols, h);
    g.stroke();
  }
  g.beginPath();
  g.arc(w / 2, cy, w * 0.36, 0, Math.PI * 2);
  g.stroke();
  return { map: toTexture(c, true) };
}

/** The rose window: petals of coloured glass radiating from a centre,
 * traceried in stone. */
function rose(size: number) {
  const [c, g] = canvas(size);
  const cx = size / 2;
  g.fillStyle = "#0B0E1C";
  g.fillRect(0, 0, size, size);
  const rings: [number, number, number][] = [
    [0.48, 24, 0],
    [0.36, 16, 2],
    [0.24, 12, 4],
    [0.12, 8, 1],
  ];
  rings.forEach(([r, n, shift]) => {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      g.fillStyle = GLASS[(i + shift) % GLASS.length];
      g.beginPath();
      g.moveTo(cx, cx);
      g.arc(cx, cx, size * r, a0, a1);
      g.closePath();
      g.fill();
    }
  });
  g.fillStyle = "#F2C14E";
  g.beginPath();
  g.arc(cx, cx, size * 0.06, 0, Math.PI * 2);
  g.fill();
  // Tracery
  g.strokeStyle = "#D8CFBE";
  g.lineWidth = size / 90;
  rings.forEach(([r]) => {
    g.beginPath();
    g.arc(cx, cx, size * r, 0, Math.PI * 2);
    g.stroke();
  });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * size * 0.12, cx + Math.sin(a) * size * 0.12);
    g.lineTo(cx + Math.cos(a) * size * 0.48, cx + Math.sin(a) * size * 0.48);
    g.stroke();
  }
  return { map: toTexture(c, true) };
}

/** Pew oak. */
function oak(size: number) {
  const rand = seeded(71);
  const [c, g] = canvas(size / 2);
  const s = size / 2;
  g.fillStyle = "#5A3A22";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 70; i++) {
    g.strokeStyle = rand() > 0.5 ? "rgba(140,95,55,0.4)" : "rgba(30,15,5,0.4)";
    g.lineWidth = 0.5 + rand() * 1.4;
    const y = rand() * s;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(s / 3, y + rand() * 8 - 4, (2 * s) / 3, y + rand() * 8 - 4, s, y);
    g.stroke();
  }
  return { map: toTexture(c, true) };
}

/** The aisle runner: ivory with a gold border and scattered petals. */
function runner(size: number, gold: string) {
  const rand = seeded(73);
  const [c, g] = canvas(size / 2, size);
  const w = size / 2;
  g.fillStyle = "#F4EEE2";
  g.fillRect(0, 0, w, size);
  grain(g, w, size, rand, 0.8, "rgba(255,255,255,0.4)", "rgba(150,130,100,0.12)");
  g.fillStyle = gold;
  g.fillRect(w * 0.05, 0, w * 0.04, size);
  g.fillRect(w * 0.91, 0, w * 0.04, size);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = rand() > 0.5 ? "rgba(214,140,150,0.8)" : "rgba(255,255,255,0.95)";
    g.beginPath();
    g.ellipse(w * 0.15 + rand() * w * 0.7, rand() * size, 4, 2.5, rand() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  return { map: toTexture(c, true, [1, 8]) };
}

export function makeCathedralTextures(size: number, gold: string) {
  return {
    limestone: limestone(size),
    floor: flagstones(size),
    lancets: [lancet(size, 81), lancet(size, 83), lancet(size, 89)],
    rose: rose(size),
    oak: oak(size),
    runner: runner(size, gold),
  };
}
