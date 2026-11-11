---
name: vfrey-style-kinetic-type
description: "Use when the chosen video style is Kinetic type (vfrey-style-kinetic-type), or the person asks for a kinetic typography, title-sequence, words-fill-the-screen or lyric-video look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: giant serif words that slam, stretch, rotate, stack and fill with marble in time with the voice, three colours, two typefaces, vfrey's own captions switched off and a generated drone and hit bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Kinetic type
  style-summary: Huge words that fill the screen and move with the voice, like the opening titles of a film.
  style-best-for: motivation, quotes, philosophy, poetry, book summaries, opinion, speeches
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Kinetic type

The words are the picture: giant serif lettering in ink, bone and one hot red slams, stretches, rotates and stacks to the beat of the voice, on flat colour grounds with a little marble. No illustration at all; every frame has to work as a poster.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the type-measuring script is `measure-type.cjs` next to this file; the sound script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for ideas that live in the sentence: a quote, a principle, advice, a poem, an opinion, a speech, a book's argument. Short, strong lines work best.
- Not for anything that needs a picture of a thing, a chart, a map, a product or a face, and not for dense facts or long lists: giant words carry six to ten words a shot, not twenty.

## Plan before coding

1. Split the script into 6 to 9 ideas, one shot each. Mark the one word or phrase that carries each idea; that is the giant word.
2. For each shot pick a move: a stack of 3 to 5 words fitted to one width, a long word rotated 90 degrees, a wall of one word repeated, an outline echo, a question mark or numeral as a shape, a spiral of a repeated phrase, or a tunnel of words in depth (for fast speech).
3. Give each shot a ground (ink, bone or red) and alternate them so no two cuts in a row look alike.
4. Words on screen are the script's words. A source, name or date goes in a small mono tag, and only if you can cite it. Numerals are fine; never invent a statistic or a quote.
5. Script pace: the free Kokoro voice also pauses at commas and colons. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; use each pause for a second motion (rings, marble drift, a slow rotate). A deeper voice suits the look; the voice is the person's setting, so suggest it rather than switch it.
6. In the script set `"captions": "off"` (see the next section).

## Palette and type

- Three colours only: ink `#0e0d0c`, bone `#ece6d8`, red `#e8391d`. Grounds are flat ink, bone or red; type is another of the three. No gradients on grounds (they band). If the brand has an accent (`brand.json`), it replaces the red; still only one.
- Two typefaces, both already in `vfrey/fonts`: Playfair Display 900 (upright caps for slams, 900 italic lowercase for soft or emotional words) and JetBrains Mono 500, uppercase, tracked .14em, for tags, counters and sources. Add `font-variant-numeric: lining-nums` to caps (Playfair's default numerals are oldstyle).
- Marble is the only texture: a seeded canvas clipped to a word with `background-clip:text`, drifting sideways while the word shows (`helpers.md`). Three kinds: red with dark veins, ink with red veins, bone with ink veins. Keep it off small words.
- Scale contrast in every shot: one giant word (60 to 100% of the frame width, stretched) against one small mono line.

## Drawing approach

- Each shot is `div.shot > div.cam`, with words made by `W()`: a `div.wd` GSAP moves around an absolutely placed `span.in`, at `line-height:.71` so `y` is the visual centre of the caps.
- Fit type from a measured table, never at run time (fonts load after the scene script runs). Run `node .agents/skills/vfrey-style-kinetic-type/measure-type.cjs scenes/<idea>` after the first render or preview and again whenever a string changes; it writes `scenes/<idea>/meas.js`, which the scene loads with `<script src="meas.js">`. Strings that reach `W()` from a list go in a `/* meas U: A | B */` comment.
- `W()` sets the font size from a target width, then stretches to a target cap height with `scale(1,sy)`. Stretch up to about 3x is the look; beyond that split the word (TOR / MENT) or rotate it. Italic lowercase stretches further than caps.
- Other shapes: rings behind a giant glyph, a plate under a mono line, a split screen of two colour blocks, outline copies above and below a solid word, a spiral on an SVG `<textPath>`. A static multiply grain canvas (opacity .10, 270x480 scaled up) gives paper feel at no bitrate cost.

## Full frame around the caption band

This style turns vfrey's captions off by design: the lettering already says the words, and a second line over it looks cheap. In the script set `"captions": "off"` (`skills/vfrey-product/captions.md`); the scene still renders, `vfrey.captions` is not called, and the `.srt` and `.vtt` files are still written beside the MP4 for uploading. Without that field vfrey would draw its band (`--vf-caption-at`, `--vf-caption-h`, about 70% down a 9:16 frame) over the type.

- Subjects are large: the giant words span the frame's width and a third to a half of its height, and rows run from the top safe edge to the bottom edge. Nothing is pulled up to leave a gap for a band.
- The scene's own type continues to the bottom edge: the last row, plate or mono tag sits in the lower third, where the band would be (`--vf-caption-at`, `vfrey.captionBox`). It stays readable and inside `--vf-safe-left` and `--vf-safe-right`; the line you most want read goes there.
- Captions sit on a plate if the person turns them back on: a solid ink or bone block behind them in the band, never over a giant word or a focal shape, the same position all through. Leave flat ground or a colour plate in that zone for it to land on.
- Keep the bottom-right corner clear for the `AI-GENERATED` label: nothing below about 94% of the height and right of about 63% of the width. Past the right 13% of the frame, keep small text out of the lower half (platform buttons).
- Frames with more than half flat colour for over 0.7 s need a ghost, an outline echo or a colour block growing under the next word.

## Motion rules

- Cut on the voice: a word lands 0.04 s before it is spoken (`slam`: scale from 1.9 to 2.6 down to 1, 0.26 to 0.35 s `expo.out`, with `shake` of the whole shot). A shot starts at the first word of its idea minus 0.1 s.
- Every shot also gets `push` (scale 1 to 1.05 to 1.08 over its length). Titles land dead still; the world around them moves.
- Enter with `power4.out` from off-frame; exit by whipping up with `power3.in` (`y: "-=2300"`, in px; `yPercent` does nothing on a zero-height wrapper). Reveal with a clip-path mask (`rise`) or a colour flood (`inset(100% 0 0 0)` to `inset(0)`, or a growing `circle()`).
- One word a beat in fast speech (0.15 s words): stack or tunnel so the picture keeps up. In pauses, give the picture a second motion.
- In the tunnel, opacity is a pure function of depth written by one updater; never also tween opacity on those layers.

## Transitions

One kind, with a cause: two slanted slabs (`skewX(-10deg)`, 150% wide, an accent colour then the incoming ground) sweep across in 0.14 to 0.16 s and exit in 0.26 s; the swap happens while the first covers the frame. Inside a shot, grounds change by clip-path flood and by whipping the old words off. Never crossfade.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a bed for this look: a low D-minor drone, a quiet pad with an echo and a breath of air, with a `slam` (a deep thud, a click and a burst) for each word that lands, a `whoosh` for each wipe and a `tick` for each small tag. It needs `python3` and `ffmpeg` (vfrey already needs ffmpeg), downloads nothing and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene cuts on), then from the project folder: `python3 .agents/skills/vfrey-style-kinetic-type/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey kinetic type style, ffmpeg)", "volume": -12, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the slam times (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. Look at it the size of a phone: does every tile read as a poster, with one giant word and one small line? Is any word cropped by the frame, or a stretched word more than about 3x?
3. Is the script `"captions": "off"` and the `.srt` written? Is any text in the bottom-right corner or past the safe edges?
4. Is any frame more than half flat colour for over 0.7 s? Is any wipe slab left on screen later in the film?
5. Is every word on screen in the script, and every source or date one you can cite? A `frames.text-overlap` warning on stretched stacked words is expected (their boxes overlap, the glyphs do not).

## Pitfalls

- Measuring fonts in the scene: the build is synchronous and fonts load late. Use the offline table, and rerun `measure-type.cjs` after any text change; a missing string logs `no meas`.
- Upright caps stretched past 3x turn to caricature. Split the word or rotate it.
- Slab wipe: with `left:-160%; width:150%`, full cover needs `xPercent` 90 and the exit goes to 190. Set it back with `tl.set` after.
- GSAP opacity tweens and an `onUpdate` that writes `style.opacity` fight; give 3D layers only the updater (also called from `vfrey.onFrame`, since a render does not fire `onUpdate`), and keep rotated layers about 80% of the frame width so they are not cropped.
- A shot with no `shake`, `push` or second motion in a pause feels dead; the voice's pauses are real and cannot be trimmed.
- A `captions.style` in the script does nothing when captions are off, and vfrey's default template ignores the setting; this style is always a scene.
