import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { CATEGORIES } from "@/lib/categories";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/+$/, "");
const PAGES = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  // One landing page per occasion (app/[locale]/invitations/[category]).
  ...CATEGORIES.map((c) => ({
    path: `/invitations/${c.id}`,
    priority: c.id === "wedding" ? 0.9 : 0.8,
    changeFrequency: "weekly" as const,
  })),
  { path: "/demo", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/support", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
];

/** /sitemap.xml — the public pages in English (unprefixed) and Tamil (/ta),
 * each listed once per language with its alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.flatMap(({ path, priority, changeFrequency }) => {
    const en = `${BASE}${path || "/"}`;
    const ta = `${BASE}/ta${path}`;
    const alternates = { languages: { en, ta, "x-default": en } };
    return [
      { url: en, lastModified, changeFrequency, priority, alternates },
      { url: ta, lastModified, changeFrequency, priority: Math.max(0.1, priority - 0.1), alternates },
    ];
  });
}
