// Starter for a real 3D (three.js / WebGL) scene in vfrey (vfrey-style-real-3d). It is a working film skeleton, not a template:
// keep the plumbing (renderer, the timeline-driven loop, the error box, sky, bloom, the shot camera, DOM tags) and replace the
// subjects, the shots and the cues with your own. Copy it with glsl.js into src/<idea>/, then bundle (see helpers.md):
//   npx esbuild src/<idea>/scene.js --bundle --format=iife --minify --outfile=scenes/<idea>/scene3d.js
// index.html makes `tl` (vfrey.timeline()) and the captions before it loads the bundle; `vfrey`, `gsap` and `tl` are globals here.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import * as G from "./glsl.js";

const V3 = THREE.Vector3, v3 = (x, y, z) => new V3(x, y, z);
const W = vfrey.frame.width, H = vfrey.frame.height, T = vfrey.timing.durationSec, WORDS = vfrey.timing.words;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const inOutCubic = (s) => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);
const inOutQuart = (s) => (s < 0.5 ? 8 * s * s * s * s : 1 - Math.pow(-2 * s + 2, 4) / 2);
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- cues: the start of spoken words, found by their text, in order. Never hard-code seconds: the real voice moves them. ----------
const KEYS = vfrey.script.lines.map((line) => line.split(/\s+/)[0]);   // here: the first word of each script line; name your own key words
const ST = []; { let from = 0; const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  for (const k of KEYS) { let i = from; while (i < WORDS.length && norm(WORDS[i].text) !== norm(k)) i++; if (i >= WORDS.length) i = Math.min(from, WORDS.length - 1); ST.push(WORDS[i].start); from = i + 1; } }
const S = (i) => ST[Math.min(i, ST.length - 1)];

// ---------- renderer: one canvas, pixel ratio 1, preserveDrawingBuffer so the frame grab is never blank ----------
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.setClearColor(0x000004, 1); renderer.autoClear = false;
const RES = new THREE.Vector2(W, H);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.001, 1e9);

// ---------- sky: seeded star points and a faint noise band, drawn behind everything ----------
function makeSky(seed, nebK) {
  const r = rng(seed), N = 14000, pos = new Float32Array(N * 3), size = new Float32Array(N), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const z = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - z * z); pos.set([s * Math.cos(a), z, s * Math.sin(a)], i * 3);
    const m = Math.pow(r(), 5), tmp = r(), c = tmp < 0.3 ? [0.75, 0.85, 1] : tmp < 0.75 ? [1, 1, 1] : [1, 0.85, 0.7], b = 0.35 + m * 0.65 + r() * 0.15;
    size[i] = 1.1 + m * 3.6; col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1)); geo.setAttribute("aCol", new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(geo, new THREE.ShaderMaterial({ vertexShader: G.SKY_VS, fragmentShader: G.SKY_FS, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  const neb = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.ShaderMaterial({ vertexShader: G.NEB_VS, fragmentShader: G.NEB_FS, uniforms: { uK: { value: nebK } }, side: THREE.BackSide, depthTest: false, depthWrite: false }));
  stars.frustumCulled = neb.frustumCulled = false; stars.renderOrder = -9; neb.renderOrder = -10;
  const g = new THREE.Group(); g.add(neb, stars); return g;
}
scene.add(makeSky(11, 0.8));

// ---------- subjects: one shader material for lit bodies, an animated star, glow billboards ----------
const sphereGeo = new THREE.SphereGeometry(1, 128, 96);
const lit = [];   // every material that needs the light direction and the time
function bodyMat(type, colA, colB, amb = 0.012) {
  const m = new THREE.ShaderMaterial({ vertexShader: G.BODY_VS, fragmentShader: G.BODY_FS,
    uniforms: { uLight: { value: v3(1, 0, 0) }, uTime: { value: 0 }, uType: { value: type }, uAmb: { value: amb }, uA: { value: new THREE.Color(...colA) }, uB: { value: new THREE.Color(...colB) } } });
  lit.push(m); return m;
}
function atmo(color, k, pow = 3.0, scale = 1.045) {
  const m = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({ vertexShader: G.BODY_VS, fragmentShader: G.ATMO_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uLight: { value: v3(1, 0, 0) }, uColor: { value: new THREE.Color(...color) }, uK: { value: k }, uPow: { value: pow } } }));
  m.scale.setScalar(scale); lit.push(m.material); return m;
}
const glows = [];
function glow(color, worldR, minPx, k = 1, pow = 2.2, rays = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: G.GLOW_VS, fragmentShader: G.GLOW_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uRes: { value: RES }, uWorldR: { value: worldR }, uMinPx: { value: minPx }, uColor: { value: new THREE.Color(...color) }, uK: { value: k }, uPow: { value: pow }, uAlpha: { value: 1 }, uRays: { value: rays }, uTime: { value: 0 } } }));
  m.frustumCulled = false; glows.push(m); return m;
}
// constant-width lines (plain GL lines are 1 px and vanish in compression): orbits, roads, links
function line(points, color, widthPx, alpha = 1) {
  const g = new LineGeometry(); g.setPositions(points.flatMap((p) => [p.x, p.y, p.z]));
  const m = new LineMaterial({ color, linewidth: widthPx, transparent: true, opacity: alpha, depthWrite: false }); m.resolution.set(W, H);
  const l = new Line2(g, m); l.frustumCulled = false; return l;
}

// The demo cast: a star (the light), a living world with air, and its orbit. Replace with your subjects.
const LIGHT_POS = v3(0, 0, 0);
const star = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({ vertexShader: G.BODY_VS, fragmentShader: G.STAR_BODY_FS, uniforms: { uTime: { value: 0 } } }));
scene.add(star, glow([1.0, 0.62, 0.22], 3.4, 30, 0.7, 2.4, 0.6));
const WORLD_POS = v3(14, 0, 0);
const world = new THREE.Mesh(sphereGeo, bodyMat(0, [0.03, 0.2, 0.46], [0.1, 0.34, 0.08])); world.position.copy(WORLD_POS); world.add(atmo([0.3, 0.55, 1.0], 1.4));
scene.add(world);
{ const pts = []; for (let i = 0; i <= 256; i++) { const a = (i / 256) * Math.PI * 2; pts.push(v3(14 * Math.cos(a), 0, -14 * Math.sin(a))); } scene.add(line(pts, 0x7fa8ff, 2.2, 0.5)); }
// three.js's own lit materials work too (MeshStandardMaterial with a PointLight at LIGHT_POS) for built objects such as boxes and props.

// dust: two wrap-around layers, visible only when the camera moves fast
function makeDust(seed, n, B) {
  const r = rng(seed), base = new Float32Array(n * 6), end = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { const x = r(), y = r(), z = r(); base.set([x, y, z, x, y, z], i * 6); end[i * 2 + 1] = 1; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 6), 3)); g.setAttribute("aBase", new THREE.BufferAttribute(base, 3)); g.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
  const m = new THREE.LineSegments(g, new THREE.ShaderMaterial({ vertexShader: G.DUST_VS, fragmentShader: G.DUST_FS, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uCam: { value: new V3() }, uB: { value: B }, uStreak: { value: new V3() }, uAlpha: { value: 0 } } }));
  m.frustumCulled = false; m.renderOrder = 5; scene.add(m); return { m, B };
}
const dust = [makeDust(5, 900, 3), makeDust(9, 900, 80)];

// ---------- bloom: a 4x MSAA half-float target (without MSAA the edges alias); no OutputPass, the shaders output display colours ----------
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera)); composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.5, 0.6, 0.92));   // strength, radius, threshold

// ---------- camera shots: { t, F focus, dir focus-to-camera, D distance }, in increasing time ----------
const shots = [];
const shot = (t, F, dir, D, ease) => shots.push({ t, F, dir: dir.clone().normalize(), D, ease });
// At a 40 degree vertical field of view a tall frame shows 0.409 * D across and 0.728 * D up: pick D from the subject's size.
shot(0, LIGHT_POS, v3(0.3, 0.12, 1), 7.5);                                  // open close on the star
shot(S(1) - 0.4, LIGHT_POS, v3(-0.05, 0.1, 1), 9.5, inOutCubic);            // slow drift while line 0 is spoken
shot(S(1) + 1.6, WORLD_POS, v3(-0.8, 0.15, 0.58), 6.4, inOutQuart);         // fly to the world (keep a component toward the light, or you film the night side)
shot(S(2) - 0.1, WORLD_POS, v3(-0.4, 0.22, 0.9), 6.0, inOutCubic);          // hold, drifting
shot(S(2) + 2.2, v3(0, 0, 0), v3(0, 0.78, 0.63), 60, inOutQuart);           // pull out to the whole system
shot(T, v3(0, 0, 0), v3(0, 0.74, 0.67), 64, inOutCubic);
function shotAt(t) {
  let i = 0; while (i < shots.length - 2 && t >= shots[i + 1].t) i++;
  const a = shots[i], b = shots[i + 1], e = (b.ease || inOutCubic)(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
  const dir = new V3().lerpVectors(a.dir, b.dir, e); dir.x += 0.03 * Math.sin(t * 0.83); dir.y += 0.022 * Math.cos(t * 0.61); dir.z += 0.02 * Math.sin(t * 0.47 + 1);   // handheld drift: never lock off
  return { F: new V3().lerpVectors(a.F, b.F, e), dir: dir.normalize(), D: Math.exp(lerp(Math.log(a.D), Math.log(b.D), e)) * (1 + 0.012 * Math.sin(t * 0.9)) };   // distance moves geometrically
}
const camPos = (sh) => sh.F.clone().addScaledVector(sh.dir, sh.D);
const VIEW_SHIFT_Y = 0.06;   // push the world's centre up into the hero zone, above the caption band

// ---------- DOM tags that follow 3D points (square plates beside the object, never on it) ----------
const tags = [];
function tag(id, text, getPos, t0, t1, radius = 0) { const el = document.getElementById(id); el.textContent = text; tags.push({ el, getPos, t0, t1, radius }); }
const _p = new V3();
function project(pos) { _p.copy(pos).project(camera); return { x: (_p.x * 0.5 + 0.5) * W, y: (-_p.y * 0.5 + 0.5) * H, z: _p.z }; }
tag("tg-a", "THE STAR", () => v3(0, 1.15, 0), 0.6, S(1) - 0.2);
tag("tg-b", "THE WORLD", () => WORLD_POS, S(1) + 1.6, S(2), 1);

// ---------- the frame function: everything on screen is a pure function of t ----------
const lightView = new V3(), hudLab = document.getElementById("hud-lab"), hudVal = document.getElementById("hud-val");
function render(t) {
  t = clamp(t, 0, T);
  const sh = shotAt(t);
  camera.position.copy(camPos(sh)); camera.up.set(0, 1, 0); camera.lookAt(sh.F);
  camera.near = Math.max(1e-4, sh.D * 0.02); camera.far = Math.max(sh.D * 6e4, 2e3);
  camera.setViewOffset(W, H, 0, Math.round(VIEW_SHIFT_Y * H), W, H);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  // subjects
  star.material.uniforms.uTime.value = t; star.rotation.y = t * 0.03; world.rotation.y = t * 0.14;
  for (const g of glows) g.material.uniforms.uTime.value = t;
  for (const m of lit) {   // light direction in view space, per body
    if (m.uniforms.uTime) m.uniforms.uTime.value = t;
    lightView.copy(LIGHT_POS).sub(WORLD_POS).normalize().transformDirection(camera.matrixWorldInverse); m.uniforms.uLight.value.copy(lightView);
  }
  // dust streaks from the camera's velocity, computed from the shots (no previous-frame state)
  const vel = camera.position.clone().sub(camPos(shotAt(Math.max(0, t - 0.04)))).divideScalar(0.04);
  for (const d of dust) { const u = d.m.material.uniforms, streak = vel.clone().multiplyScalar(0.05); if (streak.length() > d.B * 0.35) streak.setLength(d.B * 0.35);
    u.uCam.value.copy(camera.position); u.uStreak.value.copy(streak); u.uAlpha.value = sm(0.15, 1.2, vel.length() / d.B) * 0.9; }
  // tags
  for (const g of tags) { const a = sm(g.t0, g.t0 + 0.3, t) * (1 - sm(g.t1 - 0.3, g.t1, t)); g.el.style.opacity = String(a); if (a < 0.01) continue;
    const pos = g.getPos(), pr = project(pos), edge = g.radius ? Math.abs(project(pos.clone().add(v3(0, g.radius, 0))).y - pr.y) : 0;
    const x = Math.min(pr.x + edge + 18, W - g.el.offsetWidth - 24);   // beside the object, and never off the right edge
    g.el.style.transform = `translate(${x.toFixed(1)}px, ${(pr.y - edge * 0.6).toFixed(1)}px)`; }
  // HUD: a label and a number computed from the scene (here, how far the camera's focus is from the light), never typed in
  hudLab.textContent = "FROM THE STAR"; hudVal.textContent = sh.F.distanceTo(LIGHT_POS).toFixed(1) + " u";
  renderer.clear(); composer.render();
}

// ---------- drive it from the vfrey timeline. `modifiers` runs on every seek; a tween callback does not fire on a seek. ----------
function showError(e) {   // a throw would leave the last good canvas up and look like frozen frames: put the error on screen instead
  let d = document.getElementById("errbox");
  if (!d) { d = document.createElement("div"); d.id = "errbox"; d.style.cssText = "position:absolute;left:20px;right:20px;top:36%;font:28px monospace;color:#0f0;background:#000;z-index:99;padding:12px"; document.getElementById("root").appendChild(d); }
  d.textContent = "3D scene error: " + e.message + " " + ((e.stack || "").split("\n")[1] || "");
}
const proxy = { t: 0 };
tl.to(proxy, { t: T, duration: T, ease: "none", modifiers: { t: (v) => { try { render(parseFloat(v)); } catch (e) { showError(e); } return v; } } }, 0);
try { render(0); } catch (e) { showError(e); }
