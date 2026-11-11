// STARTER SOURCE (vfrey-style-low-poly). Copy to src/<idea>/scene.js and bundle (see vfrey-style-real-3d helpers.md, section 3):
//   npx esbuild src/<idea>/scene.js --bundle --format=iife --minify --outfile=scenes/<idea>/scene3d.js --log-level=warning
// A floating faceted island with pines, blossom trees, rocks, flowers, clouds, a sun and a little hero creature, filmed by a gliding camera.
// Replace the hero, the props and the SHOTS; keep the kit, the light, the sky and the plumbing. Globals from starter.html: vfrey, gsap, tl.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const V3 = THREE.Vector3, v3 = (x, y, z) => new V3(x, y, z), TAU = Math.PI * 2;
const W = vfrey.frame.width, H = vfrey.frame.height, T = vfrey.timing.durationSec;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lin = (a, b, x) => clamp((x - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t, sm = (a, b, x) => { const t = lin(a, b, x); return t * t * (3 - 2 * t); };
const inOutCubic = (s) => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);
const backOut = (s) => { const c = 1.9; return 1 + (c + 1) * Math.pow(s - 1, 3) + c * Math.pow(s - 1, 2); };
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- palette: pastel, plum ink (never black), two accents (sun yellow, coral) ----------
const C = { skyTop: "#8fd0f0", skyMid: "#c9ecf6", horizon: "#ffe9d6", below: "#ffd3e2", deep: "#d9c2f0", fog: "#ffe6da",
  grassA: "#a8e6a1", grassB: "#8fdc9a", grassC: "#c4f0b2", grassD: "#79cf95", earthA: "#e0ad82", earthB: "#cc9370", rockA: "#bba9dc", rockB: "#a08fca", rockC: "#8a7ab8",
  pineA: "#62c9a0", pineB: "#7cd8ae", pineC: "#98e6c0", trunk: "#a8745e", blossom: "#ff9ebb", blossomB: "#ffc4d8", cream: "#fffaf0", plum: "#33203c",
  sun: "#ffd24a", sunB: "#ffb84a", coral: "#ff6f61", hero: "#ffd24a", heroB: "#f6ac44" };

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ---------- low-poly kit: flat-shaded triangles, ONE colour per triangle, with a small brightness jitter ----------
const MAT = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.86, metalness: 0 });
const jr = rng(7);
function M({ p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] } = {}) { const sc = typeof s === "number" ? [s, s, s] : s; return new THREE.Matrix4().compose(v3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), v3(...sc)); }
function P(geo, color, mat, j = 0.06) {   // geometry -> non-indexed, placed, coloured per triangle (colour or (centroid, normal) => colour)
  const g = geo.index ? geo.toNonIndexed() : geo.clone(); if (g.attributes.uv) g.deleteAttribute("uv"); if (mat) g.applyMatrix4(mat); g.computeVertexNormals();
  const p = g.attributes.position, n = p.count, col = new Float32Array(n * 3), c = new THREE.Color(), cen = new V3(), nor = new V3(), a = new V3(), b = new V3(), d = new V3();
  for (let i = 0; i < n; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); d.fromBufferAttribute(p, i + 2);
    cen.copy(a).add(b).add(d).divideScalar(3); nor.copy(b).sub(a).cross(d.clone().sub(a)).normalize();
    c.set(typeof color === "function" ? color(cen, nor) : color); const k = 1 + (jr() - 0.5) * 2 * j;
    for (let q = 0; q < 3; q++) col.set([c.r * k, c.g * k, c.b * k], (i + q) * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3)); return g;
}
function mesh(parts, { cast = true, receive = true } = {}) { const m = new THREE.Mesh(parts.length === 1 ? parts[0] : mergeGeometries(parts), MAT); m.castShadow = cast; m.receiveShadow = receive; return m; }
function warp(geo, fn) { const p = geo.attributes.position, v = new V3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } return geo; }   // bend by position: shared corners stay shared
const wob = (x, y, z) => Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 0.5 + Math.sin(x * 4.1 - z * 7.3 + y * 2.7) * 0.5;
const pick = (arr, k) => arr[Math.floor(clamp(k, 0, 0.9999) * arr.length)];

// ---------- world: sky dome painted per corner, fog, hemisphere + one warm sun light with soft shadows ----------
const scene = new THREE.Scene(); scene.background = new THREE.Color(C.fog); scene.fog = new THREE.Fog(C.fog, 26, 95);
{ const g = new THREE.SphereGeometry(300, 24, 18), p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  const stops = [[-1, C.deep], [-0.3, C.below], [0.0, C.horizon], [0.28, C.skyMid], [1, C.skyTop]];
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 300; let k = 0; while (k < stops.length - 2 && y > stops[k + 1][0]) k++; c.set(stops[k][1]).lerp(new THREE.Color(stops[k + 1][1]), lin(stops[k][0], stops[k + 1][0], y)); col.set([c.r, c.g, c.b], i * 3); }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3)); scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }))); }
scene.add(new THREE.HemisphereLight("#e6f6ff", "#ffc9b8", 2.1));
const sunLight = new THREE.DirectionalLight("#fff0d2", 2.5); sunLight.position.set(7, 14, -2); sunLight.castShadow = true;
Object.assign(sunLight.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 }); sunLight.shadow.mapSize.set(2048, 2048); sunLight.shadow.bias = -0.0004; sunLight.shadow.normalBias = 0.04; sunLight.shadow.radius = 5;
scene.add(sunLight, sunLight.target);

// ---------- the floating island: an icosphere pressed flat on a height function on top, pulled to a jagged point below ----------
const R = 7.5, hills = [[-4.7, -2.4, 1.5, 2.1], [4.7, 2.6, 0.8, 1.7], [2.2, -5.6, 0.6, 1.4]];
function groundY(x, z) { const r2 = (x * x + z * z) / (R * R), edge = Math.min(1, Math.max(0, 1 - r2) * 4); let y = 0.55 * Math.sqrt(Math.max(0, 1 - r2)); for (const h of hills) y += h[2] * Math.exp(-((x - h[0]) ** 2 + (z - h[1]) ** 2) / (h[3] * h[3])) * edge; return y; }
function islandGeo(rad, depth, ground) {
  const g = warp(new THREE.IcosahedronGeometry(1, 7), (v) => { const x = v.x, y = v.y, z = v.z;
    if (y >= 0) { v.x = x * rad; v.z = z * rad; v.y = ground(v.x, v.z) + 0.07 * wob(x * 3, 0, z * 3) * Math.min(1, y * 5); }
    else { const k = -y, n = wob(x * 2, y * 2, z * 2); v.x = x * rad * (1 - 0.32 * k) * (1 + 0.1 * n * k); v.z = z * rad * (1 - 0.32 * k) * (1 + 0.1 * n * k); v.y = -Math.pow(k, 1.25) * depth * (1 + 0.3 * wob(z * 3, x * 3, y)); } });
  return P(g, (c, n) => { const k = jr();
    if (c.y > -0.12 * (rad / R) && n.y > 0.25) return n.y < 0.86 ? pick([C.grassD, C.grassB], k) : pick([C.grassA, C.grassB, C.grassC, C.grassA], k);
    if (c.y > -depth * 0.2) return pick([C.earthA, C.earthB], k);
    return c.y > -depth * 0.55 ? pick([C.rockA, C.rockB], k) : pick([C.rockB, C.rockC], k); }, null, 0.05);
}
const isle = new THREE.Group(); scene.add(isle); isle.add(mesh([islandGeo(R, 8.5, groundY)], { cast: false }));
const sr = rng(21);
const pine = (x, z, s) => { const y = groundY(x, z) - 0.08, r = sr() * 6; return [P(new THREE.CylinderGeometry(0.09, 0.14, 0.7, 5), C.trunk, M({ p: [x, y + 0.35 * s, z], s })),
  P(new THREE.ConeGeometry(0.66, 0.95, 6), C.pineA, M({ p: [x, y + 1.0 * s, z], r: [0, r, 0], s })), P(new THREE.ConeGeometry(0.52, 0.85, 6), C.pineB, M({ p: [x, y + 1.5 * s, z], r: [0, r + 0.5, 0], s })), P(new THREE.ConeGeometry(0.36, 0.75, 6), C.pineC, M({ p: [x, y + 1.98 * s, z], r: [0, r + 1, 0], s }))]; };
const roundTree = (x, z, s, col) => { const y = groundY(x, z) - 0.08, blob = warp(new THREE.IcosahedronGeometry(0.75, 1), (v) => { v.multiplyScalar(1 + 0.16 * wob(v.x * 2 + x, v.y * 2, v.z * 2 + z)); v.y *= 0.88; });
  return [P(new THREE.CylinderGeometry(0.1, 0.16, 0.9, 5), C.trunk, M({ p: [x, y + 0.45 * s, z], s })), P(blob, col, M({ p: [x, y + 1.35 * s, z], r: [0, sr() * 6, 0], s }), 0.09)]; };
const rock = (x, z, s) => P(new THREE.DodecahedronGeometry(0.42, 0), pick([C.rockA, C.rockB, "#d6cbea"], sr()), M({ p: [x, groundY(x, z) + 0.1 * s, z], r: [sr() * 3, sr() * 3, 0], s: [s, s * 0.7, s] }), 0.08);
{ const parts = [];
  [[-5.6, -0.6, 1.25], [-4.4, -3.6, 1.1], [-3.6, -1.6, 0.9], [-5.9, 2.2, 1.0], [5.4, -1.4, 1.1], [5.9, 1.0, 0.95], [-3.3, -5.4, 1.0], [4.2, -4.6, 0.9], [-4.6, 4.6, 1.1], [3.6, 5.2, 1.0]].forEach((a) => parts.push(...pine(...a)));
  [[4.6, 3.2, 1.15, C.blossom], [5.6, 4.1, 0.85, C.blossomB], [-5.0, 0.9, 1.0, C.blossomB], [1.2, 6.0, 0.95, C.blossom]].forEach((a) => parts.push(...roundTree(...a)));
  [[2.9, 2.6, 1], [3.5, 2.2, 0.6], [-3.1, 4.9, 0.9], [4.9, -3.2, 0.8], [-0.4, -5.8, 0.9], [6.3, -0.3, 0.7]].forEach((a) => parts.push(rock(...a)));
  for (let i = 0; i < 70; i++) { const a = sr() * TAU, d = Math.sqrt(sr()) * (R - 0.9), x = Math.cos(a) * d, z = Math.sin(a) * d, s = 0.6 + sr() * 0.7;   // grass tufts
    parts.push(P(new THREE.ConeGeometry(0.09, 0.34, 4), pick([C.grassD, C.grassB, "#6fcf97"], sr()), M({ p: [x, groundY(x, z) + 0.12 * s, z], r: [(sr() - 0.5) * 0.4, sr() * 3, (sr() - 0.5) * 0.4], s }), 0.05)); }
  isle.add(mesh(parts)); }
const flowers = [];   // flowers sway, each with its own phase; they stay separate meshes
for (let i = 0; i < 9; i++) { const a = i * 2.3, d = 1.2 + (i % 4) * 0.9, x = 1.5 + Math.cos(a) * d, z = 1.5 + Math.sin(a) * d, col = [C.coral, C.blossom, C.sun][i % 3];
  const parts = [P(new THREE.CylinderGeometry(0.03, 0.04, 0.55, 4), C.grassD, M({ p: [0, 0.27, 0] })), P(new THREE.OctahedronGeometry(0.2, 0), col, M({ p: [0, 0.6, 0], s: [1, 0.5, 1] })), P(new THREE.IcosahedronGeometry(0.09, 0), C.sun, M({ p: [0, 0.64, 0] }))];
  const f = mesh(parts, { receive: false }); f.position.set(x, groundY(x, z) - 0.02, z); f.userData.ph = i * 1.7; isle.add(f); flowers.push(f); }

// ---------- sun (a prop; faceted icosahedron with a cone on each corner), clouds and mini islands for depth ----------
const sun = new THREE.Group();
{ const parts = [P(new THREE.IcosahedronGeometry(1, 1), C.sun, null, 0.08)], pp = new THREE.IcosahedronGeometry(1, 0).attributes.position, seen = new Set(), up = v3(0, 1, 0);
  for (let i = 0; i < pp.count; i++) { const d = new V3().fromBufferAttribute(pp, i).normalize(), key = d.toArray().map((x) => x.toFixed(2)).join(); if (seen.has(key)) continue; seen.add(key);
    parts.push(P(new THREE.ConeGeometry(0.2, 0.62, 4), C.sunB, new THREE.Matrix4().compose(d.clone().multiplyScalar(1.5), new THREE.Quaternion().setFromUnitVectors(up, d), v3(1, 1, 1)), 0.06)); }
  const body = new THREE.Mesh(mergeGeometries(parts), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, emissive: "#ffb84a", emissiveIntensity: 0.55, roughness: 0.9, fog: false }));
  sun.add(body); sun.userData.body = body; sun.position.set(14, 15, -26); sun.scale.setScalar(2.2); scene.add(sun); }
const clouds = [];
function cloud(x, y, z, s, seed) { const r = rng(seed), parts = []; for (let i = 0; i < 5; i++) { const b = warp(new THREE.IcosahedronGeometry(0.8 + r() * 0.7, 1), (v) => { v.y *= 0.72; }); parts.push(P(b, (c, n) => (n.y < -0.25 ? "#ffd9e6" : "#ffffff"), M({ p: [(i - 2) * 0.95 + r() * 0.4, r() * 0.5, r() * 0.9] }), 0.02)); }
  const m = mesh(parts, { cast: false, receive: false }); m.position.set(x, y, z); m.scale.setScalar(s); m.userData = { x, ph: seed }; scene.add(m); clouds.push(m); }
[[-10, 6, -16, 1.6], [9, 9.5, -22, 2.0], [-6, -5, -9, 1.3], [8, -6.5, -4, 1.5], [12, 2, -10, 1.2], [-13, 0, -4, 1.4], [0, 13, -26, 2.4], [-9, -9, 4, 1.6], [5, -11, 3, 1.9], [13, -3, 8, 1.3], [-12, 7, 9, 1.5], [-4, -12, -8, 2.0]].forEach((a, i) => cloud(...a, 40 + i));
const minis = [];
function mini(x, y, z, rad, seed) { const g = new THREE.Group(), gy = (a, b) => 0.3 * Math.sqrt(Math.max(0, 1 - (a * a + b * b) / (rad * rad)));
  g.add(mesh([islandGeo(rad, rad * 1.5, gy), P(new THREE.CylinderGeometry(0.08, 0.12, 0.6, 5), C.trunk, M({ p: [0.2, 0.5, 0] })), P(new THREE.ConeGeometry(0.55, 0.9, 6), C.pineA, M({ p: [0.2, 1.1, 0] })), P(new THREE.ConeGeometry(0.4, 0.75, 6), C.pineC, M({ p: [0.2, 1.6, 0] }))]));
  g.position.set(x, y, z); g.userData = { y, ph: seed }; scene.add(g); minis.push(g); }
mini(-9.5, -2.5, -7, 1.7, 3); mini(10, 3.5, -9, 1.4, 5); mini(7.5, -7, 5, 1.2, 8); mini(-8.5, -8.5, 1, 1.5, 11);

// ---------- the hero: 3 solids and a few thin parts (replace with your own creature or object) ----------
const hero = new THREE.Group();
{ const body = mesh([P(warp(new THREE.IcosahedronGeometry(0.62, 1), (v) => { v.x *= 1.25; v.y *= 0.9; }), (c) => (Math.sin(c.x * 9) > 0.1 ? C.heroB : C.hero), null, 0.07), P(new THREE.IcosahedronGeometry(0.4, 1), C.hero, M({ p: [0.78, 0.18, 0] }), 0.07),
    P(new THREE.IcosahedronGeometry(0.07, 0), C.plum, M({ p: [1.08, 0.3, 0.16] })), P(new THREE.IcosahedronGeometry(0.07, 0), C.plum, M({ p: [1.08, 0.3, -0.16] })), P(new THREE.ConeGeometry(0.1, 0.3, 4), C.coral, M({ p: [1.22, 0.1, 0], r: [0, 0, -1.57] }))]);
  hero.add(body);
  const wing = (z) => { const m = mesh([P(warp(new THREE.OctahedronGeometry(0.5, 0), (v) => { v.y *= 0.12; v.x *= 0.7; }), "#eaf6ff", M({ p: [0, 0, z * 0.5] }), 0.02)], { cast: false }); m.position.set(0.1, 0.5, z * 0.3); m.userData.z = z; hero.add(m); return m; };
  hero.userData.wings = [wing(1), wing(-1)]; }
hero.scale.setScalar(0.62); isle.add(hero);
const heroPos = (t) => { const a = t * 0.55; return v3(Math.cos(a) * 3.2 + 1.5, groundY(Math.cos(a) * 3.2 + 1.5, Math.sin(a) * 3.2 + 1.5) + 1.3 + 0.25 * Math.sin(t * 2.3), Math.sin(a) * 3.2 + 1.5); };

// ---------- cameras: shots { t, F (focus point or function of t), dir (from focus to camera), D (distance), off (push the focus up) } blended with inOutCubic ----------
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 900);
const n3 = (x, y, z) => v3(x, y, z).normalize(), isleY = (t) => 0.1 * Math.sin(t * 0.9), heroWorld = (t) => heroPos(t).add(v3(0, isleY(t), 0));
const SHOTS = [
  { t: 0.0, F: heroWorld, dir: n3(0.5, 0.2, -0.85), D: 5.2, off: 0.05 },     // hero close-up, the subject is 50 to 60% of the width
  { t: 3.0, F: heroWorld, dir: n3(0.8, 0.24, -0.6), D: 4.6, off: 0.05 },     // follow and orbit
  { t: 7.0, F: v3(0.2, 0.4, -0.4), dir: n3(0.4, 0.5, 0.78), D: 27, off: 0.0 }, // pull out: the island is 85 to 90% of the width
  { t: T + 0.2, F: v3(0, 0.2, -0.4), dir: n3(-0.14, 0.42, 0.9), D: 33, off: 0.0 },
];
function camAt(t) { let i = 0; while (i < SHOTS.length - 2 && t >= SHOTS[i + 1].t) i++;
  const a = SHOTS[i], b = SHOTS[i + 1], e = inOutCubic(lin(a.t, b.t, t)), Fa = typeof a.F === "function" ? a.F(t) : a.F, Fb = typeof b.F === "function" ? b.F(t) : b.F;
  const dir = new V3().lerpVectors(a.dir, b.dir, e).normalize(); dir.x += 0.012 * Math.sin(t * 0.83); dir.y += 0.009 * Math.cos(t * 0.61); dir.normalize();   // small handheld drift
  const F = new V3().lerpVectors(Fa, Fb, e), D = Math.exp(lerp(Math.log(a.D), Math.log(b.D), e)), off = lerp(a.off, b.off, e);
  cam.position.copy(F).addScaledVector(dir, D); cam.up.set(0, 1, 0); cam.lookAt(F); cam.near = Math.max(0.03, D * 0.03);
  if (off) cam.setViewOffset(W, H, 0, Math.round(off * H), W, H); else cam.clearViewOffset(); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true); }

// ---------- DOM: a tag that follows a 3D point (square plate, hard shadow) ----------
const tag = document.getElementById("tg-a"), _p = new V3();
function placeTag(alpha, pos) { _p.copy(pos).project(cam); const x = (_p.x * 0.5 + 0.5) * W, y = (-_p.y * 0.5 + 0.5) * H; tag.style.opacity = alpha.toFixed(3); tag.style.transform = `translate(${x.toFixed(1)}px, ${(y - 70).toFixed(1)}px) scale(${(0.8 + 0.2 * backOut(clamp(alpha))).toFixed(3)})`; }

// ---------- the frame: a PURE FUNCTION of t ----------
function render(t) {
  t = clamp(t, 0, T); isle.position.y = isleY(t);
  sun.userData.body.rotation.set(t * 0.12, t * 0.2, t * 0.07);
  for (const c of clouds) c.position.x = c.userData.x + 1.4 * Math.sin(t * 0.07 + c.userData.ph) + t * 0.05;
  for (const m of minis) { m.position.y = m.userData.y + 0.25 * Math.sin(t * 0.6 + m.userData.ph); m.rotation.y = t * 0.05 + m.userData.ph; }
  for (const f of flowers) { f.rotation.z = 0.07 * Math.sin(t * 1.6 + f.userData.ph); f.rotation.x = 0.05 * Math.sin(t * 1.3 + f.userData.ph * 2); }
  const p = heroPos(t), q = heroPos(t + 0.05), d = q.clone().sub(p).normalize();
  hero.position.copy(p); hero.rotation.y = Math.atan2(-d.z, d.x); hero.rotation.z = 0.12 * Math.sin(t * 2.1);
  hero.userData.wings.forEach((w) => { w.rotation.x = w.userData.z * (0.6 + 0.5 * Math.sin(t * 2 * Math.PI * 9)); });   // flap at 9 Hz (faster aliases at 30 fps)
  camAt(t);
  renderer.setViewport(0, 0, W, H); renderer.render(scene, cam);
  placeTag(sm(1.0, 1.4, t) * (1 - sm(5.2, 5.6, t)), heroWorld(t).add(v3(0, 0.9, 0)));
}

// ---------- drive it from the vfrey timeline (modifiers runs on every seek); errors show on screen ----------
function showError(e) { let d = document.getElementById("errbox"); if (!d) { d = document.createElement("div"); d.id = "errbox"; d.style.cssText = "position:absolute;left:20px;right:20px;top:36%;font:28px monospace;color:#0f0;background:#000;z-index:99;padding:12px"; document.getElementById("root").appendChild(d); } d.textContent = "3D scene error: " + e.message + " " + ((e.stack || "").split("\n")[1] || ""); }
const proxy = { t: 0 };
tl.to(proxy, { t: T, duration: T, ease: "none", modifiers: { t: (v) => { try { render(parseFloat(v)); } catch (e) { showError(e); } return v; } } }, 0);
try { render(0); } catch (e) { showError(e); }
