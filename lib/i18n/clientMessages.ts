import type { AbstractIntlMessages } from "next-intl";

/**
 * The message groups the browser needs. Every page used to send the whole
 * message file (~210 KB English, ~440 KB Tamil) with its HTML — the
 * editor's strings, every design's sample content, SEO copy — which old
 * phones then had to download, parse and hydrate. Server components read
 * any group directly; only client components need theirs sent.
 *
 * CLIENT_BASE goes with every page (layout); pages with client components
 * of their own add theirs with a nested provider (EDITOR_EXTRA, HOST_EXTRA).
 * A client component that reads a group not listed here shows its key, not
 * text — add the group here when adding one.
 */
export const CLIENT_BASE = [
  "common",
  "site",
  "landing",
  "festivals",
  "categories",
  "templates",
  "invite",
  "premium",
  "settings",
  "themeToggle",
  "languageSwitcher",
  "invitePage",
  "errorBoundary",
  "notFound",
];
export const EDITOR_EXTRA = ["editor"];
export const HOST_EXTRA = ["rsvpsPage", "host"];

export function pickMessages(messages: AbstractIntlMessages, groups: string[]): AbstractIntlMessages {
  return Object.fromEntries(groups.filter((g) => g in messages).map((g) => [g, messages[g]]));
}
