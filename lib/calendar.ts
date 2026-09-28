/**
 * Add-to-calendar links built entirely client-side: a Google Calendar
 * "template" URL per event, and one .ics file (Apple / Outlook / Android)
 * holding every event with reminders a day and two hours before.
 *
 * Event times are free text in the editor ("10:00 AM", "6:30 PM onwards",
 * "காலை 9 மணி"). parseTime() picks out the first clock time it can read;
 * when there isn't one the event becomes an all-day entry instead of a
 * guess. Times are taken as India time (the venues this product serves),
 * converted to UTC so every calendar app places them correctly wherever
 * the guest is.
 */

export interface CalendarEvent {
  title: string;
  /** ISO date, "2027-01-24". */
  date: string;
  /** Free text from the editor; may be empty. */
  time: string;
  location: string;
  details: string;
}

/** An ISO date as a local Date at noon (so no time zone shifts it to the
 * neighbouring day when formatted), or null when it isn't one. */
export function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

const VENUE_UTC_OFFSET_MINUTES = 5 * 60 + 30; // IST
const DEFAULT_DURATION_MINUTES = 3 * 60;

/** Hours/minutes of the first readable clock time, or null. Handles
 * "10:00 AM", "6.30pm", "18:30", "7 PM onwards"; a bare "9" without am/pm
 * or minutes is too ambiguous to trust. */
export function parseTime(text: string): { h: number; m: number } | null {
  const match = text.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/i);
  if (!match) return null;
  let h = Number(match[1]);
  const m = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3]?.toLowerCase().replace(/\./g, "");
  if (!match[2] && !meridiem) return null;
  if (m > 59) return null;
  if (meridiem) {
    if (h < 1 || h > 12) return null;
    if (meridiem === "pm" && h !== 12) h += 12;
    if (meridiem === "am" && h === 12) h = 0;
  } else if (h > 23) {
    return null;
  }
  return { h, m };
}

const pad = (n: number) => String(n).padStart(2, "0");

function utcStamp(d: Date) {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
  );
}

/** [start, end] as calendar stamps: UTC date-times, or all-day dates
 * (end is exclusive, so the next day). null when the date is unusable. */
function eventRange(e: CalendarEvent): { start: string; end: string; allDay: boolean } | null {
  const dm = e.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dm) return null;
  const [y, mo, d] = [Number(dm[1]), Number(dm[2]) - 1, Number(dm[3])];
  const t = parseTime(e.time);
  if (!t) {
    const next = new Date(Date.UTC(y, mo, d + 1));
    return {
      start: `${dm[1]}${dm[2]}${dm[3]}`,
      end: `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`,
      allDay: true,
    };
  }
  const startMs = Date.UTC(y, mo, d, t.h, t.m) - VENUE_UTC_OFFSET_MINUTES * 60_000;
  return {
    start: utcStamp(new Date(startMs)),
    end: utcStamp(new Date(startMs + DEFAULT_DURATION_MINUTES * 60_000)),
    allDay: false,
  };
}

export function googleCalendarUrl(e: CalendarEvent): string | null {
  const range = eventRange(e);
  if (!range) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${range.start}/${range.end}`,
    details: e.details,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** RFC 5545 text escaping plus 75-octet line folding. */
function icsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);
}
function fold(line: string) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join("\r\n ");
}

/** One .ics holding every event, each with a day-before and two-hours-before
 * alarm — the guest-side half of RSVP reminders. */
export function buildIcs(events: CalendarEvent[], uidBase: string): string | null {
  const now = utcStamp(new Date());
  const blocks = events.flatMap((e, i) => {
    const range = eventRange(e);
    if (!range) return [];
    const when = range.allDay
      ? [`DTSTART;VALUE=DATE:${range.start}`, `DTEND;VALUE=DATE:${range.end}`]
      : [`DTSTART:${range.start}`, `DTEND:${range.end}`];
    const alarm = (trigger: string) => [
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsText(e.title)}`,
      `TRIGGER:${trigger}`,
      "END:VALARM",
    ];
    return [
      "BEGIN:VEVENT",
      `UID:${uidBase}-${i}@namma-vivaham`,
      `DTSTAMP:${now}`,
      ...when,
      `SUMMARY:${icsText(e.title)}`,
      `DESCRIPTION:${icsText(e.details)}`,
      `LOCATION:${icsText(e.location)}`,
      ...alarm("-P1D"),
      ...(range.allDay ? [] : alarm("-PT2H")),
      "END:VEVENT",
    ];
  });
  if (blocks.length === 0) return null;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Namma Vivaham//Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...blocks,
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");
}
