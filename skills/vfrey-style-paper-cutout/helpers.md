# Paper cut-out: how to use the toolkit

`papercut.js` next to this file is the toolkit: copy it into your scene folder (`cp .agents/skills/vfrey-style-paper-cutout/papercut.js scenes/<idea>/`) and write your scenes in a second file. This page is the shell around it and a worked scene. Coordinates are in a 1080x1920 stage that is scaled to the frame, so numbers below are stage units, not frame pixels.

## What is in `papercut.js`

| Name | What it does |
| --- | --- |
| `C` | the palette, by name |
| `rng(seed)` | seeded random: every jitter comes from one |
| `S(tag, attrs, parent)`, `H(tag, cls, parent, css)` | make an SVG or HTML element |
| `poly(parent, pts, fill, {plain})` | a cut-paper polygon (pale cut edge unless `plain`) |
| `blob`, `blobPts`, `ridge`, `tuft`, `cloud`, `sun`, `starburst` | scissor-cut shapes: rocks, hills (`torn: true` for a torn edge), grass, clouds, a sun, a burst |
| `layer(sc, depth)` | one depth plane with its own SVG, so a shadow falls between planes |
| `cam(sc, t, dur, A, B, ease, origin)` | the parallax camera: moves every plane by its depth |
| `fore(sc, {c1, c2, fence, seed, y1, y2})` | torn foreground strata with rocks and tufts, to fill the frame below the captions |
| `J(parent, x, y)`, `root(parent, x, y, s, flip)` | a joint and a puppet root |
| `Person(parent, opts)`, `personPose`, `personWalk`, `personIdle` | a jointed puppet and its stop-motion poses |
| `steps(t0, t1, fps, fn)`, `STEP(dur)` | the stop-motion driver and a stepped ease for travel |
| `ransom(host, text, opts)`, `popChips(chips, t, gap)` | cut-out letter titles that pop on one by one |
| `plate(host, x, y, w, h, fill, seed, rot)` | a torn paper label |
| `paperStage()`, `mk(colour)`, `SC` | the stage and one sheet per scene |
| `slide(i, t, from)`, `fold(i, t)`, `tear(i, t)` | the three paper transitions into scene `i` |

## Page shell (`index.html`)

```html
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script>
<script src="vfrey/vfrey.js"></script>
<style>
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #2a1d14; }
  #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Baloo 2", sans-serif; }
  #stage { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; overflow: hidden; perspective: 2200px; }
  .sc { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; box-shadow: 0 0 80px rgba(20,10,0,.55); backface-visibility: hidden; }
  .ly { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
  .ly.sh > svg { filter: drop-shadow(0 10px 9px rgba(45,27,12,.38)); }             /* the shadow between paper layers */
  .ly.sh > .ransom, .ly.sh > .plate { filter: drop-shadow(3px 6px 5px rgba(40,24,10,.42)); }
  .cut { stroke: #f6efdd; stroke-width: 5; stroke-linejoin: round; paint-order: stroke; }   /* the pale cut edge */
  .ransom { position: absolute; text-align: center; line-height: 1.12; filter: drop-shadow(3px 5px 4px rgba(35,20,8,.42)); }
  .plate { position: absolute; } .plate > .ransom { filter: none; }
  .rw { display: inline-block; white-space: nowrap; margin: 0 .12em; }
  .chip { display: inline-block; padding: 0 .13em .02em; margin: 0 .025em; line-height: 1.12; }
  #grain, #vig { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; pointer-events: none; }
  #grain { z-index: 80; mix-blend-mode: multiply; opacity: .5; } #vig { z-index: 81; }
  /* captions: a torn paper strip in vfrey's caption band */
  #captions { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-left); top: var(--vf-caption-at); height: var(--vf-caption-h); z-index: 90; }
  #captions .vf-grp.on { position: relative; filter: drop-shadow(3px 6px 5px rgba(35,20,8,.5)); padding: 14px 30px 18px; transform: rotate(-1deg); }
  #captions .vf-grp.on::before { content: ""; position: absolute; inset: 0; z-index: -1; background: #f4ecd8; clip-path: polygon(0 4%, 6% 0, 20% 3%, 38% 0, 55% 3%, 73% 0, 90% 3%, 100% 0, 99% 40%, 100% 70%, 98% 100%, 80% 97%, 60% 100%, 40% 96%, 20% 100%, 4% 97%, 0 100%, 1% 60%); }
  #captions .vf-w { color: #2d2a26; font-weight: 800; padding: 0 10px 4px; border-radius: 4px; }
</style>
<div id="root" data-composition-id="main" data-start="0"><div id="stage"></div><div id="captions"></div></div>
<script src="papercut.js"></script>
<script src="scenes.js"></script>
<script>
  /* still paper grain and a soft vignette, drawn once, above the scenes and below the captions */
  document.getElementById("stage").insertAdjacentHTML("beforeend", `<svg id="grain" viewBox="0 0 1080 1920" width="1080" height="1920"><defs>
    <filter id="fg" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .26  0 0 0 0 .16  1.6 0 0 0 -.62"/></filter>
    <filter id="ff" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.34" numOctaves="3" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .26  1.9 0 0 0 -.84"/></filter></defs>
    <rect width="1080" height="1920" filter="url(#fg)"/><rect width="1080" height="1920" filter="url(#ff)" opacity=".6"/></svg>
    <svg id="vig" viewBox="0 0 1080 1920" width="1080" height="1920"><defs><radialGradient id="vg" cx="50%" cy="46%" r="75%"><stop offset="55%" stop-color="#2a1608" stop-opacity="0"/><stop offset="100%" stop-color="#2a1608" stop-opacity=".42"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#vg)"/></svg>`);
  vfrey.captions("#captions", { style: "box", font: '"Baloo 2", sans-serif', size: 74, color: "#2d2a26", highlight: "#b2523a", highlightText: "#f4ecd8", maxWords: 4 });
</script>
```

## A scenes file (`scenes.js`)

```js
const tl = vfrey.timeline(); paperStage();
const LN = (i) => vfrey.line(i).start, LE = (i) => vfrey.line(i).end;
// a spoken word on line i: anchored, case ignored (/^one/ so "anyone" does not match)
const WD = (i, re, nth = 0) => { const rx = new RegExp(re.source, "i"), ws = vfrey.timing.words.filter((w) => w.line === i && rx.test(w.text)); return ws.length ? ws[Math.min(nth, ws.length - 1)].start : LN(i); };
const TS = [0, LN(1) - 0.62, WD(1, /^key/) - 0.62, LN(2) - 0.62];   // when each scene's transition starts
const VB = 1920 / vfrey.frame.height, CAP_TOP = vfrey.captionBox.top * VB;   // the caption band, in stage units

/* scene 0: sky, sun, hills, a walking puppet, a title, foreground to the bottom edge */
(function () { const sc = mk("#ecc88f"), t0 = TS[0], t1 = TS[1] + 1, r = rng(11);
  const sky = layer(sc, 0.05); sun(sky.svg, 540, 760, [330, 250, 170], ["#e9a25f", "#e2874a", "#dc6f3f"], 3); cloud(sky.svg, 560, 640, 260, C.paper, r);
  const far = layer(sc, 0.25); ridge(far.svg, { y: 900, amp: 50, step: 90, fill: "#d98f5a", seed: 2 });
  const gnd = layer(sc, 0.9);  ridge(gnd.svg, { y: CAP_TOP - 120, amp: 16, step: 80, fill: C.rust, seed: 4 });
  const who = layer(sc, 1.0);  const P = Person(who.svg, { x: 300, y: CAP_TOP - 110, s: 1.5, seed: 4, shirt: C.teal, pants: C.deepteal, hat: "straw" });
  personWalk(P, t0, t0 + 2.4); tl.to(P.mv, { x: 220, duration: 2.4, ease: STEP(2.4) }, t0);       // mid-stride at the start: on screen from frame one
  personIdle(P, t0 + 2.4, t1, { aA: 10, fA: -50 });                                                // end one loop where the next begins
  const txt = layer(sc, null, { html: true });                                                    // fixed layer: text does not move with the camera
  const ttl = ransom(txt.div, "YOUR TITLE", { x: 90, y: 230, w: 900, size: 150, seed: 7 });       // chars * 0.96 * size must be under w
  popChips(ttl.chips, t0 + 0.15, 0.04);
  fore(sc, { c1: "#6b3a2a", c2: "#4a2a20", fence: "#3a241a", seed: 11, y1: CAP_TOP + 80, y2: CAP_TOP + 280 });
  cam(sc, t0, t1 - t0, { x: 0, y: 0, z: 0 }, { x: -90, y: -10, z: 0.05 }); })();
/* ... scenes 1, 2, 3: a new ground colour each ... */
slide(1, TS[1], "right"); fold(2, TS[2]); tear(3, TS[3]);   // after every scene is built
```

## Recipes

- A pop (two stop-motion frames, not eased): `tl.set(el, { autoAlpha: 1, scale: 1.3 }, t).set(el, { scale: 1 }, t + 0.1)`.
- Hidden until its cue: `tl.set(el, { autoAlpha: 0 }, 0)` then `tl.set` or `.to` at the cue. A `fromTo` with `autoAlpha: 1` shows its element from time 0.
- A counter: tween a plain object with a stepped ease and write the text from `vfrey.onFrame`, which runs after every seek in a render and in the preview: `tl.to(o, { n: 986, duration: 1.2, ease: "steps(12)" }, t); vfrey.onFrame(() => (el.textContent = Math.round(o.n)));`. Never write it from a tween's callback: a render seeks with events suppressed, so a callback would never run and the number would freeze.
- A flip card: `tl.fromTo(card, { rotationX: -90, transformPerspective: 900 }, { rotationX: 0, duration: 0.4, ease: "steps(4)" }, t)`.
- A new puppet: `const A = root(svg, x, y, scale)`, then `const hip = J(A.bl, 0, -120)`, draw the thigh with `poly(hip, ...)` around (0,0), `const knee = J(hip, 0, 60)`, and so on. Pose with `tl.set(hip, { rotation }, t)` inside `steps(t0, t1, 8, (k, t) => ...)`. Walk: hip `-amp * sin p`, knee `lift * max(0, cos p)`, the other leg half a cycle later, 8 frames a cycle.
- A map beat: project longitude and latitude to stage units with two small functions, draw the country as one polygon and the region in the accent colour, pop a pin, and push the camera with the target as `origin`.
