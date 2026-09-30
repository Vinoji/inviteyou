"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useIntroText } from "./useIntroText";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { BurstOptions } from "../particles/ParticleField";
import type { IntroProps } from "./types";
import { useWarmAudio } from "./audio";
import s from "./scene.module.css";

/**
 * One layout-style opening (the premium templates): its colours, art, how
 * the cover opens, its sound and its burst. SceneIntro does the rest — the
 * tap, timing, reduced motion, preview and a11y — so each scene file is
 * only its look. Everything is drawn in code (SVG / CSS).
 */
export interface Scene {
  /** `invite.intros.<id>` in messages: dialogLabel, eyebrow, open, view. */
  id: string;
  /** Colours: page background, text, accent (eyebrow/date), text halo, button. */
  look: { bg: string; ink: string; accent: string; halo: string; button: string; buttonInk: string };
  /**
   * How the cover opens: "doors" swing open in 3D from the sides, "slide"
   * part to the sides, "center" is a cover of its own (`cover`) that
   * animates itself open.
   */
  mode: "doors" | "slide" | "center";
  left?: ReactNode;
  right?: ReactNode;
  cover?: (open: boolean, reduce: boolean) => ReactNode;
  /** Revealed behind the names as the cover opens (a glow, a sun). */
  behind?: (open: boolean, reduce: boolean) => ReactNode;
  top?: ReactNode;
  bottom?: ReactNode;
  /** Played from the tap (never in the editor preview). */
  sound?: () => void;
  bursts?: BurstOptions[];
  /** When the bursts fire and when the intro is done, in ms from the tap. */
  burstAt?: number;
  doneAt?: number;
}

export default function SceneIntro({ scene, templateId, names, dateLabel, fonts, onOpen, onDone, burst, preview }: IntroProps & { scene: Scene }) {
  const t = useIntroText(`invite.intros.${scene.id}`, templateId);
  const reduce = useSafeReducedMotion();
  useWarmAudio(!preview && Boolean(scene.sound));
  const [open, setOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function start() {
    if (open) return;
    setOpen(true);
    onOpen();
    if (!preview) scene.sound?.();
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(scene.burstAt ?? 700, () => scene.bursts?.forEach((b) => burst(b)));
    at(scene.doneAt ?? 2800, onDone);
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const opened = open || reduce;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");
  const style = {
    "--sc-bg": scene.look.bg,
    "--sc-ink": scene.look.ink,
    "--sc-accent": scene.look.accent,
    "--sc-halo": scene.look.halo,
    "--sc-btn": scene.look.button,
    "--sc-btn-ink": scene.look.buttonInk,
  } as CSSProperties;
  const panel = { duration: reduce ? 0 : 1.5, ease: [0.65, 0, 0.3, 1] as const };

  return (
    <div className={s.root} style={style} role="dialog" aria-label={t("dialogLabel")}>
      {scene.behind && <div className={s.behind}>{scene.behind(opened, reduce)}</div>}

      <div className={s.center}>
        <p className={s.eyebrow} style={{ fontFamily: fonts.caps }}>
          {t("eyebrow")}
        </p>
        <h1 className={s.names} style={{ fontFamily: fonts.display }} lang={scriptLang(namesText)}>
          <span>{names.a}</span>
          {names.b !== undefined && (
            <>
              <span className={s.amp}>&amp;</span>
              <span>{names.b}</span>
            </>
          )}
        </h1>
        {dateLabel && (
          <p className={s.date} style={{ fontFamily: fonts.caps }}>
            {dateLabel}
          </p>
        )}
      </div>

      {scene.mode === "doors" && (
        <div className={s.doorway} aria-hidden>
          <motion.div
            className={`${s.panel} ${s.panelLeft}`}
            initial={false}
            animate={{ rotateY: opened ? -104 : 0 }}
            transition={panel}
          >
            {scene.left}
          </motion.div>
          <motion.div
            className={`${s.panel} ${s.panelRight}`}
            initial={false}
            animate={{ rotateY: opened ? 104 : 0 }}
            transition={panel}
          >
            {scene.right}
          </motion.div>
        </div>
      )}
      {scene.mode === "slide" && (
        <div className={s.doorway} aria-hidden>
          <motion.div
            className={`${s.panel} ${s.panelLeft}`}
            initial={false}
            animate={{ x: opened ? "-105%" : "0%" }}
            transition={panel}
          >
            {scene.left}
          </motion.div>
          <motion.div
            className={`${s.panel} ${s.panelRight}`}
            initial={false}
            animate={{ x: opened ? "105%" : "0%" }}
            transition={panel}
          >
            {scene.right}
          </motion.div>
        </div>
      )}
      {scene.mode === "center" && scene.cover && (
        <div className={s.cover} aria-hidden>
          {scene.cover(opened, reduce)}
        </div>
      )}

      {scene.top && (
        <div className={s.top} aria-hidden>
          {scene.top}
        </div>
      )}
      {scene.bottom && (
        <div className={s.bottom} aria-hidden>
          {scene.bottom}
        </div>
      )}

      <div className={s.actions}>
        {reduce ? (
          <button type="button" className={s.openBtn} style={{ fontFamily: fonts.caps }} onClick={viewStatic}>
            {t("view")}
          </button>
        ) : (
          <motion.button
            type="button"
            className={s.openBtn}
            style={{ fontFamily: fonts.caps }}
            onClick={start}
            disabled={open}
            animate={{ opacity: open ? 0 : 1 }}
          >
            {t("open")}
          </motion.button>
        )}
      </div>
    </div>
  );
}
