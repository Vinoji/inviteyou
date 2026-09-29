import { getTranslations } from "next-intl/server";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SITE, formatPhone } from "@/lib/site";
import SocialIcons from "./SocialIcons";
import FooterGate from "./FooterGate";
import { LogoMark } from "./SiteHeader";
import { Diya, Kolam } from "./festive";
import s from "./site.module.css";

/**
 * Festival-night footer for the marketing pages (FooterGate hides it
 * elsewhere): the page's paper curves into a plum night, a row of brass
 * lamps flickers along the top, a kolam glows faintly behind gold headings.
 */
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
        { href: "/terms", label: t("footer.terms") },
        { href: "/terms#refunds", label: t("footer.payments") },
        { href: "/privacy#your-data", label: t("footer.yourData") },
      ],
    },
  ];

  return (
    <FooterGate>
      <footer className={s.footer}>
        <div className={s.footerHills} aria-hidden>
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
            <path d="M0 0 H1440 V34 C1250 62 1060 18 860 40 S420 66 220 38 S40 30 0 44 Z" fill="var(--footer-paper)" />
          </svg>
        </div>
        <div className={s.diyaRow} aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <Diya key={i} className="" />
          ))}
        </div>
        <Kolam className={s.footerKolam} />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pt-16 pb-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <LogoMark />
              <span className={`font-serif text-xl font-bold ${s.wordmark} ${s.wordmarkLight}`}>{t("brand")}</span>
            </Link>
            <p className="max-w-xs text-sm text-[#f6e7d0]/75">{t("footer.tagline")}</p>
            <ul className="space-y-2 text-sm">
              {SITE.contact.email && (
                <li>
                  <a href={`mailto:${SITE.contact.email}`} className={`inline-flex items-center gap-2 ${s.footerLink}`}>
                    <Mail size={15} className="text-[#e8b04a]" aria-hidden /> {SITE.contact.email}
                  </a>
                </li>
              )}
              {SITE.contact.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${SITE.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 ${s.footerLink}`}
                  >
                    <MessageCircle size={15} className="text-[#e8b04a]" aria-hidden /> {t("footer.whatsappUs")}
                  </a>
                </li>
              )}
              {SITE.contact.phones.map((p) => (
                <li key={p}>
                  <a href={`tel:+${p}`} className={`inline-flex items-center gap-2 ${s.footerLink}`}>
                    <Phone size={15} className="text-[#e8b04a]" aria-hidden /> {formatPhone(p)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className={s.footerHeading}>{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={`text-sm ${s.footerLink}`}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`relative z-10 ${s.footerBottom}`}>
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
            <p className="text-center text-xs text-[#f6e7d0]/65 sm:text-left">
              {t("footer.copyright", { years, brand: t("brand") })}
              <span className="mx-2 text-[#e8b04a]">✿</span>
              {t("footer.madeWith")}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#f6e7d0]/65">{t("footer.follow")}</span>
              <SocialIcons variant="gold" />
            </div>
          </div>
        </div>
      </footer>
    </FooterGate>
  );
}
