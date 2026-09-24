"use client";

/**
 * Catches errors thrown by the root layout itself (app/[locale]/layout.tsx)
 * — app/[locale]/error.tsx can't catch those, since a segment's error
 * boundary sits *below* its own layout, not above it. Replaces the entire
 * document (must render its own <html>/<body>), so it stays framework-plain
 * with no next-intl/translation dependency — those come from providers this
 * component is standing in for.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred.</p>
          <button type="button" onClick={reset} style={{ marginTop: "1.5rem" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
