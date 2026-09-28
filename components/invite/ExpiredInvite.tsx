"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Hourglass } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * What guests see once an invitation has expired (lib/expiry.ts): who it
 * was for, when it ended, and — for the host — how to bring it back.
 * Nothing else from the invitation is shown.
 */
export default function ExpiredInvite({
  title,
  endedAt,
  accentColor,
}: {
  title: string;
  endedAt: number;
  accentColor: string;
}) {
  const t = useTranslations("invitePage");
  const format = useFormatter();
  const ended = format.dateTime(new Date(endedAt), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <span
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: accentColor }}
        >
          <Hourglass size={20} aria-hidden />
        </span>
        <p className="mt-5 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
          {title}
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          {t("expiredTitle")}
        </h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {t("expiredBody", { date: ended })}
        </p>
        <p className="mt-6 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          {t("expiredHostHint")}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold underline underline-offset-4"
          style={{ color: accentColor }}
        >
          {t("expiredCta")}
        </Link>
      </div>
    </main>
  );
}
