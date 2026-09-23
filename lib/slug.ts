import "server-only";
import slugify from "slugify";
import { getAdminDb } from "./firebase-admin";

function randomSuffix(len = 4) {
  return Math.random().toString(36).slice(2, 2 + len);
}

/**
 * Generates a slug from the couple's names (e.g. "priya-arjun"), appending a
 * short random suffix if the base slug is already taken.
 */
export async function generateUniqueSlug(
  groomName: string,
  brideName: string
): Promise<string> {
  const db = getAdminDb();
  const base =
    slugify(`${brideName}-${groomName}`, { lower: true, strict: true }) ||
    "our-celebration";

  let candidate = base;
  for (let attempt = 0; attempt < 8; attempt++) {
    const doc = await db.collection("invitations").doc(candidate).get();
    if (!doc.exists) return candidate;
    candidate = `${base}-${randomSuffix()}`;
  }
  // Extremely unlikely fallback: timestamp-based suffix is unique enough.
  return `${base}-${Date.now().toString(36)}`;
}
