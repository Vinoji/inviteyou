import * as THREE from "three";

/**
 * Procedural textures for the 3D palace, painted once on canvases at load
 * (no image downloads). Each surface gets a colour map and, where carving
 * matters, a matching height map used as a bump map so lamp light catches
 * the joints, panels and inlays. `size` is 512 on capable devices and 256
 * on low-end ones.
 */

/** Seeded random numbers, so every guest sees the same palace. */
export function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function canvas(w: number, h = w): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

export function toTexture(c: HTMLCanvasElement, color: boolean, repeat: [number, number] = [1, 1]) {
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Fine speckle so no surface reads as flat colour. */
export function grain(g: CanvasRenderingContext2D, w: number, h: number, rand: () => number, amount: number, light: string, dark: string) {
  const n = Math.round((w * h) / 40) * amount;
  for (let i = 0; i < n; i++) {
    g.fillStyle = rand() > 0.5 ? light : dark;
    const s = rand() * 1.6 + 0.4;
    g.fillRect(rand() * w, rand() * h, s, s);
  }
}

/** Soft marble veins: wandering, blurred strokes. */
export function veins(g: CanvasRenderingContext2D, w: number, h: number, rand: () => number, count: number, color: string) {
  g.save();
  g.strokeStyle = color;
  g.lineCap = "round";
  for (let v = 0; v < count; v++) {
    let x = rand() * w;
    let y = rand() * h;
    let a = rand() * Math.PI * 2;
    g.lineWidth = 0.6 + rand() * 2.2;
    g.globalAlpha = 0.25 + rand() * 0.45;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 40; s++) {
      a += (rand() - 0.5) * 0.7;
      x += Math.cos(a) * w * 0.03;
      y += Math.sin(a) * h * 0.03;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}

/** An eight-petal rosette (carved or inlaid). */
export function rosette(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.moveTo(cx, cy);
    g.quadraticCurveTo(
      cx + Math.cos(a - 0.35) * r * 1.1,
      cy + Math.sin(a - 0.35) * r * 1.1,
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r
    );
    g.quadraticCurveTo(cx + Math.cos(a + 0.35) * r * 1.1, cy + Math.sin(a + 0.35) * r * 1.1, cx, cy);
  }
  g.fill();
  g.beginPath();
  g.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  g.fill();
}

/** An eight-point star (two overlapping squares). */
export function star(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  g.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.55;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
}

/* ------------------------------------------------------------------ */

/** Red-gold sandstone in coursed blocks, each block a recessed panel
 * with a carved rosette — the palace walls. One tile = 2 × 2 m. */
function sandstone(size: number, gold: string) {
  const rand = seeded(3);
  const [c, g] = canvas(size);
  const [hc, h] = canvas(size);
  const block = size / 2;
  g.fillStyle = "#C7A47A";
  g.fillRect(0, 0, size, size);
  h.fillStyle = "#808080";
  h.fillRect(0, 0, size, size);
  // Warm variation per block
  for (let row = 0; row < 2; row++) {
    for (let col = -1; col < 3; col++) {
      const x = col * block + (row % 2 ? block / 2 : 0);
      const y = row * block;
      g.fillStyle = `hsl(${30 + rand() * 8}, ${32 + rand() * 10}%, ${58 + rand() * 8}%)`;
      g.fillRect(x, y, block, block);
      // Recessed panel
      const m = block * 0.14;
      g.fillStyle = "rgba(90,55,25,0.18)";
      g.fillRect(x + m, y + m, block - 2 * m, block - 2 * m);
      g.strokeStyle = "rgba(255,240,210,0.55)";
      g.lineWidth = size / 256;
      g.beginPath();
      g.moveTo(x + m, y + block - m);
      g.lineTo(x + m, y + m);
      g.lineTo(x + block - m, y + m);
      g.stroke();
      g.strokeStyle = "rgba(70,40,15,0.6)";
      g.beginPath();
      g.moveTo(x + block - m, y + m);
      g.lineTo(x + block - m, y + block - m);
      g.lineTo(x + m, y + block - m);
      g.stroke();
      h.fillStyle = "#5a5a5a";
      h.fillRect(x + m, y + m, block - 2 * m, block - 2 * m);
      // Rosette, picked out in gold leaf
      g.fillStyle = gold;
      g.globalAlpha = 0.75;
      rosette(g, x + block / 2, y + block / 2, block * 0.22);
      g.globalAlpha = 1;
      h.fillStyle = "#d0d0d0";
      rosette(h, x + block / 2, y + block / 2, block * 0.22);
    }
  }
  grain(g, size, size, rand, 1, "rgba(255,240,215,0.25)", "rgba(80,45,15,0.22)");
  // Mortar joints
  g.strokeStyle = "rgba(60,35,15,0.75)";
  h.strokeStyle = "#202020";
  for (const ctx of [g, h]) {
    ctx.lineWidth = size / 170;
    for (let row = 0; row <= 2; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * block);
      ctx.lineTo(size, row * block);
      ctx.stroke();
    }
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col <= 2; col++) {
        const x = col * block + (row % 2 ? block / 2 : 0);
        ctx.beginPath();
        ctx.moveTo(x, row * block);
        ctx.lineTo(x, (row + 1) * block);
        ctx.stroke();
      }
    }
  }
  return { map: toTexture(c, true, [0.34, 0.34]), bump: toTexture(hc, false, [0.34, 0.34]) };
}

/** White Makrana marble with grey-gold veins. */
function marble(size: number, seed: number) {
  const rand = seeded(seed);
  const [c, g] = canvas(size);
  const grad = g.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#F4EFE4");
  grad.addColorStop(1, "#E6DDCB");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  g.filter = "blur(1.2px)";
  veins(g, size, size, rand, 14, "#9C8E78");
  g.filter = "none";
  veins(g, size, size, rand, 5, "#C9A24A");
  grain(g, size, size, rand, 0.5, "rgba(255,255,255,0.35)", "rgba(120,100,70,0.12)");
  return c;
}

/** Pillars: marble with vertical fluting (the bump map carries the grooves). */
function pillar(size: number) {
  const c = marble(size, 5);
  const [hc, h] = canvas(size);
  const flutes = 16;
  for (let i = 0; i < flutes; i++) {
    const x0 = (i / flutes) * size;
    const grad = h.createLinearGradient(x0, 0, x0 + size / flutes, 0);
    grad.addColorStop(0, "#d8d8d8");
    grad.addColorStop(0.5, "#505050");
    grad.addColorStop(1, "#d8d8d8");
    h.fillStyle = grad;
    h.fillRect(x0, 0, size / flutes, size);
  }
  return { map: toTexture(c, true, [1, 2]), bump: toTexture(hc, false, [1, 2]) };
}

/** The hall floor: dark and ivory marble tiles with gold inlay lines and an
 * eight-point star on each light tile. One tile repeat = 4 × 4 m. */
function floor(size: number, gold: string) {
  const rand = seeded(9);
  const [c, g] = canvas(size);
  const [hc, h] = canvas(size);
  const tile = size / 2;
  h.fillStyle = "#909090";
  h.fillRect(0, 0, size, size);
  for (let r = 0; r < 2; r++) {
    for (let col = 0; col < 2; col++) {
      const dark = (r + col) % 2 === 0;
      const x = col * tile;
      const y = r * tile;
      g.save();
      g.beginPath();
      g.rect(x, y, tile, tile);
      g.clip();
      g.fillStyle = dark ? "#1F4D42" : "#EDE3CC";
      g.fillRect(x, y, tile, tile);
      g.filter = "blur(1px)";
      veins(g, size, size, rand, 6, dark ? "#3F6B5C" : "#B8A684");
      g.filter = "none";
      if (!dark) {
        g.fillStyle = gold;
        star(g, x + tile / 2, y + tile / 2, tile * 0.3);
        g.fill();
        g.fillStyle = "#7A1F2E";
        star(g, x + tile / 2, y + tile / 2, tile * 0.16);
        g.fill();
        h.fillStyle = "#707070";
        star(h, x + tile / 2, y + tile / 2, tile * 0.3);
        h.fill();
      } else {
        g.strokeStyle = gold;
        g.globalAlpha = 0.55;
        g.lineWidth = size / 300;
        g.strokeRect(x + tile * 0.12, y + tile * 0.12, tile * 0.76, tile * 0.76);
        g.globalAlpha = 1;
      }
      g.restore();
    }
  }
  g.strokeStyle = gold;
  h.strokeStyle = "#404040";
  for (const ctx of [g, h]) {
    ctx.lineWidth = size / 128;
    for (let i = 0; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tile, 0);
      ctx.lineTo(i * tile, size);
      ctx.moveTo(0, i * tile);
      ctx.lineTo(size, i * tile);
      ctx.stroke();
    }
  }
  return { map: toTexture(c, true, [10, 30]), bump: toTexture(hc, false, [10, 30]) };
}

/** The runner: deep red wool, gold borders, a chain of medallions. */
function carpet(size: number, gold: string) {
  const rand = seeded(13);
  const [c, g] = canvas(size / 2, size);
  const w = size / 2;
  g.fillStyle = "#5E1526";
  g.fillRect(0, 0, w, size);
  grain(g, w, size, rand, 1.2, "rgba(150,40,60,0.35)", "rgba(30,5,10,0.35)");
  // Borders
  g.fillStyle = gold;
  g.fillRect(w * 0.06, 0, w * 0.035, size);
  g.fillRect(w * 0.9, 0, w * 0.035, size);
  g.fillStyle = "#123A33";
  g.fillRect(w * 0.1, 0, w * 0.05, size);
  g.fillRect(w * 0.85, 0, w * 0.05, size);
  // Medallions
  for (let i = 0; i < 2; i++) {
    const cy = size * (0.25 + i * 0.5);
    g.save();
    g.translate(w / 2, cy);
    g.rotate(Math.PI / 4);
    g.strokeStyle = gold;
    g.lineWidth = w / 60;
    g.strokeRect(-w * 0.22, -w * 0.22, w * 0.44, w * 0.44);
    g.restore();
    g.fillStyle = gold;
    rosette(g, w / 2, cy, w * 0.16);
    g.fillStyle = "#F3D27A";
    g.beginPath();
    g.arc(w / 2, cy, w * 0.04, 0, Math.PI * 2);
    g.fill();
  }
  return { map: toTexture(c, true, [1, 10]) };
}

/** Teak doors: grain, recessed panels with gold edging, brass studs.
 * One leaf (2 × 5.4 m) is one texture. */
function door(size: number, gold: string) {
  const rand = seeded(17);
  const [c, g] = canvas(size / 2, size);
  const [hc, h] = canvas(size / 2, size);
  const w = size / 2;
  g.fillStyle = "#4A2416";
  g.fillRect(0, 0, w, size);
  h.fillStyle = "#909090";
  h.fillRect(0, 0, w, size);
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = rand() > 0.5 ? "rgba(110,60,30,0.35)" : "rgba(25,10,5,0.35)";
    g.lineWidth = 0.5 + rand() * 1.5;
    const x = rand() * w;
    g.beginPath();
    g.moveTo(x, 0);
    g.bezierCurveTo(x + rand() * 6 - 3, size / 3, x + rand() * 6 - 3, (2 * size) / 3, x, size);
    g.stroke();
  }
  // Panels: 2 across, 4 down
  const pw = w * 0.36;
  const ph = size * 0.16;
  for (let r = 0; r < 4; r++) {
    for (let col = 0; col < 2; col++) {
      const x = w * 0.09 + col * (pw + w * 0.1);
      const y = size * 0.2 + r * (ph + size * 0.035);
      g.fillStyle = "rgba(0,0,0,0.28)";
      g.fillRect(x, y, pw, ph);
      g.strokeStyle = gold;
      g.lineWidth = w / 90;
      g.strokeRect(x, y, pw, ph);
      g.fillStyle = gold;
      rosette(g, x + pw / 2, y + ph / 2, Math.min(pw, ph) * 0.22);
      h.fillStyle = "#505050";
      h.fillRect(x, y, pw, ph);
      h.fillStyle = "#c0c0c0";
      rosette(h, x + pw / 2, y + ph / 2, Math.min(pw, ph) * 0.22);
    }
  }
  // Studs
  for (let r = 0; r < 14; r++) {
    for (const x of [w * 0.04, w * 0.96]) {
      const y = size * 0.03 + r * size * 0.07;
      const grad = g.createRadialGradient(x - 1, y - 1, 0, x, y, w / 40);
      grad.addColorStop(0, "#FFF0B8");
      grad.addColorStop(1, gold);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, w / 40, 0, Math.PI * 2);
      g.fill();
      h.fillStyle = "#ffffff";
      h.beginPath();
      h.arc(x, y, w / 40, 0, Math.PI * 2);
      h.fill();
    }
  }
  return { map: toTexture(c, true, [0.5, 1 / 5.4]), bump: toTexture(hc, false, [0.5, 1 / 5.4]) };
}

/** Domes: marble with gold ribs running to the finial and a gold band at the drum. */
function dome(size: number, gold: string) {
  const c = marble(size, 21);
  const g = c.getContext("2d")!;
  const [hc, h] = canvas(size);
  h.fillStyle = "#808080";
  h.fillRect(0, 0, size, size);
  const ribs = 24;
  g.strokeStyle = gold;
  h.strokeStyle = "#ffffff";
  for (const ctx of [g, h]) {
    ctx.lineWidth = size / 160;
    for (let i = 0; i < ribs; i++) {
      const x = (i / ribs) * size;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
  }
  // Lotus-petal scallops round the base of the dome (bottom of the UV).
  g.fillStyle = gold;
  for (let i = 0; i < ribs; i++) {
    const x = (i / ribs) * size;
    g.beginPath();
    g.moveTo(x, size);
    g.quadraticCurveTo(x + size / ribs / 2, size * 0.86, x + size / ribs, size);
    g.fill();
  }
  g.fillRect(0, size * 0.97, size, size * 0.03);
  return { map: toTexture(c, true), bump: toTexture(hc, false) };
}

/** The hall's inner walls: midnight blue painted with small gold lotus motifs. */
function paintedWall(size: number, gold: string) {
  const [c, g] = canvas(size);
  const grad = g.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#0E1838");
  grad.addColorStop(1, "#0A1129");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  g.fillStyle = gold;
  g.globalAlpha = 0.45;
  const step = size / 4;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      rosette(g, x * step + step / 2 + (y % 2 ? step / 2 : 0), y * step + step / 2, step * 0.14);
    }
  }
  g.globalAlpha = 1;
  return { map: toTexture(c, true, [10, 1.5]) };
}

/** Clipped hedges in the courtyard. */
function hedge(size: number) {
  const rand = seeded(29);
  const [c, g] = canvas(size / 2);
  const s = size / 2;
  g.fillStyle = "#123A2C";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = `hsl(${140 + rand() * 30}, ${35 + rand() * 25}%, ${12 + rand() * 18}%)`;
    g.beginPath();
    g.ellipse(rand() * s, rand() * s, 2 + rand() * 3, 1 + rand() * 2, rand() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  return { map: toTexture(c, true, [1, 6]) };
}

/** Jharokha glass: warm lamplight seen through a fine jali screen. */
function windowGlow(size: number) {
  const [c, g] = canvas(size / 4, size / 2);
  const w = size / 4;
  const h = size / 2;
  const grad = g.createRadialGradient(w / 2, h * 0.65, 0, w / 2, h * 0.65, h * 0.6);
  grad.addColorStop(0, "#FFFFFF");
  grad.addColorStop(0.35, "#FFE2A8");
  grad.addColorStop(1, "#B8641E");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(70,30,5,0.75)";
  g.lineWidth = Math.max(1, w / 40);
  const step = w / 6;
  for (let i = -h; i < h * 2; i += step) {
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(w, i + w);
    g.moveTo(0, i + w);
    g.lineTo(w, i);
    g.stroke();
  }
  return { map: toTexture(c, true) };
}

/** Shared by every world: the gate doors and lit window glass. */
export function makeCommonTextures(size: number, gold: string) {
  return { door: door(size, gold), window: windowGlow(size) };
}

export function makePalaceTextures(size: number, gold: string) {
  return {
    sandstone: sandstone(size, gold),
    marble: { map: toTexture(marble(size, 1), true, [1, 1]) },
    pillar: pillar(size),
    floor: floor(size, gold),
    carpet: carpet(size, gold),
    dome: dome(size, gold),
    wall: paintedWall(size, gold),
    hedge: hedge(size),
  };
}
