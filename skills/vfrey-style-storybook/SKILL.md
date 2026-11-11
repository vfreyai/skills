---
name: vfrey-style-storybook
description: "Use when the chosen video style is Storybook watercolour (vfrey-style-storybook), or the person asks for a picture-book, hand-painted, watercolour, fable, bedtime-story or fairy-tale look. Teaches how to paint, compose, animate and score that look in a vfrey HTML scene, for any topic: SVG wash and ink filters, paper grain, page-turn transitions, a torn paper caption strip around vfrey's caption band, and a generated lullaby bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Storybook watercolour
  style-summary: A hand-painted picture book with soft watercolour pages that turn, a paper caption strip and a gentle lullaby.
  style-best-for: bedtime stories, fables, kids' education, folk tales, nature, cosy history
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Storybook watercolour

A soft hand-painted picture book: washes with wobbly edges and pooled rims, ink lines drawn a few pixels off the paint, cold-press paper grain, and one illustrated page per idea. Pages turn like a book; the words sit on a torn paper strip.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html` plus `scene.js`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for stories told gently: fables, bedtime tales, folk tales, children's explainers, nature, cosy history, a "how it came to be" with a character and a moral.
- Not for fast, loud or data-heavy topics, not for charts, interfaces or anything that must look exact (the wobble makes every line approximate), and not for a long film: the filters make a 35 s render take about 2.5 minutes.

## Plan before coding

1. Write the script as 5 or 6 lines of one or two sentences. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; key pages to lines, not to sentences.
2. One page per line or two. Each page has one mood (morning, noon, afternoon, dusk, night) that changes only the sky, sun, hills and ground tints.
3. Each page has one subject with a primary action tied to a spoken word, one secondary action (a blink, a wing, a tail) and ambient life.
4. The first page is complete at frame 0 and its title brushes in; the last page holds 1.5 s on the moral.
5. Draw characters from separate groups (body, head, wing, tail, lid, pupil) so a head turn never re-filters the whole body. Props that show their contents (a jug, a jar) are translucent clay.

## Palette and type

- Paper is never white: `#f6ecd4`, ink `#3b2a22` (never black), ochre `#e3a84a`, sun `#f3c24f`, sienna `#b8643a`, terracotta `#d98c5f`, sage `#a2b07c`, olive `#6f8355`, water teal `#6fb1b3`, rose `#e8a98f`, dusk plum `#7a5c86`. A dark character is indigo `#44415a` with a pale sheen stroke instead of an outline. Night pages run plum to peach with a cream moon.
- Playfair Display only. Italic 800 for hand-lettered headings (through the `letter` filter: wobble and pigment holes); 700 roman for captions (through `round`: blur, then re-threshold the alpha, which rounds the serifs). Swap hues for the brand (`brand.json` wins), keep the warm limited range.

## Drawing approach

- Shapes are smooth closed blobs: `cr(points)` (Catmull-Rom to cubic bezier) and `blob(cx, cy, rx, ry, {n, j, seed})` with seeded jitter. Never a perfect circle.
- The wash filter goes on a GROUP, not on each path: it displaces the edge, granulates the fill with a noise alpha and adds a darker pooled rim. A small version (`wcs`) is for characters and props. `feMorphology` is the costly part: only on big washes.
- The ink line is the same path stroked 3 to 4.5 px, translated `(+3, -2)` from the wash, like a misregistered pencil, through the `ink` filter.
- Soft blooms (blurred paper-colour ellipses at 30 to 45%) on big washes and a few darker back-runs break up flat colour. The paper grain is one 540 x 960 canvas of value noise, drawn once, copied per page, shown at full size over the paint at 0.9.
- The page window is a rough rectangle: use the SAME filter and numbers for the CSS mask and for the painted border so the edge and the border line up. Border: a 20 px sienna wash stroke, a thin ink line outside it and corner sprigs.
- Keep filters on static groups; animate only small parts. Moving parts pivot with `gsap.set(g, {svgOrigin: "x y"})`. A splash is a small crown, six droplets on parabolas and a hand-lettered "plop!".

## Full frame around the caption band

vfrey draws its captions in a band (`--vf-caption-at`, `--vf-caption-h`; centred near 70% of a 9:16 frame when the position is bottom). This style draws the strip itself, so read the band from `vfrey.captionBox` and put the strip there (`helpers.md` does this); it then follows the person's caption position.

- Four layers per page for parallax (sky, hills, mid, foreground) at `[0.25, 0.55, 1, 1.12]`. The foreground zooms about its own bottom edge. Subjects are large and sit above the band, between 700 and 1250 on the 1920 canvas.
- Below the strip the page keeps painting to the bottom edge: meadow, big flowers and grass blades, never more than about 15% flat colour.
- A heading above the picture in hand lettering: the title on page one, a short title on each other page, the moral at the end. Reveal it with a `clip-path` from `inset(0 100% 0 0)` to `inset(0 -2% 0 0)`.
- Captions sit on a plate: a torn-edge paper polygon (`#fbf3df`) with two washi-tape rectangles on opposite corners and a drop shadow, words in `#4a3326` and the spoken word in `#b04a2c`, groups of at most 5 words and 30 characters, the same place all film. Text never sits on artwork.
- Keep the bottom-right corner clear for the `AI-GENERATED` label.

## Motion rules

- Everything is on one paused timeline and calm: `power2.inOut`, `sine.inOut`, `back.out` for small pops, linear only for drifts. Per page: a primary action on a spoken word (find its index by text with `WS("word")`, never by number), a secondary, and ambient life (sun pulse, cloud drift, grass sway, motes, birds, twinkle).
- Ambient loops use finite repeat counts computed from the page length (`loop()` in `helpers.md`), never `repeat: -1`, never a negative timeline position.
- Camera: a slow push-in per page with the focus point landing on a chosen screen position.
- Subject on screen within 0.3 s of each line starting; ambient motion keeps running through the voice's gaps.

## Transitions

The signature is the page turn: the old page (opaque, `backface-visibility: hidden`) rotates `rotationY: 0` to `-104` about its left edge in 0.8 s `power2.inOut`, starting 0.5 s before the next line so the new page is up when the voice begins; a dark `.shade` fades in on the turning page, a `.cast` shadow fades off the page under it, and the next page eases from 1.035 to 1. Hide the old page after (`visibility: hidden`). Use nothing else between pages.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a music-box lullaby bed (tines, a warm pad, a tiny room tail, 3/4 at about 60 bpm) plus story accents: `page` (paper turning, put one on every page turn), `plop` and `drip` (something into water), `chime` (an idea), `twinkle`, `flap`, `hop`, `sip` and `hush` (a low goodnight chord). It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (each cue has a `type` and a word, line or time in seconds; the format is at the top of `make-bed.py`), then from the project folder: `python3 .agents/skills/vfrey-style-storybook/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey storybook style)", "volume": -15, "duck": false}` and make it again with `--rerender`. If the run warns `audio.voice-clear`, lower `volume`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the sentence starts (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: is the subject large and above the paper strip, does paint run to the bottom edge, are the words readable on the strip?
3. Do the wash edges and the border line up, and is the paper grain visible but not a mosaic?
4. Does each page turn start before its line and land on an opaque new page?
5. Is any flat colour more than about 15% of a frame?

## Pitfalls

- Filters on animated elements re-run every frame: filter static groups, animate small parts.
- Never `will-change` with a zoom (it blurs). Give every id a per-page prefix: several pages share one builder.
- A page flip needs opaque pages: put the background on `.pg`.
- `tl.call` does not run when the renderer seeks: use `tl.set`. Put `immediateRender: false` on every `fromTo`.
- Kokoro pauses about 1.2 s at some line breaks: put page turns inside the gaps and keep ambient motion running.
- vfrey's `frames.text-overlap` warning fires because hidden pages still hold headings; it is harmless here.
- Keep the grain alpha low (about 150 of 255 at most) or it reads as a mosaic.
