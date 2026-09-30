import type { ReactNode } from "react";
import type { LayoutStyleId } from "@/lib/layoutStyles";
import type { RoyalPalette } from "../royal/palettes";

/**
 * The illustrations above and below the names in each layout style's hero
 * (StyleHero). Drawn in code, in the template's palette, so every colour
 * follows the palette and the couple's accent. `top` crowns the names,
 * `bottom` grounds the date.
 */
export function heroArt(layout: LayoutStyleId, p: RoyalPalette): { top: ReactNode; bottom: ReactNode } {
  switch (layout) {
    case "temple":
      return { top: <Gopuram p={p} />, bottom: <BrassLamps p={p} /> };
    case "mandap":
      return { top: <MandapCanopy p={p} />, bottom: <Kalash p={p} /> };
    case "palace":
      return { top: <Jharokha p={p} />, bottom: <Peacocks p={p} /> };
    case "lotus":
      return { top: <PeacockFeather p={p} />, bottom: <LotusPond p={p} /> };
    case "nikah":
      return { top: <MughalArchTop p={p} />, bottom: <StarBorder p={p} /> };
    case "moonlit":
      return { top: <CrescentLanterns p={p} />, bottom: <DomeSkyline p={p} /> };
    case "church":
      return { top: <RoseWindow p={p} />, bottom: <Lilies p={p} /> };
    case "garden":
      return { top: <Dove p={p} />, bottom: <RoseSprays p={p} /> };
    case "editorial":
      return { top: <Masthead p={p} />, bottom: <FoilRule p={p} /> };
    case "watercolor":
      return { top: <WatercolorBloom p={p} />, bottom: <WatercolorLeaves p={p} /> };
    case "arch":
      return { top: <SunArch p={p} />, bottom: <Pampas p={p} /> };
    case "velvet":
      return { top: <Filigree p={p} />, bottom: <Candles p={p} /> };
    case "sparkle":
      return { top: <DiamondRing p={p} />, bottom: <Champagne p={p} /> };
    case "thamboolam":
      return { top: <BananaThoranam p={p} />, bottom: <ThamboolamPlate p={p} /> };
    case "vintage":
      return { top: <FilmStrip p={p} />, bottom: <Polaroids p={p} /> };
    case "roses":
      return { top: <RoseGarland p={p} />, bottom: <WineGlasses p={p} /> };
    case "letter":
      return { top: <EnvelopeFlap p={p} />, bottom: <Quill p={p} /> };
    case "neon":
      return { top: <NeonHeart p={p} />, bottom: <NeonSquiggle p={p} /> };
    case "clouds":
      return { top: <PastelSky p={p} />, bottom: <CloudBank p={p} /> };
    case "balloons":
      return { top: <BalloonBunch p={p} />, bottom: <GiftBoxes p={p} /> };
    case "kids":
      return { top: <Bunting p={p} />, bottom: <CrayonShapes p={p} /> };
    case "cake":
      return { top: <BirthdayCake p={p} />, bottom: <PartyHats p={p} /> };
    case "keys":
      return { top: <HouseKey p={p} />, bottom: <PlantsAndKeys p={p} /> };
    case "door":
      return { top: <FestiveDoor p={p} />, bottom: <RangoliDiyas p={p} /> };
    case "bangles":
      return { top: <BangleArch p={p} />, bottom: <BangleStacks p={p} /> };
    case "teddy":
      return { top: <Teddy p={p} />, bottom: <AbcBlocks p={p} /> };
    case "tech":
      return { top: <TechOrb p={p} />, bottom: <Circuit p={p} /> };
  }
}

/** Trig results rounded, so server and browser (different JS engines) draw
 * identical numbers and hydration matches. */
const r2 = (n: number) => Math.round(n * 100) / 100;

const svg = (viewBox: string, children: ReactNode, className = "") => (
  <svg viewBox={viewBox} className={className} aria-hidden focusable="false">
    {children}
  </svg>
);

/* ---------- Temple: gopuram tower + brass lamps ---------- */
function Gopuram({ p }: { p: RoyalPalette }) {
  // Tiers narrowing upward, each with a band of niches; kalasams on top.
  const tiers = [0, 1, 2, 3, 4];
  return svg(
    "0 0 400 200",
    <>
      {tiers.map((i) => {
        const w = 240 - i * 38;
        const x = 200 - w / 2;
        const y = 168 - i * 30;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={30} rx={2} fill={i % 2 ? p.goldDeep : p.gold} />
            {Array.from({ length: Math.max(2, 7 - i) }, (_, j) => (
              <rect
                key={j}
                x={x + 10 + (j * (w - 20)) / Math.max(2, 7 - i)}
                y={y + 7}
                width={(w - 20) / Math.max(2, 7 - i) - 6}
                height={16}
                rx={6}
                fill={p.deep}
                opacity={0.55}
              />
            ))}
          </g>
        );
      })}
      <path d="M150 48 Q200 4 250 48 Z" fill={p.goldLight} />
      {[172, 200, 228].map((x) => (
        <g key={x}>
          <circle cx={x} cy={22} r={5} fill={p.goldLight} />
          <path d={`M${x - 3} 27 L${x} 14 L${x + 3} 27 Z`} fill={p.gold} />
        </g>
      ))}
      <path d="M40 198 H360" stroke={p.gold} strokeWidth={3} />
    </>
  );
}

function BrassLamps({ p }: { p: RoyalPalette }) {
  // Two kuthuvilakku lamps with flames, jasmine string between.
  const lamp = (x: number) => (
    <g>
      <ellipse cx={x} cy={112} rx={26} ry={6} fill={p.goldDeep} />
      <rect x={x - 4} y={48} width={8} height={62} fill={p.gold} />
      <ellipse cx={x} cy={48} rx={22} ry={5} fill={p.goldLight} />
      <path d={`M${x - 22} 48 Q${x} 62 ${x + 22} 48`} fill={p.gold} />
      {[-16, 0, 16].map((dx) => (
        <path key={dx} d={`M${x + dx} 42 q-4 -9 0 -16 q4 7 0 16z`} fill="#FFB020" />
      ))}
      <path d={`M${x - 3} 20 L${x} 6 L${x + 3} 20 Z`} fill={p.goldLight} />
    </g>
  );
  return svg(
    "0 0 400 120",
    <>
      {lamp(70)}
      {lamp(330)}
      <path d="M100 70 Q200 110 300 70" fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="2 6" strokeLinecap="round" />
    </>
  );
}

/* ---------- Mandap: canopy with marigold strings + kalash ---------- */
function MandapCanopy({ p }: { p: RoyalPalette }) {
  const strings = Array.from({ length: 11 }, (_, i) => 40 + i * 32);
  return svg(
    "0 0 400 190",
    <>
      <path d="M20 70 Q200 -30 380 70 Z" fill={p.deep} />
      <path d="M20 70 Q200 -30 380 70" fill="none" stroke={p.gold} strokeWidth={5} />
      <circle cx={200} cy={14} r={9} fill={p.goldLight} />
      <path d="M10 70 H390" stroke={p.gold} strokeWidth={6} />
      {/* scalloped valance */}
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${14 + i * 31.5} 72 q15.75 18 31.5 0`} fill={p.flowers[1]} />
      ))}
      {strings.map((x, i) => (
        <g key={x}>
          {Array.from({ length: 4 + (i % 3) }, (_, j) => (
            <circle key={j} cx={x} cy={96 + j * 16} r={7} fill={p.flowers[j % 2]} />
          ))}
        </g>
      ))}
      <rect x={14} y={70} width={10} height={120} fill={p.gold} />
      <rect x={376} y={70} width={10} height={120} fill={p.gold} />
    </>
  );
}

function Kalash({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 130",
    <>
      {[-1, 1].map((d) => (
        <path key={d} d={`M200 44 q${d * 34} -30 ${d * 52} -8 q${d * -22} 4 ${d * -52} 8z`} fill={p.leaf} />
      ))}
      <circle cx={200} cy={34} r={16} fill="#8B5A2B" />
      <path d="M170 50 H230 L240 70 Q240 118 200 122 Q160 118 160 70 Z" fill={p.gold} />
      <path d="M168 70 H232" stroke={p.deep} strokeWidth={4} />
      <circle cx={200} cy={92} r={8} fill={p.deep} />
      {[60, 100, 300, 340].map((x, i) => (
        <circle key={x} cx={x} cy={110 - (i % 2) * 10} r={10} fill={p.flowers[i % 3]} />
      ))}
    </>
  );
}

/* ---------- Palace: jharokha window + peacocks ---------- */
function Jharokha({ p }: { p: RoyalPalette }) {
  // A multifoil (cusped) arch with a carved canopy and brackets.
  return svg(
    "0 0 400 200",
    <>
      <path d="M60 40 H340 L360 58 H40 Z" fill={p.gold} />
      <path d="M130 22 Q200 -8 270 22 Z" fill={p.goldDeep} />
      <circle cx={200} cy={6} r={6} fill={p.goldLight} />
      <path
        d="M80 200 V120 q0 -26 20 -26 q0 -20 22 -24 q8 -22 30 -22 q16 -22 48 -22 q32 0 48 22 q22 0 30 22 q22 4 22 24 q20 0 20 26 V200"
        fill="none"
        stroke={p.gold}
        strokeWidth={7}
      />
      <path
        d="M96 200 V124 q0 -18 16 -18 q2 -16 18 -18 q8 -16 24 -16 q14 -18 46 -18 q32 0 46 18 q16 0 24 16 q16 2 18 18 q16 0 16 18 V200"
        fill="none"
        stroke={p.goldLight}
        strokeWidth={2}
      />
      {[70, 330].map((x) => (
        <path key={x} d={`M${x - 14} 58 h28 l-6 26 h-16z`} fill={p.goldDeep} />
      ))}
    </>
  );
}

function Peacocks({ p }: { p: RoyalPalette }) {
  const bird = (x: number, flip: number) => (
    <g transform={`translate(${x} 0) scale(${flip} 1)`}>
      <path d="M0 110 Q-70 60 -60 10 Q-20 40 0 110Z" fill={p.flowers[2]} opacity={0.85} />
      {[20, 40, 60].map((y, i) => (
        <circle key={y} cx={-40 + i * 8} cy={y} r={6} fill={p.goldLight} stroke={p.deep} strokeWidth={2} />
      ))}
      <path d="M0 110 q14 -30 6 -58 q-2 -14 8 -18 q10 2 8 12 q-8 6 -4 20 q6 20 -2 44z" fill="#1E4FA0" />
      <path d="M14 34 l6 -10 M17 35 l9 -7" stroke={p.goldLight} strokeWidth={2} />
    </g>
  );
  return svg("0 0 400 120", <>{bird(90, 1)}{bird(310, -1)}</>);
}

/* ---------- Lotus: peacock feather + lotus pond ---------- */
function PeacockFeather({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 150",
    <>
      <path d="M70 140 Q200 90 330 20" fill="none" stroke={p.goldDeep} strokeWidth={2.5} />
      {Array.from({ length: 16 }, (_, i) => {
        const t = i / 15;
        const x = 70 + t * 250;
        const y = 140 - t * 115;
        return (
          <g key={i}>
            <path d={`M${x} ${y} l-10 -18 M${x} ${y} l10 16`} stroke={p.leafLight} strokeWidth={1.2} opacity={0.8} />
          </g>
        );
      })}
      <ellipse cx={330} cy={22} rx={20} ry={16} fill={p.leaf} />
      <ellipse cx={330} cy={22} rx={12} ry={10} fill={p.goldLight} />
      <ellipse cx={330} cy={22} rx={7} ry={6} fill="#1E4FA0" />
      <path d="M40 120 L150 64" stroke={p.goldDeep} strokeWidth={6} strokeLinecap="round" />
      {[62, 80, 98, 116].map((x) => (
        <circle key={x} cx={x} cy={120 - (x - 40) * 0.5} r={2} fill={p.ivory} />
      ))}
    </>
  );
}

function LotusPond({ p }: { p: RoyalPalette }) {
  const lotus = (x: number, s: number) => (
    <g transform={`translate(${x} 84) scale(${s})`}>
      {[-50, -25, 0, 25, 50].map((a) => (
        <path key={a} d="M0 0 Q-12 -26 0 -44 Q12 -26 0 0Z" fill={a === 0 ? p.flowers[0] : p.flowers[1]} transform={`rotate(${a})`} />
      ))}
    </g>
  );
  return svg(
    "0 0 400 120",
    <>
      <path d="M0 96 Q100 84 200 96 T400 96 V120 H0Z" fill={p.leafLight} opacity={0.35} />
      {[60, 250, 340].map((x) => (
        <ellipse key={x} cx={x} cy={100} rx={30} ry={8} fill={p.leaf} opacity={0.8} />
      ))}
      {lotus(140, 1)}
      {lotus(200, 1.3)}
      {lotus(260, 0.9)}
    </>
  );
}

/* ---------- Nikah: Mughal arch top + geometric star border ---------- */
function MughalArchTop({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 170",
    <>
      <path d="M200 20 v18" stroke={p.gold} strokeWidth={2} />
      <path d="M186 38 h28 l6 12 -6 26 h-28 l-6 -26z" fill={p.gold} />
      <path d="M192 50 h16 v20 h-16z" fill="#FFE8A3" />
      <path d="M60 170 V120 Q60 70 130 56 Q180 44 200 8 Q220 44 270 56 Q340 70 340 120 V170" fill="none" stroke={p.gold} strokeWidth={5} />
      <path d="M76 170 V122 Q76 82 136 70 Q182 60 200 32 Q218 60 264 70 Q324 82 324 122 V170" fill="none" stroke={p.goldLight} strokeWidth={1.5} />
    </>
  );
}

function star8(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI / 8) * i;
    const rr = i % 2 ? r * 0.55 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  });
  return pts.join(" ");
}

function StarBorder({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 60",
    <>
      <path d="M20 30 H380" stroke={p.gold} strokeWidth={1.5} />
      {Array.from({ length: 9 }, (_, i) => (
        <polygon key={i} points={star8(40 + i * 40, 30, i === 4 ? 16 : 10)} fill={i === 4 ? p.gold : p.goldLight} />
      ))}
    </>
  );
}

/* ---------- Moonlit: crescent + lanterns, dome skyline ---------- */
function CrescentLanterns({ p }: { p: RoyalPalette }) {
  const lantern = (x: number, len: number, s: number) => (
    <g>
      <path d={`M${x} 0 V${len}`} stroke={p.goldLight} strokeWidth={1.2} />
      <g transform={`translate(${x} ${len}) scale(${s})`}>
        <path d="M-8 0 h16 l4 8 h-24z" fill={p.gold} />
        <path d="M-12 8 h24 l-4 30 h-16z" fill="#FFD66B" opacity={0.9} />
        <path d="M-12 8 h24 l-4 30 h-16z M-4 8 v30 M4 8 v30" fill="none" stroke={p.goldDeep} strokeWidth={1.5} />
        <path d="M-8 38 h16 l-8 10z" fill={p.gold} />
      </g>
    </g>
  );
  return svg(
    "0 0 400 170",
    <>
      <circle cx={200} cy={60} r={34} fill={p.goldLight} />
      <circle cx={214} cy={50} r={30} fill={p.deep} />
      {[
        [40, 30],
        [120, 20],
        [290, 26],
        [360, 44],
        [250, 100],
        [150, 110],
      ].map(([x, y]) => (
        <polygon key={`${x}-${y}`} points={star8(x, y, 3)} fill="#fff" />
      ))}
      {lantern(70, 70, 1.1)}
      {lantern(330, 90, 1)}
      {lantern(110, 110, 0.8)}
    </>
  );
}

function DomeSkyline({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 110",
    <>
      <path
        d="M0 110 V86 H40 V60 h8 V86 H90 Q90 50 120 42 Q150 50 150 86 H176 V40 q24 -34 48 0 V86 H250 Q250 50 280 42 Q310 50 310 86 H352 V60 h8 V86 H400 V110Z"
        fill={p.goldDeep}
        opacity={0.55}
      />
      <path d="M200 8 v10 M120 30 v12 M280 30 v12" stroke={p.goldLight} strokeWidth={2} />
      {[190, 206, 110, 126, 272, 288].map((x) => (
        <rect key={x} x={x} y={92} width={6} height={10} rx={3} fill="#FFD66B" opacity={0.85} />
      ))}
    </>
  );
}

/* ---------- Church: rose window + lilies ---------- */
function RoseWindow({ p }: { p: RoyalPalette }) {
  const glass = ["#9B2335", "#1F4E8C", "#D4A017", "#2E7D5B", "#6A2C70", "#1F4E8C", "#9B2335", "#D4A017"];
  return svg(
    "0 0 400 190",
    <>
      <path d="M90 190 V110 Q90 40 200 10 Q310 40 310 110 V190" fill="none" stroke={p.gold} strokeWidth={4} />
      <g transform="translate(200 96)">
        <circle r={62} fill={p.deep} />
        {glass.map((c, i) => (
          <path
            key={i}
            d="M0 0 L22 -54 A58 58 0 0 1 44 -38 Z"
            fill={c}
            opacity={0.9}
            transform={`rotate(${i * 45})`}
          />
        ))}
        <circle r={62} fill="none" stroke={p.gold} strokeWidth={4} />
        <circle r={20} fill={p.goldLight} stroke={p.gold} strokeWidth={3} />
        <path d="M0 -12 V12 M-8 -4 H8" stroke={p.deep} strokeWidth={3} />
      </g>
    </>
  );
}

function Lilies({ p }: { p: RoyalPalette }) {
  const lily = (x: number, flip: number) => (
    <g transform={`translate(${x} 110) scale(${flip} 1)`}>
      <path d="M0 0 Q6 -40 -4 -80" fill="none" stroke={p.leaf} strokeWidth={3} />
      <path d="M-2 -40 q-30 -10 -40 -30 q24 4 40 24z" fill={p.leafLight} />
      <g transform="translate(-4 -84) scale(1.25)">
        {[-45, 0, 45].map((a) => (
          <path key={a} d="M0 0 Q-11 -20 0 -36 Q11 -20 0 0Z" fill="#fff" stroke={p.gold} strokeWidth={1.2} transform={`rotate(${a})`} />
        ))}
        <path d="M0 0 v-14 M-3 -2 l-2 -12 M3 -2 l2 -12" stroke={p.goldDeep} strokeWidth={1} />
        <circle r={3} fill={p.goldLight} />
      </g>
    </g>
  );
  return svg("0 0 400 120", <>{lily(70, 1)}{lily(110, -1)}{lily(290, 1)}{lily(330, -1)}</>);
}

/* ---------- Garden: dove + rose sprays ---------- */
function Dove({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 130",
    <>
      <path d="M120 100 Q200 70 280 100" fill="none" stroke={p.leaf} strokeWidth={2} />
      {Array.from({ length: 8 }, (_, i) => {
        const cx = 135 + i * 18;
        const cy = r2(96 - Math.sin((i / 7) * Math.PI) * 18);
        return <ellipse key={i} cx={cx} cy={cy} rx={8} ry={4} fill={p.leafLight} transform={`rotate(${-20 + i * 6} ${cx} ${cy})`} />;
      })}
      <g transform="translate(200 50)">
        <path d="M-40 0 Q-10 -10 10 4 Q28 -2 40 6 Q24 10 12 14 Q-10 24 -40 0Z" fill="#fff" stroke={p.ivory2} strokeWidth={1.5} />
        <path d="M-6 4 Q-20 -40 -44 -30 Q-24 -18 -12 8Z" fill="#fff" stroke={p.ivory2} strokeWidth={1.5} />
        <circle cx={30} cy={4} r={1.8} fill={p.text} />
        <path d="M40 6 l8 2 -8 2z" fill={p.gold} />
      </g>
    </>
  );
}

function RoseSprays({ p }: { p: RoyalPalette }) {
  const rose = (x: number, y: number, r: number) => (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={x} cy={y - r * 0.45} rx={r * 0.55} ry={r * 0.6} fill="#FBEDE8" stroke={p.goldLight} strokeWidth={0.8} transform={`rotate(${a} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y} r={r * 0.5} fill="#F6DCD3" stroke={p.goldLight} strokeWidth={0.8} />
      <path d={`M${x - r * 0.25} ${y} a${r * 0.25} ${r * 0.25} 0 1 1 ${r * 0.5} 0`} fill="none" stroke={p.goldDeep} strokeWidth={0.8} />
    </g>
  );
  return svg(
    "0 0 400 110",
    <>
      {[
        [30, 70],
        [370, 70],
      ].map(([x, y], i) => (
        <g key={x}>
          <path d={`M${x} ${y} q${i ? -60 : 60} 20 ${i ? -110 : 110} 10`} fill="none" stroke={p.leaf} strokeWidth={2} />
          {[0, 1, 2, 3].map((j) => (
            <ellipse key={j} cx={x + (i ? -1 : 1) * (26 + j * 22)} cy={y + 12 - j * 2} rx={9} ry={4} fill={p.leafLight} />
          ))}
          {rose(x, y, 16)}
          {rose(x + (i ? -1 : 1) * 26, y + 20, 11)}
        </g>
      ))}
    </>
  );
}

/* ---------- Editorial: masthead + foil rule ---------- */
function Masthead({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 40",
    <>
      <path d="M20 8 H380 M20 34 H380" stroke={p.text} strokeWidth={1} />
      <path d="M20 12 H380" stroke={p.gold} strokeWidth={0.8} />
    </>
  );
}

function FoilRule({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 30",
    <>
      <defs>
        <linearGradient id="foil-rule" x1="0" x2="1">
          <stop offset="0" stopColor={p.goldDeep} />
          <stop offset="0.5" stopColor={p.goldLight} />
          <stop offset="1" stopColor={p.goldDeep} />
        </linearGradient>
      </defs>
      <rect x={60} y={14} width={280} height={2} fill="url(#foil-rule)" />
      <rect x={196} y={9} width={8} height={8} transform="rotate(45 200 13)" fill={p.gold} />
    </>
  );
}

/* ---------- Watercolour: painted blooms + leaves ---------- */
function WatercolorBloom({ p }: { p: RoyalPalette }) {
  // Layered translucent shapes read as watercolour washes.
  const wash = (cx: number, cy: number, r: number, c: string, o: number) => (
    <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.82} fill={c} opacity={o} />
  );
  return svg(
    "0 0 400 150",
    <>
      {wash(60, 50, 60, p.flowers[0], 0.35)}
      {wash(90, 30, 40, p.flowers[1], 0.5)}
      {wash(340, 60, 56, p.flowers[2], 0.35)}
      {wash(310, 30, 36, p.flowers[0], 0.4)}
      {[
        [70, 44, 22],
        [330, 52, 20],
      ].map(([x, y, r]) => (
        <g key={x}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={x} cy={y - r * 0.6} rx={r * 0.45} ry={r * 0.7} fill={p.flowers[0]} opacity={0.55} transform={`rotate(${a} ${x} ${y})`} />
          ))}
          <circle cx={x} cy={y} r={r * 0.28} fill={p.goldLight} opacity={0.9} />
        </g>
      ))}
      <path d="M120 60 q40 -30 80 -20" fill="none" stroke={p.leaf} strokeWidth={1.2} opacity={0.6} />
    </>
  );
}

function WatercolorLeaves({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 90",
    <>
      <ellipse cx={200} cy={60} rx={150} ry={20} fill={p.flowers[2]} opacity={0.3} />
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse
          key={i}
          cx={80 + i * 22}
          cy={52 + (i % 2) * 10}
          rx={12}
          ry={5}
          fill={i % 3 ? p.leafLight : p.leaf}
          opacity={0.6}
          transform={`rotate(${(i % 2 ? 1 : -1) * 25} ${80 + i * 22} ${52 + (i % 2) * 10})`}
        />
      ))}
    </>
  );
}

/* ---------- Boho arch: rising sun + pampas ---------- */
function SunArch({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 150",
    <>
      <path d="M110 150 V80 A90 90 0 0 1 290 80 V150" fill={p.flowers[0]} opacity={0.35} />
      <path d="M140 150 V92 A60 60 0 0 1 260 92 V150" fill={p.gold} opacity={0.5} />
      <circle cx={200} cy={112} r={34} fill={p.goldDeep} opacity={0.75} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + (Math.PI / 8) * i;
        return (
          <path
            key={i}
            d={`M${r2(200 + 44 * Math.cos(a))} ${r2(112 + 44 * Math.sin(a))} L${r2(200 + 60 * Math.cos(a))} ${r2(112 + 60 * Math.sin(a))}`}
            stroke={p.goldDeep}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

function Pampas({ p }: { p: RoyalPalette }) {
  const stem = (x: number, lean: number, h: number) => (
    <g>
      <path d={`M${x} 110 Q${x + lean * 0.5} ${110 - h / 2} ${x + lean} ${110 - h}`} fill="none" stroke={p.goldDeep} strokeWidth={1.5} />
      {Array.from({ length: 10 }, (_, j) => {
        const t = 0.45 + j * 0.055;
        const cx = x + lean * t;
        const cy = 110 - h * t;
        return <ellipse key={j} cx={cx} cy={cy} rx={9} ry={3.2} fill={p.goldLight} opacity={0.9} transform={`rotate(${-60 + lean} ${cx} ${cy})`} />;
      })}
    </g>
  );
  return svg(
    "0 0 400 120",
    <>
      {stem(40, 20, 100)}
      {stem(62, -6, 84)}
      {stem(80, 30, 70)}
      {stem(360, -20, 100)}
      {stem(338, 6, 84)}
      {stem(320, -30, 70)}
    </>
  );
}

/* ---------- Velvet: gold filigree + candles ---------- */
function Filigree({ p }: { p: RoyalPalette }) {
  const scroll = (flip: number) => (
    <g transform={`translate(200 60) scale(${flip} 1)`}>
      <path d="M6 0 C40 -30 90 -30 120 -4 C140 14 120 36 100 24 C84 14 96 -2 108 6" fill="none" stroke={p.gold} strokeWidth={2.5} />
      <path d="M30 6 C60 30 110 34 150 16" fill="none" stroke={p.goldLight} strokeWidth={1.5} />
      <circle cx={150} cy={16} r={3} fill={p.goldLight} />
    </g>
  );
  return svg(
    "0 0 400 110",
    <>
      {scroll(1)}
      {scroll(-1)}
      <path d="M200 30 l12 30 -12 30 -12 -30z" fill={p.gold} />
      <circle cx={200} cy={60} r={5} fill={p.deep} />
    </>
  );
}

function Candles({ p }: { p: RoyalPalette }) {
  const candle = (x: number, h: number) => (
    <g>
      <ellipse cx={x} cy={112 - h - 12} rx={10} ry={16} fill="#FFD66B" opacity={0.25} />
      <path d={`M${x} ${112 - h - 2} q-5 -10 0 -18 q5 8 0 18z`} fill="#FFB020" />
      <rect x={x - 7} y={112 - h} width={14} height={h} rx={2} fill={p.ivory} />
      <rect x={x - 12} y={110} width={24} height={4} rx={2} fill={p.gold} />
    </g>
  );
  return svg("0 0 400 120", <>{candle(60, 50)}{candle(84, 34)}{candle(316, 34)}{candle(340, 50)}</>);
}


/* ================= Looks for the other occasions ================= */

function sparkles(p: RoyalPalette, pts: [number, number, number][]) {
  return pts.map(([x, y, r]) => (
    <path key={`${x}-${y}`} d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`} fill={p.goldLight} />
  ));
}

/* ---------- Sparkle: diamond ring + champagne ---------- */
function DiamondRing({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 170",
    <>
      <circle cx="200" cy="118" r="42" fill="none" stroke={p.gold} strokeWidth="9" />
      <circle cx="200" cy="118" r="42" fill="none" stroke={p.goldLight} strokeWidth="2" />
      <path d="M200 30 L226 50 L214 74 H186 L174 50 Z" fill="#EAF6FF" stroke={p.gold} strokeWidth="2" />
      <path d="M174 50 H226 M200 30 L193 50 L200 74 L207 50 Z" fill="none" stroke="#9FC4DA" strokeWidth="1.2" />
      {sparkles(p, [[140, 40, 10], [262, 36, 12], [110, 96, 7], [292, 104, 8], [240, 18, 6]])}
    </>
  );
}

function Champagne({ p }: { p: RoyalPalette }) {
  const flute = (x: number, tilt: number) => (
    <g transform={`rotate(${tilt} ${x} 110)`}>
      <path d={`M${x - 14} 20 Q${x - 14} 70 ${x} 76 Q${x + 14} 70 ${x + 14} 20 Z`} fill={p.goldLight} opacity="0.85" stroke={p.gold} strokeWidth="1.5" />
      <path d={`M${x} 76 V104 M${x - 12} 108 H${x + 12}`} stroke={p.gold} strokeWidth="2.5" />
      {[34, 48, 60].map((y) => (
        <circle key={y} cx={x - 3 + (y % 7)} cy={y} r="1.6" fill="#fff" />
      ))}
    </g>
  );
  return svg("0 0 400 120", <>{flute(186, -12)}{flute(214, 12)}{sparkles(p, [[200, 14, 9], [150, 30, 5], [252, 34, 6]])}</>);
}

/* ---------- Thamboolam: banana leaves + brass plate ---------- */
function BananaThoranam({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 160",
    <>
      {[-1, 1].map((d) => (
        <g key={d} transform={d < 0 ? undefined : "translate(400 0) scale(-1 1)"}>
          <path d="M8 160 Q20 60 70 10 Q60 80 30 160Z" fill={p.leaf} />
          <path d="M18 160 Q34 80 66 16" stroke={p.leafLight} strokeWidth="2" fill="none" />
        </g>
      ))}
      <path d="M40 18 Q200 34 360 18" stroke="#8a5a1a" strokeWidth="3" fill="none" />
      {Array.from({ length: 13 }, (_, i) => {
        const x = 60 + i * 23.3;
        return (
          <g key={i}>
            <path d={`M${x} 22 C${x - 8} 36 ${x - 7} 52 ${x} 62 C${x + 7} 52 ${x + 8} 36 ${x} 22Z`} fill={i % 2 ? p.leafLight : p.leaf} />
            {i % 3 === 1 && <circle cx={x} cy="70" r="5" fill={p.flowers[0]} />}
          </g>
        );
      })}
    </>
  );
}

function ThamboolamPlate({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 120",
    <>
      <ellipse cx="200" cy="96" rx="120" ry="20" fill={p.goldDeep} />
      <ellipse cx="200" cy="90" rx="112" ry="16" fill={p.gold} />
      {[-60, -30, 0, 30, 60].map((dx, i) => (
        <path key={dx} d={`M${200 + dx} 88 q-18 -22 0 -40 q18 18 0 40z`} fill={i % 2 ? p.leafLight : p.leaf} transform={`rotate(${dx / 3} ${200 + dx} 88)`} />
      ))}
      <circle cx="200" cy="62" r="18" fill="#8B5A2B" />
      <path d="M190 48 q10 -12 20 0" stroke={p.leaf} strokeWidth="4" fill="none" />
      {[
        [130, 80, "#F2C94C"],
        [270, 80, "#F2C94C"],
        [150, 84, "#C8102E"],
        [250, 84, "#FFB020"],
      ].map(([x, y, c]) => (
        <circle key={`${x}`} cx={x as number} cy={y as number} r="8" fill={c as string} />
      ))}
    </>
  );
}

/* ---------- Vintage: film strip + polaroids ---------- */
function FilmStrip({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 90",
    <>
      <rect x="0" y="20" width="400" height="54" fill={p.deep} />
      {Array.from({ length: 20 }, (_, i) => (
        <g key={i}>
          <rect x={6 + i * 20} y="24" width="10" height="7" rx="1.5" fill={p.ivory} />
          <rect x={6 + i * 20} y="63" width="10" height="7" rx="1.5" fill={p.ivory} />
        </g>
      ))}
      {[20, 120, 220, 320].map((x) => (
        <rect key={x} x={x} y="34" width="72" height="26" rx="2" fill={p.goldLight} opacity="0.55" />
      ))}
    </>
  );
}

function Polaroids({ p }: { p: RoyalPalette }) {
  const pic = (x: number, r: number) => (
    <g transform={`rotate(${r} ${x} 60)`}>
      <rect x={x - 36} y="14" width="72" height="84" fill="#fff" stroke={p.ivory2} />
      <rect x={x - 30} y="20" width="60" height="56" fill={p.flowers[0]} opacity="0.55" />
      <rect x={x - 12} y="8" width="24" height="10" fill={p.goldLight} opacity="0.7" />
    </g>
  );
  return svg("0 0 400 110", <>{pic(120, -8)}{pic(280, 7)}</>);
}

/* ---------- Roses: rose garland + wine glasses ---------- */
function roseAt(p: RoyalPalette, x: number, y: number, r: number, c: string) {
  return (
    <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r={r} fill={c} />
      <path d={`M${x - r * 0.55} ${y} a${r * 0.55} ${r * 0.55} 0 1 1 ${r * 1.1} 0 a${r * 0.35} ${r * 0.35} 0 1 1 ${-r * 0.7} 0 a${r * 0.18} ${r * 0.18} 0 1 1 ${r * 0.36} 0`} fill="none" stroke={p.deep} strokeWidth="1.3" opacity="0.5" />
    </g>
  );
}

function RoseGarland({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 110",
    <>
      <path d="M0 30 Q200 100 400 30" fill="none" stroke={p.leaf} strokeWidth="3" />
      {Array.from({ length: 11 }, (_, i) => {
        const t = i / 10;
        const x = t * 400;
        const y = r2(30 + Math.sin(t * Math.PI) * 38);
        return (
          <g key={i}>
            <ellipse cx={x - 12} cy={y + 8} rx="10" ry="4.5" fill={p.leafLight} transform={`rotate(-30 ${x - 12} ${y + 8})`} />
            {roseAt(p, x, y, i % 2 ? 13 : 16, i % 3 ? p.flowers[0] : p.flowers[1])}
          </g>
        );
      })}
    </>
  );
}

function WineGlasses({ p }: { p: RoyalPalette }) {
  const glass = (x: number, tilt: number) => (
    <g transform={`rotate(${tilt} ${x} 100)`}>
      <path d={`M${x - 20} 20 Q${x - 22} 60 ${x} 64 Q${x + 22} 60 ${x + 20} 20 Z`} fill="none" stroke={p.goldLight} strokeWidth="2" />
      <path d={`M${x - 19} 40 Q${x - 18} 60 ${x} 62 Q${x + 18} 60 ${x + 19} 40 Z`} fill={p.flowers[0]} />
      <path d={`M${x} 64 V100 M${x - 14} 104 H${x + 14}`} stroke={p.goldLight} strokeWidth="2.5" />
    </g>
  );
  return svg("0 0 400 115", <>{glass(176, -10)}{glass(224, 10)}{roseAt(p, 200, 96, 10, p.flowers[1])}</>);
}

/* ---------- Letter: envelope flap + quill ---------- */
function EnvelopeFlap({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 150",
    <>
      <path d="M30 10 H370 L200 120 Z" fill={p.ivory2} stroke={p.gold} strokeWidth="2" />
      <circle cx="200" cy="112" r="26" fill={p.flowers[0]} />
      <circle cx="200" cy="112" r="20" fill="none" stroke={p.deep} strokeWidth="1.5" opacity="0.4" />
      <path d="M200 124 C184 112 186 98 196 100 Q200 102 200 106 Q200 102 204 100 C214 98 216 112 200 124Z" fill={p.deep} opacity="0.55" />
    </>
  );
}

function Quill({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 90",
    <>
      <path d="M60 70 Q200 50 330 66" fill="none" stroke={p.gold} strokeWidth="1.5" strokeDasharray="4 5" />
      <path d="M300 70 L352 12 Q360 34 322 64 Z" fill={p.ivory} stroke={p.gold} strokeWidth="1.5" />
      <path d="M300 70 L346 20" stroke={p.goldDeep} strokeWidth="1.2" />
      {[90, 130, 170].map((x, i) => (
        <path key={x} d={`M${x} ${48 - i * 4} c-6 -6 -12 0 0 10 c12 -10 6 -16 0 -10z`} fill={p.flowers[0]} />
      ))}
    </>
  );
}

/* ---------- Neon: glowing heart + squiggle ---------- */
function NeonHeart({ p }: { p: RoyalPalette }) {
  const heart = "M200 150 C120 100 110 40 160 30 C182 26 196 40 200 52 C204 40 218 26 240 30 C290 40 280 100 200 150Z";
  return svg(
    "0 0 400 170",
    <>
      <path d={heart} fill="none" stroke={p.flowers[0]} strokeWidth="14" opacity="0.18" />
      <path d={heart} fill="none" stroke={p.flowers[0]} strokeWidth="7" opacity="0.35" />
      <path d={heart} fill="none" stroke="#fff" strokeWidth="2.5" />
      {sparkles(p, [[90, 50, 8], [320, 40, 10], [60, 120, 5], [340, 130, 6]])}
    </>
  );
}

function NeonSquiggle({ p }: { p: RoyalPalette }) {
  const d = "M20 60 Q60 20 100 60 T180 60 T260 60 T340 60 T380 50";
  return svg(
    "0 0 400 90",
    <>
      <path d={d} fill="none" stroke={p.flowers[2]} strokeWidth="10" opacity="0.2" />
      <path d={d} fill="none" stroke="#fff" strokeWidth="2.5" />
    </>
  );
}

/* ---------- Clouds: pastel sky + cloud bank ---------- */
function cloud(x: number, y: number, s: number, fill: string) {
  return (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-40 10 a20 20 0 0 1 12 -30 a26 26 0 0 1 48 -4 a18 18 0 0 1 20 34 Z" fill={fill} />
    </g>
  );
}

function PastelSky({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 150",
    <>
      <circle cx="320" cy="42" r="22" fill={p.goldLight} />
      <circle cx="330" cy="36" r="20" fill={p.ivory} />
      {cloud(90, 70, 1.1, "#fff")}
      {cloud(220, 44, 0.8, "#fff")}
      {cloud(300, 100, 0.9, "#fff")}
      {[
        [160, 100],
        [60, 30],
        [250, 120],
      ].map(([x, y]) => (
        <path key={x} d={`M${x} ${y} c-7 -7 -14 0 0 12 c14 -12 7 -19 0 -12z`} fill={p.flowers[0]} />
      ))}
    </>
  );
}

function CloudBank({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 90",
    <>
      {cloud(60, 70, 1.3, p.ivory2)}
      {cloud(170, 78, 1.5, "#fff")}
      {cloud(290, 72, 1.3, p.ivory2)}
      {cloud(380, 80, 1.1, "#fff")}
      {sparkles(p, [[120, 20, 6], [250, 26, 7]])}
    </>
  );
}

/* ---------- Balloons: bunch + gift boxes ---------- */
function balloon(x: number, y: number, r: number, c: string, sx: number) {
  return (
    <g key={`${x}-${y}`}>
      <path d={`M${x} ${y + r * 1.2} Q${x + (sx - x) * 0.4} ${y + r * 2} ${sx} 168`} fill="none" stroke="#9a8" strokeWidth="1" />
      <ellipse cx={x} cy={y} rx={r} ry={r * 1.2} fill={c} />
      <ellipse cx={x - r * 0.35} cy={y - r * 0.45} rx={r * 0.22} ry={r * 0.35} fill="#fff" opacity="0.45" />
      <path d={`M${x - 4} ${y + r * 1.2 + 5} L${x} ${y + r * 1.2} L${x + 4} ${y + r * 1.2 + 5}Z`} fill={c} />
    </g>
  );
}

function BalloonBunch({ p }: { p: RoyalPalette }) {
  const c = [p.flowers[0], p.flowers[1], p.flowers[2], p.gold];
  return svg(
    "0 0 400 170",
    <>
      {balloon(150, 50, 26, c[0], 200)}
      {balloon(200, 36, 30, c[1], 200)}
      {balloon(250, 52, 26, c[2], 200)}
      {balloon(115, 86, 20, c[3], 200)}
      {balloon(285, 88, 20, c[0], 200)}
      {balloon(60, 60, 18, c[1], 90)}
      {balloon(340, 58, 18, c[2], 310)}
    </>
  );
}

function GiftBoxes({ p }: { p: RoyalPalette }) {
  const box = (x: number, w: number, h: number, c: string, ribbon: string) => (
    <g key={x}>
      <rect x={x} y={110 - h} width={w} height={h} rx="3" fill={c} />
      <rect x={x + w / 2 - 4} y={110 - h} width="8" height={h} fill={ribbon} />
      <path d={`M${x + w / 2} ${110 - h} q-14 -14 -4 -18 q6 2 4 18 q2 -16 8 -18 q10 4 -8 18z`} fill={ribbon} />
    </g>
  );
  return svg("0 0 400 120", <>{box(120, 60, 48, p.flowers[0], p.goldLight)}{box(186, 44, 64, p.flowers[2], p.gold)}{box(236, 52, 40, p.flowers[1], p.deep)}</>);
}

/* ---------- Kids: bunting + crayon shapes ---------- */
function Bunting({ p }: { p: RoyalPalette }) {
  const c = [p.flowers[0], p.flowers[1], p.flowers[2], p.gold];
  return svg(
    "0 0 400 110",
    <>
      <path d="M0 16 Q200 60 400 16" fill="none" stroke={p.deep} strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 18 + i * 33;
        const t = x / 400;
        const y = r2(16 + Math.sin(t * Math.PI) * 22);
        return <path key={i} d={`M${x - 14} ${y} L${x + 14} ${y} L${x} ${y + 30}Z`} fill={c[i % 4]} />;
      })}
      {sparkles(p, [[70, 86, 7], [330, 90, 8]])}
    </>
  );
}

function CrayonShapes({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 100",
    <>
      <circle cx="70" cy="60" r="18" fill={p.flowers[0]} />
      <rect x="128" y="44" width="34" height="34" rx="4" fill={p.flowers[1]} transform="rotate(12 145 61)" />
      <path d="M210 80 L232 40 L254 80Z" fill={p.flowers[2]} />
      <path d="M288 64 q12 -24 24 0 t24 0 t24 0" fill="none" stroke={p.gold} strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

/* ---------- Cake: birthday cake + party hats ---------- */
function BirthdayCake({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 170",
    <>
      <ellipse cx="200" cy="162" rx="110" ry="8" fill={p.goldDeep} opacity="0.4" />
      <rect x="110" y="110" width="180" height="50" rx="8" fill={p.flowers[0]} />
      <rect x="130" y="72" width="140" height="42" rx="8" fill={p.flowers[1]} />
      <path d="M110 118 q15 12 30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke="#fff" strokeWidth="5" />
      <path d="M130 80 q14 10 28 0 t28 0 t28 0 t28 0 t28 0" fill="none" stroke="#fff" strokeWidth="4" />
      {[160, 186, 214, 240].map((x) => (
        <g key={x}>
          <rect x={x - 3} y="46" width="6" height="26" rx="2" fill={p.ivory} stroke={p.gold} strokeWidth="1" />
          <path d={`M${x} 44 q-6 -10 0 -18 q6 8 0 18z`} fill="#FFB020" />
        </g>
      ))}
    </>
  );
}

function PartyHats({ p }: { p: RoyalPalette }) {
  const hat = (x: number, r: number, c: string) => (
    <g key={x} transform={`rotate(${r} ${x} 90)`}>
      <path d={`M${x - 20} 96 L${x} 30 L${x + 20} 96Z`} fill={c} />
      <path d={`M${x - 14} 76 H${x + 14} M${x - 8} 56 H${x + 8}`} stroke="#fff" strokeWidth="3" />
      <circle cx={x} cy="28" r="6" fill={p.goldLight} />
    </g>
  );
  return svg(
    "0 0 400 110",
    <>
      {hat(80, -14, p.flowers[2])}
      {hat(320, 14, p.flowers[0])}
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={130 + ((i * 37) % 150)} y={30 + ((i * 23) % 60)} width="6" height="10" rx="1.5" fill={[p.flowers[0], p.flowers[1], p.flowers[2], p.gold][i % 4]} transform={`rotate(${(i * 47) % 360} ${133 + ((i * 37) % 150)} ${35 + ((i * 23) % 60)})`} />
      ))}
    </>
  );
}

/* ---------- Keys: house line art + plants ---------- */
function HouseKey({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 170",
    <>
      <path d="M110 90 L200 22 L290 90 V166 H110 Z" fill="none" stroke={p.text} strokeWidth="3" strokeLinejoin="round" />
      <rect x="182" y="112" width="36" height="54" rx="2" fill="none" stroke={p.text} strokeWidth="3" />
      <circle cx="210" cy="140" r="2.5" fill={p.text} />
      <rect x="130" y="102" width="32" height="28" fill={p.goldLight} opacity="0.6" stroke={p.text} strokeWidth="2" />
      <rect x="238" y="102" width="32" height="28" fill={p.goldLight} opacity="0.6" stroke={p.text} strokeWidth="2" />
      <g transform="rotate(-30 310 50)">
        <circle cx="310" cy="50" r="14" fill="none" stroke={p.gold} strokeWidth="5" />
        <path d="M324 50 H364 M352 50 v10 M362 50 v8" stroke={p.gold} strokeWidth="5" strokeLinecap="round" />
      </g>
    </>
  );
}

function PlantsAndKeys({ p }: { p: RoyalPalette }) {
  const plant = (x: number) => (
    <g key={x}>
      <path d={`M${x - 16} 80 H${x + 16} L${x + 12} 110 H${x - 12} Z`} fill={p.flowers[0]} />
      {[-30, -10, 10, 30].map((a) => (
        <path key={a} d={`M${x} 80 q${a / 2} -30 ${a} -40`} fill="none" stroke={p.leaf} strokeWidth="3" />
      ))}
      {[-30, -10, 10, 30].map((a) => (
        <ellipse key={a} cx={x + a} cy="40" rx="6" ry="10" fill={p.leafLight} transform={`rotate(${a} ${x + a} 40)`} />
      ))}
    </g>
  );
  return svg("0 0 400 115", <>{plant(70)}{plant(330)}</>);
}

/* ---------- Door: festive front door + rangoli & diyas ---------- */
function FestiveDoor({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 190",
    <>
      <path d="M130 190 V70 Q200 10 270 70 V190" fill={p.mid} stroke={p.gold} strokeWidth="5" />
      <path d="M200 190 V58" stroke={p.gold} strokeWidth="3" />
      {[150, 172, 228, 250].map((x) =>
        [96, 136, 172].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={p.goldLight} />)
      )}
      <path d="M110 64 Q200 88 290 64" fill="none" stroke="#8a5a1a" strokeWidth="2.5" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 120 + i * 20;
        return <path key={i} d={`M${x} 70 C${x - 6} 82 ${x - 5} 94 ${x} 102 C${x + 5} 94 ${x + 6} 82 ${x} 70Z`} fill={i % 2 ? p.leafLight : p.leaf} />;
      })}
    </>
  );
}

function RangoliDiyas({ p }: { p: RoyalPalette }) {
  const diya = (x: number) => (
    <g key={x}>
      <path d={`M${x - 18} 92 Q${x} 110 ${x + 18} 92 Z`} fill={p.flowers[0]} />
      <path d={`M${x} 90 q-5 -10 0 -18 q5 8 0 18z`} fill="#FFB020" />
    </g>
  );
  return svg(
    "0 0 400 115",
    <>
      <g transform="translate(200 70)">
        {[0, 45, 90, 135].map((a) => (
          <ellipse key={a} rx="46" ry="14" fill="none" stroke={p.flowers[a % 90 ? 1 : 2]} strokeWidth="5" transform={`rotate(${a})`} />
        ))}
        <circle r="10" fill={p.gold} />
      </g>
      {diya(60)}
      {diya(340)}
    </>
  );
}

/* ---------- Bangles: arch + stacks (valaikaappu) ---------- */
function BangleArch({ p }: { p: RoyalPalette }) {
  const colors = [p.flowers[0], p.gold, p.flowers[1], p.leaf, p.flowers[2], p.goldLight];
  return svg(
    "0 0 400 150",
    <>
      {Array.from({ length: 13 }, (_, i) => {
        const a = Math.PI - (i / 12) * Math.PI;
        const x = r2(200 + Math.cos(a) * 150);
        const y = r2(140 - Math.sin(a) * 110);
        return <ellipse key={i} cx={x} cy={y} rx="16" ry="16" fill="none" stroke={colors[i % colors.length]} strokeWidth="5" />;
      })}
    </>
  );
}

function BangleStacks({ p }: { p: RoyalPalette }) {
  const stack = (x: number) => (
    <g key={x}>
      {[0, 1, 2, 3, 4].map((j) => (
        <ellipse key={j} cx={x} cy={96 - j * 9} rx="30" ry="8" fill="none" stroke={[p.flowers[0], p.gold, p.flowers[1], p.leaf, p.flowers[2]][j]} strokeWidth="5" />
      ))}
    </g>
  );
  return svg(
    "0 0 400 115",
    <>
      {stack(80)}
      {stack(320)}
      {[170, 200, 230].map((x) => (
        <circle key={x} cx={x} cy="90" r="9" fill={x === 200 ? p.flowers[0] : p.flowers[1]} />
      ))}
    </>
  );
}

/* ---------- Teddy: bear + ABC blocks ---------- */
function Teddy({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 170",
    <>
      <path d="M270 40 Q300 90 250 120" fill="none" stroke="#9a8" strokeWidth="1.2" />
      <ellipse cx="270" cy="30" rx="18" ry="22" fill={p.flowers[0]} />
      <circle cx="170" cy="60" r="16" fill="#C68B59" />
      <circle cx="230" cy="60" r="16" fill="#C68B59" />
      <circle cx="170" cy="60" r="8" fill="#E8C4A0" />
      <circle cx="230" cy="60" r="8" fill="#E8C4A0" />
      <circle cx="200" cy="100" r="48" fill="#C68B59" />
      <ellipse cx="200" cy="116" rx="22" ry="17" fill="#E8C4A0" />
      <circle cx="184" cy="92" r="5" fill={p.text} />
      <circle cx="216" cy="92" r="5" fill={p.text} />
      <ellipse cx="200" cy="110" rx="7" ry="5" fill={p.text} />
      <path d="M192 122 q8 8 16 0" fill="none" stroke={p.text} strokeWidth="2" />
      <path d="M176 146 l24 -8 l24 8 l-24 8z" fill={p.flowers[1]} />
    </>
  );
}

function AbcBlocks({ p }: { p: RoyalPalette }) {
  const block = (x: number, letter: string, c: string, r: number) => (
    <g key={letter} transform={`rotate(${r} ${x + 20} 90)`}>
      <rect x={x} y="68" width="40" height="40" rx="5" fill={c} />
      <text x={x + 20} y="97" textAnchor="middle" fontSize="24" fontWeight="700" fill="#fff" fontFamily="sans-serif">
        {letter}
      </text>
    </g>
  );
  return svg("0 0 400 115", <>{block(130, "A", p.flowers[0], -6)}{block(180, "B", p.flowers[2], 4)}{block(230, "C", p.gold, -3)}</>);
}

/* ---------- Tech: orb over a grid + circuit ---------- */
function TechOrb({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 170",
    <>
      <defs>
        <radialGradient id="tech-orb">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor={p.flowers[0]} />
          <stop offset="1" stopColor={p.flowers[2]} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M200 170 L${i * 50} 110`} stroke={p.flowers[2]} strokeWidth="1" opacity="0.5" />
      ))}
      {[118, 132, 150].map((y) => (
        <path key={y} d={`M0 ${y} H400`} stroke={p.flowers[2]} strokeWidth="1" opacity="0.4" />
      ))}
      <circle cx="200" cy="64" r="56" fill="url(#tech-orb)" />
      <circle cx="200" cy="64" r="30" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.7" />
    </>
  );
}

function Circuit({ p }: { p: RoyalPalette }) {
  return svg(
    "0 0 400 90",
    <>
      <path d="M0 60 H90 L110 40 H180 M220 40 H290 L310 60 H400 M140 40 V20 H170 M260 40 V70 H230" fill="none" stroke={p.flowers[0]} strokeWidth="2" />
      {[
        [90, 60],
        [180, 40],
        [220, 40],
        [310, 60],
        [170, 20],
        [230, 70],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={p.flowers[1]} />
      ))}
      <rect x="186" y="30" width="28" height="20" rx="3" fill="none" stroke={p.flowers[1]} strokeWidth="2" />
    </>
  );
}
