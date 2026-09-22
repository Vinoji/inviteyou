"use client";

import { useEffect, useState } from "react";

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
 */
export default function Countdown({ targetDate }: { targetDate: string }) {
  const targetMs = new Date(targetDate).getTime();
  const [parts, setParts] = useState(() => getParts(targetMs));

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const units: { label: string; value: number }[] = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Sec", value: parts.seconds },
  ];

  if (parts.done) {
    return (
      <p className="text-sm font-medium tracking-wide uppercase opacity-90">
        The celebration has begun!
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
          <span className="font-serif text-2xl font-bold tabular-nums sm:text-3xl" suppressHydrationWarning>
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] font-medium tracking-widest uppercase opacity-80 sm:text-xs">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
