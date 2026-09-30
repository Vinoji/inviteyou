"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { REPLAY_INTRO_EVENT } from "../intros/events";
import MotionHeading from "../motion/MotionHeading";
import s from "./royal.module.css";

/** Closing glass card over a bokeh backdrop, with a replay-the-doors button. */
/** `occasion`: weddings keep their own words; others get a general line. */
export default function ThankYou({ names, occasion = "wedding" }: { names: string; occasion?: string }) {
  const t = useTranslations("invite.royal.thanks");
  return (
    <section className={s.thanks}>
      <div className={s.glass}>
        <div className={s.eyebrow}>♥ {t("eyebrow")}</div>
        <MotionHeading>{t("heading")}</MotionHeading>
        <p>{occasion === "wedding" ? t("body") : t("bodyOccasion")}</p>
        {names && <div className={s.glassSign}>{names}</div>}
      </div>
      <button
        type="button"
        className={s.replay}
        onClick={() => window.dispatchEvent(new Event(REPLAY_INTRO_EVENT))}
      >
        <RotateCcw size={12} aria-hidden /> {t("replay")}
      </button>
    </section>
  );
}
