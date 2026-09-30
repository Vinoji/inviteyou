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
import CinemaParticles from "./CinemaParticles";
import CinemaCountdown from "./CinemaCountdown";
import Reveal from "./Reveal";
import { EventCards, Guide, Heading, PhotoLayer, Photos, Story, Working, hasGuide, useEvents, useLongDate } from "./CinemaBlocks";
import m from "../materials.module.css";
import c from "./cinema.module.css";
import s from "./candlelight.module.css";

/**
 * Anniversary — "Candlelight". Slow and warm: a candlelit table (the flame
 * flickers, film light leaks, rose petals drift), their story as a letter,
 * their photos developing from sepia like prints, the details over roses
 * and wine, and a thank-you in candlelight.
 * Photos: public/art/anniversary-wine-roses/{table,roses,candles}.
 */
export default function CandlelightInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const t = useTranslations("premium.candlelight");
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const id = data.templateId;
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const events = useEvents(props);
  const when = useLongDate(data.weddingDate);
  const a = data.brideName || tCommon("brideFallback");
  const b = data.groomName || tCommon("groomFallback");
  const photos = data.photos ?? [];
  const style = {
    "--p-display": font.headingVar,
    "--p-body": font.bodyVar,
    "--inv-heading": font.headingVar,
    ...(isRecolor(getTemplateConfig(id).defaultAccent, data.accentColor) ? { "--rose": data.accentColor } : {}),
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

      <section className={s.hero}>
        <PhotoLayer templateId={id} slot="table" s={s} zoom="out" priority>
          <span className={c.flicker} style={{ ["--x" as string]: "86%", ["--y" as string]: "22%", ["--r" as string]: "260px" }} />
          <span className={c.leak} style={{ ["--leak-a" as string]: "rgba(255,170,90,.32)", ["--leak-b" as string]: "rgba(190,40,70,.22)" }} />
          <span className={c.grain} />
        </PhotoLayer>
        <CinemaParticles kind="petals" palette="rose" density={0.5} className={c.particles} />
        <div className={s.heroText}>
          <Reveal as="p" className={s.heroLead}>
            {t("lead")}
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className={s.heroNames} style={{ ["--name-fit" as string]: nameFitScale(a, b) }}>
              <span lang={scriptLang(a)}>{a}</span>
              <span className={s.amp}>&amp;</span>
              <span lang={scriptLang(b)}>{b}</span>
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

      {sections.story && data.story && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("storyKicker")} title={category.storyTitle || t("storyTitle")} />
            <div className={`${s.letter} ${m.paper} ${m.lifted}`}>
              <Story s={s} text={data.story} signoff={t("signoff", { names: coupleLabel })} />
            </div>
          </div>
        </section>
      )}

      {sections.gallery && photos.length > 0 && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("photosKicker")} title={t("photosTitle")} />
            <Photos s={s} photos={photos.slice(0, 6)} />
          </div>
        </section>
      )}

      {sections.schedule && events.shown.length > 0 && (
        <section className={s.band}>
          <PhotoLayer templateId={id} slot="roses" s={s}>
            <span className={c.grain} />
          </PhotoLayer>
          <div className={s.inner}>
            <Heading s={s} kicker={t("eventsKicker")} title={t("eventsTitle")} />
            <EventCards s={s} slug={slug} title={occasionTitle} date={data.weddingDate} events={events} />
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

      <section className={s.closing}>
        <PhotoLayer templateId={id} slot="candles" s={s}>
          <span className={c.flicker} style={{ ["--x" as string]: "56%", ["--y" as string]: "36%", ["--r" as string]: "220px" }} />
        </PhotoLayer>
        <CinemaParticles kind="bokeh" palette="warm" density={0.8} className={c.particles} />
        <Reveal as="p" className={s.closingLine}>
          {t("closing")}
        </Reveal>
        <Reveal as="p" delay={0.15} className={s.closingName}>
          {coupleLabel}
        </Reveal>
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
