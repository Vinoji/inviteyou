"use client";

import { useState } from "react";

export type ParticleVariant = "specks" | "petals" | "bubbles";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 9,
    duration: 7 + Math.random() * 7,
    size: 4 + Math.random() * 5,
    drift: (Math.random() - 0.5) * 60,
  }));
}

/**
 * A lightweight, CSS-only ambient particle field — gold specks drifting up
 * (traditional-gold), petals falling (floral-pastel), or soft bubbles
 * rising (beach-boho). Deliberately not used on minimal-modern or
 * elegant-bw, whose whole identity is restraint.
 *
 * Randomized per mount via useState's lazy initializer, so re-renders of
 * the parent (e.g. every keystroke in the editor's live preview) don't
 * regenerate/jitter the particles.
 */
export default function Particles({
  variant,
  accentColor,
  count = 16,
}: {
  variant: ParticleVariant;
  accentColor: string;
  count?: number;
}) {
  const [particles] = useState(() => generateParticles(count));
  const cls =
    variant === "petals" ? "ns-petal" : variant === "bubbles" ? "ns-bubble" : "ns-speck";

  return (
    <div
      aria-hidden
      className="motion-reduce:hidden pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={cls}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: variant === "petals" ? p.size * 0.6 : p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--drift" as string]: `${p.drift}px`,
            ...(variant !== "petals" ? { backgroundColor: accentColor } : {}),
          }}
        />
      ))}
      <style>{`
        .ns-speck, .ns-bubble, .ns-petal {
          position: absolute;
          border-radius: 9999px;
          opacity: 0;
        }
        .ns-speck {
          bottom: -6%;
          box-shadow: 0 0 6px currentColor;
          animation-name: ns-rise;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .ns-bubble {
          bottom: -6%;
          animation-name: ns-rise;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .ns-petal {
          top: -6%;
          background: ${accentColor};
          border-radius: 60% 0 60% 0;
          animation-name: ns-fall;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
        @keyframes ns-rise {
          0% { transform: translate(0, 0); opacity: 0; }
          12% { opacity: 0.85; }
          88% { opacity: 0.5; }
          100% { transform: translate(var(--drift), -112vh); opacity: 0; }
        }
        @keyframes ns-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          12% { opacity: 0.85; }
          88% { opacity: 0.65; }
          100% { transform: translate(var(--drift), 112vh) rotate(220deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
