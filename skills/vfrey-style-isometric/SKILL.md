---
name: vfrey-style-isometric
description: "Use when the chosen video style is Isometric miniature world (vfrey-style-isometric), or the person asks for an isometric, 2.5D, diorama, tiny model world, 'little 3D map' or 'follow it along the route' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: one projection for SVG blocks, soft shadows, a glowing marker travelling a route, a camera gliding between dioramas, full-frame layout around the caption band and a generated music bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Isometric miniature world
  style-summary: A tiny model world seen from above, with a glowing dot that travels through it as the voice explains.
  style-best-for: how it works, explainer, technology, science, logistics
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Isometric miniature world

A tiny pastel diorama built from cubes, pyramids and slabs on a night-navy ground, seen from a fixed isometric angle, with one glowing amber marker travelling a lit route from model to model while a camera glides, pulls out and dives in. Light comes from the upper left, shadows are soft and filter-free, every tile shows its earth in cross-section. If a frame has perspective, a flat 2D object, a second saturated colour or a hard black shadow, it is not this style.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. **Start from `starter.html` next to this file** (copy it to `scenes/<idea>/index.html`, then replace the PLACEHOLDER objects, labels and cue words: it already renders a three-tile route with `vfrey render --frame`). Code to copy is also in `helpers.md` next to this file; the music script is `make-bed.py` next to this file. Four reference frames, `ref-1.jpg` to `ref-4.jpg`, live in the package copy of this style (section 11); they are not installed into projects.

## When to use it, when not

- Use it for anything that travels or passes through stages: how a message, a parcel, water, money, power or a request gets from A to B; how a system's parts connect; a process with 4 to 6 stations.
- Not for stories about people and feelings (figures this small cannot act), not for a single object with no journey, not for charts and numbers (use 2D flat), and not when the person wants real 3D with perspective and lighting: this is drawn SVG, the camera only pans and zooms.

## Plan before coding

1. Write the script as 4 to 6 lines of one or two sentences. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; key the picture to sentences, not lines. Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 3 words a second.
2. Pick 4 to 6 dioramas along one route, in a row along +x on a shared tile depth, with one hero object each. Add one "macro" shot at another scale (a cut-away, a close-up, a size comparison) reached through an iris.
3. The marker (a glowing dot) carries the idea. One sentence is one diorama: one camera move and one marker leg.
4. Open on the hook: the hero object close up with the starting action, a spark races the whole route while the camera pulls out to the wide shot, then the camera dives back to the first diorama.
5. A scale claim ("as thick as a garden hose") needs a picture of it (both things side by side, guide lines, a chip), and only numbers you can cite go on screen.

## 1. The look in three sentences, and the signature traits

A night-navy stage with faint stars; pastel blocky models on earth-sectioned slabs; one amber marker leaving a lit trail. Faces of every block are shaded by one rule (top light, left mid, right dark) with a white rim on the top edge. The camera is the performer: wide, close, dive, iris.

Signature traits (each checkable on one frame):
1. One fixed isometric projection (`x` runs right-down, `y` left-down, `z` up, 30 degrees); no perspective, no vanishing point.
2. Night-navy radial ground with about 80 faint stars and a vignette; never a flat or linear-gradient ground.
3. Every model is made of boxes, pyramids and roofs with three visible faces at x1.16 (top), x0.84 (left) and x0.62 (right) of one base colour.
4. Each side face has a top-to-bottom white-to-black overlay; each top edge has a 28% white rim; each polygon has a 0.7 px same-colour stroke.
5. Slabs show an earth cross-section (`#9a7a53` to `#4a382a` with pebbles) on both visible sides, and a 10% white grid on the top.
6. Shadows are soft hull shapes to the lower right, drawn without blur.
7. Exactly one saturated accent, amber `#ffbf3c`, and one support, teal `#7ff3e4`.
8. A glowing marker with a pool of light under it travels a route: dim conduit under, lit amber trail over, revealed by dash offset.
9. A stage label (square step dots plus spaced mono text) sits under the safe top; chips are solid amber or teal rectangles with mono text.
10. Water, glass and light are layered translucent shapes with drifting rays, not blur.
11. A dark top fade and a dark bottom scrim let captions read while the world runs underneath.
12. Square corners on every HUD part.

## 2. Palette

| Role | Hex | Use | Ratio of frame |
| --- | --- | --- | --- |
| ground | `#22346b`, `#121c3d`, `#090e1e` (radial, centre to edge) | stage | 40 to 70% |
| tile top | `#79ab8e` | grass slab | 5 to 20% |
| earth | `#9a7a53` to `#4a382a` | slab sides | 3 to 10% |
| cream | `#efe6d2` | houses, walls | up to 8% |
| roof | `#c8553d` (terracotta) or `#2d8b94` (teal) | roofs | up to 4% |
| machinery | `#222b44`, `#2b3550` | racks, towers, cable | up to 15% |
| water | `#46c5d6` to `#0b2d55` | sea, section | up to 30% in a water act |
| accent | `#ffbf3c` | marker, trail, chips, highlight word | at most 4% |
| support | `#7ff3e4` | waves, light, second chip | at most 3% |
| text | `#ffffff` captions, `#cfd6ee` labels, `#0a0f20` on chips | | |

Swap hues for the brand (`brand.json` wins), keep one accent and one support. Never use a third saturated colour, pure black for a face, a linear full-screen gradient (it bands), or a teal glow above 30% alpha behind a screen (it washes it out).

## 3. Shapes and line

- Projection: `P(x, y, z) = [(x - y) * 0.866025, (x + y) * 0.5 - z]`. Everything is built from `box`, `pyramid`, `roof` and flat art on a face with `LF` (the +y face) or `RF` (the +x face, mirrored: no text there).
- Edges: 0 px stroke on faces except the 0.7 px same-colour stroke that hides seams; rim line 0.9 px white at 28%; tile top edge 1.2 px white at 35%; there are no black outlines.
- Corners: sharp. A roof overhangs the wall by 3 units. A tree is a trunk box (6 x 6) plus two stacked pyramids.
- Light and shadow: light from the upper left; shadow polygon = convex hull of the footprint and the footprint shifted by `(0.9h, -0.2h)`, drawn twice with strokes of 16 px (5% black) and 7 px (10% black) over fills of 10% and 18% black. No `filter`, no blur.
- Texture recipes: slab earth is a vertical gradient with `wd / 14` seeded white ellipses at 6 to 16% (rx 1.5 to 4, ry 1 to 2.6); water is two layered translucent rects with slow light-ray polygons; kelp and fish live inside a section clip.
- Cylinders are circles stacked every 3 units along an axis, each in the (y, z) plane matrix; a ground circle of radius r is an ellipse `rx 1.2247r, ry 0.7071r`.

## 4. Characters and objects

This style has no characters; the world is the actor. Objects are blocky and abstract: a house is a cream box with a terracotta roof and one warm-lit window rectangle (`#ffd47a` at 90%); a mast is a pale box with a thin crossbar and a red beacon dot; a rack is a dark slate box with two LED slits (teal, amber); a phone is a tall slate box with an amber dot; a ship is a box hull with a smaller bridge box. Proportions: a house about 46 x 40 x 30 units, a rack 14 x 12 x 44 to 52, a mast 6 x 6 x 70 on a 130-unit tile. Pairs of faces carry flat 2D art through `LF`.

```js
const house = (x, y, w, d, h, base, roofc) => shadow(x, y, w, d, h + 20) + box(x, y, 0, w, d, h, base)
  + LF(x, y, 0, w, d, h, `<rect x="10" y="${h * .35}" width="14" height="${h * .35}" fill="#ffd47a" opacity=".9"/>`) + roof(x, y, h, w, d, 22, roofc);
const rack = (x, y, h) => box(x, y, 0, 14, 12, h, "#222b44")
  + LF(x, y, 0, 14, 12, h, `<rect x="2" y="4" width="10" height="2" fill="#7ff3e4" opacity=".8"/>`);
```

Stock objects (all from the helpers): 1. house; 2. tree; 3. radio mast with beacon; 4. server rack row with a wall display above the tallest rack; 5. phone slab; 6. ship; 7. cable cut-away (cylinder with a core of glowing fibres); 8. water section with fish and kelp; 9. pool or pond (flat ellipse); 10. a hose-sized comparison tube beside the cable.

## 5. Typography

| Role | Font | Size (px at 1080 wide) | Colour |
| --- | --- | --- | --- |
| captions | Google Sans Flex (fallback `Arial, sans-serif`), 500 to 700 | auto from vfrey, style `box` with a dark stroke | white, spoken word on an amber chip with `#0a0f20` text |
| stage label | JetBrains Mono 800 (fallback monospace) | 26, tracking 0.2em, upper case | `#cfd6ee` |
| chip text | JetBrains Mono 800 | 36, tracking 0.06em, upper case | `#0a0f20` on `#ffbf3c` or `#7ff3e4` |
| scene props (UI text on a phone) | Google Sans Flex | 14 to 20 units on the face | white or amber |

No rounded corners on any label. Caption call: `vfrey.captions("#captions", { style: "box", font: '"Google Sans Flex", sans-serif', color: "#ffffff", highlight: "#ffbf3c", highlightText: "#0a0f20", maxWords: 4, stroke: "#0a0f20" })`. Chips sit at y 296, only while their key word is spoken; the stage label sits at y 170 to 190 with 14 px square steps (amber when reached, `#33466f` otherwise).

## 6. Composition

- Caption band: vfrey exposes it as `--vf-caption-at` and `--vf-caption-h` and as `vfrey.captionBox`; read it, never type its pixels.
- Safe area: nothing important in the top 10% (platform UI) or the bottom-right label corner; the stage label sits just under the top safe edge.
- Frame grid: the camera focus sits at 42% of the frame height (`CY = 800` of 1920); the diorama occupies the hero band between 12% and 62%; the caption band and the scrim take the lower 38%.
- Subject scale: subjects are large, a diorama fills 70 to 90% of the width at zoom 3.0 to 3.3 of the 130-unit-tile model (the starter's units), a hero object 2.4 to 2.7 times a diorama, the wide shot is about 0.4 times it and lasts under a second.
- Depth: stars move at 4% of the camera; nearer objects are drawn last (ascending x then y); shadows and the lit trail carry depth; the vignette darkens the edges.
- The world runs under the caption band to the bottom edge: extend tiles, water and earth so no shot ends in empty ground; the bottom 44% carries a scrim from transparent to `rgba(8,12,28,.78)`. Captions always sit on a plate: the dark scrim, never over the marker or the hero object: aim the focus above the band.

Shot types:
```
OPEN CLOSE-UP         WIDE SWEEP            DIORAMA               CUT-AWAY              MACRO (IRIS)
+------------+        +------------+        +------------+        +------------+        +------------+
| . .  . .   |        | .  .  .    |        | . steps .  |        | . steps .  |        | (  tube  ) |
|   hero  *  |        |  _  _  _   |        |   [house]  |        |  |wall|    |        | (  core  ) |
|   /\       |        | / \/ \/ \  |        |  /\ tile   |        | rack rack  |        | (  fibre ) |
|  tile      |        |  tile row  |        |  mast *    |        |  tile      |        |   iris     |
|~~scrim~~~~~|        |~~scrim~~~~~|        |~~scrim~~~~~|        |~~scrim~~~~~|        |~~scrim~~~~~|
+------------+        +------------+        +------------+        +------------+        +------------+
```

## 7. Motion

- Feel: smooth, slow and weighty, 30 fps, no stepping.
- Easing: camera between dioramas `power2.inOut`, the big dive `power3.inOut`, slow drifts `sine.inOut`; the marker leg `power1.inOut`; iris `power2.inOut`; entrances (a chip) a 0.2 s fade or none.
- Durations: camera move 1.0 to 1.4 s, hook pull-out 1.2 s (0.4 to 1.6 s), marker leg 1.5 to 3 s, iris 0.8 s, chip life 1.5 to 2 s.
- Camera vocabulary: open close-up (zoom 2.2 relative to the model), wide sweep (0.45), diorama (1.3 to 1.5), object dive (2.4 to 2.7), iris. Every move starts before the marker leg so the camera leads. The camera focus is `P(...)` of the next object; a move never exceeds 2.2 zoom change per second.
- Secondary and ambient (finite repeats only): beacon blink, LED `steps(1)` yoyo with periods 0.35 to 1.2 s, pool pulse, water glints, light rays swaying, kelp rotating with `svgOrigin`, fish crossing, bubbles, a ship bobbing 4 px over 2.2 s, star twinkle.
- Trail width and marker scale follow `1 / k^0.6` (`--lw`) so they read at every zoom.
- Forbidden: whip pans, shakes, rotation of the world (the angle is fixed), perspective, bounce easing, `repeat: -1`, negative timeline positions, callbacks that toggle state (use `tl.set`), blur filters.

```js
const K = { home: { fx: P(60, 60, 20)[0], fy: P(60, 60, 20)[1], k: 3.3 }, wide: { fx: 20, fy: 80, k: 1.25 } };
function camTo(name, a, b, ease = "power2.inOut") { const to = K[name]; tl.fromTo(cam, { fx: prev.fx, fy: prev.fy, k: prev.k }, { fx: to.fx, fy: to.fy, k: to.k, duration: b - a, ease, immediateRender: false }, a); prev = to; }
vfrey.onFrame(applyCam);   // what a render runs: the camera paints from vfrey.onFrame
```

## 8. Transitions

Allowed: 1. the camera glide itself (the default: tile to tile, 1.0 to 1.4 s, `power2.inOut`); 2. the iris to a macro stage, a full-frame SVG clipped by `circle(r at 50% 36%)`, r from 0 to `1.2 * frame height` in 0.8 s, `power2.inOut`, and back out for the next beat; 3. the hook pull-out (zoom 2.2 to 0.45 and back in 2.2 s). Forbidden: fades to black, wipes, slides, cuts between unrelated worlds without an iris, cross-dissolves.

## 9. Sound

Bed: pad chords Am9 - Fmaj7 - Cmaj7 - G6, 5.33 s each (three detuned sines, slow attack), a sub note, a sparse bell arpeggio on 8th notes at 90 bpm with a 62% hit rate (seeded). Calm, curious, a little cinematic. Accents: `blip` (sine sweep 1100 to 1650 Hz, 0.14 s) at marker lift-off and arrivals, `chime` at a decision or delivery, `whoosh` on every big camera move and iris, `thunk` (95 to 55 Hz) when something heavy lands, tiny `click`s while something computes. Inside water or a macro window the bed is low-passed (14 kHz to 700 Hz in 0.6 s) while accents stay bright. Mix: `volume: -15`, `duck: false` so the accents are not ducked away, the bed about 15 dB under the voice.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with the accents (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-isometric/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey isometric style)", "volume": -15, "duck": false}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (30 to 40 s)

| Time | Beat | Shot type | Content |
| --- | --- | --- | --- |
| 0 to 3 s | hook | OPEN CLOSE-UP then WIDE SWEEP | hero object with the starting action; the marker races the whole route as the camera pulls out; dive back |
| 3 to 11 s | station 1 | DIORAMA | the first tile explained; marker leg 1 |
| 11 to 19 s | station 2 | DIORAMA | the second tile; camera glide; marker leg 2 |
| 19 to 27 s | station 3 | CUT-AWAY | the inside of the machine; wall display above the racks |
| 27 to 33 s | macro | MACRO (IRIS) | a size comparison or inside view through the iris; chip with the cited fact |
| 33 to 38 s | payoff | DIORAMA | the marker arrives at the end tile, the destination lights up; last picture holds |

## 11. Reference frames

Saved in this style's package folder (not installed into projects): look at them before drawing.
- `ref-1.jpg` a phone diorama: copy the slab with its earth section, the pastel house and trees, the tall phone slab with the amber chat bubbles, the stage label with five square steps, the soft shadow.
- `ref-2.jpg` the data-centre cut-away: copy the back wall with a wall display, the racks with LED slits, the amber lit trail on the dim conduit and the cell tower with a red beacon.
- `ref-3.jpg` the seabed section: copy the layered water, the clipped section with kelp and fish, the ship on the surface, the amber marker under the water.
- `ref-4.jpg` the macro cable: copy the iris-framed teal stage, the huge cylinder with a glowing core, the green hose comparison and the chip with a cited number.

## 12. Reference implementation

`starter.html` next to this file: the page shell, the projection helpers (`box`, `pyramid`, `roof`, `LF`, `RF`, `shadow`, `tile`, `tree`, `house`), three tiles in a row (house, mast, data hall cut-away), a route with a dim conduit and a lit trail, the glowing marker, the camera with named keyframes and `vfrey.onFrame` painting, the stage label and chip, ambient motion and the captions. Replace the objects, labels, chip and cue words, keep the construction. It renders with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 4 out.png`.

## 13. Do, don't and the final checklist

Do:
1. Use the one projection `P` for everything.
2. Shade every box face from one base colour by the three factors.
3. Show earth sections on both visible slab sides.
4. Draw soft shadows as hulls, never with blur.
5. Keep a single amber accent and a single teal support.
6. Start every camera move before its marker leg.
7. Scale trail width and marker by `1 / k^0.6`.
8. Anchor beats to sentence starts and chips to key words found by text.
9. Extend the world under the caption band to the bottom edge, with a bottom scrim.
10. Toggle visible states with `tl.set`, and paint camera and trail from `vfrey.onFrame`.

Don't:
1. Use perspective or rotate the world.
2. Use a linear full-screen gradient (it bands).
3. Add a third saturated colour or a black outline.
4. Use filters or blur for shadows and glow rings.
5. Use `repeat: -1` or negative timeline positions.
6. Put captions over the marker or the hero object.
7. Clip a chip against the frame edge (move the camera, not the chip).
8. Claim numbers you cannot cite; show scale with a picture.
9. Type script text into the scene; only UI props and chips.
10. Round the HUD corners.
11. Hold the wide shot for more than a second.

Final checklist, run on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; an even sample can land inside an iris, so also check stills at the beat times with `--frame <t>`). One line per signature trait:
- Fixed isometric angle, no perspective.
- Night-navy radial ground with stars and vignette.
- Pastel blocks with top-light, left-mid, right-dark faces and a white rim.
- Earth sections and a faint grid on every slab.
- Soft hull shadows to the lower right, no hard blur.
- Only amber and teal as saturated colours.
- A glowing marker with a pool, a dim conduit and a lit trail.
- Stage label with square steps under the safe top; chips amber or teal, square.
- Top fade and bottom scrim visible; captions off the marker.
- World runs to the bottom edge under the captions.
- Camera moves lead the marker; the wide shot is brief.
- Nothing important in the top 10% or the bottom-right corner.

Pitfalls from real runs: `tl.call` is suppressed when the renderer seeks, so toggle states with `tl.set`; use `immediateRender: false` on every `fromTo`; `tick` for 35 s of 1080 x 1920 SVG takes about 75 to 90 s warm and the first render per `HOME` downloads Chrome; Kokoro adds about a second between lines, so key the scene to sentences; a teal glow behind a phone above 30% alpha washes the screen out.
