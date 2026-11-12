# Neon synthwave: code to copy

The drawing code is in `neon.js` next to this file (light tubes, chrome titles, sky, sun, mountains, drifting grid, glitch cuts). Copy it into `scenes/<idea>/` and load it from the page. This file holds the page shell, the caption plate and a scene skeleton. Coordinates are in a `0 0 1080 1920` design space for 9:16: `neon.js` scales `#frame` to the real frame and reads the caption band from `vfrey.captionBox`, so nothing is placed from a typed pixel row except the art itself.

## Page shell: world, VHS layers, caption plate

```html
<!doctype html>
<html lang="en"><head><meta charset="UTF-8" />
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script>
<script src="vfrey/vfrey.js"></script>
<style>
  html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#07011a}
  #root{position:relative;width:100%;height:100%;overflow:hidden;font-family:"Baloo 2",sans-serif;background:#07011a}
  #frame{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0;overflow:hidden}
  #world{position:absolute;left:0;top:0;width:1080px;height:1920px;filter:url(#ca)}
  #world>svg,#fx,#scan,#vig{position:absolute;left:0;top:0;width:1080px;height:1920px}
  .sc{transform-origin:540px 900px}
  #scan{pointer-events:none;z-index:20;background:repeating-linear-gradient(0deg,rgba(0,0,0,.20) 0 2px,rgba(0,0,0,0) 2px 5px);mix-blend-mode:multiply}
  #vig{z-index:21;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 55%,rgba(8,0,26,.62) 100%)}
  #band{position:absolute;left:-40px;width:1160px;height:150px;z-index:22;pointer-events:none;opacity:0;mix-blend-mode:screen;
    background:linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(190,230,255,.13) 45%,rgba(255,255,255,.22) 52%,rgba(255,255,255,0) 100%)}
  #fx{z-index:23;pointer-events:none}
  .gb{position:absolute;left:0;width:1080px;opacity:0;mix-blend-mode:screen}
  /* captions live outside the scaled and filtered #frame so they stay sharp and follow the real caption band */
  #captions{position:absolute;left:var(--vf-safe-left);right:var(--vf-safe-right);top:var(--vf-caption-at);height:var(--vf-caption-h);z-index:40}
  #captions .vf-grp.on{position:relative;padding:16px 30px 22px;text-align:center}
  #captions .vf-grp.on::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(14,2,40,.90),rgba(30,4,66,.90));
    border:3px solid #ff2bd6;box-shadow:0 0 14px #ff2bd6,0 0 34px rgba(255,43,214,.55),inset 0 0 18px rgba(255,43,214,.35)}
  #captions .vf-w{color:#fff;font-weight:800;padding:0 9px 2px;text-shadow:0 0 10px rgba(80,230,255,.75),-2px 0 rgba(255,40,120,.55),2px 0 rgba(40,230,255,.55)}
</style></head>
<body>
<svg width="0" height="0" style="position:absolute"><defs>
  <!-- always-on subtle chromatic aberration: red shifted -3, blue +3, screen blend -->
  <filter id="ca" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx="-3" dy="0" result="ro"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx="3" dy="0" result="bo"/>
    <feBlend in="ro" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen"/>
  </filter>
  <!-- glitch filter used during a cut: stripe displacement (scale tweened by glitchCut) plus a wider channel split -->
  <filter id="gl" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.0007 0.045" numOctaves="1" seed="3" result="n"/>
    <feDisplacementMap id="dmap" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx="-9" dy="0" result="ro"/>
    <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
    <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx="9" dy="0" result="bo"/>
    <feBlend in="ro" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen"/>
  </filter>
</defs></svg>
<div id="root" data-composition-id="main" data-start="0">
  <div id="frame">
    <div id="world"></div>
    <div id="scan"></div><div id="vig"></div><div id="band"></div><div id="fx"></div>
  </div>
  <div id="captions"></div>
</div>
<script src="neon.js"></script>
<script src="scene.js"></script>   <!-- or an inline <script> with the scene code below -->
<script>
  vfrey.captions("#captions", { style: "box", font: '"Baloo 2", sans-serif', size: 76, color: "#ffffff", highlight: "#ff2bd6", highlightText: "#ffffff", maxWords: 4 });
</script>
</body></html>
```

## Scene skeleton: background, scenes, cuts, one picture

```js
// cuts[i] = when scene i starts; each cut is centred 0.16 s before its line begins.
const cuts = [0, LN(1) - 0.16, LN(2) - 0.16, LN(3) - 0.16];
const bgx = buildBackground();
const sc = makeScenes(cuts);
const gridCols = [C.mag, C.cya, C.mag, C.yel];       // one accent per scene; the grid takes it
gridCols.forEach((c, i) => bgx.gridColour(cuts[i], c));

// One scene: a chrome title, a hero of a few neon paths, a keyed beat on the key word.
(function () {
  const s = sc[0], t0 = 0.3;
  ambient(s, 5, [C.cya, C.mag, C.yel], 9);
  const title = chrome(s, "HEADLINE", 540, 330, 130, { stroke: C.mag });
  tl.fromTo(title, { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: .45, ease: "power3.out" }, t0);
  const L = glowG(s, C.cya);                          // ONE glow group per colour
  const body = neon(L, `M300,${HY} V700 H780 V${HY}`, C.cya, { w: 7, fill: C.ink, fa: .92 });   // dark plate fill hides the grid
  const detail = neon(L, "M340,760 H740 M340,820 H740", C.mag, { w: 4 });
  const ring = neon(L, circlePath(540, 560, 90), C.yel, { w: 6 });
  drawAll([body, detail, ring], t0 + .15, .6, .12);
  const key = WD(0, /keyword/);
  bloom(s, 540, 560, C.yel, key + .1);
  hud(s, "LABEL  //  YEAR", C.cya, t0);               // optional readout under the caption plate
})();

for (let i = 1; i < cuts.length; i++) glitchCut(sc, i, cuts[i]);
vhsAmbient([3.2, 9.8, 15, 21.5]);                      // tracking band rolls down a few times
tl.set(world, { filter: "url(#ca)" }, 0);
```

## Dimming the sun and recolouring

```js
// Behind scenes with small line art, dim the sun so yellow and cyan lines stay readable.
[[2, .5], [3, .6]].forEach(([i, o]) => tl.set(bgx.sunG, { opacity: o }, cuts[i]));
tl.set(bgx.sunG, { opacity: 1 }, 0);
```

## Plain voice timing lookup

```js
// Seconds a word starts: WD(lineIndex, /regex/, nth). Falls back to the line start when the word is not found.
const tHook = WD(0, /headline/);
// Seconds a line starts: LN(i). The real voice times are in vfrey/timing.json once one tick has been made.
```
