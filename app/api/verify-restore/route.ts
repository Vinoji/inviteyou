import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getTranslations } from "next-intl/server";
import { requireEditToken } from "@/lib/ownerAuth";
import { getRazorpay, verifyPaymentSignature } from "@/lib/razorpay";
import { RESTORE_PRICE_PAISE, expiresAt, restoredUntilAfterPayment } from "@/lib/expiry";
import { sendToOwner } from "@/lib/notify";
import { ownerLinks } from "@/lib/ownerLinks";

/**
 * Completes a restore: checks the Razorpay signature, then confirms with
 * Razorpay that the order really is a ₹50 restore for *this* invitation
 * (so no other payment — e.g. the original ₹199 one — can be reused), and
 * extends it by 30 days. Each payment id is recorded, so replaying the
 * same payment can't extend it twice.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const orderId = body?.razorpay_order_id;
  const paymentId = body?.razorpay_payment_id;
  const signature = body?.razorpay_signature;
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  const check = await requireEditToken(slug, body?.token);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }
  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const rz = getRazorpay();
  if (!rz) {
    return NextResponse.json({ error: "Payments are not configured on the server." }, { status: 500 });
  }
  const order = await rz.instance.orders.fetch(orderId);
  const notes = (order.notes ?? {}) as Record<string, unknown>;
  if (
    notes.purpose !== "restore" ||
    notes.slug !== slug ||
    Number(order.amount) !== RESTORE_PRICE_PAISE
  ) {
    return NextResponse.json({ error: "This payment isn't a restore for this invitation." }, { status: 400 });
  }

  const invRef = check.db.collection("invitations").doc(slug);
  const until = await check.db.runTransaction(async (tx) => {
    const [invSnap, metaSnap] = await Promise.all([tx.get(invRef), tx.get(check.metaRef)]);
    const inv = invSnap.data() ?? {};
    const used = (metaSnap.data()?.restorePayments ?? []) as { paymentId: string }[];
    if (used.some((p) => p.paymentId === paymentId)) return expiresAt(inv);
    const next = restoredUntilAfterPayment(inv);
    tx.update(invRef, { restoredUntil: next, updatedAt: Date.now() });
    tx.update(check.metaRef, {
      restorePayments: FieldValue.arrayUnion({ paymentId, orderId, at: Date.now() }),
    });
    return next;
  });

  // Let the owner know on their phone too (best-effort).
  const ownerPhone = check.meta.ownerPhone as string | undefined;
  if (ownerPhone && until) {
    const locale = check.meta.ownerLocale === "ta" ? "ta" : "en";
    const inv = (await invRef.get()).data() ?? {};
    const t = await getTranslations({ locale, namespace: "notify" });
    const links = ownerLinks(req, {
      slug,
      templateId: inv.templateId,
      editToken: check.meta.editToken,
      locale,
    });
    const title = [inv.brideName, inv.groomName].filter(Boolean).join(" & ");
    const date = new Intl.DateTimeFormat(locale === "ta" ? "ta-IN" : "en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(until);
    await sendToOwner(
      ownerPhone,
      t("restored", { title, inviteUrl: links.invite, date }),
      { sid: process.env.TWILIO_WHATSAPP_RESTORED_CONTENT_SID, vars: [title, links.invite] }
    );
  }

  return NextResponse.json({ ok: true, expiresAt: until });
}
