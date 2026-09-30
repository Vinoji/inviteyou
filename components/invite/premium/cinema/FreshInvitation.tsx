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
import c from "./cinema.module.css";
import s from "./fresh.module.css";

/**
 * Baby shower — "Fresh morning". Soft light and pastel: baby shoes held in
 * morning sun (a light leak drifts, blush petals float), the details over a
 * nursery, a little note, and booties in the grass to close.
 * Photos: public/art/baby-shower-balloons/{shoes-hand,nursery,booties}.
 */
export default function FreshInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const t = useTranslations("premium.fresh");
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
    ...(isRecolor(getTemplateConfig(id).defaultAccent, data.accentColor) ? { "--blush": data.accentColor } : {}),
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
        <PhotoLayer templateId={id} slot="shoes-hand" s={s} priority>
          <span className={c.leak} style={{ ["--leak-a" as string]: "rgba(255,214,170,.45)", ["--leak-b" as string]: "rgba(255,190,205,.35)" }} />
        </PhotoLayer>
        <CinemaParticles kind="petals" palette="blush" density={0.6} className={c.particles} />
        <div className={s.heroPanel}>
          <Reveal as="p" className={s.heroScript}>
            {t("script")}
          </Reveal>
          <Reveal as="p" delay={0.1} className={s.heroLead}>
            {t("lead")}
          </Reveal>
          <Reveal delay={0.2}>
            <h1 className={s.heroName} lang={scriptLang(name)} style={{ ["--name-fit" as string]: nameFitScale(name, "") }}>
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

      {sections.schedule && events.shown.length > 0 && (
        <section className={s.band}>
          <PhotoLayer templateId={id} slot="nursery" s={s} zoom="out" />
          <div className={s.inner}>
            <Heading s={s} kicker={t("eventsKicker")} title={t("eventsTitle")} />
            <EventCards s={s} slug={slug} title={occasionTitle} date={data.weddingDate} events={events} />
          </div>
        </section>
      )}

      {sections.story && data.story && (
        <section className={s.section}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("storyKicker")} title={category.storyTitle || t("storyTitle")} />
            <div className={s.note}>
              <Story s={s} text={data.story} photo={photos[0]} signoff={t("signoff", { names: coupleLabel })} />
            </div>
          </div>
        </section>
      )}

      {sections.gallery && photos.length > 1 && (
        <section className={s.section}>
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

      <section className={s.closing}>
        <PhotoLayer templateId={id} slot="booties" s={s} />
        <CinemaParticles kind="petals" palette="blush" density={0.5} className={c.particles} />
        <div className={s.closingPanel}>
          <Reveal as="p" className={s.closingLine}>
            {t("closing")}
          </Reveal>
          <Reveal as="p" delay={0.15} className={s.closingName}>
            {name}
          </Reveal>
        </div>
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
