"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./curtain.module.css";

/** A soft rising harp run — only ever from the guest's tap. */
function flourish() {
  playSound((ac, now) => {
    [392, 493.88, 587.33, 783.99, 987.77].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + i * 0.09;
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.06, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 1.5);
    });
  });
}

const EASE = [0.65, 0, 0.25, 1] as const;

/**
 * Intro "curtain" (silk-curtain): a stage hung with maroon silk curtains,
 * gold fringe along the hem and a gold tassel in the middle. Pulling the
 * tassel down (or tapping it) sweeps the curtains apart with a fabric-fold
 * squeeze, the couple's names rise in the footlights and gold dust falls.
 * 2.8s. Reduced motion: curtains already open and a "View invitation" button.
 */
export default function CurtainIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.intros.curtain");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [open, setOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function start() {
    if (open) return;
    setOpen(true);
    onOpen();
    if (!preview) flourish();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(700, () => burst({ preset: "glitter", colors: ["#EBD08A", "#C9A54A", "#FFF6EA"] }));
    at(2800, onDone);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 40) start();
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const opened = open || reduceMotion;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div className={s.root} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.stage}>
        <div className={s.footlight} aria-hidden />
        <motion.div
          className={s.reveal}
          initial={false}
          animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.6, ease: EASE }}
        >
          <p className={s.eyebrow} style={{ fontFamily: fonts.caps }}>
            {t("eyebrow")}
          </p>
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
      </div>

      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          className={`${s.curtain} ${side === "left" ? s.left : s.right}`}
          initial={false}
          animate={
            opened
              ? { x: side === "left" ? "-92%" : "92%", scaleX: 0.55, skewY: side === "left" ? 2 : -2 }
              : { x: "0%", scaleX: 1, skewY: 0 }
          }
          transition={{ duration: reduceMotion ? 0 : 1.6, ease: EASE }}
          style={{ originX: side === "left" ? 0 : 1 }}
          aria-hidden
        >
          <div className={s.fringe} />
        </motion.div>
      ))}
      <div className={s.valance} aria-hidden />

      {reduceMotion ? (
        <button type="button" className={s.viewBtn} style={{ fontFamily: fonts.caps }} onClick={viewStatic}>
          {t("view")}
        </button>
      ) : (
        <motion.div
          className={s.tasselWrap}
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            type="button"
            className={s.tassel}
            onClick={start}
            disabled={open}
            aria-label={t("pull")}
            drag="y"
            dragConstraints={{ top: 0, bottom: 70 }}
            dragElastic={0.2}
            dragSnapToOrigin
            onDragEnd={onDragEnd}
          >
            <span className={s.cord} />
            <span className={s.knot} />
            <span className={s.tail} />
          </motion.button>
          <p className={s.hint} style={{ fontFamily: fonts.caps }}>
            {t("pull")}
          </p>
        </motion.div>
      )}
    </div>
  );
}
