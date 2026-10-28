import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { POSTS } from "@/lib/blog";
import { SITE_URL, pageAlternates, pageSocial } from "@/lib/seo";
import FestiveBanner from "@/components/site/FestiveBanner";
import paper from "@/components/landing/landing.module.css";

/**
 * /blog — the guides (lib/blog.ts): wording samples, WhatsApp messages and
 * the digital-invitation guide, each a page of its own for search.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title: { absolute: title },
    description,
    alternates: pageAlternates(locale, "/blog"),
    ...pageSocial({ title: t("ogTitle"), description: t("ogDescription"), kicker: t("eyebrow"), url: locale === "ta" ? "/ta/blog" : "/blog" }),
  };
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const base = locale === "ta" ? `${SITE_URL}/ta` : SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${base}/blog#blog`,
        url: `${base}/blog`,
        name: t("metaTitle"),
        description: t("metaDescription"),
        publisher: { "@id": `${SITE_URL}/#org` },
        blogPost: POSTS.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: p.published,
          dateModified: p.updated,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("home"), item: `${base}/` },
          { "@type": "ListItem", position: 2, name: t("title"), item: `${base}/blog` },
        ],
      },
    ],
  };

  return (
    <main className={`flex-1 ${paper.paper}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <FestiveBanner eyebrow={t("eyebrow")} title={t("h1")} intro={t("intro")} />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <ul className="grid gap-5 sm:grid-cols-2">
          {POSTS.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className={`${paper.festiveCard} group flex h-full flex-col p-6 transition hover:-translate-y-0.5`}
              >
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#b0791f] uppercase dark:text-[#ffd35c]">
                  <Clock size={13} aria-hidden />
                  {t("readTime", { minutes: p.readMinutes })}
                </p>
                <h2 className="mt-2 font-serif text-xl leading-snug font-bold text-[#2a0c27] dark:text-[#fff6e6]">{p.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{p.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7a4a12] group-hover:gap-2.5 dark:text-[#ffd35c]">
                  {t("read")}
                  <ArrowRight size={15} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
