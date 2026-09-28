import { getTranslations } from "next-intl/server";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/site";
import SocialIcons from "./SocialIcons";
import FooterGate from "./FooterGate";
import { LogoMark } from "./SiteHeader";
import s from "./site.module.css";

/** Site footer for the marketing pages (FooterGate hides it elsewhere). */
export default async function SiteFooter() {
  const t = await getTranslations("site");
  const year = new Date().getFullYear();
  const years = year > SITE.since ? `${SITE.since}–${year}` : `${year}`;

  const columns = [
    {
      title: t("footer.product"),
      links: [
        { href: "/#templates", label: t("nav.templates") },
        { href: "/#pricing", label: t("nav.pricing") },
        { href: "/demo", label: t("footer.demoVideos") },
        { href: "/#templates", label: t("nav.create") },
      ],
    },
    {
      title: t("footer.help"),
      links: [
        { href: "/support", label: t("footer.supportCenter") },
        { href: "/support#faq", label: t("footer.faq") },
        { href: "/support#contact", label: t("footer.contact") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/privacy", label: t("footer.privacy") },
        { href: "/privacy#payments", label: t("footer.payments") },
        { href: "/privacy#your-data", label: t("footer.yourData") },
      ],
    },
  ];

  return (
    <FooterGate>
      <footer className="mt-auto border-t border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className={s.footerEdge} aria-hidden />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <LogoMark />
              <span className={`font-serif text-xl font-bold ${s.wordmark}`}>{t("brand")}</span>
            </Link>
            <p className="max-w-xs text-sm text-neutral-600 dark:text-neutral-400">{t("footer.tagline")}</p>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              {SITE.contact.email && (
                <li>
                  <a href={`mailto:${SITE.contact.email}`} className="inline-flex items-center gap-2 hover:text-amber-700 dark:hover:text-amber-400">
                    <Mail size={15} aria-hidden /> {SITE.contact.email}
                  </a>
                </li>
              )}
              {SITE.contact.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${SITE.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-amber-700 dark:hover:text-amber-400"
                  >
                    <MessageCircle size={15} aria-hidden /> {t("footer.whatsappUs")}
                  </a>
                </li>
              )}
              {SITE.contact.phone && (
                <li>
                  <a href={`tel:+${SITE.contact.phone}`} className="inline-flex items-center gap-2 hover:text-amber-700 dark:hover:text-amber-400">
                    <Phone size={15} aria-hidden /> +{SITE.contact.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-neutral-700 transition hover:text-amber-700 dark:text-neutral-300 dark:hover:text-amber-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
            <p className="text-center text-xs text-neutral-500 sm:text-left dark:text-neutral-400">
              {t("footer.copyright", { years, brand: t("brand") })}
              <span className="mx-2 opacity-40">·</span>
              {t("footer.madeWith")}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{t("footer.follow")}</span>
              <SocialIcons />
            </div>
          </div>
        </div>
      </footer>
    </FooterGate>
  );
}
