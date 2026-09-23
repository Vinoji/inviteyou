import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Users, Check, X as XIcon, MessageSquare } from "lucide-react";
import { getAdminDb } from "@/lib/firebase-admin";
import { getTemplate } from "@/lib/templates";
import { getCategory, formatOccasionTitle } from "@/lib/categories";
import type { InvitationData, RsvpEntry } from "@/lib/types";

// Token-gated, not linked from anywhere public — keep it out of search
// results as defense in depth on top of the token check itself.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Validates the edit token the same way /api/invitation/[slug] does (same
 * private/meta.editToken check), then loads every RSVP — not just the
 * curated "accepted + has a message" subset the public Blessings Wall
 * shows. This is the only place the owner can see the full guest list,
 * including declines and messageless RSVPs.
 */
async function getGuestList(slug: string, token: string | undefined) {
  if (!token) return null;
  const db = getAdminDb();
  const metaSnap = await db
    .collection("invitations")
    .doc(slug)
    .collection("private")
    .doc("meta")
    .get();
  if (!metaSnap.exists || metaSnap.data()?.editToken !== token) return null;

  const invSnap = await db.collection("invitations").doc(slug).get();
  if (!invSnap.exists) return null;

  const rsvpsSnap = await db
    .collection("invitations")
    .doc(slug)
    .collection("rsvps")
    .orderBy("createdAt", "desc")
    .get();

  return {
    data: invSnap.data() as InvitationData,
    rsvps: rsvpsSnap.docs.map((d) => d.data() as RsvpEntry),
  };
}

function StatCard({
  label,
  value,
  accentColor,
  icon,
}: {
  label: string;
  value: string | number;
  accentColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center gap-2" style={{ color: accentColor }}>
        {icon}
        <span className="text-xs font-semibold tracking-widest uppercase">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

export default async function RsvpsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;
  const result = await getGuestList(slug, token);
  if (!result) notFound();
  const { data, rsvps } = result;

  const template = getTemplate(data.templateId);
  const category = getCategory(template.category);
  const occasionTitle = formatOccasionTitle(category, data.brideName, data.groomName);

  const attending = rsvps.filter((r) => r.attending);
  const declined = rsvps.filter((r) => !r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0);

  const SIDE_LABEL: Record<string, string> = {
    bride: `${data.brideName || "Their"}'s side`,
    groom: `${data.groomName || "Their"}'s side`,
    friend: "Friend of both",
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
        Private guest list
      </p>
      <h1 className="mt-1 font-serif text-2xl font-bold text-neutral-900 sm:text-3xl">
        {occasionTitle}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Only visible to whoever holds this link — guests never see this page.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Responses"
          value={rsvps.length}
          accentColor={data.accentColor}
          icon={<Users size={16} aria-hidden />}
        />
        <StatCard
          label="Attending"
          value={`${attending.length} (${totalGuests} ${totalGuests === 1 ? "guest" : "guests"})`}
          accentColor={data.accentColor}
          icon={<Check size={16} aria-hidden />}
        />
        <StatCard
          label="Can't make it"
          value={declined.length}
          accentColor={data.accentColor}
          icon={<XIcon size={16} aria-hidden />}
        />
      </div>

      <div className="mt-10 space-y-3">
        {rsvps.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 p-10 text-center text-sm text-neutral-400">
            No RSVPs yet — once you share your invitation link, responses
            will show up here.
          </p>
        ) : (
          rsvps.map((r, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-neutral-900">{r.guestName}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.attending
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {r.attending ? "Attending" : "Can't make it"}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                {r.guestCount} {r.guestCount === 1 ? "guest" : "guests"}
                {r.side && ` · ${SIDE_LABEL[r.side] ?? r.side}`}
                {" · "}
                {new Date(r.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {r.message && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-neutral-700">
                  <MessageSquare size={14} className="mt-0.5 shrink-0 opacity-40" aria-hidden />
                  {r.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <Link
        href={`/create/${data.templateId}?edit=${slug}&token=${token}`}
        className="mt-10 inline-block text-sm font-semibold underline underline-offset-4"
        style={{ color: data.accentColor }}
      >
        ← Back to edit your invitation
      </Link>
    </main>
  );
}
