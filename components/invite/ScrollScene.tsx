"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart } from "lucide-react";
import useSafeReducedMotion from "./useSafeReducedMotion";
import BalloonMotif from "./decor/BalloonMotif";
import FloralSprig from "./decor/FloralSprig";
import HairlineDiamond from "./decor/HairlineDiamond";
import HouseMotif from "./decor/HouseMotif";
import MandalaMotif from "./decor/MandalaMotif";
import PaisleyCorner from "./decor/PaisleyCorner";
import PalmFrond from "./decor/PalmFrond";
import RingMotif from "./decor/RingMotif";

type SceneKind =
  | "story"
  | "family"
  | "schedule"
  | "gallery"
  | "guestPhotos"
  | "faq"
  | "rsvp"
  | "blessings"
  | "share";

const sceneOffsets: Record<SceneKind, number> = {
  story: 0,
  family: 1,
  schedule: 2,
  gallery: 3,
  guestPhotos: 4,
  faq: 5,
  rsvp: 6,
  blessings: 7,
  share: 8,
};

const DOTS = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  left: (index * 23 + 11) % 100,
  delay: (index % 7) * 0.7,
  size: 4 + (index % 4),
  drift: ((index % 5) - 2) * 14,
}));

const CONFETTI = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

export default function ScrollScene({
  children,
  templateId,
  accentColor,
  kind,
}: {
  children: ReactNode;
  templateId: string;
  accentColor: string;
  kind: SceneKind;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const farY = useTransform(scrollYProgress, [0, 1], ["-110px", "110px"]);
  const farX = useTransform(scrollYProgress, [0, 1], ["-22px", "22px"]);
  const midY = useTransform(scrollYProgress, [0, 1], ["96px", "-96px"]);
  const midX = useTransform(scrollYProgress, [0, 1], ["26px", "-26px"]);
  const fastY = useTransform(scrollYProgress, [0, 1], ["118px", "-118px"]);
  const riseY = useTransform(scrollYProgress, [0, 1], ["130px", "-90px"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-16, 16]);
  const progressOpacity = useTransform(scrollYProgress, [0, 0.18, 0.8, 1], [0, 1, 1, 0.25]);
  const phase = useMemo(() => sceneOffsets[kind] % 3, [kind]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden"
      style={{ ["--scene-accent" as string]: accentColor }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={sceneBackground(templateId, accentColor, phase)}
      />
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 -inset-y-28 -z-10"
          style={{ x: farX, y: farY, opacity: progressOpacity }}
        >
          <DepthLandscape templateId={templateId} accentColor={accentColor} phase={phase} />
        </motion.div>
      )}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-x-8 -inset-y-20 -z-10"
          style={{ x: midX, y: midY, opacity: progressOpacity }}
        >
          <SceneBackLayer templateId={templateId} accentColor={accentColor} phase={phase} />
        </motion.div>
      )}
      <div className="relative z-10">{children}</div>
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-x-8 -inset-y-24 z-20"
          style={{ y: fastY, rotate }}
        >
          <SceneFrontLayer templateId={templateId} accentColor={accentColor} kind={kind} phase={phase} />
        </motion.div>
      )}
      {!reduceMotion && templateId === "proposal-starlit" && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute right-[12%] top-16 -z-10 h-16 w-16 rounded-full bg-amber-100 shadow-[0_0_42px_rgba(252,211,77,0.55)] sm:h-24 sm:w-24"
          style={{ y: riseY, opacity: progressOpacity }}
        />
      )}
    </section>
  );
}

function DepthLandscape({
  templateId,
  accentColor,
  phase,
}: {
  templateId: string;
  accentColor: string;
  phase: number;
}) {
  if (templateId === "proposal-starlit") {
    return (
      <>
        <div className="absolute inset-x-0 bottom-0 h-64 opacity-[0.45] sm:h-80">
          <svg viewBox="0 0 900 260" className="h-full w-full" preserveAspectRatio="none">
            <path d="M0 178 C120 80 220 150 340 106 C470 58 570 160 700 96 C780 58 840 86 900 116 L900 260 L0 260 Z" fill="#312e81" opacity="0.18" />
            <path d="M0 210 C160 118 286 182 426 130 C560 82 650 178 900 110 L900 260 L0 260 Z" fill={accentColor} opacity="0.12" />
          </svg>
        </div>
        <div className="absolute left-[12%] top-[18%] h-2 w-2 rounded-full bg-amber-200 shadow-[80px_42px_0_rgba(253,230,138,0.8),180px_-8px_0_rgba(253,230,138,0.55),300px_36px_0_rgba(253,230,138,0.65)]" />
      </>
    );
  }

  if (templateId === "beach-boho") {
    return (
      <div className="absolute inset-x-0 bottom-0 h-72 opacity-[0.65] sm:h-96">
        <svg viewBox="0 0 900 260" className="h-full w-full" preserveAspectRatio="none">
          <path d="M0 128 C132 72 260 176 404 120 C548 66 660 152 900 96 L900 260 L0 260 Z" fill="#0f766e" opacity="0.12" />
          <path d="M0 158 C132 214 280 96 432 154 C594 214 702 100 900 150 L900 260 L0 260 Z" fill={accentColor} opacity="0.14" />
          <path d="M0 205 C168 152 300 230 486 176 C642 132 760 214 900 166 L900 260 L0 260 Z" fill="#f8fafc" opacity="0.65" />
        </svg>
      </div>
    );
  }

  if (templateId === "traditional-gold" || templateId === "anniversary-emerald") {
    return (
      <>
        <MandalaMotif
          color={accentColor}
          size={phase === 1 ? 420 : 360}
          opacity={0.06}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <div className="absolute inset-x-8 bottom-12 h-36 rounded-t-full border-t border-[color:var(--scene-accent)] opacity-[0.15]" />
      </>
    );
  }

  if (templateId === "floral-pastel" || templateId === "valentine-blush") {
    return (
      <>
        <FloralSprig color={accentColor} size={180} className="absolute -left-16 top-12 rotate-12 opacity-[0.1]" />
        <FloralSprig color={accentColor} size={180} flip className="absolute -right-16 bottom-12 -rotate-12 opacity-[0.1]" />
      </>
    );
  }

  if (templateId === "birthday-confetti") {
    return (
      <>
        <div className="absolute left-[-8%] top-16 h-44 w-44 rounded-full bg-sky-200/35" />
        <div className="absolute right-[-8%] bottom-10 h-52 w-52 rounded-full bg-fuchsia-200/30" />
        <div className="absolute left-[42%] bottom-20 h-24 w-24 rounded-full bg-yellow-200/40" />
      </>
    );
  }

  if (templateId === "housewarming-terracotta") {
    return (
      <>
        <HouseMotif color={accentColor} size={220} className="absolute right-[-44px] bottom-12 opacity-[0.1]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-lime-100/70 to-transparent" />
      </>
    );
  }

  return (
    <>
      <div className="absolute left-[10%] top-16 h-40 w-px bg-neutral-300/70" />
      <div className="absolute right-[12%] bottom-14 h-32 w-px bg-neutral-300/70" />
      <div className="absolute inset-x-[18%] top-1/2 h-px bg-neutral-200" />
    </>
  );
}

function sceneBackground(templateId: string, accentColor: string, phase: number) {
  const tint = `${accentColor}${phase === 1 ? "10" : "08"}`;

  if (templateId === "proposal-starlit") {
    return {
      background:
        "linear-gradient(180deg, rgba(30, 27, 75, 0.08), rgba(255, 255, 255, 0.78), rgba(251, 191, 36, 0.08))",
    };
  }

  if (templateId === "elegant-bw" || templateId === "minimal-modern") {
    return {
      background:
        phase === 1
          ? "linear-gradient(180deg, rgba(245,245,245,0.72), rgba(255,255,255,0.92))"
          : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,245,245,0.68))",
    };
  }

  return {
    background: `linear-gradient(180deg, ${tint}, rgba(255,255,255,0.76), ${tint})`,
  };
}

function SceneBackLayer({
  templateId,
  accentColor,
  phase,
}: {
  templateId: string;
  accentColor: string;
  phase: number;
}) {
  if (templateId === "traditional-gold" || templateId === "anniversary-emerald") {
    return (
      <>
        <MandalaMotif
          color={accentColor}
          size={260}
          opacity={0.09}
          className="absolute -left-24 top-10"
        />
        <MandalaMotif
          color={accentColor}
          size={190}
          opacity={0.07}
          className="absolute -right-16 bottom-8"
        />
        <FloatingDots variant="specks" accentColor={accentColor} />
      </>
    );
  }

  if (templateId === "floral-pastel" || templateId === "valentine-blush") {
    return (
      <>
        <FloralSprig
          color={accentColor}
          size={phase === 2 ? 110 : 88}
          className="absolute -left-8 top-10 rotate-12 opacity-20"
        />
        <FloralSprig
          color={accentColor}
          size={phase === 0 ? 116 : 92}
          flip
          className="absolute -right-10 bottom-8 -rotate-12 opacity-20"
        />
        <FloatingDots variant="petals" accentColor={accentColor} />
      </>
    );
  }

  if (templateId === "beach-boho") {
    return (
      <>
        <div className="absolute inset-x-0 bottom-0 h-20 opacity-30">
          <svg viewBox="0 0 800 120" className="h-full w-full" preserveAspectRatio="none">
            <path d="M0 54 C120 94 230 8 356 50 C510 102 626 28 800 58 L800 120 L0 120 Z" fill={accentColor} opacity="0.16" />
            <path d="M0 78 C142 34 260 108 404 64 C548 18 646 94 800 44 L800 120 L0 120 Z" fill="#0f766e" opacity="0.12" />
          </svg>
        </div>
        <PalmFrond color={accentColor} size={140} className="absolute -left-10 bottom-4 rotate-12 opacity-[0.16]" />
      </>
    );
  }

  if (templateId === "proposal-starlit") {
    return <FloatingDots variant="stars" accentColor={accentColor} />;
  }

  if (templateId === "birthday-confetti") {
    return <FloatingDots variant="confetti" accentColor={accentColor} />;
  }

  if (templateId === "housewarming-terracotta") {
    return (
      <>
        <HouseMotif color={accentColor} size={150} className="absolute -right-10 top-12 opacity-[0.12]" />
        <FloralSprig color="#5f7f32" size={96} className="absolute -left-8 bottom-10 rotate-12 opacity-[0.18]" />
      </>
    );
  }

  return (
    <>
      <div className="absolute left-8 top-10 h-px w-24 bg-neutral-300/70" />
      <div className="absolute right-8 bottom-10 h-px w-24 bg-neutral-300/70" />
    </>
  );
}

function SceneFrontLayer({
  templateId,
  accentColor,
  kind,
  phase,
}: {
  templateId: string;
  accentColor: string;
  kind: SceneKind;
  phase: number;
}) {
  if (templateId === "traditional-gold" || templateId === "anniversary-emerald") {
    return (
      <>
        <PaisleyCorner color={accentColor} size={38} className="absolute left-5 top-8 opacity-25" />
        <PaisleyCorner color={accentColor} size={38} className="absolute right-5 bottom-8 rotate-180 opacity-25" />
      </>
    );
  }

  if (templateId === "floral-pastel" || templateId === "valentine-blush") {
    return (
      <>
        <FloralSprig color={accentColor} size={42} className="absolute left-4 top-8 opacity-30" />
        <FloralSprig color={accentColor} size={42} flip className="absolute right-4 bottom-8 opacity-30" />
      </>
    );
  }

  if (templateId === "elegant-bw" || templateId === "minimal-modern") {
    return (
      <>
        <HairlineDiamond color={templateId === "elegant-bw" ? "#111111" : accentColor} size={18} className="absolute left-7 top-10 opacity-25" />
        <HairlineDiamond color={templateId === "elegant-bw" ? "#111111" : accentColor} size={18} className="absolute right-7 bottom-10 opacity-25" />
      </>
    );
  }

  if (templateId === "proposal-starlit") {
    return (
      <RingMotif
        color={accentColor}
        size={kind === "gallery" || kind === "rsvp" ? 54 : 38}
        className="absolute right-6 top-10 opacity-25"
      />
    );
  }

  if (templateId === "birthday-confetti") {
    return (
      <BalloonMotif
        color={CONFETTI[(phase + sceneOffsets[kind]) % CONFETTI.length]}
        size={52}
        className="absolute right-5 top-8 opacity-30"
      />
    );
  }

  if (templateId === "housewarming-terracotta") {
    return (
      <HouseMotif
        color={accentColor}
        size={44}
        className="absolute left-6 top-10 opacity-[0.24]"
      />
    );
  }

  if (templateId === "beach-boho") {
    return (
      <PalmFrond
        color={accentColor}
        size={58}
        className="absolute right-3 bottom-6 -rotate-12 opacity-[0.22]"
      />
    );
  }

  return (
    <Heart
      size={32}
      color={accentColor}
      fill={accentColor}
      className="absolute right-6 top-8 opacity-[0.15]"
      aria-hidden
    />
  );
}

function FloatingDots({
  variant,
  accentColor,
}: {
  variant: "specks" | "petals" | "stars" | "confetti";
  accentColor: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {DOTS.map((dot) => {
        const color = variant === "confetti" ? CONFETTI[dot.id % CONFETTI.length] : accentColor;
        return (
          <span
            key={dot.id}
            className={`ns-scene-particle ns-scene-${variant}`}
            style={{
              left: `${dot.left}%`,
              width: dot.size,
              height: variant === "petals" ? dot.size * 0.65 : dot.size,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${8 + (dot.id % 5)}s`,
              backgroundColor: color,
              ["--drift" as string]: `${dot.drift}px`,
            }}
          />
        );
      })}
      <style>{`
        .ns-scene-particle {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        .ns-scene-specks {
          bottom: -8%;
          border-radius: 9999px;
          box-shadow: 0 0 10px currentColor;
          animation: ns-scene-rise linear infinite;
        }
        .ns-scene-petals {
          top: -8%;
          border-radius: 70% 0 70% 0;
          animation: ns-scene-fall ease-in infinite;
        }
        .ns-scene-confetti {
          top: -8%;
          border-radius: 1px;
          animation: ns-scene-fall ease-in infinite;
        }
        .ns-scene-stars {
          top: 18%;
          border-radius: 9999px;
          box-shadow: 0 0 8px currentColor;
          animation: ns-scene-twinkle ease-in-out infinite;
        }
        @keyframes ns-scene-rise {
          0% { transform: translate(0, 0); opacity: 0; }
          18% { opacity: 0.7; }
          90% { opacity: 0.35; }
          100% { transform: translate(var(--drift), -108vh); opacity: 0; }
        }
        @keyframes ns-scene-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          16% { opacity: 0.78; }
          100% { transform: translate(var(--drift), 108vh) rotate(160deg); opacity: 0; }
        }
        @keyframes ns-scene-twinkle {
          0%, 100% { opacity: 0.12; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}
