"use client";

import { useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import MotionHeading from "../motion/MotionHeading";
import { useMotionTheme } from "../motion/MotionThemeProvider";
import { useEnterProgress } from "../motion/scroll";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { PhotoMasonry, PhotoStrip, Postcards, useWarmFilter } from "./GalleryVariants";
import s from "./royal.module.css";

/**
 * "Our Memories": by default the gallery photos as a fanned polaroid stack
 * (tap or swipe to deal the top photo to the back; thumbnails jump straight
 * to one). The template's `moments.gallery` can instead choose brass arch
 * frames ("arch"), a pinned horizontal strip ("strip"), a masonry grid
 * ("masonry") or floating postcards ("postcards"); `moments.warmPhotos`
 * warms the stack from grayscale as it reaches the screen's centre.
 */
export default function MemoryStack({ photos }: { photos: string[] }) {
  const t = useTranslations("invite.royal.memories");
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  // moments.gallery "arch": brass temple-arch frames, photos settling from a
  // slow zoom as the stack scrolls in.
  const arch = moments?.gallery === "arch";
  const enter = useEnterProgress(stackRef);
  const zoom = useTransform(enter, [0, 1], [1.12, 1]);
  const warm = useWarmFilter(stackRef, Boolean(moments?.warmPhotos) && !reduceMotion);
  if (photos.length === 0) return null;

  const head = (
    <div className={s.head}>
      <MotionHeading>{t("heading")}</MotionHeading>
      <p>{t("sub")}</p>
    </div>
  );
  if (moments?.gallery === "strip") {
    return (
      <section className={`${s.memoriesStrip} ${s.dark}`}>
        <PhotoStrip photos={photos} heading={head} />
      </section>
    );
  }
  if (moments?.gallery === "masonry" || moments?.gallery === "postcards") {
    return (
      <section className={`${s.memories} ${s.dark}`}>
        {head}
        {moments.gallery === "masonry" ? (
          <PhotoMasonry photos={photos} />
        ) : (
          <Postcards photos={photos} />
        )}
      </section>
    );
  }

  const n = photos.length;
  const go = (delta: number) => setIndex((i) => (i + delta + n) % n);

  return (
    <section className={`${s.memories} ${s.dark}`}>
      {head}
      <motion.div
        ref={stackRef}
        className={s.stack}
        style={{ filter: warm }}
        role="group"
        aria-roledescription="carousel"
        aria-label={t("carouselLabel")}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current == null) return;
          const dx = e.clientX - startX.current;
          go(Math.abs(dx) > 30 && dx > 0 ? -1 : 1);
          startX.current = null;
        }}
      >
        {photos.map((src, i) => {
          const depth = (i - index + n) % n;
          return (
            <figure
              key={src + i}
              className={`${s.polaroid} ${arch ? s.archFrame : ""}`}
              aria-hidden={depth !== 0}
              style={{
                zIndex: n - depth,
                opacity: depth > 2 ? 0 : 1,
                transform:
                  depth === 0
                    ? "rotate(-2deg)"
                    : `translate(${depth * 10}px, ${depth * 8}px) rotate(${depth * 4}deg) scale(${1 - depth * 0.04})`,
              }}
            >
              <div className={s.photoWindow}>
                <motion.img
                  src={src}
                  alt={t("photoAlt", { n: i + 1 })}
                  draggable={false}
                  style={arch && !reduceMotion ? { scale: zoom } : undefined}
                />
              </div>
            </figure>
          );
        })}
      </motion.div>
      {n > 1 && (
        <>
          <div className={s.stackNav}>
            <button
              type="button"
              className={s.round}
              aria-label={t("previous")}
              onClick={() => go(-1)}
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button type="button" className={s.round} aria-label={t("next")} onClick={() => go(1)}>
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
          <div className={s.film}>
            {photos.map((src, i) => (
              <button
                key={src + i}
                type="button"
                className={i === index ? s.filmOn : undefined}
                aria-label={t("photoAlt", { n: i + 1 })}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
