import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { TEMPLATE_IDS } from "@/lib/templates";
import {
  sanitizeAccentColor,
  sanitizeBackgroundMusic,
  sanitizeParentsLine,
  sanitizePhotos,
  sanitizeVenue,
} from "@/lib/sanitize";

async function requireEditToken(slug: string, token: unknown) {
  if (typeof token !== "string" || !token) {
    return { ok: false as const, status: 403, error: "Missing edit token." };
  }
  const db = getAdminDb();
  const metaSnap = await db
    .collection("invitations")
    .doc(slug)
    .collection("private")
    .doc("meta")
    .get();
  if (!metaSnap.exists || metaSnap.data()?.editToken !== token) {
    return { ok: false as const, status: 403, error: "Invalid edit link." };
  }
  return { ok: true as const, db };
}

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
  return NextResponse.json({ invitation: snap.data() });
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
  } = body ?? {};

  if (typeof templateId !== "string" || !TEMPLATE_IDS.includes(templateId)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }
  if (!String(groomName ?? "").trim() || !String(brideName ?? "").trim()) {
    return NextResponse.json(
      { error: "Groom and bride names are required." },
      { status: 400 }
    );
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
      fontPairing: fontPairing ? String(fontPairing) : "classic-serif",
      photos: sanitizePhotos(photos),
      backgroundMusic: sanitizeBackgroundMusic(backgroundMusic),
      updatedAt: Date.now(),
    });

  return NextResponse.json({ ok: true });
}
