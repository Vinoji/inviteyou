"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

const SCENARIOS: { action: string; label: string; expect: string }[] = [
  { action: "paid", label: "Paid (no Razorpay)", expect: "Status goes queued → rendering → ready in about 1–2 min; the owner's page shows “Download video”." },
  { action: "replay", label: "Webhook replay", expect: "Says “changed nothing” — one payment never makes two videos." },
  { action: "fail", label: "Render fails", expect: "Open the owner's page: it starts the render again (up to 3 attempts), then shows ready." },
  { action: "stall", label: "Render stalls", expect: "Open the owner's page: it restarts the render." },
  { action: "reset", label: "Reset", expect: "Back to “Get the video · ₹99”." },
  { action: "show", label: "Refresh state", expect: "" },
];

/** Reads slug and token from a pasted edit link (/create/<id>?edit=<slug>&token=<token>). */
function parse(link: string) {
  try {
    const u = new URL(link.trim(), "http://x");
    return { slug: u.searchParams.get("edit") ?? "", token: u.searchParams.get("token") ?? "", templateId: u.pathname.split("/").pop() ?? "" };
  } catch {
    return { slug: "", token: "", templateId: "" };
  }
}

export default function PaymentsLab({ mode }: { mode: "test" | "live" | "none" }) {
  const [link, setLink] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const { slug, token, templateId } = parse(link);
  const ready = Boolean(slug && token);
  const ownerPage = ready ? `/invite/${slug}?editToken=${encodeURIComponent(token)}&templateId=${encodeURIComponent(templateId)}` : "";

  async function run(action: string) {
    setBusy(true);
    const res = await fetch("/api/dev/video", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, token, action }) });
    setOut(JSON.stringify(await res.json(), null, 2));
    setBusy(false);
  }

  const box = "rounded-2xl border border-neutral-300 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900";
  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-10 text-neutral-900 dark:text-neutral-100">
      <h1 className="font-serif text-3xl font-bold">Payments lab</h1>
      <p className="text-sm">
        Development only — this page and its API are 404 on the live site. Razorpay here:{" "}
        <b className={mode === "test" ? "text-emerald-600" : "text-red-600"}>{mode === "test" ? "TEST mode (no real money)" : mode === "live" ? "LIVE keys — real money!" : "not configured"}</b>
        . Note: this local site uses the live database, so anything you publish here is real data — reset or delete it after.
      </p>

      <section className={box}>
        <h2 className="font-semibold">1 · Publishing (Razorpay checkout)</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            Normal price: <Link className="underline" href="/create/mangala-thirumanam">/create/mangala-thirumanam</Link> → Publish
          </li>
          <li>
            ₹1 price: <Link className="underline" href="/create/mangala-thirumanam?dev_option=1">/create/mangala-thirumanam?dev_option=1</Link>
          </li>
          <li>Pay with Razorpay&apos;s test methods (below). After paying you land on the owner page — copy the edit link from the popup for step 2.</li>
        </ul>
      </section>

      <section className={box}>
        <h2 className="font-semibold">2 · WhatsApp video (₹99)</h2>
        <label className="mt-3 block text-sm font-medium">
          Paste an invitation&apos;s edit link
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…/create/<design>?edit=<slug>&token=<token>"
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
          />
        </label>
        {ready && (
          <p className="mt-2 text-sm">
            Invitation <b>{slug}</b> · real checkout on the owner page:{" "}
            <a className="underline" href={ownerPage}>₹99</a> ·{" "}
            <a className="underline" href={`${ownerPage}&dev_option=1`}>₹1</a> → “WhatsApp video” on the top bar
          </p>
        )}
        <p className="mt-4 text-sm font-medium">Or simulate, without paying:</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.action}
              type="button"
              disabled={!ready || busy}
              onClick={() => run(s.action)}
              className="rounded-xl border border-neutral-300 p-3 text-left text-sm hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-600 dark:hover:bg-neutral-800"
            >
              <span className="block font-semibold">{s.label}</span>
              {s.expect && <span className="mt-0.5 block text-xs text-neutral-500">{s.expect}</span>}
            </button>
          ))}
        </div>
        {out && <pre className="mt-4 overflow-x-auto rounded-lg bg-neutral-100 p-3 text-xs dark:bg-neutral-800">{out}</pre>}
      </section>

      <section className={box}>
        <h2 className="font-semibold">Razorpay test payments (test mode only)</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>UPI success: <code>success@razorpay</code></li>
          <li>UPI failure: <code>failure@razorpay</code> — the page should say the payment didn&apos;t go through</li>
          <li>Closing the checkout without paying — nothing should change</li>
          <li>Cards and netbanking: see Razorpay&apos;s test docs (any bank in test netbanking succeeds or fails on your choice)</li>
        </ul>
      </section>
    </main>
  );
}
