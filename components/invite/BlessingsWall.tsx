import { useTranslations } from "next-intl";
import { getFontPairing } from "@/lib/fontPairings";
import SectionDivider from "./SectionDivider";
import type { RsvpEntry } from "@/lib/types";

export default function BlessingsWall({
  messages,
  accentColor,
  fontPairing,
  templateId,
}: {
  messages: RsvpEntry[];
  accentColor: string;
  fontPairing: string;
  templateId: string;
}) {
  const t = useTranslations("invite.blessings");
  const SIDE_LABEL: Record<string, string> = {
    groom: t("sideGroom"),
    bride: t("sideBride"),
    friend: t("sideFriend"),
  };
  if (messages.length === 0) return null;
  const font = getFontPairing(fontPairing);

  return (
    <section className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
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
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 p-5 text-left"
            style={{ borderColor: `${accentColor}33` }}
          >
            <p
              className="text-sm text-neutral-700"
              style={{ fontFamily: font.bodyVar }}
            >
              &ldquo;{m.message}&rdquo;
            </p>
            <p className="mt-3 text-xs font-semibold text-neutral-900">
              {m.guestName}
              {m.side && (
                <span className="ml-1 font-normal text-neutral-400">
                  &middot; {SIDE_LABEL[m.side]}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
