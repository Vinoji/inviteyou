import { useId } from "react";

/**
 * Hand-drawn SVG pieces for the botanical-garden template (its intro and
 * layout): ivy, ferns, terracotta pots, hedges, wildflowers, butterflies and
 * pressed flowers. Everything is drawn here, so the template ships no image
 * assets and stays sharp at any size.
 */

/** Deterministic 0–1 noise, so server and client draw identical shapes. */
function noise(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return r2(x - Math.floor(x));
}

/** Rounds to 2 decimals. Node and the browser can disagree in the last
 * digits of Math.sin/cos, which would make the server-rendered SVG differ
 * from the client's and trip React's hydration check. */
function r2(n: number) {
  return Math.round(n * 100) / 100;
}

const LEAF = "M0 0C3-5 11-6 15 0C11 6 3 5 0 0Z";

/** Ivy climbing up both sides of an arched doorway and over the top. The
 * arch is 184 units wide (x 8–192) and 311 tall (y 8–319). */
export function IvyArch({ className }: { className?: string }) {
  // The vine: up the left side, over the arch, part-way down the right.
  const cx = 100;
  const cy = 100;
  const r = 92;
  const pts: { x: number; y: number; a: number }[] = [];
  for (let y = 319; y > cy; y -= 11) pts.push({ x: cx - r, y, a: -90 });
  for (let deg = 180; deg >= 0; deg -= 9) {
    const rad = (deg * Math.PI) / 180;
    pts.push({ x: r2(cx + r * Math.cos(rad)), y: r2(cy - r * Math.sin(rad)), a: -deg });
  }
  for (let y = cy + 10; y < 230; y += 12) pts.push({ x: cx + r, y, a: 90 });
  const path = `M${cx - r} 319V${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}V230`;
  // viewBox matches the doorway's proportions (glasshouse.module.css), so
  // the vine sits on the door frame without stretching.
  return (
    <svg className={className} viewBox="-6 -4 212 327" preserveAspectRatio="none" aria-hidden>
      <path d={path} fill="none" stroke="#6B7F3A" strokeWidth="2" strokeLinecap="round" />
      {pts.map((p, i) => {
        const side = i % 2 ? 1 : -1;
        const tilt = r2(p.a + side * (55 + noise(i) * 30));
        const size = r2(0.7 + noise(i + 40) * 0.6);
        const fill = noise(i + 80) > 0.5 ? "#4E7A3A" : "#6E9A4B";
        return (
          <path
            key={i}
            d={LEAF}
            fill={fill}
            transform={`translate(${p.x + side * 2} ${p.y}) rotate(${tilt}) scale(${size})`}
          />
        );
      })}
      {[20, 34, 48].map((i) => {
        const p = pts[i % pts.length];
        return <circle key={i} cx={p.x} cy={p.y - 3} r="3.2" fill="#FFFFFF" stroke="#F2C2CE" strokeWidth="1.2" />;
      })}
    </svg>
  );
}

/** A potted fern: arching fronds with leaflets. */
export function Fern({ className, flip = false }: { className?: string; flip?: boolean }) {
  const fronds = [-62, -38, -16, 8, 30, 54, 74];
  return (
    <svg className={className} viewBox="0 0 120 100" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      {fronds.map((deg, f) => {
        const len = 52 + noise(f) * 20;
        const rad = ((deg - 90) * Math.PI) / 180;
        const ex = r2(60 + Math.cos(rad) * len);
        const ey = r2(98 + Math.sin(rad) * len * 0.95);
        const qx = r2(60 + Math.cos(rad) * len * 0.55 + deg * 0.25);
        const qy = r2(98 + Math.sin(rad) * len * 0.55 - 8);
        const leaflets = Array.from({ length: 9 }, (_, i) => {
          const t = (i + 1) / 10;
          const x = (1 - t) * (1 - t) * 60 + 2 * (1 - t) * t * qx + t * t * ex;
          const y = (1 - t) * (1 - t) * 98 + 2 * (1 - t) * t * qy + t * t * ey;
          return { x: r2(x), y: r2(y), s: r2(1.1 - t * 0.75) };
        });
        const green = f % 2 ? "#3F6E3A" : "#5A8C45";
        return (
          <g key={f}>
            <path d={`M60 98Q${qx} ${qy} ${ex} ${ey}`} fill="none" stroke={green} strokeWidth="1.4" />
            {leaflets.map((l, i) => (
              <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${deg - 90}) scale(${l.s})`}>
                <ellipse cx="0" cy="-5" rx="2.2" ry="5" fill={green} transform="rotate(-50)" />
                <ellipse cx="0" cy="5" rx="2.2" ry="5" fill={green} transform="rotate(50)" />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/** A terracotta pot with a rolled rim. */
export function Pot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 60" aria-hidden>
      <defs>
        <linearGradient id="garden-pot" x1="0" x2="1">
          <stop offset="0" stopColor="#A9543A" />
          <stop offset="0.45" stopColor="#D0784F" />
          <stop offset="1" stopColor="#9A4A33" />
        </linearGradient>
      </defs>
      <path d="M12 16H68L60 58H20Z" fill="url(#garden-pot)" />
      <rect x="6" y="4" width="68" height="14" rx="3" fill="#C56B45" />
      <rect x="6" y="4" width="68" height="4" rx="2" fill="#DE8C62" opacity="0.8" />
      <path d="M20 58H60" stroke="#7E3B28" strokeWidth="2" />
    </svg>
  );
}

/** A leafy hedge edge — the border between two garden sections. `color`
 * is the section it belongs to (drawn as the hedge's body). */
export function HedgeEdge({ color, flip = false }: { color: string; flip?: boolean }) {
  const bumps = Array.from({ length: 16 }, (_, i) => i);
  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      aria-hidden
      style={{ display: "block", width: "100%", height: 34, transform: flip ? "scaleY(-1)" : undefined }}
    >
      <path
        d={`M0 40V22${bumps
          .map((i) => {
            const x = i * 25;
            const h = 8 + noise(i) * 12;
            return `Q${x + 12.5} ${r2(22 - h * 1.6)} ${x + 25} 22`;
          })
          .join("")}V40Z`}
        fill={color}
      />
    </svg>
  );
}

/** A small wildflower: five petals round a yellow heart. */
export function Wildflower({
  size = 22,
  petal = "#FFFFFF",
  heart = "#F6C453",
  className,
}: {
  size?: number;
  petal?: string;
  heart?: string;
  className?: string;
}) {
  return (
    <svg className={className} width={size} height={size} viewBox="-12 -12 24 24" aria-hidden>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-6" rx="3.6" ry="6" fill={petal} transform={`rotate(${a})`} />
      ))}
      <circle r="3.2" fill={heart} />
    </svg>
  );
}

/** A butterfly whose wings flap (CSS class supplies the animation). */
export function Butterfly({ color = "#F6C453", className }: { color?: string; className?: string }) {
  return (
    <svg className={className} viewBox="-20 -16 40 32" aria-hidden>
      <g data-wing="l">
        <ellipse cx="-8" cy="-5" rx="9" ry="8" fill={color} />
        <ellipse cx="-6" cy="7" rx="6" ry="5" fill={color} opacity="0.85" />
      </g>
      <g data-wing="r">
        <ellipse cx="8" cy="-5" rx="9" ry="8" fill={color} />
        <ellipse cx="6" cy="7" rx="6" ry="5" fill={color} opacity="0.85" />
      </g>
      <rect x="-1" y="-9" width="2" height="19" rx="1" fill="#3B2E22" />
    </svg>
  );
}

/** A pressed flower sprig, flat like it was dried in a book. */
export function PressedSprig({
  className,
  color = "#D9819A",
  rotate = 0,
}: {
  className?: string;
  color?: string;
  rotate?: number;
}) {
  return (
    <svg className={className} viewBox="0 0 60 110" aria-hidden style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M30 108C28 80 32 50 30 18" fill="none" stroke="#7C8B4E" strokeWidth="1.6" />
      {[86, 70, 54, 40].map((y, i) => (
        <path
          key={y}
          d={LEAF}
          fill="#8FA35E"
          opacity="0.85"
          transform={`translate(30 ${y}) rotate(${i % 2 ? -150 : -30}) scale(1.1)`}
        />
      ))}
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="30" cy="10" rx="4.5" ry="8" fill={color} opacity="0.9" transform={`rotate(${a} 30 18)`} />
      ))}
      <circle cx="30" cy="18" r="3.6" fill="#F6C453" />
    </svg>
  );
}

/** Tall grass blades with a few wildflowers, for the foreground of a scene.
 * Drawn as a 400×90 tile repeated across the width at a fixed `height`, so
 * a wide screen gets more meadow instead of a scaled-up (cropped) one. */
export function Meadow({ className, height = 120 }: { className?: string; height?: number }) {
  // useId can contain ":" or "«»", which break url(#…) references.
  const id = `meadow-${useId().replace(/[^\w-]/g, "")}`;
  const scale = r2(height / 90);
  const blades = Array.from({ length: 46 }, (_, i) => i);
  return (
    <svg className={className} height={height} aria-hidden>
      <defs>
        <pattern
          id={id}
          width="400"
          height="90"
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${scale})`}
        >
          {blades.map((i) => {
            const x = (i / 45) * 400 + (noise(i) - 0.5) * 8;
            const h = 40 + noise(i + 7) * 45;
            const lean = (noise(i + 13) - 0.5) * 26;
            const g = noise(i + 21) > 0.5 ? "#5E8C46" : "#7FAA5A";
            return (
              <path
                key={i}
                d={`M${x - 2.4} 90Q${x + lean * 0.4} ${90 - h * 0.6} ${x + lean} ${90 - h}Q${x + lean * 0.4 + 1} ${90 - h * 0.55} ${x + 2.4} 90Z`}
                fill={g}
              />
            );
          })}
          {[34, 96, 170, 238, 310, 372].map((x, i) => (
            <g key={x} transform={`translate(${x} ${40 + noise(i + 3) * 18})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx="0"
                  cy="-4.5"
                  rx="2.8"
                  ry="4.6"
                  fill={i % 3 === 1 ? "#F2A7B8" : "#FFFFFF"}
                  transform={`rotate(${a})`}
                />
              ))}
              <circle r="2.4" fill="#F6C453" />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
