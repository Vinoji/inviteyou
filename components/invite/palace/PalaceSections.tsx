"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import FamilyLines from "../FamilyLines";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { useTraverseProgress } from "../motion/scroll";
import { scriptLang } from "@/lib/monogram";
import { directionsUrl } from "@/lib/maps";
import type { FamilyMember, VenueInfo } from "@/lib/types";
import type { ShotId } from "./shots";
import { GoldRule, MilestoneIcon } from "./PalaceArt";
import p from "./palace.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

/** ISO yyyy-mm-dd → a local-noon Date (so the day never shifts), or null. */
export function parseDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

/** Slow, soft reveal used throughout: rise a little out of a blur. */
function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useSafeReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** One stop on the camera's journey: a full-width section the 3D palace follows. */
export function Scene({
  shot,
  children,
  className = "",
  id,
}: {
  shot: ShotId;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section data-palace-shot={shot} id={id} className={`${p.scene} ${className}`}>
      {children}
    </section>
  );
}

/** Chapter title floating over the palace: eyebrow, heading, gold rule. */
export function Chapter({ eyebrow, heading, sub }: { eyebrow: string; heading: string; sub?: string }) {
  return (
    <Reveal className={p.chapter}>
      <p className={p.eyebrow}>{eyebrow}</p>
      <h2 className={p.heading}>{heading}</h2>
      <GoldRule />
      {sub && <p className={p.sub}>{sub}</p>}
    </Reveal>
  );
}

/** Content on ivory parchment, for the shared components (travel, FAQ…). */
export function Parchment({ children }: { children: ReactNode }) {
  return (
    <Reveal className={p.parchment}>
      <span className={`${p.corner} ${p.cornerTL}`} aria-hidden />
      <span className={`${p.corner} ${p.cornerBR}`} aria-hidden />
      {children}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* 1 · Entrance                                                        */
/* ------------------------------------------------------------------ */

export function Entrance({ names }: { names: { a: string; b?: string } }) {
  const t = useTranslations("invite.palace.entrance");
  const text = [names.a, names.b].filter(Boolean).join(" ");
  return (
    <Scene shot="entrance" className={p.entrance}>
      <Reveal>
        <p className={p.whisper}>
          {t("line1")}
          <br />
          {t("line2")}
        </p>
      </Reveal>
      <Reveal delay={0.35}>
        <h1 className={p.namesXL} lang={scriptLang(text)}>
          <span>{names.a}</span>
          {names.b !== undefined && (
            <>
              <span className={p.amp}>&amp;</span>
              <span>{names.b}</span>
            </>
          )}
        </h1>
      </Reveal>
      <p className={p.scrollCue}>
        <span>{t("scroll")}</span>
        <span className={p.cueLine} aria-hidden />
      </p>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · The couple                                                      */
/* ------------------------------------------------------------------ */

function Portrait({ src, alt, monogram, side }: { src?: string; alt: string; monogram: string; side: "l" | "r" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useSafeReducedMotion();
  const progress = useTraverseProgress(ref);
  // Gentle parallax only: the two portraits drift a few pixels apart.
  const y = useTransform(progress, [0, 1], reduce ? [0, 0] : side === "l" ? [24, -24] : [-12, 30]);
  return (
    <motion.div ref={ref} className={`${p.portrait} ${side === "r" ? p.portraitR : ""}`} style={{ y }}>
      <div className={p.portraitArch}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} loading="lazy" />
        ) : (
          <span className={p.portraitMonogram} aria-hidden>
            {monogram}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function CoupleHero({
  brideName,
  groomName,
  weddingDate,
  photos,
  monogram,
}: {
  brideName: string;
  groomName: string;
  weddingDate: string;
  photos: string[];
  monogram: { a: string; b: string };
}) {
  const t = useTranslations("invite.palace.hero");
  const format = useFormatter();
  const date = parseDate(weddingDate);
  return (
    <Scene shot="hero" className={p.hero}>
      <Reveal>
        <p className={p.eyebrow}>{t("eyebrow")}</p>
      </Reveal>
      <div className={p.couple}>
        <Portrait src={photos[0]} alt={t("portraitAlt", { name: brideName })} monogram={monogram.a} side="l" />
        <Reveal className={p.coupleNames} delay={0.2}>
          <h2 lang={scriptLang(brideName)}>{brideName}</h2>
          <span className={p.amp}>&amp;</span>
          <h2 lang={scriptLang(groomName)}>{groomName}</h2>
        </Reveal>
        <Portrait src={photos[1]} alt={t("portraitAlt", { name: groomName })} monogram={monogram.b} side="r" />
      </div>
      <Reveal delay={0.35}>
        <GoldRule />
        <p className={p.heroDate}>
          {date
            ? format.dateTime(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            : t("dateTba")}
        </p>
        <p className={p.sub}>{t("together")}</p>
      </Reveal>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Our story                                                       */
/* ------------------------------------------------------------------ */

/** Splits the couple's story into up to four milestones: by paragraph if
 * there are several, otherwise by sentence. */
export function storyMilestones(story: string): string[] {
  const paras = story
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (paras.length >= 2) return [...paras.slice(0, 3), paras.slice(3).join(" ")].filter(Boolean);
  const sentences = (paras[0] ?? "").split(/(?<=[.!?।])\s+/).filter(Boolean);
  const n = Math.min(4, sentences.length);
  if (n === 0) return [];
  const per = Math.ceil(sentences.length / n);
  return Array.from({ length: n }, (_, i) => sentences.slice(i * per, (i + 1) * per).join(" ")).filter(Boolean);
}

/** Which of the four titles each milestone gets — always ending on "Forever". */
const LABELS: Record<number, number[]> = { 1: [0], 2: [0, 3], 3: [0, 1, 3], 4: [0, 1, 2, 3] };

export function StoryTimeline({ story }: { story: string }) {
  const t = useTranslations("invite.palace.story");
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useSafeReducedMotion();
  const progress = useTraverseProgress(ref);
  const line = useTransform(progress, [0.15, 0.75], reduce ? [1, 1] : [0, 1]);
  const items = storyMilestones(story);
  if (items.length === 0) return null;
  const labels = LABELS[items.length];
  return (
    <Scene shot="story">
      <Chapter eyebrow={t("eyebrow")} heading={t("heading")} />
      <ol ref={ref} className={p.timeline}>
        <motion.span className={p.timelineLine} style={{ scaleY: line }} aria-hidden />
        {items.map((text, i) => (
          <li key={i} className={p.milestone}>
            <span className={p.milestoneIcon}>
              <MilestoneIcon index={labels[i]} />
            </span>
            <Reveal className={p.milestoneCard} delay={0.08}>
              <h3>{t(`m${labels[i] + 1}`)}</h3>
              <p lang={scriptLang(text)}>{text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · Families                                                        */
/* ------------------------------------------------------------------ */

export function Families({
  brideName,
  groomName,
  brideFamily,
  groomFamily,
}: {
  brideName: string;
  groomName: string;
  brideFamily: FamilyMember[];
  groomFamily: FamilyMember[];
}) {
  const t = useTranslations("invite.palace.family");
  const cards = [
    { side: "bride" as const, role: t("bride"), name: brideName, members: brideFamily },
    { side: "groom" as const, role: t("groom"), name: groomName, members: groomFamily },
  ].filter((c) => c.members.length > 0);
  return (
    <Scene shot="family">
      <Chapter eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} />
      <div className={p.familyGrid}>
        {cards.map((c, i) => (
          <Reveal key={c.side} delay={i * 0.15} className={p.familyCard}>
            <div className={p.familyInner} tabIndex={0}>
              <p className={p.role}>{c.role}</p>
              <h3 lang={scriptLang(c.name)}>{c.name}</h3>
              <GoldRule />
              <FamilyLines members={c.members} side={c.side} lineClassName={p.kin} nameClassName={p.kinNames} />
            </div>
          </Reveal>
        ))}
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* 5 · Events                                                          */
/* ------------------------------------------------------------------ */

export interface PalaceEvent {
  key: string;
  label: string;
  time: string;
  venue?: VenueInfo;
}

export function Events({ events, weddingDate, children }: { events: PalaceEvent[]; weddingDate: string; children?: ReactNode }) {
  const t = useTranslations("invite.palace.events");
  const format = useFormatter();
  const date = parseDate(weddingDate);
  const dateText = date ? format.dateTime(date, { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : t("tba");
  return (
    <Scene shot="events">
      <Chapter eyebrow={t("eyebrow")} heading={t("heading")} />
      <div className={p.eventGrid}>
        {events.map((e, i) => {
          const maps = directionsUrl(e.venue);
          return (
            <Reveal key={e.key} delay={i * 0.12} className={p.eventCard}>
              <span className={p.eventSeal} aria-hidden>
                {i + 1}
              </span>
              <h3>{e.label}</h3>
              <dl>
                <div>
                  <dt>{t("date")}</dt>
                  <dd>{dateText}</dd>
                </div>
                <div>
                  <dt>{t("time")}</dt>
                  <dd>{e.time || t("tba")}</dd>
                </div>
                {e.venue?.name && (
                  <div>
                    <dt>{t("venue")}</dt>
                    <dd lang={scriptLang(e.venue.name)}>
                      <strong>{e.venue.name}</strong>
                      {e.venue.address && <span className={p.address}>{e.venue.address}</span>}
                    </dd>
                  </div>
                )}
              </dl>
              {maps && (
                <a className={p.ghostBtn} href={maps} target="_blank" rel="noopener noreferrer">
                  <MapPin size={15} aria-hidden />
                  {t("location")}
                </a>
              )}
            </Reveal>
          );
        })}
      </div>
      {children && <div className={p.calendar}>{children}</div>}
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* 6 · Countdown — four palace columns                                 */
/* ------------------------------------------------------------------ */

function parts(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export function Countdown({ weddingDate, ceremonyTime }: { weddingDate: string; ceremonyTime: string }) {
  const t = useTranslations("invite.palace.countdown");
  const reduce = useSafeReducedMotion();
  // The ceremony time when it parses ("10:30 AM"), else the start of the day.
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(ceremonyTime.trim());
  let h = m ? Number(m[1]) % 12 : 0;
  if (m?.[3]?.toUpperCase() === "PM") h += 12;
  if (m && !m[3]) h = Number(m[1]);
  const target = new Date(`${weddingDate}T${String(h).padStart(2, "0")}:${m ? m[2] : "00"}:00`).getTime();
  const [now, setNow] = useState(() => parts(target));
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const first = setTimeout(() => setMounted(true), 0);
    const id = setInterval(() => setNow(parts(target)), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [target]);

  const cols = [
    { key: "days", value: now.days },
    { key: "hours", value: now.hours },
    { key: "minutes", value: now.minutes },
    { key: "seconds", value: now.seconds },
  ] as const;

  return (
    <Scene shot="countdown">
      <Chapter eyebrow={t("eyebrow")} heading={now.done ? t("done") : t("heading")} />
      <div className={p.columns} role="timer" aria-label={t("aria")}>
        {cols.map((c, i) => (
          <Reveal key={c.key} delay={i * 0.1} className={p.column}>
            <span className={p.capital} aria-hidden />
            <span className={p.shaft}>
              {/* Keyed digits only after hydration, so server and client trees match. */}
              {mounted && !reduce ? (
                <motion.span
                  key={c.value}
                  className={p.digit}
                  initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  {String(c.value).padStart(2, "0")}
                </motion.span>
              ) : (
                <span className={p.digit} suppressHydrationWarning>
                  {String(c.value).padStart(2, "0")}
                </span>
              )}
            </span>
            <span className={p.plinth}>{t(c.key)}</span>
          </Reveal>
        ))}
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* 7 · Memories                                                        */
/* ------------------------------------------------------------------ */

export function Gallery({ photos }: { photos: string[] }) {
  const t = useTranslations("invite.palace.gallery");
  const reduce = useSafeReducedMotion();
  if (photos.length === 0) return null;
  const styles = [p.framed, p.floating, p.archFrame];
  return (
    <Scene shot="gallery">
      <Chapter eyebrow={t("eyebrow")} heading={t("heading")} />
      <ul className={p.gallery}>
        {photos.map((src, i) => (
          <motion.li
            key={`${src}-${i}`}
            className={`${p.photo} ${styles[i % styles.length]}`}
            initial={reduce ? false : { opacity: 0, x: i % 2 ? 40 : -40, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 1.2, ease: EASE }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={t("alt", { n: i + 1 })} loading="lazy" />
          </motion.li>
        ))}
      </ul>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Finale                                                              */
/* ------------------------------------------------------------------ */

export function Finale({ names, children }: { names: string; children?: ReactNode }) {
  const t = useTranslations("invite.palace.finale");
  return (
    <Scene shot="finale" className={p.finale}>
      <Reveal>
        <h2 className={p.namesXL} lang={scriptLang(names)}>
          {names}
        </h2>
      </Reveal>
      <Reveal delay={0.3}>
        <p className={p.whisper}>{t("meant")}</p>
        <GoldRule />
        <p className={p.thanks}>{t("thanks")}</p>
      </Reveal>
      {children}
    </Scene>
  );
}
