"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

function getParts(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: diff <= 0 };
}

/**
 * Hydration-safe countdown. The initial value is computed identically on
 * server and client from the same targetDate; any second-or-two clock skew
 * between SSR and hydration is intentionally suppressed (suppressHydration
 * Warning below) rather than avoided with a placeholder swap, so there's no
 * layout shift. A ticking interval — subscribed in the effect, never called
 * synchronously from it — keeps it live after mount.
 *
 * Each digit does a small odometer-style tick (Framer Motion) whenever its
 * value changes, but ONLY after `mounted` flips post-hydration. That gate
 * matters: with AnimatePresence's `key={value}`, a server/client second
 * skew doesn't just mismatch text (which suppressHydrationWarning would
 * cover) — it mismatches the *element tree shape* React hydrates against,
 * which is a real hydration error, not a warning. Rendering a plain,
 * unkeyed span until mount guarantees the first client render matches the
 * server output exactly; the swap to the animated version happens after
 * hydration is already done, so it's just an ordinary re-render.
 */
export default function Countdown({ targetDate }: { targetDate: string }) {
  const t = useTranslations("invite.countdown");
  const targetMs = new Date(targetDate).getTime();
  const [parts, setParts] = useState(() => getParts(targetMs));
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  useEffect(() => {
    // Deferred into a callback rather than called synchronously in the
    // effect body — same pattern used elsewhere in this codebase.
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const units: { label: string; value: number }[] = [
    { label: t("days"), value: parts.days },
    { label: t("hours"), value: parts.hours },
    { label: t("minutes"), value: parts.minutes },
    { label: t("seconds"), value: parts.seconds },
  ];

  if (parts.done) {
    return (
      <p className="text-sm font-medium tracking-wide uppercase opacity-90">
        {t("began")}
      </p>
    );
  }

  return (
    <div
      className="grid grid-cols-4 gap-3 sm:gap-4"
      suppressHydrationWarning
    >
      {units.map((u) => (
        <div
          key={u.label}
          className="flex w-16 flex-col items-center justify-center rounded-xl bg-white/15 px-2 py-3 backdrop-blur-sm sm:w-20 sm:py-4"
        >
          <span
            className="relative block h-8 w-full overflow-hidden sm:h-9"
            suppressHydrationWarning
          >
            {reduceMotion || !mounted ? (
              <span
                className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-bold tabular-nums sm:text-3xl"
                suppressHydrationWarning
              >
                {String(u.value).padStart(2, "0")}
              </span>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={u.value}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-bold tabular-nums sm:text-3xl"
                >
                  {String(u.value).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            )}
          </span>
          <span className="mt-1 text-[10px] font-medium tracking-widest uppercase opacity-80 sm:text-xs">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
