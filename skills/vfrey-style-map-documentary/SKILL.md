---
name: vfrey-style-map-documentary
description: "Use when the chosen video style is Map documentary (vfrey-style-map-documentary), or the person asks for an atlas, old-map, travel documentary, route or 'camera flying over a map' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic that happens at places: a hand-inked navy and parchment atlas under a tilted perspective camera, a route that draws itself with a plane, a flat map that folds into a globe, lower thirds and a generated orchestral bed."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Map documentary
  style-summary: A hand-inked atlas the camera glides over, where a route draws itself and the flat map folds into a globe.
  style-best-for: geography, travel, history, logistics, science of the Earth, stories about places or routes
  style-poster: map-documentary.jpg
  style-preview: map-documentary.mp4
---
> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Map documentary

This file teaches a look, never a topic. Apply it to any subject that happens at places or along a route. The scene is HTML + inline SVG + GSAP (`scenes/<idea>/index.html`, engine `vfrey-render`); the script, voice and facts are yours; the vfrey skill's `scenes/craft.md` still holds. Start from `starter.html` next to this file (`npx vfrey styles start map-documentary scenes/<idea>` creates the folder with it as `index.html`, whichever agent folder this skill was installed in) (a working atlas with a route, plane, labels, lower third, HUD and caption plate; replace PLACE A/B and the text, keep the structure). Code to copy for the rest (the camera projection and the globe fold) is in `helpers.md` next to this file; the optional texture script is `make-textures.py` next to this file; the music script is `make-bed.py` next to this file.

Script pace: do not trust a word budget. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser`; Kokoro af_heart with lineGap 0.3 speaks about 2.8 words a second (measured; the `series kit` Pace line has your voice's own figure). Write 4 to 6 long lines (each line break costs about 1.2 s of silence); put colons and commas, not periods, where a short pause is wanted.

## 1. The look in three sentences, and the signature traits

A hand-inked atlas: deep navy sea with pale shallow halos, parchment land tinted by region, hatched mountains, a gold graticule and serif lettering that lies on the map. A tilted perspective camera glides over it while one red route draws itself with an airliner and its shadow, and clouds float in front. The same vertices later fold into a globe, with a gold-barred lower third and a dark gold-ruled caption plate.

Signature traits:
1. Sea `#0d2440` with a lighter centre and a pale-blue shallow halo around every coast.
2. Parchment land `#dcc89c` with grain, tinted per region at 30%.
3. Hatched mountain ranges (dashed thick strokes) with a pale highlight copy.
4. Gold `#efc063` graticule at about 22% opacity.
5. Perspective tilt 26 to 44 degrees; labels float above the ground with real parallax.
6. One route in `#ff5a36`: wide glow, red body, pale core.
7. A top-down airliner with an offset squashed shadow on the ground.
8. Serif italic place names; ocean names in letter-spaced italic at 46% cream lying on the map.
9. Pulsing ground ellipses (two rings) at the places.
10. HUD: compass rose top right, coordinates readout top left, scale bar bottom left, "SIMPLIFIED MAP" note.
11. Lower third with an 8 px gold bar and a mono-caps kicker; plate with gold top and bottom rules.
12. Vignette plus 13% grain overlay.

## 2. Palette

| Role | Hex | Use |
|---|---|---|
| Sea | `#0d2440` (centre `#123459`, edge `#0a1d36`) | ground |
| Shallow halo | `#3f8fd0` at 16% and 28% | coast strokes |
| Land | `#dcc89c` | paper fill |
| Tints at 30% | `#c98a62` red-brown, `#a9b57e` green, `#d9a85f` ochre, `#b9c9cf` ice | per region |
| Ink | `#3d2e18` | coast stroke, land names |
| Deep ink | `#06101c` | plate, outlines, vignette |
| Gold | `#efc063` | graticule, kicker, labels, active caption word, plate rules |
| Cream | `#f6ead0` | text, plane, ocean names |
| Route red | `#ff5a36` | the route only, markers, one "bad" chip bar |

Ratios: sea 40 to 60%, land 25 to 45%, gold at most 6%, route red at most 4%. Never use: bright saturated greens or blues, pure white, pure black, a second accent, flat colour fills without texture, real map data or tiles.

## 3. Shapes and line

- Coast ink stroke 2.6 px at plane scale; halo strokes 34 px at 16% and 14 px at 28%; drop shadow copy offset (7, 9) black 45%; inner shade: clip to the shape, 40 px stroke of `#3d2e18` at 35%.
- Mountains: thick dashed stroke `stroke-width 9`, `stroke-dasharray "1.2 3.4"`, colour `#6b4a26` with an offset dark copy (3, 4) at 50%.
- Graticule 1.4 px every 20 degrees. Route: red glow 22 px at 32%, red 7 px, pale core 2.4 px `#ffe3d8`, round caps. Marker rings 3 px.
- Texture recipe (no assets): paper = `feTurbulence baseFrequency .035 numOctaves 4` into `feDiffuseLighting` (light `#dcc89c`, surfaceScale 1.6, distant light azimuth 235 elevation 62), then `feComposite operator="in" in2="SourceGraphic"` so it only fills the land. Grain = a full-frame `feTurbulence baseFrequency .9` at 13% `mix-blend-mode: overlay`. `make-textures.py` writes PNG tiles instead if you prefer patterns.
- Light from the upper left (azimuth 235); shadows fall down-right. Corners are square everywhere (chips, plates, lower thirds); chips have a 7 px left bar.
- Mercator `x = lon * S`, `y = -R * ln(tan(pi/4 + lat/2))`, `S = 8` px per degree, `R = S * 180 / pi`. Draw coastlines yourself as `[lon, lat]` rings (1 to 3 degrees accuracy, no downloaded data) and say on screen that the map is simplified and hand-drawn.

## 4. Characters and objects

No characters. Objects, all vector:
1. Plane: the 100-unit top-down airliner path in `starter.html`, cream fill, deep-ink 2 px outline, scale .55; its shadow is the same path black 40%, offset (8, 6), y-scaled by `cos(tilt)`.
2. Marker: dot r 8 `#ff5a36` with a cream 3 px ring, plus two ellipses pulsing (phase `t * .8 % 1`, `ry = rx * cos(tilt)`).
3. City label: Playfair italic 54 px cream with a dark outline and a mono 22 px gold coordinate line, floating at height z = 60.
4. Cloud: 9 radial-gradient circles at height z 150 to 330 with a soft shadow blob on the ground; 13 sprites, drifting slowly.
5. Compass rose: circle r 60, a long gold needle, a short crossbar, serif N.
6. Scale bar computed from the real scale at the focus latitude (px per degree times cos(lat)).
7. Chip: dark 90% plate, 34 px 700 cream text, 7 px left bar (red for a problem, gold otherwise).
8. Ghost outline: a dashed copy of a shape slid beside another to compare sizes.
9. Globe: orthographic sphere with sea pattern, radial shade, atmosphere ring `#6fb4ff`, graticule (see 7).
10. Lower third: kicker + serif line, gold bar.

## 5. Typography

| Role | Font | Size | Style |
|---|---|---|---|
| Place names | Playfair Display italic 700 | 54 px | cream, dark outline |
| Ocean names | Playfair italic | 54 px, tracking 18 | cream 46% |
| Land names | Playfair 700 caps | 38 px, tracking 10 | `#3d2e18` 66% |
| Lower third line / kicker | Playfair 700 / Google Sans Flex 700 | 46 px / 22 px, tracking .2em | cream / gold |
| Chips, captions | Google Sans Flex 700 | 34 px / 62 px | cream, active word gold |
| Coordinates, HUD | JetBrains Mono 500 | 21 to 25 px, tracking .1em | gold or cream 75% |

Caption plate (vfrey's caption band, `--vf-caption-at`): left 40, width 1000, height 192, top = `captionBox.top + captionBox.height - 200`, `rgba(6,16,28,.9)` with 3 px gold rules top and bottom, max 2 lines of 4 words, one place all film, active word `#efc063`.

## 6. Composition

- Safe area: action above y 1250; focus line at y 700 (`CY`); the lower third at y 1128 never touches the plate (plate near y 1336); keep the bottom-right 322 x 58 corner clear for `AI-GENERATED`; HUD at left 60.
- The map runs to the bottom edge of the frame in every shot (tilt 26 to 44 degrees shows sea and graticule below the focus, never empty ground); under the plate it is dim, not empty.
- Frame grid: the route and its two places sit in the upper two thirds on a diagonal; the plane at the focus line.
- Subject scale (large, never timid): coastline and route 40 to 70% of frame width; city labels 4 to 6% of frame height.
- Depth: ground (z 0), labels and plane (z 34 to 60), clouds (z 150 to 330) parallax against the camera.

Shot types:
```
A Opening close      B Route follow       C Pull-out           D Overlay explain      E Globe fold
[ HUD     compass ]  [ HUD    compass ]   [ HUD   compass ]    [ HUD    compass ]     [ HUD  compass ]
[ place A label   ]  [  ~~~~route~~~     [ A ~~~~~~~ B   ]    [ map + ghost shapes ]  [   ( globe )   ]
[ (tilt 34, k 1.9)]  [ plane + shadow ]  [ whole route    ]   [ circles, chips    ]   [ route straight ]
[ lower third     ]  [ lower third    ]  [ lower third    ]   [ lower third       ]   [ lower third   ]
[ plate           ]  [ plate          ]  [ plate          ]   [ plate             ]   [ plate         ]
```
F Hold: the camera stops, markers pulse, a chip names the result.

## 7. Motion

Smooth, `power3.inOut` for long glides, `sine.inOut` for follows and the route draw.
- One state object `SS` (focus x/y, zoom k, tilt a, route progress u, morph m) is tweened by GSAP; `vfrey.onFrame(draw)` (what a render runs; onUpdate does not fire when the renderer seeks) repaints everything from `SS` and `tl.time()` (pure functions of time).
- Camera: k 0.7 to 1.9, tilt 26 to 44 degrees, glide 2 to 4.5 s, follow moves start with the draw. Route draw 3 to 5 s. Label enter 0.5 s `power2.out` (rise 14 px). Lower third 0.5 s in, 0.4 s out; one per beat. Holds 1 to 2.5 s.
- Ambient: clouds drift 8 to 20 px/s, marker rings pulse every 1.25 s, a slow 1 to 2% scale breathing on the vignette. Finite repeats only.
- Globe fold: one projection function blends each vertex from flat `(x, y)` to orthographic with a per-vertex stagger `mi = ease(clamp(m * 1.75 - angDist * .75))` so the middle wraps first; far-side vertices clamp to the limb; keep the dimmed flat map behind at about 55% opacity. Centre the globe on the route midpoint: a great circle then draws as a straight line (true, not a trick).
- Forbidden: stepped frame rates, camera shake, bounce easings, spin without purpose, any move that exposes the map's edge.

## 8. Transitions

1. Glide: a camera move between places (the primary cut).
2. Fold: flat map to globe (1.6 to 2.4 s `power3.inOut`), with clouds fading out; and fold back to contrast flat vs round.
3. Lower-third swap: out 0.4 s, next in 0.5 s later.
4. Overlay build: ghost shapes and chips enter 0.4 s each.
Forbidden: hard cuts, wipes, fades to black mid-film, zoom-blur.

## 9. Sound

An orchestral-feeling documentary bed, about 70 BPM, minor to modal mood: a string pad (3 detuned wavetable voices per note, slow attack), a cello drone, sparse harp plucks. Accents from a cue sheet: `whoosh` at each camera glide and fold (rising in, `"down": true` falling out), `hit` (timpani and low boom) at the big reveal, `chime` when a number lands, `swell` before the reveal. Mix: `"volume": -14` with `"duck": true`; if `audio.voice-clear` warns, lower `volume`.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` needs only `python3` (standard library) and always writes the same file for the same input.
1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (format at the top of `make-bed.py`), then from the project folder: `python3 "$(npx vfrey styles path map-documentary)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey map documentary style)", "volume": -14, "duck": true}` and make it again with `--rerender`.
One pass instead: `--duration 60` with no `--timing`. No `python3` (`python3 --version` fails): leave `music` out, say the video has no music and why, install nothing unasked.

## 10. Shot plan template (32 to 38 s, 4 long lines)

| Time | Beat | Shot |
|---|---|---|
| 0 to 5 s | Hook: place A, the route starts drawing, plane appears | A opening close, then B follow; lower third 1 |
| 5 to 14 s | The route crosses the map, camera follows | B route follow, label B enters |
| 14 to 22 s | The explanation: ghost shapes, circles, chips laid on the map | C pull-out, D overlay explain; lower third 2 |
| 22 to 30 s | The fold to a globe, the route turns straight | E globe fold; lower third 3 |
| 30 to 36 s | Payoff: the number or the contrast, then hold | F hold; chip with the result |

## 11. Reference frames

- `ref-1.jpg`: opening close. Copy the tilted parchment land, navy halo, serif place label, pulsing ring, lower third and plate.
- `ref-2.jpg`: route over the ocean. Copy the glowing red route, the plane with its shadow, letter-spaced ocean lettering.
- `ref-3.jpg`: overlay explain. Copy the translucent ghost circles and shapes with gold chips over the map.
- `ref-4.jpg`: globe. Copy the orthographic globe with its atmosphere ring, the dimmed flat map behind it and the straight route with chips.

## 12. Reference implementation

`starter.html` next to this file renders a London to Singapore route (about 11 s): Mercator atlas with the full land stack (halo, shadow, paper, tint, inner shade, lakes, hachures, coast), graticule, lettering, great-circle route with plane and shadow, ground markers, perspective camera, floating labels, compass, coordinates readout, two lower thirds, caption plate. Start it with `npx vfrey styles start map-documentary scenes/<idea>`, change `A` and `B`, the lower-third texts and camera states, and test with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`. Add the globe from `helpers.md` (and clouds as radial-gradient sprites) when the story needs them.

## 13. Do, don't, and the final checklist

Do:
1. Draw coastlines yourself and label the map simplified.
2. Keep the route the only red thing on the map.
3. Let lettering lie on the map so it tilts.
4. Give every floating thing its own height z for parallax.
5. Keep the plane's shadow on the ground, y-squashed.
6. Put a lower third above the plate in every beat, one at a time.
7. Keep the map running to the bottom edge, dim under the plate.
8. Use `power3.inOut` for glides and `sine.inOut` for follows.
9. Retime words per segment if vfrey's times drift by more than 1 s.
10. Round scale values to 3 decimals.
11. Captions sit on a plate: dark, gold-ruled, same place all film.

Don't:
1. Download map data or tiles.
2. Use `tl.call`; the renderer seeks.
3. Use bright greens, blues or pure white.
4. Let a 3D layer paint over later siblings: give other top-level children `will-change: transform; z-index: 5` and wrap the plane in `overflow: hidden; isolation: isolate`.
5. Put degree labels over ocean names (trips `frames.text-overlap`); label the graticule in the HUD.
6. Show a flat empty band.
7. Move the camera in stepped or bouncing motion.
8. Show two lower thirds at once.
9. Claim a size without a ghost-outline comparison.
10. Put anything in the bottom-right label corner.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- Navy sea with pale shallow halos and a gold graticule in every tile.
- Land parchment with grain, regional tint, hatched mountains.
- The tilt shows perspective; the map reaches the bottom edge.
- Route is red with glow and pale core; plane has a shadow.
- Serif italic labels and letter-spaced ocean names.
- HUD present (compass, coordinates, scale, simplified note).
- Lower third above the plate, one at a time; plate dark with gold rules.
- Globe fold (if used) is staggered and centred on the route.
- Vignette and grain visible; AI label corner clear.
- Numbers shown on screen match what the voice says (read each number on the contact sheet against the script).
