import "server-only";
import { getAdminDb } from "./firebase-admin";
import { getTemplateConfig } from "./templates";
import type { InvitationData } from "./types";
import { parseIsoDate } from "./calendar";

/**
 * Reviews from couples who published an invitation — real customers only:
 * written from the owner's private guest-list page (edit token required),
 * one per invitation (reviews/{slug}), and shown on the home page only
 * after someone sets `approved: true` on the document in the Firebase
 * console. Editing a review sends it back for approval.
 */
export interface Review {
  slug: string;
  rating: number;
  comment: string;
  /** "Priya & Arjun" — empty when the couple chose not to show names. */
  names: string;
  /** Occasion category id, e.g. "wedding". */
  occasion: string;
  /** The design reviewed — for per-design ratings on the cards. */
  templateId?: string;
  city: string;
  approved: boolean;
  createdAt: number;
  updatedAt: number;
}

export const REVIEW_MAX = 400;

const first = (name: string | undefined) => (name ?? "").trim().split(/\s+/)[0] ?? "";

/** Names and place come from the invitation itself, never from the form. */
export function reviewIdentity(data: InvitationData, showNames: boolean) {
  const occasion = getTemplateConfig(data.templateId).category;
  const names = showNames ? [first(data.brideName), first(data.groomName)].filter(Boolean).join(" & ") : "";
  return { names, occasion, templateId: data.templateId, city: (data.travel?.city ?? "").trim().slice(0, 40) };
}

export function cleanComment(v: unknown): string {
  return typeof v === "string"
    ? v
        .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
        .trim()
        .slice(0, REVIEW_MAX)
    : "";
}

export async function getReview(slug: string): Promise<Review | null> {
  const snap = await getAdminDb().collection("reviews").doc(slug).get();
  return snap.exists ? (snap.data() as Review) : null;
}

/** Approved reviews, newest first. Equality-only query: no index needed. */
export async function getApprovedReviews(limit = 6): Promise<Review[]> {
  try {
    const snap = await getAdminDb().collection("reviews").where("approved", "==", true).limit(50).get();
    return snap.docs
      .map((d) => d.data() as Review)
      .filter((r) => r.comment && r.rating >= 1)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  } catch (err) {
    console.error("[reviews] load failed", err);
    return [];
  }
}

/** The event's day has begun (so the review prompt asks how it went). */
export function eventHasPassed(iso: string | undefined, now = Date.now()): boolean {
  const day = parseIsoDate(iso ?? "");
  return Boolean(day && day.getTime() < now);
}
