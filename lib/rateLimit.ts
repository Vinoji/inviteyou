import "server-only";

/**
 * Best-effort in-memory rate limiter, keyed per warm serverless instance.
 * On Vercel this resets on cold start, so it isn't a hard guarantee — it's a
 * cheap first line of defense against casual spam/double-submits. It's
 * paired with a short Firestore-side duplicate check for RSVPs specifically.
 */
const hits = new Map<string, number[]>();

// Periodically forget old entries so the map doesn't grow unbounded on a
// long-lived warm instance.
let lastSweep = Date.now();
function sweep(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < 5 * 60 * 1000) return;
  lastSweep = now;
  for (const [key, timestamps] of hits) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  }
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60 * 60 * 1000 }: { limit?: number; windowMs?: number } = {}
): { ok: boolean; remaining: number } {
  sweep(windowMs);
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return { ok: false, remaining: 0 };
  }
  timestamps.push(now);
  hits.set(key, timestamps);
  return { ok: true, remaining: limit - timestamps.length };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
