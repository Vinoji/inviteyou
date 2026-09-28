import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Diya, Thoranam } from "@/components/site/festive";
import festive from "@/components/landing/landing.module.css";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className={`flex flex-1 flex-col items-center px-6 pb-24 text-center ${festive.paper}`}>
      <div className="w-screen">
        <Thoranam compact />
      </div>
      <div className="relative mt-14 h-16 w-20">
        <Diya className={festive.diyaL} />
      </div>
      <p className="mt-2 text-sm font-semibold tracking-widest text-amber-700 uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">
        {t("heading")}
      </h1>
      <p className="mt-3 max-w-md text-sm text-neutral-600 dark:text-neutral-400">{t("body")}</p>
      <Link
        href="/"
        className={`mt-8 ${festive.ctaPrimary}`}
      >
        {t("cta")}
      </Link>
    </main>
  );
}
