import type { CSSProperties, ReactNode } from "react";

/**
 * The drawn art of "Temple Journey" (SVG): gopurams in gold
 * line art, marigold garlands, a hanging brass lamp and gold lotus corners. The gopuram the guest flies into is a real photograph and the
 * clouds are rendered offline (public/art/temple-journey/).
 */

/** Seeded random numbers, so every guest sees the same carvings. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PASTEL = ["#7fb2e5", "#f2a7c3", "#f6d26b", "#8fd18b", "#f2a65a", "#b9a2e0", "#6fd0c9", "#f7b4a0"];
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
/* Gopuram                                                             */
/* ------------------------------------------------------------------ */

/**
 * A temple tower, 600 × 900: a stone base with its doorway, nine tiers of
 * niches with figures narrowing upwards, and a barrel-vaulted crown with a
 * row of kalasams. `gold` draws it as gold line art instead of paint.
 */
export function Gopuram({ gold, seed = 3, className, style }: { gold?: boolean; seed?: number; className?: string; style?: CSSProperties }) {
  const rand = seeded(seed);
  const tiers = 9;
  const baseTop = 690;
  const top = 150;
  const items: ReactNode[] = [];
  const line = gold ? "#d9a441" : "rgba(80,60,50,.35)";
  const fill = (c: string) => (gold ? "none" : c);
  const sw = gold ? 1.6 : 0.8;
  let y = baseTop;
  for (let i = 0; i < tiers; i++) {
    const w0 = 380 - i * 26;
    const w1 = w0 - 22;
    const h = 62 - i * 2.4;
    const yTop = y - h;
    const x0 = 300 - w0 / 2;
    const x1 = 300 - w1 / 2;
    // Tier body
    items.push(
      <path
        key={`t${i}`}
        d={`M${r1(x0)} ${r1(y)} L${r1(x1)} ${r1(yTop + 10)} L${r1(600 - x1)} ${r1(yTop + 10)} L${r1(600 - x0)} ${r1(y)}Z`}
        fill={fill(i % 2 ? "#f3e7cf" : "#eadbbd")}
        stroke={line}
        strokeWidth={sw}
      />
    );
    // Cornice band
    items.push(
      <rect key={`c${i}`} x={r1(x1 - 6)} y={r1(yTop + 4)} width={r1(w1 + 12)} height="8" rx="3" fill={fill(PASTEL[i % PASTEL.length])} stroke={line} strokeWidth={sw} />
    );
    // Niches with figures
    const n = Math.max(3, Math.round(w1 / 30));
    const step = w1 / n;
    for (let k = 0; k < n; k++) {
      const cx = x1 + step * (k + 0.5);
      const ny = yTop + 16;
      const nh = h - 22;
      const c = PASTEL[Math.floor(rand() * PASTEL.length)];
      const big = k === Math.floor(n / 2);
      items.push(
        <g key={`n${i}-${k}`}>
          <path
            d={`M${r1(cx - step * 0.36)} ${r1(ny + nh)} V${r1(ny + 8)} Q${r1(cx)} ${r1(ny - 6)} ${r1(cx + step * 0.36)} ${r1(ny + 8)} V${r1(ny + nh)}Z`}
            fill={fill(big ? "#5d4a6e" : "#fbf5ea")}
            stroke={line}
            strokeWidth={sw}
          />
          {!big && (
            <>
              <circle cx={r1(cx)} cy={r1(ny + 10)} r={r1(step * 0.11)} fill={fill(rand() > 0.5 ? "#f6d26b" : "#7fb2e5")} stroke={line} strokeWidth={sw * 0.7} />
              <path
                d={`M${r1(cx - step * 0.18)} ${r1(ny + nh - 1)} L${r1(cx - step * 0.1)} ${r1(ny + 14)} L${r1(cx + step * 0.1)} ${r1(ny + 14)} L${r1(cx + step * 0.18)} ${r1(ny + nh - 1)}Z`}
                fill={fill(c)}
                stroke={line}
                strokeWidth={sw * 0.7}
              />
            </>
          )}
        </g>
      );
    }
    y = yTop + 8;
  }
  // Crown: the barrel vault and its horns
  const cw = 96;
  items.push(
    <g key="crown">
      <path
        d={`M${300 - cw} ${y} Q${300 - cw} ${top + 10} 300 ${top} Q${300 + cw} ${top + 10} ${300 + cw} ${y}Z`}
        fill={fill("#f2a7c3")}
        stroke={line}
        strokeWidth={sw}
      />
      <path d={`M${300 - cw - 8} ${y} q-26 -30 -6 -62 q6 26 26 34z`} fill={fill("#8fd18b")} stroke={line} strokeWidth={sw} />
      <path d={`M${300 + cw + 8} ${y} q26 -30 6 -62 q-6 26 -26 34z`} fill={fill("#8fd18b")} stroke={line} strokeWidth={sw} />
      <circle cx="300" cy={y - 44} r="22" fill={fill("#5d4a6e")} stroke={line} strokeWidth={sw} />
      <circle cx="300" cy={y - 44} r="12" fill={fill("#f6d26b")} stroke={line} strokeWidth={sw} />
      {Array.from({ length: 7 }, (_, k) => {
        const kx = 300 - cw + 16 + k * ((cw * 2 - 32) / 6);
        const ky = top + 4 + Math.pow((kx - 300) / cw, 2) * 26;
        return (
          <g key={k} fill={gold ? "none" : "#e8b93a"} stroke={gold ? line : "#a57617"} strokeWidth={sw}>
            <ellipse cx={r1(kx)} cy={r1(ky)} rx="8" ry="9" />
            <path d={`M${r1(kx - 4)} ${r1(ky - 8)} L${r1(kx)} ${r1(ky - 26)} L${r1(kx + 4)} ${r1(ky - 8)}Z`} />
          </g>
        );
      })}
    </g>
  );
  // Base and doorway
  items.push(
    <g key="base">
      <rect x="100" y={baseTop} width="400" height="210" fill={fill("#efe2c6")} stroke={line} strokeWidth={sw} />
      {[120, 170, 410, 460].map((x) => (
        <rect key={x} x={x} y={baseTop + 10} width="22" height="200" fill={fill("#e2cfa8")} stroke={line} strokeWidth={sw} />
      ))}
      <rect x="96" y={baseTop - 4} width="408" height="14" fill={fill("#f6d26b")} stroke={line} strokeWidth={sw} />
      <path d={`M240 900 V${baseTop + 70} Q300 ${baseTop + 20} 360 ${baseTop + 70} V900Z`} fill={gold ? "none" : "#3b2a3e"} stroke={line} strokeWidth={sw * 1.5} />
      <path d={`M252 900 V${baseTop + 76} Q300 ${baseTop + 34} 348 ${baseTop + 76} V900`} fill="none" stroke={gold ? line : "#f6d26b"} strokeWidth={sw * 1.5} />
    </g>
  );
  return (
    <svg viewBox="0 0 600 900" className={className} style={style} aria-hidden>
      {items}
    </svg>
  );
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
/* Hanging brass lamp                                                  */
/* ------------------------------------------------------------------ */

export function HangingLamp({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 120 360" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="tj-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6114" />
          <stop offset="0.45" stopColor="#f6d27a" />
          <stop offset="1" stopColor="#8a6114" />
        </linearGradient>
        <radialGradient id="tj-glow">
          <stop offset="0" stopColor="rgba(255,214,120,.85)" />
          <stop offset="1" stopColor="rgba(255,214,120,0)" />
        </radialGradient>
      </defs>
      <path d="M60 0 V150" stroke="#d9a441" strokeWidth="3" strokeDasharray="6 4" />
      <circle cx="60" cy="250" r="70" fill="url(#tj-glow)" />
      <path d="M60 150 L24 190 H96Z" fill="url(#tj-brass)" />
      <rect x="22" y="190" width="76" height="90" rx="10" fill="rgba(255,236,190,.35)" stroke="url(#tj-brass)" strokeWidth="6" />
      {[40, 60, 80].map((x) => (
        <path key={x} d={`M${x} 194 V276`} stroke="url(#tj-brass)" strokeWidth="3" />
      ))}
      <path d="M60 222 Q70 240 60 256 Q50 240 60 222Z" fill="#ffb627" />
      <path d="M22 280 H98 L80 304 H40Z" fill="url(#tj-brass)" />
      <path d="M60 304 V340" stroke="url(#tj-brass)" strokeWidth="4" />
      <circle cx="60" cy="346" r="8" fill="url(#tj-brass)" />
    </svg>
  );
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
