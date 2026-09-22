import { getTemplate } from "./templates";
import type { InvitationData, VenueInfo } from "./types";

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

/** Builds a venue whose mapsLink is always derived from its own name/address. */
function venue(name: string, address: string): VenueInfo {
  return { name, address, mapsLink: mapsSearchUrl(name, address) };
}

/**
 * Real, tasteful starter copy per template — not lorem ipsum, not empty
 * fields with a placeholder hint. A fresh editor session starts fully
 * filled in and looking like a finished invitation; the user overwrites it
 * with their own details rather than typing into a blank form.
 */
const DEFAULT_CONTENT: Record<
  string,
  Omit<InvitationData, "templateId" | "accentColor" | "fontPairing" | "photos" | "backgroundMusic">
> = {
  "traditional-gold": {
    brideName: "Priya",
    groomName: "Arjun",
    weddingDate: "2027-01-24",
    ceremonyTime: "10:00 AM",
    ceremonyVenue: venue("Sri Kalyana Mandapam", "12 Temple Tank Road, Mylapore, Chennai"),
    receptionTime: "7:00 PM",
    receptionVenue: venue("Grand Ballroom, The Leela Palace", "MRC Nagar, Chennai"),
    groomParents: "Mr. & Mrs. Rajendran Kumar",
    brideParents: "Mr. & Mrs. Suresh Rao",
    story:
      "Priya and Arjun met at a college reunion in Chennai and knew almost instantly that they'd found their person. Six years, countless train journeys between cities, and one very persistent proposal later, they're ready to begin the next chapter — surrounded by the families who raised them and the friends who never doubted it. We'd be honored to have you there as we tie the knot the traditional way, with all the rituals, music, and mounds of food that make a South Indian wedding what it is.",
  },
  "minimal-modern": {
    brideName: "Meera",
    groomName: "Rohan",
    weddingDate: "2026-12-12",
    ceremonyTime: "4:00 PM",
    ceremonyVenue: venue("The Glasshouse", "Cunningham Road, Bengaluru"),
    receptionTime: "8:00 PM",
    receptionVenue: venue("Rooftop at The Oberoi", "MG Road, Bengaluru"),
    groomParents: "Anil & Kavitha Mehta",
    brideParents: "Suresh & Lata Iyer",
    story:
      "Meera and Rohan met on a rainy Tuesday, arguing over the last seat at a coffee shop. Neither of them remembers who won. What started as an accidental conversation turned into five years of building a life together — through new cities, new jobs, and a shared love of terrible puns. Now they're making it official, and they'd love for you to be part of the day.",
  },
  "floral-pastel": {
    brideName: "Ananya",
    groomName: "Kabir",
    weddingDate: "2027-02-14",
    ceremonyTime: "5:30 PM",
    ceremonyVenue: venue("Bloom Garden Estate", "Whitefield, Bengaluru"),
    receptionTime: "8:30 PM",
    receptionVenue: venue("The Orchid Lawns", "Whitefield, Bengaluru"),
    groomParents: "Mr. & Mrs. Farhan Khan",
    brideParents: "Mr. & Mrs. Ravi Nair",
    story:
      "Ananya and Kabir's story began with a shared plant obsession and a balcony full of dying succulents. Somewhere between learning how to keep a fern alive and planning weekend hikes, they fell in love. This February, under strings of fairy lights and more flowers than either of them can name, they're saying 'I do' — and they can't imagine the day without you in it.",
  },
  "elegant-bw": {
    brideName: "Naina",
    groomName: "Vikram",
    weddingDate: "2026-11-21",
    ceremonyTime: "6:00 PM",
    ceremonyVenue: venue("The Imperial Ballroom", "Janpath, New Delhi"),
    receptionTime: "9:00 PM",
    receptionVenue: venue("The Imperial Ballroom", "Janpath, New Delhi"),
    groomParents: "Mr. & Mrs. Arvind Malhotra",
    brideParents: "Mr. & Mrs. Deepak Singh",
    story:
      "Naina and Vikram met at a mutual friend's wedding and spent the entire reception talking instead of dancing — which, in hindsight, said everything. Three years on, they're ready for a wedding of their own. Join us for an evening of quiet elegance, old favorites, and the beginning of forever.",
  },
  "beach-boho": {
    brideName: "Diya",
    groomName: "Aryan",
    weddingDate: "2027-03-06",
    ceremonyTime: "5:00 PM",
    ceremonyVenue: venue("Ashwem Beach Shack", "Ashwem, North Goa"),
    receptionTime: "8:00 PM",
    receptionVenue: venue("Sunset Deck, Ashwem", "Ashwem, North Goa"),
    groomParents: "Rajiv & Meena Kapoor",
    brideParents: "Sanjay & Neha D'Souza",
    story:
      "Diya and Aryan fell in love on a backpacking trip through Goa, somewhere between a sunset and a plate of prawn curry. Barefoot on the sand felt like the only honest place to start forever, so that's exactly where they're getting married. Pack light, bring your dancing shoes, and come celebrate with us by the sea.",
  },
};

export function getDefaultInvitationData(templateId: string): InvitationData {
  const template = getTemplate(templateId);
  const content = DEFAULT_CONTENT[template.id] ?? DEFAULT_CONTENT["traditional-gold"];
  return {
    templateId: template.id,
    accentColor: template.defaultAccent,
    fontPairing: template.defaultFont,
    photos: [],
    backgroundMusic: "",
    ...content,
    // Deep-copy the venue objects so editing one template's draft can never
    // mutate the shared default (they're plain objects, not primitives).
    ceremonyVenue: { ...content.ceremonyVenue },
    receptionVenue: { ...content.receptionVenue },
  };
}
