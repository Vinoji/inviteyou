"use client";

import { useState, type FormEvent } from "react";
import { PartyPopper } from "lucide-react";
import SectionDivider from "./SectionDivider";

export default function RsvpForm({
  slug,
  accentColor,
  templateId,
  mode = "public",
}: {
  slug: string;
  accentColor: string;
  templateId: string;
  mode?: "public" | "preview";
}) {
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
      setError("Please enter your name.");
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
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg px-6 py-14 sm:py-20">
      <div className="text-center">
        <h2
          className="text-sm font-semibold tracking-[0.3em] uppercase"
          style={{ color: accentColor }}
        >
          RSVP
        </h2>
        <div className="mt-3">
          <SectionDivider templateId={templateId} accent={accentColor} />
        </div>
      </div>

      {submitted ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 p-8 text-center animate-fade-in">
          <PartyPopper
            size={28}
            className="mx-auto"
            style={{ color: accentColor }}
            aria-hidden
          />
          <h3 className="mt-2 font-serif text-xl font-bold text-neutral-900">
            Thank you!
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            Your RSVP has been recorded. We can&apos;t wait to celebrate with
            you.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Your name
            </label>
            <input
              type="text"
              value={form.guestName}
              onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
              placeholder="Full name"
              disabled={mode === "preview"}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Guests (incl. you)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.guestCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guestCount: Number(e.target.value) }))
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                disabled={mode === "preview"}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Will you attend?
              </label>
              <select
                value={form.attending}
                onChange={(e) => setForm((f) => ({ ...f, attending: e.target.value }))}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                disabled={mode === "preview"}
              >
                <option value="yes">Joyfully accept</option>
                <option value="no">Regretfully decline</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Whose side are you on? (optional)
            </label>
            <select
              value={form.side}
              onChange={(e) => setForm((f) => ({ ...f, side: e.target.value }))}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
              disabled={mode === "preview"}
            >
              <option value="">Prefer not to say</option>
              <option value="groom">Groom&apos;s side</option>
              <option value="bride">Bride&apos;s side</option>
              <option value="friend">Friend of both</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Message (optional)
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
              placeholder="Wishes for the couple..."
              disabled={mode === "preview"}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || mode === "preview"}
            style={{ backgroundColor: accentColor }}
            className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send RSVP"}
          </button>
          {mode === "preview" && (
            <p className="text-center text-xs text-neutral-400">
              This form is disabled in the live preview.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
