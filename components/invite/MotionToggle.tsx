"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Waves } from "lucide-react";
import {
  applyMotionAttribute,
  setReducedMotionPref,
  useDeviceAsksLessMotion,
  useMotionForced,
  useSavedReducedMotion,
} from "@/lib/motionPref";

/** Puts the saved motion choice on <html> for CSS; mounted once in the layout. */
export function MotionPrefSync() {
  useEffect(() => applyMotionAttribute(), []);
  return null;
}

/**
 * "Reduce motion" switch, floating above the music button. Shown only to
 * guests whose device asks for less motion (or who already chose it), so
 * everyone else just sees the invitation. Labelled, not a bare icon: the
 * choice is remembered across the site, so it shouldn't be tapped by
 * accident, and it should be obvious how to undo. Not shown in the
 * editor, which always plays in full.
 */
export default function MotionToggle({
  accentColor,
  aboveMusic = true,
}: {
  accentColor: string;
  /** False when there's no music button to sit above. */
  aboveMusic?: boolean;
}) {
  const t = useTranslations("invite.audio");
  const reduced = useSavedReducedMotion();
  const deviceAsks = useDeviceAsksLessMotion();
  const forced = useMotionForced();
  if (forced || (!deviceAsks && !reduced)) return null;

  return (
    <button
      type="button"
      onClick={() => setReducedMotionPref(!reduced)}
      style={{ color: accentColor }}
      className={`fixed right-6 ${aboveMusic ? "bottom-20" : "bottom-5"} z-[70] flex h-10 items-center gap-1.5 rounded-full bg-white/90 px-3.5 text-xs font-semibold shadow-lg backdrop-blur transition-transform active:scale-95 dark:bg-neutral-900/90`}
    >
      {reduced ? <Sparkles size={15} aria-hidden /> : <Waves size={15} aria-hidden />}
      {reduced ? t("playMotion") : t("reduceMotion")}
    </button>
  );
}
