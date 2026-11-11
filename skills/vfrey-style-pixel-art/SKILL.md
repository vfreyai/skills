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

<!-- style-bible: v2 -->

# Video style: Pixel art

Real pixel art: the whole film is drawn on one tiny canvas, an eighth of the frame each way (135 x 240), scaled up with hard edges, in 21 fixed colours. Sprites move in whole pixels at ten frames a second over scrolling backgrounds, with a faint scanline over everything, so it looks like a game from 1985 rather than a filter. If a frame has an anti-aliased edge, a colour outside the palette, a half-pixel position or a smooth tween, it is not this style.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML canvas + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. **Start from `starter.html` next to this file** (copy it to `scenes/<idea>/index.html`, then replace the PLACEHOLDER sprites, `INPUTS` and cue words: it already renders three scenes with `vfrey render --frame`). Code to copy is also in `helpers.md` next to this file; the music script is `make-bed.py` next to this file. Four reference frames, `ref-1.jpg` to `ref-4.jpg`, live in the package copy of this style (section 11); they are not installed into projects.

## When to use it, when not

- Use it for games and gaming history, old computers, how a machine or a rule works shown as a little game, quizzes, countdowns, scores, anything that suits a HUD and a sprite.
- Not for fine detail (a map, a face, a real product), not for serious or sad subjects (the look is playful), and not for a script in a language outside plain Latin letters: the captions use a 5x7 bitmap font that has only A to Z, digits and basic punctuation, so accents and other scripts do not draw. For those, pick another style or extend the font first.

## Plan before coding

1. Turn the idea into a game screen: who is the sprite, what is the counter, what fills the HUD. A sentence of the script is a scene or a change of state in one.
2. Plan 4 to 6 scenes with different grounds (space, a city skyline, a circuit board, a room, a neon grid) so the contact sheet does not look like one screen.
3. Anything simulated (a march, a race, a count) is computed once at load into per-frame arrays and looked up by frame number; never stepped from the previous frame.
4. Join sentences with `;` inside a line where a full stop is not needed: the free Kokoro voice pauses at each full stop, and under half a second at a semicolon. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. Cue pictures to sentences (words ending `.`, `!`, `?` or `;`), not to lines. Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 3 words a second.

## 1. The look in three sentences, and the signature traits

A dark indigo night, one canvas of chunky square pixels, lit by a yellow accent and neon sprites. A game HUD (counter, bars) and a joystick-and-buttons panel frame the action. Everything snaps: 10 fps sprites, whole-pixel scrolls, dithered skies, pixel-dissolve wipes.

Signature traits (each checkable on one frame):
1. The picture is made of visible square pixels, 8 real px each, with no smoothing or anti-aliasing on any edge or letter.
2. Only the 21 palette colours appear; a sky is a Bayer dither of two of them, never a gradient.
3. Text is the 5x7 bitmap font, upper case, 1 px letter gap; big numbers are the same font at scale 2 to 3 with a 1 px dark outline and a hard offset shadow.
4. A game HUD sits under the top 25 canvas rows: label in grey, number in yellow, a bar of orange or cyan ticks.
5. A control panel (stick, three coloured buttons, a "1UP" blinker) or an equivalent foreground fills the bottom, never empty ground.
6. Sprites are 8x8 two-frame strings; heroes and finales are drawn at 2x to 5x.
7. Stars in three layers scroll at 3, 8 and 18 px per second in whole pixels; twinkles flick to dark grey.
8. A neon perspective floor grid (pink horizon, indigo radiating lines) or a skyline with lit windows gives depth.
9. A faint scanline (one dark row per canvas row) and a soft vignette lie over the whole canvas.
10. The caption plate is near-black with a 1 px indigo border, a hard 2 px indigo shadow, pixel words in white, the spoken word in yellow.
11. Scene changes are pixel wipes (Bayer dissolve, blinds, diamond iris, falling columns), 0.34 s.
12. Nothing is positioned at a fractional pixel.

## 2. Palette

| Key | Hex | Role |
| --- | --- | --- |
| `k` | `#0d0b1e` | ground black, outlines, plate fill |
| `n` | `#1b1744` | deep indigo, sky bands, plate shadow |
| `i` | `#2a2257` | mid indigo, far skyline, panel |
| `p` | `#3b2a7a` | light indigo, near skyline, floor lines |
| `l` | `#6a5acd` | indigo highlight, plate border, horizon glint |
| `w` | `#f4f1ff` | white text, highlights, hero body |
| `g` | `#9aa0c8` | grey text, labels, metal |
| `d` | `#4a4e7a` | dark grey, dim stars, bezels |
| `y` | `#ffd23f` | the accent: numbers, active word, what matters now |
| `o` | `#ff8a1f` | orange: bars, flame, number shadow |
| `r`, `e` | `#ef3b4e`, `#8e1f3d` | red, dark red: danger, heart, stick |
| `m` | `#ff6fb5` | pink: neon sprites, horizon line |
| `a`, `f` | `#3be07a`, `#138a5a` | green, dark green: board, sprites |
| `c`, `h` | `#36d6e7`, `#1b8fa0` | cyan, dark cyan: sprites, bars |
| `b`, `u` | `#2b7bff`, `#1a3f9c` | blue, dark blue: sky, screens |
| `t`, `s` | `#e0a878`, `#7a4a33` | skin and wood |

Ratios: indigo ramp (`k n i p l`) at least 60% of any frame; yellow at most 8% and only for the thing that matters now; neon (`m a c b r`) on subjects only, at most 20%. A brand colour from `brand.json` replaces the accent `y`, nothing else. Never use pure `#000`/`#fff`, a gradient, a colour mixed by alpha, or a 22nd colour (the only exception is the overlay scanline and vignette in the DOM).

## 3. Shapes and line

- One `<canvas>` of frame / 8 (135 x 240 at 1080 x 1920) with CSS `width: 100%; height: 100%; image-rendering: pixelated`. Everything is `fillRect` on integers: `R(x, y, w, h, c)`, `P(x, y, c)`; round every coordinate.
- Lines are 1 px (borders, grid, outlines). A 2 px line is a bar edge. Corners are square; a "rounded" corner is the missing corner pixel. Outlines are `k`, 1 px, drawn by the sprite's own letters.
- Edge treatment: a hard 2 px drop shadow in `n` under plates; 1 px highlight rows in `l` or `g` on top edges, `k` under.
- Textures: Bayer 8x8 dither for skies (`ditherBand(y0, y1, cA, cB)`), skyline windows lit where `(wx * 7 + wy * 13 + seed) % 5 < 2`, a floor of horizontal lines at `y = horizon + k * u * u`, circuit traces as 1 px `a` lines with moving 1 px `y` pulses.
- Light: top-left. A sprite has a body colour `x` and a shade `z` on its lower-right; there is no cast shadow except a 1 px dark row under big props.
- The CRT layer (DOM, faint): `repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 6px, rgba(0,0,0,.13) 6px 8px)` plus `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 62%, rgba(0,0,0,.30) 100%)`.

## 4. Characters and objects

A sprite is a list of equal-length strings: `.` is transparent, letters are palette keys, and one recolour map (`{ x: "c", z: "h" }`) lets a body shape serve several characters. Characters are 8 x 8 (head 3 rows, body 3, legs 2; two eyes `w` with a `k` pupil; no mouth at this size) with two frames for a walk or flap; a hero is drawn at 2x to 5x; a person (the desk worker in the reference) is 16 x 24 with a head 8 high, a blue torso, one arm reaching and 2 px hands.

```js
const ALIEN = [ [ "..xxxx..", ".xxxxxx.", "xxwxxwxx", "xxkxxkxx", "xxxxxxxx", ".x.xx.x.", ".x.xx.x.", "x..xx..x" ],
                [ "..xxxx..", ".xxxxxx.", "xxwxxwxx", "xxkxxkxx", "xxxxxxxx", ".x.xx.x.", "x.x..x.x", ".x....x." ] ];
S(ALIEN[tick(t) % 2], x, y, { x: "c", z: "h" });        // frame by the 10 fps clock, whole-pixel x and y
SS(SHIP, x, y, 2);                                      // the same, scaled by a whole number
```

Stock sprites and props (all palette-only): 1. alien or bee (8x8, two frames); 2. ship (9x8, `w` body, `r` wings, `c` cockpit) with a two-frame flame; 3. explosion (three 9x9 frames, `y`, `o`, `r`); 4. heart (11x10, `r` with a `w` glint, `e` shade); 5. light bulb or coin (9x10, `y`); 6. arcade cabinet (97 wide: `p` body, `k` screen frame, marquee in `y`/`o`); 7. CPU chip (24x24, `i` body, `d` pins as 1 px dots, a label); 8. monitor (`d` bezel, `n` screen, a stand); 9. control panel (stick `g` with `r` ball, buttons `y` `m` `c` in 15x15 bezels); 10. circuit board (`f` ground, black chips with white labels, `y` pins).

## 5. Typography

| Role | Font | Size (canvas px = 8 real px each) | Colour |
| --- | --- | --- | --- |
| HUD label | 5x7 bitmap | scale 1 (7 rows, 56 real px) | `g` |
| HUD number | 5x7 bitmap | scale 2 (14 rows) with a `k` outline | `y` (`r` when danger) |
| big title or year | 5x7 bitmap | scale 3 with `k` outline and a 2 px `o` offset shadow | `y` |
| caption words | 5x7 bitmap | scale 1 | `w`, spoken word `y` |
| tiny tags | 5x7 bitmap | scale 1 | `g` or `d` |

No web fonts anywhere (the bitmap font is in `helpers.md` and `starter.html`). Upper case only, 1 px letter gap (width of a string is `6 * n - 1`). Caption plate: 15 canvas rows tall, centred in the caption band (`vfrey.captionBox`, about y = 161 at the bottom position), at most 3 words and 17 characters per phrase, 5 px inner padding, a `k` fill with a 1 px `l` border (`y` for the first 0.12 s of a phrase), a hard 2 px `n` shadow, x centred at 47% of the width to stay off the right rail. The active word is `y` and bobs up 1 px for 0.1 s; the plate never changes height.

## 6. Composition

- Caption band: vfrey exposes it as `--vf-caption-at` and `--vf-caption-h` and as `vfrey.captionBox`; read it, never type its pixels.
- Safe area: the top 25 canvas rows carry no text (platform UI); the right 13% carries no text; the bottom-right corner (x from 86, y from 225) stays clear for the `AI-GENERATED` label.
- Grid: 135 x 240 canvas split into HUD (y 24 to 54), play field (y 56 to 156), plate band (y about 153 to 168), panel (y 180 to 240). Subjects centre on x = 67 or the thirds (45, 90).
- Subject scale: subjects are large, the hero is 8x8 at 2x to 5x (16 to 40 px, 7% to 17% of the canvas height) or a prop of 16 to 60 px; a crowd uses 8x8 sprites; nothing is smaller than 8 px unless it is a bullet or a spark.
- Layers: far skyline or stars (slowest), mid skyline, play field, floor or panel in front. Depth comes from scroll speed (3, 8, 18 px/s) and a perspective grid, never from scaling.
- Captions always sit on the plate, never over a sprite or prop, and nothing that matters is drawn behind the plate. The bottom is never empty: the panel, a circuit board, a floor with props or the neon grid runs to the bottom edge. If the script turns captions off (`vfrey.timing.captions.mode` is `off`), draw no plate.

Shot types (`HUD` top bar, `P` plate):
```
TITLE DROP             PLAY FIELD             CHIP / SCHEMATIC       ROOM CUTAWAY           PAYOFF PEDESTAL
+------------+         +------------+         +------------+         +------------+         +------------+
|  1 9 7 8   |         |ALIENS  54  |         |   [CPU]    |         | window     |         |   1UP      |
| ARCADE     |         | oo oo oo   |         | [monitor]  |         |  o  desk   |         |   <3 big   |
|   sprite   |         | oo oo oo   |         |  ONE FRAME |         |  person    |         |  ======    |
|~grid floor~|         |   /\ ship  |         |~~~~~~~~~~~~|         |~brick wall~|         |~grid floor~|
|[  P  ]     |         |[  P  ]     |         |[  P  ]     |         |[  P  ]     |         |[  P  ]     |
|stick  btns |         |stick  btns |         | ROM RAM IO |         | rug + cat  |         |stick  btns |
+------------+         +------------+         +------------+         +------------+         +------------+
```

## 7. Motion

- Feel: stepped, 10 fps for sprites, 30 fps whole-pixel steps for scrolls; no sub-pixel anything.
- Sprite clock `tick(t) = floor(t * 10)`; walk and flap frames use `tick(t) % 2`; blinkers use `tick(t) % 6 < 3` (a 0.6 s cycle).
- Entrances are stepped eases: `floor(eo(u) * 6) / 6` over 0.3 to 0.9 s (a title letter drops 40 px in 0.4 s, letters 0.12 s apart); a pop is a white 8x8 block for 0.1 s, then the sprite.
- Emphasis: a 1 px bob (`[0, -1, -2, -1][tick % 4]`), a blink, a 4-tick screen shake with integer offsets `[2, -2, 1, -1, 0]`, a `y`/`w` flash for 0.1 s.
- Exit: the wipe, or a stepped slide off in 4 steps. Holds: a payoff holds 1.5 s or more, the last picture holds to the end.
- Camera: none; there is no zoom or pan. Parallax scroll offset is `floor(t * speed)`.
- Ambient: stars (three layers), twinkles, window flicker, floor-grid scroll `(t * 0.7) % 1`, panel stick leaning every 6 ticks, `1UP` blinking.
- Simulations (a march, a count) are precomputed per frame into arrays and read by `floor(t * 30)`.
- Forbidden: easing curves with fractional positions, fades, scaling by non-integers, rotation, blur, smooth camera moves, motion that is not a function of `t` (no `Date.now`, no unseeded random; use `rng(seed)`).

```js
const clock = { t: 0 };
tl.to(clock, { t: DUR, duration: DUR, ease: "none" }, 0);   // live preview clock
vfrey.onFrame((t) => { clock.t = t; draw(t); });            // what a render runs: draw is a pure function of t
```

## 8. Transitions

Drawn as a one-pixel-per-cell overlay (`cover(kind, colour, amount, second)`), 0.34 s total (`HALF = 0.17`), peak cover 0.15 s before the next sentence so the picture leads the voice. Allowed: 0 Bayer dissolve in `k`; 1 venetian blinds in `p` (12-row bands); 2 diamond-cell iris (9-px cells, reversed on the second half so it opens from the centre) in `k`; 3 falling columns. Rotate them, never repeat one twice in a row. Forbidden: fades, slides, anything with partial alpha, a bright flash (a yellow Bayer flash is loud: shorten it to 0.16 s half-width).

## 9. Sound

Chiptune bed: a 25%-duty pulse lead playing a 4-bar melody, a 4-bit-stepped triangle bass on 8ths, noise kick, snare and hat, in a minor key around 120 to 140 bpm, steady and cheerful; it slows when the story slows and quickens when it quickens. Accents: `blip` for a pickup or count, `zap` for a shot, `boom` for an explosion, `coin` for a win, `jingle` at the payoff. Mix: `volume: -20` with `duck: true`, the bed 20 dB under the voice.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with the accents (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-pixel-art/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey pixel art style)", "volume": -20, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (30 to 40 s)

| Time | Beat | Shot type | Content |
| --- | --- | --- | --- |
| 0 to 4 s | hook | TITLE DROP | the number or year drops in over the neon grid, hero sprite 3x, panel below |
| 4 to 12 s | setup | PLAY FIELD | the sprite crowd and the HUD counter begin; one rule shown as a game rule |
| 12 to 20 s | mechanism | CHIP / SCHEMATIC | the inside of the thing: a board, a screen, a bar filling, cued per sentence |
| 20 to 28 s | complication | ROOM CUTAWAY or PLAY FIELD | the person or the swarm reacts; the counter changes colour to `r` at danger |
| 28 to 36 s | payoff | PAYOFF PEDESTAL | one big sprite on a striped pedestal, "1UP" or the final number |
| last 2 s | close | PAYOFF PEDESTAL | holds to the end |

## 11. Reference frames

Saved in this style's package folder (not installed into projects): look at them before drawing.
- `ref-1.jpg` the hook: copy the big stepped-in title digits with the orange offset shadow, the arcade cabinet, the pink-horizon grid floor and the plate with a yellow active word.
- `ref-2.jpg` the play field: copy the HUD (grey label, yellow 2x number, orange and cyan tick bars), the alien rows with whole-pixel marching, the 2x ship and the joystick panel below the plate.
- `ref-3.jpg` a room cutaway: copy the night window with a skyline, the brick wall and wooden desk below the plate, 16x24 person sprite and the background cat; foreground never empty.
- `ref-4.jpg` the payoff: copy the pedestal with orange, yellow and pink stripes, the CPU chip with a heart, the grid floor with reflections, the plate.

## 12. Reference implementation

`starter.html` next to this file: a 135 x 240 canvas with the 21-colour palette, the bitmap font, three scenes (title drop with a hero sprite, a play field with a counting HUD and a swarm, a payoff pedestal), the control panel, the four pixel wipes, sentence and word cues by text, and captions on the pixel plate. Replace the sprites and the `INPUTS` object, keep the draw loop. It renders with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 4 out.png`.

## 13. Do, don't and the final checklist

Do:
1. Draw on one 135 x 240 canvas with integer `fillRect`s only.
2. Use the 21 palette letters and nothing else.
3. Dither skies with the Bayer matrix.
4. Run sprites on `tick(t) = floor(t * 10)`.
5. Scroll parallax in whole pixels (`floor(t * speed)`).
6. Fill the bottom with a panel, board, floor or grid.
7. Keep a HUD under the top 25 rows with a counter that computes from real inputs.
8. Draw the hero and the last image at 2x or more.
9. Cue pictures to sentence starts found in `vfrey.timing`, never fixed seconds.
10. Keep every function a pure function of `t`; seed any random with `rng`.

Don't:
1. Use gradients, anti-aliased text or web fonts.
2. Position anything at a fractional pixel.
3. Tween smoothly (no fades, no zooms, no rotation).
4. Put text in the top 25 rows or the right 13%.
5. Cover the bottom-right label corner.
6. Draw captions over sprites or props.
7. Use accents or non-Latin letters in the bitmap font.
8. Flash yellow at full-frame for longer than 0.16 s.
9. Leave a scene with no foreground art under the plate.
10. Use `Date.now()` or unseeded `Math.random()`.
11. Animate the plate's height.

Final checklist, run on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; an even sample can land inside a wipe, so also check stills at the beat times with `--frame <t>`). One line per signature trait:
- Visible square pixels, no soft edges anywhere.
- Only palette colours; skies are dithers.
- All text is the bitmap font in upper case, big numbers outlined.
- A HUD under the top rows with a grey label and a yellow number.
- A panel, board or floor fills the bottom in every tile.
- Sprites are crisp 8x8 (heroes 2x or more), stepped.
- Three star layers or skyline layers give depth.
- A neon grid or skyline with lit windows is present in the background tiles.
- Scanlines and vignette faintly visible, never heavy.
- Plate dark with a 1 px border, same place and height in every tile, words on it, none over art.
- Wipes are the four pixel types.
- Nothing in the top 25 rows or in the bottom-right label corner.

Pitfalls from real runs: vfrey adds its `AI-GENERATED` label bottom right (canvas x 86 to 126, y 225 to 233); `tick` starts a dashboard unless it is disabled for the run; use `--rerender` when re-running with the same script; a yellow Bayer flash is loud; a sampled sheet often lands mid-wipe; empty plate frames look broken, so never animate the plate height.
