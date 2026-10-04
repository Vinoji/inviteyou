# Premium 3D Templates — Features

Four top-tier wedding designs on InviteForYou, each **₹999** (was ₹1499). They are shown first in the template gallery, with a **Premium** badge and a **3D Interactive** chip.

| Template | ID | World | Events shown as |
|---|---|---|---|
| Royal Palace 3D | `royal-palace-3d` | Ottoman-style mosque-palace and a royal palace hall | Ceremony / Reception |
| Sacred Temple 3D | `sacred-temple-3d` | South Indian temple with a painted gopuram | Muhurtham / Reception |
| Grand Cathedral 3D | `grand-cathedral-3d` | Twin-spired Gothic cathedral | Holy Matrimony / Reception |
| Blossom Park 3D | `blossom-park-3d` | Cherry-blossom park with a river and waterfall | Ceremony / Reception |

All four work in **English and Tamil**, use the **existing editor and data** (no new fields), and render the same in the editor preview and on the published invitation.

---

## What every premium template has

### Cinematic opening (about 8 seconds)
- Darkness and drifting gold specks, then the building appears.
- Brass lamps light one after the other, and windows and stained glass glow.
- The doors swing open, light pours out, and the view moves through the doorway.
- "You are invited" (or the template's own line), the couple's names and the date appear, then an **Enter** button.
- **Skip intro** is available the whole time, and there's a sound on entering (only after the guest taps).
- The opening also plays live on the landing-page card.

### A 3D world behind the whole invitation
- Built with React Three Fiber. The camera **moves through the world as the guest scrolls**: entrance, hall, courtyard, and finally back out for a wide farewell view.
- Gold dust, floating petals, flickering flames and soft glows around lights.
- Textures are painted in code, so there are no image downloads. Sandstone, marble, granite, wood, stained glass and grass all carry carved detail.

### Invitation sections
1. **Entrance:** a short poetic line and the couple's names.
2. **Couple:** the first two photos as arched portraits, with names and date.
3. **Our story:** the story text split into a timeline ("Where it began → First meeting → The journey → Forever").
4. **Families:** royal portrait-style cards for both families.
5. **Events:** cards with date, time, venue, address, **View location** and Add to Calendar.
6. **Countdown:** four stone pillars for days, hours, minutes and seconds.
7. **Gallery:** framed, floating and arched portraits (one column on phones, masonry on desktop).
8. **Travel guide**, **Places to explore** and **Things to know (FAQ)**, on ivory parchment.
9. **RSVP:** the existing RSVP form, with a celebration burst when a guest accepts.
10. **Blessings wall** and **Guest photos**, using the existing components.
11. **Finale:** the names, a closing line, "Thank you for celebrating with us", Share, QR code and music.

### Performance and safety
- **Device tiers:** low, mid and high budgets set particle counts, lights, texture size and screen resolution.
- **Pausing:** the 3D only loads after the intro, and pauses in a hidden tab or when off screen.
- **Fallback:** without WebGL (or if it fails), a drawn 2D picture of the building is shown instead, so the invitation always works.
- **Reduce motion:** the guest's "Reduce motion" choice gives a still scene.
- **Phones:** checked at 375–430px wide with no sideways scrolling.

---

## Royal Palace 3D
- **Opening:** an Ottoman mosque-palace in sunset stone. Cascading lead-grey domes (a great dome on a ring of windows, half-domes, small domes), six pencil minarets with balconies and pointed caps, and a blue Iznik-tiled entrance arch.
- **3D world:** a sandstone palace front with domes and lit jharokha windows, a hall of fluted marble pillars, carved jali screens, chandeliers, an emerald-and-ivory inlaid floor with gold stars, a red carpet, a courtyard fountain with floating diyas, and the inner palace lit from within.
- **Wording:** "Two hearts. One beautiful beginning", "In the Palace Courtyard", "Until We Say Forever".

## Sacred Temple 3D
- **Opening:** a towering gopuram crowded with painted sculptures (pastel deities and pavilions on every tier), red cornices with small arches, a barrel roof with lion-face ends and gold kalasams, lit shrine niches, a mango-leaf thoranam with marigolds, and temple bells.
- **3D world:** a painted gopuram gateway, a mandapam of carved granite pillars under a painted lotus ceiling, marigold and jasmine garlands, swaying brass bells, hanging oil lamps, a kolam aisle lined with agal lamps, a gold flagstaff, lamp towers, and the glowing sanctum.
- **Wording:** "With the blessings of the Almighty", "In the Temple Mandapam", "Until the Sacred Knot", "Will You Bless Us?".
- **Sample couple:** Priya & Arjun.

## Grand Cathedral 3D
- **Opening:** a front inspired by St. Philomena's: soaring twin spires with stone knobs and small windows, three levels of stained-glass windows, pointed buttresses, a pointed gable, a rose window and a deep arched entrance, with church bells.
- **3D world:** a candlelit nave of tall columns under pointed arches, stained-glass windows down both walls, wooden pews, candle stands along an ivory aisle scattered with petals, altar steps with candles and white flowers, and a great rose window glowing above.
- **Wording:** "Together with their families", "Before the Altar", "Until the Bells Ring", "Will You Witness Our Vows?".
- **Sample couple:** Anna & Joseph.

## Blossom Park 3D (the most interactive)
- **Opening:** a twilight garden gate with stars, a rising moon, hills, a flowering lawn, a stone path, wrought-iron gates between lantern pillars, a blossom arch, cherry trees, falling petals and birdsong.
- **3D world:** a winding stone path between cherry blossom trees, a red bridge over a flowing river, a natural mossy cliff with a waterfall, foam and a lily pool, lampposts, fireflies, and birds circling overhead.
- **The couple:** a bride (flared gown, veil, flower crown, bouquet) and groom (tailored suit, shirt and tie) walk **hand in hand ahead of the camera** as the guest scrolls, with a natural walking movement.
- **Tap to interact:** tapping empty parts of the scene does something.

  | Tap on | What happens |
  |---|---|
  | A blossom tree | It shakes and showers petals |
  | The river or pool | Ripples and a splash |
  | The birds or sky | The flock scatters, then returns |
  | The couple | Hearts float up |
  | Anywhere else | A puff of petals |

- **Wording:** "Come walk with us", "By the River", "Until We Say I Do", "Will You Walk With Us?", "walking on, together, forever".

---

## For developers
- **Code:** `components/invite/palace/`.
  - `PalaceScene.tsx`: the 3D engine (camera, sky, glow, dust, petals, taps).
  - `scene/PalaceWorld.tsx`, `TempleWorld.tsx`, `CathedralWorld.tsx`, `ParkWorld.tsx`: the four worlds.
  - `scene/Couple.tsx`: the walking couple.
  - `IntroFacades.tsx`: the illustrated opening buildings.
  - `PalaceIntro.tsx`: the opening animation.
  - `PalaceSections.tsx` and `PalaceInvitation.tsx`: the invitation page.
  - `shots.ts`: camera poses per section, per world.
  - `textures.ts`, `templeTextures.ts`, `cathedralTextures.ts`, `parkTextures.ts`: the painted textures.
- **Registration:** `lib/templates.ts` (`pageLayout` `palace` / `temple3d` / `cathedral3d` / `park3d`, `price: 999`, `listPrice: 1499`, `badge: "premium"`).
- **Text:** `messages/en.json` and `messages/ta.json`, under `invite.palace` (with world overrides in `invite.palace.worlds.<world>`) and `templates.<id>`.

## Before launch
- Test a published invitation on a real mid-range Android phone.
- Remove the temporary **₹1** test price on Chapel Bells (`lib/templates.ts`).
