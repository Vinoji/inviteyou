"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/site/SiteHeader";

export type PublishPhase = "saving" | "checkout" | "verifying" | "opening";

const STEPS: PublishPhase[] = ["saving", "checkout", "verifying", "opening"];

/**
 * Full-screen progress while an invitation is being published: saving,
 * the payment window, confirming the payment and publishing (which also
 * sends the owner their edit link), then loading the new page. It hides
 * while Razorpay's own window is up and stays until the next page
 * replaces the editor, so there's never a silent pause.
 *
 * `steps` narrows it for other flows, e.g. saving edits is just
 * saving → opening.
 */
export default function PublishOverlay({
  phase,
  accent,
  steps = STEPS,
}: {
  phase: PublishPhase | null;
  accent: string;
  steps?: PublishPhase[];
}) {
  const t = useTranslations("editor.publishing");
  if (!phase || phase === "checkout") return null;
  const current = steps.indexOf(phase);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1a0b1f]/80 p-6 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="publish-progress-title"
      aria-describedby="publish-progress-note"
    >
      <div className="w-full max-w-sm rounded-3xl bg-[#fffaf2] p-7 text-center shadow-2xl dark:bg-[#1c1220]">
        <div className="relative mx-auto h-20 w-20">
          <span
            className="absolute inset-0 animate-spin rounded-full border-4 border-transparent [animation-duration:1.4s]"
            style={{ borderTopColor: accent, borderRightColor: `${accent}55` }}
            aria-hidden
          />
          <span className="absolute inset-2 flex items-center justify-center rounded-full bg-amber-50 motion-safe:animate-pulse dark:bg-amber-950/60">
            <LogoMark size={38} />
          </span>
        </div>
        <h2 id="publish-progress-title" className="mt-5 font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
          {t(`${phase}Title`)}
        </h2>

        <ol className="mt-5 space-y-2.5 text-left" aria-live="polite">
          {steps.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "text-white"
                        : "border-2 border-neutral-200 dark:border-neutral-700"
                  }`}
                  style={active ? { backgroundColor: accent } : undefined}
                >
                  {done ? (
                    <Check size={13} strokeWidth={3} aria-hidden />
                  ) : active ? (
                    <Loader2 size={13} className="animate-spin" aria-hidden />
                  ) : null}
                </span>
                <span
                  className={
                    active
                      ? "font-semibold text-neutral-900 dark:text-neutral-50"
                      : done
                        ? "text-neutral-500 line-through decoration-neutral-300 dark:text-neutral-400"
                        : "text-neutral-400 dark:text-neutral-500"
                  }
                >
                  {t(step)}
                </span>
              </li>
            );
          })}
        </ol>

        <p id="publish-progress-note" className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          {t("dontClose")}
        </p>
      </div>
    </div>
  );
}
