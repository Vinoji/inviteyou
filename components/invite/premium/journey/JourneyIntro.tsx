"use client";

import { motion } from "framer-motion";
import SceneIntro, { type Scene } from "../../intros/SceneIntro";
import { templeBell } from "../../intros/sceneSounds";
import type { IntroProps } from "../../intros/types";
import { Cloud } from "./JourneyArt";

/** Clouds packed over the whole screen: [n, left %, top %, width %]. Each
 * drifts away from the centre on the tap, so they part like real cloud. */
const PACK: [1 | 2 | 3, number, number, number][] = [
  [1, -40, -12, 120], [2, 20, -16, 120], [3, -30, 10, 100], [1, 30, 6, 110],
  [2, -45, 30, 120], [3, 25, 28, 110], [1, -20, 46, 110], [2, 30, 50, 120],
  [3, -40, 66, 120], [1, 18, 70, 120], [2, -15, 84, 120], [3, 35, 88, 100],
  [1, 0, 20, 90], [2, -5, 58, 100],
];

/**
 * Intro "templeJourney" (temple-journey): the screen is deep in cloud. On
 * "Begin the journey" the clouds drift apart and swell past the camera,
 * the mist thins, and the real gopuram stands in a blue sky — where the
 * scroll journey starts — while the bell rings and marigolds fall.
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
        animate={{ y: open ? "0%" : "12%", scale: open ? 1 : 0.94 }}
        transition={{ duration: reduce ? 0 : 2.2, ease: [0.3, 0, 0.2, 1] }}
        style={{ position: "absolute", left: "50%", bottom: 0, width: "min(150cqw, 58cqh)", translate: "-50% 0" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/temple-journey/gopuram.webp" alt="" style={{ display: "block", width: "100%", height: "auto" }} />
      </motion.div>
    ),
    cover: (open, reduce) => (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {/* Mist between the clouds, so no sky shows until they part */}
        <motion.div
          initial={false}
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: reduce ? 0 : 1.4, delay: reduce ? 0 : 0.3 }}
          style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, #f4f8fc, #d9e6f3 70%, #bcd2ea)" }}
        />
        {PACK.map(([n, x, y, w], i) => {
          const cx = x + w / 2 - 50;
          const dir = cx === 0 ? (i % 2 ? 1 : -1) : Math.sign(cx);
          return (
            <motion.div
              key={i}
              initial={false}
              animate={open ? { x: `${dir * (90 + (i % 3) * 25)}cqw`, y: `${(y - 40) * 0.5}cqh`, scale: 1.7, opacity: 0 } : { x: 0, y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: reduce ? 0 : 2.1, delay: reduce ? 0 : (i % 4) * 0.06, ease: [0.45, 0, 0.2, 1] }}
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
