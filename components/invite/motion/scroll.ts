"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

/**
 * Scroll-linked progress as MotionValues (never React state), working both
 * on the public page (the window scrolls) and in the editor preview (a
 * scrolling pane does). Framer's useScroll only tracks the window unless
 * given a container ref up front, which a shared component can't know, so
 * these find the scroll container themselves.
 */

/** Nearest ancestor that scrolls vertically, or null for the window. */
export function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let node = el?.parentElement ?? null; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
  }
  return null;
}

/** Calls `update` on every scroll/resize of el's scroll container (rAF-throttled). */
function useScrollListener(ref: RefObject<HTMLElement | null>, update: (vp: DOMRect) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const container = scrollParent(el);
    const target: HTMLElement | Window = container ?? window;
    let raf = 0;
    const viewport = () =>
      container ? container.getBoundingClientRect() : new DOMRect(0, 0, innerWidth, innerHeight);
    const run = () => {
      raf = 0;
      update(viewport());
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
    // `update` only writes to MotionValues created once; safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

/** 0 when the element's top reaches the bottom of the viewport, 1 when it
 * reaches the viewport's vertical centre. */
export function useEnterProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const progress = useMotionValue(0);
  useScrollListener(ref, (vp) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top - vp.top;
    const p = (vp.height - top) / (vp.height / 2);
    progress.set(Math.min(1, Math.max(0, p)));
  });
  return progress;
}

/** 0 at the top of the invitation, 1 at its bottom. Measures the nearest
 * `[data-invite-root]` ancestor of `ref` (or `ref` itself), so any section
 * can follow whole-page progress. */
export function usePageProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const progress = useMotionValue(0);
  useScrollListener(ref, (vp) => {
    const el = ref.current?.closest<HTMLElement>("[data-invite-root]") ?? ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const scrollable = r.height - vp.height;
    const p = scrollable > 0 ? (vp.top - r.top) / scrollable : 0;
    progress.set(Math.min(1, Math.max(0, p)));
  });
  return progress;
}

/** For a tall element with a sticky child: 0 when its top reaches the top
 * of the viewport, 1 when its bottom reaches the bottom — the "pinned"
 * stretch of scrolling. */
export function useStickyProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const progress = useMotionValue(0);
  useScrollListener(ref, (vp) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const scrollable = r.height - vp.height;
    const p = scrollable > 0 ? (vp.top - r.top) / scrollable : 0;
    progress.set(Math.min(1, Math.max(0, p)));
  });
  return progress;
}

/** 0 when the element's top enters at the bottom of the viewport, 1 when
 * its bottom leaves at the top — the whole trip across the screen. Works
 * for elements of any height. */
export function useTraverseProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const progress = useMotionValue(0);
  useScrollListener(ref, (vp) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = (vp.bottom - r.top) / (vp.height + r.height);
    progress.set(Math.min(1, Math.max(0, p)));
  });
  return progress;
}

/** Visible height of the element's scroll container (for sticky frames). */
export function usePaneHeight(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const pane = scrollParent(ref.current);
    if (!pane) return;
    const measure = () => setHeight(pane.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(pane);
    return () => ro.disconnect();
  }, [ref, enabled]);
  return height;
}
