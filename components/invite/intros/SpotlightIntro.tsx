"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./spotlight.module.css";

/** A bright brass "ta-da" — only ever from the guest's tap. */
function fanfare() {
  playSound((ac, now) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + i * 0.07;
      o.type = "sawtooth";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.035, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 1.2);
    });
  });
}

// Bulbs around the marquee: top and bottom rows, then the two sides.
const ROW = 9;
const SIDE = 7;
const BULBS = [
  ...Array.from({ length: ROW }, (_, i) => ({ x: (i / (ROW - 1)) * 100, y: 0 })),
  ...Array.from({ length: SIDE }, (_, i) => ({ x: 100, y: ((i + 1) / (SIDE + 1)) * 100 })),
  ...Array.from({ length: ROW }, (_, i) => ({ x: 100 - (i / (ROW - 1)) * 100, y: 100 })),
  ...Array.from({ length: SIDE }, (_, i) => ({ x: 0, y: 100 - ((i + 1) / (SIDE + 1)) * 100 })),
];

/**
 * Intro "spotlight" (grand-reception): a dark stage, two spotlights
 * sweeping, and a marquee of bulbs chasing around the couple's names.
 * One tap and every bulb blazes, the spotlights swing onto the names and
 * gold confetti falls. 2.6s. Reduced motion: lights already on and a
 * "View invitation" button.
 */
export default function SpotlightIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.intros.spotlight");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [on, setOn] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function lightUp() {
    if (on) return;
    setOn(true);
    onOpen();
    if (!preview) fanfare();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(500, () => burst({ preset: "glitter", colors: ["#FFD66B", "#FFF3C4", "#E8A33D", "#FF6B8B"] }));
    at(2600, onDone);
  }

  const lit = on || reduceMotion;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div className={`${s.root} ${lit ? s.lit : ""}`} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.beams} aria-hidden>
        <span className={`${s.beam} ${s.beamL}`} />
        <span className={`${s.beam} ${s.beamR}`} />
      </div>

      <div className={s.column}>
        <p className={s.eyebrow} style={{ fontFamily: fonts.caps }}>
          {t("eyebrow")}
        </p>
        <div className={s.marquee}>
          {BULBS.map((b, i) => (
            <span
              key={i}
              className={s.bulb}
              style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${(i % 6) * 0.12}s` }}
              aria-hidden
            />
          ))}
          <motion.h1
            className={s.names}
            style={{ fontFamily: fonts.display }}
            lang={scriptLang(namesText)}
            initial={false}
            animate={lit ? { scale: 1, opacity: 1 } : { scale: 0.96, opacity: 0.55 }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: "easeOut" }}
          >
            <span>{names.a}</span>
            {names.b !== undefined && (
              <>
                <span className={s.amp}>&amp;</span>
                <span>{names.b}</span>
              </>
            )}
          </motion.h1>
        </div>
        {dateLabel && (
          <p className={s.date} style={{ fontFamily: fonts.caps }}>
            {dateLabel}
          </p>
        )}

        {reduceMotion ? (
          <button type="button" className={s.btn} style={{ fontFamily: fonts.caps }} onClick={() => (onOpen(), onDone())}>
            {t("view")}
          </button>
        ) : (
          <motion.button
            type="button"
            className={s.btn}
            style={{ fontFamily: fonts.caps }}
            onClick={lightUp}
            disabled={on}
            animate={{ opacity: on ? 0 : 1 }}
          >
            {t("hint")}
          </motion.button>
        )}
      </div>
    </div>
  );
}
