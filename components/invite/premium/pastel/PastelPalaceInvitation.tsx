"use client";

import type { CSSProperties } from "react";
import { useFormatter, useTranslations } from "next-intl";
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
import CinemaCountdown from "../cinema/CinemaCountdown";
import Reveal from "../cinema/Reveal";
import { EventCards, Guide, Heading, Photos, Story, Working, hasGuide, useEvents } from "../cinema/CinemaBlocks";
import s from "./pastel.module.css";

const ART = "/art/pastel-palace";

/** A blush satin bow with gold-edged tails, over the date. */
function Bow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 70" aria-hidden>
      <path d="M60 30C44 8 18 6 14 20s14 26 46 12z" fill="#f2bccb" stroke="#c0607f" strokeWidth="1.2" />
      <path d="M60 30C76 8 102 6 106 20s-14 26-46 12z" fill="#f2bccb" stroke="#c0607f" strokeWidth="1.2" />
      <path d="M57 34c-8 10-14 22-18 34l10-4 6 6c2-12 4-24 4-36zM63 34c8 10 14 22 18 34l-10-4-6 6c-2-12-4-24-4-36z" fill="#efb0c1" stroke="#c0607f" strokeWidth="1" />
      <ellipse cx="60" cy="31" rx="8" ry="7" fill="#e899ae" stroke="#b8955a" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * Wedding — "Pastel Palace": the painted, pastel invitation that's
 * trending — a watercolour castle over a rose garden between white
 * pillars, blush roses and gold framing the names, a bow over the date
 * and a countdown, the functions with maps, the photos, and a "Dear Guest"
 * scroll with a swan to close. Art: public/art/pastel-palace (Pixabay).
 */
export default function PastelPalaceInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const t = useTranslations("premium.pastel");
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

      {/* ── The palace, the pillars and the rose frame with the names ── */}
      <section className={s.palaceHero}>
        <div className={s.castleBand} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/castle.webp`} alt="" fetchPriority="high" />
        </div>
        <span className={`${s.pillar} ${s.pillarL}`} aria-hidden />
        <span className={`${s.pillar} ${s.pillarR}`} aria-hidden />
        <Reveal className={s.roseFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/rose-frame.webp`} alt="" aria-hidden />
          <div className={s.frameText}>
            <p className={s.invitedLine}>{t("invited")}</p>
            <p className={s.frameName} lang={scriptLang(a)}>
              {a}
            </p>
            {brideFamily.length > 0 && (
              <div className={s.frameKin}>
                <FamilyLines members={brideFamily} side="bride" />
              </div>
            )}
            {!single && (
              <>
                <span className={s.frameAmp} aria-hidden>
                  &amp;
                </span>
                <p className={s.frameName} lang={scriptLang(b)}>
                  {b}
                </p>
                {groomFamily.length > 0 && (
                  <div className={s.frameKin}>
                    <FamilyLines members={groomFamily} side="groom" />
                  </div>
                )}
              </>
            )}
          </div>
        </Reveal>
      </section>

      {/* ── A bow over the date and the countdown ── */}
      {day && (
        <section className={`${s.section} ${s.tint}`}>
          <div className={s.inner}>
            <Bow className={s.bow} />
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

      {/* ── Dear Guest: a scroll with a swan, and thank you ── */}
      <section className={`${s.section} ${s.tint}`}>
        <div className={s.inner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/swan.webp`} alt="" aria-hidden loading="lazy" className={s.swan} />
          <Reveal className={s.scroll}>
            <p className={s.dearGuest}>{t("dearGuest")}</p>
            <p className={s.closingSub} style={{ margin: "12px auto 0" }}>
              {t("closing")}
            </p>
            <p className={s.closingName} style={{ marginTop: 16 }}>
              {coupleLabel}
            </p>
          </Reveal>
          <p className={s.closingLine} style={{ marginTop: 40, textAlign: "center" }}>
            {t("thankYou")}
          </p>
        </div>
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
