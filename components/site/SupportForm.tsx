"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { SITE, formatPhone } from "@/lib/site";
import {
  SUPPORT_TOPICS,
  supportMailUrl,
  supportReference,
  supportSmsUrl,
  supportWhatsAppUrl,
  telUrl,
  type SupportTopic,
} from "@/lib/support";

const input =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

/**
 * The support form: say who you are, what it's about and what happened,
 * then send it by WhatsApp, email or SMS — it opens in your own app,
 * already written, with a reference code to quote later. Nothing is
 * stored on our side; it goes straight to the support inbox and phone.
 */
export default function SupportForm() {
  const t = useTranslations("site.support.form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<SupportTopic>("editLink");
  const [invite, setInvite] = useState("");
  const [details, setDetails] = useState("");
  const [ref, setRef] = useState<string | null>(null);
  const [sentVia, setSentVia] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const ready = name.trim().length > 0 && details.trim().length >= 10;

  function message(reference: string) {
    const facts = [
      `${t("refLabel")}: ${reference}`,
      `${t("topicLabel")}: ${t(`topics.${topic}`)}`,
      `${t("nameLabel")}: ${name.trim()}`,
      ...(phone.trim() ? [`${t("phoneLabel")}: ${phone.trim()}`] : []),
      ...(invite.trim() ? [`${t("inviteLabel")}: ${invite.trim()}`] : []),
    ];
    return [t("greeting", { brand: SITE.name }), "", ...facts, "", details.trim()].join("\n");
  }

  /** Opens the chosen app; the same reference is kept for every channel. */
  function send(via: "whatsapp" | "email" | "sms") {
    setTouched(true);
    if (!ready) return;
    const reference = ref ?? supportReference();
    setRef(reference);
    const text = message(reference);
    const subject = `[${reference}] ${t(`topics.${topic}`)} — ${name.trim()}`;
    const url = via === "whatsapp" ? supportWhatsAppUrl(text) : via === "email" ? supportMailUrl(subject, text) : supportSmsUrl(text);
    if (via === "whatsapp") window.open(url, "_blank", "noopener,noreferrer");
    else window.location.href = url;
    setSentVia(via);
  }

  const btn = "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send("whatsapp");
        }}
        className="space-y-4 rounded-3xl border border-amber-200/70 bg-white/90 p-5 text-left shadow-sm sm:p-7 dark:border-amber-500/20 dark:bg-neutral-900/80"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-800 dark:text-neutral-200">{t("nameLabel")} *</span>
            <input className={input} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-800 dark:text-neutral-200">{t("phoneLabel")}</span>
            <input
              className={input}
              type="tel"
              inputMode="tel"
              value={phone}
              maxLength={20}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder={t("phonePlaceholder")}
            />
          </label>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">{t("topicLabel")}</legend>
          <div className="flex flex-wrap gap-2">
            {SUPPORT_TOPICS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTopic(id)}
                aria-pressed={topic === id}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  topic === id
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-neutral-200 text-neutral-600 hover:border-amber-400 dark:border-neutral-700 dark:text-neutral-300"
                }`}
              >
                {t(`topics.${id}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-800 dark:text-neutral-200">{t("inviteLabel")}</span>
          <input
            className={input}
            value={invite}
            maxLength={300}
            onChange={(e) => setInvite(e.target.value)}
            placeholder={`https://${SITE.domain}/invite/…`}
          />
          <span className="mt-1 block text-xs text-neutral-500">{t("inviteHint")}</span>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-800 dark:text-neutral-200">{t("detailsLabel")} *</span>
          <textarea
            className={input}
            rows={5}
            value={details}
            maxLength={1000}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t("detailsPlaceholder")}
          />
          <span className="mt-1 flex justify-between text-xs text-neutral-500">
            <span className={touched && !ready ? "text-red-600" : ""}>{touched && !ready ? t("required") : t("noSecrets")}</span>
            <span>{details.length}/1000</span>
          </span>
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">{t("sendVia")}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className={`${btn} bg-[#25d366] text-[#08331a] hover:brightness-95`}>
              <MessageCircle size={16} aria-hidden /> {t("viaWhatsapp")}
            </button>
            <button type="button" onClick={() => send("email")} className={`${btn} bg-neutral-900 text-white hover:bg-amber-700 dark:bg-neutral-100 dark:text-neutral-900`}>
              <Mail size={16} aria-hidden /> {t("viaEmail")}
            </button>
            <button type="button" onClick={() => send("sms")} className={`${btn} border border-neutral-300 text-neutral-800 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-100`}>
              <MessageSquare size={16} aria-hidden /> {t("viaSms")}
            </button>
          </div>
        </div>

        {ref && sentVia && (
          <p role="status" className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            <Check size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>{t("sentNote", { ref })}</span>
          </p>
        )}
      </form>

      {/* Direct lines, for anyone who'd rather just call or chat. */}
      <aside className="space-y-3 text-left">
        <p className="text-xs font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-400">{t("directTitle")}</p>
        <a
          href={supportWhatsAppUrl(t("quickHello", { brand: SITE.name }))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition hover:shadow-md dark:border-emerald-900 dark:bg-emerald-950/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366] text-white">
            <MessageCircle size={18} aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-50">{t("chatWhatsapp")}</span>
            <span className="block text-xs text-neutral-600 dark:text-neutral-400">{formatPhone(SITE.contact.whatsapp)}</span>
          </span>
        </a>
        {SITE.contact.phones.map((p) => (
          <a
            key={p}
            href={telUrl(p)}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Phone size={18} aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-50">{t("call")}</span>
              <span className="block text-xs text-neutral-600 dark:text-neutral-400">{formatPhone(p)}</span>
            </span>
          </a>
        ))}
        <a
          href={`mailto:${SITE.contact.email}`}
          className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            <Mail size={18} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-50">{t("emailUs")}</span>
            <span className="block truncate text-xs text-neutral-600 dark:text-neutral-400">{SITE.contact.email}</span>
          </span>
        </a>
        <p className="px-1 text-xs text-neutral-500 dark:text-neutral-400">{t("hours")}</p>
      </aside>
    </div>
  );
}
