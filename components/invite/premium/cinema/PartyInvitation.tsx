import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { scriptLang, nameFitScale } from "@/lib/monogram";
import { getFontPairing } from "@/lib/fontPairings";
import { getTemplateConfig } from "@/lib/templates";
import { withDefaultSections } from "@/lib/types";
import { isRecolor } from "@/lib/color";
import IntroHost from "../../intros/IntroHost";
import AudioToggle from "../../AudioToggle";
import type { PremiumProps } from "../types";
import CinemaParticles, { type Emitter } from "./CinemaParticles";
import BurstOnView from "./BurstOnView";
import CinemaCountdown from "./CinemaCountdown";
import Reveal from "./Reveal";
import { EventCards, Guide, Heading, PhotoLayer, Photos, Story, Working, hasGuide, useEvents, useLongDate } from "./CinemaBlocks";
import c from "./cinema.module.css";
import s from "./party.module.css";

// Where the sparkler's head is in its photo (fractions of the band).
const SPARKLER: Emitter[] = [{ x: 0.52, y: 0.4, angle: -90, spread: 180 }];
const CANNONS: Emitter[] = [
  { x: 0, y: 1, angle: -60, spread: 18 },
  { x: 1, y: 1, angle: -120, spread: 18 },
];

/**
 * Birthday — "It's a party". A night party in photographs: a candlelit cake
 * (candles flicker, party lights drift), the details over a live sparkler,
 * confetti cannons as the party details arrive, fireworks to close.
 * Photos: public/art/birthday-balloon-party/{cake,sparkler,balloons}.
 */
export default function PartyInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const t = useTranslations("premium.party");
  const tView = useTranslations("invite.view");
  const id = data.templateId;
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const events = useEvents(props);
  const when = useLongDate(data.weddingDate);
  const name = data.brideName || coupleLabel;
  const photos = data.photos ?? [];
  const style = {
    "--p-display": font.headingVar,
    "--p-body": font.bodyVar,
    "--inv-heading": font.headingVar,
    ...(isRecolor(getTemplateConfig(id).defaultAccent, data.accentColor) ? { "--hot": data.accentColor } : {}),
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

      {/* ── Hero: the cake, candles lit ── */}
      <section className={s.hero}>
        <PhotoLayer templateId={id} slot="cake" s={s} priority>
          <span className={c.flicker} style={{ ["--x" as string]: "50%", ["--y" as string]: "34%", ["--r" as string]: "340px" }} />
          <span className={c.flicker} style={{ ["--x" as string]: "38%", ["--y" as string]: "30%", ["--r" as string]: "200px" }} />
        </PhotoLayer>
        <CinemaParticles kind="bokeh" palette="warm" density={1} className={c.particles} />
        <div className={s.heroText}>
          <Reveal as="p" className={s.heroKicker}>
            {t("kicker")}
          </Reveal>
          <Reveal as="p" delay={0.1} className={s.heroLead}>
            {t("lead")}
          </Reveal>
          <Reveal delay={0.2}>
            <h1
              className={s.heroName}
              lang={scriptLang(name)}
              style={{ ["--name-fit" as string]: nameFitScale(name, "") }}
            >
              {name}
            </h1>
          </Reveal>
          <Reveal as="p" delay={0.3} className={s.heroDate}>
            {when.long}
          </Reveal>
          {data.weddingDate && category.showCountdown && (
            <Reveal delay={0.4}>
              <CinemaCountdown date={data.weddingDate} s={s} />
            </Reveal>
          )}
        </div>
      </section>

      {/* ── The party, over a live sparkler ── */}
      {sections.schedule && events.shown.length > 0 && (
        <section className={s.band}>
          <PhotoLayer templateId={id} slot="sparkler" s={s} zoom="out">
            <CinemaParticles kind="sparks" palette="gold" emitters={SPARKLER} className={c.particles} />
          </PhotoLayer>
          <BurstOnView kind="confetti" palette="party" emitters={CANNONS} />
          <div className={s.inner}>
            <Heading s={s} kicker={t("eventsKicker")} title={t("eventsTitle")} />
            <EventCards s={s} slug={slug} title={occasionTitle} date={data.weddingDate} events={events} />
          </div>
        </section>
      )}

      {/* ── A birthday wish ── */}
      {sections.story && data.story && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("storyKicker")} title={category.storyTitle || t("storyTitle")} />
            <Story s={s} text={data.story} photo={photos[0]} />
          </div>
        </section>
      )}

      {/* ── Snapshots, over balloons and confetti ── */}
      {sections.gallery && photos.length > 1 && (
        <section className={`${s.band} ${s.light}`}>
          <PhotoLayer templateId={id} slot="balloons" s={s} />
          <div className={s.inner}>
            <Heading s={s} kicker={t("photosKicker")} title={t("photosTitle")} />
            <Photos s={s} photos={photos.slice(1, 7)} />
          </div>
        </section>
      )}

      {hasGuide(data) && (
        <section className={s.section}>
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
            events={events.all}
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

      {/* ── Fireworks to close ── */}
      <section className={s.closing}>
        <CinemaParticles kind="fireworks" palette="party" className={c.particles} />
        <Reveal as="p" className={s.closingLine}>
          {t("closing")}
        </Reveal>
        <Reveal as="p" delay={0.15} className={s.closingName}>
          <span lang={scriptLang(name)}>{name}</span>
        </Reveal>
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
