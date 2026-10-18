"use client";

import type { CSSProperties, ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { scriptLang, nameFitScale } from "@/lib/monogram";
import { getFontPairing } from "@/lib/fontPairings";
import { getTemplateConfig } from "@/lib/templates";
import { getFamily } from "@/lib/family";
import { withDefaultSections } from "@/lib/types";
import { isRecolor } from "@/lib/color";
import IntroHost from "../../intros/IntroHost";
import AudioToggle from "../../AudioToggle";
import FamilyLines from "../../FamilyLines";
import type { PremiumProps } from "../types";
import CinemaCountdown from "../cinema/CinemaCountdown";
import Reveal from "../cinema/Reveal";
import { EventCards, Guide, Heading, Working, hasGuide, useEvents, useLongDate } from "../cinema/CinemaBlocks";
import { Filmstrip, PhotoHeart, PolaroidWall, RevealTiles, ScratchCard, Slideshow, SwipeStack, ThenNow } from "./AlbumPieces";
import { LampLighting, PhotoGarland, SanctumDoors, Thoranam } from "./TemplePieces";
import { Curtain, PearlNames, Tieback, Trees } from "../pearl/PearlArt";
import pearlCss from "../pearl/pearl.module.css";

const FabricCurtains = dynamic(() => import("../pearl/FabricCurtains"), { ssr: false });
import s from "./album.module.css";

/** Stand-in photos (public/library) so the editor preview shows every
 * section before the couple adds their own. */
const SAMPLES = [
  "/library/photos/wedding-jasmine-bride.jpg",
  "/library/photos/engagement-holding-hands.jpg",
  "/library/photos/wedding-henna-hands.jpg",
  "/library/photos/wedding-ring-ceremony.jpg",
  "/library/photos/love-hands.jpg",
  "/library/photos/engagement-rings-hands.jpg",
  "/library/photos/love-red-roses.jpg",
  "/library/photos/wedding-henna-ritual.jpg",
  "/library/photos/love-wedding-rings.jpg",
];

/** Temple Photo Story's stand-ins: wedding photos among temple scenes. */
const TEMPLE_SAMPLES = [
  "/library/photos/wedding-jasmine-bride.jpg",
  "/art/living-temple/gopuram-night.webp",
  "/library/photos/wedding-henna-ritual.jpg",
  "/library/photos/wedding-ring-ceremony.jpg",
  "/art/temple-gopuram/aarti.webp",
  "/art/living-temple/lamps.webp",
  "/library/photos/engagement-holding-hands.jpg",
  "/art/living-temple/corridor.webp",
  "/library/photos/wedding-henna-hands.jpg",
  "/library/photos/engagement-rings-hands.jpg",
  "/library/photos/home-diya-row.jpg",
  "/art/living-temple/tank.webp",
  "/library/photos/love-wedding-rings.jpg",
  "/art/temple-gopuram/gopuram.webp",
];

/** One album page: a heading and its piece. */
function Part({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className={s.paper}>
      <div className={s.inner}>
        <Heading s={s} kicker={kicker} title={title} />
        {children}
      </div>
    </section>
  );
}

/** Splits the story into up to four chapters: by paragraph, else by sentence. */
function chapters(story: string): string[] {
  const paras = story
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paras.length >= 2) return paras.slice(0, 4);
  const sentences = (paras[0] ?? "").split(/(?<=[.!?।])\s+/).filter(Boolean);
  const n = Math.min(4, sentences.length);
  if (n === 0) return [];
  const per = Math.ceil(sentences.length / n);
  return Array.from({ length: n }, (_, i) => sentences.slice(i * per, (i + 1) * per).join(" ")).filter(Boolean);
}

/**
 * Wedding — "Our Photo Story". A scrapbook album led by the couple's own
 * photos (up to 16, TemplateConfig.maxPhotos), with something to play with
 * in every section: a slideshow hero, a stack to swipe, story chapters
 * taped in like prints, tiles that flip to reveal a photo, a scratch card
 * hiding the date, a then-and-now slider, a wall of polaroids to drag
 * about, a filmstrip with a full-screen viewer and a heart made of photos.
 * In the editor, sample photos fill in until their own are added.
 *
 * "Temple Photo Story" (temple-photo-story, up to 20 photos) is the same
 * album in kumkum, brass and sandal: a thoranam over the hero, sanctum
 * doors that open with a bell, lamps to light, a swinging garland of
 * photos, and a gopuram of photos to close.
 */
export default function AlbumInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const id = data.templateId;
  // Temple Photo Story: the same album in temple colours, with its own copy
  // and three pieces of its own (doors, lamps, garland).
  const temple = id === "temple-photo-story";
  // Pearl Curtain: sage, ivory and pearls; the hero is the linen page the
  // curtains opened on, with the names and their families.
  const pearl = id === "pearl-curtain";
  const t = useTranslations(temple ? "premium.templeAlbum" : pearl ? "premium.pearlAlbum" : "premium.album");
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const events = useEvents(props);
  const when = useLongDate(data.weddingDate);
  const a = data.brideName || tCommon("brideFallback");
  const b = data.groomName || tCommon("groomFallback");
  const own = (data.photos ?? []).filter(Boolean);
  // Preview: top up with samples so every section shows. Published: only
  // their photos, and each section appears once there are enough of them.
  const samples = temple ? TEMPLE_SAMPLES : SAMPLES;
  const photos = mode === "preview" && own.length < samples.length ? [...own, ...samples.slice(own.length)] : own;
  const at = (i: number) => photos[i % Math.max(1, photos.length)];
  const captions = [t("cap1"), t("cap2"), t("cap3"), t("cap4"), t("cap5"), t("cap6")];
  const story = sections.story ? chapters(data.story ?? "") : [];
  const chapterTitles = [t("ch1"), t("ch2"), t("ch3"), t("ch4")];
  const brideFamily = getFamily(data, "bride");
  const groomFamily = getFamily(data, "groom");
  const showGallery = sections.gallery;
  const style = {
    "--p-display": font.headingVar,
    "--p-body": font.bodyVar,
    "--inv-heading": font.headingVar,
    ...(isRecolor(getTemplateConfig(id).defaultAccent, data.accentColor) ? { "--blush": data.accentColor } : {}),
  } as CSSProperties;

  return (
    <div data-invite-root className={`${s.root} ${temple ? s.temple : ""} ${pearl ? s.pearl : ""}`} style={style}>
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
      {mode === "public" && <AudioToggle src={data.backgroundMusic || undefined} templateId={id} accentColor={data.accentColor} />}

      {/* 1 · Pearl Curtain: the tied-back curtains and names on linen */}
      {pearl && (
        <section className={`${pearlCss.hero} ${pearlCss.linen}`}>
          <FabricCurtains
            className={pearlCss.fabric}
            open
            instant
            fallback={
              <>
                <Curtain side="left" open duration={0} />
                <Curtain side="right" open duration={0} />
                <Tieback side="left" show />
                <Tieback side="right" show />
              </>
            }
          />
          <Trees scale={0.75} />
          <Reveal>
            <PearlNames
              kicker={t("lead")}
              a={a}
              b={category.singlePerson ? undefined : b}
              aBelow={sections.family ? <FamilyLines members={brideFamily} side="bride" /> : undefined}
              bBelow={sections.family && !category.singlePerson ? <FamilyLines members={groomFamily} side="groom" /> : undefined}
              date={when.long}
              font={font.headingVar}
            />
            {data.weddingDate && category.showCountdown && (
              <div style={{ position: "relative", zIndex: 2, width: "min(72cqw, 320px)", margin: "18px auto 0" }}>
                <CinemaCountdown date={data.weddingDate} s={s} />
              </div>
            )}
          </Reveal>
          <p className={pearlCss.scroll} aria-hidden>
            {t("scroll")}
            <span>⌄</span>
          </p>
        </section>
      )}

      {/* 1 · Slideshow hero */}
      {!pearl && (
      <section className={s.hero}>
        {temple && <Thoranam className={s.heroThoranam} />}
        <Slideshow photos={photos.length ? photos.slice(0, temple ? 6 : 5) : samples.slice(0, 1)}>
          <Reveal as="p" className={s.heroScript}>
            {t("lead")}
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className={s.heroName} style={{ ["--name-fit" as string]: nameFitScale(a, b) }}>
              <span lang={scriptLang(a)}>{a}</span> <span style={{ fontStyle: "italic", opacity: 0.85 }}>&amp;</span>{" "}
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
        </Slideshow>
      </section>
      )}

      {/* 2 · Swipe through our moments */}
      {showGallery && photos.length >= 3 && (
        <Part kicker={t("swipeKicker")} title={t("swipeTitle")}>
          <SwipeStack photos={photos.slice(0, temple ? 10 : 8)} captions={captions} />
        </Part>
      )}

      {/* 3 · Story chapters */}
      {story.length > 0 && (
        <Part kicker={t("storyKicker")} title={category.storyTitle || t("storyTitle")}>
          <div className={s.chapters}>
            {story.map((text, i) => (
              <div key={i} className={s.chapter}>
                {photos.length > 0 && (
                  <Reveal className={s.chapterPhoto}>
                    <span className={s.tape} aria-hidden />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={at(i + 1)} alt="" loading="lazy" />
                  </Reveal>
                )}
                <Reveal className={s.chapterText} delay={0.1}>
                  <p className={s.chapterNo}>{t("chapterN", { n: i + 1 })}</p>
                  <h3 className={s.chapterTitle}>{chapterTitles[i]}</h3>
                  <p lang={scriptLang(text)}>{text}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </Part>
      )}

      {/* Temple · Ring the bell, open the sanctum doors */}
      {temple && photos.length >= 1 && (
        <Part kicker={t("doorsKicker")} title={t("doorsTitle")}>
          <SanctumDoors photo={at(4)} title={`${a} & ${b}`} sub={when.long} />
        </Part>
      )}

      {/* 4 · Tap to reveal */}
      {showGallery && photos.length >= 1 && (
        <Part kicker={t("tilesKicker")} title={t("tilesTitle")}>
          <RevealTiles photo={at(2)} glyphs={temple ? ["❁", "✺"] : pearl ? ["♥", "❦"] : undefined} />
        </Part>
      )}

      {/* 5 · Scratch to reveal the date */}
      {data.weddingDate && (
        <Part kicker={t("scratchKicker")} title={t("scratchTitle")}>
          <ScratchCard
            photo={at(3)}
            kicker={t("saveTheDate")}
            title={when.long}
            sub={[events.shown[0]?.time, events.shown[0]?.venue?.name].filter(Boolean).join(" · ")}
            glyph={temple ? "❁" : undefined}
          />
        </Part>
      )}

      {/* Temple · Light the lamps */}
      {temple && showGallery && photos.length >= 1 && (
        <Part kicker={t("lampsKicker")} title={t("lampsTitle")}>
          <LampLighting photo={at(5)} />
        </Part>
      )}

      {/* 6 · Families */}
      {/* (Pearl Curtain names the families in its hero.) */}
      {sections.family && !pearl && brideFamily.length + groomFamily.length > 0 && (
        <Part kicker={t("familyKicker")} title={t("familyTitle")}>
          <div className={s.families}>
            {[
              { side: "bride" as const, role: t("bride"), name: a, members: brideFamily },
              { side: "groom" as const, role: t("groom"), name: b, members: groomFamily },
            ]
              .filter((f) => f.members.length > 0)
              .map((f, i) => (
                <Reveal key={f.side} delay={i * 0.12} className={s.familyCard}>
                  <p className={s.familyRole}>{f.role}</p>
                  <h3 className={s.familyName} lang={scriptLang(f.name)}>
                    {f.name}
                  </h3>
                  <FamilyLines members={f.members} side={f.side} lineClassName={s.kin} nameClassName={s.kinNames} />
                </Reveal>
              ))}
          </div>
        </Part>
      )}

      {/* 7 · Events */}
      {sections.schedule && events.shown.length > 0 && (
        <Part kicker={data.eventsKicker?.trim() || t("eventsKicker")} title={data.eventsTitle?.trim() || t("eventsTitle")}>
          <EventCards s={s} slug={slug} title={occasionTitle} date={data.weddingDate} events={events} />
        </Part>
      )}

      {/* Temple · A garland of photos */}
      {temple && showGallery && photos.length >= 3 && (
        <Part kicker={t("garlandKicker")} title={t("garlandTitle")}>
          <PhotoGarland photos={[at(6), at(7), at(8), at(9), at(10)]} />
          <p className={s.tapHint} style={{ display: "flex", justifyContent: "center" }}>
            {t("garlandHint")}
          </p>
        </Part>
      )}

      {/* 8 · Then & now */}
      {showGallery && photos.length >= 2 && (
        <Part kicker={t("compareKicker")} title={t("compareTitle")}>
          <ThenNow before={at(photos.length - 1)} after={at(0)} />
          <p className={s.tapHint} style={{ display: "flex", justifyContent: "center" }}>
            {t("compareHint")}
          </p>
        </Part>
      )}

      {/* 9 · Polaroid wall */}
      {showGallery && photos.length >= 4 && (
        <Part kicker={t("wallKicker")} title={t("wallTitle")}>
          <PolaroidWall photos={photos.slice(0, 9)} captions={captions} />
          <p className={s.tapHint} style={{ display: "flex", justifyContent: "center" }}>
            {t("wallHint")}
          </p>
        </Part>
      )}

      {/* 10 · Filmstrip */}
      {showGallery && photos.length >= 2 && (
        <Part kicker={t("stripKicker")} title={t("stripTitle")}>
          <Filmstrip photos={photos} />
        </Part>
      )}

      {/* 11 · Travel & places */}
      {hasGuide(data) && (
        <Part kicker={t("guideKicker")} title={t("guideTitle")}>
          <Guide s={s} data={data} />
        </Part>
      )}

      {/* 12 · FAQ, guest photos, RSVP, blessings */}
      <section className={s.paper}>
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

      {/* 13 · A heart of photos */}
      <section className={s.albumClosing}>
        {photos.length > 0 && <PhotoHeart photos={photos} shape={temple ? "gopuram" : "heart"} />}
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
