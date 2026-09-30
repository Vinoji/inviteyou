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
import ChapelBooklet, { type BookPage } from "./ChapelBooklet";
import {
  AlbumPage,
  BackCoverPage,
  ChapelBackdrop,
  ChapelRsvpHeader,
  CountdownPage,
  CoverPage,
  FamiliesPage,
  ServicePage,
  StoryPage,
} from "./ChapelSections";
import c from "./chapel.module.css";

/**
 * The chapel layout. Unlike every other template it isn't a long scroll:
 * after the chapel-door intro the guest stays inside the candlelit chapel,
 * and the invitation is an order-of-service booklet resting there, read one
 * page at a time with a 3D page turn (ChapelBooklet). Pages: cover, our
 * story, families, order of service, hymn-board countdown, photos, then
 * travel, places, guest photos, FAQ, RSVP, blessings, share, and a back
 * cover. A page only exists when it has something to show.
 *
 * Travel Guide and Places to Explore reuse the royal components, styled by
 * this template's royal palette (palettes.ts). Used for both the editor
 * preview and the public page.
 */
export default function ChapelInvitation({
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
  const t = useTranslations("invite.chapel");
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
  const hasTravel =
    Boolean(travel.city) ||
    travel.airports.length > 0 ||
    (travel.stations ?? []).length > 0 ||
    travel.routes.some((r) => r.trains.length > 0);
  const hasFaq = (data.faq ?? []).some((f) => f.question.trim() && f.answer.trim());

  const pages: BookPage[] = [
    {
      key: "cover",
      title: coupleLabel,
      fill: true,
      node: <CoverPage brideName={data.brideName} groomName={data.groomName} weddingDate={data.weddingDate} />,
    },
  ];
  const add = (page: BookPage) => pages.push(page);

  if (sections.story && (data.story || data.photos[0])) {
    add({
      key: "story",
      title: t("story.heading"),
      node: (
        <StoryPage
          story={data.story}
          coverPhoto={data.photos[0]}
          brideName={data.brideName}
          groomName={data.groomName}
          monogram={data.monogram}
        />
      ),
    });
  }
  if (sections.family && brideFamily.length + groomFamily.length > 0) {
    add({
      key: "family",
      title: t("family.heading"),
      node: (
        <FamiliesPage
          brideName={data.brideName}
          groomName={data.groomName}
          brideFamily={brideFamily}
          groomFamily={groomFamily}
        />
      ),
    });
  }
  if (sections.schedule && events.some((e) => e.time || e.venue?.name)) {
    add({
      key: "service",
      title: t("day.heading"),
      node: (
        <ServicePage events={events}>
          <AddToCalendar
            slug={slug}
            title={occasionTitle}
            date={data.weddingDate}
            events={events.map(({ label, time, venue }) => ({ label, time, venue }))}
          />
        </ServicePage>
      ),
    });
  }
  if (category.showCountdown && /^\d{4}-\d{2}-\d{2}$/.test(data.weddingDate)) {
    add({ key: "countdown", title: t("countdown.heading"), node: <CountdownPage weddingDate={data.weddingDate} /> });
  }
  // The first photo is the portrait on the story page.
  if (sections.gallery && data.photos.length > 1) {
    add({ key: "album", title: t("album.heading"), node: <AlbumPage photos={data.photos.slice(1)} /> });
  }
  if (sections.travel && hasTravel) {
    add({ key: "travel", title: t("pages.travel"), node: <TravelGuide travel={travel} /> });
  }
  if (sections.places && places.length > 0) {
    add({ key: "places", title: t("pages.places"), node: <PlacesToExplore places={places} city={travel.city} /> });
  }
  if (sections.guestPhotos) {
    add({
      key: "guestPhotos",
      title: t("pages.guestPhotos"),
      node: (
        <GuestGallery
          slug={slug}
          photos={guestPhotos}
          accentColor={data.accentColor}
          fontPairing={data.fontPairing}
          templateId={data.templateId}
          mode={mode}
        />
      ),
    });
  }
  if (sections.faq && hasFaq) {
    add({
      key: "faq",
      title: t("pages.faq"),
      node: (
        <ThingsToKnow
          faq={data.faq ?? []}
          accentColor={data.accentColor}
          fontPairing={data.fontPairing}
          templateId={data.templateId}
        />
      ),
    });
  }
  if (sections.rsvp) {
    add({
      key: "rsvp",
      title: t("rsvp.heading"),
      tone: "navy",
      node: (
        <div className={`relative ${royal.dark}`}>
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
            header={<ChapelRsvpHeader key="rsvp-header" />}
          />
        </div>
      ),
    });
  }
  if (sections.rsvp && mode === "public" && rsvpMessages.length > 0) {
    add({
      key: "blessings",
      title: t("pages.blessings"),
      node: (
        <BlessingsWall
          messages={rsvpMessages}
          accentColor={data.accentColor}
          fontPairing={data.fontPairing}
          templateId={data.templateId}
        />
      ),
    });
  }
  if (mode === "public") {
    add({
      key: "share",
      title: t("pages.share"),
      node: (
        <ShareBox
          slug={slug}
          occasionTitle={occasionTitle}
          accentColor={data.accentColor}
          weddingDate={data.weddingDate}
          hosts={coupleLabel}
          events={events.map(({ label, time, venue }) => ({ label, time, venue }))}
        />
      ),
    });
  }
  add({ key: "back", title: t("thanks.heading"), tone: "navy", fill: true, node: <BackCoverPage names={names} /> });

  const style = {
    ...royalCssVars(palette, data.accentColor),
    "--rp-body": font.bodyVar,
    "--rp-heading": font.headingVar,
    "--inv-heading": font.headingVar,
  } as CSSProperties;

  return (
    <div data-invite-root className={`min-h-full w-full ${royal.root} ${c.root}`} style={style}>
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

      <div className={c.stage}>
        <ChapelBackdrop />
        <Ambient at="hero" />
        <ChapelBooklet pages={pages} />
      </div>

      <footer className={c.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}
