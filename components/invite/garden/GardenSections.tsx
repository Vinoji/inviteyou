"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import FamilyLines from "../FamilyLines";
import MotionHeading from "../motion/MotionHeading";
import IntroSweep from "../motion/IntroSweep";
import { useTraverseProgress } from "../motion/scroll";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { directionsUrl } from "@/lib/maps";
import { nameFitScale, resolveMonogram, scriptLang } from "@/lib/monogram";
import type { FamilyMember, MonogramInitials, VenueInfo } from "@/lib/types";
import { Butterfly, HedgeEdge, IvyArch, Meadow, PressedSprig, Wildflower } from "./GardenArt";
import g from "./garden.module.css";

/** Section colours, shared with garden.module.css so hedge edges blend. */
export const GARDEN = {
  /** The hero's grass line, where the first hedge starts. */
  meadow: "#6F9C53",
  cream: "#F7F2E4",
  sage: "#E4EBD6",
  leaf: "#2F4A2C",
  dusk: "#1E2B26",
};

/** ISO yyyy-mm-dd as a local-noon date, so the day never shifts by zone. */
function parseDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

function Head({ eyebrow, heading, sub }: { eyebrow: string; heading: string; sub?: string }) {
  return (
    <div className={g.head}>
      <div className={g.eyebrow}>{eyebrow}</div>
      <MotionHeading>{heading}</MotionHeading>
      <div className={g.sprigRule} aria-hidden>
        <span />
        <Wildflower size={18} />
        <span />
      </div>
      {sub && <p>{sub}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero — a morning garden                                             */
/* ------------------------------------------------------------------ */

export function GardenHero({
  brideName,
  groomName,
  weddingDate,
}: {
  brideName: string;
  groomName: string;
  weddingDate: string;
}) {
  const t = useTranslations("invite.garden.hero");
  const tHero = useTranslations("invite.hero");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const reduceMotion = useSafeReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const p = useTraverseProgress(ref);
  // Layers drift at different speeds as the hero scrolls away.
  const far = useTransform(p, [0.5, 1], [0, 40]);
  const near = useTransform(p, [0.5, 1], [0, 90]);
  const date = parseDate(weddingDate);

  return (
    <section ref={ref} className={g.hero}>
      <div className={g.heroSky} aria-hidden>
        <span className={g.heroSun} />
        <span className={`${g.cloud} ${g.cl1}`} />
        <span className={`${g.cloud} ${g.cl2}`} />
        <span className={`${g.cloud} ${g.cl3}`} />
      </div>
      <motion.div className={g.hillsFar} style={{ y: reduceMotion ? 0 : far }} aria-hidden />
      <motion.div className={g.hillsNear} style={{ y: reduceMotion ? 0 : near }} aria-hidden />
      <div className={g.flyers} aria-hidden>
        <Butterfly className={`${g.flyer} ${g.f1}`} color="#F6C453" />
        <Butterfly className={`${g.flyer} ${g.f2}`} color="#F2A7B8" />
        <Butterfly className={`${g.flyer} ${g.f3}`} color="#FFFFFF" />
      </div>

      <div className={g.heroText}>
        <div className={g.eyebrow}>{t("eyebrow")}</div>
        <h1
          className={g.heroNames}
          lang={scriptLang(`${brideName} ${groomName}`)}
          style={{ ["--name-fit" as string]: nameFitScale(brideName, groomName) }}
        >
          <IntroSweep>{brideName || tCommon("brideFallback")}</IntroSweep>
          <span className={g.heroAmp}>&amp;</span>
          <IntroSweep>{groomName || tCommon("groomFallback")}</IntroSweep>
        </h1>
        <p className={g.heroLead}>{t("lead")}</p>
        <div className={g.heroDate}>
          {date
            ? format.dateTime(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            : tHero("dateTba")}
        </div>
      </div>

      <Meadow className={g.meadow} />
      <div className={g.scrollCue} aria-hidden>
        <span>{t("scroll")}</span>
        <i />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Story — pressed flowers and an ivy-arched portrait                  */
/* ------------------------------------------------------------------ */

export function GardenStory({
  story,
  coverPhoto,
  brideName,
  groomName,
  monogram,
}: {
  story: string;
  coverPhoto?: string;
  brideName: string;
  groomName: string;
  monogram?: MonogramInitials;
}) {
  const t = useTranslations("invite.garden.story");
  const tCommon = useTranslations("common");
  const reduceMotion = useSafeReducedMotion();
  const mono = resolveMonogram(
    brideName || tCommon("brideFallback"),
    groomName || tCommon("groomFallback"),
    monogram,
    false
  );
  if (!story && !coverPhoto) return null;

  return (
    <section className={`${g.section} ${g.creamBg}`}>
      <Head eyebrow={t("eyebrow")} heading={t("heading")} />
      <motion.div
        className={g.archFrame}
        initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className={g.archPhoto}>
          {coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- user uploads from Storage
            <img src={coverPhoto} alt="" />
          ) : (
            <div className={g.archMono}>
              {mono.a}
              <span>&amp;</span>
              {mono.b}
            </div>
          )}
        </div>
        <IvyArch className={g.archIvy} />
      </motion.div>

      {story && (
        <motion.div
          className={g.paper}
          initial={reduceMotion ? false : { opacity: 0, rotate: -2, y: 24 }}
          whileInView={{ opacity: 1, rotate: -0.6, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <PressedSprig className={`${g.pressed} ${g.pressedTL}`} rotate={-28} />
          <PressedSprig className={`${g.pressed} ${g.pressedBR}`} color="#E8A15B" rotate={152} />
          <span className={g.quote} aria-hidden>
            &ldquo;
          </span>
          <p className={g.storyText} lang={scriptLang(story)}>
            {story}
          </p>
          <div className={g.signMono}>
            {mono.a} &amp; {mono.b}
          </div>
        </motion.div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Families — two arched garden windows                                */
/* ------------------------------------------------------------------ */

export function GardenFamilies({
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
  const t = useTranslations("invite.garden.family");
  const tCommon = useTranslations("common");
  const reduceMotion = useSafeReducedMotion();
  if (brideFamily.length === 0 && groomFamily.length === 0) return null;

  const sides = [
    { key: "bride", role: t("bride"), name: brideName || tCommon("brideFallback"), members: brideFamily },
    { key: "groom", role: t("groom"), name: groomName || tCommon("groomFallback"), members: groomFamily },
  ] as const;

  return (
    <section className={`${g.section} ${g.sageBg}`}>
      <Head eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} />
      <div className={g.windows}>
        {sides.map((side, i) => (
          <motion.div
            key={side.key}
            className={g.window}
            initial={reduceMotion ? false : { opacity: 0, x: i ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.12 }}
          >
            <Wildflower className={g.windowFlower} size={26} petal={i ? "#FFFFFF" : "#F2A7B8"} />
            <div className={g.eyebrow}>{side.role}</div>
            <h3 lang={scriptLang(side.name)}>{side.name}</h3>
            <FamilyLines members={side.members} side={side.key} lineClassName={g.kin} nameClassName={g.kinName} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The day — hanging garden signs and stepping stones                  */
/* ------------------------------------------------------------------ */

export interface GardenEvent {
  key: string;
  label: string;
  time: string;
  venue: VenueInfo;
}

/** A wooden sign hanging from two ropes, swinging into place. */
function Sign({ children, i, wide }: { children: React.ReactNode; i: number; wide?: boolean }) {
  const reduceMotion = useSafeReducedMotion();
  return (
    <motion.div
      className={`${g.sign} ${wide ? g.signWide : ""}`}
      initial={reduceMotion ? false : { rotate: i % 2 ? 9 : -9, opacity: 0 }}
      whileInView={{ rotate: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ type: "spring", stiffness: 70, damping: 6, delay: i * 0.12 }}
    >
      <span className={g.rope} aria-hidden />
      <span className={`${g.rope} ${g.ropeR}`} aria-hidden />
      <div className={g.board}>{children}</div>
    </motion.div>
  );
}

export function GardenDay({
  brideName,
  groomName,
  weddingDate,
  events,
  children,
}: {
  brideName: string;
  groomName: string;
  weddingDate: string;
  events: GardenEvent[];
  /** The add-to-calendar buttons. */
  children?: React.ReactNode;
}) {
  const t = useTranslations("invite.garden.day");
  const tHero = useTranslations("invite.hero");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const reduceMotion = useSafeReducedMotion();
  const date = parseDate(weddingDate);
  const shown = events.filter((e) => e.time || e.venue?.name);
  if (shown.length === 0 && !date) return null;
  const first = shown[0];

  return (
    <section className={`${g.section} ${g.creamBg}`}>
      <Head eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} />

      <div className={g.signs}>
        <Sign i={0} wide>
          <span className={g.signScript} lang={scriptLang(`${brideName} ${groomName}`)}>
            {brideName || tCommon("brideFallback")} &amp; {groomName || tCommon("groomFallback")}
          </span>
        </Sign>
        <Sign i={1}>
          <CalendarDays size={16} aria-hidden />
          {date
            ? format.dateTime(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            : tHero("dateTba")}
        </Sign>
        {first?.time && (
          <Sign i={2}>
            <Clock size={16} aria-hidden />
            {first.time}
          </Sign>
        )}
        {first?.venue?.name && (
          <Sign i={3}>
            <MapPin size={16} aria-hidden />
            {first.venue.name}
          </Sign>
        )}
      </div>

      {shown.length > 0 && (
        <div className={g.stones}>
          <svg className={g.stonePath} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d="M50 0C20 25 80 50 50 75S40 100 50 100" fill="none" />
          </svg>
          {shown.map((e, i) => (
            <motion.article
              key={e.key}
              className={`${g.stone} ${i % 2 ? g.stoneR : g.stoneL}`}
              initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className={g.stoneTime}>{e.time || "—"}</div>
              <h3>{e.label}</h3>
              {e.venue?.name && <div className={g.stoneVenue}>{e.venue.name}</div>}
              {e.venue?.address && <p>{e.venue.address}</p>}
              {directionsUrl(e.venue) && (
                <a className={g.pill} href={directionsUrl(e.venue)} target="_blank" rel="noopener noreferrer">
                  <MapPin size={13} aria-hidden /> {t("directions")}
                </a>
              )}
            </motion.article>
          ))}
        </div>
      )}
      {children && <div className={g.calendar}>{children}</div>}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Countdown — numbers painted on terracotta pots                      */
/* ------------------------------------------------------------------ */

function getParts(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export function GardenCountdown({ weddingDate }: { weddingDate: string }) {
  const t = useTranslations("invite.garden.countdown");
  const tUnits = useTranslations("invite.countdown");
  const reduceMotion = useSafeReducedMotion();
  const targetMs = new Date(weddingDate).getTime();
  // Same first render on server and client; live after mount.
  const [parts, setParts] = useState(() => getParts(targetMs));
  useEffect(() => {
    const id = setInterval(() => setParts(getParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  if (!parseDate(weddingDate)) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    { label: tUnits("days"), value: String(parts.days) },
    { label: tUnits("hours"), value: pad(parts.hours) },
    { label: tUnits("minutes"), value: pad(parts.minutes) },
    { label: tUnits("seconds"), value: pad(parts.seconds) },
  ];

  return (
    <section className={`${g.section} ${g.sageBg}`}>
      <Head eyebrow={t("eyebrow")} heading={t("heading")} />
      {parts.done ? (
        <p className={g.began}>{tUnits("began")}</p>
      ) : (
        <div className={g.pots} role="timer" aria-label={t("aria")}>
          {units.map((u, i) => (
            <div key={u.label} className={g.potUnit}>
              <motion.span
                className={g.sprout}
                style={{ ["--h" as string]: `${30 + i * 6}px` }}
                initial={reduceMotion ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                aria-hidden
              >
                <i />
                <i />
              </motion.span>
              <div className={g.potBody}>
                <b suppressHydrationWarning>{u.value}</b>
              </div>
              <span className={g.potLabel}>{u.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Album — polaroids pegged to a garden string line                    */
/* ------------------------------------------------------------------ */

export function GardenAlbum({ photos }: { photos: string[] }) {
  const t = useTranslations("invite.garden.album");
  const [active, setActive] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  if (photos.length === 0) return null;

  const onScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 18 : el.clientWidth;
    setActive(Math.min(photos.length - 1, Math.round(el.scrollLeft / step)));
  };

  return (
    <section className={`${g.section} ${g.leafBg} ${g.album}`}>
      <Head eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} />
      <div className={g.lineWrap}>
        <svg className={g.stringLine} viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden>
          <path d="M0 6Q200 34 400 6" fill="none" />
        </svg>
        <div ref={rowRef} className={g.polaroids} onScroll={onScroll} aria-label={t("carouselLabel")} role="group">
          {photos.map((src, i) => (
            <figure key={src + i} className={g.polaroid} style={{ ["--d" as string]: `${(i % 4) * -1.1}s` }}>
              <span className={g.peg} aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element -- user uploads from Storage */}
              <img src={src} alt={t("photoAlt", { n: i + 1 })} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
      {photos.length > 1 && (
        <div className={g.albumCount} aria-hidden>
          {String(active + 1).padStart(2, "0")}
          <span />
          {String(photos.length).padStart(2, "0")}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* RSVP header, thank-you, and hedge borders                           */
/* ------------------------------------------------------------------ */

export function GardenRsvpHeader() {
  const t = useTranslations("invite.garden.rsvp");
  return <Head eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} />;
}

export function GardenThanks({ names }: { names: string }) {
  const t = useTranslations("invite.garden.thanks");
  return (
    <section className={g.thanks}>
      <div className={g.fireflies} aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ ["--i" as string]: i, left: `${4 + i * 6.7}%`, top: `${20 + ((i * 37) % 60)}%` }} />
        ))}
      </div>
      <div className={g.thanksText}>
        <div className={g.eyebrow}>{t("eyebrow")}</div>
        <h2>{t("heading")}</h2>
        <p lang={scriptLang(names)}>{names}</p>
      </div>
      <Meadow className={g.meadowDusk} height={110} />
    </section>
  );
}

/** A hedge border: `from` is the section above, `to` the one below. */
export function Hedge({ from, to }: { from: string; to: string }) {
  return (
    <div style={{ background: from, lineHeight: 0 }} aria-hidden>
      <HedgeEdge color={to} />
    </div>
  );
}
