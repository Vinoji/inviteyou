import { NextRequest, NextResponse } from "next/server";
import { requireEditToken } from "@/lib/ownerAuth";
import { tooMany } from "@/lib/rateLimit";
import { videoStatus } from "@/lib/video";

/** GET ?slug=&token= — the owner's WhatsApp video: none, queued, rendering,
 * ready (with a download link, valid an hour) or failed. */
export async function GET(req: NextRequest) {
  const limited = tooMany(req, "video-status", 240, 60 * 60 * 1000);
  if (limited) return limited;
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const check = await requireEditToken(slug, req.nextUrl.searchParams.get("token"));
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
  const res = NextResponse.json(await videoStatus(check.meta, slug));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
