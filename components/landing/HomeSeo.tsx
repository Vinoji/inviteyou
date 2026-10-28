import { getTranslations } from "next-intl/server";
import { ArrowRight, CalendarPlus, Check, ChevronDown, Gift, Languages, MapPin, MessageCircle, Sparkles, Users, Video, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/site";
import { standardPriceInr } from "@/lib/pricing";
import { COLLECTIONS } from "@/lib/collections";
import { SectionHeading } from "./Sections";
import paper from "./landing.module.css";

const OCCASIONS = ["wedding", "engagement", "birthday", "housewarming", "anniversary", "baby", "valentine", "proposal", "corporate"] as const;
const FEATURE_ICONS = [Sparkles, Languages, MapPin, CalendarPlus, Users, Video, Gift, MessageCircle];

/** Why a live invitation beats printed cards and PDFs — three columns. */
export async function WhyDigital() {
  const t = await getTranslations("landing.home.why");
  const cols = [
    { key: "printed", good: false },
    { key: "pdf", good: false },
    { key: "live", good: true },
  ] as const;
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading eyebrow="" title={t("title")} sub={t("sub")} />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cols.map(({ key, good }) => (
          <div
            key={key}
            className={`${paper.festiveCard} p-6 ${good ? "ring-2 ring-[#e8b04a]" : ""}`}
          >
            <h3 className="font-serif text-xl font-bold text-[#2a0c27] dark:text-[#fff6e6]">{t(`${key}.title`)}</h3>
            <ul className="mt-4 space-y-2.5">
              {Object.keys(t.raw(`${key}.items`) as Record<string, string>).map((i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {good ? (
                    <Check size={17} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <X size={17} className="mt-0.5 shrink-0 text-rose-500" aria-hidden />
                  )}
                  {t(`${key}.items.${i}`)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Everything a guest gets in the link. */
export async function Features() {
  const t = await getTranslations("landing.home.features");
  const keys = Object.keys(t.raw("items") as Record<string, unknown>);
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading eyebrow="" title={t("title")} sub={t("sub")} />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {keys.map((k, i) => {
          const Icon = FEATURE_ICONS[i] ?? Sparkles;
          return (
            <li key={k} className={`${paper.festiveCard} p-5`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                <Icon size={19} aria-hidden />
              </span>
              <h3 className="mt-3 font-semibold text-[#2a0c27] dark:text-[#fff6e6]">{t(`items.${k}.t`)}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{t(`items.${k}.d`)}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Every occasion and tradition page, with descriptive links. */
export async function OccasionsGrid() {
  const t = await getTranslations("landing.home.occasions");
  const tSeo = await getTranslations("seoPages");
  const links = [
    ...OCCASIONS.map((id) => ({ href: `/invitations/${id}`, title: tSeo(`${id}.h1`), text: tSeo(`${id}.ogDescription`) })),
    ...COLLECTIONS.map((c) => ({ href: `/invitations/${c.slug}`, title: tSeo(`${c.slug}.h1`), text: tSeo(`${c.slug}.ogDescription`) })),
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading eyebrow="" title={t("title")} sub={t("sub")} />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={`${paper.festiveCard} group block h-full p-5 hover:-translate-y-0.5`}>
              <span className="flex items-start justify-between gap-2 font-semibold text-[#2a0c27] dark:text-[#fff6e6]">
                {l.title}
                <ArrowRight size={16} className="mt-1 shrink-0 text-amber-700 transition group-hover:translate-x-1" aria-hidden />
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{l.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Real examples: the demo videos, YouTube, the wording guides, all designs. */
export async function Examples() {
  const t = await getTranslations("landing.home.examples");
  const items = [
    { href: "/demo", title: t("demo"), text: t("demoText"), external: false },
    ...(SITE.social.youtube ? [{ href: SITE.social.youtube, title: t("youtube"), text: t("youtubeText"), external: true }] : []),
    { href: "/blog/tamil-wedding-invitation-wording", title: t("wording"), text: t("wordingText"), external: false },
    { href: "/blog/whatsapp-wedding-invitation-message", title: t("whatsapp"), text: t("whatsappText"), external: false },
    { href: "/templates", title: t("all"), text: t("allText"), external: false },
  ];
  const card = `${paper.festiveCard} group block h-full p-5 hover:-translate-y-0.5`;
  const inner = (i: (typeof items)[number]) => (
    <>
      <span className="flex items-start justify-between gap-2 font-semibold text-[#2a0c27] dark:text-[#fff6e6]">
        {i.title}
        <ArrowRight size={16} className="mt-1 shrink-0 text-amber-700 transition group-hover:translate-x-1" aria-hidden />
      </span>
      <span className="mt-1.5 block text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{i.text}</span>
    </>
  );
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading eyebrow="" title={t("title")} sub={t("sub")} />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <li key={i.href}>
            {i.external ? (
              <a href={i.href} target="_blank" rel="noopener noreferrer" className={card}>
                {inner(i)}
              </a>
            ) : (
              <Link href={i.href} className={card}>
                {inner(i)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A short FAQ, with its FAQPage schema. */
export async function HomeFaq() {
  const t = await getTranslations("landing.home.faq");
  const price = standardPriceInr();
  const keys = Object.keys(t.raw("items") as Record<string, unknown>);
  const qa = keys.map((k) => ({ q: t(`items.${k}.q`), a: t(`items.${k}.a`, { price }) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-14 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <h2 className="text-center font-serif text-3xl font-bold text-[#2a0c27] dark:text-[#fff6e6]">{t("title")}</h2>
      <div className="mt-8 space-y-3">
        {qa.map((x) => (
          <details key={x.q} className={`${paper.festiveCard} group p-5`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#2a0c27] dark:text-[#fff6e6]">
              {x.q}
              <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{x.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
