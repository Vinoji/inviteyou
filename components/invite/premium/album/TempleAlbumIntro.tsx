"use client";

import { motion } from "framer-motion";
import SceneIntro, { type Scene } from "../../intros/SceneIntro";
import { templeBell } from "../../intros/sceneSounds";
import type { IntroProps } from "../../intros/types";
import { CarvedDoor, Thoranam } from "./TemplePieces";

/** Prints around the sanctum, seen once the doors open (public/library). */
const PRINTS = [
  { src: "/library/thumbs/wedding-jasmine-bride.webp", x: 4, y: 6, r: -10 },
  { src: "/library/thumbs/wedding-henna-hands.webp", x: 68, y: 8, r: 8 },
  { src: "/library/thumbs/wedding-ring-ceremony.webp", x: 2, y: 70, r: 7 },
  { src: "/library/thumbs/engagement-holding-hands.webp", x: 70, y: 72, r: -8 },
];

/**
 * Intro "templeAlbum" (temple-photo-story): carved teak temple doors under
 * a thoranam. "Ring the bell" swings them open on lamp light, with the
 * names in the sanctum and photographs around it; marigolds and jasmine fall.
 */
export default function TempleAlbumIntro(props: IntroProps) {
  const scene: Scene = {
    id: "templeAlbum",
    look: {
      bg: "radial-gradient(ellipse at 50% 55%, #fff1d2, #f3d8a4 55%, #c98f45)",
      ink: "#3b1410",
      accent: "#a3201f",
      halo: "0 0 16px #fff1d2, 0 0 30px #fff1d2",
      button: "#a3201f",
      buttonInk: "#fff4d6",
    },
    mode: "doors",
    left: <CarvedDoor />,
    right: <CarvedDoor flip />,
    top: <Thoranam style={{ display: "block", width: "100%", height: 64 }} />,
    behind: (open, reduce) => (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {PRINTS.map((p, i) => (
          <motion.div
            key={p.src}
            initial={false}
            animate={open ? { opacity: 1, scale: 1, rotate: p.r } : { opacity: 0, scale: 0.8, rotate: 0 }}
            transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : 0.9 + i * 0.12, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: "min(26cqw, 18cqh)",
              padding: "1.6% 1.6% 5%",
              background: "#fffaf0",
              boxShadow: "inset 0 0 0 2px #c9962b, 0 10px 22px -10px rgba(59,20,16,.6)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" style={{ display: "block", width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "46% 46% 3px 3px / 22% 22% 3px 3px" }} />
          </motion.div>
        ))}
      </div>
    ),
    sound: templeBell,
    bursts: [{ preset: "marigold" }, { preset: "jasmine" }],
    burstAt: 800,
    doneAt: 2700,
  };
  return <SceneIntro {...props} scene={scene} />;
}
