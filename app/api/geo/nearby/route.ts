import { NextRequest, NextResponse } from "next/server";
import { nearby } from "@/lib/geo";

export const runtime = "nodejs";

/** GET /api/geo/nearby?lat=&lng=&locale=en|ta — the venue's city, nearest
 * airports and railway stations, and sights nearby (lib/geo.ts), for
 * pre-filling the Travel Guide and Places to Explore. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Bad coordinates." }, { status: 400 });
  }
  const locale = sp.get("locale") === "ta" ? "ta" : "en";
  const result = await nearby({ lat, lng }, locale);
  return NextResponse.json(result, { headers: { "Cache-Control": "public, max-age=86400" } });
}
