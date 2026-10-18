"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Timer } from "lucide-react";
import { USUAL_PRICES } from "@/lib/pricing";
import FestivalArt, { FestivalParticles } from "@/components/offers/FestivalArt";
import a from "@/components/offers/festivalArt.module.css";
import { OFFER_LOOKS } from "@/components/offers/themes";
import { timeLeft, useOffer } from "@/components/offers/useOffer";

/**
 * The offer in force — launch or festival (lib/festivals.ts) — with a live
 * countdown to its real end, after which prices really change and this
 * moves on to the next offer or disappears. The full card wears the
 * festival's colours, art and wording; `compact` is the one-line version
 * for the editor.
 */
export default function OfferCountdown({
  compact = false,
  short = false,
  price,
  was,
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
  const tf = useTranslations("festivals");
  const format = useFormatter();
  const { now, offer } = useOffer();

  if (!offer) return null;
  const look = OFFER_LOOKS[offer.theme];
  const parts = now === null ? null : timeLeft(offer.endsAt, now);
  const endDate = format.dateTime(new Date(offer.endsAt), { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  const pad = (n: number) => String(n).padStart(2, "0");
  const linePrice = price ?? offer.prices.standard;
  const lineWas = was ?? USUAL_PRICES.standard;

  if (compact && short) {
    return (
      <p className={`flex items-center justify-center gap-1.5 text-xs font-semibold tabular-nums ${className}`}>
        <span aria-hidden>{look.icon}</span>
        {parts
          ? t("short", { price: linePrice, d: parts.d, h: pad(parts.h), m: pad(parts.m) })
          : t("compact", { price: linePrice, was: lineWas, date: endDate })}
      </p>
    );
  }

  if (compact) {
    return (
      <p className={`flex items-center justify-center gap-1.5 text-xs font-semibold text-[#b0791f] dark:text-[#ffd35c] ${className}`}>
        <Timer size={13} aria-hidden />
        {t("compact", { price: linePrice, was: lineWas, date: endDate })}
        {parts && <span className="tabular-nums">· {t("left", { d: parts.d, h: pad(parts.h), m: pad(parts.m) })}</span>}
      </p>
    );
  }

  // The full card: the festival's photo (slowly zooming) under its tint,
  // drifting sparkles, the greeting in shimmering gold, a glass countdown
  // and price tiles, and a button with a passing shine. The launch offer
  // (no photo) keeps its drawn scene.
  const glass = look.photo ? a.glass : look.light ? "bg-white/55 ring-1 ring-black/10" : "bg-black/30 ring-1 ring-white/20";
  const ink = look.photo ? "#ffffff" : look.ink;
  return (
    <div
      className={`relative isolate overflow-hidden rounded-3xl border border-white/25 px-5 pb-5 text-center shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)] sm:px-7 sm:pb-7 ${look.photo ? "pt-40" : "pt-32"} ${className}`}
      style={{ background: look.photo ? look.tint : look.card, color: ink, ["--gold" as string]: look.gold }}
      role="status"
    >
      {look.photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={look.photo} alt="" aria-hidden className={`${a.photo} -z-10`} />
          <span
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ background: `linear-gradient(180deg, ${look.tint}26 0%, ${look.tint}8c 32%, ${look.tint}e6 58%, ${look.tint} 100%)` }}
          />
          <FestivalParticles theme={offer.theme} />
        </>
      ) : (
        <FestivalArt theme={offer.theme} />
      )}
      <span
        className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-[0.18em] uppercase shadow-md"
        style={{ background: look.button, color: look.buttonInk }}
      >
        {look.icon} {tf("offerName", { name: tf(`${offer.theme}.name`) })}
      </span>
      <h3 className={`relative mt-3 font-serif text-3xl leading-tight font-bold sm:text-4xl ${look.photo ? a.shimmer : ""}`}>
        {tf(`${offer.theme}.greeting`)}
      </h3>
      <p className="relative mx-auto mt-2 max-w-md text-sm opacity-90" style={look.photo ? undefined : { color: look.soft }}>
        {tf(`${offer.theme}.line`)}
      </p>

      <div className="relative mx-auto mt-4 grid max-w-sm grid-cols-4 gap-2" aria-label={t("endsIn")}>
        {(["d", "h", "m", "s"] as const).map((k) => (
          <span key={k} className={`flex flex-col items-center rounded-2xl py-2.5 ${glass}`}>
            <span className="font-serif text-2xl leading-none font-bold tabular-nums sm:text-3xl">
              {parts ? (k === "d" ? parts.d : pad(parts[k])) : "–"}
            </span>
            <span className="mt-1 text-[10px] tracking-widest uppercase opacity-75">{t(`unit.${k}`)}</span>
          </span>
        ))}
      </div>

      <div className="relative mx-auto mt-3 grid max-w-sm grid-cols-2 gap-2">
        {[
          { label: t("live"), price: offer.prices.standard, usual: USUAL_PRICES.standard },
          { label: t("premium3d"), price: offer.prices.premium, usual: USUAL_PRICES.premium },
        ].map((p) => (
          <div key={p.label} className={`rounded-2xl px-3 py-2.5 ${glass}`}>
            <p className="text-[11px] font-semibold opacity-80">{p.label}</p>
            <p className="mt-0.5 font-serif text-2xl leading-none font-bold" style={{ color: look.photo ? look.gold : look.accent }}>
              ₹{p.price} <s className="font-sans text-xs font-medium opacity-60" style={{ color: ink }}>₹{p.usual}</s>
            </p>
          </div>
        ))}
      </div>

      <a
        href="#templates"
        className={`relative mt-4 inline-flex h-12 w-full max-w-sm items-center justify-center rounded-full text-sm font-bold shadow-lg ${a.shine}`}
        style={{ background: look.button, color: look.buttonInk }}
      >
        {tf("cta", { price: offer.prices.standard })}
      </a>
      <p className={`relative mx-auto mt-3 w-fit max-w-full rounded-full px-3 py-1 text-xs font-medium ${glass}`}>
        {tf("endsLine", { date: endDate, after: USUAL_PRICES.standard, after3d: USUAL_PRICES.premium })}
      </p>
    </div>
  );
}
