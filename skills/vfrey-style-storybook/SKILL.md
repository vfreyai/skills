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

<!-- style-bible: v2 -->

# Video style: Storybook watercolour

This is an art-direction bible for one look. Start every scene from `starter.html` next to this file (section 12): copy it to `scenes/<idea>/index.html`, replace the PLACEHOLDER headings, swap the bird for the topic's character and keep the engine (washes, filters, paper grain, painted page window, parallax pages, page turns, caption strip). The script, voice and facts are yours; the rules below are topic-free but exact. The vfrey skill's `scenes/craft.md` still holds for everything not said here. `helpers.md` next to this file holds the full drawing library and `make-bed.py` is the sound script.

## 1. The look in three sentences

A soft hand-painted picture book: each idea is one illustrated page, painted in granulated watercolour washes with a slightly misregistered pencil line, inside a rough-edged painted window with a sienna border, on cold-press paper. Pages turn on their left edge like a real book, and the words sit on a torn paper strip with washi tape. Calm, warm and gentle, with a music-box lullaby; nothing is sharp, neon, glossy or perfectly geometric.

Signature traits (each checkable on a frame):
1. Paper is never white: `#f6ecd4` with visible grain and short fibres over the whole page.
2. Every shape is a smooth jittery blob (never a perfect circle) filled with a granulated wash with a darker pooled rim.
3. Ink lines are drawn 3 px right and 2 px up from the wash (misregistered pencil), 3.5 to 4.5 px wide, in warm brown `#3b2a22`, never black.
4. A rough rectangular painted window (64 px margin) with a 20 px sienna wash border, a thin ink line 26 px outside it and four corner sprigs.
5. Four parallax layers per page: sky, hills, middle with the character, foreground grass and flowers.
6. The sky has blooms (blurred paper-coloured ellipses) and clouds; one mood per page (morning, noon, afternoon, dusk, night).
7. The character is built from separate painted parts (body, wing, head, tail, legs) with a big cream eye, round pupil with a highlight, rose cheek blush.
8. A hand-lettered italic heading at the top of each page, brushed on left to right.
9. The caption is a torn-edge paper strip (`#fbf3df`) with two translucent washi-tape rectangles at opposite corners, at y 1318 to 1514, same place on every page.
10. The foreground (grass, big flowers, pebbles) runs to the bottom edge; flat colour is under 15% of any frame.
11. The page turn: a rotation about the left edge with a dark shade, and a shadow cast on the next page.
12. Ambient life on every page: sun pulse, drifting clouds, swaying grass, floating pollen motes, distant birds, twinkling glints.

## 2. Palette

| Role | Hex | Use |
|---|---|---|
| paper | `#f6ecd4` | page ground, grain base (never white) |
| strip | `#fbf3df` | caption strip |
| ink | `#3b2a22` | pencil lines, lettering |
| ochre | `#e3a84a` | tape, ground, warm washes |
| sun | `#f3c24f` | sun, glints |
| sienna | `#b8643a` | border, tape, cheeks of the earth |
| terracotta | `#d98c5f` | warm accents |
| sage | `#a2b07c` | hills, leaves |
| olive | `#6f8355` | far hills, grass |
| water teal | `#6fb1b3` | water, a sound word (`#2f6f7c` for lettering) |
| rose | `#e8a98f` | blush, flowers |
| dusk plum | `#7a5c86` | night pages |
| indigo (dark character) | `#44415a` with sheen `#9a9fc4` | a dark figure instead of an outline |

Mood skies (top to bottom stops, 0 / .62 / 1): morning `#f6cf8e` to `#fdf1d4`; noon `#f2b27a` to `#fcead0`; overcast `#e8d3c0` to `#faefdb`; dusk `#f5c58a` to `#fcebcc`; night `#7b5a86` to `#f2c8a0` with a cream moon `#fff0cf`. Ratios: warm paper tones 60 to 70%, one hue family per page (greens for land, the page's sky colour), plum only on night pages, teal only for water or a sound word; saturated colour never above 20% of the frame. Never use pure white, black, neon, grey `#888`, or a flat fill without the wash filter.

## 3. Shapes and line

- Shapes: smooth closed blobs from `blob(cx, cy, rx, ry, { n, j, seed })` (n 7 to 10 points, jitter j .03 to .12) and `cr(points)` Catmull-Rom to cubic bezier.
- Wash filter `wc` on a GROUP (big shapes): `feTurbulence baseFrequency .011 .014, 3 octaves` into `feDisplacementMap scale 34`, `feGaussianBlur 1.4`, a pigment-grain `feTurbulence .03, 4 octaves` through `feColorMatrix` alpha `1.42 - 1.15 A` composited `in`, plus a darker rim: `feMorphology erode 4`, blur 4, composite `out`, merged with the body. Small wash `wcs` (displace 7, finer grain `.06`, no rim) for characters and props. Ink filter `ink`: displace 5. Lettering filter `letter`: displace 5 plus pigment holes. Round filter `round` for captions: blur 1.5, then re-threshold the alpha (`11 x - 4.6`).
- Ink line: the same path stroked, `translate(3 -2)`, width 3.5 to 4.5 px (2.4 px on pebbles), round caps and joins; a dark character gets a pale sheen stroke `#9a9fc4` at .6 opacity instead of a dark outline.
- Blooms: blurred (`feGaussianBlur` 34) ellipses of paper colour at .3 to .45 opacity over big washes, a few darker ones for back-runs.
- Paper: a 540 x 960 canvas of 3-octave value noise (light specks `rgb(255,250,236)`, dark specks `rgb(92,66,40)`, alpha at most about 150 of 255) plus 900 short fibres, drawn once and shown at 1080 x 1920 at opacity .9 over the paint.
- Window: rough rectangle x 64, y 64, 952 x 1792, radius 22, displaced by one filter (`wf`, turbulence `.018 .022`, scale 44); the same filter and numbers make the CSS `mask-image` and the painted border so edge and border line up.
- Light direction: from the sun (upper side); character belly and ground rims are darker; one soft highlight on pebbles and eyes. No hard shadows; contact shadow is a blurred ellipse of ground colour.

## 4. Characters and objects

Build a character as one `<svg>` with each moving part its own `<g id>` so a head turn never re-filters the whole body: tail, legs, body, wing, head (with lower beak or jaw), eye, lid, pupil, brow. Proportions are chubby: head about 1/3 of the body height, a big round eye (r 17 in a 63 x 58 head) with a cream `#fff8e8` ball, a dark pupil r 9.5 with a white highlight dot r 3.6, a rose blush ellipse blurred 6, a tiny brow line. Hands are mitten shapes without fingers; feet are three splayed strokes. Outline: misregistered ink line; shade with one darker belly patch and one sheen stroke on the back.

```js
gsap.set(r.head, { svgOrigin: "215 205" });          // pivot each part at its joint
tl.to(r.head, { rotation: 14, x: 6, y: 4, duration: .6, ease: "power2.inOut" }, t);
blink(r, t);                                         // lid ellipse scaleY 0 to 1 to 0 in .19 s
```

Stock props in `starter.html` and `helpers.md`: a bird (`crowSVG`), a sun with turning rays, clouds, hills with trees, ground with dry grass, foreground grass tufts and flowers (5 petals r 9 x 16 around a centre r 8), pebbles (`pebble`), a four-point glint (`spark`), floating motes, distant birds (`q` strokes). Props that show contents (a jug, a jar) are translucent clay with the liquid clipped to the silhouette. Add in the same grammar: a tree with a hollow, a bucket, a basket, a house with a round door, a fox, a rabbit, a boat.

## 5. Typography

- Font: Playfair Display only (bundled); local fallback `Georgia, "Times New Roman", serif`. Italic 800 for hand-lettered headings, 700 roman for captions.
- Page title: italic 800, 100 to 128 px, `#5a3b2b`, at y 132 to 150, through the `letter` filter; the first page: title 150 px (y 132), second line 98 px italic (y 292), subtitle 50 px italic 600 `#8a5a3c` (y 424). Night pages: `#fff1d2` with `text-shadow: 0 3px 16px rgba(60,20,50,.55)`. Fit: Playfair italic 800 is about 0.55 em per letter: 11 letters at 150 px is 900 px.
- Sound words ("plop!"): italic 800, 62 px, `#2f6f7c`, `letter` filter, pops (back.out) and floats up 50 px while fading.
- Captions: `vfrey.captions("#captions", { style: "color", font: '"Playfair Display"', size: 66, color: "#4a3326", highlight: "#b04a2c", maxWords: 5, maxChars: 30, align: "center" })`, weight 700, `#captions` at left 80, right 80, top 1330, height 176, `justify-content: center !important`, `filter: url(#round)`, word padding 2 / 8 / 6.
- Caption plate: a torn paper polygon `#fbf3df`, stroke `#c9a77c` 3 px, 1000 x 200 at left 40, top 1318 (y 1318 to 1518), 16 ragged points on top (6 to 15 px) and bottom (177 to 186 px), `drop-shadow(0 10px 12px rgba(50,28,14,.35))`, tape A `#e3a84a` at .62 (132 x 44, rotate -12) on the top left, tape B `#b8643a` at .55 on the bottom right. Text never sits on artwork.

## 6. Composition

Captions sit on a plate (the paper strip), never over a subject; vfrey draws them in a band (`--vf-caption-at`) and the large painted page runs behind it.

- Safe area: the window (x 64 to 1016, y 64 to 1856) holds everything; the AI label sits over the foreground at the bottom right.
- Frame grid: heading band y 100 to 450, subject band y 700 to 1250 (character baseline at y 1240), caption strip y 1318 to 1518, foreground band y 1520 to 1920.
- Subject scale: the character is 22 to 28% of the frame height (scale 1.1 of a 420 px box); a hero prop is 25 to 40%.
- Layers and parallax factors: sky 0.25, hills 0.55, middle 1, foreground 1.12; zoom the foreground about its own bottom edge (origin y 1850) or it flies off screen.
- Depth cues: atmospheric wash (far hills paler), overlapping layers, blooms, foreground blades larger and saturated, grass swaying more at the front.
- Foreground and ground run to the bottom edge: meadow, big flowers and blades; no more than about 15% flat colour anywhere.

Shot types:

```
OPENING PAGE            ACTION PAGE              CLOSING PAGE (night)
 TITLE (150)             page title               moral in cream
 sun   birds            sun/cloud                moon  stars
 hills                   hills                    hills
   (character)           (character, tilted)       (character)
 [ torn caption strip ] [ torn caption strip ]   [ torn caption strip ]
 grass + flowers         grass + flowers          flowers
```

```
CLOSE-UP (push-in)      TWO CHARACTERS           WIDE SCENE
 head fills 40%          A      B                 tiny figures
 prop beside it          meadow                   big sky, hills
```

## 7. Motion

- Feel: calm, smooth, never snappy; one paused GSAP timeline.
- Easing: `power2.inOut` and `sine.inOut` for almost everything, `power2.out` for landings, `back.out(2)` for small pops (glints, sound words), linear only for slow drifts.
- Durations: title brush-on 0.6 to 0.9 s (`clip-path: inset(0 100% 0 0)` to `inset(0 -2% 0 0)`, lines staggered 0.3 s); character entrance 1.7 s; head turn 0.5 to 0.8 s; blink 0.19 s every 2 to 3 s; wing flap 0.27 s per beat; glint in 0.28 s and out 0.35 s after 0.5 s; sound word 0.3 s in, 0.8 s out; page turn 0.8 s starting 0.5 s before the next line.
- Holds: every page keeps ambient motion until the turn; the last page holds.
- Camera: a slow push-in per page (scale 1.2 to 1.35 or 1.42 to 1.75) with the focus point landing at a chosen screen position, parallax by the layer factors; never a pan faster than 40 px a second.
- Secondary and ambient: blink, tail sway (-5 degrees yoyo 0.7 s), sun pulse (1 to 1.05 in 1.6 s) with rays turning 6 degrees in 2.4 s, cloud drift +-36 px over the page, grass sway +-3 degrees, 10 to 14 pollen motes rising 90 to 250 px, distant birds crossing.
- Forbidden: snappy ease-outs on the character, bounces larger than a small pop, infinite repeats (compute finite counts from the page length), `will-change` with zoom (blurry), animated big filters (re-run per frame), text over artwork.

## 8. Transitions

The signature is a PAGE TURN, the only transition: the old page (opaque paper background) rotates `rotationY: 0` to -104 about its left edge (`transform-origin: 0 50%`, parent `perspective: 2800px`, `backface-visibility: hidden`) in 0.8 s `power2.inOut`, starting 0.5 s before the next line; a dark gradient `.shade` fades to .7 on the turning page and a `.cast` shadow fades from .85 to 0 on the page underneath; the next page eases from scale 1.035 to 1; the old page is hidden afterwards. The first page has no transition: it is complete at frame 0 and its title brushes in. Forbidden: dissolves, slides, wipes, zooms between pages.

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a lullaby in 3/4 at about 60 bpm: music-box tines (sine, a soft octave and a short inharmonic tink), a warm pad, a tiny room tail. Accents are placed from cues by spoken word or line (`{"type":"plop","word":"plop"}`): a page-turn whisper on every turn, plop or drip, a chime for an idea, a wing flap, a hop, a sip, a twinkle on glints. Mix: `volume -15`, `duck: false` as the showcase (the bed is quiet), vfrey masters to about -14 LUFS. Standard library only, always the same file for the same input.

1. Make the video once without music so `vfrey/timing.json` holds the real word times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`: each cue has a `type` and a word, line or absolute time), then from the project folder: `python3 .agents/skills/vfrey-style-storybook/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey storybook style)", "volume": -15, "duck": false}` and make it again with `--rerender`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no cues before the first render. No `python3` on the machine: leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (34 to 40 s, 5 or 6 lines)

Pace: write 5 or 6 lines of one or two sentences; set `lineGap` in the script (0.25 to 0.4, `voice.md`) and do not merge lines to hide the pause: put page turns inside the gaps and keep ambient motion running. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window (Kokoro af_heart with lineGap 0.3 is about 3 words a second).

| Beat | Time | Shot type | Content | Mood |
|---|---|---|---|---|
| Hook | 0 to 7 s | opening page | title brushes in, character glides in and lands, glints | morning |
| Beat 1 | 7 to 14 s | action page, close | the problem, a head turn, the prop beside the character | noon |
| Beat 2 | 14 to 20 s | action page | the idea: a tilt, a glint, a chime | overcast |
| Beat 3 | 20 to 28 s | action page, push-in | the repeated action with a sound word each time | afternoon |
| Beat 4 | 28 to 34 s | action page | the result, the payoff gesture | dusk |
| Payoff | 34 to 40 s | closing page | the moral in cream lettering, moon, last glint | night |

## 11. Reference frames

Four frames of the showcase film, 540 x 960, in this folder (not copied into installed projects):
- `ref-1.jpg`: the opening page with brushed title, sun and character; copy the wash colours, the window border and the strip.
- `ref-2.jpg`: a close-up page with the heading and a prop; copy the push-in framing and the painted prop translucency.
- `ref-3.jpg`: an action page with a sound word; copy the lettering filter and the foreground flowers.
- `ref-4.jpg`: the night closing page with cream moral lettering; copy the plum mood and the moon.

## 12. Reference implementation

`starter.html` is a working three-page book (opening page, action page with a sound word, night closing page) with the full engine: filters, `blob`, `cr`, `W`, `I`, paper grain, painted window mask and border, sky, hills, ground and foreground builders, a bird character with rig (`crowRig`, `blink`, `flap`, `headTo`), `spark`, `motes`, `camera`, `reveal`, page turns and the caption strip. Start from it: `cp .agents/skills/vfrey-style-storybook/starter.html scenes/<idea>/index.html`, replace each PLACEHOLDER, redraw the character, edit `buildPage` moods and the three page blocks. Keep `data-composition-id` on `#root`. Check a frame with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 3 out.png`.

## 13. Do / Don't, and the final checklist

Do:
1. Do put the wash filter on groups, never on each path.
2. Do offset the ink line by (3, -2) px from the wash.
3. Do use blobs with seeded jitter, never perfect circles.
4. Do paint the foreground to the bottom edge.
5. Do give every page one mood that changes only sky, sun, hills and ground tints.
6. Do keep the caption strip in the same place on every page and never put text on art.
7. Do give every id a per-page prefix.
8. Do compute finite repeat counts from the page length.
9. Do key actions to spoken word times found by text, not by index.
10. Do hold ambient motion through every voice gap and turn the page inside it.

Don't:
1. Don't use white, black, neon or any colour outside the palette.
2. Don't use a crisp vector outline or a flat fill without the wash.
3. Don't use `feMorphology` on small shapes (costly): big washes only.
4. Don't animate filtered elements; animate small parts.
5. Don't zoom the foreground about the wrong origin (use y 1850).
6. Don't cut, fade or slide between pages: page turn only.
7. Don't use `will-change` with zoom.
8. Don't put heading text over the character's head.
9. Don't use a second font.
10. Don't invent facts: a fable or story names its source; science needs a citation.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- Paper: warm with grain and fibres, never white?
- Wash: granulated, with rims, visible blooms?
- Line: a warm brown pencil line offset from the paint?
- Window: rough painted border with corner sprigs?
- Layers: sky, hills, middle, foreground all present, foreground at the bottom edge?
- Character: separate parts, big eye with a highlight, blush?
- Heading: hand-lettered italic at the top of each page?
- Caption strip: torn paper with tape, same place, no text on art?
- Mood: one sky mood per page, plum night at the end?
- Turn: pages turn on the left edge, nothing else?
- Numbers: every number on screen matches the number the voice says (digits, units, rounding), read against the script?

## Pitfalls

- Filters on animated elements re-run every frame: keep filtered groups static and animate only small parts (a 34 s render took about 2.5 minutes).
- `feMorphology` is the costly bit; use it only on big washes.
- Never `will-change` with zoom (blurry). Give every id a per-page prefix: several pages share builders.
- Kokoro leaves 1 to 1.2 s gaps between lines: keep ambient motion running and place page turns inside them.
- vfrey's `frames.text-overlap` warning can fire because hidden pages still hold headings; it is harmless here.
- A page flip needs opaque pages: set the background on `.pg`.
- A tween's `onUpdate` does not run when the renderer seeks: loops here are finite tweens on the paused timeline, and any attribute-driven art must paint from `vfrey.onFrame`.
