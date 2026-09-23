"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getFontPairing } from "@/lib/fontPairings";
import { getCategory } from "@/lib/categories";
import { getTemplate } from "@/lib/templates";
import { getThemeClasses } from "./theme";
import WaxSeal from "./decor/WaxSeal";
import MandalaMotif from "./decor/MandalaMotif";
import FloralSprig from "./decor/FloralSprig";
import HairlineDiamond from "./decor/HairlineDiamond";
import PalmFrond from "./decor/PalmFrond";
import RingMotif from "./decor/RingMotif";
import HouseMotif from "./decor/HouseMotif";
import BalloonMotif from "./decor/BalloonMotif";
import { Heart } from "lucide-react";

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
 * A closed-envelope splash shown once per browser session before the
 * invitation itself. Tapping the wax seal plays a short opening transition
 * (Framer Motion spring, so it feels like a physical card sliding away
 * rather than a CSS fade) and reveals the page underneath. Server always
 * renders the closed state (deterministic, no hydration mismatch); a
 * post-mount effect checks sessionStorage and — if this guest already
 * opened it this session — skips straight past it with no animation.
 */
export default function EnvelopeIntro({
  slug,
  brideName,
  groomName,
  weddingDate,
  accentColor,
  fontPairing,
  templateId,
}: {
  slug: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  accentColor: string;
  fontPairing: string;
  templateId: string;
}) {
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);

  const font = getFontPairing(fontPairing);
  const theme = getThemeClasses(templateId);
  const category = getCategory(getTemplate(templateId).category);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Deferred into a callback (rather than called synchronously in the
    // effect body) so this is a reaction to a check, not a render-blocking
    // state write — same pattern as Countdown's ticking interval.
    const t = setTimeout(() => {
      try {
        if (sessionStorage.getItem(`envelope-opened:${slug}`)) {
          setInstant(true);
          setOpen(true);
        }
      } catch {
        // sessionStorage unavailable — just show the intro every time, harmless.
      }
    }, 0);
    return () => clearTimeout(t);
  }, [slug]);

  // Lock background scroll for as long as the envelope is showing.
  // AnimatePresence owns the actual mount/unmount + exit animation now —
  // no separate timer needed to tear the overlay down.
  useEffect(() => {
    document.body.style.overflow = open ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleOpen() {
    setOpen(true);
    try {
      sessionStorage.setItem(`envelope-opened:${slug}`, "1");
    } catch {
      // Ignore — worst case the intro replays on the next page load.
    }
  }

  const dateLabel = weddingDate
    ? new Date(weddingDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center px-6 ${theme.page}`}
          initial={false}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.08, filter: "blur(6px)" }
          }
          transition={{ duration: instant ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
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
              style={{ fontFamily: font.headingVar }}
            >
              {brideName || (category.singlePerson ? "You" : "Bride")}
            </p>
            {!category.singlePerson && (
              <>
                <span className="my-1 text-sm opacity-70" style={{ color: accentColor }}>
                  &amp;
                </span>
                <p
                  className="text-2xl font-bold text-neutral-900 sm:text-3xl"
                  style={{ fontFamily: font.headingVar }}
                >
                  {groomName || "Groom"}
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
                aria-label="Open the invitation"
                className="relative cursor-pointer transition-transform active:scale-90"
              >
                <WaxSeal color={accentColor} size={72} fontFamily={font.headingVar} />
              </button>
            </div>
            <p className="mt-4 text-xs font-medium tracking-wide text-neutral-400 uppercase">
              Tap the seal to open
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
