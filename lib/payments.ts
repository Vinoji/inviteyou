import "server-only";
import crypto from "crypto";
import type { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getTranslations } from "next-intl/server";
import { getAdminDb } from "./firebase-admin";
import { generateUniqueSlug } from "./slug";
import { getRazorpay } from "./razorpay";
import { minAcceptedPaise } from "./pricing";
import { RESTORE_PRICE_PAISE, expiresAt, restoredUntilAfterPayment } from "./expiry";
import { sendToOwner } from "./notify";
import { ownerLinks } from "./ownerLinks";

/**
 * What happens once a payment is confirmed. Two callers reach these for the
 * same payment: the browser (verify-payment / verify-restore, right after
 * checkout) and Razorpay's webhook (which still arrives if the buyer closed
 * the tab). Whichever comes first does the work and messages the owner; the
 * other finds it done and just reports the result.
 */

type OrderNotes = Record<string, unknown>;

/** Fetches the order from Razorpay so its amount and notes can be trusted. */
export async function fetchOrder(orderId: string) {
  const rz = getRazorpay();
  if (!rz) throw new Error("Payments are not configured on the server.");
  const order = await rz.instance.orders.fetch(orderId);
  return { amount: Number(order.amount), notes: (order.notes ?? {}) as OrderNotes };
}

/** An order made by create-order. Whether its amount covers the draft's
 * template is checked in publishPaidDraft, against the draft itself. */
export function isPublishOrder(order: { amount: number; notes: OrderNotes }, draftId?: string) {
  return (
    order.amount > 0 &&
    order.notes.purpose !== "restore" &&
    typeof order.notes.draftId === "string" &&
    (draftId === undefined || order.notes.draftId === draftId)
  );
}

export function isRestoreOrder(order: { amount: number; notes: OrderNotes }, slug?: string) {
  return (
    order.amount === RESTORE_PRICE_PAISE &&
    order.notes.purpose === "restore" &&
    typeof order.notes.slug === "string" &&
    (slug === undefined || order.notes.slug === slug)
  );
}

export type PublishResult =
  | { ok: true; slug: string; editToken: string; sent: string | null }
  | { ok: false; status: number; error: string };

/**
 * Publishes a paid draft: copies it to invitations/{slug}, stores the edit
 * token, deletes the draft, and records payments/{orderId} so a second call
 * for the same order returns the same invitation instead of failing.
 */
export async function publishPaidDraft(
  req: NextRequest,
  draftId: string,
  orderId: string,
  paymentId: string,
  paidPaise: number
): Promise<PublishResult> {
  const db = getAdminDb();
  const paymentRef = db.collection("payments").doc(orderId);
  const draftRef = db.collection("invitations").doc(draftId);
  const ownerRef = draftRef.collection("private").doc("owner");

  const existing = await paymentRef.get();
  if (!existing.exists) {
    const draftSnap = await draftRef.get();
    if (!draftSnap.exists) {
      return { ok: false, status: 404, error: "Draft not found or already published." };
    }
    const draft = draftSnap.data()!;
    // The amount must cover this draft's template (so a cheap template's
    // order can't publish a dearer one after switching designs).
    if (paidPaise < minAcceptedPaise(draft.templateId ?? "")) {
      return { ok: false, status: 400, error: "This payment doesn't cover this design's price." };
    }
    const slug = await generateUniqueSlug(draft.groomName ?? "", draft.brideName ?? "");
    const editToken = crypto.randomBytes(16).toString("hex");

    const published = await db.runTransaction(async (tx) => {
      const [paySnap, dSnap, oSnap] = await Promise.all([
        tx.get(paymentRef),
        tx.get(draftRef),
        tx.get(ownerRef),
      ]);
      // The other caller got here first.
      if (paySnap.exists || !dSnap.exists) return null;
      const d = dSnap.data()!;
      if (paidPaise < minAcceptedPaise(d.templateId ?? "")) return null;
      const owner = oSnap.exists ? oSnap.data()! : {};
      const now = Date.now();
      const publishedRef = db.collection("invitations").doc(slug);
      // create(), not set(): never overwrite another invitation that took
      // this slug between the check above and now.
      tx.create(publishedRef, {
        ...d,
        slug,
        status: "published",
        viewCount: 0,
        createdAt: d.createdAt ?? now,
        updatedAt: now,
      });
      tx.set(publishedRef.collection("private").doc("meta"), {
        editToken,
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        ...(owner.phone ? { ownerPhone: owner.phone, ownerLocale: owner.locale ?? "en" } : {}),
      });
      tx.set(paymentRef, { purpose: "publish", draftId, slug, paymentId, at: now });
      tx.delete(ownerRef);
      tx.delete(draftRef);
      return { draft: d, owner };
    });

    if (published) {
      // Send the owner their links. Published is published: a failed message
      // only means the popup offers the manual send buttons instead.
      let sent: string | null = null;
      const { draft: d, owner } = published;
      if (owner.phone) {
        const locale = owner.locale === "ta" ? "ta" : "en";
        const t = await getTranslations({ locale, namespace: "notify" });
        const links = ownerLinks(req, { slug, templateId: d.templateId, editToken, locale });
        const title = [d.brideName, d.groomName].filter(Boolean).join(" & ");
        const result = await sendToOwner(
          owner.phone,
          t("published", { title, inviteUrl: links.invite, editUrl: links.edit }),
          { sid: process.env.TWILIO_WHATSAPP_CONTENT_SID, vars: [title, links.edit] }
        );
        sent = result.sent;
      }
      return { ok: true, slug, editToken, sent };
    }
  }

  // Already published for this order — hand back the same invitation.
  const record = (await paymentRef.get()).data();
  if (!record?.slug || record.draftId !== draftId) {
    return { ok: false, status: 404, error: "Draft not found or already published." };
  }
  const meta = await db
    .collection("invitations")
    .doc(record.slug)
    .collection("private")
    .doc("meta")
    .get();
  return { ok: true, slug: record.slug, editToken: meta.data()?.editToken, sent: null };
}

/**
 * Extends an invitation by 30 days for one ₹50 restore payment. Each payment
 * id is recorded on the meta doc, so the same payment never extends it
 * twice. Messages the owner only on the call that applied it.
 */
export async function applyRestorePayment(
  req: NextRequest,
  slug: string,
  orderId: string,
  paymentId: string
): Promise<{ found: boolean; expiresAt: number | null }> {
  const db = getAdminDb();
  const invRef = db.collection("invitations").doc(slug);
  const metaRef = invRef.collection("private").doc("meta");

  const outcome = await db.runTransaction(async (tx) => {
    const [invSnap, metaSnap] = await Promise.all([tx.get(invRef), tx.get(metaRef)]);
    if (!invSnap.exists || !metaSnap.exists) return null;
    const inv = invSnap.data()!;
    const used = (metaSnap.data()?.restorePayments ?? []) as { paymentId: string }[];
    if (used.some((p) => p.paymentId === paymentId)) {
      return { until: expiresAt(inv), applied: false };
    }
    const next = restoredUntilAfterPayment(inv);
    tx.update(invRef, { restoredUntil: next, updatedAt: Date.now() });
    tx.update(metaRef, {
      restorePayments: FieldValue.arrayUnion({ paymentId, orderId, at: Date.now() }),
    });
    return { until: next, applied: true };
  });
  if (!outcome) return { found: false, expiresAt: null };

  // Let the owner know on their phone too (best-effort).
  const meta = (await metaRef.get()).data() ?? {};
  const ownerPhone = meta.ownerPhone as string | undefined;
  if (outcome.applied && ownerPhone && outcome.until) {
    const locale = meta.ownerLocale === "ta" ? "ta" : "en";
    const inv = (await invRef.get()).data() ?? {};
    const t = await getTranslations({ locale, namespace: "notify" });
    const links = ownerLinks(req, {
      slug,
      templateId: inv.templateId,
      editToken: meta.editToken,
      locale,
    });
    const title = [inv.brideName, inv.groomName].filter(Boolean).join(" & ");
    const date = new Intl.DateTimeFormat(locale === "ta" ? "ta-IN" : "en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(outcome.until);
    await sendToOwner(
      ownerPhone,
      t("restored", { title, inviteUrl: links.invite, date }),
      { sid: process.env.TWILIO_WHATSAPP_RESTORED_CONTENT_SID, vars: [title, links.invite] }
    );
  }

  return { found: true, expiresAt: outcome.until };
}
