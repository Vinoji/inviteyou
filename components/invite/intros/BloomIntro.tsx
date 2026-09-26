"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import type { IntroProps } from "./types";
import { useRevealHole } from "./useRevealHole";
import s from "./bloom.module.css";

/** Peony petal rings, outermost first: count, length, colour, open scale. */
const RINGS = [
  { count: 7, len: 70, fill: "#E79AA8", scale: 1.4, delay: 0 },
  { count: 6, len: 56, fill: "#F2B8C4", scale: 1.2, delay: 0.25 },
  { count: 5, len: 42, fill: "#F6D6D6", scale: 1.05, delay: 0.5 },
] as const;

function petal(len: number) {
  const w = len * 0.42;
  return `M0 0C${-w} ${-len * 0.3} ${-w * 0.8} ${-len * 0.95} 0 ${-len}C${w * 0.8} ${-len * 0.95} ${w} ${-len * 0.3} 0 0Z`;
}

/** Vine climbing one edge of the screen, with leaves along it. */
function Vine({ side, grow, still }: { side: "left" | "right"; grow: boolean; still: boolean }) {
  const leaves = [0.18, 0.34, 0.5, 0.66, 0.82];
  const d = "M20 400 C 4 330, 36 280, 18 210 S 4 110, 22 20";
  const drawn = still || grow;
  return (
    <svg
      className={`${s.vine} ${side === "right" ? s.vineRight : ""}`}
      viewBox="0 0 44 400"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d={d}
        fill="none"
        stroke="#7E9C76"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={still ? false : { pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {leaves.map((f, i) => (
        <g key={f} transform={`translate(${i % 2 ? 28 : 12} ${400 - f * 380})`}>
          <motion.path
            d="M0 0C6 -6 14 -6 18 0C14 6 6 6 0 0Z"
            fill="#A8BFA0"
            transform={i % 2 ? "rotate(-30)" : "rotate(210)"}
            initial={still ? false : { scale: 0 }}
            animate={{ scale: drawn ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.25 + f * 0.9 }}
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * Intro "bloom" (floral-pastel): cream paper with a watercolour wash and a
 * single closed peony bud, breathing. Tapping the bud opens it ring by ring
 * like a time-lapse (outer, middle, inner), vines climb the screen edges,
 * then the flower keeps opening past the screen as its centre becomes a
 * window onto the invitation, with butterflies and petals flying out. 3.4s.
 *
 * Reduced motion: the fully open peony and grown vines, and a "View
 * invitation" button.
 */
export default function BloomIntro({ names, fonts, onOpen, onDone, burst }: IntroProps) {
  const t = useTranslations("invite.intros.bloom");
  const reduceMotion = useSafeReducedMotion();
  const [open, setOpen] = useState(false);
  const [vines, setVines] = useState(false);
  const [zoom, setZoom] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const reveal = useRevealHole(rootRef, flowerRef);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function bloom() {
    if (open) return;
    setOpen(true);
    onOpen();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(800, () => setVines(true));
    at(1400, () => {
      setZoom(true);
      reveal.open(1.8, [0.5, 0, 0.3, 1]);
    });
    at(1600, () => {
      burst({ preset: "butterflies" });
      burst({ preset: "pastelPetals" });
    });
    at(3400, onDone);
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const opened = open || reduceMotion;

  return (
    <motion.div
      ref={rootRef}
      className={s.root}
      style={{ clipPath: reveal.clipPath }}
      role="dialog"
      aria-label={t("dialogLabel")}
    >
      <div className={s.wash} aria-hidden />
      <svg className={s.washEdge} aria-hidden>
        <filter id="bloom-wash">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="60" />
        </filter>
        <g filter="url(#bloom-wash)">
          <ellipse cx="50%" cy="46%" rx="42%" ry="30%" fill="rgba(246,214,214,0.55)" />
          <ellipse cx="30%" cy="70%" rx="30%" ry="18%" fill="rgba(203,184,224,0.28)" />
          <ellipse cx="72%" cy="24%" rx="26%" ry="16%" fill="rgba(247,231,180,0.35)" />
        </g>
      </svg>

      <Vine side="left" grow={vines} still={reduceMotion} />
      <Vine side="right" grow={vines} still={reduceMotion} />

      <div className={s.column}>
        <p className={s.lead} style={{ fontFamily: fonts.display }}>
          {t("lead")}
        </p>

        <motion.div
          ref={flowerRef}
          className={s.flowerBox}
          animate={{ scale: zoom ? 6 : 1 }}
          transition={{ duration: 1.8, ease: [0.5, 0, 0.3, 1] }}
        >
          <button
            type="button"
            className={s.bud}
            onClick={reduceMotion ? viewStatic : bloom}
            disabled={open}
            aria-label={reduceMotion ? t("view") : t("tapBud")}
          >
            <svg viewBox="-100 -100 200 200" className={opened ? undefined : s.breathe} aria-hidden>
              {RINGS.map((ring, r) =>
                Array.from({ length: ring.count }, (_, i) => {
                  const spread = (i - (ring.count - 1) / 2) * (8 - r * 2);
                  const angle = (360 / ring.count) * i + r * 17;
                  return (
                    <motion.path
                      key={`${r}-${i}`}
                      d={petal(ring.len)}
                      fill={ring.fill}
                      stroke="rgba(185,106,124,0.35)"
                      strokeWidth="0.8"
                      initial={false}
                      animate={
                        opened
                          ? { rotate: angle, scale: ring.scale }
                          : { rotate: spread, scale: 0.46 - r * 0.04 }
                      }
                      transition={{
                        duration: 0.8,
                        delay: reduceMotion ? 0 : ring.delay + i * 0.04,
                        ease: [0.34, 1.2, 0.64, 1],
                      }}
                      // Each petal grows up from (0,0): the bottom-centre of its own box.
                      style={{ originX: 0.5, originY: 1 }}
                    />
                  );
                })
              )}
              <motion.g
                initial={false}
                animate={{ scale: opened ? 1 : 0.3, opacity: opened ? 1 : 0 }}
                transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.6 }}
              >
                <circle r="13" fill="#F7E7B4" />
                {Array.from({ length: 10 }, (_, i) => (
                  <circle
                    key={i}
                    // Rounded: server and browser print long floats differently,
                    // which would be a hydration mismatch.
                    cx={(Math.cos((i / 10) * Math.PI * 2) * 8).toFixed(2)}
                    cy={(Math.sin((i / 10) * Math.PI * 2) * 8).toFixed(2)}
                    r="1.8"
                    fill="#D9A441"
                  />
                ))}
              </motion.g>
              {/* The bud's green sepals, hidden as it opens. */}
              <motion.path
                d="M-16 6C-10 22 10 22 16 6C8 12 -8 12 -16 6Z"
                fill="#7E9C76"
                initial={false}
                animate={{ opacity: opened ? 0 : 1 }}
                transition={{ duration: 0.4 }}
              />
            </svg>
          </button>
        </motion.div>

        <p className={s.names} style={{ fontFamily: fonts.display }}>
          {names.a}
          {names.b !== undefined && <> &amp; {names.b}</>}
        </p>
        {reduceMotion ? (
          <button
            type="button"
            className={s.viewBtn}
            style={{ fontFamily: fonts.caps }}
            onClick={viewStatic}
          >
            {t("view")}
          </button>
        ) : (
          <motion.p
            className={s.hint}
            style={{ fontFamily: fonts.caps }}
            animate={{ opacity: open ? 0 : 1 }}
          >
            {t("tapBud")}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
