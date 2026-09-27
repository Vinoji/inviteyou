"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import { useRevealHole } from "./useRevealHole";
import s from "./pookalam.module.css";

/** Pookalam rings from the centre out: petal count, length, colour. Counts
 * divide 360 evenly so every angle is an exact decimal (no hydration drift). */
const RINGS = [
  { count: 8, len: 14, fill: "#E8862A" }, // marigold
  { count: 12, len: 22, fill: "#C8102E" }, // chethi
  { count: 16, len: 30, fill: "#FFFDF4" }, // thumba
  { count: 20, len: 38, fill: "#FFD35C" }, // yellow jamanthi
  { count: 24, len: 46, fill: "#2E7D32" }, // leaf border
] as const;

function petal(len: number) {
  const w = len * 0.34;
  return `M0 0C${-w} ${-len * 0.3} ${-w * 0.8} ${-len * 0.95} 0 ${-len}C${w * 0.8} ${-len * 0.95} ${w} ${-len * 0.3} 0 0Z`;
}

/**
 * Intro "pookalam" (pookalam): an Onam flower carpet on a courtyard floor.
 * Only its centre is laid; tapping it lays the rings outward one by one —
 * marigold, chethi, thumba, jamanthi, then a leaf border — each turning into
 * place, then the pookalam opens as a window onto the invitation while
 * marigold petals scatter. 3.2s. Reduced motion: the finished pookalam and
 * a "View invitation" button.
 */
export default function PookalamIntro({ names, dateLabel, fonts, onOpen, onDone, burst }: IntroProps) {
  const t = useTranslations("invite.intros.pookalam");
  const reduceMotion = useSafeReducedMotion();
  const [laid, setLaid] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const reveal = useRevealHole(rootRef, flowerRef);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function lay() {
    if (laid) return;
    setLaid(true);
    onOpen();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(1500, () => {
      reveal.open(1.6, [0.5, 0, 0.3, 1]);
      burst({ preset: "marigold", colors: ["#E8862A", "#FFD35C", "#C8102E"] });
    });
    at(3200, onDone);
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const done = laid || reduceMotion;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <motion.div
      ref={rootRef}
      className={s.root}
      style={{ clipPath: reveal.clipPath }}
      role="dialog"
      aria-label={t("dialogLabel")}
    >
      <div className={s.column}>
        <p className={s.lead} style={{ fontFamily: fonts.display }}>
          {t("lead")}
        </p>
        <div ref={flowerRef} className={s.flowerBox}>
          <button
            type="button"
            className={s.flowerBtn}
            onClick={reduceMotion ? viewStatic : lay}
            disabled={laid}
            aria-label={reduceMotion ? t("view") : t("tapCentre")}
          >
            <svg viewBox="-60 -60 120 120" className={done ? undefined : s.breathe} aria-hidden>
              <circle r="58" fill="#7a3b1a" opacity="0.18" />
              {/* Chalk guide rings, sketched on the floor before the flowers go down. */}
              {RINGS.map((ring) => (
                <circle
                  key={ring.len}
                  r={ring.len}
                  fill="none"
                  stroke="rgba(255,249,236,0.35)"
                  strokeWidth="0.6"
                  strokeDasharray="1.5 2"
                />
              ))}
              {[...RINGS].reverse().map((ring, rr) => {
                const r = RINGS.length - 1 - rr;
                return (
                  <motion.g
                    key={r}
                    initial={false}
                    animate={done ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -40, opacity: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: reduceMotion ? 0 : 0.15 + r * 0.2,
                      ease: [0.34, 1.3, 0.64, 1],
                    }}
                  >
                    {Array.from({ length: ring.count }, (_, i) => (
                      <path
                        key={i}
                        d={petal(ring.len)}
                        fill={ring.fill}
                        stroke="rgba(90,20,20,0.25)"
                        strokeWidth="0.5"
                        transform={`rotate(${(360 / ring.count) * i + (r % 2) * (180 / ring.count)})`}
                      />
                    ))}
                  </motion.g>
                );
              })}
              <circle r="7" fill="#FFD35C" stroke="#C8102E" strokeWidth="2" />
              <circle r="2.5" fill="#C8102E" />
            </svg>
          </button>
        </div>
        <h1 className={s.names} style={{ fontFamily: fonts.display }} lang={scriptLang(namesText)}>
          <span>{names.a}</span>
          {names.b !== undefined && (
            <>
              <span className={s.amp}>&amp;</span>
              <span>{names.b}</span>
            </>
          )}
        </h1>
        {dateLabel && (
          <p className={s.date} style={{ fontFamily: fonts.caps }}>
            {dateLabel}
          </p>
        )}
        {reduceMotion ? (
          <button type="button" className={s.viewBtn} style={{ fontFamily: fonts.caps }} onClick={viewStatic}>
            {t("view")}
          </button>
        ) : (
          <motion.p className={s.hint} style={{ fontFamily: fonts.caps }} animate={{ opacity: laid ? 0 : 1 }}>
            {t("tapCentre")}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
