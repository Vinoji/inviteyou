import "server-only";
import crypto from "crypto";
import slugify from "slugify";
import { getAdminDb } from "./firebase-admin";

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no look-alikes (l, o, 0, 1)

function randomId(len = 6) {
  const bytes = crypto.randomBytes(len);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * Generates a slug from the couple's names plus a random id (e.g.
 * "priya-arjun-k7m2xq"), so two couples with the same names and date never
 * share a link. The id is always added, not only on a clash, and each
 * candidate is checked against existing invitations.
 */
export async function generateUniqueSlug(
  groomName: string,
  brideName: string
): Promise<string> {
  const db = getAdminDb();
  const base =
    slugify(`${brideName}-${groomName}`, { lower: true, strict: true }) ||
    "our-celebration";

  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `${base}-${randomId()}`;
    const doc = await db.collection("invitations").doc(candidate).get();
    if (!doc.exists) return candidate;
  }
  // Extremely unlikely fallback: timestamp-based suffix is unique enough.
  return `${base}-${randomId()}${Date.now().toString(36)}`;
}
