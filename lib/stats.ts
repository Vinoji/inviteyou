import "server-only";
import { AggregateField, FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";
import type { Review } from "./reviews";

/**
 * Real numbers for the home page, counted from the database — never typed
 * in. Each one is shown only once it's big enough to mean something
 * (THRESHOLDS); until then it's left out. Cached for an hour per server.
 */
const THRESHOLDS = {
  published: 25,
  opens: 1000,
  rsvps: 100,
  reviews: 5,
  /** Reviews a single design needs before its own rating shows. */
  designReviews: 3,
  freeCardMakers: 50,
};

export interface SiteStats {
  published?: number;
  /** Times guests opened invitations, across all of them. */
  opens?: number;
  rsvps?: number;
  rating?: { average: number; count: number };
  /** Share of free-card makers who went on to publish a paid invitation. */
  upgrade?: { percent: number; base: number };
  designRatings: Record<string, { average: number; count: number }>;
}

const TTL_MS = 60 * 60 * 1000;
let cache: { at: number; stats: SiteStats } | null = null;

const avg = (rs: Review[]) => Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10;

async function compute(): Promise<SiteStats> {
  const db = getAdminDb();
  const [published, viewSum, rsvps, reviewsSnap, funnel, fromFree] = await Promise.all([
    db.collection("invitations").where("status", "==", "published").count().get(),
    // Drafts never have views, so summing every invitation needs no index.
    db.collection("invitations").aggregate({ opens: AggregateField.sum("viewCount") }).get(),
    db.collectionGroup("rsvps").count().get(),
    db.collection("reviews").where("approved", "==", true).limit(1000).get(),
    db.collection("stats").doc("funnel").get(),
    db.collection("payments").where("fromFreeCard", "==", true).count().get(),
  ]);
  const reviews = reviewsSnap.docs.map((d) => d.data() as Review).filter((r) => r.rating >= 1);
  const makers = Number(funnel.data()?.freeCardMakers ?? 0);
  const stats: SiteStats = { designRatings: {} };

  const p = published.data().count;
  if (p >= THRESHOLDS.published) stats.published = p;
  const opens = Number(viewSum.data().opens ?? 0);
  if (opens >= THRESHOLDS.opens) stats.opens = opens;
  const r = rsvps.data().count;
  if (r >= THRESHOLDS.rsvps) stats.rsvps = r;
  if (reviews.length >= THRESHOLDS.reviews) stats.rating = { average: avg(reviews), count: reviews.length };
  if (makers >= THRESHOLDS.freeCardMakers) {
    stats.upgrade = { percent: Math.round((fromFree.data().count / makers) * 100), base: makers };
  }
  const byDesign = new Map<string, Review[]>();
  for (const rv of reviews) if (rv.templateId) byDesign.set(rv.templateId, [...(byDesign.get(rv.templateId) ?? []), rv]);
  for (const [id, rs] of byDesign) {
    if (rs.length >= THRESHOLDS.designReviews) stats.designRatings[id] = { average: avg(rs), count: rs.length };
  }
  return stats;
}

export async function getSiteStats(): Promise<SiteStats> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.stats;
  try {
    const stats = await compute();
    cache = { at: Date.now(), stats };
    return stats;
  } catch (err) {
    console.error("[stats] failed", err);
    return cache?.stats ?? { designRatings: {} };
  }
}

/** Counts a device's first free card (POST /api/card). */
export async function recordFreeCardMaker(): Promise<void> {
  try {
    await getAdminDb()
      .collection("stats")
      .doc("funnel")
      .set({ freeCardMakers: FieldValue.increment(1), updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.error("[stats] funnel count failed", err);
  }
}
