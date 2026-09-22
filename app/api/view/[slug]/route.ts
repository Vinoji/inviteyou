import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, FieldValue } from "@/lib/firebase-admin";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ip = getClientIp(req.headers);

  // One counted view per IP per slug per 30 minutes — a reasonable
  // best-effort guard against refresh spam without any auth system.
  const { ok } = rateLimit(`view:${slug}:${ip}`, {
    limit: 1,
    windowMs: 30 * 60 * 1000,
  });
  if (!ok) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const db = getAdminDb();
  const ref = db.collection("invitations").doc(slug);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.status !== "published") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await ref.update({ viewCount: FieldValue.increment(1) });
  return NextResponse.json({ ok: true });
}
