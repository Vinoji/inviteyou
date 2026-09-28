import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.privacy" });
  return { title: t("metaTitle"), description: t("intro") };
}

/** Section ids double as footer anchors (#payments, #your-data). */
const SECTIONS = [
  { id: "what-we-collect", key: "collect" },
  { id: "guests", key: "guests" },
  { id: "how-we-use", key: "use" },
  { id: "payments", key: "payments" },
  { id: "storage", key: "storage" },
  { id: "device", key: "device" },
  { id: "your-data", key: "yourData" },
  { id: "changes", key: "changes" },
] as const;

/**
 * Plain-language privacy policy describing what this app actually stores
 * (see lib/types.ts, the API routes and firestore.rules / storage.rules).
 * Keep it in step with the code when data handling changes.
 */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("site.privacy");

  return (
    <main className="flex-1">
      <article className="mx-auto max-w-3xl px-6 pt-14 pb-20">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">{t("eyebrow")}</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-neutral-900 dark:text-neutral-50">{t("title")}</h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{t("updated")}</p>
        <p className="mt-6 leading-relaxed text-neutral-700 dark:text-neutral-300">{t("intro")}</p>

        <nav aria-label={t("contents")} className="mt-8 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">{t("contents")}</p>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {SECTIONS.map((sec, i) => (
              <li key={sec.id}>
                <a href={`#${sec.id}`} className="text-neutral-700 hover:text-amber-700 dark:text-neutral-300 dark:hover:text-amber-400">
                  {i + 1}. {t(`${sec.key}.title`)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {SECTIONS.map((sec, i) => (
          <section key={sec.id} id={sec.id} className="mt-10 scroll-mt-24">
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {i + 1}. {t(`${sec.key}.title`)}
            </h2>
            <div className="mt-3 space-y-3 leading-relaxed text-neutral-700 dark:text-neutral-300">
              {(t.raw(`${sec.key}.body`) as string[]).map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          </section>
        ))}

        <section id="contact" className="mt-10 scroll-mt-24 rounded-2xl bg-amber-50 p-6 dark:bg-neutral-900">
          <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">{t("contactTitle")}</h2>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            {t("contactBody")}{" "}
            {SITE.contact.email && (
              <a href={`mailto:${SITE.contact.email}`} className="font-semibold text-amber-700 underline dark:text-amber-400">
                {SITE.contact.email}
              </a>
            )}
          </p>
        </section>
      </article>
    </main>
  );
}
