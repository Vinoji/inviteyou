import { NextRequest, NextResponse } from "next/server";
import { TEMPLATE_IDS, getTemplateConfig } from "@/lib/templates";
import { getCategoryConfig } from "@/lib/categories";
import { isFreeTemplate } from "@/lib/pricing";
import { renderCardImage } from "@/lib/cardImage";
import { tooMany } from "@/lib/rateLimit";
import { recordFreeCardMaker } from "@/lib/stats";
import {
  sanitizeAccentColor,
  sanitizeContentLocale,
  sanitizeFamily,
  sanitizeFontPairing,
  sanitizeMonogram,
  sanitizeParentsLine,
  sanitizeSections,
  sanitizeVenue,
} from "@/lib/sanitize";
import type { InvitationData } from "@/lib/types";

export const runtime = "nodejs";

/**
 * POST /api/card — the free designs' download: the invitation card as a
 * PNG, drawn from the editor's current details (nothing is saved), with a
 * small "Made with InviteForYou" line where a published card has its QR
 * code. Only for designs marked free; the rest are published (paid).
 */
export async function POST(req: NextRequest) {
  const limited = tooMany(req, "card", 30, 60 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const templateId = typeof body?.templateId === "string" ? body.templateId : "";
  if (!TEMPLATE_IDS.includes(templateId)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }
  if (!isFreeTemplate(templateId)) {
    return NextResponse.json({ error: "This design is published, not downloaded." }, { status: 403 });
  }
  const category = getCategoryConfig(getTemplateConfig(templateId).category);
  const brideName = String(body?.brideName ?? "").slice(0, 100).trim();
  const groomName = String(body?.groomName ?? "").slice(0, 100).trim();
  if (!brideName || (!category.singlePerson && !groomName)) {
    return NextResponse.json({ error: "Please fill in the name field(s)." }, { status: 400 });
  }

  const contentLocale = sanitizeContentLocale(body?.contentLocale) ?? "en";
  const data = {
    templateId,
    brideName,
    groomName,
    weddingDate: typeof body?.weddingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.weddingDate) ? body.weddingDate : "",
    ceremonyTime: String(body?.ceremonyTime ?? "").slice(0, 60),
    ceremonyVenue: sanitizeVenue(body?.ceremonyVenue),
    receptionTime: String(body?.receptionTime ?? "").slice(0, 60),
    receptionVenue: sanitizeVenue(body?.receptionVenue),
    groomParents: sanitizeParentsLine(body?.groomParents),
    brideParents: sanitizeParentsLine(body?.brideParents),
    ...(Array.isArray(body?.brideFamily) ? { brideFamily: sanitizeFamily(body.brideFamily) } : {}),
    ...(Array.isArray(body?.groomFamily) ? { groomFamily: sanitizeFamily(body.groomFamily) } : {}),
    accentColor: sanitizeAccentColor(body?.accentColor),
    fontPairing: sanitizeFontPairing(body?.fontPairing),
    monogram: sanitizeMonogram(body?.monogram),
    sections: sanitizeSections(body?.sections),
    contentLocale,
  } as unknown as InvitationData;

  const image = await renderCardImage({ data, locale: contentLocale, width: 1500 });
  // Funnel: one count per device's first free card (the editor says so).
  if (body?.firstCard === true) await recordFreeCardMaker();
  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Disposition", 'attachment; filename="invitation-card.png"');
  return new Response(image.body, { status: 200, headers });
}
