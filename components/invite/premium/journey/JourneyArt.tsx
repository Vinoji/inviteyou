import type { CSSProperties, ReactNode } from "react";

/**
 * The drawn art of "Temple Journey" (SVG): marigold garlands and gold
 * lotus corners. Everything else is photographed or rendered offline
 * (public/art/temple-journey/: the gopuram, clouds and red silk).
 */

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ */
/* Clouds                                                              */
/* ------------------------------------------------------------------ */

/** Cumulus clouds, rendered offline (public/art/temple-journey/cloud-*). */
export function Cloud({ n = 1, style, className }: { n?: 1 | 2 | 3; style?: CSSProperties; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/art/temple-journey/cloud-${n}.webp`} alt="" className={className} style={style} aria-hidden />;
}

/* ------------------------------------------------------------------ */
/* Marigold garland                                                    */
/* ------------------------------------------------------------------ */

export function Garland({ width = 1000, swags = 5, y = 30, sag = 60 }: { width?: number; swags?: number; y?: number; sag?: number }) {
  const out: ReactNode[] = [];
  const span = width / swags;
  for (let s = 0; s < swags; s++) {
    const x0 = s * span;
    for (let k = 0; k <= 16; k++) {
      const f = k / 16;
      const x = x0 + f * span;
      const yy = y + Math.sin(Math.PI * f) * sag;
      out.push(<circle key={`${s}-${k}`} cx={r1(x)} cy={r1(yy)} r="9" fill={k % 3 === 0 ? "#f59e0b" : k % 3 === 1 ? "#fbbf24" : "#ea580c"} />);
      if (k % 4 === 2) out.push(<path key={`l${s}-${k}`} d={`M${r1(x)} ${r1(yy + 6)} q-8 16 0 30 q8 -14 0 -30z`} fill="#3f8a36" />);
    }
    // A drop at each knot
    out.push(
      <g key={`d${s}`}>
        {[0, 1, 2, 3].map((j) => (
          <circle key={j} cx={r1(x0)} cy={r1(y + 10 + j * 16)} r="8" fill={j % 2 ? "#fbbf24" : "#f472b6"} />
        ))}
      </g>
    );
  }
  return <>{out}</>;
}

/* ------------------------------------------------------------------ */
/* Gold lotus corner                                                   */
/* ------------------------------------------------------------------ */

export function LotusCorner({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 300 300" className={className} style={style} aria-hidden>
      <g fill="none" stroke="#e1b75a" strokeWidth="2.4" strokeLinecap="round">
        {[-60, -30, 0, 30, 60].map((a) => (
          <path key={a} d="M150 210 Q120 140 150 70 Q180 140 150 210Z" transform={`rotate(${a} 150 210)`} />
        ))}
        <path d="M150 210 Q120 160 150 120 Q180 160 150 210Z" fill="rgba(225,183,90,.25)" />
        <path d="M60 300 Q90 250 150 210 Q210 250 240 300" />
        {[0, 1, 2, 3, 4].map((k) => (
          <path key={k} d={`M${20 + k * 14} ${300 - k * 10} q30 -40 70 -40`} />
        ))}
        <path d="M0 160 Q60 170 90 230" />
        <path d="M10 110 Q70 140 100 200" />
      </g>
    </svg>
  );
}
