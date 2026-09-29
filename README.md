# InviteForYou — Wedding Invitation Sites (inviteforyou.in)

Next.js (App Router) + TypeScript + Tailwind CSS + Firebase (Firestore +
Storage) + Razorpay. No authentication, no user accounts — access to a draft
is by possessing an unguessable id, and access to edit a published
invitation is gated by a random `editToken` handed to the creator once.

## How it works

1. **`/`** — pick a template (10 across 6 occasions).
2. **`/create/[templateId]`** — fill in the form on the left; the actual
   invitation renders live on the right (same components used on the public
   page, so what you see is what guests get). Photos upload straight to
   Firebase Storage under `invitations/{draftId}/photo-{n}.jpg`.
3. **Publish (₹199)** — `POST /api/draft` saves the form as a
   `pending_payment` Firestore doc (Admin SDK only — the client never writes
   to Firestore directly), `POST /api/create-order` creates a Razorpay
   order, Razorpay Checkout opens, and on success the client posts the
   payment ids + signature to `POST /api/verify-payment`. That route
   recomputes the HMAC-SHA256 signature server-side and only *then* mints a
   slug + `editToken`, moves the doc to `invitations/{slug}`, and returns
   both. A signature mismatch leaves the draft untouched so the user can
   retry — a client-reported "success" is never trusted on its own.
4. **`/invite/[slug]`** — the public page. Server-rendered from Firestore via
   the Admin SDK, 404s unless `status == "published"`, has a dynamic OG
   image, live countdown, RSVP form, share box and downloadable QR code.
5. **Editing** — the one-time post-publish banner shows a link of the form
   `/create/[templateId]?edit=[slug]&token=[editToken]` — save it, it's the
   only way back in. `PUT /api/invitation/[slug]` checks the token against a
   Firestore doc before writing. Editing is always free.

### A deliberate deviation from the literal spec

`editToken` (and the Razorpay payment/order ids) live in
`invitations/{slug}/private/meta`, **not** as fields directly on
`invitations/{slug}`. Firestore security rules can't redact individual
fields on a `get` — an `allow get: if status == 'published'` rule exposes
the *entire* document to any client that reads it directly, which would leak
the edit token to anyone poking at the Firestore JS SDK from devtools. The
private subcollection has `allow read, write: if false` and is only ever
touched by the Admin SDK. Everything else follows the spec's data model.

## Setup

### 1. Firebase

The client config in [`lib/firebase.ts`](lib/firebase.ts) already points at
the `vinoji-291fa` project. You need a **service account** for the Admin SDK:

Firebase Console → Project Settings → Service Accounts → *Generate new
private key*. Paste the downloaded JSON as a single line into
`FIREBASE_ADMIN_KEY` (see `.env.local.example`).

Deploy the security rules:

```bash
npm install -g firebase-tools   # if you don't have it
firebase login
firebase deploy --only firestore:rules,storage --project vinoji-291fa
```

(`firestore.rules` and `storage.rules` are at the repo root. You'll need a
`firebase.json` pointing at them, or paste them into the console's Rules
tab.)

### 2. Razorpay

Create a key pair in **test mode** first:
https://dashboard.razorpay.com/app/keys

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Test with card `4111 1111 1111 1111`, any future expiry, any CVV. Switch to
live keys only after completing KYC on the Razorpay dashboard — test and
live keys are interchangeable in this codebase, nothing else needs to
change.

### 3. Environment variables

```bash
cp .env.local.example .env.local
# then fill in FIREBASE_ADMIN_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
# NEXT_PUBLIC_RAZORPAY_KEY_ID, NEXT_PUBLIC_SITE_URL
```

### 4. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying to Vercel

Push to a Git repo, import it in Vercel, and set the same env vars from
`.env.local.example` in the project's Environment Variables settings
(`FIREBASE_ADMIN_KEY` as one line, `NEXT_PUBLIC_SITE_URL` set to your
production domain). No other config needed — the API routes are already
plain Next.js Route Handlers.

## Known limitations (given the no-auth constraint)

- **Storage writes** are open to anyone who knows a draft's folder id
  (`storage.rules` restricts by content-type/size, not ownership — there's
  no ownership concept without auth). The id is a random UUID never listed
  anywhere, so this relies on obscurity plus validation, not a real ACL.
- **View-count and RSVP rate limiting** are best-effort in-memory guards
  (`lib/rateLimit.ts`) that reset on a serverless cold start, plus a short
  Firestore-side duplicate check for RSVPs. Good enough to blunt casual
  spam/refresh inflation; not a hard guarantee under a real attack.
- **Abandoned `pending_payment` drafts** (and their uploaded photos) are
  never cleaned up automatically. A scheduled Cloud Function sweeping old
  `pending_payment` docs/Storage folders would be the production follow-up.
