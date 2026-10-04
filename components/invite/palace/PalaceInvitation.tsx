"use client";

import type { CSSProperties } from "react";
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
import { resolveMonogram } from "@/lib/monogram";
import type { CategoryMeta } from "@/lib/i18n/categories";
import GuestGallery from "../GuestGallery";
import ThingsToKnow from "../ThingsToKnow";
import RsvpForm from "../RsvpForm";
import BlessingsWall from "../BlessingsWall";
import ShareBox from "../ShareBox";
import AddToCalendar from "../AddToCalendar";
import AudioToggle from "../AudioToggle";
import IntroHost from "../intros/IntroHost";
import Ambient from "../motion/Ambient";
import RsvpBurst from "../motion/RsvpBurst";
import { getRoyalPalette, royalCssVars } from "../royal/palettes";
import TravelGuide from "../royal/TravelGuide";
import PlacesToExplore from "../royal/PlacesToExplore";
import royal from "../royal/royal.module.css";
import PalaceStage from "./PalaceStage";
import { WorldContext, usePalaceT, worldOf } from "./world";
import {
  Chapter,
  CoupleHero,
  Countdown,
  Entrance,
  Events,
  Families,
  Finale,
  Gallery,
  Parchment,
  Scene,
  StoryTimeline,
  type PalaceEvent,
} from "./PalaceSections";
import p from "./palace.module.css";

/**
 * Royal Palace 3D: the guest walks into a palace. After the gate intro
 * (PalaceIntro), a 3D palace (PalaceStage) stays behind the whole page and
 * the camera moves through it as they scroll — entrance, the couple in the
 * royal hall, the story along the corridor, families, the courtyard events,
 * the countdown columns, portraits, travel, places, FAQ, RSVP under the
 * night sky, blessings, guest photos — then pulls back out to the lit
 * palace for the thank-you.
 *
 * All content is the ordinary invitation data; travel, places, FAQ, RSVP,
 * blessings, guest photos and share are the shared components, set on
 * ivory parchment and styled by this template's royal palette. Used for
 * both the editor preview and the public page.
 */
export default function PalaceInvitation({
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
  const tCommon = useTranslations("common");
  const world = worldOf(data.templateId);
  const tTravel = usePalaceT("travel", world);
  const tPlaces = usePalaceT("places", world);
  const tFaq = usePalaceT("faq", world);
  const tRsvp = usePalaceT("rsvp", world);
  const tBlessings = usePalaceT("blessings", world);
  const tGuests = usePalaceT("guests", world);
  const palette = getRoyalPalette(data.templateId, data.accentColor);
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const travel = data.travel ?? EMPTY_TRAVEL;
  const places = data.places ?? [];
  const brideName = data.brideName || tCommon("brideFallback");
  const groomName = data.groomName || tCommon("groomFallback");
  const brideFamily = getFamily(data, "bride");
  const groomFamily = getFamily(data, "groom");
  const monogram = resolveMonogram(brideName, groomName, data.monogram, false);
  const eventBLabel = category.eventBLabel || tView("defaultReception");
  const events: (PalaceEvent & { venue: InvitationData["ceremonyVenue"] })[] = [
    { key: "a", label: category.eventALabel, time: data.ceremonyTime, venue: data.ceremonyVenue },
    { key: "b", label: eventBLabel, time: data.receptionTime, venue: data.receptionVenue },
  ].filter((e) => e.time || e.venue?.name);
  const calendarEvents = events.map(({ label, time, venue }) => ({ label, time, venue }));
  const hasTravel =
    Boolean(travel.city) ||
    travel.airports.length > 0 ||
    (travel.stations ?? []).length > 0 ||
    travel.routes.some((r) => r.trains.length > 0);
  const hasFaq = (data.faq ?? []).some((f) => f.question.trim() && f.answer.trim());
  // The first two photos are the couple's portraits in the hall.
  const portraits = data.photos.slice(0, 2);
  const memories = data.photos.slice(2);
  const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(data.weddingDate);

  const style = {
    ...royalCssVars(palette, data.accentColor),
    "--rp-body": font.bodyVar,
    "--rp-heading": font.headingVar,
    "--inv-heading": font.headingVar,
    "--pl-gold": palette.gold,
    "--pl-gold-light": palette.goldLight,
    "--pl-gold-deep": palette.goldDeep,
    "--pl-display": font.headingVar,
    "--pl-body": font.bodyVar,
  } as CSSProperties;

  return (
    <WorldContext.Provider value={world}>
    <div data-invite-root data-world={world} className={`min-h-full w-full ${royal.root} ${p.root}`} style={style}>
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

      <PalaceStage world={world} gold={palette.gold} preview={mode === "preview"} />

      <main className={p.content} data-palace-content>
        <Entrance names={{ a: brideName, b: groomName }} />

        <CoupleHero
          brideName={brideName}
          groomName={groomName}
          weddingDate={data.weddingDate}
          photos={portraits}
          monogram={{ a: monogram.a, b: monogram.b ?? "" }}
        />

        {sections.story && data.story.trim() && <StoryTimeline story={data.story} />}

        {sections.family && brideFamily.length + groomFamily.length > 0 && (
          <Families brideName={brideName} groomName={groomName} brideFamily={brideFamily} groomFamily={groomFamily} />
        )}

        {sections.schedule && events.length > 0 && (
          <Events events={events} weddingDate={data.weddingDate}>
            <AddToCalendar slug={slug} title={occasionTitle} date={data.weddingDate} events={calendarEvents} />
          </Events>
        )}

        {category.showCountdown && hasDate && <Countdown weddingDate={data.weddingDate} ceremonyTime={data.ceremonyTime} />}

        {sections.gallery && <Gallery photos={memories} />}

        {sections.travel && hasTravel && (
          <Scene shot="travel">
            <Chapter eyebrow={tTravel("eyebrow")} heading={tTravel("heading")} />
            <Parchment>
              <TravelGuide travel={travel} />
            </Parchment>
          </Scene>
        )}

        {sections.places && places.length > 0 && (
          <Scene shot="places">
            <Chapter eyebrow={tPlaces("eyebrow")} heading={tPlaces("heading")} />
            <Parchment>
              <PlacesToExplore places={places} city={travel.city} />
            </Parchment>
          </Scene>
        )}

        {sections.faq && hasFaq && (
          <Scene shot="faq">
            <Chapter eyebrow={tFaq("eyebrow")} heading={tFaq("heading")} />
            <Parchment>
              <ThingsToKnow
                faq={data.faq ?? []}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                templateId={data.templateId}
              />
            </Parchment>
          </Scene>
        )}

        {sections.rsvp && (
          <Scene shot="rsvp" id="rsvp">
            <div className={`relative ${royal.dark} ${p.rsvp}`}>
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
                header={<Chapter key="rsvp-header" eyebrow={tRsvp("eyebrow")} heading={tRsvp("heading")} sub={tRsvp("sub")} />}
              />
            </div>
          </Scene>
        )}

        {sections.rsvp && mode === "public" && rsvpMessages.length > 0 && (
          <Scene shot="blessings">
            <Chapter eyebrow={tBlessings("eyebrow")} heading={tBlessings("heading")} />
            <Parchment>
              <BlessingsWall
                messages={rsvpMessages}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                templateId={data.templateId}
              />
            </Parchment>
          </Scene>
        )}

        {sections.guestPhotos && (
          <Scene shot="guests">
            <Chapter eyebrow={tGuests("eyebrow")} heading={tGuests("heading")} />
            <Parchment>
              <GuestGallery
                slug={slug}
                photos={guestPhotos}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                templateId={data.templateId}
                mode={mode}
              />
            </Parchment>
          </Scene>
        )}

        <Finale names={`${brideName} & ${groomName}`}>
          <Ambient at="thanks" />
          {mode === "public" && (
            <Parchment>
              <ShareBox
                slug={slug}
                occasionTitle={occasionTitle}
                accentColor={data.accentColor}
                weddingDate={data.weddingDate}
                hosts={coupleLabel}
                events={calendarEvents}
              />
            </Parchment>
          )}
        </Finale>

        <footer className={p.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
      </main>
    </div>
    </WorldContext.Provider>
  );
}
