/**
 * Hand-drawn SVG pieces for the chapel template (its intro and layout):
 * doves, the bell, a rose window, candles, white posies, lace edges and a
 * wax seal. Everything is drawn here, so the template ships no image assets.
 * Coordinates are fixed numbers (no trig at render time), so the server and
 * the browser always produce identical markup.
 */

/** A dove in flight, facing right. Tint with `color`. */
export function Dove({ className, color = "#FFFFFF" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 40" aria-hidden>
      <path
        d="M4 24C12 22 18 22 24 24C26 16 30 6 42 2C38 10 37 16 38 21C44 18 52 18 58 20C54 22 50 24 48 26C52 26 56 27 60 29C54 31 48 31 42 30C36 34 26 36 18 33C12 31 7 28 4 24Z"
        fill={color}
      />
      <path d="M24 24C28 18 33 12 40 8" fill="none" stroke="rgba(31,42,68,0.18)" strokeWidth="1.2" />
      <circle cx="54" cy="21.5" r="1" fill="#1F2A44" />
      <path d="M58.5 21.2L62 22L58.6 22.8Z" fill="#E8B45A" />
    </svg>
  );
}

/** A church bell with its clapper. Swings from the top (CSS). */
export function Bell({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 64" aria-hidden>
      <defs>
        <linearGradient id="chapel-bell" x1="0" x2="1">
          <stop offset="0" stopColor="#9C7A3C" />
          <stop offset="0.45" stopColor="#F1D68E" />
          <stop offset="1" stopColor="#8C6A2E" />
        </linearGradient>
      </defs>
      <rect x="26" y="0" width="8" height="6" rx="2" fill="#7A5A28" />
      <path d="M30 5C18 5 14 16 13 30C12 42 8 48 4 52H56C52 48 48 42 47 30C46 16 42 5 30 5Z" fill="url(#chapel-bell)" />
      <rect x="2" y="51" width="56" height="5" rx="2.5" fill="#B8975A" />
      <circle cx="30" cy="60" r="4" fill="#7A5A28" />
    </svg>
  );
}

/** A round rose window: petals of stained glass round a gold heart. */
export function RoseWindow({ className }: { className?: string }) {
  const glass = ["#8FB3D9", "#E8A9B8", "#F3D27A", "#A9C9A4", "#B9A6D9", "#F2B880", "#8FB3D9", "#E8A9B8"];
  return (
    <svg className={className} viewBox="-50 -50 100 100" aria-hidden>
      <circle r="48" fill="#FBF7EF" stroke="#B8975A" strokeWidth="3" />
      {glass.map((c, i) => (
        <path
          key={i}
          d="M0 -8C-9 -16 -10 -32 0 -42C10 -32 9 -16 0 -8Z"
          fill={c}
          stroke="#FBF7EF"
          strokeWidth="1.5"
          transform={`rotate(${i * 45})`}
          opacity="0.9"
        />
      ))}
      <circle r="9" fill="#F3D27A" stroke="#B8975A" strokeWidth="2" />
    </svg>
  );
}

/** A lit pillar candle with a flickering flame (flame class animates). */
export function Candle({
  className,
  flameClassName,
  height = 46,
}: {
  className?: string;
  flameClassName?: string;
  height?: number;
}) {
  return (
    <svg className={className} viewBox={`0 0 20 ${height + 22}`} aria-hidden>
      <defs>
        <radialGradient id="chapel-glow">
          <stop offset="0" stopColor="rgba(255,214,130,0.75)" />
          <stop offset="1" stopColor="rgba(255,214,130,0)" />
        </radialGradient>
      </defs>
      <circle cx="10" cy="11" r="10" fill="url(#chapel-glow)" />
      <g className={flameClassName}>
        <path d="M10 3C13 8 13.5 11 10 16C6.5 11 7 8 10 3Z" fill="#FFC45C" />
        <path d="M10 8C11.4 10.5 11.4 12 10 14.5C8.6 12 8.6 10.5 10 8Z" fill="#FFF3C4" />
      </g>
      <rect x="9.4" y="15" width="1.2" height="3" fill="#3B2E22" />
      <rect x="3" y="18" width="14" height={height} rx="2" fill="#FBF3E2" />
      <rect x="3" y="18" width="4" height={height} rx="2" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}

/** A small posy of white roses with greenery, for pew ends and the aisle. */
export function Posy({ className }: { className?: string }) {
  const roses: [number, number, number][] = [
    [14, 16, 7],
    [26, 12, 8],
    [38, 17, 7],
    [20, 25, 6.5],
    [33, 26, 6.5],
  ];
  return (
    <svg className={className} viewBox="0 0 52 40" aria-hidden>
      {[
        "M6 26C10 20 14 20 18 24C13 26 9 27 6 26Z",
        "M46 26C42 20 38 20 34 24C39 26 43 27 46 26Z",
        "M26 36C22 30 22 26 26 22C30 26 30 30 26 36Z",
      ].map((d) => (
        <path key={d} d={d} fill="#8FA87A" />
      ))}
      {roses.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={i === 1 ? "#F6E3E6" : "#FFFFFF"} stroke="#E9E0D2" strokeWidth="0.8" />
          <path
            d={`M${x - r * 0.5} ${y}Q${x} ${y - r * 0.7} ${x + r * 0.5} ${y}Q${x} ${y + r * 0.45} ${x - r * 0.2} ${y - r * 0.1}`}
            fill="none"
            stroke="#E3D6C6"
            strokeWidth="0.9"
          />
        </g>
      ))}
    </svg>
  );
}

/** A lace edge between two sections: scallops with eyelet holes. `color`
 * is the section below (the lace belongs to it). */
export function LaceEdge({ color, holes }: { color: string; holes: string }) {
  const scallops = Array.from({ length: 20 }, (_, i) => i * 20);
  return (
    <svg
      viewBox="0 0 400 22"
      preserveAspectRatio="none"
      aria-hidden
      style={{ display: "block", width: "100%", height: 22 }}
    >
      <path d={`M0 22V12${scallops.map((x) => `A10 10 0 0 1 ${x + 20} 12`).join("")}V22Z`} fill={color} />
      {scallops.map((x) => (
        <circle key={x} cx={x + 10} cy="11" r="1.6" fill={holes} />
      ))}
    </svg>
  );
}

/** A wax seal with the couple's initials. */
export function WaxSeal({ initials, className }: { initials: string; className?: string }) {
  return (
    <svg className={className} viewBox="-30 -30 60 60" aria-hidden>
      <path
        d="M0 -27C6 -29 9 -24 14 -23C19 -22 23 -18 24 -13C26 -8 29 -4 27 1C26 6 28 10 25 15C22 19 17 21 13 24C8 27 4 29 -1 28C-6 27 -10 29 -14 25C-18 22 -23 20 -25 15C-27 10 -28 6 -27 1C-27 -4 -29 -8 -26 -13C-23 -18 -19 -21 -14 -23C-9 -25 -5 -26 0 -27Z"
        fill="#8E2B3B"
      />
      <circle r="19" fill="none" stroke="#B5485A" strokeWidth="1.5" />
      <text
        y="5.5"
        textAnchor="middle"
        fontSize="15"
        fontFamily="var(--rp-heading), serif"
        fill="#F6D9CF"
        letterSpacing="0.5"
      >
        {initials}
      </text>
    </svg>
  );
}
