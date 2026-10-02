/**
 * Ready-made photos and music the editor offers alongside uploads, so a
 * couple without their own can still finish quickly. Files live in
 * public/library (photos), public/art (template photos) and public/music;
 * sources and licences are in docs/template-art.md.
 *
 * Saved invitations reference these by site-relative path, and
 * lib/sanitize only accepts paths listed here — never arbitrary URLs.
 */

export type LibraryCategory =
  | "wedding"
  | "engagement"
  | "anniversary"
  | "valentine"
  | "proposal"
  | "birthday"
  | "housewarming"
  | "baby"
  | "corporate";

const LOVE: LibraryCategory[] = ["anniversary", "valentine", "proposal", "engagement", "wedding"];

export interface LibraryPhoto {
  id: string;
  src: string;
  thumb: string;
  categories: LibraryCategory[];
}

function photo(id: string, categories: LibraryCategory[]): LibraryPhoto {
  return { id, src: `/library/photos/${id}.jpg`, thumb: `/library/thumbs/${id}.webp`, categories };
}
function art(template: string, slot: string, categories: LibraryCategory[]): LibraryPhoto {
  return {
    id: `art-${template}-${slot}`,
    src: `/art/${template}/${slot}.webp`,
    thumb: `/library/thumbs/art-${template}-${slot}.webp`,
    categories,
  };
}

export const PHOTO_LIBRARY: LibraryPhoto[] = [
  photo("wedding-henna-ritual", ["wedding", "engagement"]),
  photo("wedding-henna-hands", ["wedding", "engagement"]),
  photo("wedding-jasmine-bride", ["wedding"]),
  photo("wedding-ring-ceremony", ["wedding", "engagement"]),
  art("temple-gopuram", "gopuram", ["wedding", "housewarming"]),
  art("temple-gopuram", "lamp-photo", ["wedding", "housewarming"]),
  art("temple-gopuram", "aarti", ["wedding", "housewarming"]),
  photo("engagement-rings-hands", ["engagement", "wedding"]),
  photo("engagement-holding-hands", ["engagement", ...LOVE]),
  photo("engagement-ring-box", ["engagement", "proposal"]),
  photo("engagement-candlelit", ["engagement", "proposal", "valentine"]),
  photo("love-red-roses", LOVE),
  photo("love-hands", LOVE),
  photo("love-rose-petal-rings", LOVE),
  photo("love-wedding-rings", ["anniversary", "wedding"]),
  photo("love-ring-box", ["proposal", "engagement"]),
  art("anniversary-wine-roses", "table", ["anniversary", "valentine"]),
  art("anniversary-wine-roses", "roses", LOVE),
  art("anniversary-wine-roses", "candles", ["anniversary", "valentine", "proposal"]),
  photo("birthday-balloons", ["birthday"]),
  photo("birthday-letters", ["birthday"]),
  art("birthday-balloon-party", "cake", ["birthday"]),
  art("birthday-balloon-party", "sparkler", ["birthday", "corporate"]),
  art("birthday-balloon-party", "balloons", ["birthday", "baby"]),
  photo("home-diyas", ["housewarming"]),
  photo("home-diya-close", ["housewarming"]),
  photo("home-new-keys", ["housewarming"]),
  photo("home-diya-row", ["housewarming", "wedding"]),
  photo("baby-newborn-foot", ["baby"]),
  photo("baby-yellow-shoes", ["baby"]),
  photo("baby-feet", ["baby"]),
  photo("baby-booties", ["baby"]),
  art("baby-shower-balloons", "shoes-hand", ["baby"]),
  art("baby-shower-balloons", "nursery", ["baby"]),
  art("baby-shower-balloons", "booties", ["baby"]),
  photo("corporate-keynote", ["corporate"]),
  photo("corporate-office-party", ["corporate"]),
  photo("corporate-auditorium", ["corporate"]),
];

export interface LibraryTrack {
  id: string;
  src: string;
  /** Seconds. */
  duration: number;
  categories: LibraryCategory[];
}

function track(id: string, duration: number, categories: LibraryCategory[]): LibraryTrack {
  return { id, src: `/music/${id}.mp3`, duration, categories };
}

export const MUSIC_LIBRARY: LibraryTrack[] = [
  track("nadaswaram", 180, ["wedding", "engagement", "housewarming"]),
  track("shehnai", 94, ["wedding", "engagement"]),
  track("veena", 42, ["wedding", "housewarming", "anniversary"]),
  track("krishna-flute", 180, ["wedding", "housewarming", "baby"]),
  track("indian-wedding", 143, ["wedding", "engagement"]),
  track("bollywood-wedding", 153, ["wedding", "engagement"]),
  track("diwali-festive", 128, ["housewarming", "wedding", "corporate"]),
  track("love-guitar", 179, ["anniversary", "valentine", "proposal", "engagement"]),
  track("romantic-piano", 142, ["anniversary", "valentine", "proposal", "wedding"]),
  track("happy-birthday", 121, ["birthday"]),
  track("celebration", 160, ["birthday", "corporate"]),
  track("lullaby", 111, ["baby"]),
  track("morning-serenity", 123, ["housewarming", "baby"]),
  track("corporate-uplifting", 180, ["corporate"]),
];

const PHOTO_SRCS = new Set(PHOTO_LIBRARY.map((p) => p.src));
const TRACK_SRCS = new Set(MUSIC_LIBRARY.map((t) => t.src));

export const isLibraryPhoto = (src: string) => PHOTO_SRCS.has(src);
export const isLibraryTrack = (src: string) => TRACK_SRCS.has(src);
export const findTrack = (src: string) => MUSIC_LIBRARY.find((t) => t.src === src);

/** Items suggested for this occasion first, then the rest. */
export function forCategory<T extends { categories: LibraryCategory[] }>(items: T[], category: string) {
  const fits = (x: T) => x.categories.includes(category as LibraryCategory);
  return { suggested: items.filter(fits), others: items.filter((x) => !fits(x)) };
}
