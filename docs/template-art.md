# Template art

Premium templates (`components/invite/premium/`) have **art slots**: painted
or photographic images that make them look real. Each slot has a drawn
fallback, so a template works before its art exists and upgrades as soon as
the file is added.

## Adding art

1. Generate the image from the prompt below (ChatGPT image, Midjourney,
   Ideogram, Firefly…). Keep the one you like best; regenerate rather than
   accept anything with extra fingers, garbled text or plastic-looking skin.
2. Export as **WebP** (quality 82–88). Slots marked *transparent* need an
   alpha channel — generate on a plain background and remove it
   (remove.bg, Photoshop, or the generator's own "transparent" option).
3. Save as `public/art/<templateId>/<slot>.webp` using the exact names below.
4. Run `npm run art` (it also runs before every `dev` and `build`).

Rules for every prompt: **no text, letters, logos or watermarks in the
image** — the invitation sets all text itself, in the guest's language.

---

## temple-gopuram — Tamil pathirikai

Photographs in use (Pexels licence: free for commercial use including sold
templates, when edited — cropped and set with text; credit appreciated):

| Slot | Photo | Photographer | Where |
|---|---|---|---|
| `gopuram` | [View of a Hindu Temple](https://www.pexels.com/photo/view-of-a-hindu-temple-14179203/) | Nirmal Dev | Behind the top of the card |
| `lamp-photo` | [A Close-Up Shot of a Brass Diya](https://www.pexels.com/photo/a-close-up-shot-of-a-brass-diya-6176512/) | Souptik Pal | Envelope opening; behind the function cards |
| `aarti` | [Ceremonial Brass Oil Lamps with Flames](https://www.pexels.com/photo/ceremonial-brass-oil-lamps-with-flames-33853980/) | Ajay Kumar | Closing section |

Optional AI slots (nothing is drawn in their place; the page is complete
without them):

| Slot | Size | Notes |
|---|---|---|
| `ganesha` | 800×800, transparent | Under "உ" at the head of the card |
| `thoranam` | 2400×360, transparent | Strung across the top of the page |
| `lamp` | 600×900, transparent | On each function card |
| `floor` | 1600×2400 | Floor under the card, below the temple photo |

**floor**
> Top-down photograph of a traditional South Indian home floor in polished
> red oxide, a fresh white rice-flour kolam drawn by hand in the centre
> (pulli kolam, dots joined by looping lines), a few scattered orange
> marigold petals and jasmine buds near the edges, soft morning daylight from
> a window on the left, subtle floor reflections, shallow texture detail,
> realistic, 50mm, no people, no text. Portrait 2:3, keep the centre calm —
> a card will be placed on top.

**thoranam**
> Photorealistic mango-leaf thoranam hanging across a doorway, fresh glossy
> green mango leaves tied on a cotton string with orange and yellow marigold
> flowers between them, front view, even soft light, isolated on a plain
> white background, very wide panoramic 20:3, no text.

**ganesha**
> Minimal line illustration of Lord Ganesha seated, drawn as a single
> continuous engraved line in gold foil, like a letterpress wedding card
> emblem, metallic gold with subtle emboss, centred, isolated on a plain
> white background, square, no text.

**lamp**
> Photorealistic South Indian brass kuthuvilakku (standing oil lamp) with
> three lit cotton wicks, warm flame glow, polished brass with soft studio
> reflections, three-quarter view, isolated on a plain white background,
> portrait 2:3, no text.

## luxe-editorial — magazine wedding issue

| Slot | Size | Notes |
|---|---|---|
| `cover` | 1600×2400 | Sample cover, shown only until the couple adds their own photo |
| `monogram` | 600×600, transparent | Optional, on the back cover |

**cover**
> Editorial fashion-magazine cover photograph of an elegant Indian couple in
> modern wedding attire (ivory sherwani, blush lehenga), standing close,
> candid and unposed, shot on medium-format film, soft natural light, muted
> warm tones, fine grain, clean plain backdrop, the top third of the frame
> left empty for a masthead, portrait 2:3, no text, no logos.

**monogram**
> A single red wax seal pressed on paper, top view, realistic wax texture
> and soft shadow, blank centre with no letters, isolated on a plain white
> background, square, no text.

---

## Cinematic photo templates (components/invite/premium/cinema)

Photographs from Pexels (licence: free for commercial use including sold
templates, when edited — cropped and set with text; credit appreciated).
Motion (slow zoom, flicker, light leaks, petals, confetti, sparks,
fireworks) is added in code.

| Template | Slot | Photo | Where |
|---|---|---|---|
| birthday-balloon-party | `cake` | [Burning Candles on Birthday Cake](https://www.pexels.com/photo/burning-candles-on-birthday-cake-15211704/) | Opening and hero |
| birthday-balloon-party | `sparkler` | [Sparkler Sparkling in the Night Sky](https://www.pexels.com/photo/sparkler-sparkling-in-the-night-sky-34416999/) | Behind the party details |
| birthday-balloon-party | `balloons` | [Colorful Balloons with Confetti](https://www.pexels.com/photo/colorful-balloons-with-confetti-796606/) | Behind the photos |
| anniversary-wine-roses | `table` | [Elegant Dinner Table with Roses and Candle](https://www.pexels.com/photo/elegant-dinner-table-with-roses-and-candle-36587801/) | Opening and hero |
| anniversary-wine-roses | `roses` | [Red Roses near Clear Wine Glasses](https://www.pexels.com/photo/red-roses-near-clear-wine-glasses-6822851/) | Behind the evening's details |
| anniversary-wine-roses | `candles` | [Moody Candlelit Dessert](https://www.pexels.com/photo/moody-candlelit-dessert-with-fruit-slice-33926170/) | Closing |
| baby-shower-balloons | `shoes-hand` | [Pexels photo 37621032](https://www.pexels.com/photo/close-up-of-baby-pink-shoes-with-bows-37621032/) | Opening and hero |
| baby-shower-balloons | `nursery` | [Pexels photo 19015553](https://www.pexels.com/photo/hand-holding-baby-shoes-19015553/) | Behind the shower details |
| baby-shower-balloons | `booties` | [Adorable Baby Booties on Nature Background](https://www.pexels.com/photo/adorable-baby-booties-on-nature-background-31769696/) | Closing |

## Editor library (lib/mediaLibrary.ts)

Ready-made photos and songs offered in the editor. Photos are stored as
1800px JPEG in `public/library/photos/` with 360px WebP thumbnails in
`public/library/thumbs/`; songs are re-encoded to 128 kbps MP3 in
`public/music/` (loudness-normalised, capped at 3 minutes, faded out).
Downloaded 2026-10-02.

### Photos — Pexels (Pexels License: free commercial use, no attribution required)

| File | Pexels photo |
|---|---|
| wedding-henna-ritual | https://www.pexels.com/photo/38259809/ |
| wedding-henna-hands | https://www.pexels.com/photo/34479816/ |
| wedding-jasmine-bride | https://www.pexels.com/photo/39616288/ |
| wedding-ring-ceremony | https://www.pexels.com/photo/18706408/ |
| engagement-rings-hands | https://www.pexels.com/photo/38274758/ |
| engagement-holding-hands | https://www.pexels.com/photo/35218299/ |
| engagement-ring-box | https://www.pexels.com/photo/30649703/ |
| engagement-candlelit | https://www.pexels.com/photo/35315663/ |
| love-red-roses | https://www.pexels.com/photo/38485139/ |
| love-hands | https://www.pexels.com/photo/15686909/ |
| love-rose-petal-rings | https://www.pexels.com/photo/25052917/ |
| love-wedding-rings | https://www.pexels.com/photo/10689262/ |
| love-ring-box | https://www.pexels.com/photo/19525067/ |
| birthday-balloons | https://www.pexels.com/photo/16651566/ |
| birthday-letters | https://www.pexels.com/photo/25956380/ |
| home-diyas | https://www.pexels.com/photo/34431714/ |
| home-diya-close | https://www.pexels.com/photo/13689170/ |
| home-new-keys | https://www.pexels.com/photo/27522902/ |
| home-diya-row | https://www.pexels.com/photo/37650548/ |
| baby-newborn-foot | https://www.pexels.com/photo/28680700/ |
| baby-yellow-shoes | https://www.pexels.com/photo/35753260/ |
| baby-feet | https://www.pexels.com/photo/29709894/ |
| baby-booties | https://www.pexels.com/photo/35119986/ |
| corporate-keynote | https://www.pexels.com/photo/34774347/ |
| corporate-office-party | https://www.pexels.com/photo/36713384/ |
| corporate-auditorium | https://www.pexels.com/photo/9275222/ |

The template photos in `public/art/` (credited above) are offered too.

### Music — Pixabay Music (Pixabay Content License: free commercial use, no attribution required; not to be redistributed as standalone files)

| File | Track | Artist | Source |
|---|---|---|---|
| nadaswaram.mp3 | Energetic Nadaswaram Solo Performance | ASTERHERE | https://pixabay.com/music/world-energetic-nadaswaram-solo-performance-447454/ |
| shehnai.mp3 | Traditional wedding ceremonial vibe with shehnai | DesiFreeMusic | https://pixabay.com/music/wedding-traditional-wedding-ceremonial-vibe-with-shehna-376293/ |
| veena.mp3 | Hameer Kalyan Veena Tabla | Saseendran | https://pixabay.com/music/india-hameer-kalyan-veena-tabla-378029/ |
| krishna-flute.mp3 | Hindu Krishna Flute | Krasnoshchok | https://pixabay.com/music/religious-theme-hindu-krishna-flute-607253/ |
| indian-wedding.mp3 | Indian Wedding | JonasBlakewood | https://pixabay.com/music/upbeat-indian-wedding-indian-wedding-music-350631/ |
| bollywood-wedding.mp3 | Grand Bollywood Wedding Anthem | sapan4 | https://pixabay.com/music/wedding-grand-bollywood-wedding-anthem-404795/ |
| diwali-festive.mp3 | Indian Diwali Hindu Background Music | SigmaMusicArt | https://pixabay.com/music/india-indian-diwali-hindu-background-music-425897/ |
| love-guitar.mp3 | Love Acoustic Romantic Hindi Guitar | echoes_of_lumen | https://pixabay.com/music/india-love-acoustic-romantic-hindi-guitar-589284/ |
| romantic-piano.mp3 | Romantic Piano | leberch | https://pixabay.com/music/modern-classical-romantic-piano-512030/ |
| happy-birthday.mp3 | Happy Birthday | Sub_Clair | https://pixabay.com/music/instrumental-happy-birthday-592177/ |
| celebration.mp3 | Celebration | NastelBom | https://pixabay.com/music/upbeat-celebration-437422/ |
| lullaby.mp3 | Music Box Sleep Lullaby | Tunetank | https://pixabay.com/music/lullabies-music-box-sleep-lullaby-349471/ |
| morning-serenity.mp3 | Nature Forest Morning Serenity | alex-morgan | https://pixabay.com/music/modern-classical-nature-forest-morning-serenity-573941/ |
| corporate-uplifting.mp3 | Corporate Uplifting | leberch | https://pixabay.com/music/corporate-corporate-uplifting-578413/ |
