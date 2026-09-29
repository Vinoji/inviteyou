import "server-only";
import type { PlaceScene } from "./types";
import { SITE } from "./site";
import AIRPORTS from "./data/airports.json";

/**
 * Venue lookup and "what's nearby" from free, open sources only:
 *
 * - OpenStreetMap Nominatim — venue search and the venue's city.
 *   Usage policy: an identifying User-Agent, at most one request a second,
 *   no search-as-you-type. Calls here are queued a second apart and cached.
 * - lib/data/airports.json — from OurAirports' airports.csv (public
 *   domain): the large and medium airports with scheduled service and an
 *   IATA code, as [IATA, name, lat, lng, city, country].
 * - Wikipedia's nearby-article search, ranked by article length (a good
 *   stand-in for "famous"), + Wikidata (CC0) for names and one-line
 *   descriptions in the invitation's language and Indian Railways station
 *   codes — sights near the venue. Article text is never copied.
 * - Wikidata's query service — railway stations with an Indian Railways
 *   station code (P5696) near the venue.
 *
 * Every lookup is best-effort: a slow or failing source just leaves its
 * part empty.
 */

// Nominatim asks for a way to reach the app's owner (lib/site.ts). Only
// sent as text, never mailed — the site's address stands in if it's blank.
const UA = `${SITE.name}/1.0 (invitation venue lookup; ${SITE.contact.email || SITE.url})`;
const TIMEOUT_MS = 12_000;

type Airport = [code: string, name: string, lat: number, lng: number, city: string, country: string];

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface VenueHit extends GeoPoint {
  name: string;
  address: string;
  city: string;
}

export interface NearbySuggestion {
  city: string;
  cityCode: string;
  airports: { code: string; name: string; km: number }[];
  stations: { name: string; code: string; km: number }[];
  places: { title: string; description: string; km: number; scene: PlaceScene }[];
}

/** Great-circle distance in km. */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Road distance is longer than a straight line; round to something a
 * guest would say ("18 km"), never "0 km". */
export function roundKm(km: number): number {
  return km < 10 ? Math.max(1, Math.round(km * 10) / 10) : Math.round(km);
}

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    headers: { "User-Agent": UA, Accept: "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`);
  return res.json();
}

// ── Nominatim: one request a second, cached ──────────────────────────────

let nominatimQueue: Promise<unknown> = Promise.resolve();
const cache = new Map<string, { at: number; value: unknown }>();
const CACHE_MS = 24 * 60 * 60 * 1000;

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value as T;
  const value = await load();
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), value });
  return value;
}

function nominatim(path: string): Promise<unknown> {
  const run = nominatimQueue.then(() => getJson(`https://nominatim.openstreetmap.org/${path}`));
  // The next call waits for this one plus a second, whether it failed or not.
  nominatimQueue = run.catch(() => {}).then(() => new Promise((r) => setTimeout(r, 1100)));
  return run;
}

interface NominatimResult {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: Record<string, string>;
}

function cityOf(address: Record<string, string> = {}): string {
  return address.city || address.town || address.village || address.state_district || address.county || "";
}

/** Nominatim's display name without the place's own name, ward/zone
 * numbers and the country — what people write on an invitation. */
function shortAddress(r: NominatimResult): string {
  const country = r.address?.country;
  const parts = r.display_name
    .split(",")
    .map((p) => p.trim())
    .filter((p, i) => !(i === 0 && p === r.name))
    .filter((p) => !/^(ward|zone)\b/i.test(p) && p !== country);
  return [...new Set(parts)].join(", ");
}

export async function searchVenue(query: string, locale: string): Promise<VenueHit[]> {
  const q = query.trim().slice(0, 200);
  if (q.length < 3) return [];
  return cached(`s:${locale}:${q.toLowerCase()}`, async () => {
    const params = new URLSearchParams({
      q,
      format: "jsonv2",
      addressdetails: "1",
      limit: "6",
      "accept-language": `${locale},en`,
    });
    const results = (await nominatim(`search?${params}`)) as NominatimResult[];
    return results.map((r) => ({
      name: r.name || r.display_name.split(",")[0],
      address: shortAddress(r),
      city: cityOf(r.address),
      lat: Number(r.lat),
      lng: Number(r.lon),
    }));
  });
}

/** The venue's city and country (ISO code, upper case). */
async function reversePlace(p: GeoPoint, locale: string): Promise<{ city: string; country: string }> {
  const params = new URLSearchParams({
    lat: String(p.lat),
    lon: String(p.lng),
    format: "jsonv2",
    zoom: "10",
    addressdetails: "1",
    "accept-language": `${locale},en`,
  });
  const r = (await nominatim(`reverse?${params}`)) as NominatimResult;
  return { city: cityOf(r.address), country: (r.address?.country_code ?? "").toUpperCase() };
}

// ── Airports (bundled) ───────────────────────────────────────────────────

/** In the venue's country when known — a border town shouldn't be sent
 * abroad for a domestic flight. */
function nearestAirports(p: GeoPoint, country: string): NearbySuggestion["airports"] {
  return (AIRPORTS as Airport[])
    .filter((a) => !country || a[5] === country)
    // Named by city, as people say it ("Chennai"), when the list has one.
    .map(([code, name, lat, lng, city]) => ({ code, name: city || name, km: distanceKm(p, { lat, lng }) }))
    .filter((a) => a.km <= 300)
    .sort((a, b) => a.km - b.km)
    .slice(0, 3)
    .map((a) => ({ ...a, km: roundKm(a.km * 1.25) }));
}

// ── Sights and stations (Wikipedia nearby + Wikidata) ────────────────────

const SCENES: [PlaceScene, RegExp][] = [
  ["beach", /\bbeach\b/i],
  ["temple", /temple|kovil|koil|church|cathedral|basilica|mosque|masjid|dargah|gurudwara|shrine|\bmutt\b/i],
  ["palace", /palace|\bfort\b|mahal/i],
  ["nature", /\blake\b|\bpark\b|garden|falls|waterfall|\bhills?\b|sanctuary|\bzoo\b|forest|\bdam\b|backwater|botanical/i],
  ["heritage", /museum|memorial|monument|heritage|lighthouse|\btomb\b|mandapam|\bcaves?\b|ruins|archaeolog|gallery/i],
];
const STATION = /railway (station|terminus|junction)|\brailway station\b|\bjunction\b/i;
/** Worth a first pass on the title alone — keeps the detail lookups small. */
const TITLE_HINT = new RegExp(`${SCENES.map(([, re]) => re.source).join("|")}|${STATION.source}`, "i");
const NOT_A_SIGHT =
  /school|college|university|constituency|hospital|company|district|neighbourhood|suburb|village|metro|\bmrts\b|bus|airport|office|bank|hotel|stadium|mall|archdiocese|diocese|film/i;

const WIKI = "https://en.wikipedia.org/w/api.php";

interface WikiPage {
  pageid: number;
  title: string;
  length: number;
  description?: string;
  pageprops?: { wikibase_item?: string };
}
interface WikidataEntity {
  labels?: Record<string, { value: string }>;
  descriptions?: Record<string, { value: string }>;
}

async function wikidata(ids: string[], locale: string) {
  if (ids.length === 0) return {} as Record<string, WikidataEntity>;
  const wd = (await getJson(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      action: "wbgetentities",
      ids: ids.join("|"),
      props: "labels|descriptions",
      languages: locale === "en" ? "en" : `${locale}|en`,
      format: "json",
    })}`
  )) as { entities?: Record<string, WikidataEntity> };
  return wd.entities ?? {};
}

/** Label in the invitation's language, else English, else the article title. */
function localName(e: WikidataEntity | undefined, locale: string, title: string) {
  const name = e?.labels?.[locale]?.value || e?.labels?.en?.value || title.replace(/\s*,[^,]*$|\s*\([^)]*\)$/, "");
  return name.replace(/[.\s]+$/, "");
}

/** "Chennai Central railway station" → "Chennai Central", in either language. */
function stationName(name: string): string {
  return name
    .replace(/\s+railway (station|terminus)$/i, "")
    .replace(/\s*(இ?ரயில்|தொடர்வண்டி|தொடருந்து)\s+நிலையம்$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Big-city terminals worth listing even when a suburban halt is nearer. */
const MAJOR_STATION = /central|junction|\bjn\b|terminus|egmore|cantonment|city/i;

async function nearestStations(p: GeoPoint, locale: string): Promise<NearbySuggestion["stations"]> {
  const query = `SELECT ?item ?label ?en ?code ?dist WHERE {
    SERVICE wikibase:around { ?item wdt:P625 ?c. bd:serviceParam wikibase:center "Point(${p.lng} ${p.lat})"^^geo:wktLiteral; wikibase:radius "30"; wikibase:distance ?dist. }
    ?item wdt:P5696 ?code.
    OPTIONAL { ?item rdfs:label ?en FILTER(lang(?en) = "en") }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "${locale},en". ?item rdfs:label ?label. }
  } ORDER BY ?dist LIMIT 40`;
  const json = (await getJson(`https://query.wikidata.org/sparql?${new URLSearchParams({ query })}`, {
    headers: { Accept: "application/sparql-results+json" },
  })) as { results: { bindings: Record<string, { value: string }>[] } };
  const rows = json.results.bindings.map((b) => ({
    name: stationName(b.label?.value ?? ""),
    english: b.en?.value ?? "",
    code: b.code.value,
    km: Number(b.dist.value),
  }));
  const [nearest] = rows;
  if (!nearest) return [];
  const major = rows.find((r) => r !== nearest && r.km <= 15 && MAJOR_STATION.test(r.english));
  const second = major ?? rows.find((r) => r !== nearest);
  return [nearest, second]
    .filter((r): r is (typeof rows)[number] => Boolean(r && r.name))
    .map(({ name, code, km }) => ({ name, code, km: roundKm(km * 1.25) }));
}

async function nearbySights(p: GeoPoint, locale: string): Promise<NearbySuggestion["places"]> {
  const geo = (await getJson(
    `${WIKI}?${new URLSearchParams({
      action: "query",
      list: "geosearch",
      gscoord: `${p.lat}|${p.lng}`,
      gsradius: "10000",
      gslimit: "500",
      format: "json",
    })}`
  )) as { query?: { geosearch?: { pageid: number; title: string; lat: number; lon: number }[] } };
  const hits = (geo.query?.geosearch ?? []).filter((h) => TITLE_HINT.test(h.title)).slice(0, 150);
  const km = new Map(hits.map((h) => [h.pageid, distanceKm(p, { lat: h.lat, lng: h.lon })]));

  // Details 50 at a time (the API's limit).
  const pages: WikiPage[] = [];
  const batches = [];
  for (let i = 0; i < hits.length; i += 50) batches.push(hits.slice(i, i + 50));
  for (const json of await Promise.all(
    batches.map((b) =>
      getJson(
        `${WIKI}?${new URLSearchParams({
          action: "query",
          prop: "info|description|pageprops",
          ppprop: "wikibase_item",
          pageids: b.map((h) => h.pageid).join("|"),
          format: "json",
        })}`
      )
    )
  )) {
    pages.push(...Object.values((json as { query?: { pages?: Record<string, WikiPage> } }).query?.pages ?? {}));
  }
  // Longest article first: Marina Beach before a neighbourhood shrine.
  pages.sort((a, b) => b.length - a.length);
  const text = (pg: WikiPage) => `${pg.title} ${pg.description ?? ""}`;

  // The best-known sights, no more than two of a kind at first (not four
  // temples on one street), topped up if the area only has one kind.
  const sights = pages
    .filter((pg) => !STATION.test(text(pg)) && !NOT_A_SIGHT.test(text(pg)))
    .map((pg) => ({ pg, scene: SCENES.find(([, re]) => re.test(text(pg)))?.[0] }))
    // Not the venue itself (a temple wedding sits on its own article).
    .filter((c): c is { pg: WikiPage; scene: PlaceScene } => Boolean(c.scene) && km.get(c.pg.pageid)! > 0.3);
  const perScene = new Map<string, number>();
  const varied = sights.filter((c) => {
    const n = perScene.get(c.scene) ?? 0;
    perScene.set(c.scene, n + 1);
    return n < 2;
  });
  const sightPick = [...varied, ...sights.filter((c) => !varied.includes(c))].slice(0, 4);

  const qid = (pg: WikiPage) => pg.pageprops?.wikibase_item;
  const data = await wikidata(sightPick.map((c) => qid(c.pg)).filter(Boolean) as string[], locale).catch(
    () => ({}) as Record<string, WikidataEntity>
  );

  return sightPick.map(({ pg, scene }) => {
    const e = qid(pg) ? data[qid(pg)!] : undefined;
    // Only in the invitation's language — no English line on a Tamil card.
    const description = e?.descriptions?.[locale]?.value || (locale === "en" ? pg.description ?? "" : "");
    return {
      title: localName(e, locale, pg.title),
      description: description.charAt(0).toUpperCase() + description.slice(1),
      km: roundKm(km.get(pg.pageid)! * 1.25),
      scene,
    };
  });
}

export async function nearby(p: GeoPoint, locale: string): Promise<NearbySuggestion> {
  const key = `n:${locale}:${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
  return cached(key, async () => {
    const failed = (what: string) => (err: unknown) => {
      console.error(`geo nearby ${what}`, err);
      return [];
    };
    const [{ city, country }, stations, places] = await Promise.all([
      reversePlace(p, locale).catch(() => ({ city: "", country: "" })),
      nearestStations(p, locale).catch(failed("stations")),
      nearbySights(p, locale).catch(failed("sights")),
    ]);
    const airports = nearestAirports(p, country);
    return { city, cityCode: airports[0] && airports[0].km <= 60 ? airports[0].code : "", airports, stations, places };
  });
}
