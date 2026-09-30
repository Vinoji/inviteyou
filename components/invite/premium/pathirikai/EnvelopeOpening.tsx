"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SceneIntro, { type Scene } from "../../intros/SceneIntro";
import { softChime } from "../../intros/sceneSounds";
import type { IntroProps } from "../../intros/types";
import ArtImage from "../ArtImage";
import m from "../materials.module.css";
import s from "./envelope.module.css";

/**
 * The pathirikai's opening: the card arrives the way it does at the door —
 * in a handmade paper envelope, turmeric on its corners, addressed by hand.
 * The flap lifts, the card slides out, and the invitation is the card.
 */
export default function EnvelopeOpening(props: IntroProps) {
  const t = useTranslations("premium.pathirikai.envelope");
  const scene: Scene = {
    id: "pathirikaiEnvelope",
    look: {
      bg: "radial-gradient(ellipse at 50% 40%, #8c3822, #5a1d10 80%)",
      ink: "#fbeedd",
      accent: "#e9c98b",
      halo: "0 2px 12px rgba(0,0,0,.5)",
      button: "#a8131b",
      buttonInk: "#fff6e6",
    },
    mode: "center",
    cover: (open, reduce) => (
      <motion.div
        className={s.stage}
        initial={false}
        animate={open ? { y: "12%", opacity: 0 } : { y: "0%", opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 1.9, ease: "easeIn" }}
      >
        <ArtImage templateId={props.templateId} slot="floor" className={s.floorArt} priority />
        <div className={s.envelope}>
          <div className={`${s.back} ${m.paper}`} />
          <motion.div
            className={`${s.card} ${m.paper}`}
            initial={false}
            animate={{ y: open ? "-62%" : "0%" }}
            transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : 0.75, ease: [0.3, 0, 0.2, 1] }}
          >
            <span className={s.suzhi}>உ</span>
            <span className={`${s.cardNames} ${m.foil}`} style={{ fontFamily: props.fonts.display }}>
              {[props.names.b, props.names.a].filter(Boolean).join(" ❦ ")}
            </span>
          </motion.div>
          <div className={`${s.front} ${m.paper}`}>
            <span className={`${s.turmeric} ${s.bl}`} />
            <span className={`${s.turmeric} ${s.br}`} />
            <p className={s.address}>
              {t("to")}
            </p>
          </div>
          <motion.div
            className={`${s.flap} ${m.paper}`}
            initial={false}
            animate={open ? { rotateX: 180, transitionEnd: { zIndex: 1 } } : { rotateX: 0, zIndex: 4 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: [0.5, 0, 0.3, 1] }}
          >
            <span className={s.seal} />
          </motion.div>
        </div>
      </motion.div>
    ),
    sound: softChime,
    doneAt: 2700,
  };
  return <SceneIntro {...props} scene={scene} />;
}
