"use client";

import type { CSSProperties } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { scriptLang, resolveMonogram } from "@/lib/monogram";
import { getFontPairing } from "@/lib/fontPairings";
import { getTemplateConfig } from "@/lib/templates";
import { withDefaultSections } from "@/lib/types";
import { isRecolor } from "@/lib/color";
import { getFamily } from "@/lib/family";
import { parseIsoDate } from "@/lib/calendar";
import IntroHost from "../../intros/IntroHost";
import AudioToggle from "../../AudioToggle";
import FamilyLines from "../../FamilyLines";
import InviteVideo from "@/components/invite/InviteVideo";
import type { PremiumProps } from "../types";
import { usePremiumText } from "../usePremiumText";
import CinemaCountdown from "../cinema/CinemaCountdown";
import Reveal from "../cinema/Reveal";
import { EventCards, Guide, Heading, Photos, Story, Working, hasGuide, useEvents } from "../cinema/CinemaBlocks";
import { Butterfly, Emboss, Flourish, Lotus } from "./LilacArt";
import s from "./lilac.module.css";

/**
 * Wedding — "Lilac Seal": the printed invitation card of a Tamil wedding,
 * made soft and modern — lilac embossed with roses, a wax seal, the
 * couple's monogram in script, a butterfly, the pillaiyar suzhi over a
 * lotus, the names with their families, the date in an arched frame with
 * a countdown, then the functions, story, photos and RSVP on ivory card.
 * Everything is drawn in code (LilacArt).
 */
export default function LilacSealInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const t = usePremiumText("premium.lilac", data.templateId);
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const id = data.templateId;
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const events = useEvents(props);
  const a = data.brideName || tCommon("brideFallback");
  const b = data.groomName || tCommon("groomFallback");
  const single = category.singlePerson;
  const mono = resolveMonogram(a, b, data.monogram, single);
  const initials = [mono.a, mono.b].filter(Boolean).join("&");
  const photos = data.photos ?? [];
  const day = parseIsoDate(data.weddingDate);
  const brideFamily = sections.family ? getFamily(data, "bride") : [];
  const groomFamily = sections.family ? getFamily(data, "groom") : [];
  const style = {
    "--p-display": font.headingVar,
    "--p-body": font.bodyVar,
    "--inv-heading": font.headingVar,
    ...(isRecolor(getTemplateConfig(id).defaultAccent, data.accentColor) ? { "--lilac-deep": data.accentColor } : {}),
  } as CSSProperties;

  return (
    <div data-invite-root className={`${s.root} ${single ? s.single : ""}`} style={style}>
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

      {/* ── The cover: monogram, a resting butterfly, "scroll to reveal" ── */}
      <section className={s.hero}>
        <Emboss />
        <Butterfly className={`${s.heroButterfly} ${s.resting} ${s.drift}`} />
        <div className={s.heroInner}>
          <Reveal as="p" className={s.heroMono}>
            {initials}
          </Reveal>
          <Reveal as="p" delay={0.1} className={s.capsLine}>
            {t("weddingInvitation")}
          </Reveal>
          <Reveal as="p" delay={0.2} className={s.cordially}>
            {t("cordially")}
          </Reveal>
        </div>
        <p className={s.scrollHint} aria-hidden>
          {t("scroll")}
          <ChevronDown size={16} />
        </p>
      </section>

      {/* ── The card: suzhi and lotus, blessing, the names with families ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <Reveal className={s.card0}>
            <p className={s.suzhi} aria-hidden>
              உ
            </p>
            <Lotus className={s.lotus} />
            <p className={s.tamilTitle} lang="ta">
              {t("tamilTitle")}
            </p>
            <p className={s.blessing}>{t("blessing")}</p>
            <div className={s.coupleNames}>
              <div className={s.person}>
                <p className={s.personName} lang={scriptLang(a)}>
                  {a}
                </p>
                {brideFamily.length > 0 && (
                  <div className={s.personKin}>
                    <FamilyLines members={brideFamily} side="bride" />
                  </div>
                )}
              </div>
              {!single && (
                <>
                  <span className={s.ampersand} aria-hidden>
                    &amp;
                  </span>
                  <div className={s.person}>
                    <p className={s.personName} lang={scriptLang(b)}>
                      {b}
                    </p>
                    {groomFamily.length > 0 && (
                      <div className={s.personKin}>
                        <FamilyLines members={groomFamily} side="groom" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <Flourish className={s.flourish} />
          </Reveal>
        </div>
      </section>

      {/* ── The date in an arched frame, and the countdown ── */}
      {day && (
        <section className={`${s.section} ${s.tint}`}>
          <div className={s.inner}>
            <Reveal className={s.dateBlock}>
              <p className={s.capsLine}>{t("saveTheDate")}</p>
              <p className={s.dateDay}>{format.dateTime(day, { day: "numeric" })}</p>
              <p className={s.dateMonth}>{format.dateTime(day, { month: "long", year: "numeric" })}</p>
              <p className={s.dateWeek}>{format.dateTime(day, { weekday: "long" })}</p>
              {category.showCountdown && <CinemaCountdown date={data.weddingDate} s={s} />}
            </Reveal>
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
              <Story s={s} text={data.story} signoff={t("signoff", { names: coupleLabel })} />
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

      <section className={s.closing}>
        <Emboss />
        <Butterfly className={`${s.resting} ${s.drift}`} />
        <Reveal as="p" className={s.closingLine}>
          {t("thankYou")}
        </Reveal>
        <Reveal as="p" delay={0.1} className={s.closingSub}>
          {t("closing")}
        </Reveal>
        <Reveal as="p" delay={0.2} className={s.closingName}>
          {coupleLabel}
        </Reveal>
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
