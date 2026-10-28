import type { Metadata } from "next";
import { SITE } from "./site";

/** The live origin, for absolute URLs (structured data, sitemap). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/+$/, "");

/**
 * Canonical URL and language alternates for a public page — English is
 * unprefixed, Tamil under /ta (i18n/routing.ts). Relative, resolved against
 * metadataBase. `path` is "" for home, else "/demo" etc.
 */
export function pageAlternates(locale: string, path: string): Metadata["alternates"] {
  const en = path || "/";
  const ta = `/ta${path}`;
  return {
    canonical: locale === "ta" ? ta : en,
    languages: { en, ta, "x-default": en },
  };
}

/**
 * A page's own social preview: its share title and line (different from
 * the search title and description), and its preview card from /api/og.
 */
export function pageSocial(opts: { title: string; description: string; kicker?: string; url: string; type?: "website" | "article" }): {
  openGraph: NonNullable<Metadata["openGraph"]>;
  twitter: NonNullable<Metadata["twitter"]>;
} {
  const q = new URLSearchParams({ t: opts.title, s: opts.description, ...(opts.kicker ? { k: opts.kicker } : {}) });
  const image = { url: `/api/og?${q.toString()}`, width: 1200, height: 630, alt: opts.title };
  return {
    openGraph: { title: opts.title, description: opts.description, url: opts.url, type: opts.type ?? "website", siteName: "InviteForYou", images: [image] },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image.url] },
  };
}
