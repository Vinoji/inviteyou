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

/** Relative luminance (0 black … 1 white) of a #rrggbb colour. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Intro "printedEnvelope" (the printed cards): the card's own envelope on
 * the desk, made like a real one: a folded pocket (two side flaps under a
 * bottom flap), the top flap closed with a foil wax seal carrying the
 * tradition's emblem, and the couple's initials. Tap: the flap lifts on its
 * hinge with the seal and shows its liner, the card slides up out of the
 * pocket, then comes forward in front of the envelope — then the card itself.
 */
export default function PrintedEnvelopeIntro({ monogram, templateId, onOpen, onDone }: IntroProps) {
  const t = useIntroText("invite.intros.printedEnvelope", templateId);
  const tp = useTranslations("premium.printed");
  const reduce = useSafeReducedMotion();
  const d = printedDesign(templateId);
  // 0 sealed · 1 flap lifting · 2 card sliding out · 3 card in front
  const [phase, setPhase] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const initials = [monogram.a, monogram.b].filter(Boolean).join(" & ");
  // Ivory and cream envelopes need dark ink for the initials; a pale desk,
  // a dark button.
  const light = luminance(d.envelope) > 0.55;
  const paleDesk = luminance(d.desk) > 0.45;
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
    "--seal": d.seal?.[0] ?? d.foil,
    "--seal-hi": d.seal?.[1] ?? d.foilHi,
  } as CSSProperties;
  const open = phase > 0;

  function start() {
    if (open) return;
    setPhase(1);
    onOpen();
    if (reduce) {
      timers.current.push(setTimeout(onDone, 0));
      return;
    }
    timers.current.push(
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(onDone, 2350),
    );
  }

  const ease = [0.3, 0, 0.2, 1] as const;
  const card =
    phase >= 3
      ? { y: "-4%", scale: 1.12, zIndex: 8 }
      : phase === 2
        ? { y: "-68%", scale: 1, zIndex: 2 }
        : { y: "0%", scale: 1, zIndex: 2 };

  return (
    <div className={`${s.stage} ${light ? s.envLight : ""} ${paleDesk ? s.deskLight : ""}`} style={style} role="dialog" aria-label={t("dialogLabel")}>
      <div className={`${s.env} ${phase >= 2 ? s.envFlapUp : ""} ${phase >= 3 ? s.envAway : ""}`}>
        <div className={s.envBack} />
        <motion.div
          className={`${s.envCard} ${d.dark ? s.envCardDark : ""}`}
          initial={false}
          animate={card}
          transition={{ duration: reduce ? 0 : phase >= 3 ? 0.75 : 0.85, ease }}
        >
          <span className={s.envCardEmblem}>
            <EmblemMark emblem={d.emblem} />
          </span>
          <span className={s.envCardTitle}>{tp(`${d.wording}.title`)}</span>
          <span className={s.envCardMono}>{initials}</span>
        </motion.div>
        {/* The pocket: side flaps, then the bottom flap folded over them. */}
        <svg className={s.envPocket} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path className={s.pocketLeft} d="M0 0 L50 55 L0 100 Z" />
          <path className={s.pocketRight} d="M100 0 L50 55 L100 100 Z" />
          <path className={s.pocketBottom} d="M0 100 L50 45 L100 100 Z" />
          <path className={s.pocketFold} d="M0 0 L46 50.6 M100 0 L54 50.6 M0 100 L50 45 L100 100" />
        </svg>
        {!open && <div className={s.envFlapShadow} aria-hidden><span /></div>}
        <motion.div
          className={s.envFlap}
          // Once it's up, the flap drops behind the card sliding out.
          style={{ zIndex: phase >= 2 ? 1 : 4 }}
          initial={false}
          animate={{ rotateX: open ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 0.6, ease: [0.45, 0, 0.25, 1] }}
        >
          <span className={s.flapOuter} />
          <span className={s.flapInner} />
          <button type="button" className={s.envSeal} onClick={start} aria-label={t("open")} disabled={open}>
            {d.emblem === "bismillah" ? (
              <span className={s.sealArabic} lang="ar" aria-hidden>
                بِسْمِ ٱللَّٰهِ
              </span>
            ) : (
              <EmblemMark emblem={d.emblem} />
            )}
          </button>
        </motion.div>
        {!open && (
          <p className={s.envNames}>
            <b>{initials}</b>
          </p>
        )}
      </div>
      <button type="button" className={`${s.envHint} ${open ? s.envHintGone : ""}`} onClick={start} disabled={open}>
        {reduce ? t("view") : t("open")}
      </button>
    </div>
  );
}
