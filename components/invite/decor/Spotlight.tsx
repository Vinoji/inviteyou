"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A soft radial glow that drifts slowly across the hero — the kind of
 * ambient background effect popularized by libraries like Aceternity UI,
 * built here from scratch with Framer Motion + a CSS radial-gradient so it
 * costs nothing beyond one animated element. Used specifically on
 * minimal-modern and elegant-bw, which opt out of the particle field to
 * stay understated — this gives them *some* motion without clutter.
 */
export default function Spotlight({ accentColor }: { accentColor: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        className="absolute h-[70vmax] w-[70vmax] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${accentColor}33 0%, transparent 65%)`,
        }}
        animate={{
          x: ["-10%", "15%", "-5%", "-10%"],
          y: ["-20%", "5%", "10%", "-20%"],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
