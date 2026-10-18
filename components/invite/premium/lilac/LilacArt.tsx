import type { CSSProperties } from "react";
import s from "./lilac.module.css";

/**
 * Lilac Seal's art, all drawn in code: the embossed florals (raised by a
 * light edge above and a shadow edge below, like blind-embossed card),
 * the wax seal, a butterfly, and the lotus under the pillaiyar suzhi.
 */

/** One embossed spray: a rose, buds and leaves, as outlines only. */
function Spray({ x, y, r = 0, k = 1 }: { x: number; y: number; r?: number; k?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>
      {/* rose: three rings of petals */}
      <path d="M0 -14c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14z" />
      <path d="M0 -8c5 0 8 4 8 8s-3 8-8 8-8-4-8-8 3-8 8-8z" />
      <path d="M-3 -2c2-3 6-3 7 0s-2 6-5 5" />
      <path d="M-14 0c-4-6-2-12 4-15M14 0c4-6 2-12-4-15M-10 11c-6 4-11 2-13-3M10 11c6 4 11 2 13-3" />
      {/* stem, leaves and buds */}
      <path d="M0 14c2 18-4 30-14 40" />
      <path d="M-4 30c-12-2-20 4-22 12 10 2 18-2 22-12zM-9 42c10-6 20-4 24 2-10 6-18 4-24-2z" />
      <path d="M14 -10c10-12 22-14 30-8-8 4-16 8-30 8zM-14 -10c-10-12-22-14-30-8 8 4 16 8 30 8z" />
      <path d="M30 -24c4-8 10-10 14-8-2 6-8 10-14 8zM-30 -24c-4-8-10-10-14-8 2 6 8 10 14 8z" />
    </g>
  );
}

/** A field of embossed sprays filling its box (viewBox 300 × 420). */
export function Emboss({ className = "" }: { className?: string }) {
  const sprays = [
    [40, 50, -20, 1], [160, 30, 15, 0.8], [260, 70, -10, 1.1], [90, 150, 30, 0.9], [220, 170, -25, 1],
    [30, 250, 10, 1.1], [150, 260, -15, 0.85], [270, 280, 20, 0.95], [80, 360, -30, 1], [210, 380, 12, 1.05],
  ] as const;
  return (
    <svg className={`${s.emboss} ${className}`} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {/* light edge (raised) then shadow edge, offset a hair */}
      <g className={s.embossLight} transform="translate(-0.7 -0.7)">
        {sprays.map(([x, y, r, k], i) => <Spray key={i} x={x} y={y} r={r} k={k} />)}
      </g>
      <g className={s.embossDark} transform="translate(0.7 0.7)">
        {sprays.map(([x, y, r, k], i) => <Spray key={i} x={x} y={y} r={r} k={k} />)}
      </g>
    </svg>
  );
}

/** The wax seal: a pooled disc with a pressed rim and the couple's initials. */
export function WaxSeal({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <radialGradient id="lilac-wax" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#f3ecfa" />
          <stop offset="0.45" stopColor="#d9c9ec" />
          <stop offset="1" stopColor="#a68cc9" />
        </radialGradient>
      </defs>
      {/* the poured edge, irregular */}
      <path
        d="M50 3c9 0 13 5 21 6s12 7 15 14 8 11 7 20 3 14-1 21-4 13-11 17-11 9-19 10-13 5-21 2-14-3-20-9-12-8-14-16-6-13-4-21 1-14 6-20 8-12 16-16 13-8 25-8z"
        fill="url(#lilac-wax)"
      />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#8a6fb3" strokeOpacity="0.45" strokeWidth="2.4" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="22"
        fill="#6f5596"
        style={{ fontFamily: "var(--font-greatvibes), cursive" }}
      >
        {initials}
      </text>
    </svg>
  );
}

/** A butterfly; its wings beat (CSS), and it can be set flying with a class. */
export function Butterfly({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={`${s.butterfly} ${className}`} style={style} viewBox="0 0 60 44" aria-hidden>
      <g className={s.wingL}>
        <path d="M30 22C22 6 8 0 3 6s2 18 14 18c-10 2-14 10-10 15s14 0 23-17z" fill="#efe6d6" stroke="#b8955a" strokeWidth="0.8" />
        <path d="M27 20C20 10 11 6 8 9" fill="none" stroke="#c9a978" strokeWidth="0.6" />
      </g>
      <g className={s.wingR}>
        <path d="M30 22C38 6 52 0 57 6s-2 18-14 18c10 2 14 10 10 15s-14 0-23-17z" fill="#efe6d6" stroke="#b8955a" strokeWidth="0.8" />
        <path d="M33 20C40 10 49 6 52 9" fill="none" stroke="#c9a978" strokeWidth="0.6" />
      </g>
      <path d="M30 12v22" stroke="#7a6248" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M30 12c-2-4-4-6-6-7M30 12c2-4 4-6 6-7" stroke="#7a6248" strokeWidth="0.6" fill="none" />
    </svg>
  );
}

/** A lotus in line art, under the invocation. */
export function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 52" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <path d="M60 46C52 34 52 18 60 6c8 12 8 28 0 40z" />
      <path d="M60 46C46 40 38 28 38 14c12 4 20 16 22 32zM60 46C74 40 82 28 82 14c-12 4-20 16-22 32z" />
      <path d="M60 46C40 46 26 38 20 26c14-2 30 6 40 20zM60 46c20 0 34-8 40-20-14-2-30 6-40 20z" />
      <path d="M14 48h92" />
    </svg>
  );
}

/** A thin lilac flourish to divide sections. */
export function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M10 10h66M124 10h66" />
      <path d="M100 3c-6 0-9 7-9 7s3 7 9 7 9-7 9-7-3-7-9-7z" />
      <path d="M80 10c4-5 8-5 11 0M120 10c-4-5-8-5-11 0" />
    </svg>
  );
}
