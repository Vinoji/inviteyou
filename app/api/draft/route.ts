import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { TEMPLATE_IDS, getTemplateConfig } from "@/lib/templates";
import { getCategoryConfig } from "@/lib/categories";
import { waPhone } from "@/lib/share";
import { earliestAllowedOnServer, isDateAllowed } from "@/lib/dates";
import {
  sanitizeAccentColor,
  sanitizeBackgroundMusic,
  sanitizeFaq,
  sanitizeMonogram,
  sanitizeFamily,
  sanitizeContentLocale,
  sanitizeParentsLine,
  sanitizePlaces,
  sanitizePhotos,
  sanitizeSections,
  sanitizeTravel,
  sanitizeVenue,
} from "@/lib/sanitize";

/**
 * Creates or updates a "pending_payment" draft, keyed by a client-generated
 * draftId (also the Storage folder the photos were uploaded into). This is
 * called right before opening Razorpay Checkout — it's the only way a
 * Firestore write happens pre-publish, and it always goes through the
 * Admin SDK here, never directly from the client.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    draftId,
    templateId,
    groomName,
    brideName,
    weddingDate,
    ceremonyTime,
    ceremonyVenue,
    receptionTime,
    receptionVenue,
    story,
    groomParents,
    brideParents,
    accentColor,
    fontPairing,
    photos,
    backgroundMusic,
    sections,
    faq,
    travel,
    places,
    monogram,
    brideFamily,
    groomFamily,
    contentLocale,
    ownerPhone,
    ownerLocale,
  } = body;

  if (typeof draftId !== "string" || !/^[a-zA-Z0-9-]{8,64}$/.test(draftId)) {
    return NextResponse.json({ error: "Invalid draftId." }, { status: 400 });
  }
  if (typeof templateId !== "string" || !TEMPLATE_IDS.includes(templateId)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }
  // The buyer's own number, for sending them their edit link after payment.
  const phoneDigits = waPhone(typeof ownerPhone === "string" ? ownerPhone : "");
  if (!phoneDigits) {
    return NextResponse.json(
      { error: "Please enter a valid mobile number for your edit link." },
      { status: 400 }
    );
  }
  const category = getCategoryConfig(getTemplateConfig(templateId).category);
  if (
    !String(brideName ?? "").trim() ||
    (!category.singlePerson && !String(groomName ?? "").trim())
  ) {
    return NextResponse.json(
      { error: "Please fill in the name field(s)." },
      { status: 400 }
    );
  }

  if (
    !isDateAllowed(String(weddingDate ?? ""), {
      allowPast: category.allowPastDate,
      earliest: earliestAllowedOnServer(),
    })
  ) {
    return NextResponse.json({ error: "Please choose today or a future date." }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection("invitations").doc(draftId);
  const existing = await ref.get();
  if (existing.exists && existing.data()?.status === "published") {
    return NextResponse.json(
      { error: "This invitation is already published." },
      { status: 409 }
    );
  }

  const now = Date.now();
  await ref.set({
    templateId,
    groomName: String(groomName).slice(0, 100),
    brideName: String(brideName).slice(0, 100),
    weddingDate: weddingDate ? String(weddingDate) : "",
    ceremonyTime: ceremonyTime ? String(ceremonyTime).slice(0, 60) : "",
    ceremonyVenue: sanitizeVenue(ceremonyVenue),
    receptionTime: receptionTime ? String(receptionTime).slice(0, 60) : "",
    receptionVenue: sanitizeVenue(receptionVenue),
    story: story ? String(story).slice(0, 4000) : "",
    groomParents: sanitizeParentsLine(groomParents),
    brideParents: sanitizeParentsLine(brideParents),
    accentColor: sanitizeAccentColor(accentColor),
    fontPairing: fontPairing ? String(fontPairing) : "classic-serif",
    photos: sanitizePhotos(photos),
    backgroundMusic: sanitizeBackgroundMusic(backgroundMusic),
    sections: sanitizeSections(sections),
    faq: sanitizeFaq(faq),
    travel: sanitizeTravel(travel),
    places: sanitizePlaces(places),
    monogram: sanitizeMonogram(monogram),
    ...(Array.isArray(brideFamily) ? { brideFamily: sanitizeFamily(brideFamily) } : {}),
    ...(Array.isArray(groomFamily) ? { groomFamily: sanitizeFamily(groomFamily) } : {}),
    ...(sanitizeContentLocale(contentLocale) ? { contentLocale: sanitizeContentLocale(contentLocale) } : {}),
    status: "pending_payment",
    slug: null,
    viewCount: existing.exists ? (existing.data()?.viewCount ?? 0) : 0,
    createdAt: existing.exists ? (existing.data()?.createdAt ?? now) : now,
    updatedAt: now,
  });
  // Kept in the private subcollection (never client-readable), not on the
  // draft itself — the draft's fields are copied onto the public
  // invitation when it's published.
  await ref
    .collection("private")
    .doc("owner")
    .set({ phone: `+${phoneDigits}`, locale: ownerLocale === "ta" ? "ta" : "en" });

  return NextResponse.json({ ok: true, draftId });
}
