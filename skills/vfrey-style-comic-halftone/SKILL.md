---
name: vfrey-style-comic-halftone
description: "Use when the chosen video style is Comic halftone (vfrey-style-comic-halftone), or the person asks for a comic book, pop art, halftone, speed-lines or 'panels that smash in' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: ink-outlined panels, halftone dots, off-register print colour, speed lines, impact bursts, hand-lettered sound effects, full-frame layout around the caption band and a generated punchy music bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Comic halftone
  style-summary: A comic page that comes alive, with bold ink outlines, dotted shading, panels that smash in and loud sound-effect lettering.
  style-best-for: animal facts, science and how-it-works, sports and action, gaming, product demos, trivia
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Comic halftone

A comic-book page that moves: every object has a thick ink outline with its colour printed slightly off register, shading is rows of dots, and the whole page is shoved out and replaced by new panels that slam in from the edges. Big hand-lettered sound effects, impact bursts and speed lines punch up each beat, and one moment gets a slow-motion freeze.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. `comic.js` next to this file is the toolkit you copy into the scene folder; `helpers.md` next to this file shows the page around it and the choreography patterns; the music script is `make-bed.py` next to this file. Original characters only: never a known comic character, logo or trade dress.

## When to use it, when not

- Use it for subjects with a punchline or a force in them: animal facts, how something works, a record, a sports or game moment, a product that does one striking thing, trivia, a myth that gets busted.
- Not for solemn, sad or moody subjects, for long detailed explanations (panels carry a few words each), or for realism. Dense tables and fine charts do not survive the dots; a gauge, a counter or a bar does.

## Plan before coding

1. Pick the hero: one original character or object drawn from rounded rects and ellipses, and the thing it acts on. Plan one hero beat (the strike, the reveal, the number) that gets the slow-motion freeze.
2. Split the script into 5 to 8 pages. A page is one or two big panels above the caption plate and one to three smaller ones below it. Give each page its own ground colour (cyan, yellow, red, navy, magenta) so the film has chapters. Plan at least one gauge, counter or trace for a number.
3. For each page write its sound word (`ZIP!`, `KRAK!`, `DING!`: short, invented, in capitals) and at most two label boxes of 4 words.
4. Numbers and claims: only what you can cite. A diagram that is not data (a spike drawing, a metaphor dial) is labelled as an illustration or carries no figures.
5. Script pace: 6 lines for 35 seconds. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; sound effects can fill the gaps. The voice is the person's setting: suggest a voice, never switch it.

## Palette and type

- Print inks only: ink `#16111C` (all outlines, shadows, small dots), paper `#F4E7C5`, red `#E8272F`, yellow `#FFD11A`, cyan `#18B2E8`, blue `#1658C6`, navy `#0F2F7C`, magenta `#E8368F`, orange `#FF8A1F`, white `#FFFBEF`. The hero may add one accent hue and a darker tone for its dots. `brand.json` colours replace yellow or red, not the ink.
- Flat fills only. Shading and gradients are dots (`ht`, or a pattern clipped into the shape), never a CSS or SVG gradient.
- Type: Titan One for sound effects and big numbers, Baloo 2 800 in capitals for label boxes and captions. No third face. Set SVG `font-family` through CSS classes (`text.bl`).

## Drawing approach

- `P(d, fill, {sw, off, shade})` draws a shape: fill shifted 5 by 4 units (off register) under an un-shifted ink outline of width 7, with an optional halftone pattern clipped to the shape. Use it for every object. This one helper is the look.
- Dots: pattern tiles (`dk`, `dkW`, `dkR`, `dkO`, `dkB`) in `defs()`, rotated 15 to 45 degrees; and `ht(w, h, spacing, angle, rMax, fn)` for gradients, one `<path>` of circles whose radius follows `fn(x, y)` (a sky that darkens, a glow behind the hero). Spacing 16 to 26, `rMax` about 0.6 of spacing.
- `burst` is a jagged star with an ink offset copy, a yellow outer, a red inner and the number or word on top. `sfx` is the lettering: per-letter jitter and rotation, an ink extrusion, off-register colour, white dots on top, `skewX(-7)`. `box` is a hard-shadowed label. `speedRadial` (rays from a focus point) and `streaks` (trails behind something fast) carry speed.
- Characters: rounded rects and ellipses through `P`; joints are nested groups whose `transform` the ticker sets each frame. Fast limbs get three pale ghost copies posed 0.045, 0.09 and 0.135 s earlier (`wireLimb`): that is the smear.
- Every panel is `div > svg` with a slightly slanted clip polygon, a 13 unit ink border and a hard shadow. Fill it edge to edge: ground, dots, subject at 40% of the panel width or more. A hero wider than its panel looks better cropped by the edge than shrunk.
- Print texture on top: a 256 px seeded paper tile (`paperUrl`) and a 9 unit ink dot grid, both on `mix-blend-mode: multiply`, both faint.

## Full frame around the caption band

vfrey draws the captions in a band (`--vf-caption-at`, `--vf-caption-h`; centred near 70% of a 9:16 frame when the position is bottom). A comic page uses it as a caption box:

- Captions sit on a plate: a yellow comic caption box with an ink border and red dot texture, `#capplate`, sized by `--vf-caption-at` and `--vf-caption-h` and rotated -0.5 degrees. It is the same place for the whole film, and panels come around it: `ROW_A` above it and `ROW_B` below it to the bottom edge, both read from `vfrey.captionBox` in `comic.js`. Numbers here are for 9:16.
- Subjects are large: the hero fills most of its panel and the world (water, ground, dots, rays) continues to the bottom edge through the lower row. Nothing is a flat empty panel.
- Captions never sit over a subject or a prop: text and lettering go in the upper part of each panel, away from the plate and its shadow.
- Keep the bottom-right corner clear for the `AI-GENERATED` label: in the lowest panel use ornament only there, no text or numbers. Keep text out of the top 200 units, where platform UI sits.
- Captions: `vfrey.captions("#captions", { style: "box", ... maxWords: 3 })` in ink on the plate, the spoken word on a red chip, uppercase through CSS. Set the same `captions.style` (`box`) in the script, because the script's setting beats the scene's. If the caption position is `top` or `middle`, the plate moves and `ROW_A` shrinks or vanishes: the lower row takes the space.

## Motion rules

- Panels slam in from the edges: `back.out(1.25)`, 0.36 s, 0.06 s stagger, a small tilt that settles; the old page is shoved out the opposite way (`power3.in`, 0.28 s) from 0.06 s after the new one starts. `slam` moves each panel by its own size plus the frame (about 2200 px for a tall panel in the 1080 x 1920 frame), so a page that leaves is fully off screen; never hard-code a shorter distance. The camera gives one jolt 0.34 s after arrival.
- Sound words and bursts pop on their spoken word: scale from 0 and rotation -14 to 0, `back.out(2.2)`, 0.3 s. Anchor every event to a word found by text (`anchors`), never to seconds or an index.
- Impacts: a white flash (`set`, then `to`), a decaying shake on the panel's `sk-` group, a shove on the subject, shards flying slowly. The slow push-in lives on a separate `in-` group.
- The hero moment: an ease-in approach over about 1.2 s with the camera pushing in and radial speed lines fading up, then a freeze on the hit (burst, lettering, shards, a small `SLOW-MO` tag) for about 2.4 s.
- One ticker (`vfrey.onFrame`, never a tween's `onUpdate`, which does not fire when a render seeks) redraws everything attribute-driven (limbs, feelers, gauges, counters) from time, so seeking is deterministic. Randomness is seeded only. Counters and needles end with about 1.8 degrees of jitter.

## Transitions

One kind: the conveyor slam above (the entry side alternates left, right, top, bottom from panel to panel), plus a white flash on each impact. Never fade, never dissolve.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a bed for this look (126 bpm: drums, a saw bass riff, off-beat stabs, a pulse lead over Am F G E7) plus cue sounds: `whoosh` on a page change, `pop` for a burst or label, `zip` and `thwack` (or `hit`) for a strike, `slam` for the big impact, `boom`, `bell`, `tick`, `blip`, `riser`; `thin` makes the bed sparser under an explanation and `build` is a riser and snare roll, then a 0.4 s drop-out and a slam. It needs only `python3` (standard library, no downloads, no ffmpeg) and always writes the same file for the same input. Accents are mixed hotter than the music because vfrey ducks the bed under the voice.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-comic-halftone/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey comic halftone style)", "volume": -14, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. An even sample can land inside a slam; also check stills at the beat times (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: ink outline and dots on every object, a large subject, panels reaching the bottom edge, captions on the plate and clear of every panel's content.
3. Do neighbouring pages have different ground colours? Is there a sound word or a burst in each page? Does any panel show a blank patch wider than a fifth of the frame?
4. Is the bottom-right corner free of text, and is the top 200 units free of text?
5. Read the run's checks. `frames.bitrate` warns when the grain is too strong; `frames.text-overlap` can fire on the style's own stacked sound-effect letters (`sfx` draws the same word four times, so one word overlapping itself is the style). Confirm on a still: an old page still inside the frame is the bug, and then check that every `slam` entry side is used with the panel's real position.

## Pitfalls

- `tl.fromTo` on a shared element (the flash overlay) applies its FROM state at build and leaves it lit: use `set` then `to`.
- Never put a `transform` attribute on a group GSAP animates; wrap it in a parent `<g>` that carries the position.
- Paper grain at opacity 0.4 over the halftone made a 53 MB, 12.6 Mbps file and a `frames.bitrate` warning (the video still finishes, and platforms re-encode it). Keep the grain at about 0.25 or lower and the dot grid at 0.06; grain changes every pixel, so it must stay faint.
- Preview stills made before the first full render use estimated word times: re-check after the voice exists.
- Text placed in the lower right of the lowest row collides with the `AI-GENERATED` label: keep text in the upper 70% of the lower row.
- A panel with its slow push-in and its shake on one group fights itself: two groups, `sk-` outside `in-`.
- A machine low on disk fails the render with "Low disk space" part way: free space and run it again.
