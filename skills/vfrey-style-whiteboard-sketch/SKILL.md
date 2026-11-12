---
name: vfrey-style-whiteboard-sketch
description: "Use when the chosen video style is Whiteboard sketch (vfrey-style-whiteboard-sketch), or the person asks for a whiteboard, marker, hand-drawn, doodle, sketch-note or 'drawn live' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: stroke-by-stroke marker drawing, a single-stroke hand-lettering kit, doodle people and charts, a sticky-note caption plate, page flicks and eraser wipes, and a generated marker-and-marimba bed."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 2.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Whiteboard sketch
  style-summary: A marker draws everything live on a whiteboard, with hand lettering, doodles, arrows and eraser wipes.
  style-best-for: study tips, explainers, how-it-works, finance basics, science and health facts, productivity
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.
<!-- style-bible: v2 -->

# Video style: Whiteboard sketch

Start from `starter.html` next to this file: copy it to `scenes/<idea>/index.html` together with `sketch.js`, replace the placeholder art, labels and cues, and render a frame. Code to copy is in `helpers.md`; the drawing kit is `sketch.js`; the sound script is `make-bed.py`. This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours. The vfrey skill's `scenes/craft.md` still holds for everything not said here.

## Limits: when to use it, when not

- Use it for explanations that can be drawn as a few nouns and a diagram: study and productivity tips, how-it-works, money basics, science and health facts, a process, a before and after.
- Not for moody or atmospheric stories, products or places that need realism, or fast montage. Not for a script in a language outside the Latin alphabet: the lettering is drawn from a letter table that only has `A` to `Z`, `0` to `9` and a few marks (see `helpers.md`), so use another style, or extend the table.

## Plan before coding

1. Split the script into 4 to 6 scenes, one idea each, and name the one drawable noun per phrase: a person, a chart, a calendar, a book, a clock. Plan a big idea in the top zone and a supporting strip in the lower zone of each scene.
2. Give each ink colour a job and keep it all film: red for the problem, blue for the fix and labels, black for structure.
3. Decide which scene is the chart (axes, one curve, two or three labels) and what the last picture is (the takeaway in big lettering).
4. Facts: only things you can cite go on screen. A chart is a sketch with no invented numbers; label the axes in words.
5. Script pace: 5 lines, 35 seconds. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. The voice also pauses after each full stop inside a line, so keep a full stop only where a page flick or a wipe should fall. The voice is the person's setting: suggest a friendly one (`af_heart`), never switch it. Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 3 words a second.

## 1. The look in three sentences, and the signature traits

An off-white board where a marker draws every picture, label and chart on screen, stroke by stroke, with a wobbly human hand and a visible pen. Ideas change by a page flick or an eraser wipe, and the captions are written by hand on a sticky note. Nothing is typed, nothing is a perfect shape, and only three marker colours exist.

Signature traits (each checkable on a frame):
1. Off-white board `#f4f2ea` with a soft vignette, faint smudges and ghost writing; never a flat white.
2. Three markers only: black `#23232b`, blue `#2458d6`, red `#d8392b`, each with a job.
3. Variable-width strokes: thin at both ends, a pressure wobble, round ends, slightly ragged edges.
4. Shapes that do not close or are not square: ovals swept 370 degrees, rectangles with overshooting corners, bowed lines.
5. Hatched fills (a back-and-forth scribble at 13 to 26 px gaps), never a flat fill.
6. Hand lettering: capitals only, single-stroke, each letter slightly different in size, tilt and baseline.
7. Doodle people: a big round head, spiky or bald, closed lids or dot eyes, few lines; props are rectangles, ovals and curves.
8. A visible marker pen that writes, glides between strokes and lifts.
9. A pale-yellow sticky note with two tape strips carrying hand-written captions, same place all film.
10. An aluminium frame edge and a marker tray with markers at the bottom; the board's lower strip holds more art.
11. Arrows with a bow, circled words, underlines in red, labels beside things.
12. Page flick and eraser wipe as the only transitions; slow camera push on the board.

## 2. Palette

| Role | Hex | Use |
| --- | --- | --- |
| Board | `#f4f2ea` (vignette `#fbfaf5` centre to `#e6e3d8` edge) | ground |
| Black marker | `#23232b` | outlines, structure, labels, captions |
| Blue marker | `#2458d6` | the fix, labels, hatch fills |
| Red marker | `#d8392b` | emphasis, the problem, titles' underline |
| Sticky note | `#fff1a8` (fold `#e6d37f`, tape `#cfc9b4` at 60%) | caption plate |
| Frame | `#b4b7bf` edges, tray gradient `#c9ccd3` to `#8d919b`, tray lip `#6f737d` | aluminium |
| Smudges | grey at 5 to 11% opacity, 16 of them | worn board |
| Ghost words | grey, blurred, 10% opacity, 6 of them | old writing |

- Ratios: board 70 to 85% of a frame; black ink 8 to 15%; blue 3 to 8%; red 3 to 8%; the note 8 to 10%.
- Give each colour a job and keep it for the whole film (for example red = the problem, blue = the fix and labels, black = structure).
- A brand accent may replace blue or red, never add a fourth marker.
- Never: a fourth ink colour, fills without hatching, gradients inside drawings, drop shadows on drawings (only on the note and flicking page), typed fonts anywhere, photographs.

## 3. Shapes and line

- Stroke widths at 1080x1920: structure and outlines 7 to 9 px; labels about `0.085 * letterHeight` (4.5 to 12 px); hatch lines 4.5 to 6 px; hero underline 7 to 8 px; arrows 6 px; caption lettering `0.1 * h` (about 8 px at h 78).
- Variable width: `w * (0.62 + 0.38 * sin(pi u)^0.5) * (1 + 0.1 sin(len * 0.045))` (thin at the ends, pressure wobble), round caps.
- Wobble: every point list ends in `wob(points, amp)`, amplitude 1 to 1.5 px along the normal, three sines of different frequency with seeded phases.
- Shapes: `LN` bowed line with 0 to 7 px overshoot; `ELL` oval swept 370 degrees; `RECT` with 3 px corner jitter and overshoot; `HATCH(polygon, angle 0.5 to 1.2 rad, gap 13 to 26 px)`.
- Edge treatment: one SVG filter on the ink group: `feTurbulence fractalNoise baseFrequency .045 numOctaves 2` into `feDisplacementMap scale 3.4`.
- Texture recipes: 16 blurred smudges (opacity .05 to .11), 6 ghost words (blur, opacity .1), radial vignette on the board, two faint diagonal sheen polygons on the frame (white at 7%, blur 14).
- Light: soft top-left; only the note, the flicking page (`drop-shadow(0 34px 38px rgba(0,0,0,.38))`) and the pen (an ellipse at 14%) cast shadows.

## 4. Characters and objects

How a doodle person is built (6 to 10 strokes for a face, all through `ink`):
- Head: a big `ELL`, rx 120 to 140, ry 130 to 150, about a third of the figure's height (1:2.5 head to body).
- Hair: a zigzag `PL` of 8 to 10 points; a beard is a closed `CR` filled with black hatch; glasses are two small `ELL` plus a bridge line.
- Eyes: droopy lids as two short `CR` curves, or two dots; mouth a single `CR` (flat, smile or frown); hands are rarely drawn (behind a prop).
- Body: two `CR` shoulder curves and a torso outline; clothes are hatched in blue or red at 0.8 rad.
- Shading: hatch only, never a fill; the pen lifts between strokes.

Stock props (rectangles, ovals and a few curves), each as a few `I(...)` strokes:
1. Desk (a long line, two legs, a hatched drawer). 2. Stack of books with lettered spines. 3. Mug with two steam squiggles. 4. Clock or stopwatch (oval, two hands). 5. Moon and stars (hatched crescent, `STAR`). 6. Cloud thought bubble with three small circles. 7. Chart (two axes, a red curve, a blue curve, a circled area with an arrow and a "FAST!" label). 8. Calendar strip (three boxes with day numbers and ticks). 9. Checklist card (box, lettered rows, red or blue ticks). 10. Flashcard or book with a red X.

## 5. Typography

There is no font: everything is hand-lettered from the single-stroke glyph table `GL` through `TXT(str, x, y, h, opts)` or `TI(...)`. Capitals and digits only (and `? . , ' - ! = + % / : ( )`).
- Hero word: h 70 to 150 px, stroke `0.085 h`, red or black, with a red underline stroke beneath.
- Labels: h 40 to 60 px (cap height), blue or black, one to three words.
- Numbers: h 60 to 150 px, written on like words (a year or a count), red or black.
- Captions: h 78 px (shrunk if a group is wider than 860 px), black `#23232b`, stroke `0.1 h`, tracking `36 * h / 100` between words; per-letter scale .94 to 1.06, tilt +-.06 rad, baseline drift +-3.5% of h, slant, `wob`.
- Caption plate: the sticky note, rotated -0.8 deg, x 62 to 1022, height `min(200, captionBox height)` centred in the band (about y 1305 to 1510, 73% of the frame height), drop shadow `0 10px 10px .28`, two tape strips at x 120 and x 830; groups of at most 3 words and 15 characters, broken after `. , ? !`, one line.
- Local fallback: none needed; do not use `<text>`. Unsupported characters (accents, `&`, `@`, non-Latin scripts) are dropped silently: check labels.

## 6. Composition

Captions sit on a plate (the sticky note) in vfrey's band (`--vf-caption-at`); the art stays large and the board runs to the bottom edge.

- Safe area: x 60 to 1020; nothing below y 1720 (the tray starts at 1788 and camera zoom pushes lower art under it); the bottom-right corner is clear for the label.
- Zones (1080x1920): art y 110 to 1290; sticky note y 1305 to 1510; the second strip y 1530 to 1720 (timelines, legends, a hero word); tray 1788+. Derive from `vfrey.captionBox`, never typed.
- Frame grid: the art zone is in thirds (y 110 to 500, 500 to 890, 890 to 1290) with x centres at 270 and 810 for two columns.
- Subject scale: a person or chart fills one third to one half of the frame height (400 to 900 px); labels sit beside things, never on lines.
- Layers: board with smudges at the back; art layers stacked with the OLD one on top (z 50, 40, 30); pen above the art; frame and note outside the camera.
- Depth cues: none (a flat board); the camera push and the flicking page's shadow are the only depth.

Shot types:

```
PERSON + PROP        CHART                 TWO COLUMNS           CHECKLIST CARD        HERO WORD
+----------+         +----------+          +----------+          +----------+          +----------+
|  TITLE   |         | |  FAST! |          | CRAM SPACED         | NONSENSE |          |   (art)  |
|  ( o )   |  []     | |\  o    |          | |\      /\/|         | ZOF  v   |          |          |
|  /|\  [ ] |  []    | | \_.    |          | | \_    |  |         | BIK  v   |          |          |
| =====|=== |        | |___\____|          | [] ...  [][]|        | WUD  v   |          | note     |
| [ note   ]|        | [ note   ]|         | [ note   ]|         | [ note   ]|         | [ note   ]|
| strip     |        | strip     |         | strip     |         | strip     |         | HERO WORD |
+----------+         +----------+          +----------+          +----------+          +----------+
```

## 7. Motion

- Feel: hand speed. The primary motion is the marker line itself, eased `power1.inOut`; no stepping, no bounce.
- Stroke timing: each stroke lasts `length / speed` (speed 1500 to 1800 px/s), clamped 0.05 to 1.3 s, then all durations are scaled to fill the window exactly (max stretch 1.7).
- Entrances: things are drawn on; "popped" things (a poof of radial strokes, a chime star) fade in over 0.2 to 0.3 s. A person takes 0.8 to 1.6 s to draw; a label 0.3 to 0.6 s; a chart 1.5 to 3 s.
- Emphasis: circle a word (an `ELL`, 0.3 s), underline in red (0.25 s), an arrow with a label; hatch in a quiet moment (the most expensive stroke).
- Exits: written things are removed by `fade(g, t, 0.4)` or by the next transition, never a slide.
- Camera: one `#cam` wrapper around art, pen and eraser; origin `540px <noteY>px`; scale 1.0 to 1.05 or 1.08 in `sine.inOut` legs of 3 to 4.5 s with x drift up to 40 px; ease back to 1.0 in 0.6 s at each scene change.
- Pen: glides to the next stroke in gaps under 0.9 s with a smoothstep and a 22 px lift; fades out after 0.4 s idle; the cap colour follows the ink colour.
- Timing: every beat starts when its word is spoken; the next drawing starts within 0.3 s of a line starting; hold the finished drawing until the next transition.
- Forbidden: sliding or popping drawings in whole, scale bounces, rotating drawings, any motion that is not either a drawn stroke or the camera/pen.

## 8. Transitions

Alternate the two; put them in the natural pause between lines (about 1.1 s with Kokoro). Never hard-cut.
1. Page flick: the old layer gets `drop-shadow(0 34px 38px rgba(0,0,0,.38))`, `transformOrigin 50% 100%` and tweens `y: -2250, rotation: -5` in 0.55 s `power2.in`; start 0.38 s before the next topic's first word.
2. Eraser wipe: the old layer is clipped by a slanted polygon whose edge `e` runs -420 to 1500 over 0.6 to 0.8 s (`power1.inOut`); a felt eraser (cream top, dark felt strip, three faint smears, rotated about -82 degrees) rides the edge scrubbing `y = 900 + 760 sin(6 pi v)` six times.
3. (Inside a scene) a fade of a written group: `fade(g, t, 0.4)`.
Forbidden: crossfades, slides, zooms, any cut.

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). The bed is a gentle 84 bpm loop in C major (Cmaj7, Am7, Fmaj7, G): soft sine pad, marimba plucks (sine plus a 3.9x partial, `exp(-7t)` decay) on a pentatonic pattern, a quiet brushed shaker on off-beats, a low marimba root. Accents from word times: `scribble` (band-limited noise, 0.07 to 0.3 s bursts, random gaps) during drawing windows, `flick` (paper whoosh) at each page flick, `rub` (noise with six swells) at each wipe, `chime` when an idea lands, `thunk` for a gone or counted thing, `finale` (a rising four-note chime) on the last word. Mix: volume -12, duck, about -14 LUFS. `make-bed.py` needs only `python3` (standard library) and writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`), then: `python3 .agents/skills/vfrey-style-whiteboard-sketch/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey whiteboard sketch style)", "volume": -12, "duck": true}` and render again with `--rerender`.

No `python3` on the machine: leave `music` out, say so, install nothing.

## 10. Shot plan template (32 to 36 s, 5 lines, about 70 words)

Script: 5 lines; `lineGap` 0.25 to 0.4 (Kokoro's default pause is about a second, `voice.md` in the vfrey skill); one idea per scene and one drawable noun per phrase; sample with `npx vfrey voice sample <voice> --script <file> --no-browser`. Read word times from `timing.words`, never hard-code.

| Time | Beat | Shot type | Drawing | Transition out |
| --- | --- | --- | --- | --- |
| 0 to 6 s | Hook: the problem as a person | PERSON + PROP | desk, person, mug, books; title in red | page flick |
| 6 s to 14 s | The cause or the history | PERSON + PROP or CHECKLIST CARD | a second person or a card with ticks | eraser wipe |
| 14 to 23 s | The explanation as a chart | CHART | axes, red curve, circled FAST!, blue curve | page flick |
| 23 to 30 s | The fix: two columns | TWO COLUMNS | CRAM vs SPACED, calendar strip | eraser wipe |
| 30 to 35 s | Payoff in a hero word | HERO WORD | big red word, red underline, a pen finish | none (hold 1.5 s) |

## 11. Reference frames

- `ref-1.jpg`: the opening desk scene. Copy the hatched drawer, the doodle head with spiky hair and droopy lids, the books with red and blue stripes, the sticky note with tape and the tray with markers.
- `ref-2.jpg`: a character with a checklist card. Copy the bearded head with hatched jacket and red bow tie, the lettered card with blue ticks and the pen mid-stroke.
- `ref-3.jpg`: the chart. Copy the axes, the thick red curve, the circled area with its labelled arrow and the blue hand-lettered axis labels.
- `ref-4.jpg`: two columns. Copy the red and blue titles, the hatched stack and bars, the equals sign and the hero word underlined in red with the pen at its end.

## 12. Reference implementation

`starter.html` is a working three-scene board: a doodle person at a desk, a chart, a calendar strip with a hero word, a page flick and an eraser wipe, the pen, the frame, the sticky note and the hand-written captions. Copy it and `sketch.js` into `scenes/<idea>/` (rename it `index.html`), replace the placeholder art (`PLACEHOLDER TITLE`, `A SMALL NOTE`, `LABEL Y`, `BEFORE`, `AFTER`, `THE POINT`) and cue each scene to the script's lines, then check with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame 3 out.png`.

## 13. Do and Don't, and the final checklist

Do:
1. Do draw everything as strokes through `ink`; never use `<text>`.
2. Do keep each colour's job for the whole film.
3. Do hatch fills; never flat-fill.
4. Do seed all randomness (the kit's `rnd()`).
5. Do keep art above y 1720 and zoom about the note's centre.
6. Do fill both zones in every scene.
7. Do write captions yourself on the note and obey `captions: off`.
8. Do put transitions in the pauses and alternate flick and wipe.
9. Do let the pen lift between strokes and register only art strokes in `PS`.
10. Do start drawing within 0.3 s of a line starting.
11. Do keep the stroke count under about 700 and hide off-stage layers.

Don't:
1. Don't use a fourth marker colour.
2. Don't call `vfrey.captions` (the font would look typed).
3. Don't hard-cut between scenes.
4. Don't draw perfect circles, rulers or flat fills.
5. Don't put labels over a chart curve (lay boxes out first).
6. Don't use characters the glyph table lacks.
7. Don't pack more than a few strokes into a 1 s window.
8. Don't register caption strokes in `PS`.
9. Don't leave a scene more than a third empty mid-draw.
10. Don't use photographs, gradients inside drawings or shadows on drawings.
11. Don't put anything in the bottom-right corner.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- [ ] Off-white board with vignette and frame edge; tray with markers at the bottom.
- [ ] Only black, blue and red ink; each colour has one job.
- [ ] Strokes taper at the ends and wobble; no perfect shapes.
- [ ] Fills are hatched; nothing is flat-filled.
- [ ] Lettering is hand-drawn capitals, not a font.
- [ ] A doodle figure or chart fills a third to half of the frame.
- [ ] The marker pen is visible in the tiles where drawing is under way.
- [ ] Sticky note with tape in the same place in every tile, hand-lettered words.
- [ ] Nothing below y 1720 and the bottom-right corner is clear.
- [ ] Each scene fills both zones; no tile more than a third empty.
- [ ] Every number on screen matches the number the voice says (digits, units and rounding); read the contact sheet against the script.

## Pitfalls

- A dash gap that is small shows a second dash at the end of the path, and dust specks before the stroke starts. Use `len + 10` on, `2 * len + 300` off, as `ink` does.
- Camera zoom pushes lower art under the tray: keep art above y 1720 and zoom about an origin near the note.
- Lay out label boxes before drawing, so a title does not collide with a curve or a callout.
- Too many strokes in a short window: `build` clamps to 0.035 s a stroke and falls behind. Hatching is the most expensive, so draw it last in a window. Keep the whole film under about 700 strokes.
- A `captions.style` in the script has no effect on a scene that draws its own captions; the mode and position still do.
- `Math.random()`, wall-clock timers or `<text>` break the render or the look. Seeded `rnd()` and stroke paths only.
- Render cost is about 2 minutes for 34 seconds: hide layers that are off stage.
