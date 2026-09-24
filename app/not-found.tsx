import Link from "next/link";

// Fallback for requests that fall outside the [locale] segment entirely
// (the next-intl middleware normally rewrites everything into it first).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <p>Page not found.</p>
          <Link href="/">Go home</Link>
        </main>
      </body>
    </html>
  );
}
