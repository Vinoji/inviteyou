"use client";

import { useTranslations } from "next-intl";
import { Check, CheckCircle2, Minus, Sparkles, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EDITORS_PICKS } from "@/lib/templates";
import { isFreeTemplate, templatePriceInr } from "@/lib/pricing";

/** What a free card has and what the live invitation adds — the comparison
 * shown after downloading a live design's free card. */
const COMPARE = [
  { key: "c1", free: true },
  { key: "c2", free: false },
  { key: "c3", free: false },
  { key: "c4", free: false },
  { key: "c5", free: false },
  { key: "c6", free: false },
] as const;

/**
 * After a free card downloads: "your card is ready" and the step up. For a
 * live design (current): this same invitation live, with what guests get
 * that the image can't give. For a card-only design: the same invitation as
 * a live link in a few suggested designs. Everything typed carries over.
 */
export default function UpgradeSheet({
  designs,
  onLeave,
  onClose,
  current,
}: {
  designs: { id: string; name: string }[];
  /** Saves the draft before switching design. */
  onLeave: () => void;
  onClose: () => void;
  /** The live design they just downloaded a free card of. */
  current?: { name: string; price: number; was: number | null; onGoLive: () => void };
}) {
  const t = useTranslations("editor.upgrade");
  if (current) {
    return (
      <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={t("ready")}>
        <button type="button" aria-label={t("close")} className="absolute inset-0 bg-[#22091f]/60 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl border-t border-[#e8b04a]/50 bg-[#fffaf2] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:border dark:bg-[#1c1220]">
          <div className="bg-gradient-to-br from-[#3d1236] to-[#22091f] px-5 pt-5 pb-4 text-[#fff6e6]">
            <button type="button" onClick={onClose} aria-label={t("close")} className="absolute top-3 right-3 rounded-full p-2 text-[#ffe9b8] hover:bg-white/10">
              <X size={18} />
            </button>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#7ee2a8]">
              <CheckCircle2 size={18} aria-hidden />
              {t("ready")}
            </p>
            <h2 className="mt-2 font-serif text-xl font-bold">{t("liveTitle", { name: current.name })}</h2>
            <p className="mt-1 text-[13px] text-[#ffe9b8]/85">{t("liveSub")}</p>
          </div>
          <div className="px-5 pt-4">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                  <th className="pb-2 text-left font-semibold" />
                  <th className="w-16 pb-2 font-semibold">{t("colFree")}</th>
                  <th className="w-16 pb-2 font-semibold text-[#b0791f] dark:text-[#ffd35c]">{t("colLive")}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.key} className="border-t border-[#3d1236]/10 dark:border-white/10">
                    <td className="py-2 pr-2 text-[#2a0c27] dark:text-[#fff6e6]">{t(row.key)}</td>
                    <td className="text-center">
                      {row.free ? <Check size={15} className="mx-auto text-emerald-600" aria-label="✓" /> : <Minus size={15} className="mx-auto text-neutral-300" aria-label="—" />}
                    </td>
                    <td className="text-center">
                      <Check size={15} className="mx-auto text-[#c98f3a]" aria-label="✓" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={current.onGoLive}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-sm font-bold text-[#2a0c27] shadow-[0_10px_22px_-10px_rgba(201,143,58,0.9)]"
            >
              <Sparkles size={16} aria-hidden />
              {t("goLive")}
              <span className="rounded-full bg-[#2a0c27]/10 px-2 py-0.5 text-xs">
                {current.was && <s className="mr-1 opacity-60">₹{current.was}</s>}₹{current.price}
              </span>
            </button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-500 dark:text-neutral-400">
              <Sparkles size={13} aria-hidden />
              {t("keepsLive")}
            </p>
            <button type="button" onClick={onClose} className="mt-2 h-11 w-full rounded-full text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              {t("later")}
            </button>
          </div>
        </div>
      </div>
    );
  }
  const paid = designs.filter((d) => !isFreeTemplate(d.id));
  const suggestions = [
    ...paid.filter((d) => EDITORS_PICKS.includes(d.id)),
    ...paid.filter((d) => !EDITORS_PICKS.includes(d.id)),
  ].slice(0, 3);
  const from = Math.min(...paid.map((d) => templatePriceInr(d.id)));

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={t("ready")}>
      <button type="button" aria-label={t("close")} className="absolute inset-0 bg-[#22091f]/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl border-t border-[#e8b04a]/50 bg-[#fffaf2] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:border dark:bg-[#1c1220]">
        <div className="bg-gradient-to-br from-[#3d1236] to-[#22091f] px-5 pt-5 pb-4 text-[#fff6e6]">
          <button type="button" onClick={onClose} aria-label={t("close")} className="absolute top-3 right-3 rounded-full p-2 text-[#ffe9b8] hover:bg-white/10">
            <X size={18} />
          </button>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#7ee2a8]">
            <CheckCircle2 size={18} aria-hidden />
            {t("ready")}
          </p>
          <h2 className="mt-2 font-serif text-xl font-bold">{t("title", { price: from })}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[13px] text-[#ffe9b8]/90">
            {(["b1", "b2", "b3", "b4"] as const).map((k) => (
              <li key={k} className="flex items-center gap-1.5">
                <Check size={13} className="shrink-0 text-[#ffd35c]" aria-hidden />
                {t(k)}
              </li>
            ))}
          </ul>
        </div>
        <div className="px-5 pt-4">
          <p className="text-xs font-semibold tracking-wider text-[#b0791f] uppercase dark:text-[#ffd35c]">{t("pick")}</p>
          <ul className="mt-2 space-y-2">
            {suggestions.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/create/${d.id}?step=design`}
                  onClick={onLeave}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8b04a]/40 px-4 py-3 hover:bg-[#e8b04a]/10"
                >
                  <span className="font-serif font-bold text-[#2a0c27] dark:text-[#fff6e6]">{d.name}</span>
                  <span className="shrink-0 rounded-full bg-gradient-to-br from-[#ffe08a] to-[#e8b04a] px-3 py-1 text-xs font-bold text-[#2a0c27]">
                    ₹{templatePriceInr(d.id)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <Sparkles size={13} aria-hidden />
            {t("keeps")}
          </p>
          <button type="button" onClick={onClose} className="mt-3 h-11 w-full rounded-full text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            {t("later")}
          </button>
        </div>
      </div>
    </div>
  );
}
