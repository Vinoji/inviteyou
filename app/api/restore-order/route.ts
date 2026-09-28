import { NextRequest, NextResponse } from "next/server";
import { requireEditToken } from "@/lib/ownerAuth";
import { getRazorpay } from "@/lib/razorpay";
import { RESTORE_PRICE_PAISE, isExpired } from "@/lib/expiry";

/**
 * Starts a ₹50 payment to restore an expired invitation for 30 more days.
 * Owner only (edit token), and only once the invitation has expired. The
 * order carries the slug in its notes; verify-restore checks it.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const check = await requireEditToken(slug, body?.token);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const snap = await check.db.collection("invitations").doc(slug).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }
  if (!isExpired(snap.data()!)) {
    return NextResponse.json({ error: "This invitation hasn't expired." }, { status: 409 });
  }

  const rz = getRazorpay();
  if (!rz) {
    return NextResponse.json({ error: "Payments are not configured on the server." }, { status: 500 });
  }
  const order = await rz.instance.orders.create({
    amount: RESTORE_PRICE_PAISE,
    currency: "INR",
    receipt: `restore-${slug}`.slice(0, 40),
    notes: { slug, purpose: "restore" },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: rz.keyId,
  });
}
