import { CATEGORIES, getCategoryConfig, type CategoryId } from "@/lib/categories";

/** A translation function scoped to a namespace, as returned by next-intl's
 * `useTranslations`/`getTranslations` — accepts an ICU-style key plus
 * optional interpolation values. */
type TFunc = (key: string, values?: Record<string, string | number>) => string;

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  tagline: string;
  singlePerson: boolean;
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

/** `t` must be scoped to the `categories` namespace, e.g.
 * `useTranslations("categories")` / `getTranslations("categories")`. */
export function getCategoryMeta(id: string, t: TFunc): CategoryMeta {
  const config = getCategoryConfig(id);
  return {
    id: config.id,
    singlePerson: config.singlePerson,
    showCountdown: config.showCountdown,
    label: t(`${config.id}.label`),
    tagline: t(`${config.id}.tagline`),
    heroEyebrow: t(`${config.id}.heroEyebrow`),
    dateLabel: t(`${config.id}.dateLabel`),
    eventALabel: t(`${config.id}.eventALabel`),
    eventBLabel: t(`${config.id}.eventBLabel`),
    storyTitle: t(`${config.id}.storyTitle`),
    familyTitle: t(`${config.id}.familyTitle`),
    personALabel: t(`${config.id}.personALabel`),
    personBLabel: t(`${config.id}.personBLabel`),
  };
}

export function getAllCategoryMeta(t: TFunc): CategoryMeta[] {
  return CATEGORIES.map((c) => getCategoryMeta(c.id, t));
}

/** "Priya & Arjun's Wedding" / "Zara's Birthday" / "Rahul & Simran's House
 * Warming" (Tamil: its own grammar, driven entirely by `common.occasionTitle`
 * in messages/ta.json). `tCommon` must be scoped to the `common` namespace. */
export function formatOccasionTitle(
  category: CategoryMeta,
  personA: string,
  personB: string,
  tCommon: TFunc
): string {
  const who = category.singlePerson
    ? personA || tCommon("aFriend")
    : `${personA || tCommon("unknownName")} & ${personB || tCommon("unknownName")}`;
  return tCommon("occasionTitle", { who, category: category.label });
}
