"use client";

import type { RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import useSafeReducedMotion from "../useSafeReducedMotion";

/**
 * A moon that rises into place as the hero scrolls past — tracked against
 * the hero section's own scroll range (via `containerRef`) rather than
 * whole-window scroll, so it animates correctly both on the public page
 * (window scroll) and inside the editor's live preview (which scrolls its
 * own panel, not the window). Used on proposal-starlit, where a night sky
 * is already the backdrop.
 */
export default function Moon({
  containerRef,
  className = "",
}: {
  containerRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const reduceMotion = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 0.3], [90, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  if (reduceMotion) {
    return (
      <div className={className} aria-hidden>
        <MoonGlyph />
      </div>
    );
  }

  return (
    <motion.div className={className} style={{ y, opacity }} aria-hidden>
      <MoonGlyph />
    </motion.div>
  );
}

function MoonGlyph() {
  return (
    <svg width="110" height="110" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <filter id="moon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <circle cx="60" cy="60" r="40" fill="#fff8e1" opacity="0.35" filter="url(#moon-glow)" />
      <circle cx="60" cy="60" r="30" fill="#fffdf5" />
      <circle cx="48" cy="48" r="5" fill="#f3e9c8" opacity="0.55" />
      <circle cx="70" cy="66" r="7" fill="#f3e9c8" opacity="0.45" />
      <circle cx="58" cy="72" r="3.5" fill="#f3e9c8" opacity="0.45" />
    </svg>
  );
}
