import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { directionsUrl } from "@/lib/maps";
import { scriptLang } from "@/lib/monogram";
import { EMPTY_TRAVEL, withDefaultSections, type VenueInfo } from "@/lib/types";
import RsvpForm from "../../RsvpForm";
import AddToCalendar from "../../AddToCalendar";
import GuestGallery from "../../GuestGallery";
import ThingsToKnow from "../../ThingsToKnow";
import BlessingsWall from "../../BlessingsWall";
import ShareBox from "../../ShareBox";
import ArtImage from "../ArtImage";
import { parseDate, type PremiumProps } from "../types";
import Reveal from "./Reveal";
import c from "./cinema.module.css";

/**
 * Building blocks of the cinematic photo templates. Each theme composes
 * them in its own order, around its own photographs and effects, and styles
 * them through its CSS module — passed in as `s`, which defines the class
 * names used here (section, heading, card…). Labels come from
 * `premium.cinema`; each theme's own words from its namespace.
 */
export type Styles = Record<string, string>;

export interface EventRow {
  label: string;
  time: string;
  venue: VenueInfo;
}

/** The two events of an occasion, as the page shows them. */
export function useEvents({ data, category }: Pick<PremiumProps, "data" | "category">) {
  const tView = useTranslations("invite.view");
  const eventBLabel = category.eventBLabel || (category.id === "wedding" ? tView("defaultReception") : "");
  const all: EventRow[] = [
    { label: category.eventALabel, time: data.ceremonyTime, venue: data.ceremonyVenue },
    ...(eventBLabel ? [{ label: eventBLabel, time: data.receptionTime, venue: data.receptionVenue }] : []),
  ];
  return { all, shown: all.filter((e) => e.time || e.venue?.name) };
}

export function useLongDate(iso: string) {
  const format = useFormatter();
  const t = useTranslations("premium.cinema");
  const date = parseDate(iso);
  return {
    date,
    long: date ? format.dateTime(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : t("dateTba"),
    day: date ? format.dateTime(date, { day: "numeric" }) : "",
    month: date ? format.dateTime(date, { month: "short" }) : "",
    weekday: date ? format.dateTime(date, { weekday: "long" }) : "",
  };
}

/** A photograph filling its section, with the theme's motion and overlays. */
export function PhotoLayer({
  templateId,
  slot,
  s,
  zoom = "in",
  children,
  priority,
}: {
  templateId: string;
  slot: string;
  s: Styles;
  zoom?: "in" | "out" | "none";
  children?: ReactNode;
  priority?: boolean;
}) {
  return (
    <div className={s.photoLayer} aria-hidden>
      <ArtImage
        templateId={templateId}
        slot={slot}
        priority={priority}
        className={`${c.photo} ${zoom === "in" ? c.kenburns : zoom === "out" ? c.kenburnsOut : ""}`}
      />
      <span className={s.photoShade} />
      {children}
    </div>
  );
}

export function Heading({ s, kicker, title }: { s: Styles; kicker: string; title: string }) {
  return (
    <header className={s.heading}>
      <Reveal as="p" className={s.kicker}>
        {kicker}
      </Reveal>
      <Reveal as="h2" delay={0.12} className={s.title}>
        <span lang={scriptLang(title)}>{title}</span>
      </Reveal>
    </header>
  );
}

export function EventCards({
  s,
  slug,
  title,
  date,
  events,
}: {
  s: Styles;
  slug: string;
  title: string;
  date: string;
  events: { all: EventRow[]; shown: EventRow[] };
}) {
  const t = useTranslations("premium.cinema");
  return (
    <>
      <div className={s.cards}>
        {events.shown.map((e, i) => {
          const href = directionsUrl(e.venue);
          return (
            <Reveal key={i} delay={i * 0.15} className={s.card}>
              <p className={s.cardLabel} lang={scriptLang(e.label)}>
                {e.label}
              </p>
              {e.time && <p className={s.cardTime}>{e.time}</p>}
              {e.venue?.name && <p className={s.cardVenue}>{e.venue.name}</p>}
              {e.venue?.address && <p className={s.cardAddress}>{e.venue.address}</p>}
              {href && e.venue?.name && (
                <a className={s.button} href={href} target="_blank" rel="noopener noreferrer">
                  <MapPin size={14} aria-hidden /> {t("directions")}
                </a>
              )}
            </Reveal>
          );
        })}
      </div>
      <AddToCalendar
        slug={slug}
        title={title}
        date={date}
        events={events.all}
        classes={{ wrap: s.calendar, row: s.calendarRow, button: s.button, hint: s.calendarHint }}
      />
    </>
  );
}

/** The story as prose, first photo alongside. */
export function Story({ s, text, photo, signoff }: { s: Styles; text: string; photo?: string; signoff?: string }) {
  const paras = text.split(/\n{2,}/).filter(Boolean);
  return (
    <div className={s.story}>
      {photo && (
        <Reveal className={s.storyPhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" loading="lazy" />
        </Reveal>
      )}
      {paras.map((p, i) => (
        <Reveal as="p" key={i} delay={0.1 * i} className={i === 0 ? s.lead : undefined}>
          <span lang={scriptLang(p)}>{p}</span>
        </Reveal>
      ))}
      {signoff && (
        <Reveal as="p" className={s.signoff}>
          {signoff}
        </Reveal>
      )}
    </div>
  );
}

/** Their photos, as the theme lays them out (grid, prints, film strip…). */
export function Photos({ s, photos }: { s: Styles; photos: string[] }) {
  return (
    <div className={s.photos}>
      {photos.map((src, i) => (
        <Reveal key={src} delay={(i % 3) * 0.1} className={s.photo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" />
        </Reveal>
      ))}
    </div>
  );
}

/** Travel and places, as a short typeset guide. */
export function Guide({ s, data }: { s: Styles; data: PremiumProps["data"] }) {
  const t = useTranslations("premium.cinema");
  const sections = withDefaultSections(data.sections);
  const travel = data.travel ?? EMPTY_TRAVEL;
  const places = data.places ?? [];
  const rows: { head: string; items: { name: string; meta: string; text?: string }[] }[] = [];
  if (sections.travel && travel.airports.length)
    rows.push({ head: t("byAir"), items: travel.airports.map((a) => ({ name: `${a.code} · ${a.name}`, meta: a.distance })) });
  if (sections.travel && (travel.stations ?? []).length)
    rows.push({
      head: t("byTrain"),
      items: (travel.stations ?? []).map((x) => ({ name: `${x.code} · ${x.name}`, meta: x.distance })),
    });
  if (sections.places && places.length)
    rows.push({ head: t("nearby"), items: places.map((p) => ({ name: p.title, meta: p.distance, text: p.description })) });
  if (!rows.length) return null;
  return (
    <div className={s.guide}>
      {rows.map((r) => (
        <Reveal key={r.head} className={s.guideCol}>
          <p className={s.guideHead}>{r.head}</p>
          {r.items.map((it, i) => (
            <div key={i} className={s.guideItem}>
              <p>
                <b lang={scriptLang(it.name)}>{it.name}</b>
                {it.meta && <span>{it.meta}</span>}
              </p>
              {it.text && <p className={s.guideText}>{it.text}</p>}
            </div>
          ))}
        </Reveal>
      ))}
    </div>
  );
}

export function hasGuide(data: PremiumProps["data"]): boolean {
  const sections = withDefaultSections(data.sections);
  const travel = data.travel ?? EMPTY_TRAVEL;
  return (
    (sections.travel && (travel.airports.length > 0 || (travel.stations ?? []).length > 0)) ||
    (sections.places && (data.places ?? []).length > 0)
  );
}

/** FAQ, guest photos, RSVP, blessings and sharing — the working parts. */
export function Working({
  s,
  props,
  replyHead,
  events,
}: {
  s: Styles;
  props: PremiumProps;
  replyHead: ReactNode;
  events: EventRow[];
}) {
  const { data, slug, mode, rsvpMessages, guestPhotos, guestGreeting, occasionTitle, coupleLabel } = props;
  const sections = withDefaultSections(data.sections);
  const id = data.templateId;
  return (
    <>
      {sections.faq && (data.faq ?? []).length > 0 && (
        <div className={s.shared}>
          <ThingsToKnow faq={data.faq ?? []} accentColor={data.accentColor} fontPairing={data.fontPairing} templateId={id} />
        </div>
      )}
      {sections.guestPhotos && (
        <div className={s.shared}>
          <GuestGallery
            slug={slug}
            photos={guestPhotos}
            accentColor={data.accentColor}
            fontPairing={data.fontPairing}
            templateId={id}
            mode={mode}
          />
        </div>
      )}
      {sections.rsvp && (
        <section className={s.reply}>
          <RsvpForm
            slug={slug}
            accentColor={data.accentColor}
            templateId={id}
            brideName={data.brideName}
            groomName={data.groomName}
            mode={mode}
            initialName={guestGreeting}
            header={replyHead}
            classes={{
              section: s.replyForm,
              label: s.formLabel,
              input: s.formInput,
              button: s.formButton,
              thanksCard: s.thanksCard,
              thanksTitle: s.thanksTitle,
              thanksBody: s.thanksBody,
              note: s.formNote,
            }}
          />
        </section>
      )}
      {sections.rsvp && mode === "public" && rsvpMessages.length > 0 && (
        <div className={s.shared}>
          <BlessingsWall messages={rsvpMessages} accentColor={data.accentColor} fontPairing={data.fontPairing} templateId={id} />
        </div>
      )}
      {mode === "public" && (
        <div className={s.shared}>
          <ShareBox
            slug={slug}
            occasionTitle={occasionTitle}
            accentColor={data.accentColor}
            weddingDate={data.weddingDate}
            hosts={coupleLabel}
            events={events}
          />
        </div>
      )}
    </>
  );
}
