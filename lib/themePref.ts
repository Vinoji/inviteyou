export type ThemePref = "light" | "dark" | "system";

const COOKIE_NAME = "theme";

export function readThemeCookie(): ThemePref {
  const match = document.cookie.match(/(?:^|; )theme=(light|dark|system)/);
  return (match?.[1] as ThemePref) ?? "system";
}

/** Writes the cookie the server reads in app/[locale]/layout.tsx to decide
 * the `dark`/`light` class before first paint — this is what makes theme
 * changes (and the locale-switch soft navigation, which re-runs that server
 * render) show the right theme immediately, with no client script and no
 * flash of the wrong one. */
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
