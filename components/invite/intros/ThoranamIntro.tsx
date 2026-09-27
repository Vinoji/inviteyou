"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./thoranam.module.css";

const LEAVES = 13;
const STRINGS = 4; // jasmine strings per side
/** Kolam dot ring around the names: 16 dots, 2 rings. */
const DOTS = Array.from({ length: 32 }, (_, i) => {
  const ring = i < 16 ? 0 : 1;
  const k = i % 16;
  const a = (k / 16) * Math.PI * 2 + ring * (Math.PI / 16);
  const r = ring === 0 ? 46 : 40;
  // Rounded: server and browser print long floats differently.
  return { cx: (50 + Math.cos(a) * r).toFixed(2), cy: (50 + Math.sin(a) * r * 0.62).toFixed(2), ring };
});

/** Nadaswaram-like rising notes — only from a tap. */
function melody() {
  playSound((ac, now) => {
    [293.66, 329.63, 392.0, 440.0, 587.33].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + i * 0.14;
      o.type = "sawtooth";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.025, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 0.6);
    });
  });
}

function MangoLeaf({ i }: { i: number }) {
  // Alternating leaves hang at slightly different lengths, like a real thoranam.
  const len = i % 2 ? 46 : 58;
  return (
    <g transform={`translate(${(i + 0.5) * (400 / LEAVES)} 8)`}>
      <path
        d={`M0 0 C-10 ${len * 0.3} -9 ${len * 0.75} 0 ${len} C9 ${len * 0.75} 10 ${len * 0.3} 0 0Z`}
        fill={i % 2 ? "#5FA043" : "#3E7A2F"}
      />
      <path d={`M0 2 L0 ${len - 4}`} stroke="#2a5520" strokeWidth="1" />
      {i % 3 === 1 && <circle cy={len + 6} r="5" fill="#E8862A" />}
    </g>
  );
}

/**
 * Intro "thoranam" (thoranam-jasmine): a Tamil wedding doorway. A mango-leaf
 * thoranam with marigolds swings down across the top and strings of malli
 * (jasmine) hang at both sides of the doorway. Tapping sweeps the jasmine
 * strings aside, kolam dots bloom around the names, jasmine and marigold
 * petals fall. 3s. Reduced motion: strings already parted, "View invitation".
 */
export default function ThoranamIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.intros.thoranam");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [open, setOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function part() {
    if (open) return;
    setOpen(true);
    onOpen();
    if (!preview) melody();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(600, () => {
      burst({ preset: "jasmine" });
      burst({ preset: "marigold", colors: ["#E8862A", "#F6CD6B", "#FFFFFF"] });
    });
    at(3000, onDone);
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const opened = open || reduceMotion;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div className={s.root} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.leafEdge} aria-hidden />
      <div className={`${s.leafEdge} ${s.leafEdgeRight}`} aria-hidden />

      <div className={s.center}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={s.kolam} aria-hidden>
          {DOTS.map((d, i) => (
            <motion.circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r="0.9"
              fill="#E0A526"
              initial={false}
              animate={{ scale: opened ? 1 : 0, opacity: opened ? 1 : 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.7 + (i % 16) * 0.04 + d.ring * 0.2 }}
            />
          ))}
        </svg>
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
      </div>

      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          className={`${s.strings} ${side === "left" ? s.stringsLeft : s.stringsRight}`}
          initial={false}
          animate={
            opened
              ? { x: side === "left" ? "-110%" : "110%", rotate: side === "left" ? -3 : 3 }
              : { x: "0%", rotate: 0 }
          }
          transition={{ duration: reduceMotion ? 0 : 1.3, ease: [0.6, 0, 0.3, 1] }}
          aria-hidden
        >
          {Array.from({ length: STRINGS }, (_, k) => (
            // Staggered lengths, like real malli strings.
            <span key={k} className={s.string} style={{ height: `${70 + ((k * 7) % 4) * 7}%` }} />
          ))}
        </motion.div>
      ))}

      <motion.svg
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        className={s.thoranam}
        initial={reduceMotion ? false : { rotate: -6, y: -40 }}
        animate={{ rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 60, damping: 6, delay: 0.2 }}
        aria-hidden
      >
        <path d="M0 8 Q200 18 400 8" stroke="#8a5a1a" strokeWidth="3" fill="none" />
        {Array.from({ length: LEAVES }, (_, i) => (
          <MangoLeaf key={i} i={i} />
        ))}
      </motion.svg>

      <div className={s.actions}>
        {reduceMotion ? (
          <button type="button" className={s.openBtn} style={{ fontFamily: fonts.caps }} onClick={viewStatic}>
            {t("view")}
          </button>
        ) : (
          <motion.button
            type="button"
            className={s.openBtn}
            style={{ fontFamily: fonts.caps }}
            onClick={part}
            disabled={open}
            animate={{ opacity: open ? 0 : 1 }}
          >
            {t("open")}
          </motion.button>
        )}
      </div>
    </div>
  );
}
