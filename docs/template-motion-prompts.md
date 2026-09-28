# InviteYou: template motion prompts

> **Status in this repo: all prompts (0–6) are done.** Read this before changing anything; the prompts below are kept as the original design brief.
>
> **Where things live**
> - Intros: `components/invite/intros/`. `IntroHost` plays the intro named by each template's `intro` in `lib/templates.ts`, looked up in `registry.ts`. The contract is `types.ts`, the window events are in `events.ts`, and `audio.ts` handles sound effects.
> - Particles: `components/invite/particles/` (`ParticleField` and `presets.ts`).
> - Motion themes: `lib/motionThemes.ts`, with the implementations in `components/invite/motion/`:
>   - `Section` (entrances and dividers), `MotionHeading`, `ScrollThread`, `Ambient`, `RsvpBurst` and `IntroSweep`.
>   - `moments.tsx` and `scenery.tsx` for the template-specific touches.
>   - `scroll.ts`, the scroll-progress hooks.
> - Wedding layout and palettes: `components/invite/royal/`.
>
> **Distinctness check (Prompt 6)**
>
> | Template | Intro | Burst particles | Section entrance | Heading | Divider | Thread |
> |---|---|---|---|---|---|---|
> | traditional-gold | kolam (tap the bell) | embers + jasmine | tier | goldSweep | kolamLine | gold |
> | minimal-modern | split (tap anywhere) | inkDots | wipe | inkType | hairline | ink |
> | floral-pastel | bloom (tap the bud) | butterflies + pastelPetals | bloom | handwrite | vine (thread) | vine |
> | elegant-bw | giftbox (pull the ribbon) | glitter | iris | maskUp | filmStrip | silver |
> | beach-boho | bottle (tap the cork) | bubbles + sunGlints | wave | maskUp + wobble | wave | rope |
>
> The `door` intro (palace doors, marigold petals) stays registered but no template uses it. There is no `royal-palace-door` template in this repo.
>
> **Rules learned along the way**
> - **Use the hooks in `motion/scroll.ts` for anything scroll-linked**, not Framer's `useScroll`. Framer only tracks the window, but the editor preview scrolls inside a pane.
> - **Never make a clipped or masked element its own in-view trigger.** An element that starts fully hidden by its own clip or mask never counts as visible, so its animation never fires. Put the trigger on the unclipped parent and pass the state down, as `MotionHeading` and `GratefulNote`'s split story do.
> - **Round trigonometry results in rendered SVG** (`toFixed`). The server and the browser print long floats differently, which causes a hydration mismatch.
> - **Intro sounds go through `playSound`.** Creating an `AudioContext` inside a tap was a 90–160ms long task at 4× CPU slowdown.
> - **In a 3D (`preserve-3d`) scene, depth decides what receives the pointer, not z-index.** Keep decorative layers `pointer-events: none`.
>
> **QA results (Prompt 6)**
> - **Tested for every wedding template and one envelope template:**
>   - Screenshots at 390×844 and 360×780, with no console errors and no horizontal overflow.
>   - Reduced motion: an open or "View invitation" button, nothing left hidden, no particle canvas.
>   - Tamil: labels translated, no errors.
>   - The editor preview plays inside the pane, and "Replay intro" works.
> - **Long tasks at 4× CPU slowdown, on a production build: none** during the intro or a fast scroll.
> - **The screenshots** are in `.claude/skills/run-namma/screenshots/motion/<template>/`, which is git-ignored. Prompt 6 asked for `/screenshots/motion/`.
>
> **Where this repo departs from the prompts**
> - **Intros are server-rendered** rather than `ssr: false`, so the invitation never flashes before the intro. Each intro still loads as its own chunk.
> - **`IntroProps` has no `labels` field,** because intros load their own translations. It adds `weddingDate`, `templateId` and `burst()`.
> - **The kolam is two interlaced loops,** because one continuous line can't weave an even-sized dot ring. Its white-to-gold change is a crossfade.
> - **Some entrances play when a section scrolls into view** instead of following the scroll position: "rise", "tier", the headings and the moments. "wipe", "bloom", "iris" and "wave" do follow the scroll position.
> - **Approximations:**
>   - "bloom" uses a soft oval clip rather than a turbulence-edged blob. Filters never run on moving layers.
>   - "handwrite" uses the prompt's fallback, a left-to-right reveal.
>   - The gift box's tracking-tighten on headings is omitted, because letter-spacing is a layout property.
>   - The bottle's tilt parallax is skipped on iOS, which needs a permission prompt. Those devices get the idle drift.
> - **Background music:** a guest opening the intro starts the couple's uploaded track. The generated fallback tone only plays when a guest taps the music button.
> - **Not run:** Lighthouse, and a real published `/invite/<slug>`. Both need Firebase.

Paste these prompts into Claude Code inside the InviteYou repo. Each wedding template gets its own **opening moment**, its own **particles** and its own **scroll language**, so no two invitations feel alike.

## How to use

1. Put the `namma-royal-door` files into the repo first (DoorIntro, `cinematic/`, PetalShower).
2. Run **Prompt 0** once. It builds the shared engine that every template uses.
3. Run **Prompts 1–5** one at a time, in a fresh session each. Check each template on your phone before starting the next.
4. Finish with **Prompt 6** (QA across all templates).

Save this file as `docs/template-motion-prompts.md`. You can then just say *"Do Prompt 3 from docs/template-motion-prompts.md"*.

## The six templates at a glance

| Template | Opening (intro) | Guest action | Particles | Scroll signature |
|---|---|---|---|---|
| `royal-palace-door` ✅ done | Carved palace doors swing open, the view pushes through | Tap "Open invitation" | Marigold petals | Sections rise as cards, the Places section pins and slides sideways |
| `traditional-gold` | A kolam draws itself on granite, brass lamps light, the temple bell rings | Tap the bell | Diya embers + jasmine | Gopuram tiers stack in, kolam-line wipes between sections |
| `minimal-modern` | A hairline draws across white, the screen splits like a Swiss poster, giant names shrink into place | Tap anywhere | Tiny ink dots, very sparse | Big numbers pin and count, text masks, clean horizontal wipes |
| `floral-pastel` | A closed peony bud unfolds petal by petal, vines grow and butterflies fly out | Tap the bud | Pastel petals + butterflies | A vine grows down the margin with scroll, flowers bloom at each section |
| `elegant-bw` | A black gift box: the satin ribbon unties, the lid lifts in 3D, a silver card rises out | Pull (or tap) the ribbon | Silver glitter | Spotlight and iris reveals, line-art frames draw themselves, film-grain fades |
| `beach-boho` | A bottle washes ashore, the cork pops, a paper scroll unrolls, a wave washes the screen clean | Tap the cork | Bubbles, foam, sun glints | Animated wave dividers, the sky turns from noon to sunset as you scroll |

Keep all six openings short: under 4 seconds from tap to readable names.

---

## Prompt 0: shared motion engine (run once)

```
You are working in the InviteYou repo (Next.js 16 App Router, React 19, TypeScript,
Tailwind v4, framer-motion, Firebase). Read WHATS_BUILT.md, components/invite/, lib/templates*,
lib/categories.ts and lib/fontPairings.ts before changing anything.

Goal: a shared engine so every wedding template can have its own intro, particles and scroll
motion, chosen from its template config. Don't redesign any template yet. This is plumbing.

1. INTRO REGISTRY
   - Create components/invite/intros/ with one file per intro. Move EnvelopeIntro there
     unchanged and add the existing DoorIntro.
   - Define a shared contract in components/invite/intros/types.ts:
       type IntroProps = {
         names: { a: string; b?: string }; dateLabel?: string;
         labels: Record<string,string>;          // from next-intl
         fonts: { display: string; script: string; caps: string };
         accent: string;
         onOpen: () => void;     // guest acted: start music, unlock scroll
         onDone: () => void;     // intro fully gone: set heroRevealed=true
         preview?: boolean;      // editor pane: absolute not fixed, no scroll lock, no audio
       }
   - Create components/invite/intros/registry.ts that maps an intro id to
     next/dynamic(() => import(...), { ssr: false }), so each intro's code only loads for its template.
   - Add `intro: IntroId` to each template config. Current values:
     royal-palace-door → "door". All other templates → "envelope" for now.
   - The invite page and the editor preview both render registry[template.intro].
   - Add a "Replay intro" button in the editor, next to the preview.

2. PARTICLE ENGINE
   - Replace PetalShower with components/invite/particles/ParticleField.tsx: one canvas,
     one requestAnimationFrame loop, and presets:
       "marigold" | "jasmine" | "embers" | "inkDots" | "pastelPetals" | "butterflies" |
       "glitter" | "bubbles" | "sunGlints"
   - Each preset defines: shape draw fn, colours, count, size range, velocity, gravity,
     wind/sway, spin, lifetime, blend mode ("lighter" for embers/glitter/glints).
   - Modes: "burst" (one-shot on intro open) and "ambient" (low count, loops behind a section).
   - Performance rules (required):
       cap devicePixelRatio at 2; max 120 particles on burst and 40 on ambient;
       halve counts when navigator.hardwareConcurrency <= 4;
       pause the loop when the canvas is off-screen (IntersectionObserver) or the tab is hidden;
       never allocate objects inside the frame loop (reuse a pool).
   - prefers-reduced-motion → render nothing.
   - Keep the existing decor/particles component working. Map it to a preset if it overlaps.

3. MOTION THEME PER TEMPLATE
   - Move components/invite/cinematic/ (SceneRise, SplitHeading, Reveal, IrisReveal,
     ScrollThread, Letterbox, useEnterProgress) to components/invite/motion/. Keep the names.
   - Add lib/motionThemes.ts:
       type MotionTheme = {
         sectionEnter: "rise" | "tier" | "wipe" | "bloom" | "iris" | "wave";
         heading: "maskUp" | "letters" | "goldSweep" | "inkType" | "handwrite";
         divider: "none" | "kolamLine" | "hairline" | "vine" | "filmStrip" | "wave";
         ambient?: ParticlePreset;          // loops quietly behind hero / thank-you
         pageBg: string;                     // colour behind rising sections
         thread?: "gold" | "ink" | "vine" | "silver" | "rope" | null;
       }
   - Create components/invite/motion/Section.tsx. It wraps any existing section (Story, Family,
     Schedule, Gallery, RSVP, FAQ, BlessingsWall, GuestGallery) and applies the current template's
     sectionEnter + divider from context (MotionThemeProvider in the template renderer).
     Only implement "rise" now. The others are stubs that fall back to "rise".
   - Section headings use <MotionHeading> which switches on theme.heading ("maskUp" now).

4. RULES FOR EVERY INTRO AND EFFECT
   - Animate only transform, opacity, filter and clip-path. No layout properties.
   - Scroll effects use framer MotionValues (useScroll/useTransform). No setState on scroll.
   - The page wrapper uses overflow: clip, never overflow: hidden, so sticky pinning works.
   - Everything has a reduced-motion path that shows the final state instantly.
   - Audio starts only in onOpen (after the guest acts), respects AudioToggle, and is off in preview.
   - The OG image stays static. Don't touch /api or the Firestore rules.

5. ACCEPTANCE
   - The existing 10 templates look and behave exactly as before, apart from the new engine.
   - royal-palace-door plays DoorIntro, and the others play EnvelopeIntro, via the registry.
   - Lighthouse mobile performance on /invite/[slug] doesn't drop by more than 3 points.
   - Run the run-namma skill: screenshot /create/traditional-gold and /invite/<any slug>,
     then build with zero TypeScript errors.
   - Run i18n-maintenance if you added any strings.
```

---

## Prompt 1: `traditional-gold`, "Kolam & Temple Bell"

```
Template: traditional-gold (Wedding). Use the shared engine from Prompt 0
(intro registry, ParticleField, MotionTheme, Section/MotionHeading).
Mood: a South Indian temple courtyard at dawn. Brass, granite, jasmine, lamp light.

PALETTE   granite #1E1A17, temple gold #C8962E, brass #E3B45A, kumkum red #A3202A,
          jasmine #FFF8EC, banana-leaf green #3E6B2F
FONTS     keep the template's font pairing; tamil-classic must look right on /ta.

1. INTRO: new file intros/KolamIntro.tsx, id "kolam"
   Storyboard (total about 3.6s after the tap, auto-plays the first 1.8s before it):
   0.0s  Dark granite floor (subtle noise texture via CSS/SVG turbulence, no image file).
         A grid of white rice-flour dots fades in.
   0.2s  A kolam (sikku/pulli style, 7x7 dots) draws itself: one continuous SVG path around
         the dots, animated with pathLength 0→1 over 1.6s, ease-in-out. Generate the path
         procedurally from the dot grid so the names can sit in the centre.
   1.8s  Two brass kuthuvilakku lamps (SVG) at the left and right. A small temple bell hangs
         at the top, swaying gently. Text: "With the blessings of the divine" plus the names
         in gold, and "Tap the bell". The bell has a soft pulse halo.
   TAP   The bell swings (rotate -18° → 14° → -8° → 0, spring) and a bell tone plays (short
         WebAudio synthesis, no file). The lamp wicks light one after another, 5 flames per
         lamp, 80ms apart, each flame a flickering radial gradient.
   +0.6s Warm light spreads from the kolam centre: a radial clip-path circle grows from
         0% to 150%, revealing the hero underneath. The kolam lines turn gold as the light
         passes (stroke colour tweens white → #E3B45A).
   +1.2s ParticleField burst "embers" (rising, blend lighter) + "jasmine" (falling, slow sway).
   +3.2s onDone → hero names reveal with heading "goldSweep".

2. MOTION THEME
   sectionEnter "tier"   Each section enters like a gopuram tier. It starts as a narrower,
                         lower band (scaleX .86, y 40, clip-path trapezoid inset) and widens
                         into a full rectangle as it scrolls in. The top edge carries a small
                         repeating temple-crest border (SVG) that slides down into place.
   heading "goldSweep"   Text starts in brass, then a bright gold highlight band sweeps
                         left→right once (background-clip:text with a moving
                         linear-gradient, background-position animated by an in-view trigger).
   divider "kolamLine"   Between sections, a short kolam motif draws itself (pathLength scrubbed
                         by scroll progress), with a small diya at its centre that lights at 100%.
   ambient "embers"      A few embers rise behind the hero and the thank-you section.
   thread "gold"         The progress thread ends in a small lamp flame instead of a dot.
   pageBg                #1E1A17

3. SECTION-SPECIFIC MOMENTS
   - Family: the two families enter from the left and right like temple doors meeting
     (x ±60 → 0). A thali/mangalsutra line icon draws itself between them.
   - Schedule: each event row lights a small diya at its left edge as it scrolls in.
   - Gallery: photos sit in brass temple-arch frames. As you scroll, each photo zooms
     slowly (scale 1.12 → 1) inside its frame.
   - Countdown: the digits flip like brass temple-calendar tiles (rotateX flip).
   - Reuse the existing decor/mandala and decor/paisley as slow-rotating background
     layers (rotate 0→20° across the page scroll).

4. REDUCED MOTION
   Show the finished gold kolam with the hero already visible behind it and a "View
   invitation" button. No bell swing, particles or tier animation.

5. ACCEPTANCE
   The intro reads as a kolam being drawn, not random lines: record a GIF with run-namma and
   check. No layout shift. Works in /ta with Tamil fonts. Build passes.
```

---

## Prompt 2: `minimal-modern`, "Swiss Split"

```
Template: minimal-modern (Wedding). Use the shared engine from Prompt 0.
Mood: an architect's wedding. White space, one hairline, big confident type.
Motion should feel like a well-edited film title sequence: fast, exact, no bounce.

PALETTE   paper #FAFAF7, ink #111111, graphite #6B6B6B, one accent = invitation accent
          colour (default #C2410C), hairline #D9D9D4
EASING    use [0.77, 0, 0.175, 1] (expo in-out) everywhere. No springs, no overshoot.

1. INTRO: new file intros/SwissSplitIntro.tsx, id "split"
   Before the tap: a white screen. A 1px ink hairline draws from left to right across the
   middle (0.9s). Above the line, small caps: "Save the date". Below it: the date in large
   tabular numerals. Text at the bottom: "Tap anywhere".
   TAP   (total 2.4s)
   0.0s  The line thickens to 2px and the screen splits along it. The top half slides up
         and the bottom half slides down (translateY ∓100%). Each half carries its own text.
   0.3s  Behind the split, the names appear HUGE (about 38vw), clipped by the opening gap.
         As the gap widens, the names scale down (scale 3 → 1) and settle into their hero
         position (shared-layout style, driven by a single MotionValue).
   1.0s  The accent colour enters as one thin underline under "&" (scaleX 0→1).
   1.4s  ParticleField burst "inkDots": 30 tiny ink dots scatter from the split line,
         then fade out. Nothing more. Restraint is the point.
   2.4s  onDone.

2. MOTION THEME
   sectionEnter "wipe"   Each section is revealed by a clean horizontal clip-path wipe
                         (inset(0 100% 0 0) → inset(0 0 0 0)), scrubbed by scroll. Even-numbered
                         sections wipe from the right.
   heading "inkType"     Headings type in word by word with a thin caret that blinks twice
                         at the end, then disappears. Stays fast: 60ms per character, max 1.2s.
   divider "hairline"    A full-width hairline draws with scroll progress, with a small
                         section number at its right end (01, 02… for real section order).
   ambient               none
   thread "ink"          A 1px ink progress line.
   pageBg                #FAFAF7 (sections don't show rounded "cards" here).

3. SECTION-SPECIFIC MOMENTS
   - Countdown: pinned for one screen. The days number is set enormous and counts down from
     (days+30) to the real value as you scroll through the pin. Tabular numbers.
   - Schedule: a sticky left column shows the event time in large numerals and swaps as each
     event row passes (crossfade + 8px y shift).
   - Story: text on the left, photo on the right, which becomes stacked on mobile.
     The photo reveals with a vertical wipe while the text lines unmask one by one.
   - Gallery: a horizontal pinned scroll strip. Photos are grayscale and turn to colour
     when centred.
   - RSVP: inputs are underlined-only. The focus underline animates in the accent colour.

4. REDUCED MOTION
   No split: just the final hero with the hairline. Headings show instantly.

5. ACCEPTANCE
   It should feel noticeably different from royal-palace-door: no ornaments, no glow, no
   petals. All motion finishes in 1.2s or less, except the pinned sections. Build passes.
```

---

## Prompt 3: `floral-pastel`, "Blooming Bud"

```
Template: floral-pastel (Wedding). Use the shared engine from Prompt 0.
Mood: a spring garden wedding. Soft watercolour, peonies, climbing vines, butterflies.

PALETTE   blush #F6D6D6, peony #E79AA8, sage #A8BFA0, butter #F7E7B4, lavender #CBB8E0,
          cream #FFFBF5, text #4A3B3F

1. INTRO: new file intros/BloomIntro.tsx, id "bloom"
   Before the tap: cream paper with a soft watercolour wash (layered radial gradients with
   an SVG turbulence displacement filter for the blotchy edge; no image). A single closed
   peony bud sits in the centre, breathing gently (scale 1 → 1.03). Text: "Something
   beautiful is blooming" and "Tap the bud".
   Build the peony from about 18 SVG petal paths in 3 rings (inner 5, middle 6, outer 7),
   each petal its own motion.path with transform-origin at the flower centre.
   TAP   (total about 3.4s)
   0.0s  Outer ring petals rotate outward and scale up (rotate ±35°, scale 1.4), staggered
         40ms. Then the middle ring, then the inner ring, like a time-lapse bloom.
   0.8s  Two vines grow from the bottom corners up the screen edges (pathLength 0→1). Small
         leaves pop out along them (scale 0→1, staggered along the path).
   1.4s  The flower keeps opening past the screen edges (scale 1 → 6). Its centre becomes a
         soft circular window that reveals the hero (clip-path circle grows with the scale).
   1.6s  ParticleField "butterflies" (6–8 butterflies: two-wing shapes with flapping
         scaleX, flying curved paths out of the flower centre) + "pastelPetals" burst.
   3.4s  onDone → names reveal with heading "handwrite".

2. MOTION THEME
   sectionEnter "bloom"  Each section opens from a soft watercolour mask: an SVG blob mask
                         scales from 0.2 to 1.4 with its turbulence seed animating slightly, so
                         the edge looks like wet paint spreading. Scrubbed by scroll.
   heading "handwrite"   Script headings appear to be written: a mask path traced over the text
                         (pathLength 0→1). Fall back to a left→right clip reveal for fonts where
                         tracing looks wrong.
   divider "vine"        One continuous vine runs down the left margin of the whole page. Its
                         pathLength is tied to overall page scroll progress. At each section
                         boundary a flower blooms on the vine (scale 0→1, rotate -30°→0) when
                         the vine reaches it.
   ambient "pastelPetals" 8–12 petals drift slowly behind the hero and RSVP.
   thread "vine"         The vine is the progress thread; don't render the gold thread.
   pageBg                #FFFBF5

3. SECTION-SPECIFIC MOMENTS
   - Story: the couple photo sits in a flower wreath (reuse decor/floral-sprig, placed in a
     ring). The wreath spins 15° as the photo scrolls through.
   - Family: each parent name is a pressed flower on a card that tilts in (rotate -6° → 0).
   - Gallery: a masonry grid. Photos enter with a soft blur-to-sharp while petals settle on
     their corners.
   - RSVP: when a guest submits "attending", 12 butterflies burst from the button.
   - Countdown: digits sit in small flower-bud circles that open when their value changes.

4. REDUCED MOTION
   Show the fully open peony with the hero. The vine is fully drawn. No butterflies.

5. ACCEPTANCE
   It works on a mid-range Android without dropping frames (keep the petal SVGs simple and
   avoid filters on moving layers: apply turbulence only to static layers). Build passes.
```

---

## Prompt 4: `elegant-bw`, "Black Box & Silver Card"

```
Template: elegant-bw (Wedding). Use the shared engine from Prompt 0.
Mood: black-tie evening. Matte black, silver foil, satin, theatre spotlight, film grain.
Monochrome only, except photos, which start grayscale.

PALETTE   onyx #0B0B0C, charcoal #1C1C1F, silver #C9CCD1, bright silver #F2F3F5,
          smoke #8A8C91, ivory #F5F2EA
FONTS     serif display with high contrast (keep the template's pairing); tracked small caps.

1. INTRO: new file intros/GiftBoxIntro.tsx, id "giftbox"
   Before the tap: a matte black gift box seen from above, slightly tilted in 3D
   (perspective 1200px, rotateX 12°). A silver satin ribbon crosses it with a bow. A soft
   spotlight from the top (reuse decor/spotlight). Silver foil monogram on the lid.
   Text: "Pull the ribbon". Also accept a tap on the bow.
   GESTURE  Dragging the ribbon end sideways (framer drag="x", constrained) pulls the bow
            loose. Past 40% it completes by itself. A tap does the full sequence.
   Sequence (total about 3.2s):
   0.0s  The bow loops shrink and the ribbon ends slide off the box edges (x ±120%, slight
         rotate). Satin sheen via a moving linear-gradient.
   0.6s  The lid lifts: translateZ 0→120px, rotateX 12°→ -65°, hinged at the back edge.
         A shadow grows on the base.
   1.1s  A silver card rises out of the box (y 40% → -10%, scale .9 → 1). The names are in
         silver foil on it: an animated gradient sweep across the letters, once.
   1.5s  ParticleField burst "glitter" (tiny 4-point silver stars, blend lighter, twinkle
         via scale pulse) rising from inside the box.
   2.2s  The camera moves forward into the card (scale 1 → 2.4), and the card face becomes
         the hero background.
   3.2s  onDone.

2. MOTION THEME
   sectionEnter "iris"   Each section emerges from black through a soft circular iris
                         (clip-path circle 0% → 150%) centred where the spotlight points.
                         Add a subtle vignette that fades out as the iris opens.
   heading "maskUp"      Words slide up from a mask, with tracking tightening from .4em to the
                         final value.
   divider "filmStrip"   A thin film-perforation strip slides horizontally across with scroll
                         (x linked to progress), with a silver hairline beneath.
   ambient "glitter"     Very sparse (15 particles) behind the hero and thank-you.
   thread "silver"       Silver line; the tip is a 4-point star that twinkles.
   pageBg                #0B0B0C
   Global: a very light animated film-grain overlay (a CSS background of an SVG noise tile,
   shifted by steps(6) keyframes, opacity .06, pointer-events none). Turn it off with
   reduced motion.

3. SECTION-SPECIFIC MOMENTS
   - Story and Gallery photos are grayscale(1) and warm into colour (grayscale 1 → 0,
     brightness .8 → 1) as they reach the centre of the screen, driven by scroll.
   - Family: art-deco line frames (SVG) draw themselves around each family block
     (pathLength scrubbed).
   - Schedule: a spotlight cone (reuse decor/spotlight) follows the event row closest to the
     centre (x/y from scroll).
   - Countdown: split-flap airport-board digits in silver on charcoal.
   - RSVP button: a silver foil sweep on hover/focus; on submit a small glitter burst.

4. REDUCED MOTION
   Box already open, card showing, hero visible, no grain, photos in colour.

5. ACCEPTANCE
   Colour appears nowhere except photos (and the invitation accent only if the couple sets
   one). The drag works with touch, mouse and keyboard (Enter on the bow). Build passes.
```

---

## Prompt 5: `beach-boho`, "Message in a Bottle"

```
Template: beach-boho (Wedding). Use the shared engine from Prompt 0.
Mood: a barefoot beach wedding at golden hour. Sand, driftwood, pampas grass, turquoise
water, a sun low on the horizon.

PALETTE   sand #EAD7B7, driftwood #9C7C5B, turquoise #3FB8AF, deep sea #1D6E7A,
          coral #E9806E, sunset gold #F2B45A, shell white #FFF9F0

1. INTRO: new file intros/BottleIntro.tsx, id "bottle"
   Before the tap: a beach scene built from layered SVG with parallax on device tilt
   (DeviceOrientation where permitted; otherwise a slow idle drift). Sky gradient, sun, sea
   with 3 looping wave bands (SVG paths morphing between 2 shapes), wet sand. A glass bottle
   with a rolled paper inside rocks at the waterline (rotate ±6°, bob y). Text: "A message
   washed ashore for you" and "Tap the cork".
   TAP   (total about 3.6s)
   0.0s  The cork pops up and out (y -140px, rotate 540°, then falls out of frame). A "pop"
         sound via WebAudio. A spray of "bubbles" comes from the bottle neck.
   0.4s  The paper scroll slides out of the neck and unrolls vertically into a full parchment
         card (scaleY 0.05 → 1 from the top roller, with a rolling-cylinder shading gradient
         moving down). The names are written on it.
   1.6s  A big wave rolls in from the bottom: a full-width SVG wave shape rises (y 100% → -20%)
         with a foam edge (white path + "bubbles" particles along the crest), covering the scene.
   2.3s  The wave pulls back down (y → 110%), leaving the hero where the beach was
         (a wet-sand shimmer across the hero for 0.4s).
   2.4s  ParticleField "sunGlints" (small star glints, blend lighter) twinkling at the top.
   3.6s  onDone.

2. MOTION THEME
   sectionEnter "wave"   Each section's top edge is an SVG wave. As the section scrolls in,
                         the wave morphs from a tall swell to a flat line (path morph via
                         interpolated control points on scroll) while the section rises (y 40 → 0).
   heading "maskUp"      Words rise out of a mask, with a slight wobble at the end (rotate 1° → 0).
   divider "wave"        Section dividers are two overlapping wave lines that drift sideways at
                         different speeds (x from scroll, opposite directions).
   ambient "bubbles"     A few bubbles drift up slowly behind the RSVP.
   thread "rope"         Drawn as a twisted rope (repeating diagonal gradient), with a small
                         shell at the tip.
   pageBg                #1D6E7A
   GLOBAL SKY SHIFT      Tie page scroll progress to a fixed background gradient behind the
                         hero and thank-you: noon (#8FD3F4 → #FFF3D6) → golden hour
                         (#F7B267 → #F4845F) → dusk (#6D597A → #355070). The sun sinks
                         (y from progress) and grows slightly. By the Thank-you section it's sunset.

3. SECTION-SPECIFIC MOMENTS
   - Reuse decor/palm-fronds and decor/wave-line. The palm fronds sway (rotate ±3°, 6s loop)
     and move with parallax at 0.6x scroll speed at the screen edges.
   - Story: a polaroid tacked to driftwood; it swings in on a pin (rotate -12° → 0, spring).
   - Schedule: events as footprints in sand; each footprint presses in (scale 1.2 → 1,
     shadow in) along a curving path as you scroll.
   - Gallery: photos float in like postcards on water (y bob loop after entry, 4s, ±4px).
   - Countdown: digits on small driftwood tags that swing when they change.
   - Thank-you: set at dusk, with the first stars appearing ("sunGlints" ambient, reused).

4. REDUCED MOTION
   Show the unrolled scroll on the beach with the hero below. No wave, a static sunset
   gradient, no bobbing.

5. ACCEPTANCE
   The wave covering the screen must fully hide the switch from scene to hero (no flash).
   Test on iOS Safari: DeviceOrientation needs a permission tap, so skip it if it's denied or
   unavailable. Build passes.
```

---

## Prompt 6: QA and polish across all templates

```
Review all six wedding templates (royal-palace-door, traditional-gold, minimal-modern,
floral-pastel, elegant-bw, beach-boho) together.

1. Use run-namma to record the intro and a full scroll on each at 390x844 and 360x780.
   Save to /screenshots/motion/<template>/.
2. Check each against its prompt's storyboard and fix anything that's off-beat.
3. Distinctness check: no two templates share the same intro metaphor, particle preset
   or sectionEnter. Report it as a table.
4. Performance: on each, profile the intro and a fast scroll with CPU 4x slowdown in
   Chrome DevTools. Fix any long task over 50ms or sustained frame drops.
   The particle counts obey the Prompt 0 caps.
5. Reduced motion: toggle emulation and confirm every template shows its final state with a
   working "View invitation" or open button, and no hidden content.
6. The editor preview (preview=true) plays each intro inside the pane, and "Replay intro" works.
7. /ta: all intro labels are translated; run i18n-maintenance.
8. Landing page: on each template card, show a 3-second muted loop of its intro (a lightweight
   CSS/SVG loop, not video) on hover or tap, so couples can see the difference before choosing.
9. Update WHATS_BUILT.md: intros, particle presets, motion themes per template.
```

---

## Tips for getting good results

- Run one prompt per session, and review before moving on. Motion is much easier to tune one template at a time.
- If an intro feels slow, say *"compress the storyboard to X seconds, keep the beats"*.
- If something looks cheap, name the exact beat: *"the lid lift at 0.6s looks flat, add a real hinge shadow and a slight overshoot"*.
- Ask for a GIF from run-namma after each prompt so you can check it on your phone.
