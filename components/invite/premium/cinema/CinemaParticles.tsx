"use client";

import { useEffect, useRef } from "react";
import useSafeReducedMotion from "../../useSafeReducedMotion";

/**
 * Real-looking particles for the cinematic templates, on one canvas:
 *
 * - petals   — tumble in 3D (a flip is a cosine squash), sway, and sit at
 *              depths: near ones are bigger, faster and more opaque.
 * - grains   — akshathai (turmeric rice) thrown in blessing: small, quick.
 * - confetti — paper squares and ribbons that flutter; the shade changes
 *              with the flip, as light catches each side.
 * - sparks   — sparkler / firework sparks: short, hot streaks with trails,
 *              added in light ("lighter").
 * - bokeh    — out-of-focus lights drifting upward.
 * - fireworks— rockets that rise and burst into sparks with gravity.
 *
 * "loop" keeps a population alive; "burst" throws one volley (on mount, or
 * each time `burstKey` changes). Pauses off-screen and when the tab is
 * hidden; reduced motion draws nothing. Kept small for phones: DPR ≤ 1.5
 * and capped counts.
 */
export type ParticleKind = "petals" | "grains" | "confetti" | "sparks" | "bokeh" | "fireworks";

export interface Emitter {
  /** 0–1 fractions of the canvas. */
  x: number;
  y: number;
  /** Direction in degrees (0 = right, -90 = up) and spread either side. */
  angle?: number;
  spread?: number;
}

interface P {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  z: number;
  size: number;
  rot: number;
  vrot: number;
  flip: number;
  vflip: number;
  sway: number;
  life: number;
  maxLife: number;
  color: string;
  shape: number;
  rocket?: boolean;
}

const PALETTES: Record<string, string[]> = {
  marigold: ["#f59e0b", "#f97316", "#fbbf24", "#ea580c"],
  jasmine: ["#fffdf5", "#fff7e0", "#fef3c7"],
  rose: ["#9f1239", "#be123c", "#e11d48", "#7f1d1d"],
  blush: ["#fbcfe8", "#f9a8d4", "#fde68a", "#ffffff"],
  party: ["#f43f5e", "#f59e0b", "#22d3ee", "#a855f7", "#84cc16", "#fde047", "#ffffff"],
  gold: ["#fde68a", "#fcd34d", "#fff7d6", "#f5c451"],
  warm: ["#ffd9a0", "#ffb86b", "#fff1d0"],
  turmeric: ["#eab308", "#facc15", "#f59e0b"],
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

export default function CinemaParticles({
  kind,
  palette = "gold",
  colors,
  mode = "loop",
  density = 1,
  emitters,
  burstKey = 0,
  className,
}: {
  kind: ParticleKind;
  palette?: keyof typeof PALETTES;
  colors?: string[];
  mode?: "loop" | "burst";
  /** Multiplies the base count. */
  density?: number;
  /** Burst origins; default: across the top (loop) or bottom corners (burst). */
  emitters?: Emitter[];
  /** Change to throw another volley. */
  burstKey?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useSafeReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cols = colors ?? PALETTES[palette] ?? PALETTES.gold;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const small = W < 600;
    const base = { petals: 26, grains: 70, confetti: 110, sparks: 60, bokeh: 18, fireworks: 3 }[kind];
    const target = Math.round(base * density * (small ? 0.7 : 1));
    const ps: P[] = [];

    const spawn = (e?: Emitter, burst = false): P => {
      const z = rand(0.45, 1.35);
      const p: P = {
        x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, z,
        size: 1, rot: rand(0, Math.PI * 2), vrot: rand(-0.04, 0.04),
        flip: rand(0, Math.PI * 2), vflip: rand(0.03, 0.09), sway: rand(0, Math.PI * 2),
        life: 0, maxLife: 1e9, color: pick(cols), shape: Math.random(),
      };
      if (burst && e) {
        const a = ((e.angle ?? -90) + rand(-(e.spread ?? 35), e.spread ?? 35)) * (Math.PI / 180);
        const speed = kind === "grains" ? rand(5, 11) : kind === "sparks" ? rand(2, 7) : rand(7, 15);
        p.x = e.x * W;
        p.y = e.y * H;
        p.vx = Math.cos(a) * speed * z;
        p.vy = Math.sin(a) * speed * z;
      } else {
        p.x = rand(0, W);
        p.y = kind === "bokeh" ? rand(H * 0.2, H * 1.1) : rand(-H * 0.3, -10);
      }
      switch (kind) {
        case "petals":
          p.size = rand(7, 13) * z;
          if (!burst) p.vy = rand(0.4, 1.0) * z;
          break;
        case "grains":
          p.size = rand(2.2, 3.4) * z;
          p.maxLife = rand(90, 150);
          break;
        case "confetti":
          p.size = rand(5, 9) * z;
          if (!burst) p.vy = rand(1, 2.2) * z;
          break;
        case "sparks":
          p.size = rand(0.8, 1.8);
          p.maxLife = rand(18, 40);
          break;
        case "bokeh":
          p.size = rand(10, 34) * z;
          p.vy = -rand(0.12, 0.4);
          p.vx = rand(-0.12, 0.12);
          p.maxLife = rand(500, 900);
          break;
        case "fireworks":
          p.rocket = true;
          p.x = rand(W * 0.2, W * 0.8);
          p.y = H + 10;
          p.vx = rand(-0.6, 0.6);
          p.vy = -rand(H / 80, H / 62);
          p.size = 2;
          break;
      }
      p.px = p.x;
      p.py = p.y;
      return p;
    };

    const defaultBurst: Emitter[] =
      kind === "sparks"
        ? [{ x: 0.5, y: 0.5, angle: -90, spread: 180 }]
        : [
            { x: 0, y: 1, angle: -62, spread: 16 },
            { x: 1, y: 1, angle: -118, spread: 16 },
          ];
    const volley = () => {
      const src = emitters ?? defaultBurst;
      for (let i = 0; i < target; i++) ps.push(spawn(src[i % src.length], true));
    };

    if (mode === "burst") volley();
    else if (kind === "bokeh") for (let i = 0; i < target; i++) ps.push(spawn());

    const burstSpark = (x: number, y: number, color: string) => {
      const n = small ? 46 : 70;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
        const s = rand(1.8, 4.2);
        ps.push({
          x, y, px: x, py: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, z: 1, size: rand(1, 1.8),
          rot: 0, vrot: 0, flip: 0, vflip: 0, sway: 0, life: 0, maxLife: rand(45, 75), color, shape: 0,
        });
      }
    };

    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { rootMargin: "80px" });
    io.observe(canvas);

    let raf = 0;
    let t = 0;
    let lastRocket = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      t++;
      ctx.clearRect(0, 0, W, H);

      if (mode === "loop") {
        if (kind === "fireworks") {
          if (t - lastRocket > 55 && ps.filter((p) => p.rocket).length < target) {
            ps.push(spawn());
            lastRocket = t;
          }
        } else if (kind === "sparks") {
          const src = emitters ?? defaultBurst;
          for (let i = 0; i < 4; i++) ps.push(spawn(pick(src), true));
        } else if (ps.length < target && Math.random() < 0.25) {
          ps.push(spawn());
        }
      }

      const additive = kind === "sparks" || kind === "fireworks" || kind === "bokeh";
      ctx.globalCompositeOperation = additive ? "lighter" : "source-over";

      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.px = p.x;
        p.py = p.y;
        p.life++;
        switch (kind) {
          case "petals":
          case "confetti": {
            // Air drag, gentle gravity, sway; bursts slow to a drifting fall.
            p.vx *= 0.975;
            p.vy = p.vy * 0.975 + 0.06 * p.z;
            p.vy = Math.min(p.vy, (kind === "petals" ? 1.1 : 2.2) * p.z);
            p.sway += 0.03;
            p.x += p.vx + Math.sin(p.sway) * 0.6 * p.z;
            p.y += p.vy;
            p.rot += p.vrot;
            p.flip += p.vflip;
            break;
          }
          case "grains":
            p.vx *= 0.97;
            p.vy = p.vy * 0.97 + 0.22;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += 0.2;
            break;
          case "sparks":
            p.vx *= 0.94;
            p.vy = p.vy * 0.94 + 0.08;
            p.x += p.vx;
            p.y += p.vy;
            break;
          case "bokeh":
            p.x += p.vx + Math.sin((t + p.sway * 100) / 90) * 0.15;
            p.y += p.vy;
            break;
          case "fireworks":
            if (p.rocket) {
              p.vy += H / 9000;
              p.x += p.vx;
              p.y += p.vy;
              if (p.vy > -1.2) {
                p.life = p.maxLife = 1;
                burstSpark(p.x, p.y, p.color);
              }
            } else {
              p.vx *= 0.96;
              p.vy = p.vy * 0.96 + 0.045;
              p.x += p.vx;
              p.y += p.vy;
            }
            break;
        }

        const fade = p.maxLife < 1e9 ? 1 - p.life / p.maxLife : 1;
        const gone = p.life >= p.maxLife || p.y > H + 40 || p.x < -60 || p.x > W + 60 || (kind === "bokeh" && p.y < -60);
        if (gone) {
          ps.splice(i, 1);
          continue;
        }

        ctx.save();
        switch (kind) {
          case "petals": {
            ctx.globalAlpha = Math.min(1, 0.45 + p.z * 0.45);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, Math.max(0.15, Math.abs(Math.cos(p.flip))));
            const s = p.size;
            const g = ctx.createLinearGradient(0, -s, 0, s);
            g.addColorStop(0, p.color);
            g.addColorStop(1, shade(p.color, Math.cos(p.flip) > 0 ? 0.28 : -0.18));
            ctx.fillStyle = g;
            ctx.beginPath();
            // A petal: rounded top, pinched base.
            ctx.moveTo(0, s);
            ctx.bezierCurveTo(s * 0.95, s * 0.35, s * 0.7, -s, 0, -s);
            ctx.bezierCurveTo(-s * 0.7, -s, -s * 0.95, s * 0.35, 0, s);
            ctx.fill();
            break;
          }
          case "grains":
            ctx.globalAlpha = fade;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "confetti": {
            const c = Math.cos(p.flip);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, Math.max(0.08, Math.abs(c)));
            ctx.fillStyle = shade(p.color, c * 0.22);
            if (p.shape < 0.7) ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
            else ctx.fillRect(-p.size * 1.3, -p.size * 0.18, p.size * 2.6, p.size * 0.36);
            break;
          }
          case "sparks":
          case "fireworks": {
            ctx.globalAlpha = p.rocket ? 0.9 : fade;
            ctx.strokeStyle = p.rocket ? "#fff3cf" : p.color;
            ctx.lineWidth = p.size;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(p.px - (p.x - p.px) * 2, p.py - (p.y - p.py) * 2);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            break;
          }
          case "bokeh": {
            const life = p.life / p.maxLife;
            ctx.globalAlpha = Math.sin(Math.min(1, life) * Math.PI) * 0.55;
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            g.addColorStop(0, p.color);
            g.addColorStop(0.65, withAlpha(p.color, 0.35));
            g.addColorStop(1, withAlpha(p.color, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
        }
        ctx.restore();
      }
      if (mode === "burst" && ps.length === 0) ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
    // burstKey restarts the effect for a new volley.
  }, [kind, palette, colors, mode, density, emitters, burstKey, reduce]);

  if (reduce) return null;
  return <canvas ref={ref} className={className} aria-hidden style={{ pointerEvents: "none" }} />;
}

/** Lighten (amt > 0) or darken (amt < 0) a hex colour. */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `rgb(${r},${g},${b})`;
}

function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
