import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAdminDb } from "@/lib/firebase-admin";
import { isFreeTemplate } from "@/lib/pricing";
import { payableInr } from "@/lib/coupons";
import { tooMany } from "@/lib/rateLimit";


export async function POST(req: NextRequest) {
  const limited = tooMany(req, "order", 20, 60 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const draftId = body?.draftId;
  if (typeof draftId !== "string" || !draftId) {
    return NextResponse.json({ error: "draftId is required." }, { status: 400 });
  }

  const db = getAdminDb();
  const snap = await db.collection("invitations").doc(draftId).get();
  if (!snap.exists) {
    return NextResponse.json(
      { error: "Draft not found. Please save your details first." },
      { status: 404 }
    );
  }
  if (snap.data()?.status === "published") {
    return NextResponse.json(
      { error: "This invitation is already published." },
      { status: 409 }
    );
  }

  // Free designs are a card download, never a published (paid) invitation.
  if (isFreeTemplate(snap.data()?.templateId ?? "")) {
    return NextResponse.json(
      { error: "This design is free — download your card instead, or pick a paid design for a live link." },
      { status: 400 }
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Payments are not configured on the server." },
      { status: 500 }
    );
  }

  const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await instance.orders.create({
    // Each template has its own price; verify-payment and the webhook check
    // what was paid covers the draft's template at publish time.
    // The draft's discount code (checked when it was saved) is applied here.
    amount: payableInr(snap.data()?.templateId ?? "", snap.data()?.coupon, snap.data()?.devPrice === true) * 100,
    currency: "INR",
    receipt: draftId,
    notes: { draftId, templateId: snap.data()?.templateId ?? "", coupon: snap.data()?.coupon ?? "" },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  });
}
