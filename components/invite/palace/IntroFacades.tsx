"use client";

import { useId } from "react";
import type { WorldId } from "./shots";

/**
 * Illustrated fronts for the 3D templates' openings (PalaceIntro): an
 * Ottoman mosque-palace of cascading domes, a South Indian gopuram
 * crowded with painted sculpture, and a twin-spired Gothic cathedral. Drawn as
 * SVG in a 400 × 520 box whose bottom 400 × 260 lines up with the intro's
 * facade, so the CSS gate (doors, light) and brass lamps sit exactly in
 * the doorway drawn here: opening x 140–260 (palace / temple 148–252),
 * top y ≈ 382, ground y = 520. `lit` brightens the windows and glass.
 */
export default function IntroFacade({ world, lit, className }: { world: WorldId; lit: boolean; className?: string }) {
  const raw = useId();
  const id = (name: string) => `${raw.replace(/[^a-zA-Z0-9]/g, "")}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const props = { id, url, lit };
  return (
    <svg viewBox="0 0 400 520" className={className} preserveAspectRatio="xMidYMax meet" aria-hidden>
      {world === "temple" ? <Temple {...props} /> : world === "cathedral" ? <Cathedral {...props} /> : <Palace {...props} />}
    </svg>
  );
}

interface ArtProps {
  id: (n: string) => string;
  url: (n: string) => string;
  lit: boolean;
}

/** Rounds a coordinate, so server and browser print identical numbers. */
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Deterministic random numbers, so server and client draw the same art. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a * 1664525 + 1013904223) % 4294967296;
    return a / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Ottoman mosque-palace at sunset                                     */
/* ------------------------------------------------------------------ */

function Palace({ id, url, lit }: ArtProps) {
  const glass = lit ? "#FFC870" : "#4A3A3A";
  const pointed = (x: number, y: number, w: number, h: number) =>
    `M${x} ${y + h} V${y + w * 0.55} Q${x} ${y + w * 0.08} ${x + w / 2} ${y} Q${x + w} ${y + w * 0.08} ${x + w} ${y + w * 0.55} V${y + h} Z`;
  // A lead dome sitting on y, with a crescent finial.
  const dome = (cx: number, y: number, r: number, key: string, finial = true) => (
    <g key={key}>
      <rect x={cx - r * 1.02} y={y - 2} width={r * 2.04} height={4} fill={url("stoneDark")} />
      <path d={`M${cx - r} ${y} A${r} ${r * 0.92} 0 0 1 ${cx + r} ${y} Z`} fill={url("lead")} />
      <path d={`M${cx - r * 0.55} ${y - r * 0.55} A${r} ${r * 0.92} 0 0 1 ${cx + r * 0.2} ${y - r * 0.88}`} fill="none" stroke="#E6ECF4" strokeWidth={Math.max(0.6, r * 0.05)} opacity="0.55" />
      {finial && (
        <>
          <line x1={cx} y1={y - r * 0.92} x2={cx} y2={y - r * 0.92 - r * 0.35 - 3} stroke="#E3C46A" strokeWidth={Math.max(0.8, r * 0.05)} />
          <circle cx={cx} cy={y - r * 0.92 - r * 0.35 - 4} r={Math.max(1, r * 0.06)} fill="#E3C46A" />
        </>
      )}
    </g>
  );
  // A pencil minaret: tall shaft, three balconies, long pointed cap.
  const minaret = (x: number, top: number, w: number) => (
    <g key={x}>
      <rect x={x - w / 2} y={top + 46} width={w} height={505 - top - 46} fill={url("minaret")} />
      {[0.32, 0.55, 0.78].map((f) => {
        const y = top + 46 + (505 - top - 46) * (1 - f) * 0.62;
        return (
          <g key={f}>
            <rect x={x - w / 2 - 3} y={y} width={w + 6} height="3" fill="#F3E3C6" />
            <rect x={x - w / 2 - 3} y={y + 3} width={w + 6} height="2.5" fill={url("stoneDark")} />
            {[-1, 0, 1].map((d) => (
              <rect key={d} x={x + d * (w / 2 + 1) - 0.4} y={y - 4} width="0.8" height="4" fill="#E9D7B9" />
            ))}
          </g>
        );
      })}
      <rect x={x - w / 2 - 1} y={top + 42} width={w + 2} height="5" fill="#F3E3C6" />
      <path d={`M${x - w / 2 - 1} ${top + 43} L${x} ${top} L${x + w / 2 + 1} ${top + 43} Z`} fill={url("lead")} />
      <line x1={x} y1={top} x2={x} y2={top - 10} stroke="#E3C46A" strokeWidth="1.2" />
      <path d={`M${x - 2} ${top - 13} a2.5 2.5 0 1 0 4 0 a1.8 1.8 0 1 1 -4 0`} fill="#E3C46A" />
    </g>
  );
  return (
    <>
      <defs>
        <linearGradient id={id("stone")} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#F7E6C8" />
          <stop offset="0.55" stopColor="#E6CBA4" />
          <stop offset="1" stopColor="#B49276" />
        </linearGradient>
        <linearGradient id={id("stoneDark")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#CDB08C" />
          <stop offset="1" stopColor="#8E735E" />
        </linearGradient>
        <linearGradient id={id("minaret")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FBEBD0" />
          <stop offset="0.5" stopColor="#E8CFA8" />
          <stop offset="1" stopColor="#A88C72" />
        </linearGradient>
        <radialGradient id={id("lead")} cx="0.32" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#D3DAE6" />
          <stop offset="0.45" stopColor="#8D99B0" />
          <stop offset="1" stopColor="#4A536A" />
        </radialGradient>
        <linearGradient id={id("recess")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5A4A52" />
          <stop offset="1" stopColor="#2A2028" />
        </linearGradient>
        <pattern id={id("iznik")} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#1F5E8C" />
          <path d="M5 1 L9 5 L5 9 L1 5 Z" fill="#F3F0E6" />
          <circle cx="5" cy="5" r="1.6" fill="#C0392B" />
        </pattern>
      </defs>

      {/* Outer minarets (tall) */}
      {minaret(18, 34, 9)}
      {minaret(382, 34, 9)}

      {/* Lower body: courtyard arcade of small domes */}
      <rect x="40" y="420" width="320" height="85" fill={url("stone")} />
      {Array.from({ length: 10 }, (_, i) => {
        const x = 46 + i * 31.5;
        if (x > 125 && x < 250) return null;
        return (
          <g key={i}>
            <path d={pointed(x + 4, 440, 22, 52)} fill={url("recess")} />
            <path d={pointed(x + 9, 452, 12, 30)} fill={glass} opacity="0.9" />
            {dome(x + 15, 420, 13, `a${i}`, false)}
          </g>
        );
      })}
      {/* Inner minarets */}
      {minaret(64, 110, 8)}
      {minaret(336, 110, 8)}

      {/* Middle tier: half-domes and buttress turrets climbing to the dome */}
      <rect x="86" y="340" width="228" height="82" fill={url("stone")} />
      {[100, 128, 272, 300].map((x) => dome(x, 342, 14, `m${x}`))}
      {[96, 112, 128, 272, 288, 304].map((x) => (
        <path key={x} d={pointed(x - 4, 362, 8, 22)} fill={glass} />
      ))}
      {/* Semi-domes */}
      {[146, 254].map((cx) => (
        <g key={cx}>
          <rect x={cx - 34} y="300" width="68" height="44" fill={url("stone")} />
          {[0, 1, 2, 3].map((k) => (
            <path key={k} d={pointed(cx - 26 + k * 14, 318, 9, 20)} fill={glass} />
          ))}
          <path d={`M${cx - 36} 302 A36 30 0 0 1 ${cx + 36} 302 Z`} fill={url("lead")} />
          {[-24, -12, 0, 12, 24].map((d) => (
            <path key={d} d={`M${cx + d} 302 L${cx + d * 0.6} 278`} stroke="#5E6880" strokeWidth="0.6" opacity="0.7" />
          ))}
        </g>
      ))}
      {/* Drum with a ring of windows and the great central dome */}
      <rect x="140" y="230" width="120" height="116" fill={url("stone")} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={pointed(146 + i * 12.6, 246, 7, 20)} fill={glass} />
      ))}
      {[140, 260].map((x) => (
        <g key={x}>
          <rect x={x - 7} y="210" width="14" height="94" fill={url("stoneDark")} />
          <path d={`M${x - 8} 212 L${x} 186 L${x + 8} 212 Z`} fill={url("lead")} />
          <line x1={x} y1="186" x2={x} y2="178" stroke="#E3C46A" strokeWidth="1" />
        </g>
      ))}
      <rect x="132" y="226" width="136" height="6" fill="#F3E3C6" />
      <path d="M134 228 A66 84 0 0 1 266 228 Z" fill={url("lead")} />
      {Array.from({ length: 13 }, (_, i) => {
        const a = Math.PI * (0.1 + (i / 12) * 0.8);
        return <path key={i} d={`M${r1(200 - Math.cos(a) * 66)} 228 Q${r1(200 - Math.cos(a) * 40)} 180 200 146`} fill="none" stroke="#5E6880" strokeWidth="0.6" opacity="0.6" />;
      })}
      <path d="M160 190 A66 84 0 0 1 214 148" fill="none" stroke="#EEF2F8" strokeWidth="3" opacity="0.5" />
      <line x1="200" y1="144" x2="200" y2="112" stroke="#E3C46A" strokeWidth="2" />
      <circle cx="200" cy="128" r="3" fill="#E3C46A" />
      <path d="M195 108 a6 6 0 1 0 10 0 a4.5 4.5 0 1 1 -10 0" fill="#E3C46A" />

      {/* The portal: a tiled pishtaq around the doors */}
      <rect x="128" y="352" width="144" height="153" fill={url("stone")} />
      <rect x="132" y="356" width="136" height="149" fill={url("iznik")} opacity="0.9" />
      <path d={pointed(140, 366, 120, 139)} fill={url("recess")} />
      <path d={pointed(140, 366, 120, 139)} fill="none" stroke="#E3C46A" strokeWidth="2" />
      {Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 5 - r }, (_, i) => (
          <path key={`${r}-${i}`} d={`M${166 + r * 7 + i * 14} ${388 + r * 8} q7 -8 14 0`} fill="none" stroke="#C8B79A" strokeWidth="0.9" />
        ))
      )}
      {/* Steps and base */}
      <rect x="30" y="503" width="340" height="17" fill={url("stoneDark")} />
      <rect x="30" y="503" width="340" height="2" fill="#F3E3C6" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* South Indian gopuram, crowded with painted sculpture                */
/* ------------------------------------------------------------------ */

const PASTELS = ["#F4A6B8", "#8EC5E8", "#F6D57A", "#9ED89A", "#E8806E", "#B9A0E0", "#F7B26A", "#6FC3B8", "#F4F1EA", "#E36B8C"];

function Temple({ id, url, lit }: ArtProps) {
  const tiers = 8;
  const base = 336;
  const th = 33;
  const glass = lit ? url("glow") : "#2A1E18";
  const widthAt = (t: number) => 244 - t * 18;
  const rand = rng(17);
  const pick = () => PASTELS[Math.floor(rand() * PASTELS.length)];

  // Silhouette: a tapering tower with stepped edges at every cornice.
  let outline = `M${200 - widthAt(0) / 2 - 6} ${base}`;
  for (let t = 0; t < tiers; t++) {
    const w = widthAt(t) / 2;
    const y = base - t * th;
    outline += ` L${200 - w - 6} ${y - 4} L${200 - w} ${y - 6} L${200 - w + 3} ${y - th}`;
  }
  const topY = base - tiers * th;
  outline += ` L${200 + widthAt(tiers - 1) / 2 - 3} ${topY}`;
  for (let t = tiers - 1; t >= 0; t--) {
    const w = widthAt(t) / 2;
    const y = base - t * th;
    outline += ` L${200 + w - 3} ${y - th} L${200 + w} ${y - 6} L${200 + w + 6} ${y - 4}`;
  }
  outline += ` L${200 + widthAt(0) / 2 + 6} ${base} Z`;

  // Each tier: a band of standing figures, pavilions every few, and a
  // cornice of little horseshoe kudu windows above.
  const tierArt = Array.from({ length: tiers }, (_, t) => {
    const w = widthAt(t);
    const y0 = base - t * th;
    const left = 200 - w / 2;
    const step = 9.5;
    const n = Math.floor(w / step);
    const figs = [];
    for (let i = 0; i < n; i++) {
      const cx = left + 3 + i * step;
      const pav = i % 5 === 2;
      const h = pav ? 24 : 15 + rand() * 6;
      const body = pick();
      if (pav) {
        figs.push(
          <g key={`p${i}`}>
            <path d={`M${cx - 5.5} ${y0 - 6} V${y0 - 25} q5.5 -6 11 0 V${y0 - 6} Z`} fill={pick()} />
            <path d={`M${cx - 6.5} ${y0 - 25} q6.5 -9 13 0`} fill={pick()} />
            <circle cx={cx} cy={y0 - 18} r="2.4" fill={pick()} />
            <path d={`M${cx - 3.2} ${y0 - 7} q0 -8 3.2 -8.6 q3.2 .6 3.2 8.6 Z`} fill={body} />
          </g>
        );
      } else {
        figs.push(
          <g key={`f${i}`}>
            <circle cx={cx} cy={y0 - 6 - h + 2.6} r="2.4" fill={pick()} />
            <path d={`M${cx - 2.6} ${y0 - 6 - h + 1.4} l2.6 -3 l2.6 3 Z`} fill="#F6D57A" />
            <path d={`M${cx - 3.6} ${y0 - 6} L${cx - 2.4} ${y0 - 6 - h + 5.5} Q${cx} ${y0 - 6 - h + 3.8} ${cx + 2.4} ${y0 - 6 - h + 5.5} L${cx + 3.6} ${y0 - 6} Z`} fill={body} />
            <path d={`M${cx - 4.6} ${y0 - 6 - h * 0.62} l2 4 M${cx + 4.6} ${y0 - 6 - h * 0.62} l-2 4`} stroke={body} strokeWidth="1.3" />
            <rect x={cx - 3.2} y={y0 - 6 - h * 0.45} width="6.4" height="1.2" fill={pick()} />
          </g>
        );
      }
    }
    const kudus = [];
    for (let x = left + 2; x < left + w - 2; x += 7) {
      kudus.push(<path key={x} d={`M${x} ${y0 - th + 7} q3 -6 6 0 Z`} fill={pick()} />);
    }
    return (
      <g key={t}>
        <rect x={left - 4} y={y0 - th} width={w + 8} height={th} fill={t % 2 ? "#6E9C92" : "#B68A5C"} />
        {figs}
        <rect x={left - 6} y={y0 - 6} width={w + 12} height="4" fill="#8E3A2A" />
        <rect x={left - 6} y={y0 - 2.5} width={w + 12} height="1.5" fill="#F4F1EA" />
        <rect x={left - 4} y={y0 - th} width={w + 8} height="8" fill="#7A3A2E" />
        {kudus}
      </g>
    );
  });

  return (
    <>
      <defs>
        <clipPath id={id("tower")}>
          <path d={outline} />
        </clipPath>
        <linearGradient id={id("shade")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE9C8" stopOpacity="0.18" />
          <stop offset="0.45" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#120818" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={id("granite")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7C7064" />
          <stop offset="1" stopColor="#3E362F" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.7" r="0.8">
          <stop offset="0" stopColor="#FFE8B0" />
          <stop offset="0.6" stopColor="#F28C1B" />
          <stop offset="1" stopColor="#6A2A10" />
        </radialGradient>
      </defs>

      {/* Mandapam wall either side, with a painted parapet frieze */}
      <rect x="0" y="404" width="400" height="116" fill={url("granite")} />
      <rect x="0" y="392" width="400" height="14" fill="#4F8F9A" />
      {Array.from({ length: 50 }, (_, i) => (
        <g key={i}>
          <circle cx={4 + i * 8} cy="396" r="1.4" fill={PASTELS[i % PASTELS.length]} />
          <path d={`M${2 + i * 8} 405 q2 -6 4 0 Z`} fill={PASTELS[(i + 3) % PASTELS.length]} />
        </g>
      ))}
      <rect x="0" y="388" width="400" height="4" fill="#C0583A" />
      {[16, 56, 306, 346].map((x) => (
        <g key={x}>
          <rect x={x} y="420" width="36" height="60" fill="#2A231E" />
          <path d={`M${x} 420 q18 -14 36 0`} fill="#2A231E" stroke="#B9A07A" strokeWidth="1.5" />
          <circle cx={x + 18} cy="436" r="5" fill="#A89880" />
          <path d={`M${x + 10} 478 q0 -30 8 -34 q8 4 8 34 Z`} fill="#A89880" />
        </g>
      ))}
      {[
        [490, 8, "#8E8274"],
        [498, 7, "#5E544A"],
        [505, 15, "#4A4038"],
      ].map(([y, h, c]) => (
        <rect key={y as number} x="0" y={y as number} width="400" height={h as number} fill={c as string} />
      ))}

      {/* Granite base of the gopuram, with lit shrine niches */}
      <rect x="92" y="330" width="216" height="190" fill={url("granite")} />
      {[100, 284].map((x) => (
        <g key={x}>
          <rect x={x} y="336" width="16" height="160" fill="#8E8274" />
          {[350, 390, 430, 470].map((y) => (
            <rect key={y} x={x - 1} y={y} width="18" height="4" fill="#B5A898" />
          ))}
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={132 + i * 46} y="340" width="44" height="30" rx="3" fill={glass} />
          <circle cx={154 + i * 46} cy="350" r="4" fill="#3A2412" opacity="0.8" />
          <path d={`M${147 + i * 46} 368 q0 -12 7 -14 q7 2 7 14 Z`} fill="#3A2412" opacity="0.8" />
        </g>
      ))}
      <rect x="140" y="374" width="120" height="10" fill="#D4A017" />
      <rect x="140" y="376" width="6" height="144" fill="#D4A017" />
      <rect x="254" y="376" width="6" height="144" fill="#D4A017" />
      <path d="M128 374 Q200 396 272 374" fill="none" stroke="#5A3A12" strokeWidth="1.2" />
      {Array.from({ length: 15 }, (_, i) => {
        const x = 132 + i * 9.7;
        const y = r1(375 + Math.sin((i / 14) * Math.PI) * 10);
        return (
          <g key={i}>
            <path d={`M${x} ${y} l-3 10 l3 4 l3 -4 Z`} fill={i % 2 ? "#2E7D32" : "#43A047"} />
            {i % 3 === 1 && <circle cx={x} cy={y + 1} r="2.6" fill="#F28C1B" />}
          </g>
        );
      })}

      {/* The tower, crowded with sculpture, shaded left-lit */}
      <g clipPath={url("tower")}>
        {tierArt}
        <rect x="0" y="0" width="400" height="400" fill={url("shade")} />
      </g>
      <path d={outline} fill="none" stroke="#5A2A20" strokeWidth="1" opacity="0.6" />

      {/* Shala vault with kirtimukha ends and kalasams */}
      {(() => {
        const w = widthAt(tiers - 1) - 6;
        const l = 200 - w / 2;
        return (
          <g>
            <path d={`M${l} ${topY} Q${l} ${topY - 34} 200 ${topY - 38} Q${l + w} ${topY - 34} ${l + w} ${topY} Z`} fill="#6FC3B8" />
            {Array.from({ length: 14 }, (_, i) => (
              <circle key={i} cx={l + 6 + i * ((w - 12) / 13)} cy={r1(topY - 14 - Math.sin((i / 13) * Math.PI) * 14)} r="2.2" fill={PASTELS[i % PASTELS.length]} />
            ))}
            <path d={`M${l} ${topY} Q${l} ${topY - 34} 200 ${topY - 38} Q${l + w} ${topY - 34} ${l + w} ${topY}`} fill="none" stroke="#E36B8C" strokeWidth="2" />
            {[l - 2, l + w + 2].map((x) => (
              <g key={x}>
                <path d={`M${x - 10} ${topY} q0 -30 10 -32 q10 2 10 32 Z`} fill="#F6D57A" stroke="#8E3A2A" strokeWidth="1.2" />
                <circle cx={x} cy={topY - 14} r="4" fill="#E8806E" />
                <circle cx={x - 1.5} cy={topY - 15} r="1" fill="#2A1A10" />
                <circle cx={x + 1.5} cy={topY - 15} r="1" fill="#2A1A10" />
              </g>
            ))}
            {[-36, -18, 0, 18, 36].map((d) => {
              const x = 200 + d;
              const y = topY - 36 + Math.abs(d) * 0.18;
              return (
                <g key={d}>
                  <ellipse cx={x} cy={y} rx="4.5" ry="5.5" fill="#E3B341" />
                  <path d={`M${x - 2.5} ${y - 5} q2.5 -12 5 0 Z`} fill="#E3B341" />
                  <circle cx={x} cy={y - 17} r="1.5" fill="#FFE08A" />
                </g>
              );
            })}
          </g>
        );
      })()}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Twin-spired Gothic cathedral                                        */
/* ------------------------------------------------------------------ */

const STAINED = ["#1B3F8B", "#B0202E", "#1F7A4D", "#D99A1E", "#5B2C83", "#1E7FA8"];

function Cathedral({ id, url, lit }: ArtProps) {
  const dim = (c: string) => (lit ? c : "#262A40");
  const lancet = (x: number, y: number, w: number, h: number) =>
    `M${x} ${y + h} V${y + w * 0.75} Q${x} ${y} ${x + w / 2} ${y - w * 0.25} Q${x + w} ${y} ${x + w} ${y + w * 0.75} V${y + h} Z`;
  const glassWin = (x: number, y: number, w: number, h: number, key: string) => (
    <g key={key}>
      <path d={lancet(x, y, w, h)} fill={lit ? url("glass") : "#262A40"} />
      <path d={lancet(x, y, w, h)} fill="none" stroke="#EDEAE4" strokeWidth="1.4" />
      {w > 9 && <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#EDEAE4" strokeWidth="0.8" />}
    </g>
  );
  const pinnacle = (x: number, y: number, h: number, key: string) => (
    <g key={key}>
      <rect x={x - 2.5} y={y - h * 0.35} width="5" height={h * 0.35} fill={url("stone")} />
      <path d={`M${x - 3} ${y - h * 0.35} L${x} ${y - h} L${x + 3} ${y - h * 0.35} Z`} fill={url("stone")} />
      <circle cx={x} cy={y - h} r="1.1" fill="#EDEAE4" />
    </g>
  );
  // A tower: three stages of lancets with pinnacled buttresses, then a
  // very tall octagonal spire with lucarnes and crockets.
  const tower = (x: number, w: number) => {
    const cx = x + w / 2;
    return (
      <g key={x}>
        <rect x={x} y="168" width={w} height="352" fill={url("stone")} />
        <rect x={x + w * 0.62} y="168" width={w * 0.38} height="352" fill="#000" opacity="0.13" />
        {[x - 5, x + w - 3].map((bx) => (
          <g key={bx}>
            <rect x={bx} y="176" width="8" height="344" fill={url("stoneSide")} />
            {[440, 340, 250, 176].map((y) => pinnacle(bx + 4, y, 22, `${bx}-${y}`))}
          </g>
        ))}
        {[
          [410, 64],
          [312, 74],
          [220, 64],
        ].map(([y, h], k) => (
          <g key={k}>
            {glassWin(cx - 17, y, 12, h, `${x}l${k}`)}
            {glassWin(cx + 5, y, 12, h, `${x}r${k}`)}
            <rect x={x + 2} y={y + h + 6} width={w - 4} height="3" fill="#B9B4AA" />
          </g>
        ))}
        {/* Openwork parapet */}
        <rect x={x - 4} y="164" width={w + 8} height="6" fill="#CFCAC1" />
        {Array.from({ length: Math.floor(w / 6) }, (_, i) => (
          <path key={i} d={`M${x + i * 6} 164 v-5 q3 -4 6 0 v5`} fill="none" stroke="#CFCAC1" strokeWidth="1" />
        ))}
        {/* Spire */}
        <path d={`M${x + 6} 164 L${cx} 6 L${x + w - 6} 164 Z`} fill={url("spire")} />
        <path d={`M${cx} 6 L${x + w - 6} 164 H${cx + 4} Z`} fill="#000" opacity="0.16" />
        {Array.from({ length: 13 }, (_, i) => {
          const t = (i + 1) / 14;
          const y = 164 - 158 * t;
          const dx = (w / 2 - 6) * (1 - t);
          return (
            <g key={i}>
              <path d={`M${cx - dx} ${y} l-2.5 -2 l1 -2`} fill="none" stroke="#EDEAE4" strokeWidth="1" />
              <path d={`M${cx + dx} ${y} l2.5 -2 l-1 -2`} fill="none" stroke="#EDEAE4" strokeWidth="1" />
            </g>
          );
        })}
        {[124, 82].map((y, i) => (
          <g key={y}>
            <path d={`M${cx - 5 + i} ${y} V${y - 10} L${cx} ${y - 17} L${cx + 5 - i} ${y - 10} V${y} Z`} fill={url("stone")} />
            <path d={`M${cx - 2} ${y} V${y - 8} L${cx} ${y - 11} L${cx + 2} ${y - 8} V${y} Z`} fill="#3A3E54" />
          </g>
        ))}
        {[x + 4, x + w - 4].map((px) => pinnacle(px, 166, 30, `sp${px}`))}
        <path d={`M${cx} 6 V-6 M${cx - 4} -1 H${cx + 4}`} stroke="#E3C46A" strokeWidth="1.6" />
      </g>
    );
  };
  return (
    <>
      <defs>
        <linearGradient id={id("stone")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F2F0EC" />
          <stop offset="0.6" stopColor="#D5D2CC" />
          <stop offset="1" stopColor="#A9A6A2" />
        </linearGradient>
        <linearGradient id={id("stoneSide")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E2DFD9" />
          <stop offset="1" stopColor="#9C9994" />
        </linearGradient>
        <linearGradient id={id("spire")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ECEAE5" />
          <stop offset="1" stopColor="#B8B5B0" />
        </linearGradient>
        <linearGradient id={id("recess")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6A6874" />
          <stop offset="1" stopColor="#2E2C36" />
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5B2C83" />
          <stop offset="0.25" stopColor="#1B3F8B" />
          <stop offset="0.5" stopColor="#B0202E" />
          <stop offset="0.72" stopColor="#D99A1E" />
          <stop offset="1" stopColor="#1F7A4D" />
        </linearGradient>
        <pattern id={id("ashlar")} width="20" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 9 H20 M10 0 V4.5 M0 4.5 H20 M0 4.5 V9" fill="none" stroke="#8E8B86" strokeWidth="0.4" opacity="0.5" />
        </pattern>
      </defs>

      {tower(20, 82)}
      {tower(298, 82)}

      {/* Nave front: gable with pinnacles, rose window, lancet gallery */}
      <rect x="102" y="214" width="196" height="306" fill={url("stone")} />
      <rect x="102" y="214" width="196" height="306" fill={url("ashlar")} />
      <path d="M98 218 L200 122 L302 218 Z" fill={url("stone")} />
      <path d="M200 122 L302 218 H200 Z" fill="#000" opacity="0.08" />
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 1) / 10;
        return (
          <g key={i}>
            <path d={`M${98 + 102 * t} ${218 - 96 * t} l-2 -4`} stroke="#EDEAE4" strokeWidth="1.2" />
            <path d={`M${302 - 102 * t} ${218 - 96 * t} l2 -4`} stroke="#EDEAE4" strokeWidth="1.2" />
          </g>
        );
      })}
      <path d="M200 122 V98 M193 106 H207" stroke="#E3C46A" strokeWidth="2.4" />
      {[110, 140, 170, 230, 260, 290].map((x) => pinnacle(x, 220, 26, `n${x}`))}
      <rect x="100" y="218" width="200" height="5" fill="#CFCAC1" />

      <circle cx="200" cy="262" r="36" fill="#A9A6A2" />
      <circle cx="200" cy="262" r="32" fill="#1A1A2E" />
      {Array.from({ length: 12 }, (_, i) => {
        const a0 = (i / 12) * Math.PI * 2;
        const a1 = ((i + 1) / 12) * Math.PI * 2;
        const pt = (a: number, r: number) => `${r1(200 + Math.cos(a) * r)} ${r1(262 + Math.sin(a) * r)}`;
        return (
          <path key={i} d={`M${pt(a0, 14)} L${pt(a0, 30)} A30 30 0 0 1 ${pt(a1, 30)} L${pt(a1, 14)} A14 14 0 0 0 ${pt(a0, 14)} Z`} fill={dim(STAINED[i % 6])} stroke="#EDEAE4" strokeWidth="0.9" />
        );
      })}
      <circle cx="200" cy="262" r="8" fill={dim("#F2C14E")} stroke="#EDEAE4" strokeWidth="1" />
      {lit && <circle cx="200" cy="262" r="40" fill="#9FB0FF" opacity="0.12" />}

      <rect x="102" y="306" width="196" height="4" fill="#B9B4AA" />
      {Array.from({ length: 11 }, (_, i) => glassWin(110 + i * 17, 316, 9, 30, `g${i}`))}
      <rect x="102" y="352" width="196" height="4" fill="#B9B4AA" />

      {/* Portal with deep archivolts and a gabled hood */}
      <path d="M118 372 L200 330 L282 372 Z" fill={url("stone")} stroke="#B9B4AA" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((k) => {
        const half = 78 - k * 5;
        return (
          <path
            key={k}
            d={`M${200 - half} 520 V420 Q${200 - half} ${364 + k * 5} 200 ${352 + k * 7} Q${200 + half} ${364 + k * 5} ${200 + half} 420 V520`}
            fill={k === 3 ? url("recess") : "none"}
            stroke={k % 2 ? "#EDEAE4" : "#B9B4AA"}
            strokeWidth="4.5"
          />
        );
      })}
      <circle cx="200" cy="384" r="4" fill="#E3C46A" />
      {[124, 270].map((x) => (
        <g key={x}>
          <rect x={x} y="430" width="6" height="90" fill="#B9B4AA" />
          <circle cx={x + 3} cy="440" r="3" fill="#EDEAE4" />
          <path d={`M${x - 1} 476 q0 -26 4 -30 q4 4 4 30 Z`} fill="#EDEAE4" />
        </g>
      ))}
      <rect x="90" y="512" width="220" height="8" fill="#B9B4AA" />
    </>
  );
}
