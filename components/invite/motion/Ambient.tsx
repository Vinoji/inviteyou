"use client";

import ParticleField from "../particles/ParticleField";
import { useMotionTheme } from "./MotionThemeProvider";

/** The template's ambient particle loop (MotionTheme.ambient) for one of
 * the spots in `ambientAt`, filling the nearest positioned ancestor. It sits above that section's background (so
 * it's visible) but never takes clicks. Renders nothing when the theme has
 * none. */
export default function Ambient({ at }: { at: "hero" | "rsvp" | "thanks" }) {
  const { ambient, ambientAt = ["hero", "thanks"] } = useMotionTheme();
  if (!ambient || !ambientAt.includes(at)) return null;
  return (
    <ParticleField
      preset={ambient}
      mode="ambient"
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
    />
  );
}
