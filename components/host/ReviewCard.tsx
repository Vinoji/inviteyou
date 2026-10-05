"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

/**
 * "How was InviteForYou?" on the owner's guest list: stars, a few words,
 * and whether to show their first names. Saved for approval (POST
 * /api/review); shown on the home page once approved.
 */
export default function ReviewCard({
  slug,
  token,
  eventPassed,
  existing,
}: {
  slug: string;
  token: string;
  eventPassed: boolean;
  existing: { rating: number; comment: string; showNames: boolean } | null;
}) {
  const t = useTranslations("host.review");
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [showNames, setShowNames] = useState(existing?.showNames ?? true);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(existing ? "done" : "idle");
  const [error, setError] = useState("");

  async function submit() {
    setState("saving");
    setError("");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, token, rating, comment, showNames }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? t("error"));
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
      setState("error");
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#e8b04a]/40 bg-gradient-to-br from-[#fff6e0] to-[#fffaf2] p-5 shadow-sm dark:from-[#2a0c27] dark:to-[#1c1220]">
      <h2 className="font-serif text-lg font-bold text-[#2a0c27] dark:text-[#fff6e6]">
        {eventPassed ? t("titleAfter") : t("titleBefore")}
      </h2>
      {state === "done" ? (
        <div className="mt-2 text-sm text-[#5a3a12] dark:text-[#ffe9b8]">
          <p>{t("thanks")}</p>
          <button type="button" onClick={() => setState("idle")} className="mt-2 font-semibold underline">
            {t("edit")}
          </button>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{t("sub")}</p>
          <div className="mt-3 flex gap-1" role="radiogroup" aria-label={t("ratingLabel")}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={t("stars", { n })}
                onClick={() => setRating(n)}
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[#e8b04a]/15"
              >
                <Star size={26} className={n <= rating ? "fill-[#f2c45a] text-[#c98f3a]" : "text-neutral-300 dark:text-neutral-600"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={400}
            rows={3}
            placeholder={t("placeholder")}
            className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} className="h-4 w-4" />
            {t("showNames")}
          </label>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={state === "saving" || rating === 0 || comment.trim().length < 10}
            className="mt-3 h-11 rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] px-6 text-sm font-bold text-[#2a0c27] disabled:opacity-50"
          >
            {state === "saving" ? t("sending") : t("submit")}
          </button>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{t("note")}</p>
        </>
      )}
    </section>
  );
}
