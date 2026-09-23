"use client";

import { Heart } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { getFontPairing } from "@/lib/fontPairings";
import { getCategory } from "@/lib/categories";
import { getTemplate } from "@/lib/templates";
import { getThemeClasses } from "./theme";
import Countdown from "./Countdown";
import HeroOrnaments from "./decor/HeroOrnaments";
import ParticlesLoader from "./decor/ParticlesLoader";
import Spotlight from "./decor/Spotlight";
import RingSceneLoader from "./decor/RingSceneLoader";
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
  const font = getFontPairing(fontPairing);
  const theme = getThemeClasses(templateId);
  const category = getCategory(getTemplate(templateId).category);
  const variant = particleVariant(templateId);
  const reduceMotion = useReducedMotion();
  const dateLabel = weddingDate
    ? new Date(weddingDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date to be announced";

  return (
    <section className="relative flex min-h-[85vh] w-full items-end overflow-hidden sm:min-h-[90vh]">
      {coverPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverPhoto}
          alt={category.singlePerson ? brideName : `${brideName} & ${groomName}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${accentColor}33, ${accentColor}11)`,
          }}
        />
      )}
      <div className={`absolute inset-0 ${theme.heroOverlay}`} />
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
          {brideName || (category.singlePerson ? "You" : "Bride")}
          {!category.singlePerson && (
            <span className="mx-3 inline-block opacity-80" style={{ color: accentColor }}>
              &amp;
            </span>
          )}
          {!category.singlePerson && (groomName || "Groom")}
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
