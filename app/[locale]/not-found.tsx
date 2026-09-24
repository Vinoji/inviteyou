import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold tracking-widest text-amber-700 uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">
        {t("heading")}
      </h1>
      <p className="mt-3 max-w-md text-sm text-neutral-600 dark:text-neutral-400">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
      >
        {t("cta")}
      </Link>
    </main>
  );
}
