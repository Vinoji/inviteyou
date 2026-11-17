// The WhatsApp video of an invitation: the real page, recorded
// frame-perfect in a headless browser — its opening, then every screen —
// with music and an end card, as a 1080×1920 MP4.
//
// Time in the page is frozen and moved on exactly one frame at a time
// (Playwright's clock for timers and requestAnimationFrame; CSS animations
// stepped by hand), with a screenshot after each step, so the video is
// smooth however slow the machine is.
//
// node render/record-invite.mjs --url <page> --out <file.mp4>
//   [--music <file.mp3>] [--names "A & B"] [--date "24 Jan 2027"]
//   [--link inviteforyou.in/invite/slug] [--fps 30] [--chromium <path>]
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : dflt;
};
const URL_ = arg("url");
const OUT = arg("out");
const MUSIC = arg("music");
const NAMES = arg("names", "");
const DATE = arg("date", "");
const LINK = arg("link", "inviteforyou.in");
const FPS = Number(arg("fps", 30));
const DT = 1000 / FPS;
const TOTAL_MS = 32000; // the whole video, roughly
const OPENING_MS = 4800;
const END_MS = 3200;
if (!URL_ || !OUT) throw new Error("--url and --out are required");

// Steps every CSS animation/transition by dt ms (scroll-linked ones follow
// the scroll and are left alone).
const STEPPER = () => {
  window.__step = (dt) => {
    for (const a of document.getAnimations()) {
      if (a.timeline && !(a.timeline instanceof DocumentTimeline)) continue;
      if (a.playState === "running") a.pause();
      const now = Number(a.currentTime ?? 0);
      try {
        if (a.playState === "paused" || a.playState === "finished") a.currentTime = (Number.isFinite(now) ? now : 0) + dt;
      } catch {
        // cancelled mid-step
      }
    }
  };
};

const log = (() => {
  const t0 = Date.now();
  return (msg) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${msg}`);
})();

(async () => {
  const frames = fs.mkdtempSync(path.join(os.tmpdir(), "invite-video-"));
  const b = await chromium.launch({ executablePath: arg("chromium") || undefined, args: ["--use-gl=angle", "--use-angle=swiftshader"] });
  // a phone's screen: 360×640 at 3× = 1080×1920
  const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  // recording never writes anything (RSVPs, view counts…)
  await ctx.route("**/api/**", (r) => (r.request().method() === "GET" ? r.continue() : r.abort()));
  await ctx.addInitScript(STEPPER);
  await ctx.clock.install();
  await ctx.clock.pauseAt(Date.now() + 1000);
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);

  log(`1/5 opening the invitation: ${URL_}`);
  await p.goto(URL_, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForSelector("[data-invite-root], section", { state: "attached", timeout: 120000 });
  await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({
    content:
      // no buttons over the picture; every line already in place as it scrolls in
      "button[class*=fixed],[class*=bottom-4][class*=fixed],[class*=scrollHint],[data-preview-watermark]{visibility:hidden!important}" +
      "[class*=cinema-module][class*=reveal]{opacity:1!important;filter:none!important;transform:none!important;translate:none!important}",
  });
  await p.evaluate(() =>
    Promise.all([...document.images].map((i) => ((i.loading = "eager"), i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))))
  );
  await p.waitForTimeout(1200);

  let n = 0;
  let y = 0; // where the page is scrolled (the recorder is the only one moving it)
  const frame = async () => {
    await ctx.clock.runFor(DT);
    await p.evaluate((dt) => window.__step(dt), DT);
    // A clip with scale 3 captures at the phone's full 1080×1920 (a plain
    // capture comes back at CSS size, 360×640); the clip is in page
    // coordinates, so it follows the scroll.
    const r = await cdp.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 90,
      clip: { x: 0, y, width: 360, height: 640, scale: 3 },
    });
    fs.writeFileSync(path.join(frames, `f${String(n++).padStart(5, "0")}.jpg`), Buffer.from(r.data, "base64"));
  };
  const hold = async (ms) => {
    for (let t = 0; t < ms; t += DT) await frame();
  };
  const glide = async (to, ms) => {
    const from = await p.evaluate(() => scrollY);
    ms = Math.max(ms, Math.abs(to - from) * 0.9);
    const steps = Math.round(ms / DT);
    for (let i = 1; i <= steps; i++) {
      const k = i / steps;
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      y = Math.round(from + (to - from) * e);
      await p.evaluate((top) => scrollTo(0, top), y);
      y = await p.evaluate(() => scrollY);
      await frame();
    }
  };

  log("2/5 recording the opening");
  await hold(OPENING_MS);

  // Where to stop: the start of each screen, at least most of a screen
  // apart, up to the first form (FAQ, guests' photos, RSVP: things to do on
  // the page, not to watch in a video) — at most seven.
  const stops = await p.evaluate(() => {
    const vh = innerHeight;
    const form = document.querySelector("[data-invite-root] :is(form, input, textarea, select, details)");
    const end = form ? form.getBoundingClientRect().top + scrollY - vh * 0.6 : Infinity;
    const max = Math.min(document.documentElement.scrollHeight - vh, Math.max(vh, end));
    const tops = [...document.querySelectorAll("[data-invite-root] section, main section")]
      .filter((s) => s.offsetHeight > vh * 0.3)
      .map((s) => Math.min(max, Math.round(s.getBoundingClientRect().top + scrollY)))
      .sort((a, b) => a - b);
    const keep = [];
    for (const y of tops) if (y > 0 && (!keep.length || y - keep[keep.length - 1] >= vh * 0.75)) keep.push(y);
    if (!keep.length || max - keep[keep.length - 1] > vh * 0.75) keep.push(max);
    return keep.slice(0, 7);
  });
  const each = (TOTAL_MS - OPENING_MS - END_MS) / stops.length;
  log(`3/5 scrolling through ${stops.length} screens`);
  for (const stop of stops) {
    await glide(stop, Math.min(1300, each * 0.4));
    await hold(Math.max(900, each * 0.6));
  }

  log("4/5 end card");
  await p.evaluate(
    ({ names, date, link }) => {
      const d = document.createElement("div");
      d.style.cssText =
        "position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:28px;text-align:center;" +
        "background:radial-gradient(120% 90% at 50% 40%,#7a1b2b,#22050d);color:#fff6e6;opacity:0;transition:opacity .6s;font-family:Georgia,serif";
      const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      d.innerHTML =
        (names ? `<div style="font-size:30px;font-weight:700;line-height:1.15">${esc(names)}</div>` : "") +
        (date ? `<div style="font-size:17px;color:#ffcf6b">${esc(date)}</div>` : "") +
        `<div style="margin-top:14px;font:600 13px/1.4 system-ui,sans-serif;opacity:.85">RSVP · directions · photos</div>` +
        `<div style="padding:9px 16px;border-radius:999px;background:linear-gradient(90deg,#ffcf5a,#f59e0b);color:#3b1206;font:800 15px system-ui,sans-serif">${esc(link)}</div>`;
      document.body.appendChild(d);
      requestAnimationFrame(() => (d.style.opacity = "1"));
    },
    { names: NAMES, date: DATE, link: LINK }
  );
  await hold(END_MS);
  await b.close();
  const secs = n / FPS;
  log(`   ${n} frames = ${secs.toFixed(1)}s at ${FPS}fps`);

  log("5/5 encoding the MP4" + (MUSIC ? " with music" : ""));
  const ff = ["-v", "error", "-y", "-framerate", String(FPS), "-i", path.join(frames, "f%05d.jpg")];
  if (MUSIC) ff.push("-stream_loop", "-1", "-i", MUSIC);
  ff.push("-vf", "format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-r", String(FPS));
  if (MUSIC) ff.push("-af", `afade=t=in:d=1,afade=t=out:st=${(secs - 2).toFixed(2)}:d=2,volume=0.8`, "-c:a", "aac", "-b:a", "128k", "-shortest");
  ff.push("-movflags", "+faststart", OUT);
  execFileSync("ffmpeg", ff);
  fs.rmSync(frames, { recursive: true, force: true });
  log(`done: ${OUT} (${(fs.statSync(OUT).size / 1048576).toFixed(1)} MB)`);
})();
