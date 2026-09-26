"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { getRoyalPalette, royalCssVars } from "../royal/palettes";
import { Medallion, Plant, Toran } from "../royal/Decor";
import s from "../royal/royal.module.css";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";

/** A short, soft bell chord via WebAudio — only ever triggered from a tap. */
function chime() {
  playSound((ac, now) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + i * 0.12;
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.08, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 2);
    });
  });
}

/**
 * Intro "door": a gilded palace doorway under a toran, in the template's
 * royal palette. Tapping "Open invitation" swings the doors open, zooms
 * through the doorway and showers petals in the palette's flower colours.
 */
export default function DoorIntro({
  dateLabel,
  fonts,
  accent,
  templateId,
  onOpen,
  onDone,
  burst,
  preview,
}: IntroProps) {
  const t = useTranslations("invite.royal.intro");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [opening, setOpening] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const palette = getRoyalPalette(templateId);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function handleOpen() {
    if (opening) return;
    setOpening(true);
    onOpen();
    if (!preview) chime();
    if (!reduceMotion) {
      timers.current.push(
        setTimeout(() => burst({ preset: "marigold", colors: palette.flowers }), 700)
      );
    }
    timers.current.push(setTimeout(onDone, reduceMotion ? 50 : 2700));
  }

  const style = {
    ...royalCssVars(palette, accent),
    "--rp-heading": fonts.display,
    "--rp-body": fonts.caps,
    "--rp-display": fonts.caps,
    "--rp-script": fonts.script,
    "--rp-caps": fonts.caps,
  } as CSSProperties;

  return (
    <div
      className={`${s.intro} ${opening ? s.opening : ""}`}
      style={style}
      role="dialog"
      aria-label={t("dialogLabel")}
    >
      <div className={s.introBackdrop} />
      <div className={s.stage}>
        <div className={s.wall} />
        <div className={s.beyond} />
        <div className={`${s.pillar} ${s.pillarL}`} />
        <div className={`${s.pillar} ${s.pillarR}`} />
        <div className={s.lintel} />
        <div className={s.floor} />
        <Plant palette={palette} className={`${s.plant} ${s.plantL}`} />
        <Plant palette={palette} className={`${s.plant} ${s.plantR}`} />
        <div className={s.archRim} />
        <div className={s.doorway}>
          {[s.doorL, s.doorR].map((side) => (
            <div key={side} className={`${s.door} ${side}`}>
              <div className={`${s.panel} ${s.panelTop}`} />
              <div className={`${s.panel} ${s.panelBottom}`} />
              <Medallion palette={palette} className={s.medal} />
              <div className={s.knocker} />
            </div>
          ))}
        </div>
        <div className={s.seam} />
        <Toran palette={palette} width={460} height={90} strands={12} className={s.toranDoor} />
        <div className={s.inviteText}>
          <div className={s.eyebrow}>{t("eyebrow")}</div>
          <h1>{t("title")}</h1>
          <div className={s.introSub}>{t("sub")}</div>
          {dateLabel && <div className={s.introDate}>{dateLabel}</div>}
        </div>
        <button type="button" className={s.openBtn} onClick={handleOpen}>
          {t("open")}
        </button>
      </div>
    </div>
  );
}
