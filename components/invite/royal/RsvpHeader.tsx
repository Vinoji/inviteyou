"use client";

import { useTranslations } from "next-intl";
import MotionHeading from "../motion/MotionHeading";
import s from "./royal.module.css";

/** Heading for the royal RSVP section, passed into RsvpForm's `header` slot.
 * Give the element a key at the call site: an element handed from a server
 * component into a client component's child list otherwise trips React's
 * dev-only missing-key warning. */
export default function RsvpHeader() {
  const t = useTranslations("invite.royal.rsvp");
  return (
    <div className={s.head}>
      <div className={s.eyebrow}>{t("eyebrow")}</div>
      <MotionHeading>
        {t("heading")} <span className={s.rsvpScript}>{t("headingScript")}</span>
      </MotionHeading>
      <p>{t("sub")}</p>
    </div>
  );
}
