import { ImageResponse } from "next/og";
import { getAdminDb } from "@/lib/firebase-admin";

// Uses the Admin SDK (Node-only APIs), so this must run on the Node runtime
// rather than the default Edge runtime for metadata image routes.
export const runtime = "nodejs";
export const alt = "Wedding Invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const db = getAdminDb();
  const snap = await db.collection("invitations").doc(params.slug).get();
  const data = snap.data();

  const bride = data?.brideName || "Bride";
  const groom = data?.groomName || "Groom";
  const accent = data?.accentColor || "#b8860b";
  const dateLabel = data?.weddingDate
    ? new Date(data.weddingDate).toLocaleDateString("en-IN", {
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
          You&apos;re Invited
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
          <span style={{ color: accent, margin: "0 28px" }}>&amp;</span>
          <span>{groom}</span>
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
