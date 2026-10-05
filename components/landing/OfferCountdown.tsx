"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Timer } from "lucide-react";
import { LIST_PRICE_INR, OFFER_ENDS_AT, OFFER_PRICE_INR } from "@/lib/pricing";

/**
 * The launch offer, with a live countdown to its real end (OFFER_ENDS_AT in
 * lib/pricing.ts) — after which the price really goes back up and this
 * disappears. `compact` is the one-line version for the editor.
 */
export default function OfferCountdown({
  compact = false,
  short = false,
  className = "",
}: {
  compact?: boolean;
  /** With `compact`: one short line for tight spaces (the phone dock). */
  short?: boolean;
  className?: string;
}) {
  const t = useTranslations("landing.offer");
  const format = useFormatter();
  // Rendered after mount: the seconds would never match the server's.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (now !== null && now > OFFER_ENDS_AT) return null;
  const left = now === null ? null : Math.max(0, OFFER_ENDS_AT - now);
  const parts = left === null
    ? null
    : {
        d: Math.floor(left / 86_400_000),
        h: Math.floor(left / 3_600_000) % 24,
        m: Math.floor(left / 60_000) % 60,
        s: Math.floor(left / 1000) % 60,
      };
  const endDate = format.dateTime(new Date(OFFER_ENDS_AT), { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  const pad = (n: number) => String(n).padStart(2, "0");

  if (compact && short) {
    return (
      <p className={`flex items-center justify-center gap-1.5 text-xs font-semibold tabular-nums ${className}`}>
        <Timer size={13} aria-hidden />
        {parts
          ? t("short", { price: OFFER_PRICE_INR, d: parts.d, h: pad(parts.h), m: pad(parts.m) })
          : t("compact", { price: OFFER_PRICE_INR, was: LIST_PRICE_INR, date: endDate })}
      </p>
    );
  }

  if (compact) {
    return (
      <p className={`flex items-center justify-center gap-1.5 text-xs font-semibold text-[#b0791f] dark:text-[#ffd35c] ${className}`}>
        <Timer size={13} aria-hidden />
        {t("compact", { price: OFFER_PRICE_INR, was: LIST_PRICE_INR, date: endDate })}
        {parts && <span className="tabular-nums">· {t("left", { d: parts.d, h: pad(parts.h), m: pad(parts.m) })}</span>}
      </p>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#e8b04a]/50 bg-gradient-to-r from-[#3d1236] via-[#5a1a3c] to-[#3d1236] px-4 py-3 text-[#fff6e6] shadow-[0_14px_30px_-18px_rgba(61,18,54,0.9)] ${className}`}
      role="status"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
        <p className="text-sm">
          <span className="mr-1.5 rounded-full bg-gradient-to-r from-[#ffe08a] to-[#e8b04a] px-2 py-0.5 text-[11px] font-bold tracking-wider text-[#2a0c27] uppercase">
            {t("title")}
          </span>
          {t.rich("line", {
            price: OFFER_PRICE_INR,
            was: LIST_PRICE_INR,
            date: endDate,
            b: (chunks) => <b className="text-[#ffd35c]">{chunks}</b>,
            s: (chunks) => <s className="opacity-60">{chunks}</s>,
          })}
        </p>
        <div className="flex items-center gap-1.5" aria-label={t("endsIn")}>
          {(["d", "h", "m", "s"] as const).map((k) => (
            <span key={k} className="flex min-w-[42px] flex-col items-center rounded-lg bg-black/25 px-1.5 py-1 ring-1 ring-[#e8b04a]/30">
              <span className="font-serif text-base leading-none font-bold tabular-nums text-[#ffe9b8]">
                {parts ? (k === "d" ? parts.d : pad(parts[k])) : "–"}
              </span>
              <span className="mt-0.5 text-[9px] tracking-widest text-[#f6e7d0]/70 uppercase">{t(`unit.${k}`)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
