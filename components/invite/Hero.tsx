"use client";

import { useRef } from "react";
import { Heart } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useTranslations, useFormatter } from "next-intl";
import useSafeReducedMotion from "./useSafeReducedMotion";
import { getFontPairing } from "@/lib/fontPairings";
import { getCategoryMeta } from "@/lib/i18n/categories";
import { getTemplateConfig } from "@/lib/templates";
import { getThemeClasses } from "./theme";
import Countdown from "./Countdown";
import HeroOrnaments from "./decor/HeroOrnaments";
import ParticlesLoader from "./decor/ParticlesLoader";
import Spotlight from "./decor/Spotlight";
import RingSceneLoader from "./decor/RingSceneLoader";
import Moon from "./decor/Moon";
import Clouds from "./decor/Clouds";
import HillSilhouette from "./decor/HillSilhouette";
import ParallaxLayer from "./ParallaxLayer";
import type { ParticleVariant } from "./decor/Particles";

// Only templates whose whole identity isn't "restraint" get ambient
// particles — minimal-modern and elegant-bw stay particle-free on purpose
// (they get a subtle Spotlight glow instead — see below).
function particleVariant(templateId: string): ParticleVariant | null {
  if (templateId === "traditional-gold") return "specks";
  if (templateId === "floral-pastel") return "petals";
  if (templateId === "beach-boho") return "bubbles";
  if (templateId === "anniversary-emerald") return "specks";
  if (templateId === "valentine-blush") return "petals";
  if (templateId === "proposal-starlit") return "stars";
  if (templateId === "birthday-confetti") return "confetti";
  return null;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } },
};

export default function Hero({
  groomName,
  brideName,
  weddingDate,
  accentColor,
  fontPairing,
  templateId,
  coverPhoto,
}: {
  groomName: string;
  brideName: string;
  weddingDate: string;
  accentColor: string;
  fontPairing: string;
  templateId: string;
  coverPhoto?: string;
}) {
  const t = useTranslations("invite.hero");
  const tCommon = useTranslations("common");
  const tCategories = useTranslations("categories");
  const format = useFormatter();
  const font = getFontPairing(fontPairing);
  const theme = getThemeClasses(templateId);
  const category = getCategoryMeta(getTemplateConfig(templateId).category, tCategories);
  const variant = particleVariant(templateId);
  const reduceMotion = useSafeReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const dateLabel = weddingDate
    ? format.dateTime(new Date(weddingDate), {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : t("dateTba");

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[85vh] w-full items-end overflow-hidden sm:min-h-[90vh]"
    >
      <ParallaxLayer speed={0.12} className="absolute -inset-y-8 inset-x-0">
        {coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverPhoto}
            alt={category.singlePerson ? brideName : `${brideName} & ${groomName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(160deg, ${accentColor}33, ${accentColor}11)`,
            }}
          />
        )}
      </ParallaxLayer>
      <div className={`absolute inset-0 ${theme.heroOverlay}`} />
      {templateId === "proposal-starlit" && <HillSilhouette />}
      {(templateId === "proposal-starlit" || templateId === "beach-boho") && <Clouds />}
      {templateId === "proposal-starlit" && (
        <Moon containerRef={heroRef} className="absolute top-10 right-8 sm:top-14 sm:right-14" />
      )}
      <HeroOrnaments templateId={templateId} hasPhoto={Boolean(coverPhoto)} />
      {variant && <ParticlesLoader variant={variant} accentColor={accentColor} />}
      {!variant && <Spotlight accentColor={accentColor} />}
      {templateId === "proposal-starlit" && <RingSceneLoader accentColor={accentColor} />}

      <motion.div
        className="relative z-10 w-full px-6 pb-12 text-center text-white sm:pb-16"
        variants={reduceMotion ? undefined : container}
        initial={reduceMotion ? undefined : "hidden"}
        animate={reduceMotion ? undefined : "show"}
      >
        <motion.p
          variants={item}
          className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.35em] uppercase opacity-90"
        >
          <Heart size={12} fill="currentColor" aria-hidden />
          {category.heroEyebrow}
        </motion.p>
        <motion.h1
          variants={item}
          className="mt-4 text-4xl leading-tight font-bold text-balance sm:text-6xl"
          style={{ fontFamily: font.headingVar }}
        >
          {brideName || (category.singlePerson ? tCommon("youFallback") : tCommon("brideFallback"))}
          {!category.singlePerson && (
            <span className="mx-3 inline-block opacity-80" style={{ color: accentColor }}>
              &amp;
            </span>
          )}
          {!category.singlePerson && (groomName || tCommon("groomFallback"))}
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-4 text-base font-medium opacity-95 sm:text-lg"
          style={{ fontFamily: font.bodyVar }}
        >
          {dateLabel}
        </motion.p>

        {weddingDate && category.showCountdown && (
          <motion.div variants={item} className="mt-8 flex justify-center">
            <Countdown targetDate={weddingDate} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
