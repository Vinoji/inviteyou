"use client";

import { useTranslations } from "next-intl";
import { CalendarPlus } from "lucide-react";
import type { VenueInfo } from "@/lib/types";
import { buildIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/calendar";

const CLASSES = {
  default: {
    wrap: "mt-8 text-center",
    row: "mt-3 flex flex-col justify-center gap-2 sm:flex-row",
    button:
      "inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800",
    hint: "mt-2 text-xs text-neutral-500",
  },
  royal: {
    wrap: "mx-auto mt-6 max-w-[420px] text-center",
    row: "flex flex-col justify-center gap-2 sm:flex-row",
    button:
      "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--rp-gold)] px-5 py-2.5 font-[family-name:var(--rp-caps)] text-[10.5px] tracking-[0.2em] uppercase text-[var(--rp-text)] bg-white/40",
    hint: "mt-2 font-[family-name:var(--rp-display)] text-sm italic text-[var(--rp-muted)]",
  },
};

/**
 * Google Calendar and .ics (Apple / Outlook / Android) buttons for the
 * invitation's events. Links are built on click, from the page's own URL,
 * so the server and client render the same markup.
 */
export default function AddToCalendar({
  slug,
  title,
  date,
  events,
  variant = "default",
}: {
  slug: string;
  /** e.g. "Priya & Arjun's Wedding". */
  title: string;
  /** ISO date of the occasion. */
  date: string;
  events: { label: string; time: string; venue: VenueInfo }[];
  variant?: "default" | "royal";
}) {
  const t = useTranslations("invite.calendar");
  const c = CLASSES[variant];
  const shown = events.filter((e) => e.time || e.venue?.name);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  // No events filled in: still offer the day itself as one entry.
  const list = shown.length ? shown : [{ label: "", time: "", venue: { name: "", address: "" } }];

  function calendarEvents(): CalendarEvent[] {
    const url = `${window.location.origin}/invite/${slug}`;
    return list.map((e) => ({
      title: e.label ? `${e.label} · ${title}` : title,
      date,
      time: e.time,
      location: [e.venue?.name, e.venue?.address].filter(Boolean).join(", "),
      details: t("details", { title, url }),
    }));
  }

  function openGoogle() {
    // Google takes one event per link; the first (the main ceremony) is the
    // one guests most need — the .ics carries all of them.
    const href = googleCalendarUrl(calendarEvents()[0]);
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }

  function downloadIcs() {
    const ics = buildIcs(calendarEvents(), slug);
    if (!ics) return;
    // A data: URL (not a blob) so iOS Safari hands it to Calendar.
    const a = document.createElement("a");
    a.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
    a.download = `${slug}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className={c.wrap}>
      <div className={c.row} role="group" aria-label={t("button")}>
        <button type="button" onClick={openGoogle} className={c.button}>
          <CalendarPlus size={14} aria-hidden />
          {t("google")}
        </button>
        <button type="button" onClick={downloadIcs} className={c.button}>
          <CalendarPlus size={14} aria-hidden />
          {t("ics")}
        </button>
      </div>
      <p className={c.hint}>{t("hint")}</p>
    </div>
  );
}
