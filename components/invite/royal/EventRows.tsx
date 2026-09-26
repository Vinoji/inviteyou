"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flower2, Sparkles } from "lucide-react";
import { EventDiya } from "../motion/moments";
import { useMotionTheme } from "../motion/MotionThemeProvider";
import useSafeReducedMotion from "../useSafeReducedMotion";
import s from "./royal.module.css";

export interface EventRow {
  key: string;
  label: string;
  time: string;
  /** Pre-formatted on the server; null when the date isn't set. */
  date: { day: string; month: string; weekday: string } | null;
  icon: "ceremony" | "reception";
}

/** The row nearest the vertical centre of the screen (its index and its
 * offset within the list), tracked with an IntersectionObserver, so state
 * only changes when the row changes. */
function useActiveRow(count: number, enabled: boolean) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [current, setCurrent] = useState({ index: 0, top: 0 });
  useEffect(() => {
    if (!enabled) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          setCurrent({ index: Number(el.dataset.row), top: el.offsetTop });
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.slice(0, count).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [count, enabled]);
  return { refs, active: current.index, activeTop: current.top };
}

function DateBlock({ date }: { date: EventRow["date"] }) {
  return (
    <div className={s.eventDate}>
      {date ? (
        <>
          <b>{date.day}</b>
          <span>{date.month}</span>
          <i>{date.weekday}</i>
        </>
      ) : (
        <b>—</b>
      )}
    </div>
  );
}

function Info({ row }: { row: EventRow }) {
  const Icon = row.icon === "ceremony" ? Flower2 : Sparkles;
  return (
    <div className={s.eventInfo}>
      <div className={s.ico}>
        <Icon size={16} aria-hidden />
      </div>
      <div>
        <h4>{row.label}</h4>
        {row.time && <div className={s.eventTime}>{row.time}</div>}
      </div>
    </div>
  );
}

/** A footprint pressed into sand. */
function Footprint({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="0 0 20 34"
      width="18"
      height="30"
      aria-hidden
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <ellipse cx="10" cy="22" rx="6.5" ry="10" fill="rgba(156,124,91,0.45)" />
      {[3, 7.5, 12, 16].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={i === 0 ? 7 : 4 + i * 0.6}
          r={i === 0 ? 2.4 : 1.8}
          fill="rgba(156,124,91,0.45)"
        />
      ))}
    </svg>
  );
}

/**
 * The event rows of the wedding layout, in the template's `moments.events`
 * style: default date + info rows; "diyas" (a diya lights at each row's
 * edge); "stickyTimes" (the current event's time pinned large beside the
 * list, swapping as rows pass); "spotlight" (a soft light follows the row
 * nearest the centre); or "footprints" (rows along a curving path, each
 * with a footprint pressing into sand).
 */
export default function EventRows({ rows }: { rows: EventRow[] }) {
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const style = moments?.events;
  const tracking = style === "stickyTimes" || style === "spotlight";
  const { refs, active, activeTop } = useActiveRow(rows.length, tracking);

  if (style === "stickyTimes") {
    const current = rows[active] ?? rows[0];
    return (
      <div className={s.stickyEvents}>
        <div className={s.stickyTime} aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={current.key}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.77, 0, 0.175, 1] }}
            >
              {current.time || "—"}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className={s.stickyList}>
          {rows.map((row, i) => (
            <div
              key={row.key}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-row={i}
              className={s.stickyRow}
            >
              <div className={s.eyebrow}>
                {row.date ? `${row.date.weekday} · ${row.date.day} ${row.date.month}` : "—"}
              </div>
              <h4>{row.label}</h4>
              {row.time && <div className={s.eventTime}>{row.time}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={s.events} style={{ position: "relative" }}>
      {style === "spotlight" && !reduceMotion && (
        <motion.div
          className={s.spotlight}
          aria-hidden
          animate={{ y: activeTop - 40 }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      )}
      {rows.map((row, i) => (
        <div
          key={row.key}
          ref={(el) => {
            refs.current[i] = el;
          }}
          data-row={i}
          className={s.event}
          style={
            style === "footprints"
              ? { marginLeft: i % 2 ? 22 : 0, marginRight: i % 2 ? 0 : 22 }
              : undefined
          }
        >
          {style === "diyas" && <EventDiya />}
          {style === "footprints" && (
            <motion.div
              className={s.footprint}
              style={i % 2 ? { left: -24 } : { right: -24 }}
              initial={reduceMotion ? false : { scale: 1.2, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Footprint flip={i % 2 === 1} />
            </motion.div>
          )}
          <DateBlock date={row.date} />
          <Info row={row} />
        </div>
      ))}
    </div>
  );
}
