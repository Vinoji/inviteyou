import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Users, Check, X as XIcon, MessageSquare } from "lucide-react";
import { getTranslations, getFormatter, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAdminDb } from "@/lib/firebase-admin";
import { getTemplateConfig } from "@/lib/templates";
import { getCategoryMeta, formatOccasionTitle } from "@/lib/i18n/categories";
import type { InvitationData, RsvpContact, RsvpEntry } from "@/lib/types";
import { parseIsoDate } from "@/lib/calendar";
import HostTools, { RemindButton } from "@/components/host/HostTools";
import { NAME_TOKEN, URL_TOKEN } from "@/lib/share";
import { buildWhatsAppMessage } from "@/lib/inviteMessage";

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

  const [rsvpsSnap, contactsSnap] = await Promise.all([
    db.collection("invitations").doc(slug).collection("rsvps").orderBy("createdAt", "desc").get(),
    db.collection("invitations").doc(slug).collection("rsvpContacts").get(),
  ]);
  const phones = new Map(
    contactsSnap.docs.map((d) => [d.id, (d.data() as RsvpContact).phone] as const)
  );

  return {
    data: invSnap.data() as InvitationData,
    rsvps: rsvpsSnap.docs.map((d) => ({ ...(d.data() as RsvpEntry), phone: phones.get(d.id) ?? "" })),
  };
}

/**
 * Share / personal-invite / reminder texts, worded in the invitation's own
 * language (that's what guests read), with URL and name tokens left for
 * HostTools to fill in the browser.
 */
async function buildHostMessages(data: InvitationData, templateCategory: string) {
  const locale = data.contentLocale ?? "en";
  const [t, tReminder, tCategories, tCommon, format] = await Promise.all([
    getTranslations({ locale, namespace: "invite.whatsapp" }),
    getTranslations({ locale, namespace: "invite.reminder" }),
    getTranslations({ locale, namespace: "categories" }),
    getTranslations({ locale, namespace: "common" }),
    getFormatter({ locale }),
  ]);
  const category = getCategoryMeta(templateCategory, tCategories);
  const title = formatOccasionTitle(category, data.brideName, data.groomName, tCommon);
  const day = parseIsoDate(data.weddingDate);
  const date = day
    ? format.dateTime(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";
  const events = [
    { label: category.eventALabel, time: data.ceremonyTime, venue: data.ceremonyVenue?.name ?? "" },
    ...(category.eventBLabel
      ? [{ label: category.eventBLabel, time: data.receptionTime, venue: data.receptionVenue?.name ?? "" }]
      : []),
  ];
  const hosts = category.singlePerson
    ? data.brideName
    : [data.brideName, data.groomName].filter(Boolean).join(" & ");
  const base = { title, date, events, url: URL_TOKEN, hosts };
  return {
    share: buildWhatsAppMessage(t, { ...base, kind: "invite" }),
    personal: buildWhatsAppMessage(t, { ...base, kind: "invite", guest: NAME_TOKEN }),
    reminder: buildWhatsAppMessage(t, { ...base, kind: "reminder", guest: NAME_TOKEN }),
    guestFallback: tReminder("guestFallback"),
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
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center gap-2" style={{ color: accentColor }}>
        {icon}
        <span className="text-xs font-semibold tracking-widest uppercase">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
    </div>
  );
}

export default async function RsvpsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;
  const result = await getGuestList(slug, token);
  if (!result) notFound();
  const { data, rsvps } = result;

  const t = await getTranslations("rsvpsPage");
  const tCategories = await getTranslations("categories");
  const tCommon = await getTranslations("common");
  const format = await getFormatter({ locale });
  const template = getTemplateConfig(data.templateId);
  const category = getCategoryMeta(template.category, tCategories);
  const occasionTitle = formatOccasionTitle(category, data.brideName, data.groomName, tCommon);
  const hostMessages = await buildHostMessages(data, template.category);

  const attending = rsvps.filter((r) => r.attending);
  const declined = rsvps.filter((r) => !r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0);

  const SIDE_LABEL: Record<string, string> = {
    bride: t("sideOf", { name: data.brideName || tCommon("friendFallback") }),
    groom: t("sideOf", { name: data.groomName || tCommon("friendFallback") }),
    friend: t("friendOfBoth"),
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
        {t("private")}
      </p>
      <h1 className="mt-1 font-serif text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-50">
        {occasionTitle}
      </h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{t("onlyVisible")}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("responses")}
          value={rsvps.length}
          accentColor={data.accentColor}
          icon={<Users size={16} aria-hidden />}
        />
        <StatCard
          label={t("attending")}
          value={`${attending.length} (${totalGuests} ${totalGuests === 1 ? t("guest") : t("guests")})`}
          accentColor={data.accentColor}
          icon={<Check size={16} aria-hidden />}
        />
        <StatCard
          label={t("cantMakeIt")}
          value={declined.length}
          accentColor={data.accentColor}
          icon={<XIcon size={16} aria-hidden />}
        />
      </div>

      <HostTools slug={slug} messages={hostMessages} />

      <div className="mt-10 space-y-3">
        {rsvps.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 p-10 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
            {t("noRsvpsYet")}
          </p>
        ) : (
          rsvps.map((r, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-neutral-900 dark:text-neutral-50">{r.guestName}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.attending
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  {r.attending ? t("attending") : t("cantMakeIt")}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {r.guestCount} {r.guestCount === 1 ? t("guest") : t("guests")}
                {r.side && ` · ${SIDE_LABEL[r.side] ?? r.side}`}
                {" · "}
                {format.dateTime(new Date(r.createdAt), {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {r.attending && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  {r.phone ? (
                    <>
                      <a
                        href={`tel:${r.phone.replace(/\s/g, "")}`}
                        className="text-neutral-600 hover:underline dark:text-neutral-300"
                      >
                        {r.phone}
                      </a>
                      <RemindButton
                        slug={slug}
                        name={r.guestName}
                        phone={r.phone}
                        template={hostMessages.reminder}
                      />
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">{t("noPhone")}</span>
                  )}
                </div>
              )}
              {r.message && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-neutral-700 dark:text-neutral-300">
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
        {t("backToEdit")}
      </Link>
    </main>
  );
}
