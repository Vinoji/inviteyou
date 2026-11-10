/**
 * The hand-drawn pieces of "Velum Mayilum Valaikaappu": a mango-leaf
 * thoranam, swinging brass bells, the gold invocation frame, a kolam that
 * draws itself, a gold divider, and a strip of grass.
 * Plain SVG, so they stay sharp at any size; motion lives in the CSS module.
 */
import type { ReactNode } from "react";
import s from "./valaikappu.module.css";

/** Mango leaves hanging from a cord, with marigolds — a repeating strip. */
export function Thoranam({ id }: { id: string }) {
  const leaves = [
    { x: 8, r: -8, c: "#2f7a32" },
    { x: 24, r: 4, c: "#3d9140" },
    { x: 40, r: -3, c: "#2a6e2d" },
    { x: 72, r: 6, c: "#3d9140" },
    { x: 88, r: -6, c: "#2f7a32" },
    { x: 104, r: 3, c: "#47a04a" },
  ];
  return (
    <svg className={s.thoranam} width="100%" height="96" aria-hidden>
      <defs>
        <linearGradient id={`${id}-leaf`} x1="0" x2="1">
          <stop offset="0" stopColor="#1f5c23" />
          <stop offset="0.5" stopColor="#4aa64c" />
          <stop offset="1" stopColor="#24642a" />
        </linearGradient>
        <radialGradient id={`${id}-marigold`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#ffd25e" />
          <stop offset="0.6" stopColor="#ff9f1c" />
          <stop offset="1" stopColor="#e2650c" />
        </radialGradient>
        <pattern id={`${id}-tile`} width="112" height="96" patternUnits="userSpaceOnUse">
          {leaves.map((l, i) => (
            <g key={i} transform={`rotate(${l.r} ${l.x} 10)`}>
              <path
                d={`M${l.x} 8 C${l.x - 10} 28 ${l.x - 9} 62 ${l.x} 88 C${l.x + 9} 62 ${l.x + 10} 28 ${l.x} 8Z`}
                fill={i % 2 ? `url(#${id}-leaf)` : l.c}
                stroke="#1b4d1f"
                strokeWidth="0.8"
              />
              <path d={`M${l.x} 10 L${l.x} 84`} stroke="#a8d58a" strokeWidth="0.9" opacity="0.7" />
            </g>
          ))}
          <line x1="56" y1="8" x2="56" y2="22" stroke="#c98a1c" strokeWidth="1.2" />
          <circle cx="56" cy="30" r="9" fill={`url(#${id}-marigold)`} />
          <circle cx="56" cy="48" r="7.5" fill={`url(#${id}-marigold)`} />
          <circle cx="56" cy="63" r="6" fill={`url(#${id}-marigold)`} />
          <path d="M0 8 Q28 13 56 8 T112 8" fill="none" stroke="#9c6a1d" strokeWidth="2.2" />
        </pattern>
      </defs>
      <rect width="100%" height="96" fill={`url(#${id}-tile)`} />
    </svg>
  );
}

/** A brass temple bell on a chain; it swings from the top. */
export function Bell({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg className={`${s.bell} ${className}`} viewBox="0 0 60 130" aria-hidden>
      <defs>
        <linearGradient id={`${id}-brass`} x1="0" x2="1">
          <stop offset="0" stopColor="#6b4510" />
          <stop offset="0.28" stopColor="#d9a441" />
          <stop offset="0.45" stopColor="#fbe3a0" />
          <stop offset="0.7" stopColor="#c58a26" />
          <stop offset="1" stopColor="#5c3a0c" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx="30" cy={6 + i * 11} rx="3.4" ry="5.6" fill="none" stroke={`url(#${id}-brass)`} strokeWidth="2.4" />
      ))}
      <circle cx="30" cy="62" r="5" fill={`url(#${id}-brass)`} />
      <path d="M30 64 C14 66 12 84 10 104 L50 104 C48 84 46 66 30 64Z" fill={`url(#${id}-brass)`} stroke="#5c3a0c" strokeWidth="1" />
      <path d="M17 82 Q30 78 43 82" fill="none" stroke="#7a4f12" strokeWidth="1.4" opacity="0.7" />
      <path d="M14 94 Q30 90 46 94" fill="none" stroke="#7a4f12" strokeWidth="1.4" opacity="0.7" />
      <ellipse cx="30" cy="104" rx="22" ry="5" fill={`url(#${id}-brass)`} stroke="#5c3a0c" strokeWidth="1" />
      <circle className={s.clapper} cx="30" cy="114" r="5.5" fill={`url(#${id}-brass)`} stroke="#5c3a0c" strokeWidth="0.8" />
    </svg>
  );
}

/** The gold frame with pointed ends that holds the invocation. */
export function InvocationFrame({ children }: { children: ReactNode }) {
  return (
    <div className={s.frame}>
      <svg className={s.frameArt} viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden>
        <path d="M22 4 H278 L296 35 L278 66 H22 L4 35Z" fill="#fffaf0" stroke="#c9962c" strokeWidth="2.4" />
        <path d="M27 10 H273 L287 35 L273 60 H27 L13 35Z" fill="none" stroke="#c9962c" strokeWidth="1" />
      </svg>
      <span className={s.frameText}>{children}</span>
    </div>
  );
}

/** A small kolam of dots and loops that draws itself in. */
export function Kolam({ className = "" }: { className?: string }) {
  const dots: [number, number][] = [];
  for (let r = -2; r <= 2; r++)
    for (let c = -2; c <= 2; c++) if (Math.abs(r) + Math.abs(c) <= 2) dots.push([60 + c * 16, 60 + r * 16]);
  return (
    <svg className={`${s.kolam} ${className}`} viewBox="0 0 120 120" aria-hidden>
      <g fill="none" stroke="#8e1b1b" strokeWidth="1.6" strokeLinecap="round" className={s.kolamLines}>
        <path d="M60 12 L108 60 L60 108 L12 60Z" />
        <path d="M60 28 L92 60 L60 92 L28 60Z" />
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="7" />
        ))}
      </g>
      <g fill="#8e1b1b">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.8" />
        ))}
      </g>
    </svg>
  );
}

/** A thin gold rule with a flourish in the middle. */
export function Divider() {
  return (
    <svg className={s.divider} viewBox="0 0 220 20" aria-hidden>
      <path d="M4 10 H88 M132 10 H216" stroke="#c9962c" strokeWidth="1.4" />
      <path d="M110 2 C116 8 124 10 132 10 C124 10 116 12 110 18 C104 12 96 10 88 10 C96 10 104 8 110 2Z" fill="#c9962c" />
      <circle cx="110" cy="10" r="2.4" fill="#fff3d0" />
    </svg>
  );
}

/** Blades of grass along the foot of a screen. */
export function Grass({ id }: { id: string }) {
  return (
    <svg className={s.grass} width="100%" height="44" aria-hidden>
      <defs>
        <pattern id={`${id}-grass`} width="60" height="44" patternUnits="userSpaceOnUse">
          {[4, 12, 19, 27, 35, 43, 51, 57].map((x, i) => (
            <path
              key={x}
              d={`M${x} 44 Q${x + (i % 2 ? 4 : -4)} ${22 - (i % 3) * 6} ${x + (i % 2 ? 7 : -6)} ${6 + (i % 3) * 5} Q${x + 1} 26 ${x + 4} 44Z`}
              fill={i % 2 ? "#4f9a3a" : "#3b8030"}
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="44" fill={`url(#${id}-grass)`} />
    </svg>
  );
}
