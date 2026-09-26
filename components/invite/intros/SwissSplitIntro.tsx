"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import type { IntroProps } from "./types";
import s from "./split.module.css";

/** Expo in-out: fast, exact, no bounce. */
const EXPO = [0.77, 0, 0.175, 1] as const;

/**
 * Intro "split" (minimal-modern): a white page; a hairline draws across the
 * middle with "Save the date" above and the date below. A tap anywhere
 * splits the screen along the line — top half up, bottom half down — while
 * the names, huge behind the gap, shrink into place; an accent underline
 * draws under "&" and a few ink dots scatter from the seam. 2.4s.
 *
 * Reduced motion: no split — the intro steps aside immediately.
 */
export default function SwissSplitIntro({
  names,
  dateLabel,
  fonts,
  accent,
  onOpen,
  onDone,
  burst,
}: IntroProps) {
  const t = useTranslations("invite.intros.split");
  const reduceMotion = useSafeReducedMotion();
  const [open, setOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!reduceMotion) return;
    onOpen();
    onDone();
  }, [reduceMotion, onOpen, onDone]);

  function split() {
    if (open) return;
    setOpen(true);
    onOpen();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(1400, () => burst({ preset: "inkDots", origin: { x: 0.5, y: 0.5 } }));
    at(2400, onDone);
  }

  if (reduceMotion) return null;

  return (
    <div className={s.root} role="dialog" aria-label={t("dialogLabel")}>
      {/* The names, huge behind the seam, settling to size as it opens. */}
      <motion.div
        className={s.names}
        style={{ fontFamily: fonts.display }}
        initial={{ scale: 3, opacity: 1 }}
        animate={open ? { scale: 1, opacity: [1, 1, 0] } : { scale: 3 }}
        transition={{
          scale: { duration: 1.1, delay: 0.3, ease: EXPO },
          opacity: { duration: 2.1, times: [0, 0.8, 1], ease: "linear" },
        }}
      >
        <span>{names.a}</span>
        {names.b !== undefined && (
          <>
            <span className={s.amp}>
              &amp;
              <motion.span
                className={s.underline}
                style={{ background: accent }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: open ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 1.0, ease: EXPO }}
              />
            </span>
            <span>{names.b}</span>
          </>
        )}
      </motion.div>

      {/* Top half */}
      <motion.div
        className={`${s.half} ${s.top}`}
        animate={{ y: open ? "-100%" : "0%" }}
        transition={{ duration: 1.0, ease: EXPO }}
      >
        <p className={s.caps} style={{ fontFamily: fonts.caps }}>
          {t("saveTheDate")}
        </p>
      </motion.div>

      {/* Bottom half */}
      <motion.div
        className={`${s.half} ${s.bottom}`}
        animate={{ y: open ? "100%" : "0%" }}
        transition={{ duration: 1.0, ease: EXPO }}
      >
        {dateLabel && (
          <p className={s.date} style={{ fontFamily: fonts.display }}>
            {dateLabel.replace(/ · /g, ".")}
          </p>
        )}
        <p className={s.hint} style={{ fontFamily: fonts.caps }}>
          {t("tapAnywhere")}
        </p>
      </motion.div>

      {/* The hairline: draws in, thickens on the tap, then parts. */}
      <motion.span
        className={s.line}
        initial={{ scaleX: 0 }}
        animate={open ? { scaleX: 1, scaleY: 2, opacity: 0 } : { scaleX: 1 }}
        transition={
          open
            ? { scaleY: { duration: 0.15 }, opacity: { duration: 0.2, delay: 0.25 } }
            : { duration: 0.9, ease: EXPO }
        }
      />

      <button
        type="button"
        className={s.tapArea}
        onClick={split}
        disabled={open}
        aria-label={t("openAria")}
      />
    </div>
  );
}
