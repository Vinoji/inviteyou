"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { useTranslations } from "next-intl";

type ThemePref = "light" | "dark" | "system";

const COOKIE_NAME = "theme";

function readThemeCookie(): ThemePref {
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
 * immediately, client-side — this is what makes clicking the toggle itself
 * feel instant, ahead of persistTheme's effect on the *next* server render. */
function applyThemeClass(pref: ThemePref) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  if (pref !== "system") root.classList.add(pref);
}

export default function ThemeToggle() {
  const t = useTranslations("themeToggle");
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    // Deferred into a callback rather than called synchronously in the
    // effect body — same pattern used elsewhere in this codebase (see
    // Countdown.tsx / EnvelopeIntro.tsx). Only syncs which button looks
    // "selected" — the actual page theme was already set server-side.
    const id = setTimeout(() => setPref(readThemeCookie()), 0);
    return () => clearTimeout(id);
  }, []);

  function choose(next: ThemePref) {
    setPref(next);
    // A crossfade instead of an instant snap, where the browser supports
    // it (Chromium/Edge/Opera today); falls straight through to the plain
    // class swap everywhere else — same end state either way.
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => applyThemeClass(next));
    } else {
      applyThemeClass(next);
    }
    persistTheme(next);
  }

  const options: { id: ThemePref; label: string; icon: typeof Sun }[] = [
    { id: "light", label: t("light"), icon: Sun },
    { id: "dark", label: t("dark"), icon: Moon },
    { id: "system", label: t("system"), icon: MonitorSmartphone },
  ];

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-900">
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => choose(id)}
          aria-pressed={pref === id}
          aria-label={label}
          title={label}
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition ${
            pref === id
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
          }`}
        >
          <Icon size={12} />
        </button>
      ))}
    </div>
  );
}
