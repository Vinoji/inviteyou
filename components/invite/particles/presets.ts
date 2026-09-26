import type { ParticlePreset } from "@/lib/motionThemes";

/** A pooled particle. Plain mutable fields so the frame loop never allocates. */
export interface Particle {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  phase: number; // sway / flap / twinkle offset
  age: number; // seconds
  life: number; // seconds
  color: string;
}

type Range = readonly [number, number];

export interface PresetDef {
  colors: readonly string[];
  /** Particles per burst (before device caps). */
  count: number;
  /** Particles kept alive in ambient mode (before device caps). */
  ambientCount: number;
  size: Range; // CSS px
  vx: Range; // px / s
  vy: Range; // px / s, positive = down
  gravity: number; // px / s²
  sway: number; // px / s of sideways oscillation
  swayFreq: number; // Hz
  spin: Range; // rad / s
  life: Range; // s
  blend: GlobalCompositeOperation;
  /** Where particles appear: above the top edge, below the bottom edge,
   * at the burst origin, or anywhere in the upper part of the canvas. */
  spawn: "top" | "bottom" | "origin" | "area";
  draw: (ctx: CanvasRenderingContext2D, p: Particle, t: number) => void;
}

const TAU = Math.PI * 2;

function drawPetal(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, TAU);
  ctx.fill();
}

function drawDot(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(0, 0, p.size, 0, TAU);
  ctx.fill();
}

function drawJasmine(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.fillStyle = p.color;
  for (let i = 0; i < 5; i++) {
    ctx.rotate(TAU / 5);
    ctx.beginPath();
    ctx.ellipse(0, -p.size * 0.6, p.size * 0.32, p.size * 0.6, 0, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = "#f3e2a0";
  ctx.beginPath();
  ctx.arc(0, 0, p.size * 0.22, 0, TAU);
  ctx.fill();
}

function drawEmber(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.fillStyle = p.color;
  ctx.globalAlpha *= 0.35;
  ctx.beginPath();
  ctx.arc(0, 0, p.size * 2.2, 0, TAU);
  ctx.fill();
  ctx.globalAlpha /= 0.35;
  ctx.beginPath();
  ctx.arc(0, 0, p.size * 0.8, 0, TAU);
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, p: Particle, t: number) {
  const s = p.size * (0.6 + 0.4 * Math.abs(Math.sin(t * 4 + p.phase)));
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, -s * 2);
  ctx.quadraticCurveTo(0, 0, s * 2, 0);
  ctx.quadraticCurveTo(0, 0, 0, s * 2);
  ctx.quadraticCurveTo(0, 0, -s * 2, 0);
  ctx.quadraticCurveTo(0, 0, 0, -s * 2);
  ctx.fill();
}

function drawBubble(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, p.size, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.2, 0, TAU);
  ctx.fill();
}

function drawButterfly(ctx: CanvasRenderingContext2D, p: Particle, t: number) {
  const flap = 0.25 + 0.75 * Math.abs(Math.sin(t * 9 + p.phase));
  ctx.fillStyle = p.color;
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    ctx.save();
    ctx.scale(side * flap, 1);
    ctx.beginPath();
    ctx.ellipse(p.size * 0.55, -p.size * 0.3, p.size * 0.6, p.size * 0.45, -0.5, 0, TAU);
    ctx.ellipse(p.size * 0.45, p.size * 0.35, p.size * 0.4, p.size * 0.3, 0.5, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#5b4636";
  ctx.fillRect(-p.size * 0.06, -p.size * 0.5, p.size * 0.12, p.size);
}

export const PRESETS: Record<ParticlePreset, PresetDef> = {
  marigold: {
    colors: ["#e8862a", "#f6c24a", "#fbe7a1", "#f0a33a", "#c0392b"],
    count: 90,
    ambientCount: 14,
    size: [4, 10],
    vx: [-30, 30],
    vy: [70, 190],
    gravity: 0,
    sway: 36,
    swayFreq: 0.6,
    spin: [-3, 3],
    life: [5, 7],
    blend: "source-over",
    spawn: "top",
    draw: drawPetal,
  },
  jasmine: {
    colors: ["#fffdf6", "#fff8ec", "#f7f1e1"],
    count: 40,
    ambientCount: 10,
    size: [4, 7],
    vx: [-15, 15],
    vy: [35, 80],
    gravity: 0,
    sway: 30,
    swayFreq: 0.35,
    spin: [-1, 1],
    life: [7, 10],
    blend: "source-over",
    spawn: "top",
    draw: drawJasmine,
  },
  embers: {
    colors: ["#ffcf6b", "#ffb347", "#ff8c2a"],
    count: 60,
    ambientCount: 16,
    size: [1, 2.5],
    vx: [-12, 12],
    vy: [-90, -35],
    gravity: 0,
    sway: 18,
    swayFreq: 0.8,
    spin: [0, 0],
    life: [2.5, 5],
    blend: "lighter",
    spawn: "bottom",
    draw: drawEmber,
  },
  inkDots: {
    colors: ["#111111", "#3a3a3a"],
    count: 30,
    ambientCount: 8,
    size: [0.8, 2],
    vx: [-160, 160],
    vy: [-120, 120],
    gravity: 0,
    sway: 0,
    swayFreq: 0,
    spin: [0, 0],
    life: [0.8, 1.6],
    blend: "source-over",
    spawn: "origin",
    draw: drawDot,
  },
  pastelPetals: {
    colors: ["#F6D6D6", "#E79AA8", "#F7E7B4", "#CBB8E0"],
    count: 70,
    ambientCount: 12,
    size: [4, 8],
    vx: [-25, 25],
    vy: [40, 110],
    gravity: 0,
    sway: 40,
    swayFreq: 0.45,
    spin: [-2, 2],
    life: [6, 9],
    blend: "source-over",
    spawn: "top",
    draw: drawPetal,
  },
  butterflies: {
    colors: ["#E79AA8", "#CBB8E0", "#F7E7B4", "#A8BFA0"],
    count: 8,
    ambientCount: 4,
    size: [7, 11],
    vx: [-90, 90],
    vy: [-110, -40],
    gravity: 0,
    sway: 60,
    swayFreq: 0.5,
    spin: [0, 0],
    life: [3, 5],
    blend: "source-over",
    spawn: "origin",
    draw: drawButterfly,
  },
  glitter: {
    colors: ["#F2F3F5", "#C9CCD1", "#ffffff"],
    count: 80,
    ambientCount: 15,
    size: [1, 2.6],
    vx: [-40, 40],
    vy: [-120, -30],
    gravity: 20,
    sway: 10,
    swayFreq: 1,
    spin: [0, 0],
    life: [1.5, 3],
    blend: "lighter",
    spawn: "origin",
    draw: drawStar,
  },
  bubbles: {
    colors: ["rgba(255,255,255,0.85)", "rgba(207,240,238,0.9)"],
    count: 50,
    ambientCount: 12,
    size: [2, 6],
    vx: [-10, 10],
    vy: [-80, -30],
    gravity: 0,
    sway: 16,
    swayFreq: 0.7,
    spin: [0, 0],
    life: [3, 6],
    blend: "source-over",
    spawn: "bottom",
    draw: drawBubble,
  },
  sunGlints: {
    colors: ["#fff6d6", "#ffe39a", "#ffffff"],
    count: 36,
    ambientCount: 14,
    size: [1, 2.4],
    vx: [-6, 6],
    vy: [-6, 6],
    gravity: 0,
    sway: 0,
    swayFreq: 0,
    spin: [0, 0],
    life: [1.2, 2.6],
    blend: "lighter",
    spawn: "area",
    draw: drawStar,
  },
};
