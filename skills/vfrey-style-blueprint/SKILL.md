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

# Video style: Blueprint

A drafted engineering sheet in white and pale-cyan linework on blueprint blue, with a fine grid and fold creases, drawn construction lines first and outlines second. One big sheet is the whole world: a camera pans and zooms across it, one colour per force or quantity flows over the drawing, and drafting tools sweep through as transitions.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html` plus `scene.js`, one inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for how something is built or works: engineering, mechanics, physics, architecture, science with forces or flows, any "why does it hold, move or fit" explainer.
- Not for stories about people, not for anything photographic or organic, not for loud consumer topics, and not when a number would have to be invented: label real dimensions only if sourced, mark counts "SCHEMATIC" and say "vertical exaggerated" when you exaggerate.

## Plan before coding

1. Write the script as 4 to 6 lines. Pick 3 or 4 quantities (forces, flows, loads), one colour each, fixed for the whole film.
2. Pick 4 to 6 camera stations on one sheet, one idea each, with a wide establishing shot first and last. Add one detail, a section cut or an exploded view for the key claim.
3. Frame 0 must already show the sheet, border, zone letters, title block and construction marks: the opening-frame check wants real content. Draw everything else on later.
4. Order of drawing: frame and header, thin construction lines (axes, centre lines), outlines, hatching, then labels with leader lines. A closing stamp lands on the answer.
5. Write the title block (subject, revisions, force key, sheet number, units) from the script so the sheet reads as one document.

## Palette and type

- Sheet `#0b3380` with a radial `#1a58c4` to `#1245a6` to `#0a2f78`. Linework `#f2fbff`; construction and dimension lines `#8fdcff` and `#bdeeff`; fills are hatching only.
- One colour per quantity, kept fixed all film: `#ffd84a`, `#ff6fae`, `#6dffb0`, `#ff9a45`. Show them in a legend whose rows light up when first used. `brand.json` may swap them; keep four distinct hues.
- JetBrains Mono for everything, UPPERCASE, `letter-spacing: .05em`. Labels get a halo (`paint-order: stroke; stroke: #0f3d96`).

## Drawing approach

- One `<svg>` is the world, and the camera is its `viewBox` animated from a proxy `{x, y, w}` (`h = w * 1336 / 1080`); `apply` (run from `onUpdate` and from `vfrey.onFrame`, which is what a render runs) also sets a CSS variable `--k` (world units per screen pixel). Every stroke width and text size uses `--k` (`stroke-width: calc(var(--k) * 3.4px)`) so lines stay crisp and constant at any zoom. Arrowheads are `<marker markerUnits="strokeWidth">`.
- Draw-on: every path has `pathLength="1"`, `stroke-dasharray: 1 1`, `stroke-dashoffset: 1`, then tween `strokeDashoffset` to 0. Hatch fills start at `fillOpacity: 0` and fade in AFTER the outline, or they show before it is drawn.
- Flowing force arrows are dashed strokes whose offset is `calc(var(--k) * var(--ph) * -1px)` from one global linear phase, so the dashes move forward at constant screen speed at any zoom. Pulse an arrow with a yoyo on the matching word.
- Include dimension lines with extension lines and end ticks, a section callout (dashed circle, lettered bubble, "DETAIL A"), a cut line with its hatched section beside it (`fill-rule: evenodd`), hatch patterns (`patternTransform=rotate(45)`), fold creases (a dark and a pale line), zone letters, registration marks and a few pencil scribbles (seeded zigzags drawn on like any path).
- Exploded view: copy the part as a ghost, lift it along dashed projection lines and cross-fade to a wireframe cuboid turning by a proxy angle whose `onUpdate` rewrites the path `d`. Everything is a function of timeline time.

## Full frame around the caption band

The frame is split top to bottom: the sheet viewport (`1080 x 1336`), a note strip, and the title block, so there is no dead zone and the sheet and title block run to the bottom edge. vfrey's caption band (`--vf-caption-at`, `--vf-caption-h`, near 70% of a 9:16 frame when the position is bottom) is where the note strip sits, so place the strip, its captions and the title block from `vfrey.captionBox` if the position is not the bottom.

- Subjects are large: at each station the structure fills the viewport width, and labels are 23 to 46 px in `--k` units.
- Captions sit on a plate: a dark `#082866` strip with a double frame, a "NOTE" tab and a counter that changes per scene, `vfrey.captions("#captions", {style: "color", font: '"JetBrains Mono"', size: 58, highlight: "#ffd84a", maxWords: 3})`, the same place all film. Never put artwork under it.
- The title block (title, revisions, force key, sheet number, units) sits below the strip on a grid. Keep the bottom-right 340 x 80 clear for the `AI-GENERATED` label.

## Motion rules

- Keys are `[time, {x, y, w}, ease]`, each tweened with `fromTo` from the previous key so seeking is safe. Moves are `power3.inOut` (about 1.2 s); holds are slow `sine.inOut` drifts, never static. One idea per station.
- Cue everything from `vfrey.timing.words` with a regex helper (`W(/hangs/i, line)`); never hard-code the seconds of a word. Labels land on the word that names them.
- Labels placed for one station can land off screen at another: write each label's world position from that station's `viewBox`.
- Subject on screen within 0.3 s of each sentence starting; the last picture holds 1.5 s. Finite repeats only, never a negative position.

## Transitions

Drafting tools placed in the gap or over a camera move, with the camera cut underneath while the tool covers the screen: a T-square (a bar with ruler ticks and a head block sliding top to bottom in about 1.1 s), a set square (a right triangle with an inner cut-out sliding diagonally) and a compass (one leg turning about a fixed needle point, drawing an arc and a pale sector from a proxy angle). Use each once or twice.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a slow three-voice pad over A, F, C, G with a soft pluck pulse at 84 bpm, plus drafting accents: `scratch` (pencil on paper, one per label), `slide` (a ruler or tool moving, one per tool transition), `tick` (lines drawing), `thump` (the closing stamp) and `tone` (a value landing). It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (a list; each cue names a sound and a word, line, sentence or time, as the top of `make-bed.py` explains), then from the project folder: `python3 .agents/skills/vfrey-style-blueprint/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey blueprint style)", "volume": -14, "duck": true}` and make it again with `--rerender`. If the run warns `audio.voice-clear`, lower `volume`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the sentence starts (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: does the structure fill the viewport, are lines crisp at this zoom, is the strip in the same place, does the sheet reach the title block?
3. Do the hatch fills appear only after their outline, and does each colour mean one quantity?
4. Is every label inside the frame at its station? Is every dimension sourced or marked schematic?
5. Does frame 0 show the sheet, border and title block?

## Pitfalls

- Hatch fills visible before the outline is drawn: set `fillOpacity: 0`, fade it in later.
- Stroke widths in plain pixels instead of `--k` blur or fatten when the camera zooms.
- A closing stamp over the artwork is fine; captions over artwork are not.
- The `NOTE` tab trips `frames.text-overlap` (a warning only).
- `tl.call` does not run when the renderer seeks: use `tl.set`. Put `immediateRender: false` on every `fromTo`.
- Camera keys that start from the wrong previous state jump on seek: always `fromTo` from the previous key.
