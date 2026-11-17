import { NextRequest, NextResponse } from "next/server";
import { requireEditToken } from "@/lib/ownerAuth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { fetchOrder } from "@/lib/payments";
import { applyVideoPayment, isVideoOrder } from "@/lib/video";

/**
 * Completes a video purchase: checks the Razorpay signature, confirms with
 * Razorpay that the order really is a ₹99 video for *this* invitation, then
 * records it and starts the render. Replays and the webhook are no-ops.
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
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }
  const order = await fetchOrder(orderId);
  if (!isVideoOrder(order, slug)) {
    return NextResponse.json({ error: "This payment isn't a video for this invitation." }, { status: 400 });
  }
  await applyVideoPayment(slug, orderId, paymentId, { amountPaise: order.amount, test: order.notes.devPrice === "1" });
  return NextResponse.json({ ok: true });
}
