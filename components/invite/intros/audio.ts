"use client";

import { useEffect } from "react";

/**
 * Shared WebAudio for intro sound effects (bell, chime, cork pop).
 *
 * Creating an AudioContext is slow enough to be a long task on low-end
 * phones, and doing it inside the guest's tap delayed the intro's first
 * frames. So the context is created ahead of time, at idle, in its initial
 * suspended state (allowed without a gesture); the tap only resumes it,
 * which the gesture permits.
 */

let ctx: AudioContext | null = null;

function create(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctx();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Creates the shared context during idle time after mount. */
export function useWarmAudio(enabled: boolean) {
  useEffect(() => {
    if (!enabled || ctx) return;
    const ric =
      (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 500));
    ric(() => create());
  }, [enabled]);
}

/** Plays a sound on the shared context. Call only from a user gesture. */
export function playSound(build: (ac: AudioContext, now: number) => void) {
  const ac = create();
  if (!ac) return;
  const start = () => {
    try {
      build(ac, ac.currentTime);
    } catch {
      // A sound effect failing never blocks the intro.
    }
  };
  if (ac.state === "suspended") ac.resume().then(start, () => {});
  else start();
}
