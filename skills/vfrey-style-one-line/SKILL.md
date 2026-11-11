---
name: vfrey-style-one-line
description: "Use when the chosen video style is One-line minimal (vfrey-style-one-line), or the person asks for a single-line, continuous-line, minimal, quiet, gallery-print or 'one pen stroke' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: one unbroken ink line on warm paper that draws an object then travels on to become the next, a single accent dot at its tip, full-frame layout around the caption band, the connector line as the only transition and a generated music bed."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: One-line minimal
  style-summary: One unbroken ink line draws each idea in turn on warm paper, then flows on into the next. Calm and hypnotic.
  style-best-for: psychology, self-improvement, philosophy, wellness, productivity, ideas and feelings
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: One Line

This is an art-direction bible for one look. Start every scene from `starter.html` next to this file (section 12): copy it to `scenes/<idea>/index.html`, replace the PLACEHOLDER labels, redraw or reorder the objects in the single path, keep the engine (resampled path, tip schedule, camera keys, captions plate, marginalia). The script, voice and facts are yours; the rules below are topic-free but exact. The vfrey skill's `scenes/craft.md` still holds for everything not said here. `helpers.md` next to this file has the page shell, geometry helpers, tip schedule and camera; `make-bed.py` is the sound script.

## 1. The look in three sentences

One unbroken ink line, 5 px wide, never lifting, draws a scribble, then a head, then a clock, then a list, flowing from each object into the next; a single vermilion dot rides its tip. It is drawn on warm paper with a soft centre light, a warm vignette and a fine multiply grain, and a camera glides after the tip through a tall world, ending in a long pull-back that shows the whole journey as one line. Emptiness is the design: calm, hypnotic, almost no colour, a few italic words.

Signature traits (each checkable on a frame):
1. Warm cream paper `#F3ECDF` with a soft lighter centre and darker warm edges, plus grain.
2. One ink colour `#1C1A17`, one stroke width (5 px on screen at any zoom), round caps and joins.
3. The line is continuous: every object is joined to the previous one by a connector; the old drawing stays on the page.
4. A vermilion dot (r 15 px on screen) sits at the tip with a pulsing halo at .22 opacity.
5. Objects are simple, bold, outline-only silhouettes: no fills, no shading, no second line weight.
6. The art sits at about screen y 650, large and centred, with empty paper around it.
7. A printed-matter frame: an inner border at inset 46 px, a hairline rail with a tick per figure and a vermilion progress dot at y 1646, and an italic figure note at y 1706.
8. Captions on a flat paper plate with two 2 px ink hairlines (top and bottom) at y 1318 to 1550, serif, the spoken word in vermilion.
9. Italic serif labels in world space (a year, one word) appear beside the art, never more than a handful.
10. Slow camera lean toward the tip, a 20% zoom dip while travelling between objects, a 0.8% breathing zoom.
11. Scribbles tremble until the idea resolves; a tangle untangles into a straight line.
12. The end: camera pulls back to about 0.2 zoom, the rail fades, a big italic end title appears.

## 2. Palette

| Role | Hex | Use |
|---|---|---|
| paper | `#F3ECDF` | ground, caption plate |
| paper light | `rgba(255,252,244,.75)` | radial light at 50% / 38%, ellipse 85% x 70% |
| edge | `rgba(120,95,55,.16)` | warm vignette towards the edges |
| ink | `#1C1A17` | the line, text, hairlines, rail ticks |
| accent | `#D8472B` | the tip dot, halo, progress dot |
| accent text | `#C23A1E` | highlighted caption word |

Ratios: paper at least 96% of the frame, ink at most 3%, vermilion at most 1% (one dot, one progress dot, one highlighted word). Grain: multiply layer at opacity .5 (feTurbulence `baseFrequency .9`, 2 octaves, seed 4, tinted warm brown). Never use a second colour, gradients inside the drawing, a fill, white `#fff`, black `#000`, or a drop shadow.

## 3. Shapes and line

- Stroke: 5 px at every zoom (`vector-effect: non-scaling-stroke`), `stroke-linecap: round`, `stroke-linejoin: round`, ink `#1C1A17`. Hairlines: 2 px at .32 to .55 opacity (frame border at inset 46, caption plate rules, rail 2 px at .5).
- The line is ONE polyline of points resampled to even 4 px steps by arc length; the drawn path is points 0 to `floor(tip)` plus the interpolated tip.
- Corners: shapes are built from smooth curves (Catmull-Rom for organic outlines, arcs for circles) and straight segments; sharp corners only where the object has them (a list, a pen).
- Edge treatment: none. No roughness filter, no wobble, except tremble on a scribble: `j * sin(t * 11 + i * .41)` with `j = 2.6 * (1 - calm)`.
- Texture recipe: the paper layer (two radial gradients) and the grain layer:

```html
<filter id="gf" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/>
 <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.28 0"/></filter>
```

- Light direction: none; the centre light is a symmetrical glow. No shadows.
- Connectors are cubic curves leaving downward and arriving along the next object's entry direction: `connect(next, dirIn, k = .42)` with control offsets `k * distance`.

## 4. Characters and objects

An object is drawn in one pass of the pen: it starts where the connector arrived and ends where the next connector must leave (top to bottom). Proportions are simple: a head profile is about 640 px tall (a closed Catmull-Rom outline through about 25 points, ending at the neck), a clock is a circle of radius 300 with four tick spikes, a list is a box with rows of check-box and wavy text lines (boustrophedon, rows linked by short swoops). Figures have no eyes unless the story needs one (a single dot is the pupil); hands are not drawn. Detail comes from where the line goes, not from extra strokes.

```js
raw.push([x, y]); mark("objS");          // start of an object
addCR([last(), [x1, y1], [x2, y2]]);     // organic outline
addArc(cx, cy, R, 0, Math.PI * 2);       // exact circle
addWave([x3, y3], 5, 14, 0);             // handwriting wobble along a segment
connect([nx, ny - 300], [0, 1]);         // flow to the next object
mark("objE");
```

Stock props (recipes in `helpers.md` and the starter): a scribble (Lissajous with decaying envelope), a head profile, a clock (hands first, rim after), a to-do list, a tangle (`chord(u) + R * env(u) * lissajous(u)`, untied by lerping each point to its chord point), a pen (butt to nib, slit), a tick, a straight calm line, a lightbulb, a house, a heart, a cup, a door. Each is one pass of the pen with simple bold shapes: fine details vanish at the pull-back.

## 5. Typography

- Font: Playfair Display (shipped, weights 400 to 900 and italic); local fallback `Georgia, "Times New Roman", serif`.
- World labels: italic 400, 58 to 64 px, ink, fade in over 0.6 s on their word, beside the art (a year, one word).
- Figure note: italic 400, 44 px, centred at y 1706, roman numeral and a middle dot: `II . name, year`; crossfades per beat.
- End title: italic 400, 150 px, line-height 1, tracking -.01em, centred at y 1632, lower-case sentence ("one line.").
- Captions: serif 500, 70 px, ink, `maxWords: 3`, spoken word in `#C23A1E`, `style: "color"`, letter-spacing .005em, centred; set the same style in the script JSON `captions` (it overrides the scene call).
- Caption plate: paper `#F3ECDF`, left/right 70 px, top 1318 px, height 232 px, `border-top` and `border-bottom` 2 px `rgba(28,26,23,.55)`; shown only while words show. Never put art or the tip there.

## 6. Composition

Captions sit on a plate, never over a subject; vfrey draws them in a band (`--vf-caption-at`) and the paper ground runs to the bottom edge of the frame around it.

- Safe area: art inside x 120 to 960, y 150 to 1250 (centre y 650); marginalia y 1646 to 1750; the corner label owns the bottom right.
- Frame grid: world objects are about 1300 px apart vertically so neighbours stay off-screen; the camera maps the focus point to screen (540, 650).
- Subject scale: the current object fills 55 to 75% of the width (head 640 px, clock 600 px, list 570 px); at the pull-back the whole journey is about 20% zoom.
- Layers: paper and grain (back), the world (line, dot, labels), frame and rail (front), caption plate.
- Depth cues: none by design; the only depth is zoom dips and the lean toward the tip.
- Empty paper is at least 60% of every frame until the pull-back.

Shot types:

```
SCRIBBLE            OBJECT HOLD          TRAVEL (connector)
   ~~@              +------+             |
  ~~~~~             | head |             |
 (tip dot)          +------+              \__ (zoom dips 20%)
 ----caption----    ----caption----          o
```

```
LIST                TANGLE UNTIE          PULL-BACK + END
 [] ~~~~             ~~~~~~~~              (whole path, tiny)
 [] ~~~~               ~~~                    one line.
 [] ~~~~             ------ straight
```

## 7. Motion

- Feel: smooth continuous drawing, no steps; the tip moves along index positions with eased speed.
- Easing: drawing segments `sine` in-out (`0.5 - 0.5 cos(pi u)`), connectors and camera `cubic` in-out (`4u^3` / `1 - (-2u + 2)^3 / 2`), labels and figure notes `power2.out`.
- Durations: scribble about 1.4 s; head 2 to 4 s; each object 3 to 5 s; connector 0.45 to 1.3 s; untie 2.3 s; final line 1.9 to 2.6 s; pull-back 2.6 s; labels 0.6 s; figure note 0.45 s in and 0.3 s out; end title 1.2 s.
- Holds: the first beat starts at 0.15 s (the opening is nearly empty paper; the `frames.opening` check warns, accept it); the last frame holds the end title.
- Camera vocabulary: hold on an object; glide between objects with a zoom dip of 20% (`1 - .2 sin(pi u)`); lean 16% toward the tip while drawing; breathing `1 + .008 sin(.7 t)`; final pull-back to z 0.2 to 0.22 centred on the middle of the world.
- Secondary: scribble tremble, halo pulse `1 + .18 sin(4.2 t)`, progress dot along the rail. Ambient: nothing else moves.
- Forbidden: dasharray drawing (use index-based drawing), per-element tweens that fight the proxy, fades between objects, rotations of the camera, any second line, any glow. Everything is drawn from one `render(t)` called from a GSAP proxy tween with modifiers (never `onUpdate`).

## 8. Transitions

There are no cuts and no wipes: the connector line IS the transition, with the camera gliding and dipping in zoom (about 0.45 to 1.3 s, ending as the next object begins). The old object stays on the page; it is part of the final print. Start the connector so the new object begins drawing as its line starts. The only other change is the end card: the rail fades over 0.6 s and the title fades in over 1.2 s from `pullS + 1.1`. Forbidden: dissolves, slides, flashes, any scene swap.

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes the bed: slow overlapping pad chords (Am9, Fmaj7, Cmaj7, Gadd9) with tremolo, soft bell plucks as each object arrives, filtered-noise pen scratch while the pen draws, a rising pentatonic arpeggio while the tangle unties, a low resolve and a high bell at the end, with echo and fades. Mix: `volume -16`, `duck: true` (vfrey masters to -14 LUFS). Standard library only, always the same file for the same input.

1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`), then from the project folder: `python3 .agents/skills/vfrey-style-one-line/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey one line style)", "volume": -16, "duck": true}` and make it again with `--rerender`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no cues before the first render. No `python3` on the machine: leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (35 to 40 s, 5 lines)

Pace: set `lineGap` in the script (0.25 to 0.4, `voice.md`); do not merge lines to hide the pause: the line keeps drawing. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window (Kokoro af_heart with lineGap 0.3 is about 3 words a second). Facts on screen are only ones you can cite, as the voice says them.

| Beat | Time | Shot type | Content |
|---|---|---|---|
| Hook | 0 to 7 s | scribble to head | the question as a scribble that resolves into a head; figure I |
| Beat 1 | 7 to 15 s | travel, clock | connector to a clock; a year label; figure II |
| Beat 2 | 15 to 23 s | list | the list of the idea in one boustrophedon pass; figure III |
| Beat 3 | 23 to 32 s | tangle untie | the problem as a tangle that untangles; a pen writes the fix; figure IV and V |
| Payoff | 32 to 40 s | pull-back + end title | one calm line, a tick, the whole journey, the end title |

## 11. Reference frames

Four frames of the showcase film, 540 x 960, in this folder (not copied into installed projects):
- `ref-1.jpg`: the connector leaving the first object with the dot at its tip; copy the emptiness and the dot size.
- `ref-2.jpg`: a travel move with a hard corner; copy the line weight and the caption plate with its hairlines.
- `ref-3.jpg`: the tangle at full size with a year label; copy the density of a scribble and the label style.
- `ref-4.jpg`: the pull-back with the pen and the end title; copy the rail, the figure note and the end card.

## 12. Reference implementation

`starter.html` is a working four-object film (scribble to head, clock, list, a calm line and tick) with the engine: one resampled path, `tipAt`, camera keys, `travelDip`, labels, figure notes and rail, grain and paper, caption plate, and the end card. Start from it: `cp .agents/skills/vfrey-style-one-line/starter.html scenes/<idea>/index.html`, replace the PLACEHOLDER labels, redraw the objects with `addLine / addBez / addCR / addArc / addWave / connect`, keep `mark` names in step with the `segs` and `keys` tables. Keep `data-composition-id` on `#root`. Check a frame with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 3 out.png`. A `tick` needs `--scene scenes/<idea>` or it renders the plain default template.

## 13. Do / Don't, and the final checklist

Do:
1. Do build one array of points and resample it to even 4 px steps.
2. Do join every object to the next with a connector that arrives along its entry direction.
3. Do keep the stroke at 5 px with `vector-effect: non-scaling-stroke`.
4. Do keep the tip dot at r 15 px on screen (`15 / zoom`).
5. Do end an object where the next one needs to start (top to bottom).
6. Do leave most of the frame empty paper.
7. Do key the beats to words with a regex on `vfrey.timing.words`, never to fixed seconds.
8. Do keep the caption plate at the same place on every frame.
9. Do dip the zoom 20% while travelling and lean 16% toward the tip.
10. Do end with a long pull-back and an italic end title.

Don't:
1. Don't lift the pen: no second path, no cut between objects.
2. Don't fill shapes or add shading, glow or shadows.
3. Don't add a second colour or a second line weight.
4. Don't draw with dasharray (it ignores zoom with `non-scaling-stroke`).
5. Don't use `onUpdate` for the draw loop: use a proxy tween with modifiers (and `vfrey.onFrame` if you add another loop).
6. Don't put the tip or art inside the caption band.
7. Don't use more than a handful of world labels.
8. Don't use fine details: they vanish at the pull-back.
9. Don't cut, wipe or fade between objects.
10. Don't merge lines to avoid the voice pause.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- Paper: cream with a soft centre light and grain, no flat white?
- Line: one ink colour, 5 px, round caps, continuous across tiles?
- Dot: a vermilion dot at the tip in every tile?
- Objects: simple outlines, no fills, joined by connectors?
- Emptiness: at least 60% empty paper outside the pull-back?
- Marginalia: frame border, rail with tick and dot, italic figure note?
- Caption plate: same place, hairlines, serif words, one vermilion word?
- Camera: tip near y 650, zoom dips visible between objects?
- Labels: only a handful, italic, beside the art?
- End: pull-back shows the whole journey and the end title sits where the rail was?
- Numbers: every number on screen matches the number the voice says (digits, units, rounding), read against the script?

## Pitfalls

- `tick` needs `--scene scenes/<idea>` or it renders the plain default template.
- The `frames.opening` check warns (1% of the frame differs) because calm paper is the design; accept it or start the scribble already drawn.
- `vector-effect: non-scaling-stroke` makes dashes ignore zoom: use index-based drawing.
- Keep the tip out of the caption band; the lean keeps it near y 650 and the plate is opaque anyway.
- A tween's `onUpdate` does not run when the renderer seeks: `render(t)` is called from a proxy with modifiers.
