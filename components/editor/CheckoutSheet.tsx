"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, Sparkles, X } from "lucide-react";
import { couponOffInr } from "@/lib/coupons";
import { templateListPriceInr, templatePriceInr } from "@/lib/pricing";
import { waPhone } from "@/lib/share";
import CouponField from "./CouponField";

/**
 * The last step before paying, on its own sheet so the form stays about
 * the invitation: the price (with any discount code), the buyer's mobile
 * number for their private edit link, and Pay.
 */
export default function CheckoutSheet({
  templateId,
  designName,
  coupon,
  onCoupon,
  phone,
  onPhone,
  busy,
  error,
  onPay,
  onClose,
}: {
  templateId: string;
  designName: string;
  coupon: string;
  onCoupon: (code: string) => void;
  phone: string;
  onPhone: (phone: string) => void;
  busy: boolean;
  error: string | null;
  /** Called with a valid number. */
  onPay: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("editor");
  const tc = useTranslations("editor.checkout");
  const [touched, setTouched] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const price = templatePriceInr(templateId);
  const was = templateListPriceInr(templateId);
  const off = couponOffInr(coupon, templateId);
  const phoneOk = Boolean(waPhone(phone));
  const showError = (touched || Boolean(phone)) && !phoneOk;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function pay() {
    if (!phoneOk) {
      setTouched(true);
      phoneRef.current?.focus();
      return;
    }
    onPay();
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={tc("title")}>
      <button type="button" aria-label={tc("close")} className="absolute inset-0 bg-[#22091f]/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-[#e8b04a]/50 bg-[#fffaf2] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:border dark:bg-[#1c1220]">
        <div className="bg-gradient-to-br from-[#3d1236] to-[#22091f] px-5 pt-5 pb-4 text-[#fff6e6]">
          <button type="button" onClick={onClose} aria-label={tc("close")} className="absolute top-3 right-3 rounded-full p-2 text-[#ffe9b8] hover:bg-white/10">
            <X size={18} />
          </button>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#e8b04a] uppercase">{designName}</p>
          <h2 className="mt-1 font-serif text-xl font-bold">{tc("title")}</h2>
          <p className="mt-1 text-[13px] text-[#ffe9b8]/80">{tc("sub")}</p>
        </div>

        <div className="space-y-4 px-5 pt-4">
          {/* What they pay */}
          <dl className="space-y-1.5 rounded-2xl bg-white p-3.5 text-sm ring-1 ring-[#3d1236]/10 dark:bg-white/5 dark:ring-white/10">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
              <dt>{tc("price")}</dt>
              <dd>
                {was && <s className="mr-1.5 text-neutral-400">₹{was}</s>}₹{price}
              </dd>
            </div>
            {off > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <dt>{tc("discount", { code: coupon })}</dt>
                <dd>−₹{off}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-dashed border-[#3d1236]/15 pt-1.5 font-bold text-[#2a0c27] dark:border-white/15 dark:text-[#fff6e6]">
              <dt>{tc("total")}</dt>
              <dd>₹{price - off}</dd>
            </div>
          </dl>

          <CouponField templateId={templateId} code={coupon} onChange={onCoupon} className="block" />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t("ownerPhoneLabel")}</span>
            <input
              ref={phoneRef}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => onPhone(e.target.value)}
              onBlur={() => phone && setTouched(true)}
              onKeyDown={(e) => e.key === "Enter" && pay()}
              placeholder={t("ownerPhonePlaceholder")}
              aria-invalid={showError}
              aria-describedby="checkout-phone-hint"
              className={`w-full rounded-lg border px-3 py-2.5 text-base dark:bg-neutral-900 dark:text-neutral-100 ${
                showError ? "border-red-400 dark:border-red-500" : "border-neutral-300 dark:border-neutral-700"
              }`}
            />
            <span
              id="checkout-phone-hint"
              className={`mt-1 block text-xs ${showError ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400"}`}
            >
              {showError ? (phone ? t("ownerPhoneInvalid") : t("ownerPhoneRequired")) : t("ownerPhoneHint")}
            </span>
          </label>

          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="button"
            onClick={pay}
            disabled={busy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-sm font-bold text-[#2a0c27] shadow-[0_10px_22px_-10px_rgba(232,176,74,0.95)] disabled:opacity-60"
          >
            <Sparkles size={16} aria-hidden />
            {busy ? t("processing") : tc("pay", { price: price - off })}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-neutral-500 dark:text-neutral-400">
            <Lock size={11} aria-hidden />
            {tc("secure")}
          </p>
        </div>
      </div>
    </div>
  );
}
