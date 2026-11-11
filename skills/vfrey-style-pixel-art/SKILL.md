---
name: vfrey-style-pixel-art
description: "Use when the chosen video style is Pixel art (vfrey-style-pixel-art), or the person asks for a pixel art, 8-bit, 16-bit, retro game, arcade or chiptune look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: one real low-resolution canvas, a strict palette, text sprites, stepped animation, parallax, pixel-font captions on a plate in the caption band, pixel wipes and a generated chiptune bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Pixel art
  style-summary: A retro video game look with chunky pixels, little animated characters and chiptune music.
  style-best-for: gaming, retro tech, tech explainers, trivia, quizzes, nostalgia
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Pixel art

Real pixel art: the whole film is drawn on one tiny canvas, an eighth of the frame each way, scaled up with hard edges, in about twenty fixed colours. Sprites move in whole pixels at ten frames a second over scrolling backgrounds, with a faint scanline on top, so it looks like a game from 1985 rather than a filter.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML canvas + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for games and gaming history, old computers, how a machine or a rule works shown as a little game, quizzes, countdowns, scores, anything that suits a HUD and a sprite.
- Not for fine detail (a map, a face, a real product), not for serious or sad subjects (the look is playful), and not for a script in a language outside plain Latin letters: the captions use a 5x7 bitmap font that has only A to Z, digits and basic punctuation, so accents and other scripts do not draw. For those, pick another style or extend the font first.

## Plan before coding

1. Turn the idea into a game screen: who is the sprite, what is the counter, what fills the HUD. A sentence of the script is a scene or a change of state in one.
2. Plan 4 to 6 scenes with different grounds (space, a city skyline, a circuit board, a room, a neon grid) so the contact sheet does not look like one screen.
3. Anything simulated (a march, a race, a count) is computed once at load into per-frame arrays and looked up by frame number; never stepped from the previous frame.
4. Join sentences with `;` inside a line where a full stop is not needed: the free Kokoro voice also pauses at each full stop, and under half a second at a semicolon. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. Cue pictures to sentences (words ending `.`, `!`, `?` or `;`), not to lines.

## Palette and type

- 21 colours with single-letter keys, and nothing outside them: an indigo ramp for grounds (`k #0d0b1e`, `n #1b1744`, `i #2a2257`, `p #3b2a7a`, `l #6a5acd`), three greys (`w #f4f1ff`, `g #9aa0c8`, `d #4a4e7a`), one warm accent (`y #ffd23f`, with `o #ff8a1f`), and neon subject colours (`r`, `e`, `m` pinks and reds, `a`, `f` greens, `c`, `h` cyans, `b`, `u` blues, `t`, `s` skin and wood). The full table is in `helpers.md`. A brand colour (`brand.json`) replaces the accent `y`; keep the count.
- Dark indigo ground, yellow for what matters now, neon for subjects. No gradients: a sky is a Bayer dither between two colours.
- Type is the 5x7 pixel font in `helpers.md`, drawn on the canvas, upper case, at scale 1 (HUD labels) or 2 to 3 (big numbers). No web fonts anywhere.

## Drawing approach

- One `<canvas>` sized frame / 8 (135x240 for 9:16), CSS `width:100%; height:100%; image-rendering: pixelated`. Everything, captions and transitions included, is integer `fillRect`s on it: `R(x, y, w, h, colour)`, `P(x, y, colour)`. Round every coordinate.
- Sprites are arrays of strings, `.` transparent and letters palette keys: `S(sprite, x, y, recolourMap)`, `SS(sprite, x, y, scale)`. Draw two frames per sprite for a walk or flap. A recolour map (`{x: "c", z: "h"}`) lets one sprite serve several characters.
- Sizes: 8x8 sprites only where a crowd matters. The hero, explosions and the last image are drawn at 2x or 3x, and props are big (16 to 60 canvas pixels).
- Backgrounds are procedural and seeded: three star layers, skylines with lit windows, a perspective floor grid (horizontal lines at `y = horizon + k * u * u`, verticals from a vanishing point), a circuit board with chips and moving pulses.
- `draw(t)` is a pure function of time: it clears nothing it does not redraw, picks the scene for `t`, draws it, then the transition overlay, then the captions. One timeline tween on a proxy clock calls it.
- A faint CRT layer goes over the canvas in the DOM: one dark scanline per canvas row and a soft vignette. Keep it faint.

## Full frame around the caption band

vfrey's caption band (`--vf-caption-at`, `--vf-caption-h`) is centred near 70% of a 9:16 frame when the position is bottom. This style draws its own captions, so read the band from `vfrey.captionBox` and put the pixel plate there (`helpers.md` does this); it then follows the person's caption position. Compose every scene around it:

- Top 10% (25 canvas rows): no text; platform UI covers it. The HUD (counter, bars) starts right under it.
- Hero zone down to the plate: the play field, large. If the subject is a single thing, draw it at 2x or 3x and centre it.
- The caption plate: a dark plate with a 1 px border and a hard 2 px drop shadow, pixel-font words on it, the spoken word in yellow. The plate keeps one height and one place for the whole film. Captions are always on the plate and never over a sprite or a prop: nothing that matters is drawn behind it.
- Below the plate to the bottom edge: never empty. Every scene has foreground art there: a control panel whose stick and buttons react to the action, a circuit board, a floor with a rug and props, a neon grid with reflections.
- Bottom-right corner (from 64% across, the last 6% of the height) stays clear for the `AI-GENERATED` label, and the right 13% carries no text.
- If the script turns captions off (`vfrey.timing.captions.mode` is `off`), draw no plate.

## Motion rules

- Sprite animation clock is `floor(t * 10)`: ten frames a second. Positions are whole pixels: entrances step (`floor(ease(u) * 6) / 6`), parallax scrolls by `floor(t * speed)` at 3, 8 and 18 pixels a second.
- Screen shake is a whole-pixel offset for four ticks. A hit is a three-frame explosion sprite. The spoken word bobs up one pixel for a tenth of a second.
- Cue every change to a spoken word's start time, never a fixed second: the real voice differs from the estimate, so check again after the first full render.
- Subject on screen within 0.3 s of each sentence starting; something changes at least every ten frames of the sprite clock; the last picture holds 1.5 s.

## Transitions

Pixel wipes drawn as an overlay with a threshold per pixel, 0.3 to 0.55 s in all, peaking 0.15 s before the next sentence so the picture leads the voice: a Bayer dissolve, venetian blinds, a diamond iris of 9-pixel cells (reversed on the way out so it opens from the centre), falling columns. Use dark cover colours; a yellow flash is loud, so keep it to one short use.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a chiptune for this look (pulse lead, stepped triangle bass, noise drums) with game sounds as accents: `blip`, `zap`, `boom`, `coin`, `power`, and `tempo` points so the music speeds up and slows down with the story. It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are sentences, words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-pixel-art/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey pixel art style)", "volume": -20, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed at one tempo before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480:flags=neighbor,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the sentence starts (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: is there art below the caption plate down to the bottom edge, is the subject large, is the plate in the same place and clear of sprites?
3. Zoom into a still: are all edges hard (no blur, no half pixels), and every colour from the palette?
4. Are there at least three different grounds across the sheet?
5. Do the captions spell every word (no missing accented letters)? Is the label corner clear?

## Pitfalls

- Fractional coordinates blur the look: round in the primitives, not at the call sites.
- An empty caption plate between phrases looks broken: draw the plate only while a phrase is on.
- Unseeded `Math.random` or `Date.now` makes frames differ between preview and render: use the seeded `rng`.
- A canvas with CSS smoothing on (`image-rendering` missing) turns everything soft.
- The scanline period must match the scale (one line per canvas row), or it shimmers.
- Do not copy the look or the characters of a real game: draw your own sprites and never use a game's name or art.
