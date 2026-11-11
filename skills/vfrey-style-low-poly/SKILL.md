---
name: vfrey-style-low-poly
description: "Use when the chosen video style is Low-poly 3D (vfrey-style-low-poly), or the person asks for a low-poly, faceted, toy-like, diorama or 'paper-craft 3D' look. Teaches how to model, light, compose, animate and score that look in a vfrey three.js scene, for any topic, on top of the Real 3D style's setup (vfrey-style-real-3d): flat-shaded triangles with one colour each, a floating island, soft pastel light, diagrams drawn in the 3D world, a caption plate around vfrey's caption band and a generated sound bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Low-poly 3D
  style-summary: A bright toy world made of flat coloured triangles, filmed by a camera that glides around a floating diorama.
  style-best-for: nature, animal behaviour, how things work, geography, kids' science, gentle explainers
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.
<!-- style-bible: v2 -->

# Video style: Low-Poly 3D

This file teaches a look, never a topic. The plumbing is the Real 3D style's and is NOT repeated here: read `vfrey-style-real-3d` (its `SKILL.md`, `helpers.md` and `scene-starter.js`) for the one-time `npm install three@0.187 esbuild` (ask the person first), the esbuild bundle into the scene folder, the `modifiers` proxy tween that calls `render(t)` on every seek, `preserveDrawingBuffer`, the on-screen error box and its limits (it needs a graphics chip and never goes to the cloud render). Everything below replaces that style's look: no shaders, no bloom, no star field. Start from `starter.html` and `starter-scene.js` next to this file (the shell and the 3D source: copy them to `scenes/<idea>/index.html` and `src/<idea>/scene.js`, bundle to `scenes/<idea>/scene3d.js`); the music script is `make-bed.py` next to this file. Use it when the subject is a creature, object or place that can be built from simple solids and the idea is spatial; not for faces, photographic looks, flat subjects (charts, interfaces) or a machine without a graphics chip.

Script pace: do not trust a word budget. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser`; Kokoro af_heart with lineGap 0.3 speaks about 3 words a second. Set `lineGap` in the script (0.25 to 0.4 is brisk) and write 5 or 6 full lines rather than many short ones.

## 1. The look in three sentences, and the signature traits

A bright toy world made of flat coloured triangles: every object is a handful of facets, each triangle one pastel colour, lit by one warm light with soft shadows. It stands on a small island that floats in a peach, pink and blue sky among clouds and tiny islands. A camera that never stops gliding orbits and pushes through it, and square plum plates carry the words.

Signature traits:
1. Visible triangles: flat shading, one colour per triangle with 4 to 10% brightness jitter.
2. A floating island: flat meadow top, earth rim, jagged lilac rock underside.
3. Pastel palette, plum `#33203c` instead of black, two accents (sun yellow, coral).
4. A peach horizon sky gradient with pink and lilac below it.
5. Fog `#ffe6da` fading the distance to peach.
6. Soft shadows from one warm sun and pink bounce from the hemisphere light.
7. A faceted sun (icosahedron with cones) as a prop.
8. Low-poly pines (3 stacked cones), round blossom trees, dodecahedron rocks, flower props.
9. Fluffy clouds of squashed icosahedra with a pink underside.
10. Tilt-shift blur at the top and bottom of open-air shots (miniature feel).
11. Square plum caption plates and tag plates with a hard drop shadow, no rounded corners.
12. Toy scale: the creature is a tenth of its island.

## 2. Palette

| Role | Hex |
|---|---|
| Sky top / mid / horizon / below / deep | `#8fd0f0` `#c9ecf6` `#ffe9d6` `#ffd3e2` `#d9c2f0` |
| Fog and background | `#ffe6da` (fog 26 to 95 units) |
| Grass | `#a8e6a1 #8fdc9a #c4f0b2 #79cf95` |
| Earth, rock | `#e0ad82 #cc9370`; `#bba9dc #a08fca #8a7ab8` |
| Trees | pine `#62c9a0 #7cd8ae #98e6c0`, blossom `#ff9ebb #ffc4d8`, trunk `#a8745e` |
| Ink / white | plum `#33203c`; cream `#fffaf0` |
| Accent 1 (marks, reference) | sun yellow `#ffd24a`, shade `#ffb84a` |
| Accent 2 (diagram, answer) | coral `#ff6f61` (a brand accent replaces it) |
| Enclosed set | ground plum `#33203c`, honey `#ffd77a #ffca5c #c9792a` |

Ratios: pastel mid-values everywhere; coral and yellow together at most 10% of the frame; plum at most 25% (plates and vignette). Never use: pure black, saturated neon, textures or photos, smooth spheres, bloom or glow, a third accent hue.

## 3. Shapes and line

- Build from primitives only: `IcosahedronGeometry` (detail 0 to 3) for round things, `ConeGeometry` and `CylinderGeometry` with 4 to 10 sides, boxes, squashed `OctahedronGeometry` for petals and leaves, `ExtrudeGeometry` for cut shapes. The facets are the style.
- One material: `MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.86 })`. Colour lives on the triangles via the `P(geo, color, matrix, jitter)` helper in `starter-scene.js`, which takes a colour or a function of the triangle centre and normal (stripes, grass on top and rock below, a pink underside on clouds).
- Merge static props with `mergeGeometries` (one mesh per group); keep separate only what moves.
- Bend shapes with `warp(geo, v => ...)`, a function of the corner position, never per-corner random numbers (the surface stays closed).
- Lines (diagrams) are `Line2` with `LineMaterial` 9 to 12 px (plain GL lines are 1 px); dashed lines for references, solid coral for the answer, translucent wedge opacity .42 to .5.
- Light: `HemisphereLight("#e6f6ff", "#ffc9b8", 2.1)` plus `DirectionalLight("#fff0d2", 2.5)` from high and slightly to one side; `PCFSoftShadowMap`, map 2048, `radius 5`, `normalBias 0.04`. No tone mapping, no bloom. The shadow falls down-right of objects on the ground.
- Plates: square corners, `box-shadow: 0 8px 0 rgba(43,26,48,.3)`, no blur.
- Enclosed set: plum background and fog (17 to 36), hemisphere 0.6, a warm `PointLight` 5 units in front of the subject that follows it, a plum CSS vignette.

## 4. Characters and objects

- A creature is 3 or 4 solids plus thin parts: head, body, a stretched abdomen striped by the triangle's position (`Math.sin(c.x * 9) > 0.1`), 4 to 6 box legs, cylinder antennae, flat kite wings. Head about 40 to 60% of the body, eyes 2 tiny plum icosahedra, no mouth detail, hands and feet as boxes; one or two pivots (wings, a tail) and no more.
- Flutter: flap at 9 Hz with `sin`; faster aliases into a slow wobble at 30 fps. Add two fainter wing copies 1.15 rad behind in phase (opacity .24) for cheap motion blur.
- Stock props (all in `starter-scene.js`): (1) pine, (2) round blossom tree, (3) rock, (4) flower, (5) grass tuft, (6) cloud, (7) faceted sun, (8) mini floating island, (9) the island itself, (10) the hero. Add: straw hive, wooden stand, mushroom (cone cap on a cylinder), fence (boxes), lantern (octahedron), bridge (boxes), crystals (stretched octahedra).
- Crowds: `InstancedMesh` with `setColorAt` and three or four close colours.
- Scale like a toy: flowers knee-high to trees; the hero reads on a phone at 50 to 60% of the frame width in a close-up.

## 5. Typography

Baloo 2 800 (fallback "Google Sans Flex", sans-serif) for everything. Sizes are fractions of the short side (`--vf-vmin`, 1080 px): tags 3.6% (about 39 px) with wide tracking .06em, UPPERCASE; title/credit 9.2% (about 99 px) cream on a plum plate; sub-credit 4.6% on a yellow plate. Captions: `vfrey.captions("#captions", { style: "box", color: "#ffffff", highlight: "#ffd24a", highlightText: "#33203c", maxWords: 4 })`, the script's `captions.style` also `box`, with the group plate `.vf-grp.on { background: #33203c; padding: 10px 26px 14px; box-shadow: 0 9px 0 rgba(43,26,48,.32); }`, at `top: var(--vf-caption-at)`, the same place all film. Tags: cream plate with plum text, or yellow, or coral with white text.

## 6. Composition

- 9:16 is tall and a diorama is wide: look down from 25 to 45 degrees so the disc becomes a tall ellipse, let the rock underside hang toward the bottom, and fill the rest with clouds and tiny islands. The sky gradient may not be more than about 15% of the frame without a cloud, island or the sun in it.
- At a 40 degree field of view a tall frame shows `0.409 * D` across and `0.728 * D` up. Hero close-up: the subject is 50 to 60% of the width. Wide: the island is 85 to 90% of the width.
- The world continues behind and under the caption plate to the bottom edge (meadow, flowers, more wall, an extra). Keep the subject and every tag above 62% of the height: push the focus up with `camera.setViewOffset(W, H, 0, 0.04 * H, W, H)`.
- Depth: fog on, foreground blob (a big tree or rock out of focus) in the lower corner, tilt-shift strips top 24% and bottom 26%.
- A picture-in-picture panel (a map view of the same idea) in the top 5 to 27% with a square cream 10 px border, subject at 30 to 62%.

Shot types (camera `{ t, F, dir, D, off }`):
```
A Hero close-up      B Follow / orbit      C Pull-out wide        D Interior            E Panel map + subject
[ tag             ]  [ tag           ]     [ title plate     ]    [ plum, honey glow ]  [ +-----map------+ ]
[  ( hero 55% )   ]  [ (hero, moving)]     [   .--island--.  ]    [ close to the     ]  [ +--------------+ ]
[  petals/foreg.  ]  [  trees, flowers]    [  (  ~~~~~~~~  ) ]    [ subject, 1 prop  ]  [ ( subject )      ]
[ plate           ]  [ plate         ]     [ plate           ]    [ plate            ]  [ plate          ]
```
F Takeover: the panel grows to the full frame while its camera eases to the final orbit.

## 7. Motion

Smooth, 30 fps, `render(t)` is a pure function of `t`; cue everything from the voice (`vfrey.timing.words`, line starts), never typed seconds once the voice exists.
- Camera: shots blended with `inOutCubic`, distance blended geometrically, plus small handheld drift (about 1% on `dir`). One long move per line: orbit while pushing in (D 3 to 3.6), follow a flight while pulling out to reveal the island (D 27 to 33), dolly into a doorway, end on a slow orbit. Never locked off; never two fast moves in a row. Lerping between nearly opposite `dir` vectors passes through the middle: add a shot between them.
- Primary motion: the hero does what the line says. Secondary: followers trail the hero with a time lag (`pos(t - 0.3)`). Ambient (something in every shot): island bobs 0.1 at 0.9 rad/s, clouds drift (0.05 units/s), flowers sway with their own phase, sun spikes turn, minis rotate.
- Arrivals overshoot (`backOut` .4 to .5 s) for props, tags and panels; lines draw on with `outCubic`; sweeps use `inOutCubic` over about 1 s. Tags fade 0.22 s in, 0.16 s out.
- First frame already has the subject; the last image holds 1.5 s while the camera still drifts.
- Forbidden: shake, whip pans, bloom flashes, spinning without cause, anything that stops the camera.

## 8. Transitions

1. Into an enclosed set: dolly at a doorway with a cubic ease-in until it fills the frame, then a plum flood (0.35 s up, 0.5 s down) hides the change of world.
2. Panel pop: the picture-in-picture scales from its centre with `backOut` in 0.5 s.
3. Panel takeover: the rectangle grows to full frame in 0.85 s (`inOutCubic`) while its camera eases to the final orbit; the way back out to the open world.
Use each once. Forbidden: hard cuts, wipes, fades to white.

## 9. Sound

A light toy-like bed: kalimba plucks over a soft pad and a round bass, C major, 96 bpm. Accents from `cues.json`: `pop` (something appears), `chime` (a fact lands), `whoosh` (the camera travels, a panel grows), `buzz` (an insect or motor, with a throb rate) and `soft` (the bed goes mellow for an interior). Mix `"volume": -14`, `"duck": true`; lower `volume` if `audio.voice-clear` warns. Voice: Kokoro `af_heart`.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` needs only `python3` (standard library) and always writes the same file for the same input.
1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (a list; each cue names a sound and a word, line or time, as the top of `make-bed.py` explains), then from the project folder: `python3 .agents/skills/vfrey-style-low-poly/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey low-poly style)", "volume": -14, "duck": true}` and make it again with `--rerender`.
One pass instead: `--duration 60` with no `--timing`. No `python3` (`python3 --version` fails): leave `music` out, say the video has no music and why, install nothing unasked.

## 10. Shot plan template (32 to 40 s)

| Time | Beat | Shot |
|---|---|---|
| 0 to 5 s | Hook: the hero doing the thing, tag names it | A hero close-up, then B follow |
| 5 to 14 s | Explain the mechanism: enter the set or show the part | D interior or B orbit; chime on the fact |
| 14 to 24 s | Diagram in the 3D world: dashed reference, coral answer, wedge sweeps | E panel map + subject, tags (at most 3) |
| 24 to 32 s | Show the consequence at scale: crowd, distance, the island | C pull-out, followers, F takeover |
| 32 to 38 s | Payoff and credit/number on a plate, last image holds 1.5 s | C wide, slow orbit |

## 11. Reference frames

- `ref-1.jpg`: hero close-up. Copy the faceted hero at 55% width, soft pastel focus, plum caption plate with yellow highlight.
- `ref-2.jpg`: enclosed interior. Copy the plum/honey lighting, hexagon facets, a yellow tag plate and the coral label.
- `ref-3.jpg`: panel shot. Copy the picture-in-picture map with a square cream border and the coral tags.
- `ref-4.jpg`: wide island. Copy the floating island, pastel sky, faceted sun, credit plates and clouds.

## 12. Reference implementation

`starter.html` (shell) and `starter-scene.js` (the 3D source) next to this file render a floating island with pines, blossom trees, rocks, flowers, clouds, a sun, a flapping hero, a gliding four-shot camera and a tag that follows a 3D point. Setup: follow `vfrey-style-real-3d` helpers.md sections 1 and 3, then `cp starter.html scenes/<idea>/index.html` and `cp starter-scene.js src/<idea>/scene.js`, bundle, and test with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png` (rebuild the bundle after every edit). Replace the hero, the props and `SHOTS`.

## 13. Do, don't, and the final checklist

Do:
1. Keep `flatShading: true` on every material, including instanced and emissive ones.
2. Colour per triangle with a small jitter; no textures.
3. Use plum, never black.
4. Fill the frame: clouds and mini islands where the sky would be bare.
5. Let the world continue under the caption plate to the bottom edge.
6. Keep the subject large and above 62% of the height.
7. Add something moving of each kind (primary, secondary, ambient) to every shot.
8. Write vertex colours with `THREE.Color` (linear) values.
9. Keep the hemisphere light at 2.1 and the sun at 2.5 for pastels.
10. Cue shots from `vfrey.timing.words`.
11. Captions sit on a plate: plum, square, same place all film.

Don't:
1. Use smooth spheres or smooth normals.
2. Use bloom, tone mapping, shaders or a star field.
3. Lock the camera off.
4. Leave more than about 15% bare sky.
5. Put a tag in the caption band or below 62% of the height.
6. Round plate corners or blur their shadows.
7. Redraw `Line2` points with `setPositions` every frame.
8. Let lines with `depthTest: false` cover the hero (give the hero a higher `renderOrder`).
9. Judge layout from the first preview (the estimated voice moves cues by a second or more).
10. Forget `renderer.setScissorTest(true)` and `LineMaterial.resolution` in two-viewport shots.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; two identical 3D tiles mean the canvas froze: look for the green error box):
- Visible flat facets on every object.
- Pastel colours; no orange or grey cast (lower the sun first).
- A large, lit subject in every tile.
- Something below the focus down to the bottom edge; no tag in the caption band.
- No sky band above 15% without a cloud, island or sun.
- Fog fades the distance to peach.
- Plum square caption plate with a yellow highlight, same place.
- Tilt-shift on open-air shots, off on diagram shots.
- Panel (if any) is readable at phone size.
- Numbers shown on screen match what the voice says (read each number on the contact sheet against the script).
