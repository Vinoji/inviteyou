import { Clock, MapPin, ExternalLink } from "lucide-react";
import { getFontPairing } from "@/lib/fontPairings";
import { getThemeClasses } from "./theme";
import SectionDivider from "./SectionDivider";
import type { VenueInfo } from "@/lib/types";

function EventCard({
  title,
  time,
  venue,
  accentColor,
  fontPairing,
  templateId,
}: {
  title: string;
  time: string;
  venue: VenueInfo;
  accentColor: string;
  fontPairing: string;
  templateId: string;
}) {
  const font = getFontPairing(fontPairing);
  const theme = getThemeClasses(templateId);
  if (!time && !venue?.name) return null;

  return (
    <div
      className={`flex-1 p-6 sm:p-8 ${theme.card}`}
      style={{ borderColor: `${accentColor}55` }}
    >
      <h3
        className="text-lg font-bold tracking-wide sm:text-xl"
        style={{ fontFamily: font.headingVar, color: accentColor }}
      >
        {title}
      </h3>
      {time && (
        <p
          className="mt-2 flex items-center gap-1.5 text-base font-medium text-neutral-800"
          style={{ fontFamily: font.bodyVar }}
        >
          <Clock size={15} className="shrink-0 opacity-60" aria-hidden />
          {time}
        </p>
      )}
      {venue?.name && (
        <p className="mt-3 flex items-start gap-1.5 text-sm font-semibold text-neutral-900">
          <MapPin size={15} className="mt-0.5 shrink-0 opacity-60" aria-hidden />
          {venue.name}
        </p>
      )}
      {venue?.address && (
        <p className="mt-1 pl-[21px] text-sm text-neutral-600">{venue.address}</p>
      )}
      {venue?.mapsLink && (
        <a
          href={venue.mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 pl-[21px] text-sm font-semibold underline underline-offset-4"
          style={{ color: accentColor }}
        >
          Get Directions <ExternalLink size={13} aria-hidden />
        </a>
      )}
    </div>
  );
}

export default function Schedule({
  ceremonyTime,
  ceremonyVenue,
  receptionTime,
  receptionVenue,
  accentColor,
  fontPairing,
  templateId,
}: {
  ceremonyTime: string;
  ceremonyVenue: VenueInfo;
  receptionTime: string;
  receptionVenue: VenueInfo;
  accentColor: string;
  fontPairing: string;
  templateId: string;
}) {
  const hasAny =
    ceremonyTime || ceremonyVenue?.name || receptionTime || receptionVenue?.name;
  if (!hasAny) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
      <div className="text-center">
        <h2
          className="text-sm font-semibold tracking-[0.3em] uppercase"
          style={{ color: accentColor }}
        >
          Event Schedule
        </h2>
        <div className="mt-3">
          <SectionDivider templateId={templateId} accent={accentColor} />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row">
        <EventCard
          title="Ceremony"
          time={ceremonyTime}
          venue={ceremonyVenue}
          accentColor={accentColor}
          fontPairing={fontPairing}
          templateId={templateId}
        />
        <EventCard
          title="Reception"
          time={receptionTime}
          venue={receptionVenue}
          accentColor={accentColor}
          fontPairing={fontPairing}
          templateId={templateId}
        />
      </div>
    </section>
  );
}
