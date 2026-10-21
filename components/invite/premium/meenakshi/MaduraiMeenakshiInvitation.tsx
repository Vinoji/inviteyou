"use client";

import type { CSSProperties } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { scriptLang } from "@/lib/monogram";
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
import s from "./meenakshi.module.css";

const ART = "/art/madurai-meenakshi";

/**
 * Wedding — "Madurai Meenakshi": the Madurai temple wedding card — the
 * painted gopuram under a marigold thoranam, the names in temple gold, the
 * invitation in a temple arch with உ, the date over jasmine on a banana
 * leaf, the sculptures, the functions under the Nayakkar Mahal arches, and
 * the temple tank to close. Photos: public/art/madurai-meenakshi (Pexels).
 */
export default function MaduraiMeenakshiInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const t = usePremiumText("premium.meenakshi", data.templateId);
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const locale = useLocale();
  const id = data.templateId;
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const events = useEvents(props);
  const a = data.brideName || tCommon("brideFallback");
  const b = data.groomName || tCommon("groomFallback");
  const single = category.singlePerson;
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

      {/* ── The gopuram under a marigold thoranam, the names in gold ── */}
      <section className={s.hero}>
        <div className={s.heroPhoto} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/gopuram.webp`} alt="" fetchPriority="high" />
        </div>
        <span className={s.thoranam} aria-hidden />
        <div className={s.heroInner}>
          <Reveal as="p" className={s.suzhiHero}>
            <span aria-hidden>உ</span>
          </Reveal>
          <Reveal as="p" delay={0.05} className={s.deity}>
            {t("deity")}
          </Reveal>
          <Reveal as="p" delay={0.1} className={s.weddingOf}>
            {t("weddingOf")}
          </Reveal>
          <Reveal as="p" delay={0.15} className={s.heroNames}>
            <span lang={scriptLang(a)}>{a}</span>
            {!single && (
              <>
                <span className={s.heroAmp} aria-hidden>
                  &amp;
                </span>
                <span lang={scriptLang(b)}>{b}</span>
              </>
            )}
          </Reveal>
          {day && (
            <Reveal as="p" delay={0.2} className={s.heroDate}>
              {format.dateTime(day, { day: "numeric", month: "long", year: "numeric" })}
            </Reveal>
          )}
          <p className={s.scrollHint} aria-hidden>
            {t("scroll")}
            <ChevronDown size={16} />
          </p>
        </div>
      </section>

      {/* ── The invitation in a temple arch: உ, the wording, the families ── */}
      <section className={`${s.section} ${s.withGarland}`}>
        <span className={s.garland} aria-hidden />
        <div className={s.inner}>
          <Reveal className={s.card0}>
            <p className={s.suzhi} aria-hidden>
              உ
            </p>
            <p className={s.tamilTitle} lang="ta">
              {t("tamilTitle")}
            </p>
            <p className={s.blessing}>{t("invited")}</p>
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
            <span className={s.parrot} aria-hidden />
          </Reveal>
        </div>
      </section>

      {/* ── The date over jasmine and marigold on a banana leaf ── */}
      {day && (
        <section className={s.jasmineSection}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/jasmine.webp`} alt="" aria-hidden loading="lazy" />
          <Reveal className={s.dateBlock}>
            <p className={s.capsLine}>{t("saveTheDate")}</p>
            <p className={s.dateDay}>{format.dateTime(day, { day: "numeric" })}</p>
            <p className={s.dateMonth}>{format.dateTime(day, { month: "long", year: "numeric" })}</p>
            <p className={s.dateWeek}>{format.dateTime(day, { weekday: "long" })}</p>
            {category.showCountdown && <CinemaCountdown date={data.weddingDate} s={s} />}
          </Reveal>
        </section>
      )}

      <div className={s.carvings} aria-hidden />

      {/* ── The functions under the Nayakkar Mahal arches ── */}
      {sections.schedule && events.shown.length > 0 && (
        <section className={`${s.section} ${s.mahal}`}>
          <div className={s.mahalBand} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ART}/mahal.webp`} alt="" loading="lazy" />
          </div>
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

      {/* ── The temple tank, and thank you ── */}
      <section className={s.closing}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${ART}/tank.webp`} alt="" aria-hidden loading="lazy" />
        {locale !== "ta" && (
          <Reveal as="p" className={s.closingTa}>
            <span lang="ta">{t("tamilThanks")}</span>
          </Reveal>
        )}
        <Reveal as="p" delay={0.05} className={s.closingLine}>
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
