---
name: vfrey-style-neon-synthwave
description: "Use when the chosen video style is Neon synthwave (vfrey-style-neon-synthwave), or the person asks for an 80s retro-future, neon, synthwave, vaporwave, VHS or 'glowing line art' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: glowing light-tube line art on a deep purple night, a striped sun, a drifting perspective grid, chrome lettering, VHS glitch cuts, full-frame layout around the caption band and a generated synth bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Neon synthwave
  style-summary: Glowing neon line drawings on a purple night sky with a striped sun, a drifting grid floor and VHS glitches.
  style-best-for: tech history, gaming, music, science, retro culture, product explainers
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Neon synthwave

This is an art-direction bible for one look. Start every scene from `starter.html` next to this file (section 12): copy it to `scenes/<idea>/index.html`, replace the PLACEHOLDER words and the three scenes, keep the world (sky, striped sun, mountains, grid, VHS layers, captions plate). The script, voice and facts are yours; the rules below are topic-free but exact. The vfrey skill's `scenes/craft.md` still holds for everything not said here. The drawing toolkit is `neon.js` next to this file, the page shell and a scene skeleton are in `helpers.md`, and the sound script is `make-bed.py`.

## 1. The look in three sentences

Every object is a glowing light tube (a coloured line with a white-hot core) that strikes on stroke by stroke, over a deep purple night sky with a striped sun, cyan wireframe mountains and a perspective grid drifting toward the viewer. Titles are chrome lettering with an extruded purple shadow and a neon outline, and every cut is a VHS glitch. It is 1985 seen through a tube television: purple-magenta-cyan, scanlines, chromatic fringe, nothing matte.

Signature traits (each checkable on a frame):
1. Sky gradient from near-black at the top to hot magenta at the horizon, 70 twinkling stars.
2. A striped sun (yellow to orange to pink) sitting on the horizon, stripes thickening toward the bottom.
3. Cyan wireframe mountains left and right of the sun, a 6 px white-pink horizon line with a magenta glow.
4. A perspective grid below the horizon at y 1010 that fills the bottom half and fades toward the horizon.
5. Hero art is outline only: a coloured tube with a white core, a faint 10 to 30% fill over a dark plate.
6. Chrome titles in Titan One, skewed -8 degrees, with a hard-step chrome gradient and a `5px 7px` purple extrusion.
7. One accent colour per scene; the grid recolours to it.
8. Scanlines (20% black every 5 px), a vignette, and a faint red/blue chromatic fringe on the whole world.
9. A glitch cut between scenes (displacement, red/blue split, jittering bars), 0.36 s.
10. A dark captions plate with a 3 px magenta border and glow, white Baloo 2 words, fixed at y 1250.
11. A HUD readout box under the plate: mono label and a scrolling dashed sine wave.
12. Drifting `+` sparks and a tracking band rolling down a few times a film.

## 2. Palette

| Role | Hex | Use |
|---|---|---|
| sky | `#04010f`, `#16043f`, `#4a0c78`, `#a0147f` | top to horizon gradient (stops 0, .45, .8, 1) |
| floor | `#0a0120` | everything under the horizon |
| panel / plate | `#0b0224` | dark fill behind objects and HUD |
| magenta | `#ff2bd6` | default accent, caption border, grid, sun halo |
| cyan | `#27f0ff` | mountains, tubes, second accent |
| hot pink | `#ff4f9a` | accent variant |
| yellow | `#ffe14a` | payoff accent, LEDs |
| violet | `#a66bff` | quiet accent |
| alarm red | `#ff3b5c` | one flash only (a failure) |
| sun | `#fff35c`, `#ff9a3c`, `#ff1f8e` | sun gradient, top to bottom |
| chrome | `#fff 0`, `#aee6ff .44`, `#3a2a9e .5`, `#ff3dd0 .54`, `#ffc2f2 1` | title gradient with a hard step at the middle |
| extrusion | `#2a0670` | title shadow |

Ratios: dark ground (sky plus floor) 60 to 70% of the frame; one accent colour at most 15% of the pixels in a scene, white only in tube cores, text and stars; yellow only on the payoff scene or one detail. Never use pure black `#000`, a flat white fill, brown, green, or any pastel; never two accents on one hero. Dim the sun (opacity .5 to .7) behind scenes with small icons.

## 3. Shapes and line

- Tube stroke widths at 1080 x 1920: hero outlines 7 px (details 3 to 5 px), chrome title stroke `size * .045`, HUD boxes 3 px, mountain ridge 3.5 px (ridges 1.6 px), horizon line 6 px. The white core is `width * .36` at opacity .92. Caps and joins are round.
- Corners: round joins on tubes, but object plates are sharp rectangles; circles are two arcs.
- Glow recipe: one group per colour with `filter: drop-shadow(0 0 3px c) drop-shadow(0 0 12px c) drop-shadow(0 0 30px c88)`; never one filter per path.
- Plate recipe: hero fill `#0b0224` at .92 under the tube so the grid does not show through; tinted fill is `color` at opacity .1 to .3.
- Grid recipe (rewritten every frame with `tl.set(paths, { attr: { d } }, t)`): horizontals at `y = HY + 910 / z`, `z = 1 + (k - frac(t * .42)) * .5`; verticals static from (540, 1010) to (540 + j * 170, 1930), j from -18 to 18; three passes of widths 9, 4.5, 1.9 at opacities .2, .38, 1 with a stroke gradient (0 at the horizon to 1 at the bottom) in the scene accent.
- Sun: circle r 282 at (540, 800) with a mask whose black stripes (7 of them, 3 to 27 px tall, spacing growing downward, sliding at .16 per second) are rewritten every second frame; halo r 330 blurred 30 px in magenta at .38.
- Texture: scanlines `repeating-linear-gradient(0deg, rgba(0,0,0,.20) 0 2px, transparent 2px 5px)` with `mix-blend-mode: multiply`; vignette `radial-gradient(ellipse at 50% 46%, transparent 55%, rgba(8,0,26,.62) 100%)`; chromatic fringe filter `ca`: red channel shifted -3 px, blue +3 px, recombined with screen blend.
- Light direction: from the hero outward (glow), no cast shadows; the only shadow is the title extrusion at (+5, +7).
- Glow bands when compressed: keep the outer halo faint and never replace glow with a full-frame blur.

## 4. Characters and objects

Heroes are built from 3 to 8 neon paths: an outer silhouette (7 px, with fill), 1 to 3 inner details (3.5 to 5 px, no fill), optional LEDs (circles r 7 in yellow, cyan or magenta). Figures are simplified to a bust: an oval head, a trapezoid collar and an arc for the shoulders; no eyes or faces. Hands and animals are avoided; a gear, bulb, cabinet, book, cassette, chip, screen or building front reads better. Two-sided symmetric objects (wings) use a mirrored group.

```js
const body = neon(g, `M${x},${HY} V${top} H${x + w} V${HY}`, C.cya, { w: 7, fill: C.ink, fa: .92 });
const grid = neon(g, cells, C.mag, { w: 3 });   // a second tube in the second accent
drawAll([body, grid], t0, .7, .1);               // draw on in .7 s, staggered .1 s
```

Stock props in `starter.html` (all pass the same recipe): `P.bulb` (filament and base), `P.gear` (8 teeth, spins at 30 degrees a second), `P.cabinet` (a tall plate with a cell grid), `P.arrow` (shaft and head), `P.plate` (a labelled box), `P.ring` (a bloom ring from r 50 to 420 in 1 s). Add in the same grammar: a cassette, a CRT monitor, a rocket, a cartridge, a palm tree, a lightning bolt, a chip with pins.

## 5. Typography

- Titles: Titan One, skewX(-8), chrome gradient fill, stroke in the accent at `size * .045`, `paint-order: stroke`, letter-spacing 2 to 4 px. Sizes: line title 104 to 112 px, big word or year 240 px, giant number 300 px. Case: upper. Fit: Titan One is wide: 11 letters at 112 px is about 900 px.
- Labels and readouts: JetBrains Mono 500, 36 to 42 px, letter-spacing 3 px, accent colour with a 6 px and a 16 px glow; upper case.
- Captions (vfrey `box` style): Baloo 2 800, 76 px, white, at most 4 words, plate `linear-gradient(180deg, rgba(14,2,40,.90), rgba(30,4,66,.90))`, border 3 px `#ff2bd6`, glow `0 0 14px #ff2bd6, 0 0 34px rgba(255,43,214,.55)`, inset glow `0 0 18px rgba(255,43,214,.35)`, padding 16 / 30 / 22 / 30, highlight word on a magenta chip with white text, text-shadow `-2px 0 rgba(255,40,120,.55), 2px 0 rgba(40,230,255,.55)`.
- Local fallbacks: Titan One falls back to `Impact, "Arial Black"` (use size 90%), Baloo 2 to `"Arial Rounded MT Bold", Arial`. No eyebrows above titles. Set `captions.style` to `box` in the script JSON too, or the plate styling is lost.

## 6. Composition

Captions sit on a plate, never over a subject; vfrey draws them in a band (`--vf-caption-at`, `--vf-caption-h`) and the neon art runs to the bottom edge of the frame around it.

- Safe area: art inside x 70 to 1010 and y 200 to 1150; the AI label owns the bottom-right corner (y above 1800 is clear of HUD text, keep HUD text above y 1760).
- Fixed bands: chrome title y 200 to 700; hero y 400 to 1150 sitting on or just above the horizon (y 1010); caption plate fixed at `top: 1250px`, height 250; HUD box y 1590 to 1776; the grid fills everything else.
- Frame grid: horizon at 52.6% of the height; hero centred on x 540, 60 to 90% of the width; the sun centred behind it at (540, 800).
- Subject scale: hero 35 to 50% of the frame height; titles 6 to 12% (numbers up to 16%).
- Layers: background (sky, stars, sun, mountains, grid) / midground (hero tubes) / foreground (chrome title, sparks) / overlay (scanlines, vignette, tracking band, glitch bars) / captions outside the filtered world.
- Depth cues: grid perspective with fade at the horizon, sun behind mountains behind hero, glow haze, camera scale drift 1 to 1.05 per scene.

Shot types:

```
TITLE + SKYLINE        DIAGRAM              BIG NUMBER
  CHROME TITLE         CHROME TITLE          99%   (300 px)
   (  sun  )          [box]-->[box]          CHROME WORD
 |||| |||| ||||        gear      bulb        ring bloom
 ==== horizon ====     ==== horizon ====    ==== horizon ====
 [ caption plate ]    [ caption plate ]     [ caption plate ]
 [ HUD wave ]         [ HUD wave ]          [ HUD wave ]
```

```
PORTRAIT              PANEL GRID            LAST IMAGE
 TITLE                 TITLE                 hero small
  /bust/              +--+--+--+             ring blooms
 ==== horizon ====    +--+--+--+ LED         tag lights up
```

## 7. Motion

- Feel: smooth 30 fps, with 12 stepped jitter frames only inside a glitch cut and 4 flicker frames when a tube strikes.
- Easing: draw-on `power2.inOut`; chrome word pop `back.out(2)`; titles in `power3.out`; drifts `none`; breathing `sine.inOut`.
- Durations: a picture within 0.3 s of its line; draw-on 0.35 to 0.7 s; parts staggered 0.06 to 0.15 s; title entrance 0.4 s (y from -30); key-word pop 0.4 s from scale 1.5 plus `jit` of 6 frames at 14 to 18 px; ring bloom 1.0 s; HUD label in 0.35 s; flicker after strike: opacity .45, 1, .6, 1 at +.02, +.07, +.11, +.15 s.
- Holds: every scene keeps moving until the next cut starts (sparks, wave, grid, spin).
- Camera: per scene scale 1 to 1.05 to 1.07 over the scene (`drift`), the sun 1 to 1.09 over the film; no pans.
- Ambient on every scene: 8 to 10 drifting `+` sparks (6 to 10 px, opacity .55 to .15, rise 60 px per 3 s), tube flicker, HUD wave scrolling 480 px in 40 s, grid drift .42 per second, tracking band (150 px, screen blend) rolling down about 6 times a film.
- Forbidden: a fromTo with a from-state at a later time without `immediateRender: false`; animating a node that has a `transform` attribute (use a static outer group); per-path filters; linear easing on entrances; slow fades between scenes; anything that is not on the 30 fps frame clock.

## 8. Transitions

One kind, the glitch cut, 0.36 s, centred 0.16 s before the next line (`glitchCut`): `filter: url(#gl)` on `#world` (turbulence `baseFrequency .0007 .045`, displacement scale 0 to 110 to 0 in 0.2 s each way, red and blue channel offsets of +-9 px), 12 frames of `x` jitter `(rand - .5) * 70 * sin` and `skewX` up to 8 degrees, six full-width screen-blend bars (cyan and magenta, 14 to 104 px tall, opacity .18 to .53); scenes swap at the middle frame; the subtle `ca` filter returns after. Forbidden: dissolves, wipes, slides, zooms, any cut longer than 0.4 s, glitching the captions (they sit outside `#world`).

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a bed for this look: 100 bpm, Am F C G, a 16th-note plucked saw arpeggio through a one-pole low-pass, sub bass on 8ths, a soft pad, kick on beats, light snare and hats. Cue sounds: `glitch` on every cut (noise burst, 5 random plucks, low thump), `zap` (downward sweep) on the key reveal, `ping` when a label or tape lands, `rise` for the finale, `thump` for a heavy landing. Mix: bed at `volume -14`, `duck: true` (vfrey masters to about -14 LUFS). It needs only `python3` (standard library, no downloads, no ffmpeg) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene cuts on), then from the project folder: `python3 .agents/skills/vfrey-style-neon-synthwave/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey neon synthwave style)", "volume": -14, "duck": true}` and make it again with `--rerender`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no cues before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine: leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (35 to 40 s, 6 lines)

Pace: Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md`) and do not merge lines to avoid it; keep the previous picture moving through the gap. The voice is the person's setting: suggest, never switch. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window (Kokoro af_heart with lineGap 0.3 is about 3 words a second).

| Beat | Time | Shot type | Content | Accent |
|---|---|---|---|---|
| Hook | 0 to 6 s | title + skyline | chrome title and year pop, three cabinets draw on, the hero drops in with a ring | magenta + cyan, yellow hero |
| Beat 1 | 6 s to 13 s | diagram / panel grid | the mechanism: a plate or grid of cells, one LED lights | cyan |
| Beat 2 | 13 to 20 s | diagram | the artefact: object plus a tag that slaps on | magenta |
| Beat 3 | 20 to 27 s | portrait | the person or the twist, a quote tag | yellow |
| Beat 4 | 27 to 33 s | big number | one fact in 300 px chrome, ring | pink |
| Payoff | 33 to 40 s | last image | the hero returns large, a building or label lights up, final bloom | cyan |

A glitch cut sits 0.16 s before every line after the first.

## 11. Reference frames

Four frames of the showcase film, 540 x 960, in this folder (not copied into installed projects):
- `ref-1.jpg`: the hook, a chrome word over the sun and a hero cabinet; copy the sun scale, the mountains and the caption plate.
- `ref-2.jpg`: a panel of cells with a chrome title and the HUD; copy the tube density and grid recolour.
- `ref-3.jpg`: a portrait bust over the sun; copy the outline-only figure and the caption plate position.
- `ref-4.jpg`: the final building with a lit tag; copy the glow balance and the horizon.

## 12. Reference implementation

`starter.html` is a working three-scene film (title + skyline, diagram, big number) with the whole world: sky, stars, striped sun, mountains, grid drift, `neon`/`draw` tube helpers, props, chrome titles, HUD, glitch cuts, tracking band, flicker and the captions plate. Start from it: `cp .agents/skills/vfrey-style-neon-synthwave/starter.html scenes/<idea>/index.html`, replace each PLACEHOLDER, redraw the heroes, add scenes (`mk`, `M`, `gridCol`, the cut loop). Keep `data-composition-id` on `#root`. Check a frame with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 3 out.png`.

## 13. Do / Don't, and the final checklist

Do:
1. Do draw every object as a tube plus a white core inside one glow group per colour.
2. Do put a dark plate under every hero so the grid does not show through.
3. Do recolour the grid to the scene accent at every cut.
4. Do pop the key word in chrome with `back.out(2)` and jitter.
5. Do keep the sun, grid and sparks moving through every gap.
6. Do put captions outside the filtered world on a fixed plate at y 1250.
7. Do leave 40 px between stacked titles.
8. Do use `tl.set` then `tl.to` for later-time states.
9. Do fill the bottom with the grid and HUD so no frame is flat.
10. Do dim the sun behind small icons.

Don't:
1. Don't give each path its own filter or blur the whole frame.
2. Don't use two accents on one hero, or any colour outside the palette.
3. Don't use a matte fill, a photo, a gradient on a hero or pure black.
4. Don't duplicate a title for its shadow (text-overlap warning); use a filter.
5. Don't animate a node that has a `transform` attribute.
6. Don't use cuts that are not glitch cuts, or glitches longer than 0.4 s.
7. Don't put captions over a hero, a title or a tag.
8. Don't set `captions.style` to anything but `box`.
9. Don't use dense small text: tubes and glow smear below 36 px.
10. Don't trust estimate-timed previews: tick once, then preview.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; an even sample can land inside a glitch cut, so also check stills at the beat times):
- Sky: purple gradient with stars, striped sun, cyan mountains, horizon line?
- Grid: perspective grid fills the bottom and takes the scene accent?
- Hero: outline tubes with white cores over a dark plate, 35 to 50% of the height?
- Accent: one accent colour per scene plus white?
- Title: chrome Titan One, skewed, outlined, extruded?
- Captions: dark plate with a magenta border, same place, clear of every hero?
- HUD: readout with a wave under the plate, corner label clear?
- VHS: scanlines, fringe and a visible tracking band or glitch in the sheet?
- Phone-size read: do lines read, or does the glow merge into a smear?
- Dark sky: no visible banding in halos?
- Numbers: every number on screen matches the number the voice says (digits, units, rounding), read against the script?

## Pitfalls

- Per-path glow filters, many glow groups and full-frame blur make renders slow: few groups, one filter each (about 1.5 minutes for a 38 s film with the chromatic filter).
- Stacked titles whose line boxes touch trigger `frames.text-overlap`: leave 40 px between them and use filters for shadows.
- Kokoro leaves long gaps after some lines: keep the previous picture alive with ambient loops instead of cutting early.
- A `captions.style` in the script beats the scene's: set both to `box`.
- Preview with `--frame` only after one tick has saved real timing; estimate-timed previews lie. A re-tick with the same hook needs `--rerender`.
- Yellow and cyan line art vanishes against the sun: dim the sun.
- A tween's `onUpdate` does not run when the renderer seeks: write the grid with `tl.set` per frame, or draw from `vfrey.onFrame`.
