"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "../intros/types";
import { playSound, useWarmAudio } from "../intros/audio";
import s from "./intro.module.css";

/** A soft, rising tanpura-like drone with a bell on top — only after the guest's tap. */
function entranceChime() {
  playSound((ac, now) => {
    [
      [146.8, 0.05, 0, 3.2],
      [220, 0.035, 0.05, 3],
      [293.7, 0.025, 0.1, 2.8],
      [880, 0.02, 0.35, 2.2],
      [1318.5, 0.012, 0.42, 1.8],
    ].forEach(([f, gain, at, len]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + at;
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + len + 0.1);
    });
  });
}

/** When each beat of the opening lands (ms). The last one shows the button. */
const BEATS = [400, 1100, 2200, 2700, 3400, 4500, 5900, 6600, 7300, 8000];
const LAST = BEATS.length;

/**
 * Intro "palaceGate" (royal-palace-3d): darkness, a few motes of gold, then
 * a palace gate appears; brass lamps light one after the other, the doors
 * swing inward, golden light pours out and the view moves through the
 * gateway into a hall of receding arches. "You are invited", the names and
 * the date follow, then "Enter the celebration". About eight seconds, with
 * "Skip intro" throughout. CSS 3D only (no WebGL), so it shows instantly
 * and plays the same in the landing-page card. Reduced motion: the final
 * frame, still.
 */
export default function PalaceIntro({ names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.palace.intro");
  const reduce = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [beat, setBeat] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    if (reduce) {
      pending.push(setTimeout(() => setBeat(LAST), 0));
    } else {
      BEATS.forEach((ms, i) => pending.push(setTimeout(() => setBeat(i + 1), ms)));
    }
    return () => pending.forEach(clearTimeout);
  }, [reduce]);

  function enter() {
    if (leaving) return;
    setLeaving(true);
    onOpen();
    if (reduce) {
      onDone();
      return;
    }
    if (!preview) entranceChime();
    burst({ preset: "glitter", colors: ["#FFF3C4", "#EBD08A", "#C9A24A"] });
    timers.current.push(setTimeout(onDone, 1100));
  }

  const at = (n: number) => beat >= n;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div
      className={`${s.root} ${leaving ? s.leaving : ""}`}
      data-beat={beat}
      role="dialog"
      aria-label={t("dialogLabel")}
      style={{ "--intro-display": fonts.display, "--intro-caps": fonts.caps } as CSSProperties}
    >
      <div className={`${s.motes} ${at(1) ? s.on : ""}`} aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ left: `${(i * 53) % 100}%`, top: `${(i * 31) % 90}%`, animationDelay: `${(i % 6) * 0.5}s` }} />
        ))}
      </div>

      {/* Beyond the gate: a hall of arches, seen once the view moves through. */}
      <div className={`${s.hall} ${at(6) ? s.on : ""}`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={s.arch} style={{ "--i": i } as CSSProperties} />
          ))}
          <span className={s.hallGlow} />
        </div>

      {/* The gate */}
      <div className={`${s.world} ${at(6) ? s.push : ""}`} aria-hidden>
        <div className={`${s.facade} ${at(2) ? s.on : ""}`}>
          <span className={s.dome} />
          <span className={`${s.chhatri} ${s.chhatriL}`} />
          <span className={`${s.chhatri} ${s.chhatriR}`} />
          <div className={s.wall}>
            <span className={s.frieze} />
            {/* Jharokha windows either side of the gate, lit from within */}
            {["l1", "l2", "r1", "r2"].map((k) => (
              <span key={k} className={`${s.jharokha} ${s[k]} ${at(4) ? s.lit : ""}`} />
            ))}
            <div className={`${s.gate} ${at(5) ? s.open : ""}`}>
              <span className={s.light} />
              <span className={`${s.door} ${s.doorL}`} />
              <span className={`${s.door} ${s.doorR}`} />
            </div>
          </div>
          <span className={`${s.lamp} ${s.lampL} ${at(3) ? s.lit : ""}`}>
            <span className={s.flame} />
          </span>
          <span className={`${s.lamp} ${s.lampR} ${at(4) ? s.lit : ""}`}>
            <span className={s.flame} />
          </span>
        </div>
      </div>

      <div className={s.copy}>
        <p className={`${s.invited} ${at(7) ? s.on : ""}`}>{t("invited")}</p>
        <h1 className={`${s.names} ${at(8) ? s.on : ""}`} lang={scriptLang(namesText)}>
          {names.a}
          {names.b !== undefined && (
            <>
              <span className={s.amp}> &amp; </span>
              {names.b}
            </>
          )}
        </h1>
        {dateLabel && <p className={`${s.date} ${at(9) ? s.on : ""}`}>{dateLabel}</p>}
        <button
          type="button"
          className={`${s.enter} ${at(LAST) ? s.on : ""}`}
          onClick={enter}
          disabled={leaving}
          tabIndex={at(LAST) ? 0 : -1}
        >
          {t("enter")}
        </button>
      </div>

      {!at(LAST) && (
        <button type="button" className={s.skip} onClick={enter}>
          {t("skip")}
        </button>
      )}
    </div>
  );
}
