import { NextRequest } from "next/server";
import { isOurStorageFile } from "@/lib/media/viaSite";

const PASS_HEADERS = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];

/**
 * Same-origin pass-through for files in our Storage bucket's invitations/
 * folder (see lib/media/viaSite): lets the editor re-crop an uploaded photo
 * and iPhones control an uploaded song's volume. Only that folder of that
 * bucket is reachable, so this can't be used to fetch arbitrary URLs.
 * Range requests are forwarded, which audio playback relies on.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("u") ?? "";
  if (!isOurStorageFile(url)) return new Response("Not found", { status: 404 });

  const range = req.headers.get("range");
  const upstream = await fetch(url, {
    headers: range ? { range } : undefined,
    redirect: "error",
    cache: "no-store",
  }).catch(() => null);
  if (!upstream || (!upstream.ok && upstream.status !== 206)) {
    return new Response("Not found", { status: upstream?.status === 404 ? 404 : 502 });
  }

  // Served from our own origin, so never anything a browser could run:
  // photos and audio only (what storage.rules allows to be uploaded).
  const type = upstream.headers.get("content-type") ?? "";
  if (!/^(image\/(jpeg|png|webp|heic|heif)|audio\/[\w.+-]+)(;|$)/i.test(type)) {
    await upstream.body?.cancel();
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  for (const h of PASS_HEADERS) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  // Uploads are created once under a unique name and never overwritten
  // (storage.rules), so a long cache is safe.
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(upstream.body, { status: upstream.status, headers });
}
