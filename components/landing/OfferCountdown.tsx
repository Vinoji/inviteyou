"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Timer } from "lucide-react";
import { LIST_PRICE_INR, OFFER_ENDS_AT, OFFER_PRICE_INR, TIER_PRICES } from "@/lib/pricing";

/**
 * The launch offer, with a live countdown to its real end (OFFER_ENDS_AT in
 * lib/pricing.ts) — after which the price really goes back up and this
 * disappears. `compact` is the one-line version for the editor.
 */
export default function OfferCountdown({
  compact = false,
  short = false,
  price = OFFER_PRICE_INR,
  was = LIST_PRICE_INR,
  className = "",
}: {
  compact?: boolean;
  /** With `compact`: one short line for tight spaces (the phone dock). */
  short?: boolean;
  /** The compact lines' prices — the design being edited. */
  price?: number;
  was?: number;
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
          ? t("short", { price, d: parts.d, h: pad(parts.h), m: pad(parts.m) })
          : t("compact", { price, was, date: endDate })}
      </p>
    );
  }

  if (compact) {
    return (
      <p className={`flex items-center justify-center gap-1.5 text-xs font-semibold text-[#b0791f] dark:text-[#ffd35c] ${className}`}>
        <Timer size={13} aria-hidden />
        {t("compact", { price, was, date: endDate })}
        {parts && <span className="tabular-nums">· {t("left", { d: parts.d, h: pad(parts.h), m: pad(parts.m) })}</span>}
      </p>
    );
  }

  // The full card: ribbon, countdown, the two prices, one button.
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[#e8b04a]/60 bg-[radial-gradient(120%_90%_at_50%_0%,#6b2047_0%,#3d1236_45%,#22091f_100%)] p-5 text-center text-[#fff6e6] shadow-[0_24px_50px_-20px_rgba(232,176,74,0.45)] sm:p-7 ${className}`}
      role="status"
    >
      {/* soft gold glow and a slow sheen */}
      <span aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[#ffd35c]/20 blur-3xl" />
      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ffe08a] via-[#f2c45a] to-[#e8b04a] px-3 py-1 text-[11px] font-extrabold tracking-[0.18em] text-[#2a0c27] uppercase shadow-[0_6px_14px_-6px_rgba(232,176,74,0.9)]">
        🔥 {t("title")}
      </span>
      <p className="relative mt-3 text-sm text-[#ffe9b8]/85">{t("endsLine", { date: endDate, after: TIER_PRICES.standard.usual, after3d: TIER_PRICES.premium.usual })}</p>

      <div className="relative mx-auto mt-3 grid max-w-sm grid-cols-4 gap-2" aria-label={t("endsIn")}>
        {(["d", "h", "m", "s"] as const).map((k) => (
          <span key={k} className="flex flex-col items-center rounded-2xl bg-black/30 py-2.5 ring-1 ring-[#e8b04a]/40">
            <span className="font-serif text-2xl leading-none font-bold tabular-nums text-[#ffe9b8] sm:text-3xl">
              {parts ? (k === "d" ? parts.d : pad(parts[k])) : "–"}
            </span>
            <span className="mt-1 text-[10px] tracking-widest text-[#f6e7d0]/70 uppercase">{t(`unit.${k}`)}</span>
          </span>
        ))}
      </div>

      <div className="relative mx-auto mt-4 grid max-w-sm grid-cols-2 gap-2">
        {[
          { label: t("live"), price: TIER_PRICES.standard.offer, usual: TIER_PRICES.standard.usual, hot: true },
          { label: t("premium3d"), price: TIER_PRICES.premium.offer, usual: TIER_PRICES.premium.usual, hot: false },
        ].map((p) => (
          <div
            key={p.label}
            className={`rounded-2xl px-3 py-2.5 ${p.hot ? "bg-[#fffaf2] text-[#2a0c27]" : "bg-white/10 ring-1 ring-white/15"}`}
          >
            <p className={`text-[11px] font-semibold ${p.hot ? "text-[#7a4a12]" : "text-[#ffe9b8]/80"}`}>{p.label}</p>
            <p className="mt-0.5 font-serif text-2xl leading-none font-bold">
              ₹{p.price} <s className="font-sans text-xs font-medium opacity-50">₹{p.usual}</s>
            </p>
          </div>
        ))}
      </div>

      <a
        href="#templates"
        className="relative mt-4 inline-flex h-12 w-full max-w-sm items-center justify-center rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-sm font-bold text-[#2a0c27] shadow-[0_10px_22px_-10px_rgba(232,176,74,0.95)]"
      >
        {t("cta", { price: TIER_PRICES.standard.offer })}
      </a>
    </div>
  );
}
