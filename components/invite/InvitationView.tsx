import { useTranslations } from "next-intl";
import {
  withDefaultSections,
  type InvitationData,
  type RsvpEntry,
  type GuestPhoto,
} from "@/lib/types";
import { getThemeClasses } from "./theme";
import { getFontPairing } from "@/lib/fontPairings";
import { getTemplateConfig } from "@/lib/templates";
import { getCategoryMeta, formatOccasionTitle } from "@/lib/i18n/categories";
import Hero from "./Hero";
import Story from "./Story";
import Family from "./Family";
import Schedule from "./Schedule";
import Gallery from "./Gallery";
import GuestGallery from "./GuestGallery";
import RsvpForm from "./RsvpForm";
import BlessingsWall from "./BlessingsWall";
import ShareBox from "./ShareBox";
import IntroHost from "./intros/IntroHost";
import AudioToggle from "./AudioToggle";
import ThingsToKnow from "./ThingsToKnow";
import Section from "./motion/Section";
import MotionThemeProvider from "./motion/MotionThemeProvider";
import ScrollScene from "./ScrollScene";
import RoyalInvitation from "./royal/RoyalInvitation";

/**
 * Composes every section of an invitation. Shared between the editor's live
 * preview (mode="preview") and the public /invite/[slug] page
 * (mode="public"), so the two are guaranteed to stay visually identical.
 *
 * Section *structure* is the same for every occasion category (wedding,
 * anniversary, valentine, proposal, birthday, house warming) — only the
 * labels change, driven by lib/categories.ts. A category with no second
 * event or no family section just leaves those fields blank in the editor,
 * and Schedule/Family already hide themselves when empty.
 */
export default function InvitationView({
  data,
  slug,
  mode,
  rsvpMessages = [],
  guestPhotos = [],
}: {
  data: InvitationData;
  slug: string;
  mode: "preview" | "public";
  /** Accepted RSVPs with a message, newest first — public mode only. */
  rsvpMessages?: RsvpEntry[];
  /** Guest-uploaded photos, newest first — public mode only. */
  guestPhotos?: GuestPhoto[];
}) {
  const t = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const tCategories = useTranslations("categories");
  const theme = getThemeClasses(data.templateId);
  const font = getFontPairing(data.fontPairing);
  const template = getTemplateConfig(data.templateId);
  const category = getCategoryMeta(template.category, tCategories);
  // Safe even for docs published before section toggles existed — missing
  // keys default to shown, matching their original always-on behavior.
  const sections = withDefaultSections(data.sections);
  const coupleLabel = category.singlePerson
    ? data.brideName || tCommon("friendFallback")
    : `${data.brideName || tCommon("brideFallback")} & ${data.groomName || tCommon("groomFallback")}`;
  const occasionTitle = formatOccasionTitle(category, data.brideName, data.groomName, tCommon);

  // Every wedding template uses the royal-palace layout, differing only in
  // palette; other occasions keep the section layout below.
  if (template.category === "wedding") {
    return (
      <MotionThemeProvider templateId={data.templateId}>
        <RoyalInvitation
          data={data}
          slug={slug}
          mode={mode}
          category={category}
          occasionTitle={occasionTitle}
          coupleLabel={coupleLabel}
          rsvpMessages={rsvpMessages}
          guestPhotos={guestPhotos}
        />
      </MotionThemeProvider>
    );
  }

  return (
    <MotionThemeProvider templateId={data.templateId}>
      <div
        className={`relative min-h-full w-full ${theme.page}`}
        style={{
          ["--accent" as string]: data.accentColor,
          // The chosen font pairing, for everything that doesn't set its own:
          // body text inherits it, and headings opt in via --inv-heading.
          ["--inv-heading" as string]: font.headingVar,
          fontFamily: font.bodyVar,
        }}
      >
        <IntroHost
          introId={template.intro}
          templateId={data.templateId}
          slug={slug}
          preview={mode === "preview"}
          weddingDate={data.weddingDate}
          brideName={data.brideName}
          groomName={data.groomName}
          singlePerson={category.singlePerson}
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
        <Hero
          groomName={data.groomName}
          brideName={data.brideName}
          weddingDate={data.weddingDate}
          accentColor={data.accentColor}
          fontPairing={data.fontPairing}
          templateId={data.templateId}
          coverPhoto={data.photos[0]}
        />
        {sections.story && (
          <ScrollScene templateId={data.templateId} accentColor={data.accentColor} kind="story">
            <Section>
              <Story
                story={data.story}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                templateId={data.templateId}
                title={category.storyTitle}
              />
            </Section>
          </ScrollScene>
        )}
        {category.familyTitle && sections.family && (
          <ScrollScene templateId={data.templateId} accentColor={data.accentColor} kind="family">
            <Section delay={0.03}>
              <Family
                groomName={data.groomName}
                brideName={data.brideName}
                groomParents={data.groomParents}
                brideParents={data.brideParents}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                templateId={data.templateId}
                title={category.familyTitle}
              />
            </Section>
          </ScrollScene>
        )}
        {sections.schedule && (
          <ScrollScene templateId={data.templateId} accentColor={data.accentColor} kind="schedule">
            <Section delay={0.06}>
              <Schedule
                ceremonyTime={data.ceremonyTime}
                ceremonyVenue={data.ceremonyVenue}
                receptionTime={data.receptionTime}
                receptionVenue={data.receptionVenue}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                templateId={data.templateId}
                eventALabel={category.eventALabel}
                eventBLabel={category.eventBLabel || t("defaultReception")}
              />
            </Section>
          </ScrollScene>
        )}
        {sections.gallery && (
          <ScrollScene templateId={data.templateId} accentColor={data.accentColor} kind="gallery">
            <Section delay={0.09}>
              <Gallery
                photos={data.photos}
                accentColor={data.accentColor}
                templateId={data.templateId}
                coupleLabel={coupleLabel}
              />
            </Section>
          </ScrollScene>
        )}
        {sections.guestPhotos && (
          <ScrollScene
            templateId={data.templateId}
            accentColor={data.accentColor}
            kind="guestPhotos"
          >
            <Section delay={0.04}>
              <GuestGallery
                slug={slug}
                photos={guestPhotos}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                templateId={data.templateId}
                mode={mode}
              />
            </Section>
          </ScrollScene>
        )}
        {sections.faq && (
          <ScrollScene templateId={data.templateId} accentColor={data.accentColor} kind="faq">
            <Section delay={0.07}>
              <ThingsToKnow
                faq={data.faq ?? []}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                templateId={data.templateId}
              />
            </Section>
          </ScrollScene>
        )}
        {sections.rsvp && (
          <ScrollScene templateId={data.templateId} accentColor={data.accentColor} kind="rsvp">
            <Section delay={0.08}>
              <RsvpForm
                slug={slug}
                accentColor={data.accentColor}
                templateId={data.templateId}
                brideName={data.brideName}
                groomName={data.groomName}
                mode={mode}
              />
            </Section>
          </ScrollScene>
        )}
        {sections.rsvp && mode === "public" && rsvpMessages.length > 0 && (
          <ScrollScene templateId={data.templateId} accentColor={data.accentColor} kind="blessings">
            <Section delay={0.06}>
              <BlessingsWall
                messages={rsvpMessages}
                accentColor={data.accentColor}
                fontPairing={data.fontPairing}
                templateId={data.templateId}
              />
            </Section>
          </ScrollScene>
        )}
        {mode === "public" && (
          <ScrollScene templateId={data.templateId} accentColor={data.accentColor} kind="share">
            <Section delay={0.04}>
              <ShareBox slug={slug} occasionTitle={occasionTitle} accentColor={data.accentColor} />
            </Section>
          </ScrollScene>
        )}

        <footer className="px-6 pb-10 text-center text-xs text-neutral-400">
          {t("madeWith", { couple: coupleLabel })}
        </footer>
      </div>
    </MotionThemeProvider>
  );
}
