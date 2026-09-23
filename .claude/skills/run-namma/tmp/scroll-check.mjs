import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT_DIR = "D:/react/namma/.claude/skills/run-namma/screenshots";
mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = "http://localhost:3000";
const targets = [
  { path: "/create/proposal-starlit", reduceMotion: false },
  { path: "/create/proposal-starlit", reduceMotion: true },
  { path: "/create/floral-pastel", reduceMotion: false },
  { path: "/create/traditional-gold", reduceMotion: false },
  { path: "/create/beach-boho", reduceMotion: false },
];

const browser = await chromium.launch();
let hadFailure = false;

for (const t of targets) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: t.reduceMotion ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

  const suffix = t.reduceMotion ? "_reduced" : "";
  const slug = t.path.replace(/^\//, "").replace(/[^a-zA-Z0-9_-]+/g, "_") + suffix;

  try {
    await page.goto(new URL(t.path, BASE_URL).toString(), { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT_DIR}/${slug}_top.png` });

    // Scroll down in steps to trigger scroll-linked/viewport reveals.
    const height = await page.evaluate(() => document.body.scrollHeight);
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((height / steps) * i));
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: `${OUT_DIR}/${slug}_mid.png` });

    // Scroll back near top to capture the hero with moon/clouds/hills risen.
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT_DIR}/${slug}_hero_after_scroll.png` });

    console.log(`${t.path}${suffix} -> ${errors.length} console error(s)${errors.length ? ": " + errors.join(" | ") : ""}`);
    if (errors.length) hadFailure = true;
  } catch (err) {
    hadFailure = true;
    console.log(`${t.path}${suffix} -> FAILED: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    await context.close();
  }
}

await browser.close();
process.exit(hadFailure ? 1 : 0);
