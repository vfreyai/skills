# Soft gradient: code to copy

Paste the page shell, then the blocks as one `scene.js` (the shell loads it). `tl` is `vfrey.timeline()`. The frame is a `1080 x 1920` group that scales to the real size. Everything is HTML, CSS and inline SVG; no canvas.

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
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #17143f; }
  #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #17143f; font-family: "Google Sans Flex", "Noto Sans Arabic", sans-serif; color: #241c4e; }
  #frame { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; overflow: hidden; }
  #bg, #bokeh, #stage, #fore, #grain, #soft { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
  #bg { z-index: 0; isolation: isolate; } #bokeh { z-index: 1; } #stage { z-index: 2; } #fore { z-index: 3; }
  .ph { position: absolute; left: -60px; top: -60px; width: 1200px; height: 2040px; opacity: 0; }
  .blob { position: absolute; border-radius: 50%; }
  .bk { position: absolute; border-radius: 50%; }
  .w { position: absolute; }
  .w > * { position: absolute; }

  /* frosted glass: translucent fill, backdrop blur, thin light border, inner top highlight, soft long shadow */
  .glass { box-sizing: border-box; border-radius: 64px; background: linear-gradient(145deg, rgba(255,255,255,.46) 0%, rgba(255,255,255,.20) 46%, rgba(255,255,255,.12) 100%);
    -webkit-backdrop-filter: blur(26px) saturate(1.5); backdrop-filter: blur(26px) saturate(1.5);
    border: 2px solid rgba(255,255,255,.62);
    box-shadow: 0 36px 80px rgba(46,30,110,.22), 0 6px 18px rgba(46,30,110,.10), inset 0 2.5px 0 rgba(255,255,255,.85), inset 0 -24px 44px rgba(255,255,255,.10), inset 0 0 0 1px rgba(255,255,255,.12); }
  .glass::after { content: ""; position: absolute; left: 5%; right: 5%; top: 2.5%; height: 34%; border-radius: inherit; pointer-events: none;
    background: linear-gradient(180deg, rgba(255,255,255,.34), rgba(255,255,255,0)); }
  .round, .round::after { border-radius: 50%; }
  .pill { box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 14px; height: 76px; padding: 0 34px 3px; border-radius: 38px; font-size: 40px; font-weight: 650; letter-spacing: .01em; color: #2a2060; white-space: nowrap;
    background: linear-gradient(180deg, rgba(255,255,255,.90), rgba(255,255,255,.66)); border: 2px solid rgba(255,255,255,.95);
    box-shadow: 0 16px 36px rgba(46,30,110,.20), inset 0 2px 0 #fff; }
  .pill i { display: inline-block; width: 22px; height: 22px; border-radius: 50%; }
  .glow { border-radius: 50%; pointer-events: none; }

  /* 24 hour dial */
  .ring { inset: 34px; border-radius: 50%; background: conic-gradient(from 0deg, #7fc4ff 0deg, #8fb4ff 40deg, #ff9d8a 92deg, #b06ad9 130deg, #3a2a9a 180deg, #5a3fb8 225deg, #ffb08a 268deg, #ffd98a 300deg, #7fc4ff 360deg);
    -webkit-mask-image: radial-gradient(closest-side, transparent calc(100% - 50px), #000 calc(100% - 48px), #000 calc(100% - 1px), transparent 100%); mask-image: radial-gradient(closest-side, transparent calc(100% - 50px), #000 calc(100% - 48px), #000 calc(100% - 1px), transparent 100%); }
  .ring.dim { opacity: .26; }
  #ringmask { inset: 0; --p: 0; -webkit-mask-image: conic-gradient(from 270deg, #000 calc(var(--p) * 1deg), transparent calc(var(--p) * 1deg + .6deg)); mask-image: conic-gradient(from 270deg, #000 calc(var(--p) * 1deg), transparent calc(var(--p) * 1deg + .6deg)); }
  #ringmask .ring { position: absolute; }
  #hub { display: flex; flex-direction: column; align-items: center; justify-content: center; }
  #hubnum { font-size: 150px; font-weight: 750; line-height: .95; color: #2a2060; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
  #hubsub { font-size: 44px; font-weight: 600; color: #4a3f8a; margin-top: 2px; }
  .knob { width: 78px; height: 78px; border-radius: 50%; background: radial-gradient(circle at 34% 28%, #fffdf0 0%, #ffe07a 38%, #ffab3d 78%, #f58a2a 100%); box-shadow: 0 0 0 5px rgba(255,255,255,.8), 0 0 34px 10px rgba(255,214,120,.85), 0 10px 22px rgba(160,80,20,.3); }

  /* day dock */
  #dockseg { border-radius: 52px; background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.60)); border: 2px solid #fff; box-shadow: 0 10px 28px rgba(46,30,110,.22), 0 0 34px rgba(255,255,255,.55), inset 0 2px 0 #fff; }

  .meter { border-radius: 24px; background: rgba(46,30,110,.16); box-shadow: inset 0 2px 6px rgba(46,30,110,.22), 0 1.5px 0 rgba(255,255,255,.6); overflow: hidden; }
  .meter > b { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; border-radius: 24px; transform-origin: 0 50%; background: linear-gradient(90deg, #ffb347, #ffe07a 60%, #fffbe0); box-shadow: inset 0 3px 0 rgba(255,255,255,.7); }

  #grain { z-index: 60; pointer-events: none; opacity: .13; mix-blend-mode: soft-light;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.1 -.1'/></filter><rect width='360' height='360' filter='url(%23n)'/></svg>"); }
  #soft { z-index: 59; pointer-events: none; background: radial-gradient(ellipse at 50% 42%, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 45%, rgba(30,20,80,.16) 100%); }

  /* captions: one frosted near-white plate, deep indigo words, the spoken word in an indigo pill */
  #captions { position: absolute; left: 60px; right: 60px; top: var(--vf-caption-at); height: var(--vf-caption-h); z-index: 50; justify-content: center !important; }
  #captions .vf-grp.on { position: relative; padding: 24px 30px 28px; gap: 6px 4px; max-width: 940px; }
  #captions .vf-grp.on::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: 48px;
    background: linear-gradient(180deg, rgba(255,255,255,.90), rgba(255,255,255,.76)); -webkit-backdrop-filter: blur(30px) saturate(1.4); backdrop-filter: blur(30px) saturate(1.4);
    border: 2px solid rgba(255,255,255,.95); box-shadow: 0 26px 60px rgba(40,26,100,.26), 0 4px 12px rgba(40,26,100,.10), inset 0 2.5px 0 #fff; }
  #captions .vf-w { font-weight: 700; letter-spacing: -.005em; border-radius: 26px; padding: 4px 16px 9px; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0">
  <div id="frame">
    <div id="bg"></div>
    <div id="bokeh"></div>
    <div id="stage"></div>
    <div id="fore"></div>
    <div id="soft"></div>
    <div id="grain"></div>
    <div id="captions"></div>
  </div>
</div>
<script src="scene.js"></script>
</body>
</html>
```


## Timing, widgets, entrances, exits and sway

A widget is an outer point (placed, entered, moved) holding an inner point (floats and sways). Opacity is only ever tweened on the children, never on the widget: an ancestor with opacity or a filter turns `backdrop-filter` off and the glass goes clear.

```js
const tl = vfrey.timeline();
const WORDS = vfrey.timing.words, DUR = vfrey.timing.durationSec;
document.getElementById("frame").style.transform = `scale(${vfrey.frame.width / 1080})`;

/* ---------- timing: sentences and words ---------- */
const sents = []; { let cur = null; WORDS.forEach(w => { if (!cur) { cur = { start: w.start, end: w.end }; sents.push(cur); } cur.end = w.end; if (/[.!?]["')]?$/.test(w.text)) cur = null; }); }
const S = i => sents[Math.min(i, sents.length - 1)].start;
const WD = (re, nth = 0, fb = 0) => { const m = WORDS.filter(w => re.test(w.text)); return m.length ? m[Math.min(nth, m.length - 1)].start : fb; };

/* ---------- tiny helpers ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const $ = (parent, cls, css, html) => { const e = document.createElement("div"); if (cls) e.className = cls; if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; parent.appendChild(e); return e; };
const R = (cx, cy, w, h) => `left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px;`;
let uidN = 0; const uid = () => "g" + (++uidN);
const bg = document.getElementById("bg"), bokeh = document.getElementById("bokeh"), stage = document.getElementById("stage"), fore = document.getElementById("fore");

/* A widget is an outer point (placed, entered, moved) holding an inner point (floats and sways). Children sit around the point.
   Opacity is only ever tweened on the children, never on the widget: an ancestor with opacity or a filter stops backdrop-filter
   from seeing the background, and the glass goes clear for the length of the fade. */
function widget(cx, cy, z = 5, parent = stage) {
  const o = $(parent, "w", `left:${cx}px;top:${cy}px;width:0;height:0;z-index:${z};visibility:hidden;`);
  const i = $(o, "w", "left:0;top:0;width:0;height:0;");
  i.o = o; gsap.set([o, i], { transformPerspective: 1500 }); return i;
}
const kids = w => [...w.children];
function enter(w, t, o = {}) {
  tl.set(w.o, { visibility: "visible" }, t);
  tl.fromTo(kids(w), { opacity: 0 }, { opacity: (i, el) => +(el.dataset.o || 1), duration: o.fade || .6, ease: "power2.out", stagger: o.stagger ?? .05, immediateRender: false }, t);
  tl.fromTo(w.o, { scale: o.from ?? .84, y: o.dy ?? 70, rotationX: o.rx ?? 14 }, { scale: o.to ?? 1, y: 0, rotationX: 0, duration: o.dur || 1.25, ease: o.ease || "elastic.out(1,0.9)", immediateRender: false }, t);
}
function exit(w, t, o = {}) {
  const d = o.dur || .5;
  tl.to(kids(w), { opacity: 0, duration: d * .9, ease: "power2.in" }, t);
  tl.to(w.o, { scale: o.to ?? .9, y: o.dy ?? -60, rotationX: o.rx ?? -8, duration: d, ease: "power2.in" }, t);
  tl.set(w.o, { visibility: "hidden" }, t + d);
}
function sway(w, seed, amp = 12, ry = 5) {
  const r = rng(seed), d = 3.6 + r() * 2.2, s = r() < .5 ? -1 : 1;
  tl.fromTo(w, { y: -amp * s, rotationY: -ry * s, rotation: -.7 * s }, { y: amp * s, rotationY: ry * s, rotation: .7 * s, duration: d, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(DUR / d) }, 0);
}
```


## Mesh-gradient moods, bokeh, parallax

Each mood is a layer of a linear base plus big radial blobs that drift on their own loops; `phase(name, t)` cross-fades to the next. Define `dockTo` (the little mood dock) before the first `phase()` call: a missing helper kills the script and leaves a bare gradient. The `.ph` layers need the z-index lines in the shell (`#bg` isolated).

```js
const dockTo = () => {};                              // replace with the dock's own update
/* ---------- mesh gradient phases ---------- */
const PH = {
  night: { base: "linear-gradient(180deg,#15123c 0%,#2b2270 52%,#5a3a9e 100%)", stars: 1, blobs: [["#6a4be0", 240, 330, 1150], ["#2b49b8", 980, 860, 1250], ["#b266d9", 180, 1480, 1050], ["#ff8fb0", 960, 1860, 820], ["#2a1f7a", 620, 60, 900]] },
  dawn: { base: "linear-gradient(180deg,#ffe3cf 0%,#ffc4a8 55%,#ffb3b3 100%)", blobs: [["#ff9a76", 200, 420, 1150], ["#ffd67a", 930, 250, 1050], ["#ffb5d6", 960, 1150, 1200], ["#fff0dc", 300, 1250, 1000], ["#c7a6ff", 240, 1850, 1000], ["#ffa477", 900, 1880, 900]] },
  day: { base: "linear-gradient(180deg,#d6ecff 0%,#a3d0ff 55%,#b9c4ff 100%)", blobs: [["#63adff", 220, 380, 1200], ["#a8f1ff", 940, 300, 1050], ["#ffffff", 360, 1050, 950], ["#b4bcff", 960, 1250, 1150], ["#ffe9b8", 200, 1800, 950], ["#7fb8ff", 900, 1900, 900]] },
  dusk: { base: "linear-gradient(180deg,#4a3596 0%,#a45aa8 52%,#ff9d7c 100%)", blobs: [["#6c46cf", 240, 300, 1200], ["#3a2c93", 960, 420, 1100], ["#ff7ea6", 900, 1150, 1150], ["#c063c9", 220, 1150, 1050], ["#ffb46b", 300, 1880, 1050], ["#ff8f8f", 930, 1900, 900]] },
  final: { base: "linear-gradient(180deg,#2b2270 0%,#7a4fb8 40%,#ff9f9f 72%,#ffd29a 100%)", stars: 1, blobs: [["#3a2c93", 260, 200, 1150], ["#6c46cf", 930, 420, 1100], ["#d07ad0", 220, 980, 1000], ["#ff9a76", 920, 1250, 1150], ["#ffd67a", 260, 1800, 1100], ["#ffb5d6", 930, 1900, 900]] },
};
const layers = {}; let zTop = 1;
Object.keys(PH).forEach((name, n) => {
  const p = PH[name], L = $(bg, "ph", `background:${p.base};`), r = rng(11 + n * 7);
  p.blobs.forEach(([c, x, y, d]) => {
    const b = $(L, "blob", R(x + 60, y + 60, d, d) + `background:radial-gradient(closest-side, ${c}f2 0%, ${c}b0 34%, ${c}40 68%, ${c}00 100%);`);
    const dur = 5.5 + r() * 4.5, a = r() * 6.283, amp = 130 + r() * 90;
    tl.fromTo(b, { x: -Math.cos(a) * amp, y: -Math.sin(a) * amp, scale: .9 + r() * .1 }, { x: Math.cos(a) * amp, y: Math.sin(a) * amp, scale: 1.12 + r() * .12, duration: dur, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(DUR / dur) }, 0);
  });
  if (p.stars) for (let i = 0; i < 16; i++) {
    const x = 60 + r() * 1080, y = 80 + r() * 1150, s = 16 + r() * 26;
    const st = $(L, "", `position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;`, `<svg viewBox="-10 -10 20 20" width="${s}" height="${s}"><path d="M0,-10 Q1.6,-1.6 10,0 Q1.6,1.6 0,10 Q-1.6,1.6 -10,0 Q-1.6,-1.6 0,-10Z" fill="#fff"/></svg>`);
    const d = 1.1 + r() * 1.6; tl.fromTo(st, { opacity: .15, scale: .6 }, { opacity: .95, scale: 1.1, duration: d, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(DUR / d) }, 0);
  }
  layers[name] = L;
});
let curPhase = "night"; gsap.set(layers.night, { opacity: 1 });
function phase(name, t, dur = 1.8) { const old = layers[curPhase], L = layers[name]; tl.set(L, { zIndex: ++zTop }, t); tl.fromTo(L, { opacity: 0 }, { opacity: 1, duration: dur, ease: "sine.inOut", immediateRender: false }, t); tl.set(old, { opacity: 0 }, t + dur + .02); curPhase = name; dockTo(name, t + dur * .25); }

/* bokeh discs: the only crisp-edged things behind the glass, so the frosting has something to blur */
{ const r = rng(5);
  for (let i = 0; i < 16; i++) {
    const d = 70 + r() * 210, x = r() * 1080, y = 120 + r() * 1800;
    const b = $(bokeh, "bk", R(x, y, d, d) + `background:radial-gradient(closest-side, rgba(255,255,255,.10) 0%, rgba(255,255,255,.20) 72%, rgba(255,255,255,.50) 90%, rgba(255,255,255,0) 100%);opacity:${.35 + r() * .5};`);
    const dur = 4 + r() * 4;
    tl.fromTo(b, { x: -30 - r() * 40, y: 60 + r() * 60 }, { x: 30 + r() * 40, y: -80 - r() * 90, duration: dur, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(DUR / dur) }, 0);
  }
  tl.fromTo(bokeh, { x: 18, y: -10 }, { x: -18, y: 14, duration: 6, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(DUR / 6) }, 0);
  tl.fromTo(stage, { x: -9, y: 6 }, { x: 9, y: -8, duration: 6, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(DUR / 6) }, 0);
}
```


## Glossy icon recipe and a glass card

A radial body lit from the top left, a darker bottom radial for volume, a white rim stroke and a highlight ellipse. Use it for every icon. A card is `.glass` (CSS in the shell) inside a widget.

```js
/* ---------- glossy icons (SVG strings) ---------- */
function sunBody() { const a = uid(), b = uid(), c = uid();
  return `<svg viewBox="-200 -200 400 400" width="100%" height="100%" style="overflow:visible"><defs>
  <radialGradient id="${a}" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#fffdf0"/><stop offset=".42" stop-color="#ffdc66"/><stop offset=".82" stop-color="#ffa63a"/><stop offset="1" stop-color="#f58a2a"/></radialGradient>
  <radialGradient id="${b}" cx="50%" cy="100%" r="75%"><stop offset="0" stop-color="#e8591a" stop-opacity=".42"/><stop offset="1" stop-color="#e8591a" stop-opacity="0"/></radialGradient>
  <linearGradient id="${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <circle r="122" fill="url(#${a})"/><circle r="122" fill="url(#${b})"/><circle r="119" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>
  <ellipse cx="-36" cy="-62" rx="62" ry="34" transform="rotate(-24 -36 -62)" fill="url(#${c})"/><circle cx="52" cy="62" r="9" fill="#fff" fill-opacity=".35"/></svg>`; }
const demo = widget(540, 700, 5);
$(demo, "glass", R(0, 0, 780, 560), "");
$(demo, "", R(0, -40, 300, 300), sunBody());
$(demo, "pill", "left:-130px;top:260px;width:260px;", "A calm label");
enter(demo, 0.4); sway(demo, 3);
phase("day", 2.0);
vfrey.captions("#captions", { style: "box", font: '"Google Sans Flex", sans-serif', size: 66, color: "#221a52", highlight: "#4a36c8", highlightText: "#ffffff", maxWords: 4 });
```
