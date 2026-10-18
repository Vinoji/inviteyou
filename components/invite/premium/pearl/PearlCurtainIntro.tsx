"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useIntroText } from "../../intros/useIntroText";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import { playSound, useWarmAudio } from "../../intros/audio";
import type { IntroProps } from "../../intros/types";
import { Curtain, PearlNames, Plaque, SageWall, Tieback, Trees } from "./PearlArt";
import s from "./pearl.module.css";

// Real fabric (three.js cloth); the drawn curtains stand in without WebGL.
const FabricCurtains = dynamic(() => import("./FabricCurtains"), { ssr: false });

/** A soft harp run, rising — only ever from the guest's tap. */
function harp() {
  playSound((ac, now) => {
    [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + 0.5 + i * 0.11;
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.05, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 1.9);
    });
  });
}

const EASE = [0.65, 0, 0.3, 1] as const;

/**
 * Intro "pearlCurtain" (pearl-curtain), in three beats:
 * 1. A sage wall of embossed leaves with an ivory plaque — gold scrollwork,
 *    pearls, "Tap to open".
 * 2. The tap splits wall and plaque down the middle; the halves slide away
 *    on ivory satin curtains strung with pearls — real cloth in three.js
 *    (FabricCurtains), falling in folds from rings on a gold rod.
 * 3. The rings slide to the sides and pearl tie-backs gather the fabric,
 *    and the names appear on linen between embroidered cypress trees.
 * Reduced motion: already open, with a "View invitation" button.
 */
export default function PearlCurtainIntro({ templateId, names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useIntroText("invite.intros.pearlCurtain", templateId);
  const reduce = useSafeReducedMotion();
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
    if (!preview) harp();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(2500, () => burst({ preset: "glitter", colors: ["#FFFFFF", "#F3ECDD", "#D9C08A"] }));
    at(4200, onDone);
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const opened = open || reduce;
  const split = { duration: reduce ? 0 : 1.15, ease: EASE };

  return (
    <div className={`${s.intro} ${s.linen}`} role="dialog" aria-label={t("dialogLabel")}>
      {/* 3 · Linen, cypress trees and the names */}
      <Trees scale={0.7} />
      <motion.div
        className={s.introNames}
        initial={false}
        animate={{ opacity: opened ? 1 : 0, y: opened ? 0 : 16 }}
        transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : 2.1 }}
      >
        <PearlNames kicker={t("eyebrow")} a={names.a} b={names.b} date={dateLabel} font={fonts.display} />
      </motion.div>

      {/* 2 · Curtains, which gather and tie back */}
      <FabricCurtains
        className={s.fabric}
        open={opened}
        instant={reduce}
        delay={0.85}
        duration={2.4}
        fallback={
          <>
            <Curtain side="left" open={opened} duration={reduce ? 0 : 1.9} delay={reduce ? 0 : 1.05} />
            <Curtain side="right" open={opened} duration={reduce ? 0 : 1.9} delay={reduce ? 0 : 1.05} />
            <Tieback side="left" show={opened} delay={reduce ? 0 : 2.6} />
            <Tieback side="right" show={opened} delay={reduce ? 0 : 2.6} />
          </>
        }
      />

      {/* 1 · Wall and plaque, in two halves that slide apart */}
      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          className={`${s.half} ${side === "left" ? s.halfLeft : s.halfRight}`}
          initial={false}
          animate={opened ? { x: side === "left" ? "-102%" : "102%" } : { x: "0%" }}
          transition={split}
          aria-hidden
        >
          <div className={s.halfInner}>
            <SageWall />
            <div className={open || reduce ? undefined : s.pulse} style={{ position: "absolute", inset: 0 }}>
              <Plaque label={t("open")} font={fonts.caps} />
            </div>
          </div>
          {opened && <span className={s.halfEdge} />}
        </motion.div>
      ))}

      {reduce ? (
        <button type="button" className={s.viewBtn} onClick={viewStatic}>
          {t("view")}
        </button>
      ) : (
        !open && <button type="button" className={s.tapBtn} onClick={start} aria-label={t("open")} />
      )}
    </div>
  );
}
