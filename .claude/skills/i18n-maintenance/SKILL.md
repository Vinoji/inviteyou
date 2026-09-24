---
name: i18n-maintenance
description: Keep messages/en.json and messages/ta.json in sync whenever UI text in this app changes. Use whenever you add, edit, or remove any user-facing string (labels, buttons, headings, placeholders, error messages, aria-labels) anywhere under app/, components/, or lib/ in this project.
---

# Keeping translations current

This app (Namma Vivaham) ships English + Tamil via `next-intl`. There is
**no English fallback at runtime** — a key missing from `messages/ta.json`
throws in Tamil, and a key missing from `messages/en.json` throws in
English. Every UI change that touches text is an i18n change, not a
follow-up.

## The rule

Any time you add, rename, or remove a hardcoded user-facing string in a
component or route:

1. Add/update the same key in **both** `messages/en.json` and
   `messages/ta.json` — never just one. Match the existing namespace
   structure (`common`, `landing`, `notFound`, `editor`, `invite.<component>`,
   `rsvpsPage`, `invitePage`, `themeToggle`, `languageSwitcher`,
   `categories.<id>`, `templates.<id>`, `defaultContent.<templateId>`).
2. Write a **real Tamil translation** in `messages/ta.json` — not the
   English text left in place, not a placeholder, not a machine-literal
   transliteration. Match the tone of neighboring Tamil strings already in
   that file (conversational, warm, matches the wedding-invitation domain).
3. Preserve ICU interpolation placeholders exactly (`{name}`, `{n}`,
   `{count}`, `{color}`, `{title}`, `{who}`, `{category}`, etc.) — the key
   name inside `{}` must be identical in both files, only the surrounding
   sentence changes per language.
4. If the string needs different grammar per language (e.g. a possessive
   like `{who}'s {category}` doesn't translate literally into Tamil), write
   an entirely different sentence structure in `ta.json` rather than forcing
   English word order — see `common.occasionTitle` for the existing example
   of this.
5. Never write literal `&amp;`, `&middot;`, `&ldquo;`/`&rdquo;` etc. into
   message values — these are HTML entities that only decode inside literal
   JSX text, not inside strings returned by `t()`. Use the actual character
   (`&`, `·`, `"`) directly in the JSON.

## Verify before considering it done

Run this after every message-file edit — it catches missing/mismatched keys
in seconds, which is much faster than finding them via a runtime crash:

```bash
cd /Users/gowtham/Projects/inviteyou && node -e "
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('messages/en.json','utf8'));
const ta = JSON.parse(fs.readFileSync('messages/ta.json','utf8'));
function keys(o, prefix='') {
  let r = [];
  for (const k in o) {
    const p = prefix ? prefix+'.'+k : k;
    if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) r = r.concat(keys(o[k], p));
    else r.push(p);
  }
  return r;
}
const ek = new Set(keys(en)), tk = new Set(keys(ta));
const missingInTa = [...ek].filter(k => !tk.has(k));
const missingInEn = [...tk].filter(k => !ek.has(k));
console.log('missing in ta:', missingInTa);
console.log('missing in en:', missingInEn);
"
```

Both arrays must print empty (`missing in ta: []` / `missing in en: []`)
before the change is done. Also spot-check with `npx tsc --noEmit` — a
component calling `t("someNewKey")` with a typo'd or unregistered key won't
be caught by TypeScript (next-intl's typed messages aren't wired up in this
project), so the array-diff check above is the real safety net.

## Where new locales' data-driven content lives

Two kinds of text live in these files beyond simple UI labels:

- `categories.<id>.*` and `templates.<id>.*` — the non-text config (ids,
  colors, `singlePerson`/`showCountdown` flags) lives in `lib/categories.ts`
  / `lib/templates.ts`; only the display strings live in the message files.
  See `lib/i18n/categories.ts` / `lib/i18n/templates.ts` for how they're
  merged back together at render time.
- `defaultContent.<templateId>.*` — the seed story/FAQ/venue/parent-name
  text shown in a fresh editor session, per template. Non-text seed values
  (dates, times) stay in `lib/defaultContent.ts`. See
  `lib/i18n/defaultContent.ts` for the merge.

If you add a new template or category, you must add entries to **all three**
places (the config file, `messages/en.json`, `messages/ta.json`) — the
config alone will throw a missing-translation error at render time.

## If a third language is ever added

Update `i18n/routing.ts`'s `locales` array, add `messages/<locale>.json`
with every key this skill's verify script would otherwise flag as missing,
and add that locale to `components/LanguageSwitcher.tsx`'s option list and
the `languageSwitcher` message namespace.
