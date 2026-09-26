"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import type { IntroProps } from "./types";
import s from "./giftbox.module.css";

/** How far the ribbon tail can be pulled (px); past 40% it completes itself. */
const PULL = 120;

/**
 * Intro "giftbox" (elegant-bw): a matte black gift box seen from above, tied
 * with a silver satin ribbon, under a spotlight. Pull the ribbon tail
 * sideways (or tap / press Enter on the bow): the bow shrinks and the
 * ribbon slides off, the lid lifts on its back hinge, a silver card rises
 * with the names in foil, glitter rises from the box, and the view pushes
 * into the card. About 3.2s. Monochrome throughout.
 *
 * Reduced motion: the box already open with the card showing, and a "View
 * invitation" button.
 */
export default function GiftBoxIntro({ names, fonts, onOpen, onDone, burst }: IntroProps) {
  const t = useTranslations("invite.intros.giftbox");
  const reduceMotion = useSafeReducedMotion();
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0); // closed, untied, lid up, card up, push
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const started = useRef(false);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function start() {
    if (started.current) return;
    started.current = true;
    onOpen();
    setStage(1);
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(600, () => setStage(2));
    at(1100, () => setStage(3));
    at(1500, () => burst({ preset: "glitter", origin: { x: 0.5, y: 0.5 } }));
    at(2200, () => setStage(4));
    at(3200, onDone);
  }

  function onDrag(_: unknown, info: PanInfo) {
    if (info.offset.x > PULL * 0.4) start();
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const s1 = reduceMotion || stage >= 1;
  const s2 = reduceMotion || stage >= 2;
  const s3 = reduceMotion || stage >= 3;
  const monogram = [names.a, names.b ?? ""]
    .map((n) => n.trim().charAt(0))
    .filter(Boolean)
    .join(" & ");
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <motion.div
      className={s.root}
      role="dialog"
      aria-label={t("dialogLabel")}
      animate={{ opacity: stage >= 4 ? 0 : 1 }}
      transition={{ duration: 0.8, delay: stage >= 4 ? 0.2 : 0 }}
    >
      <div className={s.spotlight} aria-hidden />

      <motion.div
        className={s.scene}
        animate={{ scale: stage >= 4 ? 2.4 : 1 }}
        transition={{ duration: 1.0, ease: [0.55, 0, 0.35, 1] }}
      >
        <div className={s.box}>
          <div className={s.base} aria-hidden />
          <motion.div
            className={s.shadow}
            aria-hidden
            animate={{ opacity: s2 ? 0.8 : 0.35, scale: s2 ? 1.15 : 1 }}
            transition={{ duration: 0.7 }}
          />

          {/* The silver card rising out of the box. */}
          <motion.div
            className={s.card}
            initial={false}
            animate={
              s3 ? { y: "-10%", scale: 1, opacity: 1 } : { y: "40%", scale: 0.9, opacity: 0 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.6, ease }}
          >
            <span className={s.cardEyebrow} style={{ fontFamily: fonts.caps }}>
              {t("together")}
            </span>
            <span
              className={`${s.foil} ${s3 && !reduceMotion ? s.foilPlay : ""}`}
              style={{ fontFamily: fonts.display }}
            >
              {names.a}
              {names.b !== undefined && (
                <>
                  <br />
                  <small>&amp;</small>
                  <br />
                  {names.b}
                </>
              )}
            </span>
          </motion.div>

          {/* The lid, hinged at its back (top) edge. */}
          <motion.div
            className={s.lid}
            initial={false}
            animate={
              s2 ? { rotateX: -77, z: 120, opacity: reduceMotion ? 0 : 1 } : { rotateX: 0, z: 0 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.7, ease }}
          >
            <span className={s.monogram} style={{ fontFamily: fonts.display }}>
              {monogram}
            </span>
            {/* Ribbon bands, sliding off once untied. */}
            <motion.div
              className={s.bandV}
              initial={false}
              animate={{ y: s1 ? "-120%" : "0%", rotate: s1 ? -4 : 0, opacity: s1 ? 0 : 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.6, ease }}
            />
            <motion.div
              className={s.bandH}
              initial={false}
              animate={{ x: s1 ? "120%" : "0%", rotate: s1 ? 4 : 0, opacity: s1 ? 0 : 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.6, ease }}
            />
          </motion.div>

          {/* Bow + pull tail, over the lid until untied. */}
          {!s1 && (
            <div className={s.bowWrap}>
              <button type="button" className={s.bow} onClick={start} aria-label={t("pull")}>
                <span className={`${s.loop} ${s.loopL}`} />
                <span className={`${s.loop} ${s.loopR}`} />
                <span className={s.knot} />
              </button>
              <motion.div
                className={s.tail}
                drag="x"
                dragConstraints={{ left: 0, right: PULL }}
                dragElastic={0.1}
                dragSnapToOrigin
                onDrag={onDrag}
                aria-hidden
              >
                <span className={s.tailGrip} />
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      <div className={s.footer}>
        {reduceMotion ? (
          <button
            type="button"
            className={s.viewBtn}
            style={{ fontFamily: fonts.caps }}
            onClick={viewStatic}
          >
            {t("view")}
          </button>
        ) : (
          <motion.p
            className={s.hint}
            style={{ fontFamily: fonts.caps }}
            animate={{ opacity: stage === 0 ? 1 : 0 }}
          >
            {t("pull")}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
