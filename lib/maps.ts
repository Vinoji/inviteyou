import type { VenueInfo } from "./types";

/**
 * Where a guest's "Directions" button goes. With a map pin it's Google
 * Maps' directions form (https://developers.google.com/maps/documentation/urls),
 * which starts from wherever the guest is — Maps itself asks for their
 * location, the invitation never sees it. Without a pin: the couple's own
 * map link if they pasted one, else directions to the venue's name and
 * address. "" when there's nothing to go on.
 */
export function directionsUrl(venue: VenueInfo | undefined): string {
  if (!venue) return "";
  if (typeof venue.lat === "number" && typeof venue.lng === "number") {
    return `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`;
  }
  if (venue.mapsLink) return venue.mapsLink;
  const text = [venue.name, venue.address].filter(Boolean).join(", ");
  return text ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(text)}` : "";
}

/** A link that shows the pin itself (for the editor's "See on map"). */
export function pinUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
