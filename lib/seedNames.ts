import type { InvitationData } from "./types";

/**
 * The sample content a design starts with names its sample couple ("Priya
 * and Arjun met…"). Until the couple rewrites a sample text, it should
 * follow the names they type — the story, FAQ answers, anything that
 * mentions them. Text they have edited is left alone.
 */

type Names = { a: string; b: string };

/** Every string inside `value` with the seed names swapped for `to`. */
function swapNames<T>(value: T, from: Names, to: Names): T {
  if (typeof value === "string") {
    // Through placeholders, so a new name equal to the other seed name
    // isn't swapped twice.
    let s: string = value;
    if (from.a) s = s.split(from.a).join("\u0000A\u0000");
    if (from.b) s = s.split(from.b).join("\u0000B\u0000");
    return s.split("\u0000A\u0000").join(to.a).split("\u0000B\u0000").join(to.b) as T;
  }
  if (Array.isArray(value)) return value.map((v) => swapNames(v, from, to)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, swapNames(v, from, to)])) as T;
  }
  return value;
}

const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y);

/**
 * `next` with every still-untouched sample field rewritten for its names.
 * A field counts as untouched when it equals the seed as written, or the
 * seed with `prev`'s names in it (what this function produced last time).
 */
export function followNames(seed: InvitationData, prev: InvitationData, next: InvitationData): InvitationData {
  const from = { a: seed.brideName.trim(), b: seed.groomName.trim() };
  if (!from.a && !from.b) return next;
  // An emptied name shows the sample name again rather than a gap.
  const namesOf = (d: InvitationData) => ({ a: d.brideName.trim() || from.a, b: d.groomName.trim() || from.b });
  const before = namesOf(prev);
  const after = namesOf(next);
  const out = { ...next } as Record<string, unknown>;
  for (const key of Object.keys(seed) as (keyof InvitationData)[]) {
    if (key === "brideName" || key === "groomName") continue;
    const sample = seed[key];
    if (!JSON.stringify(sample ?? "").match(new RegExp([from.a, from.b].filter(Boolean).map(escape).join("|")))) continue;
    const current = prev[key];
    if (same(current, sample) || same(current, swapNames(sample, from, before))) {
      out[key] = swapNames(sample, from, after);
    }
  }
  return out as unknown as InvitationData;
}

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
