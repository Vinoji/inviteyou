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
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Namma Vivaham — Beautiful Invitations for Every Celebration",
    template: "%s | Namma Vivaham",
  },
  description:
    "Create a stunning, shareable invitation website in minutes — weddings, anniversaries, proposals, birthdays, and house warmings. Pick a template, add your details and photos, and get a link to share with guests.",
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
].join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
