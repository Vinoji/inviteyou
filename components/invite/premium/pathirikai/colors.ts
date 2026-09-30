import type { CSSProperties } from "react";
import { recolorForTemplate } from "../../royal/palettes";

/** The pathirikai's design colours (kumkum, the red-oxide floor), moved to
 * the couple's picked colour. Paper, turmeric and gold foil are materials
 * and keep their own colour. */
export function pathirikaiColors(templateId: string, accent: string): CSSProperties {
  const r = (c: string) => recolorForTemplate(templateId, c, accent);
  return {
    "--kumkum": r("#a8131b"),
    "--floor-1": r("#8c3822"),
    "--floor-2": r("#6b2415"),
    "--floor-3": r("#5a1d10"),
    "--floor-4": r("#4a170d"),
    "--floor-5": r("#2e0e07"),
  } as CSSProperties;
}
