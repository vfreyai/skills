# Isometric miniature world: code to copy

Paste the blocks you need into `scenes/<idea>/index.html`, then build your own objects from them. World coordinates are 3D units; `P` turns them into SVG units inside a `0 0 1080 1920` viewBox (a drawing space, not pixels: the SVG scales to the frame). `tl` is `vfrey.timeline()`.

## Page shell

```html
<style>
  #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Google Sans Flex", sans-serif; }
  #stage, #macro { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
  #macro { clip-path: circle(0px at 50% 36%); }                     /* the iris stage */
  .lit-core { stroke-width: var(--lw, 3); } .lit-glow { stroke-width: calc(var(--lw, 3) * 3.4); }
  #topfade { position: absolute; left: 0; right: 0; top: 0; height: 18%; background: linear-gradient(to bottom, rgba(8,12,28,.82), rgba(8,12,28,0)); }
  #botfade { position: absolute; left: 0; right: 0; bottom: 0; height: 44%; background: linear-gradient(to bottom, rgba(8,12,28,0), rgba(8,12,28,.55) 42%, rgba(8,12,28,.78)); }
  #captions { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-right); top: var(--vf-caption-at); height: var(--vf-caption-h); }
</style>
<div id="root" data-composition-id="main" data-start="0">
  <svg id="stage" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="gBg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#22346b"/><stop offset=".55" stop-color="#121c3d"/><stop offset="1" stop-color="#090e1e"/></radialGradient>
      <radialGradient id="gVig" cx="50%" cy="40%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
      <linearGradient id="gSh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
      <radialGradient id="gGlow"><stop offset="0" stop-color="#fff4cf"/><stop offset=".12" stop-color="#ffd36b" stop-opacity=".95"/><stop offset=".35" stop-color="#ffb02e" stop-opacity=".4"/><stop offset="1" stop-color="#ff9a1f" stop-opacity="0"/></radialGradient>
      <radialGradient id="gPool"><stop offset="0" stop-color="#ffc552" stop-opacity=".5"/><stop offset="1" stop-color="#ffc552" stop-opacity="0"/></radialGradient>
      <linearGradient id="gEarth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a7a53"/><stop offset="1" stop-color="#4a382a"/></linearGradient>
    </defs>
    <rect width="1080" height="1920" fill="url(#gBg)"/><g id="stars"></g>
    <g id="cam"><g id="world"></g></g>
    <rect width="1080" height="1920" fill="url(#gVig)"/>
  </svg>
  <svg id="macro" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice"><!-- its own ground, #mcam > #mworld --></svg>
  <div id="topfade"></div><div id="botfade"></div><div id="captions"></div>
</div>
```

## Projection, faces, shadow, tile

```js
const C = 0.866025, S = 0.5;
const P = (x, y, z = 0) => [(x - y) * C, (x + y) * S - z];           // the ONE projection
const f1 = (n) => (Math.round(n * 10) / 10).toString();
const pts = (a) => a.map((p) => f1(p[0]) + "," + f1(p[1])).join(" ");
function rng(seed) { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shade(h, f) { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).map((v) => f <= 1 ? v * f : v + (255 - v) * (f - 1)); return "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join(""); }
function poly3(p3, fill, extra = "") { return `<polygon points="${pts(p3.map((p) => P(...p)))}" fill="${fill}" stroke="${fill}" stroke-width=".7" stroke-linejoin="round" ${extra}/>`; }
function overlay(p3) { return `<polygon points="${pts(p3.map((p) => P(...p)))}" fill="url(#gSh)"/>`; }
function box(x, y, z, w, d, h, base, o = {}) {                       // three visible faces from one base colour
  const R = [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]];
  const Lf = [[x, y + d, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x, y + d, z]];
  const Tp = [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]];
  return poly3(R, shade(base, .62)) + overlay(R) + poly3(Lf, shade(base, .84)) + overlay(Lf) + poly3(Tp, shade(base, 1.16)) +
    `<polyline points="${pts([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y, z + h)])}" fill="none" stroke="#fff" stroke-opacity="${o.edge ?? .28}" stroke-width=".9" stroke-linejoin="round"/>`;
}
function pyramid(x, y, z, w, d, h, base) { const a = [x + w / 2, y + d / 2, z + h]; return poly3([[x + w, y, z], [x + w, y + d, z], a], shade(base, .62)) + poly3([[x, y + d, z], [x + w, y + d, z], a], shade(base, .98)); }
function roof(x, y, z, w, d, h, base) {
  const Lf = [[x - 3, y + d + 3, z], [x + w + 3, y + d + 3, z], [x + w + 3, y + d / 2, z + h], [x - 3, y + d / 2, z + h]];
  const R = [[x + w + 3, y - 3, z], [x + w + 3, y + d + 3, z], [x + w + 3, y + d / 2, z + h]];
  const Bk = [[x - 3, y - 3, z], [x + w + 3, y - 3, z], [x + w + 3, y + d / 2, z + h], [x - 3, y + d / 2, z + h]];
  return poly3(Bk, shade(base, 1.1)) + poly3(Lf, base) + overlay(Lf) + poly3(R, shade(base, .66));
}
// flat 2D art ON a face: u across, v down from the top edge. LF = the +y (left) face, RF = the +x (right) face, mirrored (no text)
function LF(x, y, z, w, d, h, inner, clip) { const e = (x - y - d) * C, f = (x + y + d) * S - z - h; return `<g transform="matrix(${C} ${S} 0 1 ${f1(e)} ${f1(f)})" ${clip ? `clip-path="url(#${clip})"` : ""}>${inner}</g>`; }
function RF(x, y, z, w, d, h, inner) { const e = (x + w - y) * C, f = (x + w + y) * S - z - h; return `<g transform="matrix(${-C} ${S} 0 1 ${f1(e)} ${f1(f)})">${inner}</g>`; }
// circles in the (y,z) plane at x (pipe ends, cable slices): <g transform="matrix(-C S 0 -1 e f)"> with e=(x-y0)*C, f=(x+y0)*S-z0
function hull(q) { q = q.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; for (const p of q) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); } for (const p of q.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); }
function shadow(x, y, w, d, h, z = 0) {                              // soft, no filter; light from the upper left
  const dx = h * .9, dy = -h * .2, q = [];
  for (const [a, b] of [[x, y], [x + w, y], [x + w, y + d], [x, y + d]]) q.push(P(a, b, z), P(a + dx, b + dy, z));
  const hp = pts(hull(q));
  return `<polygon points="${hp}" fill="#000" fill-opacity=".10" stroke="#000" stroke-opacity=".05" stroke-width="16" stroke-linejoin="round"/><polygon points="${hp}" fill="#000" fill-opacity=".18" stroke="#000" stroke-opacity=".10" stroke-width="7" stroke-linejoin="round"/>`;
}
function earth(wd, th, seed) { const r = rng(seed); let s = `<rect width="${wd}" height="${th}" fill="url(#gEarth)"/><rect width="${wd}" height="9" fill="#43805a"/>`; for (let i = 0; i < wd / 14; i++) s += `<ellipse cx="${f1(r() * wd)}" cy="${f1(14 + r() * (th - 16))}" rx="${f1(1.5 + r() * 2.5)}" ry="${f1(1 + r() * 1.6)}" fill="#fff" fill-opacity="${f1(.06 + r() * .1)}"/>`; return s; }
function tile(x, y, w, d, th, topCol, seed) {                        // a slab with its earth section showing
  return shadow(x - 4, y - 4, w + 8, d + 8, 5, -th) + poly3([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, -th], [x + w, y, -th]], "#4a392b") +
    RF(x, y, -th, w, d, th, earth(d, th, seed + 1)) + LF(x, y, -th, w, d, th, earth(w, th, seed)) + poly3([[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]], topCol) +
    `<polyline points="${pts([P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y, 0)])}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>`;
}
const tree = (x, y, s = 1, c = "#3c8a63") => shadow(x - 6 * s, y - 6 * s, 12 * s, 12 * s, 34 * s) + box(x - 3, y - 3, 0, 6, 6, 12 * s, "#6b4a30", { edge: .1 }) + pyramid(x - 15 * s, y - 15 * s, 8 * s, 30 * s, 30 * s, 30 * s, c) + pyramid(x - 11 * s, y - 11 * s, 22 * s, 22 * s, 22 * s, 26 * s, shade(c, 1.12));
const house = (x, y, w, d, h, base, roofc) => shadow(x, y, w, d, h + 20) + box(x, y, 0, w, d, h, base) + LF(x, y, 0, w, d, h, `<rect x="10" y="${h * .35}" width="14" height="${h * .35}" fill="#ffd47a" opacity=".9"/>`) + roof(x, y, h, w, d, 22, roofc);
```

## Timing from sentences

```js
const WORDS = vfrey.timing.words, DUR = vfrey.timing.durationSec, sents = [];
{ let cur = []; WORDS.forEach((w) => { cur.push(w); if (/[.!?]$/.test(w.text)) { sents.push(cur); cur = []; } }); if (cur.length) sents.push(cur); }
const sS = (i) => sents[i][0].start, sE = (i) => sents[i][sents[i].length - 1].end;   // beat i = sentence i
const wt = (t) => WORDS.find((w) => w.text.toLowerCase().startsWith(t));               // a key word: wt("garden").start
```

## Route, trails, marker

```js
const NS = "http://www.w3.org/2000/svg", world = document.querySelector("#world");
const legs = { a: [P(0, 0, 40), P(120, 0, 40), P(120, 200, 0)] /* , b: ... one array of projected points per leg, in travel order */ };
const dOf = (a) => "M" + a.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L");
const trails = {};
for (const k of Object.keys(legs)) {                                  // dim conduit first (dark 9px tube + 3px blue core), then the lit trail
  const g = document.createElementNS(NS, "g");
  g.innerHTML = `<path d="${dOf(legs[k])}" fill="none" stroke="#10172a" stroke-width="9" opacity=".85"/><path d="${dOf(legs[k])}" fill="none" stroke="#33466f" stroke-width="3"/>
    <path class="lit lit-glow" d="${dOf(legs[k])}" fill="none" stroke="#ffb02e" stroke-opacity=".28" stroke-linecap="round" stroke-linejoin="round"/><path class="lit lit-core" d="${dOf(legs[k])}" fill="none" stroke="#fff0c2" stroke-linecap="round" stroke-linejoin="round"/>`;
  world.appendChild(g); const ps = [...g.querySelectorAll(".lit")], len = ps[1].getTotalLength();
  ps.forEach((p) => { p.style.strokeDasharray = len + " " + (len + 10); p.style.strokeDashoffset = len + 4; });
  trails[k] = { ps, len, path: ps[1] };
}
const packet = document.createElementNS(NS, "g");                     // glow pool on the ground, glow, white core
packet.innerHTML = `<g><ellipse cy="14" rx="46" ry="16" fill="url(#gPool)"/><circle r="30" fill="url(#gGlow)"/><circle r="5" fill="#fff"/></g>`; world.appendChild(packet);
const paints = [];                                                    // every tween-driven paint, so a render can redraw them: onUpdate does not fire on a seek
vfrey.onFrame(() => paints.forEach((f) => f()));
function runLeg(name, a, b, ease = "power1.inOut") {                  // seconds a to b
  const tr = trails[name], o = { p: 0 };
  const paint = () => { const pt = tr.path.getPointAtLength(o.p * tr.len);
    packet.setAttribute("transform", `translate(${f1(pt.x)} ${f1(pt.y)})`); tr.ps.forEach((p) => (p.style.strokeDashoffset = tr.len * (1 - o.p) + 4)); };
  paints.push(paint);
  tl.fromTo(o, { p: 0 }, { p: 1, duration: b - a, ease, immediateRender: false, onUpdate: paint }, a);
}
```

## Camera glide and iris

```js
const CY = 800, cam = { fx: 0, fy: 0, k: 1 }, camG = document.querySelector("#cam"), starG = document.querySelector("#stars");
function applyCam() {
  camG.setAttribute("transform", `translate(540 ${CY}) scale(${cam.k.toFixed(4)}) translate(${f1(-cam.fx)} ${f1(-cam.fy)})`);
  camG.style.setProperty("--lw", (3.4 / Math.pow(cam.k, .6)).toFixed(2));                        // trail width holds at every zoom
  packet.firstChild.setAttribute("transform", `scale(${(1 / Math.pow(cam.k, .62)).toFixed(3)})`);  // so does the marker
  starG.setAttribute("transform", `translate(${f1(-cam.fx * .04)} ${f1(-cam.fy * .03)})`);        // parallax
}
const K = { open: { fx: -190, fy: 110, k: 2.2 }, wide: { fx: 740, fy: 575, k: 0.45 }, first: { fx: 0, fy: 60, k: 1.45 } /* focus = P(...) of each object */ };
Object.assign(cam, K.open); let prev = K.open; applyCam(); vfrey.onFrame(applyCam);   // onUpdate does not fire on a seek; onFrame does
function camTo(name, a, b, ease = "power2.inOut") { const to = K[name]; tl.fromTo(cam, { fx: prev.fx, fy: prev.fy, k: prev.k }, { fx: to.fx, fy: to.fy, k: to.k, duration: b - a, ease, onUpdate: applyCam, immediateRender: false }, a); prev = to; }
// camTo("wide", 0.35, 2.25); camTo("first", 2.5, sS(1) - .1, "power3.inOut"); runLeg("a", sS(1) + .1, sE(1));
const iris = (at, r0, r1, d = 0.8) => { const o = { r: r0 }, paint = () => { document.querySelector("#macro").style.clipPath = `circle(${o.r.toFixed(1)}px at 50% 36%)`; }; vfrey.onFrame(paint); tl.fromTo(o, { r: r0 }, { r: r1, duration: d, ease: "power2.inOut", immediateRender: false, onUpdate: paint }, at); };
// iris(t, 0, 1.2 * vfrey.frame.height) opens the macro stage; iris(t2, 1.2 * vfrey.frame.height, 0) closes it
vfrey.captions("#captions", { style: "box", font: '"Google Sans Flex", sans-serif', color: "#ffffff", highlight: "#ffbf3c", highlightText: "#0a0f20", maxWords: 4, stroke: "#0a0f20" });
```
