"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations, useFormatter } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { getThemeClasses } from "../theme";
import WaxSeal from "../decor/WaxSeal";
import MandalaMotif from "../decor/MandalaMotif";
import FloralSprig from "../decor/FloralSprig";
import HairlineDiamond from "../decor/HairlineDiamond";
import PalmFrond from "../decor/PalmFrond";
import RingMotif from "../decor/RingMotif";
import HouseMotif from "../decor/HouseMotif";
import BalloonMotif from "../decor/BalloonMotif";
import { Heart } from "lucide-react";
import type { IntroProps } from "./types";

function CardMotif({ templateId, accentColor }: { templateId: string; accentColor: string }) {
  if (templateId === "traditional-gold" || templateId === "anniversary-emerald") {
    return <MandalaMotif color={accentColor} size={40} opacity={0.9} />;
  }
  if (templateId === "floral-pastel") {
    return <FloralSprig color={accentColor} size={40} />;
  }
  if (templateId === "elegant-bw") {
    return <HairlineDiamond color={accentColor} size={18} />;
  }
  if (templateId === "beach-boho") {
    return <PalmFrond color={accentColor} size={40} />;
  }
  if (templateId === "valentine-blush") {
    return <Heart size={34} fill={accentColor} color={accentColor} />;
  }
  if (templateId === "proposal-starlit") {
    return <RingMotif color={accentColor} size={40} />;
  }
  if (templateId === "birthday-confetti") {
    return <BalloonMotif color={accentColor} size={40} />;
  }
  if (templateId === "housewarming-terracotta") {
    return <HouseMotif color={accentColor} size={40} />;
  }
  return <span className="block h-px w-10" style={{ backgroundColor: accentColor }} />;
}

/**
 * Intro "envelope": a closed card with a wax seal. Tapping the seal plays a
 * short opening transition (Framer Motion spring, so it feels like a
 * physical card sliding away rather than a CSS fade) and reveals the page
 * underneath. IntroHost handles the session skip and scroll lock.
 */
export default function EnvelopeIntro({
  names,
  weddingDate,
  fonts,
  accent: accentColor,
  templateId,
  onOpen,
  onDone,
}: IntroProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("invite.envelope");
  const format = useFormatter();
  const theme = getThemeClasses(templateId);
  const reduceMotion = useSafeReducedMotion();

  function handleOpen() {
    setOpen(true);
    onOpen();
  }

  const dateLabel = weddingDate
    ? format.dateTime(new Date(weddingDate), {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!open && (
        <motion.div
          className={`absolute inset-0 flex items-center justify-center px-6 ${theme.page}`}
          role="dialog"
          aria-label={t("dialogLabel")}
          initial={false}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="flex w-full max-w-xs flex-col items-center rounded-2xl border border-black/5 bg-[#fdfaf3] px-8 py-10 text-center shadow-2xl sm:max-w-sm"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardMotif templateId={templateId} accentColor={accentColor} />

            {dateLabel && (
              <p
                className="mt-4 text-xs font-semibold tracking-[0.3em] uppercase"
                style={{ color: accentColor }}
              >
                {dateLabel}
              </p>
            )}

            <p
              className="mt-3 text-2xl font-bold text-neutral-900 sm:text-3xl"
              style={{ fontFamily: fonts.display }}
            >
              {names.a}
            </p>
            {names.b !== undefined && (
              <>
                <span className="my-1 text-sm opacity-70" style={{ color: accentColor }}>
                  &amp;
                </span>
                <p
                  className="text-2xl font-bold text-neutral-900 sm:text-3xl"
                  style={{ fontFamily: fonts.display }}
                >
                  {names.b}
                </p>
              </>
            )}

            <div className="mt-8 w-full border-t border-dashed border-neutral-200" />

            <div className="relative mt-8 flex items-center justify-center">
              {/* Decorative glow ring, separate from the button itself — keeps
                  the actual tap target geometrically stable (no continuously
                  animating hit box) while still inviting a tap. */}
              <span
                aria-hidden
                className="motion-reduce:hidden absolute h-[72px] w-[72px] animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <button
                onClick={handleOpen}
                aria-label={t("open")}
                className="relative cursor-pointer transition-transform active:scale-90"
              >
                <WaxSeal color={accentColor} size={72} fontFamily={fonts.display} />
              </button>
            </div>
            <p className="mt-4 text-xs font-medium tracking-wide text-neutral-400 uppercase">
              {t("tapToOpen")}
            </p>
          </motion.div>

          <style>{`
            @keyframes pulse-ring {
              0% { transform: scale(1); opacity: 0.35; }
              100% { transform: scale(1.35); opacity: 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
