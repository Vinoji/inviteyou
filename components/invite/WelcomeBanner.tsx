"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, Copy, PartyPopper, Users, X } from "lucide-react";

/**
 * Shown once, right after a successful publish. The edit link (with its
 * token) is only ever handed to the browser here, via the one-time
 * post-payment redirect — never stored anywhere the public page reads it
 * from, and never rendered again after this banner is dismissed.
 */
export default function WelcomeBanner({
  slug,
  templateId,
  editToken,
  accentColor,
}: {
  slug: string;
  templateId: string;
  editToken: string;
  accentColor: string;
}) {
  const t = useTranslations("invite.welcomeBanner");
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  if (dismissed) return null;

  const editUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/create/${templateId}?edit=${slug}&token=${editToken}`
      : `/create/${templateId}?edit=${slug}&token=${editToken}`;

  async function copyEditLink() {
    try {
      await navigator.clipboard.writeText(editUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore — link is still visible/selectable in the box below.
    }
  }

  return (
    <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 font-medium">
          <PartyPopper size={16} className="shrink-0" aria-hidden />
          {t("message")}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/rsvps/${slug}?token=${editToken}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800"
          >
            <Users size={13} />
            {t("viewRsvps")}
          </Link>
          <button
            onClick={copyEditLink}
            style={{ backgroundColor: accentColor }}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? t("copied") : t("copyEditLink")}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md border border-amber-300 px-2 py-1.5 text-xs font-semibold text-amber-800"
            aria-label={t("dismiss")}
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
