// The Cloud Run job behind the ₹99 WhatsApp video: records one paid
// invitation's live page (record-invite.mjs), uploads the MP4 to Firebase
// Storage and reports progress on invitations/<slug>/private/meta.video,
// which the owner's page polls (app/api/video/status).
//
// Started by the site (lib/video.ts) with:
//   --slug <slug> --payment <paymentId> --music <url> --names "…" --date "…"
// or, to test the container: --dry-url <page>
// Runs as the project's default service account (Firestore + Storage).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { recordInvite } from "./record-invite.mjs";

const arg = (name, dflt = "") => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : dflt;
};
const SITE = (process.env.SITE_URL || "https://inviteforyou.in").replace(/\/$/, "");
const BUCKET = process.env.BUCKET || "vinoji-291fa.firebasestorage.app";

// --dry-url <page>: record that page and report, touching nothing — a test
// of the container itself (Chromium, fonts, ffmpeg, timing).
const dryUrl = arg("dry-url");
if (dryUrl) {
  const out = path.join(os.tmpdir(), "dry.mp4");
  const made = await recordInvite({ url: dryUrl, out, names: arg("names"), date: arg("date"), fps: 30 });
  console.log("dry run ok", JSON.stringify(made));
  process.exit(0);
}
const slug = arg("slug");
const paymentId = arg("payment");
if (!/^[a-z0-9-]{3,80}$/.test(slug) || !paymentId) throw new Error("--slug and --payment are required");

initializeApp({ storageBucket: BUCKET });
const db = getFirestore();
const metaRef = db.collection("invitations").doc(slug).collection("private").doc("meta");
const set = (fields) => metaRef.update(Object.fromEntries(Object.entries(fields).map(([k, v]) => [`video.${k}`, v])));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "job-"));
try {
  const meta = (await metaRef.get()).data() ?? {};
  if (meta.video?.paymentId !== paymentId) throw new Error("No video purchase for this payment on this invitation.");
  if (meta.video?.status === "ready") {
    console.log("already made", meta.video.path);
    process.exit(0);
  }
  await set({ status: "rendering", startedAt: Date.now(), error: null });

  let music;
  const musicUrl = arg("music");
  if (musicUrl) {
    const res = await fetch(musicUrl.startsWith("/") ? SITE + musicUrl : musicUrl);
    if (res.ok) {
      music = path.join(tmp, "music");
      fs.writeFileSync(music, Buffer.from(await res.arrayBuffer()));
    } else {
      console.warn("music not fetched:", res.status, "— the video will be silent");
    }
  }

  const out = path.join(tmp, "video.mp4");
  const made = await recordInvite({
    url: `${SITE}/invite/${slug}`,
    out,
    music,
    names: arg("names"),
    date: arg("date"),
    link: `${SITE.replace(/^https?:\/\//, "")}/invite/${slug}`,
    fps: 30,
  });

  const dest = `videos/${slug}/${paymentId}.mp4`;
  await getStorage().bucket().upload(out, { destination: dest, contentType: "video/mp4", resumable: false });
  await set({ status: "ready", path: dest, readyAt: Date.now(), seconds: Math.round(made.seconds), bytes: made.bytes });
  console.log("ready", dest);
} catch (err) {
  console.error(err);
  await set({ status: "failed", error: String(err?.message ?? err).slice(0, 300), failedAt: Date.now() }).catch(() => {});
  process.exitCode = 1;
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
