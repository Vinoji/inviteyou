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
