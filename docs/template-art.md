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
