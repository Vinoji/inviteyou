"use client";

import { useTranslations } from "next-intl";
import { Check, CheckCircle2, Sparkles, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EDITORS_PICKS } from "@/lib/templates";
import { isFreeTemplate, templatePriceInr } from "@/lib/pricing";

/**
 * After a free card downloads: "your card is ready" and the step up — the
 * same invitation as a live link, in a few suggested designs of this
 * occasion. Switching keeps everything they typed (the draft carries over).
 */
export default function UpgradeSheet({
  designs,
  onLeave,
  onClose,
}: {
  designs: { id: string; name: string }[];
  /** Saves the draft before switching design. */
  onLeave: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("editor.upgrade");
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
