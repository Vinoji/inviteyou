"use client";

import { useState, type ReactNode } from "react";
import { Clock, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { VenueInfo } from "@/lib/types";
import { Field, SectionToggle, inputClass } from "./FormFields";

/** "7:00 AM" ⇄ "07:00" for the time pickers; null when it isn't a clock time. */
function to24(text: string): string | null {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i.exec(text.trim());
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (m[3]) h = (h % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0);
  return h < 24 && min < 60 ? `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}` : null;
}
function to12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
/** "7:00 AM – 10:00 AM" → ["07:00", "10:00"]; null when it's other text. */
function parseRange(text: string): [string, string] | null {
  if (!text.trim()) return ["", ""];
  const [a, b, ...rest] = text.split(/\s*(?:–|—|-|\bto\b)\s*/i);
  if (rest.length) return null;
  const from = to24(a);
  const to = b === undefined ? "" : to24(b);
  return from !== null && to !== null ? [from, to] : null;
}
const joinRange = (from: string, to: string) => [from, to].filter(Boolean).map(to12).join(" – ");

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
  included = true,
  onInclude,
  name,
  onName,
}: {
  title: string;
  time: string;
  venue: VenueInfo;
  placeholders: { time: string; venue: string; address: string };
  onTime: (v: string) => void;
  onVenue: (field: "name" | "address" | "mapsLink", v: string) => void;
  /** "Find on map" (VenueSearch), under the venue name. */
  mapSearch?: ReactNode;
  /** Whether this function is on the invitation; with onInclude, a switch. */
  included?: boolean;
  onInclude?: (on: boolean) => void;
  /** The couple's own name for this function ("" = the title above). */
  name?: string;
  onName?: (v: string) => void;
}) {
  const t = useTranslations("editor");
  const range = parseRange(time);
  // Free text ("Evening", "காலை 9 மணி") when it isn't a clock time, or by choice.
  const [typed, setTyped] = useState(range === null);
  const free = typed || range === null;
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className={`flex items-center justify-between gap-3 ${included ? "mb-3" : ""}`}>
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-amber-500 to-rose-500" aria-hidden />
          {name?.trim() || title}
        </h3>
        {onInclude && <SectionToggle enabled={included} onChange={onInclude} />}
      </div>
      {!included ? (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t("eventOff")}</p>
      ) : (
      <div className="space-y-3">
        {onName && (
          <Field label={t("eventNameLabel")}>
            <input
              className={inputClass}
              value={name ?? ""}
              maxLength={60}
              onChange={(e) => onName(e.target.value)}
              placeholder={title}
            />
          </Field>
        )}
        <Field label={t("timeLabel")}>
          {free ? (
            <span className="relative block">
              <Clock size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" aria-hidden />
              <input
                className={`${inputClass} pl-8`}
                value={time}
                onChange={(e) => onTime(e.target.value)}
                placeholder={placeholders.time}
              />
            </span>
          ) : (
            <span className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <input
                type="time"
                aria-label={t("timeFrom")}
                className={inputClass}
                value={range![0]}
                onChange={(e) => onTime(joinRange(e.target.value, range![1]))}
              />
              <span className="text-xs text-neutral-500">{t("timeTo")}</span>
              <input
                type="time"
                aria-label={t("timeUntil")}
                className={inputClass}
                value={range![1]}
                onChange={(e) => onTime(joinRange(range![0], e.target.value))}
              />
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (free && parseRange(time) === null) onTime("");
              setTyped(!free);
            }}
            className="mt-1 text-xs font-semibold text-[#b0791f] underline underline-offset-2 dark:text-[#ffd35c]"
          >
            {free ? t("timePick") : t("timeType")}
          </button>
        </Field>
        <Field label={t("venueNameLabel")}>
          <input
            className={inputClass}
            value={venue.name}
            onChange={(e) => onVenue("name", e.target.value)}
            placeholder={placeholders.venue}
          />
        </Field>
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
      )}
    </section>
  );
}
