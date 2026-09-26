import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import {
  EMPTY_TRAVEL,
  withDefaultSections,
  type GuestPhoto,
  type InvitationData,
  type RsvpEntry,
} from "@/lib/types";
import { getFontPairing } from "@/lib/fontPairings";
import type { CategoryMeta } from "@/lib/i18n/categories";
import GuestGallery from "../GuestGallery";
import ThingsToKnow from "../ThingsToKnow";
import RsvpForm from "../RsvpForm";
import BlessingsWall from "../BlessingsWall";
import ShareBox from "../ShareBox";
import AudioToggle from "../AudioToggle";
import IntroHost from "../intros/IntroHost";
import Section from "../motion/Section";
import Ambient from "../motion/Ambient";
import RsvpBurst from "../motion/RsvpBurst";
import ScrollThread from "../motion/ScrollThread";
import { FilmGrain, PinnedCountdown, Sky } from "../motion/scenery";
import { getMotionTheme } from "@/lib/motionThemes";
import { getTemplateConfig } from "@/lib/templates";
import { getRoyalPalette, royalCssVars } from "./palettes";
import { RoyalEvents, RoyalFamilies, RoyalHero } from "./RoyalSections";
import GratefulNote from "./GratefulNote";
import MemoryStack from "./MemoryStack";
import TravelGuide from "./TravelGuide";
import PlacesToExplore from "./PlacesToExplore";
import ThankYou from "./ThankYou";
import RsvpHeader from "./RsvpHeader";
import s from "./royal.module.css";

/**
 * The royal-palace layout shared by every wedding template: palace-door
 * intro, toran-framed hero with a mandapam, a sealed thank-you note,
 * families, events, a polaroid memory stack, travel guide, places to
 * explore, RSVP and a closing thank-you. Each template only swaps the
 * colour palette (see palettes.ts). Used for both the editor preview and
 * the public page, like InvitationView. The intro comes from the template's
 * `intro` via IntroHost; section entrances come from its MotionTheme.
 */
export default function RoyalInvitation({
  data,
  slug,
  mode,
  category,
  occasionTitle,
  coupleLabel,
  rsvpMessages,
  guestPhotos,
}: {
  data: InvitationData;
  slug: string;
  mode: "preview" | "public";
  category: CategoryMeta;
  occasionTitle: string;
  coupleLabel: string;
  rsvpMessages: RsvpEntry[];
  guestPhotos: GuestPhoto[];
}) {
  const tView = useTranslations("invite.view");
  const palette = getRoyalPalette(data.templateId);
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  // Docs published before these fields existed simply don't have them.
  const travel = data.travel ?? EMPTY_TRAVEL;
  const places = data.places ?? [];
  const names = [data.brideName, data.groomName].filter(Boolean).join(" & ");
  const familyShown = sections.family && Boolean(data.brideParents || data.groomParents);

  const theme = getMotionTheme(data.templateId);
  // Numbers only the sections actually rendered (JSX `cond && …` only calls
  // it for those), for alternating wipes and the "01, 02…" divider labels.
  let sectionCount = 0;
  const nextSection = () => ++sectionCount;
  const style = {
    ...royalCssVars(palette, data.accentColor),
    "--rp-body": font.bodyVar,
    "--rp-heading": font.headingVar,
    // Read by the shared components used on this page (ShareBox, RsvpForm…).
    "--inv-heading": font.headingVar,
    // Shows between sections (dividers) and behind them while they enter.
    background: theme.pageBg,
  } as CSSProperties;

  return (
    <div
      data-invite-root
      className={`min-h-full w-full ${s.root} ${theme.plain ? s.plain : ""} ${theme.moments?.sky ? s.skyMode : ""}`}
      style={style}
    >
      <ScrollThread />
      <FilmGrain />
      <IntroHost
        introId={getTemplateConfig(data.templateId).intro}
        templateId={data.templateId}
        slug={slug}
        preview={mode === "preview"}
        weddingDate={data.weddingDate}
        brideName={data.brideName}
        groomName={data.groomName}
        singlePerson={false}
        accentColor={data.accentColor}
        fontPairing={data.fontPairing}
      />
      {mode === "public" && (
        <AudioToggle
          src={data.backgroundMusic || undefined}
          templateId={data.templateId}
          accentColor={data.accentColor}
        />
      )}

      <div className="relative">
        <Ambient at="hero" />
        <RoyalHero
          palette={palette}
          brideName={data.brideName}
          groomName={data.groomName}
          weddingDate={data.weddingDate}
          showCountdown={category.showCountdown}
        />
      </div>
      <PinnedCountdown weddingDate={data.weddingDate} />

      {sections.story && (
        <Section index={nextSection()}>
          <GratefulNote
            scallopColor={familyShown ? palette.mid : palette.ivory}
            story={data.story}
            coverPhoto={data.photos[0]}
            brideName={data.brideName}
            groomName={data.groomName}
            mode={mode}
          />
        </Section>
      )}

      {familyShown && (
        <Section index={nextSection()}>
          <RoyalFamilies
            palette={palette}
            brideName={data.brideName}
            groomName={data.groomName}
            brideParents={data.brideParents}
            groomParents={data.groomParents}
          />
        </Section>
      )}

      {sections.schedule && (
        <Section index={nextSection()}>
          <RoyalEvents
            weddingDate={data.weddingDate}
            city={travel.city}
            ceremonyTime={data.ceremonyTime}
            ceremonyVenue={data.ceremonyVenue}
            receptionTime={data.receptionTime}
            receptionVenue={data.receptionVenue}
            eventALabel={category.eventALabel}
            eventBLabel={category.eventBLabel || tView("defaultReception")}
          />
        </Section>
      )}

      {/* The first photo is the portrait in the grateful-note section. */}
      {sections.gallery && (
        <Section index={nextSection()}>
          <MemoryStack photos={data.photos.slice(1)} />
        </Section>
      )}

      {sections.travel && (
        <Section index={nextSection()}>
          <TravelGuide travel={travel} />
        </Section>
      )}

      {sections.places && (
        <Section index={nextSection()}>
          <PlacesToExplore places={places} city={travel.city} />
        </Section>
      )}

      {sections.guestPhotos && (
        <Section index={nextSection()}>
          <div className={s.light}>
            <GuestGallery
              slug={slug}
              photos={guestPhotos}
              accentColor={data.accentColor}
              fontPairing={data.fontPairing}
              templateId={data.templateId}
              mode={mode}
            />
          </div>
        </Section>
      )}

      {sections.faq && (
        <Section index={nextSection()}>
          <div className={s.light}>
            <ThingsToKnow
              faq={data.faq ?? []}
              accentColor={data.accentColor}
              fontPairing={data.fontPairing}
              templateId={data.templateId}
            />
          </div>
        </Section>
      )}

      {sections.rsvp && (
        <Section index={nextSection()}>
          <section className={`relative ${s.section} ${s.rsvp} ${s.dark}`}>
            <Ambient at="rsvp" />
            <RsvpBurst />
            <RsvpForm
              slug={slug}
              accentColor={data.accentColor}
              templateId={data.templateId}
              brideName={data.brideName}
              groomName={data.groomName}
              mode={mode}
              variant="royal"
              header={<RsvpHeader key="rsvp-header" />}
            />
          </section>
        </Section>
      )}

      {sections.rsvp && mode === "public" && rsvpMessages.length > 0 && (
        <Section index={nextSection()}>
          <div className={s.light}>
            <BlessingsWall
              messages={rsvpMessages}
              accentColor={data.accentColor}
              fontPairing={data.fontPairing}
              templateId={data.templateId}
            />
          </div>
        </Section>
      )}

      {mode === "public" && (
        <div className={s.light}>
          <ShareBox slug={slug} occasionTitle={occasionTitle} accentColor={data.accentColor} />
        </div>
      )}

      <div className="relative isolate">
        <Sky at="thanks" />
        <Ambient at="thanks" />
        <ThankYou names={names} />
      </div>

      <footer className="bg-neutral-950 px-6 py-6 text-center text-xs text-neutral-400">
        {tView("madeWith", { couple: coupleLabel })}
      </footer>
    </div>
  );
}
