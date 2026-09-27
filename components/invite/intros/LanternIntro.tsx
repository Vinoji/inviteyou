"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./lantern.module.css";

/** Fixed star field — computed, not random, so server and client match. */
const STARS = Array.from({ length: 36 }, (_, i) => ({
  left: `${(i * 29) % 100}%`,
  top: `${(i * 47) % 72}%`,
  size: 1 + (i % 3),
  delay: `${(i % 7) * 0.45}s`,
}));

/** Sky lanterns rising after the lamp is lit: x position, size, timing, sway. */
const LANTERNS = Array.from({ length: 14 }, (_, i) => ({
  left: `${4 + ((i * 37) % 92)}%`,
  scale: 0.55 + ((i * 13) % 50) / 100,
  delay: `${0.2 + (i % 7) * 0.22}s`,
  duration: `${4.2 + (i % 5) * 0.5}s`,
  drift: `${((i % 5) - 2) * 14}px`,
}));

/** A warm, low temple-bell tone — only ever from a tap. */
function bell() {
  playSound((ac, now) => {
    [261.63, 523.25, 784.0].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.09 / (i + 1), now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
      o.connect(g).connect(ac.destination);
      o.start(now);
      o.stop(now + 2.7);
    });
  });
}

function Lamp({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="-60 -80 120 110" className={s.lamp} aria-hidden>
      {/* Glow behind the flame */}
      <motion.circle
        r="46"
        cy="-34"
        fill="url(#lamp-glow)"
        initial={false}
        animate={{ opacity: lit ? 1 : 0, scale: lit ? 1 : 0.3 }}
        transition={{ duration: 0.8 }}
      />
      <defs>
        <radialGradient id="lamp-glow">
          <stop offset="0" stopColor="#ffd48a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff9933" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lamp-clay" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c8642a" />
          <stop offset="1" stopColor="#7a3412" />
        </linearGradient>
      </defs>
      {/* Clay agal vilakku: a shallow bowl with a pinched spout */}
      <path d="M-44 -6 Q0 30 44 -6 Q36 -16 18 -14 L30 -26 L10 -16 Q0 -18 -10 -16 Q-30 -16 -44 -6Z" fill="url(#lamp-clay)" />
      <path d="M-44 -6 Q0 8 44 -6" fill="none" stroke="#e8a063" strokeWidth="2" />
      <ellipse cx="0" cy="-8" rx="36" ry="5" fill="#5a260d" opacity="0.6" />
      {/* Wick */}
      <line x1="24" y1="-24" x2="28" y2="-30" stroke="#3a2a1a" strokeWidth="2" strokeLinecap="round" />
      {/* Flame */}
      <motion.g
        initial={false}
        animate={{ opacity: lit ? 1 : 0, scale: lit ? 1 : 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ originX: "28px", originY: "-30px" }}
      >
        <g className={lit ? s.flicker : undefined}>
          <path d="M28 -30 C18 -42 24 -56 28 -66 C32 -56 38 -42 28 -30Z" fill="#ff9933" />
          <path d="M28 -32 C23 -40 26 -50 28 -56 C30 -50 33 -40 28 -32Z" fill="#ffe8a8" />
        </g>
      </motion.g>
    </svg>
  );
}

/**
 * Intro "lanterns" (lantern-night): a midnight sky with twinkling stars and
 * an unlit clay lamp. Tapping the lamp lights its flame with a bell tone,
 * the glow spreads, a wave of paper lanterns drifts up past the names and
 * embers rise. 3.4s. Reduced motion: the lit lamp, no lanterns, and a
 * "View invitation" button.
 */
export default function LanternIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.intros.lanterns");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [lit, setLit] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function light() {
    if (lit) return;
    setLit(true);
    onOpen();
    if (!preview) bell();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(500, () => burst({ preset: "embers", origin: { x: 0.5, y: 0.6 } }));
    at(3400, onDone);
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const on = lit || reduceMotion;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div className={`${s.root} ${on ? s.on : ""}`} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.sky} aria-hidden>
        {STARS.map((star, i) => (
          <span
            key={i}
            className={s.star}
            style={
              {
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {lit && !reduceMotion && (
        <div className={s.lanterns} aria-hidden>
          {LANTERNS.map((l, i) => (
            <span
              key={i}
              className={s.lantern}
              style={
                {
                  left: l.left,
                  animationDelay: l.delay,
                  animationDuration: l.duration,
                  "--scale": l.scale,
                  "--drift": l.drift,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className={s.column}>
        <p className={s.lead} style={{ fontFamily: fonts.display }}>
          {t("lead")}
        </p>
        <motion.h1
          className={s.names}
          style={{ fontFamily: fonts.display }}
          lang={scriptLang(namesText)}
          initial={false}
          animate={{ opacity: on ? 1 : 0.35, textShadow: on ? "0 0 28px rgba(255,212,138,0.8)" : "0 0 0 rgba(0,0,0,0)" }}
          transition={{ duration: 1, delay: reduceMotion ? 0 : 0.6 }}
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
          disabled={lit}
          aria-label={reduceMotion ? t("view") : t("tapLamp")}
        >
          <Lamp lit={on} />
        </button>
        {reduceMotion ? (
          <button type="button" className={s.viewBtn} style={{ fontFamily: fonts.caps }} onClick={viewStatic}>
            {t("view")}
          </button>
        ) : (
          <motion.p
            className={s.hint}
            style={{ fontFamily: fonts.caps }}
            animate={{ opacity: lit ? 0 : 1 }}
          >
            {t("tapLamp")}
          </motion.p>
        )}
      </div>
    </div>
  );
}
