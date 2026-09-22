import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { generateUniqueSlug } from "@/lib/slug";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const draftId = body?.draftId;
  const razorpay_order_id = body?.razorpay_order_id;
  const razorpay_payment_id = body?.razorpay_payment_id;
  const razorpay_signature = body?.razorpay_signature;

  if (!draftId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Payments are not configured on the server." },
      { status: 500 }
    );
  }

  // Never trust a client-reported "payment succeeded" — recompute the
  // signature server-side from order|payment ids and the secret, and only
  // proceed on an exact match.
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    // Leave the draft as pending_payment so the user can retry — do not
    // publish anything on a signature mismatch.
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const db = getAdminDb();
  const draftRef = db.collection("invitations").doc(draftId);
  const draftSnap = await draftRef.get();
  if (!draftSnap.exists) {
    return NextResponse.json(
      { error: "Draft not found or already published." },
      { status: 404 }
    );
  }
  const draft = draftSnap.data()!;

  const slug = await generateUniqueSlug(draft.groomName ?? "", draft.brideName ?? "");
  const editToken = crypto.randomBytes(16).toString("hex");
  const now = Date.now();

  const publishedRef = db.collection("invitations").doc(slug);
  const batch = db.batch();
  batch.set(publishedRef, {
    ...draft,
    slug,
    status: "published",
    viewCount: 0,
    createdAt: draft.createdAt ?? now,
    updatedAt: now,
  });
  batch.set(publishedRef.collection("private").doc("meta"), {
    editToken,
    razorpayPaymentId: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
  });
  batch.delete(draftRef);
  await batch.commit();

  return NextResponse.json({ slug, editToken });
}
