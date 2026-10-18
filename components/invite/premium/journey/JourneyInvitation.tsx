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
import { BananaPlant, Cloud, DeityPillar, Garland, Gateway, Gopuram, HangingLamp, LotusCorner } from "./JourneyArt";
import s from "./journey.module.css";

/** Stand-ins so the editor preview shows every scene before photos are added. */
const SAMPLES = [
  "/library/photos/engagement-holding-hands.jpg",
  "/library/photos/wedding-jasmine-bride.jpg",
  "/library/photos/wedding-ring-ceremony.jpg",
  "/library/photos/wedding-henna-ritual.jpg",
];

/** A real painted gopuram (Pexels, Nirmal Dev), made whole by mirroring
 * its right half and cut out of its sky — docs/template-art.md. */
const GOPURAM = "/art/temple-journey/gopuram.webp";

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
  { x: -6, y: 6, w: 34, d: -1 },
  { x: 70, y: 10, w: 30, d: 1 },
  { x: 8, y: 34, w: 22, d: -1 },
  { x: 76, y: 40, w: 24, d: 1 },
  { x: 40, y: 2, w: 18, d: 1 },
];

/**
 * Wedding — "Temple Journey". A scroll journey, like a film the guest
 * drives: from a blue sky with the couple's names, a painted gopuram rises
 * and the camera flies in through its doorway; a stucco gateway hung with
 * marigolds opens its arch on the invitation, framed by carved deity
 * pillars; the functions in temple frames; their photo in a temple arch
 * between banana plants; a red-and-gold "meet the bride and groom" with
 * hanging lamps; the venue under a row of gold gopurams; and the days
 * counted on embossed paper. All the art is drawn in code (JourneyArt).
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
  const brideFamily = getFamily(data, "bride");
  const groomFamily = getFamily(data, "groom");
  const venue = events.shown[0]?.venue;

  const root = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLElement>(null);
  const gateRef = useRef<HTMLElement>(null);
  const archRef = useRef<HTMLElement>(null);
  useViewportHeight(root);
  const skyP = usePin(skyRef);
  const gateP = usePin(gateRef);
  const archP = usePin(archRef);

  // Reduced motion: each scene holds one telling frame.
  const fixed = (v: number) => (reduce ? v : undefined);
  const skyV = useTransform(skyP, (v) => fixed(0.3) ?? v);
  const gateV = useTransform(gateP, (v) => fixed(1) ?? v);
  const archV = useTransform(archP, (v) => fixed(1) ?? v);

  // 1 · sky → gopuram → through its door
  // The tower rises as the names drift up, holds whole, then the camera
  // flies into the window at the heart of its crown.
  const namesY = useTransform(skyV, [0, 0.3], ["0cqh", "-20cqh"]);
  const namesO = useTransform(skyV, [0.1, 0.28], [1, 0]);
  const gopY = useTransform(skyV, [0, 0.34], ["55%", "0%"]);
  const gopS = useTransform(skyV, [0.5, 0.98], [1, 12]);
  const cloudY = useTransform(skyV, [0, 1], ["0cqh", "-40cqh"]);
  const flash = useTransform(skyV, [0.9, 1], [0, 1]);
  const cueO = useTransform(skyV, [0, 0.06], [1, 0]);

  // 2 · the gateway opens on the invitation
  const flashIn = useTransform(gateV, [0, 0.07], [1, 0]);
  // The gateway holds, then its arch opens around the invitation.
  const gateS = useTransform(gateV, [0.3, 0.85], [1, 6]);
  const gateO = useTransform(gateV, [0.74, 0.88], [1, 0]);
  const inviteS = useTransform(gateV, [0.3, 0.9], [0.8, 1]);

  // 4 · their photo in a temple arch, zooming out
  const archS = useTransform(archV, [0, 0.7], [2.3, 1]);
  const banL = useTransform(archV, [0.15, 0.7], ["-40cqw", "0cqw"]);
  const banR = useTransform(archV, [0.15, 0.7], ["40cqw", "0cqw"]);
  const capO = useTransform(archV, [0.6, 0.9], [0, 1]);

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
      <Pin screens={3.6} reduce={reduce} pinRef={skyRef}>
        <div className={`${s.layer} ${s.sky}`} />
        <motion.div className={s.layer} style={{ y: cloudY }}>
          {CLOUDS.map((c, i) => (
            <Cloud key={i} className={s.cloud} style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%` }} />
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
        <motion.div className={s.layer} style={{ background: "#fffaf0", opacity: flash }} />
        {!reduce && (
          <motion.p className={s.scrollCue} style={{ opacity: cueO }} aria-hidden>
            {t("scroll")}
            <span>⌄</span>
          </motion.p>
        )}
      </Pin>

      {/* 2 · A stucco gateway whose arch opens on the invitation */}
      <Pin screens={3} reduce={reduce} pinRef={gateRef}>
        <div className={s.invite}>
          <DeityPillar id="l" className={`${s.pillar} ${s.pillarL}`} />
          <DeityPillar id="r" className={`${s.pillar} ${s.pillarR}`} flip />
          <motion.div className={s.inviteText} style={{ scale: inviteS }}>
            <span className={s.ganesha} aria-hidden style={{ fontSize: 34, color: "#c99a2e" }}>
              ॐ
            </span>
            <p className={s.invocation}>{t("invocation")}</p>
            <p className={s.invocation} style={{ marginTop: 8 }}>
              {t("inviteLead")}
            </p>
            <h1 style={{ margin: "18px 0 0", fontWeight: 400 }}>
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
        </div>
        <motion.div className={s.gateway} style={{ scale: gateS, opacity: gateO }}>
          <Gateway />
        </motion.div>
        <motion.div className={s.layer} style={{ background: "#fffaf0", opacity: flashIn, pointerEvents: "none" }} />
      </Pin>

      {/* 3 · The functions, in temple frames */}
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

      {/* 4 · Their photo in a temple arch, between banana plants */}
      {photos.length > 0 && (
        <Pin screens={2} reduce={reduce} pinRef={archRef}>
          <div className={s.archFrame}>
            <motion.div className={s.archPhoto} style={{ scale: archS }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[0]} alt="" />
            </motion.div>
          </div>
          <motion.div className={`${s.banana} ${s.bananaL}`} style={{ x: banL }}>
            <BananaPlant style={{ width: "100%", height: "100%" }} />
          </motion.div>
          <motion.div className={`${s.banana} ${s.bananaR}`} style={{ x: banR }}>
            <BananaPlant style={{ width: "100%", height: "100%" }} />
          </motion.div>
          <motion.p className={s.archCaption} style={{ opacity: capO }}>
            {t("archCaption")}
          </motion.p>
        </Pin>
      )}

      {/* 5 · Red and gold: meet the bride and groom */}
      {!category.singlePerson && (
        <section className={s.red}>
          <LotusCorner className={s.lotusTL} />
          <LotusCorner className={s.lotusTR} />
          <HangingLamp className={`${s.lamp} ${s.lampL}`} />
          <HangingLamp className={`${s.lamp} ${s.lampR}`} />
          <Reveal as="p" className={s.redTitle}>
            {t("meetTitle")}
          </Reveal>
          <div className={s.pair}>
            {[
              { side: "bride" as const, role: t("bride"), name: a, photo: photos[1], members: brideFamily },
              { side: "groom" as const, role: t("groom"), name: b, photo: photos[2], members: groomFamily },
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

      {/* 6 · The venue under a row of gold gopurams */}
      <section className={s.panorama}>
        {photos[3] && (
          <Reveal className={s.frameGold}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[3]} alt="" loading="lazy" />
          </Reveal>
        )}
        <div className={s.towers}>
          {[11, 12, 13, 14, 15].map((seed) => (
            <Gopuram key={seed} gold seed={seed} />
          ))}
        </div>
        <div className={s.venueBand}>
          <span className={s.curtainL} aria-hidden />
          <span className={s.curtainR} aria-hidden />
          <Reveal as="p" className={s.kicker} style={{ color: "#f3d58a" }}>
            {t("venueKicker")}
          </Reveal>
          <Reveal as="p" className={s.venueName} delay={0.1}>
            {venue?.name || t("venueFallback")}
          </Reveal>
          {venue?.address && (
            <Reveal as="p" className={s.venueSub} delay={0.2}>
              {venue.address}
            </Reveal>
          )}
        </div>
      </section>

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
