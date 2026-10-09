import { NextRequest, NextResponse } from "next/server";
import { requireEditToken } from "@/lib/ownerAuth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { applyRestorePayment, fetchOrder, isRestoreOrder } from "@/lib/payments";

/**
 * Completes a restore: checks the Razorpay signature, then confirms with
 * Razorpay that the order really is a ₹50 restore for *this* invitation
 * (so no other payment — e.g. the original ₹49 one — can be reused), and
 * extends it by 30 days. Each payment id is recorded, so replaying the
 * same payment (or the webhook getting there first) can't extend it twice.
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
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Payments are not configured on the server." }, { status: 500 });
  }
  if (!isRestoreOrder(await fetchOrder(orderId), slug)) {
    return NextResponse.json({ error: "This payment isn't a restore for this invitation." }, { status: 400 });
  }

  const { expiresAt } = await applyRestorePayment(req, slug, orderId, paymentId);
  return NextResponse.json({ ok: true, expiresAt });
}
