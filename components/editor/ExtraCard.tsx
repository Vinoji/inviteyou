"use client";

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { SectionToggle } from "./FormFields";

/**
 * One optional part of the invitation as a card: icon, name, a one-line
 * summary and its on/off switch. Tap it to open the fields; closed, the
 * whole list of extras fits on a screen.
 */
export default function ExtraCard({
  icon: Icon,
  title,
  summary,
  toggle,
  children,
  defaultOpen = false,
}: {
  icon: LucideIcon;
  title: string;
  summary?: string;
  toggle?: { enabled: boolean; onChange: (value: boolean) => void };
  /** Omit for an on/off-only section. */
  children?: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const off = toggle && !toggle.enabled;
  return (
    <section
      className={`rounded-2xl border bg-white shadow-sm transition dark:bg-neutral-900 ${
        open ? "border-amber-300 dark:border-amber-800" : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => children && setOpen((o) => !o)}
          aria-expanded={children ? open : undefined}
          className={`flex min-w-0 flex-1 items-center gap-3 text-left ${children ? "" : "cursor-default"}`}
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              off
                ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                : "bg-gradient-to-br from-amber-100 to-rose-100 text-amber-700 dark:from-amber-950 dark:to-rose-950 dark:text-amber-400"
            }`}
          >
            <Icon size={18} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-sm font-semibold ${off ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-900 dark:text-neutral-50"}`}>
              {title}
            </span>
            {summary && <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">{summary}</span>}
          </span>
          {children && (
            <ChevronDown
              size={16}
              className={`shrink-0 text-neutral-400 transition ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
          )}
        </button>
        {toggle && <SectionToggle enabled={toggle.enabled} onChange={toggle.onChange} />}
      </div>
      {open && children && (
        <div className={`space-y-3 border-t border-neutral-100 p-3 dark:border-neutral-800 ${off ? "opacity-50" : ""}`}>
          {children}
        </div>
      )}
    </section>
  );
}
