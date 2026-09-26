"use client";

import { useEffect, useState, type ReactNode } from "react";
import { INTRO_DONE_EVENT, REPLAY_INTRO_EVENT } from "../intros/events";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { useMotionTheme } from "./MotionThemeProvider";
import s from "./motion.module.css";

/**
 * Hero text that reveals with the template's heading style the moment the
 * intro finishes (INTRO_DONE_EVENT), rather than when it scrolls into view
 * — the hero is "in view" underneath the intro from the start. Replaying
 * the intro resets it. Implemented for "goldSweep"; other styles render the
 * text as-is.
 */
export default function IntroSweep({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { heading } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const done = () => setPlay(true);
    const replay = () => setPlay(false);
    window.addEventListener(INTRO_DONE_EVENT, done);
    window.addEventListener(REPLAY_INTRO_EVENT, replay);
    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, done);
      window.removeEventListener(REPLAY_INTRO_EVENT, replay);
    };
  }, []);

  if (heading !== "goldSweep" || reduceMotion) return <span className={className}>{children}</span>;
  return (
    <span className={`${className ?? ""} ${s.goldSweep} ${play ? s.goldSweepPlay : ""}`}>
      {children}
    </span>
  );
}
