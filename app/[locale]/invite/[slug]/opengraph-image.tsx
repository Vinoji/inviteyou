import { ImageResponse } from "next/og";
import { getTranslations, getFormatter } from "next-intl/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getTemplateConfig } from "@/lib/templates";
import { getCategoryConfig } from "@/lib/categories";

// Uses the Admin SDK (Node-only APIs), so this must run on the Node runtime
// rather than the default Edge runtime for metadata image routes.
export const runtime = "nodejs";
export const alt = "Invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const db = getAdminDb();
  const snap = await db.collection("invitations").doc(slug).get();
  const data = snap.data();

  const t = await getTranslations({ locale, namespace: "invite.opengraph" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const category = getCategoryConfig(getTemplateConfig(data?.templateId ?? "traditional-gold").category);
  const bride = data?.brideName || tCommon("brideFallback");
  const groom = data?.groomName || tCommon("groomFallback");
  const accent = data?.accentColor || "#b8860b";
  const format = await getFormatter({ locale });
  const dateLabel = data?.weddingDate
    ? format.dateTime(new Date(data.weddingDate), {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1310",
          backgroundImage: `radial-gradient(circle at 50% 0%, ${accent}55, transparent 60%)`,
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: accent,
            marginBottom: 24,
          }}
        >
          {t("youreInvited")}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 92,
            color: "#ffffff",
            fontWeight: 700,
          }}
        >
          <span>{bride}</span>
          {!category.singlePerson && (
            <>
              <span style={{ color: accent, margin: "0 28px" }}>&amp;</span>
              <span>{groom}</span>
            </>
          )}
        </div>
        {dateLabel && (
          <div style={{ fontSize: 32, color: "#e5d9c9", marginTop: 32 }}>
            {dateLabel}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
