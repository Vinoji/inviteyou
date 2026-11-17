import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAdminAccessToken, getAdminApp, getAdminDb, getAdminProjectId } from "./firebase-admin";
import { getTemplateConfig } from "./templates";
import { getCategoryConfig } from "./categories";
import { MUSIC_LIBRARY, forCategory } from "./mediaLibrary";
import type { OrderNotes } from "./payments";

/**
 * The ₹99 WhatsApp video: an owner pays (video/order → Razorpay →
 * video/verify, or the webhook), which starts the Cloud Run job
 * "invite-video" (render/job.mjs). The job records the live invitation,
 * uploads the MP4 to Storage and reports on meta.video:
 *   queued → rendering → ready (path) | failed (error)
 * The owner's page polls video/status, which hands back a download link.
 */
export const VIDEO_PRICE_PAISE = 9900;
export const VIDEO_PRICE_INR = VIDEO_PRICE_PAISE / 100;
const REGION = "asia-south1";
const JOB = "invite-video";
const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vinoji-291fa.firebasestorage.app";
/** A job that hasn't reported back in this long is started again (status). */
const STALE_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 3;

export type VideoStatus = "none" | "queued" | "rendering" | "ready" | "failed";

export interface VideoState {
  status: VideoStatus;
  paymentId?: string;
  orderId?: string;
  path?: string;
  attempts?: number;
  startedAt?: number;
  queuedAt?: number;
  error?: string | null;
}

export function isVideoOrder(order: { amount: number; notes: OrderNotes }, slug?: string) {
  return (
    order.amount === VIDEO_PRICE_PAISE &&
    order.notes.purpose === "video" &&
    typeof order.notes.slug === "string" &&
    (slug === undefined || order.notes.slug === slug)
  );
}

/**
 * Records a paid video and starts the job. Idempotent: the same payment
 * (the browser and the webhook both arrive) starts it once.
 */
export async function applyVideoPayment(slug: string, orderId: string, paymentId: string) {
  const db = getAdminDb();
  const metaRef = db.collection("invitations").doc(slug).collection("private").doc("meta");
  const started = await db.runTransaction(async (tx) => {
    const snap = await tx.get(metaRef);
    if (!snap.exists) return null;
    const used = (snap.data()?.videoPayments ?? []) as { paymentId: string }[];
    if (used.some((p) => p.paymentId === paymentId)) return false;
    tx.update(metaRef, {
      videoPayments: FieldValue.arrayUnion({ paymentId, orderId, at: Date.now() }),
      video: { status: "queued", paymentId, orderId, queuedAt: Date.now(), attempts: 0, error: null } satisfies VideoState,
    });
    return true;
  });
  if (started === null) return { found: false };
  if (started) await startVideoJob(slug).catch((err) => console.error("[video] start failed", slug, err));
  return { found: true };
}

/** What the job needs to know: the music and the names and date on its end card. */
async function jobArgs(slug: string, paymentId: string): Promise<string[]> {
  const inv = (await getAdminDb().collection("invitations").doc(slug).get()).data() ?? {};
  const category = getCategoryConfig(getTemplateConfig(inv.templateId).category);
  const names = category.singlePerson ? inv.brideName : [inv.groomName, inv.brideName].filter(Boolean).join(" & ");
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(inv.weddingDate ?? "");
  const date = m
    ? new Intl.DateTimeFormat(inv.contentLocale === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
        Date.UTC(+m[1], +m[2] - 1, +m[3])
      )
    : "";
  const music = inv.backgroundMusic || forCategory(MUSIC_LIBRARY, category.id).suggested[0]?.src || "";
  return ["--slug", slug, "--payment", paymentId, "--music", music, "--names", names ?? "", "--date", date];
}

/** Starts the Cloud Run job for this invitation's paid video. */
export async function startVideoJob(slug: string) {
  const db = getAdminDb();
  const metaRef = db.collection("invitations").doc(slug).collection("private").doc("meta");
  const video = (await metaRef.get()).data()?.video as VideoState | undefined;
  if (!video?.paymentId) throw new Error("No paid video for this invitation.");
  const args = await jobArgs(slug, video.paymentId);
  const token = await getAdminAccessToken();
  const res = await fetch(`https://run.googleapis.com/v2/projects/${getAdminProjectId()}/locations/${REGION}/jobs/${JOB}:run`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ overrides: { containerOverrides: [{ args }] } }),
  });
  if (!res.ok) throw new Error(`Cloud Run ${res.status}: ${(await res.text()).slice(0, 300)}`);
  await metaRef.update({ "video.status": "queued", "video.queuedAt": Date.now(), "video.attempts": FieldValue.increment(1) });
}

/** The owner's view of their video, with a download link once it's ready.
 * A job that failed or went quiet is started again, up to MAX_ATTEMPTS. */
export async function videoStatus(meta: Record<string, unknown>, slug: string) {
  const video = meta.video as VideoState | undefined;
  if (!video?.paymentId) return { status: "none" as const, priceInr: VIDEO_PRICE_INR };
  if (video.status === "ready" && video.path) {
    const [url] = await getStorage(getAdminApp())
      .bucket(BUCKET)
      .file(video.path)
      .getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000,
        responseDisposition: `attachment; filename="invitation-${slug}.mp4"`,
      });
    return { status: "ready" as const, url };
  }
  const since = video.startedAt ?? video.queuedAt ?? 0;
  const stuck = video.status === "failed" || Date.now() - since > STALE_MS;
  if (stuck && (video.attempts ?? 0) < MAX_ATTEMPTS) {
    await startVideoJob(slug).catch((err) => console.error("[video] restart failed", slug, err));
    return { status: "queued" as const };
  }
  return { status: video.status, failed: stuck };
}
