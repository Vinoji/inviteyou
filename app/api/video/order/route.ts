import { NextRequest, NextResponse } from "next/server";
import { requireEditToken } from "@/lib/ownerAuth";
import { getRazorpay } from "@/lib/razorpay";
import { isExpired } from "@/lib/expiry";
import { tooMany } from "@/lib/rateLimit";
import { VIDEO_DEV_PRICE_PAISE, VIDEO_PRICE_PAISE } from "@/lib/video";
import { devPriceEnabled } from "@/lib/pricing";

/**
 * Starts a ₹99 payment for the invitation's WhatsApp video. Owner only (edit
 * token), on a live published invitation. The order carries the slug in its
 * notes; video/verify and the webhook check it. With devPrice (the
 * ?dev_option=1 payment test, where enabled) it costs ₹1.
 */
export async function POST(req: NextRequest) {
  const limited = tooMany(req, "order", 20, 60 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const check = await requireEditToken(slug, body?.token);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const snap = await check.db.collection("invitations").doc(slug).get();
  if (!snap.exists || snap.data()?.status !== "published") {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }
  if (isExpired(snap.data()!)) {
    return NextResponse.json({ error: "This invitation has ended — restore it first." }, { status: 409 });
  }
  const status = (check.meta.video as { status?: string } | undefined)?.status;
  if (status && status !== "failed") {
    return NextResponse.json({ error: "This invitation's video is already paid for." }, { status: 409 });
  }

  const rz = getRazorpay();
  if (!rz) return NextResponse.json({ error: "Payments are not configured on the server." }, { status: 500 });
  const dev = body?.devPrice === true && devPriceEnabled();
  const order = await rz.instance.orders.create({
    amount: dev ? VIDEO_DEV_PRICE_PAISE : VIDEO_PRICE_PAISE,
    currency: "INR",
    receipt: `video-${slug}`.slice(0, 40),
    notes: { slug, purpose: "video", ...(dev ? { devPrice: "1" } : {}) },
  });
  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: rz.keyId });
}
