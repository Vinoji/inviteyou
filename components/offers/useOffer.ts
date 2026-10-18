"use client";

import { useEffect, useState } from "react";
import { currentOffer, type ActiveOffer } from "@/lib/pricing";

/**
 * The offer in force, re-checked as time passes — so a page left open
 * moves from one festival's offer to the next (or to the usual price) on
 * its own. `now` is null until mounted: seconds would never match the
 * server's render.
 */
export function useOffer(everyMs = 1000): { now: number | null; offer: ActiveOffer | null } {
  const [now, setNow] = useState<number | null>(null);
  // Which offer to draw before the first tick (the server render's moment).
  const [first] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return { now, offer: currentOffer(now ?? first) };
}

/** Days, hours, minutes and seconds until `end`. */
export function timeLeft(end: number, now: number) {
  const left = Math.max(0, end - now);
  return {
    d: Math.floor(left / 86_400_000),
    h: Math.floor(left / 3_600_000) % 24,
    m: Math.floor(left / 60_000) % 60,
    s: Math.floor(left / 1000) % 60,
  };
}
