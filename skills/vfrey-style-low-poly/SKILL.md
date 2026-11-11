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

# Video style: Low-poly 3D

Real 3D (three.js), but bright, faceted and toy-like: every object is a handful of flat triangles, each one pastel colour, lit by one warm light with soft shadows, standing on a small island that floats in a peach-and-blue sky, filmed by a camera that glides around it.

This file teaches a look, never a topic. The plumbing is the Real 3D style's and is NOT repeated here: read `vfrey-style-real-3d` (its `SKILL.md`, `helpers.md` and `scene-starter.js`) for the one-time `npm install three@0.187 esbuild`, the esbuild bundle into the scene folder, the `modifiers` proxy tween that calls `render(t)` on every seek, `preserveDrawingBuffer`, the on-screen error box and its limits (it needs a graphics chip, never goes to the cloud render, and you ask before installing). Everything below replaces that style's look: no shaders, no bloom, no star field. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it when the subject is a creature, an object or a place that can be built from simple solids and the idea is spatial: where, which way, how far, what is inside. Nature, animal behaviour, geography, how it works, kids' science.
- Not for faces and real people, not for anything that must look photographic, not for flat subjects (charts, lists, interfaces), and not on a machine without a graphics chip (see the Real 3D skill).

## Plan before coding

1. Write the script as 5 or 6 full lines (Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause). Cue everything from line starts and key words in `vfrey.timing`, never typed seconds.
2. Pick one subject, one island, and at most one enclosed set (inside something). One long camera move per line.
3. Choose the one diagram the idea needs (a line, an angle, a path) and lay it on the terrain or the wall.
4. A picture-in-picture panel can show two views of the same idea at once; plan its rectangle (top 5 to 27%) and what the main subject does below it (30 to 62%).
5. Subject on screen in the first frame; the last image holds 1.5 s while the camera still drifts.

## Palette and type

- Sky painted top to bottom `#8fd0f0`, `#c9ecf6`, peach `#ffe9d6` at the horizon, pink `#ffd3e2` and lilac `#d9c2f0` below it (an island floats, so the camera sees under the horizon). Fog `#ffe6da`, 26 to 95 units.
- Land mint greens `#a8e6a1 #8fdc9a #c4f0b2 #79cf95`, earth `#e0ad82 #cc9370`, lilac rock `#bba9dc #a08fca #8a7ab8`; trees teal-green and blossom pink; wood `#c98f6b`, straw `#ffd98a`. Ink is plum `#33203c`, never black; white is cream `#fffaf0`.
- Two accents only: sun yellow `#ffd24a` and coral `#ff6f61` (the diagram and answer colour). A brand accent replaces coral. An enclosed set flips the ground to plum with honey tones.
- Type: Baloo 2 800 for tags (3.6% of the short side, wide tracking) on square plates with a hard drop shadow (`0 8px 0 rgba(43,26,48,.3)`), no rounded corners, no blur.

## Drawing approach

- Build from primitives only: `IcosahedronGeometry` (detail 0 to 3) for anything round, cones and cylinders with 4 to 10 sides, boxes, squashed octahedra for petals, `ExtrudeGeometry` for cut shapes. Never a smooth sphere: the facets are the style.
- One material for nearly everything: `MeshStandardMaterial({vertexColors: true, flatShading: true, roughness: 0.86})`. Colour lives on triangles. `P(geo, colour, matrix, jitter)` in `helpers.md` gives each triangle one colour (a hex, or a function of its centre and normal) with a 4 to 10% brightness change.
- Merge every static prop into one mesh per group; keep separate meshes only for what moves. Bend shapes with `warp` (a function of the vertex position, never random per corner) so the surface stays closed. Many copies use `InstancedMesh` with `setColorAt`.
- The floating island is an icosphere (detail 7) pressed flat on top onto `groundY(x, z)` (a low dome plus two or three Gaussian hills) and pulled into a jagged point below; colour by height and slope. Place every prop with the same `groundY`.
- A character is 3 or 4 solids and thin boxes with one or two pivots. Flutter at 30 fps flaps at 9 Hz or less (faster aliases into a wobble) with two fainter trailing copies as cheap motion blur. Scale like a toy: the creature is a tenth of its island.
- Diagram lines are `Line2` with `LineMaterial` (9 to 12 px). Reference directions are dashed yellow or cream; the answer is solid coral with an arrow tip; an angle is a coral arc plus a translucent wedge. Rewrite line points in place (`setLine`), never `setPositions` per frame.

## Full frame around the caption band

vfrey's caption band (`--vf-caption-at`, `--vf-caption-h`) is centred near 70% of a 9:16 frame when the position is bottom.

- 9:16 is tall and a diorama is wide: look down on it from 25 to 45 degrees so the disc becomes a tall ellipse, let the rock hang toward the bottom edge and fill the rest with clouds and one or two tiny islands. No more than about 15% of a frame is bare sky. The world continues behind and under the captions to the bottom edge.
- Subjects are large: at a 40 degree field of view a hero close-up fills 50 to 60% of the width, a wide shot 85 to 90%. Keep the subject and every tag above 62% of the height, pushing the focus up with `camera.setViewOffset(W, H, 0, 0.04 * H, W, H)`.
- Captions sit on a plate: `vfrey.captions("#captions", {style: "box", color: "#ffffff", highlight: "#ffd24a", highlightText: "#33203c", maxWords: 4})` with the plate on the whole group (`.vf-grp.on {background: #33203c}`), the same place all film. Tags follow 3D points projected with the camera that drew them, at most three in a panel.
- Keep the bottom-right corner clear for the `AI-GENERATED` label.

## Motion rules

- `render(t)` is a pure function of `t`. Camera shots are `{t, F, dir, D, off}` blended with `inOutCubic` (distance blended geometrically) plus a small handheld drift: orbit while pushing in, follow a flight while pulling out, dolly into a doorway. Never a locked-off shot; never two fast moves in a row. Lerping between two nearly opposite `dir` vectors passes through the middle: add a shot between them.
- Primary motion is the character doing what the line says; secondary is followers that trail it with a time lag; ambient is the island bobbing 0.1, clouds drifting, flowers swaying with their own phase, the sun turning. Something of each in every shot.
- Arrivals overshoot (`backOut`); lines draw on with `outCubic`; sweeps use `inOutCubic` over about a second.

## Transitions

Three, each used once: into an enclosed set, a dolly at a doorway with a cubic ease-in until it fills the frame, then a plum flood (0.35 s up, 0.5 s down) that hides the change of world; a panel pop (the rectangle scales from its centre with `backOut` in 0.5 s); a panel takeover (the rectangle grows to the full frame in 0.85 s `inOutCubic` while its camera eases to the final orbit), which is the way back out.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a light toy-like bed (kalimba plucks over a soft pad and a round bass, C major, 96 bpm) plus accents: `pop` (something appears), `chime` (a fact lands), `whoosh` (the camera travels or a panel grows), `buzz` (an insect or motor, with a throb rate) and `soft` (the bed goes mellow for an interior). It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (a list; each cue names a sound and a word, line or time, as the top of `make-bed.py` explains), then from the project folder: `python3 .agents/skills/vfrey-style-low-poly/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey low-poly style)", "volume": -14, "duck": true}` and make it again with `--rerender`. If the run warns `audio.voice-clear`, lower `volume`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the sentence starts (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. Rebuild the bundle before every render (the Real 3D skill has the command).
3. In every tile: visible facets, a large lit subject, something down to the bottom edge, no tag in the caption band, no bare sky above 15%.
4. Two tiles with the same 3D picture mean the canvas froze: look for the green error box.
5. Are the colours still pastel? If a set went orange or grey, lower the directional light before touching the palette. Is a panel's subject at least 8% of the frame width?

## Pitfalls

- Smooth normals return when a second material (instanced or emissive) forgets `flatShading: true`: the object looks like plastic among paper.
- Vertex colours need `THREE.Color.set(hex)` values (linear) written to the buffer; raw 0 to 255 fractions wash everything out.
- Light units: hemisphere 2.1 plus directional 2.5 is right for pastels; more burns mint to white. A warm set lit by a point light goes orange fast: keep the hemisphere low (0.6) and let the fog colour, not black, be the darkness.
- Transparent wings sort badly: `depthWrite: false`, `DoubleSide`, and keep them few.
- Lines with `depthTest: false` cover the hero unless the lines are opaque and the hero has a higher `renderOrder`.
- With two viewports, forgetting `renderer.setScissorTest(true)` lets the second pass clear the first; forgetting `LineMaterial.resolution` gives panel lines the wrong width.
- `backdrop-filter` tilt-shift blurs diagram text and panels too: fade it out whenever a panel or tag is up.
- The first preview is timed by an estimated voice; cues move by a second or more after the first full render. Judge layout only then.
- A preview starts a browser: preview four to six times, not twenty.
