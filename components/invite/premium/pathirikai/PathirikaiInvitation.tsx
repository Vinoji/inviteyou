import type { CSSProperties, ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { getFamily } from "@/lib/family";
import { directionsUrl } from "@/lib/maps";
import { nameFitScale, scriptLang } from "@/lib/monogram";
import { getFontPairing } from "@/lib/fontPairings";
import { getTemplateConfig } from "@/lib/templates";
import { EMPTY_TRAVEL, withDefaultSections, type VenueInfo } from "@/lib/types";
import FamilyLines from "../../FamilyLines";
import IntroHost from "../../intros/IntroHost";
import AudioToggle from "../../AudioToggle";
import RsvpForm from "../../RsvpForm";
import AddToCalendar from "../../AddToCalendar";
import GuestGallery from "../../GuestGallery";
import ThingsToKnow from "../../ThingsToKnow";
import BlessingsWall from "../../BlessingsWall";
import ShareBox from "../../ShareBox";
import Section from "../../motion/Section";
import ArtImage from "../ArtImage";
import { parseDate, type PremiumProps } from "../types";
import { pathirikaiColors } from "./colors";
import { BrassLamp, KolamBorder, MangoLeaves } from "./drawn";
import m from "../materials.module.css";
import s from "./pathirikai.module.css";

/**
 * Temple Gopuram — a Tamil wedding pathirikai. The invitation is the
 * printed card itself, lying on a kolam-drawn floor: thick ivory stock with
 * torn edges, turmeric and kumkum pressed into the corners (as families do
 * before handing a card over), "உ" at the head, gold-foil names and the
 * traditional order — invocation, the families' request, the couple, the
 * muhurtham. The rest of the page follows as inserts of the same card:
 * function cards, a folded letter, prints, a reply card.
 *
 * Art slots (public/art/temple-gopuram/, see docs/template-art.md): floor,
 * ganesha, lamp, thoranam. Each falls back to drawn art until added.
 */
export default function PathirikaiInvitation({
  data,
  slug,
  mode,
  category,
  occasionTitle,
  coupleLabel,
  rsvpMessages,
  guestPhotos,
  guestGreeting,
}: PremiumProps) {
  const t = useTranslations("premium.pathirikai");
  const tText = useTranslations("invite.templateText");
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const id = data.templateId;
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const travel = data.travel ?? EMPTY_TRAVEL;
  const places = data.places ?? [];
  const date = parseDate(data.weddingDate);
  const bride = data.brideName || tCommon("brideFallback");
  const groom = data.groomName || tCommon("groomFallback");
  const brideFamily = getFamily(data, "bride");
  const groomFamily = getFamily(data, "groom");
  const hasFamily = sections.family && brideFamily.length + groomFamily.length > 0;
  const eventBLabel = category.eventBLabel || tView("defaultReception");
  const events = [
    { label: category.eventALabel, time: data.ceremonyTime, venue: data.ceremonyVenue },
    { label: eventBLabel, time: data.receptionTime, venue: data.receptionVenue },
  ];
  const shownEvents = events.filter((e) => e.time || e.venue?.name);
  const photos = data.photos ?? [];
  // The template's own invocation, else its layout style's (temple: the Ganesha invocation).
  const tStyles = useTranslations("invite.styles");
  const look = getTemplateConfig(id).layout;
  const invocation = tText.has(`${id}.invocation`)
    ? tText(`${id}.invocation`)
    : look && tStyles.has(`${look}.invocation`)
      ? tStyles(`${look}.invocation`)
      : "";

  const style = {
    "--p-heading": font.headingVar,
    "--p-body": font.bodyVar,
    "--accent": data.accentColor,
    "--inv-heading": font.headingVar,
    ...pathirikaiColors(id, data.accentColor),
  } as CSSProperties;

  const dayLine = date ? format.dateTime(date, { weekday: "long" }) : "";
  const dateLine = date
    ? format.dateTime(date, { day: "numeric", month: "long", year: "numeric" })
    : t("dateTba");

  return (
    <div data-invite-root className={s.root} style={style}>
      <IntroHost
        introId={getTemplateConfig(id).intro}
        templateId={id}
        slug={slug}
        preview={mode === "preview"}
        weddingDate={data.weddingDate}
        brideName={data.brideName}
        groomName={data.groomName}
        singlePerson={category.singlePerson}
        accentColor={data.accentColor}
        fontPairing={data.fontPairing}
        monogram={data.monogram}
        greeting={guestGreeting}
      />
      {mode === "public" && (
        <AudioToggle src={data.backgroundMusic || undefined} templateId={id} accentColor={data.accentColor} />
      )}

      {/* ── The card on the floor ── */}
      <section className={s.floor}>
        <ArtImage templateId={id} slot="floor" className={s.floorArt} priority />
        <div className={s.thoranam} aria-hidden>
          <ArtImage templateId={id} slot="thoranam" className={s.thoranamArt} priority fallback={<MangoLeaves />} />
        </div>

        <article className={`${s.card} ${m.paper} ${m.lifted}`}>
          <span className={`${s.turmeric} ${s.tl}`} aria-hidden />
          <span className={`${s.turmeric} ${s.tr}`} aria-hidden />
          <span className={`${s.turmeric} ${s.bl}`} aria-hidden />
          <span className={`${s.turmeric} ${s.br}`} aria-hidden />
          <div className={s.frame} aria-hidden>
            <span className={m.foilLine} />
            <span className={m.foilLine} />
          </div>

          <div className={s.cardInner}>
            <p className={s.pillaiyarSuzhi} aria-hidden>
              உ
            </p>
            <div className={s.deity}>
              <ArtImage templateId={id} slot="ganesha" alt="" className={s.deityArt} priority fallback={<BrassLamp small />} />
            </div>
            {invocation && (
              <p className={`${s.invocation} ${m.press}`} lang={scriptLang(invocation)}>
                {invocation.split("\n").pop()}
              </p>
            )}

            <p className={`${s.request} ${m.press}`}>{t("request")}</p>

            <div
              className={s.couple}
              style={{ ["--name-fit" as string]: nameFitScale(data.groomName, data.brideName) }}
            >
              <div className={s.person}>
                <p className={s.role}>{t("groom")}</p>
                <h1 className={`${s.name} ${m.foil}`} lang={scriptLang(groom)}>
                  <span className={s.honorific}>{t("groomHonorific")}</span> {groom}
                </h1>
                {hasFamily && (
                  <FamilyLines members={groomFamily} side="groom" lineClassName={s.kin} nameClassName={s.kinName} />
                )}
              </div>
              <p className={s.with} aria-hidden>
                <span />
                {t("with")}
                <span />
              </p>
              <div className={s.person}>
                <p className={s.role}>{t("bride")}</p>
                <h1 className={`${s.name} ${m.foil}`} lang={scriptLang(bride)}>
                  <span className={s.honorific}>{t("brideHonorific")}</span> {bride}
                </h1>
                {hasFamily && (
                  <FamilyLines members={brideFamily} side="bride" lineClassName={s.kin} nameClassName={s.kinName} />
                )}
              </div>
            </div>

            <div className={s.muhurtham}>
              <p className={s.muhurthamLabel}>{t("muhurtham")}</p>
              {dayLine && <p className={s.day}>{dayLine}</p>}
              <p className={`${s.date} ${m.press}`}>{dateLine}</p>
              {data.ceremonyTime && <p className={s.time}>{t("time", { time: data.ceremonyTime })}</p>}
              {data.ceremonyVenue?.name && (
                <p className={s.venue}>
                  {data.ceremonyVenue.name}
                  {data.ceremonyVenue.address && <span>{data.ceremonyVenue.address}</span>}
                </p>
              )}
            </div>

            <p className={`${s.blessing} ${m.press}`}>{t("blessing")}</p>
          </div>
        </article>
        <p className={s.scrollHint} aria-hidden>
          {t("scroll")}
        </p>
      </section>

      <div className={s.table}>
        {/* ── Function cards (inserts) ── */}
        {sections.schedule && shownEvents.length > 0 && (
          <Section index={1}>
            <section className={s.block}>
              <Heading kicker={t("functionsKicker")} title={t("functions")} />
              <div className={s.inserts}>
                {shownEvents.map((e, i) => (
                  <EventInsert key={i} label={e.label} time={e.time} venue={e.venue} directions={t("directions")} lampSlot={
                    <ArtImage templateId={id} slot="lamp" className={s.lampArt} fallback={<BrassLamp />} />
                  } />
                ))}
              </div>
              <AddToCalendar
                slug={slug}
                title={occasionTitle}
                date={data.weddingDate}
                events={events}
                classes={{
                  wrap: `${s.calendar}`,
                  row: s.calendarRow,
                  button: s.pillButton,
                  hint: s.calendarHint,
                }}
              />
            </section>
          </Section>
        )}

        {/* ── A folded letter: their story, with the first photo tucked in ── */}
        {sections.story && data.story && (
          <Section index={2}>
            <section className={s.block}>
              <Heading kicker={t("storyKicker")} title={category.storyTitle || t("story")} />
              <div className={`${s.letter} ${m.paper} ${m.lifted}`}>
                {photos[0] && (
                  <figure className={s.tucked}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photos[0]} alt={coupleLabel} loading="lazy" />
                  </figure>
                )}
                {data.story.split(/\n{2,}/).map((para, i) => (
                  <p key={i} className={i === 0 ? s.dropCap : undefined} lang={scriptLang(para)}>
                    {para}
                  </p>
                ))}
                <p className={s.signoff}>{t("signoff", { names: coupleLabel })}</p>
              </div>
            </section>
          </Section>
        )}

        {/* ── Prints, held with photo corners ── */}
        {sections.gallery && photos.length > 1 && (
          <Section index={3}>
            <section className={s.block}>
              <Heading kicker={t("photosKicker")} title={t("photos")} />
              <div className={s.prints}>
                {photos.slice(1, 7).map((src, i) => (
                  <figure key={src} className={s.print} style={{ ["--tilt" as string]: `${[-2.2, 1.6, -1, 2.4, -1.8, 1.2][i]}deg` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" />
                    <span className={s.corner} />
                    <span className={s.corner} />
                  </figure>
                ))}
              </div>
            </section>
          </Section>
        )}

        {/* ── How to reach, as a typeset route card ── */}
        {((sections.travel && (travel.airports.length > 0 || (travel.stations ?? []).length > 0)) ||
          (sections.places && places.length > 0)) && (
          <Section index={4}>
            <section className={s.block}>
              <Heading kicker={t("travelKicker")} title={travel.city ? t("travelCity", { city: travel.city }) : t("travel")} />
              <div className={`${s.routeCard} ${m.paper} ${m.lifted}`}>
                {sections.travel && travel.airports.length > 0 && (
                  <div className={s.routeGroup}>
                    <p className={s.routeLabel}>{t("byAir")}</p>
                    {travel.airports.map((a, i) => (
                      <p key={i} className={s.routeRow}>
                        <b>{a.code}</b>
                        <span>{a.name}</span>
                        <em>{a.distance}</em>
                      </p>
                    ))}
                  </div>
                )}
                {sections.travel && (travel.stations ?? []).length > 0 && (
                  <div className={s.routeGroup}>
                    <p className={s.routeLabel}>{t("byTrain")}</p>
                    {(travel.stations ?? []).map((st, i) => (
                      <p key={i} className={s.routeRow}>
                        <b>{st.code}</b>
                        <span>{st.name}</span>
                        <em>{st.distance}</em>
                      </p>
                    ))}
                  </div>
                )}
                {sections.places && places.length > 0 && (
                  <div className={s.routeGroup}>
                    <p className={s.routeLabel}>{t("nearby")}</p>
                    {places.map((p, i) => (
                      <div key={i} className={s.place}>
                        <p>
                          <b>{p.title}</b>
                          <em>{p.distance}</em>
                        </p>
                        {p.description && <span>{p.description}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </Section>
        )}

        {sections.faq && (data.faq ?? []).length > 0 && (
          <Section index={5}>
            <div className={s.shared}>
              <ThingsToKnow faq={data.faq ?? []} accentColor={data.accentColor} fontPairing={data.fontPairing} templateId={id} />
            </div>
          </Section>
        )}

        {sections.guestPhotos && (
          <Section index={6}>
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
          </Section>
        )}

        {/* ── Reply card, perforated from the invitation ── */}
        {sections.rsvp && (
          <Section index={7}>
            <section className={s.block}>
              <div className={`${s.reply} ${m.paper} ${m.lifted}`}>
                <RsvpForm
                  slug={slug}
                  accentColor={data.accentColor}
                  templateId={id}
                  brideName={data.brideName}
                  groomName={data.groomName}
                  mode={mode}
                  initialName={guestGreeting}
                  header={
                    <div key="reply-head" className={s.replyHead}>
                      <p className={s.kicker}>{t("rsvpKicker")}</p>
                      <h2>{t("rsvp")}</h2>
                      <p>{t("rsvpSub")}</p>
                    </div>
                  }
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
              </div>
            </section>
          </Section>
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
      </div>

      {/* ── Closing: the welcome at the doorstep ── */}
      <section className={s.closing}>
        <KolamBorder />
        <p className={s.closingLine}>{t("closing")}</p>
        <p className={`${s.closingNames} ${m.foil}`} lang={scriptLang(coupleLabel)}>
          {coupleLabel}
        </p>
        <KolamBorder flip />
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}

function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header className={s.heading}>
      <p className={s.kicker}>{kicker}</p>
      <h2 lang={scriptLang(title)}>{title}</h2>
      <span className={s.headingRule} aria-hidden />
    </header>
  );
}

function EventInsert({
  label,
  time,
  venue,
  directions,
  lampSlot,
}: {
  label: string;
  time: string;
  venue: VenueInfo;
  directions: string;
  lampSlot: ReactNode;
}) {
  const href = directionsUrl(venue);
  return (
    <article className={`${s.insert} ${m.paper} ${m.lifted}`}>
      <div className={s.insertLamp} aria-hidden>
        {lampSlot}
      </div>
      <h3 className={m.foil} lang={scriptLang(label)}>
        {label}
      </h3>
      {time && <p className={s.insertTime}>{time}</p>}
      {venue?.name && <p className={s.insertVenue}>{venue.name}</p>}
      {venue?.address && <p className={s.insertAddress}>{venue.address}</p>}
      {href && venue?.name && (
        <a className={s.pillButton} href={href} target="_blank" rel="noopener noreferrer">
          <MapPin size={14} aria-hidden /> {directions}
        </a>
      )}
    </article>
  );
}
