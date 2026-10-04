import { canvas, grain, seeded, toTexture } from "./textures";

/**
 * Procedural textures for Blossom Park 3D: grass with tiny wildflowers,
 * stone pavers for the path, cherry bark, moving water, a waterfall sheet,
 * mossy rock and the twilight sky. Painted at load, nothing downloaded.
 */

/** Lawn: layered greens, blades and a scatter of tiny flowers. */
function grass(size: number) {
  const rand = seeded(101);
  const [c, g] = canvas(size);
  g.fillStyle = "#3E6B35";
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < size * 6; i++) {
    g.strokeStyle = `hsl(${95 + rand() * 30}, ${35 + rand() * 25}%, ${22 + rand() * 22}%)`;
    g.lineWidth = 1;
    const x = rand() * size;
    const y = rand() * size;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (rand() - 0.5) * 3, y - 2 - rand() * 5);
    g.stroke();
  }
  const flowers = ["#FFFFFF", "#F7C6D9", "#F6E27A", "#C9B6F2"];
  for (let i = 0; i < size / 3; i++) {
    g.fillStyle = flowers[Math.floor(rand() * flowers.length)];
    g.beginPath();
    g.arc(rand() * size, rand() * size, 0.8 + rand() * 1.2, 0, Math.PI * 2);
    g.fill();
  }
  return { map: toTexture(c, true, [24, 40]) };
}

/** The path: rounded stone pavers in warm grey, moss in the joints. */
function pavers(size: number) {
  const rand = seeded(103);
  const [c, g] = canvas(size / 2, size);
  const [hc, h] = canvas(size / 2, size);
  const w = size / 2;
  g.fillStyle = "#4C5A3A";
  g.fillRect(0, 0, w, size);
  h.fillStyle = "#202020";
  h.fillRect(0, 0, w, size);
  const rows = 12;
  const rh = size / rows;
  for (let r = 0; r < rows; r++) {
    const n = 3;
    const off = r % 2 ? w / n / 2 : 0;
    for (let i = -1; i < n; i++) {
      const x = i * (w / n) + off + 2;
      const y = r * rh + 2;
      g.fillStyle = `hsl(${30 + rand() * 15}, ${10 + rand() * 10}%, ${58 + rand() * 12}%)`;
      g.beginPath();
      g.roundRect(x, y, w / n - 4, rh - 4, 6);
      g.fill();
      h.fillStyle = "#b0b0b0";
      h.beginPath();
      h.roundRect(x, y, w / n - 4, rh - 4, 6);
      h.fill();
    }
  }
  grain(g, w, size, rand, 1, "rgba(255,255,255,0.15)", "rgba(40,30,20,0.18)");
  return { map: toTexture(c, true, [1, 14]), bump: toTexture(hc, false, [1, 14]) };
}

/** Cherry bark: dark red-brown with horizontal lenticels. */
function bark(size: number) {
  const rand = seeded(107);
  const [c, g] = canvas(size / 4, size / 2);
  const w = size / 4;
  const h = size / 2;
  g.fillStyle = "#4A2C26";
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) {
    g.fillStyle = rand() > 0.5 ? "rgba(140,100,90,0.5)" : "rgba(20,10,8,0.5)";
    g.fillRect(rand() * w, rand() * h, 3 + rand() * 8, 1 + rand());
  }
  return { map: toTexture(c, true, [2, 2]) };
}

/** River water: deep teal with drifting light streaks (scrolled each frame). */
function water(size: number) {
  const rand = seeded(109);
  const [c, g] = canvas(size);
  const grad = g.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#1E5C6E");
  grad.addColorStop(0.5, "#2A7A8C");
  grad.addColorStop(1, "#1E5C6E");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    g.strokeStyle = `rgba(255,${220 + rand() * 35},${230 + rand() * 25},${0.15 + rand() * 0.35})`;
    g.lineWidth = 1 + rand() * 2;
    const y = rand() * size;
    const x = rand() * size;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 20, y - 4, x + 40 + rand() * 40, y);
    g.stroke();
  }
  return { map: toTexture(c, true, [3, 1]) };
}

/** The waterfall: white and pale-blue streams falling (scrolled each frame). */
function waterfall(size: number) {
  const rand = seeded(113);
  const [c, g] = canvas(size / 2, size);
  const w = size / 2;
  g.fillStyle = "rgba(170,215,230,0.55)";
  g.fillRect(0, 0, w, size);
  for (let i = 0; i < 140; i++) {
    g.strokeStyle = `rgba(255,255,255,${0.25 + rand() * 0.6})`;
    g.lineWidth = 1 + rand() * 3;
    const x = rand() * w;
    const y = rand() * size;
    const dx = (rand() - 0.5) * 3;
    const len = 30 + rand() * 80;
    // Drawn twice, a tile apart, so the texture repeats with no seam.
    for (const oy of [0, -size]) {
      g.beginPath();
      g.moveTo(x, y + oy);
      g.lineTo(x + dx, y + oy + len);
      g.stroke();
    }
  }
  return { map: toTexture(c, true, [1, 1.5]) };
}

/** Mossy granite for the cliff. */
function rock(size: number) {
  const rand = seeded(127);
  const [c, g] = canvas(size / 2);
  const s = size / 2;
  g.fillStyle = "#5A5E58";
  g.fillRect(0, 0, s, s);
  grain(g, s, s, rand, 3, "rgba(220,220,210,0.3)", "rgba(20,20,20,0.35)");
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(${70 + rand() * 30},${110 + rand() * 40},${50 + rand() * 20},0.55)`;
    g.beginPath();
    g.ellipse(rand() * s, rand() * s, 6 + rand() * 18, 3 + rand() * 8, rand() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  return { map: toTexture(c, true, [2, 2]) };
}

/** Twilight sky for the dome: violet overhead, rose, then a peach glow at
 * the horizon, with a few early stars. */
function sky(size: number) {
  const rand = seeded(131);
  const [c, g] = canvas(16, size);
  const grad = g.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#1E1838");
  grad.addColorStop(0.3, "#3E2A5E");
  grad.addColorStop(0.42, "#8A5A8C");
  grad.addColorStop(0.48, "#E89A8C");
  grad.addColorStop(0.5, "#F6C49A");
  grad.addColorStop(0.53, "#6A4A6A");
  grad.addColorStop(1, "#2A2238");
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, size);
  for (let i = 0; i < 30; i++) {
    g.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.6})`;
    g.fillRect(rand() * 16, rand() * size * 0.3, 0.6, 0.6);
  }
  const tex = toTexture(c, true, [1, 1]);
  return { map: tex };
}

export function makeParkTextures(size: number) {
  return {
    grass: grass(size),
    path: pavers(size),
    bark: bark(size),
    water: water(size),
    waterfall: waterfall(size),
    rock: rock(size),
    sky: sky(size),
  };
}
