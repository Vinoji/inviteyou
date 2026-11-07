export type ThemePref = "light" | "dark" | "system";

const COOKIE_NAME = "theme";

export function readThemeCookie(): ThemePref {
  const match = document.cookie.match(/(?:^|; )theme=(light|dark|system)/);
  return (match?.[1] as ThemePref) ?? "system";
}

/** Writes the cookie the inline script in app/[locale]/layout.tsx reads to
 * set the `dark`/`light` class before first paint, so a saved theme never
 * flashes the wrong one. */
function persistTheme(pref: ThemePref) {
  if (pref === "system") {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  } else {
    document.cookie = `${COOKIE_NAME}=${pref}; path=/; max-age=31536000; samesite=lax`;
  }
}

/** Applies (or clears) the `.dark`/`.light` override class on <html>
 * immediately, client-side, so the change feels instant. */
function applyThemeClass(pref: ThemePref) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  if (pref !== "system") root.classList.add(pref);
}

/** Re-applies the saved theme — after a language switch, which re-renders
 * <html> without the class the inline script set. */
export function applySavedTheme() {
  applyThemeClass(readThemeCookie());
}

/** Switches theme now and remembers it. A crossfade where the browser
 * supports view transitions; a plain swap everywhere else. */
export function setThemePref(pref: ThemePref) {
  // Colours crossfade only while switching (globals.css .theme-switching).
  const root = document.documentElement;
  root.classList.add("theme-switching");
  window.setTimeout(() => root.classList.remove("theme-switching"), 400);
  if (typeof document.startViewTransition === "function") {
    document.startViewTransition(() => applyThemeClass(pref));
  } else {
    applyThemeClass(pref);
  }
  persistTheme(pref);
}
