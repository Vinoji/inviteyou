"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Catches any uncaught client-side error thrown while rendering this
 * segment (landing, editor, invite, rsvps) and shows a recoverable screen
 * instead of leaving a blank page — without this, React 19 just unmounts
 * the tree on an uncaught error and nothing renders at all. `reset()` lets
 * the user retry without a full page reload; "Go home" is the fallback for
 * errors `reset()` can't clear (e.g. bad state that would just recur).
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorBoundary");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        {t("heading")}
      </h1>
      <p className="mt-3 max-w-md text-sm text-neutral-600 dark:text-neutral-400">{t("body")}</p>
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
        >
          {t("goHome")}
        </Link>
      </div>
    </main>
  );
}
