"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import useSafeReducedMotion from "./useSafeReducedMotion";

/**
 * Rotates + scales a small element (an ornament, a ring, a divider motif)
 * into its resting position the first time it scrolls into view — the
 * "ornaments rotate into position" effect. Same once-only, reduced-motion-
 * safe contract as Reveal, just with a different entrance shape.
 */
export default function RotateReveal({
  children,
  className = "",
  delay = 0,
  fromRotate = -20,
  fromScale = 0.6,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  fromRotate?: number;
  fromScale?: number;
}) {
  const reduceMotion = useSafeReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, rotate: fromRotate, scale: fromScale }}
      whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 120, damping: 14, delay }}
    >
      {children}
    </motion.div>
  );
}
