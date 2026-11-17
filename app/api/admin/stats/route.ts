import { NextRequest, NextResponse } from "next/server";
import { AggregateField } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;
/** India's day boundaries (UTC+5:30). */
const istDay = (t: number) => new Date(t + 5.5 * 3_600_000).toISOString().slice(0, 10);

interface Payment {
  purpose?: string;
  slug?: string;
  at?: number;
  amountPaise?: number;
  templateId?: string;
  coupon?: string;
  fromFreeCard?: boolean;
  devPrice?: boolean;
}

/**
 * GET — the business numbers for /admin, admins only. Read straight from
 * Firestore: sales and revenue (the payments ledger: publish, restore,
 * video — tests excluded), invitations, drafts left unpaid, free cards,
 * guest opens and RSVPs, per-design sales, the last 30 days by day, and
 * the latest sales.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return NextResponse.json({ error: "Not allowed." }, { status: admin.status });
  const db = getAdminDb();

  const [paymentsSnap, published, drafts, opens, rsvps, funnel] = await Promise.all([
    db.collection("payments").get(),
    db.collection("invitations").where("status", "==", "published").count().get(),
    db.collection("invitations").where("status", "==", "pending_payment").count().get(),
    db.collection("invitations").aggregate({ opens: AggregateField.sum("viewCount") }).get(),
    db.collectionGroup("rsvps").count().get(),
    db.collection("stats").doc("funnel").get(),
  ]);

  const now = Date.now();
  const all = paymentsSnap.docs.map((d) => d.data() as Payment);
  const real = all.filter((p) => !p.devPrice);
  const tests = all.length - real.length;
  const inr = (ps: Payment[]) => Math.round(ps.reduce((s, p) => s + (p.amountPaise ?? 0), 0) / 100);
  const within = (ms: number) => real.filter((p) => (p.at ?? 0) >= now - ms);
  const byPurpose = (ps: Payment[]) =>
    Object.fromEntries(["publish", "video", "restore"].map((k) => [k, { count: ps.filter((p) => (p.purpose ?? "publish") === k).length, inr: inr(ps.filter((p) => (p.purpose ?? "publish") === k)) }]));

  const days: { day: string; sales: number; inr: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = istDay(now - i * DAY);
    const ps = real.filter((p) => istDay(p.at ?? 0) === day);
    days.push({ day, sales: ps.length, inr: inr(ps) });
  }

  const designs = new Map<string, { sales: number; inr: number }>();
  for (const p of real.filter((x) => (x.purpose ?? "publish") === "publish")) {
    const d = designs.get(p.templateId ?? "?") ?? { sales: 0, inr: 0 };
    d.sales += 1;
    d.inr += Math.round((p.amountPaise ?? 0) / 100);
    designs.set(p.templateId ?? "?", d);
  }

  const latest = real
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0))
    .slice(0, 15)
    .map((p) => ({ at: p.at, purpose: p.purpose ?? "publish", slug: p.slug, templateId: p.templateId, inr: Math.round((p.amountPaise ?? 0) / 100), coupon: p.coupon ?? null }));

  const publishes = real.filter((p) => (p.purpose ?? "publish") === "publish");
  const freeCardMakers = Number(funnel.data()?.freeCardMakers ?? 0);
  return NextResponse.json({
    admin: admin.email,
    revenue: { all: inr(real), d30: inr(within(30 * DAY)), d7: inr(within(7 * DAY)), today: inr(real.filter((p) => istDay(p.at ?? 0) === istDay(now))) },
    sales: { all: real.length, d30: within(30 * DAY).length, d7: within(7 * DAY).length, byPurpose: byPurpose(real), tests },
    invitations: { published: published.data().count, unpaidDrafts: drafts.data().count, guestOpens: Number(opens.data().opens ?? 0), rsvps: rsvps.data().count },
    funnel: {
      freeCardMakers,
      paidAfterFreeCard: publishes.filter((p) => p.fromFreeCard).length,
      withCoupon: publishes.filter((p) => p.coupon).length,
    },
    days,
    designs: [...designs.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.sales - a.sales).slice(0, 15),
    latest,
  });
}
