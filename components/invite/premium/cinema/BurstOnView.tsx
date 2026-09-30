"use client";

import { useEffect, useRef, useState } from "react";
import CinemaParticles, { type Emitter, type ParticleKind } from "./CinemaParticles";
import c from "./cinema.module.css";

/**
 * One volley of particles the first time this spot scrolls into view —
 * confetti as the party details arrive, akshathai over the couple's names.
 * Fills its positioned parent.
 */
export default function BurstOnView({
  kind,
  palette,
  colors,
  emitters,
  density,
  delay = 250,
}: {
  kind: ParticleKind;
  palette?: Parameters<typeof CinemaParticles>[0]["palette"];
  colors?: string[];
  emitters?: Emitter[];
  density?: number;
  /** ms after it comes into view. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fire, setFire] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          timer = setTimeout(() => setFire(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [delay]);
  return (
    <div ref={ref} className={c.particles} aria-hidden>
      {fire && (
        <CinemaParticles
          kind={kind}
          palette={palette}
          colors={colors}
          emitters={emitters}
          density={density}
          mode="burst"
          className={c.particles}
        />
      )}
    </div>
  );
}
