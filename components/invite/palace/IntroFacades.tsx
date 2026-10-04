"use client";

import { useId } from "react";
import type { WorldId } from "./shots";

/**
 * Illustrated fronts for the 3D templates' openings (PalaceIntro): a
 * Mughal marble palace, a painted gopuram and a Gothic cathedral. Drawn as
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

/* ------------------------------------------------------------------ */
/* Mughal marble palace                                                */
/* ------------------------------------------------------------------ */

function Palace({ id, url, lit }: ArtProps) {
  const glass = lit ? url("glow") : "#2B2236";
  const arch = (x: number, y: number, w: number, h: number) =>
    `M${x} ${y + h} V${y + h * 0.42} Q${x} ${y + h * 0.12} ${x + w / 2} ${y} Q${x + w} ${y + h * 0.12} ${x + w} ${y + h * 0.42} V${y + h} Z`;
  const minaret = (x: number) => (
    <g>
      <path d={`M${x - 9} 505 L${x - 6} 168 H${x + 6} L${x + 9} 505 Z`} fill={url("marble")} />
      <path d={`M${x - 9} 505 L${x - 6} 168 H${x - 1} L${x - 2} 505 Z`} fill="#000" opacity="0.12" />
      {[430, 340, 250, 172].map((y) => (
        <g key={y}>
          <rect x={x - 13} y={y} width="26" height="5" fill={url("marble")} />
          <rect x={x - 13} y={y + 5} width="26" height="2" fill="#B89A4C" />
          {[-9, -3, 3, 9].map((d) => (
            <rect key={d} x={x + d - 0.6} y={y - 7} width="1.2" height="7" fill="#C8C2D2" />
          ))}
        </g>
      ))}
      <path d={`M${x - 10} 165 Q${x - 11} 146 ${x} 136 Q${x + 11} 146 ${x + 10} 165 Z`} fill={url("dome")} />
      <path d={`M${x} 136 V124`} stroke="#E3C46A" strokeWidth="1.5" />
      <circle cx={x} cy={122} r="1.8" fill="#E3C46A" />
    </g>
  );
  const chhatri = (x: number, y: number, s = 1) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-15" y="0" width="30" height="3" fill="#B89A4C" />
      {[-12, -4, 4, 12].map((d) => (
        <rect key={d} x={d - 1.4} y="-18" width="2.8" height="18" fill={url("marble")} />
      ))}
      <rect x="-17" y="-21" width="34" height="4" fill={url("marble")} />
      <path d="M-14 -21 Q-16 -38 0 -46 Q16 -38 14 -21 Z" fill={url("dome")} />
      <path d="M0 -46 V-54" stroke="#E3C46A" strokeWidth="1.4" />
    </g>
  );
  return (
    <>
      <defs>
        <linearGradient id={id("marble")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBF8F3" />
          <stop offset="0.55" stopColor="#E4DEE8" />
          <stop offset="1" stopColor="#B7B0C6" />
        </linearGradient>
        <radialGradient id={id("dome")} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#E2DCEA" />
          <stop offset="1" stopColor="#9C94B2" />
        </radialGradient>
        <linearGradient id={id("recess")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A3E5C" />
          <stop offset="1" stopColor="#231B2E" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.75" r="0.8">
          <stop offset="0" stopColor="#FFF4D2" />
          <stop offset="0.55" stopColor="#F5B860" />
          <stop offset="1" stopColor="#8A4A18" />
        </radialGradient>
        {/* Pietra dura inlay: small flowers in a diamond lattice */}
        <pattern id={id("inlay")} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#F3EEE6" />
          <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="none" stroke="#C9B37A" strokeWidth="0.6" />
          <circle cx="6" cy="6" r="1.6" fill="#B03A48" />
          <circle cx="6" cy="3.6" r="0.8" fill="#3E7A5A" />
          <circle cx="6" cy="8.4" r="0.8" fill="#3E7A5A" />
        </pattern>
        <pattern id={id("band")} width="10" height="8" patternUnits="userSpaceOnUse">
          <rect width="10" height="8" fill="#1E1A24" />
          <path d="M0 6 Q2.5 1 5 4 T10 2" fill="none" stroke="#E3C46A" strokeWidth="0.8" />
        </pattern>
        <pattern id={id("jali")} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M3 0 L6 3 L3 6 L0 3 Z" fill="none" stroke="#D8D0E2" strokeWidth="0.7" />
        </pattern>
      </defs>

      {minaret(26)}
      {minaret(374)}

      {/* Plinth of red sandstone with a marble edge */}
      <rect x="6" y="500" width="388" height="20" fill="#7E3426" />
      <rect x="6" y="498" width="388" height="4" fill={url("marble")} />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={12 + i * 16} y="506" width="10" height="10" fill="none" stroke="#B4614A" strokeWidth="0.8" />
      ))}

      {/* Main body */}
      <rect x="52" y="292" width="296" height="208" fill={url("marble")} />
      <rect x="52" y="292" width="296" height="208" fill="#000" opacity="0.04" />
      {/* Corner pilasters */}
      {[52, 340].map((x) => (
        <rect key={x} x={x} y="292" width="8" height="208" fill="#D9D2E0" />
      ))}

      {/* Side bays: two storeys of arched niches with jharokha windows */}
      {[64, 288].map((bx) =>
        [304, 400].map((y) => (
          <g key={`${bx}-${y}`}>
            <path d={arch(bx, y, 48, 86)} fill={url("recess")} />
            <path d={arch(bx, y, 48, 86)} fill="none" stroke={url("band")} strokeWidth="3" />
            <path d={arch(bx + 12, y + 20, 24, 50)} fill={glass} />
            <path d={arch(bx + 12, y + 20, 24, 50)} fill={url("jali")} opacity="0.7" />
            <rect x={bx + 8} y={y + 70} width="32" height="4" fill="#E3C46A" />
            <rect x={bx + 10} y={y + 74} width="28" height="8" fill={url("marble")} />
          </g>
        ))
      )}

      {/* Pishtaq: the great portal frame with inlay and a calligraphy band */}
      <rect x="118" y="252" width="164" height="248" fill={url("marble")} />
      <rect x="118" y="252" width="164" height="248" fill="none" stroke={url("band")} strokeWidth="8" />
      <rect x="126" y="260" width="148" height="240" fill={url("inlay")} opacity="0.85" />
      <path d={arch(136, 286, 128, 214)} fill={url("recess")} />
      <path d={arch(136, 286, 128, 214)} fill="none" stroke="#E3C46A" strokeWidth="2.5" />
      <path d={arch(144, 300, 112, 200)} fill="none" stroke="#C9B37A" strokeWidth="1" opacity="0.8" />
      {/* Muqarnas hint in the arch head */}
      {[0, 1, 2, 3].map((r) =>
        Array.from({ length: 5 - r }, (_, i) => (
          <path
            key={`${r}-${i}`}
            d={`M${168 + r * 6 + i * 14} ${330 + r * 9} q7 -9 14 0`}
            fill="none"
            stroke="#8E84A2"
            strokeWidth="1"
          />
        ))
      )}
      {/* Small parapet over the portal */}
      {Array.from({ length: 11 }, (_, i) => (
        <path key={i} d={`M${120 + i * 15} 252 v-8 q7 -8 14 0 v8 Z`} fill={url("marble")} />
      ))}

      {/* Roof parapet and chhatris */}
      <rect x="48" y="286" width="304" height="7" fill="#E3C46A" opacity="0.85" />
      {Array.from({ length: 19 }, (_, i) => (
        <path key={i} d={`M${50 + i * 16} 286 v-6 q6 -7 12 0 v6 Z`} fill={url("marble")} />
      ))}
      {chhatri(80, 280)}
      {chhatri(320, 280)}

      {/* Drum and the onion dome with lotus crown and finial */}
      <rect x="146" y="200" width="108" height="44" fill={url("marble")} />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={arch(152 + i * 17, 208, 11, 30)} fill={glass} opacity="0.9" />
      ))}
      <rect x="142" y="196" width="116" height="5" fill="#E3C46A" />
      <path d="M150 198 C98 160 132 96 200 70 C268 96 302 160 250 198 Z" fill={url("dome")} />
      {[-36, -18, 0, 18, 36].map((dx) => (
        <path key={dx} d={`M${200 + dx * 1.15} 198 C${200 + dx * 1.9} 150 ${200 + dx} 100 200 72`} fill="none" stroke="#B7AFC8" strokeWidth="0.8" opacity="0.8" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${170 + i * 5} 76 q2.5 -8 5 0`} fill="#C9B37A" opacity="0.8" />
      ))}
      <path d="M200 70 V30" stroke="#E3C46A" strokeWidth="2.5" />
      {[60, 50, 40].map((y, i) => (
        <ellipse key={y} cx="200" cy={y} rx={4 - i * 0.8} ry="3" fill="#E3C46A" />
      ))}
      <path d="M200 22 q-6 4 0 8 q-3 -4 0 -8" fill="#E3C46A" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* South Indian gopuram                                                */
/* ------------------------------------------------------------------ */

const TIER_COLORS = ["#1F8A9C", "#C0392B", "#2E8B57", "#7D3C98", "#2471A3", "#D35400"];
const FIGURE_COLORS = ["#F5D76E", "#F5B7B1", "#AED6F1", "#FAD7A0", "#F9E79F", "#D2B4DE"];

function Temple({ id, url, lit }: ArtProps) {
  const tiers = 8;
  const glass = lit ? url("glow") : "#2A1E18";
  return (
    <>
      <defs>
        <linearGradient id={id("granite")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7C7064" />
          <stop offset="1" stopColor="#3E362F" />
        </linearGradient>
        <linearGradient id={id("ochre")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B9842A" />
          <stop offset="0.5" stopColor="#F0C25A" />
          <stop offset="1" stopColor="#A9741F" />
        </linearGradient>
        <linearGradient id={id("vault")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8603C" />
          <stop offset="1" stopColor="#8E2C1F" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.7" r="0.8">
          <stop offset="0" stopColor="#FFE8B0" />
          <stop offset="0.6" stopColor="#F28C1B" />
          <stop offset="1" stopColor="#6A2A10" />
        </radialGradient>
        <pattern id={id("speckle")} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="3" r="0.6" fill="#B5A898" opacity="0.6" />
          <circle cx="6" cy="6" r="0.5" fill="#1E1814" opacity="0.6" />
          <circle cx="5" cy="1" r="0.4" fill="#D8CDBE" opacity="0.5" />
        </pattern>
      </defs>

      {/* Enclosure wall either side, with carved niches and pilasters */}
      <rect x="0" y="388" width="400" height="132" fill={url("granite")} />
      <rect x="0" y="388" width="400" height="132" fill={url("speckle")} />
      <rect x="0" y="384" width="400" height="6" fill="#A8442A" />
      {Array.from({ length: 26 }, (_, i) => (
        <path key={i} d={`M${i * 16} 384 q8 -9 16 0`} fill="#C0583A" />
      ))}
      {[20, 70, 300, 350].map((x) => (
        <g key={x}>
          <rect x={x} y="410" width="30" height="62" fill="#2A231E" />
          <path d={`M${x} 410 q15 -14 30 0`} fill="#2A231E" stroke="#9C8F80" strokeWidth="1.5" />
          <circle cx={x + 15} cy="428" r="5" fill="#7C7064" />
          <path d={`M${x + 7} 470 q0 -30 8 -34 q8 4 8 34 Z`} fill="#7C7064" />
          <rect x={x - 6} y="404" width="4" height="72" fill="#8E8274" />
          <rect x={x + 32} y="404" width="4" height="72" fill="#8E8274" />
        </g>
      ))}

      {/* Moulded granite base (adhishthana) with a lotus band */}
      {[
        [486, 6, "#8E8274"],
        [492, 8, "#5E544A"],
        [500, 6, "#9C9082"],
        [506, 14, "#4A4038"],
      ].map(([y, h, c]) => (
        <rect key={y as number} x="0" y={y as number} width="400" height={h as number} fill={c as string} />
      ))}
      {Array.from({ length: 40 }, (_, i) => (
        <path key={i} d={`M${i * 10} 492 q5 6 10 0`} fill="#B5A898" opacity="0.7" />
      ))}

      {/* Gopuram base around the doorway */}
      <rect x="104" y="296" width="192" height="224" fill={url("granite")} />
      <rect x="104" y="296" width="192" height="224" fill={url("speckle")} />
      {[110, 280].map((x) => (
        <g key={x}>
          <rect x={x} y="300" width="10" height="186" fill="#8E8274" />
          {[320, 360, 400, 440].map((y) => (
            <rect key={y} x={x - 1} y={y} width="12" height="4" fill="#B5A898" />
          ))}
        </g>
      ))}
      {/* Niches above the door, lit like shrines */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={136 + i * 46} y="310" width="36" height="46" rx="3" fill={glass} />
          <path d={`M${136 + i * 46} 314 q18 -16 36 0`} fill="none" stroke="#D4A017" strokeWidth="2" />
          <circle cx={154 + i * 46} cy="326" r="5" fill="#3A2412" opacity="0.8" />
          <path d={`M${147 + i * 46} 352 q0 -18 7 -22 q7 4 7 22 Z`} fill="#3A2412" opacity="0.8" />
        </g>
      ))}
      {/* Carved door frame with gold */}
      <rect x="140" y="370" width="120" height="12" fill="#D4A017" />
      <rect x="140" y="372" width="6" height="148" fill="#D4A017" />
      <rect x="254" y="372" width="6" height="148" fill="#D4A017" />
      {/* Mango-leaf thoranam with marigolds */}
      <path d="M128 370 Q200 392 272 370" fill="none" stroke="#5A3A12" strokeWidth="1.2" />
      {Array.from({ length: 15 }, (_, i) => {
        const x = 132 + i * 9.7;
        const y = 371 + Math.sin((i / 14) * Math.PI) * 10;
        return (
          <g key={i}>
            <path d={`M${x} ${y} l-3 10 l3 4 l3 -4 Z`} fill={i % 2 ? "#2E7D32" : "#43A047"} />
            {i % 3 === 1 && <circle cx={x} cy={y + 1} r="2.6" fill="#F28C1B" />}
          </g>
        );
      })}

      {/* The tiers, each smaller, with painted niches of deities */}
      {Array.from({ length: tiers }, (_, t) => {
        const w = 196 - t * 16;
        const h = 24;
        const y = 296 - (t + 1) * (h + 4);
        const x = 200 - w / 2;
        const n = Math.max(3, 9 - t);
        return (
          <g key={t}>
            <rect x={x} y={y} width={w} height={h} fill={url("ochre")} />
            {/* Projecting central bay */}
            <rect x={200 - w * 0.17} y={y - 1} width={w * 0.34} height={h + 2} fill="#E8B04A" />
            {Array.from({ length: n }, (_, i) => {
              const nw = (w - 10) / n;
              const cx = x + 5 + nw * i + nw / 2;
              const back = TIER_COLORS[(i + t) % TIER_COLORS.length];
              const fig = FIGURE_COLORS[(i * 2 + t) % FIGURE_COLORS.length];
              return (
                <g key={i}>
                  <path d={`M${cx - nw * 0.36} ${y + h - 2} V${y + 7} q${nw * 0.36} -6 ${nw * 0.72} 0 V${y + h - 2} Z`} fill={back} />
                  <circle cx={cx} cy={y + 9.5} r={Math.min(2.6, nw * 0.12)} fill={fig} />
                  <path d={`M${cx - nw * 0.16} ${y + h - 3} q0 -9 ${nw * 0.16} -10 q${nw * 0.16} 1 ${nw * 0.16} 10 Z`} fill={fig} />
                  <circle cx={cx} cy={y + 8.5} r={Math.min(3.6, nw * 0.17)} fill="none" stroke="#F5E6C8" strokeWidth="0.6" />
                </g>
              );
            })}
            {/* Kapota cornice with kudu arches */}
            <rect x={x - 5} y={y - 4} width={w + 10} height="5" fill="#8E2C1F" />
            <rect x={x - 5} y={y + 1} width={w + 10} height="1.5" fill="#F5E6C8" />
            {Array.from({ length: Math.floor((w + 10) / 10) }, (_, i) => (
              <path key={i} d={`M${x - 3 + i * 10} ${y - 4} q3 -4 6 0`} fill="#F5E6C8" opacity="0.85" />
            ))}
          </g>
        );
      })}

      {/* Barrel vault (shala) with kirtimukha ends and kalasams */}
      {(() => {
        const top = 296 - tiers * 28;
        return (
          <g>
            <path d={`M140 ${top} Q140 ${top - 34} 200 ${top - 36} Q260 ${top - 34} 260 ${top} Z`} fill={url("vault")} />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <path key={i} d={`M${148 + i * 17} ${top} Q${148 + i * 17} ${top - 26} ${150 + i * 17} ${top - 30}`} fill="none" stroke="#F0A060" strokeWidth="0.8" opacity="0.7" />
            ))}
            {[138, 262].map((x) => (
              <g key={x}>
                <path d={`M${x - 8} ${top} q0 -22 8 -24 q8 2 8 24 Z`} fill="#F0C25A" stroke="#8E2C1F" strokeWidth="1" />
                <circle cx={x} cy={top - 10} r="3.4" fill="#C0392B" />
              </g>
            ))}
            {[158, 179, 200, 221, 242].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy={top - 38} rx="5" ry="6" fill="#E3B341" />
                <path d={`M${x - 2.5} ${top - 44} q2.5 -12 5 0 Z`} fill="#E3B341" />
                <circle cx={x} cy={top - 56} r="1.6" fill="#FFE08A" />
              </g>
            ))}
          </g>
        );
      })()}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Gothic cathedral                                                    */
/* ------------------------------------------------------------------ */

const STAINED = ["#1B3F8B", "#B0202E", "#1F7A4D", "#D99A1E", "#5B2C83", "#1E7FA8"];

function Cathedral({ id, url, lit }: ArtProps) {
  const dim = (c: string) => (lit ? c : "#22223A");
  const lancet = (x: number, y: number, w: number, h: number) =>
    `M${x} ${y + h} V${y + w * 0.7} Q${x} ${y} ${x + w / 2} ${y - w * 0.15} Q${x + w} ${y} ${x + w} ${y + w * 0.7} V${y + h} Z`;
  const tower = (x: number) => (
    <g>
      <rect x={x} y="190" width="92" height="330" fill={url("stone")} />
      <rect x={x} y="190" width="92" height="330" fill={url("ashlar")} />
      {/* Buttresses */}
      {[x - 6, x + 86].map((bx) => (
        <g key={bx}>
          <rect x={bx} y="210" width="12" height="310" fill={url("stoneSide")} />
          {[300, 400].map((y) => (
            <path key={y} d={`M${bx} ${y} l6 -10 l6 10 Z`} fill="#A9A294" />
          ))}
          <path d={`M${bx} 210 l6 -26 l6 26 Z`} fill={url("stoneSide")} />
        </g>
      ))}
      {/* Stained-glass lancets, two storeys */}
      {[
        [x + 22, 380, 18, 70],
        [x + 52, 380, 18, 70],
        [x + 30, 250, 32, 96],
      ].map(([lx, ly, lw, lh], i) => (
        <g key={i}>
          <path d={lancet(lx, ly, lw, lh)} fill={url("glassFill")} opacity={lit ? 1 : 0.25} />
          <path d={lancet(lx, ly, lw, lh)} fill={lit ? "none" : "#22223A"} opacity="0.75" />
          <path d={lancet(lx, ly, lw, lh)} fill="none" stroke="#D8D0C2" strokeWidth="2" />
          <line x1={lx + lw / 2} y1={ly} x2={lx + lw / 2} y2={ly + lh} stroke="#D8D0C2" strokeWidth="1" />
        </g>
      ))}
      {/* Belfry louvres and parapet */}
      <rect x={x + 6} y="196" width="80" height="6" fill="#A9A294" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={x + 6 + i * 9} y="188" width="5" height="8" fill="#BFB8AA" />
      ))}
      {/* Spire with crockets and corner pinnacles */}
      <path d={`M${x + 8} 190 L${x + 46} 30 L${x + 84} 190 Z`} fill={url("slate")} />
      <path d={`M${x + 46} 30 L${x + 84} 190 H${x + 46} Z`} fill="#000" opacity="0.18" />
      {Array.from({ length: 8 }, (_, i) => {
        const t = (i + 1) / 9;
        return (
          <g key={i}>
            <circle cx={x + 8 + 38 * t} cy={190 - 160 * t} r="2.2" fill="#C7BFB0" />
            <circle cx={x + 84 - 38 * t} cy={190 - 160 * t} r="2.2" fill="#C7BFB0" />
          </g>
        );
      })}
      {[x + 2, x + 90].map((px) => (
        <path key={px} d={`M${px - 5} 192 L${px} 150 L${px + 5} 192 Z`} fill="#BFB8AA" />
      ))}
      <path d={`M${x + 46} 30 V8 M${x + 40} 15 H${x + 52}`} stroke="#E3C46A" strokeWidth="2" />
    </g>
  );
  return (
    <>
      <defs>
        <linearGradient id={id("stone")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9E3D6" />
          <stop offset="0.6" stopColor="#C2BBAD" />
          <stop offset="1" stopColor="#8E887D" />
        </linearGradient>
        <linearGradient id={id("stoneSide")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#CFC8BA" />
          <stop offset="1" stopColor="#8A8478" />
        </linearGradient>
        <linearGradient id={id("slate")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5A6488" />
          <stop offset="1" stopColor="#2E3550" />
        </linearGradient>
        <linearGradient id={id("recess")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5E5A66" />
          <stop offset="1" stopColor="#2A2830" />
        </linearGradient>
        <linearGradient id={id("glassFill")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5B2C83" />
          <stop offset="0.25" stopColor="#1B3F8B" />
          <stop offset="0.5" stopColor="#B0202E" />
          <stop offset="0.72" stopColor="#D99A1E" />
          <stop offset="1" stopColor="#1F7A4D" />
        </linearGradient>
        <pattern id={id("ashlar")} width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 12 H24 M12 0 V6 M0 6 H24 M0 6 V12 M24 6 V12" fill="none" stroke="#6E685E" strokeWidth="0.5" opacity="0.55" />
        </pattern>
      </defs>

      {tower(14)}
      {tower(294)}

      {/* Nave front and gable */}
      <rect x="106" y="236" width="188" height="284" fill={url("stone")} />
      <rect x="106" y="236" width="188" height="284" fill={url("ashlar")} />
      <path d="M100 240 L200 120 L300 240 Z" fill={url("stone")} />
      <path d="M100 240 L200 120 L300 240 Z" fill={url("ashlar")} />
      <path d="M100 240 L200 120 L300 240" fill="none" stroke="#A9A294" strokeWidth="4" />
      {Array.from({ length: 7 }, (_, i) => {
        const t = (i + 1) / 8;
        return (
          <g key={i}>
            <circle cx={100 + 100 * t} cy={240 - 120 * t} r="2.4" fill="#D8D0C2" />
            <circle cx={300 - 100 * t} cy={240 - 120 * t} r="2.4" fill="#D8D0C2" />
          </g>
        );
      })}
      <path d="M200 120 V92 M191 102 H209" stroke="#E3C46A" strokeWidth="3" />

      {/* Rose window */}
      <circle cx="200" cy="240" r="48" fill="#8E887D" />
      <circle cx="200" cy="240" r="44" fill="#1A1A2E" />
      {Array.from({ length: 16 }, (_, i) => {
        const a0 = (i / 16) * Math.PI * 2;
        const a1 = ((i + 1) / 16) * Math.PI * 2;
        const p = (a: number, r: number) => `${200 + Math.cos(a) * r} ${240 + Math.sin(a) * r}`;
        return (
          <g key={i}>
            <path d={`M${p(a0, 24)} L${p(a0, 42)} A42 42 0 0 1 ${p(a1, 42)} L${p(a1, 24)} A24 24 0 0 0 ${p(a0, 24)} Z`} fill={dim(STAINED[i % 6])} />
            <circle cx={200 + Math.cos((a0 + a1) / 2) * 33} cy={240 + Math.sin((a0 + a1) / 2) * 33} r="4" fill={dim(STAINED[(i + 3) % 6])} stroke="#D8D0C2" strokeWidth="0.8" />
          </g>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <path key={i} d={`M200 240 L${200 + Math.cos(a) * 24} ${240 + Math.sin(a) * 24}`} stroke="#D8D0C2" strokeWidth="1.2" />;
      })}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={200 + Math.cos((i / 8) * Math.PI * 2 + 0.4) * 14} cy={240 + Math.sin((i / 8) * Math.PI * 2 + 0.4) * 14} r="6" fill={dim(STAINED[(i + 1) % 6])} />
      ))}
      <circle cx="200" cy="240" r="6" fill={dim("#F2C14E")} />
      <circle cx="200" cy="240" r="44" fill="none" stroke="#D8D0C2" strokeWidth="2" />
      <circle cx="200" cy="240" r="24" fill="none" stroke="#D8D0C2" strokeWidth="1.5" />
      {lit && <circle cx="200" cy="240" r="52" fill="#9FB0FF" opacity="0.12" />}

      {/* Gallery of saints */}
      <rect x="106" y="296" width="188" height="4" fill="#A9A294" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 112 + i * 20;
        return (
          <g key={i}>
            <path d={`M${x} 334 V310 q8 -10 16 0 V334 Z`} fill={url("recess")} />
            <circle cx={x + 8} cy="314" r="2.6" fill="#BFB8AA" />
            <path d={`M${x + 4} 333 q0 -14 4 -16 q4 2 4 16 Z`} fill="#BFB8AA" />
          </g>
        );
      })}
      <rect x="106" y="334" width="188" height="4" fill="#A9A294" />

      {/* Portal: deep archivolts round the doors, a tympanum with a mandorla */}
      {[0, 1, 2, 3].map((k) => {
        const half = 82 - k * 6;
        return (
          <path
            key={k}
            d={`M${200 - half} 520 V418 Q${200 - half} ${352 + k * 6} 200 ${340 + k * 8} Q${200 + half} ${352 + k * 6} ${200 + half} 418 V520`}
            fill={k === 3 ? url("recess") : "none"}
            stroke={k % 2 ? "#D8D0C2" : "#A9A294"}
            strokeWidth="5"
          />
        );
      })}
      <ellipse cx="200" cy="380" rx="10" ry="14" fill="none" stroke="#E3C46A" strokeWidth="1.6" />
      <circle cx="200" cy="372" r="3" fill="#E3C46A" />
      {/* Jamb statues */}
      {[124, 270].map((x) => (
        <g key={x}>
          <rect x={x} y="430" width="6" height="90" fill="#A9A294" />
          <circle cx={x + 3} cy="440" r="3" fill="#D8D0C2" />
          <path d={`M${x - 1} 476 q0 -26 4 -30 q4 4 4 30 Z`} fill="#D8D0C2" />
        </g>
      ))}
      {/* Steps */}
      <rect x="96" y="512" width="208" height="8" fill="#A9A294" />
    </>
  );
}
