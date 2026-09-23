---
name: run-namma
description: Build, run, and drive the Namma Vivaham wedding-invitation Next.js app. Use when asked to start namma, run the dev server, build it, screenshot its pages (landing, editor, published invite), or check a UI change actually renders.
---

This is a Next.js 16 (App Router) app on a native Windows dev machine —
`chromium-cli` isn't available here (it's a container-only tool), so it's
driven via a small committed Playwright script instead:
`.claude/skills/run-namma/driver.mjs`. All paths below are relative to the
project root (`D:\react\namma`).

## Prerequisites

Node 22 (already on this machine) and the project's own deps, including
`playwright` as a devDependency specifically so the driver script resolves
it via normal `node_modules` lookup — see Gotchas for why that matters.

```bash
npm install
npx playwright install chromium   # one-time browser binary download
```

## Setup

```bash
cp .env.local.example .env.local
# fill in FIREBASE_ADMIN_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
# NEXT_PUBLIC_RAZORPAY_KEY_ID (see .env.local.example / README.md)
```

`/` and `/create/[templateId]` render fine with no env vars at all. Anything
Firestore-backed (`/invite/[slug]`, `/api/*`) needs `FIREBASE_ADMIN_KEY` or
it 500s.

## Build

No separate build step needed to run the driver (dev server only). To
typecheck + production-build:

```bash
npm run build
```

## Run (agent path)

Start the dev server in the background and wait for it to actually serve —
don't `sleep`, poll the port:

```bash
(nohup npm run dev > /tmp/namma-dev.log 2>&1 &)
for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
```

Then drive it — **`MSYS_NO_PATHCONV=1` is required** (see Gotchas):

```bash
MSYS_NO_PATHCONV=1 node .claude/skills/run-namma/driver.mjs "/" "/create/traditional-gold" "/create/floral-pastel" "/create/elegant-bw" "/create/beach-boho" "/create/minimal-modern"
```

Screenshots land in `.claude/skills/run-namma/screenshots/<slug>.png`
(`/` → `root.png`, `/create/traditional-gold` → `create_traditional-gold.png`,
etc). The script prints one line per path with either `[ok]` or the
console-error/navigation-failure detail, and exits non-zero if anything
failed. **Actually open and look at the screenshot** — the exit code only
tells you the page didn't error, not that it looks right.

To check the published invite page (`/invite/[slug]`), you need a real
published slug — either walk the create → publish flow yourself, or ask
whoever has a test invitation for its slug.

Stop the server when done:

```bash
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id \$_ -Force }"
```

## Run (human path)

```bash
npm run dev   # -> http://localhost:3000, Ctrl-C to stop
```

## Test

No automated test suite in this project. The closest things:

```bash
npm run build   # typecheck + production build must succeed
npm run lint    # eslint, zero warnings expected
```

---

## Gotchas

- **`MSYS_NO_PATHCONV=1` is mandatory when calling `driver.mjs` from Git
  Bash.** Without it, MSYS silently rewrites any argument starting with `/`
  into a Windows path before node ever sees it — `"/"` becomes
  `"C:/Program Files/Git/"`, `"/create/traditional-gold"` becomes
  `"C:/Program Files/Git/create/traditional-gold"`, and Playwright then
  fails with `net::ERR_FILE_NOT_FOUND` trying to navigate to that as a file
  URL. This is invisible in the error — it just looks like a bad URL — so
  if you see `ERR_FILE_NOT_FOUND` pointing at a `C:/Program Files/Git/...`
  path, this is why.
- **A one-off `npx playwright` script does NOT resolve `import { chromium }
  from "playwright"` on Windows**, even with `NODE_PATH` set — `NODE_PATH`
  is CommonJS-only and Node's ESM resolver ignores it entirely. This is
  exactly why `playwright` is a real devDependency of this project instead
  of something fetched ad hoc: `driver.mjs` living under the project root
  means normal upward `node_modules` resolution just works.
  (`npm run dev` picks up the Next.js binary the same ordinary way — this
  gotcha is specific to one-off ESM scripts invoked outside the project
  tree.)
- **A 404 page will always show up as "1 console error"** in the driver's
  report — Chromium logs the failed resource load for any non-2xx
  navigation response, even when the 404 is the intended behavior (e.g.
  screenshotting `/invite/does-not-exist` to verify the not-found page
  renders correctly). Read the screenshot, not just the exit code, before
  concluding something's broken.
- **Stale dev server on port 3000 serves old env vars.** Next 16's dev
  server takes a lock; if one instance is already running and you start
  another, the new one prints "Another next dev server is already running"
  and gives up (or falls back to 3001) while the *old* process keeps
  serving 3000 — including whatever `.env.local` it started with. If you
  just edited `.env.local` and the app doesn't seem to see the change, kill
  the process actually holding port 3000 first (see the stop command above)
  and clear the lock dir before relaunching:
  `rm -rf .next/dev`.
- **The whole `.claude/` directory can vanish outside of git** (it
  happened once this session — `.claude/skills/run-namma/` disappeared
  while unrelated tracked files were untouched; cause unconfirmed, `assets/`
  and other untracked dirs survived whatever it was). If this skill goes
  missing, its full contents are recoverable from the conversation history
  that authored it — recreate `SKILL.md` and `driver.mjs` verbatim rather
  than re-deriving the gotchas from scratch.

## Troubleshooting

- **`page.goto: net::ERR_FILE_NOT_FOUND at c:/Program%20Files/Git/...`**:
  MSYS path-mangled the URL — rerun with `MSYS_NO_PATHCONV=1` (see Gotchas).
- **`Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'playwright'`**:
  you're running a Playwright script from somewhere other than this
  project (e.g. copied to a temp/scratchpad dir) so it can't find
  `node_modules/playwright` by upward lookup. Run `driver.mjs` in place
  from the project root, or `npm install -D playwright` wherever the
  script actually lives.
- **`/invite/[slug]` (or any `/api/*` route) 500s**: `FIREBASE_ADMIN_KEY`
  is missing/invalid in `.env.local`, or the project's Firestore database
  doesn't exist yet in the Firebase console (Admin SDK throws `5 NOT_FOUND`
  in that case, not a permissions error).
- **`Cannot find module '...driver.mjs'`**: the whole `.claude/` directory
  went missing (see the Gotcha above) — recreate `SKILL.md` and
  `driver.mjs` from this document / prior conversation history.
