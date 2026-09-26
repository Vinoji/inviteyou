"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";
import FloralSprig from "../decor/FloralSprig";
import { usePaneHeight, useStickyProgress, useTraverseProgress } from "../motion/scroll";
import useSafeReducedMotion from "../useSafeReducedMotion";
import s from "./royal.module.css";

/** moments.warmPhotos: a CSS filter that's grayscale (and a little dim)
 * away from the screen's centre, warming into full colour at the centre. */
export function useWarmFilter(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const p = useTraverseProgress(ref);
  return useTransform(p, (v) => {
    if (!enabled) return "none";
    const d = Math.min(1, Math.abs(v - 0.5) * 2.8);
    return `grayscale(${d}) brightness(${0.8 + 0.2 * (1 - d)})`;
  });
}

function StripPhoto({
  src,
  alt,
  i,
  n,
  progress,
}: {
  src: string;
  alt: string;
  i: number;
  n: number;
  progress: MotionValue<number>;
}) {
  const centre = n > 1 ? i / (n - 1) : 0.5;
  const filter = useTransform(progress, (p) => {
    const d = Math.min(1, Math.abs(p - centre) * (n - 1) * 1.2);
    return `grayscale(${d})`;
  });
  return (
    <motion.figure className={s.stripPhoto} style={{ filter }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} draggable={false} />
    </motion.figure>
  );
}

/** "strip": pinned for a stretch of scrolling while the photos slide past
 * horizontally, grayscale until centred. */
export function PhotoStrip({ photos, heading }: { photos: string[]; heading: React.ReactNode }) {
  const t = useTranslations("invite.royal.memories");
  const reduceMotion = useSafeReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const progress = useStickyProgress(outerRef);
  const paneHeight = usePaneHeight(outerRef, true);
  const [travel, setTravel] = useState(0);
  const x = useTransform(progress, (p) => -p * travel);

  useEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      const frame = frameRef.current;
      if (row && frame) setTravel(Math.max(0, row.scrollWidth - frame.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (rowRef.current) ro.observe(rowRef.current);
    return () => ro.disconnect();
  }, [photos.length]);

  if (reduceMotion) {
    return (
      <div className={s.stripStatic}>
        {heading}
        <div className={s.stripRowStatic}>
          {photos.map((src, i) => (
            <figure key={src + i} className={s.stripPhoto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={t("photoAlt", { n: i + 1 })} />
            </figure>
          ))}
        </div>
      </div>
    );
  }

  const frameH = paneHeight ? `${paneHeight}px` : "100dvh";
  return (
    <div ref={outerRef} style={{ height: `calc(${frameH} * ${1 + photos.length * 0.45})` }}>
      <div ref={frameRef} className={s.stripFrame} style={{ height: frameH }}>
        {heading}
        <motion.div ref={rowRef} className={s.stripRow} style={{ x }}>
          {photos.map((src, i) => (
            <StripPhoto
              key={src + i}
              src={src}
              alt={t("photoAlt", { n: i + 1 })}
              i={i}
              n={photos.length}
              progress={progress}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/** "masonry": a two-column grid; photos sharpen from a soft blur as they
 * enter, with a sprig settled on one corner. */
export function PhotoMasonry({ photos }: { photos: string[] }) {
  const t = useTranslations("invite.royal.memories");
  const reduceMotion = useSafeReducedMotion();
  return (
    <div className={s.masonry}>
      {photos.map((src, i) => (
        <motion.figure
          key={src + i}
          className={s.masonryItem}
          initial={reduceMotion ? false : { opacity: 0, filter: "blur(10px)", y: 16 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={t("photoAlt", { n: i + 1 })} />
          <FloralSprig
            color="#E79AA8"
            size={30}
            flip={i % 2 === 1}
            className={`${s.masonrySprig} ${i % 2 ? s.sprigLeft : ""}`}
          />
        </motion.figure>
      ))}
    </div>
  );
}

/** "postcards": photos drift in like postcards on water, then bob gently. */
export function Postcards({ photos }: { photos: string[] }) {
  const t = useTranslations("invite.royal.memories");
  const reduceMotion = useSafeReducedMotion();
  return (
    <div className={s.postcards}>
      {photos.map((src, i) => (
        <motion.figure
          key={src + i}
          className={s.postcard}
          style={{ rotate: i % 2 ? 3 : -3 }}
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
        >
          <div className={s.bob} style={{ animationDelay: `${-i * 0.9}s` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={t("photoAlt", { n: i + 1 })} />
          </div>
        </motion.figure>
      ))}
    </div>
  );
}
