import { withDefaultSections, type InvitationData, type RsvpEntry, type GuestPhoto } from "@/lib/types";
import { getThemeClasses } from "./theme";
import { getTemplate } from "@/lib/templates";
import { getCategory, formatOccasionTitle } from "@/lib/categories";
import Hero from "./Hero";
import Story from "./Story";
import Family from "./Family";
import Schedule from "./Schedule";
import Gallery from "./Gallery";
import GuestGallery from "./GuestGallery";
import RsvpForm from "./RsvpForm";
import BlessingsWall from "./BlessingsWall";
import ShareBox from "./ShareBox";
import EnvelopeIntro from "./EnvelopeIntro";
import AudioToggle from "./AudioToggle";
import ThingsToKnow from "./ThingsToKnow";
import Reveal from "./Reveal";

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
  const theme = getThemeClasses(data.templateId);
  const category = getCategory(getTemplate(data.templateId).category);
  // Safe even for docs published before section toggles existed — missing
  // keys default to shown, matching their original always-on behavior.
  const sections = withDefaultSections(data.sections);
  const coupleLabel = category.singlePerson
    ? data.brideName || "Friend"
    : `${data.brideName || "Bride"} & ${data.groomName || "Groom"}`;
  const occasionTitle = formatOccasionTitle(category, data.brideName, data.groomName);

  return (
    <div className={`min-h-full w-full ${theme.page}`} style={{ ["--accent" as string]: data.accentColor }}>
      {mode === "public" && (
        <EnvelopeIntro
          slug={slug}
          brideName={data.brideName}
          groomName={category.singlePerson ? "" : data.groomName}
          weddingDate={data.weddingDate}
          accentColor={data.accentColor}
          fontPairing={data.fontPairing}
          templateId={data.templateId}
        />
      )}
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
        <Reveal>
          <Story
            story={data.story}
            accentColor={data.accentColor}
            fontPairing={data.fontPairing}
            templateId={data.templateId}
            title={category.storyTitle}
          />
        </Reveal>
      )}
      {category.familyTitle && sections.family && (
        <Reveal>
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
        </Reveal>
      )}
      {sections.schedule && (
        <Reveal>
          <Schedule
            ceremonyTime={data.ceremonyTime}
            ceremonyVenue={data.ceremonyVenue}
            receptionTime={data.receptionTime}
            receptionVenue={data.receptionVenue}
            accentColor={data.accentColor}
            fontPairing={data.fontPairing}
            templateId={data.templateId}
            eventALabel={category.eventALabel}
            eventBLabel={category.eventBLabel || "Reception"}
          />
        </Reveal>
      )}
      {sections.gallery && (
        <Reveal>
          <Gallery
            photos={data.photos}
            accentColor={data.accentColor}
            templateId={data.templateId}
            coupleLabel={coupleLabel}
          />
        </Reveal>
      )}
      {sections.guestPhotos && (
        <Reveal>
          <GuestGallery
            slug={slug}
            photos={guestPhotos}
            accentColor={data.accentColor}
            fontPairing={data.fontPairing}
            templateId={data.templateId}
            mode={mode}
          />
        </Reveal>
      )}
      {sections.faq && (
        <Reveal>
          <ThingsToKnow
            faq={data.faq ?? []}
            accentColor={data.accentColor}
            fontPairing={data.fontPairing}
            templateId={data.templateId}
          />
        </Reveal>
      )}
      {sections.rsvp && (
        <Reveal>
          <RsvpForm
            slug={slug}
            accentColor={data.accentColor}
            templateId={data.templateId}
            brideName={data.brideName}
            groomName={data.groomName}
            mode={mode}
          />
        </Reveal>
      )}
      {sections.rsvp && mode === "public" && rsvpMessages.length > 0 && (
        <Reveal>
          <BlessingsWall
            messages={rsvpMessages}
            accentColor={data.accentColor}
            fontPairing={data.fontPairing}
            templateId={data.templateId}
          />
        </Reveal>
      )}
      {mode === "public" && (
        <Reveal>
          <ShareBox slug={slug} occasionTitle={occasionTitle} accentColor={data.accentColor} />
        </Reveal>
      )}

      <footer className="px-6 pb-10 text-center text-xs text-neutral-400">
        Made with love for {coupleLabel} &middot; via Namma Vivaham
      </footer>
    </div>
  );
}
