---
name: vfrey-style-data-story
description: "Use when the chosen video style is Data story (vfrey-style-data-story), or the person asks for a data-journalism, infographic, 'the world in numbers' or 'charts and maps that build' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: warm paper ground, one red accent, dot-matrix maps and charts, dots that regroup into bars, big mono counters, leader-line labels, a scoreboard, full-frame layout around the caption band and a generated data-desk bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Data story
  style-summary: Animated maps and charts like a newspaper data desk, with counting numbers and dots that regroup into bars.
  style-best-for: geography, economics, population, science facts, history by the numbers, comparisons
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Data story

A warm paper ground, ink text and one red accent, with dot-matrix pictures that never cut: the same dots form a map, then regroup into a bar, then into rows. Big monospaced counters, thin rules and labels joined to the picture by leader lines make it read like a newspaper data desk.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + canvas + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` and `datadesk.js` next to this file; the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it when the point is "here is the scale of a thing": shares, counts, rankings, before and after, a place and its numbers.
- Not for stories with no numbers, moods, characters or how-tos. A subject with only one figure has nothing to regroup: pick another style.

## Plan before coding

1. Write the numbers down first, in a table: each value, its source (publisher, table, year) and whether it is rounded. Only numbers you can name a source for go on screen or in the voice. Drop a claim you cannot source.
2. Compute, never type: every number the scene shows (counters, bar lengths, dot counts, percentages) is calculated in the scene from those inputs. A figure you derive (a share, a total) is derived in code, and rounded the way its source rounds.
3. Mark what is not exact. A map drawn from simplified outlines, or dots placed in plausible spots, is schematic: say so on screen (a legend such as `1 DOT = <unit> · POSITIONS SCHEMATIC`) so the picture never implies precision it lacks. Print the sources in the footer.
4. Split the script into 3 or 4 chapters (one per line), each a camera move, a build or a morph of the same dots. Pick the hook picture (the whole thing drawn at once), the count, the comparison and the catch.
5. Script pace: Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. Write 4 to 6 lines (about 90 words for 37 seconds) and use the gaps for morphs; the caption plate fades out in silences longer than about 0.45 s, so a gap near that is where the plate blinks. The voice is the person's setting: suggest, never switch.

## Palette and type

- Paper `#F2EEE4` ground, ink `#15171C`, one accent `#E4432D` (tint `#EE9F89` for lit areas, light `#FF7358` for the spoken word on the plate), mute `#6B6556` for labels, rule `#CFC8B6`, dot grey `#A9A392`, dark dot `#23262D`. Never a second accent, never a gradient ground. A brand accent (`brand.json`) replaces the red.
- Type: Google Sans Flex 700 for the headline and captions; JetBrains Mono 500 for every label, counter and annotation. Nothing else, and mono stays at weight 500.
- Sizes on the 1080 x 1920 stage: headline 47, label caps 28 to 34 with 0.05em tracking, annotation tags 34, counters 84, hero tag 58. Nothing under 28 except the source footer (23). `text-wrap: balance` on the headline, which is `vfrey.script.title`, never typed.

## Drawing approach

- Everything visible is a pure function of one plain object `S`. GSAP tweens numbers on `S`; the timeline's own `onUpdate` and `vfrey.onFrame` (a render seeks with events suppressed, so `onFrame` is the one that matters) repaint a canvas and writes the DOM labels. Seeking is then exact and charts can morph.
- Top rail: a mono kicker, a progress rail of one segment per chapter filled by time, a 2-line headline and a 4 px ink rule.
- Hero canvas: the map or chart, filling the width (subjects 70 to 100% of it). Maps are dot matrices (dots on a grid wherever a point is inside a simplified outline), on a pale sphere or flat ground, with a graticule. See `helpers.md` for making your own outline data.
- People or unit dots: a fixed number with a category each. One layout function per chapter (stock, map, bar, rows); a number `S.L` moves every dot from one layout to the next, each with its own delay and a sideways bulge, so the swarm flows. A bar is a block of dots.
- Annotations: a leader line draws on from a small ink dot to a tag (paper plate, red left border). Hero tags are red mono on a 88% paper plate so they stay readable over dots.
- Scoreboard: three cells under the plate with a thick ink top rule, a mono label and a mono value. They start as grey dashes and fill with counters as each number is spoken.

## Full frame around the caption band

vfrey draws the captions in a band (`--vf-caption-at`, `--vf-caption-h`; centred near 70% of a 9:16 frame when the position is bottom). Compose the whole frame around it, reading `vfrey.captionBox` (see `helpers.md`) instead of typing pixel numbers:

- Top rail and headline above the hero; the hero is large and ends a little above the band.
- Captions sit on a plate: a solid ink rectangle with paper text and the spoken word in light red, at most 4 words, the same box all film. The plate fades out in silences longer than about 0.45 s. It is never over the map, a dot or a label.
- Below the band the frame keeps working to the bottom edge: the scoreboard cells repeat the key numbers, then the source footer. No empty paper strip.
- Bottom-right corner clear for the `AI-GENERATED` label: the footer is at most 610 wide on the left.
- If the position is `top` or `middle`, move the plate there and shift the hero and scoreboard to keep it clear. Numbers here are for 9:16.

## Motion rules

- Nothing idles: every beat has a camera move (a spin, a push-in), a build or a morph. The same dots and globe persist and change role.
- Ease by role: spins and camera `power2.inOut` or `power3.inOut`, labels `power3.out`, exits `power2.in`, counters `power2.out`, pours and regroups `none` (the stagger is in each dot's delay).
- Counters count while the number is spoken, starting 0.05 s before the word. Start a morph 0.25 s before the sentence it illustrates. Find words by text, never by index.
- The subject is on screen within 0.3 s of the film starting. The last picture holds its labels to the end.

## Transitions

None. This style never cuts: a chapter change is a morph of the same dots (globe to bar to rows to globe), a camera push or a spin, with labels fading out 0.3 s before it and in 0.4 s after. A leader line retracts with its label.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a calm data-desk bed (96 bpm: a sub pad, a plucked arpeggio, quiet ticks) plus accents: `whoosh` and `whoosh-down` for camera moves and morphs, `blip` when a shape or number lands, `count` (rising blips) under a pour of dots or a filling bar, `ticks` under a counting number. It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with the accents (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-data-story/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey Data story style)", "volume": -14, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. An even sample can land inside a morph; also check stills at the beat times (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. Every number on screen or spoken: can you name its source? Does the scene compute it from the inputs table? Is each schematic map, dot or position labelled as schematic on screen, and the sources in the footer?
3. In every tile: a large hero picture, captions on the plate and clear of the picture, scoreboard and footer reaching the bottom edge, one accent colour only, nothing in the bottom-right corner but the label.
4. Does any label overlap dots, a rule or another label, or hang off an edge? Wide labels are centred on their anchor; check the right edge at the widest string.
5. Read the run's checks. `frames.text-overlap` compares glyph boxes: leave 20 px or more between a label and its big value.

## Pitfalls

- A label block above a dot chart needs its full height (kicker plus value, about 110 px) clear of the first dot row; the renderer does not flag text over canvas dots.
- Call `draw` from `vfrey.onFrame` as well as the timeline's `onUpdate`, not from a clock tween: a clock tween runs before later tweens and paints stale state when seeking.
- A `captions.style` in the script beats the scene's: set both to `color`.
- Timing: the free voice's word times can be a second early after a line break, and inside a line they are spread by letters. If captions or counters drift from the voice, measure the real pauses (`ffmpeg -af silencedetect=n=-38dB:d=0.3`) and retime the words linearly inside each measured speech segment; re-measure after any script edit.
- Dots on a map show where land is, not people or density: do not colour them as data.
