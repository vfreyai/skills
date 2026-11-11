---
name: vfrey-style-noir
description: "Use when the chosen video style is Silhouette noir (vfrey-style-noir), or the person asks for a noir, dark, moody, eerie, cinematic, silhouette, foggy, 'true crime' or 'unsolved mystery' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: near-black layered silhouettes, one amber light, beams, fog, rain and grain, typed evidence lines, full-frame layout around the caption band and a generated atmosphere bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Silhouette noir
  style-summary: Dark, foggy scenes of black shapes lit by one warm light, like the opening of a mystery film.
  style-best-for: mystery, true crime, eerie history, unsolved cases, suspense stories
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Silhouette noir

Near-black silhouettes layered in fog and rain, with one warm amber light in every shot and a slow camera that never stops moving. Typed "evidence" lines give the facts while big serif captions carry the voice.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the sound script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for stories with a question hanging over them: disappearances, unsolved cases, strange events in history, a crime, a place with a dark past, a slow reveal.
- Not for cheerful, funny or how-to subjects, not for anything with charts, numbers to compare or small detail (silhouettes carry no detail), and not when faces or expressions matter. A story with no place and no objects to show in outline has nothing to draw here.

## Plan before coding

1. List the places and objects of the story as silhouettes: a building, a figure, a vehicle, a door, a room, a document. Each becomes a shot; plan 8 to 12 shots for 40 seconds, cut on spoken words.
2. Give every shot one light source (a lamp, a lit window, a moon break, a lantern, a shaft through a window) and say where it is before drawing anything else.
3. Decide the hook beat (the light goes out, a door is found shut) and the last image (figures dissolve, the light dies).
4. Write the evidence lines: dates, places, names, counts, at most 28 characters a line. Only facts you can source go on screen or in the voice; drop a claim you cannot verify, and never use the embellished legend.
5. Script pace: 6 or 7 lines for 40 seconds. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; the sound fills the gaps. A deeper voice with some grit suits it (`am_fenrir` among the free Kokoro voices); the voice is the person's setting, so suggest it rather than switch it.

## Palette and type

- Grounds `#010204`, `#02050a`, `#07111a` with a horizon glow `#1c2f39`; silhouettes `#020406` to `#04080b`. Never pure `#000` across a large area (it bands): use near-black gradients.
- Cold neutrals for fog, moon and rim light: `#5b7782`, `#9fb8c2`, `#cfe0e6`. These are not accents.
- One accent: amber `#ffb347` (glow `#ffd08a`, shadow `#a24a08`), used only for the light source, the evidence text, the spoken word and one mark of absence. If the brand has an accent (`brand.json`), it replaces the amber; still only one.
- Type: Playfair Display 700 for captions; JetBrains Mono 500 for the typed evidence lines. Nothing else.

## Drawing approach

- Every shot is `div.shot > div.cam > <svg viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">`, built from JS template strings. Gradients and three blur filters (3, 8, 22) live in one hidden `<svg><defs>`.
- Layer order, back to front: sky gradient, moon glow, blurred cloud ellipses, ground or sea gradient, far bands, the hero silhouette, fog bands (`mix-blend-mode: screen`), glow, beam, darker foreground bands with more movement, fog again.
- Silhouettes are plain polygons and paths in near-black: `rock` (a seeded jagged outline), `person`, buildings from trapezoids and rects. Put a pale radial (`gMoon`) behind a dark shape so its outline pops, and a thin lighter strip down one edge as rim light.
- A beam is one long thin triangle from the lamp (4 wide at the apex, 60 to 140 at the far end, 1200 to 1500 long) with a gradient that fades to nothing, stacked three times (wide halo, body, thin core) and swung by `rotation`.
- Interiors: a wall gradient with plank lines, a window with a blurred bright rect, a `polygon` light shaft on `screen`, dust in the air. Put the subject inside the shaft.
- Absence is drawn: an amber dashed outline where the missing thing should be.
- Atmosphere sits above all shots, driven from one function of timeline time: a half-size canvas of rain, spray or dust (seeded positions, intensity per shot), a faint grain tile, a flicker, a vignette, and a `lift` layer that keeps the blacks off the floor.

## Full frame around the caption band

vfrey draws the captions in a band (`--vf-caption-at`, `--vf-caption-h`; centred near 70% of a 9:16 frame when the position is bottom). A dark style fails by leaving the lower third as an empty black bar; fill it:

- The subject is large: the hero silhouette spans half the frame height or more, with the light source in the upper two thirds.
- The foreground continues to the bottom edge: water bands, a floor, a hillside, fog and reflections of the light run behind and below the captions. Lighter foreground bands and amber glints under a lamp keep that area alive.
- Captions sit on a plate: `#capshade`, a soft radial black behind the caption band, plus a black stroke on the text, cream with the spoken word in amber, at most 4 words, the same position all the way through. Captions never sit over the light source, a figure or the typed evidence: keep the hero's focal point above the band.
- Evidence lines sit at the top, inside the safe area, on a 62% black plate with an amber bar on the left; they are gone before the next one types.
- Every frame needs its one focal light. A frame that is more than about a sixth flat black with nothing in it needs fog, a horizon glow or a reflection. Keep the bottom-right corner clear for the `AI-GENERATED` label.

## Motion rules

- Camera: each shot gets one slow `scale` from 1.04 to 1.1 up to 1.3 to 1.6 with a small drift, `power1.inOut`, over the whole shot, with `transform-origin` on what the story looks at. Start above 1 so drift never shows an edge.
- Nothing sits still: bands scroll and bob, fog drifts back and forth, clouds slide, the glow breathes, dust floats, rain falls.
- Story events land on spoken words (`wordT(line, /^door$/)`); shots cut 0.1 s before the line or word. The subject is on screen within 0.3 s of a line starting.
- The evidence line types at 0.034 s a character, holds 1 to 2 seconds, then fades.
- Nothing bounces, pops or spins. Slow in, slow out.

## Transitions

Three kinds only, each with a cause. A dip to black (0.2 s in, swap, 0.45 s out) for a change of place or time. A lightning flash (white on `screen`, swap on the peak, 0.5 s decay) where something violent is named. A fog wipe (a wide blurred blob crosses the frame, swap at its centre) for a slow reveal.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes an atmosphere bed for this look: wind, rain, a low drone (add `swell` for the sea with `--layers`), a `sting` (a low thump under an uneasy tone) for each reveal and `thunder` for each lightning flash. It needs `python3` and `ffmpeg` (vfrey already needs ffmpeg), downloads nothing and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene cuts on), then from the project folder: `python3 .agents/skills/vfrey-style-noir/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey noir style, ffmpeg)", "volume": -10, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the atmosphere with no stings before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the cut times (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. Look at it small, the size of a phone: can you tell what each tile shows? If it is murk, lift the blacks and strengthen the focal light.
3. In every tile: one light source, a large subject, something in the lower third, captions readable on their plate and clear of the light and the evidence line.
4. Any black strip at an edge (camera drift past its margin)? Any overlay left on screen after its wipe?
5. Is amber the only colour? Is every typed line a fact you can source? Read the run's checks; a `frames.bitrate` warning means the grain is too strong.

## Pitfalls

- Pure black scenes read as murk on a phone: end sky and sea gradients at a visible blue-grey (`#34505d`, `#1d3a47`), add the `lift` layer and keep the vignette light at the edges (0.8, not 0.92).
- A beam built as a fat cone with a `scaleX` sweep looks like a megaphone: long thin triangle, swing by rotation.
- Camera drift: with the origin near an edge the spare margin on that side is `origin% * (scale - 1) * width`. Drift further and a black strip shows.
- A wipe overlay that is not set back off-screen stays for the rest of the film. Always `tl.set` it back and check later frames.
- Grain above 0.09 opacity explodes the file size; blur filters on big groups are fine.
- A `captions.style` in the script beats the scene's: set both to `color`.
- Use `svgOrigin`, not `transformOrigin`, on SVG groups, with the position on a parent `<g transform>`.
