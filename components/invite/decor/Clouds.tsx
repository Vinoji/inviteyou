"use client";

import { motion } from "framer-motion";
import useSafeReducedMotion from "../useSafeReducedMotion";

/**
 * A few soft, blurred cloud shapes drifting slowly across the hero on a
 * continuous loop — the "clouds move across the screen" effect. Built from
 * overlapping blurred circles (no external art), each cloud its own layer
 * so they drift at slightly different speeds for a little depth.
 */
export default function Clouds({ tint = "#ffffff" }: { tint?: string }) {
  const reduceMotion = useSafeReducedMotion();

  if (reduceMotion) return null;

  const layers = [
    { top: "18%", size: 120, duration: 46, opacity: 0.35, delay: 0 },
    { top: "32%", size: 80, duration: 60, opacity: 0.25, delay: -12 },
    { top: "10%", size: 60, duration: 38, opacity: 0.2, delay: -24 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {layers.map((layer, i) => (
        <motion.div
          key={i}
          className="absolute blur-2xl"
          style={{ top: layer.top, width: layer.size, height: layer.size * 0.45 }}
          initial={{ x: "-20vw" }}
          animate={{ x: "120vw" }}
          transition={{
            duration: layer.duration,
            delay: layer.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <CloudGlyph tint={tint} opacity={layer.opacity} />
        </motion.div>
      ))}
    </div>
  );
}

function CloudGlyph({ tint, opacity }: { tint: string; opacity: number }) {
  return (
    <svg viewBox="0 0 100 45" width="100%" height="100%" focusable="false">
      <ellipse cx="30" cy="28" rx="26" ry="16" fill={tint} opacity={opacity} />
      <ellipse cx="55" cy="20" rx="22" ry="18" fill={tint} opacity={opacity} />
      <ellipse cx="72" cy="30" rx="20" ry="13" fill={tint} opacity={opacity} />
    </svg>
  );
}
