"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, type MotionProps } from "framer-motion";
import { useMotionTheme } from "../motion/MotionThemeProvider";
import useSafeReducedMotion from "../useSafeReducedMotion";
import s from "./royal.module.css";

function getParts(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

type CountdownStyle = "flip" | "bud" | "splitFlap" | "tags";

const TILE_CLASS: Record<CountdownStyle, string> = {
  flip: s.brassTiles,
  bud: s.budTiles,
  splitFlap: s.flapTiles,
  tags: s.tagTiles,
};

/** How a digit animates in when its value changes, per countdown style. */
const DIGIT_MOTION: Record<CountdownStyle, MotionProps> = {
  // Brass temple-calendar tile flipping over.
  flip: {
    initial: { rotateX: -90, opacity: 0.4 },
    animate: { rotateX: 0, opacity: 1 },
    transition: { duration: 0.45, ease: "easeOut" },
  },
  // A bud opening.
  bud: {
    initial: { scale: 0.55, rotate: -25, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 180, damping: 12 },
  },
  // Airport split-flap: the top flap drops fast.
  splitFlap: {
    initial: { rotateX: 90, opacity: 0.6 },
    animate: { rotateX: 0, opacity: 1 },
    transition: { duration: 0.22, ease: [0.5, 0, 0.75, 0] },
    style: { transformOrigin: "50% 0" },
  },
  // A hanging driftwood tag swinging.
  tags: {
    initial: { rotate: -10 },
    animate: { rotate: [-10, 7, -4, 2, 0] },
    transition: { duration: 0.9, ease: "easeOut" },
    style: { transformOrigin: "50% -8px" },
  },
};

/** Tiled countdown for the royal hero. Same hydration approach as
 * ../Countdown: identical first render on server and client, any
 * second-level skew suppressed, then a live interval after mount. */
export default function RoyalCountdown({ targetDate }: { targetDate: string }) {
  const t = useTranslations("invite.countdown");
  const tRoyal = useTranslations("invite.royal.hero");
  const targetMs = new Date(targetDate).getTime();
  const [parts, setParts] = useState(() => getParts(targetMs));
  // moments.countdown styles the tiles and animates digits on change. Plain
  // digits until mounted so the first client render matches the server.
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const [mounted, setMounted] = useState(false);
  const style = moments?.countdown;

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (parts.done) return <p className={s.began}>{t("began")}</p>;

  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    { label: t("days"), value: String(parts.days) },
    { label: t("hours"), value: pad(parts.hours) },
    { label: t("minutes"), value: pad(parts.minutes) },
    { label: t("seconds"), value: pad(parts.seconds) },
  ];

  return (
    <div
      className={`${s.countdown} ${style ? TILE_CLASS[style] : ""}`}
      role="timer"
      aria-label={tRoyal("countdownAria")}
    >
      {units.map((u) => (
        <div key={u.label}>
          {style && mounted && !reduceMotion ? (
            <b>
              <motion.span key={u.value} className={s.flipDigit} {...DIGIT_MOTION[style]}>
                {u.value}
              </motion.span>
            </b>
          ) : (
            <b suppressHydrationWarning>{u.value}</b>
          )}
          <span>{u.label}</span>
        </div>
      ))}
    </div>
  );
}
