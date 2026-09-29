import { getTranslations } from "next-intl/server";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { SITE, formatPhone } from "@/lib/site";
import FestiveBanner from "./FestiveBanner";
import paper from "@/components/landing/landing.module.css";

/**
 * A legal page (Privacy policy, Terms & conditions): banner, contents,
 * numbered sections and the grievance contact. Text comes from
 * `namespace` in the messages — each section as { title, body: string[] }.
 * Section ids double as link anchors (#payments, #refunds…).
 */
export default async function LegalPage({
  namespace,
  sections,
}: {
  namespace: "site.privacy" | "site.terms";
  sections: readonly { id: string; key: string }[];
}) {
  const t = await getTranslations(namespace);
  const tLegal = await getTranslations("site.legal");

  return (
    <main className={`flex-1 ${paper.paper}`}>
      <FestiveBanner eyebrow={t("eyebrow")} title={t("title")} intro={t("updated")} />
      <article className="mx-auto max-w-3xl px-6 pt-4 pb-20">
        <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">{t("intro")}</p>

        <nav aria-label={tLegal("contents")} className={`mt-8 p-5 ${paper.festiveCard}`}>
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">{tLegal("contents")}</p>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {sections.map((sec, i) => (
              <li key={sec.id}>
                <a href={`#${sec.id}`} className="text-neutral-700 hover:text-amber-700 dark:text-neutral-300 dark:hover:text-amber-400">
                  {i + 1}. {t(`${sec.key}.title`)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {sections.map((sec, i) => (
          <section key={sec.id} id={sec.id} className="mt-10 scroll-mt-24">
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {i + 1}. {t(`${sec.key}.title`)}
            </h2>
            <div className="mt-3 space-y-3 leading-relaxed text-neutral-700 dark:text-neutral-300">
              {(t.raw(`${sec.key}.body`) as string[]).map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          </section>
        ))}

        <section id="contact" className="mt-10 scroll-mt-24 rounded-2xl bg-amber-50 p-6 dark:bg-neutral-900">
          <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">{tLegal("contactTitle")}</h2>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{tLegal("contactBody")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${SITE.contact.email}`} className="inline-flex items-center gap-2 font-semibold text-amber-800 underline dark:text-amber-400">
                <Mail size={15} aria-hidden /> {SITE.contact.email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${SITE.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-amber-800 underline dark:text-amber-400"
              >
                <MessageCircle size={15} aria-hidden /> WhatsApp {formatPhone(SITE.contact.whatsapp)}
              </a>
            </li>
            {SITE.contact.phones.map((p) => (
              <li key={p}>
                <a href={`tel:+${p}`} className="inline-flex items-center gap-2 font-semibold text-amber-800 underline dark:text-amber-400">
                  <Phone size={15} aria-hidden /> {formatPhone(p)}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">{tLegal("grievance")}</p>
        </section>
      </article>
    </main>
  );
}
