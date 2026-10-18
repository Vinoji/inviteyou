"use client";

import { useTranslations } from "next-intl";
import Reveal from "../cinema/Reveal";
import s from "./printed.module.css";

interface Ritual {
  name: string;
  alt: string;
  text: string;
}

/** The order of ceremonies of a Tamil kalyanam, as a printed programme. */
export function RitualsInsert() {
  const t = useTranslations("premium.printed.rituals");
  const items = t.raw("items") as Ritual[];
  return (
    <section className={s.section}>
      <div className={`${s.inner} ${s.slip} ${s.programme}`}>
        <p className={s.kicker}>{t("kicker")}</p>
        <h2 className={s.title}>{t("title")}</h2>
        <p className={s.programmeNote}>{t("note")}</p>
        <div className={s.rituals}>
          {items.map((r, i) => (
            <Reveal key={r.name} as="div" delay={Math.min(i, 4) * 0.06} className={s.ritual}>
              <span className={s.ritualNo} aria-hidden>
                {i + 1}
              </span>
              <div className={s.ritualBody}>
                <p className={s.ritualName}>
                  {r.name} <span className={s.ritualAlt}>{r.alt}</span>
                </p>
                <p className={s.ritualText}>{r.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The Kerala sadya menu, printed on a banana-leaf insert. */
export function SadyaInsert() {
  const t = useTranslations("premium.printed.sadya");
  const dishes = t.raw("dishes") as { name: string; alt: string }[];
  return (
    <section className={s.section}>
      <div className={`${s.inner} ${s.leaf}`}>
        <div className={s.leafCard}>
          <p className={s.kicker}>{t("kicker")}</p>
          <h2 className={s.title}>{t("title")}</h2>
          <p className={s.programmeNote}>{t("note")}</p>
          <div className={s.menu}>
            {dishes.map((d, i) => (
              <Reveal key={d.name} as="div" delay={Math.min(i, 8) * 0.05} className={s.dish}>
                <span className={s.dishName}>{d.name}</span>
                <span className={s.dishAlt}>{d.alt}</span>
              </Reveal>
            ))}
          </div>
          <p className={s.menuFoot}>{t("foot")}</p>
        </div>
      </div>
    </section>
  );
}
