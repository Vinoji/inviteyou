"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { KOLAM_DOTS, KOLAM_PETALS, KOLAM_STRANDS, KOLAM_VIEWBOX } from "./kolamGeometry";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import { useRevealHole } from "./useRevealHole";
import s from "./kolam.module.css";

const BRASS = "#E3B45A";
const RICE = "#F4EEE2";

/** A struck temple bell: a few inharmonic partials with long decays. */
function bellTone() {
  playSound((ac, now) => {
    const partials: [number, number, number][] = [
      // [frequency ratio, gain, decay seconds]
      [1, 0.11, 3.6],
      [2.0, 0.06, 2.6],
      [2.76, 0.045, 2.1],
      [5.4, 0.025, 1.2],
      [8.9, 0.012, 0.7],
    ];
    for (const [ratio, gain, decay] of partials) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = 523 * ratio;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gain, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      o.connect(g).connect(ac.destination);
      o.start(now);
      o.stop(now + decay + 0.1);
    }
  });
}

/** Brass kuthuvilakku with five wicks; flames light one by one. */
function Lamp({ lit, baseDelay, id }: { lit: boolean; baseDelay: number; id: string }) {
  const wicks = [10, 20, 30, 40, 50];
  return (
    <svg className={s.lamp} viewBox="0 0 60 140" aria-hidden>
      <defs>
        <linearGradient id={`${id}-brass`} x1="0" x2="1">
          <stop offset="0" stopColor="#8C6420" />
          <stop offset=".5" stopColor="#F3D48A" />
          <stop offset="1" stopColor="#8C6420" />
        </linearGradient>
        <radialGradient id={`${id}-flame`} cx=".5" cy=".7" r=".6">
          <stop offset="0" stopColor="#FFF6D6" />
          <stop offset=".45" stopColor="#FFC24A" />
          <stop offset="1" stopColor="#FF7A1A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* finial */}
      <path d="M30 2c4 5 4 9 0 12-4-3-4-7 0-12z" fill={`url(#${id}-brass)`} />
      <rect x="29" y="13" width="2" height="16" fill={`url(#${id}-brass)`} />
      {/* bowl with spouts */}
      <path d="M6 30Q30 48 54 30L52 28Q30 40 8 28Z" fill={`url(#${id}-brass)`} />
      {wicks.map((x) => (
        <path key={x} d={`M${x - 3} 30L${x} 25L${x + 3} 30Z`} fill={`url(#${id}-brass)`} />
      ))}
      {/* stem and base */}
      <rect x="27" y="40" width="6" height="78" fill={`url(#${id}-brass)`} />
      <ellipse cx="30" cy="62" rx="8" ry="3.5" fill={`url(#${id}-brass)`} />
      <ellipse cx="30" cy="92" rx="10" ry="4" fill={`url(#${id}-brass)`} />
      <path d="M12 138Q14 118 30 116Q46 118 48 138Z" fill={`url(#${id}-brass)`} />
      {/* flames */}
      {wicks.map((x, i) => (
        <g
          key={x}
          className={`${s.flame} ${lit ? s.flameLit : ""}`}
          style={{ transitionDelay: `${baseDelay + i * 80}ms` }}
        >
          <ellipse
            className={s.flicker}
            style={{ animationDelay: `${-i * 0.17}s` }}
            cx={x}
            cy={17}
            rx={3.4}
            ry={8}
            fill={`url(#${id}-flame)`}
          />
        </g>
      ))}
    </svg>
  );
}

function Bell() {
  return (
    <svg
      viewBox="0 0 80 120"
      width="100%"
      height="100%"
      aria-hidden
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="kolam-bell" x1="0" x2="1">
          <stop offset="0" stopColor="#8C6420" />
          <stop offset=".45" stopColor="#F3D48A" />
          <stop offset="1" stopColor="#8C6420" />
        </linearGradient>
      </defs>
      <line x1="40" y1="-400" x2="40" y2="34" stroke="#C8962E" strokeWidth="2" />
      <circle cx="40" cy="34" r="4" fill="none" stroke="#E3B45A" strokeWidth="2" />
      <path d="M22 80Q20 42 40 38Q60 42 58 80L66 90H14Z" fill="url(#kolam-bell)" />
      <rect x="12" y="89" width="56" height="5" rx="2" fill="#C8962E" />
      <circle cx="40" cy="101" r="5.5" fill="#8C6420" />
    </svg>
  );
}

/**
 * Intro "kolam" (traditional-gold): on dark granite, rice-flour dots appear
 * and a kolam draws itself around them; brass lamps and a temple bell
 * appear with the couple's names in the kolam's centre. Tapping the bell
 * swings it (with a synthesized bell tone), lights the lamp wicks one by
 * one, turns the kolam gold, and opens a widening circle of light from the
 * kolam's centre onto the hero, with embers and jasmine.
 *
 * Reduced motion: the finished gold kolam, lamps lit, and a "View
 * invitation" button.
 */
export default function KolamIntro({ names, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.intros.kolam");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview && !reduceMotion);
  const [ready, setReady] = useState(false); // lamps, bell and text shown
  const [opened, setOpened] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const kolamRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bell = useAnimationControls();
  const glow = useAnimationControls();

  // Circle of light: a hole in the intro, growing from the kolam's centre.
  const reveal = useRevealHole(rootRef, kolamRef);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), reduceMotion ? 0 : 1800);
    return () => clearTimeout(id);
  }, [reduceMotion]);

  function openStatic() {
    onOpen();
    onDone();
  }

  function ring() {
    if (opened || !ready) return;
    setOpened(true);
    onOpen();
    if (!preview) bellTone();
    bell.start({ rotate: [0, -18, 14, -8, 0], transition: { duration: 1.1, ease: "easeOut" } });

    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(400, () =>
      glow.start({ opacity: 1, scale: 1, transition: { duration: 1.2, ease: "easeOut" } })
    );
    at(600, () => reveal.open(1.9));
    at(1200, () => {
      burst({ preset: "embers" });
      burst({ preset: "jasmine" });
    });
    at(3200, onDone);
  }

  const gold = opened || reduceMotion;

  return (
    <motion.div
      ref={rootRef}
      className={s.root}
      style={{ clipPath: reveal.clipPath }}
      role="dialog"
      aria-label={t("dialogLabel")}
    >
      <svg className={s.grain} aria-hidden>
        <filter id="kolam-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.88  0 0 0 0.55 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#kolam-grain)" />
      </svg>
      <motion.div
        className={s.glow}
        initial={{ opacity: 0, scale: 0.2 }}
        animate={glow}
        aria-hidden
      />

      <div className={s.column}>
        <motion.div
          initial={false}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : -24 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ pointerEvents: ready ? "auto" : "none" }}
        >
          <button
            type="button"
            className={s.bellButton}
            onClick={reduceMotion ? openStatic : ring}
            aria-label={reduceMotion ? t("view") : t("tapBell")}
            disabled={opened}
          >
            {!opened && !reduceMotion && <span className={s.halo} aria-hidden />}
            <div className={reduceMotion || opened ? undefined : s.bellSway}>
              <motion.div animate={bell} style={{ transformOrigin: "50% 0" }}>
                <Bell />
              </motion.div>
            </div>
          </button>
        </motion.div>

        <motion.p
          className={s.eyebrow}
          style={{ fontFamily: fonts.caps }}
          initial={false}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {t("eyebrow")}
        </motion.p>

        <div ref={kolamRef} className={s.kolamBox}>
          <svg viewBox={KOLAM_VIEWBOX} aria-hidden>
            {KOLAM_DOTS.map((d, i) => (
              <motion.circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={2.6}
                fill={RICE}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: d.ring ? 0.95 : ready ? 0.18 : 0.7 }}
                transition={{ duration: 0.4, delay: ready ? 0 : i * 0.006 }}
              />
            ))}
            {[...KOLAM_STRANDS, KOLAM_PETALS].map((d, i) => (
              <g key={i}>
                <motion.path
                  d={d}
                  fill="none"
                  stroke={RICE}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1, opacity: gold ? 0 : 0.95 }}
                  transition={{
                    pathLength: {
                      delay: i === 2 ? 1.2 : 0.2,
                      duration: i === 2 ? 0.6 : 1.6,
                      ease: "easeInOut",
                    },
                    opacity: { duration: 0.8, delay: gold && !reduceMotion ? 0.6 : 0 },
                  }}
                />
                <motion.path
                  d={d}
                  fill="none"
                  stroke={BRASS}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  initial={false}
                  animate={{ opacity: gold ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: gold && !reduceMotion ? 0.6 : 0 }}
                />
              </g>
            ))}
          </svg>
          <motion.div
            className={s.names}
            style={{ fontFamily: fonts.display }}
            initial={false}
            animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 0.94 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className={s.name}>{names.a}</span>
            {names.b !== undefined && (
              <>
                <span className={s.amp}>&amp;</span>
                <span className={s.name}>{names.b}</span>
              </>
            )}
          </motion.div>
        </div>

        <motion.div
          className={s.lampsRow}
          initial={false}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <Lamp id="kolam-lamp-l" lit={gold} baseDelay={0} />
          {reduceMotion ? (
            <button
              type="button"
              className={s.viewBtn}
              style={{ fontFamily: fonts.caps }}
              onClick={openStatic}
            >
              {t("view")}
            </button>
          ) : (
            <p className={s.hint} style={{ fontFamily: fonts.caps }}>
              {t("tapBell")}
            </p>
          )}
          <Lamp id="kolam-lamp-r" lit={gold} baseDelay={400} />
        </motion.div>
      </div>
    </motion.div>
  );
}
