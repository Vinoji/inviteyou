"use client";

import { Fragment, useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import FamilyLines from "../FamilyLines";
import IntroSweep from "../motion/IntroSweep";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { directionsUrl } from "@/lib/maps";
import { nameFitScale, resolveMonogram, scriptLang } from "@/lib/monogram";
import type { FamilyMember, MonogramInitials, VenueInfo } from "@/lib/types";
import { Candle, Dove, LaceEdge, Posy, WaxSeal } from "./ChapelArt";
import c from "./chapel.module.css";

/** ISO yyyy-mm-dd as a local-noon date, so the day never shifts by zone. */
function parseDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

/** A small gold cross between two hairlines. */
function CrossRule() {
  return (
    <div className={c.crossRule} aria-hidden>
      <span />
      <svg viewBox="0 0 12 16" width="11" height="15">
        <rect x="5" y="0" width="2" height="16" rx="1" fill="#B8975A" />
        <rect x="1" y="4" width="10" height="2" rx="1" fill="#B8975A" />
      </svg>
      <span />
    </div>
  );
}

/** The heading at the top of a booklet page. */
export function PageHead({ eyebrow, heading, sub }: { eyebrow: string; heading: string; sub?: string }) {
  return (
    <header className={c.pageHead}>
      <div className={c.eyebrow}>{eyebrow}</div>
      <h2>{heading}</h2>
      <CrossRule />
      {sub && <p>{sub}</p>}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Backdrop — inside the chapel: window light down a candlelit aisle   */
/* ------------------------------------------------------------------ */

/** Candle stands and posies along the aisle, near to far (bottom → up). */
const AISLE = [
  { bottom: 2, offset: 36, scale: 1 },
  { bottom: 30, offset: 25, scale: 0.72 },
  { bottom: 52, offset: 18, scale: 0.52 },
  { bottom: 68, offset: 13, scale: 0.38 },
];

/** The chapel interior the booklet rests in. Purely decorative. */
export function ChapelBackdrop() {
  return (
    <div className={c.backdrop} aria-hidden>
      <div className={c.wall}>
        <div className={c.heroWindow}>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <div className={c.rays} />
      </div>
      <div className={c.floor}>
        <div className={c.runner} />
        {AISLE.map((row, i) =>
          (["l", "r"] as const).map((side) => (
            <div
              key={`${i}${side}`}
              className={`${c.aisleStand} ${side === "l" ? c.standL : c.standR}`}
              style={{
                bottom: `${row.bottom}%`,
                [side === "l" ? "right" : "left"]: `${50 + row.offset}%`,
                ["--s" as string]: row.scale,
              }}
            >
              <Candle className={c.aisleCandle} flameClassName={c.flame} height={56} />
              <Posy className={c.aislePosy} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cover                                                               */
/* ------------------------------------------------------------------ */

export function CoverPage({
  brideName,
  groomName,
  weddingDate,
}: {
  brideName: string;
  groomName: string;
  weddingDate: string;
}) {
  const t = useTranslations("invite.chapel.hero");
  const tHero = useTranslations("invite.hero");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const date = parseDate(weddingDate);

  return (
    <div className={c.cover}>
      <Dove className={c.coverDove} color="#E8D096" />
      <div className={c.eyebrow}>{t("eyebrow")}</div>
      <h1
        className={c.coverNames}
        lang={scriptLang(`${brideName} ${groomName}`)}
        style={{ ["--name-fit" as string]: nameFitScale(brideName, groomName) }}
      >
        <IntroSweep>{brideName || tCommon("brideFallback")}</IntroSweep>
        <span className={c.coverAmp}>&amp;</span>
        <IntroSweep>{groomName || tCommon("groomFallback")}</IntroSweep>
      </h1>
      <p className={c.coverLead}>{t("lead")}</p>
      <div className={c.coverDate}>
        {date
          ? format.dateTime(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
          : tHero("dateTba")}
      </div>
      <CrossRule />
      <p className={c.verse}>
        {t("verse")}
        <span>{t("verseRef")}</span>
      </p>
      <p className={c.turnHint} aria-hidden>
        {t("turn")} →
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Story — a stained-glass arch and a sealed letter                    */
/* ------------------------------------------------------------------ */

/** Pointed (gothic) arch in 0–1 units, for clipping and the frame. */
const GOTHIC = "M0 1V0.42Q0 0.12 0.5 0Q1 0.12 1 0.42V1Z";
const GLASS = ["#8FB3D9", "#E8A9B8", "#F3D27A", "#A9C9A4"];

export function StoryPage({
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
  const t = useTranslations("invite.chapel.story");
  const tCommon = useTranslations("common");
  const clipId = `chapel-arch-${useId().replace(/[^\w-]/g, "")}`;
  const mono = resolveMonogram(
    brideName || tCommon("brideFallback"),
    groomName || tCommon("groomFallback"),
    monogram,
    false
  );

  return (
    <>
      <PageHead eyebrow={t("eyebrow")} heading={t("heading")} />
      <div className={c.glassArch}>
        <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={GOTHIC} />
          </clipPath>
        </svg>
        <div className={c.archPhoto} style={{ clipPath: `url(#${clipId})` }}>
          {coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- user uploads from Storage
            <img src={coverPhoto} alt="" />
          ) : (
            <div className={c.archMono}>
              {mono.a}
              <span>&amp;</span>
              {mono.b}
            </div>
          )}
        </div>
        <svg className={c.archFrame} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden>
          <path d={GOTHIC} fill="none" stroke="#B8975A" strokeWidth="12" vectorEffect="non-scaling-stroke" />
          {GLASS.map((color, i) => (
            <path
              key={color}
              d={GOTHIC}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray="14 42"
              strokeDashoffset={-i * 14}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={GOTHIC} fill="none" stroke="#FBF7EF" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      {story && (
        <div className={c.letter}>
          <p className={c.storyText} lang={scriptLang(story)}>
            {story}
          </p>
          <WaxSeal className={c.seal} initials={`${mono.a}${mono.b ?? ""}`} />
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Families — lace-edged cards                                         */
/* ------------------------------------------------------------------ */

export function FamiliesPage({
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
  const t = useTranslations("invite.chapel.family");
  const tCommon = useTranslations("common");
  const sides = [
    { key: "bride", role: t("bride"), name: brideName || tCommon("brideFallback"), members: brideFamily },
    { key: "groom", role: t("groom"), name: groomName || tCommon("groomFallback"), members: groomFamily },
  ] as const;

  return (
    <>
      <PageHead eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} />
      <div className={c.cards}>
        {sides.map((side) => (
          <div key={side.key} className={c.card}>
            <div className={c.cardLace}>
              <LaceEdge color="#F8F1E8" holes="#FFFDF8" />
            </div>
            <div className={c.eyebrow}>{side.role}</div>
            <h3 lang={scriptLang(side.name)}>{side.name}</h3>
            <FamilyLines members={side.members} side={side.key} lineClassName={c.kin} nameClassName={c.kinName} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The day — the order of service                                      */
/* ------------------------------------------------------------------ */

export interface ChapelEvent {
  key: string;
  label: string;
  time: string;
  venue: VenueInfo;
}

export function ServicePage({
  events,
  children,
}: {
  events: ChapelEvent[];
  /** The add-to-calendar buttons. */
  children?: React.ReactNode;
}) {
  const t = useTranslations("invite.chapel.day");
  const shown = events.filter((e) => e.time || e.venue?.name);

  return (
    <>
      <PageHead eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} />
      <ol className={c.service}>
        {shown.map((e, i) => (
          <li key={e.key}>
            <div className={c.serviceNo}>{["I", "II", "III"][i]}</div>
            <div className={c.serviceBody}>
              <div className={c.serviceTime}>{e.time || "—"}</div>
              <h3>{e.label}</h3>
              {e.venue?.name && <div className={c.serviceVenue}>{e.venue.name}</div>}
              {e.venue?.address && <p>{e.venue.address}</p>}
              {directionsUrl(e.venue) && (
                <a className={c.pill} href={directionsUrl(e.venue)} target="_blank" rel="noopener noreferrer">
                  <MapPin size={13} aria-hidden /> {t("directions")}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
      {children && <div className={c.calendar}>{children}</div>}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Countdown — a wooden hymn board                                     */
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

export function CountdownPage({ weddingDate }: { weddingDate: string }) {
  const t = useTranslations("invite.chapel.countdown");
  const tUnits = useTranslations("invite.countdown");
  const reduceMotion = useSafeReducedMotion();
  const targetMs = new Date(weddingDate).getTime();
  // Same first render on server and client; live after mount.
  const [parts, setParts] = useState(() => getParts(targetMs));
  useEffect(() => {
    const id = setInterval(() => setParts(getParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    { label: tUnits("days"), value: String(parts.days) },
    { label: tUnits("hours"), value: pad(parts.hours) },
    { label: tUnits("minutes"), value: pad(parts.minutes) },
    { label: tUnits("seconds"), value: pad(parts.seconds) },
  ];

  return (
    <>
      <PageHead eyebrow={t("eyebrow")} heading={t("heading")} />
      {parts.done ? (
        <p className={c.began}>{tUnits("began")}</p>
      ) : (
        <div className={c.hymnBoard} role="timer" aria-label={t("aria")}>
          <div className={c.boardTitle}>{t("board")}</div>
          {units.map((u, i) => (
            <div key={u.label} className={c.boardRow}>
              <span className={c.boardLabel}>{u.label}</span>
              <motion.b
                className={c.boardNumber}
                suppressHydrationWarning
                initial={reduceMotion ? false : { y: -14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
              >
                {u.value}
              </motion.b>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Album — photos in a row of chapel windows                           */
/* ------------------------------------------------------------------ */

export function AlbumPage({ photos }: { photos: string[] }) {
  const t = useTranslations("invite.chapel.album");
  return (
    <>
      <PageHead eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} />
      <div className={c.windows} role="group" aria-label={t("carouselLabel")}>
        {photos.map((src, i) => (
          <figure key={src + i} className={c.window}>
            {/* eslint-disable-next-line @next/next/no-img-element -- user uploads from Storage */}
            <img src={src} alt={t("photoAlt", { n: i + 1 })} loading="lazy" />
          </figure>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* RSVP header and back cover                                          */
/* ------------------------------------------------------------------ */

export function ChapelRsvpHeader() {
  const t = useTranslations("invite.chapel.rsvp");
  return <PageHead eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} />;
}

export function BackCoverPage({ names }: { names: string }) {
  const t = useTranslations("invite.chapel.thanks");
  return (
    <div className={c.backCover}>
      <div className={c.nightDoves} aria-hidden>
        <Dove className={c.nightDove} />
        <Dove className={c.nightDove} />
      </div>
      <div className={c.eyebrow}>{t("eyebrow")}</div>
      <h2>{t("heading")}</h2>
      <p lang={scriptLang(names)}>{names}</p>
      <div className={c.nightChapel} aria-hidden>
        <span className={c.nightWindow} />
        <span className={c.nightDoor} />
      </div>
      <div className={c.candleRow} aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <Fragment key={i}>
            {i === 2 && <span className={c.candleGap} />}
            <Candle className={c.rowCandle} flameClassName={c.flame} height={24 + (i % 3) * 12} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
