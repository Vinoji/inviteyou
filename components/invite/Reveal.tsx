"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fades + slides a section up into place the first time it scrolls into
 * view, then leaves it alone (no re-hiding on scroll back up — that reads
 * as flickery, not elegant). Built on Framer Motion's `whileInView` so the
 * animation uses real spring physics instead of a CSS transition, and
 * respects prefers-reduced-motion via `useReducedMotion`.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }}
      transition={{ type: "spring", stiffness: 60, damping: 16, delay }}
    >
      {children}
    </motion.div>
  );
}
