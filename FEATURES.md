# Namma Vivaham — What's Already Built

A snapshot of the features in this codebase today. For setup, see [README.md](README.md).

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Firebase**: Firestore + Storage (client SDK), Admin SDK on the server
- **Razorpay** for payments
- **next-intl** for English / Tamil
- **framer-motion** for animation, **three / @react-three/fiber / drei** for the 3D ring scene
- **qrcode**, **slugify**, **lucide-react**

## Pages

| Route | What it does |
|---|---|
| `/` | Landing page: pick a template, grouped by occasion |
| `/create/[templateId]` | Editor: form on the left, live preview on the right (same components as the public page) |
| `/create/[templateId]?edit=[slug]&token=[editToken]` | Edit a published invitation (free) |
| `/invite/[slug]` | Public invitation page, server-rendered, with a dynamic OG image |
| `/rsvps/[slug]?token=…` | Owner-only guest list (all RSVPs, including declines), token-gated and `noindex` |
| `/ta/...` | Tamil version of every page (English has no prefix) |

Also included: locale-level `error.tsx`, `not-found.tsx` and a root `global-error.tsx`.

## Occasions and templates

Six occasion categories ([lib/categories.ts](lib/categories.ts)) relabel the same underlying fields. For example, "Bride's name" becomes "Host name(s)" for a house warming:

| Category | Templates | Notes |
|---|---|---|
| Wedding | `traditional-gold`, `minimal-modern`, `floral-pastel`, `elegant-bw`, `beach-boho` | |
| Anniversary | `anniversary-emerald` | |
| Valentine | `valentine-blush` | |
| Proposal | `proposal-starlit` | No countdown (the date is in the past) |
| Birthday | `birthday-confetti` | Single person |
| House warming | `housewarming-terracotta` | Single person |

**Wedding templates share one layout.** All 5 wedding templates use the royal-palace layout ([components/invite/royal/](components/invite/royal/)): palace doors that open with a petal shower, a toran-framed hero with a mandapam, a sealed "With Grateful Hearts" note, families, events, a polaroid memory stack, Travel Guide, Places to Explore, RSVP and a Thank You section. Each template only changes the colour palette ([palettes.ts](components/invite/royal/palettes.ts)):

| Template | Palette |
|---|---|
| `traditional-gold` | Temple gold on granite, marigold toran. Has its own "Kolam & Temple Bell" intro and motion (see Motion engine) |
| `minimal-modern` | Champagne on charcoal, jasmine toran |
| `floral-pastel` | Blush on deep rose, rose toran |
| `elegant-bw` | Silver on black, white-flower toran |
| `beach-boho` | Sand on teal, coral toran |

The other occasions keep the original section layout.

**Font pairings** ([lib/fontPairings.ts](lib/fontPairings.ts)): `classic-serif`, `modern-clean`, `elegant-script`, `royal-cinzel`, `tamil-calligraphy`, `tamil-classic`.

## Editor: what the user can set

- Names (groom/bride, or one host)
- Wedding date, ceremony time and venue, reception time and venue (name, address, maps link)
- Story text
- Groom's and bride's parents (Family section)
- Accent colour and font pairing
- Photos, uploaded straight to Firebase Storage ([components/editor/PhotoSlot.tsx](components/editor/PhotoSlot.tsx))
- Optional background music track
- Up to 4 FAQ items ("Things to Know": dress code, parking, etc.)
- **Travel Guide** (wedding only): destination city, up to 3 airports, up to 2 train routes with up to 3 trains each
- **Places to Explore** (wedding only): up to 6 places, each with a description, distance and illustration (temple, palace, nature, heritage or beach)
- **Section toggles**: story, family, schedule, gallery, RSVP, FAQ, guest photos, travel, places

## Invitation page sections and effects

Components are in [components/invite/](components/invite/):

- **Hero** with ornaments, and a **Countdown** timer
- **Story**, **Family**, **Schedule**, **Gallery** / **Carousel**
- **ThingsToKnow** (FAQ)
- **RsvpForm**: name, guest count, attending yes/no, side (groom/bride/friend), message
- **BlessingsWall**: shows accepted RSVPs that include a message
- **GuestGallery**: guests upload their own photos (max 40 per invitation)
- **ShareBox** and a downloadable **QRCodeBox**
- **AudioToggle** for the background music
- **WelcomeBanner** and **ViewTracker** (view counting)
- Motion: Reveal / RotateReveal / ZoomReveal, ParallaxLayer, ScrollScene, SectionDivider
- Decor ([components/invite/decor/](components/invite/decor/)): 3D ring scene, particles, spotlight, moon, clouds, hills, palm fronds, paisley, mandala, floral sprig, balloons, house and ring motifs, wave line, and an ambient tone hook
- Respects reduced-motion (`useSafeReducedMotion`); decorative 3D and particles sit behind a `SilentErrorBoundary`

## Motion engine

Each template chooses its own intro, particles and scroll motion. The prompts for giving each wedding template its own motion are in [docs/template-motion-prompts.md](docs/template-motion-prompts.md).

- **Intros** ([components/invite/intros/](components/invite/intros/)): each template's `intro` (in [lib/templates.ts](lib/templates.ts)) picks an intro from [registry.ts](components/invite/intros/registry.ts).
  - Today there are three: `door` (palace doors; minimal-modern, floral-pastel, elegant-bw, beach-boho), `kolam` (traditional-gold: a kolam draws itself on granite, lamps light, and the temple bell rings) and `envelope` (wax-seal card, used by the other occasions).
  - `IntroHost` runs every intro. On the public page it covers the window, locks scroll until the guest opens it, and skips it for the rest of that browser session. In the editor it plays inside the preview pane.
  - Opening the intro starts the couple's uploaded music track. The editor has a "Replay intro" button.
- **Particles** ([components/invite/particles/](components/invite/particles/)): `ParticleField` draws everything on one canvas, in either burst or ambient mode.
  - Presets: marigold, jasmine, embers, inkDots, pastelPetals, butterflies, glitter, bubbles, sunGlints.
  - Performance limits: device pixel ratio capped at 2, at most 120 burst and 40 ambient particles, halved on low-end devices. The loop pauses when the canvas is off-screen or the tab is hidden.
  - With reduced motion, nothing is drawn.
- **Motion themes** ([lib/motionThemes.ts](lib/motionThemes.ts)): each template sets how sections enter, how headings animate, the dividers, ambient particles and background colour.
  - `Section`, `MotionHeading` and `Ambient` ([components/invite/motion/](components/invite/motion/)) read the theme.
  - Built so far: section entrances "rise" and "tier", headings "maskUp" and "goldSweep", dividers "none" and "kolamLine", and the "gold" progress thread. Other options fall back to rise, maskUp and no divider.
  - Section moments (families sliding in like temple doors, diyas on event rows, brass arch photo frames, flip-tile countdown, a slowly turning mandala) are switched on per template in `moments`. Only traditional-gold uses them so far.

## Publish and payment flow (₹199)

1. `POST /api/draft` saves a `pending_payment` doc (Admin SDK only)
2. `POST /api/create-order` creates a Razorpay order
3. Razorpay Checkout runs in the browser
4. `POST /api/verify-payment` recomputes the HMAC-SHA256 signature on the server, then creates the slug and `editToken` and publishes to `invitations/{slug}`
5. A one-time banner shows the edit link

## API routes

| Route | Purpose | Protection |
|---|---|---|
| `POST /api/draft` | Save draft | — |
| `POST /api/create-order` | Razorpay order | Draft must exist |
| `POST /api/verify-payment` | Verify signature and publish | HMAC check |
| `GET/PUT /api/invitation/[slug]` | Load or edit a published invite | `editToken` |
| `POST /api/rsvp/[slug]` | Submit an RSVP | Rate limit: 8/hour per IP |
| `POST /api/guest-photos/[slug]` | Register a guest photo | Rate limit: 8/hour per IP, 40-photo cap |
| `POST /api/view/[slug]` | Increment view count | Rate limit: 1 per 30 min per IP |

## Security

- **No auth or accounts.** Drafts are reached by an unguessable ID; edits need an `editToken`.
- **All Firestore writes go through the Admin SDK.** Client writes are denied by [firestore.rules](firestore.rules).
- **Private data is kept separate.** `editToken` and Razorpay IDs live in `invitations/{slug}/private/meta`, which clients can never read.
- **Public reads are limited to published docs.** Only published invitations, and their RSVPs and guest photos, are readable.
- **Uploads are checked.** [storage.rules](storage.rules) validates upload content type and size.
- **Input is cleaned and throttled.** Input sanitising is in [lib/sanitize.ts](lib/sanitize.ts) and the in-memory rate limiter is in [lib/rateLimit.ts](lib/rateLimit.ts).

## Other features

- **i18n**: English and Tamil ([messages/en.json](messages/en.json), [messages/ta.json](messages/ta.json)), plus a LanguageSwitcher
- **Dark mode** via ThemeToggle
- **Project skills**: `i18n-maintenance` (keeps the en/ta files in sync) and `run-namma` (build, run and take screenshots)

## Notes

- The README says "pick one of five templates", but there are now **10 templates across 6 categories**.
- The seed train timings for each wedding template are samples. The invitation page asks guests to confirm timings with the railways before booking.
- `scripts/` and `assets/` are currently empty. The Christian-wedding SVGs in `assets/svg/` show as deleted in git.
