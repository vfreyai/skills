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

# Video style: Terminal / ASCII

A phosphor-green computer screen that is nothing but text: a monospace grid, box-drawing frames, typed commands, block-letter numbers, scrambling characters and split panes, finished with glow, scanlines and a slight screen curve.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html` plus `cues.js`, one `<canvas>`, GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file and reads the same `cues.js` as the picture.

## When to use it, when not

- Use it for code, security, maths and numbers, developer tips, any how-it-works with steps, a comparison (two bars racing in split panes) or a count that grows.
- Not for stories about people and feelings, not for anything that needs photographs, colour or soft shapes, and not for long film at high effort: the canvas bloom is the cost (about 5 minutes for a 39 s film, plus a first-run browser download).

## Plan before coding

1. Write the script as 4 or 5 lines; each line is one tab and one scene. vfrey needs the `--about` subject words in the script, so use two distinctive nouns.
2. Each scene has its own command typed at the top (`$ command`), one hero object drawn from characters, and one secondary that moves (a shackle opens, dice rattle, a bar fills).
3. Pick the transition for each change (`clear`, `scroll`, `split`) and the one moment for the alert colour (a loss, a breach, a wrong answer).
4. Write `cues.js` first: every typed command, beep, boom and transition gets an id anchored on a line or a word. The picture and `make-bed.py` read the same sheet, so sound lands on what is drawn.
5. A number on screen is one you can cite or compute; mark an assumption as an assumption in the log pane.

## Palette and type

- Five greens and one alert: `bg #020805`, ghost `#0b5c2c`, dim `#149246`, main `#2ee872`, hot `#d6ffe4` (the thing to read), alert `#ff5038` / `#8f2417` used once or twice a film. Amber is a valid swap if you change the five values together; `brand.json` wins if set.
- JetBrains Mono only. Call `document.fonts.load('500 33px "JetBrains Mono"')` and redraw when it resolves, or the first frames use a fallback font.

## Drawing approach

- The whole film is one 1080 x 1920 canvas on a grid of 52 columns, base cell 20 x 40 px. A single GSAP tween drives a setter that calls `draw(t)`; nothing else animates, so every frame is a pure function of time.
- `put(x, y, str, {s, c, a, inv})` places text by cell (scale `s` multiplies the cell), `putC` centres, `putR` right-aligns, `inv` is inverse video. Draw box-drawing and block glyphs as rectangles in `glyph()` so lines join with no gaps at any scale; dither blocks are 4 x 8 dot grids.
- Build objects 25 to 40 cells wide from block glyphs and dither (a padlock, a key, dice with pips, a framed word list) and animate a second property on each.
- Block-letter numbers use a 5 x 7 pixel font, one square per pixel with a one-cell drop shadow; count up with random digits that settle left to right (`scram`). Progress bars use `█` over a `░` track.
- No `Date.now`, no `Math.random`: use the `hash(n)` sin-hash so frames repeat exactly.
- Composite: a faint radial green glow, the text layer, the same layer added blurred 7 px at 0.62 and 26 px at 0.34 (phosphor bloom), a slow refresh band, then a barrel curve by scaling 8 px strips. Scanlines, vignette and glare are CSS overlays; keep scanline alpha at or under .26.

## Full frame around the caption band

Fixed chrome, captions never move: a tab bar (rows 0 to 2), the scene area, a `voice` pane for the words, then a system pane (a log tail on the left, a bouncing level meter on the right) and a status line with the `AI-GENERATED` label to its right. vfrey's band (`--vf-caption-at`, `--vf-caption-h`, near 70% of a 9:16 frame) is where the voice pane sits, so move `MAIN_ROWS` and the panes together if the caption position is not the bottom.

- The scene area uses every row down to the voice pane, and its subjects are large: objects 25 to 40 cells wide, numbers 30 px per pixel. The system pane runs to the bottom edge, so the frame is never empty.
- This style draws its own captions: words type into the `voice` pane at their `start` time, the current word underlined and a blinking block cursor after the last letter, in groups of at most 2 rows of 22 characters, never across a script line. Captions sit on a plate: the framed `voice` pane. Honour `vfrey.timing.captions.mode === "off"` by drawing the pane empty.
- Never put a chrome row on the same row as a box border: shift the content, not the frame. Keep the bottom-right corner clear for the label.

## Motion rules

- Everything is eased (`eo`, `eio`, `back`), linear only for the clock. Each beat has a primary (the number or object), a secondary (scramble, glow flash, inverse-video label) and ambient life (cursor blink, level meter, log tail, rain, a scan band).
- A big reveal is a white flash (`h` at 0.45 alpha fading in 0.4 s) plus a boom. Typed text runs at 30 to 36 characters a second.
- Subject on screen within 0.3 s of each line starting; the last frame holds 1.5 s with the cursor still blinking.

## Transitions

Scene changes are terminal operations, each about 0.42 s, started about 0.5 s before the line so the new scene is up when the voice begins: `clear` (a bright `█ ▓ ░` bar wipes down, the old scene clipped below it, the new one above), `scroll` (the scene area scrolls up by its own height) and `split` (a `━` rule opens across the middle and the old halves slide apart). Draw both scenes in the same frame with `clipRows`.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a quiet bed (an A-minor drone, a slow pad, a dark square-wave arpeggio and soft hats at 96 bpm) plus accents: `type` (a click per typed character), `tick`, `beep`, `ok`, `alert`, `boom`, `whoosh` (put one on every transition) and `roll` (dice). It needs only `python3` (standard library, no downloads) and always writes the same file for the same input. Run it again after any render that changes `timing.json`.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the same `cues.js` the scene reads; add `"gain"` per cue and `"at"` for absolute times), then from the project folder: `python3 .agents/skills/vfrey-style-terminal/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey terminal style)", "volume": -14, "duck": true}` and make it again with `--rerender`. If the run warns `audio.voice-clear`, lower `volume`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the sentence starts (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: are the objects large and made of characters, is the voice pane in the same place, is the bottom pane alive?
3. Is the text sharp under the glow (scanlines not muddy), and are box lines joined?
4. Is the alert colour used once, on a real reversal?
5. Do typed commands finish before the voice reaches what they show?

## Pitfalls

- Box glyph rows are 40 px tall and scale-1.5 text needs 1.5 rows: count rows before stacking.
- A note on a box-border row is clipped: shift the content, not the frame.
- Canvas bloom is the render cost; do not add a fourth blur pass.
- vfrey's frozen-picture check can pass a canvas that only blinks: look at the contact sheet.
- `tl.call` does not run when the renderer seeks: everything is a function of `draw(t)`.
- Alert colour is the story: keep it for one reversal so it reads.
