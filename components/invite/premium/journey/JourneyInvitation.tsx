"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
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
import useSafeReducedMotion from "../../useSafeReducedMotion";
import { scrollParent } from "../../motion/scroll";
import type { PremiumProps } from "../types";
import CinemaCountdown from "../cinema/CinemaCountdown";
import Reveal from "../cinema/Reveal";
import { EventCards, Guide, Heading, Working, hasGuide, useEvents, useLongDate } from "../cinema/CinemaBlocks";
import { Cloud, Garland, LotusCorner } from "./JourneyArt";
import s from "./journey.module.css";
import InviteVideo from "@/components/invite/InviteVideo";

/** Stand-ins so the editor preview shows every scene before photos are added. */
const SAMPLES = [
  "/library/photos/engagement-holding-hands.jpg",
  "/library/photos/wedding-jasmine-bride.jpg",
  "/library/photos/wedding-ring-ceremony.jpg",
  "/library/photos/wedding-henna-ritual.jpg",
  "/library/photos/wedding-henna-hands.jpg",
  "/library/photos/love-hands.jpg",
  "/library/photos/engagement-rings-hands.jpg",
  "/library/photos/love-wedding-rings.jpg",
];

/** Where the prints settle around the invitation card, and how they lean. */
const PRINTS = [
  { side: -1, x: "left", y: "top", ox: "1cqw", oy: "5cqh", r: -9 },
  { side: 1, x: "right", y: "top", ox: "1cqw", oy: "9cqh", r: 7 },
  { side: -1, x: "left", y: "bottom", ox: "3cqw", oy: "6cqh", r: 6 },
  { side: 1, x: "right", y: "bottom", ox: "2cqw", oy: "4cqh", r: -8 },
] as const;

/** One printed photo, flying in from its side as the corridor scene scrolls. */
function Print({ p, i, src, caption }: { p: MotionValue<number>; i: number; src: string; caption: string }) {
  const spot = PRINTS[i];
  const a = 0.3 + i * 0.09;
  const x = useTransform(p, [a, a + 0.28], [`${spot.side * 70}cqw`, "0cqw"]);
  const rotate = useTransform(p, [a, a + 0.28], [spot.r + spot.side * 30, spot.r]);
  const opacity = useTransform(p, [a, a + 0.12], [0, 1]);
  return (
    <motion.figure
      className={s.print}
      style={{ x, rotate, opacity, [spot.x]: spot.ox, [spot.y]: spot.oy }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" />
      <figcaption>{caption}</figcaption>
    </motion.figure>
  );
}

/** A real painted gopuram (Pexels, Nirmal Dev), made whole by mirroring
 * its right half and cut out of its sky — docs/template-art.md. */
const GOPURAM = "/art/temple-journey/gopuram.webp";

const SCENE_PHOTOS = [
  "/art/living-temple/corridor.webp",
  "/art/living-temple/lamps.webp",
  "/art/living-temple/finale.webp",
  "/art/temple-journey/silk.webp",
  "/library/photos/home-diya-row.jpg",
];

const clamp = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Progress (0…1) through a pinned scene as it scrolls — in the editor's
 * scrolling pane or on the page — and the scroll viewport's height as
 * `--jh` on the invitation root, so the pinned stages fit the pane.
 */
function usePin(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const progress = useMotionValue(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const container = scrollParent(el);
    const target: HTMLElement | Window = container ?? window;
    let raf = 0;
    const run = () => {
      raf = 0;
      const vp = container ? container.getBoundingClientRect() : new DOMRect(0, 0, innerWidth, innerHeight);
      const r = el.getBoundingClientRect();
      const range = r.height - vp.height;
      progress.set(range > 0 ? clamp((vp.top - r.top) / range) : 0);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, progress]);
  return progress;
}

function useViewportHeight(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const container = scrollParent(el);
    const set = () => el.style.setProperty("--jh", `${container ? container.clientHeight : window.innerHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    if (container) ro.observe(container);
    window.addEventListener("resize", set);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", set);
    };
  }, [root]);
}

/** A pinned scene `screens` viewports tall (one, with reduced motion). */
function Pin({ screens, reduce, pinRef, children }: { screens: number; reduce: boolean; pinRef: RefObject<HTMLElement | null>; children: React.ReactNode }) {
  return (
    <section ref={pinRef} className={s.pin} style={{ height: `calc(var(--jh, 100svh) * ${reduce ? 1 : screens})` }}>
      <div className={s.stage}>{children}</div>
    </section>
  );
}

const CLOUDS = [
  { n: 1, x: -18, y: 2, w: 62 },
  { n: 2, x: 58, y: 8, w: 56 },
  { n: 3, x: -10, y: 30, w: 40 },
  { n: 1, x: 70, y: 36, w: 44 },
  { n: 3, x: 34, y: -4, w: 34 },
] as const;

/**
 * Wedding — "Temple Journey". A scroll journey, like a film the guest
 * drives: from a blue sky with the couple's names, a real painted gopuram
 * rises and the camera flies into the window of its crown; down a real
 * temple corridor the invitation card rises as their photos fly in around
 * it as taped prints; the functions in temple frames; their photo in a
 * gold arch before glowing brass temple lamps; "meet the bride and groom"
 * on red silk over a row of lit diyas; the venue under the temple tower
 * lit gold at night; and the days
 * counted on embossed paper. Photos: public/art/temple-journey and the
 * living-temple corridor and lamps; the rest is drawn in code (JourneyArt).
 */
export default function JourneyInvitation(props: PremiumProps) {
  const { data, slug, mode, category, occasionTitle, coupleLabel, guestGreeting } = props;
  const t = useTranslations("premium.journey");
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const reduce = useSafeReducedMotion();
  const id = data.templateId;
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const events = useEvents(props);
  const when = useLongDate(data.weddingDate);
  const a = data.brideName || tCommon("brideFallback");
  const b = data.groomName || tCommon("groomFallback");
  const own = (data.photos ?? []).filter(Boolean);
  const photos = mode === "preview" && own.length < SAMPLES.length ? [...own, ...SAMPLES.slice(own.length)] : own;
  // Each scene takes its own photos, repeating only when there are few.
  const at = (i: number) => photos[i % Math.max(1, photos.length)];
  const brideFamily = getFamily(data, "bride");
  const groomFamily = getFamily(data, "groom");
  const venue = events.shown[0]?.venue;

  const root = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLElement>(null);
  const gateRef = useRef<HTMLElement>(null);
  const archRef = useRef<HTMLElement>(null);
  const venueRef = useRef<HTMLElement>(null);
  useViewportHeight(root);
  // Fetch the scenes' photos up front, so no scene waits on a download
  // (and shows the bare page) when the guest scrolls into it.
  useEffect(() => {
    SCENE_PHOTOS.forEach((src) => {
      const im = new Image();
      im.src = src;
    });
  }, []);
  const skyP = usePin(skyRef);
  const gateP = usePin(gateRef);
  const archP = usePin(archRef);
  const venueP = usePin(venueRef);

  // Reduced motion: each scene holds one telling frame.
  const fixed = (v: number) => (reduce ? v : undefined);
  const skyV = useTransform(skyP, (v) => fixed(0.3) ?? v);
  const gateV = useTransform(gateP, (v) => fixed(1) ?? v);
  const archV = useTransform(archP, (v) => fixed(1) ?? v);
  const venueV = useTransform(venueP, (v) => fixed(1) ?? v);

  // 1 · sky → gopuram → through its door
  // The tower rises as the names drift up, holds whole, then the camera
  // flies into the window at the heart of its crown.
  const namesY = useTransform(skyV, [0, 0.3], ["0cqh", "-20cqh"]);
  const namesO = useTransform(skyV, [0.1, 0.28], [1, 0]);
  const gopY = useTransform(skyV, [0, 0.34], ["64%", "0%"]);
  // No overlay between scenes: each pinned scene hands over by scrolling
  // away as the next scrolls in, so there is always a picture on screen.
  const gopS = useTransform(skyV, [0.5, 1], [1, 6]);
  const cloudY = useTransform(skyV, [0, 1], ["0cqh", "-40cqh"]);
  const cueO = useTransform(skyV, [0, 0.06], [1, 0]);

  // 2 · down the corridor
  // Down the temple corridor: the card rises, their prints fly in.
  const dolly = useTransform(gateV, [0, 1], [1.04, 1.5]);
  const cardY = useTransform(gateV, [0.06, 0.4], ["70cqh", "0cqh"]);
  const cardS = useTransform(gateV, [0.06, 0.4], [0.86, 1]);

  // 4 · their photo in a temple arch, zooming out
  const archS = useTransform(archV, [0, 0.7], [2.3, 1]);
  const lampsS = useTransform(archV, [0, 1], [1.25, 1.05]);
  const capO = useTransform(archV, [0.6, 0.9], [0, 1]);

  // 6 · the lit tower: the camera eases back and down as the venue rises
  const towerS = useTransform(venueV, [0, 1], [1.35, 1.05]);
  const towerY = useTransform(venueV, [0, 1], ["-4%", "2%"]);
  const venueO = useTransform(venueV, [0.25, 0.55], [0, 1]);
  const venueY = useTransform(venueV, [0.25, 0.6], [30, 0]);

  const style = {
    "--p-display": font.headingVar,
    "--p-body": font.bodyVar,
    "--inv-heading": font.headingVar,
    ...(isRecolor(getTemplateConfig(id).defaultAccent, data.accentColor) ? { "--blush": data.accentColor } : {}),
  } as CSSProperties;

  return (
    <div ref={root} data-invite-root className={s.root} style={style}>
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

      {/* 1 · The sky, the names, and a gopuram to fly into */}
      <Pin screens={2.2} reduce={reduce} pinRef={skyRef}>
        <div className={`${s.layer} ${s.sky}`} />
        <motion.div className={s.layer} style={{ y: cloudY }}>
          {CLOUDS.map((c, i) => (
            <Cloud key={i} n={c.n} className={s.cloud} style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%` }} />
          ))}
        </motion.div>
        <motion.div className={s.names} style={{ y: namesY, opacity: namesO }}>
          <span className={s.namesBig} lang={scriptLang(a)} style={{ ["--name-fit" as string]: nameFitScale(a, b) }}>
            {a}
          </span>
          {!category.singlePerson && (
            <>
              <span className={s.weds}>{t("weds")}</span>
              <span className={s.namesBig} lang={scriptLang(b)}>
                {b}
              </span>
            </>
          )}
          <p className={s.married}>{t("lead")}</p>
        </motion.div>
        <motion.div className={s.gopuram} style={{ y: gopY, scale: gopS }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={GOPURAM} alt="" />
        </motion.div>
        <div className={s.mist} />
        {!reduce && (
          <motion.p className={s.scrollCue} style={{ opacity: cueO }} aria-hidden>
            {t("scroll")}
            <span>⌄</span>
          </motion.p>
        )}
      </Pin>

      {/* 2 · Down a real temple corridor: the invitation card rises and
          their photographs fly in around it like a photo story */}
      <Pin screens={2} reduce={reduce} pinRef={gateRef}>
        <motion.div className={s.corridor} style={{ scale: dolly }} />
        <div className={s.corridorShade} />
        {photos.length > 1 &&
          PRINTS.map((_, i) => <Print key={i} p={gateV} i={i} src={at(i + 1)} caption={t(`cap${i + 1}` as "cap1")} />)}
        <motion.div className={s.inviteCard} style={{ y: cardY, scale: cardS }}>
          <span className={s.om} aria-hidden>
            ॐ
          </span>
          <p className={s.invocation}>{t("invocation")}</p>
          <p className={s.invocation} style={{ marginTop: 6 }}>
            {t("inviteLead")}
          </p>
          <h1 style={{ margin: "14px 0 0", fontWeight: 400 }}>
            <span className={s.bigName} lang={scriptLang(a)}>
              {a}
            </span>
            {sections.family && <FamilyLines members={brideFamily} side="bride" lineClassName={s.kin} nameClassName={s.kinNames} />}
            {!category.singlePerson && (
              <>
                <span className={s.amp}>&amp;</span>
                <span className={s.bigName} lang={scriptLang(b)}>
                  {b}
                </span>
              </>
            )}
          </h1>
          {sections.family && !category.singlePerson && (
            <FamilyLines members={groomFamily} side="groom" lineClassName={s.kin} nameClassName={s.kinNames} />
          )}
          <p className={s.inviteDate}>{when.long}</p>
        </motion.div>
      </Pin>

      {/* 3 · The functions, in temple frames */}
      {data.videoUrl && <InviteVideo url={data.videoUrl} accent={data.accentColor} dark />}
      {sections.schedule && events.shown.length > 0 && (
        <section className={s.templeBand}>
          <svg className={s.bandGarland} viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden>
            <rect width="1000" height="16" fill="#7fb2e5" />
            <rect y="16" width="1000" height="6" fill="#f6d26b" />
            <Garland width={1000} swags={6} y={22} sag={50} />
          </svg>
          <div className={s.inner}>
            <Heading s={s} kicker={data.eventsKicker?.trim() || t("eventsKicker")} title={data.eventsTitle?.trim() || t("eventsTitle")} />
            <EventCards s={s} slug={slug} title={occasionTitle} date={data.weddingDate} events={events} />
          </div>
        </section>
      )}

      {/* 4 · Their photo in a gold arch, before real temple lamps */}
      {photos.length > 0 && (
        <Pin screens={1.5} reduce={reduce} pinRef={archRef}>
          <motion.div className={s.lampsBg} style={{ scale: lampsS }} />
          <div className={s.archFrame}>
            <motion.div className={s.archPhoto} style={{ scale: archS }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[0]} alt="" />
            </motion.div>
          </div>
          <motion.p className={s.archCaption} style={{ opacity: capO }}>
            {t("archCaption")}
          </motion.p>
        </Pin>
      )}

      {/* 5 · Red silk and lit diyas: meet the bride and groom */}
      {!category.singlePerson && (
        <section className={s.red}>
          <span className={s.zari} aria-hidden />
          <span className={`${s.zari} ${s.zariBottom}`} aria-hidden />
          <span className={s.diyas} aria-hidden />
          <Reveal as="p" className={s.redTitle}>
            {t("meetTitle")}
          </Reveal>
          <div className={s.pair}>
            {[
              { side: "bride" as const, role: t("bride"), name: a, photo: photos.length ? at(5) : undefined, members: brideFamily },
              { side: "groom" as const, role: t("groom"), name: b, photo: photos.length ? at(6) : undefined, members: groomFamily },
            ].map((p, i) => (
              <Reveal key={p.side} delay={i * 0.15} className={s.scallop} style={p.photo ? undefined : { paddingTop: 90 }}>
                {p.photo && (
                  <span className={s.scallopPhoto}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.photo} alt="" loading="lazy" />
                  </span>
                )}
                <p className={s.role}>{p.role}</p>
                <h3 className={s.pairName} lang={scriptLang(p.name)}>
                  {p.name}
                </h3>
                {sections.family && <FamilyLines members={p.members} side={p.side} lineClassName={s.kin} nameClassName={s.kinNames} />}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 6 · The venue: the temple tower lit gold at night */}
      <Pin screens={1.4} reduce={reduce} pinRef={venueRef}>
        <motion.div className={s.nightTower} style={{ scale: towerS, y: towerY }} />
        <div className={s.nightShade} />
        <div className={s.venueText}>
          <motion.p className={s.kicker} style={{ color: "#f3d58a", opacity: venueO }}>
            {t("venueKicker")}
          </motion.p>
          <motion.p className={s.venueName} style={{ opacity: venueO, y: venueY }}>
            {venue?.name || t("venueFallback")}
          </motion.p>
          {venue?.address && (
            <motion.p className={s.venueSub} style={{ opacity: venueO }}>
              {venue.address}
            </motion.p>
          )}
        </div>
      </Pin>
      {photos.length > 0 && (
        <section className={s.silkBand}>
          <Reveal className={s.frameGold}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={at(7)} alt="" loading="lazy" />
          </Reveal>
        </section>
      )}

      {/* 7 · Counting the days, embossed */}
      {data.weddingDate && category.showCountdown && (
        <section className={s.emboss}>
          <LotusCorner className={s.embossLotus} style={{ left: -40 }} />
          <LotusCorner className={s.embossLotus} style={{ right: -40, transform: "scaleX(-1)" }} />
          <Reveal as="p" className={s.embossTitle}>
            {t("countTitle")}
          </Reveal>
          <Reveal delay={0.15}>
            <CinemaCountdown date={data.weddingDate} s={s} />
          </Reveal>
        </section>
      )}

      {/* 8 · Travel & places */}
      {hasGuide(data) && (
        <section className={s.paper}>
          <div className={s.inner}>
            <Heading s={s} kicker={t("guideKicker")} title={t("guideTitle")} />
            <Guide s={s} data={data} />
          </div>
        </section>
      )}

      {/* 9 · FAQ, guest photos, RSVP, blessings */}
      <section className={s.paper}>
        <svg className={s.bandGarland} viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden>
          <Garland width={1000} swags={6} y={0} sag={50} />
        </svg>
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

      <section className={s.closingBand}>
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
