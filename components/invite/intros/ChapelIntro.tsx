"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import { Bell, Candle, Dove, RoseWindow } from "../chapel/ChapelArt";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./chapel.module.css";

/** Two tolls of a church bell: a low hum with inharmonic partials and a
 * long decay. Only from the guest's tap. */
function toll() {
  playSound((ac, now) => {
    [0, 1.1].forEach((at) => {
      [
        [196, 0.07],
        [392, 0.05],
        [470.4, 0.035],
        [588, 0.025],
        [784, 0.015],
      ].forEach(([f, gain]) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        const t0 = now + at;
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6);
        o.connect(g).connect(ac.destination);
        o.start(t0);
        o.stop(t0 + 2.7);
      });
    });
  });
}

/**
 * Intro "chapel" (chapel-bells): a white chapel at dawn — bell tower, rose
 * window, arched wooden doors, lanterns by the steps. "Open invitation"
 * rings the bell, swings the doors open onto candlelight, releases doves
 * and walks in through the doorway. 2.9s. Reduced motion: no animation —
 * the button just opens the invitation.
 */
export default function ChapelIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.chapel.intro");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [opening, setOpening] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function open() {
    if (opening) return;
    setOpening(true);
    onOpen();
    if (reduceMotion) {
      onDone();
      return;
    }
    if (!preview) toll();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(900, () => burst({ preset: "pastelPetals", colors: ["#FFFFFF", "#F6E3E6", "#F3D27A"] }));
    at(1300, () => burst({ preset: "glitter", colors: ["#FFF3C4", "#F3D27A", "#FFFFFF"] }));
    at(2900, onDone);
  }

  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div className={`${s.root} ${opening ? s.opening : ""}`} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.heading}>
        <p className={s.eyebrow} style={{ fontFamily: fonts.caps }}>
          {t("eyebrow")}
        </p>
        <h1 className={s.names} style={{ fontFamily: fonts.display }} lang={scriptLang(namesText)}>
          {names.a}
          {names.b !== undefined && (
            <>
              <span className={s.amp}> &amp; </span>
              {names.b}
            </>
          )}
        </h1>
        {dateLabel && (
          <p className={s.date} style={{ fontFamily: fonts.caps }}>
            {dateLabel}
          </p>
        )}
      </div>

      <div className={s.stage} aria-hidden>
        <div className={s.chapel}>
          <div className={s.tower}>
            <span className={s.cross} />
            <div className={s.belfry}>
              <Bell className={s.bell} />
            </div>
          </div>
          <div className={s.gable} />
          <div className={s.body}>
            <RoseWindow className={s.rose} />
            <div className={s.doorway}>
              <div className={s.inside}>
                <span className={s.insideGlow} />
              </div>
              <div className={`${s.door} ${s.doorL}`}>
                <span className={s.hinge} />
                <span className={`${s.hinge} ${s.hingeLow}`} />
                <span className={s.ring} />
              </div>
              <div className={`${s.door} ${s.doorR}`}>
                <span className={s.hinge} />
                <span className={`${s.hinge} ${s.hingeLow}`} />
                <span className={s.ring} />
              </div>
            </div>
          </div>
          <div className={s.steps}>
            <span />
            <span />
          </div>
          <Candle className={`${s.lantern} ${s.lanternL}`} flameClassName={s.flame} height={30} />
          <Candle className={`${s.lantern} ${s.lanternR}`} flameClassName={s.flame} height={30} />
        </div>
      </div>
      {/* Outside the stage, so they don't zoom with the doorway. */}
      <div className={s.doves} aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Dove key={i} className={s.dove} />
        ))}
      </div>

      <div className={s.cta}>
        <button type="button" className={s.openBtn} style={{ fontFamily: fonts.caps }} onClick={open} disabled={opening}>
          {t("open")}
        </button>
        <p className={s.hint} style={{ fontFamily: fonts.caps }}>
          {t("hint")}
        </p>
      </div>
    </div>
  );
}
