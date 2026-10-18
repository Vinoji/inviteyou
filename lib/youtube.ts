/**
 * The couple's YouTube video (InvitationData.videoUrl): any normal YouTube
 * link — watch, youtu.be, Shorts, live, embed — read down to its video id.
 * Only YouTube is accepted, so guests' pages never embed another site.
 */
export interface YouTubeRef {
  id: string;
  /** A Short: shown upright (9:16) rather than 16:9. */
  vertical: boolean;
}

const ID = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTube(url: unknown): YouTubeRef | null {
  if (typeof url !== "string" || url.length > 300) return null;
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www\.|m\.|music\.)/, "");
  let id = "";
  let vertical = false;
  if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, rest] = u.pathname.split("/");
    if (kind === "watch") id = u.searchParams.get("v") ?? "";
    else if (kind === "shorts") {
      id = rest ?? "";
      vertical = true;
    }
    else if (kind === "embed" || kind === "live") id = rest ?? "";
  }
  return ID.test(id) ? { id, vertical } : null;
}

/** The link stored for a video (normalised), or "" for none / not YouTube. */
export function normaliseYouTube(url: unknown): string {
  const ref = parseYouTube(url);
  if (!ref) return "";
  return ref.vertical ? `https://www.youtube.com/shorts/${ref.id}` : `https://www.youtube.com/watch?v=${ref.id}`;
}
