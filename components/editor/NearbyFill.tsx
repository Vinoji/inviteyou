"use client";

import { Loader2, MapPin, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";

export type NearbyState = "idle" | "loading" | "done" | "error" | "nopin";

/** "Fill in from the venue's location" — at the top of the Travel and
 * Places cards. Without a map pin it sends the couple to find the venue
 * on the map first. */
export default function NearbyFill({
  label,
  state,
  onFill,
  onFindVenue,
}: {
  label: string;
  state: NearbyState;
  onFill: () => void;
  onFindVenue: () => void;
}) {
  const t = useTranslations("editor");
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={onFill}
        disabled={state === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-70"
      >
        {state === "loading" ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Wand2 size={15} aria-hidden />}
        {state === "loading" ? t("nearbyLoading") : label}
      </button>
      {state === "nopin" && (
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-amber-800 dark:text-amber-300">
          {t("nearbyNeedsPin")}
          <button type="button" onClick={onFindVenue} className="inline-flex items-center gap-1 font-semibold underline">
            <MapPin size={12} aria-hidden />
            {t("nearbyFindVenue")}
          </button>
        </p>
      )}
      {state === "error" && <p className="text-xs text-red-600">{t("nearbyError")}</p>}
      {state === "done" && <p className="text-xs text-emerald-700 dark:text-emerald-400">{t("nearbyDone")}</p>}
      {state !== "nopin" && state !== "error" && state !== "done" && (
        <p className="text-[11px] text-neutral-400">{t("nearbyHint")}</p>
      )}
    </div>
  );
}
