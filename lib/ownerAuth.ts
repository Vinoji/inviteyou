import "server-only";
import { timingSafeEqual } from "crypto";
import { getAdminDb } from "./firebase-admin";

/** Compares tokens in constant time, so response timing can't reveal how
 * much of a guessed token was right. */
function sameToken(expected: unknown, given: string): boolean {
  if (typeof expected !== "string") return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Checks an owner's edit token against invitations/{slug}/private/meta.
 * Every owner-only route (load/save edits, restore payments) goes through
 * this; the token is the only credential the owner has.
 */
export async function requireEditToken(slug: string, token: unknown) {
  if (typeof token !== "string" || !token) {
    return { ok: false as const, status: 403, error: "Missing edit token." };
  }
  const db = getAdminDb();
  const metaRef = db.collection("invitations").doc(slug).collection("private").doc("meta");
  const metaSnap = await metaRef.get();
  if (!metaSnap.exists || !sameToken(metaSnap.data()?.editToken, token)) {
    return { ok: false as const, status: 403, error: "Invalid edit link." };
  }
  return { ok: true as const, db, metaRef, meta: metaSnap.data()! };
}
