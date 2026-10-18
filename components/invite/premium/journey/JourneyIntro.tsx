"use client";

import { motion } from "framer-motion";
import SceneIntro, { type Scene } from "../../intros/SceneIntro";
import { templeBell } from "../../intros/sceneSounds";
import type { IntroProps } from "../../intros/types";
import { CloudWall } from "./JourneyArt";

/**
 * Intro "templeJourney" (temple-journey): a wall of clouds. "Begin the
 * journey" parts them on a blue sky, the painted gopuram rising in the
 * distance — where the scroll journey starts — while the bell rings and
 * marigolds fall.
 */
export default function JourneyIntro(props: IntroProps) {
  const scene: Scene = {
    id: "templeJourney",
    look: {
      bg: "linear-gradient(180deg, #3f8fe0, #6fb0ee 50%, #a9d3f6)",
      ink: "#ffffff",
      accent: "#fff3c4",
      halo: "0 4px 24px rgba(20,60,110,.45)",
      button: "#b5262e",
      buttonInk: "#fff8ea",
    },
    mode: "slide",
    left: <CloudWall />,
    right: <CloudWall flip />,
    behind: (open, reduce) => (
      <motion.div
        initial={false}
        animate={{ y: open ? "0%" : "18%", opacity: open ? 1 : 0.6 }}
        transition={{ duration: reduce ? 0 : 1.8, ease: [0.3, 0, 0.2, 1] }}
        style={{ position: "absolute", left: "50%", bottom: 0, width: "min(150cqw, 70cqh)", translate: "-50% 0" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/temple-journey/gopuram.webp" alt="" style={{ display: "block", width: "100%", height: "auto" }} />
      </motion.div>
    ),
    sound: templeBell,
    bursts: [{ preset: "marigold" }],
    burstAt: 900,
    doneAt: 2600,
  };
  return <SceneIntro {...props} scene={scene} />;
}
