"use client";

import s from "../landing/landing.module.css";

/**
 * The festival "paper-cut" scenery shared by every site page: dusk stars,
 * a thoranam of mango leaves and marigolds, a self-drawing kolam, drifting
 * petals, brass lamps and the paper hills that blend a dark banner into the
 * page. Styles live in components/landing/landing.module.css; every loop
 * stops under the guest's "Reduce motion" choice.
 */

/** Deterministic pseudo-random, so server and client render the same scene. */
function rand(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

// Fixed-precision strings, so server and browser render identical markup.
const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
const sec = (n: number) => `${n.toFixed(2)}s`;

const STARS = Array.from({ length: 34 }, (_, i) => ({
  left: pct(rand(i + 1)),
  top: pct(rand(i + 50)),
  delay: sec(rand(i + 90) * 3.4),
  size: `${2 + Math.round(rand(i + 7) * 2)}px`,
}));
const PETAL_COLORS = ["#ffb627", "#ff8c1a", "#ffd166", "#f25c54", "#ffe8a3"];
export const PETALS = Array.from({ length: 16 }, (_, i) => ({
  left: pct(rand(i + 200)),
  duration: sec(9 + rand(i + 300) * 8),
  delay: sec(-rand(i + 400) * 14),
  color: PETAL_COLORS[i % PETAL_COLORS.length],
}));

/** Marigold petals drifting down — shared by the hero and the closing band. */
export function Petals() {
  return (
    <div className={s.petals} aria-hidden>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className={s.petal}
          style={{ left: p.left, ["--d" as string]: p.duration, ["--delay" as string]: p.delay, ["--c" as string]: p.color }}
        />
      ))}
    </div>
  );
}

/** Mango leaves and marigold drops on a string, swaying. */
export function Thoranam({ compact = false }: { compact?: boolean }) {
  const n = 22;
  return (
    <div className={`${s.thoranam} ${compact ? s.thoranamStrip : ""}`} aria-hidden>
      {/* Compact strips keep the leaves' proportions and crop the sides. */}
      <svg viewBox="0 0 1100 110" preserveAspectRatio={compact ? "xMidYMin slice" : "none"}>
        <path d="M0 14 Q550 58 1100 14" fill="none" stroke="#e8b04a" strokeWidth="3" />
        {Array.from({ length: n }, (_, i) => {
          const x = 25 + (i * 1050) / (n - 1);
          const y = 14 + 22 * (1 - Math.pow((x - 550) / 550, 2)); // on the string's curve
          const isLeaf = i % 2 === 0;
          return (
            <g key={i} className={s.leaf} style={{ animationDelay: `${(i % 5) * -0.6}s` }}>
              {isLeaf ? (
                <path
                  d={`M${x} ${y} C${x - 13} ${y + 18} ${x - 9} ${y + 40} ${x} ${y + 50} C${x + 9} ${y + 40} ${x + 13} ${y + 18} ${x} ${y}Z`}
                  fill={i % 4 === 0 ? "#2f7d3a" : "#3f9a4a"}
                  stroke="#1f5a28"
                  strokeWidth="1"
                />
              ) : (
                <>
                  <line x1={x} y1={y} x2={x} y2={y + 22} stroke="#e8b04a" strokeWidth="1.5" />
                  <circle cx={x} cy={y + 28} r="8" fill="#ff9f1c" />
                  <circle cx={x} cy={y + 28} r="4" fill="#ffc15e" />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** A kolam of dots and looping lines that draws itself, slowly. */
export function Kolam({ className = "" }: { className?: string }) {
  const dots: [number, number][] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) dots.push([60 + c * 60, 60 + r * 60]);
  return (
    <svg className={`${s.kolam} ${className}`} viewBox="0 0 360 360" aria-hidden>
      {dots.map(([x, y], i) => (
        <circle key={i} className={s.dot} cx={x} cy={y} r="3" />
      ))}
      <path pathLength={1} d="M30 180 Q60 120 90 180 T150 180 T210 180 T270 180 T330 180 Q300 240 270 180 T210 180 T150 180 T90 180 T30 180" />
      <path pathLength={1} d="M180 30 Q120 60 180 90 T180 150 T180 210 T180 270 T180 330 Q240 300 180 270 T180 210 T180 150 T180 90 T180 30" />
      <circle className={s.loop} pathLength={1} cx="180" cy="180" r="150" />
      <circle className={s.loop} pathLength={1} cx="180" cy="180" r="105" />
    </svg>
  );
}

export function Diya({ className }: { className: string }) {
  return (
    <svg className={`${s.diya} ${className}`} viewBox="0 0 60 50" aria-hidden>
      <ellipse cx="30" cy="30" rx="16" ry="12" fill="#ffb627" opacity="0.35" />
      <path className={s.flame} d="M30 6 C36 16 35 24 30 27 C25 24 24 16 30 6Z" fill="#ffd166" />
      <path d="M8 30 Q30 50 52 30 Q44 38 30 38 Q16 38 8 30Z" fill="#b5652a" />
      <path d="M8 30 Q30 36 52 30" fill="none" stroke="#e0914a" strokeWidth="2" />
    </svg>
  );
}

export function Grain() {
  return <div className={s.grain} aria-hidden />;
}

export function Stars() {
  return (
    <div className={s.stars} aria-hidden>
      {STARS.map((st, i) => (
        <span
          key={i}
          className={s.star}
          style={{ left: st.left, top: st.top, width: st.size, height: st.size, animationDelay: st.delay }}
        />
      ))}
    </div>
  );
}

/** Paper hills along a dark banner's bottom edge; the last layer is the page colour. */
export function Hills() {
  return (
    <div className={s.hills} aria-hidden>
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path d="M0 70 C200 20 360 110 560 70 S920 20 1120 70 S1360 110 1440 60 V140 H0Z" fill="#e8866a" opacity="0.55" />
        <path d="M0 95 C240 55 420 130 680 95 S1080 55 1300 95 S1420 110 1440 90 V140 H0Z" fill="#f7c3a0" opacity="0.6" />
        <path d="M0 118 C260 92 520 140 760 118 S1180 96 1440 116 V140 H0Z" fill="var(--page-bg, var(--background))" />
      </svg>
    </div>
  );
}

/**
 * A garland of mango leaves and marigolds hanging from a bar's bottom edge
 * (header, toolbars). A repeating SVG pattern, so it spans any width.
 */
export function Garland({ id, className = "" }: { id: string; className?: string }) {
  return (
    <div className={`${s.garland} ${className}`} aria-hidden>
      <svg width="100%" height="30">
        <defs>
          <pattern id={id} width="56" height="30" patternUnits="userSpaceOnUse">
            <path d="M0 2 Q14 9 28 2 T56 2" fill="none" stroke="#e8b04a" strokeWidth="1.5" />
            <path d="M14 6 C8 12 10 22 14 26 C18 22 20 12 14 6Z" fill="#3f9a4a" stroke="#1f5a28" strokeWidth="0.8" />
            <line x1="42" y1="4" x2="42" y2="12" stroke="#e8b04a" strokeWidth="1" />
            <circle cx="42" cy="17" r="5.5" fill="#ff9f1c" />
            <circle cx="42" cy="17" r="2.6" fill="#ffd166" />
          </pattern>
        </defs>
        <rect width="100%" height="30" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** A dotted-kolam divider with a small lamp at its centre, between sections. */
export function KolamDivider() {
  return (
    <div className={s.divider} aria-hidden>
      <svg viewBox="0 0 120 44">
        {[20, 40, 80, 100].map((x) => (
          <circle key={x} cx={x} cy="30" r="2.2" fill="currentColor" />
        ))}
        <path d="M14 30 Q30 12 46 30 T78 30 T106 30" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path className={s.flame} d="M60 4 C65 12 64 18 60 21 C56 18 55 12 60 4Z" fill="#ffb627" />
        <path d="M46 26 Q60 42 74 26 Q68 33 60 33 Q52 33 46 26Z" fill="#b5652a" />
      </svg>
    </div>
  );
}

/** Marigold-and-jasmine strings hanging down both sides of a section. */
export function SideGarlands() {
  const strings = [
    { side: "left", x: "2%", n: 11, delay: "0s" },
    { side: "left", x: "4.2%", n: 7, delay: "-1.2s" },
    { side: "right", x: "4.2%", n: 7, delay: "-0.6s" },
    { side: "right", x: "2%", n: 11, delay: "-1.8s" },
  ] as const;
  return (
    <div className={s.sideGarlands} aria-hidden>
      {strings.map((g, i) => (
        <span key={i} className={s.string} style={{ [g.side]: g.x, animationDelay: g.delay }}>
          {Array.from({ length: g.n }, (_, j) => (
            <i key={j} />
          ))}
        </span>
      ))}
    </div>
  );
}
