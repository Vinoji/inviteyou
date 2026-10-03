import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, getFormatter, setRequestLocale } from "next-intl/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { NextIntlClientProvider } from "next-intl";
import InvitationView from "@/components/invite/InvitationView";
import InspectGuard from "@/components/invite/InspectGuard";
import { INVITATION_NAMESPACES, getContentMessages } from "@/lib/i18n/contentMessages";
import ViewTracker from "@/components/invite/ViewTracker";
import OwnerAccess from "@/components/invite/OwnerAccess";
import { cleanGreeting } from "@/lib/share";
import type { InvitationDoc, RsvpEntry, GuestPhoto } from "@/lib/types";
import { expiresAt, isExpired } from "@/lib/expiry";
import ExpiredInvite from "@/components/invite/ExpiredInvite";
import { getTemplateConfig } from "@/lib/templates";
import { getCategoryMeta, formatOccasionTitle } from "@/lib/i18n/categories";

async function getInvitation(slug: string) {
  const db = getAdminDb();
  const snap = await db.collection("invitations").doc(slug).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  if (data.status !== "published") return null;
  return data as InvitationDoc;
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
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: routeLocale, slug } = await params;
  const data = await getInvitation(slug);
  // Shared-link previews should read in the invitation's own language.
  const locale = data?.contentLocale ?? routeLocale;
  const tInvitePage = await getTranslations({ locale, namespace: "invitePage" });
  if (!data) return { title: tInvitePage("notFoundTitle") };

  const tCategories = await getTranslations({ locale, namespace: "categories" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const category = getCategoryMeta(getTemplateConfig(data.templateId).category, tCategories, data.templateId);
  const title = formatOccasionTitle(category, data.brideName, data.groomName, tCommon);
  // Ended invitations drop out of search results.
  if (isExpired(data)) {
    return { title: tInvitePage("expiredTitle"), robots: { index: false, follow: false } };
  }

  const format = await getFormatter({ locale });
  const description = data.weddingDate
    ? tInvitePage("joinUsWithDate", {
        title,
        date: format.dateTime(new Date(data.weddingDate), {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      })
    : tInvitePage("joinUs", { title });

  return {
    title,
    description,
    // A couple's names, dates and venues: shareable, never searchable.
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{
    welcome?: string;
    editToken?: string;
    templateId?: string;
    to?: string;
    sent?: string;
  }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { welcome, editToken, templateId, to, sent } = await searchParams;
  const data = await getInvitation(slug);
  if (!data) notFound();
  // Guests always see the invitation in the couple's chosen language,
  // whatever language this page (and the owner's banner) is in.
  const contentLocale = data.contentLocale ?? (locale === "ta" ? "ta" : "en");

  if (isExpired(data)) {
    const tCategories = await getTranslations({ locale: contentLocale, namespace: "categories" });
    const tCommon = await getTranslations({ locale: contentLocale, namespace: "common" });
    const category = getCategoryMeta(getTemplateConfig(data.templateId).category, tCategories, data.templateId);
    const expiredMessages = await getContentMessages(contentLocale, ["invitePage"]);
    return (
      <NextIntlClientProvider locale={contentLocale} messages={expiredMessages}>
        <div lang={contentLocale}>
          <ExpiredInvite
            title={formatOccasionTitle(category, data.brideName, data.groomName, tCommon)}
            // Non-null: an invitation can only be expired if it has an expiry.
            endedAt={expiresAt(data) ?? 0}
            accentColor={data.accentColor}
          />
        </div>
      </NextIntlClientProvider>
    );
  }
  const [rsvpMessages, guestPhotos, contentMessages] = await Promise.all([
    getBlessings(slug),
    getGuestPhotos(slug),
    getContentMessages(contentLocale, INVITATION_NAMESPACES),
  ]);

  return (
    <>
      <OwnerAccess
        slug={slug}
        accentColor={data.accentColor}
        editToken={editToken}
        templateId={templateId}
        welcome={welcome === "1"}
        sent={sent === "whatsapp" || sent === "sms" ? sent : null}
      />
      <ViewTracker slug={slug} />
      <InspectGuard />
      <NextIntlClientProvider locale={contentLocale} messages={contentMessages}>
        <div lang={contentLocale}>
          <InvitationView
            data={data}
            slug={slug}
            mode="public"
            rsvpMessages={rsvpMessages}
            guestPhotos={guestPhotos}
            guestGreeting={cleanGreeting(to)}
          />
        </div>
      </NextIntlClientProvider>
    </>
  );
}
