"use client";

import { useEffect, useRef } from "react";
import ParticleField, { type ParticleFieldHandle } from "../particles/ParticleField";
import { RSVP_SENT_EVENT } from "../intros/events";
import { useMotionTheme } from "./MotionThemeProvider";

/** The template's `rsvpBurst` preset, fired from the bottom of the RSVP
 * section when a guest submits an RSVP saying they'll attend. Fills the
 * nearest positioned ancestor; renders nothing if the theme has none. */
export default function RsvpBurst() {
  const { rsvpBurst } = useMotionTheme();
  const ref = useRef<ParticleFieldHandle>(null);

  useEffect(() => {
    if (!rsvpBurst) return;
    const onSent = (e: Event) => {
      if ((e as CustomEvent<{ attending: boolean }>).detail?.attending) {
        ref.current?.burst({ preset: rsvpBurst, origin: { x: 0.5, y: 0.85 } });
      }
    };
    window.addEventListener(RSVP_SENT_EVENT, onSent);
    return () => window.removeEventListener(RSVP_SENT_EVENT, onSent);
  }, [rsvpBurst]);

  if (!rsvpBurst) return null;
  return (
    <ParticleField
      ref={ref}
      preset={rsvpBurst}
      mode="burst"
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
    />
  );
}
