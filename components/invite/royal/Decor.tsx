import type { ReactNode } from "react";
import type { PlaceScene } from "@/lib/types";
import type { RoyalPalette } from "./palettes";

/**
 * Hook-free SVG ornaments for the royal-palace layout. Everything is drawn
 * deterministically from props, so these render identically on the server
 * and the client.
 */

/** A marigold (or jasmine / rose, per palette) toran: a leafy top band,
 * hanging flower strands tipped with a leaf, and swags between them. */
export function Toran({
  palette,
  width,
  height,
  strands,
  className,
}: {
  palette: RoyalPalette;
  width: number;
  height: number;
  strands: number;
  className?: string;
}) {
  const top = 6;
  const step = width / strands;
  const [c1, c2, c3] = palette.flowers;
  const nodes: ReactNode[] = [];

  for (let i = 0; i <= strands; i++) {
    const x = i * step;
    const len = height * (i % 2 ? 0.55 : 0.85);
    for (let y = top + 4; y < len; y += 7) {
      nodes.push(
        <circle
          key={`s${i}-${y}`}
          cx={x}
          cy={y}
          r={4.2}
          fill={(Math.floor(y / 7) + i) % 3 === 0 ? c2 : c1}
        />
      );
    }
    nodes.push(
      <path key={`t${i}`} d={`M${x} ${len} q5 8 0 16 q-5 -8 0 -16z`} fill={palette.leafLight} />
    );
  }
  for (let i = 0; i < strands; i++) {
    const x = i * step;
    for (let k = 1; k <= 8; k++) {
      const t = k * 0.11;
      nodes.push(
        <circle
          key={`w${i}-${k}`}
          cx={x + step * t}
          cy={top + 4 + Math.sin(Math.PI * t) * height * 0.28}
          r={3.6}
          fill={t > 0.4 && t < 0.6 ? c3 : c1}
        />
      );
    }
  }
  for (let i = 0; i < strands * 2; i++) {
    const x = (i * step) / 2 + step / 4;
    nodes.push(
      <path
        key={`l${i}`}
        d={`M${x} ${top} q6 10 0 18 q-6 -8 0 -18z`}
        fill={i % 2 ? palette.leaf : palette.leafLight}
      />
    );
  }

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect x={0} y={0} width={width} height={top} fill={palette.leaf} />
      {nodes}
    </svg>
  );
}

/** Lotus medallion on each palace door. */
export function Medallion({ palette, className }: { palette: RoyalPalette; className?: string }) {
  return (
    <svg className={className} viewBox="-50 -50 100 100" aria-hidden>
      <circle r={46} fill="none" stroke={palette.goldLight} strokeWidth={2.5} />
      <circle r={40} fill="none" stroke={palette.gold} strokeWidth={1} strokeDasharray="2 3" />
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          transform={`rotate(${i * 30})`}
          d="M0 -8 C8 -18 6 -30 0 -38 C-6 -30 -8 -18 0 -8Z"
          fill={i % 2 ? palette.gold : palette.goldLight}
        />
      ))}
      <circle r={9} fill={palette.goldLight} stroke={palette.goldDeep} strokeWidth={1.5} />
      <circle r={3.5} fill={palette.goldDeep} />
    </svg>
  );
}

/** Potted plant flanking the palace doorway. */
export function Plant({ palette, className }: { palette: RoyalPalette; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 120" aria-hidden>
      <path d="M30 120h40l6-30H24z" fill={palette.goldDeep} />
      <path d="M28 95h44" stroke={palette.goldLight} strokeWidth={3} />
      <g fill={palette.leaf}>
        <path d="M50 92C40 60 20 50 5 48c18 12 30 26 45 44z" />
        <path d="M50 92C62 58 82 46 98 44 80 58 68 72 50 92z" />
        <path d="M50 92C46 55 50 30 58 8c-2 30 0 55-8 84z" />
        <path d="M50 92C36 70 30 42 34 20c4 26 8 46 16 72z" fill={palette.leafLight} />
      </g>
    </svg>
  );
}

/** The wedding mandapam with a lamp, drawn under the hero names. */
export function Mandapam({ palette, className }: { palette: RoyalPalette; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 330 200" aria-hidden>
      <defs>
        <linearGradient id="rp-mandapam-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.goldLight} />
          <stop offset="1" stopColor={palette.goldDeep} />
        </linearGradient>
        <linearGradient id="rp-mandapam-bar" x1="0" x2="1">
          <stop offset="0" stopColor={palette.goldDeep} />
          <stop offset=".5" stopColor={palette.goldLight} />
          <stop offset="1" stopColor={palette.goldDeep} />
        </linearGradient>
      </defs>
      <path d="M60 70 Q165 0 270 70Z" fill="url(#rp-mandapam-roof)" />
      <path d="M150 20 h30 l-15 -18z" fill={palette.gold} />
      <circle cx={165} cy={16} r={4} fill="#fff3c4" />
      <rect x={50} y={68} width={230} height={14} rx={3} fill="url(#rp-mandapam-bar)" />
      <g fill="url(#rp-mandapam-bar)">
        <rect x={66} y={82} width={14} height={92} />
        <rect x={118} y={82} width={12} height={92} />
        <rect x={200} y={82} width={12} height={92} />
        <rect x={250} y={82} width={14} height={92} />
      </g>
      <path
        d="M80 82 Q124 120 118 82 M130 82 Q165 124 200 82 M212 82 Q206 120 250 82"
        fill="none"
        stroke={palette.flowers[0]}
        strokeWidth={3}
        strokeDasharray="1 5"
        strokeLinecap="round"
      />
      <rect x={30} y={172} width={270} height={10} rx={2} fill="url(#rp-mandapam-bar)" />
      <rect x={14} y={182} width={302} height={12} rx={2} fill={palette.gold} />
      <g fill={palette.leaf}>
        <path d="M20 172c-6-26-16-34-24-36 10 8 16 20 24 36z" />
        <path d="M20 172c2-30 10-40 20-46-6 12-12 26-20 46z" />
        <path d="M310 172c6-26 16-34 24-36-10 8-16 20-24 36z" />
        <path d="M310 172c-2-30-10-40-20-46 6 12 12 26 20 46z" />
      </g>
      <circle cx={165} cy={150} r={10} fill="#fff6d8" opacity={0.9} />
      <path d="M165 136c3 5 3 9 0 12-3-3-3-7 0-12z" fill={palette.flowers[0]} />
    </svg>
  );
}

export function Flourish({ color, className }: { color: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 14" aria-hidden>
      <path d="M0 7h32M58 7h32" stroke={color} />
      <path d="M45 1l6 6-6 6-6-6z" fill={color} />
    </svg>
  );
}

/** Scalloped edge that blends one dark band into the next. */
export function Scallop({ color, className }: { color: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 28" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 28V14 Q25 0 50 14 T100 14 T150 14 T200 14 T250 14 T300 14 T350 14 T400 14V28Z"
        fill={color}
      />
    </svg>
  );
}

const SKIES: Record<PlaceScene, [string, string]> = {
  temple: ["#f7c67a", "#e98a4a"],
  palace: ["#9cc6d9", "#f3e3c3"],
  nature: ["#f6d7a0", "#c9d9a8"],
  heritage: ["#bfd6e2", "#efe6d2"],
  beach: ["#a8d8e8", "#f6e3bf"],
};

function SceneBody({ scene }: { scene: PlaceScene }) {
  switch (scene) {
    case "temple":
      return (
        <>
          <path d="M130 250 L140 70 L200 70 L210 250Z" fill="#8a3a1c" />
          <g fill="#c4642e">
            {Array.from({ length: 9 }, (_, i) => (
              <rect
                key={i}
                x={136 + i * 1.2}
                y={230 - i * 20}
                width={68 - i * 2.4}
                height={12}
                rx={2}
              />
            ))}
          </g>
          <path d="M146 70 Q170 40 194 70Z" fill="#d9a441" />
          <g fill="#f2c14e">
            {[150, 160, 170, 180, 190].map((x) => (
              <circle key={x} cx={x} cy={60} r={2.5} />
            ))}
          </g>
          <rect y={232} width={340} height={18} fill="#5a2a14" />
        </>
      );
    case "palace":
      return (
        <>
          <rect x={40} y={110} width={260} height={140} fill="#f1e3c2" />
          {[70, 130, 190, 250].map((x) => (
            <g key={x}>
              <path d={`M${x - 22} 250 V160 a22 22 0 0 1 44 0 V250Z`} fill="#c9a86a" />
              <rect x={x + 24} y={110} width={8} height={140} fill="#e8d6a8" />
            </g>
          ))}
          <rect x={30} y={100} width={280} height={12} fill="#d8c08a" />
          <path d="M150 100 Q170 55 190 100Z" fill="#e9d7a8" />
        </>
      );
    case "nature":
      return (
        <>
          <path d="M0 180 Q80 90 170 160 T340 130 V250 H0Z" fill="#4c7a45" />
          <path d="M0 210 Q120 150 220 200 T340 190 V250 H0Z" fill="#2f5a30" />
          <circle cx={260} cy={70} r={22} fill="#fff1c4" />
        </>
      );
    case "beach":
      return (
        <>
          <circle cx={250} cy={80} r={24} fill="#fff1c4" />
          <path d="M0 160 Q85 145 170 160 T340 158 V250 H0Z" fill="#3f8fa8" />
          <path d="M0 196 Q90 178 180 196 T340 190 V250 H0Z" fill="#ecd3a0" />
          <path d="M70 196 C74 150 82 120 96 96" stroke="#6b4a2a" strokeWidth={5} fill="none" />
          <g fill="#2f6b4a">
            <path d="M96 96 c-20 -6 -36 2 -44 14 c16 -6 30 -8 44 -14z" />
            <path d="M96 96 c18 -10 36 -6 46 4 c-16 -2 -32 -2 -46 -4z" />
            <path d="M96 96 c-4 -18 4 -32 16 -40 c-6 14 -10 28 -16 40z" />
          </g>
        </>
      );
    case "heritage":
    default:
      return (
        <>
          <rect x={70} y={120} width={200} height={110} fill="#f4ecd8" />
          <path d="M60 120 L170 70 L280 120Z" fill="#e5d6b4" />
          {[90, 125, 160, 195, 230].map((x) => (
            <rect key={x} x={x} y={130} width={14} height={100} fill="#d6c59a" />
          ))}
          <rect y={228} width={340} height={22} fill="#9c8b62" />
        </>
      );
  }
}

/** Header illustration for a Places to Explore card. */
export function SceneArt({ scene }: { scene: PlaceScene }) {
  const [top, bottom] = SKIES[scene] ?? SKIES.heritage;
  const id = `rp-sky-${scene}`;
  return (
    <svg viewBox="0 0 340 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width={340} height={250} fill={`url(#${id})`} />
      <SceneBody scene={scene} />
    </svg>
  );
}
