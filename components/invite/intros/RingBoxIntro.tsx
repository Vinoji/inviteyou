"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./ringbox.module.css";

/** A soft music-box twinkle — only ever from the guest's tap. */
function twinkle() {
  playSound((ac, now) => {
    [1318.5, 1567.98, 1975.53, 2637.02].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + i * 0.11;
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.05, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 1.3);
    });
  });
}

/**
 * Intro "ringbox" (engagement-ring): a velvet ring box resting on blush
 * satin. A tap swings the lid open, light rays turn behind it, the ring
 * rises with a sparkle and the couple's names appear. 2.8s. Reduced
 * motion: the box already open and a "View invitation" button.
 */
export default function RingBoxIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.intros.ringbox");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [open, setOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function openBox() {
    if (open) return;
    setOpen(true);
    onOpen();
    if (!preview) twinkle();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(650, () => burst({ preset: "glitter", colors: ["#FFFFFF", "#F6D8DF", "#E8C07A"] }));
    at(900, () => burst({ preset: "pastelPetals" }));
    at(2800, onDone);
  }

  const opened = open || reduceMotion;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");
  const dur = reduceMotion ? 0 : 1;

  return (
    <div className={s.root} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.column}>
        <p className={s.eyebrow} style={{ fontFamily: fonts.caps }}>
          {t("eyebrow")}
        </p>

        <button
          type="button"
          className={s.boxBtn}
          onClick={reduceMotion ? undefined : openBox}
          disabled={open || reduceMotion}
          aria-label={t("hint")}
        >
          <motion.span
            className={s.rays}
            initial={false}
            animate={{ opacity: opened ? 1 : 0, scale: opened ? 1 : 0.4 }}
            transition={{ duration: dur * 0.9, delay: reduceMotion ? 0 : 0.35 }}
            aria-hidden
          />
          <span className={`${s.box} ${opened ? s.open : ""}`} aria-hidden>
            <span className={s.base}>
              <span className={s.cushion} />
            </span>
            <motion.svg
              viewBox="0 0 60 60"
              className={s.ring}
              initial={false}
              animate={opened ? { y: -26, scale: 1.08, opacity: 1 } : { y: 6, scale: 0.9, opacity: 0 }}
              transition={{ duration: dur * 0.9, delay: reduceMotion ? 0 : 0.35, ease: "backOut" }}
            >
              <ellipse cx="30" cy="38" rx="17" ry="15" fill="none" stroke="#E8C07A" strokeWidth="4.5" />
              <ellipse cx="30" cy="38" rx="17" ry="15" fill="none" stroke="#FFF0C9" strokeWidth="1.2" opacity="0.8" />
              <polygon points="30,8 38,17 30,26 22,17" fill="#F4FBFF" stroke="#BFE3F5" strokeWidth="1" />
              <polygon points="30,8 34,17 30,26" fill="#DDF2FB" />
            </motion.svg>
            <motion.span
              className={s.lid}
              initial={false}
              animate={{ rotateX: opened ? -118 : 0 }}
              transition={{ duration: dur, ease: [0.3, 0.9, 0.3, 1] }}
            >
              <span className={s.lidInside} />
            </motion.span>
          </span>
        </button>

        <motion.div
          className={s.text}
          initial={false}
          animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: dur * 0.8, delay: reduceMotion ? 0 : 0.9 }}
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
          !open && (
            <p className={s.hint} style={{ fontFamily: fonts.caps }}>
              {t("hint")}
            </p>
          )
        )}
      </div>
    </div>
  );
}
