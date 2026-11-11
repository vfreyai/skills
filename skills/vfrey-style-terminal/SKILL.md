---
name: vfrey-style-terminal
description: "Use when the chosen video style is Terminal / ASCII (vfrey-style-terminal), or the person asks for a hacker-terminal, ASCII, retro CRT, command-line or green-screen look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: one canvas of monospace cells, typed commands, block-letter numbers, tmux-style panes, CRT glow and scanlines, a voice pane at vfrey's caption band, and a cue sheet shared with the generated sound."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Terminal / ASCII
  style-summary: A glowing old-school computer screen where everything is typed and drawn from text characters.
  style-best-for: coding, cyber-security, developer tips, maths and numbers, tech explainers, how it works
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Terminal / ASCII

This is an art-direction bible for one look. Start every scene from `starter.html` next to this file (see section 12): copy it to `scenes/<idea>/index.html`, replace the PLACEHOLDER text and the three screens, keep the engine (grid, glyphs, chrome, CRT finish, transitions). The script, voice and facts are yours; the rules below are topic-free but exact. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Helpers to copy are in `helpers.md` next to this file; the sound script is `make-bed.py` next to this file and reads the same `cues.js` as the picture.

## 1. The look in three sentences

A phosphor-green CRT text screen: one 1080 x 1920 canvas of 52 monospace columns where every object is made of characters, with typed commands, block-letter numbers, scrambling text and tmux-style panes. It is lit like a real tube: bloom around every glyph, 4 px scanlines, a slight barrel curve and a dark rounded vignette. Nothing on screen is a picture, a gradient fill or a soft shape; if it is not a character cell, a block glyph or a dither, it does not belong.

Signature traits (each checkable on a frame):
1. One canvas, one monospace grid: base cell 20 x 40 px, 52 columns, text always snaps to cells (scale 1, 1.25, 1.5, 2).
2. Only JetBrains Mono; box lines and block glyphs are drawn as rectangles so frames join with no gaps.
3. Five greens plus one alert red; the alert appears once or twice per film.
4. A tab bar at the top (row 1, active tab in inverse video) and a typed `$ command` at row 2.6 of every scene.
5. A hero object 25 to 40 cells wide built from block glyphs and dither (padlock, key, dice, framed list) with one secondary animation.
6. Block-letter numbers from a 5 x 7 pixel font, one square per pixel with a one-cell drop shadow, 28 to 36 px per pixel.
7. The voice pane: a framed box starting at row 32 with a `>` prompt, words typed in at scale 2, current word underlined, blinking block cursor.
8. A system pane at the bottom with a log tail (left), a bouncing level meter (right) and a status line; `AI-GENERATED` sits to the right of the status line.
9. Phosphor bloom (two blurred copies added), horizontal scanlines, a slow refresh band, barrel curve, vignette with rounded corners.
10. Scramble-and-resolve text (`scram`) for every reveal, and a white flash plus boom on the big number.
11. Progress bars of `█` over a `░` dither track.
12. Scene changes are terminal operations (`clear`, `scroll`, `split`), never fades.

## 2. Palette

| Role | Key | Hex | Use |
|---|---|---|---|
| ground | `bg` | `#020805` | everything behind text; canvas fill |
| ghost | `k` | `#0b5c2c` | unlit tracks, shadows of block digits, rain tail, borders of quiet panes |
| dim | `d` | `#149246` | secondary text, borders, labels, unfilled cells |
| main | `g` | `#2ee872` | body text, filled bars, active borders, the cursor |
| hot | `h` | `#d6ffe4` | the thing to read: command text, the headline number, active word, flash |
| alert | `r` | `#ff5038` | a loss, a breach, a wrong answer: once or twice per film |
| alert dark | `rd` | `#8f2417` | track and shadow of the alert |

Ratios per frame: ground at least 70%, `k` + `d` about 12%, `g` about 12%, `h` at most 5% (only the one thing to read), `r` at most 6% and only on the alert beat. Radial glow behind the text: `rgba(22,80,44,.30)` centred at 42% of the height, radius 1250 px. Amber is a valid swap only if all five greens change together (`#0c0602`, `#6a3a08`, `#c27a10`, `#ffb02e`, `#fff0cf`); `brand.json` wins if set. Never use blue, purple, white `#fff`, a second hue, gradients on glyphs or any colour outside this table.

## 3. Shapes and line

- Grid: X0 = 20, CW = 20, CH = 40, COLS = 52, rows 0 to 45. Row map: 0 to 2 tab bar, 2.4 to 32 scene area, 32 to 38 voice pane, 38 to 46 system pane and status line.
- Box lines: thin = `max(2, round(w * .13))` = 3 px at scale 1; heavy `━ ┃ ┏` = `round(w * .36)` = 7 px. Corners are square, never rounded (the screen edge alone is rounded: `border-radius: 5.5% / 3.2%`).
- Block glyphs `█ ▀ ▌ ▐ ▁..▇` are full-cell rectangles. Dither `░ ▒ ▓` is a 4 x 8 dot grid per cell, each dot 86% of its pitch.
- Texture recipe (the CRT finish, in this order): ground fill, radial green glow, the text layer, the same layer added with `lighter` blur 7 px at alpha .62 then blur 26 px at alpha .34, a refresh band (a 360 px gradient strip, `rgba(120,255,170,.045)` peak, moving down at 210 px/s), barrel curve (8 px horizontal strips scaled by `1 - .022 v^2`, then 8 px vertical strips by `1 - .013 u^2`).
- DOM overlays above the canvas: scanlines `repeating-linear-gradient(180deg, transparent 0 2px, rgba(0,0,0,.26) 3px 4px)` (alpha never above .26), vignette `inset 0 0 90px 30px rgba(0,0,0,.72), inset 0 0 260px 60px rgba(0,0,0,.38)`, a 6 px `#050807` inner frame, and a faint top-left glare `rgba(190,255,215,.055)`.
- Light and shadow: there is no light direction. Depth is a one-cell drop shadow in `k` on block numbers (offset .34 pixel) and the bloom.
- Bloom is the render cost: exactly two blur passes, never a third.

## 4. Characters and objects

Everything is built from rows of characters. A figure has no outline stroke: its edge is the glyph edge. Proportions are by cells, not by head ratios; the hero is 20 to 36 cells wide and 10 to 16 rows tall at scale 1.25 to 1.5. Shade with `░ ▒ ▓` (light to dense), highlight with a moving diagonal sheen: `wv = sin(i * .55 + j * .9 - t * 2.6)`; `wv > .72` becomes `▓`, `wv < -.55` becomes `░`.

Minimal recipe (a framed pane with a title and an inverse label):

```js
frame(1, 6, 24, 10, { c: "g" });                 // x, y, w, h in cells
put(1, 5, " list.txt ", { c: "g", inv: true });   // inverse-video label
put(3, 7, "first line", { c: "h" });
```

Stock props (all in `starter.html`): padlock with an opening shackle (20 x 12 cells, `lock`), key (4 rows, `KEY`), dice with pip dots (9 x 5 cells, `die`), framed scrolling list, progress bar (`bar`), block-digit number (`big`), character rain (`rain`), level meter and log tail (`chrome`). Add as needed in the same grammar: a cursor `█` that blinks at 2.2 Hz, a battery `[████░░]`, a table drawn with `┌┬┐`, a bar chart of `▁▂▃▄▅▆▇█`, a tick `✓` as `▌▀` shapes, an arrow `▶`.

## 5. Typography

- Font: JetBrains Mono 500 only. Call `document.fonts.load('500 33px "JetBrains Mono"')` and redraw when it resolves. Local fallback: `ui-monospace, Menlo, monospace` (cell width then drifts: never rely on it).
- Sizes at 1080 x 1920 (cell 20 x 40): scale 1 is 33 px type (labels, log, table rows), 1.25 is 41 px, 1.5 is 50 px (values, takeaways), 2 is 66 px (commands, captions, list entries), block-digit numbers 28 to 36 px per pixel (a 6-digit number is about 960 px wide at 28).
- Case: commands lower-case; labels lower-case or `UPPER` for alert tags and units; numbers use thousands commas. Tracking is the grid itself (no letter-spacing).
- Caption plate (this style draws its own): the framed `voice` pane at rows 32 to 38 (y 1280 to 1520), border `d`, title ` voice ` at row 32, prompt `>` in `g` at scale 2, words in `h` at scale 2 starting at column 5, at most 2 rows of 22 characters, row pitch 2.2 rows, the current word underlined by a 5 px `g` bar, a blinking `█` after the last letter at 3 Hz. Words type at 45 characters a second (`ceil((t - start) / .022)`); a group holds until the next group starts (at most 1.6 s). `captions.mode === "off"` draws the pane empty.

## 6. Composition

Captions sit on a plate (the `voice` pane); vfrey's band (`--vf-caption-at`) is where the pane goes, and the large type and panes run to the bottom edge.

- Safe area: columns 0 to 51, the bottom-right corner (status line, last 12 columns) stays clear for the `AI-GENERATED` label. Never put a chrome row on a box-border row.
- Frame grid: three bands. Scene area rows 2.4 to 32 (1100 px), voice pane rows 32 to 38, system pane rows 38 to 46. Inside the scene area use the left third (columns 1 to 17) for the object and the right two thirds for values, or full width for a number.
- Subject scale: the hero object is 25 to 35% of frame height; block numbers 14 to 18%.
- Layers: background rain at alpha .3 to .55 (never over the hero: clear a rectangle behind it), midground the hero and values, foreground the typed command and any inverse tags.
- Depth cues: bloom, bright over dim (`h` over `g` over `d` over `k`), drop shadows on numbers, rain in `k`.
- No more than 20% of the scene area may be empty ground.

Named shot types (the starter has the first three):

```
HERO OBJECT          LIST + DICE            BIG NUMBER
$ cmd                $ cmd                  $ cmd
+---------+          +-----+ 1 word         ##  ##  ##
|  lock   |  val     | list| 2 word         ## #### ##   YEARS
+---------+  bar     +-----+ 3 word         flash + boom
```

```
SPLIT RACE           LOG TAIL (verdict)     STATEMENT
$ cmd                $ cmd                  $ cmd
+- assumption -+     words words words      BIG LABEL
A [#####---] 75%     6 words: n^6           assumption box
B [##-------] 9%     [object] [dice]        takeaway line
```

## 7. Motion

- Feel: smooth frame-by-frame redraw (30 fps) of a pure function `draw(t)`; text itself appears in steps (typed characters, scramble frames at 18 Hz).
- Easing: `eo(p) = 1 - (1 - p)^3` for entrances, `eo5` for snaps, `eio` for moves and transitions, `back` (overshoot 1.9) for the shackle and tags; linear only for the clock and rain.
- Durations: typed command 30 to 40 characters a second; scramble resolve 0.35 to 0.4 s; shackle open 0.4 s with a 7 Hz shake decaying over 0.15 s; flash 0.4 s from alpha .45; number settle left to right in 0.4 s; progress bar fill 1.0 to 1.1 s; list word reveal every 0.38 s.
- Holds: the last frame holds 1.5 s with the cursor still blinking; a picture is on screen within 0.3 s of its line starting.
- Camera: none. The screen never pans or zooms; only content scrolls (`scroll` transition, list columns at 7 rows a second).
- Secondary and ambient (on every beat): cursor blink 2.2 Hz, level meter, log tail typing at 60 characters a second, status clock, refresh band, rain behind a big reveal.
- Forbidden: Date.now, Math.random (use the `hash(n)` sin-hash), easing on the clock, fades of whole scenes, any motion blur, any element sliding in from off-grid with a soft ease. Every frame is a pure function of time: draw from one setter driven by a tween, never from `tl.call`.

## 8. Transitions

Three terminal operations, 0.42 s each, started 0.5 s before the line they introduce (the new scene is up when the voice begins), both scenes drawn in the same frame with `clipRows`:

```js
// clear: a bright bar wipes down, old scene below it, new above
const row = lerp(top, bot + 1, eio(p));
g.save(); clipRows(row, bot); SCENES[k - 1](t); g.restore();
g.save(); clipRows(top, row); SCENES[k](t); g.restore();
put(0, row - .5, "█".repeat(52), { c: "h" }); put(0, row - 1.5, "▓".repeat(52), { c: "g", a: .7 });
```

`scroll`: the scene area translates up by its own height (`eio`). `split`: a `━` rule opens at row 17; draw the old scene twice, the top half clipped to rows `top .. mid - e * (mid - top)` and translated up by `e * (mid - top) * CH`, the bottom half clipped to `mid + e * (bot - mid) .. bot` and translated down, with the new scene underneath and two `━` rules at the cut edges. Forbidden: cross-fade, zoom, wipe by colour, slide of the chrome (tabs, voice pane and system pane never move).

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a quiet bed: A-minor drone (root, fifth, octave, slow LFO), a slow pad, a dark square-wave 8th-note arpeggio and soft hats at 96 bpm, plus cue sounds: `type` (a click per typed character), `tick`, `beep` (880 Hz square), `ok` (two rising squares), `alert` (two low saw pulses, once, on the red beat), `boom` (sine 70 to 34 Hz plus noise, on each big number), `whoosh` (on every transition) and `roll` (dice). Mix: bed at `volume -14` with `duck: true`; accents are in the same file at their own gain (`"gain"` per cue). It needs only `python3` (standard library) and writes the same file for the same input.

1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the same sheet as `cues.js`, with `"gain"` per cue and `"at"` for absolute times), then from the project folder: `python3 .agents/skills/vfrey-style-terminal/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey terminal style)", "volume": -14, "duck": true}` and make it again with `--rerender`. If the run warns `audio.voice-clear`, lower `volume`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (35 to 40 s, 5 lines)

Pace: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window (Kokoro af_heart with lineGap 0.3 is about 3 words a second). Set `lineGap` 0.25 to 0.4 in the script (see `voice.md`); do not merge lines to hide the pause, fill it with ambient motion. vfrey needs the `--about` subject words in the script: use two distinctive nouns.

| Beat | Time | Shot type | Content | Sound cues |
|---|---|---|---|---|
| Hook | 0 to 7 s | hero object | command typed, object resolves from noise, the claim; alert once on the contradiction | type, alert |
| Beat 1 | 7 to 14 s | big number | the first quantity, settling digits, flash | whoosh, boom |
| Beat 2 | 14 to 21 s | list + dice | how the quantity arises, framed list, items picked | whoosh, tick x4 |
| Beat 3 | 21 to 29 s | split race | two bars, assumed rate stated in a box | whoosh, ok |
| Payoff | 29 to 38 s | big number + statement | the result, the rule in one line, cursor blinking | boom, hold 1.5 s |

## 11. Reference frames

Four frames of the showcase film, 540 x 960, in this folder (not copied into installed projects):
- `ref-1.jpg`: the hero object with typed value and bars; copy the object scale, the red alert shackle and the row rhythm.
- `ref-2.jpg`: a grid of 94 keys with a big block number; copy the density and the inverse-video highlights.
- `ref-3.jpg`: the split race with the assumption box; copy the framed title and two-pane layout.
- `ref-4.jpg`: the verdict with the big number over the dice row; copy the chrome (voice pane, log, meter, status line) exactly.

## 12. Reference implementation

`starter.html` is a working three-screen scene (hero object, list and dice, big number) with the full engine: grid, glyph renderer, `put`, `frame`, `scram`, `big`, `bar`, `rain`, `lock`, `die`, chrome, captions, three transitions and the CRT finish, with an inline cue sheet. Start from it: `cp .agents/skills/vfrey-style-terminal/starter.html scenes/<idea>/index.html`, replace each PLACEHOLDER, add or remove screens (`SCENES`, `TR`, `TABS`, `LOG`), keep `data-composition-id` on `#root`. Check a frame with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 3 out.png` (silent, estimated timing).

## 13. Do / Don't, and the final checklist

Do:
1. Do type a command at the top of every scene and finish it before the voice reaches what it shows.
2. Do build every object from block glyphs and dither, 25 to 40 cells wide.
3. Do keep fixed chrome (tabs, voice pane, system pane) identical on every frame.
4. Do give every beat a primary, a secondary and ambient motion.
5. Do resolve every number from scrambling digits with a flash and a boom.
6. Do state any assumed number (a rate, a size) in a framed box.
7. Do keep the alert colour for one real reversal.
8. Do use `clipRows` and draw both scenes in transitions.
9. Do hold the last frame 1.5 s with the cursor blinking.
10. Do keep scanline alpha at or under .26 so small text stays sharp.

Don't:
1. Don't use any image, emoji, gradient fill or soft shape.
2. Don't add a third bloom pass or a full-frame CSS blur.
3. Don't use Date.now or Math.random; use the sin-hash.
4. Don't put a note on a box-border row (it is clipped): shift the content.
5. Don't stack scale-1.5 text without counting rows (it needs 1.5 rows).
6. Don't use more than one alert beat per scene.
7. Don't move or fade the chrome during a transition.
8. Don't cut with a fade, zoom or colour wipe.
9. Don't use a proportional font or a second font.
10. Don't invent a statistic: every number on screen is computed or cited.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; also check stills at sentence starts):
- Grid: all text on cells, JetBrains Mono, box lines joined?
- Palette: only the five greens and, once, the alert?
- Command: a typed `$ command` at the top of each scene?
- Hero: an object of characters, 25 to 40 cells wide, with a moving secondary?
- Numbers: block-letter digits with shadow, settling left to right?
- Voice pane: same place, words typed, current word underlined?
- System pane: log, meter and status line alive and `AI-GENERATED` clear?
- CRT: bloom, scanlines (not muddy), curve and vignette present?
- Alert: used once on a real reversal?
- Transitions: only clear, scroll or split, chrome fixed?
- Numbers: every number on screen matches the number the voice says (digits, units, rounding), read against the script?

## Pitfalls

- Box glyph rows are 40 px tall and scale-1.5 text needs 1.5 rows: count rows before stacking.
- Canvas bloom is the render cost (about 5 minutes for a 39 s film, plus a first-run browser download); do not add a fourth pass.
- vfrey's frozen-picture check can pass a canvas that only blinks: look at the contact sheet.
- `tl.call` and a tween's `onUpdate` do not run when the renderer seeks: everything is a function of `draw(t)`, painted from the setter (and `vfrey.onFrame` if you add another loop).
- Alert colour is the story: keep it for one reversal so it reads.
