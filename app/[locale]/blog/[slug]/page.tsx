import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ChevronDown, Clock, Lightbulb } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { POSTS, getPost, type Block } from "@/lib/blog";
import { standardPriceInr } from "@/lib/pricing";
import { SITE_URL } from "@/lib/seo";
import paper from "@/components/landing/landing.module.css";

/**
 * /blog/<slug> — one guide (lib/blog.ts). Written in English; the Tamil
 * site shows the same post with the English page as canonical, so search
 * engines index it once. Article + FAQ + breadcrumb schema.org data.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => POSTS.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: { absolute: post.metaTitle },
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.metaTitle,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.published,
      modifiedTime: post.updated,
    },
    twitter: { card: "summary_large_image", title: post.metaTitle, description: post.description },
  };
}

function fill(text: string, price: number) {
  return text.replaceAll("{price}", String(price));
}

function BlockView({ b, price }: { b: Block; price: number }) {
  switch (b.t) {
    case "p":
      return <p className="mt-4 leading-relaxed text-neutral-700 dark:text-neutral-300">{fill(b.text, price)}</p>;
    case "h2":
      return (
        <h2 id={b.id} className="mt-10 scroll-mt-24 font-serif text-2xl font-bold text-[#2a0c27] dark:text-[#fff6e6]">
          {b.text}
        </h2>
      );
    case "h3":
      return <h3 className="mt-6 font-serif text-lg font-bold text-[#2a0c27] dark:text-[#fff6e6]">{b.text}</h3>;
    case "ul":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-neutral-700 marker:text-[#c98f3a] dark:text-neutral-300">
          {b.items.map((x, i) => (
            <li key={i}>{fill(x, price)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-neutral-700 marker:font-bold marker:text-[#c98f3a] dark:text-neutral-300">
          {b.items.map((x, i) => (
            <li key={i}>{fill(x, price)}</li>
          ))}
        </ol>
      );
    case "sample":
      return (
        <figure className={`${paper.festiveCard} mt-5 p-5 text-center`} lang={b.lang}>
          <figcaption className="text-xs font-semibold tracking-wider text-[#b0791f] uppercase dark:text-[#ffd35c]">{b.title}</figcaption>
          <div className="mt-3 space-y-1.5 font-serif text-[15px] leading-relaxed text-[#2a0c27] dark:text-[#fff6e6]">
            {b.lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        </figure>
      );
    case "tip":
      return (
        <p className="mt-5 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <Lightbulb size={18} className="mt-0.5 shrink-0" aria-hidden />
          {fill(b.text, price)}
        </p>
      );
    case "cta":
      return (
        <aside className="mt-8 rounded-3xl bg-gradient-to-br from-[#3d1236] to-[#22091f] p-6 text-center text-[#fff6e6] shadow-xl">
          <p className="font-serif text-xl font-bold">{b.title}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#ffe9b8]/85">{fill(b.text, price)}</p>
          <Link
            href={b.href}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] px-6 py-3 text-sm font-bold text-[#2a0c27]"
          >
            {b.button}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </aside>
      );
  }
}

export default async function BlogPost({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const price = standardPriceInr();
  const url = `${SITE_URL}/blog/${post.slug}`;
  const toc = post.body.filter((b): b is Extract<Block, { t: "h2" }> => b.t === "h2" && !!b.id);
  const others = POSTS.filter((p) => p.slug !== post.slug);
  const date = new Intl.DateTimeFormat(locale === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${post.updated}T00:00:00+05:30`),
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        mainEntityOfPage: url,
        headline: post.title,
        description: post.description,
        keywords: post.keywords.join(", "),
        datePublished: post.published,
        dateModified: post.updated,
        inLanguage: "en-IN",
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
        isPartOf: { "@id": `${SITE_URL}/blog#blog` },
      },
      {
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("home"), item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: t("title"), item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className={`flex-1 ${paper.paper}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article className="mx-auto max-w-3xl px-5 pt-8 pb-16 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-500 dark:text-neutral-400">
          <Link href="/" className="hover:text-amber-700">
            {t("home")}
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-amber-700">
            {t("title")}
          </Link>
        </nav>
        <header className="mt-5">
          <h1 className="font-serif text-3xl leading-tight font-bold text-[#2a0c27] sm:text-4xl dark:text-[#fff6e6]">{post.title}</h1>
          <p className="mt-3 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">{post.excerpt}</p>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{t("updated", { date })}</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} aria-hidden />
              {t("readTime", { minutes: post.readMinutes })}
            </span>
          </p>
        </header>

        {toc.length > 2 && (
          <nav aria-label={t("contents")} className={`${paper.festiveCard} mt-6 p-5`}>
            <p className="text-xs font-semibold tracking-wider text-[#b0791f] uppercase dark:text-[#ffd35c]">{t("contents")}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-[#3d1236] hover:underline dark:text-[#ffe9b8]">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div lang="en">
          {post.body.map((b, i) => (
            <BlockView key={i} b={b} price={price} />
          ))}
        </div>

        {post.faq.length > 0 && (
          <section className="mt-12" lang="en">
            <h2 className="font-serif text-2xl font-bold text-[#2a0c27] dark:text-[#fff6e6]">{t("faq")}</h2>
            <div className="mt-4 space-y-3">
              {post.faq.map((f) => (
                <details key={f.q} className={`${paper.festiveCard} group p-5`}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#2a0c27] dark:text-[#fff6e6]">
                    {f.q}
                    <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-serif text-xl font-bold text-[#2a0c27] dark:text-[#fff6e6]">{t("more")}</h2>
          <ul className="mt-4 space-y-2">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="inline-flex items-center gap-1.5 font-semibold text-[#7a4a12] hover:underline dark:text-[#ffd35c]">
                  <ArrowRight size={14} aria-hidden />
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
