import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sanitizeUploaderName, sanitizeGuestPhotoUrl } from "@/lib/sanitize";

// A generous but real ceiling — keeps a single invitation's guest gallery
// (and the Storage/Firestore cost that comes with it) bounded even under
// sustained abuse, since there's no auth here to rate-limit by account.
const MAX_GUEST_PHOTOS = 40;

/**
 * Registers a photo a guest already uploaded directly to Storage (client
 * SDK, validated by storage.rules) into Firestore. The file itself never
 * passes through this route — only its download URL — so this is a small,
 * fast write, same division of labor as the rest of the app's uploads.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ip = getClientIp(req.headers);

  const { ok } = rateLimit(`guestphoto:${slug}:${ip}`, {
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });
  if (!ok) {
    return NextResponse.json(
      { error: "Too many uploads from this device. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const uploaderName = sanitizeUploaderName(body?.uploaderName);
  const url = sanitizeGuestPhotoUrl(body?.url);

  if (!uploaderName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!url) {
    return NextResponse.json({ error: "Invalid photo upload." }, { status: 400 });
  }

  const db = getAdminDb();
  const invRef = db.collection("invitations").doc(slug);
  const invSnap = await invRef.get();
  if (!invSnap.exists || invSnap.data()?.status !== "published") {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }

  const existing = await invRef.collection("guestPhotos").get();
  if (existing.size >= MAX_GUEST_PHOTOS) {
    return NextResponse.json(
      { error: "This gallery is full — please check back later." },
      { status: 409 }
    );
  }

  await invRef.collection("guestPhotos").add({
    uploaderName,
    url,
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
