---
name: vfrey-style-flat-2d
description: "Use when the chosen video style is 2D flat (vfrey-style-flat-2d), or the person asks for a flat, vector, cartoon-explainer, infographic or 'clean animated characters and charts' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: palette, code-drawn characters and props, live charts, full-frame layout around the caption band, shape-wipe transitions and a generated music bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: 2D flat
  style-summary: Friendly cartoon people, bold flat colours and charts that grow as the voice explains.
  style-best-for: explainer, personal finance, business, education, how-to
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: 2D flat

Flat vector illustration with no gradients, blurs or outlines on characters: big simple people, chunky props and charts in a handful of solid colours, on a ground colour that changes with each act. Everything pops, hops and wipes in time with the voice, so it reads as a friendly animated explainer.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for explanations with actors and quantities: money, habits, comparisons, "A versus B", step-by-step how-tos, anything a chart or a pair of characters can act out.
- Not for moody stories, true crime or history with atmosphere (use a darker style), nor for a subject that needs realism (a face people know, a real place, a product photo). If the script has nothing to count, compare or act out, pick another style.

## Plan before coding

1. Cast it: one or two characters (one colour each) and one "value" object the topic is about (a coin, a leaf, a battery). Every scene shows a character doing something with that object, or a chart of it.
2. Split the script into 5 to 8 scenes, one per idea, and give each a ground colour from the palette so neighbours differ. Decide which scene is the chart and which is the payoff.
3. Write the numbers down first. Charts and counters are computed in the scene from real inputs (a formula in JS), never typed in or invented, and an assumption (a rate, a date) is shown on screen as a chip.
4. Pace the script for the voice: about 2 words a second with the free Kokoro voice, and avoid colons. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause.

## Palette and type

- Seven colours at most: a cream ground `#FFF3DC` with a floor `#F6DFB4`, one ink (navy `#16213E`), one colour pair per character (teal `#18B7A4`/`#0C7A70`, coral `#FF6A4D`/`#C9442C`) and one value colour (gold `#FFC233`/`#E39B12`) used only for the thing the video is about. Swap the hues for the topic or the brand (`brand.json` wins), keep the roles.
- Ground colour changes each act (cream, teal, coral, navy, cream, gold): this is what gives the film chapters.
- Type: Baloo 2 weight 800 for everything; JetBrains Mono 700 only for tiny tags (axis ticks, disclaimers). Set `text-anchor` in CSS classes, not attributes (`svg text{text-anchor:middle} svg text.st{text-anchor:start}`).
- Flat only. Props carry a 6 to 10 px ink stroke; characters carry none. Soft filler shapes: a huge pale circle behind the hero, cloud blobs, a dot pattern at 35% white, a floor texture at 7% black.

## Drawing approach

- One template string per scene: `scene(id, ground, bgSvg, fgSvg)` makes `div.scene > div.cam > svg.bg + svg.fg` (two SVGs, both `viewBox="0 0 1080 1920"`, so the background can drift against the camera). Assemble everything into `#root.innerHTML` before building the timeline.
- Shared art lives in one hidden `<svg><defs>`: the value object as `<g id>` reused with `<use>`, and the patterns.
- `person(id, opts)` returns a 450-unit-tall figure with feet at (0,0): legs, shoes, two arm groups pivoting at the shoulders, a rounded torso with a darker stripe, and a head with a fringe, dot eyes, cheeks and a one-curve mouth. Faces stay minimal. A `pose` object (`aL`, `aR`, `hop`, `smile`) is what GSAP tweens; the ticker turns it into attributes. Place with `gsap.set(id, {x, y, scale, svgOrigin: "0 0"})`.
- Props are a few primitives each: a bag, a jar that fills with discs, an hourglass (sand is `scaleY` on two paths), a balance scale (the beam angle drives the pans), a tree drawn with `stroke-dashoffset`, stacked bars with a stripe pattern.
- Charts: `<rect>` bars whose `y` and `height` are redrawn from a state object by a `draw()` function, so labels and bars come from the same number. Gridlines, axis labels and name chips are visible from the first frame of the chart scene; bars rise within a second. At the payoff show both final values, large, with the gap as a tag.

`helpers.md` has `scene`, `person` with its ticker, the caption plate, `transition`, the arc toss and the word-time lookup.

## Full frame around the caption band

vfrey draws the captions in a band (`--vf-caption-at`, `--vf-caption-h`; centred near 70% of a 9:16 frame when the position is bottom). Compose the whole frame around it:

| Zone (9:16) | What goes there |
| --- | --- |
| top 10% | sky shapes only (clouds, dots); platform UI covers it |
| next 5% | optional ink chip with the assumption or the scene's headline fact |
| down to the caption band | hero art, large: a figure drawn at scale 1.3 to 1.45 (about a third of the frame height), props at 1.2, badges 300 to 380 across. Feet and bar baselines sit on the floor line, just above the band |
| the caption band | a solid ink plate with the captions on it, the same plate in every scene |
| below the band to the bottom edge | the floor carries on with its texture, plus foreground props at both corners, partly off the edge. Keep the bottom-right corner free for the `AI-GENERATED` label |

- Captions always sit on the plate, never over a character, a prop or a chart. Nothing that matters is behind or under the plate: end art above it, and move a chart's baseline up so its name chips clear it.
- Subjects are large and the foreground runs to the bottom edge. No patch wider than about a fifth of the frame is one flat colour: fill sides with circles and clouds.
- Read the band from `vfrey.captionBox` (see `helpers.md`) rather than typing pixel numbers, so the layout follows the person's caption position. If it is `top` or `middle`, the plate moves there: shift the chip and hero zones to keep it clear.
- Captions: `style: "box"`, white on the ink plate, the spoken word on a value-colour chip, at most 3 words, one size throughout. Set the same `captions.style` in the script, because the script overrides the scene. The plate fades in and out with the words.

## Motion rules

- GSAP moves only outer `<g>` groups that have no `transform` attribute; put the position on a parent `<g transform>`. Pops are `from {scale: 0, svgOrigin: "x y", ease: "back.out(1.8)"}`.
- One ticker redraws everything attribute-driven as a pure function of time: `vfrey.onFrame((t) => ambient.forEach((f) => f(t)))`. A render seeks with events suppressed, so a tween callback never runs in the film: put every `draw` in `vfrey.onFrame(draw)` (`helpers.md` also shows the live-preview twin tween). Idle life comes from it: head bob, arm sway, a blink every 3.4 s, cloud drift, twinkles.
- Characters act on cue by tweening `pose`: an arm swings as the coin leaves, a hop on the win, a frown on the loss.
- Object arcs use a proxy `u` from 0 to 1: `y = lerp(a, b, u) - 4 * h * u * (1 - u)`, spin with `scaleX = cos(u * 14)`, land with `bounce.out`. One element per object in the air.
- Camera is a CSS transform on `.cam`: scale 1.0 to 1.1 across the scene with a small pan, background SVG drifting the other way.
- Anchor every change to a spoken word found by text, never by index (the script will change). Entrances start 0.2 s before their word, the subject is on screen within 0.3 s of a line starting, the payoff holds 1.5 s or more and the last picture holds to the end.

## Transitions

One kind only: a shape grows into the next ground. Each seam has two full-frame layers, a coloured rim and the next scene, both clipped; tween `clipPath` on the rim, then on the scene 0.1 s later, 0.6 s, `power2.inOut`. Start 0.45 s before the next line's first word so it is done as the word begins. Three shapes to rotate: a circle from a point, a rounded square from the centre, a rise from the floor. Never hold a badge half-cropped at the end of a wipe.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a bed for this look (a light 96 bpm loop) plus accents: `whoosh` on each wipe, `ting` when an object lands, `pop` for a badge, `thud` for a stamp, `glide` as a bar grows, `chime` at the payoff. It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with the accents (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-flat-2d/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey 2D flat style)", "volume": -17, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. An even sample can land inside a wipe; also check stills at the beat times (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: is the subject large, does the floor and foreground reach the bottom edge, are captions on the plate and off every prop, is the plate in the same place?
3. Do neighbouring tiles have different ground colours, and is there a character or the value object in each?
4. Are all numbers on screen the computed ones, with the assumption chip visible?
5. Read the run's checks; fix what they name. `frames.text-overlap` can fire for text in stacked scene layers that are clipped away: confirm on a still before changing anything.

## Pitfalls

- A `captions.style` in the script beats the scene's: set both to `box`.
- Do not tween `polygon()` clip paths between degenerate point sets: nothing renders. Use `circle()` and `inset()`.
- A `tl.from` offset smaller than the object leaves it half visible: slide in from at least its own height away.
- Label pills collide with arcs: keep arcs below label plates, or draw the flying object above them.
- A still (`--frame`) or a render of attribute-driven art is only right when `vfrey.onFrame` repaints it.
- Gradients, drop shadows and outlines on characters break the look faster than anything else.
