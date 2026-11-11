---
name: vfrey-style-vintage-newspaper
description: "Use when the chosen video style is Vintage newspaper (vfrey-style-vintage-newspaper), or the person asks for an old newspaper, letterpress, engraving, broadsheet, 'extra edition' or 19th-century print look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: a yellowed front page with stamped-in headlines, line-hatch engravings that move inside their frames, one spot red, page turns, a printed caption strip, full-frame layout around the caption band and a generated waltz bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Vintage newspaper
  style-summary: A yellowed old newspaper page where headlines are stamped in and the engraved pictures come alive, story by story.
  style-best-for: strange-but-true history, true crime, science and discovery, news explainers, on-this-day stories
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Vintage newspaper

A 19th-century front page in 9:16: an invented masthead, headlines stamped in word by word, engravings drawn only with line hatching that animate inside their frames, and one red printed slightly out of register. Each story beat is a page of the same paper; pages turn, stack or flood with ink to change story.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the sound script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for stories told as news: strange-but-true history, an old case, a discovery, an "on this day", an explainer with a clear before and after. Each beat needs one picture that can be engraved: a place, a machine, a crowd, a sky.
- Not for cheerful product demos, charts or numbers to compare, small fine detail, or faces that must be recognisable (hatching is crude on people). Not when the subject is modern and sleek.

## Plan before coding

1. Invent the paper. Choose a generic masthead (for example `THE DAILY SPARROW`), a made-up volume and number, and "one cent". Never copy, imitate or hint at a real newspaper's name, masthead, logo or slogan, and never print a real outlet's name as if it published this page.
2. Every headline, deck, label, date and figure on screen must be true and sourced. Check each against a source before drawing it; drop what you cannot verify. Show a figure only with its source on the page (for example "2008 U.S. ESTIMATE"). Frame anything about the future as expert concern, not prediction. Illustration is allowed to be generic; invented people and quotes are not.
3. One page per story beat, 5 to 7 pages for 40 seconds, cut on spoken words. Write each page as: two-line headline of at most 15 letters a line (one word in red), a one-line deck, one engraving with one moving part.
4. Decide the hook (the front page with the masthead) and the last image (a big stamp over the last page).
5. Script pace: 6 or 7 lines for 40 seconds. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; the bed fills the gaps. A dry, clear voice suits news (`am_fenrir` among the free voices); the voice is the person's setting, so suggest it, never switch it.

## Palette and type

- Paper `#e9dbb0` (radial to `#dcc994` at the edges), plate `#f1e5bd`, ink `#21170f`, never pure black. One colour: red `#c63a22`, for one headline word, spark discs, a tab and stamps. Dark engraving grounds are ink; light marks on them are paper colour.
- Type: Playfair Display only (bundled, nothing to install): 900 caps for masthead and headlines, 700 to 800 for small labels and captions, italic 500 for decks. Squeeze each headline line with `scaleX(.82)` so it reads as a condensed Victorian face. No sans, no mono.

## Drawing approach

- Every page is the same sheet: running header, headline, deck, an engraving inside a double rule (6 px and 2 px, 9 px apart), the caption strip, then greeked columns. Layout comes from `vfrey.captionBox`, so the strip never moves.
- Engrave with SVG line patterns (bars of 2.6, 1.6, 0.9 px every 5 px, vertical and 45 degree variants) cut by tone masks: heavy lines at the edges, clear toward the light. Solids are ink with a thin paper rim; mid tones are cross-hatch; red tone is a halftone dot pattern.
- Misregistered red: a red word or mark with an ink copy offset about 5 px (`text-shadow`, or `filter: drop-shadow` on SVG text). Never stack two text nodes for this: the `frames.text-overlap` check flags them.
- Ink roughness: one displacement filter on headlines, a lighter one on decks and stamps. Static filters on small areas only.
- Paper: a faint, coarse speckle and fibre layer under `mix-blend-mode: multiply`, plus a brown vignette and a fold crease. This is the costly part: see Pitfalls for the limit.
- Greeked columns are one path per column of justified word-blocks. Never print real body text you have not sourced.

## Full frame around the caption band

vfrey draws the captions in a band (`--vf-caption-at`, `--vf-caption-h`, read in script as `vfrey.captionBox`; near 70% of a 9:16 frame when the position is bottom). Numbers in `helpers.md` are for 9:16.

- Subjects are large: the engraving frame is 960 px wide and runs from under the headline to just above the band. The art goes to the frame edge, with no empty paper inside it.
- The page continues to the bottom edge: below the strip, greeked columns, a drop-cap block and column rules run off the bottom of the frame.
- Captions sit on a plate: the printed strip (cream, ink double border, hard shadow, red tab), the same position on every page, at most 4 words, spoken word in red. No art, stamp or prop ever goes over the strip.
- Keep the bottom-right corner clear for the `AI-GENERATED` label; it sits over the columns, which is fine.
- Place the strip and the columns from `--vf-caption-at` and `--vf-caption-h`, never from typed pixel values.

## Motion rules

- Everything is a pure function of timeline time, seeded random only. Idle loops use finite repeats (`Math.ceil(D / dur) + 1`).
- Each page has `.page > .thump > .cam`. `.cam` carries slow scale and pan (front page starts at 1.14 on the masthead and pulls out; others pull out, push in, or drift at 1.1). `.thump` moves only in y: a press impact is 0 to 5 to 22 px in 0.06 s, then `elastic.out(1,.35)`. Never both on one element.
- Headline words land one by one (scale 1.3 to 1, blur away, 0.2 s `power3.in`, 0.22 s apart) with a thump on every second word. The engraving reveals as a press wipe, `clip-path: inset(0 0 100% 0)` to `inset(0 0 0% 0)`, 0.6 to 0.7 s.
- Every engraving has one always-on motion: a slow-rotating corona, a sine-wave comb of lines, a swaying prop, a zigzag arc toggled at about 12 fps, a travelling dot along a path. Story events land on spoken words (`wt(line, /^word$/)`).
- Labels and stamps slam in (scale 2 to 1, rotation -14 to -6, `power4.in`) with a thump and a short flash. Nothing floats softly in; paper and ink are heavy.

## Transitions

Three kinds, each with a cause. A page turn (outgoing page `rotationY` 0 to -118 about its left edge, dark shade, next page already beneath) for the next story. A sheet stack (the next sheet rises 102% to 0 with a small tilt, the old one shrinks and darkens) for a follow-on. An ink flood (red layer leads, black 0.14 s behind, swap at the midpoint) for a shock. Start 0.8 s before the next line, so the transition ends as it starts.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a slow minor waltz (plucked bass and chords, a music-box melody) with letterpress cue sounds: `press` (headline words landing), `thump`, `stamp`, `whoosh` (page turn or slide), `flood`, `clicks` (telegraph or typing), `crackle`, `zap` and `shimmer`. It needs `python3` only, downloads nothing and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene cuts on), then from the project folder: `python3 .agents/skills/vfrey-style-vintage-newspaper/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey vintage newspaper style)", "volume": -12, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the transition times (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: a headline you can read at phone size, one engraving that fills its frame, the strip on the same spot, columns under it to the bottom edge. No empty sheet during a turn, flood or stack.
3. Is red the only colour? Does any stamp, label or prop touch the strip? Is the masthead invented, and is every printed line a fact you can source?
4. Read the run's checks. A `frames.bitrate` warning means the paper layer is too strong: lower its opacity and coarsen it. `frames.text-overlap` during a page turn is expected (old and new headlines pass each other); anywhere else it is a bug.

## Pitfalls

- The paper speckle is what makes the file huge. A finest-grain speckle (`baseFrequency .85`, 3 octaves) over the whole frame at 0.7 opacity, under moving pages and hatching, gave a 105 MB, 22 Mbps render and a `frames.bitrate` warning. Keep full-frame grain faint or still: one octave, `baseFrequency` about .3, opacity at most .3 (`helpers.md` has these values; check the render's file size and bitrate after the first render), no animated grain, and let hatch, fibre and the vignette carry the paper feel. A web copy softens it but is not a fix.
- Never animate a big filtered area every frame: filter headlines, decks and stamps only, and keep them small.
- A masthead, slogan or "extra" ear that copies a real newspaper is not allowed. Invent a name, keep the issue number obviously fictional, and do not put a real outlet's name on the page.
- Empty sheet for a beat: the headline and frame reveal must start with the transition, not with the line.
- A prop drawn across the main subject hides it: keep props beside the subject, aimed at it.
- A comb of lines with random lengths looks like a bar chart: use smooth sine-squared lengths, thin strokes (2.2 to 3.6 px) and 150 or more lines.
- `svgOrigin` is in the parent's space: put position on an outer `<g transform>` and animate an inner group with `svgOrigin: "0 0"`. `transformOrigin` on SVG groups uses the box, not the local origin.
- `#root` needs `data-composition-id="main" data-start="0"`, or the render says there is nothing to render.
- A `captions.style` in the script beats the scene's: set both to `color`.
- Faces: no real portraits. A small engraved figure with a hat and a pose reads fine and cannot mislead.
