"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import useSafeReducedMotion from "./useSafeReducedMotion";

/**
 * Scales a block up from slightly-shrunk-and-faded to full size the first
 * time it scrolls into view — the "photos zoom/reveal themselves" effect.
 * Deliberately subtler than RotateReveal (no rotation) so it reads as a
 * gentle reveal rather than a flourish, suited to photo galleries.
 */
export default function ZoomReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useSafeReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 70, damping: 18, delay }}
    >
      {children}
    </motion.div>
  );
}
