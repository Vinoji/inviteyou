import "server-only";
import { getMessages } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import type { ContentLocale } from "@/lib/types";
import { getTemplateConfig } from "@/lib/templates";

/** What the invitation itself renders with (InvitationView and everything
 * under it) — independent of the page's UI language. */
export const INVITATION_NAMESPACES = ["invite", "common", "categories", "premium"] as const;

/**
 * A subset of one locale's messages, for a nested NextIntlClientProvider
 * that renders the invitation in its own content language. `defaultContent`
 * can be narrowed to a single template's seed so the payload stays small.
 */
export async function getContentMessages(
  locale: ContentLocale,
  namespaces: readonly string[],
  templateId?: string
): Promise<AbstractIntlMessages> {
  const all = (await getMessages({ locale })) as Record<string, AbstractIntlMessages>;
  const picked: Record<string, AbstractIntlMessages> = {};
  for (const ns of namespaces) {
    if (ns === "defaultContent" && templateId) {
      // The template's own sample content, or the one it shares (TemplateConfig.seed).
      const key = getTemplateConfig(templateId).seed ?? templateId;
      const seed = all.defaultContent?.[key];
      picked.defaultContent = seed ? { [key]: seed } : {};
    } else if (all[ns]) {
      picked[ns] = all[ns];
    }
  }
  return picked;
}
