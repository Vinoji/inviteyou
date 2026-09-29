"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { inputClass } from "./FormFields";

/** "Things to know": up to four question / answer pairs. */
export default function FaqFields({
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  items: { question: string; answer: string }[];
  onChange: (index: number, field: "question" | "answer", value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const t = useTranslations("editor");
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
              {t("questionLabel", { n: i + 1 })}
            </span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-neutral-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400"
              aria-label={t("removeQuestion")}
            >
              <Trash2 size={14} />
            </button>
          </div>
          <input
            className={`${inputClass} mb-2`}
            value={item.question}
            onChange={(e) => onChange(i, "question", e.target.value)}
            placeholder={t("questionPlaceholder")}
          />
          <textarea
            className={inputClass}
            rows={2}
            value={item.answer}
            onChange={(e) => onChange(i, "answer", e.target.value)}
            placeholder={t("answerPlaceholder")}
          />
        </div>
      ))}
      {items.length < 4 && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-300"
        >
          <Plus size={14} />
          {t("addQuestion", { count: items.length })}
        </button>
      )}
    </div>
  );
}
