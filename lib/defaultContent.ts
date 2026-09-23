import { getTemplate } from "./templates";
import { DEFAULT_SECTIONS, type InvitationData, type VenueInfo } from "./types";

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
  Omit<
    InvitationData,
    "templateId" | "accentColor" | "fontPairing" | "photos" | "backgroundMusic" | "sections"
  >
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
    faq: [
      {
        question: "What's the dress code?",
        answer:
          "Traditional Indian attire is encouraged — silk sarees, lehengas, and kurtas in festive colors.",
      },
      {
        question: "Is parking available?",
        answer: "Yes, valet parking is available at the venue entrance.",
      },
    ],
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
    faq: [
      {
        question: "What should I wear?",
        answer: "Smart casual to semi-formal — no strict dress code, just come comfortable.",
      },
      {
        question: "Are kids welcome?",
        answer: "Absolutely — this is a family-friendly celebration.",
      },
    ],
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
    faq: [
      {
        question: "What's the dress code?",
        answer: "Garden party attire — pastels and florals are very welcome.",
      },
      {
        question: "Will the ceremony be outdoors?",
        answer: "Yes, weather permitting — we'll have a backup indoor space just in case.",
      },
    ],
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
    faq: [
      {
        question: "What's the dress code?",
        answer: "Black tie optional — think classic evening wear.",
      },
      {
        question: "Is there a gift registry?",
        answer: "Your presence is the only present we need.",
      },
    ],
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
    faq: [
      {
        question: "What should I wear?",
        answer: "Light, breezy fabrics — it's a beach, so skip the heels.",
      },
      {
        question: "Is there parking nearby?",
        answer: "Limited parking at the venue — we recommend carpooling or a cab.",
      },
    ],
  },
  "anniversary-emerald": {
    brideName: "Meena",
    groomName: "Suresh",
    weddingDate: "2026-12-05",
    ceremonyTime: "7:00 PM",
    ceremonyVenue: venue("The Fern Residency", "Banjara Hills, Hyderabad"),
    receptionTime: "",
    receptionVenue: { name: "", address: "", mapsLink: "" },
    groomParents: "",
    brideParents: "",
    story:
      "Twenty-five years ago, Meena and Suresh promised each other a lifetime — and somehow, between raising a family, moving three cities, and never quite agreeing on the thermostat, they've kept it. This December, they'd love for the people who've been part of that story to raise a glass with them and celebrate a quarter-century of choosing each other, again and again.",
    faq: [
      {
        question: "Should I bring a gift?",
        answer: "Just your company — but if you insist, a bottle of wine never hurts.",
      },
      {
        question: "What's the dress code?",
        answer: "Smart casual — come as you are.",
      },
    ],
  },
  "valentine-blush": {
    brideName: "Ria",
    groomName: "Dev",
    weddingDate: "2027-02-14",
    ceremonyTime: "8:00 PM",
    ceremonyVenue: venue("Ivy & Rose Rooftop", "Bandra West, Mumbai"),
    receptionTime: "",
    receptionVenue: { name: "", address: "", mapsLink: "" },
    groomParents: "",
    brideParents: "",
    story:
      "No grand speeches, no big reveal — just the two of us, a table for two, and every reason to celebrate another year of picking each other. Happy Valentine's Day. Here's to us.",
    faq: [
      {
        question: "Do I need to RSVP?",
        answer: "Just show up looking cute — that's the only RSVP I need.",
      },
      {
        question: "What should I wear?",
        answer: "Whatever makes you feel good. I'm not picky.",
      },
    ],
  },
  "proposal-starlit": {
    // brideName is "Your name" (the proposer), groomName is "Their name"
    // (who's being asked) — this template is for planning/staging a
    // proposal, not recapping one that already happened.
    brideName: "Karan",
    groomName: "Meher",
    weddingDate: "2026-12-20",
    ceremonyTime: "6:30 PM",
    ceremonyVenue: venue("Nandi Hills Viewpoint", "Nandi Hills, Bengaluru"),
    receptionTime: "",
    receptionVenue: { name: "", address: "", mapsLink: "" },
    groomParents: "",
    brideParents: "",
    story:
      "Meher, from that first terrible cup of coffee we both pretended to like, I knew I wanted a lifetime of terrible coffee with you. Every plan I make these days has your name written into it, whether you know it or not. So here's one more: meet me at Nandi Hills at sunset. I have a question for you.",
    faq: [
      {
        question: "What should I wear?",
        answer: "Something you love — comfortable shoes recommended for the walk up.",
      },
      {
        question: "Anything I should know?",
        answer: "Just trust me and show up. That's all I ask.",
      },
    ],
  },
  "birthday-confetti": {
    // brideName answers "Whose birthday is it?" — written by whoever's
    // sending the wish, not necessarily the birthday person themselves.
    brideName: "Zara",
    groomName: "",
    weddingDate: "2026-10-18",
    ceremonyTime: "6:00 PM",
    ceremonyVenue: venue("The Backyard Bistro", "Koramangala, Bengaluru"),
    receptionTime: "",
    receptionVenue: { name: "", address: "", mapsLink: "" },
    groomParents: "",
    brideParents: "",
    story:
      "Happy birthday, Zara! Another trip around the sun and you're still the most fun person we know — the one who somehow makes every plan better just by showing up. Hope your day is full of cake, terrible karaoke, and everyone who loves you. Can't wait to celebrate with you.",
    faq: [
      {
        question: "What should I bring?",
        answer: "Just yourself — and maybe your best dance moves.",
      },
      {
        question: "Is there a dress code?",
        answer: "Come as you are — casual and fun.",
      },
    ],
  },
  "housewarming-terracotta": {
    brideName: "Rahul & Simran Desai",
    groomName: "",
    weddingDate: "2026-11-08",
    ceremonyTime: "4:00 PM",
    ceremonyVenue: venue("14 Palm Grove Lane", "Whitefield, Bengaluru"),
    receptionTime: "",
    receptionVenue: { name: "", address: "", mapsLink: "" },
    groomParents: "",
    brideParents: "",
    story:
      "After a year of boxes, paint swatches, and way too many trips to the hardware store, our new home is finally starting to feel like one. We'd love for you to be the first to see it — come by for snacks, a house tour, and (hopefully) working Wi-Fi.",
    faq: [
      {
        question: "Should I bring anything?",
        answer:
          "Just yourself! If you want to bring something, a plant for the new place would be lovely.",
      },
      {
        question: "Is there parking?",
        answer: "Street parking is available — please be mindful of our neighbors.",
      },
    ],
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
    sections: { ...DEFAULT_SECTIONS },
    ...content,
    // Deep-copy the venue objects so editing one template's draft can never
    // mutate the shared default (they're plain objects, not primitives).
    ceremonyVenue: { ...content.ceremonyVenue },
    receptionVenue: { ...content.receptionVenue },
  };
}
