# InviteForYou

**Animated digital invitations for weddings and every Indian celebration — in Tamil and English, shared with one link.**

🌐 **Live:** [inviteforyou.in](https://inviteforyou.in) · 📸 [Instagram](https://www.instagram.com/inviteforyouofficial/) · ▶️ [YouTube](https://www.youtube.com/@InviteForYouOfficial) · 👍 [Facebook](https://www.facebook.com/people/Inviteforyou/61594935339271/)

InviteForYou turns an invitation into a small personal website. A couple picks a design, fills in names, functions, family, story, photos and music, watches a live preview as they type, and publishes it. Guests open one link — usually on WhatsApp — to an animated opening, the event details, directions, a countdown and an RSVP form.

---

## Highlights

- **69 designs across 9 occasions** — wedding, engagement, anniversary, Valentine's, proposal, birthday, housewarming, baby celebrations (valaikappu, seemantham, naming) and corporate events.
- **Animated openings** — temple bells, silk curtains, a lamp being lit, an opening envelope, cinematic photo openings, and premium **3D** worlds (palace, temple, cathedral, garden).
- **Tamil and English** — the whole site, and separately the invitation's own language, so the editor can be in English while guests read Tamil.
- **Everything guests need** — multiple functions with timings, Google Maps directions, add-to-calendar, countdown, family with proper kin wording, story, photo gallery, background music, guest photo wall, blessings, QR code and personalised greetings.
- **RSVP and guest list** — guests reply in a tap; the owner gets a private, token-gated guest list.
- **Media handled in the browser** — photos are cropped and compressed (and stripped of GPS data) before upload; songs are re-encoded to compact MP3s. A built-in library of licensed photos and music covers couples without their own.
- **Free cards and one-time pricing** — one free design per occasion gives a downloadable card image; a live invitation website is ₹199 and premium 3D ₹399 at launch (₹299 / ₹599 after 12 Nov 2026), paid once via Razorpay. Designing, previewing and edits are always free.
- **Search-ready** — occasion landing pages, bilingual sitemap with `hreflang`, schema.org structured data, Open Graph share cards and [`/llms.txt`](https://inviteforyou.in/llms.txt) for AI assistants.

## Tech stack

| Area | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript |
| Styling & motion | Tailwind CSS v4, CSS Modules, framer-motion, three.js / @react-three/fiber |
| Internationalisation | next-intl (English unprefixed, Tamil under `/ta`) |
| Data & files | Firebase Firestore + Storage (client SDK for uploads, Admin SDK on the server) |
| Payments | Razorpay Checkout + signed webhooks |
| Hosting | Vercel |

## How it works

1. **Choose** — `/` and `/invitations/<occasion>` list the designs; `/demo` plays every opening.
2. **Create** — `/create/<templateId>` is the editor: a stepped form on the left and the real invitation rendering live on the right (the same components guests see). Drafts autosave to the browser. Photos and music upload directly to Firebase Storage under `invitations/<draftId>/`.
3. **Publish** — `POST /api/draft` stores the draft as `pending_payment` (Admin SDK only — clients never write to Firestore), `POST /api/create-order` opens a Razorpay order, and `POST /api/verify-payment` recomputes the HMAC signature server-side before minting a slug and a secret `editToken`. A client-reported "success" is never trusted on its own; the Razorpay webhook is a second, independent confirmation.
4. **Share** — `/invite/<slug>` is server-rendered from Firestore with a dynamic share image, and is `noindex` so private invitations stay out of search results.
5. **Edit and track** — the owner's private links reopen the editor (`?edit=<slug>&token=…`) and the guest list (`/rsvps/<slug>?token=…`).
6. **Expiry** — an invitation stays live until 10 days after its date; the owner can restore it for ₹50 per extra 30 days.

### Security notes

- There are no user accounts. Access to an invitation is by possession of an unguessable id; editing requires the `editToken`, which lives in a private `invitations/<slug>/private/meta` subcollection (`allow read, write: if false`) because Firestore rules can't hide individual fields of a readable document.
- `storage.rules` allows create-only uploads of images and audio under unique names — nothing can be overwritten or deleted by a client.
- `/api/media` is a same-origin pass-through limited to the bucket's `invitations/` folder and to image/audio content types (used for re-cropping and iOS volume control, as the bucket sends no CORS headers).
- Rate limits (`lib/rateLimit.ts`) are best-effort, in-memory guards per serverless instance.

## Project structure

```
app/
  [locale]/            Pages (home, invitations, create, invite, rsvps, demo, support, legal)
  api/                 Route handlers (draft, payments, RSVP, guest photos, media, views)
  sitemap.ts, robots.ts, llms.txt/, manifest.ts
components/
  editor/              Editor UI (photos, music, family, events, cropper)
  invite/              Invitation layouts, intros, 3D worlds, music, RSVP
  landing/, site/      Marketing pages, header, footer, site music
lib/                   Templates, categories, pricing, SEO, sanitising, media helpers
messages/              en.json and ta.json — every user-facing string
public/                Template art, photo library and music library
docs/                  Template art credits, motion and 3D notes
firestore.rules, storage.rules
```

More detail on what's built: [FEATURES.md](FEATURES.md) · Image and music credits: [docs/template-art.md](docs/template-art.md)

## Getting started

### Requirements

- Node.js 20 or later
- A Firebase project (Firestore + Storage) and a service-account key
- Razorpay test keys

### Setup

```bash
git clone https://github.com/Vinoji/inviteyou.git
cd inviteyou
npm install
cp .env.example .env    # then fill in the values
npm run dev             # http://localhost:3000
```

### Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public origin for links, share cards and the sitemap (production: `https://inviteforyou.in`) |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web config (falls back to the production project) |
| `FIREBASE_ADMIN_KEY` | Service-account JSON on one line — server only, secret |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay keys (use test keys locally; card `4111 1111 1111 1111`) |
| `RAZORPAY_WEBHOOK_SECRET` | Secret configured for `/api/razorpay-webhook` |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Optional search-console ownership tags |

### Firebase rules

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,storage --project <your-project-id>
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server (regenerates the template-art manifest first) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run art` | Rebuild `lib/artManifest.generated.json` from `public/art` |

Type-check with `npx tsc --noEmit`. English and Tamil message files must keep identical keys.

## Deployment

The site deploys to Vercel from the `main` branch. Set the environment variables above in the Vercel project (`FIREBASE_ADMIN_KEY` as a single line, `NEXT_PUBLIC_SITE_URL` to the production domain), and add the Razorpay webhook pointing at `/api/razorpay-webhook`.

## Running the business

- **Prices and the launch offer.** Three tiers in [`lib/pricing.ts`](lib/pricing.ts): free (designs with `free: true` in `lib/templates.ts` — card image only, never published), standard (₹199 until 12 November 2026, India time, then ₹299) and premium 3D (`badge: "premium"`; ₹399, then ₹599). Change `TIER_PRICES` and `OFFER_ENDS_AT` there. The site's countdown, every displayed price and the payment check all read from there, so the offer ends on its own; payments started just before the end are honoured for 24 hours.
- **Discount and partner codes.** Codes live in [`lib/coupons.ts`](lib/coupons.ts). `WEDDING50` (₹50 off) is shown to couples on their guest-list page for their next invitation. To add a partner (photographer, mandapam, printer…), add one line such as `{ code: "RAVISTUDIO", offInr: 20, kind: "partner", label: "Ravi Studio" }` and give them the link `https://inviteforyou.in/?ref=RAVISTUDIO` — the code is remembered for 30 days and applied at publish. Each paid publish records `coupon`, `amountPaise` and `templateId` in Firestore `payments/{orderId}`, so a partner's sales can be counted for commission. No invitation goes below ₹49 after a discount.
- **Real metrics.** The home page's "by the numbers" strip and the ★ ratings on design cards come from [`lib/stats.ts`](lib/stats.ts), counted from Firestore and cached for an hour: invitations published, times guests opened them, RSVPs, average review rating (overall and per design), and the share of free-card makers who later published (the editor counts a device's first free card in `stats/funnel`, and marks a later purchase from that device `fromFreeCard` in `payments/`). Each number appears only once it passes its threshold (e.g. 25 invitations, 5 reviews, 50 free-card makers) — never typed in.
- **Approving reviews.** Couples review from their private guest-list page. Reviews land in the Firestore `reviews` collection with `approved: false`; set `approved` to `true` in the Firebase console to show one on the home page ("What families say" appears once at least one is approved). Editing a review hides it again until re-approved.

## Licence

© InviteForYou. All rights reserved. Photos and music in `public/` are used under the Pexels and Pixabay licences listed in [docs/template-art.md](docs/template-art.md).
