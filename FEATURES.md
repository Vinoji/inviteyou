# InviteYou — What's Already Built

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

**Wedding templates share one layout, each with its own motion.** All 5 wedding templates use the same layout ([components/invite/royal/](components/invite/royal/)): intro, hero, story, families, events, memories, Travel Guide, Places to Explore, RSVP and Thank You. Each template has its own palette ([palettes.ts](components/invite/royal/palettes.ts)), its own opening intro, and its own scroll motion (see Motion engine):

| Template | Palette | Opening | Motion |
|---|---|---|---|
| `traditional-gold` | Temple gold on granite | A kolam draws itself, lamps light, the temple bell rings | Gopuram-tier sections, gold-sweep headings, kolam dividers, flip-tile countdown |
| `minimal-modern` | Ink on paper, one accent colour, no ornaments | A hairline splits the screen and the names settle in | Wipes, typed headings, numbered hairlines, pinned countdown, pinned photo strip |
| `floral-pastel` | Peony, blush and sage on cream | A peony bud blooms and butterflies fly out | Paint-bloom sections, a vine growing down the margin, wreath, masonry photos, bud countdown |
| `elegant-bw` | Silver on onyx, monochrome | Pull a ribbon to open a black gift box with a silver card inside | Iris reveals, film-strip dividers, film grain, split-flap countdown, photos warming into colour |
| `beach-boho` | Sand, sea and sunset | A message in a bottle and a wave | Wave-edged sections, noon-to-dusk sky, palms, footprints, postcards, driftwood-tag countdown |

The other occasions keep the original section layout with the envelope intro.

**Font pairings** ([lib/fontPairings.ts](lib/fontPairings.ts)): `classic-serif`, `modern-clean`, `elegant-script`, `royal-cinzel`, `tamil-calligraphy`, `tamil-classic`.

## Premium 3D templates (₹999)

Three top-tier wedding designs share one 3D engine ([components/invite/palace/](components/invite/palace/)), each with its own world, intro gate, textures and wording. All are ₹999 (was ₹1499), with **Premium** and **3D Interactive** badges, and need no new editor fields.

| Template | World | Events named |
|---|---|---|
| `royal-palace-3d` | Royal palace: sandstone and marble, jali, chandeliers, a fountain courtyard | Ceremony / Reception |
| `sacred-temple-3d` | South Indian temple: a painted gopuram, a granite mandapam with carved pillars and a painted ceiling, marigold garlands, bells, a kolam aisle with agal lamps, the flagstaff, lamp towers and a glowing sanctum | Muhurtham / Reception |
| `grand-cathedral-3d` | Gothic cathedral: twin spires, a rose window, a nave of columns and pointed ribs, stained-glass lancets, pews, candles, an ivory aisle and the altar | Holy Matrimony / Reception |

The engine ([PalaceScene.tsx](components/invite/palace/PalaceScene.tsx)) runs the camera, sky, glow, halos, gold dust and petals. Each world in [scene/](components/invite/palace/scene/) supplies its architecture. Camera poses per world are in [shots.ts](components/invite/palace/shots.ts). Wording differences live in `invite.palace.worlds.<world>`.

### Royal Palace 3D

`royal-palace-3d` is the top-tier wedding design: ₹999 (was ₹1499), with a **Premium** badge and a **3D Interactive** chip on its landing card. It has its own page in [components/invite/palace/](components/invite/palace/) (`pageLayout: "palace"`) and uses the usual editor and invitation data. There are no new fields.

- **Opening** (`palaceGate` intro): darkness and gold motes, then the palace gate. Brass lamps light, the doors swing open, the view moves through into a hall of arches, then "You are invited", the names, the date and **Enter the celebration**. About 8 seconds, with **Skip intro** throughout. It's CSS 3D, so it also plays in the landing card.
- **3D palace behind the page** ([PalaceScene.tsx](components/invite/palace/PalaceScene.tsx), React Three Fiber): a gate in a domed facade, a pillared hall with jali screens and chandeliers, a courtyard fountain with floating diyas, and the inner palace. Each section carries `data-palace-shot`. As the guest scrolls, the camera eases between the poses in [shots.ts](components/invite/palace/shots.ts): entrance, hall, courtyard, and finally back outside to the lit palace.
- **Sections:** entrance, couple (the first two photos as arched portraits), story timeline (split from the story text), families, event cards with View location, four-column countdown, portrait gallery, then travel, places, FAQ, RSVP, blessings, guest photos and share. The shared sections sit on ivory parchment.
- **Performance:** instanced geometry, no shadows or post-processing, and capped DPR. A per-device budget (low/mid/high) sets particles, petals and lights. Rendering pauses in a hidden tab or off screen. The scene loads only after the intro. Without WebGL, or if it fails, a CSS/SVG palace ([PalaceArt.tsx](components/invite/palace/PalaceArt.tsx)) is shown instead. The guest's "Reduce motion" choice gives a still scene.

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

Each template chooses its own intro, particles and scroll motion. The design brief is [docs/template-motion-prompts.md](docs/template-motion-prompts.md), whose status section records what's built and where it differs from the brief.

- **Intros** ([components/invite/intros/](components/invite/intros/)): each template's `intro` in [lib/templates.ts](lib/templates.ts) picks one from [registry.ts](components/invite/intros/registry.ts).
  - The intros are `kolam`, `split`, `bloom`, `giftbox`, `bottle`, `envelope` (the non-wedding occasions) and `door` (currently unused).
  - `IntroHost` runs every intro. On the public page it covers the window, locks scroll until the guest opens it, and skips it for the rest of that browser session. In the editor it plays inside the preview pane.
  - Opening an intro starts the couple's uploaded music. The editor has a "Replay intro" button.
  - The landing page shows a short CSS/SVG loop of each template's intro on its card.
- **Particles** ([components/invite/particles/](components/invite/particles/)): `ParticleField` draws everything on one canvas, in burst or ambient mode.
  - Presets: marigold, jasmine, embers, inkDots, pastelPetals, butterflies, glitter, bubbles, sunGlints.
  - Performance limits: device pixel ratio capped at 2, at most 120 burst and 40 ambient particles, halved on low-end devices. The loop pauses when the canvas is off-screen or the tab is hidden.
  - With reduced motion, nothing is drawn.
- **Motion themes** ([lib/motionThemes.ts](lib/motionThemes.ts)): per template, how sections enter (rise, tier, wipe, bloom, iris, wave), heading style, dividers, the scroll-progress thread, ambient and RSVP particles, a "plain" no-ornament mode, and `moments`.
  - `moments` are the template-specific touches in the families, events, gallery, story and countdown sections, plus the pinned countdown, palms, sky and film grain.
  - Implemented in [components/invite/motion/](components/invite/motion/).
- **Tested:** every template has a reduced-motion path. At 4× CPU slowdown on a production build, there were no long tasks during the intro or a fast scroll.

## Publish and payment flow (₹199)

1. The buyer enters their **mobile number** (required) along with the invitation.
2. `POST /api/draft` saves a `pending_payment` doc (Admin SDK only). The number goes to a private sub-document (`private/owner`), never onto the invitation itself.
3. `POST /api/create-order` creates a Razorpay order, and Razorpay Checkout runs in the browser.
4. `POST /api/verify-payment` recomputes the HMAC-SHA256 signature on the server (constant-time compare), then creates the slug and `editToken` and publishes to `invitations/{slug}`. The buyer's number moves to `private/meta`.
5. **The server sends the buyer their links** (the guest link plus the private edit link) by WhatsApp, falling back to SMS, via Twilio ([lib/notify.ts](lib/notify.ts)). This is optional: with no Twilio settings, nothing is sent. A failed message never fails the purchase.
6. **A popup** shows the edit link with Copy, says whether it was sent and how, and offers "Send to my WhatsApp" and "Send by SMS" buttons as a backup.

## Expiry and restore (₹50)

- **An invitation expires at the end of the 10th day after its date,** India time ([lib/expiry.ts](lib/expiry.ts)). Invitations without a date never expire. The rule is computed from the date each time, so changing the date moves the expiry, and invitations published before this rule follow it too.
- **After expiry,** guests see "This invitation has ended" (not indexed by search engines), and new RSVPs and guest photos are refused (410).
- **Restoring is owner-only,** from the edit link: the editor shows an "expired" banner with **Restore for ₹50**, which adds 30 days and can be repeated.
- **The server checks the restore payment's signature, and also confirms with Razorpay** that the order is a ₹50 restore for that same invitation. Each payment can only be applied once. The owner also gets a "restored until …" message.

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
| `POST /api/restore-order` | Start a ₹50 restore payment | `editToken`; only when expired |
| `POST /api/verify-restore` | Verify it and add 30 days | `editToken` + HMAC + order check (amount, purpose, slug); once per payment |

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
