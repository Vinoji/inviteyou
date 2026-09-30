"use client";

import { Fragment, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { getFamily } from "@/lib/family";
import {
  EMPTY_TRAVEL,
  withDefaultSections,
  type GuestPhoto,
  type InvitationData,
  type RsvpEntry,
} from "@/lib/types";
import { getFontPairing } from "@/lib/fontPairings";
import { getTemplateConfig } from "@/lib/templates";
import type { CategoryMeta } from "@/lib/i18n/categories";
import GuestGallery from "../GuestGallery";
import ThingsToKnow from "../ThingsToKnow";
import RsvpForm from "../RsvpForm";
import BlessingsWall from "../BlessingsWall";
import ShareBox from "../ShareBox";
import AddToCalendar from "../AddToCalendar";
import AudioToggle from "../AudioToggle";
import IntroHost from "../intros/IntroHost";
import Section from "../motion/Section";
import Ambient from "../motion/Ambient";
import RsvpBurst from "../motion/RsvpBurst";
import { getRoyalPalette, royalCssVars } from "../royal/palettes";
import TravelGuide from "../royal/TravelGuide";
import PlacesToExplore from "../royal/PlacesToExplore";
import royal from "../royal/royal.module.css";
import {
  GARDEN,
  GardenAlbum,
  GardenCountdown,
  GardenDay,
  GardenFamilies,
  GardenHero,
  GardenRsvpHeader,
  GardenStory,
  GardenThanks,
  Hedge,
} from "./GardenSections";
import g from "./garden.module.css";

/**
 * The botanical-garden layout: its own world rather than a palette on the
 * royal layout — a glasshouse-door intro, a morning garden hero, an
 * ivy-arched portrait with a pressed-flower story, families in garden
 * windows, hanging wooden signs and stepping stones for the day, a
 * countdown on terracotta pots, polaroids pegged to a string line, and a
 * firefly thank-you. Leafy hedge edges mark every change of background.
 *
 * Travel Guide and Places to Explore reuse the royal components, styled by
 * this template's royal palette (palettes.ts), so they sit in the garden's
 * colours. Used for both the editor preview and the public page.
 */
export default function GardenInvitation({
  data,
  slug,
  mode,
  category,
  occasionTitle,
  coupleLabel,
  rsvpMessages,
  guestPhotos,
  guestGreeting,
}: {
  data: InvitationData;
  slug: string;
  mode: "preview" | "public";
  category: CategoryMeta;
  occasionTitle: string;
  coupleLabel: string;
  rsvpMessages: RsvpEntry[];
  guestPhotos: GuestPhoto[];
  guestGreeting: string;
}) {
  const tView = useTranslations("invite.view");
  const palette = getRoyalPalette(data.templateId);
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const travel = data.travel ?? EMPTY_TRAVEL;
  const places = data.places ?? [];
  const names = [data.brideName, data.groomName].filter(Boolean).join(" & ");
  const brideFamily = getFamily(data, "bride");
  const groomFamily = getFamily(data, "groom");
  const eventBLabel = category.eventBLabel || tView("defaultReception");
  const events = [
    { key: "a", label: category.eventALabel, time: data.ceremonyTime, venue: data.ceremonyVenue },
    { key: "b", label: eventBLabel, time: data.receptionTime, venue: data.receptionVenue },
  ];

  // Sections in order, each with its background, so a hedge edge can be
  // drawn wherever the colour changes. Only sections that render are listed.
  const blocks: { key: string; bg: string; node: ReactNode }[] = [];
  const add = (key: string, bg: string, node: ReactNode) => blocks.push({ key, bg, node });

  if (sections.story && (data.story || data.photos[0])) {
    add(
      "story",
      GARDEN.cream,
      <GardenStory
        story={data.story}
        coverPhoto={data.photos[0]}
        brideName={data.brideName}
        groomName={data.groomName}
        monogram={data.monogram}
      />
    );
  }
  if (sections.family && brideFamily.length + groomFamily.length > 0) {
    add(
      "family",
      GARDEN.sage,
      <GardenFamilies
        brideName={data.brideName}
        groomName={data.groomName}
        brideFamily={brideFamily}
        groomFamily={groomFamily}
      />
    );
  }
  if (sections.schedule) {
    add(
      "day",
      GARDEN.cream,
      <GardenDay brideName={data.brideName} groomName={data.groomName} weddingDate={data.weddingDate} events={events}>
        <AddToCalendar
          slug={slug}
          title={occasionTitle}
          date={data.weddingDate}
          events={events.map(({ label, time, venue }) => ({ label, time, venue }))}
        />
      </GardenDay>
    );
  }
  if (category.showCountdown && data.weddingDate) {
    add("countdown", GARDEN.sage, <GardenCountdown weddingDate={data.weddingDate} />);
  }
  // The first photo is the portrait in the story section.
  if (sections.gallery && data.photos.length > 1) {
    add("album", GARDEN.leaf, <GardenAlbum photos={data.photos.slice(1)} />);
  }
  if (sections.travel) {
    add("travel", GARDEN.cream, <TravelGuide travel={travel} />);
  }
  if (sections.places && places.length > 0) {
    add("places", GARDEN.cream, <PlacesToExplore places={places} city={travel.city} />);
  }
  if (sections.guestPhotos) {
    add(
      "guestPhotos",
      GARDEN.sage,
      <GuestGallery
        slug={slug}
        photos={guestPhotos}
        accentColor={data.accentColor}
        fontPairing={data.fontPairing}
        templateId={data.templateId}
        mode={mode}
      />
    );
  }
  if (sections.faq) {
    add(
      "faq",
      GARDEN.cream,
      <ThingsToKnow
        faq={data.faq ?? []}
        accentColor={data.accentColor}
        fontPairing={data.fontPairing}
        templateId={data.templateId}
      />
    );
  }
  if (sections.rsvp) {
    add(
      "rsvp",
      GARDEN.leaf,
      <section className={`relative ${g.section} ${g.rsvp} ${royal.dark}`}>
        <Ambient at="rsvp" />
        <RsvpBurst />
        <RsvpForm
          slug={slug}
          accentColor={data.accentColor}
          templateId={data.templateId}
          brideName={data.brideName}
          groomName={data.groomName}
          mode={mode}
          initialName={guestGreeting}
          variant="royal"
          header={<GardenRsvpHeader key="rsvp-header" />}
        />
      </section>
    );
  }
  if (sections.rsvp && mode === "public" && rsvpMessages.length > 0) {
    add(
      "blessings",
      GARDEN.cream,
      <BlessingsWall
        messages={rsvpMessages}
        accentColor={data.accentColor}
        fontPairing={data.fontPairing}
        templateId={data.templateId}
      />
    );
  }
  if (mode === "public") {
    add(
      "share",
      GARDEN.cream,
      <ShareBox
        slug={slug}
        occasionTitle={occasionTitle}
        accentColor={data.accentColor}
        weddingDate={data.weddingDate}
        hosts={coupleLabel}
        events={events.map(({ label, time, venue }) => ({ label, time, venue }))}
      />
    );
  }

  const style = {
    ...royalCssVars(palette, data.accentColor),
    "--rp-body": font.bodyVar,
    "--rp-heading": font.headingVar,
    "--inv-heading": font.headingVar,
  } as CSSProperties;

  // The hero ends in meadow green; the first section starts with a hedge.
  let prevBg: string = GARDEN.meadow;

  return (
    <div data-invite-root className={`min-h-full w-full ${royal.root} ${g.root}`} style={style}>
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
        monogram={data.monogram}
        greeting={guestGreeting}
      />
      {mode === "public" && (
        <AudioToggle src={data.backgroundMusic || undefined} templateId={data.templateId} accentColor={data.accentColor} />
      )}

      <div className="relative">
        <Ambient at="hero" />
        <GardenHero brideName={data.brideName} groomName={data.groomName} weddingDate={data.weddingDate} />
      </div>

      {blocks.map((b, i) => {
        const edge = b.bg !== prevBg ? <Hedge from={prevBg} to={b.bg} /> : null;
        prevBg = b.bg;
        return (
          <Fragment key={b.key}>
            {edge}
            <Section index={i + 1}>
              <div style={{ background: b.bg }}>{b.node}</div>
            </Section>
          </Fragment>
        );
      })}

      {prevBg !== GARDEN.dusk && <Hedge from={prevBg} to={GARDEN.dusk} />}
      <div className="relative isolate">
        <Ambient at="thanks" />
        <GardenThanks names={names} />
      </div>

      <footer className={g.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
