import { getTemplateConfig } from "@/lib/templates";
import { DEFAULT_CONTENT_DATES } from "@/lib/defaultContent";
import { todayIso } from "@/lib/dates";
import {
  DEFAULT_SECTIONS,
  EMPTY_TRAVEL,
  EMPTY_MONOGRAM,
  type FamilyMember,
  type InvitationData,
  type FaqItem,
  type VenueInfo,
  type TravelInfo,
  type Place,
} from "@/lib/types";

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
/** The example date moved forward by whole years until it's today or later,
 * so a fresh editor never opens on a past date (which it wouldn't accept —
 * see lib/dates.ts). 29 February becomes 28 February in common years. */
function rollForward(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const today = todayIso();
  let year = +m[1];
  const md = `${m[2]}-${m[3] === "29" && m[2] === "02" ? "28" : m[3]}`;
  while (`${year}-${md}` < today) year++;
  return `${year}-${md}`;
}

export function getDefaultInvitationData(templateId: string, t: TFunc): InvitationData {
  const template = getTemplateConfig(templateId);
  // Sample content can be shared between templates (TemplateConfig.seed).
  const id = template.seed ?? template.id;
  const dates = DEFAULT_CONTENT_DATES[id] ?? DEFAULT_CONTENT_DATES["traditional-gold"];
  const faq = t.raw(`${id}.faq`) as FaqItem[];
  // Only wedding templates use the palace layout that renders the Travel
  // Guide / Places to Explore sections, so only they ship seed content.
  const isWedding = template.category === "wedding";
  const travel = isWedding ? (t.raw(`${id}.travel`) as TravelInfo) : EMPTY_TRAVEL;
  const places = isWedding ? (t.raw(`${id}.places`) as Place[]) : [];

  const groomParents = t(`${id}.groomParents`);
  const brideParents = t(`${id}.brideParents`);
  const asFamily = (name: string): FamilyMember[] =>
    name ? [{ relation: "parents", name, label: "" }] : [];

  return {
    templateId: template.id,
    accentColor: template.defaultAccent,
    fontPairing: template.defaultFont,
    photos: [],
    backgroundMusic: "",
    sections: { ...DEFAULT_SECTIONS },
    brideName: t(`${id}.brideName`),
    groomName: t(`${id}.groomName`),
    weddingDate: rollForward(dates.weddingDate),
    ceremonyTime: dates.ceremonyTime,
    ceremonyVenue: venue(t(`${id}.ceremonyVenueName`), t(`${id}.ceremonyVenueAddress`)),
    receptionTime: dates.receptionTime,
    receptionVenue: venue(t(`${id}.receptionVenueName`), t(`${id}.receptionVenueAddress`)),
    groomParents,
    brideParents,
    brideFamily: asFamily(brideParents),
    groomFamily: asFamily(groomParents),
    story: t(`${id}.story`),
    faq,
    travel,
    places,
    monogram: { ...EMPTY_MONOGRAM },
  };
}
