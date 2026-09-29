import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** Sent with every response. */
const securityHeaders = [
  // HTTPS only, for two years, subdomains included.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Edit and guest-list links carry their token in the URL; other sites
  // (Maps, WhatsApp, fonts) only ever see our origin, never the path.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nobody can frame our pages (clickjacking), old and new browsers alike.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests",
  },
  // Not used by the site. (Payment stays allowed for Razorpay's checkout;
  // location is asked for by Google Maps itself, never by us.)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/** Private pages stay out of search results, whatever links to them.
 * (Crawlers must be able to fetch them to see this, so robots.txt doesn't
 * block /invite/ — WhatsApp and friends still read the share previews.) */
const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      ...["/invite/:path*", "/rsvps/:path*", "/create/:path*", "/card-sample/:path*"].flatMap((p) => [
        { source: p, headers: noindex },
        { source: `/ta${p}`, headers: noindex },
      ]),
    ];
  },
};

export default withNextIntl(nextConfig);
