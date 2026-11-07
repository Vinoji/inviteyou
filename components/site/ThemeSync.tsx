"use client";

import { useLayoutEffect } from "react";
import { useLocale } from "next-intl";
import { applySavedTheme } from "@/lib/themePref";

/** Keeps the saved light/dark choice on <html> when the language changes
 * (the inline script in the layout only runs on a full page load).
 * Mounted once in the layout; runs before paint, so there's no flash. */
export default function ThemeSync() {
  const locale = useLocale();
  useLayoutEffect(() => applySavedTheme(), [locale]);
  return null;
}
