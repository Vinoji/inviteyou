import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CATEGORIES } from "@/lib/categories";
import { COLLECTIONS } from "@/lib/collections";
import { getTemplatesByCategory } from "@/lib/i18n/templates";
import { getCategoryMeta } from "@/lib/i18n/categories";
import { standardPriceInr, templatePriceInr, templateTier } from "@/lib/pricing";
import { POSTS } from "@/lib/blog";
import type { SearchItem } from "@/lib/search";

/**
 * GET /api/search/<locale> — everything the site search can find, in that
 * language: every design, occasion and tradition page, guide, page and
 * feature, and the FAQ answers. Built once per language and cached; it
 * follows the price daily.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Site pages and features, with the messages that name them. */
const PAGES = [
  { key: "home", href: "/" },
  { key: "templates", href: "/templates" },
  { key: "freeCards", href: "/templates#free" },
  { key: "live", href: "/templates#value" },
  { key: "premium3d", href: "/templates#premium" },
  { key: "pricing", href: "/#pricing" },
  { key: "demo", href: "/demo" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
  { key: "support", href: "/support" },
  { key: "contact", href: "/support#contact" },
  { key: "faq", href: "/support#faq" },
  { key: "privacy", href: "/privacy" },
  { key: "yourData", href: "/privacy#your-data" },
  { key: "terms", href: "/terms" },
  { key: "refunds", href: "/terms#refunds" },
] as const;

const SUPPORT_FAQ = ["editLink", "lostLink", "changeDesign", "rsvp", "whatsapp", "tamil", "photos", "payment"] as const;

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [tTemplates, tCategories, tSeo, tIndex, tHome, tSupport, tGallery, tEnTemplates, tEnCategories, tEnSeo, tEnIndex] = await Promise.all([
    getTranslations({ locale, namespace: "templates" }),
    getTranslations({ locale, namespace: "categories" }),
    getTranslations({ locale, namespace: "seoPages" }),
    getTranslations({ locale, namespace: "searchIndex" }),
    getTranslations({ locale, namespace: "landing.home" }),
    getTranslations({ locale, namespace: "site.support" }),
    getTranslations({ locale, namespace: "landing" }),
    getTranslations({ locale: "en", namespace: "templates" }),
    getTranslations({ locale: "en", namespace: "categories" }),
    getTranslations({ locale: "en", namespace: "seoPages" }),
    getTranslations({ locale: "en", namespace: "searchIndex" }),
  ]);
  // On the Tamil index, the English words too — people type both.
  const en = (text: string) => (locale === "en" ? "" : ` ${text}`);
  const price = standardPriceInr();
  const items: SearchItem[] = [];

  for (const { key, href } of PAGES) {
    items.push({ kind: "page", title: tIndex(`pages.${key}.t`, { price }), sub: tIndex(`pages.${key}.d`, { price }), href, terms: tIndex(`pages.${key}.k`) + en(tEnIndex(`pages.${key}.t`, { price })) });
  }
  for (const k of Object.keys(tHome.raw("features.items") as Record<string, unknown>)) {
    items.push({ kind: "page", title: tHome(`features.items.${k}.t`), sub: tHome(`features.items.${k}.d`), href: "/#features", terms: tIndex("featureTerms") });
  }

  for (const c of CATEGORIES) {
    const meta = getCategoryMeta(c.id, tCategories);
    items.push({ kind: "occasion", title: meta.label, sub: tSeo(`${c.id}.h1`), href: `/invitations/${c.id}`, terms: `${meta.tagline} ${tSeo(`${c.id}.metaTitle`)}${en(`${tEnCategories(`${c.id}.label`)} ${tEnSeo(`${c.id}.metaTitle`)}`)}` });
    for (const tpl of getTemplatesByCategory(c.id, tTemplates)) {
      const tier = templateTier(tpl.id);
      const tierWord = tier === "free" ? tGallery("home.badgeFree") : tier === "premium" ? `3D ₹${templatePriceInr(tpl.id)}` : `₹${templatePriceInr(tpl.id)}`;
      items.push({
        kind: "design",
        title: tpl.name,
        sub: `${meta.label} · ${tpl.tagline}`,
        href: `/create/${tpl.id}`,
        terms: `${tierWord} ${tier} ${tpl.id.replace(/-/g, " ")}${en(`${tEnTemplates(`${tpl.id}.name`)} ${tEnCategories(`${c.id}.label`)}`)}`,
      });
    }
  }
  for (const col of COLLECTIONS) {
    items.push({ kind: "occasion", title: tSeo(`${col.slug}.label`), sub: tSeo(`${col.slug}.h1`), href: `/invitations/${col.slug}`, terms: `${tSeo(`${col.slug}.metaTitle`)} ${tSeo(`${col.slug}.ogDescription`)}${en(`${tEnSeo(`${col.slug}.label`)} ${tEnSeo(`${col.slug}.metaTitle`)}`)}` });
  }

  for (const post of POSTS) {
    items.push({ kind: "guide", title: post.title, sub: post.excerpt, href: `/blog/${post.slug}`, terms: post.keywords.join(" ") });
  }

  for (const q of SUPPORT_FAQ) {
    items.push({ kind: "help", title: tSupport(`faq.${q}Q`), sub: tSupport(`faq.${q}A`), href: "/support#faq", terms: "" });
  }
  for (const k of Object.keys(tHome.raw("faq.items") as Record<string, unknown>)) {
    items.push({ kind: "help", title: tHome(`faq.items.${k}.q`), sub: tHome(`faq.items.${k}.a`, { price }), href: "/#faq", terms: "" });
  }

  return Response.json(items, { headers: { "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=86400" } });
}
