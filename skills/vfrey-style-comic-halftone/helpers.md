# Comic halftone: code to copy

`comic.js` next to this file is the toolkit: copy it into the scene folder (`scenes/<idea>/comic.js`) and load it after `vfrey.js` and GSAP, before your own script. It holds the palette, `P` (the inked, off-register shape), `ht` (dots as a gradient), `burst`, `sfx` (lettering), `box`, `speedRadial`, `streaks`, `bubble`, `dial`, `defs`, `paperUrl`, `panel`, `slam`, `pop`, `flash`, `shake`, `push`, `wireLimb`, `anchors` and `ticker`. This file shows the page around it and the patterns that use it. Coordinates are in a `0 0 1080 1920` drawing space (9:16), not pixels: the stage scales to the frame.

## Page shell

```html
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script>
<script src="vfrey/vfrey.js"></script>
<script src="comic.js"></script>
<style>
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #F4E7C5; }
  #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #F4E7C5; font-family: "Titan One", "Baloo 2", sans-serif; }
  .cam { position: absolute; inset: 0; }
  .panel { position: absolute; }
  .panel > svg { position: absolute; overflow: visible; }
  svg text { font-family: "Titan One", "Baloo 2", sans-serif; }
  svg text.bl { font-family: "Baloo 2", "Arial Black", sans-serif; font-weight: 800; }
  /* the plate follows vfrey's caption band: the same place all film long */
  #capplate { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-left); top: var(--vf-caption-at); height: var(--vf-caption-h); background: #FFD11A; border: 9px solid #16111C; box-shadow: 13px 13px 0 #16111C; z-index: 49; transform: rotate(-0.5deg);
    background-image: radial-gradient(#E8272F 22%, transparent 24%); background-size: 22px 22px; box-sizing: border-box; }
  #capplate::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, #FFD11A 25%, rgba(255,209,26,.35) 60%, #FFD11A 100%); }
  #captions { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-left); top: var(--vf-caption-at); height: var(--vf-caption-h); z-index: 50; text-transform: uppercase; }
  #captions.vf-captions { justify-content: center !important; }
  #paper { position: absolute; inset: 0; z-index: 60; pointer-events: none; mix-blend-mode: multiply; background-size: 256px 256px; opacity: .25; }  /* .4 made a 12.6 Mbps file */
  #dots { position: absolute; inset: 0; z-index: 61; pointer-events: none; mix-blend-mode: multiply; opacity: .06; background-image: radial-gradient(#16111C 28%, transparent 31%); background-size: 9px 9px; }
  #flash { position: absolute; inset: 0; background: #FFFBEF; opacity: 0; z-index: 70; pointer-events: none; }
  #fontwarm { position: absolute; left: -999px; top: 0; font-family: "Titan One"; }
</style>
<div id="root" data-composition-id="main" data-start="0"></div>
```

## Pages, panels, the build order

`ROW_A` (above the plate, or `null`) and `ROW_B` (below it, to the bottom edge) come from `comic.js` and follow `vfrey.captionBox`, so nothing is typed in pixels. A page is one or two panels in `ROW_A` plus one to three in `ROW_B`. Each panel is edge to edge: a ground colour, a `ht` gradient, a subject.

```js
const tl = vfrey.timeline();
const T = anchors([["intro", "word1"], ["beat", "word2"]]);        // the spoken words, found by text, in order
let html = defs("#127A3E");                                          // pass the dot colour of your hero accent
const A = ROW_A, B = ROW_B, half = (B.w - 24) / 2;
html += panel("a1", A.x, A.y, A.w, A.h, [[0, 0], [1, 0], [1, 1], [0, 0.985]],                     // slightly slanted edges
  `<rect width="${A.w}" height="${A.h}" fill="${CY}"/><path d="${ht(A.w, A.h, 26, 0.5, 15, (x, y) => (y / A.h - 0.18) * 1.5)}" fill="${BL}"/>` +   // sky that darkens in dots
  `<g id="hero1w"><g transform="translate(540 ${A.h * 0.62}) scale(1.25)">${hero("h1")}</g></g>` +                                              // your drawn subject
  `<g id="burst1"><g transform="translate(790 330)">${burst(0, 0, 215)}<text x="0" y="10" text-anchor="middle" font-size="112" fill="${RED}" stroke="${INK}" stroke-width="20" paint-order="stroke" transform="rotate(-6)">50</text></g></g>` +
  box("LABEL!", 70, 262, 470, 96, 62, YEL, INK, "title1", -4) + sfx("ZIP!", 330, 580, 150, -10, RED, "zip1"), { z: 12 });
html += panel("b1a", B.x, B.y, half, B.h, [[0, 0.07], [1, 0], [1, 1], [0, 1]], `<rect width="${half}" height="${B.h}" fill="${YEL}"/>` + speedRadial(half / 2, B.h / 2, 110, 380, 28, INK, 0.2, 0.03), { z: 12 });
$("#root").innerHTML = shell(html);
setupPage();                                                         // paper grain on, vfrey captions on the plate
const PG = [{ t: 0, ids: ["a1", "b1a"] }, { t: T.beat - 0.12, ids: ["a2", "b2a"] }];   // a page change starts 0.1 s before its word
slam(PG, { a1: "t", b1a: "l", a2: "l", b2a: "b" });                 // vary the entry side from page to page
// ... choreography per page (below) ..., then last:
ticker();
```

Keep the bottom-right corner of the lowest row to ornament (no text, no number) and keep text out of the top 200 units. `P`, `sfx`, `box` and the burst all draw their own ink; never add a gradient.

## Choreography patterns

```js
// a popped element: hide first, pop on its word; bursts breathe slowly after
["burst1", "zip1", "title1"].forEach(hide);
pop("#title1", 0.1, { at: [300, 310] });                             // `at` = the element's centre in panel units
pop("#burst1", T.intro - 0.05, { at: [790, 330], d: 0.4 });
tl.fromTo("#burst1", { rotation: -4 }, { rotation: 3, duration: 2.6, ease: "sine.inOut", svgOrigin: "790 330" }, T.intro + 0.4);
// an impact: flash, shake on the panel's sk- group, hit-stop shove on the subject, pop the lettering
flash(T.beat, 1, 0.22);
shake("#sk-a1", T.beat + 0.06, 20, 9, 0.5);
tl.to("#hero1w", { x: -60, duration: 0.14, ease: "power2.out" }, T.beat); tl.to("#hero1w", { x: 0, duration: 0.7, ease: "power2.inOut" }, T.beat + 0.5);
pop("#zip1", T.beat + 0.02, { at: [330, 580], d: 0.3 });
push("a1", 0, PG[1].t, 1.0, 1.06, 500, 700);                         // the slow push-in lives on in-<panel>, the shake on sk-<panel>
// a hero moment: ease-in approach while the camera pushes in and radial speed lines fade up, then freeze on the hit
const tI = T.beat;                                                    // the impact
tl.to("#radial4", { opacity: 0.55, duration: 0.1 }, tI - 0.28); tl.to("#radial4", { opacity: 0, duration: 0.25 }, tI + 0.02);
tl.fromTo("#hero4", { scale: 1.0, svgOrigin: "640 400" }, { scale: 1.12, duration: 1.2, ease: "power1.in" }, tI - 1.2);
for (let i = 0; i < 7; i++) {                                         // shards flying slowly after the hit
  const a = -2.6 + i * 0.5, sp = 160 + (i % 3) * 70;
  tl.fromTo("#sd" + i, { x: 700, y: 450, opacity: 1, rotation: 0 }, { x: 700 + Math.cos(a) * sp * 1.6, y: 450 + Math.sin(a) * sp * 1.2 + 100, rotation: 220 * (i % 2 ? 1 : -1), duration: 2.4, ease: "power2.out" }, tI + 0.03);
  tl.to("#sd" + i, { opacity: 0, duration: 0.5 }, tI + 2.2); }
```

## A jointed limb with a smear

Draw the limb as two nested groups, and the same art again, in pale colours, three times for the ghosts. `wireLimb` poses all of them from keyframes each tick.

```js
const LEN = 118;   // upper limb length: the elbow sits at translate(LEN 0)
function limbSvg(p, ghostCol) {   // draw about the shoulder at (0,0), pointing along +x
  const up = ghostCol ? `<path d="${RR(-14, -22, LEN + 24, 44, 22)}" fill="${ghostCol}"/>` : P(RR(-14, -22, LEN + 24, 44, 22), ORG, { sw: 7, shade: "dkO", sr: [-20, 0, LEN + 40, 30] });
  const fore = ghostCol ? `<path d="${E(120, 0, 60, 42)}" fill="${ghostCol}"/>` : P(E(120, 0, 60, 42), RED, { sw: 8, shade: "dk", sr: [50, 8, 130, 40] });
  return `<g id="${p}U">${up}<g id="${p}F" transform="translate(${LEN} 0)">${fore}</g></g>`;
}
const ghosts = (p, x, y) => [1, 2, 3].map((k) => `<g id="${p}G${k}" opacity="0" transform="translate(${x} ${y})">${limbSvg(p + "g" + k, ["#FFF2A8", "#FFD11A", "#FF9A3A"][k - 1])}</g>`).join("");
// in the hero:  ghosts("h1", 90, 40) + `<g transform="translate(90 40)">${limbSvg("h1")}</g>`   (ghosts first, so the real limb is on top)
// keyframes [t, shoulderAngle, elbowAngle, ease]: cock back slowly, hold, then "snap" out, hold, return
wireLimb("h1", () => [[0, 112, -160], [T.beat - 0.2, 124, -168], [T.beat - 0.04, 120, -164], [T.beat + 0.04, 22, -6, "snap"], [T.beat + 0.5, 22, -6, "lin"], [T.beat + 1.2, 112, -160]], { len: LEN });
```

## Counters, gauges, live values

```js
// tween a plain object, write attributes and text in the ticker, end with a small jitter
const g = { v: 0 }, nd = { a: -190 };
tl.fromTo(g, { v: 0 }, { v: 6300, duration: 0.9, ease: "power3.out" }, T.beat);       // the number must be one you can cite
tl.to(nd, { a: 6, duration: 0.45, ease: "power4.out" }, T.beat);
ambient.push((t) => {
  const j = t > T.beat + 0.45 && t < T.beat + 3 ? Math.sin(t * 60) * 1.8 : 0;          // 1.8 degrees of needle jitter
  $("#needle3").setAttribute("transform", `rotate(${f1(nd.a + j)} 240 280)`);
  $("#gnumT").textContent = Math.round(g.v).toLocaleString("en-US") + (g.v > 6290 ? "+" : ""); });
// a drawn trace: stroke-dashoffset on a path with pathLength="1" stroke-dasharray="1"
tl.to("#spikes", { attr: { "stroke-dashoffset": 0 }, duration: 1.4, ease: "none" }, T.beat + 0.3);
// a crack drawn on contact
tl.set("#crack", { attr: { "stroke-dasharray": 700, "stroke-dashoffset": 700 } }, 0); tl.to("#crack", { attr: { "stroke-dashoffset": 0 }, duration: 0.1, ease: "none" }, tI);
```
