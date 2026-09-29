import { getTranslations } from "next-intl/server";
import { SITE } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";
import { PRICE_INR } from "@/lib/pricing";

/**
 * schema.org JSON-LD for the home page: the business, the website (in
 * both languages) and the one plan it sells — what search engines use for
 * the brand panel and price snippets.
 */
export default async function StructuredData({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "seo" });
  const tLanding = await getTranslations({ locale, namespace: "landing" });
  const home = locale === "ta" ? `${SITE_URL}/ta` : `${SITE_URL}/`;
  const sameAs = Object.values(SITE.social).filter((u) => /^https:\/\/.+\/.+/.test(u));
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: SITE.name,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/apple-icon`,
        email: SITE.contact.email || undefined,
        description: t("orgDescription"),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        name: SITE.name,
        url: home,
        inLanguage: ["en-IN", "ta-IN"],
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      {
        "@type": "Service",
        name: `${SITE.name} — ${tLanding("heading")}`,
        serviceType: "Online invitation website",
        provider: { "@id": `${SITE_URL}/#org` },
        areaServed: "IN",
        description: t("orgDescription"),
        offers: {
          "@type": "Offer",
          name: t("offerName"),
          price: String(PRICE_INR),
          priceCurrency: "INR",
          url: `${home}#pricing`,
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };
  // "<" escaped so no string in here can close the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
