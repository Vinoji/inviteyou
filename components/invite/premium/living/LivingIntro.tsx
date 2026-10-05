"use client";

import { motion } from "framer-motion";
import SceneIntro, { type Scene } from "../../intros/SceneIntro";
import { chime } from "../../intros/sceneSounds";
import type { IntroProps } from "../../intros/types";
import CinemaParticles, { type Emitter } from "../cinema/CinemaParticles";
import c from "../cinema/cinema.module.css";
import DepthPhoto from "./DepthPhoto";

const FROM_TOP: Emitter[] = [{ x: 0.5, y: -0.05, angle: 90, spread: 70 }];
const UP: Emitter[] = [{ x: 0.5, y: 1.02, angle: -90, spread: 40 }];

/** Living Temple: the gopuram stands dim against the night; on the tap the
 * temple lights come up, marigold petals fall and gold sparks rise — and
 * the photo is already breathing in 3D. */
export default function LivingIntro(props: IntroProps) {
  const scene: Scene = {
    id: "livingTemple",
    look: {
      bg: "#0e0811",
      ink: "#fbf1de",
      accent: "#f0c25a",
      halo: "0 4px 30px rgba(0,0,0,.8)",
      button: "#c4262e",
      buttonInk: "#fbf1de",
    },
    mode: "center",
    behind: (open, reduce) => (
      <>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <motion.div
            style={{ position: "absolute", inset: "-4%" }}
            initial={false}
            animate={{ filter: open ? "brightness(1) saturate(1.05)" : "brightness(0.32) saturate(0.6)" }}
            transition={{ duration: reduce ? 0 : 1.6, ease: "easeOut" }}
          >
            <DepthPhoto templateId={props.templateId} slot="gopuram-night" priority strength={1.1} focus={0.55} />
          </motion.div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.1) 40%, rgba(0,0,0,.72))",
            }}
          />
        </div>
        {open && !reduce && (
          <>
            <CinemaParticles kind="petals" palette="marigold" mode="burst" emitters={FROM_TOP} density={1.2} className={c.particles} />
            <CinemaParticles kind="sparks" palette="gold" mode="burst" emitters={UP} density={1} className={c.particles} />
          </>
        )}
      </>
    ),
    sound: chime,
    doneAt: 3000,
  };
  return <SceneIntro {...props} scene={scene} />;
}
