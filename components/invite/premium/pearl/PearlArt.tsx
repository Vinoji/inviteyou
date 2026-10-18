"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { scriptLang } from "@/lib/monogram";
import s from "./pearl.module.css";

/**
 * The art of "Pearl Curtain", all drawn in code: embossed leaves on a sage
 * wall, an ivory plaque with gold scrollwork and pearls, ivory silk
 * curtains strung with pearls (closed, or gathered and tied back), and
 * embroidered cypress trees on linen.
 */

/* ------------------------------------------------------------------ */
/* Embossed leaves on the sage wall                                    */
/* ------------------------------------------------------------------ */

const SPRIGS = [
  { x: 6, y: 18, r: 35, s: 1.2 },
  { x: 92, y: 12, r: -140, s: 1 },
  { x: 2, y: 62, r: 15, s: 1.4 },
  { x: 96, y: 58, r: -160, s: 1.3 },
  { x: 30, y: 4, r: 70, s: 0.8 },
  { x: 70, y: 96, r: -100, s: 0.9 },
  { x: 18, y: 92, r: -20, s: 1 },
  { x: 86, y: 86, r: 200, s: 0.9 },
];

function Sprig() {
  // A stem with alternating leaves.
  return (
    <g fill="#7c8c69" stroke="#93a37f" strokeWidth="0.8">
      <path d="M0 0 Q40 -6 90 -2" fill="none" strokeWidth="1.6" />
      {[12, 30, 48, 66, 82].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${-1 - i * 0.2} q8 ${i % 2 ? 14 : -14} 22 ${i % 2 ? 10 : -10} q-12 ${i % 2 ? 2 : -2} -22 ${i % 2 ? -10 : 10}z`}
        />
      ))}
      <path d="M88 -2 q12 -4 18 2 q-8 6 -18 -2z" />
    </g>
  );
}

export function SageWall() {
  return (
    <div className={s.wall}>
      <svg className={s.wallLeaves} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {SPRIGS.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.s * 0.2})`}>
            <Sprig />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The ivory plaque                                                    */
/* ------------------------------------------------------------------ */

/** Right half of the scalloped outline, top centre to bottom centre. */
const RIGHT = [
  [200, 12],
  [240, 30],
  [282, 38],
  [326, 50],
  [348, 92],
  [360, 138],
  [372, 186],
  [350, 232],
  [382, 280],
  [350, 328],
  [372, 374],
  [360, 422],
  [348, 468],
  [326, 510],
  [282, 522],
  [240, 530],
  [200, 548],
];

/** A smooth closed path through the points (Catmull-Rom). */
function smooth(points: number[][], k = 1) {
  const n = points.length;
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d + "Z";
}

const OUTLINE = (() => {
  const left = RIGHT.slice(1, -1)
    .map(([x, y]) => [400 - x, y])
    .reverse();
  return smooth([...RIGHT, ...left]);
})();

/** Scale the outline about the plaque's centre, for the inner gold line. */
const INNER = (() => {
  const left = RIGHT.slice(1, -1)
    .map(([x, y]) => [400 - x, y])
    .reverse();
  const pts = [...RIGHT, ...left].map(([x, y]) => [200 + (x - 200) * 0.88, 280 + (y - 280) * 0.92]);
  return smooth(pts);
})();

/** A C-scroll with a curl at each end. */
const SCROLL = "M0 0 C6 -18 30 -22 38 -8 C44 4 32 14 24 6 C18 0 24 -8 30 -4 M0 0 C-4 14 6 26 18 26 C26 26 28 18 22 15";

const SCROLLS = [
  { x: 128, y: 70, r: 200, f: 1 },
  { x: 272, y: 70, r: -20, f: -1 },
  { x: 86, y: 170, r: 250, f: 1 },
  { x: 314, y: 170, r: -70, f: -1 },
  { x: 86, y: 390, r: 110, f: 1 },
  { x: 314, y: 390, r: 70, f: -1 },
  { x: 128, y: 490, r: 160, f: 1 },
  { x: 272, y: 490, r: 20, f: -1 },
  { x: 62, y: 280, r: 180, f: 1 },
  { x: 338, y: 280, r: 0, f: -1 },
];

function LeafSprig({ y, flip }: { y: number; flip?: boolean }) {
  return (
    <g transform={`translate(200 ${y}) scale(1 ${flip ? -1 : 1})`} fill="#a88a45" stroke="#7d6427" strokeWidth="0.8">
      <path d="M0 40 V-30" fill="none" stroke="#8a6f30" strokeWidth="2" />
      <path d="M0 -40 q9 16 0 30 q-9 -14 0 -30z" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${-14 + i * 16})`}>
          <path d={`M0 0 q${18 + i * 4} -16 ${30 + i * 6} -8 q-14 12 -${30 + i * 6} 8z`} />
          <path d={`M0 0 q-${18 + i * 4} -16 -${30 + i * 6} -8 q14 12 ${30 + i * 6} 8z`} />
        </g>
      ))}
    </g>
  );
}

function Rule({ y }: { y: number }) {
  return (
    <g stroke="#9a7c3a" fill="#a88a45" strokeWidth="1.4">
      <path d={`M128 ${y} H186 M214 ${y} H272`} />
      <path d={`M200 ${y - 7} l6 7 l-6 7 l-6 -7z`} />
      <circle cx="180" cy={y} r="2.4" />
      <circle cx="220" cy={y} r="2.4" />
    </g>
  );
}

function Pearl({ x, y, r }: { x: number; y: number; r: number }) {
  return <circle cx={x} cy={y} r={r} fill="url(#pc-pearl)" stroke="rgba(120,100,60,.35)" strokeWidth="0.6" />;
}

export function Plaque({ label, font, style }: { label: string; font: string; style?: CSSProperties }) {
  return (
    <div className={s.plaque} style={style}>
      <svg viewBox="40 0 320 560" aria-hidden>
        <defs>
          <linearGradient id="pc-ivory" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbf7ec" />
            <stop offset="0.55" stopColor="#f1e9d6" />
            <stop offset="1" stopColor="#e2d6bb" />
          </linearGradient>
          <radialGradient id="pc-pearl" cx="0.36" cy="0.32" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#f6efe0" />
            <stop offset="0.8" stopColor="#d6c6a2" />
            <stop offset="1" stopColor="#b49f74" />
          </radialGradient>
          <filter id="pc-emboss" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="-0.8" dy="-0.8" stdDeviation="0.3" floodColor="#fffaf0" floodOpacity="0.9" />
            <feDropShadow dx="1" dy="1.2" stdDeviation="0.6" floodColor="#5b4a20" floodOpacity="0.45" />
          </filter>
        </defs>
        {/* Edge thickness, then the face */}
        <path d={OUTLINE} fill="#cdbf9f" transform="translate(3 5)" />
        <path d={OUTLINE} fill="url(#pc-ivory)" stroke="#d8cbaa" strokeWidth="2" />
        <g filter="url(#pc-emboss)">
          <path d={INNER} fill="none" stroke="#b8964f" strokeWidth="2.6" />
          {SCROLLS.map((c, i) => (
            <path
              key={i}
              d={SCROLL}
              fill="none"
              stroke="#b08c45"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`translate(${c.x} ${c.y}) rotate(${c.r}) scale(${c.f} 1)`}
            />
          ))}
          <LeafSprig y={170} />
          <LeafSprig y={392} flip />
          <Rule y={226} />
          <Rule y={336} />
        </g>
        <text
          x="200"
          y="292"
          textAnchor="middle"
          fontFamily={font}
          fontSize={label.length > 14 ? 22 : 28}
          letterSpacing="1.5"
          fill="#6f5a2c"
          style={{ textTransform: "uppercase" }}
          filter="url(#pc-emboss)"
        >
          {label}
        </text>
        {/* Pearl clusters at the crown and the base */}
        <Pearl x={186} y={22} r={11} />
        <Pearl x={214} y={22} r={11} />
        <Pearl x={200} y={12} r={8} />
        <Pearl x={184} y={520} r={11} />
        <Pearl x={214} y={520} r={11} />
        <Pearl x={199} y={540} r={12} />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Curtains                                                            */
/* ------------------------------------------------------------------ */

/** Gathered and tied back: narrow, pinched at the middle, flared below. */
export const CURTAIN = {
  left: {
    closed: { scaleX: 1, clipPath: "polygon(0% 0%, 100% 0%, 100% 10%, 100% 50%, 100% 100%, 0% 100%)" },
    tied: { scaleX: 0.42, clipPath: "polygon(0% 0%, 100% 0%, 92% 10%, 40% 50%, 72% 100%, 0% 100%)" },
  },
  right: {
    closed: { scaleX: 1, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%, 0% 10%)" },
    tied: { scaleX: 0.42, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 28% 100%, 60% 50%, 8% 10%)" },
  },
  /** Where the tie-backs sit, as a share of the stage. */
  tie: { left: "8.5%", right: "91.6%", top: "50%" },
} as const;

export function Curtain({
  side,
  open,
  duration = 1.8,
  delay = 0,
}: {
  side: "left" | "right";
  open: boolean;
  duration?: number;
  delay?: number;
}) {
  const c = CURTAIN[side];
  return (
    <motion.div
      className={`${s.curtain} ${side === "left" ? s.curtainLeft : s.curtainRight}`}
      initial={false}
      animate={open ? c.tied : c.closed}
      transition={{ duration, delay, ease: [0.6, 0, 0.25, 1] }}
      aria-hidden
    >
      <span className={s.pearlRope} />
      <span className={s.pearlHem} />
    </motion.div>
  );
}

export function Tieback({ side, show, delay = 0 }: { side: "left" | "right"; show: boolean; delay?: number }) {
  return (
    <motion.div
      className={s.tieback}
      style={{ left: CURTAIN.tie[side], top: CURTAIN.tie.top }}
      initial={false}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.6 }}
      transition={{ duration: 0.6, delay }}
      aria-hidden
    >
      <svg viewBox="0 0 40 120">
        <defs>
          <linearGradient id={`pc-tassel-${side}`} x1="0" x2="1">
            <stop offset="0" stopColor="#a8894a" />
            <stop offset="0.5" stopColor="#ecd9a6" />
            <stop offset="1" stopColor="#9c7e40" />
          </linearGradient>
        </defs>
        {/* Rope of pearls round the drape */}
        {[-14, -7, 0, 7, 14].map((x) => (
          <circle key={x} cx={20 + x} cy={8 + Math.abs(x) * 0.25} r="4" fill="#f7f0e0" stroke="#bfa877" strokeWidth="0.8" />
        ))}
        <circle cx="20" cy="22" r="7" fill={`url(#pc-tassel-${side})`} />
        <path d="M13 28 h14 l3 8 h-20z" fill={`url(#pc-tassel-${side})`} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${11 + i * 2.25} 36 V${98 + (i % 3) * 4}`} stroke={i % 2 ? "#cdb47a" : "#a8894a"} strokeWidth="2.2" />
        ))}
        <rect x="11" y="44" width="18" height="5" rx="2" fill="#9c7e40" />
      </svg>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Embroidered cypress trees and ferns                                 */
/* ------------------------------------------------------------------ */

export function Cypress({ height = 220, tone = 0 }: { height?: number; tone?: number }) {
  const rows = 22;
  const greens = [
    ["#2f5a2c", "#4a7a40", "#6d9a5c"],
    ["#3a6633", "#5b8a4f", "#86ab6f"],
  ][tone % 2];
  const leaves: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const y = 14 + r * 9.4;
    const half = 4 + (r / rows) * 30;
    const n = Math.max(1, Math.round(half / 6));
    for (let k = -n; k <= n; k++) {
      const x = 50 + (k / n) * half * 0.9;
      leaves.push(
        <ellipse
          key={`${r}-${k}`}
          cx={x.toFixed(1)}
          cy={(y + Math.abs(k) * 1.5).toFixed(1)}
          rx="3.4"
          ry="6.6"
          transform={`rotate(${(k * 9).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`}
          fill={greens[(r + k + 3) % 3]}
          stroke="rgba(255,255,240,.35)"
          strokeWidth="0.6"
        />
      );
    }
  }
  return (
    <svg viewBox="0 0 100 236" style={{ height, width: (height * 100) / 236 }} aria-hidden>
      <path d="M50 214 V236" stroke="#6b5434" strokeWidth="4" />
      {leaves}
    </svg>
  );
}

export function Fern({ height = 80, flip }: { height?: number; flip?: boolean }) {
  return (
    <svg viewBox="0 0 60 80" style={{ height, width: (height * 60) / 80, transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <path d="M30 80 Q28 40 34 6" fill="none" stroke="#4a6b3c" strokeWidth="1.6" />
      {Array.from({ length: 9 }, (_, i) => {
        const y = 70 - i * 7.2;
        const w = 22 - i * 2;
        return (
          <g key={i} fill={i % 2 ? "#5b8a4f" : "#4a7a40"} stroke="rgba(255,255,240,.35)" strokeWidth="0.5">
            <ellipse cx={30 - w / 2} cy={y - 2} rx={w / 2} ry="2.6" transform={`rotate(-18 ${30 - w / 2} ${y - 2})`} />
            <ellipse cx={31 + w / 2} cy={y - 4} rx={w / 2} ry="2.6" transform={`rotate(18 ${31 + w / 2} ${y - 4})`} />
          </g>
        );
      })}
    </svg>
  );
}

export function Trees({ scale = 1 }: { scale?: number }) {
  return (
    <div className={s.trees}>
      <div className={s.grove} style={{ marginLeft: -12 * scale }}>
        <Cypress height={230 * scale} />
        <Cypress height={160 * scale} tone={1} />
        <Fern height={70 * scale} />
      </div>
      <div className={s.grove} style={{ marginRight: -12 * scale }}>
        <Fern height={70 * scale} flip />
        <Cypress height={160 * scale} tone={1} />
        <Cypress height={230 * scale} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Names on the linen                                                  */
/* ------------------------------------------------------------------ */

export function PearlNames({
  kicker,
  a,
  b,
  aBelow,
  bBelow,
  date,
  font,
  className,
}: {
  kicker: string;
  a: string;
  b?: string;
  aBelow?: ReactNode;
  bBelow?: ReactNode;
  date?: string;
  font: string;
  className?: string;
}) {
  return (
    <div className={`${s.names} ${className ?? ""}`}>
      <div aria-hidden style={{ color: "#3f5e3a", fontSize: 22 }}>
        ♥
      </div>
      <p className={s.kicker}>{kicker}</p>
      <div className={s.heartRule} aria-hidden>
        ♥
      </div>
      <div role="heading" aria-level={1} style={{ fontFamily: font, fontWeight: 400 }}>
        <span className={s.name} lang={scriptLang(a)}>
          {a}
        </span>
        {aBelow && <div className={s.parents}>{aBelow}</div>}
        {b !== undefined && (
          <>
            <span className={s.amp}>&amp;</span>
            <span className={s.name} lang={scriptLang(b)}>
              {b}
            </span>
          </>
        )}
        {bBelow && <div className={s.parents}>{bBelow}</div>}
      </div>
      {date && <p className={s.date}>{date}</p>}
    </div>
  );
}
