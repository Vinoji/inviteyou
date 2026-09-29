"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { LogoMark } from "./site/SiteHeader";

/**
 * The slim festive bar above the editor and the guest list: the same
 * plum-and-gold as the site header, the marigold mark linking home, and the
 * theme + UI-language controls. Hidden on the public invitation page: that
 * page always renders in the couple's chosen invitation language and
 * template palette, so neither control would change what the guest sees.
 */
export default function AppToolbar() {
  const pathname = usePathname();
  const t = useTranslations("site");
  if (pathname.startsWith("/invite/")) return null;
  return (
    // Fixed height: the editor fills exactly the rest of the screen (Editor.tsx).
    <div className="flex h-11 items-center justify-between gap-3 border-b-2 border-[#c98f3a] bg-gradient-to-r from-[#22091f] via-[#3d1236] to-[#22091f] px-4">
      <ThemeToggle />
      <Link href="/" className="flex items-center gap-2" aria-label={t("home")}>
        <LogoMark size={24} />
        <span className="hidden font-serif text-sm font-bold text-[#ffe9b8] sm:inline">{t("brand")}</span>
      </Link>
      <LanguageSwitcher />
    </div>
  );
}
