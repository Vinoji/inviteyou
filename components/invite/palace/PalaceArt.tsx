"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { WorldId } from "./shots";
import p from "./palace.module.css";

/**
 * Drawn pieces for Royal Palace 3D: the CSS/SVG palace that stands in for
 * the 3D scene (and sits under it while it loads), plus the small gold
 * ornaments used by the sections.
 */

/** The palace front in silhouette: arched gate, domes, lit jharokhas. */
function PalaceFront({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 260" className={className} preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="pal-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B2552" />
          <stop offset="1" stopColor="#0A1029" />
        </linearGradient>
        <radialGradient id="pal-door" cx="0.5" cy="0.7" r="0.7">
          <stop offset="0" stopColor="#FFE3A3" />
          <stop offset="0.5" stopColor="#F2B65A" />
          <stop offset="1" stopColor="#7A3E12" />
        </radialGradient>
      </defs>
      {/* Side chhatris */}
      {[40, 360].map((x) => (
        <g key={x} fill="url(#pal-stone)">
          <rect x={x - 18} y="96" width="36" height="22" />
          <path d={`M${x - 20} 98 Q${x} 64 ${x + 20} 98 Z`} />
          <path d={`M${x} 60 v-12`} stroke="#C9A24A" strokeWidth="2" />
        </g>
      ))}
      {/* Central dome */}
      <path d="M140 96 Q200 18 260 96 Z" fill="url(#pal-stone)" />
      <path d="M200 30 v-20" stroke="#C9A24A" strokeWidth="2.5" />
      <circle cx="200" cy="10" r="3" fill="#C9A24A" />
      {/* Wall */}
      <rect x="10" y="96" width="380" height="164" fill="url(#pal-stone)" />
      <rect x="10" y="94" width="380" height="4" fill="#C9A24A" />
      {/* The open gate, glowing */}
      <path d="M170 260 V170 A30 30 0 0 1 230 170 V260 Z" fill="url(#pal-door)" />
      <path d="M166 260 V170 A34 34 0 0 1 234 170 V260" fill="none" stroke="#C9A24A" strokeWidth="2.5" />
      {/* Jharokhas */}
      {[70, 110, 290, 330].map((x) =>
        [138, 200].map((y) => (
          <g key={`${x}-${y}`}>
            <path d={`M${x - 9} ${y + 20} V${y + 6} A9 9 0 0 1 ${x + 9} ${y + 6} V${y + 20} Z`} fill="#F7C873" opacity="0.85" />
            <rect x={x - 12} y={y + 20} width="24" height="3" fill="#C9A24A" />
          </g>
        ))
      )}
    </svg>
  );
}

/** A gopuram over a granite gateway, painted tiers and gold kalasams. */
function TempleFront({ className }: { className?: string }) {
  const tiers = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 400 300" className={className} preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="tpl-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A4038" />
          <stop offset="1" stopColor="#1E1814" />
        </linearGradient>
        <radialGradient id="tpl-door" cx="0.5" cy="0.7" r="0.7">
          <stop offset="0" stopColor="#FFE3A3" />
          <stop offset="0.5" stopColor="#F2A65A" />
          <stop offset="1" stopColor="#7A3012" />
        </radialGradient>
      </defs>
      {tiers.map((i) => {
        const w = 200 - i * 26;
        const y = 150 - i * 20;
        return (
          <g key={i}>
            <rect x={200 - w / 2} y={y - 18} width={w} height={18} fill={i % 2 ? "#B5562B" : "#C98A2E"} />
            {Array.from({ length: Math.max(2, 7 - i) }, (_, k) => (
              <rect key={k} x={200 - w / 2 + 8 + k * ((w - 16) / Math.max(2, 7 - i))} y={y - 15} width={8} height={12} rx={4} fill={["#1F7A8C", "#B03A2E", "#2E8B57"][k % 3]} />
            ))}
            <rect x={200 - w / 2 - 4} y={y - 2} width={w + 8} height={3} fill="#7A1F1A" />
          </g>
        );
      })}
      <path d="M150 30 Q200 8 250 30 Z" fill="#B03A2E" />
      {[160, 180, 200, 220, 240].map((x) => (
        <circle key={x} cx={x} cy={16} r={3} fill="#E3B341" />
      ))}
      <rect x="40" y="150" width="320" height="150" fill="url(#tpl-stone)" />
      <rect x="40" y="148" width="320" height="4" fill="#C9A24A" />
      <rect x="176" y="190" width="48" height="110" fill="url(#tpl-door)" />
      <rect x="172" y="186" width="56" height="114" fill="none" stroke="#C9A24A" strokeWidth="3" />
    </svg>
  );
}

/** A Gothic west front: twin spires, rose window, pointed portal. */
function CathedralFront({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="cth-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A4060" />
          <stop offset="1" stopColor="#141830" />
        </linearGradient>
        <radialGradient id="cth-rose" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F2C14E" />
          <stop offset="0.35" stopColor="#B0202E" />
          <stop offset="0.7" stopColor="#1B3F8B" />
          <stop offset="1" stopColor="#5B2C83" />
        </radialGradient>
        <radialGradient id="cth-door" cx="0.5" cy="0.7" r="0.7">
          <stop offset="0" stopColor="#FFF0C8" />
          <stop offset="1" stopColor="#C98A3A" />
        </radialGradient>
      </defs>
      {[70, 330].map((x) => (
        <g key={x} fill="url(#cth-stone)">
          <rect x={x - 30} y="90" width="60" height="210" />
          <path d={`M${x - 32} 92 L${x} 10 L${x + 32} 92 Z`} />
          <rect x={x - 8} y="140" width="16" height="40" rx="8" fill="#F2C14E" opacity="0.8" />
        </g>
      ))}
      <path d="M100 300 V110 L200 50 L300 110 V300 Z" fill="url(#cth-stone)" />
      <circle cx="200" cy="140" r="34" fill="url(#cth-rose)" />
      <circle cx="200" cy="140" r="34" fill="none" stroke="#D8CFBE" strokeWidth="3" />
      <path d="M170 300 V240 Q170 205 200 190 Q230 205 230 240 V300 Z" fill="url(#cth-door)" />
    </svg>
  );
}

/** Stand-in for the 3D scene: night sky, palace, gate light and gold dust,
 * drifting a little with the scroll. */
export function PalaceBackdrop({ world, progress, still }: { world: WorldId; progress: MotionValue<number>; still: boolean }) {
  const Front = world === "temple" ? TempleFront : world === "cathedral" ? CathedralFront : PalaceFront;
  const palaceY = useTransform(progress, [0, 1], still ? ["0%", "0%"] : ["0%", "18%"]);
  const palaceScale = useTransform(progress, [0, 0.1, 0.9, 1], still ? [1, 1, 1, 1] : [1, 1.35, 1.35, 1]);
  return (
    <div className={p.backdrop}>
      <div className={p.sky} />
      <div className={p.stars} />
      <motion.div className={p.palaceWrap} style={{ y: palaceY, scale: palaceScale }}>
        <div className={p.gateGlow} />
        <Front className={p.palaceSvg} />
      </motion.div>
      <div className={p.floorGlow} />
      {!still && (
        <div className={p.dust}>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.7) % 6}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

/** A gold rule with a lotus bud at its centre, drawn in when it scrolls into view. */
export function GoldRule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 20" className={`${p.rule} ${className ?? ""}`} aria-hidden>
      <motion.path
        d="M2 10 H92 M128 10 H218"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <path d="M110 2 C116 8 116 12 110 18 C104 12 104 8 110 2 Z" fill="currentColor" />
      <circle cx="98" cy="10" r="1.6" fill="currentColor" />
      <circle cx="122" cy="10" r="1.6" fill="currentColor" />
    </svg>
  );
}

/** Small line icons for the story milestones. */
export function MilestoneIcon({ index }: { index: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const };
  switch (index % 4) {
    case 0: // a diya
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M4 14 Q12 22 20 14 Z" {...common} />
          <path d="M12 12 C14 9 13 6 12 4 C11 6 10 9 12 12 Z" {...common} />
        </svg>
      );
    case 1: // two rings
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="9" cy="13" r="5" {...common} />
          <circle cx="15" cy="13" r="5" {...common} />
        </svg>
      );
    case 2: // a path through arches
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M4 20 V11 A4 4 0 0 1 12 11 V20 M12 20 V11 A4 4 0 0 1 20 11 V20" {...common} />
        </svg>
      );
    default: // a lotus
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 19 C8 15 8 10 12 5 C16 10 16 15 12 19 Z" {...common} />
          <path d="M12 19 C7 18 4 15 3 11 C7 11 10 14 12 19 Z M12 19 C17 18 20 15 21 11 C17 11 14 14 12 19 Z" {...common} />
        </svg>
      );
  }
}
