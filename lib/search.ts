/**
 * The site search (components/site/GlobalSearch.tsx): one small index per
 * language, built by app/api/search/[locale] and fetched the first time
 * someone opens the search, then matched in the browser.
 */
export type SearchKind = "design" | "occasion" | "guide" | "page" | "help";

export interface SearchItem {
  kind: SearchKind;
  title: string;
  /** One line under the title. */
  sub: string;
  /** A locale-less path for the i18n router, e.g. "/invitations/wedding". */
  href: string;
  /** Extra words people may type (English names on the Tamil index, tiers…). */
  terms: string;
}

/** Lowercase, without accents, so "Kalyanam" finds "kalyānam"; doubled
 * Latin letters count once, so "valaikappu" finds "valaikaappu" and
 * "seemantham" finds "semantham" — Tamil words are spelt many ways. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/([a-z])\1+/g, "$1");
}

const KIND_WEIGHT: Record<SearchKind, number> = { page: 6, occasion: 5, design: 4, help: 3, guide: 2 };

/**
 * Every word must appear somewhere in the item; titles that start with or
 * contain the words rank first.
 */
export function searchItems(items: SearchItem[], query: string, limit = 30): SearchItem[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const title = normalize(item.title);
    const all = `${title} ${normalize(item.sub)} ${normalize(item.terms)}`;
    if (!words.every((w) => all.includes(w))) continue;
    let score = KIND_WEIGHT[item.kind];
    if (title.startsWith(words[0])) score += 40;
    for (const w of words) if (title.includes(w)) score += 15;
    scored.push({ item, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}
