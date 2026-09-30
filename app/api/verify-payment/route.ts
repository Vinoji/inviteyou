import { NextRequest, NextResponse } from "next/server";
import { getRazorpay, verifyPaymentSignature } from "@/lib/razorpay";
import { fetchOrder, isPublishOrder, publishPaidDraft } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const draftId = body?.draftId;
  const razorpay_order_id = body?.razorpay_order_id;
  const razorpay_payment_id = body?.razorpay_payment_id;
  const razorpay_signature = body?.razorpay_signature;

  if (!draftId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }
  if (typeof draftId !== "string" || !/^[a-zA-Z0-9-]{8,64}$/.test(draftId)) {
    return NextResponse.json({ error: "Invalid draftId." }, { status: 400 });
  }
  if (!getRazorpay()) {
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

  // The signature only proves *an* order was paid. The order must also be
  // this draft's, for the full price — otherwise one real payment (or a ₹50
  // restore) could be replayed to publish other drafts. (create-order puts
  // the draftId in the order's notes.)
  const order = await fetchOrder(razorpay_order_id).catch(() => null);
  if (!order || !isPublishOrder(order, draftId)) {
    return NextResponse.json({ error: "This payment isn't for this invitation." }, { status: 400 });
  }

  // Each order publishes once. The Razorpay webhook may already have
  // published it; either way the same slug and edit token come back.
  const result = await publishPaidDraft(req, draftId, razorpay_order_id, razorpay_payment_id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ slug: result.slug, editToken: result.editToken, sent: result.sent });
}
