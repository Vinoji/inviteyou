"use client";

import { Check, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FONT_PAIRINGS } from "@/lib/fontPairings";
import type { ContentLocale } from "@/lib/types";
import TemplateShowcase, { type ShowcaseProps } from "@/components/landing/TemplateShowcase";

export interface DesignOption {
  id: string;
  name: string;
  tagline: string;
  showcase: ShowcaseProps;
}

const label = "mb-2 block text-sm font-semibold text-neutral-800 dark:text-neutral-200";

/**
 * The occasion's designs as live cards — each plays its real opening, as on
 * the home page — in a swipeable row with the current design first.
 * Choosing another opens the editor on it; the draft (or, when editing, the
 * saved invitation) carries the content across.
 */
export function TemplatePicker({
  designs,
  currentId,
  hrefFor,
  onLeave,
}: {
  designs: DesignOption[];
  currentId: string;
  hrefFor: (id: string) => string;
  /** Called before leaving for another design (saves the draft). */
  onLeave: () => void;
}) {
  const t = useTranslations("editor");
  const ordered = [...designs].sort((a, b) => Number(b.id === currentId) - Number(a.id === currentId));
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className={label.replace("mb-2 ", "")}>{t("designPickTitle")}</span>
        <Link href="/#templates" className="shrink-0 text-xs font-semibold text-amber-700 hover:underline dark:text-amber-500">
          {t("changeTemplate")}
        </Link>
      </div>
      <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">{t("switchTemplateHint")}</p>
      <ul className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:thin]">
        {ordered.map((d) => {
          const current = d.id === currentId;
          return (
            <li key={d.id} className="w-[46%] max-w-[180px] shrink-0 snap-start">
              <div
                className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition dark:bg-neutral-900 ${
                  current ? "border-amber-500 shadow-amber-500/20" : "border-transparent ring-1 ring-neutral-200 dark:ring-neutral-800"
                }`}
              >
                <TemplateShowcase {...d.showcase} />
                <div className="p-2.5">
                  <p className="truncate font-serif text-sm font-bold text-neutral-900 dark:text-neutral-50">{d.name}</p>
                  <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">{d.tagline}</p>
                  {current ? (
                    <span className="mt-2 flex items-center justify-center gap-1 rounded-full bg-amber-100 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <Check size={13} aria-hidden />
                      {t("currentTemplate")}
                    </span>
                  ) : (
                    <Link
                      href={hrefFor(d.id)}
                      onClick={onLeave}
                      className="mt-2 flex items-center justify-center rounded-full bg-neutral-900 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-amber-400"
                    >
                      {t("useDesign")}
                    </Link>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const ACCENT_PRESETS = ["#b8860b", "#b91c1c", "#be185d", "#c2703d", "#7c3aed", "#2563eb", "#15803d", "#18181b"];

/** Big swatches, the design's own colour first; the last one opens a picker. */
export function ColorPicker({
  value,
  designColor,
  onChange,
}: {
  value: string;
  designColor: string;
  onChange: (c: string) => void;
}) {
  const t = useTranslations("editor");
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  const presets = [designColor, ...ACCENT_PRESETS.filter((c) => !same(c, designColor))];
  const custom = !presets.some((c) => same(c, value));
  return (
    <div>
      <span className={label}>{t("accentColorTitle")}</span>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((c, i) => {
          const on = same(c, value);
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-pressed={on}
              aria-label={i === 0 ? t("colorDefault") : t("accentColorAria", { color: c })}
              title={i === 0 ? t("colorDefault") : c}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-110 ${
                on ? "ring-2 ring-offset-2 ring-offset-[#fffaf2] dark:ring-offset-[#140d18]" : ""
              }`}
              style={{ backgroundColor: c, ["--tw-ring-color" as string]: c }}
            >
              {on && <Check size={18} strokeWidth={3} className="text-white drop-shadow" aria-hidden />}
              {i === 0 && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-white px-1 text-[9px] font-bold text-neutral-700 shadow dark:bg-neutral-800 dark:text-neutral-200">
                  ★
                </span>
              )}
            </button>
          );
        })}
        <label
          className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-sm transition hover:scale-110 ${
            custom ? "ring-2 ring-neutral-900 ring-offset-2 dark:ring-neutral-100" : ""
          }`}
          style={{
            background: custom ? value : "conic-gradient(#ef4444, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)",
          }}
          title={t("colorCustom")}
        >
          <Palette size={16} className="text-white drop-shadow" aria-hidden />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={t("customAccentAria")}
          />
        </label>
      </div>
    </div>
  );
}

/** Each pairing drawn in its own fonts, with the couple's names as the sample. */
export function FontPicker({
  value,
  sample,
  accent,
  onChange,
}: {
  value: string;
  sample: string;
  accent: string;
  onChange: (id: string) => void;
}) {
  const t = useTranslations("editor");
  return (
    <div>
      <span className={label}>{t("fontPairingTitle")}</span>
      <div className="grid grid-cols-2 gap-2.5">
        {FONT_PAIRINGS.map((f) => {
          const on = value === f.id;
          const [main, sub] = f.name.split(" (");
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange(f.id)}
              aria-pressed={on}
              className={`relative flex min-w-0 flex-col items-center rounded-xl border-2 bg-white px-2 pt-3 pb-2 text-center transition dark:bg-neutral-900 ${
                on
                  ? "border-amber-500 shadow-md shadow-amber-500/15"
                  : "border-neutral-200 hover:border-amber-300 dark:border-neutral-800 dark:hover:border-amber-700"
              }`}
            >
              {on && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white">
                  <Check size={10} strokeWidth={3} aria-hidden />
                </span>
              )}
              <span
                className="block max-w-full truncate text-xl leading-snug"
                style={{ fontFamily: f.headingVar, color: accent }}
              >
                {sample}
              </span>
              <span className="mt-0.5 block max-w-full truncate text-xs text-neutral-500 dark:text-neutral-400" style={{ fontFamily: f.bodyVar }}>
                {t("fontSample")}
              </span>
              <span className="mt-2 block max-w-full truncate border-t border-neutral-100 pt-1.5 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase dark:border-neutral-800">
                {sub ? sub.replace(")", "") : main}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Two big cards: the language guests will read the invitation in. */
export function LanguagePicker({
  value,
  onChange,
  showTamilFontTip,
  onUseTamilFont,
}: {
  value: ContentLocale;
  onChange: (l: ContentLocale) => void;
  showTamilFontTip: boolean;
  onUseTamilFont: () => void;
}) {
  const t = useTranslations("editor");
  const options = [
    { id: "en" as const, glyph: "Aa", name: "English" },
    { id: "ta" as const, glyph: "அ", name: "தமிழ்" },
  ];
  return (
    <div>
      <span className={label}>{t("contentLocaleTitle")}</span>
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              lang={o.id}
              onClick={() => onChange(o.id)}
              aria-pressed={on}
              className={`flex items-center gap-3 rounded-xl border-2 bg-white px-3 py-2.5 text-left transition dark:bg-neutral-900 ${
                on
                  ? "border-amber-500 shadow-md shadow-amber-500/15"
                  : "border-neutral-200 hover:border-amber-300 dark:border-neutral-800 dark:hover:border-amber-700"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-serif text-lg font-bold ${
                  on ? "bg-gradient-to-br from-amber-500 to-rose-500 text-white" : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {o.glyph}
              </span>
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{o.name}</span>
              {on && <Check size={16} className="ml-auto text-amber-600" aria-hidden />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{t("contentLocaleHint")}</p>
      {showTamilFontTip && (
        <button
          type="button"
          onClick={onUseTamilFont}
          className="mt-1 text-xs font-semibold text-amber-700 hover:underline dark:text-amber-500"
        >
          {t("useTamilFont")}
        </button>
      )}
    </div>
  );
}
