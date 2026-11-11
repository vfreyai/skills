---
name: vfrey-style-isometric
description: "Use when the chosen video style is Isometric miniature world (vfrey-style-isometric), or the person asks for an isometric, 2.5D, diorama, tiny model world, 'little 3D map' or 'follow it along the route' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: one projection for SVG blocks, soft shadows, a glowing marker travelling a route, a camera gliding between dioramas, full-frame layout around the caption band and a generated music bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Isometric miniature world
  style-summary: A tiny model world seen from above, with a glowing dot that travels through it as the voice explains.
  style-best-for: how it works, explainer, technology, science, logistics
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Isometric miniature world

A tiny pastel model world on a dark ground, drawn as isometric blocks with soft shadows and visible earth under each tile. One glowing marker carries the idea along a route while the camera glides from diorama to diorama.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for anything that travels or passes through stages: how a message, a parcel, water, money, power or a request gets from A to B; how a system's parts connect; a process with 4 to 6 stations.
- Not for stories about people and feelings (figures this small cannot act), not for a single object with no journey, not for charts and numbers (use 2D flat), and not when the person wants real 3D with perspective and lighting: this is drawn SVG, the camera only pans and zooms.

## Plan before coding

1. Write the script as 4 to 6 lines of one or two sentences. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; key the picture to sentences, not lines.
2. Pick 4 to 6 dioramas along one route, in a row along +x on a shared tile depth, with one hero object each. Add one "macro" shot at another scale (a cut-away, a close-up, a size comparison) reached through an iris.
3. The marker (a glowing dot) carries the idea. One sentence is one diorama: one camera move and one marker leg.
4. Open on the hook: the hero object close up with the starting action, a spark races the whole route while the camera pulls out to the wide shot, then the camera dives back to the first diorama.
5. A scale claim ("as thick as a garden hose") needs a picture of it (both things side by side, guide lines, a chip), and only numbers you can cite go on screen.

## Palette and type

- Ground: a night-navy radial `#22346b` to `#121c3d` to `#090e1e` with about 80 faint stars and a vignette. Radial, never a full-screen linear gradient (it bands). A dark ground is what makes the glow read.
- Models: pastel low-poly. Tile top `#79ab8e`, earth `#9a7a53` to `#4a382a`, cream buildings `#efe6d2` with terracotta or teal roofs, machinery slate `#222b44`, water `#46c5d6` to `#0b2d55`.
- One accent, amber `#ffbf3c` (the marker, highlights, chips), and one support, teal `#7ff3e4` (waves, light, a second chip). No other saturated colour. Swap hues for the brand (`brand.json` wins), keep one accent and one support.
- Type: Google Sans Flex for captions; JetBrains Mono 700 or 800 with wide tracking for the stage label and chips only. Square corners on every label and chip.

## Drawing approach

- One projection for everything: `P(x, y, z) = [(x - y) * 0.866, (x + y) * 0.5 - z]`. +x runs right and down, +y left and down, +z up. Every object is built from `box`, `pyramid`, `roof` and flat art mapped onto a face with `LF`/`RF` (all in `helpers.md`).
- Light comes from the upper left. One base colour gives three faces: top lightest (x1.16), left mid (x0.84), right darkest (x0.62), a top-to-bottom gradient overlay on each side face, a 28% white rim on top edges, and a 0.7 px same-colour stroke on every polygon to hide hairline gaps.
- Shadows have no blur filter (filters re-rasterise every frame): the hull of the footprint and its copy shifted by `(0.9h, -0.2h)`, drawn twice with wide low-alpha strokes.
- Every tile shows its earth on the two visible faces and a faint 10% grid on top. Painter's order: draw in ascending x, then y; nearer things last.
- Cylinders are circles stacked along the axis every 3 units; a ground circle of radius r is an ellipse `rx 1.2247r, ry 0.7071r`. A cut-away keeps only the back wall and one side wall, low enough to see inside. A section (under water, under ground) is one flat drawing on a face with a clip path, with its ambient life inside it.
- The route is arrays of 3D points projected to polylines. Each leg has a permanent dim conduit and a lit trail (amber glow under a pale core) revealed by `stroke-dashoffset`; the marker follows `getPointAtLength` in the same tween.

## Full frame around the caption band

vfrey draws the captions in a band (`--vf-caption-at`, `--vf-caption-h`; centred near 70% of a 9:16 frame when the position is bottom). The world must run under and past it, to the bottom edge:

- Centre the camera at about 42% of the frame height (`CY = 800` of 1920), so the diorama sits in the hero zone and its tiles, earth and water continue down behind the captions. Extend tiles so no shot ends in empty ground above the bottom edge.
- Subjects are large: a diorama fills 70 to 90% of the width at zoom 1.3 to 1.5, a hero object fills it at 2.4 to 2.7. The wide shot (0.45) is a glimpse of under a second, never a place to stay.
- Captions sit on a plate: a bottom scrim (`transparent` to `rgba(8,12,28,.78)`, the lower 44% of the frame) darkens the world behind them, and the caption style is `box` with a stroke. Captions never sit over the marker or the hero object: aim the camera so the focus is above the band. Same caption position all the way through.
- Top: a dark fade under the stage label (N square steps and a mono label inside the safe top). Chips sit just under it and only while their key word is spoken.
- A chip clipped by the frame edge is fixed by moving the camera focus, not the chip. Keep the bottom-right corner clear for the `AI-GENERATED` label.

## Motion rules

- The camera is one group: `translate(540 CY) scale(k) translate(-fx -fy)`. Name the keyframes (`K = {name: {fx, fy, k}}`, the focus is `P(...)` of the object) and move with `camTo(name, t0, t1, ease)`, a `fromTo` from the previous keyframe so seeking is safe.
- Eases: `power2.inOut` between dioramas, `power3.inOut` for the big dive, `sine.inOut` for slow drifts. Start the camera before the marker leg so the camera leads. Stars move at 4% of the camera.
- Scale the marker glow and trail width by `1 / k^0.6` in the camera update so they read at every zoom.
- Time from sentences: build `sents` from `vfrey.timing.words` (split at `.`, `!`, `?`), use the start and end of sentence i for beat i, and land a chip on a key word found by its text.
- Ambient life everywhere, with finite repeats: beacon blink, machine lights (`steps(1)` yoyo), glow pulse, water glints, swaying light rays, things crossing a section, star twinkle. Never `repeat: -1`, never a negative timeline position.
- Subject on screen within 0.3 s of each sentence starting; the last picture holds 1.5 s.

## Transitions

Two kinds only. Between dioramas the camera glide is the transition: no cut. To the macro shot and back, an iris: a second full-frame `<svg>` with `clip-path: circle(r at 50% 36%)` tweened from 0 to past the corners (`power2.inOut`, 0.8 s), centred where the camera was pushing in.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a bed for this look (calm pad chords with a sparse bell arpeggio) plus accents: `blip` when the marker lifts off or arrives, `whoosh` on each big camera move and iris (rising in, `"down": true` falling out), `chime` at a decision or delivery, `thunk` when something heavy lands, `click` while something computes, and `muffle` to dull the music while the picture is under water or inside something. It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are sentences, words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-isometric/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey isometric style)", "volume": -15, "duck": false}` and make it again with `--rerender`. `duck` is off so the accents are not pushed down with the bed; vfrey fades it and sets the loudness. If the run warns `audio.voice-clear`, lower `volume`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the sentence starts (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: does the world reach the bottom edge behind the captions, is the diorama large, are the captions readable on the scrim and clear of the marker?
3. Is the marker visible in every world shot, and does its trail stay lit behind it?
4. Are shadows all falling the same way, with no hairline gaps between faces and nothing drawn in the wrong order?
5. Is any chip or label clipped? Is every number on screen one you can cite?

## Pitfalls

- `tl.call` does not run when the renderer seeks: switch things on and off with `tl.set` on opacity, never with callbacks.
- Put `immediateRender: false` on every `fromTo`, and set hidden starting states with `tl.set(..., 0)`.
- A glow behind a screen or a label above 30% alpha washes it out.
- Blur filters on moving groups make the render crawl; use the stroke shadow and radial gradients.
- Text on a right face (`RF`) is mirrored: put words on left faces only.
- A wall display must sit above the tallest thing in front of it or it is hidden.
- Never type script text into the scene; only prop text (a name on a screen) and chips.
