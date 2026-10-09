"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlayCircle } from "lucide-react";

/** A typical printed invitation with delivery — stated as an estimate. */
const PRINTED_PER_CARD = 40;

/**
 * "How much you save": guests on a slider, printed cards (at a stated,
 * typical per-card estimate) against one link at today's price.
 */
export default function SavingsCalculator({ price }: { price: number }) {
  const t = useTranslations("landing.savings");
  const [guests, setGuests] = useState(300);
  const printed = guests * PRINTED_PER_CARD;
  const saved = Math.max(0, printed - price);
  const fmt = (n: number) => n.toLocaleString("en-IN");

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[#e8b04a]/40 bg-[#fffaf2] p-5 text-[#2a0c27] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] sm:p-6 dark:bg-[#1c1220] dark:text-[#fff6e6]">
      <p className="text-center text-xs font-semibold tracking-[0.3em] text-[#b0791f] uppercase dark:text-[#ffd35c]">{t("eyebrow")}</p>
      <h3 className="mt-1 text-center font-serif text-2xl font-bold">{t("title")}</h3>
      <label className="mt-5 block text-sm font-semibold">
        {t("guests", { n: guests })}
        <input
          type="range"
          min={50}
          max={1000}
          step={25}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="mt-2 w-full accent-[#c98f3a]"
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl bg-neutral-100 p-3 dark:bg-white/5">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{t("printed")}</p>
          <p className="mt-1 font-serif text-2xl font-bold text-neutral-500 line-through decoration-red-500/60 dark:text-neutral-400">₹{fmt(printed)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#e8b04a] p-3 text-[#2a0c27]">
          <p className="text-xs font-semibold">{t("link")}</p>
          <p className="mt-1 font-serif text-2xl font-bold">₹{fmt(price)}</p>
        </div>
      </div>
      <p className="mt-4 text-center text-lg font-bold text-emerald-700 dark:text-emerald-400">{t("saved", { amount: fmt(saved) })}</p>
      <p className="mt-1 text-center text-xs text-neutral-500 dark:text-neutral-400">{t("assumption", { per: PRINTED_PER_CARD })}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/#value"
          className="inline-flex h-11 items-center rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] px-6 text-sm font-bold text-[#2a0c27] shadow-[0_8px_18px_-8px_rgba(201,143,58,0.9)]"
        >
          {t("cta", { price })}
        </Link>
        <Link href="/demo" className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-[#5a3a4f] underline underline-offset-2 dark:text-[#f6e7d0]">
          <PlayCircle size={16} aria-hidden />
          {t("sample")}
        </Link>
      </div>
    </div>
  );
}
