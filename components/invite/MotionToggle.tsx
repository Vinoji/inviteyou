"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Waves } from "lucide-react";
import {
  applyMotionAttribute,
  setReducedMotionPref,
  useDeviceAsksLessMotion,
  useReducedMotionPref,
} from "@/lib/motionPref";

/** Puts the saved motion choice on <html> for CSS; mounted once in the layout. */
export function MotionPrefSync() {
  useEffect(() => applyMotionAttribute(), []);
  return null;
}

/**
 * "Reduce motion" switch, floating above the music button. Shown only to
 * guests whose device asks for less motion (or who already chose it), so
 * everyone else just sees the invitation.
 */
export default function MotionToggle({ accentColor }: { accentColor: string }) {
  const t = useTranslations("invite.audio");
  const reduced = useReducedMotionPref();
  const deviceAsks = useDeviceAsksLessMotion();
  if (!deviceAsks && !reduced) return null;

  return (
    <button
      type="button"
      onClick={() => setReducedMotionPref(!reduced)}
      aria-pressed={reduced}
      title={reduced ? t("playMotion") : t("reduceMotion")}
      aria-label={reduced ? t("playMotion") : t("reduceMotion")}
      style={{ color: accentColor }}
      className="fixed right-6 bottom-20 z-[70] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition-transform active:scale-90 dark:bg-neutral-900/90"
    >
      {reduced ? <Sparkles size={17} aria-hidden /> : <Waves size={17} aria-hidden />}
    </button>
  );
}
