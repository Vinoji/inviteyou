"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { IntroProps } from "../../intros/types";
import { useIntroText } from "../../intros/useIntroText";
import { templeBell } from "../../intros/sceneSounds";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import s from "./meenakshi.module.css";

const ART = "/art/madurai-meenakshi";

/**
 * Intro "meenakshiDoors" (madurai-meenakshi): the brass-studded doors of
 * the temple, two bells on the lintel and the couple's initials on a
 * plaque. Tap the brass knocker: the bell rings, the doors swing open onto
 * the painted gopuram in a burst of light and marigolds — then the page.
 */
export default function MeenakshiDoorsIntro({ monogram, templateId, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useIntroText("invite.intros.meenakshiDoors", templateId);
  const reduce = useSafeReducedMotion();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const initials = [monogram.a, monogram.b].filter(Boolean).join(" & ");

  function start() {
    if (open) return;
    setOpen(true);
    onOpen();
    if (!preview) templeBell();
    if (!reduce) burst({ preset: "marigold", colors: ["#f59e0b", "#f97316", "#fde68a", "#ffffff"] });
    timer.current = setTimeout(onDone, reduce ? 0 : 1500);
  }

  const swing = { duration: reduce ? 0 : 1.2, ease: [0.55, 0, 0.25, 1] as const };

  return (
    <div className={`${s.stage} ${open ? s.open : ""}`} role="dialog" aria-label={t("dialogLabel")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${ART}/gopuram.webp`} alt="" className={s.stageTemple} aria-hidden fetchPriority="high" />
      <span className={s.stageGlow} aria-hidden />
      <div className={s.doorway} aria-hidden>
        <motion.div
          className={`${s.door} ${s.doorL}`}
          initial={false}
          animate={{ rotateY: open ? -108 : 0 }}
          transition={swing}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/doors.webp`} alt="" fetchPriority="high" />
        </motion.div>
        <motion.div
          className={`${s.door} ${s.doorR}`}
          initial={false}
          animate={{ rotateY: open ? 108 : 0 }}
          transition={swing}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/doors.webp`} alt="" />
        </motion.div>
      </div>
      <div className={s.lintel} aria-hidden>
        <p className={s.lintelDeity}>{t("deity")}</p>
        <div className={s.lintelBells}>
          <span />
          <span />
        </div>
      </div>
      <motion.div
        className={s.plaque}
        initial={false}
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.92 : 1 }}
        transition={{ duration: reduce ? 0 : 0.3 }}
      >
        <p className={s.plaqueMono}>{initials}</p>
        <p className={s.plaqueEyebrow}>{t("eyebrow")}</p>
        {!reduce && (
          <button type="button" className={s.knocker} onClick={start} disabled={open} aria-label={t("open")}>
            <span aria-hidden>உ</span>
          </button>
        )}
        {!reduce && <p className={s.tapHint}>{t("open")}</p>}
      </motion.div>
      {reduce && !open && (
        <button type="button" className={s.viewBtn} onClick={start}>
          {t("view")}
        </button>
      )}
    </div>
  );
}
