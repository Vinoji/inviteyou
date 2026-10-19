"use client";

import { motion } from "framer-motion";
import SceneIntro, { type Scene } from "../../intros/SceneIntro";
import { templeBell } from "../../intros/sceneSounds";
import type { IntroProps } from "../../intros/types";
import { Cloud } from "./JourneyArt";

/** Clouds framing the gopuram: [n, left %, top %, width %]. They leave the
 * tower and the names clear, so the closed opening (and its card on the
 * home page) shows the temple; on the tap they drift away from the centre. */
const FRAME: [1 | 2 | 3, number, number, number][] = [
  [1, -55, -8, 95], [2, 58, -10, 95], [3, -48, 22, 72], [1, 70, 26, 70],
  [2, -60, 52, 90], [3, 66, 56, 80], [1, -50, 80, 100], [2, 52, 84, 100],
  [3, 18, 92, 70],
];

/**
 * Intro "templeJourney" (temple-journey): the real gopuram stands in a blue
 * sky, framed by clouds, under the couple's names. On "Begin the journey"
 * the clouds drift apart and swell past the camera and the tower rises —
 * where the scroll journey starts — while the bell rings and marigolds fall.
 */
export default function JourneyIntro(props: IntroProps) {
  const scene: Scene = {
    id: "templeJourney",
    look: {
      bg: "linear-gradient(180deg, #3f8fe0, #6fb0ee 50%, #a9d3f6)",
      ink: "#ffffff",
      accent: "#fff3c4",
      halo: "0 4px 24px rgba(20,60,110,.55)",
      button: "#b5262e",
      buttonInk: "#fff8ea",
    },
    mode: "center",
    behind: (open, reduce) => (
      <motion.div
        initial={false}
        animate={{ y: open ? "0%" : "6%", scale: open ? 1 : 0.96 }}
        transition={{ duration: reduce ? 0 : 2.2, ease: [0.3, 0, 0.2, 1] }}
        style={{ position: "absolute", left: "50%", bottom: 0, width: "min(160cqw, 70cqh)", translate: "-50% 0" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/temple-journey/gopuram.webp" alt="" style={{ display: "block", width: "100%", height: "auto" }} />
      </motion.div>
    ),
    cover: (open, reduce) => (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {FRAME.map(([n, x, y, w], i) => {
          const dir = x + w / 2 < 50 ? -1 : 1;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={open ? { x: `${dir * (70 + (i % 3) * 20)}cqw`, scale: 1.5, opacity: 0 } : { x: 0, scale: 1, opacity: 1 }}
              transition={{ duration: reduce ? 0 : 1.9, delay: reduce ? 0 : (i % 4) * 0.05, ease: [0.45, 0, 0.2, 1] }}
              style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: `${w}%` }}
            >
              <Cloud n={n} style={{ display: "block", width: "100%", height: "auto" }} />
            </motion.div>
          );
        })}
      </div>
    ),
    sound: templeBell,
    bursts: [{ preset: "marigold" }],
    burstAt: 1000,
    doneAt: 2700,
  };
  return <SceneIntro {...props} scene={scene} />;
}
