"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import type { ParticlePreset } from "@/lib/motionThemes";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { PRESETS, type Particle, type PresetDef } from "./presets";

export interface BurstOptions {
  /** Defaults to the field's own preset. */
  preset?: ParticlePreset;
  /** Replaces the preset's colours (e.g. a template palette's flowers). */
  colors?: readonly string[];
  /** Burst origin for "origin"-spawn presets, as 0–1 fractions of the canvas. */
  origin?: { x: number; y: number };
}

export interface ParticleFieldHandle {
  burst: (opts?: BurstOptions) => void;
  /** Removes every particle immediately. */
  clear: () => void;
}

const MAX_BURST = 120;
const MAX_AMBIENT = 40;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * One canvas, one requestAnimationFrame loop, a fixed pool of particles.
 *
 * - mode "burst": idle until `ref.burst()` is called (e.g. when an intro
 *   opens), then plays the preset once.
 * - mode "ambient": keeps a small population of the preset alive, looping.
 *
 * Performance rules: devicePixelRatio capped at 2; at most 120 burst / 40
 * ambient particles, halved on devices with 4 or fewer cores; the loop
 * stops when nothing is alive, and pauses while the canvas is off-screen or
 * the tab is hidden; the frame loop only mutates pooled objects (no
 * allocation). With prefers-reduced-motion it renders nothing.
 */
export default function ParticleField({
  preset,
  mode,
  colors,
  className,
  ref,
}: {
  preset: ParticlePreset;
  mode: "burst" | "ambient";
  colors?: readonly string[];
  className?: string;
  ref?: Ref<ParticleFieldHandle>;
}) {
  const reduceMotion = useSafeReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef<(opts?: BurstOptions) => void>(() => {});
  const clearRef = useRef<() => void>(() => {});

  useImperativeHandle(
    ref,
    () => ({ burst: (opts) => burstRef.current(opts), clear: () => clearRef.current() }),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4;
    const cap = Math.floor((mode === "burst" ? MAX_BURST : MAX_AMBIENT) / (lowEnd ? 2 : 1));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pool: (Particle & { def: PresetDef })[] = Array.from({ length: cap }, () => ({
      alive: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      angle: 0,
      spin: 0,
      phase: 0,
      age: 0,
      life: 1,
      color: "#fff",
      def: PRESETS[preset],
    }));

    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
    };
    resize();

    const spawn = (
      p: Particle & { def: PresetDef },
      def: PresetDef,
      palette: readonly string[],
      origin: { x: number; y: number },
      scatter: boolean
    ) => {
      p.def = def;
      p.alive = true;
      p.size = rand(def.size[0], def.size[1]);
      p.vx = rand(def.vx[0], def.vx[1]);
      p.vy = rand(def.vy[0], def.vy[1]);
      p.angle = rand(0, Math.PI * 2);
      p.spin = rand(def.spin[0], def.spin[1]);
      p.phase = rand(0, Math.PI * 2);
      p.life = rand(def.life[0], def.life[1]);
      p.age = 0;
      p.color = palette[Math.floor(Math.random() * palette.length)];
      switch (def.spawn) {
        case "top":
          p.x = rand(0, W);
          p.y = scatter ? rand(0, H) : -rand(10, H * 0.8);
          break;
        case "bottom":
          p.x = rand(0, W);
          p.y = scatter ? rand(0, H) : H + rand(10, H * 0.3);
          break;
        case "origin":
          p.x = origin.x * W + rand(-12, 12);
          p.y = origin.y * H + rand(-12, 12);
          break;
        case "area":
          p.x = rand(0, W);
          p.y = rand(0, H * 0.6);
          break;
      }
      if (scatter) p.age = rand(0, p.life * 0.6);
    };

    const ambientDef = PRESETS[preset];
    const ambientColors = colors ?? ambientDef.colors;
    const center = { x: 0.5, y: 0.5 };

    let raf = 0;
    let running = false;
    let visible = true;
    let tabVisible = !document.hidden;
    let last = 0;
    let clock = 0;

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      clock += dt;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.alive) continue;
        const def = p.def;
        p.age += dt;
        p.vy += def.gravity * dt;
        p.x += (p.vx + def.sway * Math.sin(Math.PI * 2 * def.swayFreq * p.age + p.phase)) * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        const gone =
          p.age >= p.life ||
          (p.vy >= 0 && p.y > H + 40) ||
          (p.vy < 0 && p.y < -40) ||
          p.x < -60 ||
          p.x > W + 60;
        if (gone) {
          if (mode === "ambient") spawn(p, ambientDef, ambientColors, center, false);
          else {
            p.alive = false;
            continue;
          }
        }
        alive++;
        const fadeIn = Math.min(1, p.age / 0.25);
        const fadeOut = Math.min(1, (p.life - p.age) / (p.life * 0.25));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut)) * 0.92;
        ctx.globalCompositeOperation = def.blend;
        def.draw(ctx, p, clock);
        ctx.restore();
      }
      if ((alive > 0 || mode === "ambient") && visible && tabVisible) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        if (alive === 0) ctx.clearRect(0, 0, W, H);
      }
    };

    const start = () => {
      if (running || !visible || !tabVisible) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    burstRef.current = (opts) => {
      const def = PRESETS[opts?.preset ?? preset];
      const palette = opts?.colors ?? (opts?.preset ? def.colors : (colors ?? def.colors));
      const origin = opts?.origin ?? center;
      const n = Math.min(def.count, cap);
      let spawned = 0;
      for (let i = 0; i < pool.length && spawned < n; i++) {
        if (pool[i].alive) continue;
        spawn(pool[i], def, palette, origin, false);
        spawned++;
      }
      start();
    };

    clearRef.current = () => {
      for (let i = 0; i < pool.length; i++) pool[i].alive = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
    };

    if (mode === "ambient") {
      const n = Math.min(ambientDef.ambientCount, cap);
      for (let i = 0; i < n; i++) spawn(pool[i], ambientDef, ambientColors, center, true);
      start();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const onVisibility = () => {
      tabVisible = !document.hidden;
      if (tabVisible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      burstRef.current = () => {};
      clearRef.current = () => {};
    };
  }, [preset, mode, colors, reduceMotion]);

  if (reduceMotion) return null;
  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
