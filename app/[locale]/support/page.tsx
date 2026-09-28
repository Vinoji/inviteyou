import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronDown, CreditCard, Languages, Mail, MessageCircle, Pencil, Phone, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/site";
import SocialIcons from "@/components/site/SocialIcons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.support" });
  return { title: t("metaTitle"), description: t("intro") };
}

const TOPICS = [
  { key: "editing", icon: Pencil },
  { key: "guests", icon: Users },
  { key: "language", icon: Languages },
  { key: "payments", icon: CreditCard },
] as const;

const FAQ = ["editLink", "lostLink", "changeDesign", "rsvp", "whatsapp", "tamil", "photos", "payment"] as const;

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("site.support");
  const { email, whatsapp, phone } = SITE.contact;

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-4xl px-6 pt-14 pb-10 text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">{t("eyebrow")}</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-neutral-50">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">{t("intro")}</p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-14 sm:grid-cols-2 lg:grid-cols-4">
        {TOPICS.map(({ key, icon: Icon }) => (
          <div key={key} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <Icon size={20} className="text-amber-600" aria-hidden />
            <h2 className="mt-3 font-semibold text-neutral-900 dark:text-neutral-50">{t(`topics.${key}Title`)}</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t(`topics.${key}Body`)}</p>
          </div>
        ))}
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-6 pb-16">
        <h2 className="mb-6 text-center font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          {t("faqTitle")}
        </h2>
        <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {FAQ.map((q) => (
            <details key={q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-neutral-900 dark:text-neutral-50 [&::-webkit-details-marker]:hidden">
                {t(`faq.${q}Q`)}
                <ChevronDown size={18} className="shrink-0 text-neutral-400 transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{t(`faq.${q}A`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 border-t border-neutral-100 bg-amber-50/60 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">{t("contactTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">{t("contactBody")}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
              >
                <Mail size={16} aria-hidden /> {email}
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-[#08331a]"
              >
                <MessageCircle size={16} aria-hidden /> {t("whatsapp")}
              </a>
            )}
            {phone && (
              <a
                href={`tel:+${phone}`}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold dark:border-neutral-700"
              >
                <Phone size={16} aria-hidden /> +{phone}
              </a>
            )}
          </div>
          <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">{t("responseTime")}</p>
          <div className="mt-6 flex justify-center">
            <SocialIcons />
          </div>
          <p className="mt-8 text-xs text-neutral-500 dark:text-neutral-400">
            {t.rich("privacyNote", {
              link: (chunks) => (
                <Link href="/privacy" className="font-semibold underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </section>
    </main>
  );
}
