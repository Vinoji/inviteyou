"use client";

import { motion } from "framer-motion";
import SceneIntro, { type Scene } from "../../intros/SceneIntro";
import { chime, softChime } from "../../intros/sceneSounds";
import type { IntroProps } from "../../intros/types";
import ArtImage from "../ArtImage";
import CinemaParticles, { type Emitter } from "./CinemaParticles";
import c from "./cinema.module.css";

/**
 * Openings of the cinematic photo templates: the template's own photograph,
 * held back (dark, dim or out of focus) until the guest taps — then the
 * light comes up and the moment's particles fly.
 */

const CANNONS: Emitter[] = [
  { x: 0, y: 1, angle: -62, spread: 16 },
  { x: 1, y: 1, angle: -118, spread: 16 },
];
const FROM_TOP: Emitter[] = [{ x: 0.5, y: -0.05, angle: 90, spread: 70 }];

function Photo({
  templateId,
  slot,
  open,
  reduce,
  from,
  to,
}: {
  templateId: string;
  slot: string;
  open: boolean;
  reduce: boolean;
  from: string;
  to: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Bleeds past the frame so a blur never shows soft dark edges. */}
      <motion.div
        style={{ position: "absolute", inset: "-6%" }}
        initial={false}
        animate={{ filter: open ? to : from }}
        transition={{ duration: reduce ? 0 : 1.4, ease: "easeOut" }}
      >
        <ArtImage templateId={templateId} slot={slot} priority className={`${c.photo} ${c.kenburns}`} />
      </motion.div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.15) 40%, rgba(0,0,0,.7))",
        }}
      />
    </div>
  );
}

/** Birthday: the room is dark — lights on, confetti cannons. */
export function PartyIntro(props: IntroProps) {
  const scene: Scene = {
    id: "photoParty",
    look: {
      bg: "#0b0710",
      ink: "#fff5fb",
      accent: "#ffd166",
      halo: "0 4px 30px rgba(0,0,0,.7)",
      button: "#ff3d8b",
      buttonInk: "#fff",
    },
    mode: "center",
    behind: (open, reduce) => (
      <>
        <Photo
          templateId={props.templateId}
          slot="cake"
          open={open}
          reduce={reduce}
          from="brightness(0.28) saturate(0.7)"
          to="brightness(1) saturate(1.05)"
        />
        {open && !reduce && <CinemaParticles kind="confetti" palette="party" mode="burst" emitters={CANNONS} className={c.particles} />}
      </>
    ),
    sound: chime,
    doneAt: 2600,
  };
  return <SceneIntro {...props} scene={scene} />;
}

/** Anniversary: candlelight comes up, rose petals fall. */
export function CandleIntro(props: IntroProps) {
  const scene: Scene = {
    id: "photoCandle",
    look: {
      bg: "#1a0609",
      ink: "#f7efe3",
      accent: "#f2cf8c",
      halo: "0 4px 30px rgba(0,0,0,.75)",
      button: "#7a1422",
      buttonInk: "#f7efe3",
    },
    mode: "center",
    behind: (open, reduce) => (
      <>
        <Photo
          templateId={props.templateId}
          slot="table"
          open={open}
          reduce={reduce}
          from="brightness(0.35) sepia(0.35)"
          to="brightness(0.95) sepia(0)"
        />
        {open && !reduce && (
          <CinemaParticles kind="petals" palette="rose" mode="burst" emitters={FROM_TOP} density={1.2} className={c.particles} />
        )}
      </>
    ),
    sound: softChime,
    doneAt: 3000,
  };
  return <SceneIntro {...props} scene={scene} />;
}

/** Baby: a soft blur comes into focus, blush petals drift. */
export function FreshIntro(props: IntroProps) {
  const scene: Scene = {
    id: "photoFresh",
    look: {
      bg: "#fffaf3",
      ink: "#fffaf3",
      accent: "#fde2e7",
      halo: "0 2px 18px rgba(60,30,40,.55)",
      button: "#e8a4b2",
      buttonInk: "#3f2a31",
    },
    mode: "center",
    behind: (open, reduce) => (
      <>
        <Photo
          templateId={props.templateId}
          slot="shoes-hand"
          open={open}
          reduce={reduce}
          from="blur(14px) brightness(0.9)"
          to="blur(0px) brightness(1)"
        />
        {open && !reduce && (
          <CinemaParticles kind="petals" palette="blush" mode="burst" emitters={FROM_TOP} className={c.particles} />
        )}
      </>
    ),
    sound: softChime,
    doneAt: 2800,
  };
  return <SceneIntro {...props} scene={scene} />;
}
