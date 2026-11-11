---
name: vfrey-style-blueprint
description: "Use when the chosen video style is Blueprint (vfrey-style-blueprint), or the person asks for a blueprint, technical drawing, engineering drawing, drafting sheet or 'how it's built' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: a white-on-blue drafted sheet drawn line by line, a viewBox camera, colour-coded force arrows, a title block, drafting tools as transitions, a note strip at vfrey's caption band and a generated drafting sound bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Blueprint
  style-summary: A drafted engineering sheet on blueprint blue, drawn line by line, with colour-coded arrows showing how it works.
  style-best-for: engineering, how it's built, science, physics, architecture, mechanics
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.
<!-- style-bible: v2 -->

# Video style: Blueprint

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, one SVG sheet plus HTML strips, GSAP, engine `vfrey-render`); the script, voice and facts are yours; the vfrey skill's `scenes/craft.md` still holds. Start from `starter.html` next to this file (a wall bracket drawn on a sheet with a viewBox camera, flowing force arrows, legend, title block, caption strip and a T-square transition; replace the drawing, the labels and the keys, keep the structure); more code (fold creases, registration marks, exploded view, set square, compass) is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file. Use it for engineering, how it is built, science, physics, architecture, mechanics and explainers on any subject.

Script pace: do not trust a word budget. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser`; Kokoro af_heart with lineGap 0.3 speaks about 3 words a second.

## 1. The look in three sentences, and the signature traits

A blueprint sheet: white and pale-cyan linework on deep blue with a fine grid, fold creases, a frame with zone letters and a title block, drawn construction lines first and outlines second. One big sheet is the whole world; a camera pans and zooms across it while one fixed colour per force or quantity animates over the drawing. Drafting tools (T-square, set square, compass) sweep through as transitions, and the caption sits in a framed note strip.

Signature traits:
1. Sheet blue `#0b3380` with a radial centre `#1a58c4`, never flat.
2. A fine 20 px grid plus a 100 px major grid and fold-crease line pairs.
3. Linework `#f2fbff`, construction and dimension lines `#8fdcff` / `#bdeeff`.
4. Hatching (45 degree lines) for cut or solid parts; no solid fills.
5. Draw-on: lines draw themselves (construction first, outlines second, hatch fades in after).
6. A frame with zone letters (A to F, 1 to 4) and registration marks.
7. Dimension lines with extension lines and arrow ticks; a DETAIL bubble with a dashed circle.
8. Flowing dashed force arrows, one colour per quantity, with a lit legend.
9. Everything in JetBrains Mono, UPPERCASE, tracked, with a blue halo behind labels.
10. A framed NOTE strip for captions and a title block with revision and force-key cells.
11. Strokes and text keep a constant screen size at any zoom (`--k`).
12. Frame 0 already shows the sheet, border, zone letters, title and construction marks.

## 2. Palette

| Role | Hex |
|---|---|
| Sheet / gradient | `#0b3380`; `#1a58c4 -> #1245a6 -> #0a2f78` |
| Linework | `#f2fbff` |
| Construction, centre lines | `#8fdcff` (60% opacity) |
| Dimensions | `#bdeeff` |
| Halo behind text | `#0f3d96` |
| Strip / title block | `#082866 -> #071f55`; `#0a2c72` |
| Quantity colours (pick 3 to 4, fixed all film) | `#ffd84a` tension, `#ff6fae` compression, `#6dffb0` weight/flow, `#ff9a45` anchor/heat |

Ratios: the sheet blue is at least 70% of the viewport; quantity colours at most 6% together; white linework only where something is drawn. Never use: black, grey, a colour that is not in the table, filled colour areas (hatch only), gradients on linework, a second typeface.

## 3. Shapes and line

Stroke widths in screen px at 1080 wide (multiply by `--k` so they stay constant): outline 3.4, secondary 2, construction 1.4, dimension 1.8, hatch 2.2 on a 14 px pitch at 45 degrees, force arrows 4.5 dashed 20/13, centre line dash 26/6/5/6, halo 6. Corners: `stroke-linejoin: round`, round caps on outlines, butt caps on dashed arrows; the sheet frame and cells are square. Edge treatment: crisp vector lines; texture only the grid (patterns) and fold creases (a dark line `#04184a` at 35% and a pale line beside it). Light direction: none (flat drafting) except a faint lighter patch in the radial centre.
- Draw-on: every path has `pathLength="1"`, CSS `stroke-dasharray:1 1; stroke-dashoffset:1`, tween `strokeDashoffset` to 0 (`power1.inOut`, 0.7 to 1.2 s).
- Flowing arrows: `stroke-dashoffset: calc(var(--k) * var(--ph) * -1px)` with one global linear phase `--ph` from one tween: dashes move forward at constant screen speed at any zoom.
- Hatch fill fades in AFTER the outline (`fillOpacity` set to 0 at start).
- Dimension: extension lines, a line with `marker-start` and `marker-end` ticks, text centred above.
- Section view: a cut line B-B and a hatched section beside it with `fill-rule: evenodd`.

## 4. Characters and objects

There are no characters; people, if needed, are schematic stick figures (circle head 1:7, straight limbs, 3.4 px outline). A part is drawn as: construction lines (axes, centre lines, a tangent or chord), then the outline, then hatching, then labels with leader lines. Stock objects (the starter has 1 to 6; `helpers.md` has more):
1. Wall or ground block: outline plus 45 degree hatch.
2. Beam or arm: two parallel lines, 80 world units apart.
3. Brace or cable: one line plus a dotted ghost.
4. Weight: leader rod plus a hatched box.
5. Force arrow: dashed coloured line with a marker head.
6. Dimension line: ticks plus value.
7. DETAIL bubble: dashed circle, leader, lettered circle.
8. Gear: pitch circle (dash-dot) plus teeth path.
9. Cuboid wireframe turning: a proxy angle tween rewriting the path `d`.
10. Pencil scribble: seeded zigzag drawn with the same draw-on.

## 5. Typography

JetBrains Mono (bundled), UPPERCASE, `letter-spacing .05em`; no other font. Sizes in screen px at 1080 wide (times `--k` in the sheet), labels get a halo `paint-order: stroke; stroke: #0f3d96`.

| Role | px | colour |
|---|---|---|
| Sheet title | 64 | `#f2fbff` |
| Sheet subtitle | 26 | `#8fdcff` |
| Label | 31 | `#f2fbff` |
| Small label / zone letter | 23 | `#8fdcff` |
| Big number | 84 | quantity colour or white |
| Title block title / sub | 38 / 25 | white / `#bdeeff` |
| Caption | 58 | `#f2fbff`, highlighted word `#ffd84a` |

Caption strip (vfrey's caption band, `--vf-caption-at`, is overridden here): top 1336, height 272, dark plate `#082866`, double frame (3 px white and 1 px `#8fdcff`), tab "NOTE" top left and a counter bottom right; `vfrey.captions("#captions", { style: "color", font: '"JetBrains Mono"', size: 58, color: "#f2fbff", highlight: "#ffd84a", maxWords: 3 })`, uppercase, same place all film, never any art under it.

## 6. Composition

- Frame: 0 to 1336 px the sheet viewport (SVG 1080 x 1336); 1336 to 1608 the caption strip; 1608 to 1920 the title block (title, revisions, force key, sheet no., units) on a 20 px grid. Keep the lower-right 340 x 80 clear for the AI label.
- Grid: the part sits on the centre-left, labels beside it on the right; dimension lines above, forces below; the sheet title in the top-left of the wide shot.
- Subject scale: the part is large, filling 60 to 85% of the viewport width at a station, and the sheet grid runs to the bottom edge of the viewport; the wide establishing shot shows the whole sheet with the frame.
- Layers: grid and creases (back), construction, outlines and hatch, forces, labels, tools (front), strip and title block (fixed).
- Depth cues: none; scale and line weight are constant.

Shot types (camera = viewBox station):
```
A Wide sheet            B Joint close-up        C Load path          D Detail / section     E Exploded view
[ TITLE           ]     [ DETAIL (o)       ]     [ part, arrows  ]    [ section B-B   ]     [ ghost lifts   ]
[  frame, zones   ]     [ ==beam==         ]     [ ->  ->  ->    ]    [ hatched block ]     [ dashed proj.  ]
[  part (small)   ]     [ //brace          ]     [ labels        ]    [ dims          ]     [ cuboid turning]
[ NOTE strip ]          [ NOTE strip ]           [ NOTE strip ]       [ NOTE strip ]        [ NOTE strip ]
[ title block ]         [ title block ]          [ title block ]      [ title block ]       [ title block ]
```
F Stamp: a rotated double-bordered word over the finished wide sheet.

## 7. Motion

Smooth; the feel is a camera on a drawing table.
- Camera by `viewBox` from a proxy `{x, y, w}` (`h = w * 1336 / 1080`); `onUpdate` sets the viewBox and `--k = w / 1080`. Stations: `[time, {x,y,w}]`; moves `power3.inOut`, about 1.2 s; holds are slow `sine.inOut` drifts of 3% in `w` (never static). One idea per station; a wide establishing shot first and last. Zoom between w 1000 and 2100.
- Draw-on 0.7 to 1.2 s `power1.inOut`; construction lines before outlines by 0.4 s; labels fade in 0.4 s after their line; legend row fades from .3 to 1 in 0.4 s at first use; arrows fade in 0.4 s then flow.
- Pulses: yoyo opacity on a quantity on the word that names it.
- Everything is a function of timeline time; cue from `vfrey.timing.words` with a regex helper (`W(/tension/i, line)`), never hard-coded seconds for words.
- Forbidden: bounce, elastic easing, rotation of the sheet, 3D camera moves, glow, blur.

## 8. Transitions

Drafting tools placed in the gap or over a camera move; cut the camera underneath while the tool covers the screen.
1. T-square: a bar with ruler ticks and a head block sliding top to bottom (`y: -160 to 1480`, 1.1 s, `power2.inOut`).
2. Set square: a right triangle with an inner cut-out sliding diagonally (1.1 s).
3. Compass: a leg rotating about a fixed needle point, drawing an arc and a pale sector (proxy angle, 1.2 s).
Forbidden: fades, wipes, zoom blurs, any non-drafting transition.

## 9. Sound

A slow technical bed: a three-voice pad over A, F, C, G, a soft sine pluck pulse at 84 BPM, minor and calm. Accents cued from `cues.json`: `scratch` (pencil on paper, one per label), `slide` (a ruler or tool moving, one per tool transition), `tick` (lines drawing), `thump` (the closing stamp), `tone` (a value landing). Mix `"volume": -14`, `"duck": true`; if `audio.voice-clear` warns, lower `volume`.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` needs only `python3` (standard library) and always writes the same file for the same input.
1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (a list; each cue names a sound and a word, line, sentence or time, as the top of `make-bed.py` explains), then from the project folder: `python3 .agents/skills/vfrey-style-blueprint/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey blueprint style)", "volume": -14, "duck": true}` and make it again with `--rerender`.
One pass instead: `--duration 60` with no `--timing`. No `python3` (`python3 --version` fails): leave `music` out, say the video has no music and why, install nothing unasked.

## 10. Shot plan template (32 to 40 s)

| Time | Beat | Shot |
|---|---|---|
| 0 to 4 s | Hook: the sheet is drawn, the title and the question | A wide sheet, frame and construction lines draw |
| 4 to 12 s | The part: outline, hatch, labels | B joint close-up |
| 12 to 22 s | The forces: arrows flow, legend lights up one by one | C load path (two or three stations) |
| 22 to 30 s | A detail, a section or an exploded view | D detail or E exploded view; T-square between |
| 30 to 38 s | Payoff: the result as a number or a stamp, wide again | A wide sheet with the stamp |

## 11. Reference frames

- `ref-1.jpg`: the opening wide sheet. Copy the big sheet title, the grid, construction marks and the framed note strip with the title block.
- `ref-2.jpg`: the hangers close-up. Copy the cable and dashed force arrows in their colours, the DETAIL bubble and the hatched deck.
- `ref-3.jpg`: the exploded view. Copy the section B-B grid, the wireframe cuboid with dashed projection lines and the pink arrows.
- `ref-4.jpg`: the final wide sheet with the stamp. Copy the stamp, dimension line, legend fully lit and the section bubble.

## 12. Reference implementation

`starter.html` next to this file renders about 11 s: the sheet (grid, creases, frame, zone letters, sheet title), a hatched wall, beam, brace and weight that draw on, a dimension, a DETAIL bubble, three force arrows that flow and light the legend, a viewBox camera with five stations, a T-square transition, the caption strip and the title block. Copy it to `scenes/<idea>/index.html`, replace the drawing (world coordinates), the labels, the legend and the stations, and test with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`. A label placed for one station can land off-screen at another: write each label's world position from that station's viewBox.

## 13. Do, don't, and the final checklist

Do:
1. Draw construction lines first and outlines second.
2. Size every stroke and text with `--k`.
3. Fix one colour per quantity for the whole film and light its legend row at first use.
4. Fade hatching in only after the outline is drawn.
5. Keep the camera moving (slow drift between stations).
6. Give frame 0 real content (sheet, border, zones, title, construction marks).
7. Keep art out of the caption strip and the AI label corner.
8. Label dimensions only with sourced values; mark counts SCHEMATIC and say VERTICAL EXAGGERATED when you exaggerate.
9. Use real drafting transitions only.
10. Cue words from `vfrey.timing.words`.
11. Captions sit on a plate: the framed dark NOTE strip, same place all film.

Don't:
1. Fill shapes with colour (hatch only).
2. Use a font other than JetBrains Mono, or lowercase.
3. Use bounce, elastic, glow or blur.
4. Let hatch show before its outline.
5. Put a colour for two different quantities.
6. Leave the camera static or the sheet without a frame.
7. Place art under the strip.
8. Invent figures and present them as measurements.
9. Use `tl.call`.
10. Zoom so far that the sheet edge shows blank margin.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- Blue sheet with a visible grid and a lighter centre in every tile.
- White and pale-cyan linework only; hatch for solids.
- Frame 0 shows border, zone letters and title.
- Force colours match the legend and never change meaning.
- Strokes the same screen weight in wide and close shots.
- Labels uppercase mono with a halo; readable at phone size.
- The NOTE strip and title block unchanged in place; caption words white with a yellow highlight.
- A drafting tool in each transition frame, no other transition.
- Nothing under the strip; AI label corner clear.
- Numbers shown on screen match what the voice says (read each number on the contact sheet against the script).
