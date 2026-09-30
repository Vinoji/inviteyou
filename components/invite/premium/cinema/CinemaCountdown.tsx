"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { parseDate } from "../types";

/**
 * Days / hours / minutes / seconds to the date, styled by the theme
 * (`s.countdown`, `s.unit`, `s.num`, `s.label`). Dashes until mounted, so
 * the server and first client render match.
 */
export default function CinemaCountdown({ date, s }: { date: string; s: Record<string, string> }) {
  const t = useTranslations("invite.countdown");
  const target = parseDate(date)?.setHours(0, 0, 0, 0) ?? null;
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  if (target === null) return null;
  const diff = now === null ? null : Math.max(0, target - now);
  if (diff === 0) return <p className={s.countdownDone}>{t("began")}</p>;
  const parts = [
    { key: "days", v: diff === null ? null : Math.floor(diff / 86_400_000) },
    { key: "hours", v: diff === null ? null : Math.floor((diff / 3_600_000) % 24) },
    { key: "minutes", v: diff === null ? null : Math.floor((diff / 60_000) % 60) },
    { key: "seconds", v: diff === null ? null : Math.floor((diff / 1000) % 60) },
  ];
  return (
    <div className={s.countdown} role="timer">
      {parts.map((p) => (
        <div key={p.key} className={s.unit}>
          <span className={s.num}>{p.v === null ? "–" : String(p.v).padStart(2, "0")}</span>
          <span className={s.label}>{t(p.key)}</span>
        </div>
      ))}
    </div>
  );
}
