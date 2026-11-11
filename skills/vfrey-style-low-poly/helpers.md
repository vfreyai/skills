# Low-poly 3D: code to copy

The three.js plumbing (install, bundle, page shell, the `modifiers` proxy tween, the on-screen error box) is the Real 3D style's: read `vfrey-style-real-3d` (`SKILL.md`, `helpers.md`, `scene-starter.js`) first and do not repeat it. This file holds what is specific to the low-poly look. Put the blocks in `src/scene.js` (bundled to `scenes/<idea>/scene3d.js` as the Real 3D helpers describe) and use the page shell below, which replaces that style's shell. Globals from the page: `vfrey`, `gsap`, `tl`.

## Page shell

```html
<!doctype html>
<!-- Low-poly 3D: the honeybee waggle dance. three.js scene (bundle scene3d.js built from src/scene.js) driven by the vfrey timeline. -->
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script>
<script src="vfrey/vfrey.js"></script>
<style>
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #bfe6f2; }
  #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #bfe6f2; font-family: "Baloo 2", "Google Sans Flex", sans-serif; color: #fff; }
  #gl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
  .tilt { position: absolute; left: 0; right: 0; pointer-events: none; opacity: 0; backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px); }
  #tilt-top { top: 0; height: 24%; -webkit-mask-image: linear-gradient(#000, transparent); mask-image: linear-gradient(#000, transparent); }
  #tilt-bot { bottom: 0; height: 26%; -webkit-mask-image: linear-gradient(transparent, #000); mask-image: linear-gradient(transparent, #000); }
  #vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 45%, rgba(51,32,60,0) 45%, rgba(51,32,60,0.62) 100%); }
  #flood { position: absolute; inset: 0; background: #33203c; opacity: 0; pointer-events: none; }
  #captions .vf-grp.on { background: #33203c !important; padding: 10px 26px 14px; box-shadow: 0 9px 0 rgba(43,26,48,0.32); }
  #captions { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-right); top: var(--vf-caption-at); height: var(--vf-caption-h); }
</style>
</head>
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0">
  <canvas id="gl"></canvas>
  <div class="tilt" id="tilt-top"></div><div class="tilt" id="tilt-bot"></div>
  <div id="vig"></div>
  <div id="flood"></div>
  <div id="captions"></div>
</div>
<script>
  const tl = vfrey.timeline();
  vfrey.captions("#captions", { style: "box", color: "#ffffff", highlight: "#ffd24a", highlightText: "#33203c", maxWords: 4 });
</script>
<script src="scene3d.js"></script>
</body>
</html>
```


## Kit: palette, renderer, one colour per triangle, warp

`P` turns any geometry into non-indexed triangles with one colour each (a hex or a function of the triangle's centre and normal) plus a small brightness jitter; `warp` bends vertices by a function of position so shared corners stay together. One `MeshStandardMaterial` with `vertexColors` and `flatShading` serves nearly everything.

```js
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
const V3 = THREE.Vector3, v3 = (x, y, z) => new V3(x, y, z);
const W = vfrey.frame.width, H = vfrey.frame.height, T = vfrey.timing.durationSec, WORDS = vfrey.timing.words;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (a, b, x) => clamp((x - a) / (b - a));
const sm = (a, b, x) => { const t = lin(a, b, x); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const inOutCubic = (s) => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);
const inOutQuart = (s) => (s < 0.5 ? 8 * s * s * s * s : 1 - Math.pow(-2 * s + 2, 4) / 2);
const outCubic = (s) => 1 - Math.pow(1 - s, 3);
const backOut = (s) => { const c = 1.9; return 1 + (c + 1) * Math.pow(s - 1, 3) + c * Math.pow(s - 1, 2); };
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const TAU = Math.PI * 2;
// ---------- palette (pastel; one coral accent, one sun yellow) ----------
const C = {
  skyTop: "#8fd0f0", skyMid: "#c9ecf6", horizon: "#ffe9d6", below: "#ffd3e2", deep: "#d9c2f0", fog: "#ffe6da",
  grassA: "#a8e6a1", grassB: "#8fdc9a", grassC: "#c4f0b2", grassD: "#79cf95", earthA: "#e0ad82", earthB: "#cc9370", rockA: "#bba9dc", rockB: "#a08fca", rockC: "#8a7ab8",
  pineA: "#62c9a0", pineB: "#7cd8ae", pineC: "#98e6c0", trunk: "#a8745e", blossom: "#ff9ebb", blossomB: "#ffc4d8", lilac: "#cdb4f5", cream: "#fffaf0",
  straw: "#ffd98a", strawB: "#f5bf62", wood: "#c98f6b", woodB: "#b57a5a", plum: "#33203c", plumB: "#4a3340",
  sun: "#ffd24a", sunB: "#ffb84a", coral: "#ff6f61", beeY: "#ffd24a", beeO: "#f6ac44", beeD: "#5b3b46",
  honey: "#ffd77a", honeyB: "#ffca5c", honeyC: "#f9bd4e", amber: "#c9792a", nectar: "#ffab3d", cap: "#ffeab8",
};
// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setScissorTest(true);
// ---------- low-poly kit: every model is flat-shaded triangles with one colour per face, slightly jittered ----------
const MAT = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.86, metalness: 0 });
const jr = rng(7);
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
function M({ p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] } = {}) { const sc = typeof s === "number" ? [s, s, s] : s; return new THREE.Matrix4().compose(v3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), v3(...sc)); }
// P: geometry -> non-indexed, transformed, one colour per triangle. color: hex string or (centroid, normal) => hex. j: brightness jitter.
function P(geo, color, mat, j = 0.06) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (g.attributes.uv) g.deleteAttribute("uv");
  if (mat) g.applyMatrix4(mat);
  g.computeVertexNormals();
  const p = g.attributes.position, n = p.count, col = new Float32Array(n * 3), c = new THREE.Color(), cen = new V3(), nor = new V3(), a = new V3(), b = new V3(), d = new V3();
  for (let i = 0; i < n; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); d.fromBufferAttribute(p, i + 2);
    cen.copy(a).add(b).add(d).divideScalar(3); nor.copy(b).sub(a).cross(d.clone().sub(a)).normalize();
    c.set(typeof color === "function" ? color(cen, nor) : color);
    const k = 1 + (jr() - 0.5) * 2 * j;
    for (let q = 0; q < 3; q++) col.set([c.r * k, c.g * k, c.b * k], (i + q) * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}
function mesh(parts, { cast = true, receive = true, mat = MAT } = {}) { const m = new THREE.Mesh(parts.length === 1 ? parts[0] : mergeGeometries(parts), mat); m.castShadow = cast; m.receiveShadow = receive; return m; }
// bend every vertex by a function of its position (shared corners stay shared, so the surface stays closed)
function warp(geo, fn) { const p = geo.attributes.position, v = new V3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } return geo; }
const wob = (x, y, z) => Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 0.5 + Math.sin(x * 4.1 - z * 7.3 + y * 2.7) * 0.5;
const pick = (arr, k) => arr[Math.floor(clamp(k, 0, 0.9999) * arr.length)];
```


## Timing from the voice, diagram lines and wedge

`Line2` gives constant-width lines (plain GL lines are 1 px); `setLine` rewrites a solid line's points in place so animating it allocates nothing. Cue everything from line starts and words, never typed seconds.

```js
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const NL = vfrey.script.lines.length;
const lineStart = (i) => { const w = WORDS.find((x) => x.line === i); return w ? w.start : T; };
const LS = []; for (let i = 0; i < NL; i++) LS.push(lineStart(i));
const wordT = (text, line, fb) => { const w = WORDS.find((x) => x.line === line && norm(x.text) === norm(text)); return w ? w.start : fb; };
// constant-width lines for diagram overlays (plain GL lines are 1 px)
const lineMats = [];
function line(points, color, widthPx, { alpha = 1, dashed = false, dash = 0.3, gap = 0.2, depthTest = true, over = false } = {}) {
  const g = new LineGeometry(); g.setPositions(points.flatMap((p) => [p.x, p.y, p.z]));
  const m = new LineMaterial({ color, linewidth: widthPx, transparent: !over, opacity: alpha, depthWrite: false, depthTest, dashed, dashSize: dash, gapSize: gap });
  m.resolution.set(W, H); m.userData.w = widthPx; lineMats.push(m);
  const l = new Line2(g, m); if (dashed) l.computeLineDistances(); l.frustumCulled = false; l.userData.n = points.length; if (over) l.renderOrder = 2; return l;
}
function setLine(l, pts) {   // rewrite a solid line's points in place (no new buffers per frame)
  const data = l.geometry.attributes.instanceStart.data, arr = data.array, n = l.userData.n, m = pts.length - 1;
  for (let i = 0; i < n - 1; i++) { const a = pts[Math.min(i, m)], b = pts[Math.min(i + 1, m)]; arr[i * 6] = a.x; arr[i * 6 + 1] = a.y; arr[i * 6 + 2] = a.z; arr[i * 6 + 3] = b.x; arr[i * 6 + 4] = b.y; arr[i * 6 + 5] = b.z; }
  data.needsUpdate = true;
}
function wedge(n, color, opacity) {   // a translucent pie slice whose points are rewritten each frame
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 9), 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false })); m.frustumCulled = false;
  m.userData.set = (c, pts) => { const a = g.attributes.position.array; for (let i = 0; i < n; i++) { const p = pts[Math.min(i, pts.length - 1)], q = pts[Math.min(i + 1, pts.length - 1)]; a.set([c.x, c.y, c.z, p.x, p.y, p.z, q.x, q.y, q.z], i * 9); } g.attributes.position.needsUpdate = true; };
  return m;
}
```


## Sky dome, light, floating island

The hemisphere light (pink from below) fills every shadow with colour; one warm directional light casts the soft shadows. The island is an icosphere pressed flat on top onto `groundY` and pulled into a jagged point below, coloured by height and slope. Place every prop with the same `groundY`.

```js
const sceneOut = new THREE.Scene(); sceneOut.background = new THREE.Color(C.fog); sceneOut.fog = new THREE.Fog(C.fog, 26, 95);
{ // sky dome with a pastel gradient painted per corner
  const g = new THREE.SphereGeometry(300, 24, 18), p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  const stops = [[-1, C.deep], [-0.3, C.below], [0.0, C.horizon], [0.28, C.skyMid], [1, C.skyTop]];
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 300; let k = 0; while (k < stops.length - 2 && y > stops[k + 1][0]) k++; c.set(stops[k][1]).lerp(new THREE.Color(stops[k + 1][1]), lin(stops[k][0], stops[k + 1][0], y)); col.set([c.r, c.g, c.b], i * 3); }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  sceneOut.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
}
sceneOut.add(new THREE.HemisphereLight("#e6f6ff", "#ffc9b8", 2.1));
const sunLight = new THREE.DirectionalLight("#fff0d2", 2.5); sunLight.position.set(7, 14, -2); sunLight.castShadow = true;
Object.assign(sunLight.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 }); sunLight.shadow.mapSize.set(2048, 2048); sunLight.shadow.bias = -0.0004; sunLight.shadow.normalBias = 0.04; sunLight.shadow.radius = 5;
sceneOut.add(sunLight, sunLight.target);

const isle = new THREE.Group(); sceneOut.add(isle);
const R = 7.5, HX = -1.5, HZ = 2.5, TH = (40 * Math.PI) / 180, R_FAR = 6.0, R_NEAR = 2.9;
const hills = [[-4.7, -2.4, 1.5, 2.1], [4.7, 2.6, 0.8, 1.7], [2.2, -5.6, 0.6, 1.4]];
function groundY(x, z) { const r2 = (x * x + z * z) / (R * R), edge = Math.min(1, Math.max(0, 1 - r2) * 4); let y = 0.55 * Math.sqrt(Math.max(0, 1 - r2)); for (const h of hills) y += h[2] * Math.exp(-((x - h[0]) ** 2 + (z - h[1]) ** 2) / (h[3] * h[3])) * edge; return y; }
function islandGeo(rad, depth, ground) {   // an icosphere pressed flat on top and pulled into a rock point below
  const g = warp(new THREE.IcosahedronGeometry(1, 7), (v) => {
    const x = v.x, y = v.y, z = v.z;
    if (y >= 0) { v.x = x * rad; v.z = z * rad; v.y = ground(v.x, v.z) + 0.07 * wob(x * 3, 0, z * 3) * Math.min(1, y * 5); }
    else { const k = -y, n = wob(x * 2, y * 2, z * 2); v.x = x * rad * (1 - 0.32 * k) * (1 + 0.1 * n * k); v.z = z * rad * (1 - 0.32 * k) * (1 + 0.1 * n * k); v.y = -Math.pow(k, 1.25) * depth * (1 + 0.3 * wob(z * 3, x * 3, y)); }
  });
  return P(g, (c, n) => {
    const k = jr();
    if (c.y > -0.12 * (rad / R) && n.y > 0.25) return n.y < 0.86 ? pick([C.grassD, C.grassB], k) : pick([C.grassA, C.grassB, C.grassC, C.grassA], k);
    if (c.y > -depth * 0.2) return pick([C.earthA, C.earthB], k);
    return c.y > -depth * 0.55 ? pick([C.rockA, C.rockB], k) : pick([C.rockB, C.rockC], k);
  }, null, 0.05);
}
isle.add(mesh([islandGeo(R, 8.5, groundY)], { cast: false }));

const tree = mesh([P(new THREE.CylinderGeometry(0.1, 0.14, 0.5, 5), C.trunk, M({ p: [2, groundY(2, 1) + 0.2, 1] })), P(new THREE.ConeGeometry(0.6, 1.4, 6), C.pineA, M({ p: [2, groundY(2, 1) + 1.1, 1] }))]);
isle.add(tree);
```


## Camera shots and the frame function

Shots are `{ t, F, dir, D, off }` blended with `inOutCubic` (distance blended geometrically, plus a small handheld drift in `setCam`). `off` pushes the focus up out of the caption band with `setViewOffset`. `render(t)` is a pure function of `t`; the proxy tween calls it on every seek.

```js
// ---------- cameras ----------
const camA = new THREE.PerspectiveCamera(40, W / H, 0.05, 900), camB = new THREE.PerspectiveCamera(40, W / H, 0.05, 900);
function blendShots(shots, t) {   // shots: { t, F: V3 | (t)=>V3, dir, D, ease }
  let i = 0; while (i < shots.length - 2 && t >= shots[i + 1].t) i++;
  const a = shots[i], b = shots[i + 1], e = (b.ease || inOutCubic)(lin(a.t, b.t, t));
  const Fa = typeof a.F === "function" ? a.F(t) : a.F, Fb = typeof b.F === "function" ? b.F(t) : b.F;
  const dir = new V3().lerpVectors(a.dir, b.dir, e).normalize();
  return { F: new V3().lerpVectors(Fa, Fb, e), dir, D: Math.exp(lerp(Math.log(a.D), Math.log(b.D), e)), off: lerp(a.off ?? 0, b.off ?? 0, e) };
}
const n3 = (x, y, z) => v3(x, y, z).normalize();
function setCam(cam, sh, t, aspect, drift = 1) {
  const dir = sh.dir.clone(); dir.x += 0.012 * drift * Math.sin(t * 0.83); dir.y += 0.009 * drift * Math.cos(t * 0.61); dir.normalize();
  cam.position.copy(sh.F).addScaledVector(dir, sh.D * (1 + 0.006 * drift * Math.sin(t * 0.7))); cam.up.set(0, 1, 0); cam.lookAt(sh.F);
  cam.aspect = aspect; cam.near = Math.max(0.03, sh.D * 0.03); cam.far = 900;
  if (sh.off) cam.setViewOffset(W, H, 0, Math.round(sh.off * H), W, H); else cam.clearViewOffset();
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
}

// ---------- DOM overlay: the panel border, tags that follow 3D points, the credit ----------
const shots = [
  { t: 0, F: v3(0, 0.6, 0), dir: n3(0.2, 0.55, 0.8), D: 20, off: 0.04 },
  { t: T * 0.5, F: v3(2, 0.8, 1), dir: n3(-0.3, 0.45, 0.85), D: 9, off: 0.05 },
  { t: T + 0.2, F: v3(0, 0.2, -0.4), dir: n3(-0.14, 0.42, 0.9), D: 33, off: 0.0, ease: (s) => Math.sin((s * Math.PI) / 2) },
];
function render(t) {
  t = clamp(t, 0, T);
  isle.position.y = 0.1 * Math.sin(t * 0.9);                       // the island bobs
  setCam(camA, blendShots(shots, t), t, W / H);
  renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H);
  for (const m of lineMats) { m.resolution.set(W, H); }
  renderer.render(sceneOut, camA);
}
function showError(e) {
  let d = document.getElementById("errbox");
  if (!d) { d = document.createElement("div"); d.id = "errbox"; d.style.cssText = "position:absolute;left:20px;right:20px;top:36%;font:28px monospace;color:#0f0;background:#000;z-index:99;padding:12px"; document.getElementById("root").appendChild(d); }
  d.textContent = "3D scene error: " + e.message + " " + ((e.stack || "").split("\n")[1] || "");
}
const proxy = { t: 0 };
tl.to(proxy, { t: T, duration: T, ease: "none", modifiers: { t: (v) => { try { render(parseFloat(v)); } catch (e) { showError(e); } return v; } } }, 0);
try { render(0); } catch (e) { showError(e); }
```
