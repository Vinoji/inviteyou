import { useTranslations } from "next-intl";

/**
 * A premium design's page text (`premium.<ns>`), with per-design overrides:
 * a copy of a design for another occasion (Lilac Seal for an engagement,
 * Cinematic Film for a birthday…) sets only the lines that change, under
 * `invite.templateText.<templateId>.page.<key>` — the same place intros
 * read theirs from (`….intro.<key>`, useIntroText).
 */
export function usePremiumText(ns: string, templateId: string) {
  const t = useTranslations(ns);
  const own = useTranslations("invite.templateText");
  return (key: string, values?: Record<string, string | number>) => {
    const k = `${templateId}.page.${key}`;
    return own.has(k) ? own(k, values) : t(key, values);
  };
}
