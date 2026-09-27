import { useTranslations } from "next-intl";
import { getFontPairing } from "@/lib/fontPairings";
import SectionDivider from "./SectionDivider";
import FamilyLines from "./FamilyLines";
import { scriptLang } from "@/lib/monogram";
import type { FamilyMember } from "@/lib/types";

export default function Family({
  groomName,
  brideName,
  brideFamily,
  groomFamily,
  accentColor,
  fontPairing,
  templateId,
  title,
  intro,
}: {
  groomName: string;
  brideName: string;
  brideFamily: FamilyMember[];
  groomFamily: FamilyMember[];
  accentColor: string;
  fontPairing: string;
  templateId: string;
  title?: string;
  intro?: string;
}) {
  const t = useTranslations("invite.family");
  if (brideFamily.length === 0 && groomFamily.length === 0) return null;
  const font = getFontPairing(fontPairing);
  const resolvedTitle = title ?? t("defaultTitle");
  const resolvedIntro = intro ?? t("defaultIntro");
  const sides = [
    { side: "bride" as const, name: brideName || t("theBride"), members: brideFamily },
    { side: "groom" as const, name: groomName || t("theGroom"), members: groomFamily },
  ].filter((x) => x.members.length > 0);

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

      <div className={`mt-8 grid grid-cols-1 gap-8 ${sides.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {sides.map(({ side, name, members }) => (
          <div key={side} className="min-w-0">
            <p
              className="text-xs font-semibold tracking-widest text-neutral-400 uppercase"
              style={{ fontFamily: font.bodyVar }}
              lang={scriptLang(name)}
            >
              {name}
            </p>
            <div className="mt-2 space-y-3 text-sm text-neutral-500 italic" style={{ fontFamily: font.bodyVar }}>
              <FamilyLines
                members={members}
                side={side}
                nameClassName="block text-lg font-semibold not-italic text-neutral-900 [overflow-wrap:anywhere]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
