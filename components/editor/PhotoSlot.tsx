"use client";

import { useTranslations } from "next-intl";

export default function PhotoSlot({
  index,
  url,
  uploading,
  onChange,
  onRemove,
}: {
  index: number;
  url?: string;
  uploading: boolean;
  onChange: (index: number, file: File | null) => void;
  onRemove: (index: number) => void;
}) {
  const t = useTranslations("editor");
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={t("photoLabel", { n: index + 1 })}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
            aria-label={t("removePhoto")}
          >
            ✕
          </button>
        </>
      ) : (
        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-neutral-400 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400">
          {uploading ? (
            <span className="text-xs">{t("uploading")}</span>
          ) : (
            <>
              <span className="text-xl">+</span>
              <span className="text-[10px]">{t("photoLabel", { n: index + 1 })}</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => onChange(index, e.target.files?.[0] ?? null)}
          />
        </label>
      )}
    </div>
  );
}
