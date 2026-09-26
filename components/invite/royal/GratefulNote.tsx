"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Scallop } from "./Decor";
import FloralSprig from "../decor/FloralSprig";
import MotionHeading from "../motion/MotionHeading";
import { useMotionTheme } from "../motion/MotionThemeProvider";
import { useTraverseProgress } from "../motion/scroll";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { useWarmFilter } from "./GalleryVariants";
import s from "./royal.module.css";

/** moments.story "wreath": a ring of flower sprigs around the portrait,
 * turning 15° as the section crosses the screen. */
function Wreath({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useSafeReducedMotion();
  const p = useTraverseProgress(ref);
  const rotate = useTransform(p, [0, 1], [-7.5, 7.5]);
  return (
    <div ref={ref} className={s.wreathWrap}>
      <motion.div className={s.wreath} style={{ rotate: reduceMotion ? 0 : rotate }} aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={s.wreathSprig} style={{ transform: `rotate(${i * 36}deg)` }}>
            <FloralSprig color="#E79AA8" size={44} flip={i % 2 === 1} />
          </span>
        ))}
      </motion.div>
      {children}
    </div>
  );
}

/** moments.story "pin": the portrait as a polaroid tacked to driftwood,
 * swinging in on its pin. */
function Pinned({ children }: { children: ReactNode }) {
  const reduceMotion = useSafeReducedMotion();
  return (
    <div className={s.pinWrap}>
      <div className={s.driftwood} aria-hidden />
      <motion.div
        className={s.pinned}
        initial={reduceMotion ? false : { rotate: -12 }}
        whileInView={{ rotate: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 60, damping: 7 }}
      >
        <span className={s.pin} aria-hidden />
        {children}
      </motion.div>
    </div>
  );
}

/** moments.story "split": the story beside the photo; the photo wipes in
 * vertically while the story's sentences unmask one by one. The in-view
 * trigger is the container: each line starts clipped inside its mask, so
 * observing the lines themselves would never fire. */
function SplitStory({ story, photo }: { story: string; photo: ReactNode }) {
  const reduceMotion = useSafeReducedMotion();
  const lines = story.split(/(?<=[.!?])\s+/).filter(Boolean);
  const ease = [0.77, 0, 0.175, 1] as const;
  return (
    <motion.div
      className={s.splitStory}
      initial={reduceMotion ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className={s.splitText}>
        {lines.map((line, i) => (
          <span key={i} className={s.splitLineMask}>
            <motion.span
              className={s.splitLine}
              variants={{ hidden: { y: "100%", opacity: 0 }, shown: { y: "0%", opacity: 1 } }}
              transition={{ duration: 0.6, ease, delay: i * 0.08 }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </div>
      <motion.div
        className={s.splitPhoto}
        variants={{
          hidden: { clipPath: "inset(100% 0 0 0)" },
          shown: { clipPath: "inset(0% 0 0 0)" },
        }}
        transition={{ duration: 1.1, ease }}
      >
        {photo}
      </motion.div>
    </motion.div>
  );
}

/**
 * "With Grateful Hearts": the couple's portrait (first uploaded photo, or a
 * monogram) with a sealed note beneath it that folds open on tap; the
 * note's body is the story text. The template's `moments.story` can frame
 * the portrait in a flower wreath ("wreath") or pin it to driftwood
 * ("pin"), or replace the note with the story set beside the photo
 * ("split"). `moments.warmPhotos` warms the portrait from grayscale.
 */
export default function GratefulNote({
  scallopColor,
  story,
  coverPhoto,
  brideName,
  groomName,
  mode,
}: {
  /** Background of the section below, so the scalloped edge blends into it. */
  scallopColor: string;
  story: string;
  coverPhoto?: string;
  brideName: string;
  groomName: string;
  mode: "preview" | "public";
}) {
  const t = useTranslations("invite.royal.note");
  const [open, setOpen] = useState(false);
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const portraitRef = useRef<HTMLDivElement>(null);
  const warm = useWarmFilter(portraitRef, Boolean(moments?.warmPhotos) && !reduceMotion);
  if (!story) return null;

  const names = [brideName, groomName].filter(Boolean).join(" & ");
  const monogram = [brideName, groomName]
    .map((n) => n.trim().charAt(0))
    .filter(Boolean)
    .join("&");
  const variant = moments?.story;

  const portrait = (
    <motion.div
      ref={portraitRef}
      className={`${s.portrait} ${variant === "pin" ? s.portraitPolaroid : ""} ${variant === "split" ? s.portraitSplit : ""}`}
      style={{ filter: warm }}
    >
      {coverPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverPhoto} alt={names} />
      ) : (
        <>
          <div className={s.mono} aria-hidden>
            {monogram}
          </div>
          {mode === "preview" && <div className={s.hint}>{t("portraitHint")}</div>}
        </>
      )}
    </motion.div>
  );

  if (variant === "split") {
    return (
      <section className={`${s.grateful} ${s.gratefulSplit}`}>
        <div className={s.eyebrow}>{t("eyebrow")}</div>
        <MotionHeading>{t("heading")}</MotionHeading>
        <SplitStory story={story} photo={portrait} />
        {names && <div className={s.sign}>{t("sign", { names })}</div>}
      </section>
    );
  }

  return (
    <section className={s.grateful}>
      <div className={s.eyebrow}>{t("eyebrow")}</div>
      <MotionHeading>{t("heading")}</MotionHeading>
      {variant === "wreath" ? (
        <Wreath>{portrait}</Wreath>
      ) : variant === "pin" ? (
        <Pinned>{portrait}</Pinned>
      ) : (
        portrait
      )}
      <div className={`${s.note} ${open ? s.noteOpen : ""}`}>
        <button
          type="button"
          className={s.noteFront}
          aria-label={t("openAria")}
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span>
            <span className={s.noteFrontTitle}>{t("open")}</span>
            <span className={s.noteFrontSub}>{t("openSub")}</span>
          </span>
        </button>
        <div className={s.noteCard}>
          <span className={s.eyebrow}>{t("to")}</span>
          <p className={s.msg}>{story}</p>
          {names && <div className={s.sign}>{t("sign", { names })}</div>}
        </div>
      </div>
      <Scallop color={scallopColor} className={s.scallop} />
    </section>
  );
}
