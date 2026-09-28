"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./cradle.module.css";

/** A gentle lullaby phrase — only ever from the guest's tap. */
function lullaby() {
  playSound((ac, now) => {
    [659.25, 783.99, 659.25, 523.25, 587.33].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + i * 0.22;
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.05, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 0.7);
    });
  });
}

const STARS = [
  { x: 22, len: 18, d: 0 },
  { x: 38, len: 30, d: 0.6 },
  { x: 62, len: 24, d: 0.3 },
  { x: 78, len: 14, d: 0.9 },
];

/**
 * Intro "cradle" (baby-moon): a pastel dusk with a crescent-moon cradle and
 * a mobile of stars hanging from the top. Tapping the moon rocks it, the
 * stars glow, bubbles float up and the name appears. 2.8s. Reduced motion:
 * everything settled and a "View invitation" button.
 */
export default function CradleIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.intros.cradle");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [awake, setAwake] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function wake() {
    if (awake) return;
    setAwake(true);
    onOpen();
    if (!preview) lullaby();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(300, () => burst({ preset: "bubbles", origin: { x: 0.5, y: 0.55 } }));
    at(700, () => burst({ preset: "pastelPetals" }));
    at(2800, onDone);
  }

  const shown = awake || reduceMotion;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div className={`${s.root} ${shown ? s.awake : ""}`} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.mobile} aria-hidden>
        {STARS.map((st, i) => (
          <span key={i} className={s.string} style={{ left: `${st.x}%`, height: `${st.len}%`, animationDelay: `${st.d}s` }}>
            <svg viewBox="0 0 24 24" className={s.star}>
              <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" />
            </svg>
          </span>
        ))}
      </div>
      <div className={s.clouds} aria-hidden />

      <div className={s.column}>
        <p className={s.eyebrow} style={{ fontFamily: fonts.caps }}>
          {t("eyebrow")}
        </p>
        <motion.button
          type="button"
          className={s.moonBtn}
          onClick={reduceMotion ? undefined : wake}
          disabled={awake || reduceMotion}
          aria-label={t("hint")}
          initial={false}
          animate={awake && !reduceMotion ? { rotate: [0, -12, 10, -6, 3, 0] } : { rotate: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 120 120" className={s.moon} aria-hidden>
            <defs>
              <radialGradient id="cradle-moon" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#FFF8D6" />
                <stop offset="100%" stopColor="#F6D77A" />
              </radialGradient>
            </defs>
            <path d="M88 20a46 46 0 1 0 12 66A38 38 0 1 1 88 20z" fill="url(#cradle-moon)" />
            {/* A sleeping baby's blanket in the curve of the moon. */}
            <path d="M34 84c8 10 30 12 44 4-10-2-16-8-18-14-8 6-18 8-26 10z" fill="#F4C6D4" />
            <circle cx="40" cy="80" r="7" fill="#FFE9DA" />
          </svg>
        </motion.button>

        <motion.div
          className={s.text}
          initial={false}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.6 }}
        >
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
        </motion.div>

        {reduceMotion ? (
          <button type="button" className={s.cta} style={{ fontFamily: fonts.caps }} onClick={() => (onOpen(), onDone())}>
            {t("view")}
          </button>
        ) : (
          !awake && (
            <p className={s.hint} style={{ fontFamily: fonts.caps }}>
              {t("hint")}
            </p>
          )
        )}
      </div>
    </div>
  );
}
