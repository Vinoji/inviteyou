"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { isSitePage } from "./SiteHeader";
import { Petals, Thoranam } from "./festive";
import s from "../landing/landing.module.css";

const KEY = "iy-entered";

/**
 * Arriving at the site feels like arriving at a function: carved temple
 * doors under a thoranam swing open onto the page with falling petals and
 * a bilingual "Welcome · நல்வரவு". Once per browser session, ~1.9s, any
 * tap skips it. The whole sequence is CSS (see .gate in
 * landing.module.css), so it finishes even before scripts load; the script
 * only skips it for returning visitors and on tap.
 */
export default function EntranceGate() {
  const t = useTranslations("site.gate");
  const pathname = usePathname();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      let seen = false;
      try {
        seen = sessionStorage.getItem(KEY) === "1" || localStorage.getItem("namma:motion") === "reduced";
        sessionStorage.setItem(KEY, "1");
      } catch {
        // Storage blocked — the gate just plays, and ends on its own.
      }
      if (seen) setGone(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (!isSitePage(pathname)) return null;

  return (
    <div
      className={`${s.gate} ${gone ? s.gateGone : ""}`}
      onClick={() => setGone(true)}
      aria-hidden
    >
      <Thoranam />
      <span className={`${s.door} ${s.doorL}`} />
      <span className={`${s.door} ${s.doorR}`} />
      <p className={s.gateWelcome}>
        <b>{t("welcome")}</b>
        <span>நல்வரவு</span>
      </p>
      <Petals />
      <span className={s.gateSkip}>{t("skip")}</span>
    </div>
  );
}
