# 2D flat: code to copy

Paste what you need into `scenes/<idea>/index.html` and change the art. Coordinates are in a `0 0 1080 1920` viewBox (a drawing space, not pixels: the SVG scales to the frame). `C` is your palette object; `tl` is `vfrey.timeline()`.

## Setup, word times, the caption band

```js
const tl = vfrey.timeline();
const WD = vfrey.timing.words, DUR = vfrey.timing.durationSec;
const $ = (s) => document.querySelector(s), lerp = (a, b, u) => a + (b - a) * u;
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9-]/g, "");
// find a spoken word by its text, searching on from the previous hit; never by index
const find = (word, from = 0) => { for (let i = from; i < WD.length; i++) if (norm(WD[i].text) === word) return i; throw new Error("word not found: " + word); };
const at = (word, from = 0) => WD[find(word, from)].start;
// the caption band in viewBox units: put the floor line just above it
const VB = 1920 / vfrey.frame.height, CAP_TOP = vfrey.captionBox.top * VB, CAP_BOTTOM = CAP_TOP + vfrey.captionBox.height * VB;
const GROUND_Y = vfrey.captionBox.position === "bottom" ? CAP_TOP - 30 : 1290;
const ambient = [];   // functions of time (seconds) that redraw attribute-driven art
```

## Scene shell, shared defs, floor to the bottom edge

```css
.scene, .tr { position: absolute; inset: 0; overflow: hidden; }
.cam { position: absolute; inset: 0; transform-origin: 50% 60%; }
svg.layer { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; }
svg text { font-family: "Baloo 2", sans-serif; font-weight: 800; text-anchor: middle; }
svg text.mono { font-family: "JetBrains Mono", monospace; font-weight: 700; } svg text.st { text-anchor: start; }
#capplate { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-left); top: var(--vf-caption-at); height: var(--vf-caption-h); background: #16213E; border-radius: calc(var(--vf-vmin) * 0.044); z-index: 49; }
#captions { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-left); top: var(--vf-caption-at); height: var(--vf-caption-h); z-index: 50; }
#captions.vf-captions { justify-content: center !important; }
```

```js
const scene = (id, bg, bgSvg, fgSvg) => `<div class="scene" id="${id}" style="background:${bg}"><div class="cam" id="${id}c"><svg class="layer" id="${id}b" viewBox="0 0 1080 1920">${bgSvg}</svg><svg class="layer" id="${id}f" viewBox="0 0 1080 1920">${fgSvg}</svg></div></div>`;
const DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
 <g id="valueG"><circle r="50" fill="${C.gold}"/><circle r="50" fill="none" stroke="${C.goldD}" stroke-width="7"/></g>
 <pattern id="floorPat" width="120" height="70" patternUnits="userSpaceOnUse"><rect y="64" width="120" height="6" fill="#000" opacity=".07"/><circle cx="30" cy="30" r="4" fill="#000" opacity=".08"/></pattern>
 <pattern id="dotPat" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="3.2" fill="#fff" opacity=".35"/></pattern>
</defs></svg>`;
// the floor runs from the floor line to below the frame; corner props (draw your own stack/plant/box) sit under the caption band
const floor = (k, y, col) => `<rect x="-20" y="${y}" width="1120" height="${1960 - y}" fill="${col}"/><rect x="-20" y="${y}" width="1120" height="${1960 - y}" fill="url(#floorPat)"/>
  <g id="${k}-dl">${cornerProp(120, 1800)}</g><g id="${k}-dr">${cornerProp(960, 1740)}</g>`;
const decoIn = (k, t) => { tl.from(`#${k}-dl`, { y: 420, duration: 0.7, ease: "back.out(1.4)" }, t); tl.from(`#${k}-dr`, { y: 420, duration: 0.7, ease: "back.out(1.4)" }, t + 0.12); };
// root.innerHTML = DEFS + scene("s0", ...) + trDiv("t1", rimColour) + scene("s1", ...) + ... + `<div id="capplate"></div><div id="captions"></div>`;
const trDiv = (id, col) => `<div class="tr" id="${id}" style="background:${col}"></div>`;
```

## Characters: drawn once, posed by a ticker

```js
const chars = [];
function person(id, o) { // feet at (0,0), about 450 tall. o = { shirt, shirtD, skin, hair, long, glasses, seed }
  const fringe = `<path d="M-68,-338 C-72,-428 72,-428 68,-338 C42,-372 -10,-380 -68,-338Z" fill="${o.hair}"/>`;
  const glasses = o.glasses ? `<g fill="none" stroke="${C.navy}" stroke-width="6"><circle cx="-26" cy="-342" r="21"/><circle cx="26" cy="-342" r="21"/><path d="M-5,-342 h10"/></g>` : "";
  chars.push({ id, seed: o.seed, pose: { aL: 6, aR: 6, hop: 0, smile: 1 }, arm: `<rect x="-21" y="-14" width="42" height="130" rx="21" fill="${o.shirt}"/><circle cx="0" cy="124" r="25" fill="${o.skin}"/>` });
  return `<g id="${id}"><ellipse cx="0" cy="8" rx="120" ry="16" fill="#000" opacity=".13"/><g id="${id}-body">
    <rect x="-52" y="-124" width="44" height="118" rx="14" fill="${C.navy}"/><rect x="8" y="-124" width="44" height="118" rx="14" fill="${C.navy}"/>
    <rect x="-66" y="-22" width="62" height="26" rx="13" fill="#fff"/><rect x="4" y="-22" width="62" height="26" rx="13" fill="#fff"/>
    <g id="${id}-aL"></g><g id="${id}-aR"></g>
    <rect x="-80" y="-292" width="160" height="196" rx="52" fill="${o.shirt}"/><rect x="-80" y="-222" width="160" height="24" fill="${o.shirtD}"/>
    <rect x="-18" y="-312" width="36" height="40" rx="12" fill="${o.skin}"/>
    <g id="${id}-head"><circle cx="0" cy="-348" r="66" fill="${o.skin}"/>${fringe}
     <g id="${id}-eyes"><circle cx="-26" cy="-342" r="8.5" fill="${C.navy}"/><circle cx="26" cy="-342" r="8.5" fill="${C.navy}"/></g>${glasses}
     <path id="${id}-mouth" d="M-18,-318 Q0,-300 18,-318" fill="none" stroke="${C.navy}" stroke-width="6" stroke-linecap="round"/></g></g></g>`;
}
function initChars() { // call once, after root.innerHTML is set
  chars.forEach((c) => { for (const k of ["aL", "aR"]) { $(`#${c.id}-${k}`).innerHTML = `<g class="arm">${c.arm}</g>`; c[k] = $(`#${c.id}-${k} .arm`); }
    for (const k of ["head", "eyes", "body", "mouth"]) c[k] = $(`#${c.id}-${k}`); });
  ambient.push((t) => chars.forEach((c) => { const p = c.pose, sd = c.seed;
    c.body.setAttribute("transform", `translate(0 ${-p.hop})`);
    c.aL.setAttribute("transform", `translate(-78 -262) rotate(${p.aL + Math.sin(t * 2.1 + sd) * 2.5})`);
    c.aR.setAttribute("transform", `translate(78 -262) rotate(${-(p.aR + Math.sin(t * 2.1 + sd + 1.6) * 2.5)})`);
    c.head.setAttribute("transform", `translate(0 ${Math.sin(t * 2.6 + sd) * 2.6}) rotate(${Math.sin(t * 1.3 + sd) * 1.2} 0 -300)`);
    c.eyes.setAttribute("transform", `translate(0 -342) scale(1 ${((t + sd * 0.37) % 3.4) < 0.13 ? 0.1 : 1}) translate(0 342)`);   // blink
    c.mouth.setAttribute("d", `M-18,-318 Q0,${-318 + 20 * p.smile} 18,-318`); }));
}
const place = (id, x, y, s) => gsap.set("#" + id, { x, y, scale: s, svgOrigin: "0 0" });   // place("hero", 290, GROUND_Y, 1.45)
const pose = (id) => chars.find((c) => c.id === id).pose;                                  // tl.to(pose("hero"), { aR: 150, smile: 1.6, duration: .3, ease: "back.out(2)" }, t)
const hand = (x, y, s, a) => ({ x: x + s * (78 + 124 * Math.sin(a * Math.PI / 180)), y: y + s * (-262 + 124 * Math.cos(a * Math.PI / 180)) }); // where the right hand is at arm angle a
// the ONE ticker (after all scenes are built):
const clock = { t: 0 };
tl.to(clock, { t: DUR + 0.3, duration: DUR + 0.3, ease: "none", onUpdate: () => ambient.forEach((f) => f(clock.t)) }, 0);   // live preview only
vfrey.onFrame((t) => ambient.forEach((f) => f(t)));   // what a render runs: onUpdate does not fire on a seek
```

## Shape-wipe transition, camera, idle helpers

```js
const clipFrom = { circle: (x, y) => `circle(0px at ${x}px ${y}px)`, square: () => `inset(50% 50% 50% 50% round 50%)`, rise: () => `inset(100% 0% 0% 0% round 80px)` };
const clipTo = { circle: (x, y) => `circle(2300px at ${x}px ${y}px)`, square: () => `inset(0% 0% 0% 0% round 0%)`, rise: () => `inset(0% 0% 0% 0% round 0px)` };
function transition(rimId, sceneId, kind, x, y, t0) {   // t0 = first word of the next line - 0.5; x, y in frame pixels
  const a = clipFrom[kind](x, y), b = clipTo[kind](x, y);
  tl.set("#" + rimId, { clipPath: a }, 0); tl.set("#" + sceneId, { clipPath: a }, 0);
  tl.to("#" + rimId, { clipPath: b, duration: 0.6, ease: "power2.inOut" }, t0);
  tl.to("#" + sceneId, { clipPath: b, duration: 0.6, ease: "power2.inOut" }, t0 + 0.1);
}
const cam = (id, from, to, t0, dur) => tl.fromTo("#" + id, { scale: from.s, x: from.x, y: from.y }, { scale: to.s, x: to.x, y: to.y, duration: dur, ease: "power1.inOut" }, t0);
const drift = (sel, dx, dur, t0 = 0) => tl.to(sel, { x: dx, duration: dur, ease: "none" }, t0);
const bob = (sel, amp, per, t0 = 0) => tl.fromTo(sel, { y: 0 }, { y: -amp, duration: per, ease: "sine.inOut", yoyo: true, repeat: Math.ceil((DUR + 0.5 - t0) / per) }, t0);
```

## An object tossed in an arc, a bar that grows

```js
// el = a <g> holding <use id="U" href="#valueG"/>; from = hand(...), to = where it lands; tt = the spoken word's time
const c = { u: 0 };
tl.set(el, { opacity: 1 }, tt);
tl.fromTo(c, { u: 0 }, { u: 1, duration: 0.5, ease: "none", onUpdate: () => { const u = c.u, x = lerp(from.x, to.x, u), y = lerp(from.y, to.y, u) - 4 * 105 * u * (1 - u);
  U.setAttribute("transform", `translate(${x} ${y}) scale(${0.62 * Math.cos(u * 14)} 0.62)`); } }, tt);
tl.set(el, { opacity: 0 }, tt + 0.5);                                   // then bounce the landed copy in: ease "bounce.out", 0.22 s
// bars: state in, attributes out; BASE = baseline y, K = value per unit of height
const bar = { v: 0 }; const draw = () => { const h = bar.v / K; rect.setAttribute("y", BASE - h); rect.setAttribute("height", h); label.textContent = fmt(bar.v); label.setAttribute("y", BASE - h - 20); };
tl.to(bar, { v: FINAL, duration: 1.6, ease: "power2.out", onUpdate: draw }, at("word"));
vfrey.onFrame(draw);   // same for the toss arc above: keep its paint in a function and call it here too
```

## Captions on the plate

```js
const groups = vfrey.captions("#captions", { style: "box", size: 74, color: "#FFFFFF", highlight: "#FFC233", highlightText: "#16213E", maxWords: 3 });
tl.set("#capplate", { opacity: 0 }, 0);   // the plate exists only while words are on screen
groups.forEach((g, i) => { const prevEnd = i ? groups[i - 1].end : -9, nextStart = i < groups.length - 1 ? groups[i + 1].start : 99;
  if (g.start - prevEnd > 0.3) tl.fromTo("#capplate", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, Math.max(0, g.start - 0.12));
  if (nextStart - g.end > 0.3) tl.to("#capplate", { opacity: 0, y: 24, duration: 0.15 }, g.end + 0.02); });
```
