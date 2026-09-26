"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { PartyPopper } from "lucide-react";
import { useTranslations } from "next-intl";
import { getCategoryMeta } from "@/lib/i18n/categories";
import { getTemplateConfig } from "@/lib/templates";
import SectionDivider from "./SectionDivider";
import { RSVP_SENT_EVENT } from "./intros/events";

const DEFAULT_CLASSES = {
  section: "mx-auto max-w-lg px-6 py-14 sm:py-20",
  label: "mb-1 block text-sm font-medium text-neutral-700",
  input:
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none",
  button: "w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60",
  thanksCard: "mt-8 rounded-2xl border border-neutral-200 p-8 text-center animate-fade-in",
  thanksTitle: "mt-2 font-[family-name:var(--inv-heading)] text-xl font-bold text-neutral-900",
  thanksBody: "mt-2 text-sm text-neutral-600",
  error: "text-sm text-red-600",
  note: "text-center text-xs text-neutral-400",
};

/** Light-on-dark styling for the royal-palace wedding layout; reads its
 * colours from the --rp-* variables that layout sets. */
const ROYAL_CLASSES: typeof DEFAULT_CLASSES = {
  section: "mx-auto max-w-md",
  label:
    "mb-1.5 block font-[family-name:var(--rp-caps)] text-[10px] tracking-[0.22em] uppercase text-[var(--rp-gold-light)]",
  input:
    "w-full rounded-[10px] border border-[var(--rp-gold-light)]/40 bg-white/[0.07] px-3 py-3 text-[15px] text-white placeholder:text-white/45 focus:border-[var(--rp-gold-light)] focus:outline-none [&>option]:text-black",
  button:
    "w-full rounded-full px-4 py-3.5 font-[family-name:var(--rp-caps)] text-[11px] tracking-[0.24em] uppercase text-[#2a1f08] transition disabled:opacity-60",
  thanksCard:
    "mt-2 rounded-2xl border border-[var(--rp-gold-light)]/40 bg-white/[0.06] p-8 text-center animate-fade-in",
  thanksTitle: "mt-2 font-[family-name:var(--rp-heading)] text-2xl text-white",
  thanksBody: "mt-2 font-[family-name:var(--rp-display)] text-base italic text-[#f6ecd2]",
  error: "text-sm text-red-300",
  note: "text-center text-xs text-white/50",
};

export default function RsvpForm({
  slug,
  accentColor,
  templateId,
  brideName,
  groomName,
  mode = "public",
  variant = "default",
  header,
}: {
  slug: string;
  accentColor: string;
  templateId: string;
  brideName: string;
  groomName: string;
  mode?: "public" | "preview";
  variant?: "default" | "royal";
  /** Replaces the default "RSVP" heading + divider. */
  header?: ReactNode;
}) {
  const c = variant === "royal" ? ROYAL_CLASSES : DEFAULT_CLASSES;
  const t = useTranslations("invite.rsvp");
  const tCategories = useTranslations("categories");
  const category = getCategoryMeta(getTemplateConfig(templateId).category, tCategories);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    guestName: "",
    guestCount: 1,
    attending: "yes",
    side: "",
    message: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "preview") return;
    if (!form.guestName.trim()) {
      setError(t("errName"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/rsvp/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: form.guestName.trim(),
          guestCount: Number(form.guestCount) || 1,
          attending: form.attending === "yes",
          side: form.side || undefined,
          message: form.message.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? t("errGeneric"));
      }
      setSubmitted(true);
      window.dispatchEvent(
        new CustomEvent(RSVP_SENT_EVENT, { detail: { attending: form.attending === "yes" } })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={c.section}>
      {header ?? (
        <div className="text-center">
          <h2
            className="text-sm font-semibold tracking-[0.3em] uppercase"
            style={{ color: accentColor }}
          >
            {t("heading")}
          </h2>
          <div className="mt-3">
            <SectionDivider templateId={templateId} accent={accentColor} />
          </div>
        </div>
      )}

      {submitted ? (
        <div className={c.thanksCard}>
          <PartyPopper
            size={28}
            className="mx-auto"
            style={{ color: accentColor }}
            aria-hidden
          />
          <h3 className={c.thanksTitle}>
            {t("thankYouTitle")}
          </h3>
          <p className={c.thanksBody}>{t("thankYouBody")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={header ? "space-y-4" : "mt-8 space-y-4"}>
          <div>
            <label className={c.label}>
              {t("nameLabel")}
            </label>
            <input
              type="text"
              value={form.guestName}
              onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
              className={c.input}
              placeholder={t("namePlaceholder")}
              disabled={mode === "preview"}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={c.label}>
                {t("guestCountLabel")}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.guestCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guestCount: Number(e.target.value) }))
                }
                className={c.input}
                disabled={mode === "preview"}
              />
            </div>
            <div>
              <label className={c.label}>
                {t("attendingLabel")}
              </label>
              <select
                value={form.attending}
                onChange={(e) => setForm((f) => ({ ...f, attending: e.target.value }))}
                className={c.input}
                disabled={mode === "preview"}
              >
                <option value="yes">{t("optionYes")}</option>
                <option value="no">{t("optionNo")}</option>
              </select>
            </div>
          </div>
          {!category.singlePerson && (
            <div>
              <label className={c.label}>
                {t("sideLabel")}
              </label>
              <select
                value={form.side}
                onChange={(e) => setForm((f) => ({ ...f, side: e.target.value }))}
                className={c.input}
                disabled={mode === "preview"}
              >
                <option value="">{t("sideNotSay")}</option>
                <option value="bride">{t("sideOf", { name: brideName || "Their" })}</option>
                <option value="groom">{t("sideOf", { name: groomName || "Their" })}</option>
                <option value="friend">{t("sideFriend")}</option>
              </select>
            </div>
          )}
          <div>
            <label className={c.label}>
              {t("messageLabel")}
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              rows={3}
              className={c.input}
              placeholder={t("messagePlaceholder")}
              disabled={mode === "preview"}
            />
          </div>
          {error && <p className={c.error}>{error}</p>}
          <button
            type="submit"
            disabled={loading || mode === "preview"}
            style={
              variant === "royal"
                ? { background: "linear-gradient(var(--rp-gold-light), var(--rp-gold))" }
                : { backgroundColor: accentColor }
            }
            className={c.button}
          >
            {loading ? t("sending") : t("send")}
          </button>
          {mode === "preview" && (
            <p className={c.note}>
              {t("disabledPreview")}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
