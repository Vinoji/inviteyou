"use client";

import type { ReactNode } from "react";
import { Clock, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { VenueInfo } from "@/lib/types";
import { Field, inputClass } from "./FormFields";

/** One event (ceremony / reception…) as a card: time and venue side by
 * side, address and map link below. */
export default function EventFields({
  title,
  time,
  venue,
  placeholders,
  onTime,
  onVenue,
  mapSearch,
}: {
  title: string;
  time: string;
  venue: VenueInfo;
  placeholders: { time: string; venue: string; address: string };
  onTime: (v: string) => void;
  onVenue: (field: "name" | "address" | "mapsLink", v: string) => void;
  /** "Find on map" (VenueSearch), under the venue name. */
  mapSearch?: ReactNode;
}) {
  const t = useTranslations("editor");
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-amber-500 to-rose-500" aria-hidden />
        {title}
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">
          <Field label={t("timeLabel")}>
            <span className="relative block">
              <Clock size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" aria-hidden />
              <input
                className={`${inputClass} pl-8`}
                value={time}
                onChange={(e) => onTime(e.target.value)}
                placeholder={placeholders.time}
              />
            </span>
          </Field>
          <Field label={t("venueNameLabel")}>
            <input
              className={inputClass}
              value={venue.name}
              onChange={(e) => onVenue("name", e.target.value)}
              placeholder={placeholders.venue}
            />
          </Field>
        </div>
        {mapSearch}
        <Field label={t("addressLabel")}>
          <textarea
            className={inputClass}
            rows={2}
            value={venue.address}
            onChange={(e) => onVenue("address", e.target.value)}
            placeholder={placeholders.address}
          />
        </Field>
        <Field label={t("mapsLinkLabel")}>
          <span className="relative block">
            <MapPin size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" aria-hidden />
            <input
              type="url"
              className={`${inputClass} pl-8`}
              value={venue.mapsLink ?? ""}
              onChange={(e) => onVenue("mapsLink", e.target.value)}
              placeholder={t("mapsPlaceholder")}
            />
          </span>
        </Field>
      </div>
    </section>
  );
}
