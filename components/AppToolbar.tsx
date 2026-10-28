"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "./site/SiteHeader";
import SettingsMenu from "./site/SettingsMenu";
import HelpMenu from "./site/HelpMenu";

/**
 * The slim festive bar above the editor and the guest list: the same
 * plum-and-gold as the site header, the marigold mark linking home, and the
 * preferences menu (language, appearance, motion). Hidden on the public invitation page: that
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
      <div className="flex min-w-0 items-center gap-2">
        {/* In the editor: a plain way back to the designs (the draft is
            already saved on this device). */}
        {pathname.startsWith("/create/") && (
          <Link
            href="/templates"
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-[#e8b04a]/50 px-2.5 text-xs font-semibold text-[#ffe9b8] hover:bg-[#ffe9b8]/10"
          >
            <ArrowLeft size={14} aria-hidden />
            <span className="sm:hidden">{t("backHome")}</span>
            <span className="hidden sm:inline">{t("backDesigns")}</span>
          </Link>
        )}
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label={t("home")}>
          <LogoMark size={24} />
          <span className="truncate font-serif text-sm font-bold text-[#ffe9b8]">{t("brand")}</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <HelpMenu variant="toolbar" />
        <SettingsMenu />
      </div>
    </div>
  );
}
