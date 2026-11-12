# Blueprint: code to copy

One big SVG sheet is the whole world; a camera is the `viewBox`. Paste the page shell, then the blocks as one `scene.js` (the shell loads it). `tl` is `vfrey.timeline()`. The frame is split top to bottom: the sheet viewport (`1080 x 1336`), a note strip with the captions, and the title block. Move the strip and block if the person's caption position is not the bottom (`vfrey.captionBox`).

## Page shell

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script>
<script src="vfrey/vfrey.js"></script>
<style>
  html, body { margin:0; width:100%; height:100%; overflow:hidden; background:#0b3380; }
  #root { position:relative; width:100%; height:100%; overflow:hidden; font-family:"JetBrains Mono", monospace; color:#f2fbff; background:#0b3380; }
  #sheet { position:absolute; left:0; top:0; width:1080px; height:1336px; overflow:hidden; }
  #w { position:absolute; left:0; top:0; width:1080px; height:1336px; --k:2.3; --ph:0; }
  /* linework: every stroke width is in screen pixels via --k (world units per pixel) */
  .o { fill:none; stroke:#f2fbff; stroke-width:calc(var(--k)*3.4px); stroke-linejoin:round; stroke-linecap:round; }
  .o2 { fill:none; stroke:#f2fbff; stroke-width:calc(var(--k)*2px); stroke-linejoin:round; stroke-linecap:round; }
  .c { fill:none; stroke:#8fdcff; stroke-width:calc(var(--k)*1.4px); opacity:.6; }
  .dm { fill:none; stroke:#bdeeff; stroke-width:calc(var(--k)*1.8px); }
  .dr { stroke-dasharray:1 1; stroke-dashoffset:1; }
  .ctr { fill:none; stroke:#8fdcff; stroke-width:calc(var(--k)*1.5px); stroke-dasharray:calc(var(--k)*26px) calc(var(--k)*6px) calc(var(--k)*5px) calc(var(--k)*6px); opacity:.7; }
  .hf { fill:url(#hat); stroke:#f2fbff; stroke-width:calc(var(--k)*3px); stroke-linejoin:round; }
  .hfc { fill:url(#hat2); stroke:#f2fbff; stroke-width:calc(var(--k)*3px); stroke-linejoin:round; }
  .fa { fill:none; stroke-width:calc(var(--k)*4.5px); stroke-linecap:butt; stroke-dasharray:calc(var(--k)*20px) calc(var(--k)*13px); stroke-dashoffset:calc(var(--k)*var(--ph)*-1px); }
  .fs { fill:none; stroke-width:calc(var(--k)*5px); stroke-linecap:butt; }
  .t { font-family:"JetBrains Mono", monospace; fill:#f2fbff; paint-order:stroke; stroke:#0f3d96; stroke-width:calc(var(--k)*6px); stroke-linejoin:round; letter-spacing:.05em; }
  .t1 { font-size:calc(var(--k)*23px); } .t2 { font-size:calc(var(--k)*31px); } .t3 { font-size:calc(var(--k)*46px); } .t4 { font-size:calc(var(--k)*84px); } .t5 { font-size:calc(var(--k)*40px); }
  .sc { fill:none; stroke:#cfeeff; stroke-width:calc(var(--k)*1.8px); stroke-linecap:round; opacity:.8; }
  .wf { fill:none; stroke:#f2fbff; stroke-width:calc(var(--k)*2.4px); stroke-linejoin:round; }
  #tools { position:absolute; left:0; top:0; width:1080px; height:1336px; overflow:hidden; pointer-events:none; z-index:20; }
  #tools svg { position:absolute; left:0; top:0; }
  #strip { position:absolute; left:0; top:1336px; width:1080px; height:272px; background:linear-gradient(#082866,#071f55); z-index:30; }
  #strip::before { content:""; position:absolute; left:0; right:0; top:0; height:14px; background:repeating-linear-gradient(90deg,#cfeeff 0 2px,transparent 2px 12px); opacity:.55; -webkit-mask:linear-gradient(#000 0 40%,transparent 40%); }
  #strip .frm { position:absolute; left:26px; right:26px; top:22px; bottom:20px; border:3px solid #f2fbff; }
  #strip .frm2 { position:absolute; left:38px; right:38px; top:34px; bottom:32px; border:1px solid #8fdcff; }
  #strip .tag { position:absolute; left:48px; top:8px; background:#071f55; padding:0 12px; font-size:20px; letter-spacing:.2em; color:#8fdcff; }
  #strip .tag2 { position:absolute; right:48px; bottom:8px; background:#071f55; padding:0 12px; font-size:18px; letter-spacing:.2em; color:#8fdcff; }
  #captions { position:absolute; left:60px; right:60px; top:1350px; height:240px; z-index:40; display:flex; align-items:center; justify-content:center; }
  #captions .vf-w { text-transform:uppercase; font-family:"JetBrains Mono", monospace; letter-spacing:.02em; }
  #tb { position:absolute; left:0; top:1608px; width:1080px; height:312px; background:#0a2c72; z-index:30; }
  #tb .bg { position:absolute; inset:0; background-image:linear-gradient(rgba(143,220,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(143,220,255,.12) 1px,transparent 1px); background-size:20px 20px; }
  .cell { position:absolute; border:2px solid #cfeeff; box-sizing:border-box; }
  .lbl { position:absolute; font-size:15px; letter-spacing:.2em; color:#8fdcff; }
  .tt { position:absolute; white-space:nowrap; }
  .rev { position:absolute; left:12px; font-size:18px; letter-spacing:.06em; white-space:nowrap; }
  .lg { position:absolute; left:12px; display:flex; align-items:center; font-size:21px; letter-spacing:.08em; opacity:.3; white-space:nowrap; }
  .lg svg { margin-right:12px; flex:none; }
  #stamp { position:absolute; left:150px; top:560px; z-index:25; width:780px; text-align:center; transform:rotate(-8deg); opacity:0; }
  #stamp div { display:inline-block; border:9px double #f2fbff; padding:6px 38px 8px; font-size:96px; letter-spacing:.12em; color:#f2fbff; background:rgba(15,61,150,.62); }
  #stamp small { display:block; font-size:24px; letter-spacing:.3em; color:#8fdcff; margin-top:8px; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0">
  <div id="sheet"><svg id="w" width="1080" height="1336" viewBox="0 0 1080 1336"></svg></div>
  <div id="tools"></div>
  <div id="strip"><div class="frm"></div><div class="frm2"></div><div class="tag">NOTE</div><div class="tag2" id="noteno">01</div></div>
  <div id="captions"></div>
  <div id="tb">
    <div class="bg"></div>
    <div class="cell" style="left:24px;top:8px;width:474px;height:176px"></div>
    <div class="lbl" style="left:36px;top:16px">TITLE</div>
    <div class="tt" style="left:36px;top:42px;font-size:38px;letter-spacing:.04em">YOUR SUBJECT</div>
    <div class="cell" style="left:498px;top:8px;width:558px;height:176px"></div>
    <div class="lbl" data-vfrey-keep style="left:510px;top:16px">FORCE KEY</div>
    <div id="legend" style="position:absolute;left:498px;top:44px">
      <div class="lg" id="lgT" style="top:0"><svg width="52" height="14"><line x1="2" y1="7" x2="40" y2="7" stroke="#ffd84a" stroke-width="5"/><path d="M36,0 L52,7 L36,14z" fill="#ffd84a"/></svg>FIRST QUANTITY</div>
      <div class="lg" id="lgC" style="top:33px"><svg width="52" height="14"><line x1="2" y1="7" x2="40" y2="7" stroke="#ff6fae" stroke-width="5"/><path d="M36,0 L52,7 L36,14z" fill="#ff6fae"/></svg>SECOND QUANTITY</div>
    </div>
    <div class="cell" style="left:24px;top:184px;width:200px;height:56px"></div><div class="lbl" style="left:34px;top:192px">SHEET</div><div class="tt" style="left:34px;top:212px;font-size:19px">1 OF 1</div>
    <div class="cell" style="left:224px;top:184px;width:274px;height:56px"></div><div class="lbl" style="left:234px;top:192px">DRAWING NO.</div><div class="tt" style="left:234px;top:212px;font-size:19px">01-A-001</div>
  </div>
</div>
<script src="scene.js"></script>
</body>
</html>
```


## Setup, defs (grid, hatching, arrowheads), draw-on helpers

Every stroke width and text size uses `--k` (world units per screen pixel) so lines stay crisp and constant at any zoom. Each path has `pathLength="1"` and the `dr` class (dashed so it can be drawn on by tweening `strokeDashoffset`). The word helper `W(regex, line)` returns a spoken word's start time.

```js
const T = vfrey.timing, tl = vfrey.timeline();
const wordsAll = T.words;
const D = T.durationSec;
const W = (re, line, nth = 0) => { const m = wordsAll.filter(w => (line == null || w.line === line) && re.test(w.text)); return (m[nth] || m[0] || wordsAll[0]).start; };
const svg = document.getElementById("w");
const NSv = "http://www.w3.org/2000/svg";
const BLUE = "#0f3d96";
const COL = { W:"#6dffb0", T:"#ffd84a", C:"#ff6fae", A:"#ff9a45" };
const pts = a => a.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
const dPath = a => "M" + a.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
const E = id => document.getElementById(id);
let defs = `<defs>
 <radialGradient id="bgr" cx="50%" cy="46%" r="75%"><stop offset="0" stop-color="#1a58c4"/><stop offset=".6" stop-color="#1245a6"/><stop offset="1" stop-color="#0a2f78"/></radialGradient>
 <pattern id="gm" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#9fe2ff" stroke-opacity=".13" stroke-width="1.2"/></pattern>
 <pattern id="gM" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#bdeeff" stroke-opacity=".28" stroke-width="1.8"/></pattern>
 <pattern id="hat" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="14" stroke="#cfeeff" stroke-width="2.2" stroke-opacity=".75"/></pattern>
 <pattern id="hat2" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="9" stroke="#cfeeff" stroke-width="1.6" stroke-opacity=".7"/></pattern>
 <pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.7" fill="#cfeeff" fill-opacity=".85"/></pattern>
 ${Object.entries(COL).map(([k, c]) => `<marker id="m${k}" viewBox="0 0 5 5" refX="3.4" refY="2.5" markerWidth="5" markerHeight="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L5,2.5 L0,5 z" fill="${c}"/></marker>`).join("")}
 <marker id="mD" viewBox="0 0 6 6" refX="0" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M6,0.6 L0,3 L6,5.4" fill="none" stroke="#bdeeff" stroke-width=".9"/></marker>
</defs>`;
let L = { grid:"", crease:"", frame:"", land:"", cons:"", out:"", hang:"", force:"", dim:"", lab:"", top:"" };
const Z = { x0:-3000, y0:-2000, w:8400, h:8400 };
```


## The sheet: grid, fold creases, frame with zone letters and registration marks

```js
L.grid = `<rect x="${Z.x0}" y="${Z.y0}" width="${Z.w}" height="${Z.h}" fill="url(#bgr)"/><g id="gridg" opacity="0"><rect x="${Z.x0}" y="${Z.y0}" width="${Z.w}" height="${Z.h}" fill="url(#gm)"/><rect x="${Z.x0}" y="${Z.y0}" width="${Z.w}" height="${Z.h}" fill="url(#gM)"/></g>`;
/* fold creases: a dark and a pale line, the sheet folded in thirds and in half */
const crease = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#04184a" stroke-opacity=".35" stroke-width="5"/><line x1="${x1 + (x1 === x2 ? 6 : 0)}" y1="${y1 + (y1 === y2 ? 6 : 0)}" x2="${x2 + (x1 === x2 ? 6 : 0)}" y2="${y2 + (y1 === y2 ? 6 : 0)}" stroke="#bdeeff" stroke-opacity=".16" stroke-width="4"/>`;
L.crease = `<g id="creases" opacity="0">${crease(800, -2000, 800, 6400)}${crease(1600, -2000, 1600, 6400)}${crease(-3000, 1090, 5400, 1090)}${crease(-3000, 2100, 5400, 2100)}
 <rect x="1600" y="-2000" width="3800" height="8400" fill="#04184a" fill-opacity=".05"/><rect x="800" y="1090" width="800" height="1010" fill="#bdeeff" fill-opacity=".03"/></g>`;
/* sheet frame, zone letters, registration marks */
const FX0 = -40, FX1 = 2440, FY0 = -110, FY1 = 3010;
let fr = `<rect id="frame1" class="o2 dr" pathLength="1" x="${FX0}" y="${FY0}" width="${FX1 - FX0}" height="${FY1 - FY0}"/><rect id="frame2" class="c dr" pathLength="1" x="${FX0 + 26}" y="${FY0 + 26}" width="${FX1 - FX0 - 52}" height="${FY1 - FY0 - 52}"/>`;
"ABCDEF".split("").forEach((c, i) => { const x = FX0 + (i + .5) * (FX1 - FX0) / 6; fr += `<text class="t t1" x="${x}" y="${FY0 + 20}" text-anchor="middle" style="stroke:none;fill:#8fdcff">${c}</text><line class="c" x1="${FX0 + i * (FX1 - FX0) / 6}" y1="${FY0}" x2="${FX0 + i * (FX1 - FX0) / 6}" y2="${FY0 + 26}"/>`; });
[1, 2, 3, 4, 5, 6, 7, 8].forEach((c, i) => { const y = FY0 + (i + .5) * (FY1 - FY0) / 8; fr += `<text class="t t1" x="${FX0 + 12}" y="${y + 8}" style="stroke:none;fill:#8fdcff">${c}</text><line class="c" x1="${FX0}" y1="${FY0 + i * (FY1 - FY0) / 8}" x2="${FX0 + 26}" y2="${FY0 + i * (FY1 - FY0) / 8}"/>`; });
[[FX0 + 60, FY0 + 60], [FX1 - 60, FY0 + 60], [FX0 + 60, FY1 - 60], [FX1 - 60, FY1 - 60]].forEach(([x, y]) => { fr += `<g class="c" style="opacity:.8"><circle cx="${x}" cy="${y}" r="22"/><line x1="${x - 36}" y1="${y}" x2="${x + 36}" y2="${y}"/><line x1="${x}" y1="${y - 36}" x2="${x}" y2="${y + 36}"/></g>`; });
L.frame = `<g id="frameg">${fr}</g>`;
/* your drawing goes here: construction lines first, outlines second, hatching last (fillOpacity 0 until the outline is drawn) */
const O = (id, tag, attrs, cls = "o") => `<${tag} id="${id}" class="${cls} dr" pathLength="1" ${attrs}/>`;
L.cons = `<g id="consg">${O("k1", "path", 'd="M200 700 L1000 700"', "c")}${O("k2", "path", 'd="M600 300 L600 1100"', "ctr")}</g>`;
L.out = `<g id="outg">${O("s1", "rect", 'x="420" y="500" width="360" height="400"')}</g>`;
svg.innerHTML = defs + L.grid + L.crease + L.frame + L.cons + L.out;
```


## Camera by viewBox, keyframes, flowing arrows

`cam` is a proxy `{x, y, w}`; `apply()` writes the `viewBox` and the CSS variables, and one tween per key moves it from the previous key (a `fromTo`, so seeking is safe). `--ph` is one global linear phase: dashed force arrows (class `fa`, `stroke-dashoffset` from `--ph`) flow forward at a constant screen speed at any zoom.

```js
const HH = 1336 / 1080;
const cam = { x:1200, y:1383, w:2540 };
const ph = { v:0 };
function apply() {
  const h = cam.w * HH;
  svg.setAttribute("viewBox", `${cam.x - cam.w / 2} ${cam.y - h / 2} ${cam.w} ${h}`);
  svg.style.setProperty("--k", (cam.w / 1080).toFixed(4));
  svg.style.setProperty("--ph", (ph.v).toFixed(2));
}
apply();
const keys = [   // [time, {x, y, w}, ease]: wide first and last, one station per idea
  [3.0, { x: 600, y: 700, w: 2000 }, "sine.inOut"],
  [5.0, { x: 600, y: 700, w: 900 }, "power3.inOut"],
  [9.0, { x: 600, y: 700, w: 860 }, "sine.inOut"],
  [11.0, { x: 600, y: 700, w: 2000 }, "power3.inOut"],
];
let prev = { t: 0, v: { x: 600, y: 700, w: 2000 } };
keys.forEach(([t, v, ease]) => {
  tl.fromTo(cam, { x: prev.v.x, y: prev.v.y, w: prev.v.w }, { x: v.x, y: v.y, w: v.w, duration: t - prev.t, ease, onUpdate: apply, immediateRender: false }, prev.t);
  prev = { t, v };
});
tl.fromTo(ph, { v: 0 }, { v: 400, duration: D, ease: "none", onUpdate: apply, immediateRender: false }, 0);
vfrey.onFrame(apply);   // onUpdate does not run when a render seeks; this does
/* draw-on: set every .dr to dashoffset 1, then tween to 0 in drawing order */
document.querySelectorAll(".dr").forEach((el, i) => tl.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut", immediateRender: false }, 0.2 + i * 0.35));
```


## Drafting tools as transitions, captions on the note strip

A T-square slides down the sheet, a set square across it, a compass sweeps an arc about a needle point; cut the camera underneath while a tool covers the screen. Time each from the gap between lines (`lineStart`, `lineEnd` from `vfrey.timing.lines`).

```js
const tools = E("tools");
/* T-square: a long bar on a head block, sliding down the sheet */
tools.insertAdjacentHTML("beforeend", `<svg id="tsq" width="1080" height="150" viewBox="0 0 1080 150" style="opacity:0;top:-160px">
 <rect x="-10" y="40" width="1100" height="70" fill="rgba(15,61,150,.55)" stroke="#f2fbff" stroke-width="3"/>
 <rect x="-10" y="40" width="1100" height="70" fill="none" stroke="#8fdcff" stroke-width="1" transform="translate(0 6) scale(1 .85)"/>
 ${Array.from({ length: 108 }, (_, i) => `<line x1="${i * 10}" y1="110" x2="${i * 10}" y2="${i % 10 === 0 ? 86 : i % 5 === 0 ? 94 : 100}" stroke="#f2fbff" stroke-width="2"/>`).join("")}
 <rect x="-10" y="20" width="110" height="110" fill="rgba(15,61,150,.75)" stroke="#f2fbff" stroke-width="3"/><circle cx="45" cy="75" r="14" fill="none" stroke="#8fdcff" stroke-width="2"/></svg>
 <svg id="tsh" width="1080" height="1336" viewBox="0 0 1080 1336" style="opacity:0"><line x1="0" y1="0" x2="1080" y2="0" stroke="#04184a" stroke-width="10" opacity=".3"/></svg>`);
const tTool1 = 4.0, tTool1e = 5.0;
tl.set("#tsq", { opacity: 1 }, tTool1);
tl.fromTo("#tsq", { y: -160 }, { y: 1480, duration: tTool1e - tTool1 + 0.4, ease: "power2.inOut", immediateRender: false }, tTool1);
tl.set("#tsq", { opacity: 0 }, tTool1e + 0.7);
{ const cb = vfrey.captionBox;             // the strip and the captions follow the band
  if (cb) { E("strip").style.top = (cb.top - 14) + "px"; E("captions").style.top = (cb.top + 0) + "px"; } }
vfrey.captions("#captions", { style: "color", font: '"JetBrains Mono", monospace', size: 58, color: "#f2fbff", highlight: "#ffd84a", maxWords: 3 });
apply();
```
