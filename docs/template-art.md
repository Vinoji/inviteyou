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

| Slot | Size | Notes |
|---|---|---|
| `floor` | 1600×2400 | Page background behind the card and the envelope |
| `thoranam` | 2400×360, transparent | Strung across the top of the page |
| `ganesha` | 800×800, transparent | Sits under "உ" at the head of the card |
| `lamp` | 600×900, transparent | On each function card |

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
