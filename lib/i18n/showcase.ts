import type { TemplateMeta } from "./templates";
import type { ShowcaseProps } from "@/components/landing/TemplateShowcase";
import { getDefaultInvitationData } from "./defaultContent";
import { getFontPairing } from "../fontPairings";
import { nameFitScale, resolveMonogram } from "../monogram";

type TFunc = Parameters<typeof getDefaultInvitationData>[1];

/** Props for a template's live preview card: its real opening, played
 * with the template's sample couple. `tDefaults` is the `defaultContent`
 * namespace, `tCommon` the `common` one. */
export function showcaseProps(
  tpl: TemplateMeta,
  singlePerson: boolean,
  tDefaults: TFunc,
  tCommon: (key: string) => string
): ShowcaseProps {
  const seed = getDefaultInvitationData(tpl.id, tDefaults);
  const font = getFontPairing(tpl.defaultFont);
  const names = {
    a: seed.brideName || (singlePerson ? tCommon("youFallback") : tCommon("brideFallback")),
    b: singlePerson ? undefined : seed.groomName || tCommon("groomFallback"),
  };
  return {
    introId: tpl.intro,
    templateId: tpl.id,
    names,
    monogram: resolveMonogram(names.a, names.b ?? "", undefined, singlePerson),
    weddingDate: seed.weddingDate,
    dateLabel: seed.weddingDate.split("-").reverse().join(" · "),
    fonts: { display: font.headingVar, script: font.headingVar, caps: font.bodyVar },
    accent: tpl.defaultAccent,
    nameFit: nameFitScale(names.a, names.b),
    gradient: tpl.cardGradient,
  };
}
