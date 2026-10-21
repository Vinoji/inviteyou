"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { IntroProps } from "../../intros/types";
import { useIntroText } from "../../intros/useIntroText";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import { Butterfly, Emboss } from "./LilacArt";
import s from "./lilac.module.css";

/**
 * Intro "lilacSeal" (lilac-seal): a lilac envelope embossed with roses,
 * the couple's initials blind-embossed on the flap and a wax seal.
 * Tap the seal: it lifts away, the flap opens, the card rises with their
 * monogram and a butterfly flies off — then the invitation, quickly.
 */
export default function LilacSealIntro({ monogram, templateId, onOpen, onDone }: IntroProps) {
  const t = useIntroText("invite.intros.lilacSeal", templateId);
  const reduce = useSafeReducedMotion();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const initials = [monogram.a, monogram.b].filter(Boolean).join("&");

  function start() {
    if (open) return;
    setOpen(true);
    onOpen();
    timer.current = setTimeout(onDone, reduce ? 0 : 1300);
  }

  return (
    <div className={s.stage} role="dialog" aria-label={t("dialogLabel")}>
      <Emboss />
      <div className={s.envelope}>
        <div className={s.envBack} />
        <motion.div
          className={s.letter}
          initial={false}
          animate={{ y: open ? "-46%" : "0%" }}
          transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.35, ease: [0.3, 0, 0.2, 1] }}
        >
          <span className={s.letterMono}>{initials}</span>
          <span className={s.letterCaps}>{t("eyebrow")}</span>
        </motion.div>
        <div className={s.envFront}>
          <Emboss />
        </div>
        <motion.div
          className={s.envFlap}
          initial={false}
          animate={open ? { rotateX: 178, transitionEnd: { zIndex: 1 } } : { rotateX: 0, zIndex: 4 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.5, 0, 0.3, 1] }}
        >
          <Emboss />
        </motion.div>
        {!open && (
          <div className={s.envMono}>
            <b>{initials}</b>
            <span>{t("eyebrow")}</span>
          </div>
        )}
        <motion.button
          type="button"
          className={s.seal}
          onClick={start}
          aria-label={t("open")}
          initial={false}
          animate={open ? { opacity: 0, scale: 1.25, y: -30 } : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.35 }}
          disabled={open}
        >
          <span className={s.sealInitials}>{initials}</span>
        </motion.button>
        {!open && <p className={s.tapHint}>{t("open")}</p>}
        {open && !reduce && (
          <motion.div
            className={s.introFlyer}
            initial={{ x: "-50%", y: 0, opacity: 0, rotate: -10 }}
            animate={{ x: ["-50%", "40%", "160%"], y: [0, -120, -260], opacity: [0, 1, 0], rotate: [-10, 8, -4] }}
            transition={{ duration: 1.3, delay: 0.2, ease: "easeOut" }}
          >
            <Butterfly />
          </motion.div>
        )}
      </div>
      {reduce && !open && (
        <button type="button" className={s.viewBtn} onClick={start}>
          {t("view")}
        </button>
      )}
    </div>
  );
}
