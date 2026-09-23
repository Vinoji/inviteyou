export type CategoryId =
  | "wedding"
  | "anniversary"
  | "valentine"
  | "proposal"
  | "birthday"
  | "housewarming";

/**
 * Category-driven copy. The underlying Firestore/InvitationData schema
 * stays the wedding-shaped fields it always was (groomName/brideName,
 * ceremonyTime/Venue, receptionTime/Venue, story, groomParents/
 * brideParents) — rewriting the schema per occasion would touch every API
 * route, security rule assumption, and published document shape for
 * marginal benefit. Instead each category relabels those same fields to
 * fit ("Bride's name" becomes "Host name(s)" for a house warming) and
 * hides what doesn't apply (a birthday has no second person, so
 * `singlePerson` drops the "&" pairing and the second name field).
 * Sections that end up empty already hide themselves (Schedule only
 * renders an event card with a time or venue; Family only renders with at
 * least one parent line) — categories just steer what gets filled by
 * default and what the editor prompts for.
 */
export interface CategoryMeta {
  id: CategoryId;
  label: string;
  tagline: string;
  singlePerson: boolean;
  /** False for categories whose date is retrospective (e.g. a proposal
   * already happened) — a countdown to a date in the past reads oddly, even
   * though the "celebration has begun" fallback it resolves to is graceful. */
  showCountdown: boolean;
  heroEyebrow: string;
  dateLabel: string;
  eventALabel: string;
  eventBLabel: string; // "" = this category only ever shows one event card
  storyTitle: string;
  familyTitle: string;
  personALabel: string;
  personBLabel: string; // "" when singlePerson
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "wedding",
    label: "Wedding",
    tagline: "For the big day",
    singlePerson: false,
    showCountdown: true,
    heroEyebrow: "We're getting married",
    dateLabel: "Wedding date",
    eventALabel: "Ceremony",
    eventBLabel: "Reception",
    storyTitle: "Our Story",
    familyTitle: "Family & Blessings",
    personALabel: "Bride's name",
    personBLabel: "Groom's name",
  },
  {
    id: "anniversary",
    label: "Anniversary",
    tagline: "Celebrating years together",
    singlePerson: false,
    showCountdown: true,
    heroEyebrow: "Celebrating our anniversary",
    dateLabel: "Anniversary date",
    eventALabel: "Celebration",
    eventBLabel: "",
    storyTitle: "Our Journey",
    familyTitle: "With Love, Our Family",
    personALabel: "Her name",
    personBLabel: "His name",
  },
  {
    id: "valentine",
    label: "Valentine's Day",
    tagline: "For the one you love",
    singlePerson: false,
    showCountdown: true,
    heroEyebrow: "Happy Valentine's Day",
    dateLabel: "Date",
    eventALabel: "The Plan",
    eventBLabel: "",
    storyTitle: "Our Story",
    familyTitle: "",
    personALabel: "Your name",
    personBLabel: "Their name",
  },
  {
    id: "proposal",
    label: "Proposal",
    tagline: "For the question you're about to ask",
    singlePerson: false,
    showCountdown: false,
    heroEyebrow: "Will you marry me?",
    dateLabel: "The date",
    eventALabel: "The Proposal",
    eventBLabel: "Celebrate With Us",
    storyTitle: "Why You",
    familyTitle: "",
    personALabel: "Your name",
    personBLabel: "Their name",
  },
  {
    id: "birthday",
    label: "Birthday",
    tagline: "A wish for someone's big day",
    singlePerson: true,
    showCountdown: true,
    heroEyebrow: "Happy Birthday!",
    dateLabel: "Party date",
    eventALabel: "The Party",
    eventBLabel: "",
    storyTitle: "A Birthday Wish",
    familyTitle: "",
    personALabel: "Whose birthday is it?",
    personBLabel: "",
  },
  {
    id: "housewarming",
    label: "House Warming",
    tagline: "New home, new memories",
    singlePerson: true,
    showCountdown: true,
    heroEyebrow: "We've moved in!",
    dateLabel: "Open house date",
    eventALabel: "Open House",
    eventBLabel: "",
    storyTitle: "About Our New Home",
    familyTitle: "",
    personALabel: "Host name(s)",
    personBLabel: "",
  },
];

export function getCategory(id: string): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

/** "Priya & Arjun's Wedding" / "Zara's Birthday" / "Rahul & Simran's House Warming" */
export function formatOccasionTitle(
  category: CategoryMeta,
  personA: string,
  personB: string
): string {
  const who = category.singlePerson
    ? personA || "A friend"
    : `${personA || "?"} & ${personB || "?"}`;
  return `${who}'s ${category.label}`;
}
