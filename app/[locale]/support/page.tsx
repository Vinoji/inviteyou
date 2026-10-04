import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronDown, CreditCard, Languages, Pencil, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import SocialIcons from "@/components/site/SocialIcons";
import FestiveBanner from "@/components/site/FestiveBanner";
import paper from "@/components/landing/landing.module.css";
import { KolamDivider } from "@/components/site/festive";
import { pageAlternates } from "@/lib/seo";
import SupportForm from "@/components/site/SupportForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.support" });
  return { title: t("metaTitle"), description: t("intro"), alternates: pageAlternates(locale, "/support") };
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

  return (
    <main className={`flex-1 ${paper.paper}`}>
      {/* FAQ rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((q) => ({
              "@type": "Question",
              name: t(`faq.${q}Q`),
              acceptedAnswer: { "@type": "Answer", text: t(`faq.${q}A`) },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <FestiveBanner eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-14 sm:grid-cols-2 lg:grid-cols-4">
        {TOPICS.map(({ key, icon: Icon }) => (
          <div key={key} className={`${paper.festiveCard} p-5`}>
            <Icon size={20} className="text-amber-600" aria-hidden />
            <h2 className="mt-3 font-semibold text-neutral-900 dark:text-neutral-50">{t(`topics.${key}Title`)}</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t(`topics.${key}Body`)}</p>
          </div>
        ))}
      </section>

      <KolamDivider />
      <section id="faq" className="relative mx-auto max-w-3xl scroll-mt-24 px-6 pt-6 pb-16">
        <h2 className="mb-6 text-center font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          {t("faqTitle")}
        </h2>
        <div className={`divide-y divide-amber-200/60 dark:divide-amber-500/15 ${paper.festiveCard}`}>
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
        <div className="mx-auto max-w-5xl px-6 py-14 text-center">
          <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">{t("contactTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">{t("contactBody")}</p>
          <div className="mt-8">
            <SupportForm />
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
