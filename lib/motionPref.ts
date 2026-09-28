"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether to tone animations down — the guest's own choice on this site,
 * not the device-wide "reduce motion" setting.
 *
 * Invitations are an animated experience, and the OS setting is switched
 * on far more often than people realise: Android's battery savers and
 * "remove animations", iOS Reduce Motion turned on to save battery. When
 * the app followed it, those guests got a static page and "the animations
 * don't work". So animations play by default, and guests whose device asks
 * for less motion are offered a "Reduce motion" switch (see MotionToggle);
 * choosing it is remembered here and applied everywhere — JS via
 * useReducedMotionPref, CSS via html[data-motion="reduced"].
 */

const KEY = "namma:motion";
const EVENT = "namma:motion-change";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "reduced";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Applies the saved choice to <html data-motion> for the CSS rules. */
export function applyMotionAttribute() {
  document.documentElement.setAttribute("data-motion", read() ? "reduced" : "full");
}

export function setReducedMotionPref(reduced: boolean) {
  try {
    if (reduced) localStorage.setItem(KEY, "reduced");
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked — the choice still applies for this page view.
  }
  document.documentElement.setAttribute("data-motion", reduced ? "reduced" : "full");
  window.dispatchEvent(new Event(EVENT));
}

/** false on the server and during hydration (so markup matches), then the
 * guest's saved choice. */
export function useReducedMotionPref(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

/** Whether the device itself asks for reduced motion — only used to decide
 * whether to offer the switch. */
export function useDeviceAsksLessMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener?.("change", cb);
      return () => mq.removeEventListener?.("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}
