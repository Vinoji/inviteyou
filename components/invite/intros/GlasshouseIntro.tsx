"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import { Fern, IvyArch, Pot } from "../garden/GardenArt";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./glasshouse.module.css";

/** Garden wind chimes — a light, rising cluster. Only from the guest's tap. */
function windChime() {
  playSound((ac, now) => {
    [880, 1174.66, 1396.91, 1760, 2093].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + i * 0.09 + (i % 2) * 0.03;
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.045, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 1.7);
    });
  });
}

/** One door leaf: white-painted frame with glass panes, a brass handle. */
function Leaf({ side }: { side: "l" | "r" }) {
  return (
    <div className={`${s.leaf} ${side === "l" ? s.leafL : s.leafR}`}>
      <div className={s.panes}>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={s.pane} />
        ))}
      </div>
      <div className={s.kick} />
      <span className={s.handle} />
    </div>
  );
}

/**
 * Intro "glasshouse" (botanical-garden): a white Victorian glasshouse door
 * with ivy climbing its arch and potted ferns either side, morning light
 * behind the glass. "Open invitation" swings both doors inward, the view
 * walks through into the garden, and butterflies and petals scatter. 2.6s.
 * Reduced motion: no swing — the button just opens the invitation.
 */
export default function GlasshouseIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.garden.intro");
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
    if (!preview) windChime();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(600, () => burst({ preset: "butterflies", colors: ["#F6C453", "#F2A7B8", "#FFFFFF", "#9CC5A1"] }));
    at(900, () => burst({ preset: "pastelPetals", colors: ["#FFFFFF", "#F7D6DF", "#FBE7B5"] }));
    at(2600, onDone);
  }

  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div className={`${s.root} ${opening ? s.opening : ""}`} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.sky} aria-hidden>
        <span className={`${s.cloud} ${s.c1}`} />
        <span className={`${s.cloud} ${s.c2}`} />
      </div>

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
        <div className={s.house}>
          <div className={s.gable} />
          <div className={s.doorway}>
            <div className={s.beyond}>
              <span className={s.sun} />
              <span className={s.hedgeFar} />
              <span className={s.hedgeNear} />
            </div>
            <Leaf side="l" />
            <Leaf side="r" />
          </div>
          <IvyArch className={s.ivy} />
        </div>
        <div className={s.path} />
        <div className={`${s.potWrap} ${s.potL}`}>
          <Fern className={s.fern} />
          <Pot className={s.pot} />
        </div>
        <div className={`${s.potWrap} ${s.potR}`}>
          <Fern className={s.fern} flip />
          <Pot className={s.pot} />
        </div>
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
