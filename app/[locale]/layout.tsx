import type { Metadata } from "next";
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
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
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
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const greatVibes = Great_Vibes({
  variable: "--font-greatvibes",
  subsets: ["latin"],
  weight: ["400"],
});
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const ebGaramond = EB_Garamond({
  variable: "--font-ebgaramond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
// Tamil-script fonts — none of the Latin fonts above have Tamil glyphs at
// all, so Tamil text typed into the editor would silently fall back to a
// default system font without these.
const kavivanar = Kavivanar({
  variable: "--font-kavivanar",
  subsets: ["tamil"],
  weight: ["400"],
});
const meeraInimai = Meera_Inimai({
  variable: "--font-meera-inimai",
  subsets: ["tamil"],
  weight: ["400"],
});
const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["tamil", "latin"],
  weight: ["400", "500", "600"],
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
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: `${t("eyebrow")} — ${t("heading")}`,
      template: `%s | ${t("eyebrow")}`,
    },
    description: t("subheading"),
  };
}

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

  // Theme is decided server-side from a cookie (written by ThemeToggle),
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
      lang={locale}
      className={`${fontVariables} ${themeClass} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <NextIntlClientProvider>
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-1.5 dark:border-neutral-800">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
