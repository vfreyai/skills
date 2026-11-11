---
name: vfrey-style-paper-cutout
description: "Use when the chosen video style is Paper cut-out (vfrey-style-paper-cutout), or the person asks for a paper, collage, cut-out, scrapbook, craft, stop-motion, storybook or 'ransom note letters' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: layered cut and torn paper with shadows between layers, parallax, jointed stop-motion puppets, cut-out letter titles, full-frame layout around the caption band, paper transitions and a generated music bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Paper cut-out
  style-summary: Scenes made of layered cut and torn paper, with puppets that move like stop-motion and titles of cut-out letters.
  style-best-for: history, folklore, true stories, explainers, children's topics, culture
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Paper cut-out

A collage of scissor-cut and torn paper in muted vintage colours: every shape has a pale cut edge, casts a soft shadow on the layer behind it, and slides against the others as the camera moves. Jointed paper puppets move on eights like stop-motion, and titles are built from letters cut out of different papers.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/`, HTML + SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. `papercut.js` next to this file is the toolkit you copy into the scene folder; `helpers.md` shows the page around it and a worked scene; the music script is `make-bed.py`.

## When to use it, when not

- Use it for stories with characters and places: history, folk tales, odd true events, biographies, how a custom began, a gentle explainer with a twist. It suits dry humour well.
- Not for data-heavy pieces (no precise charts), technology that should look sleek, anything needing fine detail or realism, or grim subjects where a playful craft look would be in poor taste. It is drawn for a tall 9:16 frame: for a wide frame re-plan the layers (the stage is 1080x1920, scaled to the frame's width).

## Plan before coding

1. Cast the puppets (one to three, about 300 units tall at scale 1) and give each a different pose for each beat: walk, idle, point, salute, droop, shrug. A pose is a few joint angles.
2. Plan 6 to 9 sheets (scenes), each a different ground colour, and name the transition into each: slide, fold or tear.
3. Give each scene its planes: sky, far hills, middle, ground, characters, near strata, foreground. Decide what the title or plate says; write only facts you can source.
4. Include one beat that is not a landscape: a map, a document, a scoreboard, a counter.
5. Script: 5 or 6 lines, 65 to 72 words for 40 seconds with the free Kokoro voice (about 1.9 words a second; Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause). A scene may span several sentences of one line, so cue from words as well as line starts.

## Palette and type

- Muted and flat, no gradients except the vignette: paper `#f4ecd8`, cream `#ecdfc0`, ochre `#c9923d`, gold `#dcae48`, brick `#b2523a`, rust `#8f402c`, teal `#5d8a86`, deep teal `#3f6664`, olive `#7f8752`, ink `#2d2a26`, browns `#7a5236` and `#4f3626`, evening pinks and plums `#d9a79b`, `#8d5a68`, `#6c4559`. One ground colour per scene, changed every scene. A brand colour (`brand.json`) joins as the accent in place of brick.
- Type from vfrey's fonts only: Titan One (letter chips), Baloo 2 (captions, small chips), Playfair Display 900 (an occasional serif chip).

## Drawing approach

- Every shape is a paper cut: polygons only, with the `.cut` edge (a 5 px pale stroke outside the fill). A scissor cut has few vertices (8 to 14) and straight sides with 5 to 15% jitter; a torn edge has many small steps and a pale strip showing 7 px above it (`ridge({torn: true})`).
- Each depth plane is its own SVG (`layer(sc, depth)`), so a CSS drop shadow falls between planes. Depths: sky 0.05, far hills 0.25, middle 0.5, ground 0.9, characters 1.0, near strata 1.2, foreground 1.55 to 1.7. Text sits on a fixed layer the camera does not move.
- Puppets: a joint is a static `<g transform="translate">` with an inner `<g>` that GSAP rotates about its own origin (`J`). Draw each piece around its joint and nest them (hip, knee, foot; shoulder, elbow; neck, head, hat). Never tween a node that carries a `transform` attribute.
- Titles: `ransom()` puts each letter on its own scrap (a seeded paper colour, font, tilt of up to 4.5 degrees, a slightly crooked clip). Labels sit on `plate()`, a torn rectangle tilted 2 to 6 degrees.
- Paper grain is two still noise filters multiplied over the stage, with a soft vignette. It must not move: moving grain bands badly when compressed.

## Full frame around the caption band

vfrey draws the captions in a band (`--vf-caption-at`, `--vf-caption-h`; centred near 70% of a 9:16 frame when the position is bottom). Compose the whole sheet around it:

- Hero zone, from under the top margin to the band: the title, the sun, the puppets. Subjects are large: a puppet at scale 1.4 to 1.8 (a quarter of the frame height or more), a title that spans 80% of the width.
- The ground line sits just above the band, so puppets stand on it and nothing that matters is behind the captions.
- Captions are on a plate: a torn cream paper strip with a drop shadow, dark ink words and the spoken word on a brick chip, tilted one degree, in the same place all through. Captions never sit over a puppet, a title or a prop.
- Below the band the foreground carries on to the bottom edge: `fore()` adds two torn strata with rocks, grass tufts and an optional fence, nearer than the characters so they slide faster. No scene ends in a flat band of colour. Keep the bottom-right corner clear for the `AI-GENERATED` label.
- Read the band from `vfrey.captionBox` (see `helpers.md`) so the ground line follows the person's caption position.

## Motion rules

- Stop-motion, not tweening: `steps(t0, t1, fps, fn)` sets joint angles 6 to 8 times a second. Travel uses a stepped ease (`STEP(dur)`) so the body hops with the legs. Each step adds a degree of seeded rotation and a pixel of jitter.
- Pops are two frames: set scale 1.3, then 1 a tenth of a second later. Letter chips pop on 0.03 to 0.05 s apart, never slower than the speech.
- Camera: `cam()` moves every plane by its depth: a 4 to 7% zoom and a 70 to 170 unit pan per scene, `sine.inOut`. Clouds drift on their own with a stepped ease.
- The subject is on screen within 0.3 s of a scene starting: place walkers mid-stride at their start, not off screen.
- One pose loop per puppet at a time: end the idle at the moment the next pose starts, or the two step grids interleave and flicker.
- Cue from `vfrey.line(i)` and spoken words, never fixed seconds. The last picture holds 1.5 s.

## Transitions

Paper only, 0.82 s, started about 0.62 s before the beat. Slide: the new sheet comes in from a side or the bottom with a slight tilt that settles, the old one drifts and dims. Fold: the old sheet folds away from its top edge. Tear: the new sheet is revealed from the bottom behind a jagged torn edge with a pale band riding it. Rotate the three; each sheet casts a shadow on the one beneath.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a plucked-string storybook loop for this look, plus paper sounds: `slide`, `fold` and `tear` for the transitions and `thump` for a pop. It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with one sound per transition, at the transition's start (the format is at the top of `make-bed.py`; times are lines or words, the same anchors the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-paper-cutout/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey paper cut-out style)", "volume": -18, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no paper sounds before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. An even sample can land inside a transition; also check stills at the beat times (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: a large subject, paper strata down to the bottom edge, captions on their strip and clear of puppets and titles.
3. Does every scene have a different ground colour, and does each shape show its pale cut edge and a shadow?
4. Do letter chips fit their box (no wrapped or overlapping letters)? Is anything visible before its cue?
5. Watch a puppet through one scene: no flicker between two poses, feet on the ground line.

## Pitfalls

- Chips wider than their box wrap and collide: a letter is about 0.96 em wide, so keep `letters * 0.96 * size` under the width.
- A `fromTo` with `autoAlpha: 1` shows its element from time 0: use `tl.set` then `.to`.
- An `H("div")` made without a class is absolutely positioned by the toolkit; one with a class needs its own CSS.
- Word matches must be anchored and case-insensitive (`/^one/i`): "anyone" contains "one".
- SVG filters on moving nodes re-rasterise every frame: keep rough edges as polygons, and filters for the still grain only.
- About ten thousand `tl.set` calls render fine but take a couple of minutes; give crowd extras only legs and a bob.
- The still grain makes a heavy master file; that is expected (the `frames.bitrate` warning may show). Never animate the grain to fix it.
