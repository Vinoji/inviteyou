import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  applyRestorePayment,
  isPublishOrder,
  isRestoreOrder,
  publishPaidDraft,
} from "@/lib/payments";

/**
 * Razorpay webhook (subscribe to `order.paid`). The browser normally
 * publishes/restores right after checkout via verify-payment/verify-restore;
 * this is the safety net for when the buyer paid but closed the tab or lost
 * connection first. Both paths are idempotent, so whichever arrives second
 * is a no-op.
 *
 * Replies 2xx for anything handled or deliberately ignored, and 5xx only on
 * real failures so Razorpay retries those.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(raw);
  if (event?.event !== "order.paid") {
    return NextResponse.json({ ignored: event?.event ?? null });
  }

  const orderEntity = event.payload?.order?.entity;
  const paymentId: string | undefined = event.payload?.payment?.entity?.id;
  if (!orderEntity?.id || !paymentId) {
    return NextResponse.json({ ignored: "missing order or payment" });
  }
  // The payload is signed by Razorpay, so its order amount and notes can be
  // used directly.
  const order = {
    amount: Number(orderEntity.amount),
    notes: (orderEntity.notes ?? {}) as Record<string, unknown>,
  };

  try {
    if (isRestoreOrder(order)) {
      const { found } = await applyRestorePayment(
        req,
        order.notes.slug as string,
        orderEntity.id,
        paymentId
      );
      return NextResponse.json({ restored: found });
    }
    if (isPublishOrder(order)) {
      const result = await publishPaidDraft(
        req,
        order.notes.draftId as string,
        orderEntity.id,
        paymentId,
        order.amount
      );
      if (!result.ok) console.error("razorpay-webhook: publish skipped", orderEntity.id, result.error);
      return NextResponse.json({ published: result.ok });
    }
    return NextResponse.json({ ignored: "unrecognised order" });
  } catch (err) {
    console.error("razorpay-webhook failed", orderEntity.id, err);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}
