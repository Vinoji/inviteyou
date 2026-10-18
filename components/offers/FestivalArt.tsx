import type { CSSProperties, ReactNode } from "react";
import type { OfferTheme } from "./themes";
import a from "./festivalArt.module.css";

/**
 * The festival's own art for the offer card, drawn in code (no stock
 * images): a scene along the top and a layer of drifting particles —
 * diyas that flicker, snow, a pongal pot boiling over, kites of colour,
 * hearts, a crescent moon… Purely decorative.
 */

type Motion = "fall" | "rise" | "twinkle" | "splash";
const PARTICLES: Record<OfferTheme, { glyphs: string[]; motion: Motion; count: number }> = {
  launch: { glyphs: ["✦", "✧"], motion: "rise", count: 10 },
  diwali: { glyphs: ["✦", "✧", "•"], motion: "rise", count: 16 },
  karthigai: { glyphs: ["✦", "•"], motion: "twinkle", count: 18 },
  christmas: { glyphs: ["❄", "❅", "•"], motion: "fall", count: 22 },
  pongal: { glyphs: ["✿", "❀", "•"], motion: "fall", count: 12 },
  republic: { glyphs: ["▲", "■", "●"], motion: "fall", count: 18 },
  valentine: { glyphs: ["❤", "♥", "❥"], motion: "rise", count: 16 },
  shivaratri: { glyphs: ["✦", "·", "✧"], motion: "twinkle", count: 22 },
  eid: { glyphs: ["✦", "✧", "★"], motion: "twinkle", count: 18 },
  holi: { glyphs: ["●"], motion: "splash", count: 14 },
  ugadi: { glyphs: ["✿", "❀"], motion: "fall", count: 12 },
  puthandu: { glyphs: ["✿", "❀", "✾"], motion: "fall", count: 14 },
  akshaya: { glyphs: ["●", "✦"], motion: "fall", count: 16 },
};
const PARTICLE_COLORS: Record<OfferTheme, string[]> = {
  launch: ["#ffd35c", "#ffe9b8"],
  diwali: ["#ffc94a", "#ff8a3d", "#fff3dc"],
  karthigai: ["#ffb547", "#ffe3a3"],
  christmas: ["#ffffff", "#e8f6ff"],
  pongal: ["#ff7a00", "#ffffff", "#d62839"],
  republic: ["#ff9933", "#138808", "#000080"],
  valentine: ["#ffffff", "#ffd1dc", "#ff2d6f"],
  shivaratri: ["#ffffff", "#c9e6ff"],
  eid: ["#f5d27a", "#ffffff"],
  holi: ["#ff4fa3", "#ffd23f", "#3bceac", "#7b5cff", "#ff7a00"],
  ugadi: ["#ffd166", "#ffffff", "#8a1c1c"],
  puthandu: ["#ffcc4d", "#ffffff", "#ff7aa2"],
  akshaya: ["#ffd700", "#fff4c2", "#c98f3a"],
};

// Deterministic "random" so server and client draw the same particles.
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function FestivalParticles({ theme }: { theme: OfferTheme }) {
  const { glyphs, motion, count } = PARTICLES[theme];
  const colors = PARTICLE_COLORS[theme];
  return (
    <div className={a.particles} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={a.p}
          style={
            {
              "--x": `${Math.round(rand(i, 1) * 96)}%`,
              "--y": `${Math.round(30 + rand(i, 2) * 380)}px`,
              "--s": `${Math.round((motion === "splash" ? 40 : 9) + rand(i, 3) * (motion === "splash" ? 50 : 12))}px`,
              // Rounded: server and browser floats differ in the last digits.
              "--d": `${((motion === "twinkle" ? 2 : motion === "splash" ? 4 : 7) + rand(i, 4) * 6).toFixed(2)}s`,
              "--delay": `${(-rand(i, 5) * 10).toFixed(2)}s`,
              "--drift": `${Math.round((rand(i, 6) - 0.5) * 80)}px`,
              "--anim": motion,
              color: colors[i % colors.length],
              filter: motion === "splash" ? "blur(6px)" : undefined,
            } as CSSProperties
          }
        >
          {glyphs[i % glyphs.length]}
        </span>
      ))}
    </div>
  );
}

const Diya = ({ x, y = 100, s = 1 }: { x: number; y?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="-16" rx="9" ry="12" fill="#ffb21f" opacity="0.35" className={a.glow} />
    <path className={a.flicker} d="M0 -28 C 6 -18, 5 -10, 0 -8 C -5 -10, -6 -18, 0 -28 Z" fill="#ffd54a" />
    <path className={a.flicker} d="M0 -22 C 3 -16, 3 -11, 0 -10 C -3 -11, -3 -16, 0 -22 Z" fill="#fff4c2" />
    <path d="M-18 -8 Q 0 10 18 -8 Q 10 -2 0 -2 Q -10 -2 -18 -8 Z" fill="#c2410c" />
    <path d="M-18 -8 Q 0 -4 18 -8" stroke="#ffcf8a" strokeWidth="1.5" fill="none" />
  </g>
);

const SCENES: Partial<Record<OfferTheme, ReactNode>> = {
  diwali: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <g className={a.spinSlow} opacity="0.35">
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx="200" cy="40" rx="7" ry="22" fill="#ff8a3d" transform={`rotate(${i * 30} 200 62)`} />
        ))}
      </g>
      <circle cx="200" cy="62" r="10" fill="#ffc94a" opacity="0.6" />
      {[60, 130, 270, 340].map((x) => (
        <Diya key={x} x={x} y={108} s={0.95} />
      ))}
      <Diya x={200} y={118} s={1.2} />
    </svg>
  ),
  karthigai: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <path d="M120 120 L 200 34 L 280 120 Z" fill="#2a1f4d" />
      <circle cx="200" cy="30" r="18" fill="#ff9f2e" opacity="0.35" className={a.glow} />
      <path className={a.flicker} d="M200 14 C 208 26, 206 34, 200 36 C 194 34, 192 26, 200 14 Z" fill="#ffd54a" />
      {Array.from({ length: 9 }, (_, i) => (
        <Diya key={i} x={30 + i * 42} y={128} s={0.7} />
      ))}
    </svg>
  ),
  christmas: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <path d="M200 30 L 240 80 L 222 80 L 252 116 L 148 116 L 178 80 L 160 80 Z" fill="#2f8f57" />
      <rect x="192" y="116" width="16" height="12" fill="#6b3e1d" />
      <g className={a.spin}>
        <path d="M200 10 L 205 22 L 218 22 L 207 30 L 211 42 L 200 35 L 189 42 L 193 30 L 182 22 L 195 22 Z" fill="#ffd35c" />
      </g>
      {[[184, 70, "#ff4d4d"], [214, 90, "#ffd35c"], [190, 104, "#7fd1ff"], [226, 108, "#ff4d4d"], [172, 96, "#ffd35c"]].map(
        ([x, y, c], i) => (
          <circle key={i} cx={x as number} cy={y as number} r="4" fill={c as string} className={a.glint} />
        )
      )}
      {[70, 330].map((x) => (
        <g key={x} className={a.sway}>
          <line x1={x} y1="0" x2={x} y2="40" stroke="#ffd35c" strokeWidth="1.5" />
          <path d={`M${x - 12} 62 Q ${x} 30 ${x + 12} 62 Z`} fill="#ffd35c" />
          <circle cx={x} cy="64" r="3" fill="#a4161a" />
        </g>
      ))}
    </svg>
  ),
  pongal: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <g className={a.rise}>
        <circle cx="200" cy="40" r="26" fill="#ff9f1c" opacity="0.9" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="200" y1="4" x2="200" y2="12" stroke="#ff9f1c" strokeWidth="3" transform={`rotate(${i * 30} 200 40)`} />
        ))}
      </g>
      {[95, 305].map((x) => (
        <g key={x} className={a.sway}>
          <rect x={x - 3} y="20" width="6" height="110" fill="#2e7d32" />
          {[40, 62, 84, 106].map((y) => (
            <rect key={y} x={x - 4} y={y} width="8" height="2" fill="#1b5e20" />
          ))}
          <path d={`M${x} 22 q -22 -14 -34 -2 M${x} 22 q 22 -14 34 -2`} stroke="#43a047" strokeWidth="3" fill="none" />
        </g>
      ))}
      <path d="M160 92 Q 200 140 240 92 Q 236 74 200 74 Q 164 74 160 92 Z" fill="#b5651d" />
      <path d="M164 86 Q 200 96 236 86" stroke="#ffd166" strokeWidth="3" fill="none" />
      <ellipse cx="200" cy="74" rx="40" ry="8" fill="#fff8e7" />
      <g>
        <circle className={a.bubble} cx="186" cy="68" r="6" fill="#ffffff" />
        <circle className={a.bubble} cx="202" cy="64" r="8" fill="#fffdf5" />
        <circle className={a.bubble} cx="216" cy="68" r="5" fill="#ffffff" />
      </g>
    </svg>
  ),
  republic: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <g className={a.wave}>
        <path d="M-20 30 Q 100 10 200 30 T 420 30 L 420 48 Q 300 28 200 48 T -20 48 Z" fill="#ff9933" opacity="0.9" />
        <path d="M-20 48 Q 100 28 200 48 T 420 48 L 420 66 Q 300 46 200 66 T -20 66 Z" fill="#ffffff" opacity="0.95" />
        <path d="M-20 66 Q 100 46 200 66 T 420 66 L 420 84 Q 300 64 200 84 T -20 84 Z" fill="#138808" opacity="0.9" />
      </g>
      <g className={a.spin}>
        <circle cx="200" cy="57" r="14" fill="none" stroke="#000080" strokeWidth="2.5" />
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1="200" y1="57" x2="200" y2="44" stroke="#000080" strokeWidth="1" transform={`rotate(${i * 15} 200 57)`} />
        ))}
      </g>
    </svg>
  ),
  valentine: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <g className={a.pulse}>
        <path d="M200 112 C 120 66, 150 14, 200 44 C 250 14, 280 66, 200 112 Z" fill="#ff2d6f" />
        <path d="M200 112 C 120 66, 150 14, 200 44" stroke="#ffd1dc" strokeWidth="3" fill="none" opacity="0.6" />
      </g>
      {[[90, 60, 0.5], [310, 50, 0.6], [60, 104, 0.35], [340, 100, 0.4]].map(([x, y, sc], i) => (
        <path
          key={i}
          className={a.glint}
          transform={`translate(${x} ${y}) scale(${sc})`}
          d="M0 40 C -40 16, -26 -12, 0 4 C 26 -12, 40 16, 0 40 Z"
          fill="#ffffff"
        />
      ))}
    </svg>
  ),
  shivaratri: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <circle cx="200" cy="46" r="34" fill="#9fd3ff" opacity="0.18" className={a.glow} />
      <path d="M214 18 A 30 30 0 1 0 214 74 A 24 24 0 1 1 214 18 Z" fill="#eef3ff" />
      <path d="M0 132 L 80 70 L 130 104 L 200 56 L 270 104 L 320 70 L 400 132 Z" fill="#0d1430" />
      <path d="M200 56 L 215 66 L 185 66 Z" fill="#eef3ff" opacity="0.8" />
    </svg>
  ),
  eid: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <g className={a.glow}>
        <path d="M222 16 A 32 32 0 1 0 222 80 A 26 26 0 1 1 222 16 Z" fill="#f5d27a" />
        <path d="M248 36 L 252 46 L 262 46 L 254 52 L 257 62 L 248 56 L 239 62 L 242 52 L 234 46 L 244 46 Z" fill="#f5d27a" />
      </g>
      {[70, 130, 290, 340].map((x, i) => (
        <g key={x} className={a.sway}>
          <line x1={x} y1="0" x2={x} y2={30 + (i % 2) * 16} stroke="#e8b04a" strokeWidth="1.2" />
          <g transform={`translate(${x} ${30 + (i % 2) * 16})`}>
            <path d="M-8 0 L 8 0 L 11 10 L 8 26 L -8 26 L -11 10 Z" fill="#e8b04a" />
            <rect x="-6" y="6" width="12" height="16" rx="2" fill="#fff3c4" className={a.glow} />
            <path d="M-4 26 L 4 26 L 0 32 Z" fill="#e8b04a" />
          </g>
        </g>
      ))}
    </svg>
  ),
  holi: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      {[[90, 54, "#ff4fa3", 30], [170, 40, "#ffd23f", 24], [240, 60, "#3bceac", 32], [320, 44, "#7b5cff", 26], [130, 92, "#ff7a00", 20], [280, 96, "#ff4fa3", 22]].map(
        ([x, y, c, r], i) => (
          <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string} opacity="0.75" className={a.pulse} style={{ animationDelay: `${-i * 0.35}s` }} />
        )
      )}
    </svg>
  ),
  ugadi: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <path d="M0 10 Q 200 34 400 10" stroke="#7a4a12" strokeWidth="3" fill="none" />
      {Array.from({ length: 11 }, (_, i) => {
        const x = 18 + i * 36;
        const y = 12 + Math.sin((i / 10) * Math.PI) * 18;
        return (
          <g key={i} className={a.sway}>
            <path d={`M${x} ${y} C ${x - 12} ${y + 22}, ${x - 6} ${y + 46}, ${x} ${y + 56} C ${x + 6} ${y + 46}, ${x + 12} ${y + 22}, ${x} ${y} Z`} fill={i % 2 ? "#3f8f2a" : "#2f6b1a"} />
            <line x1={x} y1={y} x2={x} y2={y + 54} stroke="#a5d66f" strokeWidth="1" />
          </g>
        );
      })}
    </svg>
  ),
  puthandu: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <g className={a.spinSlow}>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M200 66 C 214 50, 214 30, 200 18 C 186 30, 186 50, 200 66 Z" fill="none" stroke="#ffcc4d" strokeWidth="2" transform={`rotate(${i * 45} 200 66)`} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx="200" cy="12" r="2.5" fill="#fff4e0" transform={`rotate(${i * 45 + 22.5} 200 66)`} />
        ))}
      </g>
      <circle cx="200" cy="66" r="6" fill="#ffcc4d" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} className={a.sway}>
          <path d={`M${24 + i * 44} 0 C ${14 + i * 44} 18, ${18 + i * 44} 34, ${24 + i * 44} 42 C ${30 + i * 44} 34, ${34 + i * 44} 18, ${24 + i * 44} 0 Z`} fill="#2f7a2a" opacity={i === 4 ? 0 : 0.9} />
        </g>
      ))}
    </svg>
  ),
  akshaya: (
    <svg viewBox="0 0 400 132" preserveAspectRatio="xMidYMin slice">
      <path d="M170 126 Q 200 136 230 126 L 238 92 Q 200 82 162 92 Z" fill="#b8862b" />
      <ellipse cx="200" cy="90" rx="30" ry="7" fill="#9a6a14" />
      <path d="M186 84 Q 200 40 214 84" fill="#2f7a2a" />
      <circle cx="200" cy="62" r="13" fill="#d4a017" />
      <circle cx="200" cy="62" r="13" fill="none" stroke="#fff4c2" strokeWidth="1.5" />
      {[[120, 108], [150, 118], [250, 118], [280, 108], [100, 122], [300, 122]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="10" ry="4" fill="#d4a017" />
          <ellipse cx={x} cy={y - 1} rx="6" ry="2" fill="#fff4c2" className={a.glint} />
        </g>
      ))}
    </svg>
  ),
};

export default function FestivalArt({ theme }: { theme: OfferTheme }) {
  const scene = SCENES[theme];
  return (
    <>
      <FestivalParticles theme={theme} />
      {scene && (
        <div className={a.scene} aria-hidden>
          {scene}
        </div>
      )}
    </>
  );
}
