"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { useIntroText } from "./useIntroText";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./ticket.module.css";

/** A quick paper-tear noise — only ever from the guest's tap. */
function tear() {
  playSound((ac, now) => {
    const len = Math.floor(ac.sampleRate * 0.25);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.5;
    const src = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    const g = ac.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 2400;
    g.gain.value = 0.35;
    src.buffer = buf;
    src.connect(filter).connect(g).connect(ac.destination);
    src.start(now);
  });
}

/**
 * Intro "ticket" (corporate-ticket): a clean event pass on a midnight grid —
 * host, "You're invited", date — with a perforated "Admit one" stub.
 * Tearing the stub off (drag, or tap) sends it spinning away, and the pass
 * lifts and glows. 2.2s. Reduced motion: the pass alone and a "View
 * invitation" button.
 */
export default function TicketIntro({ templateId, names, dateLabel, fonts, accent, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useIntroText("invite.intros.ticket", templateId);
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [torn, setTorn] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function tearOff() {
    if (torn) return;
    setTorn(true);
    onOpen();
    if (!preview) tear();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(450, () => burst({ preset: "glitter", colors: ["#FFFFFF", "#9CC9FF", accent] }));
    at(2200, onDone);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 30 || info.offset.y > 30) tearOff();
  }

  const title = [names.a, names.b].filter(Boolean).join(" & ");

  return (
    <div className={s.root} role="dialog" aria-label={t("dialogLabel")}>
      <div className={s.column}>
        <motion.div
          className={`${s.ticket} ${torn || reduceMotion ? s.glow : ""}`}
          style={{ ["--accent" as string]: accent }}
          initial={false}
          animate={torn ? { scale: 1.06, y: -8 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "backOut" }}
        >
          <div className={s.pass}>
            <p className={s.eyebrow} style={{ fontFamily: fonts.caps }}>
              {t("eyebrow")}
            </p>
            <h1 className={s.names} style={{ fontFamily: fonts.display }} lang={scriptLang(title)}>
              {title}
            </h1>
            {dateLabel && (
              <p className={s.date} style={{ fontFamily: fonts.caps }}>
                {dateLabel}
              </p>
            )}
            <div className={s.barcode} aria-hidden />
          </div>
          {!reduceMotion && (
            <motion.button
              type="button"
              className={s.stub}
              onClick={tearOff}
              disabled={torn}
              aria-label={t("hint")}
              drag={torn ? false : "x"}
              dragConstraints={{ left: 0, right: 60 }}
              dragElastic={0.3}
              dragSnapToOrigin={!torn}
              onDragEnd={onDragEnd}
              initial={false}
              animate={torn ? { x: 160, y: 320, rotate: 38, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.5, 0, 0.75, 0] }}
            >
              <span className={s.stubFace}>
                <span className={s.admit} style={{ fontFamily: fonts.caps }}>
                  {t("admitOne")}
                </span>
              </span>
            </motion.button>
          )}
        </motion.div>

        {reduceMotion ? (
          <button type="button" className={s.cta} style={{ fontFamily: fonts.caps }} onClick={() => (onOpen(), onDone())}>
            {t("view")}
          </button>
        ) : (
          !torn && (
            <p className={s.hint} style={{ fontFamily: fonts.caps }}>
              {t("hint")}
            </p>
          )
        )}
      </div>
    </div>
  );
}
