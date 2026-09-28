import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getTranslations } from "next-intl/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { generateUniqueSlug } from "@/lib/slug";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendToOwner } from "@/lib/notify";
import { ownerLinks } from "@/lib/ownerLinks";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const draftId = body?.draftId;
  const razorpay_order_id = body?.razorpay_order_id;
  const razorpay_payment_id = body?.razorpay_payment_id;
  const razorpay_signature = body?.razorpay_signature;

  if (!draftId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Payments are not configured on the server." },
      { status: 500 }
    );
  }

  // Never trust a client-reported "payment succeeded" — recompute the
  // signature server-side and only proceed on an exact match. On a
  // mismatch the draft stays pending_payment so the user can retry.
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const db = getAdminDb();
  const draftRef = db.collection("invitations").doc(draftId);
  const ownerRef = draftRef.collection("private").doc("owner");
  const [draftSnap, ownerSnap] = await Promise.all([draftRef.get(), ownerRef.get()]);
  if (!draftSnap.exists) {
    return NextResponse.json(
      { error: "Draft not found or already published." },
      { status: 404 }
    );
  }
  const draft = draftSnap.data()!;
  const owner = ownerSnap.exists ? ownerSnap.data()! : {};

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
    ...(owner.phone ? { ownerPhone: owner.phone, ownerLocale: owner.locale ?? "en" } : {}),
  });
  batch.delete(ownerRef);
  batch.delete(draftRef);
  await batch.commit();

  // Send the owner their links. Published is published: a failed message
  // only means the popup offers the manual send buttons instead.
  let sent: string | null = null;
  if (owner.phone) {
    const locale = owner.locale === "ta" ? "ta" : "en";
    const t = await getTranslations({ locale, namespace: "notify" });
    const links = ownerLinks(req, { slug, templateId: draft.templateId, editToken, locale });
    const title = [draft.brideName, draft.groomName].filter(Boolean).join(" & ");
    const result = await sendToOwner(
      owner.phone,
      t("published", { title, inviteUrl: links.invite, editUrl: links.edit }),
      { sid: process.env.TWILIO_WHATSAPP_CONTENT_SID, vars: [title, links.edit] }
    );
    sent = result.sent;
  }

  return NextResponse.json({ slug, editToken, sent });
}
