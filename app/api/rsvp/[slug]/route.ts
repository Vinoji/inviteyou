import { NextRequest, NextResponse } from "next/server";
import { isExpired } from "@/lib/expiry";
import { getAdminDb } from "@/lib/firebase-admin";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sanitizeAttendingSide } from "@/lib/sanitize";
import { sanitizePhone } from "@/lib/share";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ip = getClientIp(req.headers);

  const { ok } = rateLimit(`rsvp:${slug}:${ip}`, {
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });
  if (!ok) {
    return NextResponse.json(
      { error: "Too many submissions from this device. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const guestName =
    typeof body?.guestName === "string" ? body.guestName.trim().slice(0, 100) : "";
  const guestCount = Number(body?.guestCount) || 1;
  const attending = Boolean(body?.attending);
  const message =
    typeof body?.message === "string" ? body.message.trim().slice(0, 500) : "";
  const side = sanitizeAttendingSide(body?.side);
  // Optional, for the couple's WhatsApp reminders; never shown publicly.
  const phone = sanitizePhone(body?.phone);

  if (!guestName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (guestCount < 1 || guestCount > 20) {
    return NextResponse.json(
      { error: "Guest count must be between 1 and 20." },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const invRef = db.collection("invitations").doc(slug);
  const invSnap = await invRef.get();
  if (!invSnap.exists || invSnap.data()?.status !== "published") {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }
  // Expired invitations are read-only until the owner restores them.
  if (isExpired(invSnap.data()!)) {
    return NextResponse.json({ error: "This invitation has ended." }, { status: 410 });
  }

  // Extra duplicate guard: the same name submitting again within the last
  // couple of minutes is almost certainly a double-submit, not a new guest.
  // Single-field equality query — no composite index required.
  const recentCutoff = Date.now() - 2 * 60 * 1000;
  const recentSameName = await invRef
    .collection("rsvps")
    .where("guestName", "==", guestName)
    .limit(5)
    .get();
  const isDuplicate = recentSameName.docs.some(
    (d) => (d.data().createdAt ?? 0) > recentCutoff
  );
  if (isDuplicate) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const createdAt = Date.now();
  const rsvpRef = await invRef.collection("rsvps").add({
    guestName,
    guestCount,
    attending,
    side: side ?? null, // Firestore rejects `undefined`; null = not specified
    message,
    createdAt,
  });
  if (phone) {
    await invRef.collection("rsvpContacts").doc(rsvpRef.id).set({ phone, createdAt });
  }

  return NextResponse.json({ ok: true });
}
