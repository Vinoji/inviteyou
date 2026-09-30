"use client";

import { motion } from "framer-motion";
import type { LayoutStyleId } from "@/lib/layoutStyles";
import { getRoyalPalette, type RoyalPalette } from "../royal/palettes";
import { heroArt } from "../styles/heroArt";
import SceneIntro, { type Scene } from "./SceneIntro";
import { chime, flute, shehnai, softChime, templeBell } from "./sceneSounds";
import type { IntroProps } from "./types";
import s from "./scene.module.css";

/**
 * The openings of the layout-style templates (lib/layoutStyles.ts), each a
 * Scene for SceneIntro. Colours come from the template's palette and the
 * ornaments from its hero (styles/heroArt), so the opening and the
 * invitation behind it are one design.
 */

const halo = (c: string) => `0 0 16px ${c}, 0 0 30px ${c}`;
const art = (layout: LayoutStyleId, p: RoyalPalette) => heroArt(layout, p);

/* ---------- panel art ---------- */

/** Carved temple door: teak, brass studs, a hanging bell at the inner edge. */
function TempleDoor({ p, flip }: { p: RoyalPalette; flip?: boolean }) {
  return (
    <svg viewBox="0 0 200 620" preserveAspectRatio="xMidYMid slice">
      <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
        <rect width="200" height="620" fill="#4a230c" />
        <rect x="14" y="14" width="172" height="592" fill="none" stroke={p.gold} strokeWidth="4" />
        {[40, 230, 420].map((y) => (
          <rect key={y} x="30" y={y} width="140" height="160" rx="6" fill="#5c2d11" stroke={p.goldDeep} strokeWidth="3" />
        ))}
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => (
            <circle key={`${r}-${c}`} cx={48 + c * 35} cy={70 + r * 95} r="5" fill={p.goldLight} />
          ))
        )}
        <path d="M190 180 v40" stroke={p.gold} strokeWidth="2" />
        <path d="M178 220 q12 -16 24 0 v14 h-24z" fill={p.gold} />
      </g>
    </svg>
  );
}

/** Marigold strings, orange and yellow, hanging as a curtain. */
function MarigoldCurtain({ p }: { p: RoyalPalette }) {
  return (
    <svg viewBox="0 0 200 620" preserveAspectRatio="xMidYMid slice">
      {/* Solid behind the strings, so the names stay hidden until they part. */}
      <rect width="200" height="620" fill={p.deep} />
      {Array.from({ length: 11 }, (_, c) => (
        <g key={c}>
          <path d={`M${9 + c * 18.5} 0 V620`} stroke={p.leaf} strokeWidth="1.5" />
          {Array.from({ length: 36 }, (_, r) => (
            <circle key={r} cx={9 + c * 18.5} cy={8 + r * 17.5} r="8.6" fill={(r + c) % 3 ? p.flowers[0] : p.flowers[1]} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** Sandstone shutter with a jali (pierced lattice) of four-petal cut-outs. */
function JaliShutter({ p, flip }: { p: RoyalPalette; flip?: boolean }) {
  return (
    <svg viewBox="0 0 200 620" preserveAspectRatio="xMidYMid slice">
      <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
        <rect width="200" height="620" fill="#c98a4b" />
        <rect x="12" y="12" width="176" height="596" fill="none" stroke={p.gold} strokeWidth="5" />
        {Array.from({ length: 16 }, (_, r) =>
          Array.from({ length: 5 }, (_, c) => {
            const x = 36 + c * 32;
            const y = 44 + r * 36;
            return (
              <g key={`${r}-${c}`} fill="#6b3f17">
                <ellipse cx={x} cy={y - 7} rx="4" ry="7" />
                <ellipse cx={x} cy={y + 7} rx="4" ry="7" />
                <ellipse cx={x - 7} cy={y} rx="7" ry="4" />
                <ellipse cx={x + 7} cy={y} rx="7" ry="4" />
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
}

/** Emerald door with a lattice of gold eight-point stars. */
function StarDoor({ p, flip }: { p: RoyalPalette; flip?: boolean }) {
  return (
    <svg viewBox="0 0 200 620" preserveAspectRatio="xMidYMid slice">
      <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
        <rect width="200" height="620" fill={p.mid} />
        <rect x="14" y="14" width="172" height="592" fill="none" stroke={p.gold} strokeWidth="3" />
        <path d="M30 600 V170 Q30 90 110 60" fill="none" stroke={p.goldLight} strokeWidth="2" />
        {Array.from({ length: 12 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => {
            const x = 45 + c * 40;
            const y = 150 + r * 38;
            return (
              <g key={`${r}-${c}`} fill="none" stroke={p.gold} strokeWidth="1.4" opacity="0.8">
                <rect x={x - 9} y={y - 9} width="18" height="18" />
                <rect x={x - 9} y={y - 9} width="18" height="18" transform={`rotate(45 ${x} ${y})`} />
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
}

/** Terracotta panel with half of a sun-arch outline. */
function ArchPanel({ p, flip }: { p: RoyalPalette; flip?: boolean }) {
  return (
    <svg viewBox="0 0 200 620" preserveAspectRatio="xMidYMid slice">
      <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
        <rect width="200" height="620" fill={p.flowers[0]} />
        <path d="M200 120 A180 180 0 0 0 20 300 V620" fill="none" stroke={p.ivory} strokeWidth="6" />
        <path d="M200 170 A130 130 0 0 0 70 300 V620" fill="none" stroke={p.ivory} strokeWidth="2" opacity="0.6" />
      </g>
    </svg>
  );
}

/** Wine velvet in deep folds, with a gold fringe on the inner edge. */
function VelvetCurtain({ p, flip }: { p: RoyalPalette; flip?: boolean }) {
  // Stretched, not cropped: the fringe is at the inner edge.
  return (
    <svg viewBox="0 0 200 620" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`fold-${flip ? "r" : "l"}`} x1="0" x2="1">
          <stop offset="0" stopColor={p.deep} />
          <stop offset="0.5" stopColor={p.mid} />
          <stop offset="1" stopColor={p.deep} />
        </linearGradient>
      </defs>
      <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={i * 34} width="36" height="620" fill={`url(#fold-${flip ? "r" : "l"})`} />
        ))}
        <rect x="195" width="5" height="620" fill={p.gold} />
        {Array.from({ length: 62 }, (_, i) => (
          <path key={i} d={`M195 ${i * 10} l-4 5 l4 5`} fill="none" stroke={p.goldLight} strokeWidth="1" />
        ))}
      </g>
    </svg>
  );
}

/* ---------- the openings ---------- */

export function GopuramIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const scene: Scene = {
    id: "gopuram",
    look: { bg: `radial-gradient(ellipse at 50% 45%, #fff6e6, ${p.ivory2} 75%)`, ink: p.deep, accent: p.goldDeep, halo: halo("#fff6e6"), button: p.gold, buttonInk: p.deep },
    mode: "doors",
    left: <TempleDoor p={p} />,
    right: <TempleDoor p={p} flip />,
    top: art("temple", p).top,
    sound: templeBell,
    bursts: [{ preset: "marigold" }, { preset: "jasmine" }],
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function MarigoldCurtainIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const scene: Scene = {
    id: "marigoldCurtain",
    look: { bg: `radial-gradient(ellipse at 50% 45%, ${p.ivory}, ${p.ivory2} 80%)`, ink: p.deep, accent: p.goldDeep, halo: halo(p.ivory), button: p.deep, buttonInk: p.goldLight },
    mode: "slide",
    left: <MarigoldCurtain p={p} />,
    right: <MarigoldCurtain p={p} />,
    top: art("mandap", p).top,
    sound: shehnai,
    bursts: [{ preset: "marigold", colors: [p.flowers[0], p.flowers[1], p.flowers[2]] }],
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function JharokhaIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const scene: Scene = {
    id: "jharokha",
    look: { bg: `radial-gradient(ellipse at 50% 45%, ${p.ivory}, ${p.ivory2} 80%)`, ink: p.deep, accent: p.goldDeep, halo: halo(p.ivory), button: p.deep, buttonInk: p.goldLight },
    mode: "doors",
    left: <JaliShutter p={p} />,
    right: <JaliShutter p={p} flip />,
    top: art("palace", p).top,
    sound: chime,
    bursts: [{ preset: "glitter" }],
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function LotusBloomIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  // Outer petals first, so the inner ones sit on top.
  const petals = [-66, 66, -44, 44, -22, 22, 0];
  const scene: Scene = {
    id: "lotusBloom",
    look: { bg: `linear-gradient(180deg, #f6f1ea, ${p.ivory} 55%, #e4efe9)`, ink: p.deep, accent: p.goldDeep, halo: halo(p.ivory), button: p.deep, buttonInk: p.goldLight },
    mode: "center",
    // A closed lotus bud standing over the names; its petals fan open from
    // the base and fall away.
    cover: (open, reduce) => (
      <svg viewBox="-200 -200 400 400" style={{ position: "absolute", left: "50%", top: "50%", width: "min(120cqw, 76cqh)", height: "min(120cqw, 76cqh)", translate: "-50% -46%", overflow: "visible" }}>
        {petals.map((a, i) => (
          <motion.path
            key={a}
            d="M0 150 C-150 80 -120 -80 0 -165 C120 -80 150 80 0 150Z"
            fill={a === 0 ? p.flowers[0] : i % 2 ? p.flowers[1] : p.flowers[0]}
            stroke="#fff"
            strokeWidth="2.5"
            initial={false}
            animate={open ? { rotate: a * 2.1, scale: 1.25, opacity: 0 } : { rotate: a * 0.34, scale: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 1.7, delay: reduce ? 0 : (6 - i) * 0.06, ease: "easeInOut" }}
            style={{ transformOrigin: "0px 150px" }}
          />
        ))}
        <path d="M-40 150 Q0 170 40 150" fill="none" stroke={p.leaf} strokeWidth="6" strokeLinecap="round" />
      </svg>
    ),
    top: art("lotus", p).top,
    bottom: art("lotus", p).bottom,
    sound: flute,
    bursts: [{ preset: "pastelPetals" }],
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function MughalDoorsIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const scene: Scene = {
    id: "mughalDoors",
    look: { bg: `radial-gradient(ellipse at 50% 45%, ${p.ivory}, ${p.ivory2} 85%)`, ink: p.deep, accent: p.goldDeep, halo: halo(p.ivory), button: p.gold, buttonInk: p.deep },
    mode: "slide",
    left: <StarDoor p={p} />,
    right: <StarDoor p={p} flip />,
    top: art("nikah", p).top,
    sound: softChime,
    bursts: [{ preset: "glitter", colors: [p.goldLight, "#ffffff", p.gold] }],
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function MoonLanternsIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const lanterns = [18, 50, 82];
  const scene: Scene = {
    id: "moonLanterns",
    look: { bg: `linear-gradient(180deg, #050b1c, ${p.deep} 55%, ${p.mid})`, ink: "#f5f0e0", accent: p.goldLight, halo: halo(p.deep), button: p.gold, buttonInk: p.deep },
    mode: "center",
    // A night veil with three lanterns: they brighten and float up as it lifts.
    cover: (open, reduce) => (
      <>
        <motion.div
          initial={false}
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: reduce ? 0 : 1.4, delay: reduce ? 0 : 0.5 }}
          style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 60%, ${p.mid}, #030712)` }}
        />
        {lanterns.map((x, i) => (
          <motion.svg
            key={x}
            viewBox="-20 -60 40 110"
            initial={false}
            animate={open ? { y: "-120cqh", opacity: 0.9 } : { y: "0cqh", opacity: 1 }}
            transition={{ duration: reduce ? 0 : 2.4, delay: reduce ? 0 : i * 0.2, ease: "easeIn" }}
            style={{ position: "absolute", left: `${x - 9}%`, top: `${i === 1 ? 26 : 36}%`, width: "18%" }}
          >
            <path d="M0 -60 V-6" stroke={p.goldLight} strokeWidth="1" />
            <path d="M-8 -6 h16 l4 8 h-24z" fill={p.gold} />
            <path d="M-12 2 h24 l-4 30 h-16z" fill="#ffd66b" />
            <path d="M-12 2 h24 l-4 30 h-16z M-4 2 v30 M4 2 v30" fill="none" stroke={p.goldDeep} strokeWidth="1.5" />
            <path d="M-8 32 h16 l-8 10z" fill={p.gold} />
          </motion.svg>
        ))}
      </>
    ),
    bottom: art("moonlit", p).bottom,
    sound: softChime,
    bursts: [{ preset: "glitter", colors: [p.goldLight, "#ffffff"] }],
    doneAt: 3000,
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function StainedGlassIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const glass = ["#9B2335", "#1F4E8C", "#D4A017", "#2E7D5B", "#6A2C70", "#1F4E8C", "#9B2335", "#D4A017", "#2E7D5B", "#6A2C70", "#D4A017", "#1F4E8C"];
  const scene: Scene = {
    id: "stainedGlass",
    look: { bg: `radial-gradient(ellipse at 50% 45%, #ffffff, ${p.ivory2} 80%)`, ink: p.deep, accent: p.goldDeep, halo: halo("#ffffff"), button: p.deep, buttonInk: p.goldLight },
    mode: "center",
    // The rose window lights pane by pane, then opens out past the edges.
    cover: (open, reduce) => (
      <motion.svg
        viewBox="-120 -120 240 240"
        initial={false}
        animate={open ? { scale: 3.2, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : 1.3, ease: "easeIn" }}
        style={{ position: "absolute", left: "50%", top: "50%", width: "min(92cqw, 62cqh)", height: "min(92cqw, 62cqh)", translate: "-50% -50%" }}
      >
        <circle r="116" fill={p.ivory2} stroke={p.gold} strokeWidth="6" />
        {glass.map((c, i) => (
          <motion.path
            key={i}
            d="M0 0 L26 -104 A108 108 0 0 1 54 -94 Z"
            fill={c}
            transform={`rotate(${i * 30})`}
            stroke={p.gold}
            strokeWidth="2"
            initial={false}
            animate={{ fillOpacity: open ? 0.95 : 0.25 }}
            transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : i * 0.08 }}
          />
        ))}
        <circle r="36" fill={p.goldLight} stroke={p.gold} strokeWidth="4" />
        <path d="M0 -20 V20 M-13 -6 H13" stroke={p.deep} strokeWidth="5" />
      </motion.svg>
    ),
    sound: templeBell,
    bursts: [{ preset: "jasmine" }],
    burstAt: 1600,
    doneAt: 3000,
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function FoilCardIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const initials = [props.monogram.a, props.monogram.b].filter(Boolean).join(" & ");
  const scene: Scene = {
    id: "foilCard",
    look: { bg: p.ivory, ink: p.text, accent: p.gold, halo: "none", button: p.goldLight, buttonInk: p.deep },
    mode: "center",
    // A black card with a gold-foil monogram lifts away like a magazine cover.
    cover: (open, reduce) => (
      <motion.div
        initial={false}
        animate={{ y: open ? "-104%" : "0%" }}
        transition={{ duration: reduce ? 0 : 1.2, ease: [0.7, 0, 0.3, 1] }}
        style={{ position: "absolute", inset: 0, background: p.deep, display: "grid", placeItems: "center" }}
      >
        <div style={{ textAlign: "center", color: p.goldLight }}>
          <div style={{ fontFamily: props.fonts.display, fontSize: "clamp(40px, 16cqw, 84px)", lineHeight: 1 }}>{initials}</div>
          <div style={{ marginTop: 14, width: 120, height: 1, background: p.gold, marginInline: "auto" }} />
        </div>
        <div className={s.shine} />
      </motion.div>
    ),
    sound: softChime,
    bursts: [{ preset: "glitter", colors: [p.gold, p.goldLight] }],
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function SunriseIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const scene: Scene = {
    id: "sunrise",
    look: { bg: `linear-gradient(180deg, #f6e7d5, ${p.ivory})`, ink: p.deep, accent: p.goldDeep, halo: halo(p.ivory), button: p.goldDeep, buttonInk: p.ivory },
    mode: "slide",
    left: <ArchPanel p={p} />,
    right: <ArchPanel p={p} flip />,
    // The sun rises behind the names as the arch opens.
    behind: (open, reduce) => (
      <motion.div
        initial={false}
        animate={{ y: open ? "0%" : "40%", opacity: open ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 2, ease: "easeOut" }}
        style={{ position: "absolute", left: "50%", top: "22%", width: "80cqw", height: "80cqw", marginLeft: "-40cqw", borderRadius: "50%", background: `radial-gradient(circle, ${p.goldLight} 0 38%, ${p.gold}55 39% 55%, transparent 70%)` }}
      />
    ),
    bottom: art("arch", p).bottom,
    sound: flute,
    bursts: [{ preset: "sunGlints" }],
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function CandlelightIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const scene: Scene = {
    id: "candlelight",
    look: { bg: `radial-gradient(ellipse at 50% 50%, ${p.mid}, ${p.deep} 75%)`, ink: "#fbf1dc", accent: p.goldLight, halo: halo(p.deep), button: p.gold, buttonInk: p.deep },
    mode: "slide",
    left: <VelvetCurtain p={p} />,
    right: <VelvetCurtain p={p} flip />,
    // Warm candle glow behind the names once the curtains part.
    behind: (open, reduce) => (
      <motion.div
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 1.6, delay: reduce ? 0 : 0.6 }}
        style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 48%, ${p.gold}44, transparent 60%)` }}
      />
    ),
    top: art("velvet", p).top,
    bottom: art("velvet", p).bottom,
    sound: softChime,
    bursts: [{ preset: "glitter", colors: [p.gold, p.goldLight] }, { preset: "embers" }],
  };
  return <SceneIntro {...props} scene={scene} />;
}

/** Balloon cluster: left %, top %, width (cqw). */
const BALLOON_SPOTS = [
  [24, 16, 30],
  [52, 8, 34],
  [80, 17, 30],
  [36, 33, 36],
  [68, 31, 34],
  [16, 50, 30],
  [50, 52, 32],
  [84, 49, 30],
] as const;

export function BalloonPopIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const colors = [...p.flowers, p.gold, p.flowers[0], p.flowers[1], p.gold];
  const scene: Scene = {
    id: "balloonPop",
    look: { bg: `linear-gradient(180deg, ${p.ivory2}, ${p.ivory})`, ink: p.deep, accent: p.goldDeep, halo: halo(p.ivory), button: p.deep, buttonInk: p.ivory },
    mode: "center",
    // A cluster of balloons covers the names, then floats up and away.
    cover: (open, reduce) => (
      <div style={{ position: "absolute", inset: 0, background: open ? "transparent" : p.ivory, transition: reduce ? "none" : "background 0.6s 0.4s" }}>
        {colors.map((c, i) => {
          const [x, y, w] = BALLOON_SPOTS[i];
          return (
            <motion.svg
              key={i}
              viewBox="0 0 60 110"
              initial={false}
              animate={open ? { y: "-140cqh", rotate: i % 2 ? 8 : -8 } : { y: "0cqh", rotate: 0 }}
              transition={{ duration: reduce ? 0 : 1.6, delay: reduce ? 0 : 0.08 * i, ease: [0.5, 0, 0.8, 0.6] }}
              style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: `${w}cqw`, maxWidth: w * 5.6, translate: "-50% 0" }}
            >
              <ellipse cx="30" cy="30" rx="26" ry="30" fill={c} />
              <ellipse cx="21" cy="19" rx="6" ry="9" fill="#fff" opacity="0.35" />
              <path d="M27 60 L33 60 L30 65 Z" fill={c} />
              <path d="M30 65 Q24 80 30 92 T30 110" stroke={p.muted} strokeWidth="1" fill="none" />
            </motion.svg>
          );
        })}
      </div>
    ),
    sound: chime,
    bursts: [{ preset: "glitter", colors }],
    burstAt: 500,
    doneAt: 2600,
  };
  return <SceneIntro {...props} scene={scene} />;
}

export function CakeCandlesIntro(props: IntroProps) {
  const p = getRoyalPalette(props.templateId);
  const scene: Scene = {
    id: "cakeCandles",
    look: { bg: `radial-gradient(ellipse at 50% 60%, ${p.ivory}, ${p.ivory2} 80%)`, ink: p.deep, accent: p.goldDeep, halo: halo(p.ivory), button: p.deep, buttonInk: p.ivory },
    mode: "center",
    // A cake with lit candles; the tap blows them out and the cake slides away.
    cover: (open, reduce) => (
      <motion.div
        initial={false}
        animate={{ y: open ? "110%" : "0%" }}
        transition={{ duration: reduce ? 0 : 1, delay: reduce ? 0 : 0.9, ease: [0.6, 0, 0.3, 1] }}
        style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 60%, ${p.ivory}, ${p.ivory2} 80%)`, display: "grid", placeItems: "center" }}
      >
        <svg viewBox="0 0 200 200" style={{ width: "min(70cqw, 46cqh)", height: "auto" }}>
          <ellipse cx="100" cy="182" rx="86" ry="10" fill={p.muted} opacity="0.25" />
          <rect x="30" y="110" width="140" height="66" rx="10" fill={p.flowers[0]} />
          <rect x="30" y="110" width="140" height="18" rx="9" fill={p.ivory} />
          <path d="M30 128 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0" fill={p.ivory} />
          <rect x="30" y="150" width="140" height="6" fill={p.gold} opacity="0.7" />
          {[60, 85, 115, 140].map((x, i) => (
            <g key={x}>
              <rect x={x - 4} y="74" width="8" height="36" rx="3" fill={i % 2 ? p.flowers[2] : p.flowers[1]} />
              <motion.path
                d={`M${x} 56 Q${x + 7} 66 ${x} 72 Q${x - 7} 66 ${x} 56 Z`}
                fill={p.gold}
                initial={false}
                animate={{ opacity: open ? 0 : 1, scale: open ? 0.2 : 1 }}
                transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.1 * i }}
                style={{ transformOrigin: `${x}px 72px` }}
              />
            </g>
          ))}
        </svg>
      </motion.div>
    ),
    sound: chime,
    bursts: [{ preset: "glitter", colors: [...p.flowers, p.gold] }],
    burstAt: 1000,
    doneAt: 2800,
  };
  return <SceneIntro {...props} scene={scene} />;
}
