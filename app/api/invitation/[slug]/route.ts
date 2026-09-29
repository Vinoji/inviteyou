import { NextRequest, NextResponse } from "next/server";
import { requireEditToken } from "@/lib/ownerAuth";
import { expiresAt, isExpired } from "@/lib/expiry";
import { earliestAllowedOnServer, isDateAllowed } from "@/lib/dates";
import { TEMPLATE_IDS, getTemplateConfig } from "@/lib/templates";
import { getCategoryConfig } from "@/lib/categories";
import { withDefaultSections, EMPTY_TRAVEL, EMPTY_MONOGRAM } from "@/lib/types";
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
  sanitizeFontPairing,
} from "@/lib/sanitize";

/** Fetches a published invitation's data for the edit form, gated by token. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const check = await requireEditToken(slug, token);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const snap = await check.db.collection("invitations").doc(slug).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }
  const data = snap.data()!;
  // Docs published before section toggles existed won't have this field —
  // fill it in so the edit form always gets a fully-shaped object.
  return NextResponse.json({
    invitation: {
      ...data,
      sections: withDefaultSections(data.sections),
      faq: data.faq ?? [],
      travel: data.travel ?? EMPTY_TRAVEL,
      places: data.places ?? [],
      monogram: data.monogram ?? EMPTY_MONOGRAM,
    },
    // For the editor's "expired — restore for ₹50" banner.
    expiry: { expiresAt: expiresAt(data), expired: isExpired(data) },
  });
}

/** Updates a published invitation. Editing is always free — no re-charge. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  const check = await requireEditToken(slug, body?.token);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const {
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
  } = body ?? {};

  if (typeof templateId !== "string" || !TEMPLATE_IDS.includes(templateId)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
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

  // A date can't be moved into the past, but an invitation whose (past)
  // date is left unchanged can still be edited after the event.
  const current = await check.db.collection("invitations").doc(slug).get();
  if (
    !isDateAllowed(String(weddingDate ?? ""), {
      allowPast: category.allowPastDate,
      earliest: earliestAllowedOnServer(),
      saved: current.data()?.weddingDate,
    })
  ) {
    return NextResponse.json({ error: "Please choose today or a future date." }, { status: 400 });
  }

  await check.db
    .collection("invitations")
    .doc(slug)
    .update({
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
      fontPairing: sanitizeFontPairing(fontPairing),
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
      updatedAt: Date.now(),
    });

  return NextResponse.json({ ok: true });
}
