// The gallery cards' snapshots: each design's first screen, after its
// opening plays, from its sample page (/sample/<id>) in a phone-shaped
// window (9:16), in each
// language → public/thumbs/<locale>/<id>.webp. Then run `npm run art` (also
// run by dev/build) to list them in lib/thumbs.generated.json.
//
//   npm run build && npm start          (or any running server)
//   npm run thumbs -- [base] [id ...]   (default base http://localhost:3000,
//                                        default ids: every visible design)
//
// Nothing is written to the live database: the page's API writes are blocked.
import path from "node:path";
import fs from "node:fs";
import { chromium } from "playwright";
import sharp from "sharp";
const PROJ = process.cwd();
const BASE = process.argv[2] || "http://localhost:3000";
const src = fs.readFileSync(path.join(PROJ, "lib/templates.ts"), "utf8");
const IDS = process.argv.slice(3).length
  ? process.argv.slice(3)
  : [...src.matchAll(/\n    id: "([^"]+)",/g)]
      .map((m) => m[1])
      .filter((id) => {
        const i = src.indexOf(`id: "${id}"`);
        return !/hidden: true/.test(src.slice(i, src.indexOf("\n  },", i)));
      });
const CONC = 3;
const W = 390, H = Math.round((390 * 16) / 9); // a phone screen, as the cards show it: 9:16

(async () => {
  const args = ["--use-gl=angle", "--use-angle=swiftshader"];
  // Playwright's own browser, else any Playwright Chromium already installed.
  const b = await chromium.launch({ args }).catch(() => {
    const cache = path.join(process.env.HOME ?? "", "Library/Caches/ms-playwright");
    const dir = fs.existsSync(cache) ? fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().pop() : null;
    if (!dir) throw new Error("No Chromium found — run: npx playwright install chromium");
    return chromium.launch({ args, executablePath: path.join(cache, dir, "chrome-mac/Chromium.app/Contents/MacOS/Chromium") });
  });
  const jobs = [];
  for (const id of IDS) for (const loc of ["en", "ta"]) jobs.push([id, loc]);
  const results = [];
  const work = async () => {
    while (jobs.length) {
      const [id, loc] = jobs.shift();
      // a phone-shaped window: each design's first screen lays itself out for it
      const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: loc === "ta" ? "ta-IN" : "en-IN" });
      await ctx.route("**/api/**", (r) => (r.request().method() === "GET" ? r.continue() : r.abort()));
      const p = await ctx.newPage();
      let res = "ok";
      try {
        await p.goto(`${BASE}/${loc}/sample/${id}`, { waitUntil: "domcontentloaded", timeout: 120000 });
        await p.waitForSelector("[data-invite-root]", { state: "attached", timeout: 120000 });
        // the opening plays by itself; wait for it to leave
        await p.waitForTimeout(1200);
        await p
          .waitForFunction(() => !document.querySelector('[class*="intro-module"][class*="slot"]'), null, { timeout: 30000 })
          .catch(() => (res = "intro-stayed"));
        await p.evaluate(() => scrollTo(0, 0));
        await p.waitForTimeout(4500); // the first screen rises in and the opening's petals settle
        await p.evaluate(() => scrollTo(0, 0));
        // nothing floating over the design (music button, help)
        await p.addStyleTag({ content: "[data-preview-watermark], [class*=scrollHint], body > div[class*=fixed]:not([data-invite-root] *), button[class*=fixed], [class*=bottom-4][class*=fixed]{visibility:hidden!important}" });
        await p.waitForTimeout(300);
        const shot = await p.screenshot();
        const dir = path.join(PROJ, "public/thumbs", loc);
        fs.mkdirSync(dir, { recursive: true });
        await sharp(shot).resize({ width: 540 }).webp({ quality: 78 }).toFile(path.join(dir, `${id}.webp`));
      } catch (e) {
        res = "ERR " + String(e.message).slice(0, 80);
      }
      results.push(`${res}  ${loc} ${id}`);
      if (res !== "ok") console.log(res, loc, id);
      await ctx.close();
    }
  };
  await Promise.all(Array.from({ length: CONC }, work));
  await b.close();
  console.log("done", results.filter((r) => r.startsWith("ok")).length, "/", results.length);
})();
