"use client";

import { useRef, type RefObject } from "react";
import { animate, useMotionValue, useTransform } from "framer-motion";

/**
 * A growing circular hole cut into an intro (clip-path with an even-odd
 * path), revealing the invitation underneath — the kolam's circle of light,
 * the peony's opening window. Returns the `clipPath` MotionValue to put on
 * the intro's root and `open()` to start it from the centre of `from`.
 */
export function useRevealHole(
  rootRef: RefObject<HTMLElement | null>,
  fromRef: RefObject<HTMLElement | null>
) {
  const geom = useRef({ w: 0, h: 0, cx: 0, cy: 0 });
  const radius = useMotionValue(0);
  const clipPath = useTransform(radius, (r) => {
    if (r <= 0) return "none";
    const { w, h, cx, cy } = geom.current;
    return `path(evenodd, "M0 0H${w}V${h}H0Z M${cx} ${cy - r}A${r} ${r} 0 1 0 ${cx} ${cy + r}A${r} ${r} 0 1 0 ${cx} ${cy - r}Z")`;
  });

  function open(duration: number, ease: [number, number, number, number] = [0.45, 0, 0.3, 1]) {
    const root = rootRef.current?.getBoundingClientRect();
    const from = fromRef.current?.getBoundingClientRect();
    if (!root || !from) return;
    const cx = from.left - root.left + from.width / 2;
    const cy = from.top - root.top + from.height / 2;
    geom.current = { w: root.width, h: root.height, cx, cy };
    // Just past the farthest corner, so the whole sweep is visible.
    const max = Math.hypot(Math.max(cx, root.width - cx), Math.max(cy, root.height - cy)) * 1.04;
    animate(radius, max, { duration, ease });
  }

  return { clipPath, open };
}
