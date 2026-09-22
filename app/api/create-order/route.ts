import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAdminDb } from "@/lib/firebase-admin";

const PRICE_PAISE = 19900; // ₹199 flat, one-time

export async function POST(req: NextRequest) {
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
    amount: PRICE_PAISE,
    currency: "INR",
    receipt: draftId,
    notes: { draftId },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  });
}
