import { getTranslations } from "next-intl/server";
import { Quote, Star } from "lucide-react";
import { getApprovedReviews } from "@/lib/reviews";

/**
 * "What families say": approved reviews from couples who published with us
 * (lib/reviews.ts). Renders nothing until there is at least one — no
 * placeholder or sample reviews, ever.
 */
export default async function Reviews() {
  const reviews = await getApprovedReviews(6);
  if (reviews.length === 0) return null;
  const t = await getTranslations("landing.reviews");
  const tCategories = await getTranslations("categories");
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-[#b0791f] uppercase dark:text-[#ffd35c]">{t("eyebrow")}</p>
        <h2 className="mt-2 font-serif text-3xl font-bold text-[#2a0c27] dark:text-[#fff6e6]">{t("title")}</h2>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300">
          <Star size={16} className="fill-[#f2c45a] text-[#c98f3a]" aria-hidden />
          {t("summary", { average: average.toFixed(1), count: reviews.length })}
        </p>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <li
            key={r.slug}
            className="relative rounded-2xl border border-[#e8b04a]/30 bg-[#fffaf2] p-5 shadow-[0_14px_30px_-20px_rgba(61,18,54,0.6)] dark:bg-[#1c1220]"
          >
            <Quote size={22} className="absolute top-4 right-4 text-[#e8b04a]/40" aria-hidden />
            <p className="flex gap-0.5" aria-label={t("stars", { n: r.rating })}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={i < r.rating ? "fill-[#f2c45a] text-[#c98f3a]" : "text-neutral-300 dark:text-neutral-600"}
                  aria-hidden
                />
              ))}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">“{r.comment}”</p>
            <p className="mt-3 text-xs font-semibold text-[#5a3a4f] dark:text-[#f6e7d0]/80">
              {[r.names || t("anonymous"), tCategories(`${r.occasion}.label`), r.city].filter(Boolean).join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
