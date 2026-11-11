---
name: vfrey-style-map-documentary
description: "Use when the chosen video style is Map documentary (vfrey-style-map-documentary), or the person asks for an atlas, old-map, travel documentary, route or 'camera flying over a map' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic that happens at places: a hand-inked navy and parchment atlas under a tilted perspective camera, a route that draws itself with a plane, a flat map that folds into a globe, lower thirds and a generated orchestral bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Map documentary
  style-summary: A hand-inked atlas the camera glides over, where a route draws itself and the flat map folds into a globe.
  style-best-for: geography, travel, history, logistics, science of the Earth, stories about places or routes
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Map documentary

A hand-inked atlas: a deep navy sea with pale shallows, parchment land tinted by region, hatched mountains, a graticule and serif lettering, seen from a tilted perspective camera with clouds floating in front. One route (or one idea) is traced across it, then the same vertices fold into a globe.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html` plus `scene.js`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the textures come from `make-textures.py` next to this file and the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for anything that happens at places or along routes: geography, travel, history, logistics, the science of the Earth, a journey, a border, a comparison of sizes on the globe.
- Not for stories without places, not for exact navigation or surveying (the coastlines are drawn by hand to 1 to 3 degrees: say "simplified map" on screen), and not for subjects where the map would be decoration.

## Plan before coding

1. Write the script as 4 long lines of 32 to 38 seconds in all. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause: word times and captions then follow the real gap, so nothing needs retiming by hand. Write 4 long lines of 32 to 38 seconds in all if you like, and put commas or colons, not periods, where you want a short pause.
2. Pick the places and ONE route. Draw coastlines yourself as `[lon, lat]` rings, water cut-outs and mountain polylines; download nothing.
3. Beats: (a) the route draws itself with a plane and its shadow while the camera follows; (b) a pull-out and a label or lower third; (c) the explanation shot, a diagram laid on the map (circles, ghost outlines, a comparison); (d) the fold to a globe; (e) optionally fold back and forth to contrast flat and round; (f) a hold.
4. A size claim (Mercator inflates high latitudes) needs the ghost-outline treatment, sliding the other shape beside the first, not just a number. Only numbers you can compute or cite go on screen.

## Palette and type

- Sea `#0d2440` (the `sea.png` tile), land `#dcc89c` (the `paper.png` tile) with a per-region tint overlay at 30%: red-brown `#c98a62`, green `#a9b57e`, ochre `#d9a85f`, ice `#b9c9cf`. Ink `#3d2e18`, gold `#efc063` (graticule, labels, the spoken caption word), cream `#f6ead0`, one hot accent `#ff5a36` (the route).
- Playfair Display (italic for place names and letter-spaced ocean names), Google Sans Flex 700 for captions and chips, JetBrains Mono only for coordinates. Square corners; chips have a 7 px left bar. `brand.json` may swap the accent.

## Drawing approach

- Textures: `python3 .agents/skills/vfrey-style-map-documentary/make-textures.py --out scenes/<idea>` writes tileable `paper.png`, `sea.png` and `grain.png` (standard library, deterministic). Use them as `<pattern patternUnits="userSpaceOnUse">` fills and list them in `assets.json` as generated.
- The flat plane is Mercator, `x = lon * S`, `y = -R * ln(tan(pi/4 + lat/2))`, `R = S * 180 / pi`, S = 8 px per degree. Shift a ring by +360 when its mean longitude is below -12 so the map is Pacific-centred, and draw the land three times with `<use x=±360*S>` for wrap-around. Land stack, bottom to top: two wide low-alpha blue strokes (a shallow-water halo), a black offset copy (drop shadow), the paper fill, tint overlays, an inner shade (clip path plus a wide dark stroke), lakes in the sea colour, ranges as thick dashed strokes (`stroke-dasharray="1.2 3.4"` makes hachures) with a dark offset copy and a pale highlight, and the coast ink stroke.
- Lettering lies on the map (ocean names italic, letter-spacing 18, 46% cream; land names upright caps at 66% brown) so it tilts with the plane.
- The route is a great circle by slerp or a rhumb line by linear Mercator y, drawn as partial polylines (slice the vertices up to `u`, interpolate the last point) with three strokes: a red glow 22 px at 32%, red 7 px, a pale core 2.4 px. The plane is a 100-unit top-down airliner path; its shadow is the same path in black at 40%, offset (8, 6) and squashed by `cos(tilt)`.
- Markers are ground ellipses that pulse (two rings, phase `t * 0.8 % 1`, `ry = rx * cos(tilt)`) with serif labels floating above on a leader. Clouds are 13 sprites of 9 radial-gradient circles at height 150 to 330 plus a soft dark shadow blob on the ground; they leave as the globe forms.
- Globe: orthographic, from the same vertices (`helpers.md`). Per-vertex arrays blend from flat to round with a stagger so the middle wraps first; far-side points clamp to the limb. Centre the globe on the route's midpoint and a great circle is a straight line (true, not a trick). The dimmed flat map stays behind and below the globe at about 0.55 so the frame stays full.

## Full frame around the caption band

vfrey's caption band (`--vf-caption-at`, `--vf-caption-h`) is centred near 70% of a 9:16 frame when the position is bottom. The camera focus (`CY`) sits at 700 so the action is above the band and the map runs under it to the bottom edge.

- Subjects are large: the route and the globe fill 80 to 90% of the width; the globe is 876 px across.
- Captions sit on a plate: navy at 90% with gold top and bottom rules, placed from `vfrey.captionBox`, `vfrey.captions("#captions", {style: "color", font: '"Google Sans Flex"', size: 62, color: "#f6ead0", highlight: "#efc063", maxWords: 4})`, the same place all film.
- A lower third (a gold bar, a mono-caps kicker at 22 px, a serif line at 46 px) sits just above the plate, one per beat. HUD: a compass rose (top right), the focus coordinates (top left) and a scale bar computed from the real scale (bottom left). A radial vignette, top and bottom scrims and a 13% grain overlay (`mix-blend-mode: overlay`) finish it. Keep the bottom-right corner clear for the `AI-GENERATED` label.

## Motion rules

- One projection function mirrored in CSS and JS (`camProj` in `helpers.md`): anything with a height (labels z 60, the plane z 34, clouds z 150 to 330) is projected with its own z, which gives real parallax. The state object `SS` (centre, zoom, tilt, route progress, fold) is tweened by GSAP and `vfrey.onFrame(draw)` (and, for live preview only, `tl.eventCallback("onUpdate", draw); vfrey.onFrame(draw)`) repaints everything from `SS` and `tl.time()`.
- Tilt 26 to 44 degrees, zoom 0.7 to 1.9, `power3.inOut` for long glides, `sine.inOut` for follows. Cue beats from `vfrey.timing.words` found by text. Rounding scale values with `toFixed(1)` makes sprites jump: use three decimals.
- Subject on screen within 0.3 s of each sentence starting; the last picture holds 1.5 s with the clouds still drifting.

## Transitions

The fold is the signature: flat map to globe in about 3 s (`power2.inOut`, the centre wrapping first, clouds leaving), and optionally back. Between beats the camera glide is the transition: no cuts. A lower third slides in 50 px from the left and out on the next beat.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes an orchestral-feeling bed (a string pad of detuned voices, a cello drone and sparse harp plucks) plus accents from a cue sheet: `whoosh` at each camera glide and fold (rising in, `"down": true` falling out), `hit` (a timpani and low boom at the big reveal), `chime` (a number landing) and `swell` (a string rise before the reveal). It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (one object of lists of times, the format at the top of `make-bed.py`), then from the project folder: `python3 .agents/skills/vfrey-style-map-documentary/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey map documentary style)", "volume": -14, "duck": true}` and make it again with `--rerender`. If the run warns `audio.voice-clear`, lower `volume`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the sentence starts (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: is the map or globe large and above the plate, does the map reach the bottom edge, is the lettering tilted with the plane and readable?
3. Is the lower third above the plate and never over the route?
4. Does the fold start at the middle and stay stable on seek (look at two stills a frame apart)?
5. Is the map labelled simplified, and is every number on screen computed or cited?

## Pitfalls

- A 3D-perspective layer paints OVER later siblings in the headless renderer. Give every other top-level child `will-change: transform; z-index: 5` and put the plane in a wrapper with `overflow: hidden; isolation: isolate`. Without it only the map shows and the HUD, labels and sprites disappear.
- A degree label over an ocean name trips the `frames.text-overlap` check: label the graticule in the HUD instead.
- `tl.call` does not run when the renderer seeks: use state tweens and `tl.set`.
- The renderer rasterises each frame in a fresh browser; keep SVG filters off the moving plane.
- Mercator's size claim needs the ghost outline, not a bare number.
