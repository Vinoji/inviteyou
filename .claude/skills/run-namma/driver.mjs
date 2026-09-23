#!/usr/bin/env node
/**
 * Drives the Namma Vivaham Next.js app in headless Chromium via Playwright.
 *
 * This is the project's stand-in for `chromium-cli`, which isn't available
 * on this Windows dev machine (it's a container-only tool). `playwright` is
 * a devDependency of this project specifically so this script resolves it
 * via normal node_modules lookup — see Gotchas in SKILL.md for why a
 * one-off `npx playwright` script does NOT work here.
 *
 * Usage (run from the project root, dev server already up — see SKILL.md):
 *   node .claude/skills/run-namma/driver.mjs <url-path> [url-path...]
 *
 * Each <url-path> is resolved against BASE_URL (default
 * http://localhost:3000). For each one this navigates, waits for the
 * network to settle, takes a full-page screenshot, and reports any
 * browser console errors. Exits non-zero if any page failed to load or
 * logged a console error.
 *
 * Examples:
 *   node .claude/skills/run-namma/driver.mjs "/"
 *   node .claude/skills/run-namma/driver.mjs "/create/traditional-gold" "/create/floral-pastel"
 *   BASE_URL=http://localhost:3001 node .claude/skills/run-namma/driver.mjs "/invite/some-slug"
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "screenshots");
mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const paths = process.argv.slice(2);

if (paths.length === 0) {
  console.error("Usage: node driver.mjs <url-path> [url-path...]");
  console.error('Example: node driver.mjs "/" "/create/traditional-gold"');
  process.exit(1);
}

function slugify(p) {
  if (p === "/" || p === "") return "root";
  return p.replace(/^\//, "").replace(/[^a-zA-Z0-9_-]+/g, "_");
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

let hadFailure = false;

for (const p of paths) {
  const errors = [];
  page.removeAllListeners("console");
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  const url = new URL(p, BASE_URL).toString();
  const outFile = join(OUT_DIR, `${slugify(p)}.png`);

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    // Let webfonts, inline SVGs, and client hydration settle before capture.
    await page.waitForTimeout(800);
    await page.screenshot({ path: outFile, fullPage: false });
    if (errors.length) {
      hadFailure = true;
      console.log(`${p} -> ${outFile} [${errors.length} console error(s): ${errors.join(" | ")}]`);
    } else {
      console.log(`${p} -> ${outFile} [ok]`);
    }
  } catch (err) {
    hadFailure = true;
    console.log(`${p} -> FAILED: ${err instanceof Error ? err.message : String(err)}`);
  }
}

await browser.close();
process.exit(hadFailure ? 1 : 0);
