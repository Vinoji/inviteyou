"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { IntroProps } from "../../intros/types";
import { useIntroText } from "../../intros/useIntroText";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import { EmblemMark } from "./Ornaments";
import { printedDesign } from "./designs";
import s from "./printed.module.css";

/**
 * Intro "printedEnvelope" (the printed cards): the card's own envelope on
 * the desk — its colour, a foil seal with the tradition's emblem, the
 * couple's initials. Tap: the flap opens on its liner and the card slides
 * out, then the card itself.
 */
export default function PrintedEnvelopeIntro({ monogram, templateId, onOpen, onDone }: IntroProps) {
  const t = useIntroText("invite.intros.printedEnvelope", templateId);
  const tp = useTranslations("premium.printed");
  const reduce = useSafeReducedMotion();
  const d = printedDesign(templateId);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const initials = [monogram.a, monogram.b].filter(Boolean).join(" & ");
  const style = {
    "--desk": d.desk,
    "--envelope": d.envelope,
    "--liner": d.liner,
    "--paper-a": d.paper[0],
    "--paper-b": d.paper[1],
    "--ink": d.ink,
    "--accent": d.accent,
    "--foil": d.foil,
    "--foil-hi": d.foilHi,
  } as CSSProperties;

  function start() {
    if (open) return;
    setOpen(true);
    onOpen();
    timer.current = setTimeout(onDone, reduce ? 0 : 1400);
  }

  return (
    <div className={s.stage} style={style} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.env}>
        <div className={s.envBack} />
        <motion.div
          className={`${s.envCard} ${d.dark ? s.envCardDark : ""}`}
          initial={false}
          animate={{ y: open ? "-58%" : "0%" }}
          transition={{ duration: reduce ? 0 : 0.75, delay: reduce ? 0 : 0.3, ease: [0.3, 0, 0.2, 1] }}
        >
          <span className={s.envCardEmblem}>
            <EmblemMark emblem={d.emblem} />
          </span>
          <span className={s.envCardTitle}>{tp(`${d.wording}.title`)}</span>
          <span className={s.envCardMono}>{initials}</span>
        </motion.div>
        <div className={s.envFront} />
        <motion.div
          className={s.envFlap}
          initial={false}
          animate={open ? { rotateX: 180, transitionEnd: { zIndex: 1 } } : { rotateX: 0, zIndex: 4 }}
          transition={{ duration: reduce ? 0 : 0.45, ease: [0.5, 0, 0.3, 1] }}
        />
        <motion.button
          type="button"
          className={s.envSeal}
          onClick={start}
          aria-label={t("open")}
          disabled={open}
          initial={false}
          animate={open ? { opacity: 0, scale: 1.2 } : { opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
        >
          {d.emblem === "bismillah" ? (
            <span className={s.sealArabic} lang="ar" aria-hidden>
              بِسْمِ ٱللَّٰهِ
            </span>
          ) : (
            <EmblemMark emblem={d.emblem} />
          )}
        </motion.button>
        {!open && (
          <p className={s.envNames}>
            <b>{initials}</b>
          </p>
        )}
      </div>
      {!open && (
        <button type="button" className={s.envHint} onClick={start}>
          {reduce ? t("view") : t("open")}
        </button>
      )}
    </div>
  );
}
