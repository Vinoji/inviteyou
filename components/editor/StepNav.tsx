"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight, Check, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import e from "./editor.module.css";

export interface EditorStep {
  id: string;
  /** Short label for the step bar. */
  label: string;
  /** Heading shown above the step's fields. */
  title: string;
  hint: string;
  icon: LucideIcon;
  /** Filled in enough to tick off in the step bar. */
  done: boolean;
}

/**
 * The editor's step bar: every part of the invitation one tap away, with a
 * tick on the parts already filled in. Steps are free to visit in any
 * order — it's a map, not a gate.
 */
export function StepNav({
  steps,
  current,
  onSelect,
}: {
  steps: EditorStep[];
  current: string;
  onSelect: (id: string) => void;
}) {
  const index = steps.findIndex((s) => s.id === current);
  return (
    <nav className="px-2 pt-2 pb-2 lg:px-3 lg:pt-2 lg:pb-3">
      <ol className="relative flex items-start justify-between">
        {/* track + progress behind the dots */}
        <span
          aria-hidden
          className={`absolute top-4 right-[10%] left-[10%] h-0.5 rounded lg:top-[18px] ${e.track}`}
        />
        <span
          aria-hidden
          className={`absolute top-4 left-[10%] h-0.5 rounded transition-[width] duration-500 lg:top-[18px] ${e.progress}`}
          style={{ width: `${(Math.max(index, 0) / Math.max(steps.length - 1, 1)) * 80}%` }}
        />
        {steps.map((s, i) => {
          const active = s.id === current;
          const Icon = s.icon;
          return (
            <li key={s.id} className="relative z-10 flex flex-1 justify-center">
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-current={active ? "step" : undefined}
                className="group flex min-w-0 flex-col items-center gap-1 px-0.5"
              >
                <span
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition lg:h-9 lg:w-9 ${
                    active ? `scale-110 ${e.dotActive}` : s.done ? e.dotDone : e.dot
                  }`}
                >
                  <Icon size={16} aria-hidden />
                  {s.done && !active && (
                    <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-[#2a0c27]">
                      <Check size={10} strokeWidth={3} aria-hidden />
                    </span>
                  )}
                </span>
                <span
                  className={`max-w-full truncate text-[11px] leading-tight font-semibold ${
                    active ? e.stepLabelActive : e.stepLabel
                  }`}
                >
                  <span className="sr-only">{i + 1}. </span>
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Title + hint at the top of a step. */
export function StepHeader({ step, n, total }: { step: EditorStep; n: number; total: number }) {
  const t = useTranslations("editor");
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-500">
        {t("stepCount", { n, total })}
      </p>
      <h2 className="mt-0.5 font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">{step.title}</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{step.hint}</p>
    </div>
  );
}

/** Back / Next at the bottom of a step. */
export function StepFooter({
  prev,
  next,
  onSelect,
  onFinish,
}: {
  prev?: EditorStep;
  next?: EditorStep;
  onSelect: (id: string) => void;
  /** Last step on a phone: jump to the preview to check and publish. */
  onFinish?: () => void;
}) {
  const t = useTranslations("editor");
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-dashed border-amber-900/15 pt-5 dark:border-amber-100/15">
      {prev ? (
        <button
          type="button"
          onClick={() => onSelect(prev.id)}
          className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ArrowLeft size={15} aria-hidden />
          {t("back")}
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button
          type="button"
          onClick={() => onSelect(next.id)}
          className={`inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold ${e.gold}`}
        >
          {t("nextStep", { step: next.label })}
          <ArrowRight size={15} aria-hidden />
        </button>
      ) : onFinish ? (
        <>
          <button
            type="button"
            onClick={onFinish}
            className={`inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold lg:hidden ${e.gold}`}
          >
            <Eye size={15} aria-hidden />
            {t("previewAndPublish")}
          </button>
          <p className="hidden text-right text-sm font-medium text-emerald-700 lg:block dark:text-emerald-400">{t("readyHint")}</p>
        </>
      ) : (
        <p className="text-right text-sm font-medium text-emerald-700 dark:text-emerald-400">{t("readyHint")}</p>
      )}
    </div>
  );
}
