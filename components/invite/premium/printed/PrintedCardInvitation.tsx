"use client";

import type { CardWordingKey } from "@/lib/cardWording";
import type { CSSProperties } from "react";
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
import FamilyLines from "../../FamilyLines";
import InviteVideo from "@/components/invite/InviteVideo";
import type { PremiumProps } from "../types";
import CinemaCountdown from "../cinema/CinemaCountdown";
import Reveal from "../cinema/Reveal";
import { EventCards, Guide, Heading, Photos, Story, Working, hasGuide, useEvents } from "../cinema/CinemaBlocks";
import { Corner, EmblemMark, FrameCap, patternTile } from "./Ornaments";
import { printedDesign } from "./designs";
import { RitualsInsert, SadyaInsert } from "./Inserts";
import s from "./printed.module.css";

const HOST_RELATIONS = new Set(["parents", "father", "mother", "guardian", "grandparents"]);

/** The hosts printed at the foot of the card: both families' parents. */
function hostNames(members: FamilyMember[], fallback: string): string[] {
  const names = members.filter((m) => HOST_RELATIONS.has(m.relation) && m.name.trim()).map((m) => m.name.trim());
  return names.length ? names : fallback.trim() ? [fallback.trim()] : [];
}

/**
 * Wedding — the printed invitation card of each tradition (designs.ts):
 * the card itself lies on a desk exactly as it's printed — invocation and
 * emblem in foil, the title, the formal wording, the couple with their
 * families on ribbons, the muhurtham date panel, the venue and the hosts —
 * inside its border; then the inserts: functions with maps, countdown,
 * story, photos, travel and RSVP, on the same card stock.
 */
export default function PrintedCardInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const id = data.templateId;
  const d = printedDesign(id);
  const tp = useTranslations("premium.printed");
  // The couple's own words for a line (cardWording), else the design's.
  const w = (key: string, values?: Record<string, string>) =>
    data.cardWording?.[key as CardWordingKey]?.trim() || tp(`${d.wording}.${key}`, values);
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  // the tradition's own names for the two functions, unless the couple renamed them
  const labelled = {
    ...category,
    eventALabel: data.eventALabel?.trim() || w("eventA"),
    eventBLabel: data.eventBLabel?.trim() || w("eventB"),
  };
  const events = useEvents({ data, category: labelled });
  const bride = data.brideName || tCommon("brideFallback");
  const groom = data.groomName || tCommon("groomFallback");
  const single = category.singlePerson;
  const photos = data.photos ?? [];
  const day = parseIsoDate(data.weddingDate);
  const brideFamily = sections.family ? getFamily(data, "bride") : [];
  const groomFamily = sections.family ? getFamily(data, "groom") : [];
  const hosts = sections.family
    ? [...hostNames(groomFamily, data.groomParents ?? ""), ...hostNames(brideFamily, data.brideParents ?? "")]
    : [];
  const main = events.all[0];
  const mapHref = main?.venue ? directionsUrl(main.venue) : "";
  const tile = patternTile(d.frame, d.pattern);
  const accent = isRecolor(getTemplateConfig(id).defaultAccent, data.accentColor) ? data.accentColor : d.accent;
  const style = {
    "--p-display": font.headingVar,
    "--p-body": font.bodyVar,
    "--inv-heading": font.headingVar,
    "--paper-a": d.paper[0],
    "--paper-b": d.paper[1],
    "--desk": d.desk,
    "--ink": d.ink,
    "--soft": d.soft,
    "--accent": accent,
    "--ribbon-ink": d.ribbonInk,
    "--foil": d.foil,
    "--foil-hi": d.foilHi,
    ...(tile ? { "--tile": tile } : {}),
  } as CSSProperties;

  const people = [
    { side: "groom" as const, name: groom, label: w("groomLabel"), family: groomFamily },
    { side: "bride" as const, name: bride, label: w("brideLabel"), family: brideFamily },
  ];
  if (!d.groomFirst) people.reverse();
  const shown = single ? [{ ...people[0], name: data.brideName || data.groomName || people[0].name }] : people;
  const capped = d.frame === "temple" || d.frame === "mughal";
  const patterned = d.frame === "geometric" || d.frame === "phulkari";

  return (
    <div data-invite-root className={`${s.root} ${d.dark ? s.dark : ""}`} style={style}>
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

      {/* ── The card, as printed ── */}
      <section className={s.desk}>
        <Reveal className={`${s.print} ${patterned ? s.patterned : ""}`}>
          <div className={`${s.sheet} ${d.frame === "kasavu" ? s.kasavu : ""}`}>
            {d.frame === "corners" && (
              <>
                <Corner className={`${s.corner} ${s.tl}`} />
                <Corner className={`${s.corner} ${s.tr}`} />
                <Corner className={`${s.corner} ${s.bl}`} />
                <Corner className={`${s.corner} ${s.br}`} />
              </>
            )}
            <div className={`${s.frameBox} ${capped ? s[`cap_${d.frame}`] : ""}`}>
              {capped && <FrameCap frame={d.frame} />}
              <div className={s.content}>
                <div className={s.emblem}>
                  <EmblemMark emblem={d.emblem} />
                </div>
                <p className={s.invocation}>{w("invocation")}</p>
                {w("invocationSub") && <p className={s.invocationSub}>{w("invocationSub")}</p>}
                <h1 className={`${s.cardTitle} ${s.foilText}`}>{w("title")}</h1>
                <span className={s.rule} aria-hidden />
                <p className={s.leadLine}>{w("lead")}</p>

                {shown.map((p, i) => (
                  <div key={p.side} className={s.personBlock}>
                    {i > 0 && <p className={s.joiner}>{w("joiner")}</p>}
                    {!single && <span className={s.ribbon}>{p.label}</span>}
                    <p className={s.name} lang={scriptLang(p.name)}>
                      {p.name}
                    </p>
                    {p.family.length > 0 && (
                      <div className={s.kin}>
                        <FamilyLines members={p.family} side={p.side} />
                      </div>
                    )}
                  </div>
                ))}

                {w("after") && <p className={s.after}>{w("after")}</p>}

                {day && (
                  <div className={s.datePanel}>
                    <span className={s.dpWeek}>{format.dateTime(day, { weekday: "long" })}</span>
                    <span className={s.dpDay}>{format.dateTime(day, { day: "numeric" })}</span>
                    <span className={s.dpMonth}>{format.dateTime(day, { month: "long", year: "numeric" })}</span>
                    {main?.time && (
                      <span className={s.dpTime}>
                        {w("timeLabel")} · {main.time}
                      </span>
                    )}
                  </div>
                )}

                {main?.venue?.name && (
                  <div className={s.venue}>
                    <p className={s.venueLabel}>{tp("venue")}</p>
                    <p className={s.venueName}>{main.venue.name}</p>
                    {main.venue.address && <p className={s.venueAddress}>{main.venue.address}</p>}
                    {mapHref && (
                      <a className={s.mapLink} href={mapHref} target="_blank" rel="noopener noreferrer">
                        <MapPin size={13} aria-hidden /> {tp("directions")}
                      </a>
                    )}
                  </div>
                )}

                <p className={s.closingWords}>{w("closing")}</p>
                {hosts.length > 0 && (
                  <div className={s.hosts}>
                    <p className={s.hostsLabel}>{w("hostsLabel")}</p>
                    {hosts.map((h, i) => (
                      <p key={i} className={s.hostName}>
                        {h}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
        <p className={s.scrollHint} aria-hidden>
          {tp("scroll")}
        </p>
      </section>

      {/* ── The inserts ── */}
      {d.extras?.includes("rituals") && <RitualsInsert />}
      {sections.schedule && events.shown.length > 0 && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={data.eventsKicker?.trim() || tp("eventsKicker")} title={data.eventsTitle?.trim() || tp("eventsTitle")} />
            <EventCards s={s} slug={slug} title={occasionTitle} date={data.weddingDate} events={events} />
          </div>
        </section>
      )}

      {d.extras?.includes("sadya") && <SadyaInsert />}

      {day && category.showCountdown && (
        <section className={s.section}>
          <div className={`${s.inner} ${s.slip}`}>
            <p className={s.kicker}>{tp("countdownKicker")}</p>
            <CinemaCountdown date={data.weddingDate} s={s} />
          </div>
        </section>
      )}

      {sections.story && data.story && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={tp("storyKicker")} title={category.storyTitle || tp("storyTitle")} />
            <div className={s.slip}>
              <Story s={s} text={data.story} signoff={tp("signoff", { names: coupleLabel })} />
            </div>
          </div>
        </section>
      )}

      {data.videoUrl && <InviteVideo url={data.videoUrl} accent={accent} />}
      {sections.gallery && photos.length > 0 && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={tp("photosKicker")} title={tp("photosTitle")} />
            <Photos s={s} photos={photos.slice(0, 6)} />
          </div>
        </section>
      )}

      {hasGuide(data) && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={tp("guideKicker")} title={tp("guideTitle")} />
            <div className={s.slip}>
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
                <p className={s.kicker}>{tp("replyKicker")}</p>
                <h2 className={s.title}>{tp("replyTitle")}</h2>
                <p>{tp("replySub")}</p>
              </div>
            }
          />
        </div>
      </section>

      <section className={s.section}>
        <Reveal className={`${s.inner} ${s.slip} ${s.thanks}`}>
          <p className={`${s.thanksLine} ${s.foilText}`}>{w("thanks")}</p>
          <p className={s.thanksName}>{coupleLabel}</p>
        </Reveal>
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
