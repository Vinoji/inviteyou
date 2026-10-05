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
import CinemaParticles from "../cinema/CinemaParticles";
import CinemaCountdown from "../cinema/CinemaCountdown";
import Reveal from "../cinema/Reveal";
import { EventCards, Guide, Heading, Photos, Story, Working, hasGuide, useEvents, useLongDate } from "../cinema/CinemaBlocks";
import m from "../materials.module.css";
import c from "../cinema/cinema.module.css";
import DepthPhoto from "./DepthPhoto";
import s from "./living.module.css";

/**
 * Wedding — "Living Temple". Real temple photographs that move in 3D as the
 * guest scrolls (DepthPhoto): the gopuram lit at night, brass lamps for the
 * story, the pillared corridor for the functions, the temple tank for the
 * travel guide, and the golden vimanam to close.
 * Photos: public/art/living-temple/{gopuram-night,lamps,corridor,tank,finale}
 * with their -depth maps.
 */
export default function LivingTempleInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const t = useTranslations("premium.living");
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
        <div className={s.photoLayer} aria-hidden>
          <DepthPhoto templateId={id} slot="gopuram-night" priority strength={1.1} dolly={0.14} focus={0.55} />
          <span className={s.photoShade} />
        </div>
        <CinemaParticles kind="petals" palette="marigold" density={0.45} className={c.particles} />
        <div className={s.heroText}>
          <Reveal as="p" className={s.invocation}>
            <span className={s.om} aria-hidden>
              ॐ
            </span>
            {t("invocation")}
          </Reveal>
          <Reveal as="p" delay={0.1} className={s.heroLead}>
            {t("lead")}
          </Reveal>
          <Reveal delay={0.2}>
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
        <section className={s.band}>
          <div className={s.photoLayer} aria-hidden>
            <DepthPhoto templateId={id} slot="lamps" strength={1.3} dolly={0.1} focus={0.6} />
            <span className={s.photoShade} />
          </div>
          <CinemaParticles kind="sparks" palette="gold" density={0.5} className={c.particles} />
          <div className={s.inner}>
            <Heading s={s} kicker={t("storyKicker")} title={category.storyTitle || t("storyTitle")} />
            <div className={`${s.letter} ${m.paper} ${m.lifted}`}>
              <Story s={s} text={data.story} signoff={t("signoff", { names: coupleLabel })} />
            </div>
          </div>
        </section>
      )}

      {sections.schedule && events.shown.length > 0 && (
        <section className={s.band}>
          <div className={s.photoLayer} aria-hidden>
            {/* The corridor's vanishing point makes the deepest glide. */}
            <DepthPhoto templateId={id} slot="corridor" strength={1.4} dolly={0.22} focus={0.25} />
            <span className={s.photoShade} />
          </div>
          <div className={s.inner}>
            <Heading s={s} kicker={t("eventsKicker")} title={t("eventsTitle")} />
            <EventCards s={s} slug={slug} title={occasionTitle} date={data.weddingDate} events={events} />
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

      {hasGuide(data) && (
        <section className={s.band}>
          <div className={s.photoLayer} aria-hidden>
            <DepthPhoto templateId={id} slot="tank" strength={1.1} dolly={0.12} focus={0.4} />
            <span className={s.photoShade} />
          </div>
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
        <div className={s.photoLayer} aria-hidden>
          <DepthPhoto templateId={id} slot="finale" strength={1.1} dolly={0.16} focus={0.5} />
          <span className={s.photoShade} />
        </div>
        <CinemaParticles kind="bokeh" palette="gold" density={0.7} className={c.particles} />
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
