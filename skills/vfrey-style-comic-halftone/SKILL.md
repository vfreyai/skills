---
name: vfrey-style-comic-halftone
description: "Use when the chosen video style is Comic halftone (vfrey-style-comic-halftone), or the person asks for a comic book, pop art, halftone, speed-lines or 'panels that smash in' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: ink-outlined panels, halftone dots, off-register print colour, speed lines, impact bursts, hand-lettered sound effects, full-frame layout around the caption band and a generated punchy music bed."
allowed-tools: Bash Read Write
version: 2.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Comic halftone
  style-summary: A comic page that comes alive, with bold ink outlines, dotted shading, panels that smash in and loud sound-effect lettering.
  style-best-for: animal facts, science and how-it-works, sports and action, gaming, product demos, trivia
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.
<!-- style-bible: v2 -->

# Video style: Comic halftone

Start from `starter.html` next to this file (with `comic.js`): copy both into `scenes/<idea>/`, rename it `index.html`, replace the hero, labels, numbers and cues, and render a frame. `helpers.md` shows the page around the kit and the choreography patterns; the music script is `make-bed.py`. This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Characters are original: never a known comic character, logo or trade dress.

## Limits: when to use it, when not

- Use it for subjects with a punchline or a force in them: animal facts, how something works, a record, a sports or game moment, a product that does one striking thing, trivia, a myth that gets busted.
- Not for solemn, sad or moody subjects, for long detailed explanations (panels carry a few words each), or for realism. Dense tables and fine charts do not survive the dots; a gauge, a counter or a bar does.

## Plan before coding

1. Pick the hero: one original character or object drawn from rounded rects and ellipses, and the thing it acts on. Plan one hero beat (the strike, the reveal, the number) that gets the slow-motion freeze.
2. Split the script into 5 to 8 pages. A page is one or two big panels above the caption plate and one to three smaller ones below it. Give each page its own ground colour (cyan, yellow, red, navy, magenta) so the film has chapters. Plan at least one gauge, counter or trace for a number.
3. For each page write its sound word (`ZIP!`, `KRAK!`, `DING!`: short, invented, in capitals) and at most two label boxes of 4 words.
4. Numbers and claims: only what you can cite. A diagram that is not data (a spike drawing, a metaphor dial) is labelled as an illustration or carries no figures.
5. Script pace: 6 lines for 35 seconds. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; sound effects can fill the gaps. The voice is the person's setting: suggest a voice, never switch it. Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 3 words a second. Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 3 words a second.

## 1. The look in three sentences, and the signature traits

A comic-book page that moves: every object has a thick ink outline with its colour printed slightly off register, shading is rows of halftone dots, and each page is shoved out by new panels that slam in from the edges. Big hand-lettered sound effects, jagged impact bursts and radial speed lines punch up every beat, and one moment gets a slow-motion freeze. Everything sits on cream paper with visible grain, in loud print inks only.

Signature traits (each checkable on a frame):
1. Cream paper `#F4E7C5` margins (36 px) around slanted-edge panels with 13 px ink borders and 11 to 13 px hard shadows.
2. Every object: colour fill shifted (5, 4) off register under a 7 px un-shifted ink outline.
3. Halftone dots (9 to 26 px pitch, rotated 15 to 45 degrees) for every gradient and shade; no smooth gradients anywhere.
4. A different ground colour per page (cyan, yellow, red, navy, magenta) with a dot-gradient.
5. A jagged burst (yellow with a red inner burst) carrying a number or word.
6. Sound-effect lettering (Titan One): three stacked layers (ink extrusion, colour fill with stroke, white dots) skewed -7 degrees, each letter rotated and offset.
7. Radial speed lines from a focus point, tapered triangles in ink on yellow or red.
8. A yellow caption plate with a 9 px ink border, a hard 13 px shadow and red dot texture, rotated -0.5 degrees, fixed for the whole film.
9. Small label boxes (uppercase Baloo 2, hard offset shadow) angled -2 to -4 degrees.
10. A gauge, counter or trace for a number, ending with a 1.8 degree jitter.
11. A white flash and a decaying shake on every impact; a 2 to 3 frame smear on fast limbs.
12. Paper grain over everything (multiply, opacity .25) plus a faint 9 px ink dot grid at .06.

## 2. Palette

| Role | Hex | Use |
| --- | --- | --- |
| Ink | `#16111C` | all outlines, shadows, small dots, text on yellow |
| Paper | `#F4E7C5` (grain tile `#F7EBCB`) | page margins |
| Red | `#E8272F` | bursts, impact grounds, highlight chip, SFX fill |
| Yellow | `#FFD11A` | caption plate, label boxes, bursts, SFX fill |
| Cyan | `#18B2E8` | sky and water grounds |
| Blue | `#1658C6` | dot gradients, shadows on cyan |
| Navy | `#0F2F7C` | night and gauge grounds, panel contrast |
| Magenta | `#E8368F` | a ground, SFX fill, hero dots |
| Orange | `#FF8A1F` | secondary warm, limbs, ground dots |
| White | `#FFFBEF` | highlights, gauge faces, small SFX layer |
| Hero accent | one hue (e.g. green `#2FBF62`, dots `#127A3E`) | the hero only |

- Ratios: paper margins 6 to 10% of the frame; one ground colour per panel; ink (outlines and shadows) 15 to 25%; red plus yellow together 25 to 45%; the hero accent only on the hero.
- A brand colour replaces yellow or red, never the ink.
- Never: smooth gradients, drop shadows other than the hard offset, pure black `#000`, more than one hero accent, a pastel or desaturated colour.

## 3. Shapes and line

- Strokes at 1080x1920: object outline 7 px (8 to 10 px on a hero); panel border 13 px; hard shadow offsets 11 to 13 px; lines through `LN` are `w + 7` ink under `w` colour; box border 7 px with a 9 x 11 px shadow; caption plate border 9 px, shadow 13 px.
- Corners: panels slightly slanted (a polygon with one edge off by 1.5 to 7%); boxes square; characters made of rounded rects (`RR`) and ellipses (`E`), round line joins and caps.
- Print effect (the look): `P(d, fill, {sw, off:[5,4], shade, sr})` draws the fill shifted `off`, an optional halftone clipped to the shape, then the ink outline.
- Halftone: shared hidden `<defs>` patterns (`dk` ink 15 px r3.4, `dkS` 9 px r2, `dkW` white 13 px, `dkR`, `dkO`, `dkB`, `dkM`, `dkH`) with `patternTransform` rotate 15 to 45; gradients by `ht(w, h, spacing 20 to 26, angle, rMax = 0.6 * spacing, fn(x, y))`, one path of circles.
- Burst: `burstD(cx, cy, R, r, n 13 to 15)` jagged star; an ink offset copy, yellow burst, red inner burst, number inside.
- Paper recipe: a 256 px canvas with a seeded generator (1800 specks alpha .04 to .14, 160 hairlines), `data:` url on a full-frame `mix-blend-mode: multiply` div at opacity .25 (higher makes the file over 12 Mbps).
- Light: none; flat inks. Shadows are always hard offsets in ink.

## 4. Characters and objects

How a hero is constructed (original, never a known character):
- Body: a rounded rectangle or ellipse 300 to 400 px wide with the halftone shade on the lower third; head-to-body about 1:1 for critters, 1:2.5 for people; no neck for creatures.
- Eyes: white circle r 40 to 47 with a 7 px ink outline, an ink pupil (r 17) offset toward the action and a small white glint; stalks or brows as `LN` strokes.
- Limbs: nested groups, upper limb a `RR` pill 44 px thick, forearm an ellipse, joints rotated about the shoulder by the ticker; smear: three ghosts in pale yellow, yellow and orange at the pose from t - 0.045, 0.09, 0.135, opacity `clamp(speed / 40)`.
- Mouth: one `LN` curve in white or ink; hands are blobs.
- Shading: `shade: "dkH"` (hero dots) clipped to the lower part; never a gradient.
- Minimal recipe: `P(E(0,0,190,125), GRN, {sw:8, shade:"dkH", sr:[-190,10,380,120]})` plus two stalks, two eyes and a grin (see `hero()` in the starter).

Stock props (6 to 10, each a few `P` calls): 1. burst with number, 2. sound effect lettering, 3. label box, 4. dial with needle, 5. stopwatch, 6. bubble (translucent circle with an ink ring), 7. impact shards (jagged polygons), 8. a ground strip of sand or floor in yellow with orange dots, 9. coral or plant fronds (rounded stems), 10. speed-line fan and streaks.

## 5. Typography

- Sound effects and big numbers: Titan One, 150 to 230 px for a hero SFX, 60 to 120 px for a number in a burst; fill red, yellow or cyan with a stroke `0.17 * size` ink (paint-order stroke), extrusion stroke `0.3 * size`; skewX -7, rotation -10 to 10.
- Labels and caption boxes: Baloo 2 800, uppercase, `letter-spacing: 1px`, 46 to 62 px in boxes (ink on yellow or white), 30 to 40 px for tiny tags, 24 px for sub-lines.
- Spoken captions: `vfrey.captions("#captions", { style: "box", size: 66, color: INK, highlight: RED, highlightText: "#FFFBEF", font: '"Baloo 2"', maxWords: 3 })`, uppercase, centred on the plate.
- Caption plate spec: yellow `#FFD11A`, 9 px ink border, 13 px hard shadow, red dot texture at 22 px with a yellow fade, x from `--vf-safe-left`, y from `--vf-caption-at` (about 1322 to 1528, 70 to 78% down), height `--vf-caption-h`, rotated -0.5 degrees, max 2 lines, the spoken word on a red chip with a cream word.
- Local fallback: `"Arial Black"`, `Impact`. Set SVG `font-family` through CSS classes (`text.bl`).

## 6. Composition

Captions sit on a plate, never over a subject; vfrey draws them in a band (`--vf-caption-at`) and the art runs large, to the bottom edge of the frame around it.

- Safe area: paper margin 36 px; keep text out of the top 200 units; the bottom-right corner of the lowest row (x 686 to 1008, y 1806 to 1864) is ornament only.
- Grid (1080x1920): panel row A y 64 to 1290 (one big or two stacked); caption plate y 1322 to 1528; panel row B y 1564 to 1882 (one wide or two, about 492 px each with a 24 px gutter).
- Subject scale: the hero is 40 to 70% of the panel width and 35 to 55% of its height; a hero wider than the panel is cropped by its edge rather than shrunk.
- Layers: ground and dot gradient; ground strip; hero; speed lines; burst and lettering; box labels; panel border on top.
- Depth cues: overlap (the hero breaks a panel edge now and then), speed lines, scale of the burst; no perspective.
- Fill every panel edge to edge: ground, halftone, a subject.

Shot types:

```
HERO SCENE          IMPACT PAGE           CLOSE-UP + GAUGE     BIG NUMBER          SLOW-MO FREEZE
+----------+        +----------+          +----------+         +----------+        +----------+
|[LABEL]  *|        | \  |  / S|          | \  |  /  |        |   .-*-.   |        |  KRAK!   |
| ZIP!  ___|        |--  hero--|          |  ( O )  *|        |  / 6296 \ |        | * burst *|
|  hero ===|        |/ burst  K|          | / | \      |        |  \_____/  |        |  shards  |
|__________|        |__________|          |__________|         |__________|        |__________|
|[ caption ]|       |[ caption ]|         |[ caption ]|        |[ caption ]|       |[ caption ]|
| eye | dial|       | 1,000 x   |         | label | num |      | bars  |  bar|     | trace    |
+----------+        +----------+          +----------+         +----------+        +----------+
```

## 7. Motion

- Feel: snappy and punchy; hits have hold and rebound; everything is a pure function of time through one ticker (`vfrey.onFrame`), so seeking is exact.
- Panels slam in: set off-screen (`x/y` +-1250 to 1500, rotation +-4), `back.out(1.25)` 0.36 s with stagger 0.06; the old page is shoved out the opposite way (`power3.in`, 0.28 s) starting 0.06 s after the new one starts; a camera jolt (`elastic.out`) 0.34 s after arrival.
- Pops (SFX, bursts, labels): `fromTo(scale 0, rotation -14, svgOrigin)` to 1, `back.out(2.2)`, 0.3 to 0.4 s, on the word's start; bursts then breathe: rotation -4 to 3 over 2.6 s `sine.inOut`.
- Impacts: a white flash (`set` opacity then `to` 0 in 0.2 s; never `fromTo` on a shared overlay), decaying alternating x/y shake on the panel's `sk-` group (7 to 9 keyframes, 0.5 s), a hit-stop shove of the hero (-60 px in 0.14 s, back in 0.7 s), a 0.25 s hit-stop.
- Hero moment in slow motion: `power1.in` approach over 1.2 s while the camera pushes in (scale 1.0 to 1.12) and radial speed lines fade up to .55; freeze on impact: burst, lettering and shards flying slowly (2.4 s `power2.out`), a "SLOW-MO" tag; a 0.4 s total silence before the boom.
- Gauges: needle `power4.out` 0.45 s with a 1.8 degree jitter; counters `power3.out` 0.9 s to a number you can cite.
- Camera: slow push-in on `in-<panel>` (scale 1.0 to 1.06) while `sk-<panel>` handles shakes.
- Cue everything from `vfrey.timing.words` (found by text with `anchors`) or line starts, never hard-coded seconds.
- Forbidden: fades and dissolves, smooth easing on hits (use `back.out`, `expo.out`, `elastic.out`), gradients, a page that does not slam, a flash through `fromTo`.

## 8. Transitions

1. Conveyor slam (the only page transition): new panels enter from alternating sides (l / r / t / b) while the old page is shoved out the opposite way; 0.28 to 0.36 s; the page starts 0.1 s before its word.
2. White flash on impacts: opacity .9 to 1 in 0 s, back to 0 in 0.2 s `power2.out`.
3. A panel's own wipe: a coloured shape grows over it (burst scaling from the impact point) for in-page changes.
Never fade, never crossfade, never a page flip.

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). The bed is pure-Python synthesis at 32 kHz: kick, snare and hat, a saw bass riff, off-beat saw stabs and a pulse lead at 126 bpm over Am, F, G, E7. The arrangement follows the pages: thinner under explanations, a low-passed underwater feel, a snare roll and riser into the hero hit, then a 0.4 s total silence and a boom on the hit. Accents (a whoosh per page change, a pop per burst, a zip and thwack per strike, bubble blips, a boom, a bell, ticks) sit on word times and are mixed hotter than the music because vfrey ducks the whole bed under the voice. `make-bed.py` needs only `python3` and `ffmpeg`.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`), then: `python3 .agents/skills/vfrey-style-comic-halftone/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.mp3`
3. Add to the script: `"music": {"file": "music/<idea>-bed.mp3", "source": "generated:make-bed.py (vfrey comic halftone style)", "volume": -14, "duck": true}` and render again with `--rerender`.

No `python3` on the machine: leave `music` out, say so, install nothing.

## 10. Shot plan template (32 to 36 s, 5 to 8 pages)

Script: 6 lines for 35 seconds; `lineGap` 0.25 to 0.4; sound effects fill the pauses. Each page gets its own ground colour and a short invented sound word.

| Time | Beat | Shot type | Ground | Moves |
| --- | --- | --- | --- | --- |
| 0 to 5 s | Hook: the hero and the claim | HERO SCENE | cyan | label pops, SFX pops, burst with the headline number |
| 5 to 11 s | The unexpected fact | HERO SCENE or CLOSE-UP + GAUGE | yellow | speed lines, a dial or a close-up in row B |
| 11 to 18 s | The wind-up | CLOSE-UP + GAUGE | red | push-in, radial lines fade up, counter |
| 18 to 23 s | The hit | SLOW-MO FREEZE | red then cyan | flash, shake, burst, SFX, shards |
| 23 to 30 s | Consequence in numbers | BIG NUMBER | magenta or navy | stopwatch or bars, counter, jitter |
| 30 to 35 s | Payoff and caption | IMPACT PAGE | yellow | last burst, boom, hold 1.5 s |

## 11. Reference frames

- `ref-1.jpg`: the opening hero page. Copy the cyan ground with the blue dot gradient, the yellow sand strip, the off-register hero with dot shading, the red burst with a number, the label box and the pink SFX.
- `ref-2.jpg`: the impact page. Copy the red-and-ink radial speed lines on a yellow burst, the cream SFX lettering and the hero's limb smear.
- `ref-3.jpg`: the freeze. Copy the slanted panels, the red inner burst with the yellow burst, "KRAK!" breaking the panel edge and the "SLOW-MO" tag.
- `ref-4.jpg`: the number page. Copy the magenta and yellow dot radial ground, the cream stopwatch with navy ring, the angled label box and the cut-off lettering.

## 12. Reference implementation

`starter.html` (with `comic.js`) is a working two-page film: an original green hero built with `P`, a dot-gradient sky and sand strip, a burst with a number, a label box, a sound effect, an eye close-up and a dial (page 1), then an impact page with a flash, a shake, a burst, "KRAK!" and a counter (page 2), on the caption plate. Copy both into `scenes/<idea>/`, rename the starter `index.html`, replace `hero()`, `HONEY`-style placeholders (`PLACEHOLDER LABEL!`, `TIMES PLACEHOLDER`, the numbers) and cue each page to a script line, then check with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame 3 out.png`.

## 13. Do and Don't, and the final checklist

Do:
1. Do print every object with `P` (off-register fill under an ink outline).
2. Do use halftone dots for every shade and gradient.
3. Do give each page its own ground colour.
4. Do slam pages in from alternating sides and shove the old page out.
5. Do flash, shake and hit-stop on impacts, with the flash via `set` and `to`.
6. Do split `sk-<panel>` (shake) from `in-<panel>` (push).
7. Do keep text in row B out of the bottom-right and the top 200 units.
8. Do letter every sound effect in three layers with per-letter rotation.
9. Do end a gauge with a 1.8 degree jitter and cite every number.
10. Do cue from word times found by text.
11. Do keep paper grain at .25 or lower.

Don't:
1. Don't use smooth gradients or soft shadows.
2. Don't fade between pages.
3. Don't use a known comic character, logo or trade dress.
4. Don't add a third font.
5. Don't put a transform attribute on a group GSAP animates (wrap it).
6. Don't use `fromTo` on a shared overlay such as the flash.
7. Don't leave a panel without ground, dots and a subject.
8. Don't put text or numbers in the lowest row's bottom-right corner.
9. Don't shrink a hero wider than its panel; crop it.
10. Don't invent numbers; label non-data diagrams as illustrations.
11. Don't use pastel or desaturated colours.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- [ ] Cream paper margins and slanted ink-bordered panels with hard shadows in every tile.
- [ ] Every object has a thick ink outline with the fill shifted off register.
- [ ] Halftone dots on every shade and gradient; no smooth gradient anywhere.
- [ ] A different ground colour on successive pages.
- [ ] At least one jagged burst with a number, one SFX in layered lettering, one radial speed-line fan.
- [ ] The yellow caption plate in the same place, red-dotted, rotated slightly.
- [ ] A gauge, counter or trace for the key number.
- [ ] Hero in original design, accent colour only on the hero.
- [ ] No text in the bottom-right corner of the lowest row; nothing in the top 200 units.
- [ ] Paper grain visible but the file under about 12 Mbps (no `frames.bitrate` warning).
- [ ] Every number on screen matches the number the voice says (digits, units and rounding); read the contact sheet against the script.

## Pitfalls

- `tl.fromTo` on a shared element (the flash overlay) applies its FROM state at build and leaves it lit: use `set` then `to`.
- Never put a `transform` attribute on a group GSAP animates; wrap it in a parent `<g>` that carries the position.
- Paper grain at opacity 0.4 over the halftone made a 53 MB, 12.6 Mbps file and a `frames.bitrate` warning (the video still finishes, and platforms re-encode it). Keep the grain at about 0.25 or lower and the dot grid at 0.06; grain changes every pixel, so it must stay faint.
- Preview stills made before the first full render use estimated word times: re-check after the voice exists.
- Text placed in the lower right of the lowest row collides with the `AI-GENERATED` label: keep text in the upper 70% of the lower row.
- A panel with its slow push-in and its shake on one group fights itself: two groups, `sk-` outside `in-`.
- A machine low on disk fails the render with "Low disk space" part way: free space and run it again.
