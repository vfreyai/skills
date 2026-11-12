# Storybook watercolour: code to copy

Paste the blocks you need into `scenes/<idea>/`, in this order: the page shell, then the blocks as one `scene.js` (it is loaded by the last line of the shell). `tl` is `vfrey.timeline()`. The whole picture is SVG strings, SVG filters, one canvas for the paper grain and one paused GSAP timeline; the frame is a `1080 x 1920` stage that vfrey scales to the real size.

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
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #e9dcc0; }
  #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Playfair Display", Georgia, serif; }
  #stage { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; perspective: 2800px; perspective-origin: 50% 50%; background: #eadfc4; }
  .pg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; background: #f6ecd4; backface-visibility: hidden; transform-origin: 0 50%; }
  .win { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; -webkit-mask-size: 1080px 1920px; -webkit-mask-repeat: no-repeat; }
  .lay { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
  .lay > svg, .lay > div { position: absolute; }
  svg.lay { overflow: visible; }
  .frame { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; pointer-events: none; }
  .grain { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; pointer-events: none; opacity: .9; }
  .hd { position: absolute; left: 0; top: 0; width: 1080px; height: 600px; pointer-events: none; }
  .lt { position: absolute; left: 0; width: 1080px; text-align: center; font-weight: 800; white-space: nowrap; line-height: 1.05; filter: url(#letter); letter-spacing: .01em; }
  .shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(40,22,10,.0), rgba(40,22,10,.85)); opacity: 0; pointer-events: none; }
  .cast { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(40,22,10,.55), rgba(40,22,10,0) 46%); opacity: 0; pointer-events: none; }
  /* the paper strip sits where vfrey's band is: set top/height from vfrey.captionBox in scene.js (the numbers below are the default) */
  #strip { position: absolute; left: 40px; top: 1318px; width: 1000px; height: 200px; z-index: 100; filter: drop-shadow(0 10px 12px rgba(50,28,14,.35)); }
  #captions { position: absolute; left: 80px; right: 80px; top: 1330px; height: 176px; z-index: 101; font-weight: 700; justify-content: center !important; filter: url(#round); }
  #captions .vf-w { padding: 2px 8px 6px; }
</style>
</head>
<body>
<div id="filters"></div>
<div id="root" data-composition-id="main" data-start="0">
  <div id="stage"></div>
  <div id="strip"></div>
  <div id="captions"></div>
</div>
<script src="scene.js"></script>
</body>
</html>
```


## Drawing library: palette, seeded shapes, wash and ink

`blob` makes a closed wobbly shape, `W` is a wash path, `I` the ink line drawn 3 px off it. Never a perfect circle.

```js
/* Storybook watercolour: drawing library. Everything is SVG strings and SVG filters; the only bitmap is the paper grain. */
const PAPER = "#f6ecd4", INK = "#3b2a22";
const COL = { ochre: "#e3a84a", sun: "#f3c24f", sienna: "#b8643a", terra: "#d98c5f", sage: "#a2b07c", olive: "#6f8355", water: "#6fb1b3", water2: "#a8d6d3", plum: "#7a5c86", rose: "#e8a98f", dark: "#44415a", dark2: "#34324a", sheen: "#9a9fc4" };

function rng(seed) { let a = seed >>> 0; return () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296); }
const f1 = (n) => Math.round(n * 10) / 10;
function cr(pts) { // closed Catmull-Rom spline as cubic beziers
  const n = pts.length; let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + "Z";
}
function blob(cx, cy, rx, ry, o = {}) {
  const n = o.n || 9, j = o.j ?? 0.1, r = rng(o.seed || 1), rot = ((o.rot || 0) * Math.PI) / 180, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, k = 1 + (r() - 0.5) * 2 * j, x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return cr(pts);
}
const W = (d, fill, op = 0.85, extra = "") => `<path d="${d}" fill="${fill}" fill-opacity="${op}" ${extra}/>`;
/* ink line: drawn a few px off the wash, like a misregistered pencil outline */
const I = (d, w = 4, col = INK, dx = 3, dy = -2, extra = "") => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${dx} ${dy})" ${extra}/>`;
const svgT = (w, h, inner, extra = "") => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${extra}>${inner}</svg>`;
```


## Filters: wash, small wash, ink, lettering, round serifs, blurs

One hidden SVG with every filter, filled once. Apply a filter to a GROUP of shapes, never to each path, and never to an animated element when you can help it (each seek re-runs it).

```js
/* shared SVG filters (one hidden svg) */
const FILTERS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
 <!-- big wash: warped edge, granulated pigment, darker rim where the paint pooled -->
 <filter id="wc" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.011 0.014" numOctaves="3" seed="2" result="w"/>
  <feDisplacementMap in="SourceGraphic" in2="w" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="1.4" result="db"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="7" result="p"/>
  <feColorMatrix in="p" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.15 1.42" result="pa"/>
  <feComposite in="db" in2="pa" operator="in" result="body"/>
  <feMorphology in="db" operator="erode" radius="4" result="er"/>
  <feGaussianBlur in="er" stdDeviation="4" result="erb"/>
  <feComposite in="db" in2="erb" operator="out" result="rim"/>
  <feMerge><feMergeNode in="body"/><feMergeNode in="rim"/></feMerge>
 </filter>
 <!-- small wash for props and characters -->
 <filter id="wcs" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="w"/>
  <feDisplacementMap in="SourceGraphic" in2="w" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="9" result="p"/>
  <feColorMatrix in="p" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.38" result="pa"/>
  <feComposite in="d" in2="pa" operator="in"/>
 </filter>
 <!-- wobbly hand-drawn line -->
 <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="11" result="w"/>
  <feDisplacementMap in="SourceGraphic" in2="w" scale="5" xChannelSelector="R" yChannelSelector="G"/>
 </filter>
 <!-- brush lettering -->
 <filter id="letter" x="-5%" y="-10%" width="110%" height="125%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="5" result="w"/>
  <feDisplacementMap in="SourceGraphic" in2="w" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" seed="3" result="p"/>
  <feColorMatrix in="p" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1.5" result="pa"/>
  <feComposite in="d" in2="pa" operator="in"/>
 </filter>
 <!-- rounds the corners of serif type: blur, then re-threshold the alpha -->
 <filter id="round" x="-3%" y="-10%" width="106%" height="120%">
  <feGaussianBlur stdDeviation="1.5"/>
  <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 11 -4.6"/>
 </filter>
 <filter id="b6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
 <filter id="b16" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
 <filter id="b34" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="34"/></filter>
</defs></svg>`;

document.getElementById("filters").innerHTML = FILTERS;
```


## Page window, border and paper grain

The mask of the painting and the painted border use the same filter and numbers (`WIN_FILTER`), so the edge and the border line up. The grain is made once on a canvas and copied per page.

```js
/* rough page window: used both as the mask of the painting and as the path of the painted border (same filter, same numbers, so they line up) */
const WIN = { x: 64, y: 64, w: 952, h: 1792 };
const WIN_FILTER = `<filter id="wf" x="-6%" y="-4%" width="112%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.022" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="44" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1.6"/></filter>`;
function maskURI() {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs>${WIN_FILTER}</defs><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="22" fill="#000" filter="url(#wf)"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(s)}")`;
}
function frameSVG(tint) {
  const inner = `<defs>${WIN_FILTER}<filter id="wf2" x="-6%" y="-4%" width="112%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.017" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
  <g filter="url(#wcs)"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="22" fill="none" stroke="${tint}" stroke-opacity=".78" stroke-width="20" filter="url(#wf)"/></g>
  <rect x="${WIN.x - 26}" y="${WIN.y - 26}" width="${WIN.w + 52}" height="${WIN.h + 52}" rx="30" fill="none" stroke="${INK}" stroke-opacity=".55" stroke-width="3.5" filter="url(#wf2)"/>
  <rect x="${WIN.x - 38}" y="${WIN.y - 36}" width="${WIN.w + 74}" height="${WIN.h + 70}" rx="34" fill="none" stroke="${tint}" stroke-opacity=".4" stroke-width="2.5" filter="url(#wf2)"/>
  ${[[WIN.x - 4, WIN.y - 4, 1, 1], [WIN.x + WIN.w + 4, WIN.y - 4, -1, 1], [WIN.x - 4, WIN.y + WIN.h + 4, 1, -1], [WIN.x + WIN.w + 4, WIN.y + WIN.h + 4, -1, -1]].map(([x, y, sx, sy]) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})" filter="url(#ink)"><path d="M-4 22C14 8 30 2 52 4" fill="none" stroke="${INK}" stroke-opacity=".6" stroke-width="3.5" stroke-linecap="round"/><path d="M22 -2C32 14 40 22 60 24" fill="none" stroke="${tint}" stroke-opacity=".7" stroke-width="3.5" stroke-linecap="round"/><circle cx="16" cy="14" r="4.5" fill="${tint}" fill-opacity=".8"/></g>`).join("")}`;
  return svgT(1080, 1920, inner);
}
/* cold-press paper grain, built once on a canvas from value noise and fibres (deterministic) */
function makeGrain() {
  const w = 540, h = 960, c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), img = x.createImageData(w, h), d = img.data, r = rng(77);
  const oct = [[3, 0.22], [9, 0.3], [40, 0.48]].map(([cell, amp]) => { const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = new Float32Array(gw * gh); for (let i = 0; i < g.length; i++) g[i] = r(); return { cell, amp, gw, g }; });
  const sm = (t) => t * t * (3 - 2 * t);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let v = 0;
    for (const o of oct) { const gx = i / o.cell, gy = j / o.cell, ix = gx | 0, iy = gy | 0, fx = sm(gx - ix), fy = sm(gy - iy), a = o.g[iy * o.gw + ix], b = o.g[iy * o.gw + ix + 1], cc = o.g[(iy + 1) * o.gw + ix], dd = o.g[(iy + 1) * o.gw + ix + 1]; v += o.amp * (a + (b - a) * fx + (cc - a + (a - b - cc + dd) * fx) * fy); }
    v += (r() - 0.5) * 0.05; const k = (j * w + i) * 4, s = v - 0.5;
    if (s > 0) { d[k] = 255; d[k + 1] = 250; d[k + 2] = 236; d[k + 3] = Math.min(255, s * 150); } else { d[k] = 92; d[k + 1] = 66; d[k + 2] = 40; d[k + 3] = Math.min(255, -s * 130); }
  }
  x.putImageData(img, 0, 0);
  x.lineCap = "round";
  for (let n = 0; n < 900; n++) { const px = r() * w, py = r() * h, a = r() * 6.28, l = 3 + r() * 9; x.strokeStyle = r() > 0.5 ? "rgba(255,250,236,.32)" : "rgba(110,80,50,.16)"; x.lineWidth = 0.6; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * 0.6, py + Math.sin(a) * l * 0.6 + 2, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  return c;
}
function grainCanvas(master) { const c = document.createElement("canvas"); c.width = master.width; c.height = master.height; c.getContext("2d").drawImage(master, 0, 0); c.className = "grain"; return c; }
```


## Timeline, word times, camera, loops, lettering

`wi`/`WS` find a spoken word by its text, never by number. `camera` moves the four parallax layers so the focus point lands on a chosen screen position; the foreground zooms about its own bottom edge so it never flies off.

```js
const tl = vfrey.timeline();
const TM = vfrey.timing, DUR = TM.durationSec;
const $ = (id) => document.getElementById(id);
const wi = (txt, from = 0) => TM.words.findIndex((w, i) => i >= from && w.text.replace(/[^\w']/g, "").toLowerCase() === txt.toLowerCase());
const WS = (txt, from = 0) => { const i = wi(txt, from); return i < 0 ? 0 : TM.words[i].start; };
const lineStart = (i) => TM.lines[i].start, lineEnd = (i) => TM.lines[i].end;
const stage = $("stage"), MASK = maskURI(), GRAIN = makeGrain();
const PAR = [0.25, 0.55, 1, 1.12];
function camera(pg, t0, t1, s0, s1, fx, fy, sx, sy, dx = 0, dy = 0, ease = "sine.inOut") { // focus (fx,fy) lands on screen (sx,sy)
  pg.layers.forEach((l, i) => {
    const k = PAR[i];
    const fg = i === 3, oy = fg ? 1850 : fy, my = fg ? 0 : (sy - fy) * k;
    tl.fromTo(l, { scale: 1 + (s0 - 1) * k, x: (sx - fx) * k, y: my, transformOrigin: `${fx}px ${oy}px` }, { scale: 1 + (s1 - 1) * k, x: (sx - fx + dx) * k, y: fg ? 0 : (sy - fy + dy) * k, duration: t1 - t0, ease }, t0);
  });
}
function loop(el, vars, t0, t1, period, ease = "sine.inOut") { const n = Math.max(1, Math.round((t1 - t0) / period)); tl.to(el, { ...vars, duration: period, ease, yoyo: true, repeat: n - 1 }, t0); }

/* ---- lettering ---- */
const lettered = (txt, size, o = {}) => `<div class="lt" style="font-size:${size}px;color:${o.color || "#5a3b2b"};${o.style || ""}">${txt}</div>`;
function reveal(sel, t, d = 0.9) { tl.fromTo(sel, { clipPath: "inset(0 100% 0 0)", opacity: 1 }, { clipPath: "inset(0 -2% 0 0)", duration: d, ease: "power1.inOut" }, t); }
```


## A page, built from four layers

A starting point: replace the layer bodies with your own scenery (sky, hills, mid ground with the subject, foreground that runs to the bottom edge). Give every id a per-page prefix: several pages share one builder.

```js
const MOODS = {   // one mood per page changes only the sky, the sun, the hills and the ground tints
  day:  { top: "#f6cf8e", bot: "#fdf1d4", hill: "#c8c78a", ground: "#e8c07a" },
  dusk: { top: "#7b5a86", bot: "#f2c8a0", hill: "#8d7a91", ground: "#a98a78" },
};
function sky(m, id) {
  const M = MOODS[m];
  return svgT(1080, 1920, `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${M.top}"/><stop offset=".62" stop-color="${M.bot}"/></linearGradient></defs>
    <rect x="-400" y="-400" width="1880" height="2700" fill="url(#${id})"/><g filter="url(#wc)">${W(blob(840, 560, 110, 110, { seed: 4 }), "#f3c24f", 0.9)}</g>`);
}
function hills(m) { const M = MOODS[m]; return svgT(1080, 1920, `<g filter="url(#wc)">${W(cr([[-300, 1000], [200, 930], [560, 960], [900, 905], [1400, 1000], [1400, 1500], [-300, 1500]]), M.hill, 0.9)}</g>`); }
function ground(m, y0) { const M = MOODS[m]; return svgT(1080, 1920, `<g filter="url(#wc)">${W(cr([[-300, y0 - 140], [420, y0 - 128], [1100, y0 - 130], [1400, y0 - 150], [1400, 2300], [-300, 2300]]), M.ground, 0.95)}</g>`); }
function fore(m, y0) {   // grass and flowers, big, full to the bottom edge
  const q = rng(500); let g = "";
  for (let i = 0; i < 40; i++) { const x = q() * 1080, h = 160 + q() * 340; g += W(`M${f1(x)} 1950Q${f1(x + (q() - 0.5) * 60)} ${f1(1950 - h / 2)} ${f1(x + (q() - 0.5) * 80)} ${f1(1950 - h)}Q${f1(x + 14)} ${f1(1950 - h / 2)} ${f1(x + 22)} 1950Z`, i % 2 ? "#8fa862" : "#789a52", 0.85); }
  return svgT(1080, 1920, `<g filter="url(#wcs)">${g}</g>`);
}
function buildPage(key, mood, o = {}) {
  const el = document.createElement("div"); el.className = "pg"; el.id = "pg" + key; el.style.zIndex = 10 - (o.z || 0);
  el.innerHTML = `<div class="win"><div class="lay" id="${key}0">${sky(mood, key + "s")}</div><div class="lay" id="${key}1">${hills(mood)}</div>
    <div class="lay" id="${key}2">${ground(mood, 1240)}<svg class="lay air" id="${key}air" width="1080" height="1920" viewBox="0 0 1080 1920"></svg></div>
    <div class="lay" id="${key}3">${fore(mood, 1240)}</div></div>
    ${frameSVG(o.tint || "#a8643c").replace("<svg ", '<svg class="frame" ')}<div class="hd" id="${key}hd">${o.heading || ""}</div><div class="cast"></div><div class="shade"></div>`;
  el.querySelector(".win").style.webkitMaskImage = MASK;
  el.insertBefore(grainCanvas(GRAIN), el.querySelector(".hd"));   // paper grain sits over the paint
  stage.appendChild(el);
  return { el, key, layers: [0, 1, 2, 3].map((i) => $(key + i)), air: $(key + "air") };
}
```


## Page turn and the paper caption strip

The old page turns about its left edge (opaque pages, `backface-visibility: hidden`) starting 0.5 s before the next line, so the new page is up when the voice begins. `bounds` are the line starts.

```js
const PA = buildPage("A", "day", { z: 0, heading: lettered("A title", 130, { style: "top:140px" }), tint: "#b0703c" });
const PB = buildPage("B", "dusk", { z: 1, heading: lettered("A second page", 100, { style: "top:150px;font-style:italic" }), tint: "#7a5c86" });
const pages = [PA, PB], bounds = [0, lineStart(1)];
bounds.slice(1).forEach((b, i) => {
  const old = pages[i], nxt = pages[i + 1], t0 = b - 0.5, d = 0.8;
  tl.set(old.el, { transformOrigin: "0% 50%" }, 0);
  tl.fromTo(old.el, { rotationY: 0 }, { rotationY: -104, duration: d, ease: "power2.inOut" }, t0);
  tl.fromTo(old.el.querySelector(".shade"), { opacity: 0 }, { opacity: 0.7, duration: d * 0.8, ease: "power1.in" }, t0 + d * 0.15);
  tl.fromTo(nxt.el.querySelector(".cast"), { opacity: 0.85 }, { opacity: 0, duration: d * 1.05, ease: "power1.out" }, t0);
  tl.fromTo(nxt.el, { scale: 1.035 }, { scale: 1, duration: d + 0.2, ease: "power2.out", transformOrigin: "50% 50%" }, t0);
  tl.set(old.el, { visibility: "hidden" }, t0 + d + 0.02);
});
camera(PA, 0, lineStart(1), 1, 1.12, 540, 1100, 540, 1000);   // a slow push-in per page
reveal(`#Ahd .lt`, 0.3);
loop(PA.layers[3], { y: -8 }, 0, DUR, 3.2);                    // ambient sway, finite repeats

/* the caption strip: a torn paper label with washi tape; words sit on it, same place all video */
(() => {
  const q = rng(8), top = [], bot = []; for (let i = 0; i <= 16; i++) { top.push(`${f1(i * 62.5)},${f1(6 + q() * 9)}`); bot.push(`${f1(1000 - i * 62.5)},${f1(186 - q() * 9)}`); }
  const cb = vfrey.captionBox;                                  // follow the person's caption position
  if (cb) { $("strip").style.top = (cb.top - 12) + "px"; $("captions").style.top = cb.top + "px"; }
  $("strip").innerHTML = `<svg width="1000" height="200" viewBox="0 0 1000 200" style="overflow:visible"><polygon points="${top.join(" ")} ${bot.join(" ")}" fill="#fbf3df" stroke="#c9a77c" stroke-width="3" stroke-linejoin="round"/><rect x="-24" y="-8" width="132" height="44" rx="4" transform="rotate(-12 40 14)" fill="#e3a84a" fill-opacity=".62"/><rect x="892" y="162" width="132" height="44" rx="4" transform="rotate(-10 958 184)" fill="#b8643a" fill-opacity=".55"/></svg>`;
  vfrey.captions("#captions", { style: "color", font: '"Playfair Display", Georgia, serif', size: 66, color: "#4a3326", highlight: "#b04a2c", maxWords: 5, maxChars: 30, align: "center" });
})();
```


## Small actions

A four-point glint and drifting motes, both tied to the timeline (no timers, no callbacks).

```js
const spark = (parent, x, y, s, t, col = "#fff6c8") => { // four-point glint
  const id = "sp" + (spark.n = (spark.n || 0) + 1);
  parent.insertAdjacentHTML("beforeend", `<g id="${id}" opacity="0" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y - s}Q${x + s * 0.14} ${y - s * 0.14} ${x + s} ${y}Q${x + s * 0.14} ${y + s * 0.14} ${x} ${y + s}Q${x - s * 0.14} ${y + s * 0.14} ${x - s} ${y}Q${x - s * 0.14} ${y - s * 0.14} ${x} ${y - s}Z" fill="${col}" stroke="#d9a73a" stroke-width="2"/></g>`);
  tl.fromTo("#" + id, { opacity: 0, scale: 0.2, rotation: -30 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.28, ease: "back.out(2)" }, t).to("#" + id, { opacity: 0, scale: 0.4, duration: 0.35, ease: "power1.in" }, t + 0.5);
};
function motes(pg, n, col, t0, t1, seed) {
  const q = rng(seed), s = $(pg.key + "dust"); let h = "";
  for (let i = 0; i < n; i++) h += `<circle id="${pg.key}m${i}" cx="${f1(120 + q() * 840)}" cy="${f1(500 + q() * 1100)}" r="${f1(3 + q() * 5)}" fill="${col}" fill-opacity="${f1(0.35 + q() * 0.4)}"/>`;
  s.innerHTML = h;
  for (let i = 0; i < n; i++) { tl.to(`#${pg.key}m${i}`, { y: -(90 + q() * 160), x: (q() - 0.5) * 120, duration: t1 - t0, ease: "none" }, t0); }
}
function drift(sel, dx, t0, t1) { tl.fromTo(sel, { x: -dx }, { x: dx, duration: t1 - t0, ease: "none" }, t0); }
```
