"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TravelInfo } from "@/lib/types";
import MotionHeading from "../motion/MotionHeading";
import s from "./royal.module.css";

/** "Travel Guide": destination badge, nearest airports, and train
 * suggestions tabbed by departure city. Each block hides when empty. */
export default function TravelGuide({ travel }: { travel: TravelInfo }) {
  const t = useTranslations("invite.royal.travel");
  const [tab, setTab] = useState(0);
  const routes = travel.routes.filter((r) => r.trains.length > 0);
  if (!travel.city && travel.airports.length === 0 && routes.length === 0) return null;
  const active = routes[Math.min(tab, routes.length - 1)];

  return (
    <section className={`${s.section} ${s.light}`}>
      <div className={s.head}>
        <div className={s.eyebrow}>{t("eyebrow")}</div>
        <MotionHeading>{t("heading")}</MotionHeading>
        <p>{t("sub")}</p>
      </div>
      {travel.city && (
        <div className={s.dest}>
          <div className={s.eyebrow}>{t("destination")}</div>
          <h3>{travel.city}</h3>
          {travel.cityCode && <small>{travel.cityCode}</small>}
        </div>
      )}
      {travel.airports.length > 0 && (
        <div className={s.card}>
          <span className={s.eyebrow}>{t("byFlight")}</span>
          <h4>{t("airports")}</h4>
          <div className={s.airports}>
            {travel.airports.map((a, i) => (
              <div key={i}>
                <b>{a.code}</b>
                <span>{a.name}</span>
                <i>{a.distance}</i>
              </div>
            ))}
          </div>
        </div>
      )}
      {active && (
        <div className={s.card}>
          <span className={s.eyebrow}>{t("byTrain")}</span>
          <h4>{t("trains")}</h4>
          {(routes.length > 1 || active.from) && (
            <div className={s.tabs} role="tablist">
              {routes.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={r === active}
                  onClick={() => setTab(i)}
                >
                  {t("from", { city: r.from })}
                </button>
              ))}
            </div>
          )}
          <div role="tabpanel">
            {active.trains.map((tr, i) => (
              <div key={i} className={s.train}>
                <div className={s.trainName}>
                  {tr.number && <span className={s.trainNo}>{tr.number}</span>}
                  {tr.name}
                </div>
                <div className={s.tm}>
                  {tr.departs}
                  <small>{tr.fromStation}</small>
                </div>
                <div className={s.line}>{tr.frequency}</div>
                <div className={`${s.tm} ${s.tmRight}`}>
                  {tr.arrives}
                  <small>{tr.toStation}</small>
                </div>
              </div>
            ))}
          </div>
          <span className={s.sampleTag}>{t("note")}</span>
        </div>
      )}
    </section>
  );
}
