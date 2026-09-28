"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { KeyRound, Pencil, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import WelcomeBanner from "./WelcomeBanner";

/** sessionStorage key holding the owner's token for one invitation. */
const ownerKey = (slug: string) => `inviteyou:owner:${slug}`;

interface OwnerSession {
  token: string;
  templateId: string;
}

/**
 * Owner-only tools on the public invitation page:
 * - right after purchase, the edit-link popup (WelcomeBanner);
 * - a small "Host tools" bar that stays available after the popup is
 *   closed: Edit, RSVPs, and reopen the edit-link popup.
 *
 * The edit token arrives once, in the post-payment redirect URL. It's moved
 * straight into this tab's sessionStorage and removed from the address bar,
 * so the owner can't accidentally share an editable link by copying the URL,
 * while the tools survive reloads in the same tab. Guests (no token) see
 * nothing. The token isn't checked here; the editor and RSVP pages it links
 * to validate it themselves.
 */
export default function OwnerAccess({
  slug,
  accentColor,
  editToken,
  templateId,
  welcome,
  sent,
}: {
  slug: string;
  accentColor: string;
  /** From the post-payment redirect only. */
  editToken?: string;
  templateId?: string;
  welcome: boolean;
  sent: "whatsapp" | "sms" | null;
}) {
  const t = useTranslations("invite.ownerBar");
  const fromUrl = editToken && templateId ? { token: editToken, templateId } : null;
  const [owner, setOwner] = useState<OwnerSession | null>(fromUrl);
  const [popupOpen, setPopupOpen] = useState(welcome && Boolean(fromUrl));

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (fromUrl) {
          sessionStorage.setItem(ownerKey(slug), JSON.stringify(fromUrl));
          // Drop the token (and the one-time welcome flags) from the address
          // bar, keeping any other parameters such as a guest greeting.
          const url = new URL(window.location.href);
          for (const k of ["editToken", "templateId", "welcome", "sent"]) url.searchParams.delete(k);
          window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
        } else {
          const saved = sessionStorage.getItem(ownerKey(slug));
          if (saved) setOwner(JSON.parse(saved) as OwnerSession);
        }
      } catch {
        // No sessionStorage: the tools just last until the page is left.
      }
    }, 0);
    return () => clearTimeout(id);
    // Runs once per page: the props come from the initial URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!owner) return null;
  const pill =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition hover:bg-white/15";

  return (
    <>
      {popupOpen && (
        <WelcomeBanner
          slug={slug}
          templateId={owner.templateId}
          editToken={owner.token}
          accentColor={accentColor}
          sent={sent}
          onClose={() => setPopupOpen(false)}
        />
      )}
      <nav
        aria-label={t("label")}
        // Top centre: clear of the music button (bottom right).
        className="fixed inset-x-0 top-3 z-[65] mx-auto flex w-fit max-w-[calc(100%-2rem)] flex-wrap items-center justify-center gap-1 rounded-full bg-neutral-900/90 p-1 text-white shadow-lg backdrop-blur"
      >
        <span className="hidden px-2 text-[10px] font-semibold tracking-widest text-white/60 uppercase sm:inline">
          {t("label")}
        </span>
        <Link href={`/create/${owner.templateId}?edit=${slug}&token=${owner.token}`} className={pill}>
          <Pencil size={13} aria-hidden />
          {t("edit")}
        </Link>
        <Link href={`/rsvps/${slug}?token=${owner.token}`} className={pill}>
          <Users size={13} aria-hidden />
          {t("rsvps")}
        </Link>
        <button type="button" onClick={() => setPopupOpen(true)} className={pill}>
          <KeyRound size={13} aria-hidden />
          {t("editLink")}
        </button>
      </nav>
    </>
  );
}
