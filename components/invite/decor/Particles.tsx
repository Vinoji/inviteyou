"use client";

import { useState } from "react";

export type ParticleVariant = "specks" | "petals" | "bubbles" | "confetti" | "stars";

interface Particle {
  id: number;
  left: number;
  top?: number; // "stars" only — fixed position, no drift
  delay: number;
  duration: number;
  size: number;
  drift: number;
  rotate: number;
  color?: string; // "confetti" only — multi-color, ignores accentColor
}

const CONFETTI_COLORS = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

function generateParticles(variant: ParticleVariant, count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    top: variant === "stars" ? Math.random() * 70 : undefined,
    delay: Math.random() * (variant === "stars" ? 4 : 9),
    duration:
      variant === "stars" ? 1.8 + Math.random() * 2.4 : 7 + Math.random() * 7,
    size:
      variant === "confetti"
        ? 5 + Math.random() * 4
        : variant === "stars"
          ? 2 + Math.random() * 2
          : 4 + Math.random() * 5,
    drift: (Math.random() - 0.5) * 60,
    rotate: Math.random() * 360,
    color: variant === "confetti" ? CONFETTI_COLORS[id % CONFETTI_COLORS.length] : undefined,
  }));
}

/**
 * A lightweight, CSS-only ambient particle field: gold specks drifting up
 * (traditional-gold), petals falling (floral-pastel), soft bubbles rising
 * (beach-boho), multi-color confetti falling (birthday), or fixed
 * twinkling stars (proposal). Deliberately not used on minimal-modern or
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
  const [particles] = useState(() => generateParticles(variant, count));
  const cls =
    variant === "petals"
      ? "ns-petal"
      : variant === "bubbles"
        ? "ns-bubble"
        : variant === "confetti"
          ? "ns-confetti"
          : variant === "stars"
            ? "ns-star"
            : "ns-speck";

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
            top: p.top !== undefined ? `${p.top}%` : undefined,
            width: variant === "confetti" ? p.size * 0.7 : p.size,
            height: variant === "petals" ? p.size * 0.6 : p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--drift" as string]: `${p.drift}px`,
            ["--rotate" as string]: `${p.rotate}deg`,
            backgroundColor:
              variant === "confetti" ? p.color : variant !== "petals" ? accentColor : undefined,
          }}
        />
      ))}
      <style>{`
        .ns-speck, .ns-bubble, .ns-petal, .ns-confetti, .ns-star {
          position: absolute;
          opacity: 0;
        }
        .ns-speck, .ns-bubble {
          bottom: -6%;
          border-radius: 9999px;
          animation-name: ns-rise;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .ns-speck { box-shadow: 0 0 6px currentColor; }
        .ns-petal {
          top: -6%;
          background: ${accentColor};
          border-radius: 60% 0 60% 0;
          animation-name: ns-fall;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
        .ns-confetti {
          top: -6%;
          border-radius: 1px;
          animation-name: ns-fall;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
        .ns-star {
          border-radius: 9999px;
          box-shadow: 0 0 4px currentColor;
          animation-name: ns-twinkle;
          animation-timing-function: ease-in-out;
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
          12% { opacity: 0.9; }
          88% { opacity: 0.7; }
          100% { transform: translate(var(--drift), 112vh) rotate(var(--rotate)); opacity: 0; }
        }
        @keyframes ns-twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
