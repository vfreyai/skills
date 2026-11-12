---
name: vfrey-style-data-story
description: "Use when the chosen video style is Data story (vfrey-style-data-story), or the person asks for a data-journalism, infographic, 'the world in numbers' or 'charts and maps that build' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: warm paper ground, one red accent, dot-matrix maps and charts, dots that regroup into bars, big mono counters, leader-line labels, a scoreboard, full-frame layout around the caption band and a generated data-desk bed."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 2.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Data story
  style-summary: Animated maps and charts like a newspaper data desk, with counting numbers and dots that regroup into bars.
  style-best-for: geography, economics, population, science facts, history by the numbers, comparisons
  style-poster: data-story.jpg
  style-preview: data-story.mp4
---
> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Data story

Start from `starter.html` next to this file (`npx vfrey styles start data-story scenes/<idea>` creates the folder with it as `index.html` and the `datadesk.js` and `land.js` it loads, whichever agent folder this skill was installed in; without them the render stops with `scene.page-error`): then replace its placeholders and cues, and render a frame. Code to copy is also in `helpers.md` and `datadesk.js`; the music script is `make-bed.py`. This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + canvas + GSAP, engine `vfrey-render`); the script, voice and facts are yours. The vfrey skill's `scenes/craft.md` still holds for everything not said here.

## Limits: when to use it, when not

- Use it when the point is "here is the scale of a thing": shares, counts, rankings, before and after, a place and its numbers.
- Not for stories with no numbers, moods, characters or how-tos. A subject with only one figure has nothing to regroup: pick another style.

## Plan before coding

1. Write the numbers down first, in a table: each value, its source (publisher, table, year) and whether it is rounded. Only numbers you can name a source for go on screen or in the voice. Drop a claim you cannot source.
2. Compute, never type: every number the scene shows (counters, bar lengths, dot counts, percentages) is calculated in the scene from those inputs. A figure you derive (a share, a total) is derived in code, and rounded the way its source rounds.
3. Mark what is not exact. A map drawn from simplified outlines, or dots placed in plausible spots, is schematic: say so on screen (a legend such as `1 DOT = <unit>, POSITIONS SCHEMATIC`) so the picture never implies precision it lacks. Print the sources in the footer.
4. Split the script into 3 or 4 chapters (one per line), each a camera move, a build or a morph of the same dots. Pick the hook picture (the whole thing drawn at once), the count, the comparison and the catch.
5. Script pace: Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. Write 4 to 6 lines for about 37 seconds and use the gaps for morphs; the caption plate fades out in silences longer than about 0.45 s, so a gap near that is where the plate blinks. The voice is the person's setting: suggest, never switch. Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 2.8 words a second (measured; the `series kit` Pace line has your voice's own figure). Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 2.8 words a second.

## 1. The look in three sentences, and the signature traits

A warm paper ground, ink text and one red accent, with dot-matrix pictures that never cut: the same dots form a map, regroup into a bar, then into rows. Big monospaced counters, thin rules and labels joined to the picture by leader lines make it read like a newspaper data desk. Every number is sourced and printed in a footer.

Signature traits (each checkable on a frame):
1. Paper ground `#F2EEE4`, never white, never a gradient.
2. Exactly one accent, vermilion `#E4432D`, used for the thing being counted; everything else is ink or grey.
3. A hero picture made of dots (land dots on a graticule globe, or unit dots in a grid) on a pale sphere or none.
4. A top rail: mono kicker, four-segment progress rail, a two-line bold headline and a 4 px ink rule.
5. Mono numerals (JetBrains Mono 500) for every counter, label and annotation.
6. A tag joined to an anchor dot by a thin ink leader line, with a 7 px red left border.
7. A caption plate: a solid ink rectangle with paper text, the current word in light red, same box all film.
8. A scoreboard of three cells with 5 px ink top rules; grey dashes until each number is spoken.
9. A source footer at the bottom left in small mono; the label corner at the bottom right stays clear.
10. A legend line that says what one dot is and that positions are schematic.
11. Dots that regroup into bars and rows with a flowing, staggered swarm (never a block slide).
12. No cuts: one picture persists and changes role; chapters are camera moves, builds and morphs.

## 2. Palette

| Role | Hex | Use |
| --- | --- | --- |
| Paper (ground) | `#F2EEE4` | whole background, tag backgrounds |
| Ink | `#15171C` | headline, rules, leader lines, caption plate |
| Accent | `#E4432D` | counted dots, circle, key numbers, tag border |
| Accent tint | `#EE9F89` | lit land inside the circle |
| Accent light | `#FF7358` | spoken word on the plate |
| Mute | `#6B6556` | labels, sub-notes, footer (4.9:1 on paper) |
| Rule | `#CFC8B6` | rail track, graticule `#D3CCB9` |
| Sphere | `#E7E1D1` | globe disc |
| Dot grey | `#A9A392` | land dots; area dots `#C9C2B0` |
| Dark dot | `#23262D` | "everyone else" dots |

- Ratios: paper 55 to 70%; ink under 15% (plate and type); accent under 8%; grey dots 10 to 25%.
- A brand accent replaces the red.
- Never: a second accent, a gradient ground, pure white or black, shadows, 3D bars, pie charts, drop shadows on dots.

## 3. Shapes and line

- Strokes at 1080x1920: graticule 1.5 px (every 30 degrees); sphere rim 2 px at 35% ink; leader lines 3 px ink; the accent circle 6 px (3.5 px when the globe is small); headline rule 4 px; scoreboard top rule 5 px; rail 8 px.
- Corners: square everywhere (tags, plate, cells); dots are circles; the legend marker is a 22 px circle.
- Dots: land dots `r0 = R * 1.7 deg * 0.36`, scaled `0.4 + 0.6 * depth`; unit dots r 18 (bars, pitch 46) or 6 to 14 on the globe, each with a paper ring `max(2, 0.2 r)` so dots on dots stay separate.
- Edge treatment: crisp canvas vectors, no blur; lit land inside a circle uses 7 colour buckets from grey to tint with a 150 km soft edge.
- Texture: none (paper is flat). Light and shadow: none; the globe is lit only by the tint inside the circle.
- Recipe for the dot-matrix world: hand-simplified `[lon, lat]` polygons (about 45 shapes), `DD.geoDots(shapes, holes, 1.7)` gives rows every 1.7 degrees with `round(360 cos(lat) / 1.7)` dots per row; orthographic projection `x = cos(lat) sin(lon - lon0)`; visible when depth > 0.

## 4. Characters and objects

There are no characters; the cast is dots, rules, tags and counters. Construct them like this:
- Unit dot: a filled circle r 18 in accent or dark, ring in paper; 80 dots with `cat` (0 = counted, 1 = rest); one dot = a round unit (1, 10, 100 million) printed in the legend.
- Bar of dots: 4 rows x 20 columns, pitch 46 px (`DD.gridPos(i, 103, y0, 4, 46)`); a solid bar `DD.bar(ctx, x, baseY, w, value, perPx, col)` is allowed when dots are not people.
- Tag: paper background, 7 px accent left border, padding 5 x 14 px, mono 34 px, a mute 28 to 30 px second line.
- Hero tag: accent mono 56 to 58 px on an 88% paper plate.
- Counter cell: label (mono 28, mute) over a value (mono 84, ink or accent) with a small unit (36 px, mute).
- Stock objects: 1. dot globe, 2. accent circle (geodesic ring), 3. radius line with end dot, 4. leader line with anchor dot, 5. unit-dot bar, 6. unit-dot rows (one per category), 7. dashed ghost circle (a previous value), 8. progress rail, 9. scoreboard cell, 10. legend line.

## 5. Typography

- Headline: Google Sans Flex 700, 47 px, line-height 1.1, `text-wrap: balance`, ink, two lines max, `vfrey.script.title`; at y 206 to 310.
- Kicker and topic: JetBrains Mono 500, 28 px, tracked .08em, caps; rail labels 22 px, tracked .06em, mute.
- Labels: mono 500, 28 to 34 px, tracked .05em, caps; annotation tags 34 px; hero tags 56 to 58 px; counters 84 px with -0.04em tracking; footer 23 px, max 610 px wide.
- Nothing under 28 px except the footer (23). Mono stays at weight 500 (faux bold smears). Local fallbacks: `Liberation Sans`, `Liberation Mono`.
- Caption plate: solid ink rectangle x 40 to 1040, y 1336 to 1528 (height 192), paper text 62 px Google Sans Flex 700, centred, max 4 words and 25 characters per group, the spoken word `#FF7358`; fades out in silences longer than 0.45 s.

## 6. Composition

Captions sit on a plate, never over a subject; vfrey draws them in a band (`--vf-caption-at`, `--vf-caption-h`) and the dot picture runs large, to the bottom edge of the frame around it.

- Safe area: x 60 to 1020; bottom-right (x > 686, y > 1806) clear for the label.
- Frame grid (1080x1920): rail y 100 to 180; headline y 205 to 318; hero canvas y 322 to 1310 (1080 x 988); caption plate y 1336 to 1528; scoreboard y 1566 to 1780 (three 320 px cells at x 60, 380, 700); footer y 1822+.
- Subject scale: the globe or chart is 70 to 100% of the hero width (R 430 to 640 px); a shrunken corner globe R 160.
- Layers: sphere and graticule; land dots; circle and fills; unit dots; leader lines; labels (DOM) on top.
- Depth cues: dot size by depth on the globe, nothing else; the picture is flat information design.

Shot types:

```
GLOBE + CIRCLE        ZOOM + LEADER         DOTS ON MAP          BAR OF DOTS           ROWS
+------------+        +------------+        +------------+       +------------+        +------------+
| rail / hdr |        | rail / hdr |        | rail / hdr |       | rail / hdr |        | rail / hdr |
|   .-''-.   |        |  _-----_   |        | o . o . o  |       | LABEL  n   |        | CHINA  o o |
|  (  o   )  |        | /  (o)---|tag       | .o.o o .o  |       | oooooooooo |        | INDIA  o o |
|   '-..-'   |        | \_______/  |        | legend     |       | oooooooooo |        | REST   o o |
|[ caption  ]|        |[ caption  ]|        |[ caption  ]|       |[ caption  ]|        |[ caption  ]|
| a   b   c  |        | a   b   c  |        | a   b   c  |       | a   b   c  |        | a   b   c  |
+------------+        +------------+        +------------+       +------------+        +------------+
```

## 7. Motion

- Feel: smooth and continuous; every beat has a camera move, a build or a morph; nothing idles; nothing cuts.
- Easing: spins and camera `power2.inOut` or `power3.inOut`; labels `power3.out`; exits `power2.in`; counters `power2.out`; pours `none` (the stagger lives in the per-dot delay `(i * 0.618) % 1`).
- Durations: spin 1.2 to 2 s; push-in 1.5 s (R 430 to 640, cy +6, `power3.inOut`); shrink to corner 1.7 s (R to 160); circle grow 1.6 s; label fade 0.3 s; leader draw 0.5 to 0.7 s; counter 1.2 to 1.3 s.
- Counters start 0.05 s before the number is spoken; dot regroups start 0.25 s before the sentence they belong to.
- Regroup recipe: `f = eio(clamp((F - delay * 0.5) / 0.5))` and a sideways bulge `min(150, len * 0.2) * sin(pi f)`, alternating sign by index.
- Camera: spin (`lon0`), push-in (`R`), shrink-to-corner; leave 20 px between the lowest chart row and a small globe.
- Secondary and ambient: the progress rail fills with time; labels follow the picture; a slow `lon0` drift of 2 to 4 degrees while holding.
- Forbidden: cuts, fades between pictures, bounce or elastic easing, shaking, spinning faster than 40 degrees per second, 3D tilts, particle sparkle.

## 8. Transitions

There are no cuts. The allowed transitions:
1. Role change (default): the same dots move from one layout to the next (`S.L` 1 to 2 to 3), 1.2 to 1.7 s.
2. Camera morph: globe spin, push-in or shrink-to-corner while labels fade out (0.3 s) and in.
3. Fill and unfill: a circle's tint fills land dots over 1.6 s; a ghost dashed circle (`setLineDash [16, 12]`, mute) marks the old value.
Forbidden: fades to another picture, wipes, slides, zoom blurs, a page flip.

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). The bed: 96 bpm, a sine pad per chord (A minor, F, C, G) with a soft plucked 8th-note arpeggio (decaying sines) and quiet noise ticks on the beat, a calm data-desk feel. Accents at cues: filtered-noise whooshes at each camera move or morph, a low blip when the main shape completes, rising blip runs under counters and pours, tick bursts under a counting number. Peak-normalise to 0.9, fade in 0.4 s and out 2 s; volume -14, duck on, about -14 LUFS. `make-bed.py` next to this file writes it with `python3` and `ffmpeg` only.

1. Make the video once without music, so `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`), then: `python3 "$(npx vfrey styles path data-story)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey data story style, ffmpeg)", "volume": -14, "duck": true}` and render again with `--rerender`.

No `python3` on the machine: leave `music` out, say so, install nothing.

## 10. Shot plan template (32 to 38 s)

Script: 4 to 6 lines (one chapter each); `lineGap` 0.25 to 0.4; about 2.8 words a second.

| Time | Chapter | Shot type | Camera and build | Scoreboard |
| --- | --- | --- | --- | --- |
| 0 to 5 s | Hook: the whole picture | GLOBE + CIRCLE | globe spins in, tint circle grows, hero tag | dashes |
| 5 to 14 s | The count | ZOOM + LEADER | push-in R 430 to 640, leader and tag, counters start | first value |
| 14 to 22 s | Who is inside | DOTS ON MAP | unit dots pour, legend on | second value |
| 22 to 30 s | The comparison | BAR OF DOTS then ROWS | dots regroup, globe shrinks to the corner | share fills |
| 30 to 36 s | The catch or payoff | GLOBE + CIRCLE (new size) | ghost old circle, hero tag with the new share | all three |
| last 2 s | Hold | any | slow drift | all values |

## 11. Reference frames

- `ref-1.jpg`: the opening globe. Copy the rail, headline and rule, the pale sphere with grey dots, the red circle and the empty scoreboard dashes.
- `ref-2.jpg`: zoom with a radius label. Copy the tint fill inside the circle, the red radius line with its 58 px tag and the ink caption plate.
- `ref-3.jpg`: unit dots on the map. Copy the red and dark dots with paper rings, the legend line and the counter cells filling.
- `ref-4.jpg`: dots regrouped into a bar. Copy the 4 x 20 grid at pitch 46, the mono label and value above it and the corner globe.

## 12. Reference implementation

`starter.html` is a working scene: a dot-matrix globe built from `land.js`, a geodesic circle that grows, one leader-line tag, 80 unit dots that pour onto the map and regroup into a bar, three scoreboard counters, a four-segment rail and captions on the ink plate. Start it with `npx vfrey styles start data-story scenes/<idea>` (the starter as `index.html`, with `datadesk.js` and `land.js`), replace `INPUTS` (value and source for every number), the kicker and topic, the tag text, the labels, the circle's centre (`CENTRE`) and radius, and cue each chapter to a script line or word (`lineAt(i)`, or `at("word")` from `helpers.md`). Check with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame 6 out.png`.

## 13. Do and Don't, and the final checklist

Do:
1. Do list every number with its source before coding, and compute displayed values in the scene.
2. Do keep exactly one accent colour.
3. Do print sources in the footer and say when positions are schematic.
4. Do keep the same dots across chapters and let them regroup.
5. Do start counters 0.05 s before the number is spoken.
6. Do keep mono at weight 500 and every label at 28 px or more.
7. Do leave 20 px between a label and its big value.
8. Do leave the bottom-right corner clear.
9. Do centre wide labels on their anchor (`translate(-50%,0)`).
10. Do retime words to the true speech segments if the voice is off (see pitfalls).
11. Do use a timeline-level `onUpdate` plus `vfrey.onFrame`.

Don't:
1. Don't use a second accent, gradients, shadows or 3D.
2. Don't colour land dots as if they were data (they show where land is).
3. Don't cut between pictures.
4. Don't type a number the scene can compute.
5. Don't claim precision a simplified outline does not have.
6. Don't use pie charts or 3D bars.
7. Don't put text under 28 px (except the footer at 23).
8. Don't use faux-bold mono.
9. Don't let a label hang off the frame edge.
10. Don't use a clock tween's `onUpdate`.
11. Don't leave a beat with no motion.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- [ ] Paper ground in every tile; no white, no gradient.
- [ ] Exactly one accent colour across the film.
- [ ] Rail, two-line headline and 4 px rule in every tile.
- [ ] A dot picture (globe, dots, bar or rows) fills 70 to 100% of the hero width.
- [ ] The same dots appear in successive tiles in new roles (no cuts).
- [ ] At least one leader-line tag with a red left border.
- [ ] Caption plate in the same box, ink with paper text, current word light red.
- [ ] Scoreboard of three cells fills in as numbers are spoken.
- [ ] Legend and source footer present; bottom-right corner clear.
- [ ] Every printed number is true, sourced and rounded as the source rounds.
- [ ] Every number on screen matches the number the voice says (digits, units and rounding); read the contact sheet against the script.

## Pitfalls

- A label block above a dot chart needs its full height (kicker plus value, about 110 px) clear of the first dot row; the renderer does not flag text over canvas dots.
- Call `draw` from `vfrey.onFrame` as well as the timeline's `onUpdate`, not from a clock tween: a clock tween runs before later tweens and paints stale state when seeking.
- A `captions.style` in the script beats the scene's: set both to `color`.
- Timing: the free voice's word times can be a second early after a line break, and inside a line they are spread by letters. If captions or counters drift from the voice, measure the real pauses (`ffmpeg -af silencedetect=n=-38dB:d=0.3`) and retime the words linearly inside each measured speech segment; re-measure after any script edit.
- Dots on a map show where land is, not people or density: do not colour them as data.
