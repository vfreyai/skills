# Map documentary: code to copy

Paste the page shell, then the blocks as one `scene.js` (the shell loads it). Run `python3 make-textures.py --out scenes/<idea>` once (next to this file, standard library only) to write the three tileable textures the page uses: `paper.png`, `sea.png`, `grain.png`. Add them to `assets.json` as generated. `tl` is `vfrey.timeline()`. Coastlines are yours to draw by hand as `[lon, lat]` rings (1 to 3 degrees of accuracy is enough, no downloaded data); the demo below is two invented blobs.

## Page shell

```html
<!doctype html>
<!-- MAP DOCUMENTARY scene. A hand-drawn atlas: Mercator plane under a perspective camera (parallax: ground, clouds, labels),
     a route that draws itself with a plane and its shadow, then the same vertices morph into an orthographic globe.
     Everything visible is a pure function of the state SS (tweened by GSAP) and tl.time(); draw() repaints on every update. -->
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script>
<script src="vfrey/vfrey.js"></script>
<style>
  :root { --ink:#06101c; --gold:#efc063; --cream:#f6ead0; --red:#ff5a36; }
  html, body { margin:0; width:100%; height:100%; overflow:hidden; background:var(--ink); }
  #root { position:relative; width:100%; height:100%; overflow:hidden; background:var(--ink); font-family:"Google Sans Flex","Liberation Sans",Arial,sans-serif; color:var(--cream); }
  #stage { position:absolute; left:0; top:0; width:1080px; height:1920px; transform-origin:0 0; overflow:hidden; }
  #planeWrap { position:absolute; left:0; top:0; width:1080px; height:1920px; overflow:hidden; z-index:0; isolation:isolate; }
  #stage > *:not(#planeWrap) { z-index:5; will-change:transform; }
  #labels { position:absolute; left:0; top:0; }
  #plane { position:absolute; left:0; top:0; width:1px; height:1px; transform-origin:0 0; }
  svg.full { position:absolute; left:0; top:0; width:1080px; height:1920px; overflow:visible; pointer-events:none; }
  .mono { font-family:"JetBrains Mono","Liberation Mono",monospace; font-weight:500; }
  .lab { position:absolute; left:0; top:0; white-space:nowrap; opacity:0; transform-origin:50% 100%; }
  .city { font-family:"Playfair Display",Georgia,serif; font-style:italic; font-weight:700; font-size:54px; color:var(--cream); text-align:center;
          text-shadow:0 0 6px #06101c, 0 0 14px #06101c, 2px 2px 0 #06101c, -2px -2px 0 #06101c, 2px -2px 0 #06101c, -2px 2px 0 #06101c; }
  .city small { display:block; font-family:"JetBrains Mono",monospace; font-style:normal; font-weight:500; font-size:22px; letter-spacing:.08em; color:var(--gold); margin-top:2px; }
  .chip { font-family:"Google Sans Flex",sans-serif; font-weight:700; font-size:34px; letter-spacing:.02em; padding:8px 18px 9px 16px; background:rgba(6,16,28,.9); color:var(--cream); border-left:7px solid var(--gold); }
  .chip.red { border-left-color:var(--red); } .chip.cream { background:var(--cream); color:#10213a; border-left-color:#10213a; }
  .chip b { color:var(--gold); font-weight:800; } .chip.cream b { color:#b32a0e; }
  #hudT { position:absolute; left:60px; top:214px; font-size:25px; letter-spacing:.1em; color:var(--gold); text-shadow:0 0 8px #06101c, 0 0 2px #06101c; }
  #hudS { position:absolute; left:60px; top:252px; font-size:21px; letter-spacing:.14em; color:rgba(246,234,208,.8); text-shadow:0 0 8px #06101c; }
  #hudC { position:absolute; left:60px; top:288px; font-size:22px; letter-spacing:.06em; color:rgba(246,234,208,.75); text-shadow:0 0 8px #06101c; }
  #scaleBar { position:absolute; left:60px; top:1838px; height:40px; width:420px; }
  #vig { position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse 72% 62% at 50% 44%, rgba(2,6,14,0) 52%, rgba(2,6,14,.5) 100%); }
  #vigT { position:absolute; left:0; top:0; width:1080px; height:360px; pointer-events:none; background:linear-gradient(rgba(3,8,18,.78), rgba(3,8,18,0)); }
  #vigB { position:absolute; left:0; top:1500px; width:1080px; height:420px; pointer-events:none; background:linear-gradient(rgba(3,8,18,0), rgba(3,8,18,.38)); }
  #grain { position:absolute; left:-256px; top:-256px; width:1600px; height:2500px; opacity:.13; background:url(grain.png); pointer-events:none; mix-blend-mode:overlay; }
  .lt { position:absolute; left:48px; top:1128px; width:780px; opacity:0; pointer-events:none; }
  .lt .bar { position:absolute; left:0; top:0; bottom:0; width:8px; background:var(--gold); transform-origin:0 0; }
  .lt .box { margin-left:8px; padding:12px 24px 14px 22px; background:linear-gradient(90deg, rgba(6,16,28,.93), rgba(6,16,28,.8)); }
  .lt .k { font-weight:700; font-size:22px; letter-spacing:.2em; color:var(--gold); }
  .lt .v { font-family:"Playfair Display",serif; font-weight:700; font-size:46px; line-height:1.12; color:var(--cream); margin-top:2px; }
  .lt .v i { color:var(--gold); font-weight:500; }
  #plate { position:absolute; left:40px; top:1336px; width:1000px; height:192px; background:rgba(6,16,28,.9); opacity:0; border-top:3px solid var(--gold); border-bottom:3px solid var(--gold); box-sizing:border-box; }
  #captions { position:absolute; left:72px; top:1336px; width:936px; height:192px; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0">
 <div id="stage">
  <div id="planeWrap"><div id="plane"><svg id="planeSvg" width="1" height="1" style="overflow:visible"></svg></div></div>
  <svg class="full" id="shadows"></svg>
  <svg class="full" id="glb"></svg>
  <svg class="full" id="sprites"></svg>
  <svg class="full" id="clouds"></svg>
  <div id="labels"></div>
  <div id="vigT"></div><div id="vigB"></div><div id="vig"></div>
  <div id="hudT" class="mono" data-vfrey-keep>SIMPLIFIED MAP</div>
  <div id="hudS" class="mono">HAND-DRAWN COASTLINES</div>
  <div id="lt1" class="lt"><div class="bar"></div><div class="box"><div class="k">KICKER IN CAPS</div><div class="v">A line <i>of serif</i></div></div></div>
  <div id="grain"></div>
  <div id="plate"></div>
  <div id="captions"></div>
 </div>
</div>
<script src="scene.js"></script>
</body>
</html>
```


## Setup, Mercator, hand-drawn data, ring preparation

The flat map is Mercator with 8 px per degree. A ring whose mean longitude is below -12 is shifted by +360 so the map is Pacific-centred (`BASE`); `off` wraps each ring toward `BASE`. `densify` adds vertices so the globe fold bends smoothly.

```js
const tl = vfrey.timeline();
const $ = (id) => document.getElementById(id);
const D2R = Math.PI / 180, S = 8, RM = S * 180 / Math.PI, P = 1700, CY = 700;
const clamp01 = (x) => Math.max(0, Math.min(1, x)), lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mx = (lon) => lon * S, my = (lat) => -RM * Math.log(Math.tan(Math.PI / 4 + Math.min(84, Math.max(-80, lat)) * D2R / 2));
const f1 = (n) => Math.round(n * 10) / 10, f3 = (n) => Math.round(n * 1000) / 1000;
$("stage").style.transform = `scale(${vfrey.frame.width / 1080})`;

// demo data: two invented landmasses, one lake, one range. Replace with your own hand-drawn [lon, lat] rings.
const MAPDATA = {
  land: { westland: [[-100, 20], [-60, 20], [-50, 50], [-90, 62], [-120, 45]], eastland: [[20, 5], [60, 8], [70, 40], [40, 55], [10, 40]] },
  water: { lake: [[-86, 40], [-80, 40], [-80, 44], [-86, 44]] },
  ranges: [[[-110, 30], [-104, 40], [-108, 50]], [[30, 20], [36, 30], [34, 42]]],
};
const LAND = MAPDATA.land, WATER = MAPDATA.water, RANGES = MAPDATA.ranges;
const meanLon = (pts) => pts.reduce((s, p) => s + p[0], 0) / pts.length;
function densify(pts, step, closed) { const out = []; const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) { const a = pts[i], b = pts[(i + 1) % n]; const d = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); const k = Math.max(1, Math.ceil(d / step));
    for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); }
  if (!closed) out.push(pts[n - 1]); return out; }
const BASE = 213; // the flat map is Pacific-centred
const prep = (pts, closed, step) => { const sh = meanLon(pts) < -12 ? 360 : 0; const p = densify(pts.map((q) => [q[0] + sh, q[1]]), step || 2.2, closed); return { pts: p, off: Math.round((BASE - meanLon(p)) / 360) * 360 }; };
const rings = Object.entries(LAND).map(([name, pts]) => Object.assign({ name, tint: name === "westland" ? "#c98a62" : "#a9b57e" }, prep(pts, true)));
const waters = Object.values(WATER).map((pts) => prep(pts, true));
const ranges = RANGES.map((pts) => prep(pts, false, 2.5));
const dFlat = (pts, off, closed) => "M" + pts.map((p) => f1(mx(p[0] + off)) + " " + f1(my(p[1]))).join("L") + (closed ? "Z" : "");
```


## Camera: one projection mirrored in CSS and JS

The plane is an SVG in map pixels under `translate(540px, CY) perspective(1700px) rotateX(a) scale(k) translate(-fx, -fy)` (origin 0 0). Anything with a height (labels, the plane, clouds) is projected with its own `z` by `camProj`, which gives real parallax. `SS` is the state the timeline tweens; `draw()` repaints everything from `SS`.

```js
const cam = { clon: 288, clat: 41, k: 1.9, a: 44 };
const F = { clon: BASE, clat: 28, k: 0.68, a: 30 };   // the wide "table" shot the morph starts from and returns to
function camProj(x, y, z, c) { const a = c.a * D2R, ca = Math.cos(a), sa = Math.sin(a); const px = (x - mx(c.clon)) * c.k, py = (y - my(c.clat)) * c.k, pz = z * c.k;
  const y2 = py * ca - pz * sa, z2 = py * sa + pz * ca, sc = P / (P - z2); return [540 + px * sc, CY + y2 * sc, sc]; }
const planeSvg = $("planeSvg"), SVGNS = "http://www.w3.org/2000/svg";
(function buildPlane() {
  const landD = rings.map((r) => dFlat(r.pts, r.off, true)).join(""), lakeD = waters.map((r) => dFlat(r.pts, r.off, true)).join(""), rangeD = ranges.map((r) => dFlat(r.pts, r.off, false)).join("");
  planeSvg.innerHTML = `<defs>
    <pattern id="seaP" width="384" height="384" patternUnits="userSpaceOnUse"><image href="sea.png" width="384" height="384"/></pattern>
    <pattern id="paperP" width="384" height="384" patternUnits="userSpaceOnUse"><image href="paper.png" width="384" height="384"/></pattern></defs>
    <rect x="${mx(-420)}" y="${my(84)}" width="${mx(840) - mx(-420)}" height="${my(-80) - my(84)}" fill="url(#seaP)"/>
    <path d="${landD}" fill="none" stroke="#5aa0d0" stroke-opacity=".22" stroke-width="40" stroke-linejoin="round"/>
    <path d="${landD}" fill="#000" fill-opacity=".45" transform="translate(5 6)"/>
    <path d="${landD}" fill="url(#paperP)"/>
    ${rings.map((r) => `<path d="${dFlat(r.pts, r.off, true)}" fill="${r.tint}" fill-opacity=".3"/>`).join("")}
    <path d="${lakeD}" fill="#0d2440"/>
    <path d="${rangeD}" fill="none" stroke="#3d2e18" stroke-width="9" stroke-dasharray="1.2 3.4" stroke-linecap="round"/>
    <path d="${landD}" fill="none" stroke="#3d2e18" stroke-width="2.4" stroke-linejoin="round"/>`;
})();
const SS = { clon: 288, clat: 41, k: 1.2, a: 36, m: 0 };
function draw() {
  const c = SS, a = c.a;
  $("plane").style.transform = `translate(540px,${CY}px) perspective(${P}px) rotateX(${a}deg) scale(${c.k}) translate(${-mx(c.clon)}px,${-my(c.clat)}px)`;
  cam.clon = c.clon; cam.clat = c.clat; cam.k = c.k; cam.a = c.a;
}
tl.eventCallback("onUpdate", draw);   // live preview
vfrey.onFrame(draw);                // what a render runs: onUpdate does not fire on a seek
tl.to(SS, { clon: BASE, clat: 28, k: 0.68, a: 30, duration: 4, ease: "power3.inOut" }, 0.5);   // a long glide: power3.inOut; follows are sine.inOut
draw();
```


## Globe: the same vertices fold from flat to round

Keep per-vertex arrays `[lon, lat, flatX, flatY, sinLat, cosLat, lonRad]`. `glbPos(v, m)` blends the flat screen position (from `camProj` with the wide camera `F`) to the orthographic globe position with a per-vertex stagger, so the middle wraps first and far-side points clamp to the limb. Centre the globe on the route's midpoint and a great circle is a straight line.

```js
// F (the wide table camera) is declared with the camera above
const GR = 438, GCX = 540, GCY = 640;
function V(lon, lat, off) { const f = camProj(mx(lon + (off || 0)), my(lat), 0, F); return [lon, lat, f[0], f[1], Math.sin(lat * D2R), Math.cos(lat * D2R), lon * D2R]; }
const gRings = rings.map((r) => r.pts.map((p) => V(p[0], p[1], r.off)));
const G = { lon: BASE, lat: 47 };      // current globe centre
function glbPos(v, m) {  // blend one vertex from its flat screen position to the orthographic one; the centre of the globe wraps first
  const sl0 = Math.sin(G.lat * D2R), cl0 = Math.cos(G.lat * D2R), dl = v[6] - G.lon * D2R, cd = Math.cos(dl), sd = Math.sin(dl);
  const cosc = sl0 * v[4] + cl0 * v[5] * cd; let gx = GR * v[5] * sd, gy = -GR * (cl0 * v[4] - sl0 * v[5] * cd);
  if (cosc < 0) { const h = Math.hypot(gx, gy) || 1; gx *= GR / h; gy *= GR / h; }
  const d = Math.acos(Math.max(-1, Math.min(1, cosc))) / Math.PI, mi = eio(clamp01(m * 1.75 - d * 0.75));
  return [lerp(v[2], GCX + gx, mi), lerp(v[3], GCY + gy, mi), cosc, mi]; }
function pathOf(arr, m, closed) { let d = ""; for (let i = 0; i < arr.length; i++) { const p = glbPos(arr[i], m); d += (i ? "L" : "M") + f1(p[0]) + " " + f1(p[1]); } return d + (closed ? "Z" : ""); }
const runsD = (runs, m) => runs.map((r) => pathOf(r, m, false)).join("");
function partial(arr, u, m) { if (u <= 0) return ""; const n = arr.length - 1, x = clamp01(u) * n, i = Math.floor(x); let d = ""; for (let k = 0; k <= i && k <= n; k++) { const p = glbPos(arr[k], m); d += (k ? "L" : "M") + f1(p[0]) + " " + f1(p[1]); }
  if (i < n) { const a = glbPos(arr[i], m), b = glbPos(arr[i + 1], m), f = x - i; d += "L" + f1(lerp(a[0], b[0], f)) + " " + f1(lerp(a[1], b[1], f)); } return d; }
function atG(arr, u, m) { const n = arr.length - 1, x = clamp01(u) * n, i = Math.min(n - 1, Math.floor(x)), a = glbPos(arr[i], m), b = glbPos(arr[i + 1], m), f = x - i; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), a[2]]; }
function flatPartialD(pts, u) { if (u <= 0) return ""; const n = pts.length - 1, x = clamp01(u) * n, i = Math.floor(x); let d = ""; for (let k = 0; k <= i && k <= n; k++) d += (k ? "L" : "M") + f1(mx(pts[k][0])) + " " + f1(my(pts[k][1]));
  if (i < n) { const f = x - i; d += "L" + f1(lerp(mx(pts[i][0]), mx(pts[i + 1][0]), f)) + " " + f1(lerp(my(pts[i][1]), my(pts[i + 1][1]), f)); } return d; }
const flatAt = (pts, u, z) => { const n = pts.length - 1, x = clamp01(u) * n, i = Math.min(n - 1, Math.floor(x)), f = x - i; return camProj(mx(lerp(pts[i][0], pts[i + 1][0], f)), my(lerp(pts[i][1], pts[i + 1][1], f)), z, cam); };
const glb = $("glb");
glb.innerHTML = `<g id="gAll"><circle cx="${GCX}" cy="${GCY}" r="${GR}" fill="#0d2440"/><path id="gLand" fill="#dcc89c" stroke="#3d2e18" stroke-width="2"/></g>`;
SS.m = 0;
const paintGlobe = () => { G.lon = lerp(BASE, 288, SS.m); $("gLand").setAttribute("d", gRings.map((r) => pathOf(r, SS.m, true)).join("")); };
tl.to(SS, { m: 1, duration: 3, ease: "power2.inOut", onUpdate: paintGlobe }, 5);
vfrey.onFrame(paintGlobe);   // a render seeks with events suppressed
vfrey.captions("#captions", { style: "color", font: '"Google Sans Flex", sans-serif', size: 62, color: "#f6ead0", highlight: "#efc063", maxWords: 4 });
{ const cb = vfrey.captionBox; if (cb) { for (const id of ["plate", "captions"]) { $(id).style.top = cb.top + "px"; $(id).style.height = cb.height + "px"; } } }
tl.to("#plate", { opacity: 1, duration: 0.4 }, 0);
```
