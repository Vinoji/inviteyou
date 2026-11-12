"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { IntroProps } from "../../intros/types";
import { useIntroText } from "../../intros/useIntroText";
import { playSound, useWarmAudio } from "../../intros/audio";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import { Bell, InvocationFrame, Thoranam } from "./Ornaments";
import { artSrc, sceneDesign } from "./scenes";
import s from "./valaikappu.module.css";

/** Glass bangles clinking, then a temple bell — only ever from the guest's tap. */
function jingle() {
  playSound((ac, now) => {
    [2093, 2637, 2349, 3136, 2794].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + i * 0.07;
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 0.4);
    });
    [523.25, 1046.5, 1568].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + 0.5;
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.06 / (i + 1), t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 2.3);
    });
  });
}

/**
 * Intro "valaikappu" (the Tamil scene cards, scenes.ts): the cream card
 * under the thoranam, the design's deity with the invocation, the names,
 * and its token (glass bangles, the thali, the kalasam). The token is
 * pressed — by IntroHost on its own, or by the guest — it rocks, the bells
 * ring, marigolds fall and the card opens. Reduced motion: a plain button.
 */
export default function ValaikappuIntro({ templateId, names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const design = sceneDesign(templateId);
  const t = useIntroText(`invite.intros.${design.ns}`, templateId);
  // a couple: the groom's name first, as Tamil cards print them
  const shownNames = names.b !== undefined ? `${names.b} & ${names.a}` : names.a;
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [open, setOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function tap() {
    if (open) return;
    setOpen(true);
    onOpen();
    if (!preview) jingle();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(250, () => burst({ preset: "glitter", origin: { x: 0.5, y: 0.62 } }));
    at(600, () => burst({ preset: "marigold" }));
    at(2400, onDone);
  }

  return (
    <motion.div
      className={`${s.stage} ${open ? s.stageOpen : ""}`}
      role="dialog"
      aria-label={t("dialogLabel")}
      initial={false}
      animate={open && !reduceMotion ? { opacity: [1, 1, 0] } : { opacity: 1 }}
      transition={{ duration: 2.3, times: [0, 0.7, 1] }}
    >
      <div className={s.stageCanopy} aria-hidden>
        <Thoranam id="vk-intro-thoranam" />
        <Bell id="vk-intro-bell-l" className={`${s.bellL} ${open ? s.ringing : ""}`} />
        <Bell id="vk-intro-bell-r" className={`${s.bellR} ${open ? s.ringing : ""}`} />
      </div>
      <div className={s.stageColumn}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artSrc(design, design.intro.top)} alt="" aria-hidden className={s.stageMurugan} fetchPriority="high" />
        <InvocationFrame>{t("invocation")}</InvocationFrame>
        <p className={s.stageTitle}>{t("title")}</p>
        <h1 className={s.stageName} style={{ fontFamily: fonts.display }} lang={scriptLang(shownNames)}>
          {shownNames}
        </h1>
        {dateLabel && (
          <p className={s.stageDate} style={{ fontFamily: fonts.caps }}>
            {dateLabel}
          </p>
        )}
        {reduceMotion ? (
          <button type="button" className={s.stageCta} onClick={() => (onOpen(), onDone())}>
            {t("view")}
          </button>
        ) : (
          <>
            <motion.button
              type="button"
              className={s.banglesBtn}
              onClick={tap}
              disabled={open}
              aria-label={t("hint")}
              initial={false}
              animate={open ? { rotate: [0, -10, 9, -6, 4, 0], scale: [1, 1.08, 1] } : { rotate: 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artSrc(design, design.intro.tap)} alt="" className={s.bangles} fetchPriority="high" />
            </motion.button>
            {!open && <p className={s.stageHint}>{t("hint")}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
}
