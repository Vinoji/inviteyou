import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ta"],
  defaultLocale: "en",
  // English (default) stays unprefixed so every already-shared /invite/<slug>
  // link keeps working; Tamil is reached via /ta/... instead.
  localePrefix: "as-needed",
});
