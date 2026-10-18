"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tag, X } from "lucide-react";
import { couponOffInr, findCoupon, normalizeCode } from "@/lib/coupons";
import { templateTier } from "@/lib/pricing";

/**
 * "Have a code?" next to Publish: a partner's or a returning couple's
 * discount (lib/coupons.ts). The server checks the code again when the
 * draft is saved and the order is made — this only previews the price.
 */
export default function CouponField({
  templateId,
  code,
  onChange,
  className = "",
}: {
  templateId: string;
  code: string;
  onChange: (code: string) => void;
  className?: string;
}) {
  const t = useTranslations("editor.coupon");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  // Why the code didn't apply: unknown, 3D-only, or all its uses taken.
  const [error, setError] = useState<"" | "invalid" | "premiumOnly" | "usedUp">("");
  const [checking, setChecking] = useState(false);
  const off = couponOffInr(code, templateId);
  const coupon = findCoupon(code);

  if (code && coupon && off > 0) {
    return (
      <p className={`flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ${className}`}>
        <span className="flex min-w-0 items-center gap-1.5">
          <Tag size={14} className="shrink-0" aria-hidden />
          <span className="truncate">{t("applied", { code: coupon.code, off, label: coupon.label })}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            // Start clean if they open the field again.
            setInput("");
            setOpen(false);
            onChange("");
          }}
          aria-label={t("remove")} className="-m-1 rounded p-1">
          <X size={14} />
        </button>
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`text-xs font-semibold text-[#b0791f] underline underline-offset-2 dark:text-[#ffd35c] ${className}`}>
        {t("have")}
      </button>
    );
  }

  async function apply() {
    const c = normalizeCode(input);
    const found = findCoupon(c);
    if (found?.premium && templateTier(templateId) !== "premium") return setError("premiumOnly");
    if (couponOffInr(c, templateId) <= 0) return setError("invalid");
    if (found?.limit) {
      // First-N-customers codes: ask the server how many are left.
      setChecking(true);
      const left = await fetch(`/api/coupon?code=${encodeURIComponent(c)}`)
        .then((r) => r.json())
        .then((j: { left?: number | null }) => j.left)
        .catch(() => null)
        .finally(() => setChecking(false));
      if (left === 0) return setError("usedUp");
    }
    setError("");
    onChange(c);
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && void apply()}
          placeholder={t("placeholder")}
          autoCapitalize="characters"
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm uppercase dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <button type="button" onClick={() => void apply()} disabled={checking} className="rounded-lg bg-[#3d1236] px-4 text-sm font-semibold text-[#ffe9b8]">
          {t("apply")}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{t(error)}</p>}
    </div>
  );
}
