---
name: vfrey-style-one-line
description: "Use when the chosen video style is One-line minimal (vfrey-style-one-line), or the person asks for a single-line, continuous-line, minimal, quiet, gallery-print or 'one pen stroke' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: one unbroken ink line on warm paper that draws an object then travels on to become the next, a single accent dot at its tip, full-frame layout around the caption band, the connector line as the only transition and a generated music bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: One-line minimal
  style-summary: One unbroken ink line draws each idea in turn on warm paper, then flows on into the next. Calm and hypnotic.
  style-best-for: psychology, self-improvement, philosophy, wellness, productivity, ideas and feelings
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: One-line minimal

One continuous ink line, never lifted, draws an object, keeps travelling and becomes the next one, while a small red dot rides its tip and the camera drifts after it. The ground is plain warm paper and quiet is the design.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + one inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for ideas, feelings and habits that can be drawn as 4 to 6 simple objects in a chain (a head, a clock, a list, a tangle, a pen): psychology, self-help, philosophy, wellness, a "one trick" explainer.
- Not for anything with numbers to compare, charts, real places or faces, or a loud or funny tone. If the script cannot be told as a sequence of simple pictures, pick another style.

## Plan before coding

1. Turn the script into a chain of 4 to 6 objects, one per idea, in the order spoken. Choose shapes that start at the top and end at the bottom, so the line can leave one and enter the next without lifting: a head ends at the neck, a clock is drawn hands first and the rim last, a list is one zig-zag pass.
2. Pick one "mess" object (a scribble or tangle) for the problem and let the last objects calm it: the line untangles into one straight stroke. A morph is better than a new object.
3. Write each object's cue as a spoken word or line start, never a second. Put 3 to 6 words on the page at most (a year, a one-word label), each fading in on its word.
4. Facts on screen are only ones you can cite, as the voice says them. Pace for the voice: about 2 words a second, and Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause (5 or 6 lines for about 35 s, about 85 words); join clauses with commas or semicolons where one breath is meant.

## Palette and type

- Paper `#F3ECDF` with a soft light in the centre (`rgba(255,252,244,.75)`), warm vignette edges and a multiplied grain at opacity .5. Ink `#1C1A17`. One accent, vermilion `#D8472B` for the dot (and `#C23A1E` for the caption highlight word). Nothing else: no second hue, no fills.
- Playfair Display (bundled with vfrey): italic 400 for labels, figure notes and the end title, 500 for captions. Few words, large.

## Drawing approach

1. Build ONE array of points with helpers (`addLine`, `addBez`, `addCR` for organic outlines, `addArc`, `addWave` for a handwriting wobble, `connect` for the swoop between objects). `mark("name")` after each object.
2. Resample the whole path to even 4-unit steps by arc length and turn the marks into indices. Even spacing makes the tip speed predictable and everything index-based.
3. Draw by index: the path `d` runs from point 0 to the tip. Stroke width 5, round caps and joins, `vector-effect: non-scaling-stroke` so the line stays 5 px at any zoom. Never use dasharray.
4. Morph by making an object a function of time: a tangle is a chord plus a Lissajous wobble, and untying lerps each point to its chord point, starting at the end the pen holds. Scribbles tremble a few units until the idea resolves.
5. The dot is a circle at the tip, radius 15 divided by the zoom (constant on screen), with a pulsing halo at .22 opacity.
6. Keep shapes bold and simple. Fine detail vanishes at the pull-back. Objects are large: a head or box spans at least 55% of the frame width.

`helpers.md` has the page shell, the geometry helpers, the tip schedule, the camera, `render(t)`, labels, figure notes and the caption plate.

## Full frame around the caption band

This style keeps vfrey's captions ON, minimal: script `"captions": {"position": "bottom", "style": "color"}`, the scene's `vfrey.captions(...)` with the same style and `maxWords: 3`, serif on a paper plate with two ink hairlines. The same style goes in both, because the script wins over the scene. The `.srt` and `.vtt` are written whatever you choose. If the person says "no captions" and sets `"captions": "off"`, vfrey draws no spoken-word text: also hide the plate, keep the figure notes and the on-page words, and say that a viewer with the sound off then gets only those.

The band is at `--vf-caption-at` (height `--vf-caption-h`, read in the scene from `vfrey.captionBox`). Captions sit on a plate that fills the band, in the same place all film, and never over the line, a label or the dot. Show the plate only while words show.

| Zone (9:16) | What goes there |
| --- | --- |
| top 3% | border and nothing else; platform UI covers it |
| above the band | the line, large, centred half way between the top and the band; camera keeps the tip there. Plain paper is a choice: about half of this zone is bare, but never a whole third |
| the caption band | the paper plate and the caption words, always the same |
| below the band to the bottom edge | print marginalia: a thin inner border to the bottom edge, a rail with one tick per beat and a red dot at the line's progress, an italic figure note for each beat. This keeps the lower frame composed. Keep the bottom-right corner clear for the `AI-GENERATED` label |

- The line itself is a tall world: objects sit about 1300 units apart, so while it travels the line crosses the whole frame (it enters from the top edge and leaves through it), and the end pull-back shows it all from the top down to the band.
- Empty is the design, but the picture must not look unfinished: the first object appears by 0.5 s and is large, the gap between a finished object and the band is under a quarter of the frame, and the lower frame always carries the rail and note, so it is never blank. In the pull-back use a zoom of about .3 so the line fills the frame instead of floating small in the top half.
- Read the band from `vfrey.captionBox` and place the art and marginalia from it (see `helpers.md`), not from typed pixel numbers. If the person puts captions at `top` or `middle`, the plate moves there: re-centre the line in the free part.

## Motion rules

- Everything is a pure function of timeline time: one proxy tween `tl.to(proxy, {t: DUR, ease: "none", modifiers: {t: v => { render(+v); return v; }}})`. Use modifiers, not onUpdate (a seek skips callbacks). Seeded random only; here there is none.
- Tip speed: drawing uses a sine in-out, connectors a cubic in-out. Segments are `{t0, t1, i0, i1, ease}` keyed to words found by regex.
- Camera: keyframes `[t, x, y, z]`, hold between equal keys, cubic in-out between. The zoom dips 20% mid-travel, the camera leans 16% toward the tip while drawing and breathes about 1%. Finish with one long pull-back.
- Nothing bounces, pops or spins. The calm is the point.

## Transitions

No cuts and no wipes. The connector line is the transition: it leaves the old object, the camera glides and dips in zoom, and the new object starts drawing as its line begins. The old object stays on the page, part of the final print. The end card is a big italic title fading in under the pull-back.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a bed for this look: a slow warm pad (Am9, Fmaj7, Cmaj7, Gadd9) with a `bell` pluck as each object arrives, `scratch` while a pen draws, `rise` (a climbing run) while something loosens, `open` (one unresolved note) and `resolve` (a low note and a high bell) for the end. It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-one-line/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey one-line style)", "volume": -16, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the pad with no sounds before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. An even sample can land mid-connector; also check stills at the beat times (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: is the object large, is the line one unbroken stroke with the dot on its tip, are captions on the plate and clear of the line, is the plate in the same place, does the rail and note carry the lower frame to the bottom edge?
3. Is the line really one path? Look for any gap or second stroke at a join between objects.
4. Check the pull-back still: the whole line fills the frame down to the band, and the end title sits clear of the plate.
5. Read the run's checks. `frames.opening` can warn (a calm first frame differs little from the next) because calm paper is the design: start with the scribble already drawing, or accept it.

## Pitfalls

- `tick` needs `--scene scenes/<idea>` or it renders the plain default template.
- A `captions.style` in the script beats the scene's: set both to `color`.
- `vector-effect: non-scaling-stroke` makes dash lengths ignore zoom: draw by index, not dasharray.
- Keep the tip out of the caption band: the camera lean keeps it near a third of the frame height, and the plate is opaque anyway.
- A pull-back at a small zoom leaves the picture in the top half with bare paper below: raise the zoom or move its centre down.
- Do not add colour, shadows, fills or a second line. One hue (the dot) is the whole accent.
- Long unbroken drawing (a slow clock) loses people: draw each object in 2 to 4 s, or let the line trembling or morph carry the time.
