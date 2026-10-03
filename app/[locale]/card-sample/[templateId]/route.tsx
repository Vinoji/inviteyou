import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { renderCardImage } from "@/lib/cardImage";
import { TEMPLATE_IDS } from "@/lib/templates";
import { getDefaultInvitationData } from "@/lib/i18n/defaultContent";

export const runtime = "nodejs";

/**
 * GET /card-sample/<templateId> — a template's printable card filled with
 * its sample couple, so the card design can be seen before publishing.
 * ?w=<px> as for /invite/<slug>/card/image.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; templateId: string }> }
) {
  const { locale: routeLocale, templateId } = await params;
  if (!TEMPLATE_IDS.includes(templateId)) {
    return NextResponse.json({ error: "Unknown template." }, { status: 404 });
  }
  const locale = routeLocale === "ta" ? "ta" : "en";
  const tDefaults = await getTranslations({ locale, namespace: "defaultContent" });
  const data = { ...getDefaultInvitationData(templateId, tDefaults), contentLocale: locale } as const;
  const width = Math.min(1800, Math.max(600, Number(req.nextUrl.searchParams.get("w")) || 900));
  const image = await renderCardImage({ data, locale, inviteUrl: `${req.nextUrl.origin}/`, width, watermark: true });
  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "public, max-age=3600");
  return new Response(image.body, { status: 200, headers });
}
