import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/+$/, "");

/**
 * /robots.txt — the marketing pages are open to search engines. The API,
 * guest lists and the editor aren't crawled at all. Invitations may be
 * fetched but never indexed: they answer with X-Robots-Tag noindex (see
 * next.config.ts) — a robots.txt block would hide that, and Google can
 * still list a blocked URL it finds linked elsewhere. Tamil copies
 * (/ta/...) follow the same rules.
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/rsvps/", "/create/", "/card-sample/"];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...privatePaths, ...privatePaths.map((p) => `/ta${p}`)],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
