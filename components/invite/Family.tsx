import { useTranslations } from "next-intl";
import { getFontPairing } from "@/lib/fontPairings";
import SectionDivider from "./SectionDivider";

export default function Family({
  groomName,
  brideName,
  groomParents,
  brideParents,
  accentColor,
  fontPairing,
  templateId,
  title,
  intro,
}: {
  groomName: string;
  brideName: string;
  groomParents: string;
  brideParents: string;
  accentColor: string;
  fontPairing: string;
  templateId: string;
  title?: string;
  intro?: string;
}) {
  const t = useTranslations("invite.family");
  if (!groomParents && !brideParents) return null;
  const font = getFontPairing(fontPairing);
  const resolvedTitle = title ?? t("defaultTitle");
  const resolvedIntro = intro ?? t("defaultIntro");

  return (
    <section className="mx-auto max-w-3xl px-6 py-14 text-center sm:py-20">
      <h2
        className="text-sm font-semibold tracking-[0.3em] uppercase"
        style={{ color: accentColor }}
      >
        {resolvedTitle}
      </h2>
      <div className="mt-3">
        <SectionDivider templateId={templateId} accent={accentColor} />
      </div>
      <p
        className="mx-auto mt-6 max-w-md text-sm text-neutral-500 italic"
        style={{ fontFamily: font.bodyVar }}
      >
        {resolvedIntro}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {groomParents && (
          <div>
            <p
              className="text-xs font-semibold tracking-widest text-neutral-400 uppercase"
              style={{ fontFamily: font.bodyVar }}
            >
              {t("parentsOf", { name: groomName || t("theGroom") })}
            </p>
            <p
              className="mt-2 text-lg font-semibold text-neutral-900"
              style={{ fontFamily: font.headingVar }}
            >
              {groomParents}
            </p>
          </div>
        )}
        {brideParents && (
          <div>
            <p
              className="text-xs font-semibold tracking-widest text-neutral-400 uppercase"
              style={{ fontFamily: font.bodyVar }}
            >
              {t("parentsOf", { name: brideName || t("theBride") })}
            </p>
            <p
              className="mt-2 text-lg font-semibold text-neutral-900"
              style={{ fontFamily: font.headingVar }}
            >
              {brideParents}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
