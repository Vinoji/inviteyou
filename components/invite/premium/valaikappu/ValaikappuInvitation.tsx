"use client";

import { useEffect, useState, type CSSProperties } from "react";
import QRCode from "qrcode";
import { useFormatter, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { scriptLang } from "@/lib/monogram";
import { getFontPairing } from "@/lib/fontPairings";
import { getTemplateConfig } from "@/lib/templates";
import { withDefaultSections } from "@/lib/types";
import { isRecolor } from "@/lib/color";
import { getFamily } from "@/lib/family";
import { parseIsoDate } from "@/lib/calendar";
import { directionsUrl } from "@/lib/maps";
import IntroHost from "../../intros/IntroHost";
import AudioToggle from "../../AudioToggle";
import InviteVideo from "@/components/invite/InviteVideo";
import type { PremiumProps } from "../types";
import { usePremiumText } from "../usePremiumText";
import CinemaCountdown from "../cinema/CinemaCountdown";
import Reveal from "../cinema/Reveal";
import { EventCards, Guide, Heading, Photos, Story, Working, hasGuide, useEvents } from "../cinema/CinemaBlocks";
import { Bell, Divider, Grass, InvocationFrame, Kolam, Thoranam } from "./Ornaments";
import { artSrc, sceneDesign, type SceneDesign, type Screen } from "./scenes";
import s from "./valaikappu.module.css";

const PLACE = { center: s.figCenter, wide: s.figWide, left: s.figLeft, right: s.figRight, edge: s.figEdge, bleed: s.figBleed };

/** A screen's foot: its illustrations standing on a strip of grass. */
function Ground({ design, screen, n }: { design: SceneDesign; screen: Screen; n: number }) {
  const [svh, px] = screen.ground;
  return (
    <div className={s.ground} style={{ ["--fig" as string]: `min(${svh}svh, ${px}px)` }}>
      {screen.figures.map((f) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f.src}
          src={artSrc(design, f.src)}
          alt=""
          aria-hidden
          loading={n === 0 ? undefined : "lazy"}
          fetchPriority={n === 0 ? "high" : undefined}
          className={`${s.figure} ${PLACE[f.place]}`}
          style={f.scale ? { height: `calc(var(--fig) * ${f.scale})` } : undefined}
        />
      ))}
      <Grass id={`vk-grass-${n + 1}`} />
    </div>
  );
}

const HOST_RELATIONS = new Set(["parents", "father", "mother", "guardian", "grandparents"]);

/** A QR code for the venue's directions, drawn as SVG in the browser. */
function MapQr({ href }: { href: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toString(href, { type: "svg", margin: 1, color: { dark: "#3b1d12", light: "#fffaf0" } })
      .then((out) => live && setSvg(out))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [href]);
  if (!svg) return <span className={s.qr} />;
  return <span className={s.qr} aria-hidden dangerouslySetInnerHTML={{ __html: svg }} />;
}

/**
 * The Tamil scene cards (scenes.ts) — "Velum Mayilum Valaikaappu", "Kannan
 * Valaikaappu", "Mangala Thirumanam", "Pudhumanai Puguvizha": the card as
 * Tamil families share it on WhatsApp. Cream paper under a mango-leaf
 * thoranam with two brass bells that swing as the guest scrolls through
 * four screens — the deity with the invocation and the title, a verse with
 * the names, the day and the venue with a directions QR, and the family's
 * welcome — then the functions, photos and RSVP. Each design brings its
 * own wording (premium.<ns>) and illustrations.
 */
export default function ValaikappuInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const id = data.templateId;
  const design = sceneDesign(id);
  const t = usePremiumText(`premium.${design.ns}`, id);
  const couple = !category.singlePerson;
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const events = useEvents(props);
  const main = events.all[0];
  const mother = data.brideName || tCommon("brideFallback");
  const husband = couple ? "" : data.groomName?.trim();
  const groom = data.groomName || tCommon("groomFallback");
  const day = parseIsoDate(data.weddingDate);
  const photos = data.photos ?? [];
  const mapHref = main?.venue ? directionsUrl(main.venue) : "";
  // The hosts, from the editor's Family section (and only while it's on):
  // a couple's two families, groom's side first as Tamil cards print them.
  const family = sections.family ? [...(couple ? getFamily(data, "groom") : []), ...getFamily(data, "bride")] : [];
  // The seed's sample families aren't anyone's real hosts: until they're
  // replaced, the line reads "The family of <the names>".
  const sampleHosts = new Set(t("sampleHosts").split("|").map((n) => n.trim()));
  const hosts = family
    .filter((m) => HOST_RELATIONS.has(m.relation) && !sampleHosts.has(m.name.trim()))
    .map((m) => m.name.trim());
  const hostLine = hosts.length ? hosts.join(" · ") : coupleLabel;
  // "The family of …" — or, for a couple with no families entered, "both families"
  const hostsTitle = hosts.length || !couple ? t("familyOf", { names: hostLine }) : t("bothFamilies");
  const verse = t("verse").split("\n");
  const style = {
    "--p-display": font.headingVar,
    "--p-body": font.bodyVar,
    "--inv-heading": font.headingVar,
    ...(isRecolor(getTemplateConfig(id).defaultAccent, data.accentColor) ? { "--lilac-deep": data.accentColor } : {}),
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
        singlePerson={category.singlePerson}
        accentColor={data.accentColor}
        fontPairing={data.fontPairing}
        monogram={data.monogram}
        greeting={guestGreeting}
      />
      {mode === "public" && (
        <AudioToggle src={data.backgroundMusic || undefined} templateId={id} accentColor={data.accentColor} />
      )}

      {/* ── The card: four screens under the thoranam and the bells ── */}
      <div className={s.scene}>
        <div className={s.canopy} aria-hidden>
          <Thoranam id="vk-thoranam" />
          <Bell id="vk-bell-l" className={s.bellL} />
          <Bell id="vk-bell-r" className={s.bellR} />
        </div>

        {/* 1 · Baby Murugan, the invocation and the title */}
        <section className={s.screen}>
          <div className={s.screenText}>
            <Reveal>
              <InvocationFrame>{t("invocation")}</InvocationFrame>
            </Reveal>
            <Reveal delay={0.15} as="h2" className={s.bigTitle}>
              {t("title")}
              <span className={s.bigTitleSub}>{t("titleSub")}</span>
            </Reveal>
            <Reveal delay={0.3}>
              <Kolam />
            </Reveal>
          </div>
          <Ground design={design} screen={design.screens[0]} n={0} />
          <p className={s.scrollHint} aria-hidden>
            {t("scroll")}
          </p>
        </section>

        {/* 2 · The verse and the mother-to-be */}
        <section className={s.screen}>
          <div className={s.screenText}>
            <Reveal className={s.verse}>
              {verse.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </Reveal>
            <Divider />
            {couple ? (
              <>
                <Reveal delay={0.2} className={s.honorific}>
                  {t("groomHonorific")}
                </Reveal>
                <Reveal delay={0.25} as="h2" className={s.motherName}>
                  <span lang={scriptLang(groom)}>{groom}</span>
                </Reveal>
                <Reveal delay={0.3} className={s.joiner}>
                  {t("joiner")}
                </Reveal>
                <Reveal delay={0.35} className={s.honorific}>
                  {t("brideHonorific")}
                </Reveal>
                <Reveal delay={0.4} as="h2" className={s.motherName}>
                  <span lang={scriptLang(mother)}>{mother}</span>
                </Reveal>
              </>
            ) : (
              <>
                {t("honorific") && (
                  <Reveal delay={0.2} className={s.honorific}>
                    {t("honorific")}
                  </Reveal>
                )}
                <Reveal delay={0.3} as="h2" className={s.motherName}>
                  <span lang={scriptLang(mother)}>{mother}</span>
                </Reveal>
              </>
            )}
            {husband && (
              <Reveal delay={0.4} className={s.wifeOf}>
                {t("wifeOf", { name: husband })}
              </Reveal>
            )}
          </div>
          <Ground design={design} screen={design.screens[1]} n={1} />
        </section>

        {/* 3 · The day, the time and the venue, with a directions QR */}
        <section className={s.screen}>
          <div className={s.screenText}>
            {day && (
              <>
                <Reveal className={s.fieldLabel}>{t("dateLabel")}</Reveal>
                <Reveal delay={0.1} className={s.dateLine}>
                  {format.dateTime(day, { day: "numeric", month: "long", year: "numeric" })}
                </Reveal>
                <Reveal delay={0.15} className={s.dateLine}>
                  {format.dateTime(day, { weekday: "long" })}
                </Reveal>
              </>
            )}
            {main?.time && (
              <Reveal delay={0.2} className={s.dateLine}>
                {t("timeLine", { time: main.time })}
              </Reveal>
            )}
            {main?.venue?.name && (
              <>
                <Reveal delay={0.25} className={s.fieldLabel}>
                  {t("venueLabel")}
                </Reveal>
                <Reveal delay={0.3} className={s.venueName}>
                  {main.venue.name}
                </Reveal>
                {main.venue.address && (
                  <Reveal delay={0.35} className={s.venueAddress}>
                    {main.venue.address}
                  </Reveal>
                )}
              </>
            )}
            {mapHref && (
              <Reveal delay={0.4} className={s.mapBlock}>
                <MapQr href={mapHref} />
                <a className={s.mapLink} href={mapHref} target="_blank" rel="noopener noreferrer">
                  <MapPin size={14} aria-hidden /> {t("directions")}
                </a>
              </Reveal>
            )}
          </div>
          <Ground design={design} screen={design.screens[2]} n={2} />
        </section>

        {/* 4 · The family's welcome */}
        <section className={s.screen}>
          <div className={s.screenText}>
            <Reveal className={s.welcome}>{t("welcome")}</Reveal>
            <Reveal delay={0.2} as="h2" className={s.hosts}>
              {hostsTitle}
            </Reveal>
            <Divider />
            <Reveal delay={0.35}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artSrc(design, design.ornament)} alt="" aria-hidden loading="lazy" className={s.bigBangles} />
            </Reveal>
          </div>
          <Ground design={design} screen={design.screens[3]} n={3} />
        </section>
      </div>

      {/* ── The working parts ── */}
      {day && category.showCountdown && (
        <section className={`${s.section} ${s.tint}`}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("countdownKicker")} title={t("countdownTitle")} />
            <CinemaCountdown date={data.weddingDate} s={s} />
          </div>
        </section>
      )}

      {sections.schedule && events.shown.length > 0 && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={data.eventsKicker?.trim() || t("eventsKicker")} title={data.eventsTitle?.trim() || t("eventsTitle")} />
            <EventCards s={s} slug={slug} title={occasionTitle} date={data.weddingDate} events={events} />
          </div>
        </section>
      )}

      {sections.story && data.story && (
        <section className={`${s.section} ${s.tint}`}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("storyKicker")} title={category.storyTitle || t("storyTitle")} />
            <div className={s.letterCard}>
              <Story s={s} text={data.story} signoff={t("signoff", { names: hostLine })} />
            </div>
          </div>
        </section>
      )}

      {data.videoUrl && <InviteVideo url={data.videoUrl} accent={data.accentColor} />}
      {sections.gallery && photos.length > 0 && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("photosKicker")} title={t("photosTitle")} />
            <Photos s={s} photos={photos.slice(0, 6)} />
          </div>
        </section>
      )}

      {hasGuide(data) && (
        <section className={`${s.section} ${s.tint}`}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("guideKicker")} title={t("guideTitle")} />
            <Guide s={s} data={data} />
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

      <section className={`${s.section} ${s.tint}`}>
        <Reveal className={`${s.inner} ${s.thanks}`}>
          <Kolam className={s.thanksKolam} />
          <p className={s.thanksLine}>{t("thankYou")}</p>
          <p className={s.thanksName}>{hostLine}</p>
        </Reveal>
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
