import { NextRequest, NextResponse } from "next/server";
import { searchVenue } from "@/lib/geo";
import { tooMany } from "@/lib/rateLimit";

export const runtime = "nodejs";

/** GET /api/geo/search?q=<venue>&locale=en|ta — up to six map matches for
 * a venue, from OpenStreetMap (lib/geo.ts). Called on an explicit Search,
 * never per keystroke. */
export async function GET(req: NextRequest) {
  // Protects the shared OpenStreetMap allowance (lib/geo.ts).
  const limited = tooMany(req, "geo-search", 30, 10 * 60 * 1000);
  if (limited) return limited;

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const locale = req.nextUrl.searchParams.get("locale") === "ta" ? "ta" : "en";
  try {
    const results = await searchVenue(q, locale);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch (err) {
    console.error("geo search", err);
    return NextResponse.json({ error: "Map search is busy — try again in a moment." }, { status: 503 });
  }
}
