"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Wraps Framer Motion's `useReducedMotion`, which reads the device's
 * prefers-reduced-motion media query synchronously on the client's very
 * first render — a value the server can never know, so any component that
 * branches its markup on it directly hits a real hydration mismatch on
 * devices with the setting on. Until mount, this always reports `false`
 * (matching the server's assume-motion-enabled render) regardless of the
 * device's real setting; the true value takes effect right after hydration
 * completes, as an ordinary client-only re-render rather than a mismatch.
 * Same deferred-mount pattern used for the Countdown's ticking digits.
 */
export default function useSafeReducedMotion(): boolean {
  const raw = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  return mounted && Boolean(raw);
}
