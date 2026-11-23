---
name: vfrey-style-parallax-25d
description: "Use when the chosen video style is 2.5D Diorama (vfrey-style-parallax-25d), or the person asks for a 2.5D, pixel diorama, 'pixel sprites in a 3D world', tilt-shift miniature, 'like a modern pixel-art role-playing game' or lit miniature town look. Teaches how to build that look in a vfrey HTML scene for any topic with the shipped WebGL toolkit (no packages): a real 3D stage of boxes, roofs and props with pixel-art textures, flat pixel sprites only for characters, one low warm sun with soft shadow maps against cool shade, tilt-shift depth of field, bloom, haze, dust, a perspective camera with one slow move, captions on a flat card and a generated music bed."
allowed-tools: Bash Read Write
version: 2.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: 2.5D Diorama
  style-summary: Pixel-art characters in a lit 3D miniature town, with long sun shadows, a tilt-shift blur and a slow camera move.
  style-best-for: history, a day in the life, places, villages and cities, how things were made, travel, folklore, explainers set somewhere
  style-poster: parallax-25d.jpg
  style-preview: parallax-25d.mp4
---

<!-- style-bible: v2 -->

# Video style: 2.5D Diorama

**The one rule that makes this style: everything in the world is real 3D geometry, and only the characters are flat.** The ground, buildings, roofs, walls, stairs, fountains, trees, barrels, crates, carts, market stalls, bells and every other prop are meshes, lit by the sun, casting and receiving real shadows, seen through a perspective camera. ONLY people (and animals, if any) are flat 2D pixel sprites, standing in that 3D world as camera-facing billboards and casting shadows on the 3D ground. The 3D surfaces carry pixel-art textures (drawn on small canvases, nearest-neighbour filtering) so the world and the sprites match, but the volumes are real. Never build scenery or props from flat sprites or stacked 2D layers.

The look is a hand-made miniature: a pixel-art town on a table, lit by a low warm sun from one side, with long shadows in cool blue-violet, the middle band sharp and the near and far edges strongly blurred as if photographed with a tilt-shift lens, bloom on lamps and bright walls, haze, floating dust and one slow camera move per scene. Describe it as "2.5D" or "pixel diorama". Do not name or copy any game: no names, characters, sprites, maps, logos or music from existing games. Every sprite and texture is drawn by you for the video.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, engine `vfrey-render`); the vfrey skill's `scenes/craft.md` still holds for everything not said here. **Start from `starter.html` next to this file (`npx vfrey styles start parallax-25d scenes/<idea>` creates the folder with it as `index.html` and the `diorama.js` it loads, whichever agent folder this skill was installed in; without diorama.js the render stops with `scene.page-error`)**. `diorama.js` next to this file is the toolkit (plain WebGL2, no install, no network); `helpers.md` next to this file lists every call; the music script is `make-bed.py` next to this file. Four reference frames, `ref-1.jpg` to `ref-4.jpg`, live in the package copy of this style (section 11); they are not installed into projects.

<!-- vfrey-demo-text -->
**Demo text to replace.** The starter's own words are the example video's, not yours. The `vfrey-demo` comment at the top of `starter.html` lists every one: "YOUR TITLE", "ONE LINE UNDER IT", "THE FOUNTAIN". Replace each with words from your script, or remove it. vfrey reads the scene before it renders and rejects it (`frames.starter-text`) with all the leftovers named at once, so check this list first. The `vfrey-keep` comment names the style's own chrome, which may stay: "Diorama error:".

## When to use it, when not

- Use it for anything that happens in a place: a day in a village or a city, history told through streets, workshops, markets and towers, how a thing was made in its workshop, travel, folklore, a process seen as little people at work.
- Not for charts and numbers (use data-story), fast kinetic text, a real product or a face, abstract ideas with no place, or deep space (use real-3d).
- **It needs a graphics chip.** It draws with WebGL2 in vfrey's headless Chrome; proven on an Apple Silicon Mac, where a 33 s film renders in about 40 s. On a machine or server without a GPU, Chrome draws in software and a render is many times slower or fails. Never send it to a cloud render.

## Plan before coding

1. Write 5 to 8 spoken lines, a hook in line 0, a payoff in the last line. Pace the script as `voice.md` in the vfrey skill says (`lineGap`; sample with `npx vfrey voice sample <voice> --script <file> --no-browser` and size the script by the words a second that sample prints for your voice).
2. One place per one or two lines: 3 or 4 places in a 30 to 40 s film, each its own `world` with its own light (a square in the morning, a workshop inside, a tower at dusk). Decide what the camera lands on in each.
3. Write the beat list: for every line, the two or three words where the hero picture changes (a stall opens, a lamp lights, loaves appear, a bell swings). Cue every beat from a word with `cue(line, /^word/)`, never from fixed seconds.

The three rules every vfrey style follows (a film that breaks them reads as dead air; `frames.still` fails an 8-second hold and `frames.numbers` a number the script does not say):
1. **Change the hero picture on every script line, and finish the change before that line ends.** No hold past 3 seconds; a long line gets a second or third beat. One line, one change at least.
2. **The only numeral on a frame is the one that line says.** A tag with a figure ("6 YEARS") shows only while its line says it ("six years"), and no counter runs through other values.
3. **Frame 0 already shows a whole title and the lit place.** Nothing is still entering at the start.

Keep scene graphics out of the bottom-right corner: the burned-in `AI-GENERATED` label owns it (about 322 x 58 px, right margin 72, bottom margin 56).

## 1. The look in three sentences, and the signature traits

A miniature world of real 3D volumes wrapped in pixel-art textures, with hand-pixelled flat characters walking through it. One low warm sun casts long soft shadows that read cool blue-violet; lamps, windows and bright walls bloom; haze and dust hang in the light. A tilt-shift blur keeps only the middle band sharp, and a perspective camera at a raised three-quarter view makes one slow move per scene.

Signature traits (each checkable on one frame):
1. Real geometry: every building, roof, wall, tree, prop and piece of ground is a mesh with depth, seen in perspective (far things smaller, vanishing lines).
2. Characters, and only characters, are flat pixel sprites with crisp square pixels and a 1 px dark outline.
3. Pixel-art textures on every surface, about 16 texels a metre, hard edges, a small palette per surface.
4. One low warm sun (elevation 8 to 30 degrees) from one side; long shadows; the shadow side cool blue-violet, never grey or black.
5. Soft-edged shadows from the shadow map, under and behind everything, characters included; a dark contact blob under anything that stands, and darker corners where walls meet the ground.
6. Tilt-shift: the middle band sharp, the foreground and background strongly blurred; a blurred foreground object (a wall top, a tree, a roof edge, a barrel) partly framing the shot.
7. Bloom on lamps, glowing windows, fire and sunlit pale walls; light shafts or haze in the sunlight; floating dust or pollen catching the light.
8. A warm grade and a vignette.
9. One slow camera move per scene (a crane, a dolly or an orbit of a few degrees), eased in and out, never static, never shaking.
10. The picture fills the frame to the bottom edge; captions sit on a plate, a flat cream card in the caption band.

## 2. Palette

Pick per video from the topic: warm lit colours for the walls and ground, one strong roof colour, a few saturated accents for clothes and goods, and a cool blue-violet for the ambient light. Example (the Italian village in the reference frames):

| Role | Example | Use |
| --- | --- | --- |
| sunlit walls | `#e3b47c`, `#dc9a7c`, `#ead2a8` | stucco, plaster, sandstone (three tones per texture: base, darker, crack) |
| roofs | `#b8583a` / `#8e3f2c` / `#5e2a24` | tiles: lit row, gap, shadow |
| ground | `#a88c70` to `#b89c7c`, joint `#5e4a44` | cobbles, dirt, planks |
| foliage | `#4a6230`, `#5f7a3a`, `#7c9446` | tree crowns, cypresses |
| sun | `#ffc68c` (morning), `#ff9a6a` (dusk) | `world({ sun: { color } })` |
| ambient | sky `#6a78e0`, ground `#5a4870` | the cool shade; never grey |
| accent | `#c8743a` | the spoken word on the caption card, tag edges, awnings |
| card / ink | `#f6ecd8` / `#2b2028` | caption card, title card, text |

Rules: the shade is coloured by the cool ambient, the light by the warm sun; split toning in the grade pushes shadows toward blue and highlights toward orange (`grade.cool`, `grade.warm`). No pure black, no pure white surfaces. Dusk: a red low sun, a violet sky, warm window light.

## 3. Shapes and line

- Build the stage in metres from the toolkit's real volumes (`helpers.md`): `ground`, `box`, `gable` and `hip` roofs, `house` (a box, a roof, windows with shutters and sills, a door), `cyl` (basins, wells, barrels, ovens, columns), `cone`, `ball` (faceted crowns, domes, bells, loaves), `tree` and `cypress` (3D trunk and crowns), `stairs`, `awning`, `face` (any flat panel on a wall: a fresco, a sign, a painting). Never a sprite for scenery.
- Textures: draw every surface on a small canvas with `Diorama.pix` or the stock `TEX` set (cobbles, dirt, grass, plaster, timber, stone, tiles, planks, water, flat), from the palette. `D.mat(canvas, { density: 16 })` keeps 16 texels a metre; nearest-neighbour filtering makes each texel a crisp square.
- Detail on walls is geometry standing proud of the wall: windows, shutters, sills, doors, beams, a balcony, so they catch light and cast small shadows.
- Moving parts are nodes: `w.node(build)` gives geometry its own position, rotation and scale every frame (a swinging bell, awnings that open, loaves that appear, a growing patch of plaster). `{ castOnly: true }` makes a roof that shades a cut-away room without hiding it from the camera.

## 4. Characters and objects

- Characters are 16 x 26 px pixel sprites (`Diorama.person(look, pose)`: walk and carry 4 frames, work and stand 2 frames; or your own strings with `Diorama.sprite` and `strip`), shown with `w.sprite(img, { height })`. Height about 2.4 to 2.8 m (a little larger than life) so the pixel grid stays readable at the camera distance: on screen one sprite pixel should be 4 px or more.
- Sprite textures never get mipmaps and use nearest filtering: their pixels stay crisp. They face the camera, flip when walking left, step 7 to 8 frames a second while moving and stand still otherwise, and their shadow is drawn from the sun's side so it has the full figure's shape.
- Give a character a job: a vendor beside a stall, a baker at the oven, an apprentice grinding, a painter on a scaffold, people crossing the square. Three to six per place; one walks while the line is spoken.
- Objects the line names are big and in the sharp band: a fountain, an oven with a glowing mouth, a fresco, a bell.

## 5. Typography

| Role | Font | Size (px at 1080 wide) | Colour |
| --- | --- | --- | --- |
| title card | Google Sans Flex 680 | about 90, two lines, plus a JetBrains Mono line under it | ink `#2b2028` on `#f6ecd8` |
| tag beside a thing | JetBrains Mono 700 | about 39, uppercase | `#ffe2b0` on `#2b2028`, a hard accent shadow |
| captions | vfrey `box` captions | vfrey's size | ink on a cream card, the spoken word on the accent |

Cards are flat, square-cornered, with a hard offset edge (`box-shadow: 6px 6px 0`). The title card sits in the upper band at frame 0. Tags follow a 3D point with `D.project([x, y, z])`, one at a time, in the upper half, never over the caption band. Caption card: `top: var(--vf-caption-at)`, `height: var(--vf-caption-h)`, side insets `var(--vf-safe-left)` and `var(--vf-safe-right)`, max 4 words.

## 6. Composition

- The frame is 9:16, so stack the place in depth: background buildings and a tower in the top third, the hero object and characters in the middle band (y 30% to 62%), open ground under the caption band to the bottom edge, and a blurred foreground object at one bottom corner or edge.
- Camera: a perspective camera, field of view 32 to 38 degrees (slightly long, so the miniature reads without fisheye), pitch 22 to 40 degrees down, distance 20 to 40 m. A narrower field of view keeps verticals straight; a wider one bends them.
- Light: the sun from one side and a little in front so the faces the camera sees are lit and the shadows fall long across the open ground. A room is a cut-away box: no front wall, a `castOnly` roof, a window so a shaft of sun comes in.
- Depth of field: focus on the camera target; the default band (`sharp` 7% and `ramp` 22% of the distance) blurs the near wall and the far rooftops. Put something real in the near blur every scene.
- Keep the bottom-right corner (x over 720, y over 1740) plain ground: no character, tag or prop the eye goes to.

## 7. Motion

- Feel: calm, a little playful. The camera is the main performer; characters and nodes are the secondary layer; dust, water and flicker are the ambient layer.
- One camera move per scene with `D.move(a, b, t0, t1, t)` (ease in and out): a crane (pitch and height change), a dolly (distance 15 to 25% shorter), or an orbit of 10 to 20 degrees of yaw. Never static, never shaking, never two moves in one scene.
- Beats on words: `pop` (an ease-out-back scale from 0 to 1, about 0.45 s) for awnings, loaves and heaps; `ease` for a patch that grows or a door that opens; a light that comes up over 0.5 s; a bell swinging with `rot`. One beat at a time; each done in under a second.
- Walks are linear in position (the walk cycle is the motion) and finish at a mark; idle characters breathe at 2 frames a second.
- Everything is a pure function of `t` in `vfrey.onFrame`: no clock, no state from the last frame, seeded random only.

## 8. Transitions

A focus pull between places: the whole picture blurs out over about 0.35 s, the place changes at the peak, and the next one comes back into focus (`D.render(world, cam, t, { blurAll, dim })`), about 0.3 s before the next line starts. The camera moves through the cut. Forbidden: fades to black, wipes, spins, a cut with no blur.

## 9. Sound

Bed: a gentle little-town theme at 92 bpm, a plucked lute arpeggio over a soft pad and a low drone, chords D, G, A, D and Bm, G, A, D, with a recorder-like tune in the second half of each phrase. Accents: a whoosh at each focus pull, a chime when something is made or revealed, a church bell for a tower or a call to work, a thud or rumble rarely. Mix: `volume: -17`, `duck: true`.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with the accents (format at the top of `make-bed.py`), then from the project folder: `python3 "$(npx vfrey styles path parallax-25d)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey 2.5D pixel diorama style)", "volume": -17, "duck": true}` and make it again with `--rerender`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents. No `python3` on the machine: leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (30 to 40 s)

| Time | Beat | Place and move | Content |
| --- | --- | --- | --- |
| 0 to 9 s | hook, then the place | the square, crane down and around | title card at frame 0; people crossing; stalls open on their word |
| 9 to 16 s | the first thing made | a workshop or oven, dolly in | a character carries something in; a glow flares; the product appears |
| 16 to 28 s | the craft | a cut-away room, orbit | tags for the spoken figure; a surface is laid and painted on its words |
| 28 to 35 s | payoff | a tower or a view at dusk, crane up | a bell swings, windows light one by one, lanterns walk home |

## 11. Reference frames

Saved in this style's package folder, not installed into projects (the recipe in your project is `starter.html`), taken from the Showcase short "A day in a Renaissance village": look at them before building.
- `ref-1.jpg` frame 0: the market square with the title card, stucco houses with tiled roofs and shuttered windows, the fountain, long cool shadows across warm cobbles, a blurred tree in the foreground.
- `ref-2.jpg` the village oven: a brick dome on a stone base with a glowing mouth that blooms, a woman carrying dough, the baker, a tag beside the oven, the near wall and barrel blurred.
- `ref-3.jpg` a painter's workshop as a cut-away room: the fresco wall, a fresh patch of plaster, the painter on the scaffold, the apprentice at the grinding table, a shaft of sun through the side window.
- `ref-4.jpg` the bell tower at dusk: a violet sky, the bell swinging in the belfry, warm windows lit below.

## 12. Reference implementation

`starter.html` (with `diorama.js` beside it): one complete scene that renders out of the box and passes every vfrey check. A village square: cobbles, four houses with windows and doors, a fountain with moving water, two market stalls whose awnings open on a word, crates, barrels, a tree and a cypress; two people walking and a vendor standing, all casting shadows; a low warm sun, cool shade, a lamp that lights on a line, dust, tilt-shift blur with a wall and a tree in the foreground, bloom, a grade and a vignette; a title card at frame 0, a tag beside the fountain, a caption card, and one slow crane down and around over 8 seconds. Replace `INPUTS`, the palette, the stage and the beats; keep the plumbing (`create`, `world`, `onFrame`, the error box). Check a still with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 4 out.png`. If a still shows a green box of text, that is the scene's own error message: fix the line it names.

## 13. Do, don't and the final checklist

Do:
1. Build every building, prop, tree and piece of ground as real geometry.
2. Make only characters flat sprites, with crisp pixels and an outline, large enough that the pixel grid reads.
3. Use a perspective camera with a field of view of 32 to 38 degrees, raised three-quarter view.
4. Light each place with one low warm sun and a cool ambient; let shadows be long and coloured.
5. Put a blurred real object in the foreground of every place.
6. Move the camera once per place, slowly, eased in and out.
7. Change the hero picture on every line, from a spoken word.
8. Keep the bottom-right corner plain and the picture running to the bottom edge.

Don't (what not to do):
1. Flat layers with a drop shadow, or scenery made of sprites or stacked 2D cut-outs.
2. An orthographic (parallel) camera: everything stays the same size at every distance and the world reads flat and isometric. Always perspective.
3. A static camera, or a shaking one.
4. Blurry upscaled pixels: no smoothing, no mipmaps on sprites, no low-resolution render stretched up.
5. Plastic default 3D lighting: a grey ambient, a high noon sun, no colour in the shade.
6. No shadows, or shadows only under some things.
7. Names, characters, maps, sprites, logos or music from existing games, or a trademarked name for this kind of look: call it 2.5D or pixel diorama.
8. `Date.now`, `requestAnimationFrame`, an unseeded random or state carried between frames.

Final checklist on the contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`, and one frame a second for the 3-second rule):
- [ ] Every building, prop and tree is a lit volume; only people are flat.
- [ ] Long sun shadows on the ground and walls, characters included; the shade is blue-violet.
- [ ] Middle band sharp, foreground and background blurred; a blurred near object in every place.
- [ ] Bloom on lamps and windows; haze and dust in the light; warm grade and vignette.
- [ ] One slow camera move per place, never still; focus pulls between places.
- [ ] The picture changes on every line and at least every 3 s; frame 0 shows the title and the place.
- [ ] Numerals only while their line says them; nothing under the AI label; captions on the card in the band.

## Pitfalls

- The canvas is drawn by WebGL, so vfrey's picture checks run on the finished file: look at the contact sheet for a frozen picture or a green error box.
- A field of view over 45 degrees bends the houses; under 28 the miniature flattens.
- A camera that sits above an interior's ceiling films the ceiling: use a `castOnly` roof for a cut-away room.
- Too much haze (`fog`, `shafts`) washes the whole frame to beige; keep `fog` near 0.01 and `shafts` near 0.05 outdoors.
- A sunlit pale wall at `power` 3 or more clips to white: lower the sun or darken the wall.
- A tag anchored on a point that moves behind a character covers its face: anchor tags above the thing, in the upper half.
- Kokoro adds about a second at line breaks: fewer, longer lines; a scene re-made with the same title and hook needs `--rerender`.
