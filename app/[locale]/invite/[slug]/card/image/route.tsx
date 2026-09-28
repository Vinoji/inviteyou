import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { renderCardImage } from "@/lib/cardImage";
import type { InvitationData } from "@/lib/types";

// Admin SDK + font fetching: Node runtime.
export const runtime = "nodejs";

/**
 * GET /invite/<slug>/card/image — the invitation card as a PNG.
 * ?w=<px> sets the width (600–1800, default 1200; 1748 ≈ A5 at 300dpi),
 * ?download=1 sends it as a file download.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale: routeLocale, slug } = await params;
  const snap = await getAdminDb().collection("invitations").doc(slug).get();
  const data = snap.exists ? (snap.data() as InvitationData & { status?: string }) : null;
  if (!data || data.status !== "published") {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }
  const locale = data.contentLocale ?? (routeLocale === "ta" ? "ta" : "en");
  const width = Math.min(1800, Math.max(600, Number(req.nextUrl.searchParams.get("w")) || 1200));
  const inviteUrl = `${req.nextUrl.origin}/invite/${slug}`;

  const image = await renderCardImage({ data, locale, inviteUrl, width });
  const headers = new Headers(image.headers);
  // Short cache: the couple can still edit the invitation.
  headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  if (req.nextUrl.searchParams.get("download")) {
    headers.set("Content-Disposition", `attachment; filename="${slug}-invitation-card.png"`);
  }
  return new Response(image.body, { status: 200, headers });
}
