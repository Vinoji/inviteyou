import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Baby,
  BellRing,
  Briefcase,
  Cake,
  Gem,
  Heart,
  House,
  PartyPopper,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Petals } from "../site/festive";
import s from "./landing.module.css";

const OCCASION_ICONS: Record<string, LucideIcon> = {
  wedding: Heart,
  engagement: Gem,
  anniversary: Sparkles,
  valentine: Heart,
  proposal: Gem,
  birthday: Cake,
  housewarming: House,
  baby: Baby,
  corporate: Briefcase,
};
const PILL_COLORS = [
  "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  "bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
  "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  "bg-violet-100 text-violet-900 dark:bg-violet-500/15 dark:text-violet-200",
  "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200",
];

/** Two rows of occasion pills sliding in opposite directions. */
export function OccasionMarquee({ occasions }: { occasions: { id: string; label: string }[] }) {
  const pills = (offset: number) =>
    [...occasions, ...occasions].map((o, i) => {
      const Icon = OCCASION_ICONS[o.id] ?? PartyPopper;
      return (
        <li key={`${o.id}-${i}`} className={`${s.pill} ${PILL_COLORS[(i + offset) % PILL_COLORS.length]}`}>
          <Icon size={16} aria-hidden />
          {o.label}
        </li>
      );
    });
  return (
    <div className={s.marquee} aria-hidden>
      <ul className={s.track}>{pills(0)}</ul>
      <ul className={`${s.track} ${s.trackReverse}`}>{pills(2)}</ul>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={s.eyebrow}>{eyebrow}</p>
      <h2 className={`${s.h2} text-neutral-900 dark:text-neutral-50`}>{title}</h2>
      {sub && <p className="mt-3 text-neutral-600 dark:text-neutral-400">{sub}</p>}
    </div>
  );
}

/** Three steps, each with its own little looping scene. */
export async function HowItWorks() {
  const t = await getTranslations("landing.how");
  const steps = [
    {
      key: "s1",
      bg: "bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-500/15 dark:to-rose-500/10",
      art: (
        <>
          <span className={`${s.fanCard} bg-gradient-to-br from-emerald-700 to-emerald-900`} />
          <span className={`${s.fanCard} bg-gradient-to-br from-rose-300 to-amber-200`} />
          <span className={`${s.fanCard} bg-gradient-to-br from-indigo-900 to-fuchsia-800`} />
        </>
      ),
    },
    {
      key: "s2",
      bg: "bg-gradient-to-br from-violet-100 to-sky-100 dark:from-violet-500/15 dark:to-sky-500/10",
      art: (
        <div className={s.typeCard}>
          <span className={s.typed}>{t("typed")}</span>
          <div className={s.swatches}>
            <span style={{ background: "#b8860b" }} />
            <span style={{ background: "#d9738a" }} />
            <span style={{ background: "#15803d" }} />
          </div>
        </div>
      ),
    },
    {
      key: "s3",
      bg: "bg-gradient-to-br from-emerald-100 to-lime-100 dark:from-emerald-500/15 dark:to-lime-500/10",
      art: (
        <div className={s.chat}>
          <span className={s.bubble}>{t("bubble1")}</span>
          <span className={s.bubble}>{t("bubble2")}</span>
          <span className={s.bubble}>{t("bubble3")}</span>
        </div>
      ),
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.key} className={`${s.festiveCard} p-4`}>
            <div className={`${s.stepArt} ${step.bg}`} aria-hidden>
              {step.art}
            </div>
            <div className="mt-4 flex items-start gap-3 px-1">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{t(`${step.key}Title`)}</h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t(`${step.key}Body`)}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Six feature tiles, each with a small looping 2D animation. */
export async function FeatureBento() {
  const t = await getTranslations("landing.bento");
  const tiles = [
    {
      key: "rsvp",
      span: "md:col-span-2",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      art: (
        <div className={s.bars}>
          <span style={{ height: "90%" }} />
          <span style={{ height: "70%" }} />
          <span style={{ height: "55%" }} />
          <span style={{ height: "30%" }} />
        </div>
      ),
    },
    {
      key: "remind",
      span: "",
      bg: "bg-rose-50 dark:bg-rose-500/10",
      art: (
        <>
          <BellRing size={62} className={`${s.bell} text-rose-500`} aria-hidden />
          <span className={s.badge}>3</span>
        </>
      ),
    },
    {
      key: "lang",
      span: "",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      art: (
        <div className={`${s.letters} text-amber-600`}>
          <span>A</span>
          <span>அ</span>
        </div>
      ),
    },
    {
      key: "cal",
      span: "",
      bg: "bg-sky-50 dark:bg-sky-500/10",
      art: (
        <div className={s.cal}>
          <span>{t("calMonth")}</span>
          <span className={s.calPage}>24</span>
        </div>
      ),
    },
    {
      key: "qr",
      span: "",
      bg: "bg-violet-50 dark:bg-violet-500/10",
      art: (
        <div className={s.qr}>
          {Array.from({ length: 49 }, (_, i) => (
            <i key={i} />
          ))}
          <span className={s.scan} />
        </div>
      ),
    },
    {
      key: "photos",
      span: "md:col-span-2",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      art: (
        <>
          {["from-rose-300 to-amber-200", "from-sky-300 to-emerald-200", "from-violet-300 to-pink-200"].map((g) => (
            <span key={g} className={s.polaroid}>
              <i className={`bg-gradient-to-br ${g}`} />
            </span>
          ))}
        </>
      ),
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.key} className={`${s.tile} ${tile.bg} ${tile.span}`}>
            <div className={s.tileArt} aria-hidden>
              {tile.art}
            </div>
            <h3 className="mt-20 font-semibold text-neutral-900 dark:text-neutral-50">{t(`${tile.key}Title`)}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{t(`${tile.key}Body`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Closing call to action on a dusk band with falling petals. */
export async function FinalCta() {
  const t = await getTranslations("landing.finale");
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className={s.finale}>
        <Petals />
        <h2 className={`${s.h2} mx-auto max-w-2xl`}>{t("title")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-[#fff6e6]/80">{t("body")}</p>
        <Link href="/#templates" className={`${s.ctaPrimary} mt-7`}>
          {t("button")}
          <ArrowRight size={17} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
