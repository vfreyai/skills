---
name: vfrey-style-real-3d
description: "Use when the chosen video style is Real 3D (vfrey-style-real-3d), or the person asks for real 3D, a 3D camera flying through space, planets, 'cinematic 3D', WebGL or three.js. Teaches how to build, light, compose, animate and score a true 3D scene inside a vfrey HTML scene, for any topic: bundling three.js into the scene folder, a render loop driven by the vfrey timeline, shader-made surfaces, bloom, a shot-based camera, full-frame layout around the caption band and a generated sound bed. Read its limits first: it needs a one-time package install and a machine with a graphics chip."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 2.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Real 3D
  style-summary: A real 3D camera flying between glowing, lit objects in deep space, like a science documentary.
  style-best-for: space, science, scale and distance, astronomy, big numbers, product objects
  style-poster: real-3d.jpg
  style-preview: real-3d.mp4
---
> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Real 3D

Start from `starter.html` (the page) and `scene-starter.js` + `glsl.js` (the 3D content) next to this file; `helpers.md` has the exact install and bundle commands. This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html` plus a bundled script, engine `vfrey-render`); the vfrey skill's `scenes/craft.md` still holds for everything not said here. Next to this file: `helpers.md` (install, bundle, page shell), `starter.html`, `scene-starter.js`, `glsl.js` (the shaders), `make-bed.py` (the sound).

## Limits: when to use it, when not

Use it when depth is the point: space and planets, scale and distance, objects compared in size, a flight through a system, a product or shape turning in light.

Do not use it, and say why, when any of these holds:

- **The machine has no graphics chip.** It is proven on an Apple Silicon Mac, where vfrey's headless Chrome draws WebGL on the GPU. On a Linux server, a container or CI without one, Chrome falls back to software drawing and a render takes many times longer or fails. Never send this style to vfrey's cloud render.
- **The person has not agreed to a package install.** three.js is not part of vfrey and the network is blocked while rendering, so it must be installed into the project once (network needed) and bundled into the scene folder. Ask first; if the answer is no, use the isometric style for a drawn 3D look.
- **The subject needs real photographs, a real face or a detailed model.** Surfaces here are noise shaders: convincing at film distance, not photographic. Loading models or image textures is not proven; build from spheres, boxes, lines and shaders.
- **The subject is flat**: charts, lists, interfaces, text. 3D adds render time and nothing else.
- **It must be quick.** A 35 s film renders in about 1.5 to 3.5 minutes with bloom on a fast laptop, and every source edit needs a rebuild before a preview.

Known rough edges, so plan for them: vfrey has no official per-frame hook (this style uses a GSAP `modifiers` tween that runs on every seek), vfrey does not print errors from the page (the starter shows them on screen), and its frozen-picture check does not notice a stuck 3D canvas while labels still move (so look at the contact sheet).

## 1. The look in three sentences, and the signature traits

True 3D rendered with three.js: lit spheres and objects whose surfaces are made by shaders, a star field and a faint nebula behind them, soft bloom on anything bright, and a perspective camera that flies from one subject to the next. A heads-up display of one big number and small square-plate tags sits on top, and an everyday companion object beside every subject explains its size. It should read as a science documentary shot in deep space, not as a flat illustration.

Signature traits (each checkable on a frame):
1. Near-black ground `#000004` with seeded stars in three temperatures (blue-white, white, warm) and a violet nebula band no brighter than a quarter of the range.
2. One warm light source: every body has a visible bright side, a soft terminator and a dark side; none is lit flat.
3. Bodies are shader-made: noise surfaces (continents, bands, granulation), no image textures, no cartoon outlines.
4. Atmosphere rim: a Fresnel glow plus a thin additive shell (radius x1.045) on worlds; a corona with noise rays on stars.
5. Bloom on the brightest things only (threshold .92, strength .5); nothing blown to white.
6. Speed shown by dust streaks stretched along the camera's velocity during flights.
7. A big number top-left in Google Sans Flex 800 (14.5% of the short side) with a mono label above it, computed from the scene.
8. Small square mono tags (dark plate 62 to 72%, 2 px amber border) beside objects, never on them.
9. A companion object next to each subject (a door by the Sun, a coin by Earth) stacked vertically so the pair fills the frame.
10. Camera never locked off: handheld drift on every shot, geometric zooms across orders of magnitude.
11. A vignette darkens the edges; the world continues to the bottom edge, no plain black band.
12. Captions in a plate (box style), white words with the spoken one on an amber chip, same place all film.

## 2. Palette

| Role | Value | Use |
| --- | --- | --- |
| Ground | `#000004` | space, canvas clear colour |
| Nebula | violet `#3a2a5c`, at most 25% of the range | faint band |
| Stars | `#bfd9ff`, `#ffffff`, `#ffd9b3` | 14,000 points, size 1.1 to 4.7 px |
| Light | warm white `#fff1d6` | one source per scene |
| HUD accent | amber `#ffb23e`, label text `#ffcf8a` | tags, chip, orbit lines |
| HUD plate | `rgba(0,0,10,.72)` with a 2 px `rgba(255,214,150,.9)` border | tags |
| Text | `#ffffff` | big number, caption words |
| Caption chip text | `#0a0a14` | on the amber chip |
| Subject colours | saturated, plausible (ocean `#2f6fb5`, land `#4f8a3a`, star orange first and white only at peaks) | bodies |

- Ratios: ground and nebula 55 to 70% of a frame; subjects 25 to 40%; HUD under 8%; amber under 5%.
- A brand accent replaces the amber.
- Never: a second HUD accent colour, pure white bodies, grey (unsaturated) planets, gradients on the HUD, a bright nebula, text over a subject's bright side without a plate.

## 3. Shapes and line

- Geometry: `SphereGeometry(1, 128, 96)` for every body; boxes and cylinders for built props; no models, no images.
- Lines (orbits, rails, links): `Line2` with `linewidth` 2 to 4 px at 1080x1920 (plain GL lines are 1 px and vanish in compression); orbit lines in amber at 55% opacity.
- Edge treatment: a 4x MSAA half-float target so silhouettes are smooth; no outline pass.
- Surface recipe: one `ShaderMaterial`, 3D simplex noise on the unit-sphere normal, a `uType` switch (star, rocky world, gas giant, moon, prop). Terminator `smoothstep(-0.1, 0.3, N.L)`; night-side lights masked by `1 - smoothstep(-0.2, 0.15, N.L)`; water glint `pow(dot(reflect(-L,N), V), 70)`; rim `pow(1 - N.V, 3)`; star limb darkening `0.42 + 0.78 * pow(mu, 0.55)`.
- Bloom: `EffectComposer` on a 4x MSAA HalfFloat target, `UnrealBloomPass(res, 0.5, 0.6, 0.92)`, no output pass.
- Light: view-space light direction from `transformDirection(camera.matrixWorldInverse)`; one light; ambient `uAmb` 0.012; choose camera sides with a component toward the light.
- Shadows: none cast; the terminator is the shadow. Props with standard materials get one point light at the source.
- Texture: a faint vignette `radial-gradient(ellipse at 50% 42%, transparent 55%, rgba(0,0,4,.55) 100%)`.

## 4. Characters and objects

There are no characters; the cast is bodies and props. Construction:
- A body: a unit sphere scaled to its radius, the shader material, rotating 0.03 to 0.14 rad/s (`t * k`, never a clock), optionally an atmosphere shell (x1.045, additive) and a glow billboard.
- Proportion: when comparing, keep true ratios; for a subject and a companion, stack them vertically with the pair filling 55 to 60% of the frame height.
- A prop (a door, a coin, a ball) uses `MeshStandardMaterial` with a colour, roughness .4 to .7 and one point light; keep it to one or two simple solids (a coin is a cylinder plus a star relief).
- Stock objects drawn this way: 1. star with corona, 2. rocky world with oceans and night lights, 3. banded gas giant, 4. ringed planet (a flat `RingGeometry` with a shader), 5. moon (grey noise, craters from a second octave), 6. coin or disc, 7. ball (a sphere with a seam line), 8. door (box, panel insets, a knob), 9. orbit ring (`Line2`), 10. dust (seeded `LineSegments` wrapping around the camera).
- Eyes and hands do not exist; if the subject has a face, use another style.

## 5. Typography

- Big number: Google Sans Flex 800, `calc(var(--vf-vmin) * 0.145)` (about 157 px on 1080 wide), line-height 1.02, tracking -0.02em, white, `text-shadow: 0 2px 22px rgba(0,0,10,.9)`; at the top inside the safe area (about y 70 to 230).
- Label above it: JetBrains Mono 700, `0.031 * vmin` (about 33 px), tracked .1em, caps, `#ffcf8a` on a `rgba(0,0,8,.62)` plate, padding 7 x 14 px.
- Tags beside objects: JetBrains Mono 700, `0.03 * vmin` (about 32 px), tracked .06em, white on the dark plate with the amber border; a sub-line (a multiplier or a unit note) 26 to 28 px, 16 px below the number.
- Captions: `vfrey.captions("#captions", { style: "box", color: "#ffffff", highlight: "#ffb23e", highlightText: "#0a0a14", maxWords: 4 })`, centred at `--vf-caption-at` (about 63 to 77% down), one place all film, never over a subject or a tag. Local fallbacks: `Arial` and `Menlo`.

## 6. Composition

Captions sit on a plate, never over a subject; the world stays large and runs to the bottom edge behind the band.

- Safe area: HUD inside `--vf-safe-left/right/top`; the bottom-right corner stays clear for the `AI-GENERATED` label.
- Grid: HUD zone y 60 to 260; hero zone y 260 to 1130 (the subject pair sits here, shifted up with `camera.setViewOffset(W, H, 0, 0.06 * H, W, H)`); caption band y 1200 to 1490; the world continues behind it to the edge.
- Subject scale: 35 to 70% of the frame width and 55 to 60% of its height for the pair; a lone subject can fill 100% of the width (a limb or a rim crop is good).
- Layers: sky and nebula at the back; dust in the middle; the subject; tags in front; the vignette over all.
- Depth cues: parallax from the camera drift, dust streaks, bloom, the atmosphere rim. At a 40 degree vertical FOV a tall frame shows `0.409 * D` across and `0.728 * D` up.

Shot types:

```
HERO PAIR          LIMB CLOSE-UP        FLIGHT / ROAD        SYSTEM PULL-OUT      LONG DISTANCE
+----------+       +----------+         +----------+         +----------+         +----------+
|786 m     |       |57,747 km |         |215 m     |         |10 km     |         | 2.2 km   |
| [tag] o  |       |x1.4 laps |         |  - - -   |         |    ___   |         |          |
|   (  )   |       |  .-~~~~-.|         | =  = =   |         |  ( o  )  |         |    .     |
|    ()    |       | (  Earth |         |   - - -  |         |   ---    |         | .tiny    |
|  caption |       | caption  |         |  caption |         |  caption |         |  caption |
+----------+       +----------+         +----------+         +----------+         +----------+
```

## 7. Motion

- Feel: smooth, continuous, filmic; no stepping. Everything is a pure function of `t` in `render(t)`, run from a `modifiers` tween.
- Camera shots `{t, F, dir, D}`: interpolate `F` linearly, `dir` by lerp and normalise, `D` geometrically (`exp(lerp(ln a, ln b))`). Ease `inOutQuart` for flights, `inOutCubic` for holds.
- Durations: a flight 1.2 to 2.5 s; a hold 1.5 to 3 s; a whip between targets 0.4 to 0.7 s; the last image holds 1.5 s.
- Entrances: the subject is on screen within 0.3 s of its line starting. HUD tags fade in over 0.3 s (`sm(t0, t0 + .3, t)`) and out over 0.3 s.
- Camera drift on every shot: `dir.x += 0.03 sin(0.83 t)`, `dir.y += 0.022 cos(0.61 t)`, `dir.z += 0.02 sin(0.47 t + 1)`, `D *= 1 + 0.012 sin(0.9 t)`.
- Secondary and ambient: body rotation 0.03 to 0.14 rad/s, star granulation animated by `uTime`, dust streaks scaled by velocity over `B`, corona rays.
- Per frame: `near = D * 0.02`, `far = D * 6e4`.
- Forbidden: locked-off cameras, `Date.now`, `requestAnimationFrame`, `THREE.Clock`, unseeded random, cuts without a flight or a flash, a zoom faster than 0.4 s except a whip, a subject spinning faster than 0.3 rad/s.

## 8. Transitions

1. The flight (default): the camera travels from one `F` to the next; no cut.
2. Whip pan: `F` jumps while the camera stays, in 0.4 to 0.7 s, with dust streaks.
3. White flash cut (at most one per short): a second scene with its own camera and composer, hidden by `#flash` going up in 0.2 s and down in 0.5 s, peaking on the cut frame (`opacity = sm(tc - .22, tc - .01, t) * (1 - sm(tc + .02, tc + .5, t))`).
Forbidden: crossfades, wipes, slides, any 2D transition.

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). The bed is a deep drone (41, 55, 82 Hz sines with slow LFOs) over brown-noise rumble with an echo: no beat, open low register, A-minor feel. Accents: a pink-noise `whoosh` (highpass/lowpass, fade in then exponential out, echo) on each fly-by and a sine-sweep `boom` at a cut. Mix: bed volume -9, duck under the voice, result about -14 LUFS. `make-bed.py` next to this file writes it with `python3` and `ffmpeg` only and no downloads.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`; times are the same key words the camera uses), then from the project folder: `python3 "$(npx vfrey styles path real-3d)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey real 3D style, ffmpeg)", "volume": -9, "duck": true}` and render again with `--rerender`.

One pass instead: `--duration 60` with no `--timing` writes the drone alone. No `python3` on the machine: leave `music` out, say so, install nothing.

## 10. Shot plan template (32 to 38 s)

Script: 5 or 6 lines; set `lineGap` 0.25 to 0.4 (Kokoro's default pause is about a second; `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; sample with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window (about 2.8 words a second (measured; the `series kit` Pace line has your voice's own figure) at lineGap 0.3). Write numbers from sourced values and compute them in code; the HUD shows the computed number. Cue shots to spoken words, in increasing time order.

| Time | Beat | Shot type | Camera | HUD |
| --- | --- | --- | --- | --- |
| 0 to 3 s | Hook: the subject, huge | LIMB CLOSE-UP | short D, slow push | label and first number |
| 3 to 9 s | The companion gives the scale | HERO PAIR | hold, drift | tags on both |
| 9 to 20 s | The journey: distance or growth | FLIGHT / ROAD | flights 1.5 to 2.5 s, dust | number counts up |
| 20 to 27 s | A second subject or a comparison | HERO PAIR then LONG DISTANCE | whip, hold | new label |
| 27 to 33 s | Pull out to the whole | SYSTEM PULL-OUT | geometric D x10 | final number |
| last 1.5 s | The payoff holds | LONG DISTANCE | slow drift | number and tag |

## 11. Reference frames

- `ref-1.jpg`: the star hero pair. Copy the corona rays and bloom on the bright side, the companion door beside it, the number and label top-left and the amber tags.
- `ref-2.jpg`: a flight. Copy the dust streaks, the faint violet nebula, the empty-space depth and the caption plate with the amber chip.
- `ref-3.jpg`: two bodies stacked. Copy the vertical stacking that fills the frame, the shader surfaces and tags beside (not on) the bodies.
- `ref-4.jpg`: a world close-up. Copy the day side, soft terminator, night-side lights, atmosphere rim and the amber orbit line.

## 12. Reference implementation

`starter.html` is the page; `scene-starter.js` (with `glsl.js`) is a working film skeleton: a star, a lit world, a sky, bloom, a three-shot camera and two tags. Run `npx vfrey styles start real-3d scenes/<idea>`: it copies `starter.html` to `scenes/<idea>/index.html`, `scene-starter.js` (as `scene.js`) and `glsl.js` to `src/<idea>/`, and prints the bundle commands (it never installs three.js), then change the cast, shots and cues, bundle (`helpers.md` step 3) and check with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 4 out.png`. Keep the plumbing: renderer, `modifiers` loop, error box, sky, bloom, tags.

## 13. Do and Don't, and the final checklist

Do:
1. Do drive everything from `t` through a `modifiers` tween.
2. Do key every shot to spoken words.
3. Do keep one warm light and choose camera sides toward it.
4. Do stack a subject and a companion vertically to fill the frame.
5. Do put tags beside objects, with a 16 px gap between texts.
6. Do compute every HUD number in code from sourced values.
7. Do add handheld drift to every shot.
8. Do keep nebula and bloom restrained.
9. Do set `box` captions in the script and the scene.
10. Do rebuild the bundle after every edit.
11. Do look at the contact sheet for a frozen canvas.

Don't:
1. Don't use image textures or downloaded models.
2. Don't send this style to a cloud render or a machine with no graphics chip.
3. Don't render in `onUpdate` (stale frames on a seek).
4. Don't use `Date.now`, `requestAnimationFrame` or an unseeded random.
5. Don't film the night side of the main subject.
6. Don't let bloom turn a shader cream or white.
7. Don't lock the camera off.
8. Don't put a second accent colour in the HUD.
9. Don't place captions over a subject or a tag.
10. Don't use 1 px GL lines.
11. Don't type a number the scene can compute.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- [ ] Ground near-black with stars; nebula faint.
- [ ] A large, lit subject (not its night side) in every tile.
- [ ] Soft terminator and atmosphere rim on worlds; corona on stars.
- [ ] Bloom present but nothing blown to white.
- [ ] The picture differs in every tile (no frozen canvas, no green error box).
- [ ] Big number top-left with a mono label; numbers are computed.
- [ ] Tags beside objects, square plates with amber borders, clear of captions.
- [ ] Caption plate in the same place all film; amber chip on the spoken word.
- [ ] The world continues behind and below the captions to the bottom edge.
- [ ] A still at one time matches the film at that second; bottom-right corner clear.
- [ ] Every number on screen matches the number the voice says (digits, units and rounding); read the contact sheet against the script.

## Pitfalls

- Rendering in `onUpdate` can leave stale or blank frames on a seek: use `modifiers`.
- Without `preserveDrawingBuffer: true` the grabbed frame can be blank.
- A throw inside `render` leaves the last good canvas up and looks like skipped frames: keep the try/catch and the on-screen error box.
- Forgetting to rebuild after an edit renders the old bundle. Put the build in a script and run it every time.
- Bloom turns a bright shader cream or white: lower the shader's gain, raise the threshold, keep colours saturated.
- Seconds typed into shots drift once the real voice exists: key shots to words.
- A `captions.style` of `pop` in the script makes unspoken words dark, unreadable on black: set `box` in the script and the scene.
- Two HUD texts closer than 16 px trigger `frames.text-overlap`: keep the gap and `white-space: nowrap`.
