import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAdminDb } from "@/lib/firebase-admin";
import { templatePricePaise } from "@/lib/pricing";
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
    amount: templatePricePaise(snap.data()?.templateId ?? ""),
    currency: "INR",
    receipt: draftId,
    notes: { draftId, templateId: snap.data()?.templateId ?? "" },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  });
}
