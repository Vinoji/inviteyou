"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Globe2, MonitorSmartphone, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { readThemeCookie, setThemePref, type ThemePref } from "@/lib/themePref";
import { setReducedMotionPref, useReducedMotionPref } from "@/lib/motionPref";

const LANGS = [
  { id: "en", glyph: "Aa", short: "EN" },
  { id: "ta", glyph: "அ", short: "த" },
] as const;

const THEMES: { id: ThemePref; icon: typeof Sun; swatch: string }[] = [
  { id: "light", icon: Sun, swatch: "linear-gradient(135deg,#fffaf2 50%,#f3d9a8 50%)" },
  { id: "dark", icon: Moon, swatch: "linear-gradient(135deg,#2a1230 50%,#140d18 50%)" },
  { id: "system", icon: MonitorSmartphone, swatch: "linear-gradient(135deg,#fffaf2 50%,#2a1230 50%)" },
];

/**
 * Language, appearance and motion in one place. On the site header and the
 * app toolbar it's a small pill ("🌐 EN ▾") that opens a panel; in the
 * phone menu the same panel shows inline (`inline`).
 */
export default function SettingsMenu({ inline = false }: { inline?: boolean }) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (inline) return <SettingsPanel />;

  const current = LANGS.find((l) => l.id === locale) ?? LANGS[0];
  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t("open")}
        title={t("open")}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e8b04a]/60 bg-[#ffe9b8]/10 px-3 text-sm font-semibold text-[#ffe9b8] transition hover:bg-[#ffe9b8]/20"
      >
        <Globe2 size={15} aria-hidden />
        <span lang={current.id}>{current.short}</span>
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute top-full right-0 z-[90] mt-2 w-72 origin-top-right rounded-2xl border border-[#e8b04a]/40 bg-[#fffaf2] p-4 shadow-2xl shadow-black/30 motion-safe:animate-[settingsIn_.16s_ease-out] dark:bg-[#1c1220]"
        >
          <SettingsPanel onPicked={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ onPicked }: { onPicked?: () => void }) {
  const t = useTranslations("settings");
  const tLang = useTranslations("languageSwitcher");
  const tTheme = useTranslations("themeToggle");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotionPref();
  const [theme, setTheme] = useState<ThemePref>("system");

  useEffect(() => {
    // Only syncs which tile looks selected — the page theme itself was
    // already set server-side from the cookie.
    const id = setTimeout(() => setTheme(readThemeCookie()), 0);
    return () => clearTimeout(id);
  }, []);

  const label = "mb-2 text-[11px] font-semibold tracking-widest text-amber-800/70 uppercase dark:text-amber-300/70";
  const tile = (on: boolean) =>
    `relative flex items-center gap-2 rounded-xl border-2 bg-white px-2.5 py-2 text-left text-sm font-semibold transition dark:bg-neutral-900 ${
      on
        ? "border-amber-500 text-neutral-900 shadow-md shadow-amber-500/15 dark:text-neutral-50"
        : "border-transparent text-neutral-600 ring-1 ring-neutral-200 hover:ring-amber-300 dark:text-neutral-300 dark:ring-neutral-800"
    }`;

  return (
    <div className="space-y-4">
      <p className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50">{t("title")}</p>

      <div>
        <p className={label}>{t("language")}</p>
        <div className="grid grid-cols-2 gap-2">
          {LANGS.map((l) => {
            const on = locale === l.id;
            return (
              <button
                key={l.id}
                type="button"
                lang={l.id}
                aria-pressed={on}
                onClick={() => {
                  if (!on) router.replace(pathname, { locale: l.id });
                  onPicked?.();
                }}
                className={tile(on)}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-serif text-sm font-bold ${
                    on ? "bg-gradient-to-br from-amber-500 to-rose-500 text-white" : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {l.glyph}
                </span>
                {tLang(l.id)}
                {on && <Check size={14} className="ml-auto text-amber-600" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={label}>{t("appearance")}</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(({ id, icon: Icon, swatch }) => {
            const on = theme === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setTheme(id);
                  setThemePref(id);
                }}
                className={`${tile(on)} flex-col !gap-1.5 !px-1.5 !py-2 text-center text-xs`}
              >
                <span className="h-8 w-full rounded-md ring-1 ring-black/10" style={{ background: swatch }} aria-hidden />
                <span className="inline-flex items-center gap-1">
                  <Icon size={12} aria-hidden />
                  {id === "system" ? t("auto") : tTheme(id)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={reduced}
        onClick={() => setReducedMotionPref(!reduced)}
        className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800"
      >
        <span>
          <span className="block text-sm font-semibold text-neutral-800 dark:text-neutral-100">{t("reduceMotion")}</span>
          <span className="block text-xs text-neutral-500 dark:text-neutral-400">{t("reduceMotionHint")}</span>
        </span>
        <span
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
            reduced ? "bg-amber-600" : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${reduced ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </span>
      </button>
    </div>
  );
}
