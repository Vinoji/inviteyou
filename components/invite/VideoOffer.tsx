"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Clapperboard, Download, Loader2, RotateCcw } from "lucide-react";
import { track } from "@/lib/analytics";

type Status = "loading" | "none" | "queued" | "rendering" | "ready" | "failed" | "error";

const CHECKOUT_JS = "https://checkout.razorpay.com/v1/checkout.js";
const POLL_MS = 10000;

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = CHECKOUT_JS;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("checkout"));
    document.head.appendChild(s);
  });
}

/**
 * The owner's ₹99 WhatsApp video: buy it, wait while it's made (a couple of
 * minutes, the page checks every 10s), then download it to forward on
 * WhatsApp. On the owner's bar and in the after-purchase popup.
 */
export default function VideoOffer({ slug, token, accentColor }: { slug: string; token: string; accentColor: string }) {
  const t = useTranslations("invite.video");
  const [status, setStatus] = useState<Status>("loading");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState(99);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // bumped after a purchase, to start checking again
  const [round, setRound] = useState(0);
  // the payment test: ?dev_option=1 on the page (the server decides whether it's honoured)
  const [devPrice] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev_option") === "1");

  // The video's state, checked again every 10s while it's being made.
  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      try {
        const res = await fetch(`/api/video/status?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const j = await res.json();
        if (!live) return;
        if (j.priceInr) setPrice(j.priceInr);
        if (j.status === "none") track("video_offer_seen");
        if (j.url) setUrl(j.url);
        setStatus(j.failed ? "failed" : j.status);
        if (j.status === "queued" || j.status === "rendering") timer = setTimeout(check, POLL_MS);
      } catch {
        if (live) setStatus("error");
      }
    };
    check();
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [slug, token, round]);

  async function buy() {
    setBusy(true);
    setError("");
    try {
      await loadCheckout();
      const orderRes = await fetch("/api/video/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, token, devPrice }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? t("error"));
      const rz = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "InviteForYou",
        description: t("title"),
        theme: { color: accentColor },
        handler: async (response) => {
          const res = await fetch("/api/video/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, token, ...response }),
          });
          if (!res.ok) {
            setError((await res.json().catch(() => ({}))).error ?? t("error"));
            setBusy(false);
            return;
          }
          track("video_paid", { test: devPrice });
          setBusy(false);
          setStatus("queued");
          setRound((r) => r + 1);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      track("video_payment_started", { test: devPrice });
      rz.on("payment.failed", () => {
        setError(t("paymentFailed"));
        setBusy(false);
      });
      rz.open();
    } catch (err) {
      setError(err instanceof Error && err.message !== "checkout" ? err.message : t("error"));
      setBusy(false);
    }
  }

  if (status === "loading" || status === "error") return null;

  return (
    <div className="rounded-2xl border border-emerald-600/25 bg-emerald-50 p-4 text-left text-neutral-900 dark:bg-emerald-950/40 dark:text-neutral-100">
      <p className="flex items-center gap-2 font-semibold">
        <Clapperboard size={16} className="text-emerald-700 dark:text-emerald-400" aria-hidden />
        {t("title")}
      </p>
      {status === "none" && (
        <>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{t("pitch")}</p>
          <button
            type="button"
            onClick={buy}
            disabled={busy}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Clapperboard size={16} aria-hidden />}
            {t("buy", { price: devPrice ? 1 : price })}
          </button>
        </>
      )}
      {(status === "queued" || status === "rendering") && (
        <p className="mt-1 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300" role="status">
          <Loader2 size={15} className="animate-spin" aria-hidden />
          {t("making")}
        </p>
      )}
      {status === "ready" && url && (
        <a
          href={url}
          onClick={() => track("video_downloaded")}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white transition hover:brightness-105"
        >
          <Download size={16} aria-hidden />
          {t("download")}
        </a>
      )}
      {status === "failed" && (
        <p className="mt-1 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
          <RotateCcw size={15} aria-hidden />
          {t("failed")}
        </p>
      )}
      {error && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
