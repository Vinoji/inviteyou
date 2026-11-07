"use client";

import { useTranslations } from "next-intl";
import festive from "@/components/landing/landing.module.css";

/**
 * The editor's shape — the form panel and the phone preview — shown while
 * the editor starts up in the browser (the Suspense fallback in page.tsx:
 * the editor reads the URL, so the prebuilt page carries this instead).
 */
export default function EditorSkeleton() {
  const t = useTranslations("common");
  const bar = "rounded-md bg-neutral-300/60 dark:bg-white/10";
  return (
    <div className="flex h-[calc(100dvh-2.75rem)] flex-col lg:flex-row" aria-busy="true" role="status">
      <span className="sr-only">{t("openingDesign")}</span>
      <div
        className={`flex flex-1 animate-pulse flex-col gap-4 p-5 lg:w-[440px] lg:flex-none lg:border-r lg:border-neutral-200 dark:lg:border-neutral-800 ${festive.formPaper}`}
        aria-hidden
      >
        <div className={`${bar} h-3 w-24`} />
        <div className={`${bar} h-6 w-48`} />
        <div className="mt-2 flex gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 w-11 rounded-full bg-neutral-300/60 dark:bg-white/10" />
          ))}
        </div>
        <div className={`${bar} mt-4 h-5 w-40`} />
        <div className="grid grid-cols-2 gap-3">
          <div className={`${bar} h-10`} />
          <div className={`${bar} h-10`} />
        </div>
        <div className={`${bar} h-10`} />
        <div className={`${bar} h-24`} />
        <div className="mt-auto h-12 rounded-full bg-amber-300/50 dark:bg-amber-400/20" />
      </div>
      <div className="hidden flex-1 items-center justify-center bg-neutral-100 lg:flex dark:bg-neutral-900" aria-hidden>
        <div className="h-[70%] w-[min(360px,40%)] animate-pulse rounded-[2rem] bg-neutral-300/60 dark:bg-white/10" />
      </div>
    </div>
  );
}
