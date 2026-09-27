import type { MonogramInitials } from "./types";

const TAMIL = /[஀-௿]/;

/** "ta" when the text contains Tamil script, else "en" — for tagging
 * user-typed text so `:lang(ta)` typography applies to Tamil names/stories
 * even inside the English UI (and doesn't to Latin names in the Tamil UI). */
export function scriptLang(text: string): "ta" | "en" {
  return TAMIL.test(text) ? "ta" : "en";
}

/**
 * The first user-perceived character of a name. `charAt(0)` is wrong for
 * Tamil: "பிரியா" starts with ப + the vowel sign ி, and charAt(0) returns a
 * bare "ப" — a different letter. A grapheme segmenter keeps the pair.
 */
export function firstGrapheme(name: string): string {
  const text = name.trim();
  if (!text) return "";
  let first: string;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segments = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text);
    first = segments[Symbol.iterator]().next().value?.segment ?? "";
  } else {
    first = Array.from(text)[0] ?? "";
  }
  return first.toLocaleUpperCase();
}

/** The couple's initials: the user's own override where set, otherwise the
 * first letter of each name. `b` is undefined for single-person occasions. */
export function resolveMonogram(
  brideName: string,
  groomName: string,
  override: MonogramInitials | undefined,
  singlePerson: boolean
): { a: string; b?: string } {
  const a = override?.a?.trim() || firstGrapheme(brideName);
  if (singlePerson) return { a };
  return { a, b: override?.b?.trim() || firstGrapheme(groomName) };
}

function graphemeCount(text: string): number {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)).length;
  }
  return Array.from(text).length;
}

/**
 * A font-size multiplier for display names: 1 for typical names, shrinking
 * smoothly for long ones (full names like "Venkatalakshmi Subramaniam
 * Ramakrishnan") so they stay inside frames and don't run to five lines.
 * Exposed to CSS as --name-fit and multiplied into name font sizes.
 */
export function nameFitScale(...names: (string | undefined)[]): number {
  const longest = Math.max(0, ...names.map((n) => graphemeCount((n ?? "").trim())));
  if (longest <= 12) return 1;
  return Math.max(0.55, Math.round((1 - (longest - 12) * 0.016) * 100) / 100);
}
