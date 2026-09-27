"use client";

import { usePathname } from "@/i18n/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * Theme + UI-language controls. Hidden on the public invitation page: that
 * page always renders in the couple's chosen invitation language and
 * template palette, so neither control would change what the guest sees.
 */
export default function AppToolbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/invite/")) return null;
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-1.5 dark:border-neutral-800">
      <ThemeToggle />
      <LanguageSwitcher />
    </div>
  );
}
