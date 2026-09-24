"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * A swipeable photo carousel — native CSS scroll-snap for the actual
 * swiping (robust touch momentum on mobile without any drag-gesture JS),
 * plus prev/next buttons and dot indicators driven off scroll position.
 * Tapping a slide opens a fullscreen lightbox.
 */
export default function Carousel({
  images,
  altPrefix,
  accentColor,
  captions,
}: {
  images: string[];
  altPrefix: string;
  accentColor: string;
  /** Optional per-image caption (e.g. "— uploaded by Kavya"), same length as images. */
  captions?: (string | undefined)[];
}) {
  const t = useTranslations("invite.carousel");
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function scrollToIndex(i: number) {
    const track = trackRef.current;
    const child = track?.children[i] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[];
        const center = track.scrollLeft + track.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        children.forEach((child, i) => {
          const dist = Math.abs(child.offsetLeft + child.clientWidth / 2 - center);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setActive(closest);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? i : Math.min(images.length - 1, i + 1)));
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? i : Math.max(0, i - 1)));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
      >
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="aspect-square w-[75%] shrink-0 snap-center overflow-hidden rounded-xl bg-neutral-100 sm:w-[42%] lg:w-[30%]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${altPrefix} ${i + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(0, active - 1))}
            disabled={active === 0}
            className="absolute top-1/2 left-1 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow disabled:opacity-30 sm:flex"
            style={{ color: accentColor }}
            aria-label={t("previous")}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.min(images.length - 1, active + 1))}
            disabled={active === images.length - 1}
            className="absolute top-1/2 right-1 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow disabled:opacity-30 sm:flex"
            style={{ color: accentColor }}
            aria-label={t("next")}
          >
            <ChevronRight size={18} />
          </button>

          <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label={t("navAria", { prefix: altPrefix })}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active === i}
                onClick={() => scrollToIndex(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: active === i ? 18 : 6,
                  backgroundColor: active === i ? accentColor : `${accentColor}40`,
                }}
                aria-label={t("goTo", { n: i + 1 })}
              />
            ))}
          </div>
        </>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightboxIndex]}
            alt={`${altPrefix} ${lightboxIndex + 1}`}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
          {captions?.[lightboxIndex] && (
            <p className="mt-3 text-sm text-white/80">{captions[lightboxIndex]}</p>
          )}
          <button
            className="absolute top-5 right-5 text-2xl text-white"
            onClick={() => setLightboxIndex(null)}
            aria-label={t("close")}
          >
            <X aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
