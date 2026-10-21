"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { INTRO_DONE_EVENT, REPLAY_INTRO_EVENT } from "../../intros/events";
import { useFormatter, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { scriptLang } from "@/lib/monogram";
import { getFontPairing } from "@/lib/fontPairings";
import { getTemplateConfig } from "@/lib/templates";
import { withDefaultSections, type FamilyMember } from "@/lib/types";
import { isRecolor } from "@/lib/color";
import { getFamily } from "@/lib/family";
import { parseIsoDate } from "@/lib/calendar";
import { directionsUrl } from "@/lib/maps";
import IntroHost from "../../intros/IntroHost";
import AudioToggle from "../../AudioToggle";
import InviteVideo from "@/components/invite/InviteVideo";
import AddToCalendar from "@/components/invite/AddToCalendar";
import type { PremiumProps } from "../types";
import { usePremiumText } from "../usePremiumText";
import CinemaCountdown from "../cinema/CinemaCountdown";
import Reveal from "../cinema/Reveal";
import { Guide, Heading, Photos, Story, Working, hasGuide, useEvents } from "../cinema/CinemaBlocks";
import s from "./film.module.css";

const HOST_RELATIONS = new Set(["parents", "father", "mother", "guardian", "grandparents"]);
const hosts = (m: FamilyMember[]) => m.filter((x) => HOST_RELATIONS.has(x.relation) && x.name.trim()).map((x) => x.name.trim());

/** A laurel branch (mirrored for the right side), as on festival posters. */
function Laurel({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 40 90" className={s.laurel} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <path d="M30 86C14 70 8 46 16 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const y = 76 - i * 11;
        const x = 22 - i * 1.4 + (i > 4 ? 2 : 0);
        return (
          <g key={i} fill="currentColor">
            <ellipse cx={x - 7} cy={y} rx="7" ry="2.6" transform={`rotate(-35 ${x - 7} ${y})`} />
            <ellipse cx={x + 5} cy={y - 4} rx="7" ry="2.6" transform={`rotate(40 ${x + 5} ${y - 4})`} />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Wedding — "Cinematic Film": the invitation as a film's title sequence,
 * in type alone (no photographs): letterbox and grain, "two families
 * present", the names as the title card with laurels, a poster billing
 * block, "coming soon", admit-one tickets for each function, the synopsis,
 * the locations, RSVP as booking your seat, and the end credits rolling.
 */
export default function CinematicFilmInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const t = usePremiumText("premium.film", data.templateId);
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const id = data.templateId;
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const events = useEvents(props);
  const bride = data.brideName || tCommon("brideFallback");
  const groom = data.groomName || tCommon("groomFallback");
  const single = category.singlePerson;
  // The title role: the couple's groom, or the one honoree (a birthday, a launch).
  const lead = single ? data.brideName || data.groomName || bride : groom;
  const photos = (data.photos ?? []).filter(Boolean);
  const day = parseIsoDate(data.weddingDate);
  const groomHosts = sections.family ? hosts(getFamily(data, "groom")) : [];
  const brideHosts = sections.family ? hosts(getFamily(data, "bride")) : [];
  const families = [...groomHosts, ...brideHosts];
  const dateLong = day ? format.dateTime(day, { day: "numeric", month: "long", year: "numeric" }) : "";
  // the opening credits roll once the countdown leader has finished
  const [rolling, setRolling] = useState(false);
  useEffect(() => {
    const done = () => setRolling(true);
    const replay = () => setRolling(false);
    window.addEventListener(INTRO_DONE_EVENT, done);
    window.addEventListener(REPLAY_INTRO_EVENT, replay);
    const fallback = setTimeout(done, 8000);
    return () => {
      clearTimeout(fallback);
      window.removeEventListener(INTRO_DONE_EVENT, done);
      window.removeEventListener(REPLAY_INTRO_EVENT, replay);
    };
  }, []);
  const style = {
    "--p-display": font.headingVar,
    "--p-body": font.bodyVar,
    "--inv-heading": font.headingVar,
    ...(isRecolor(getTemplateConfig(id).defaultAccent, data.accentColor) ? { "--gold": data.accentColor } : {}),
  } as CSSProperties;

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
        singlePerson={single}
        accentColor={data.accentColor}
        fontPairing={data.fontPairing}
        monogram={data.monogram}
        greeting={guestGreeting}
      />
      {mode === "public" && (
        <AudioToggle src={data.backgroundMusic || undefined} templateId={id} accentColor={data.accentColor} />
      )}
      <span className={s.grainFixed} aria-hidden />

      {/* ── The title sequence ── */}
      <section className={`${s.titles} ${rolling ? s.rolling : ""}`}>
        <span className={s.bar} aria-hidden />
        <div className={s.titlesInner}>
          <p className={`${s.credit} ${s.c1}`}>{t("present")}</p>
          <p className={`${s.credit} ${s.c2}`}>{t("aLoveStory")}</p>
          <div className={`${s.titleCard} ${s.c3}`}>
            <h1 className={s.filmTitle}>
              <span lang={scriptLang(groom)}>{single ? data.brideName || groom : groom}</span>
              {!single && (
                <>
                  <span className={s.filmAmp}>&amp;</span>
                  <span lang={scriptLang(bride)}>{bride}</span>
                </>
              )}
            </h1>
          </div>
          <div className={`${s.laurels} ${s.c4}`}>
            <Laurel />
            <p className={s.laurelText}>
              <b>{t("laurel")}</b>
              <span>{t("laurelSub")}</span>
            </p>
            <Laurel flip />
          </div>
          {day && (
            <p className={`${s.comingSoon} ${s.c5}`}>
              {t("comingSoon")}
              <b>{dateLong}</b>
            </p>
          )}
        </div>
        <span className={`${s.bar} ${s.barBottom}`} aria-hidden />
      </section>

      {/* ── The billing block ── */}
      <section className={s.section}>
        <Reveal className={s.billing}>
          <p>
            <i>{t("starring")}</i> <b>{lead}</b> {!single && <><i>{t("and")}</i> <b>{bride}</b></>}
          </p>
          {families.length > 0 && (
            <p>
              <i>{t("producedBy")}</i> {families.map((f, i) => <b key={i}>{f}</b>)}
            </p>
          )}
          <p>
            <i>{t("musicBy")}</i> <b>{t("musicValue")}</b> <i>{t("blessingsBy")}</i> <b>{t("blessingsValue")}</b>
          </p>
          <p>
            <i>{t("directedBy")}</i> <b>{t("directedValue")}</b>
          </p>
        </Reveal>
      </section>

      {/* ── Premiere countdown ── */}
      {day && category.showCountdown && (
        <section className={s.section}>
          <div className={s.inner}>
            <Reveal className={s.premiere}>
              <p className={s.kicker}>{t("premiereKicker")}</p>
              <p className={s.premiereDate}>{format.dateTime(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              <CinemaCountdown date={data.weddingDate} s={s} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Showtimes: an admit-one ticket per function ── */}
      {sections.schedule && events.shown.length > 0 && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={data.eventsKicker?.trim() || t("ticketsKicker")} title={data.eventsTitle?.trim() || t("ticketsTitle")} />
            <div className={s.tickets}>
              {events.shown.map((e, i) => {
                const href = directionsUrl(e.venue);
                return (
                  <Reveal key={i} delay={i * 0.12} className={s.ticket}>
                    <div className={s.ticketMain}>
                      <p className={s.ticketShow} lang={scriptLang(e.label)}>
                        {e.label}
                      </p>
                      <div className={s.ticketRow}>
                        {day && (
                          <span>
                            <small>{t("date")}</small>
                            {format.dateTime(day, { day: "numeric", month: "short" })}
                          </span>
                        )}
                        {e.time && (
                          <span>
                            <small>{t("time")}</small>
                            {e.time}
                          </span>
                        )}
                        <span>
                          <small>{t("seat")}</small>
                          {t("seatValue")}
                        </span>
                      </div>
                      {e.venue?.name && <p className={s.ticketVenue}>{e.venue.name}</p>}
                      {e.venue?.address && <p className={s.ticketAddress}>{e.venue.address}</p>}
                      {href && e.venue?.name && (
                        <a className={s.ticketMap} href={href} target="_blank" rel="noopener noreferrer">
                          <MapPin size={13} aria-hidden /> {t("directions")}
                        </a>
                      )}
                    </div>
                    <div className={s.ticketStub} aria-hidden>
                      <span>{t("admit")}</span>
                      <b>{t("admitValue")}</b>
                      <span className={s.ticketNo}>№ {String(i + 1).padStart(3, "0")}</span>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <AddToCalendar
              slug={slug}
              title={occasionTitle}
              date={data.weddingDate}
              events={events.all}
              classes={{ wrap: s.calendar, row: s.calendarRow, button: s.button, hint: s.calendarHint }}
            />
          </div>
        </section>
      )}

      {sections.story && data.story && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("synopsisKicker")} title={category.storyTitle || t("synopsisTitle")} />
            <div className={s.panel}>
              <Story s={s} text={data.story} signoff={t("signoff", { names: coupleLabel })} />
            </div>
          </div>
        </section>
      )}

      {data.videoUrl && <InviteVideo url={data.videoUrl} accent={data.accentColor} />}
      {sections.gallery && photos.length > 0 && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("stillsKicker")} title={t("stillsTitle")} />
            <Photos s={s} photos={photos.slice(0, 6)} />
          </div>
        </section>
      )}

      {hasGuide(data) && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("locationsKicker")} title={t("locationsTitle")} />
            <div className={s.panel}>
              <Guide s={s} data={data} />
            </div>
          </div>
        </section>
      )}

      <section className={s.section}>
        <div className={s.inner}>
          <Working
            s={s}
            props={props}
            replyHead={
              <div key="reply-head" className={s.replyHead}>
                <p className={s.kicker}>{t("replyKicker")}</p>
                <h2 className={s.title}>{t("replyTitle")}</h2>
                <p>{t("replySub")}</p>
              </div>
            }
          />
        </div>
      </section>

      {/* ── The end, and the credits ── */}
      <section className={s.ending}>
        <Reveal as="p" className={s.theEnd}>
          {t("theEnd")}
        </Reveal>
        <Reveal as="p" delay={0.1} className={s.thanks}>
          {t("thanks")}
        </Reveal>
        <div className={s.creditsWindow}>
          <div className={s.creditsRoll}>
            <p className={s.rollHead}>{t("cast")}</p>
            <p>{lead}</p>
            {!single && <p>{bride}</p>}
            {families.length > 0 && <p className={s.rollHead}>{t("families")}</p>}
            {families.map((f, i) => (
              <p key={i}>{f}</p>
            ))}
            <p className={s.rollHead}>{t("special")}</p>
            <p>{t("specialValue")}</p>
            <p className={s.rollHead}>{coupleLabel}</p>
          </div>
        </div>
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
