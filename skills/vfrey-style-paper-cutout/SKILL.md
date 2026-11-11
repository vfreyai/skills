---
name: vfrey-style-paper-cutout
description: "Use when the chosen video style is Paper cut-out (vfrey-style-paper-cutout), or the person asks for a paper, collage, cut-out, scrapbook, craft, stop-motion, storybook or 'ransom note letters' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: layered cut and torn paper with shadows between layers, parallax, jointed stop-motion puppets, cut-out letter titles, full-frame layout around the caption band, paper transitions and a generated music bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Paper cut-out
  style-summary: Scenes made of layered cut and torn paper, with puppets that move like stop-motion and titles of cut-out letters.
  style-best-for: history, folklore, true stories, explainers, children's topics, culture
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Paper cut-out

Layered scissor-cut and torn paper in muted vintage colours: every picture is a stack of flat paper polygons, each with a pale cut edge and a soft shadow on the sheet below, shot with a parallax camera and moved by jointed stop-motion puppets at 6 to 8 frames a second. Titles are ransom-note lettering, a still paper grain lies over everything, and scenes change by sliding, folding or tearing a sheet. If a frame has a gradient fill, a smooth tween on a puppet, a perfectly round or perfectly straight edge, or a glossy highlight, it is not this style.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. **Start from `starter.html` next to this file** (copy it to `scenes/<idea>/index.html` together with `papercut.js`, then replace the PLACEHOLDER words, number and colours: it already renders three sheets with `vfrey render --frame`). `papercut.js` next to this file is the toolkit you copy into the scene folder (`helpers.md` lists what is in it); the music script is `make-bed.py` next to this file. Four reference frames, `ref-1.jpg` to `ref-4.jpg`, live in the package copy of this style (section 11); they are not installed into projects.

## When to use it, when not

- Use it for history, folklore, true stories with a twist, "the story of", timelines, and explainers that want a hand-made, slightly irreverent tone.
- Not for charts and data (use data-story or 2D flat), not for anything that needs fine realistic detail, and not for fast kinetic text. Puppets act in stepped poses, so a script that needs smooth acting or lip sync belongs to another style.

## Plan before coding

1. Write 5 or 6 spoken lines (Kokoro adds a pause at line breaks, so fewer, longer lines are faster), a hook in line 0, one beat per picture, a twist in the last line. Cue scenes from `vfrey.line(i)` and `vfrey.timing.words`, never from fixed seconds. Word regexes are case-insensitive and anchored (`/^one/i`: "anyone" contains "one").
2. One sheet per beat, one ground colour per sheet, a different transition kind where you can. Decide the map beat, the number beat and the twist beat first.
3. Pace the script for the voice. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 3 words a second.

## 1. The look in three sentences, and the signature traits

A tabletop of warm, muted paper sheets cut with scissors, glued in layers and photographed with a gentle parallax. Everything is a polygon with a pale cut edge; shadows fall between layers; letters are cut from magazines. Characters are paper marionettes that move in stop-motion steps.

Signature traits (each checkable on one frame):
1. Every shape is a polygon (8 to 14 vertices for scissor cuts, many small steps for torn edges), never a smooth curve or circle primitive.
2. A 5 px pale cut edge (`#f6efdd`) is stroked outside the fill of every cut shape (`paint-order: stroke`).
3. Torn edges (hills, strata, plates) show a paper-white fibre polygon 7 px above the coloured one.
4. A soft shadow (`drop-shadow(0 10px 9px rgba(45,27,12,.38))`) falls between depth planes.
5. A still paper grain (fractal noise, multiply, 50%) and a brown vignette lie over everything.
6. Palette is muted vintage: paper, ochre, brick, teal, olive, plum, with ink for lines and one ground colour per sheet.
7. Titles are ransom-note chips: one scrap per letter, random colour, font, tilt (+-4.5 degrees) and clipped corners.
8. Labels sit on torn kraft or cream plates tilted 2 to 6 degrees.
9. Puppets are jointed (hip, knee, shoulder, elbow, neck, head) and move at 6 to 8 steps a second with 1 to 2 degrees of jitter.
10. The camera is a parallax: planes at depths 0.05 to 1.7 move by different amounts, 4 to 7% zoom per sheet.
11. The foreground strata (torn ridges, rocks, tufts, a fence) reach the bottom edge under the captions.
12. Sheets change by slide, fold or tear, never fade.
13. The caption is a torn cream strip, slightly rotated, with the spoken word on a brick chip.

## 2. Palette

| Role | Hex | Use | Ratio |
| --- | --- | --- | --- |
| paper / plate | `#f4ecd8`, `#ecdfc0` | titles, plates, cut edge `#f6efdd`, clouds | 5 to 15% |
| sand / ochre / gold | `#dcbf88`, `#c9923d`, `#dcae48` | fields, sun, chips | 5 to 25% |
| brick / rust / terra | `#b2523a`, `#8f402c`, `#c8623f` | hills, accents, spoken word chip | 5 to 30% |
| teal / deep teal | `#5d8a86`, `#3f6664` | water, sky ground | up to 40% in a teal sheet |
| olive / khaki | `#7f8752`, `#b09a5e` | grass, uniforms | 5 to 20% |
| pink / dusk / plum | `#d9a090`, `#c99a98`, `#7d5766` | evening sheets | up to 40% in a dusk sheet |
| ink | `#2d2a26` | text, outlines, pupils | under 6% |
| browns | `#7a5236`, `#4f3626` | strata, props, fence | 10 to 25% in the foreground |

One ground colour per sheet and a new one for each sheet. Use the muted colours above, shade them by 0.72 to 1.35 for rocks and tufts. Never use a gradient (only the vignette), pure black, pure white, a neon, or a saturated primary.

## 3. Shapes and line

- Polygons only. Scissor cut: 8 to 14 vertices, straight sides, jitter 5 to 15% (`blobPts`, `ridge` with step 60 to 100). Torn edge: small steps (jitter 8 to 11) plus the pale fibre polygon 7 px above (`ridge({ torn: true })`).
- Cut edge: `.cut { stroke: #f6efdd; stroke-width: 5; stroke-linejoin: round; paint-order: stroke }`. Plain (no edge) only for far hills, fences and torn strata that carry their own fibre line.
- Hills: `ridge(svg, { y, amp, step, fill, seed, ph, torn })`. Clouds: four scalloped circle-ish polygons with a flat bottom. Sun: concentric 40-gon discs in three close tints. Grass: a tuft of five leaning blades (34 to 60 px tall). Rocks: 7-vertex blobs at 16% jitter.
- Texture and grain recipe (static, drawn once, above all sheets and below the captions; never animate it):
```html
<filter id="fg"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4"/>
 <feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .26  0 0 0 0 .16  1.6 0 0 0 -.62"/></filter>
<filter id="ff"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.34" numOctaves="3" seed="9"/>
 <feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .26  1.9 0 0 0 -.84"/></filter>
```
`#grain { mix-blend-mode: multiply; opacity: .5 }` and a radial vignette `#2a1608` from 0 to .42 alpha. Filters on animated nodes re-rasterise every frame, so use polygons for shapes.
- Light and shadow: top-left light implied; shadows are `drop-shadow(0 10px 9px rgba(45,27,12,.38))` on each depth plane's SVG, `drop-shadow(3px 6px 5px rgba(40,24,10,.42))` on chips and plates, `box-shadow: 0 0 80px rgba(20,10,0,.55)` on each sheet so a sliding sheet shadows the next.

## 4. Characters and objects

A puppet is built from polygons around joint origins: `J(parent, x, y)` makes a static translate group and an inner group that GSAP rotates about its own origin; nest hip > knee > foot, shoulder > elbow > hand, neck > head > hat. A person is about 250 units tall at scale 1 (drawn at 1.5 to 1.8), head about one quarter of the body height, a dot-and-line face (two small ink dots, no mouth or a single tick), a wide-brimmed hat, a shirt block, trousers as two thick polygons, and boots. Animals (a long-necked bird, a dog) are the same joints with a longer neck and a tail joint.

```js
const P = Person(who.svg, { x: 300, y: CAP_TOP - 110, s: 1.8, seed: 4, shirt: C.teal, pants: C.deepteal, hat: "straw" });
personWalk(P, t0, t0 + 2.4); tl.to(P.mv, { x: 220, duration: 2.4, ease: STEP(2.4) }, t0);   // mid-stride on frame one; travel steps with the legs
personIdle(P, t0 + 2.4, t1, { aA: 10, fA: -50 });                                                 // end one loop where the next begins
```

Stock objects: 1. a wide-brim hat figure (Person); 2. a long-necked bird puppet; 3. a truck (box body, two polygon wheels, a gun on the roof); 4. a wooden crate with stacked bullets; 5. a fence (nine posts and two rails); 6. a hanging report page with ink lines; 7. a map: country polygon, state polygon in the accent colour, a pin; 8. a lined notebook page for numbers; 9. rocks and tufts; 10. a calendar card that flips (`rotationX -90` to 0 stepped).

## 5. Typography

| Role | Font | Size (px at 1080 wide) | Colour |
| --- | --- | --- | --- |
| ransom title | Titan One, Baloo 2, Playfair Display 900 (random per chip) | 140 to 170 (chars * 0.96 * size must be under the box width) | chip paper and ink pairs from the palette, never the same twice in a row |
| ransom label | the same | 52 to 60 | the same |
| number on a plate | Titan One (fallback Baloo 2) | 250 | ink `#2d2a26` on a cream plate |
| captions | Baloo 2 800 (fallback sans-serif) | 74 | ink `#2d2a26` on a torn `#f4ecd8` strip, spoken word `#f4ecd8` on a `#b2523a` chip |
| small tags | Baloo 2 | 36 to 44 | ink or paper |

Letter case is upper case in ransom text, sentence case in captions; tracking 0; chip rotation +-4.5 degrees, scale 0.9 to 1.1, `y` jitter 7% of size, each chip clipped by a 4-point polygon with 0 to 5% jitter. Caption plate: `top: var(--vf-caption-at)`, `height: var(--vf-caption-h)`, side inset `var(--vf-safe-left)`, strip `padding: 14px 30px 18px`, rotation -1 degree, max 4 words, the strip hand-placed in the bottom third above the AI label.

## 6. Composition

- Safe area: top 10% carries only sky or a title scrap; the bottom-right corner is the AI label; nothing important in the caption band (about y 1340 to 1590 in a bottom 9:16 frame).
- Frame grid: hero zone y 200 to 1300; titles in the upper quarter (y 150 to 560), the puppet's feet on the ground ridge at `CAP_TOP - 110`; the caption strip below; torn strata, rocks, tufts and a fence fill from the strip to the bottom edge.
- Subject scale: subjects are large, puppets at 1.5 to 1.8 (about a third of the frame height), the title block 25 to 30% of the height, plates 800 wide.
- Depth planes: sky 0.05, far hills 0.25, mid hills 0.5, ground 0.9, characters 1.0, nearer strata 1.2, foreground blobs, tufts and animals 1.55 to 1.7. Fixed text and HTML layers have no depth and do not move with the camera.
- Captions always sit on a plate, the torn strip, never over a puppet, a title or a plate. The foreground strata run to the bottom edge. Fill the whole frame: no sheet shows an empty band.

Shot types:
```
TITLE SHEET            MAP BEAT               CROWD / ACTION         NUMBER PLATE           DUSK EXIT
+------------+         +------------+         +------------+         +------------+         +------------+
| R A N S O M|         | MAP TITLE  |         |  [3 SOLD.] |         |  .----.    |         |  chips END |
| TITLE chips|         |  /country\ |         | o  o  o    |         | | 986  |   |         |   (sun)    |
|  (sun) o ->|         | (pin) ani. |         | /\ /\ /\   |         |  '----'    |         |  o -> walks|
|~hills~~~~~~|         |~~cloud~~~~~|         |~~hills~~~~~|         |~~hills~~~~~|         |~~hills~~~~~|
|[strip   ]  |         |[strip   ]  |         |[strip   ]  |         |[strip   ]  |         |[strip   ]  |
| strata+fence|        | strata     |         | strata+fence|        | strata     |         | strata+fence|
+------------+         +------------+         +------------+         +------------+         +------------+
```

## 7. Motion

- Feel: stop-motion. Puppets step at 6 to 8 fps (`steps(t0, t1, fps, fn)` with `tl.set`), travel uses `ease: "steps(N)"` with N = duration * 8; the camera and sheet transitions are smooth.
- Entrance: a pop is two stop frames, `tl.set(el, { autoAlpha: 1, scale: 1.3 }, t).set(el, { scale: 1 }, t + 0.1)`, not eased; ransom chips pop one by one 0.03 to 0.055 s apart. Subjects are on screen within 0.3 s of a sheet starting (place walkers mid-stride).
- Emphasis: a pose change (aim `aA -78, fA -42`, salute `aA -118, fA 128`, droop torso 14, shrug), a counter ticking on a stepped ease (`steps(12)`), a card flip `rotationX -90` to 0 over 0.4 s in 4 steps, a hat pop (`y -190, rot 380`, stepped).
- Walk cycle: 8 frames, hip `-amp * sin p` (34 degrees), knee `lift * max(0, cos p)` (52), foot `-(hip + knee) * .8`, other leg +pi, neck and head lagging; run: amp 44, lift 55, 5 frames per cycle. Each step adds +-1.2 degrees and +-1 px seeded jitter.
- Camera: `cam(sc, t, dur, A, B, ease, origin)` moves every depth plane by `v * depth`; 4 to 7% zoom, 70 to 170 px pan per sheet, `sine.inOut`; a map push uses the target point as origin. Clouds drift with a stepped ease.
- Blink: lid `scaleY .001 to 1 to .001` over 0.13 s. Hold: the last picture holds to the end, a payoff 1.5 s or more.
- Forbidden: smooth eased puppet motion, two idle loops running on one joint, a `fromTo` with `autoAlpha: 1` (it shows its element from time 0), spinning or scaling whole sheets continuously, shaking.

```js
const o = { n: 0 };
tl.to(o, { n: 986, duration: 1.2, ease: "steps(12)" }, t);
vfrey.onFrame(() => { num.textContent = Math.round(o.n); });   // what a render runs: write the text from onFrame
```

## 8. Transitions

Allowed (0.82 s, started about 0.62 s before the next beat, called after every sheet is built):
1. `slide(i, t, "right" | "left" | "bottom")`: the new sheet enters with a 1.6 degree tilt settling to 0 (`power3.inOut`); the old sheet drifts 260 px and dims to 50%.
2. `fold(i, t)`: the old sheet rotates `rotationX 0 to -104` about its top edge (`transformPerspective 1500`, `power2.in`), darkening to 75%.
3. `tear(i, t)`: the new sheet is revealed bottom-up through a 31-point jagged `clipPath` with a cream torn band riding the same edge (`power2.inOut`).
Rotate the three kinds. Forbidden: fades, dissolves, wipes with a perfectly straight edge, zooms through the sheet.

## 9. Sound

Bed: Karplus-Strong plucks over C - Am - F - G at about 104 bpm: a bass on beats 1 and 3, an eighth-note arpeggio, a small top melody from bar 2, quiet woodblock ticks on 2 and 4; warm, hand-made, a little playful. Paper sound effects from filtered noise at each sheet change (slide: a soft swoosh; fold: swoosh and thud; tear: about 26 short crackles) and a low thump on key words. Mix: `volume: -17`, `duck: true`, the bed about 17 dB under the voice.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with the accents (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-paper-cutout/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey paper cut-out style)", "volume": -17, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (30 to 40 s)

| Time | Beat | Shot type | Content |
| --- | --- | --- | --- |
| 0 to 4 s | hook | TITLE SHEET | ransom title pops chip by chip, puppet walks in mid-stride, sunset ground |
| 4 to 10 s | place | MAP BEAT | map with country, region in the accent colour, a pin, mini cut-out animals pop on it |
| 10 to 18 s | setup | CROWD / ACTION | the cast acts the premise, a plate with the key numbers |
| 18 to 26 s | complication | CROWD / ACTION | a new sheet and ground colour, puppets change pose, a counter or a hat pop |
| 26 to 33 s | reveal | NUMBER PLATE | the number on a lined or cream plate, counted on a stepped ease |
| 33 to 38 s | twist and close | DUSK EXIT | the twist line, puppet walks off, ransom "END" or the last fact; holds to the end |

## 11. Reference frames

Saved in this style's package folder (not installed into projects): look at them before drawing.
- `ref-1.jpg` the title sheet: copy the ransom letters with mixed fonts and tilts, the stacked concentric sun, the three scissor hills, the puppets with straw hats and the foreground strata with a fence.
- `ref-2.jpg` the map beat: copy the teal sea, the red country polygon with a pale cut edge, the accent state polygon and the pin, the cloud at the bottom and the torn plate behind the caption.
- `ref-3.jpg` a crowd with a prop: copy the three olive soldiers on the same ground line, the wooden crate, the sunburst behind, ransom number chips and the caption strip.
- `ref-4.jpg` the number plate: copy the lined-notebook ground, the big number on a kraft scrap, the long-necked bird puppet, and the torn strip with a brick highlight chip.

## 12. Reference implementation

`starter.html` next to this file (with `papercut.js` beside it in the scene folder): three sheets, the first with sunset sky, sun, three hill planes, a walking puppet, a ransom title and subtitle and foreground strata; the second a counted number on a torn plate with a saluting puppet; the third a dusk ending with the puppet walking off. It uses `slide` and `fold` (`tear` is one line away), the parallax camera, the grain and vignette, and captions on the torn strip. Replace the `INPUTS` words and number and the colours, keep the structure. It renders with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 4 out.png`.

## 13. Do, don't and the final checklist

Do:
1. Build every shape as a polygon with a pale cut edge.
2. Give each depth plane its own SVG so shadows fall between planes.
3. Fill the whole frame, strata to the bottom edge.
4. Change the ground colour every sheet.
5. Step puppets at 6 to 8 fps with seeded jitter.
6. Pop things in with two stop frames, not eased tweens.
7. Set the ransom `size` so `chars * 0.96 * size` is under the box width.
8. Cue scenes from `vfrey.line(i)` and anchored word regexes, never from fixed seconds.
9. Keep the grain still.
10. End one idle loop where the next pose begins.

Don't:
1. Use gradients (except the vignette), glossy highlights or perfect circles.
2. Tween puppets smoothly or run two loops on one joint.
3. Animate the grain.
4. Fade between sheets.
5. Put captions over a puppet, title or plate.
6. Use `fromTo` with `autoAlpha: 1` for something hidden until its cue.
7. Leave an empty band at the bottom.
8. Use fonts other than Titan One, Baloo 2 and Playfair Display.
9. Type invented facts into plates; show only what the script says.
10. Start a puppet off-screen (place it mid-stride).
11. Write counters from a tween callback (use `vfrey.onFrame`).

Final checklist, run on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; an even sample can land inside a transition, so also check stills at the beat times with `--frame <t>`). One line per signature trait:
- Every shape is a polygon with a pale cut edge.
- Torn edges show a fibre line.
- Shadows fall between layers.
- Grain and vignette visible, still.
- Muted vintage palette, a new ground colour per sheet.
- Ransom title chips differ in colour, font and tilt.
- Plates are torn and tilted.
- Puppets are jointed and mid-stride, no smooth acting.
- Parallax visible between planes across tiles.
- Strata, rocks and a fence reach the bottom edge.
- Caption is a torn cream strip with a brick chip, nothing under it.
- Transitions are slide, fold or tear.

Pitfalls from real runs: an unclassed `H("div")` is static, so give positioned children `position: absolute`; `--about` must share a word with the script; start nothing on a default port (use the dashboard-off setting for renders); interleaved idle and pose loops and duplicated `tl.set` on one joint cause flicker; chips wider than their box wrap and overlap, so size from the formula in section 5; roughly 10 thousand `tl.set` calls render fine (about two minutes for 41 s); Kokoro adds about a second at line breaks, so use fewer, shorter lines.
