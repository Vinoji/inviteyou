import { NextRequest, NextResponse } from "next/server";
import { requireEditToken } from "@/lib/ownerAuth";
import { tooMany } from "@/lib/rateLimit";
import { cleanComment, getReview, reviewIdentity } from "@/lib/reviews";
import type { InvitationData } from "@/lib/types";

/**
 * A couple's review of InviteForYou, from their private guest-list page.
 * Owner-only (edit token), one per invitation; saved unapproved — it shows
 * on the home page only after a person approves it (lib/reviews.ts).
 */
export async function POST(req: NextRequest) {
  const limited = tooMany(req, "review", 10, 60 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const rating = Number(body?.rating);
  const comment = cleanComment(body?.comment);
  if (!slug || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please choose a rating." }, { status: 400 });
  }
  if (comment.length < 10) {
    return NextResponse.json({ error: "Please write a few words." }, { status: 400 });
  }

  const auth = await requireEditToken(slug, body?.token);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const invSnap = await auth.db.collection("invitations").doc(slug).get();
  if (!invSnap.exists) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  const identity = reviewIdentity(invSnap.data() as InvitationData, body?.showNames !== false);

  const now = Date.now();
  const existing = await getReview(slug);
  await auth.db
    .collection("reviews")
    .doc(slug)
    .set({
      slug,
      rating,
      comment,
      ...identity,
      approved: false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
  return NextResponse.json({ ok: true });
}
