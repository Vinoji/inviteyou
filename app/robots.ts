import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/+$/, "");

/**
 * /robots.txt — the marketing pages are open to search engines; couples'
 * invitations (names, dates, addresses), guest lists, the editor and the
 * API are not. Tamil copies of each (/ta/...) follow the same rules.
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/invite/", "/rsvps/", "/create/", "/card-sample/"];
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
