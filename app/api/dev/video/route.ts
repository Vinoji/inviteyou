import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireEditToken } from "@/lib/ownerAuth";
import { applyVideoPayment, type VideoState } from "@/lib/video";

/**
 * DEVELOPMENT ONLY (404 in production): drives the video purchase through
 * every state without paying, for /dev/payments.
 *   paid    — as if a ₹99 payment were confirmed: records it, starts a real render
 *   replay  — the same payment arrives again (webhook after the browser): must do nothing
 *   fail    — the render reports failure (status then retries it)
 *   stall   — the render went quiet 20 min ago (status then restarts it)
 *   reset   — no video bought
 *   show    — just the current state
 * Owner only (edit token), like the real routes.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") return new NextResponse(null, { status: 404 });
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const check = await requireEditToken(slug, body?.token);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
  const { metaRef } = check;
  const video = check.meta.video as VideoState | undefined;
  let note = "";

  switch (body?.action) {
    case "paid": {
      const stamp = Date.now().toString(36);
      await applyVideoPayment(slug, `test_order_${stamp}`, `test_pay_${stamp}`, { amountPaise: 0, test: true });
      note = "Recorded a test payment and started the render.";
      break;
    }
    case "replay": {
      if (!video?.paymentId) return NextResponse.json({ error: "Nothing paid yet — use “paid” first." }, { status: 409 });
      const before = (await metaRef.get()).data()?.video?.queuedAt;
      await applyVideoPayment(slug, video.orderId ?? "", video.paymentId);
      const after = (await metaRef.get()).data()?.video?.queuedAt;
      note = before === after ? "OK: the same payment again changed nothing." : "PROBLEM: the replay started the render again.";
      break;
    }
    case "fail":
      await metaRef.update({ "video.status": "failed", "video.error": "Simulated failure (dev)", "video.failedAt": Date.now() });
      note = "Marked as failed — the owner's page (status) will retry it.";
      break;
    case "stall":
      await metaRef.update({ "video.status": "queued", "video.queuedAt": Date.now() - 20 * 60 * 1000, "video.startedAt": FieldValue.delete() });
      note = "Marked as stuck for 20 min — the owner's page (status) will restart it.";
      break;
    case "reset":
      await metaRef.update({ video: FieldValue.delete(), videoPayments: FieldValue.delete() });
      note = "Cleared — no video bought.";
      break;
    case "show":
      break;
    default:
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
  const meta = (await metaRef.get()).data() ?? {};
  return NextResponse.json({ note, video: meta.video ?? null, payments: meta.videoPayments ?? [] });
}
