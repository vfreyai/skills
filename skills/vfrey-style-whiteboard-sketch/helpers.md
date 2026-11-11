# Whiteboard sketch: code to copy

Copy `sketch.js` next to this file into the scene folder (`scenes/<idea>/sketch.js`) and load it. Paste the rest into `scenes/<idea>/index.html` and change the art. Coordinates are in a `0 0 1080 1920` viewBox (a drawing space for 9:16, not pixels: the SVG scales to the frame). `tl` is `vfrey.timeline()`.

## Page shell

```html
<!doctype html>
<html lang="en"><head><meta charset="UTF-8" />
<script src="vfrey/gsap.min.js"></script><script src="vfrey/vfrey.js"></script>
<style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#f4f2ea}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:#f4f2ea}
#cam{position:absolute;left:0;top:0;width:1080px;height:1920px}
svg.layer,#frame,#caps{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:visible}
#frame{z-index:95;pointer-events:none}#caps{z-index:100}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0"><div id="cam"></div>
<svg id="frame" viewBox="0 0 1080 1920"></svg><svg id="caps" viewBox="0 0 1080 1920"></svg></div>
<script>const tl = vfrey.timeline();</script>
<script src="sketch.js"></script>
<script>
/* scene code: word anchors, sketchDefs(), layers, art, pen, transitions, camera, frame, captions */
</script></body></html>
```

`#cam` holds every art layer, the eraser and the pen so they move together under the camera. `#frame` and `#caps` sit outside it and never move.

## What `sketch.js` gives you

Load it inside `<body>`, after `vfrey.js` and after `const tl = vfrey.timeline()` (the functions read the globals `tl` and `gsap`). It defines plain globals, no modules. Everything random comes from the seeded `rnd()`, so every seek renders the same drawing.

- Basics: `NS`, `W`, `H`, colours `INK` `BLUE` `RED` `BOARD` `PLATE`, `$`, `el(name, attrs, parent)`, `rnd()`, `rr(a, b)`, `clamp`.
- Point lists (a stroke is `[[x, y], ...]`):
  - `LN(x1, y1, x2, y2)` a slightly bowed line that overshoots both ends.
  - `PL(points)` a polyline with corners. `CR(points)` a smooth curve through the points.
  - `ELL(cx, cy, rx, ry, {a0, sweep})` an oval swept about 370 degrees, so it never quite closes. `RECT(x, y, w, h, rot)` four sides that overshoot at the corners.
  - `STAR(cx, cy, r)`. `ARROW(x1, y1, x2, y2, bow, headSize)` returns `[shaft, head]`.
  - `HATCH(polygon, angle, gap)` one back-and-forth marker scribble clipped to a polygon; `RECT_POLY(x, y, w, h)` and `OVAL_POLY(cx, cy, rx, ry)` make the polygons.
  - `wob(points, amp)` offsets every point along its normal by smooth noise (three sines, random phases). All the helpers above end in it; call it on a list you made by hand. `dens(points)` adds points so a long segment draws smoothly, `cr(points)` is the raw Catmull-Rom curve, `plen(points)` the length.
- Lettering: `TXT(string, x, y, h, {anchor, rot, track, slant, amp})` turns a string into `{ strokes, width }` from the single-stroke glyph table `GL`; `TI(string, x, y, h, colour, opts)` wraps it as items for `build`; `TWID(string, h)` measures a string. `(x, y)` is the start of the baseline, `h` the cap height, `anchor` is `"start"`, `"middle"` or `"end"`, `rot` is radians about `(x, y)`. Stroke width for lettering is about `0.085 * h`.
- Drawing on: `sketchDefs()` (once, first), `layer(id, z)` adds a full-frame `<svg>` to `#cam` that starts with the opaque board and has a rough-edged ink group. `ink(layer, points, {c, w, t, d, ease, pen, g})` draws one stroke on over `d` seconds from time `t`. `I(points, colour, width)` makes an item. `build(layer, items, t0, t1, {speed, maxK, gap, minD, g})` times a list of items so they exactly fill the window `[t0, t1]`. `grp(layer)` makes a group (to fade a set later), `pop(group, t)` and `fade(group, t)`.
- `PS` is the pen registry: `ink` pushes `{t0, d, ease, pts, cum, len, c}` for each stroke unless `pen: false`.

Characters the glyph set covers: `A` to `Z`, `0` to `9`, and `? . , ' - ! = + % / : ( )`. Lowercase is drawn as capitals; a space is a gap. Any other character (an accented letter, `&`, `@`, `#`, a quote mark, any non-Latin script) is silently drawn as a gap, so a word loses a letter with no warning. Strip accents first with `s.normalize("NFD").replace(/[̀-ͯ]/g, "")`. For any other character add a glyph to `GL` before the first `TXT` call: `GL["&"] = [width, "M... path in a box 100 tall", "second stroke"]` (the number is the advance width; each string is one pen stroke made of `M`, `L` and `C`). A script in a language outside Latin (Arabic, Hebrew, Thai, Devanagari, Japanese and so on) needs another style, or a much larger table.

```js
// A small scene: a title written on, a chart with a hatched bar, a labelled arrow. Times are seconds (use spoken-word times).
sketchDefs();
const L = layer("sA", 50);
build(L, [
  ...TI("HOW IT WORKS", 540, 260, 96, RED, { anchor: "middle", w: 10 }),
  I(LN(160, 300, 920, 296), RED, 8),
  I(LN(130, 1000, 130, 420), INK, 9), I(LN(125, 996, 960, 996), INK, 9),
  I(RECT(300, 680, 140, 316, 0.01), INK, 7), I(HATCH(RECT_POLY(306, 686, 128, 304), 0.8, 18), BLUE, 5),
  ...ARROW(700, 600, 450, 700, 0.15).map((p) => I(p, INK, 6)),
  ...TI("THIS ONE", 760, 590, 50, INK),
], 0.1, 3.2, { speed: 1800 });          // the strokes are timed to fill the window exactly
const done = grp(L); build(L, TI("DONE", 540, 1100, 70, BLUE, { anchor: "middle" }), 4, 4.6, { g: done });
fade(done, 6.5);                        // something that is written, then removed
```

`build` warns in the console (`dense scene ... needs k 0.5`) when the window is too short for the strokes: cut strokes or widen the window.

## Word anchors from the real voice timing

```js
const TW = vfrey.timing.words, DUR = vfrey.timing.durationSec;
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, "");
// words in spoken order; a second entry renames a repeated word. A missing word throws, so a script change shows up at once.
const A = {}; let _p = 0;
[["first"], ["second"], ["third"], ["second", "second2"]]
  .forEach(([w, k]) => { for (let i = _p; i < TW.length; i++) if (norm(TW[i].text) === w) { A[k || w] = TW[i].start; _p = i; return; } throw new Error("word not found: " + w); });
// build(L, items, A.first - 0.05, A.second - 0.1)
```

## The caption band: where the note goes, and the zones around it

The sticky note is the caption plate, and the scene writes the words itself, so it must follow vfrey's setting. Place it from the band, never from typed pixels.

```js
const CAPS = vfrey.timing.captions || { mode: "on" };              // { mode, position?, style? }
const VB = 1920 / vfrey.frame.height;                                // frame pixels to viewBox units
const CAP_H = vfrey.captionBox.height * VB, CAP_TOP = vfrey.captionBox.top * VB;
const NOTE_H = Math.min(200, CAP_H), NOTE_Y = CAP_TOP + (CAP_H - NOTE_H) / 2;   // the note, centred in the band
const TOP_BAND = vfrey.captionBox.position === "top";
const ART_TOP = TOP_BAND ? NOTE_Y + NOTE_H + 40 : 110;               // main drawing zone
const ART_BOTTOM = TOP_BAND ? 1700 : NOTE_Y - 20;
const STRIP_TOP = TOP_BAND ? 110 : NOTE_Y + NOTE_H + 40;             // the second zone: timelines, legends, a hero word
const STRIP_BOTTOM = TOP_BAND ? NOTE_Y - 20 : 1720;                  // nothing below y 1720: the tray, and the camera push
```

Camera `transformOrigin` is `540px ${NOTE_Y}px`.

## Frame (aluminium edge, marker tray)

```js
const frameSvg = $("#frame");
(() => {
  const marker = (x, y, rot, col) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-6" y="-2" width="250" height="40" rx="14" fill="#f2f3f7" stroke="#8b8f9a" stroke-width="2"/><rect x="170" y="-2" width="74" height="40" rx="12" fill="${col}"/><rect x="82" y="-2" width="48" height="40" fill="${col}" opacity=".9"/><path d="M-6 6 L-34 17 L-34 21 L-6 32Z" fill="#dfe1e8" stroke="#8b8f9a" stroke-width="2"/><path d="M-34 17 L-46 19 L-34 21Z" fill="${col}"/><rect x="0" y="4" width="238" height="8" rx="4" fill="#fff" opacity=".6"/></g>`;
  frameSvg.innerHTML = `<defs><linearGradient id="trayG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9ccd3"/><stop offset="0.35" stop-color="#e7e9ee"/><stop offset="0.7" stop-color="#aeb2bb"/><stop offset="1" stop-color="#8d919b"/></linearGradient></defs>
  <rect x="0" y="1788" width="1080" height="132" fill="url(#trayG)"/><rect x="0" y="1788" width="1080" height="10" fill="#6f737d"/><rect x="0" y="1798" width="1080" height="5" fill="#f4f5f8" opacity=".8"/>
  <rect x="0" y="1880" width="1080" height="40" fill="#74777f" opacity=".5"/>
  ${marker(150, 1820, -2, INK)}${marker(430, 1840, 1.5, BLUE)}
  <rect x="0" y="0" width="18" height="1790" fill="#b4b7bf"/><rect x="1062" y="0" width="18" height="1790" fill="#b4b7bf"/><rect x="0" y="0" width="1080" height="14" fill="#c3c6cd"/>
  <polygon points="200,0 420,0 140,1790 -80,1790" fill="#fff" opacity=".07" filter="url(#blur14)"/>`;
})();
```

The markers lie on the left of the tray; the bottom-right corner stays clear for the `AI-GENERATED` label.

## Hand-written captions on the note

Captions are drawn with `TXT`, not `vfrey.captions`, so the lettering matches the board. They must still obey the setting: when `CAPS.mode` is `"off"` draw no note and no words.

```js
const capSvg = $("#caps");
if (CAPS.mode !== "off") {
  const ny = NOTE_Y, nh = NOTE_H;
  capSvg.innerHTML = `<defs><filter id="shadow" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity=".28"/></filter></defs>
  <g transform="rotate(-0.8 540 ${ny + nh / 2})" filter="url(#shadow)"><path d="M62 ${ny} L1018 ${ny - 4} L1022 ${ny + nh - 6} L980 ${ny + nh + 6} L66 ${ny + nh} Z" fill="${PLATE}"/><path d="M1022 ${ny + nh - 6} L980 ${ny + nh + 6} L984 ${ny + nh - 36} Z" fill="#e6d37f"/>
  <rect x="120" y="${ny - 20}" width="150" height="38" fill="#cfc9b4" opacity=".6" transform="rotate(-4 195 ${ny - 1})"/><rect x="830" y="${ny - 22}" width="150" height="38" fill="#cfc9b4" opacity=".6" transform="rotate(3 905 ${ny - 3})"/></g>`;
  const words = TW.map((w) => ({ t: w.text.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9?'.,!%=:/()+-]/g, ""), s: w.start, e: w.end, raw: w.text })), groups = []; let cur = [], ch = 0;
  const flush = () => { if (cur.length) groups.push(cur); cur = []; ch = 0; };
  words.forEach((w) => { if (cur.length && (cur.length >= 3 || ch + w.t.length > 15)) flush(); cur.push(w); ch += w.t.length + 1; if (/[.,?!]$/.test(w.raw)) flush(); });
  flush();
  groups.forEach((gw, gi) => {
    let h = 78; const measure = (hh) => gw.reduce((a, w) => a + TWID(w.t, hh), 0) + 36 * hh / 100 * (gw.length - 1);
    if (measure(h) > 860) h = h * 860 / measure(h);
    const total = measure(h); let x = 540 - total / 2; const g = el("g", { opacity: 0 }, capSvg); const base = ny + nh / 2 + h * 0.5;
    gw.forEach((w) => {
      const T_ = TXT(w.t, x, base, h, { amp: 0.7 }); x += T_.width + 36 * h / 100;
      T_.strokes.forEach((p, si) => {
        const len = plen(p), path = el("path", { d: "M" + p.map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L"), fill: "none", stroke: INK, "stroke-width": Math.max(6, h * 0.1), "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": `${len + 4} ${len + 4}` }, g);
        path.style.strokeDashoffset = len + 4; tl.to(path, { strokeDashoffset: 0, duration: 0.16 + len / 2400, ease: "power1.out" }, Math.max(0, w.s - 0.04 + si * 0.035));
      });
    });
    const gs = gw[0].s - 0.06, nextS = groups[gi + 1] ? groups[gi + 1][0].s - 0.06 : 1e9, ge = Math.min(gw[gw.length - 1].e + 0.35, nextS);
    tl.set(g, { opacity: 1 }, Math.max(0, gs)); tl.set(g, { opacity: 0 }, ge);
  });
}
```

Groups are at most 3 words and 15 characters, broken after `. , ? !`, and shrunk if wider than 860 units. The note and its words stay in one place for the whole film.

## The marker pen (optional, worth it)

Add it after the last `build`, so `PS` is complete. Caption strokes are not in `PS`, so the pen never writes them.

```js
const penSvg = el("svg", { viewBox: "0 0 1080 1920", width: W, height: H, class: "layer" }, $("#cam")); penSvg.style.zIndex = 90;
const penG = el("g", { opacity: 0 }, penSvg);
const penShadow = el("ellipse", { cx: 10, cy: 8, rx: 22, ry: 6, fill: "#000", opacity: 0.14 }, penG);
const penRot = el("g", { transform: "rotate(30)" }, penG);
el("path", { d: "M-4 0 L4 0 L10 -30 L-10 -30 Z", fill: "#2a2a30" }, penRot);
const penTip = el("path", { d: "M-4 0 L4 0 L5 -9 L-5 -9 Z", fill: INK }, penRot);
el("path", { d: "M-10 -30 L10 -30 L17 -66 L-17 -66 Z", fill: "#eceef3", stroke: "#8e929e", "stroke-width": 2 }, penRot);
el("rect", { x: -17, y: -262, width: 34, height: 198, rx: 7, fill: "url(#penBody)", stroke: "#8a8e9a", "stroke-width": 2 }, penRot);
const penBand = el("rect", { x: -17.5, y: -200, width: 35, height: 64, fill: INK }, penRot);
el("rect", { x: -9, y: -178, width: 18, height: 20, rx: 3, fill: "#fff", opacity: 0.8 }, penRot);
const penCap = el("rect", { x: -18, y: -274, width: 36, height: 26, rx: 9, fill: INK }, penRot);
PS.sort((a, b) => a.t0 - b.t0);
let _penC = "";
function penPoint(s, u) { const tgt = u * s.len; let lo = 0, hi = s.cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (s.cum[m] <= tgt) lo = m; else hi = m; } const seg = s.cum[hi] - s.cum[lo] || 1, q = (tgt - s.cum[lo]) / seg, a = s.pts[lo], b = s.pts[hi]; return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q]; }
function penUpdate(t) {
  let lo = -1, hi = PS.length; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (PS[m].t0 <= t) lo = m; else hi = m; }
  if (lo < 0) { penG.setAttribute("opacity", 0); return; }
  const s = PS[lo], end = s.t0 + s.d; let pos, op = 1, lift = 0, col = s.c;
  if (t <= end) pos = penPoint(s, s.ease(clamp((t - s.t0) / s.d, 0, 1)));
  else {
    const nx = PS[lo + 1], gp = nx ? nx.t0 - end : 99, ep = s.pts[s.pts.length - 1];
    if (nx && gp < 0.9) { let q = (t - end) / gp; q = q * q * (3 - 2 * q); const sp0 = nx.pts[0]; pos = [ep[0] + (sp0[0] - ep[0]) * q, ep[1] + (sp0[1] - ep[1]) * q]; lift = Math.sin(Math.PI * q); if (q > 0.5) col = nx.c; }
    else if (t - end < 0.4) { pos = ep; op = 1 - (t - end) / 0.4; lift = (t - end) / 0.4; }
    else { penG.setAttribute("opacity", 0); return; }
  }
  if (col !== _penC) { _penC = col; [penTip, penBand, penCap].forEach((e) => e.setAttribute("fill", col)); }
  penG.setAttribute("transform", `translate(${(pos[0] + 2 - lift * 8).toFixed(1)} ${(pos[1] - lift * 22).toFixed(1)})`);
  penShadow.setAttribute("opacity", 0.14 * (1 - lift * 0.6)); penG.setAttribute("opacity", op);
}
// one proxy tween drives the pen as a pure function of time
const clk = { t: 0 };
tl.to(clk, { t: DUR, duration: DUR, ease: "none", onUpdate: () => penUpdate(clk.t) }, 0);   // live preview only
vfrey.onFrame((t) => penUpdate(t));   // what a render runs: onUpdate does not fire when the film is sought
```

`sketchDefs()` already makes the `penBody` gradient the pen uses.

## Transitions: page flick and eraser wipe

Scene layers stack with the OLD one on top (z 50, 40, 30 ...). Every next layer starts hidden and is shown a moment before the old one leaves. Alternate the two kinds, and put them in the natural pause between lines.

```js
const eraSvg = el("svg", { viewBox: "0 0 1080 1920", width: W, height: H, class: "layer" }, $("#cam")); eraSvg.style.zIndex = 70;
const eraG = el("g", { opacity: 0 }, eraSvg);
el("rect", { x: -160, y: -64, width: 320, height: 128, rx: 18, fill: "#ebe8de", stroke: "#5f636d", "stroke-width": 3 }, eraG);
el("rect", { x: -160, y: 14, width: 320, height: 50, rx: 16, fill: "#2f333d" }, eraG);
el("rect", { x: -150, y: -52, width: 300, height: 16, rx: 8, fill: "#fff", opacity: 0.7 }, eraG);
[[-110, BLUE], [-30, RED], [60, INK]].forEach(([x, c]) => el("rect", { x, y: 38, width: 56, height: 14, rx: 5, fill: c, opacity: 0.45 }, eraG));
function show(L, t) { gsap.set(L.svg, { display: "none" }); tl.set(L.svg, { display: "block" }, Math.max(0, t)); }
function hide(L, t) { tl.set(L.svg, { display: "none" }, t); }
function wipe(L, t0, dur) {          // L = the OLD layer; dur 0.6 to 0.8
  const p = { v: 0 }, s = 140;
  tl.set(eraG, { opacity: 1 }, t0); tl.set(eraG, { opacity: 0 }, t0 + dur);
  const paint = () => {
    const e = -420 + (W + 840) * p.v, y = 900 + 760 * Math.sin(p.v * Math.PI * 6) * (1 - 0.25 * p.v), x = e + s - 2 * s * y / H;
    L.svg.style.clipPath = `polygon(${e + s}px 0,${W + 500}px 0,${W + 500}px ${H}px,${e - s}px ${H}px)`;
    eraG.setAttribute("transform", `translate(${(x + 120).toFixed(1)} ${y.toFixed(1)}) rotate(${(-82 + 20 * Math.sin(p.v * 40)).toFixed(1)} 0 0)`);
  };
  tl.to(p, { v: 1, duration: dur, ease: "power1.inOut", onUpdate: paint }, t0);
  vfrey.onFrame(paint);              // onUpdate does not fire when a render seeks
  hide(L, t0 + dur + 0.02);
}
function flick(L, t0, dur = 0.55) {  // the old page leaves upward; start 0.38 s before the next topic's first word
  L.svg.style.filter = "drop-shadow(0 34px 38px rgba(0,0,0,.38))"; L.svg.style.transformOrigin = "50% 100%";
  tl.to(L.svg, { y: -2250, rotation: -5, duration: dur, ease: "power2.in" }, t0); hide(L, t0 + dur + 0.02);
}
// layers made with layer("sA", 50), layer("sB", 40), ...:
// [LB, LC].forEach((L) => gsap.set(L.svg, { display: "none" }));
// show(LB, tAB - 0.05); flick(LA, tAB);      // tAB = next topic's first word - 0.38
// show(LC, tBC - 0.05); wipe(LB, tBC, 0.78);
```

## Camera

One wrapper for everything that is drawn, slow `sine.inOut` legs, a push on the key area and an ease back at each scene change. Captions and frame are outside it.

```js
gsap.set("#cam", { transformOrigin: `540px ${NOTE_Y}px` });
tl.fromTo("#cam", { scale: 1, x: 0 }, { scale: 1.05, duration: 4.4, ease: "sine.inOut" }, 0);
tl.to("#cam", { scale: 1.0, duration: 0.6, ease: "sine.inOut" }, 4.4);            // back to 1 at a page change
tl.to("#cam", { scale: 1.08, x: 40, duration: 3.2, ease: "sine.inOut" }, 6.0);   // push in with a small drift
```
