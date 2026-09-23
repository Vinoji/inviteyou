import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase-admin";
import InvitationView from "@/components/invite/InvitationView";
import ViewTracker from "@/components/invite/ViewTracker";
import WelcomeBanner from "@/components/invite/WelcomeBanner";
import type { InvitationData, RsvpEntry, GuestPhoto } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { getCategory, formatOccasionTitle } from "@/lib/categories";

async function getInvitation(slug: string) {
  const db = getAdminDb();
  const snap = await db.collection("invitations").doc(slug).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  if (data.status !== "published") return null;
  return data as InvitationData;
}

/**
 * The most recent accepted RSVPs that left a message, for the public
 * "Blessings & Wishes" wall. Deliberately a single orderBy with no extra
 * equality filter (filtering happens in JS instead) so this never needs a
 * Firestore composite index — RSVP volumes here are small enough that
 * over-fetching and filtering in memory is the simpler, more robust choice.
 */
async function getBlessings(slug: string): Promise<RsvpEntry[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("invitations")
    .doc(slug)
    .collection("rsvps")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return snap.docs
    .map((d) => d.data() as RsvpEntry)
    .filter((r) => r.attending && r.message && r.message.trim().length > 0)
    .slice(0, 12);
}

/** Newest first, capped — this is a display list, not an archive. */
async function getGuestPhotos(slug: string): Promise<GuestPhoto[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("invitations")
    .doc(slug)
    .collection("guestPhotos")
    .orderBy("createdAt", "desc")
    .limit(40)
    .get();
  return snap.docs.map((d) => d.data() as GuestPhoto);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getInvitation(slug);
  if (!data) return { title: "Invitation not found" };

  const category = getCategory(getTemplate(data.templateId).category);
  const title = formatOccasionTitle(category, data.brideName, data.groomName);
  const description = data.weddingDate
    ? `Join us in celebrating — ${title} on ${new Date(data.weddingDate).toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "long", year: "numeric" }
      )}.`
    : `Join us in celebrating — ${title}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ welcome?: string; editToken?: string; templateId?: string }>;
}) {
  const { slug } = await params;
  const { welcome, editToken, templateId } = await searchParams;
  const data = await getInvitation(slug);
  if (!data) notFound();
  const [rsvpMessages, guestPhotos] = await Promise.all([
    getBlessings(slug),
    getGuestPhotos(slug),
  ]);

  return (
    <>
      {welcome === "1" && editToken && templateId && (
        <WelcomeBanner
          slug={slug}
          templateId={templateId}
          editToken={editToken}
          accentColor={data.accentColor}
        />
      )}
      <ViewTracker slug={slug} />
      <InvitationView
        data={data}
        slug={slug}
        mode="public"
        rsvpMessages={rsvpMessages}
        guestPhotos={guestPhotos}
      />
    </>
  );
}
