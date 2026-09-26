"use client";

import { useRef, type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import Reveal from "../Reveal";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { useMotionTheme } from "./MotionThemeProvider";
import { useEnterProgress } from "./scroll";
import s from "./motion.module.css";

/* ------------------------------------------------------------------ */
/* Dividers — rendered above a section                                 */
/* ------------------------------------------------------------------ */

/** Small repeating temple-crest (gopuram kalasam) border. */
function Crest() {
  return (
    <svg className={s.crest} preserveAspectRatio="none" viewBox="0 0 24 12" aria-hidden>
      <defs>
        <pattern id="motion-crest" width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 12V9h4l2-3 2 3h3l1-6 1 6h3l2-3 2 3h4v3Z" fill="var(--rp-gold, #C8962E)" />
          <circle cx="12" cy="2" r="1.4" fill="var(--rp-gold-light, #E3B45A)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#motion-crest)" />
    </svg>
  );
}

/** "kolamLine": a short kolam weave between five dots that draws itself as
 * it scrolls into view, with a diya that lights once it's done. */
function KolamDivider({ progress, still }: { progress: MotionValue<number>; still: boolean }) {
  const drawn = useTransform(progress, [0.1, 0.9], [0, 1]);
  const flame = useTransform(progress, [0.9, 1], [0, 1]);
  const dots = [20, 60, 100, 140, 180];
  const weave = (sign: number) =>
    `M4 24 ${dots.map((x, i) => `Q${x - 20} ${24 + sign * (i % 2 ? -14 : 14)} ${x} 24`).join(" ")} Q196 ${24 + sign * 14} 216 24`;
  return (
    <svg viewBox="0 0 220 48" className={s.kolamSvg}>
      {dots.map((x) => (
        <circle key={x} cx={x - 10} cy={24} r={1.8} fill="#F4EEE2" opacity={0.8} />
      ))}
      {[1, -1].map((sign) => (
        <motion.path
          key={sign}
          d={weave(sign)}
          fill="none"
          stroke="var(--rp-gold-light, #E3B45A)"
          strokeWidth={1.6}
          strokeLinecap="round"
          style={{ pathLength: still ? 1 : drawn }}
        />
      ))}
      <path d="M100 40q10 6 20 0l-2 4h-16z" fill="var(--rp-gold, #C8962E)" />
      <motion.ellipse
        cx={110}
        cy={34}
        rx={2.4}
        ry={5.5}
        fill="#FFC24A"
        style={{ opacity: still ? 1 : flame }}
      />
    </svg>
  );
}

/** "hairline": a full-width hairline that draws with scroll, numbered with
 * the section's real position (01, 02…). */
function HairlineDivider({
  progress,
  still,
  index,
}: {
  progress: MotionValue<number>;
  still: boolean;
  index: number;
}) {
  return (
    <div className={s.hairlineDivider}>
      <motion.span className={s.hairline} style={{ scaleX: still ? 1 : progress }} />
      <span className={s.hairlineNum}>{String(index).padStart(2, "0")}</span>
    </div>
  );
}

/** "filmStrip": a strip of film perforations sliding sideways with scroll,
 * over a silver hairline. */
function FilmStripDivider({ progress, still }: { progress: MotionValue<number>; still: boolean }) {
  const x = useTransform(progress, [0, 1], ["-12%", "0%"]);
  return (
    <div className={s.filmDivider}>
      <motion.div className={s.filmStrip} style={{ x: still ? 0 : x }} />
      <span className={s.filmHairline} />
    </div>
  );
}

/** "wave": two wave lines drifting sideways in opposite directions with scroll. */
function WaveDivider({ progress, still }: { progress: MotionValue<number>; still: boolean }) {
  const a = useTransform(progress, [0, 1], ["-10%", "0%"]);
  const b = useTransform(progress, [0, 1], ["0%", "-10%"]);
  const wave = "M0 12 Q25 0 50 12 T100 12 T150 12 T200 12 T250 12 T300 12 T350 12 T400 12 T450 12";
  return (
    <div className={s.waveDivider} aria-hidden>
      <motion.svg viewBox="0 0 450 24" preserveAspectRatio="none" style={{ x: still ? 0 : a }}>
        <path d={wave} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      </motion.svg>
      <motion.svg viewBox="0 0 450 24" preserveAspectRatio="none" style={{ x: still ? 0 : b }}>
        <path d={wave} fill="none" stroke="rgba(242,180,90,0.7)" strokeWidth="1.5" />
      </motion.svg>
    </div>
  );
}

function Divider({ index }: { index: number }) {
  const { divider } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const progress = useEnterProgress(ref);
  // "vine" is drawn by the scroll thread; "none" draws nothing.
  if (divider === "none" || divider === "vine") return null;
  return (
    <div ref={ref} className={s.divider} aria-hidden>
      {divider === "kolamLine" && <KolamDivider progress={progress} still={reduceMotion} />}
      {divider === "hairline" && (
        <HairlineDivider progress={progress} still={reduceMotion} index={index} />
      )}
      {divider === "filmStrip" && <FilmStripDivider progress={progress} still={reduceMotion} />}
      {divider === "wave" && <WaveDivider progress={progress} still={reduceMotion} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-scrubbed entrances                                           */
/* ------------------------------------------------------------------ */

/** Entrances driven by how far the section has scrolled in (0 when its top
 * reaches the bottom of the screen, 1 when it reaches the middle). Clips
 * are dropped ("none") once fully in, so nothing inside stays clipped. */
function ScrubbedEnter({
  kind,
  index,
  className,
  children,
}: {
  kind: "wipe" | "bloom" | "iris" | "wave";
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useEnterProgress(ref);
  const { pageBg } = useMotionTheme();
  const fromRight = index % 2 === 0;

  const clipPath = useTransform(p, (v) => {
    if (v >= 1) return "none";
    switch (kind) {
      case "wipe": {
        const hidden = (1 - v) * 100;
        return fromRight ? `inset(0 0 0 ${hidden}%)` : `inset(0 ${hidden}% 0 0)`;
      }
      case "bloom":
        return `ellipse(${20 + v * 100}% ${14 + v * 90}% at 50% 40%)`;
      case "iris":
        return `circle(${v * 150}% at 50% 35%)`;
      default:
        return "none";
    }
  });
  const y = useTransform(p, [0, 1], [40, 0]);
  const vignette = useTransform(p, [0, 1], [1, 0]);
  // "wave": page-coloured water over the section's top edge, a tall swell
  // flattening to nothing as the section scrolls in.
  const waveD = useTransform(p, (v) => {
    const a = 26 * (1 - v);
    return `M0 0H100V${a * 0.6}C75 ${a * 1.6} 75 ${-a * 0.2} 50 ${a * 0.8}S25 ${a * 1.8} 0 ${a * 0.5}Z`;
  });

  return (
    <motion.div
      ref={ref}
      className={`${s.enter} ${className ?? ""}`}
      style={kind === "wave" ? { y } : { clipPath }}
    >
      {kind === "wave" && (
        <svg className={s.waveTop} viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden>
          <motion.path d={waveD} fill={pageBg} />
        </svg>
      )}
      {children}
      {kind === "iris" && (
        <motion.div className={s.vignette} style={{ opacity: vignette }} aria-hidden />
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

/**
 * Wraps one invitation section and applies the template's section entrance
 * and the divider above it (lib/motionThemes.ts). `index` is the section's
 * position among rendered sections (1-based).
 *
 * Entrances:
 * - "rise": Reveal — fade + spring up, once, on entering the viewport.
 * - "tier": like a gopuram tier, a narrower, lower trapezoid band widens to
 *   full, with a temple-crest border sliding onto its top edge.
 * - "wipe": a clean horizontal clip wipe scrubbed by scroll; even-numbered
 *   sections wipe from the right.
 * - "bloom": a soft oval opening from the middle, like paint spreading.
 * - "iris": a circular iris from black, with a fading vignette.
 * - "wave": the top edge morphs from a swell to flat as the section rises.
 * Reduced motion shows every section in place.
 */
export default function Section({
  children,
  index = 1,
  delay = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  delay?: number;
  className?: string;
}) {
  const theme = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const divider = <Divider index={index} />;

  if (reduceMotion) {
    return (
      <>
        {divider}
        <div className={`${theme.sectionEnter === "tier" ? s.tier : ""} ${className ?? ""}`}>
          {theme.sectionEnter === "tier" && <Crest />}
          {children}
        </div>
      </>
    );
  }

  switch (theme.sectionEnter) {
    case "tier":
      return (
        <>
          {divider}
          <motion.div
            className={`${s.tier} ${className ?? ""}`}
            initial="band"
            whileInView="full"
            viewport={{ once: true, amount: 0.12 }}
            variants={{
              band: {
                opacity: 0,
                y: 40,
                scaleX: 0.86,
                clipPath: "polygon(7% 0%, 93% 0%, 100% 100%, 0% 100%)",
              },
              full: {
                opacity: 1,
                y: 0,
                scaleX: 1,
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                transitionEnd: { clipPath: "none" },
              },
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
          >
            <motion.div
              variants={{ band: { y: -14, opacity: 0 }, full: { y: 0, opacity: 1 } }}
              transition={{ duration: 0.6, delay: delay + 0.35, ease: "easeOut" }}
            >
              <Crest />
            </motion.div>
            {children}
          </motion.div>
        </>
      );
    case "wipe":
    case "bloom":
    case "iris":
    case "wave":
      return (
        <>
          {divider}
          <ScrubbedEnter kind={theme.sectionEnter} index={index} className={className}>
            {children}
          </ScrubbedEnter>
        </>
      );
    case "rise":
    default:
      return (
        <>
          {divider}
          <Reveal delay={delay} className={className}>
            {children}
          </Reveal>
        </>
      );
  }
}
