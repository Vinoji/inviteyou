import { MapPin } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import type { VenueInfo } from "@/lib/types";
import type { RoyalPalette } from "./palettes";
import { Flourish, Mandapam, Toran } from "./Decor";
import RoyalCountdown from "./RoyalCountdown";
import IntroSweep from "../motion/IntroSweep";
import EventRows from "./EventRows";
import { Palms, Sky } from "../motion/scenery";
import { FamilyBlock, TempleMandala, TemplePaisleys, Thali } from "../motion/moments";
import MotionHeading from "../motion/MotionHeading";
import s from "./royal.module.css";

/** Parses an ISO yyyy-mm-dd as a local-noon date so the day never shifts
 * across time zones when formatted. */
function parseDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function RoyalHero({
  palette,
  brideName,
  groomName,
  weddingDate,
  showCountdown,
}: {
  palette: RoyalPalette;
  brideName: string;
  groomName: string;
  weddingDate: string;
  showCountdown: boolean;
}) {
  const t = useTranslations("invite.royal.hero");
  const tHero = useTranslations("invite.hero");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const date = parseDate(weddingDate);

  return (
    <section className={s.hero}>
      <Sky at="hero" />
      <Palms />
      <div className={s.heroArch}>
        <TempleMandala color={palette.gold} />
        <Toran palette={palette} width={400} height={110} strands={10} className={s.toranHero} />
        <p className={s.lead}>{t("lead")}</p>
        <h1 className={s.names}>
          <IntroSweep className={s.name}>{brideName || tCommon("brideFallback")}</IntroSweep>
          <span className={s.weds}>{t("weds")}</span>
          <IntroSweep className={s.name}>{groomName || tCommon("groomFallback")}</IntroSweep>
        </h1>
        {weddingDate && showCountdown && <RoyalCountdown targetDate={weddingDate} />}
        <div className={s.when}>
          {date
            ? format.dateTime(date, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : tHero("dateTba")}
        </div>
        <Mandapam palette={palette} className={s.mandapam} />
      </div>
      <div className={s.scrollCue} aria-hidden>
        ⌄
      </div>
    </section>
  );
}

export function RoyalFamilies({
  palette,
  brideName,
  groomName,
  brideParents,
  groomParents,
}: {
  palette: RoyalPalette;
  brideName: string;
  groomName: string;
  brideParents: string;
  groomParents: string;
}) {
  const t = useTranslations("invite.royal.family");
  const tCommon = useTranslations("common");
  if (!brideParents && !groomParents) return null;

  return (
    <section className={s.families}>
      <div className={s.archTop}>
        <TemplePaisleys color={palette.goldLight} />
        <div className={s.eyebrow}>{t("eyebrow")}</div>
        <MotionHeading>{t("heading")}</MotionHeading>
        <Flourish color={palette.goldLight} className={s.flourish} />
        <p className={s.introLine}>{t("intro")}</p>
        <FamilyBlock side="left">
          <div className={s.person}>
            <div className={s.role}>{t("bride")}</div>
            <h3>{brideName || tCommon("brideFallback")}</h3>
            {brideParents && (
              <>
                <div className={s.kin}>{t("daughterOf")}</div>
                <div className={s.parents}>{brideParents}</div>
              </>
            )}
          </div>
        </FamilyBlock>
        <Thali color={palette.goldLight} />
        <div className={s.and}>{t("and")}</div>
        <FamilyBlock side="right">
          <div className={s.person} style={{ marginTop: 8 }}>
            <div className={s.role}>{t("groom")}</div>
            <h3>{groomName || tCommon("groomFallback")}</h3>
            {groomParents && (
              <>
                <div className={s.kin}>{t("sonOf")}</div>
                <div className={s.parents}>{groomParents}</div>
              </>
            )}
          </div>
        </FamilyBlock>
      </div>
    </section>
  );
}

function VenueCard({ venue, label }: { venue: VenueInfo; label: string }) {
  const t = useTranslations("invite.royal.events");
  return (
    <div className={s.venue}>
      <div className={s.eyebrow}>{label}</div>
      <h3>{venue.name}</h3>
      {venue.address && <p>{venue.address}</p>}
      {venue.mapsLink && (
        <a className={s.pill} href={venue.mapsLink} target="_blank" rel="noopener noreferrer">
          <MapPin size={13} aria-hidden /> {t("directions")}
        </a>
      )}
    </div>
  );
}

export function RoyalEvents({
  weddingDate,
  city,
  ceremonyTime,
  ceremonyVenue,
  receptionTime,
  receptionVenue,
  eventALabel,
  eventBLabel,
}: {
  weddingDate: string;
  city: string;
  ceremonyTime: string;
  ceremonyVenue: VenueInfo;
  receptionTime: string;
  receptionVenue: VenueInfo;
  eventALabel: string;
  eventBLabel: string;
}) {
  const t = useTranslations("invite.royal.events");
  const format = useFormatter();
  const date = parseDate(weddingDate);

  const events = [
    { key: "a", label: eventALabel, time: ceremonyTime, venue: ceremonyVenue },
    { key: "b", label: eventBLabel, time: receptionTime, venue: receptionVenue },
  ].filter((e) => e.time || e.venue?.name);
  if (events.length === 0) return null;

  // The reception gets its own venue card only when it's actually somewhere else.
  const venues = events
    .map((e) => ({ key: e.key, label: e.label, venue: e.venue }))
    .filter(
      (v, i, all) => v.venue?.name && all.findIndex((o) => o.venue?.name === v.venue.name) === i
    );

  return (
    <section className={`${s.section} ${s.light}`}>
      <div className={s.head}>
        <MotionHeading>{t("heading")}</MotionHeading>
        <p>{t("sub")}</p>
      </div>
      {city && (
        <div className={s.city}>
          <div className={s.eyebrow}>{t("location")}</div>
          <h3>{city}</h3>
        </div>
      )}
      <EventRows
        rows={events.map(({ key, label, time }) => ({
          key,
          label,
          time,
          icon: key === "a" ? ("ceremony" as const) : ("reception" as const),
          date: date
            ? {
                day: format.dateTime(date, { day: "numeric" }),
                month: format.dateTime(date, { month: "short" }),
                weekday: format.dateTime(date, { weekday: "long" }),
              }
            : null,
        }))}
      />
      {venues.map((v) => (
        <VenueCard
          key={v.key}
          venue={v.venue}
          label={venues.length > 1 ? `${t("venue")} · ${v.label}` : t("venue")}
        />
      ))}
    </section>
  );
}
