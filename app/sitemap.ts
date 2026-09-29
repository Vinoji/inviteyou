import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/+$/, "");
const PAGES = [
  { path: "", priority: 1 },
  { path: "/demo", priority: 0.7 },
  { path: "/support", priority: 0.5 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

/** /sitemap.xml — the public pages in English (unprefixed) and Tamil (/ta). */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority }) => ({
    url: `${BASE}${path || "/"}`,
    changeFrequency: "weekly" as const,
    priority,
    alternates: { languages: { en: `${BASE}${path || "/"}`, ta: `${BASE}/ta${path}` } },
  }));
}
