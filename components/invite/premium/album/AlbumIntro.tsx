"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SceneIntro, { type Scene } from "../../intros/SceneIntro";
import { softChime } from "../../intros/sceneSounds";
import type { IntroProps } from "../../intros/types";

/** Sample photographs on the table under the album (public/library). */
const TABLE = [
  { src: "/library/thumbs/wedding-jasmine-bride.webp", x: 6, y: 8, r: -12 },
  { src: "/library/thumbs/engagement-holding-hands.webp", x: 62, y: 5, r: 9 },
  { src: "/library/thumbs/wedding-henna-hands.webp", x: 4, y: 64, r: 8 },
  { src: "/library/thumbs/love-wedding-rings.webp", x: 64, y: 66, r: -9 },
  { src: "/library/thumbs/wedding-ring-ceremony.webp", x: 70, y: 36, r: 14 },
  { src: "/library/thumbs/love-red-roses.webp", x: 0, y: 36, r: -6 },
];

/**
 * Intro "photoAlbum" (photo-story): a leather photo album resting on a
 * table strewn with prints. "Open our album" swings the cover open and the
 * prints scatter outwards — the names are on the first page.
 */
export default function AlbumIntro(props: IntroProps) {
  const t = useTranslations("premium.album");
  const scene: Scene = {
    id: "photoAlbum",
    look: {
      bg: "radial-gradient(ellipse at 50% 40%, #f6ecdd, #e4d2b8 70%, #cdb393)",
      ink: "#2f3a32",
      accent: "#c2566f",
      halo: "0 2px 18px rgba(255,250,243,.9)",
      button: "#2f3a32",
      buttonInk: "#fbf6ee",
    },
    mode: "center",
    behind: (open, reduce) => (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {TABLE.map((p, i) => (
          <motion.div
            key={p.src}
            initial={false}
            animate={
              open
                ? { x: (p.x < 40 ? -1 : 1) * 60, y: (p.y < 40 ? -1 : 1) * 40, rotate: p.r * 1.6, opacity: 0.55 }
                : { x: 0, y: 0, rotate: p.r, opacity: 1 }
            }
            transition={{ duration: reduce ? 0 : 1.2, delay: reduce ? 0 : 0.2 + i * 0.05, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: "30%",
              padding: "2.4% 2.4% 8%",
              background: "#fffdf8",
              boxShadow: "0 10px 22px -10px rgba(47,58,50,.55)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" style={{ display: "block", width: "100%", aspectRatio: "1", objectFit: "cover" }} />
          </motion.div>
        ))}
        {/* The open album's first page, under the names */}
        <motion.div
          initial={false}
          animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.96 }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.6 }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "min(78cqw, 56cqh)",
            aspectRatio: "3 / 4",
            translate: "-50% -50%",
            borderRadius: 6,
            background: "linear-gradient(180deg, #fffdf8, #f6eee2)",
            boxShadow: "0 30px 60px -24px rgba(47,58,50,.6), inset 0 0 0 10px #fffdf8, inset 0 0 0 11px rgba(194,86,111,.35)",
          }}
        />
      </div>
    ),
    cover: (open, reduce) => (
      <div style={{ position: "absolute", inset: 0, perspective: 1400, pointerEvents: "none" }}>
        <motion.div
          initial={false}
          animate={open ? { rotateY: -165, opacity: 0 } : { rotateY: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 1.5, ease: [0.65, 0, 0.3, 1], opacity: { delay: reduce ? 0 : 1, duration: 0.4 } }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "min(78cqw, 56cqh)",
            aspectRatio: "3 / 4",
            translate: "-50% -50%",
            transformOrigin: "0% 50%",
            borderRadius: "4px 10px 10px 4px",
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,.12), transparent 50%), repeating-linear-gradient(35deg, rgba(0,0,0,.05) 0 2px, transparent 2px 5px), linear-gradient(135deg, #7a2a3a, #5a1c2a 55%, #3e1220)",
            boxShadow: "0 40px 70px -28px rgba(30,10,15,.8), inset 10px 0 18px rgba(0,0,0,.35)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "7%",
              border: "1.5px solid #e6c47a",
              borderRadius: 6,
              boxShadow: "inset 0 0 0 5px rgba(230,196,122,.25)",
            }}
          />
          <div style={{ textAlign: "center", color: "#f3d9a0", fontFamily: props.fonts.display }}>
            <div style={{ fontSize: "min(5cqw, 3.6cqh)", letterSpacing: ".3em", textTransform: "uppercase", fontFamily: props.fonts.caps }}>
              {t("coverTitle")}
            </div>
            <div style={{ marginTop: "4%", fontSize: "min(12cqw, 8cqh)", lineHeight: 1 }}>♥</div>
            <div
              style={{
                margin: "6% auto 0",
                width: "min(30cqw, 20cqh)",
                aspectRatio: "1",
                padding: "4%",
                background: "#fffdf8",
                rotate: "-4deg",
                boxShadow: "0 8px 18px rgba(0,0,0,.4)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/library/thumbs/engagement-rings-hands.webp" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </motion.div>
      </div>
    ),
    sound: softChime,
    bursts: [{ preset: "pastelPetals" }],
    burstAt: 900,
    doneAt: 2600,
  };
  return <SceneIntro {...props} scene={scene} />;
}
