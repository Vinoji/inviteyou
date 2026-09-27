"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./kasavu.module.css";

/** Wick positions on the lamp's top dish (viewBox units), lit left to right. */
const WICKS = [-30, -15, 0, 15, 30];

/** A temple bell struck once — only from a tap. */
function bell() {
  playSound((ac, now) => {
    [349.23, 698.46, 1046.5].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.08 / (i + 1), now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3);
      o.connect(g).connect(ac.destination);
      o.start(now);
      o.stop(now + 3.1);
    });
  });
}

/** Brass nilavilakku: round base, ringed stem, a dish with five wicks. */
function Nilavilakku({ litCount }: { litCount: number }) {
  return (
    <svg viewBox="-60 -110 120 220" className={s.lamp} aria-hidden>
      <defs>
        <linearGradient id="brass" x1="0" x2="1">
          <stop offset="0" stopColor="#8c6a1c" />
          <stop offset="0.45" stopColor="#f3d98a" />
          <stop offset="1" stopColor="#9c7a1e" />
        </linearGradient>
        <radialGradient id="wick-glow">
          <stop offset="0" stopColor="#ffe29a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff9f33" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glow grows with each lit wick */}
      <motion.ellipse
        cx="0"
        cy="-70"
        rx="70"
        ry="44"
        fill="url(#wick-glow)"
        initial={false}
        animate={{ opacity: litCount / WICKS.length }}
        transition={{ duration: 0.4 }}
      />
      {/* Base */}
      <ellipse cx="0" cy="100" rx="42" ry="8" fill="url(#brass)" />
      <path d="M-34 100 Q0 70 34 100Z" fill="url(#brass)" />
      {/* Stem with rings */}
      <rect x="-5" y="-50" width="10" height="130" fill="url(#brass)" />
      {[70, 40, 10, -20].map((y) => (
        <ellipse key={y} cx="0" cy={y} rx="11" ry="4" fill="url(#brass)" />
      ))}
      {/* Top dish */}
      <path d="M-44 -58 Q0 -30 44 -58 Q30 -50 0 -48 Q-30 -50 -44 -58Z" fill="url(#brass)" />
      <ellipse cx="0" cy="-58" rx="44" ry="6" fill="#7a5a14" />
      {/* Crest */}
      <path d="M0 -100 L6 -86 L0 -80 L-6 -86Z" fill="url(#brass)" />
      <rect x="-2" y="-80" width="4" height="22" fill="url(#brass)" />
      {WICKS.map((x, i) => (
        <g key={x} transform={`translate(${x} -60)`}>
          <line y1="0" y2="-6" stroke="#3a2a1a" strokeWidth="1.6" />
          <motion.g
            initial={false}
            animate={{ opacity: i < litCount ? 1 : 0, scale: i < litCount ? 1 : 0.2 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ originX: "0px", originY: "-6px" }}
          >
            <g className={i < litCount ? s.flicker : undefined}>
              <path d="M0 -6 C-6 -14 -3 -24 0 -30 C3 -24 6 -14 0 -6Z" fill="#ff9933" />
              <path d="M0 -7 C-3 -12 -1 -18 0 -21 C1 -18 3 -12 0 -7Z" fill="#fff0b8" />
            </g>
          </motion.g>
        </g>
      ))}
    </svg>
  );
}

/**
 * Intro "kasavu" (kerala-kasavu): a Kerala temple wedding. A kasavu cloth —
 * off-white with gold zari bands — unrolls down the screen, with a brass
 * nilavilakku at its heart. Tapping the lamp lights its five wicks one by
 * one to a bell, a zari shimmer runs along the borders and the names turn
 * gold. 3.2s. Reduced motion: all wicks lit, "View invitation".
 */
export default function KasavuIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.intros.kasavu");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [lit, setLit] = useState(0);
  const [started, setStarted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function light() {
    if (started) return;
    setStarted(true);
    onOpen();
    if (!preview) bell();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    WICKS.forEach((_, i) => at(200 + i * 260, () => setLit(i + 1)));
    at(1700, () => burst({ preset: "embers", origin: { x: 0.5, y: 0.45 } }));
    at(3200, onDone);
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const litCount = reduceMotion ? WICKS.length : lit;
  const glowing = litCount === WICKS.length;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div className={s.root} role="dialog" aria-label={t("dialogLabel")}>
      <motion.div
        className={s.cloth}
        initial={reduceMotion ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.1, ease: [0.3, 0, 0.2, 1] }}
      >
        <div className={`${s.zari} ${s.zariTop} ${started ? s.shimmer : ""}`} aria-hidden />
        <div className={`${s.zari} ${s.zariBottom} ${started ? s.shimmer : ""}`} aria-hidden />

        <div className={s.column}>
          <p className={s.eyebrow} style={{ fontFamily: fonts.caps }}>
            {t("eyebrow")}
          </p>
          <motion.h1
            className={s.names}
            style={{ fontFamily: fonts.display }}
            lang={scriptLang(namesText)}
            initial={false}
            animate={{ color: glowing ? "#9c7a1e" : "#4e3918" }}
            transition={{ duration: 0.8 }}
          >
            <span>{names.a}</span>
            {names.b !== undefined && (
              <>
                <span className={s.amp}>&amp;</span>
                <span>{names.b}</span>
              </>
            )}
          </motion.h1>
          {dateLabel && (
            <p className={s.date} style={{ fontFamily: fonts.caps }}>
              {dateLabel}
            </p>
          )}
          <button
            type="button"
            className={s.lampBtn}
            onClick={reduceMotion ? viewStatic : light}
            disabled={started}
            aria-label={reduceMotion ? t("view") : t("tapLamp")}
          >
            <Nilavilakku litCount={litCount} />
          </button>
          {reduceMotion ? (
            <button type="button" className={s.viewBtn} style={{ fontFamily: fonts.caps }} onClick={viewStatic}>
              {t("view")}
            </button>
          ) : (
            <motion.p className={s.hint} style={{ fontFamily: fonts.caps }} animate={{ opacity: started ? 0 : 1 }}>
              {t("tapLamp")}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
