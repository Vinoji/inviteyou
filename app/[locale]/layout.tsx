import type { Metadata, Viewport } from "next";
import {
  Playfair_Display,
  Cormorant_Garamond,
  Poppins,
  Inter,
  Great_Vibes,
  Lato,
  Cinzel,
  EB_Garamond,
  Kavivanar,
  Meera_Inimai,
  Catamaran,
  Bodoni_Moda,
  Jost,
  Amiri,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { CLIENT_BASE, pickMessages } from "@/lib/i18n/clientMessages";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import SiteHeader from "@/components/site/SiteHeader";
import RefCapture from "@/components/site/RefCapture";
import OfferBar from "@/components/site/OfferBar";
import { SITE } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";
import SiteFooter from "@/components/site/SiteFooter";
import EntranceGate from "@/components/site/EntranceGate";
import HelpMenu from "@/components/site/HelpMenu";
import OffscreenPause from "@/components/site/OffscreenPause";
import { MotionPrefSync } from "@/components/invite/MotionToggle";
import "../globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  preload: false,
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  preload: false,
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  preload: false,
});
const greatVibes = Great_Vibes({
  variable: "--font-greatvibes",
  subsets: ["latin"],
  weight: ["400"],
  preload: false,
});
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  preload: false,
});
const ebGaramond = EB_Garamond({
  variable: "--font-ebgaramond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  preload: false,
});
// Only Playfair (the site's headings) is preloaded: every other face loads
// when text on the page uses it (font-display: swap), so phones don't
// download ~300 KB of design fonts up front.
// Tamil-script fonts — none of the Latin fonts above have Tamil glyphs at
// all, so Tamil text typed into the editor would silently fall back to a
// default system font without these.
const kavivanar = Kavivanar({
  variable: "--font-kavivanar",
  subsets: ["tamil"],
  weight: ["400"],
  preload: false,
});
const meeraInimai = Meera_Inimai({
  variable: "--font-meera-inimai",
  subsets: ["tamil"],
  weight: ["400"],
  preload: false,
});
const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["tamil", "latin"],
  weight: ["400", "500", "600"],
  preload: false,
});

// Only some templates use these (luxe-didone pairing, the Arabic
// invocation of the Nikah styles) — not preloaded, so other pages don't
// download them.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  preload: false,
});
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tSeo = await getTranslations({ locale, namespace: "seo" });
  // Lead with what people search for ("online wedding invitation…").
  const title = `${tSeo("homeTitle")} | ${t("eyebrow")}`;
  const description = tSeo("homeDescription");
  // Defaults for every page; pages add their own title, description and
  // canonical (lib/seo.ts), and the site share image comes from
  // opengraph-image.tsx next to this file.
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE.name,
    title: { default: title, template: `%s | ${t("eyebrow")}` },
    description,
    keywords: tSeo("keywords").split(",").map((k) => k.trim()),
    category: "lifestyle",
    creator: SITE.name,
    publisher: SITE.name,
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description,
      locale: locale === "ta" ? "ta_IN" : "en_IN",
      alternateLocale: locale === "ta" ? ["en_IN"] : ["ta_IN"],
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    // Search Console ownership, once the site is added there.
    // Search Console / Bing Webmaster ownership, once the site is added there.
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
      ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3d1236" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0b1f" },
  ],
};

const fontVariables = [
  playfair.variable,
  cormorant.variable,
  poppins.variable,
  inter.variable,
  greatVibes.variable,
  lato.variable,
  cinzel.variable,
  ebGaramond.variable,
  kavivanar.variable,
  meeraInimai.variable,
  catamaran.variable,
  bodoni.variable,
  jost.variable,
  amiri.variable,
].join(" ");

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  // Theme is decided server-side from a cookie (written by lib/themePref.ts),
  // not a client-side "flash of wrong theme, then fix it" script — the
  // right `dark`/`light` class is already in the HTML the browser first
  // paints, on every request including the soft client-side navigation a
  // locale switch does. No stored preference yet (or "system") means no
  // extra class here; the `@media (prefers-color-scheme: dark)` rule in
  // globals.css covers that case at the CSS level.
  const cookieStore = await cookies();
  const themePref = cookieStore.get("theme")?.value;
  const themeClass = themePref === "light" || themePref === "dark" ? themePref : "";

  return (
    <html
      // data-perf is set by the inline script below, before hydration.
      suppressHydrationWarning
      lang={locale}
      className={`${fontVariables} ${themeClass} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {/* The phone's performance tier (lib/perfTier.ts), set before the
            first paint so old phones never start the heavy effects. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var n=navigator,c=n.hardwareConcurrency||4,m=n.deviceMemory||4,s=n.connection&&n.connection.saveData,r=matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.dataset.perf=s||r||c<=4||m<=2?"low":c<=6||m<=4?"mid":"high"}catch(e){}`,
          }}
        />
        <NextIntlClientProvider messages={pickMessages(messages, CLIENT_BASE)}>
          <MotionPrefSync />
          <OffscreenPause />
          <EntranceGate />
          <OfferBar />
          <SiteHeader />
          <RefCapture />
          {children}
          <SiteFooter />
          <HelpMenu />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
