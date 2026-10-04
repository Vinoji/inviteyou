"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValue } from "framer-motion";
import SilentErrorBoundary from "../decor/SilentErrorBoundary";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scrollParent, usePaneHeight } from "../motion/scroll";
import { INTRO_DONE_EVENT, INTRO_OPENED_EVENT } from "../intros/events";
import { shotsFor, type Pose, type ShotId, type ShotTrack, type WorldId } from "./shots";
import type { Quality, TapFn } from "./PalaceScene";
import { PalaceBackdrop } from "./PalaceArt";
import p from "./palace.module.css";

// WebGL never runs on the server, and the scene is its own chunk so the
// page's first paint doesn't wait on three.js.
const PalaceScene = dynamic(() => import("./PalaceScene"), { ssr: false });

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** A rough device tier from what the browser will tell us. */
function detectQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  if (nav.connection?.saveData || cores <= 4 || memory <= 2) return "low";
  if (window.innerWidth < 768 || memory <= 4) return "mid";
  return "high";
}

/**
 * The palace behind the whole invitation: a sticky, screen-tall layer under
 * the sections. A CSS palace (PalaceBackdrop) is always drawn first, so the
 * page is complete without WebGL; the 3D scene loads on top once the guest
 * enters, and if WebGL is missing or fails, the CSS palace simply stays.
 *
 * Every section carries `data-palace-shot`; this follows the scroll and
 * tells the scene where along that list the guest is, so the camera walks
 * from the gate, down the hall, into the courtyard, and back out at the end.
 */
export default function PalaceStage({ world, gold, preview }: { world: WorldId; gold: string; preview: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useSafeReducedMotion();
  const paneHeight = usePaneHeight(ref, preview);
  const shots = useMemo(() => shotsFor(world), [world]);
  const track = useRef<ShotTrack>({ poses: [shots.entrance], at: 0 });
  const invalidate = useRef<() => void>(() => {});
  const progress = useMotionValue(0);
  const [gl, setGl] = useState<{ quality: Quality } | null>(null);
  const [active, setActive] = useState(true);

  // Load the 3D scene once the guest is through the intro (or soon after,
  // in the editor), never during the intro's own animation.
  useEffect(() => {
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      if (hasWebGL()) setGl({ quality: detectQuality() });
    };
    const fallback = setTimeout(start, preview ? 800 : 6000);
    window.addEventListener(INTRO_OPENED_EVENT, start);
    window.addEventListener(INTRO_DONE_EVENT, start);
    return () => {
      clearTimeout(fallback);
      window.removeEventListener(INTRO_OPENED_EVENT, start);
      window.removeEventListener(INTRO_DONE_EVENT, start);
    };
  }, [preview]);

  // Pause rendering in a hidden tab or when the invitation is off screen.
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-invite-root]");
    let onScreen = true;
    const update = () => setActive(onScreen && !document.hidden);
    const io = root
      ? new IntersectionObserver(([e]) => {
          onScreen = e.isIntersecting;
          update();
        })
      : null;
    if (root) io?.observe(root);
    document.addEventListener("visibilitychange", update);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Scroll → position along the sections' camera poses.
  useEffect(() => {
    const stage = ref.current;
    const root = stage?.closest<HTMLElement>("[data-invite-root]");
    if (!stage || !root) return;
    const container = scrollParent(stage);
    const target: HTMLElement | Window = container ?? window;
    let raf = 0;
    const run = () => {
      raf = 0;
      const vp = container ? container.getBoundingClientRect() : new DOMRect(0, 0, innerWidth, innerHeight);
      const mid = vp.top + vp.height * 0.55;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-palace-shot]"));
      const poses: Pose[] = [];
      let at = 0;
      nodes.forEach((el, i) => {
        poses.push(shots[el.dataset.palaceShot as ShotId] ?? shots.hero);
        const r = el.getBoundingClientRect();
        if (r.top <= mid) at = i + Math.min(1, (mid - r.top) / Math.max(1, r.height));
      });
      track.current = { poses, at: Math.min(at, poses.length - 1) };
      const rr = root.getBoundingClientRect();
      const scrollable = rr.height - vp.height;
      progress.set(scrollable > 0 ? Math.min(1, Math.max(0, (vp.top - rr.top) / scrollable)) : 0);
      invalidate.current();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    // Sections change height as images load and the RSVP form expands.
    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [progress, shots]);

  const onInvalidate = useCallback((fn: () => void) => {
    invalidate.current = fn;
  }, []);

  // Taps on the scene: a click on the page that lands on bare background
  // (a section itself, not its text, cards, links or form) goes into the
  // 3D world, where the park makes blossoms, water and birds respond.
  const tap = useRef<TapFn | null>(null);
  const onTapReady = useCallback((fn: TapFn) => {
    tap.current = fn;
  }, []);
  useEffect(() => {
    const stage = ref.current;
    const root = stage?.closest<HTMLElement>("[data-invite-root]");
    if (!stage || !root) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !tap.current) return;
      if (!target.matches("[data-palace-shot], [data-palace-content], [data-palace-tap]")) return;
      const r = stage.getBoundingClientRect();
      tap.current({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 });
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  const height = paneHeight ?? undefined;
  return (
    <div
      ref={ref}
      className={p.stage}
      style={height ? { height, marginBottom: -height } : undefined}
      aria-hidden
    >
      <PalaceBackdrop world={world} progress={progress} still={reduceMotion} />
      {gl && (
        <div className={p.canvasWrap}>
          <SilentErrorBoundary>
            <PalaceScene
              world={world}
              track={track}
              quality={gl.quality}
              still={reduceMotion}
              frameloop={!active ? "never" : reduceMotion ? "demand" : "always"}
              gold={gold}
              onInvalidate={onInvalidate}
              onTapReady={onTapReady}
            />
          </SilentErrorBoundary>
        </div>
      )}
      {/* Vignette keeps text readable over the brightest parts of the scene. */}
      <div className={p.vignette} />
      <motion.div className={p.progress} style={{ scaleX: progress }} />
    </div>
  );
}
