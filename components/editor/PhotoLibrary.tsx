"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { PHOTO_LIBRARY, forCategory, type LibraryPhoto } from "@/lib/mediaLibrary";

/**
 * Ready-made photos for couples without their own: suggested for this
 * occasion first, pick several, add them in one go. Nothing is uploaded —
 * the invitation just points at the library file.
 */
export default function PhotoLibrary({
  category,
  room,
  existing,
  onAdd,
  onClose,
}: {
  category: string;
  /** How many more photos fit. */
  room: number;
  /** Photos already in the invitation (shown as added). */
  existing: string[];
  onAdd: (srcs: string[]) => void;
  onClose: () => void;
}) {
  const t = useTranslations("editor");
  const [picked, setPicked] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { suggested, others } = forCategory(PHOTO_LIBRARY, category);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  function toggle(src: string) {
    setPicked((p) => (p.includes(src) ? p.filter((x) => x !== src) : p.length < room ? [...p, src] : p));
  }

  function grid(items: LibraryPhoto[]) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((p) => {
          const added = existing.includes(p.src);
          const n = picked.indexOf(p.src);
          const full = n < 0 && picked.length >= room;
          return (
            <button
              key={p.id}
              type="button"
              disabled={added || full}
              onClick={() => toggle(p.src)}
              aria-pressed={n >= 0}
              aria-label={t("photoLibrary.photoN", { n: PHOTO_LIBRARY.indexOf(p) + 1 })}
              className={`relative aspect-square overflow-hidden rounded-lg ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ${
                n >= 0 ? "ring-3 ring-amber-500" : ""
              } ${added || full ? "opacity-40" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
              {(n >= 0 || added) && (
                <span className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                  {added ? <Check size={14} /> : n + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("photoLibrary.title")}
        tabIndex={-1}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="flex max-h-[88svh] w-full max-w-[620px] flex-col rounded-2xl bg-white shadow-xl outline-none dark:bg-neutral-900"
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 p-4 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{t("photoLibrary.title")}</h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {t("photoLibrary.hint", { room })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cropCancel")}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto p-4">
          {suggested.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                {t("photoLibrary.suggested")}
              </p>
              {grid(suggested)}
            </section>
          )}
          <section>
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              {t("photoLibrary.more")}
            </p>
            {grid(others)}
          </section>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("photoLibrary.credit")}</p>
          <button
            type="button"
            disabled={picked.length === 0}
            onClick={() => onAdd(picked)}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {t("photoLibrary.add", { count: picked.length })}
          </button>
        </div>
      </div>
    </div>
  );
}
