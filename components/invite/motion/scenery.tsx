"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useTranslations, useFormatter } from "next-intl";
import PalmFrond from "../decor/PalmFrond";
import ParticleField from "../particles/ParticleField";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { useMotionTheme } from "./MotionThemeProvider";
import { usePageProgress, usePaneHeight, useStickyProgress, useTraverseProgress } from "./scroll";
import s from "./motion.module.css";

/**
 * Larger, page-level template effects, each switched on by a flag in
 * MotionTheme.moments and rendering nothing otherwise. Reduced motion shows
 * static final states.
 */

/** moments.pinnedCountdown: a full screen held while you scroll through it;
 * the days number, set enormous, counts down from (days + 30) to the real
 * value. Place directly after the hero. */
export function PinnedCountdown({ weddingDate }: { weddingDate: string }) {
  const { moments } = useMotionTheme();
  const t = useTranslations("invite.royal.pinned");
  const format = useFormatter();
  const reduceMotion = useSafeReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const progress = useStickyProgress(outerRef);
  const paneHeight = usePaneHeight(outerRef, true);
  // Days are computed after mount (from the visitor's clock), so the server
  // and first client render agree.
  const [days, setDays] = useState<number | null>(null);
  const shown = useTransform(progress, (p) =>
    days === null ? "" : String(Math.round(days + 30 * (1 - p)))
  );

  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weddingDate)) return;
    const id = setTimeout(() => {
      const target = new Date(`${weddingDate}T00:00:00`).getTime();
      setDays(Math.max(0, Math.ceil((target - Date.now()) / 86_400_000)));
    }, 0);
    return () => clearTimeout(id);
  }, [weddingDate]);

  if (!moments?.pinnedCountdown || !weddingDate) return null;
  const frameH = paneHeight ? `${paneHeight}px` : "100dvh";
  const dateLabel = format.dateTime(new Date(`${weddingDate}T12:00:00`), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      ref={outerRef}
      className={s.pinnedOuter}
      style={{ height: reduceMotion ? "auto" : `calc(${frameH} * 2)` }}
    >
      <div className={s.pinnedFrame} style={{ height: reduceMotion ? undefined : frameH }}>
        <motion.span className={s.pinnedNumber} aria-hidden={days === null}>
          {reduceMotion ? (days ?? "") : shown}
        </motion.span>
        <span className={s.pinnedLabel}>{t("daysToGo")}</span>
        <span className={s.pinnedDate}>{dateLabel}</span>
      </div>
    </div>
  );
}

/** moments.palms: palm fronds at both edges, swaying, drifting with scroll.
 * Fills its positioned parent. */
export function Palms() {
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const p = useTraverseProgress(ref);
  const y = useTransform(p, [0, 1], [50, -50]);
  if (!moments?.palms) return null;
  return (
    <div ref={ref} className={s.palms} aria-hidden>
      <motion.div className={s.palmLeft} style={{ y: reduceMotion ? 0 : y }}>
        <div className={s.sway}>
          <PalmFrond color="#2F6B5A" size={150} />
        </div>
      </motion.div>
      <motion.div className={s.palmRight} style={{ y: reduceMotion ? 0 : y }}>
        <div className={s.sway} style={{ animationDelay: "-3s" }}>
          <PalmFrond color="#2F6B5A" size={130} />
        </div>
      </motion.div>
    </div>
  );
}

/** moments.sky: a sky behind the hero and thank-you that moves from noon
 * to golden hour to dusk as the page scrolls, with a sinking sun. At the
 * thank-you ("dusk") the first stars twinkle. Fills its positioned parent,
 * behind the content. */
export function Sky({ at }: { at: "hero" | "thanks" }) {
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const p = usePageProgress(ref);
  const golden = useTransform(p, [0.15, 0.5], [0, 1]);
  const dusk = useTransform(p, [0.55, 0.9], [0, 1]);
  const sunY = useTransform(p, [0, 1], ["0%", "260%"]);
  const sunScale = useTransform(p, [0, 1], [1, 1.25]);
  // The sun has set by dusk, so it never sits behind the thank-you text.
  const sunOpacity = useTransform(p, [0.7, 0.9], [1, 0]);
  if (!moments?.sky) return null;
  // With reduced motion: a static sunset.
  const still = reduceMotion;
  return (
    <div ref={ref} className={s.sky} aria-hidden>
      <div className={s.skyNoon} />
      <motion.div className={s.skyGolden} style={{ opacity: still ? 1 : golden }} />
      <motion.div
        className={s.skyDusk}
        style={{ opacity: still ? (at === "thanks" ? 1 : 0) : dusk }}
      />
      <motion.div
        className={s.sun}
        style={{
          y: still ? "140%" : sunY,
          scale: still ? 1.15 : sunScale,
          opacity: still ? (at === "thanks" ? 0 : 1) : sunOpacity,
        }}
      />
      {at === "thanks" && (
        <ParticleField preset="sunGlints" mode="ambient" className={s.skyStars} />
      )}
    </div>
  );
}

/** moments.grain: a faint animated film grain over the whole invitation,
 * pinned to the viewport (or the editor's pane). Place as a child of the
 * invitation root. Off with reduced motion. */
export function FilmGrain() {
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const paneHeight = usePaneHeight(ref, true);
  if (!moments?.grain || reduceMotion) return null;
  return (
    <div ref={ref} className={s.grainLayer} aria-hidden>
      <div className={s.grainFrame} style={paneHeight ? { height: paneHeight } : undefined}>
        <svg className={s.grain}>
          <filter id="motion-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#motion-grain)" />
        </svg>
      </div>
    </div>
  );
}
