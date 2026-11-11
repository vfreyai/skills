# Kinetic type: code to copy

Paste what you need into `scenes/<idea>/index.html`. Positions are in a 1080 by 1920 stage (9:16; scale them for another ratio); `tl` is `vfrey.timeline()`. `measure-type.cjs` next to this file writes the `meas.js` table the scene loads (see "Fitting type" in `SKILL.md`). The script has `"captions": "off"`, so nothing here draws a caption.

## Page shell

```html
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script><script src="vfrey/vfrey.js"></script><script src="meas.js"></script>
<style>
  html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#0e0d0c}
  #root{position:relative;width:100%;height:100%;overflow:hidden;background:#0e0d0c}
  .shot{position:absolute;inset:0;overflow:hidden;opacity:0} .cam{position:absolute;inset:0;will-change:transform}
  .wd{position:absolute;left:0;top:0}                       /* GSAP moves x, y, scale, rotation here */
  .in{position:absolute;left:0;top:0;white-space:pre;line-height:.71;display:block}  /* .71 hugs the cap height, so y is the centre of the caps */
  .stU{font-family:"Playfair Display",serif;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;font-variant-numeric:lining-nums}
  .stI{font-family:"Playfair Display",serif;font-weight:900;font-style:italic;letter-spacing:-.025em}
  .stM{font-family:"JetBrains Mono",monospace;font-weight:500;text-transform:uppercase;letter-spacing:.14em;line-height:1}
  .tx{-webkit-background-clip:text;background-clip:text;color:transparent !important;background-size:cover}  /* marble inside the letters */
  .blk{position:absolute;left:0;top:0} .fl{position:absolute;inset:0}
  .slab{position:absolute;top:-4%;height:108%;width:150%;left:-160%}
  #grain{position:absolute;inset:0;opacity:.10;mix-blend-mode:multiply;pointer-events:none}
  #cG{perspective:1000px;perspective-origin:50% 46%} #world{position:absolute;inset:0;transform-style:preserve-3d} .w3{transform-style:preserve-3d}
</style>
<div id="root" data-composition-id="main" data-start="0">
  <div class="shot" id="sA"><div class="cam" id="cA"></div></div>   <!-- one .shot per idea: sA, sB, ... -->
  <div class="shot" id="sG"><div class="cam" id="cG"><div id="world"></div></div></div>  <!-- only if a shot flies through a tunnel -->
  <div class="slab" id="slab1"></div><div class="slab" id="slab2"></div>
  <canvas id="grain" width="270" height="480" style="width:100%;height:100%"></canvas>
</div>
```

## Basics: colours, seeded random, marble, W(), motion helpers

```js
const INK = "#0e0d0c", BONE = "#ece6d8", RED = "#e8391d";   // the brand accent replaces RED when brand.json has one
const tl = vfrey.timeline(), T = vfrey.timing, D = T.durationSec;
const ws = (i) => T.words[i].start, we = (i) => T.words[i].end;   // word i, counted over the whole script
const lineWord = (line) => T.lines[line].firstWord;                // the first word of a script line
const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
function rng(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
gsap.set(".slab", { skewX: -10 });

// Marble: a seeded canvas (value noise, veins from sin(x + noise)) as a data URL; apply it with `tex` in W().
function marble(base, vein, hi, seed){
  const N = 384, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d"), im = g.createImageData(N, N), R = rng(seed);
  const L = 48, lat = Array.from({ length: L * L }, () => R());
  const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, s = (t) => t * t * (3 - 2 * t);
    const v = (a, b) => lat[((b % L + L) % L) * L + ((a % L + L) % L)], u = s(xf), w = s(yf);
    return (v(xi, yi) * (1 - u) + v(xi + 1, yi) * u) * (1 - w) + (v(xi, yi + 1) * (1 - u) + v(xi + 1, yi + 1) * u) * w; };
  const fbm = (x, y) => { let a = .5, f = 1, s = 0; for (let o = 0; o < 5; o++){ s += a * vn(x * f, y * f); f *= 2; a *= .5; } return s; };
  const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const B = hx(base), V = hx(vein), H = hx(hi);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){
    const n = fbm(x / 70, y / 70), v = Math.abs(Math.sin((x / N * 2.2 + y / N * 1.3 + n * 3.2) * Math.PI));
    const k = Math.pow(1 - v, 7), k2 = Math.pow(1 - Math.abs(Math.sin((x / N * 3.1 - y / N * .8 + n * 5.5) * Math.PI)), 12);
    const i = (y * N + x) * 4; for (let q = 0; q < 3; q++) im.data[i + q] = B[q] * (1 - k) + V[q] * k + (H[q] - B[q]) * k2 * .55; im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return `url(${c.toDataURL("image/png")})`;
}
const TEX = { red: marble(RED, "#5a0f06", "#ff8a6a", 11), ink: marble("#14110f", RED, "#6b6459", 23), bone: marble(BONE, "#2a2420", RED, 37) };

// W(parent, text, "U" caps | "I" italic lowercase | "M" mono tag, { w: target width, h: target cap height, x, y, rot, c: colour, tex, stroke, sw, fs, sy })
// x, y is the centre of the word. h stretches it vertically (sy = h / cap height); stretch up to about 3x is the look.
function W(parent, text, st, o){
  const base = MEAS[st + "|" + text]; if (!base) console.warn("no meas", st, text);   // add the string to meas.js with measure-type.cjs
  const b = base || text.length * 70, fs = o.fs || (o.w / b * 100);
  const capH = (st === "M" ? 0.73 : 0.708) * fs, sy = o.sy || (o.h ? o.h / capH : 1);
  const d = document.createElement("div"); d.className = "wd"; const s = document.createElement("span"); s.className = "in st" + st; s.textContent = text;
  s.style.fontSize = fs + "px"; s.style.transform = `translate(-50%,-50%) scale(1,${sy})`;
  if (o.tex){ s.className += " tx"; s.style.backgroundImage = TEX[o.tex]; s.style.backgroundPosition = "50% 50%"; }
  else if (o.stroke){ s.style.color = "transparent"; s.style.webkitTextStroke = (o.sw || 4) + "px " + o.stroke; }
  else s.style.color = o.c || BONE;
  d.appendChild(s); $(parent).appendChild(d);
  gsap.set(d, { x: o.x, y: o.y, rotation: o.rot || 0, opacity: 0 });
  return { d, s, fs, sy, x: o.x, y: o.y, rot: o.rot || 0 };
}
function box(parent, x, y, w, h, color){ const e = document.createElement("div"); e.className = "blk"; e.style.cssText = `width:${w}px;height:${h}px;background:${color}`; $(parent).appendChild(e); gsap.set(e, { x, y, opacity: 0 }); return e; }
function layer(sh, cls, bg, before){ const e = document.createElement("div"); e.className = cls; if (bg) e.style.background = bg; if (before) $(sh).insertBefore(e, $(before)); else $(sh).appendChild(e); return e; }

// Entrances and camera. Land a slam 0.04 s before the word starts. All of them are tweens on the one timeline.
const slam = (o, t, f = 1.9, dur = .26) => tl.fromTo(o.d, { scale: f, opacity: 0 }, { scale: 1, opacity: 1, duration: dur, ease: "expo.out" }, t);
const slideX = (o, t, dx, dur = .4) => tl.fromTo(o.d, { x: o.x + dx, opacity: 0 }, { x: o.x, opacity: 1, duration: dur, ease: "power4.out" }, t);
const slideY = (o, t, dy, dur = .4) => tl.fromTo(o.d, { y: o.y + dy, opacity: 0 }, { y: o.y, opacity: 1, duration: dur, ease: "power4.out" }, t);
const fadeUp = (o, t, dy = 60, dur = .3) => tl.fromTo(o.d, { y: o.y + dy, opacity: 0 }, { y: o.y, opacity: 1, duration: dur, ease: "power3.out" }, t);
const rise = (o, t, dur = .5) => { tl.set(o.d, { opacity: 1 }, t); tl.fromTo(o.s, { clipPath: "inset(0 0 100% 0)", y: 60 }, { clipPath: "inset(-10% -5% -20% -5%)", y: 0, duration: dur, ease: "power4.out" }, t); };
const grow = (e, t, dur = .35, org = "0% 50%", axis = "scaleX") => tl.fromTo(e, { [axis]: 0, opacity: 1, transformOrigin: org }, { [axis]: 1, opacity: 1, transformOrigin: org, duration: dur, ease: "power4.out" }, t);
const shake = (sh, t, a = 14) => tl.fromTo(sh, { y: a }, { y: 0, duration: .32, ease: "elastic.out(1,.5)" }, t);   // the whole shot jolts as a word lands
const show = (sh, a, b) => { tl.set(sh, { opacity: 1 }, a); tl.set(sh, { opacity: 0 }, b); };
const push = (cam, a, b, s0 = 1, s1 = 1.07, org = "50% 50%") => tl.fromTo(cam, { scale: s0, transformOrigin: org }, { scale: s1, duration: b - a, ease: "power1.inOut", transformOrigin: org }, a);
const marbleDrift = (o, a, dur) => tl.fromTo(o.s, { backgroundPositionX: "5%" }, { backgroundPositionX: "95%", duration: dur, ease: "none" }, a);
```

## Shots and the slanted wipe

```js
// Cut on the voice: a shot starts at the first word of its idea minus about 0.1 s. Grounds are flat ink, bone or red; never a gradient.
const AT = { A: 0, B: ws(lineWord(1)) - .12, C: ws(lineWord(2)) - .12 };       // one entry per shot
const keys = Object.keys(AT), GROUND = { A: INK, B: BONE, C: INK }, ACCENT = { B: RED, C: RED };
keys.forEach((k, i) => { const e = i < keys.length - 1 ? AT[keys[i + 1]] : D + 2; $("#s" + k).style.background = GROUND[k]; show("#s" + k, AT[k], e); });
function wipe(tc, c1, c2){   // two slabs sweep across in about 0.15 s; the swap happens while the first covers the frame (tc)
  tl.set("#slab1", { background: c1 }, tc - .3); tl.set("#slab2", { background: c2 }, tc - .3);
  tl.fromTo("#slab1", { xPercent: 0 }, { xPercent: 90, duration: .14, ease: "power3.in" }, tc - .16);
  tl.fromTo("#slab2", { xPercent: 0 }, { xPercent: 90, duration: .16, ease: "power3.in" }, tc - .14);
  tl.to("#slab1", { xPercent: 190, duration: .26, ease: "power3.out" }, tc + .03);
  tl.to("#slab2", { xPercent: 190, duration: .28, ease: "power3.out" }, tc + .07);
  tl.set(["#slab1", "#slab2"], { xPercent: 0 }, tc + .5);   // set it back, or it stays for the rest of the film
}
for (let i = 1; i < keys.length; i++) wipe(AT[keys[i]], ACCENT[keys[i]], GROUND[keys[i]]);
```

## A shot: stack, flood, rotated echo, wall

```js
(() => {   // shot A: four words stacked to one width and different heights fill the frame, then whip up and a red flood replaces them
  const c = "#cA", sh = "#sA", e = AT.B, w0 = lineWord(0);
  const a = W(c, "FIRST", "U", { w: 900, h: 330, x: 540, y: 330, c: BONE }), b = W(c, "SECOND", "U", { w: 900, h: 420, x: 540, y: 760, c: RED });
  const d = W(c, "THIRD", "U", { w: 900, h: 400, x: 540, y: 1180, tex: "red" }), tag = W(c, "SMALL TAG", "M", { fs: 46, x: 540, y: 1600, c: BONE });
  [a, b, d].forEach((o, i) => { slam(o, ws(w0 + i) - .04, 2.2 - i * .1); shake(sh, ws(w0 + i) - .02, 16 + i * 2); });
  fadeUp(tag, ws(w0 + 3), 40, .25); marbleDrift(d, ws(w0 + 2), 3);
  push(c, 0, ws(w0 + 4), 1, 1.05, "50% 60%");
  const stack = [a, b, d, tag].map((o) => o.d), fl = layer(sh, "fl", RED, c); fl.style.clipPath = "inset(100% 0 0 0)";
  const tw = ws(w0 + 4) - .03;
  tl.to(stack, { y: "-=2300", duration: .32, ease: "power3.in", stagger: .02 }, tw);   // px, not yPercent: the wrapper has no height
  tl.to(fl, { clipPath: "inset(0% 0 0 0)", duration: .3, ease: "power3.inOut" }, tw + .02);
  const cc = layer(sh, "cam");                // the next beat sits on the flood: one long word, rotated, three echoes
  const t5 = ws(w0 + 5) - .1, echo = [W(cc, "echo", "I", { w: 1760, sy: 1.5, x: 300, y: 960, rot: -90, c: INK }),
    W(cc, "echo", "I", { w: 1760, sy: 1.5, x: 590, y: 960, rot: -90, stroke: BONE, sw: 5 }), W(cc, "echo", "I", { w: 1760, sy: 1.5, x: 870, y: 960, rot: -90, stroke: INK, sw: 4 })];
  echo.forEach((o, i) => slam(o, t5 + i * .1, 1.6, .3));
  tl.to(echo.map((o) => o.d), { skewX: -8, duration: e - t5, ease: "sine.inOut" }, t5);
  const wall = [0, 1, 2, 3, 4].map((i) => W(cc, "WALL", "U", { w: 940, h: 268, x: 540, y: 245 + i * 300, c: i === 2 ? RED : INK }));   // the wall: alternate sides, one row red
  wall.forEach((o, i) => tl.fromTo(o.d, { x: o.x + (i % 2 ? 1 : -1) * 1300, opacity: 1 }, { x: o.x, opacity: 1, duration: .34, ease: "power4.out" }, e - 1.2 + i * .05));
})();
```

## Spiral of repeated words, collapsing into a shape

```js
const cx = 540, cy = 930, R0 = 1250, rEnd = 90, turns = 5.5, k = (R0 - rEnd) / (turns * 2 * Math.PI), pts = [];
for (let th = 0; th <= turns * 2 * Math.PI; th += .06){ const r = R0 - k * th; pts.push((cx + r * Math.cos(th - 1.2)).toFixed(1) + " " + (cy + r * Math.sin(th - 1.2)).toFixed(1)); }
const spiral = document.createElement("div"); spiral.style.cssText = "position:absolute;inset:0;opacity:0";
spiral.innerHTML = `<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0"><defs><path id="sp" d="M ${pts.join(" L ")}"/></defs><g id="spiralG"><text font-family="Playfair Display" font-style="italic" font-weight="900" font-size="82" fill="${RED}"><textPath href="#sp" startOffset="0" id="sptp">${"a phrase · another · ".repeat(14)}</textPath></text></g></svg>`;
$("#cB").appendChild(spiral);
const s0 = AT.B, s1 = AT.C - .5;      // spin and pull in while it is on screen; scale to 0 when the next idea lands
tl.fromTo(spiral, { opacity: 0 }, { opacity: 1, duration: .3 }, s0 + .02);
tl.fromTo("#spiralG", { rotation: 0, scale: .9 }, { rotation: 240, scale: 1.35, duration: s1 - s0, ease: "power1.in", svgOrigin: "540 930" }, s0);
tl.fromTo("#sptp", { attr: { startOffset: 0 } }, { attr: { startOffset: 5200 }, duration: s1 - s0, ease: "power1.in" }, s0);
tl.to(spiral, { scale: 0, opacity: 0, duration: .24, ease: "power4.in" }, s1);
```

## Tunnel of words: a camera through layers in depth

```js
// Fast speech (0.1 to 0.15 s a word): one word per layer in depth, the camera (#world) steps to the next at each word.
const list = [["ONE", 0, INK, 520, 300, -4, -60, -100], ["TWO", 1, INK, 640, 340, 3, 60, 90], ["THREE", 2, RED, 780, 400, 0, 0, 0]];   // [text, word index, colour, w, h, rot, dy, dx]
const GAP = 600, kt = [], objs = [], wd = "#world", t0 = AT.C;
list.forEach(([txt, wi, col, w, h, rot, dy, dx], i) => {
  const o = W(wd, txt, "U", { w, h, x: 540 + dx, y: 880 + dy, rot, c: col });
  o.d.className = "wd w3"; gsap.set(o.d, { z: -GAP * i, opacity: 0 }); objs.push(o); kt.push(i === 0 ? t0 : ws(wi) - .06);
});
tl.set(wd, { z: 0 }, 0);
for (let i = 1; i < list.length; i++){ const dur = Math.max(.1, kt[i] - kt[i - 1]); tl.to(wd, { z: GAP * i, duration: dur, ease: dur > .45 ? "sine.inOut" : "none" }, kt[i - 1]); kt[i] = kt[i - 1] + dur; }
// Opacity is a pure function of depth, written by one updater (never also tween opacity on these layers), or they pile up unreadably.
const ramp = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a))), px = { v: 0 };
const upd = () => { const cz = gsap.getProperty(wd, "z"); objs.forEach((o, i) => { const ze = cz - GAP * i; let op = ramp(ze, -1100, -450) * (1 - ramp(ze, 80, 430)); if (i === objs.length - 1) op = ramp(ze, -1100, -450); o.d.style.opacity = op.toFixed(3); }); };
tl.to(px, { v: 1, duration: D - t0, ease: "none", onUpdate: upd }, t0);
vfrey.onFrame(upd);   // onUpdate does not run when a render seeks; this does
tl.fromTo(wd, { rotation: -2 }, { rotation: 2, duration: D - t0, ease: "sine.inOut" }, t0);
```

## Paper grain (static, free in the file size)

```js
(() => { const c = $("#grain"), g = c.getContext("2d"), im = g.createImageData(270, 480), R = rng(9); for (let i = 0; i < im.data.length; i += 4){ const v = 190 + R() * 65; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); })();
```

Other shapes the same helpers make: a split screen (two `box` rects that `scaleY` in from top and bottom), a numeral or `?` as a 1500 px glyph (`fs: 1500`) with rings behind it (`border-radius:50%` borders that scale up and fade), a `01 / 02 / 03` counter in mono, outline copies (`stroke`) above and below a solid word as an echo, and a bone plate under a mono label.
