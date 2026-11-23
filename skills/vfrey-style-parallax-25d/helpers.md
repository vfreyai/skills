# 2.5D pixel diorama: the toolkit

`diorama.js` next to this file is the toolkit: plain WebGL2 in one classic script, no packages, no network, no build step. `npx vfrey styles start parallax-25d scenes/<idea>` copies it into your scene folder with the starter. Load it after `vfrey.js` and write your scene in a second script. All sizes are in metres; y is up; the default camera looks toward -z, so the faces at +z are the fronts.

## The page

Keep the starter's shell: a `<canvas id="gl">` that fills `#root`, the title card, one `.tag`, `#captions` (vfrey `box` captions on the cream card) and the `#err` box, then:

```js
const tl = vfrey.timeline();
vfrey.captions("#captions", { style: "box", color: "#2b2028", highlight: "#c8743a", highlightText: "#fff6e6", maxWords: 4 });
const D = Diorama.create({ canvas: "#gl", width: vfrey.frame.width, height: vfrey.frame.height });
// ... build the worlds ...
vfrey.onFrame((t) => { try { frame(t); } catch (e) { showError(e); } });
frame(0);
```

`vfrey.onFrame` runs after every seek, once per rendered frame, in any order (render workers start mid-film). `frame(t)` must be a pure function of `t`.

## Renderer: `Diorama.create({ canvas, width, height, shadowSize })`

Returns `D` with:

| Call | What it does |
| --- | --- |
| `D.mat(canvas, { density, tint, emit, scroll })` | a surface from a pixel canvas: `density` texels a metre (16), `emit` makes it glow (windows 3.5, fire 6 to 7), `scroll: [u, v]` per second moves water |
| `D.world(settings)` | a place with its own light (below) |
| `D.camera({ target, yaw, pitch, dist, fov, focus, sharp, ramp })` | a perspective camera looking at `target` from `dist` metres, `pitch` degrees down, `yaw` degrees around (0 looks toward -z); `focus` (default `dist`), `sharp` and `ramp` set the tilt-shift band |
| `D.move(a, b, t0, t1, t)` | the camera between two camera settings, eased in and out (in-out cubic) |
| `D.render(world, cam, t, { blurAll, dim })` | draws a frame; `blurAll` 0 to 1 blurs everything (the focus-pull transition), `dim` darkens |
| `D.project([x, y, z])` | where a world point is on the frame in px, for the last rendered frame (tags) |

## A place: `D.world({ sun, sky, ground, ambient, haze, fog, fogStart, shafts, skyTop, skyBottom, bounds, grade })`

- `sun: { azimuth, elevation, color, power }`: azimuth in degrees around y (0 is +z, toward the camera; -90 is from the left), elevation 8 to 30 for long shadows, power 2 to 3.
- `sky`, `ground`, `ambient`: the cool light in the shade, from above and below (blue-violet and a dusky purple, about 0.5 to 0.7).
- `haze`, `fog`, `fogStart`: distance haze colour and density (outdoors about 0.008 from 35 m). `shafts`: light in the haze through the shadow map (0.05 outdoors, 0.1 to 0.2 for a sunbeam through a window).
- `skyTop`, `skyBottom`: the backdrop gradient behind everything (a dark warm colour behind a cut-away room).
- `bounds: [x0, z0, x1, z1, y0, y1]`: the box the sun's shadow map covers; keep it tight around the stage for sharper shadows.
- `grade: { bloom, threshold, vignette, cool, warm, sat, exposure }`: bloom strength and threshold, vignette, split toning (cool shadows, warm light), saturation, exposure.

## Geometry (all real, all lit and shadowed)

| Call | Builds |
| --- | --- |
| `w.ground(x0, z0, x1, z1, mat, y)` | a floor |
| `w.box(x, y, z, sx, sy, sz, mat or { side, top, front, bottom }, { noContact, noTop, ao })` | a box, x and z the centre, y the base; a contact shadow under it when it stands on the ground |
| `w.gable(x, y, z, sx, h, sz, roof, wall, { along, over })` | a pitched roof on a box top at height y, ridge along x or z, with gable walls and an overhang |
| `w.hip(x, y, z, sx, h, sz, roof)` | a four-sided roof (a tower) |
| `w.house(x, z, sx, sz, storeys, { wall, roof, glass, dark, shutter, door, sill }, { along, face, door, lit })` | a house of 3 m storeys with a roof, windows with shutters and sills on one face (`"+z"`, `"+x"`, `"-x"`) and a door; `lit` lists glowing windows (storey * 10 + index) |
| `w.cyl(x, y, z, r, h, mat, { sides, top, noContact })` | a cylinder: basin, well, barrel, column, oven base |
| `w.cone(x, y, z, r, h, mat, { sides })` | a cone: spire, bell, heap of pigment, tent |
| `w.ball(x, y, z, rx, ry, rz, mat, { seg, contact })` | a faceted round volume: a tree crown, a dome, a loaf |
| `w.tree(x, z, { h, r, trunk, leaf, seed })`, `w.cypress(x, z, { h, r, trunk, leaf })` | 3D trees |
| `w.stairs(x, y, z, width, steps, rise, run, mat, dir)` | steps climbing toward -z (dir 1) |
| `w.awning(x, y, z, sx, sz, drop, mat)` | a sloped canopy over a stall |
| `w.face(mat, p0, p1, p2, p3)` | one quad from four corners, counter-clockwise seen from the front, for a fresco, a sign, a painting (set the material density to texture width over quad width so it fits once) |
| `w.contact(x, z, rx, rz, strength)` | a soft dark blob on the ground (the ambient occlusion feel) |
| `w.node(build, { castOnly })` | geometry that moves: `build(w)` adds faces around the origin, then set `node.pos`, `node.rot` (degrees, applied y, x, z), `node.scale`, `node.visible` every frame; `castOnly: true` only casts shadow |

## Light and air

| Call | What it does |
| --- | --- |
| `w.light(x, y, z, colour, range, power)` | a point lamp, no shadow, up to 8 per world; animate `.power` and `.pos` |
| `w.glow(x, y, z, r, colour, k)` | a soft halo that blooms; animate `.k` |
| `w.dust(n, [x0, y0, z0, x1, y1, z1], colour)` | floating dust or pollen that drifts with time and grows into soft discs out of focus |

## Characters: `w.sprite(canvas, { x, y, z, height, tint, emit, shadow, contact })`

A camera-facing pixel billboard (only for people and animals). Set `.x .y .z .frame .flip .visible` every frame. The canvas is a strip of equal frames side by side:

- `Diorama.person(look, pose)`: a 16 x 26 px character. `look: { skin, hair, top, trim, bottom, dress, hat, apron, tool, outline }`; `pose` is `"walk"` or `"carry"` (4 frames), `"work"` or `"stand"` (2 frames).
- `Diorama.sprite(rows, map)`: a frame from strings (`.` transparent, letters are keys of `map`), `Diorama.strip(frames)` puts frames side by side, `Diorama.outline(painter, colour)` adds a 1 px outline inside a `pix` draw.

```js
const ana = w.sprite(Diorama.person({ skin: "#e8b48c", hair: "#5a3020", top: "#b8423a", bottom: "#7a2c2c", dress: true }), { height: 2.6 });
function walk(s, t, t0, t1, a, b) { const k = Diorama.clamp((t - t0) / (t1 - t0)); s.x = a[0] + (b[0] - a[0]) * k; s.z = a[1] + (b[1] - a[1]) * k; s.flip = b[0] < a[0]; s.frame = k > 0 && k < 1 ? Math.floor(t * 8) % 4 : 1; }
```

## Pixel textures

`Diorama.pix(w, h, (p, r) => { ... }, seed)` makes a canvas; the painter has `p.rect(x, y, w, h, colour)`, `p.dot(x, y, colour)`, `p.clear()`, `p.ctx`, and `r()` is seeded. Stock textures in `Diorama.TEX`, each from your palette: `cobbles({ a, b, c, joint })`, `dirt({ a, b, c })`, `grass({ a, b, c })`, `plaster({ a, b, c })` (one storey a tile), `timber({ a, b, beam })` (half-timbered), `stone({ a, b, c, joint })`, `tiles({ a, b, c })` (roofs), `planks({ a, b, c })`, `water({ a, b, c })`, `flat(colour)`. Colour helpers: `Diorama.shade(hex, k)`, `Diorama.mix(a, b, t)`.

## Cues, beats and the transition

```js
const L = (i) => vfrey.line(Math.min(i, vfrey.timing.lines.length - 1));
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const cue = (li, re, frac = 0.5) => { const l = L(li), w = l.words.find((x) => re.test(norm(x.text))); return w ? w.start : l.start + (l.end - l.start) * frac; };
const pop = (t, t0, d = 0.45) => { const s = Diorama.clamp((t - t0) / d), c = 1.3; return s <= 0 ? 1e-3 : 1 + (c + 1) * (s - 1) ** 3 + c * (s - 1) ** 2; };
// a focus pull at each cut between places: blur out, change place at the peak, blur in
const cuts = [L(2).start - 0.3, L(4).start - 0.3];
let blurAll = 0; for (const c of cuts) blurAll = Math.max(blurAll, Diorama.ease(Math.max(0, 1 - Math.abs(t - c) / 0.38)));
D.render(t < cuts[0] ? square : t < cuts[1] ? oven : tower, cam, t, { blurAll, dim: 0.18 * blurAll });
```

## Rendering and cost

Each frame draws a 4096 px sun shadow map, the 4x multisampled picture, two blur levels for the tilt-shift and an eighth-size bloom. On an Apple Silicon Mac a 33 s 1080 x 1920 film renders in about 40 s. Build the worlds once at load (geometry is batched per material); only nodes, sprites, lights and the camera change per frame.
