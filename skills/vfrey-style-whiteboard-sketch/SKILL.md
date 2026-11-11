---
name: vfrey-style-whiteboard-sketch
description: "Use when the chosen video style is Whiteboard sketch (vfrey-style-whiteboard-sketch), or the person asks for a whiteboard, marker, hand-drawn, doodle, sketch-note or 'drawn live' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: stroke-by-stroke marker drawing, a single-stroke hand-lettering kit, doodle people and charts, a sticky-note caption plate, page flicks and eraser wipes, and a generated marker-and-marimba bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Whiteboard sketch
  style-summary: A marker draws everything live on a whiteboard, with hand lettering, doodles, arrows and eraser wipes.
  style-best-for: study tips, explainers, how-it-works, finance basics, science and health facts, productivity
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Whiteboard sketch

An off-white board where a marker draws every picture, label and chart on screen, stroke by stroke, with a wobbly hand and a visible pen. Ideas change by a page flick or an eraser wipe, and the captions are written on a sticky note in the same hand.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the drawing kit is `sketch.js` next to this file (copy it into the scene folder); the sound script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for explanations that can be drawn as a few nouns and a diagram: study and productivity tips, how-it-works, money basics, science and health facts, a process, a before and after.
- Not for moody or atmospheric stories, products or places that need realism, or fast montage. Not for a script in a language outside the Latin alphabet: the lettering is drawn from a letter table that only has `A` to `Z`, `0` to `9` and a few marks (see `helpers.md`), so use another style, or extend the table.

## Plan before coding

1. Split the script into 4 to 6 scenes, one idea each, and name the one drawable noun per phrase: a person, a chart, a calendar, a book, a clock. Plan a big idea in the top zone and a supporting strip in the lower zone of each scene.
2. Give each ink colour a job and keep it all film: red for the problem, blue for the fix and labels, black for structure.
3. Decide which scene is the chart (axes, one curve, two or three labels) and what the last picture is (the takeaway in big lettering).
4. Facts: only things you can cite go on screen. A chart is a sketch with no invented numbers; label the axes in words.
5. Script pace: 5 lines, about 70 words, 35 seconds. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. The voice also pauses after each full stop inside a line, so keep a full stop only where a page flick or a wipe should fall. The voice is the person's setting: suggest a friendly one (`af_heart`), never switch it.

## Palette and type

- Board `#f4f2ea` with a radial lift (`#fbfaf5` to `#e6e3d8`), faint grey smudges and a few ghost words of old writing. Ink: black `#23232b`, blue `#2458d6`, red `#d8392b`. Three markers, nothing else. Sticky note `#fff1a8`. If the brand has an accent (`brand.json`), it replaces the blue.
- Type: none. There is no `<text>` and no font: all lettering is single-stroke paths from `sketch.js`, capitals only. Cap height 40 to 60 for labels, 70 to 150 for hero words, stroke width about `0.085` of the height.

## Drawing approach

- Nothing is a perfect shape. Every stroke is a list of points from `LN`, `PL`, `CR`, `ELL`, `RECT`, `STAR`, `ARROW` and `HATCH`, each of which ends in `wob` (smooth noise along the normal, seeded). `ink` turns a list into a thin-ended, pressure-wobbled marker polygon revealed by a mask whose dash offset is tweened, so it draws itself on. One roughness filter on every ink group makes the edges ragged.
- Lay out in time with `build(layer, items, t0, t1)`: it fits all strokes into the window from one spoken word to the next. Windows come from word times found by text, never by index.
- Fills are never flat: hatch with `HATCH` in blue or red. People are a round head, spiky hair as a zigzag, a few curves for the face and shoulders, outline plus hatch for clothes: faces stay at 6 to 10 strokes. Props (desk, books, mug, clock, calendar, thought bubble) are rectangles, ovals and a few curves.
- Words are written with `TI`, so a label draws on like any doodle. A blank letter means the character is missing from the table: strip accents first and add any other glyph yourself (`helpers.md`).
- A marker pen follows the stroke being drawn (`penUpdate`, in `helpers.md`): it glides between strokes, lifts, and fades when idle. Caption strokes are not registered, so the pen never writes them.

## Full frame around the caption band

vfrey draws captions in a band (`--vf-caption-at`, `--vf-caption-h`; centred near 70% of a 9:16 frame when the position is bottom). This style writes its own captions, so it reads that band from `vfrey.captionBox` and puts the note there (code in `helpers.md`). Numbers are for 9:16.

- Zones: the main art above the note, a second strip below it (timelines, legends, a hero word) down to the tray at the bottom. Never draw below y 1720, and never place art from a typed pixel row: derive it from the band. If the position is `top` or `middle`, the note moves and the zones swap or shrink.
- Subjects are large: a person or a chart fills a third to half of the frame. Each scene fills both zones, so the board is never more than a third empty, even mid-draw.
- The board continues to the bottom edge: the second strip, then the marker tray along the bottom. Captions sit on a plate, the sticky note, with the same position and size all through, and never over a doodle, a label or a chart. Keep the bottom-right corner clear for the `AI-GENERATED` label (the tray's markers lie on the left).
- Captions: groups of at most 3 words and 15 characters, broken after `. , ? !`, written on at each word's start. Do not call `vfrey.captions`. They must still obey the setting: if `vfrey.timing.captions.mode` is `"off"`, draw no note and no words (a person asking for no captions sets `"captions": "off"` in the script). SRT and VTT are written either way.

## Motion rules

- The marker line is the main motion: `power1.inOut`, each stroke 0.05 to 1.3 seconds. Other motion is secondary: things that appear (a thought bubble's contents, a "poof" of radial strokes) fade in; the pen glides and lifts.
- One `#cam` wrapper holds every art layer, the eraser and the pen; captions and frame sit outside it. Camera `transformOrigin` on the note, scale 1.0 to 1.08 in slow `sine.inOut` legs, back to 1 at each scene change, a small x drift.
- Every beat starts when its word is spoken, and something is drawn within 0.3 s of a line starting. The first 0.3 s needs a long line (a desk, an axis) so the opening frame is not blank.
- Everything is a pure function of timeline time with seeded random: never `Math.random()`.

## Transitions

Two kinds, alternated, each with a cause. A page flick: the old layer, with a drop shadow, whips up and off (`y -2250`, `rotation -5`, 0.55 s, `power2.in`) over the next one. An eraser wipe: a slanted clip edge crosses the old layer in 0.6 to 0.8 s while a felt eraser scrubs up and down six times along it. Never a hard cut. Put them in the natural pause between lines; start 0.38 s before the next idea's first word. Hide each old layer (`display: none`) afterwards.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a bed for this look (a gentle 84 bpm loop: soft pad, marimba plucks, brushed shaker) with `scribble` under drawing, `flick` for a page flick, `rub` for an eraser wipe, `chime` when an idea lands, `thunk` for a gone or counted thing and `finale` (a rising four-note chime) for the last word. It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with the sounds (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-whiteboard-sketch/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey whiteboard sketch style)", "volume": -12, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no sounds before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Mid-draw frames are normal, so also check stills at the end of each scene's drawing (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In the finished stills: no stray dots before a stroke (the dash gap in the mask is far longer than the path), no label crossing a curve, nothing cut by the tray or the frame edge.
3. Is every word of lettering readable and complete? A gap in a word means a character missing from the glyph table.
4. Are the zones full and the note in the same place in every tile, with nothing behind it that matters? Is each ink colour doing its one job?
5. Read the run's checks; a `frames.opening` warning means the first strokes cover too little of the frame: start with a long hatched shape.

## Pitfalls

- A dash gap that is small shows a second dash at the end of the path, and dust specks before the stroke starts. Use `len + 10` on, `2 * len + 300` off, as `ink` does.
- Camera zoom pushes lower art under the tray: keep art above y 1720 and zoom about an origin near the note.
- Lay out label boxes before drawing, so a title does not collide with a curve or a callout.
- Too many strokes in a short window: `build` clamps to 0.035 s a stroke and falls behind. Hatching is the most expensive, so draw it last in a window. Keep the whole film under about 700 strokes.
- A `captions.style` in the script has no effect on a scene that draws its own captions; the mode and position still do.
- `Math.random()`, wall-clock timers or `<text>` break the render or the look. Seeded `rnd()` and stroke paths only.
- Render cost is about 2 minutes for 34 seconds: hide layers that are off stage.
