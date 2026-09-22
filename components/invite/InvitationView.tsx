import type { InvitationData, RsvpEntry } from "@/lib/types";
import { getThemeClasses } from "./theme";
import Hero from "./Hero";
import Story from "./Story";
import Family from "./Family";
import Schedule from "./Schedule";
import Gallery from "./Gallery";
import RsvpForm from "./RsvpForm";
import BlessingsWall from "./BlessingsWall";
import ShareBox from "./ShareBox";
import EnvelopeIntro from "./EnvelopeIntro";
import AudioToggle from "./AudioToggle";
import Reveal from "./Reveal";

/**
 * Composes every section of an invitation. Shared between the editor's live
 * preview (mode="preview") and the public /invite/[slug] page
 * (mode="public"), so the two are guaranteed to stay visually identical.
 */
export default function InvitationView({
  data,
  slug,
  mode,
  rsvpMessages = [],
}: {
  data: InvitationData;
  slug: string;
  mode: "preview" | "public";
  /** Accepted RSVPs with a message, newest first — public mode only. */
  rsvpMessages?: RsvpEntry[];
}) {
  const theme = getThemeClasses(data.templateId);
  const coupleLabel = `${data.brideName || "Bride"} & ${data.groomName || "Groom"}`;

  return (
    <div className={`min-h-full w-full ${theme.page}`} style={{ ["--accent" as string]: data.accentColor }}>
      {mode === "public" && (
        <EnvelopeIntro
          slug={slug}
          brideName={data.brideName}
          groomName={data.groomName}
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
      <Reveal>
        <Story
          story={data.story}
          accentColor={data.accentColor}
          fontPairing={data.fontPairing}
          templateId={data.templateId}
        />
      </Reveal>
      <Reveal>
        <Family
          groomName={data.groomName}
          brideName={data.brideName}
          groomParents={data.groomParents}
          brideParents={data.brideParents}
          accentColor={data.accentColor}
          fontPairing={data.fontPairing}
          templateId={data.templateId}
        />
      </Reveal>
      <Reveal>
        <Schedule
          ceremonyTime={data.ceremonyTime}
          ceremonyVenue={data.ceremonyVenue}
          receptionTime={data.receptionTime}
          receptionVenue={data.receptionVenue}
          accentColor={data.accentColor}
          fontPairing={data.fontPairing}
          templateId={data.templateId}
        />
      </Reveal>
      <Reveal>
        <Gallery
          photos={data.photos}
          accentColor={data.accentColor}
          templateId={data.templateId}
          coupleLabel={coupleLabel}
        />
      </Reveal>
      <Reveal>
        <RsvpForm
          slug={slug}
          accentColor={data.accentColor}
          templateId={data.templateId}
          mode={mode}
        />
      </Reveal>
      {mode === "public" && rsvpMessages.length > 0 && (
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
          <ShareBox slug={slug} coupleLabel={coupleLabel} accentColor={data.accentColor} />
        </Reveal>
      )}

      <footer className="px-6 pb-10 text-center text-xs text-neutral-400">
        Made with love for {coupleLabel} &middot; via Namma Vivaham
      </footer>
    </div>
  );
}
