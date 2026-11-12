---
name: vfrey-style-flat-2d
description: "Use when the chosen video style is 2D flat (vfrey-style-flat-2d), or the person asks for a flat, vector, cartoon-explainer, infographic or 'clean animated characters and charts' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: palette, code-drawn characters and props, live charts, full-frame layout around the caption band, shape-wipe transitions and a generated music bed."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: 2D flat
  style-summary: Friendly cartoon people, bold flat colours and charts that grow as the voice explains.
  style-best-for: explainer, personal finance, business, education, how-to
  style-poster: flat-2d.jpg
  style-preview: flat-2d.mp4
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: 2D flat

Flat vector illustration with no gradients, blurs or outlines on characters: big simple people, chunky ink-stroked props and charts in a handful of solid colours, on a ground colour that changes with each act. Everything pops, hops and wipes in time with the voice, like a friendly animated explainer. If a frame has a gradient, a blur, a thin line or a photo-real detail, it is not this style.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. **Start from `starter.html` next to this file (`npx vfrey styles start flat-2d scenes/<idea>` creates the folder with it as `index.html`, whichever agent folder this skill was installed in)** (then replace the PLACEHOLDER content: it already renders three acts with `vfrey render --frame`). Code to copy is also in `helpers.md` next to this file; the music script is `make-bed.py` next to this file. Four reference frames, `ref-1.jpg` to `ref-4.jpg`, live in the package copy of this style (section 11); they are not installed into projects.

## When to use it, when not

- Use it for explanations with actors and quantities: money, habits, comparisons, "A versus B", step-by-step how-tos, anything a chart or a pair of characters can act out.
- Not for moody stories, true crime or history with atmosphere (use a darker style), nor for a subject that needs realism (a face people know, a real place, a product photo). If the script has nothing to count, compare or act out, pick another style.

## Plan before coding

1. Cast it: one or two characters (one colour each) and one "value" object the topic is about (a coin, a leaf, a battery). Every act shows a character doing something with that object, or a chart of it.
2. Split the script into 5 to 8 acts, one per idea, and give each a ground colour from the palette so neighbours differ. Decide which act is the chart and which is the payoff.
3. Write the numbers down first. Charts and counters are computed in the scene from real inputs (a formula in JS), never typed in or invented, and an assumption (a rate, a date) is shown on screen as a chip.
4. Pace the script for the voice and avoid colons. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 2.8 words a second (measured; the `series kit` Pace line has your voice's own figure).

## 1. The look in three sentences, and the signature traits

Seven solid colours on a cream floor-and-sky world; characters are rounded blocks with dot eyes and no outline; props wear a thick navy stroke. Every act has its own ground colour and ends in a shape wipe into the next. Numbers and charts are the stars: bars grow, counters tick, one value colour marks the thing the video is about.

Signature traits (each checkable on one frame):
1. No gradient, blur or glow anywhere; the only soft thing is a 13% black ellipse under feet and a 7% black floor texture.
2. At most seven colours on screen (section 2); one ink, navy, for strokes, plate and text.
3. Characters have no outline; props have a 6 to 10 px navy stroke with round joins.
4. Faces are two dot eyes (r 8.5), two 35% coral cheeks, one quadratic-curve mouth. No nose, no ears, no eyebrows.
5. A character is about 450 units tall at scale 1 and is drawn at scale 1.3 to 1.45 (a third of the frame height or more).
6. The ground colour differs from the previous act: cream, teal, coral, navy, cream, gold.
7. A huge pale circle (a spotlight) sits behind the hero, plus two hills or a floor with texture, plus clouds or dots at the sides. No patch of 200 px or more is one flat colour.
8. The floor runs to the bottom edge with foreground props (coin stacks, plants) at both corners, partly cropped.
9. One navy caption plate (radius 48) in the same place in every act; white words; the spoken word on a gold chip.
10. Charts show gridlines, axis labels and name chips from their first frame; bars carry a 4 px stripe pattern.
11. Acts change by a clipped shape growing over the screen (circle, rounded square, rise), never a fade or slide.
12. Everything is Baloo 2 weight 800; JetBrains Mono 700 only for tiny tags.

## 2. Palette

| Role | Hex | Use | Ratio of frame |
| --- | --- | --- | --- |
| ground A (sky/cream) | `#FFF3DC` | acts 1, 5 | up to 60% in a cream act |
| floor / pale spotlight | `#F6DFB4` | floor, big circle | 15 to 30% |
| ink | `#16213E` | strokes, plate, text on light, ground of a "night" act | 5 to 12% (a navy act: up to 60%) |
| character 1 | `#18B7A4` shirt, `#0C7A70` stripe and hills | hero, teal ground | 8 to 20% |
| character 2 | `#FF6A4D` shirt, `#C9442C` stripe | pal, coral ground | 8 to 20% |
| value colour | `#FFC233` face, `#E39B12` edge | only the object the topic is about | at most 12% |
| skin | `#8D5A3B`, `#F1B58A` | faces and hands | under 3% |
| white | `#FFFFFF` | clouds, caption words, shoe soles | under 8% |

Swap the hues for the topic or `brand.json`, keep the roles: one ink, one floor, one colour per character, one value colour. Never use a colour for two different meanings in one act, a gradient, a black that is not the ink, or a second yellow. Alpha is allowed only for the shadow (13%), floor texture (7%), dots (35% white), cheeks (35%).

## 3. Shapes and line

- Corners: rounded rectangles everywhere (`rx` 14 for limbs, 52 for torsos, 34 for jars, 48 for the plate, 80 for the "rise" wipe). No sharp corners except bars (they square off at the baseline) and the hills.
- Stroke: props 6 to 10 px navy (`stroke-linejoin: round`); the baseline 10 px; character parts none; mouth 6 px round cap; glasses 6 px.
- Texture recipes, all `<pattern userSpaceOnUse>` in one hidden `<svg><defs>`:
  - floor: `120x70` tile, one `6 px` black line at 7% and two `r 4` dots at 8%.
  - dots (backgrounds): `26x26`, one `r 3.2` white dot at 35%.
  - stripe (bars, stacks): `40x26`, a `4 px` black line at 16% along the bottom.
- Light and shadow: there is no light direction. The only shadow is a flat ellipse under a figure (`rx 120, ry 16`, black 13%) and the plate's `0 10px 0` 12% black lip. A prop gets a darker second tone of its own colour for its edge or underside (`#E39B12` under `#FFC233`), never a gradient.
- Background layer and foreground layer are two SVGs with the same viewBox so the background can drift against the camera.

## 4. Characters and objects

A person is built from primitives, feet at (0,0), 450 tall: two legs (`rect 44x118 rx 14`, ink), two shoes (white `62x26`), two arms that pivot at the shoulders (`rect 42x130 rx 21` plus a skin circle r 25 hand), a torso (`rect 160x196 rx 52`) with a darker stripe 24 tall across it, a neck, and a head (circle r 66, head-to-body about 1 : 3.4) with a fringe path, optional hair back and bun, cheeks, two dot eyes, a quadratic mouth. The body is `helpers.md`' `person()`; this is its shape:

```js
// head: circle r66 at (0,-348); eyes r8.5 at (-26,-342) and (26,-342); mouth M-18,-318 Q0,-300 18,-318 (the middle control y is pose.smile)
`<circle cx="0" cy="-348" r="66" fill="${skin}"/><path d="M-68,-338 C-72,-428 72,-428 68,-338 C42,-372 -10,-380 -68,-338Z" fill="${hair}"/>
 <circle cx="-26" cy="-342" r="8.5" fill="${C.navy}"/><circle cx="26" cy="-342" r="8.5" fill="${C.navy}"/>
 <path d="M-18,-318 Q0,-300 18,-318" fill="none" stroke="${C.navy}" stroke-width="6" stroke-linecap="round"/>`
```

Hands are plain circles; fingers never. Hair is one path and one tone; glasses are two stroked circles. Characters act by tweening a `pose` object (`aL`, `aR` arm angle, `hop`, `smile`).

Stock props (all flat, 6 to 10 px ink stroke, the value colour on the thing that matters):
1. Coin or disc: circle r 50 gold, edge ring 7 px `#E39B12`, inner ring r 35 5 px, a `$`-style glyph.
2. Money-bag style sack: one path `M-70,0 C-110,-10 -118,-120 -50,-170 L-34,-208 L34,-208 L50,-170 C118,-120 110,-10 70,0Z`, a coral tie `80x28`, a gold badge.
3. Jar: `rect 196x250 rx 34`, white at 16% fill, 9 px ink stroke, a navy lid `224x34`, a 16 px white highlight bar at 55%; contents are stacked ellipses.
4. Hourglass: two triangles, ink frame, sand as `scaleY` of two paths.
5. Balance scale: ink post, beam that rotates, two pans that follow the beam angle.
6. Tree: stroked trunk drawn with `stroke-dashoffset`, circle leaves in a teal pair, value objects as fruit.
7. Clock: white disc, 9 px ink ring, two rounded hands that rotate.
8. Stacked bars: `rect` with a stripe-pattern overlay of the same rect, a segment per component.
9. Cloud: three circles and an ellipse in white at 95%.
10. Badge: circle r 150 to 190 in the value colour, 9 px ink ring, a big number (0.78 x radius) and a small label.

## 5. Typography

| Role | Font | Size (px at 1080 wide) | Colour |
| --- | --- | --- | --- |
| captions | Baloo 2 800 (fallback `"Arial Black", sans-serif`) | 74, never changes | white on the ink plate, active word `#16213E` on a `#FFC233` chip |
| chip headline / assumption | Baloo 2 800 | 50 on an ink plate `780x92` (radius 46) | cream |
| payoff number | Baloo 2 800 | 280 to 340 | ink on a value or cream disc |
| bar value | Baloo 2 800 | 84 | ink |
| name chip | Baloo 2 800 | 40 on an ink pill `250x64` | cream |
| axis ticks, disclaimers | JetBrains Mono 700 (fallback monospace) | 28 to 34 | white at 70% or cream |

Sentence case in captions, UPPER CASE in chips and tags, tracking 0 (mono tags 0.04em), line height 1. `text-anchor` is set in CSS classes (`svg text { text-anchor: middle } svg text.st { text-anchor: start }`), never as an attribute.
Caption plate: `top: var(--vf-caption-at)`, `height: var(--vf-caption-h)` (about 214 px at y 1322 in a bottom 9:16 frame), side inset 36 px, radius 48, ink fill, words centred, 3 words at most, 2 lines at most, the plate appears only while words are on screen.

## 6. Composition

- Safe area: top 10% is sky shapes only; the right-bottom corner is the AI label, keep it free; nothing that matters below the plate's top edge.
- Frame grid: three bands. Hero zone from 15% to the floor line (y about 300 to 1290), plate band (y 1322 to 1536), floor and foreground below (y 1540 to 1920). Subjects centre on the thirds lines x = 360 and x = 720.
- Subject scale: figures at scale 1.3 to 1.45 (580 to 650 units, 30 to 34% of the frame height), props at 1.2, badges 300 to 380 across. A figure's feet sit on the floor line.
- Depth: background svg (hills, circle, clouds) drifts 20 to 30 px against the camera; foreground props at both corners enter with `back.out` and sit partly off the edge. No perspective.
- Captions always sit on the plate, never over a character, a prop or a chart. The floor and its foreground props reach the bottom edge.

Shot types (box = frame, `P` plate):
```
HERO DUO                CHART                  BADGE + OBJECT         COMPARE (scale)        PAYOFF NUMBER
+------------+          +------------+         +------------+         +------------+         +------------+
| (badge)    |          |[headline  ]|         |   cloud    |         |  [A]  [B]  |         |  [chip]    |
|  O    O    |          | |    ___   |         |   (BADGE)  |         |   \__/__   |         |   (( 71%)) |
| /|\  /|\   |          | |_ _|_|_|_ |         |    /\      |         |  P    P    |         |    hero    |
|~~floor~~~~~|          |~name~name~~|         |~~ obj ~~~~~|         |~~floor~~~~~|         |~~floor~~~~~|
|[ plate  P ]|          |[ plate  P ]|         |[ plate  P ]|         |[ plate  P ]|         |[ plate  P ]|
| coins  coin|          | coins  coin|         | coins  coin|         | coins  coin|         | coins  coin|
+------------+          +------------+         +------------+         +------------+         +------------+
```

## 7. Motion

- Feel: smooth, springy, 30 fps, never stepped. Everything is a pop, a hop or a wipe.
- Easing: entrances `back.out(1.8)` (pops) or `back.out(1.3)` (slides) over 500 to 700 ms; value changes `power2.out` 1.4 to 1.6 s; camera `power1.inOut`; landings `bounce.out` 220 to 450 ms; wipes `power2.inOut` 600 ms.
- Entrances begin 0.2 s before their spoken word (find the word by text, never by index). The subject is on screen within 0.3 s of an act starting. The payoff holds 1.5 s or more and the last picture holds to the end.
- Camera: a CSS transform on `.cam`: scale 1.0 to 1.1 over the act, a 10 to 24 px pan, the background drifting the other way. Never a whip or shake.
- Secondary and ambient motion (a pure function of time, from `vfrey.onFrame`): head bob `sin(t * 2.6)` 2.6 px, arm sway 2.5 degrees, a blink every 3.4 s lasting 0.13 s, cloud drift 24 px at `sin(t * 0.3)`, floating shapes 12 to 14 px at `sin(t * 1.5)`.
- Pose cues: arm swing 150 degrees in 300 ms `back.out(2)`, hop 40 px up in 300 ms and back with `bounce.out`.
- Forbidden: stepped or limited-frame animation, motion blur, rotation of whole scenes, zooms past 1.1, anything that eases `linear` except the clock.

```js
const T1 = at("seventy-one", 0.34);                    // a word's start by text, with a fallback
tl.from("#badge", { scale: 0, svgOrigin: "200 250", duration: 0.5, ease: "back.out(1.8)" }, T1 - 0.2);
tl.to(pose("hero"), { aR: 150, smile: 1.6, duration: 0.3, ease: "back.out(2)" }, T1);
vfrey.onFrame((t) => ambient.forEach((f) => f(t)));      // what a render runs: ambient art as a pure function of time
```

## 8. Transitions

Allowed (all 600 ms, `power2.inOut`, starting 0.45 s before the next act's first word so it ends as the word begins):
1. circle from a point: `circle(0px at x y)` to `circle(2300px at x y)`.
2. rounded square from the centre: `inset(50% round 50%)` to `inset(0%)`.
3. rise from the floor: `inset(100% 0 0 0 round 80px)` to `inset(0%)`.
Each seam has two full-frame layers, a coloured rim and the next act; tween `clipPath` on the rim, then on the act 0.1 s later (the rim shows as a leading edge of colour). Rotate the three kinds. Forbidden: fades, slides, cuts, `polygon()` clip paths between degenerate point sets (they render nothing), a badge left half-cropped at the end of a wipe.

## 9. Sound

Bed: 96 bpm, Am - F - C - G, a soft pad, a bass on beats 1 and 3, a plucked 8th-note arpeggio and off-beat ticks; light, friendly, major-leaning; the bed sits about 17 dB under the voice (`volume: -17`, `duck: true`). Accents (cues.json): `whoosh` on every wipe, `ting` when an object lands, `pop` for a badge, `thud` for a stamp, `glide` as a bar grows, `chime` at the payoff.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with the accents (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 "$(npx vfrey styles path flat-2d)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey 2D flat style)", "volume": -17, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (30 to 40 s)

| Time | Beat | Shot type | Content |
| --- | --- | --- | --- |
| 0 to 4 s | hook | BADGE + OBJECT or HERO DUO | the claim as a big badge, hero and pal pop in, cream ground |
| 4 to 12 s | setup | HERO DUO | each character does one thing with the object, ground colour 2 |
| 12 to 20 s | mechanism | BADGE + OBJECT | one prop acts it out (tree, jar, hourglass), assumption chip visible, ground colour 3 |
| 20 to 30 s | evidence | CHART | bars rise within 1 s from a visible grid, both totals held 2 s, gap tag |
| 30 to 36 s | payoff | PAYOFF NUMBER or COMPARE | the one number big, hero hops, gold or teal ground |
| last 2 s | close | PAYOFF NUMBER | the last picture holds to the end |

## 11. Reference frames

Saved in this style's package folder (not installed into projects): look at them before drawing.
- `ref-1.jpg` the hook: copy the cream ground, the big pale circle, the two hills, the badge top-left, the two figures at scale 1.4, coin stacks cropped at the bottom corners.
- `ref-2.jpg` a mechanism act on a navy ground: copy the pale circle on navy, the tree with gold fruit, the badge in the corner and the same caption plate.
- `ref-3.jpg` a chart on cream: copy the gridlines with mono labels, striped bars with a navy edge, the name pills under the baseline above the plate and the value labels in 84 px ink.
- `ref-4.jpg` a compare act on gold: copy the balance scale, the two characters flanking it, the pale ring behind and the tiny labels.

## 12. Reference implementation

`starter.html` next to this file: three acts (hook with a character pair, a live two-bar chart, a payoff) with the person builder and ticker, the pose tweens, the seam transitions, the camera, the ambient motion and the caption plate. Everything topic-specific is in the `INPUTS` object and the `at(word, share)` cue calls: replace them, keep the structure. It renders with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 4 out.png`.

## 13. Do, don't and the final checklist

Do:
1. Compute every number on screen from inputs in the scene.
2. Change the ground colour every act.
3. Draw figures large, feet on the floor line.
4. Fill the bottom with floor and foreground props to the bottom edge.
5. Keep the plate in one place, one size, with the same type.
6. Put a spotlight circle behind the hero.
7. Anchor entrances to spoken words found by text.
8. Pop things in with `back.out`, land them with `bounce.out`.
9. Show the assumption as a chip when a rate or date drives a number.
10. Draw ambient art as a function of time and repaint it in `vfrey.onFrame`.

Don't:
1. Use gradients, drop shadows, blur or glow.
2. Outline characters.
3. Use more than seven colours or a second yellow.
4. Put captions over a character, prop or chart.
5. Use fades, slides or hard cuts between acts.
6. Draw faces with noses, ears or eyebrows.
7. Leave a 200 px patch of one flat colour.
8. Tween `polygon()` clip paths between degenerate point sets.
9. Type invented numbers into a chart.
10. Hold a badge half-cropped at the end of a wipe.
11. Set `captions.style` in the script to anything but `box` (it overrides the scene's).

Final checklist, run on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; an even sample can land inside a wipe, so also check stills at the beat times with `--frame <t>`). One line per signature trait:
- No gradient, blur or glow anywhere.
- At most seven colours; navy is the only ink.
- Characters outline-free, props with a thick navy stroke.
- Faces are dots, cheeks and one curve.
- Figures about a third of the frame height or more.
- Neighbouring tiles have different ground colours.
- Spotlight circle, hills or floor, clouds or dots: no big flat patch.
- Floor and foreground props reach the bottom edge.
- Same plate, same place, same size in every tile, words on it, none over art.
- Charts show gridlines, labels and name chips from their first frame, numbers computed, assumption chip visible.
- Wipes are circle, square or rise only.
- Text is Baloo 2 (mono only for tiny tags).

Pitfalls from real runs: a `captions.style` in the script beats the scene's; `frames.text-overlap` can fire for text in stacked scene layers that are clipped away (confirm on a still before changing anything); a `tl.from` offset smaller than the object leaves it half visible, so slide in from at least its own height; label pills collide with arcs, so keep arcs below plates; a still (`--frame`) of attribute-driven art is only right when `vfrey.onFrame` repaints it.
