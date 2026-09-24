import { getTemplateConfig } from "@/lib/templates";
import { DEFAULT_CONTENT_DATES } from "@/lib/defaultContent";
import { DEFAULT_SECTIONS, type InvitationData, type FaqItem, type VenueInfo } from "@/lib/types";

/** A translation function scoped to the `defaultContent` namespace, with
 * `.raw()` for the non-interpolated `faq` array (as next-intl provides). */
type TFunc = {
  (key: string, values?: Record<string, string | number>): string;
  raw: (key: string) => unknown;
};

/**
 * A Google Maps "search" deep link (the documented query-only form of the
 * Maps URL API — https://developers.google.com/maps/documentation/urls) for
 * a venue name + address. Works for any text without needing a real place
 * ID, so the "Get Directions" link is functional out of the box even for
 * these example venues, rather than shipping an empty mapsLink.
 */
function mapsSearchUrl(name: string, address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`;
}

function venue(name: string, address: string): VenueInfo {
  if (!name && !address) return { name: "", address: "", mapsLink: "" };
  return { name, address, mapsLink: mapsSearchUrl(name, address) };
}

/** `t` must be scoped to the `defaultContent` namespace, e.g.
 * `useTranslations("defaultContent")` / `getTranslations("defaultContent")`.
 * Real, tasteful starter copy per template, translated in full — not lorem
 * ipsum, not empty fields with a placeholder hint. */
export function getDefaultInvitationData(templateId: string, t: TFunc): InvitationData {
  const template = getTemplateConfig(templateId);
  const id = template.id;
  const dates = DEFAULT_CONTENT_DATES[id] ?? DEFAULT_CONTENT_DATES["traditional-gold"];
  const faq = t.raw(`${id}.faq`) as FaqItem[];

  return {
    templateId: id,
    accentColor: template.defaultAccent,
    fontPairing: template.defaultFont,
    photos: [],
    backgroundMusic: "",
    sections: { ...DEFAULT_SECTIONS },
    brideName: t(`${id}.brideName`),
    groomName: t(`${id}.groomName`),
    weddingDate: dates.weddingDate,
    ceremonyTime: dates.ceremonyTime,
    ceremonyVenue: venue(t(`${id}.ceremonyVenueName`), t(`${id}.ceremonyVenueAddress`)),
    receptionTime: dates.receptionTime,
    receptionVenue: venue(t(`${id}.receptionVenueName`), t(`${id}.receptionVenueAddress`)),
    groomParents: t(`${id}.groomParents`),
    brideParents: t(`${id}.brideParents`),
    story: t(`${id}.story`),
    faq,
  };
}
