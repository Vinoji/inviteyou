"use client";

import { useState, type FormEvent } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { pinUrl } from "@/lib/maps";
import { inputClass } from "./FormFields";

export interface VenueHit {
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
}

/**
 * "Find on map": search OpenStreetMap for the venue (on Enter / the
 * button — the free service doesn't allow search-as-you-type) and pick a
 * match to fill the name, address and a map pin. The pin is what makes
 * guests' Directions start from where they are, and what the Travel and
 * Places suggestions are worked out from.
 */
export default function VenueSearch({
  initialQuery,
  locale,
  pinned,
  onPick,
  onUnpin,
}: {
  initialQuery: string;
  /** The invitation's language, for place names. */
  locale: string;
  pinned: { lat: number; lng: number } | null;
  onPick: (hit: VenueHit) => void;
  onUnpin: () => void;
}) {
  const t = useTranslations("editor");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [results, setResults] = useState<VenueHit[] | null>(null);

  async function search(e?: FormEvent) {
    e?.preventDefault();
    if (query.trim().length < 3) return;
    setState("loading");
    try {
      const res = await fetch(`/api/geo/search?${new URLSearchParams({ q: query, locale })}`);
      if (!res.ok) throw new Error();
      setResults((await res.json()).results);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  if (!open) {
    return pinned ? (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs dark:bg-emerald-950/40">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300">
          <MapPin size={13} aria-hidden />
          {t("venuePinned")}
        </span>
        <a
          href={pinUrl(pinned.lat, pinned.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
        >
          {t("venueSeePin")}
        </a>
        <button type="button" onClick={() => setOpen(true)} className="text-emerald-700 underline underline-offset-2 dark:text-emerald-400">
          {t("venueChangePin")}
        </button>
        <button type="button" onClick={onUnpin} className="ml-auto text-neutral-500 hover:text-red-600" aria-label={t("venueUnpin")}>
          <X size={14} aria-hidden />
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => {
          setQuery(initialQuery);
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50/60 px-3 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
      >
        <MapPin size={15} aria-hidden />
        {t("venueFind")}
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50/40 p-3 dark:border-amber-800 dark:bg-amber-950/20">
      <form onSubmit={search} className="flex gap-2">
        <input
          className={inputClass}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("venueSearchPlaceholder")}
          autoFocus
          enterKeyHint="search"
        />
        <button
          type="submit"
          disabled={state === "loading" || query.trim().length < 3}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          aria-label={t("venueSearch")}
        >
          {state === "loading" ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Search size={15} aria-hidden />}
        </button>
      </form>

      {state === "error" && <p className="text-xs text-red-600">{t("venueSearchError")}</p>}
      {results && results.length === 0 && state === "idle" && (
        <p className="text-xs text-neutral-500">{t("venueNoResults")}</p>
      )}
      {results && results.length > 0 && (
        <ul className="max-h-60 divide-y divide-neutral-100 overflow-y-auto rounded-lg border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-700 dark:bg-neutral-900">
          {results.map((r) => (
            <li key={`${r.lat},${r.lng}`}>
              <button
                type="button"
                onClick={() => {
                  onPick(r);
                  setOpen(false);
                  setResults(null);
                }}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50">{r.name}</span>
                  <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">{r.address}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-2 text-[10px] text-neutral-400">
        <span>{t("venueSearchHint")}</span>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="shrink-0 underline">
          © OpenStreetMap
        </a>
      </div>
      <button type="button" onClick={() => setOpen(false)} className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100">
        {t("cropCancel")}
      </button>
    </div>
  );
}
