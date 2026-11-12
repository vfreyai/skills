# Real 3D: setup, bundle and page shell

three.js is not shipped with vfrey or with this skill. A scene cannot load it from a CDN (the network is blocked while rendering) and ES modules do not load reliably from a file, so you install it into the project once and bundle your scene source and three.js into ONE classic script inside the scene folder.

## 1. Install once (needs the network; ask the person first)

From the project folder:

```
npm install three@0.187
npm install --save-dev esbuild
```

About 30 MB in `node_modules`. This was proven with three.js 0.187; a newer version may rename an import under `three/examples/jsm/`. If the install is refused or the machine is offline, stop and offer another style.

## 2. Copy the starter and the shaders

```
npx vfrey styles start real-3d scenes/<idea>
```

This copies `starter.html` to `scenes/<idea>/index.html`, `scene-starter.js` to `src/<idea>/scene.js` and `glsl.js` to `src/<idea>/glsl.js`, and prints the bundle commands. It does not install three.js (step 1 does).

The source lives in `src/<idea>/` (outside the scene folder); only the bundle goes into `scenes/<idea>/`. `scene-starter.js` is a working skeleton: a star, a lit world, a sky, bloom, a three-shot camera, two tags. Keep the plumbing, replace the cast, the shots and the cues.

## 3. Bundle (after EVERY edit of the source)

```
npx esbuild src/<idea>/scene.js --bundle --format=iife --minify --outfile=scenes/<idea>/scene3d.js --log-level=warning
```

The bundle is about 600 to 700 KB with bloom and wide lines (a scene folder may hold 50 MB). Put the line in a `build.sh` or an npm script so it is one command, and run it before every `render --frame` and every `tick`: vfrey renders whatever bundle is in the scene folder and does not rebuild it.

## 4. The page (`scenes/<idea>/index.html`)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script>
<script src="vfrey/vfrey.js"></script>
<style>
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #000004; }
  #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000004; font-family: "Google Sans Flex", sans-serif; color: #fff; }
  #gl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
  #vig { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,4,0.55) 100%); pointer-events: none; }
  #flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }   /* hides a hard cut */
  #hud { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-right); top: calc(var(--vf-safe-top) + 6px); display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
  #hud-lab { white-space: nowrap; font-family: "JetBrains Mono", monospace; font-weight: 700; font-size: calc(var(--vf-vmin) * 0.031); letter-spacing: 0.1em; color: #ffcf8a; background: rgba(0,0,8,0.62); padding: 7px 14px; }
  #hud-val { font-weight: 800; font-size: calc(var(--vf-vmin) * 0.145); line-height: 1.02; letter-spacing: -0.02em; text-shadow: 0 2px 22px rgba(0,0,10,0.9); }
  .tag { position: absolute; left: 0; top: 0; opacity: 0; font-family: "JetBrains Mono", monospace; font-weight: 700; font-size: calc(var(--vf-vmin) * 0.03); letter-spacing: 0.06em; white-space: nowrap; color: #fff; background: rgba(0,0,10,0.72); border: 2px solid rgba(255,214,150,0.9); padding: 6px 12px; margin-top: -14px; will-change: transform; }
  #captions { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-right); top: var(--vf-caption-at); height: var(--vf-caption-h); }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0">
  <canvas id="gl"></canvas>
  <div id="vig"></div>
  <div id="hud"><div id="hud-lab"></div><div id="hud-val"></div></div>
  <div class="tag" id="tg-a"></div><div class="tag" id="tg-b"></div>
  <div id="flash"></div>
  <div id="captions"></div>
</div>
<script>
  const tl = vfrey.timeline();
  vfrey.captions("#captions", { style: "box", color: "#ffffff", highlight: "#ffb23e", highlightText: "#0a0a14", maxWords: 4 });
</script>
<script src="scene3d.js"></script>
</body>
</html>
```

The canvas has no width or height attribute: the starter sizes it from `vfrey.frame`. The bundle reads the globals `vfrey`, `gsap` and `tl`.

## 5. Preview and render

```
npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 4 out.png
```

A still takes a few seconds; the full film (`tick`, as the vfrey skill describes) about 1.5 to 3.5 minutes for 35 s. The first preview is timed by an estimated voice: after the first full render, check the stills again at the real word times. If a still shows a green box of text, that is the scene's own error message: fix it, rebuild, render again.

## 6. Recipes for `render(t)`

- A HUD number that follows the journey: keep `[time, value]` keys, interpolate geometrically between them (`exp(lerp(log a, log b, s))`), format it, and write `textContent`.
- A tag beside an object: project the object's position, add the object's projected radius to x, write a `translate()` transform; fade with `opacity`.
- A hard cut to a second world: build `sceneB`, `cameraB` and `composerB`; in `render` choose which composer to draw by `t`; flash `#flash` with `opacity = sm(tc - 0.22, tc - 0.01, t) * (1 - sm(tc + 0.02, tc + 0.5, t))`.
- A road for an empty distance: two `line()` rails along the path and points for posts; fade in over 0.4 s, put the camera behind the far target (`dir` about `(-0.97, 0.12, 0.2)`) and shrink `D` from the whole distance to the arrival distance.
- Fog or haze: multiply a body's colour by `exp(-distance * k)` in its fragment shader.
