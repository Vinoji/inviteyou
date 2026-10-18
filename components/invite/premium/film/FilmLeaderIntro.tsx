"use client";

import { useEffect, useRef, useState } from "react";
import type { IntroProps } from "../../intros/types";
import { useIntroText } from "../../intros/useIntroText";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import s from "./film.module.css";

const STEP = 420;

/**
 * Intro "filmLeader" (cinematic-film): a projector's countdown leader on
 * black — the crosshair circle, the sweeping hand, grain and flicker. Tap
 * Play: 3 · 2 · 1, and the film begins.
 */
export default function FilmLeaderIntro({ templateId, onOpen, onDone }: IntroProps) {
  const t = useIntroText("invite.intros.filmLeader", templateId);
  const reduce = useSafeReducedMotion();
  const [count, setCount] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function play() {
    if (count !== null) return;
    onOpen();
    if (reduce) {
      onDone();
      return;
    }
    setCount(3);
    timers.current.push(setTimeout(() => setCount(2), STEP));
    timers.current.push(setTimeout(() => setCount(1), STEP * 2));
    timers.current.push(setTimeout(onDone, STEP * 3));
  }

  return (
    <div className={s.leader} role="dialog" aria-label={t("dialogLabel")}>
      <span className={s.grain} aria-hidden />
      <div className={s.leaderDial} aria-hidden>
        <span className={s.leaderCross} />
        {count !== null && <span key={count} className={s.leaderSweep} style={{ animationDuration: `${STEP}ms` }} />}
        <span className={s.leaderRing} />
        <span className={s.leaderNum}>{count ?? ""}</span>
      </div>
      {count === null && (
        <button type="button" className={s.playBtn} onClick={play}>
          <span className={s.playIcon} aria-hidden />
          {reduce ? t("view") : t("play")}
        </button>
      )}
    </div>
  );
}
