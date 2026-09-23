"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import useSafeReducedMotion from "./useSafeReducedMotion";

/**
 * True scroll-linked parallax (not viewport-triggered like Reveal) — as the
 * user scrolls through the element's own height, it translates vertically
 * by `speed` × the scroll distance. speed > 0 drifts down relative to
 * normal scroll (feels "behind"/slower, good for backgrounds); speed < 0
 * drifts up (feels "in front"/faster, good for foreground accents).
 */
export default function ParallaxLayer({
  children,
  speed = 0.3,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`]);

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
