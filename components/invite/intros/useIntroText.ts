"use client";

import { useTranslations } from "next-intl";

/**
 * An intro's labels (`invite.intros.<id>`), with a template's own wording
 * (`invite.templateText.<templateId>.intro.<key>`) taking precedence — the
 * same opening is shared by weddings, birthdays and launches, and its
 * eyebrow ("The wedding of", "Wedding Reception") has to fit the occasion.
 */
export function useIntroText(namespace: string, templateId: string) {
  const t = useTranslations(namespace);
  const own = useTranslations("invite.templateText");
  return (key: string) => (own.has(`${templateId}.intro.${key}`) ? own(`${templateId}.intro.${key}`) : t(key));
}
