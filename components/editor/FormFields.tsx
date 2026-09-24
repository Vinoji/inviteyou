"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

/** A small on/off switch for toggling a section's visibility on the public page. */
export function SectionToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  const t = useTranslations("editor");
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? t("hideSection") : t("showSection")}
      onClick={() => onChange(!enabled)}
      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
    >
      {enabled ? t("shown") : t("hidden")}
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          enabled ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-300 dark:bg-neutral-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform dark:bg-neutral-900 ${
            enabled ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

export function FormSection({
  title,
  children,
  toggle,
}: {
  title: string;
  children: ReactNode;
  /** When present, renders a Shown/Hidden switch next to the title and
   * dims (without disabling) the fields when toggled off. */
  toggle?: { enabled: boolean; onChange: (value: boolean) => void };
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
          {title}
        </h2>
        {toggle && <SectionToggle enabled={toggle.enabled} onChange={toggle.onChange} />}
      </div>
      <div className={`space-y-3 transition-opacity ${toggle && !toggle.enabled ? "opacity-45" : ""}`}>
        {children}
      </div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-500 dark:placeholder:text-neutral-600";
