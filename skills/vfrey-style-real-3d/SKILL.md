---
name: vfrey-style-real-3d
description: "Use when the chosen video style is Real 3D (vfrey-style-real-3d), or the person asks for real 3D, a 3D camera flying through space, planets, 'cinematic 3D', WebGL or three.js. Teaches how to build, light, compose, animate and score a true 3D scene inside a vfrey HTML scene, for any topic: bundling three.js into the scene folder, a render loop driven by the vfrey timeline, shader-made surfaces, bloom, a shot-based camera, full-frame layout around the caption band and a generated sound bed. Read its limits first: it needs a one-time package install and a machine with a graphics chip."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Real 3D
  style-summary: A real 3D camera flying between glowing, lit objects in deep space, like a science documentary.
  style-best-for: space, science, scale and distance, astronomy, big numbers, product objects
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Real 3D

True 3D rendered with three.js (WebGL): lit spheres and objects with surfaces made by shaders, a star field, soft bloom on anything bright, and a perspective camera that flies from one subject to the next. Flat labels and big numbers sit on top as a heads-up display.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html` plus a bundled script, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Next to this file: `helpers.md` (install, bundle, page shell), `scene-starter.js` (a working skeleton to copy), `glsl.js` (the shaders), `make-bed.py` (the sound).

## When to use it, when not

Use it when depth is the point: space and planets, scale and distance, objects compared in size, a flight through a system, a product or shape turning in light.

Do not use it, and say why, when any of these holds:

- **The machine has no graphics chip.** It is proven on an Apple Silicon Mac, where vfrey's headless Chrome draws WebGL on the GPU. On a Linux server, a container or CI without one, Chrome falls back to software drawing and a render takes many times longer or fails. Never send this style to vfrey's cloud render.
- **The person has not agreed to a package install.** three.js is not part of vfrey and the network is blocked while rendering, so it must be installed into the project once (network needed) and bundled into the scene folder. Ask first; if the answer is no, use the isometric style for a drawn 3D look.
- **The subject needs real photographs, a real face or a detailed model.** Surfaces here are noise shaders: convincing at film distance, not photographic. Loading models or image textures is not proven; build from spheres, boxes, lines and shaders.
- **The subject is flat**: charts, lists, interfaces, text. 3D adds render time and nothing else.
- **It must be quick.** A 35 s film renders in about 1.5 to 3.5 minutes with bloom on a fast laptop, and every source edit needs a rebuild before a preview.

Known rough edges, so plan for them: vfrey has no official per-frame hook (this style uses a GSAP `modifiers` tween that runs on every seek), vfrey does not print errors from the page (the starter shows them on screen), and its frozen-picture check does not notice a stuck 3D canvas while labels still move (so look at the contact sheet).

## Plan before coding

1. Ask for the install (see above), then set up once: `helpers.md` has the exact commands.
2. Choose 3 to 5 subjects and one journey between them. Give each a companion that explains its size (an everyday object beside it beats any caption).
3. Write the numbers down and compute them in code from sourced values; the heads-up display shows the computed number, never a typed one.
4. Storyboard as camera shots: for each key word, where the camera looks (`F`), from which side (`dir`), how far (`D`). Choose sides with a component toward the light, or you film the dark side.
5. Script: 5 or 6 lines. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. Cue shots to spoken words, in increasing time order.

## Palette and type

- Ground: near-black `#000004` with seeded stars in three temperatures and a faint violet band of nebula (never brighter than a quarter of the screen's range).
- Subjects carry the colour: saturated, physically plausible, one warm light source. One HUD accent, amber `#ffb23e` (labels in `#ffcf8a`); a brand accent (`brand.json`) replaces it.
- Type: Google Sans Flex 800 for the big number (14.5% of the frame's short side); JetBrains Mono 700 for tags and labels (3%). Square plates, dark at 62 to 72% with a 2 px warm border on tags.

## Drawing approach

- Bodies: one `ShaderMaterial` with a type switch and 3D simplex noise on the unit-sphere normal (seamless, no image files). Light in view space: pass the light direction through `transformDirection(camera.matrixWorldInverse)`; world-space maths loses precision far from the origin.
- Day and night: a soft terminator, emissive lights on the dark side only, a glint on water, a Fresnel rim plus an additive shell at 1.045 radius for air.
- Stars and suns: an animated noise ramp with limb darkening, kept saturated (orange first, white only at peaks), plus glow billboards that never shrink below a pixel size, with noise rays for a corona.
- Bloom: `EffectComposer` on a 4x MSAA half-float target, `UnrealBloomPass` strength 0.5, radius 0.6, threshold 0.92. No output pass.
- Lines (orbits, roads, links) are `Line2` with a width in pixels; plain GL lines are 1 px and vanish in compression.
- Speed is shown by dust that wraps around the camera and stretches with its velocity; long empty distances get a lit "road" of rails and posts with milestone tags.
- Built objects (a door, a coin, a ball) can use three.js's standard materials with a point light at the light source.

## Full frame around the caption band

vfrey draws the captions in a band (`--vf-caption-at`, `--vf-caption-h`; centred near 70% of a 9:16 frame when the position is bottom). Space is mostly empty, so composition is the work:

- Subjects are large: stack a subject and its companion vertically so the pair fills the hero zone (at a 40 degree field of view a tall frame shows `0.409 * D` across and `0.728 * D` up; pick `D` from the subject's size).
- Shift the picture up into the hero zone with `camera.setViewOffset(W, H, 0, 0.06 * H, W, H)`, so the focus sits above the caption band.
- Captions sit on a plate: caption style `box`, white words with the spoken word on the amber chip, in the same place all through. Captions never sit over a subject or a tag: keep bodies and their tags above the band, or keep a stack under about 60% of the height.
- The world continues behind and below the captions to the bottom edge: nebula, stars, dust, the curve of a large body, a road running out of frame. A vignette darkens the edges. No frame is plain black below the band.
- HUD: label, big number and sub-line at the top inside the safe area; tags follow 3D points and sit beside an object, never on it. Keep the bottom-right corner clear for the `AI-GENERATED` label.

## Motion rules

- One rule above all: `render(t)` sets the camera, transforms, uniforms, HUD text and DOM opacity from `t` only. No `Date.now`, `requestAnimationFrame`, three.js `Clock`, or unseeded random. Velocity is `camera(t) - camera(t - 0.04)`, computed from the shots.
- Drive it with a proxy tween whose `modifiers` function calls `render`, not `onUpdate`: the modifier runs on every seek, so a still preview and the film match.
- Shots are `{t, F, dir, D}`: interpolate `F` linearly, `dir` by lerp then normalise, `D` geometrically; ease `inOutQuart` for flights and `inOutCubic` for holds. Never lock off: add a small handheld drift to every shot.
- Set `near = D * 0.02` and `far = D * 6e4` each frame. A whip between targets takes 0.4 to 0.7 s.
- Subject on screen within 0.3 s of its line starting; the last image holds 1.5 s.

## Transitions

The flight is the transition: the camera travels, it does not cut. For a true change of world use a second scene with its own camera and composer, hidden by a white flash (0.2 s up, 0.5 s down) that peaks on the cut frame. At most one such cut in a short.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a deep drone with a low rumble for this look, a `whoosh` for each fly-by and a `boom` for a cut. It needs `python3` and `ffmpeg` (vfrey already needs ffmpeg), downloads nothing and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are words or lines, the same key words the camera uses), then from the project folder: `python3 .agents/skills/vfrey-style-real-3d/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey real 3D style, ffmpeg)", "volume": -9, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the drone alone before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Rebuild the bundle, render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`.
2. Is the 3D picture different in every tile? Two identical tiles with different captions mean the canvas froze: look for the green error box and fix the throw.
3. Compare one still (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`) with the film at the same second: they must match.
4. In every tile: a large lit subject (not a night side), something behind the captions down to the bottom edge, tags beside their objects and clear of the captions.
5. Nothing blown out to white by bloom; lines still visible at this small size; every number the computed one.

## Pitfalls

- Rendering in `onUpdate` can leave stale or blank frames on a seek: use `modifiers`.
- Without `preserveDrawingBuffer: true` the grabbed frame can be blank.
- A throw inside `render` leaves the last good canvas up and looks like skipped frames: keep the try/catch and the on-screen error box.
- Forgetting to rebuild after an edit renders the old bundle. Put the build in a script and run it every time.
- Bloom turns a bright shader cream or white: lower the shader's gain, raise the threshold, keep colours saturated.
- Seconds typed into shots drift once the real voice exists: key shots to words.
- A `captions.style` of `pop` in the script makes unspoken words dark, unreadable on black: set `box` in the script and the scene.
- Two HUD texts closer than 16 px trigger `frames.text-overlap`: keep the gap and `white-space: nowrap`.
