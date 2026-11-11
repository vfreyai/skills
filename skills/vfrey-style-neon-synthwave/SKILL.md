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

# Video style: Neon synthwave

Every object is drawn as glowing light tubes (a coloured line with a white-hot core) that strike on stroke by stroke, over a purple night sky with a striped sun, wireframe mountains and a grid floor that always drifts toward you. Titles are chrome, cuts are VHS glitches, and a synth bed carries it.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. The drawing toolkit is `neon.js` next to this file, the page shell and a scene skeleton are in `helpers.md` next to this file, and the sound script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for subjects with an 80s or retro-tech feel or anything that suits glow: tech and computing history, games, music, science, gadgets, "how it works" for devices.
- Not for subjects that need a calm, warm or serious tone, photographic detail, dense charts or small text (tubes are thick and everything glows). A subject you cannot reduce to 3 to 8 outline paths has no hero here.

## Plan before coding

1. List each beat's hero as outline art built from 3 to 8 neon paths (a device, a grid of cells, a book, a bulb, a gear, a bust, a building front). Plan 5 to 7 scenes for 35 seconds, one per script line.
2. Pick one accent colour per scene; the grid takes it. Pick the key word of each line: that is where the chrome word pops or a ring blooms.
3. Decide a hook (chrome title plus the first picture within 0.3 s) and a last image (a bloom on the hero).
4. Write the on-screen text: titles of 1 to 2 words, mono tags and dates. Only facts you can source go on screen or in the voice.
5. Script pace: Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; keep the previous picture moving through the gap. The voice is the person's setting: suggest, never switch.

## Palette and type

- Ground: sky gradient `#04010f`, `#16043f`, `#4a0c78`, `#a0147f` (top to horizon); floor `#0a0120`; panel fill `#0b0224`.
- Neon: magenta `#ff2bd6`, cyan `#27f0ff`, hot pink `#ff4f9a`, yellow `#ffe14a`, violet `#a66bff`, alarm red `#ff3b5c`. One accent per scene.
- Sun `#fff35c`, `#ff9a3c`, `#ff1f8e`. Chrome gradient with a hard step in the middle: `#fff`, `#aee6ff`, `#3a2a9e`, `#ff3dd0`, `#ffc2f2`.
- Type: Titan One for chrome titles (skew -8), JetBrains Mono for small tags and readouts, Baloo 2 800 for captions. No eyebrows over titles.

## Drawing approach

- Light tube: two paths with the same `d` and `pathLength=1`, a wide coloured stroke and a thin white one (36% of the width), drawn on with the dash offset and then a quick flicker (`neon`, `draw` in `neon.js`).
- Glow is the cost. Draw it as one `filter: drop-shadow(0 0 3px c) drop-shadow(0 0 12px c) drop-shadow(0 0 30px c88)` on a group per colour (`glowG`), never one filter per path: that was slow. With a few glow groups, the always-on chromatic filter on `#world` and about 1000 frames, the render took about 1.5 minutes.
- Glow on dark ground bands when compressed, most of all the wide 30 px halo and the horizon and sky gradients. The scanline layer and the grid hide most of it. Keep the outer halo faint, do not stack glow on glow, and never replace it with a full-frame blur (slow, and it smears the grid).
- Objects are outline only, with an optional faint fill (opacity .1 to .3 of the tube colour) over a dark `#0b0224` plate so the grid does not show through. Circles: two arcs (`circlePath`).
- Chrome title: gradient text with an accent stroke, outer `<g transform>` static and an inner `<g>` animated; the extruded shadow is a filter (`chrome`), because a duplicated text trips vfrey's text-overlap check.
- Background, one persistent SVG (`buildBackground`): sky, 70 twinkling stars, a striped sun whose stripes slide down and thicken, wireframe mountains, a horizon line, and a perspective grid drawn in three passes. Horizontals are rewritten every frame with `tl.set`; verticals are static. No frame is flat colour.

## Full frame around the caption band

vfrey draws captions in a band (`--vf-caption-at`, `--vf-caption-h`; read from `vfrey.captionBox`). Numbers here are for 9:16 in a 1080 x 1920 design space; `neon.js` derives the horizon from the band, so the layout follows if the person moves the captions.

- Subjects are large: the hero spans 60 to 90% of the width and sits on or just above the horizon; the chrome title is at the top, inside the safe area.
- The world continues behind and below the captions to the bottom edge: the grid fills everything under the horizon and the plate floats over it. Nothing is left as a flat bar.
- Captions sit on a plate: dark purple gradient at 90%, a 3 px magenta border with a glow, white text, at most 4 words, the same position all through. Captions never sit over a hero, a title or a tag. Keep the hero's focal point above the band.
- An optional readout box (`hud`, mono label and a scrolling dashed wave) goes under the plate. Keep it above the bottom-right corner, which stays clear for the `AI-GENERATED` label.
- Put captions outside the scaled and filtered `#frame` (as `helpers.md` does) so they stay sharp.

## Motion rules

- A picture within 0.3 s of each line starting. Draw on in 0.35 to 0.7 s, parts staggered 0.06 to 0.15 s. A keyed beat on the key word (`WD(line, /word/)`): a chrome word pops with `back.out(2)` and `jit()`, a bloom ring, wings or LEDs animate.
- Ambient on every scene: drifting `+` sparks, tube flicker, a scrolling readout wave, the grid drift, a camera scale drift 1 to 1.05 and the sun 1 to 1.09 over the film.
- Never `tl.fromTo` with a from-state at a later time without `immediateRender: false` (it shows early): use `tl.set` then `tl.to`.
- Never animate a node that has a `transform` attribute (it jumps to the origin): static outer `<g transform>`, animated inner `<g>`, `svgOrigin: "0 0"` in local coordinates.
- Dim the sun (opacity .5 to .7) behind scenes with small icons, and keep icons off the sun's orange.

## Transitions

One kind: the glitch cut, 0.36 s, centred 0.16 s before the next line (`glitchCut`). A turbulence displacement filter on `#world` (scale 0 to 110 to 0) with a red and blue split, 12 frames of x and skew jitter, six screen-blend cyan and magenta bars, scenes swapped at the middle, then the subtle always-on filter returns. Between cuts a tracking band rolls down about six times a film, scanlines multiply, and the frame flickers for 0.04 s now and then (`vhsAmbient`).

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a bed for this look: 100 bpm, Am F C G, a plucked saw arpeggio, sub bass, a soft pad and light drums, plus cue sounds: `glitch` on each cut, `zap` on a reveal, `ping` when a label lands, `rise` for the finale, `thump` for a heavy landing. It needs only `python3` (standard library, no downloads, no ffmpeg) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene cuts on), then from the project folder: `python3 .agents/skills/vfrey-style-neon-synthwave/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey neon synthwave style)", "volume": -14, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no cues before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. An even sample can land inside a glitch cut; also check stills at the beat times (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: a large glowing hero, the grid reaching the bottom edge, captions on their plate in the same place and clear of every hero, the corner label clear.
3. Look at it phone-sized: do the lines read, or does the glow merge into a smear? Is the hero drawn before its title or tag shows? Is the gap after each line still moving?
4. Does the grid recolour per scene, and is each frame one accent plus white? Check the dark sky and halos for visible bands.
5. Read the run's checks; `frames.text-overlap` fires on a duplicated shadow text or touching title boxes.

## Pitfalls

- Per-path glow filters, many glow groups and full-frame blur make renders slow: few groups, one filter each.
- Stacked titles whose line boxes touch trigger `frames.text-overlap`: leave 40 px between them and use filters for shadows.
- Kokoro leaves long gaps after some lines: keep the previous picture alive with ambient loops instead of cutting early.
- A `captions.style` in the script beats the scene's: set both to `box`, or the plate styling is lost.
- Preview with `--frame` only after one tick has saved real timing; estimate-timed previews lie. A re-tick with the same hook needs `--rerender`.
- Yellow and cyan line art vanishes against the sun: dim the sun.
