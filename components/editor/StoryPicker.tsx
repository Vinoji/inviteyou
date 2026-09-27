"use client";

import { useTranslations } from "next-intl";
import { PenLine } from "lucide-react";
import { scriptLang } from "@/lib/monogram";

export interface StoryOption {
  id: string;
  title: string;
  tag: string;
  /** The story with the current names filled in. */
  preview: string;
}

/** A swipeable row of ready-made stories; choosing one fills the story box. */
export default function StoryPicker({
  options,
  selectedId,
  onChoose,
  onWriteOwn,
}: {
  options: StoryOption[];
  selectedId: string | null;
  onChoose: (id: string) => void;
  onWriteOwn: () => void;
}) {
  const t = useTranslations("editor");
  if (options.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {t("storyPickerTitle")}
        </p>
        <button
          type="button"
          onClick={onWriteOwn}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <PenLine size={12} aria-hidden />
          {t("storyWriteOwn")}
        </button>
      </div>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("storyPickerHint")}</p>
      <div className="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-5 px-5 pt-1 pb-2">
        {options.map((o) => {
          const selected = o.id === selectedId;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChoose(o.id)}
              aria-pressed={selected}
              className={`flex w-[min(15rem,78vw)] shrink-0 snap-start flex-col gap-1.5 rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 dark:border-neutral-100 dark:bg-neutral-800 dark:ring-neutral-100"
                  : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {o.tag}
                </span>
                {selected && (
                  <span className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("storySelected")}
                  </span>
                )}
              </span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                {o.title}
              </span>
              <span
                lang={scriptLang(o.preview)}
                className="line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400"
              >
                {o.preview}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
