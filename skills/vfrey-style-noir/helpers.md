# Silhouette noir: code to copy

Paste what you need into `scenes/<idea>/index.html` and draw your own silhouettes with it. Coordinates are in a `0 0 1080 1920` viewBox (a drawing space, not pixels: the SVG scales to the frame). `tl` is `vfrey.timeline()`.

## Page shell: shots, atmosphere layers, caption plate

```html
<style>
  #root{position:relative;width:100%;height:100%;overflow:hidden;background:#020406;color:#f1ece0}
  .shot{position:absolute;inset:0;opacity:0;overflow:hidden} .cam{position:absolute;inset:0;will-change:transform}
  .cam svg{position:absolute;inset:0;width:100%;height:100%;display:block}
  #fx{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen;pointer-events:none}
  #grain{position:absolute;inset:-30px;opacity:.085;mix-blend-mode:overlay;pointer-events:none}
  #vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 75% 62% at 50% 46%,rgba(0,0,0,0) 48%,rgba(0,0,0,.4) 80%,rgba(0,0,0,.8) 100%)}
  #lift{position:absolute;inset:0;background:#12303c;opacity:.13;mix-blend-mode:screen;pointer-events:none}
  #flick,#dip{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none}
  #flash{position:absolute;inset:0;background:#cfe4ec;opacity:0;pointer-events:none;mix-blend-mode:screen}
  #wipe{position:absolute;top:-5%;height:110%;width:170%;left:-175%;pointer-events:none;filter:blur(30px);background:radial-gradient(ellipse 50% 50% at 50% 50%,rgba(70,96,108,.95) 0%,rgba(30,46,54,.9) 45%,rgba(0,0,0,0) 72%)}
  #capshade{position:absolute;left:0;right:0;top:calc(var(--vf-caption-at) - var(--vf-caption-h) * .5);height:calc(var(--vf-caption-h) * 2);pointer-events:none;background:radial-gradient(ellipse 85% 60% at 50% 50%,rgba(0,0,0,.72) 0%,rgba(0,0,0,.45) 55%,rgba(0,0,0,0) 100%)}
  #captions{position:absolute;left:var(--vf-safe-left);right:var(--vf-safe-right);top:var(--vf-caption-at);height:var(--vf-caption-h);font-weight:700}
  #ev{position:absolute;left:var(--vf-safe-left);top:var(--vf-safe-top);max-width:74%;opacity:0;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:calc(var(--vf-vmin) * .041);line-height:1.28;color:#ffb347;background:rgba(0,0,0,.62);border-left:6px solid #ffb347;padding:14px 22px 14px 20px;white-space:pre}
  #ev .c{display:inline-block;width:.55em;height:1em;background:#ffb347;vertical-align:-.12em;margin-left:2px} #ev .k{color:#f1ece0}
</style>
<div id="root" data-composition-id="main" data-start="0">
  <svg width="0" height="0" style="position:absolute"><defs>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03070b"/><stop offset=".5" stop-color="#0f202b"/><stop offset="1" stop-color="#34505d"/></linearGradient>
    <linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3a47"/><stop offset=".5" stop-color="#0b1a22"/><stop offset="1" stop-color="#03080b"/></linearGradient>
    <linearGradient id="gBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".95"/><stop offset=".12" stop-color="#ffc067" stop-opacity=".6"/><stop offset=".45" stop-color="#ffb347" stop-opacity=".2"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></linearGradient>
    <radialGradient id="gGlow"><stop offset="0" stop-color="#ffd08a" stop-opacity=".95"/><stop offset=".25" stop-color="#ffb347" stop-opacity=".5"/><stop offset="1" stop-color="#ff8a1f" stop-opacity="0"/></radialGradient>
    <radialGradient id="gMoon"><stop offset="0" stop-color="#dcebf0" stop-opacity=".9"/><stop offset=".2" stop-color="#9fb8c2" stop-opacity=".4"/><stop offset="1" stop-color="#9fb8c2" stop-opacity="0"/></radialGradient>
    <radialGradient id="gFog"><stop offset="0" stop-color="#5b7782" stop-opacity=".55"/><stop offset="1" stop-color="#5b7782" stop-opacity="0"/></radialGradient>
    <linearGradient id="gShaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d0d8" stop-opacity=".5"/><stop offset="1" stop-color="#b9d0d8" stop-opacity=".04"/></linearGradient>
    <filter id="b3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="b8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="b22" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs></svg>
  <div class="shot" id="s1"><div class="cam" id="c1"></div></div> <!-- one per shot: s2/c2, ... -->
  <canvas id="fx" width="540" height="960"></canvas>
  <div id="wipe"></div><div id="vig"></div><div id="grain"></div><div id="lift"></div><div id="flick"></div><div id="flash"></div><div id="dip"></div>
  <div id="capshade"></div><div id="ev"></div><div id="captions"></div>
</div>
```

## Word times and the shot schedule

```js
const tl = vfrey.timeline(), T = vfrey.timing, D = T.durationSec, AMB = "#ffb347";
function rng(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const L = (i) => vfrey.line(i).start;
function wordT(line, re){ const w = T.words.find((w) => w.line === line && re.test(norm(w.text))); return w ? w.start : L(line); }
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const S = [ { id: "s1", at: 0 }, { id: "s2", at: L(1) - 0.15 }, { id: "s3", at: wordT(2, /^door$/) - 0.25, tr: "wipe" } /* tr: "flash" | "wipe" | none = dip */ ];
S.forEach((s, i) => { s.end = i < S.length - 1 ? S[i + 1].at : D + 0.4; });
const SH = Object.fromEntries(S.map((s) => [s.id, s]));
tl.set("#s1", { opacity: 1 }, 0);
function cam(id, from, to, origin){   // cam("s1", { s: 1.06, y: 40 }, { s: 1.24, y: -20 }, "52% 38%")
  const s = SH[id], el = "#c" + id.slice(1); gsap.set(el, { transformOrigin: origin || "50% 50%" });
  tl.fromTo(el, { scale: from.s, x: from.x || 0, y: from.y || 0 }, { scale: to.s, x: to.x || 0, y: to.y || 0, duration: s.end - s.at + 0.6, ease: "power1.inOut" }, Math.max(0, s.at - 0.1));
}
function transition(i){               // call for i = 1 .. S.length - 1
  const s = S[i], prev = S[i - 1], t = s.at, swap = (tt) => { tl.set("#" + prev.id, { opacity: 0 }, tt); tl.set("#" + s.id, { opacity: 1 }, tt); };
  if (s.tr === "flash"){ tl.set("#flash", { opacity: 0.9 }, t - 0.02); swap(t - 0.02); tl.to("#flash", { opacity: 0, duration: 0.5, ease: "power3.out" }, t); }
  else if (s.tr === "wipe"){ tl.fromTo("#wipe", { xPercent: 0 }, { xPercent: 170, duration: 1.3, ease: "power2.inOut" }, Math.max(0, t - 0.65)); tl.set("#wipe", { xPercent: 0 }, t + 0.75); swap(t + 0.02); }
  else { tl.to("#dip", { opacity: 1, duration: 0.2, ease: "power2.in" }, t - 0.2); swap(t); tl.to("#dip", { opacity: 0, duration: 0.45, ease: "power2.out" }, t); }
}
```

## Drawing helpers

```js
const svgOpen = () => `<svg viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">`;   // host.innerHTML = svgOpen() + layers + "</svg>"
function wavePath(y0, a, P, ph, crest){   // a band with a sine top edge; scrolls by exactly its period P, so the loop has no seam
  let d = crest ? "" : `M ${-2*P} 1960 L ${-2*P} ${y0}`, first = true;
  for (let x = -2*P; x <= 1080 + 2*P; x += 10){ const y = y0 + a*Math.sin(6.2832*x/P + ph) + a*0.35*Math.sin(6.2832*x*2/P + ph*2.3); d += (crest && first ? "M" : "L") + ` ${x} ${y.toFixed(1)} `; first = false; }
  return crest ? d : d + ` L ${1080 + 2*P} 1960 Z`;
}
// bands of water, hills or mist: [{ y, a, P, fill, dur, dir, bob, ph, rim }] back to front; rim = a pale blurred line on the crest
const waves = (list) => list.map((w) => `<g class="wv" data-p="${w.P}" data-dur="${w.dur}" data-dir="${w.dir || 1}" data-bob="${w.bob || 0}"><path d="${wavePath(w.y, w.a, w.P, w.ph || 0)}" fill="${w.fill}"/>
  ${w.rim ? `<path d="${wavePath(w.y, w.a, w.P, w.ph || 0, true)}" fill="none" stroke="${w.rim}" stroke-width="2" opacity="${w.ro ?? .5}" filter="url(#b3)"/>` : ""}</g>`).join("");
function animWaves(root, t0, t1){ $$(".wv", root).forEach((g) => { const P = +g.dataset.p, dur = +g.dataset.dur, bob = +g.dataset.bob;
  tl.to(g, { x: +g.dataset.dir * P, duration: dur, ease: "none", repeat: Math.ceil((t1 - t0) / dur) }, t0);
  if (bob){ const bd = 2.4 + P / 400; tl.to(g, { y: bob, duration: bd, ease: "sine.inOut", yoyo: true, repeat: Math.ceil((t1 - t0) / bd) }, t0); } }); }
function rock(cx, by, w, h, seed, fill){   // a seeded jagged mound; also a hill, a ruin, a treeline
  const r = rng(seed), pts = [[cx - w/2, by + 60]];
  for (let i = 0; i <= 9; i++){ const k = i / 9; pts.push([cx - w/2 + w*k, by - h*(Math.sin(Math.PI*k) ** 0.7)*(0.78 + r()*0.38)]); }
  pts.push([cx + w/2, by + 60]); return `<path d="M ${pts.map((p) => p[0].toFixed(0) + " " + p[1].toFixed(0)).join(" L ")} Z" fill="${fill || "#03070a"}"/>`;
}
function person(x, y, h){                  // a standing figure in a coat and hat, feet at (x, y)
  const w = h*.115, r = h*.062;
  return `<g class="fig"><circle cx="${x}" cy="${y-h+r}" r="${r}" fill="#020406"/><path d="M ${x-r*1.05} ${y-h+r*.55} L ${x+r*1.05} ${y-h+r*.55} L ${x+r*.95} ${y-h+r*.15} Q ${x} ${y-h-r*.7} ${x-r*.95} ${y-h+r*.15} Z" fill="#020406"/>
    <path d="M ${x-w} ${y-h*.84} Q ${x} ${y-h*.9} ${x+w} ${y-h*.84} L ${x+w*1.2} ${y-h*.3} L ${x+w*.9} ${y} L ${x+w*.12} ${y} L ${x+w*.06} ${y-h*.3} L ${x-w*.06} ${y-h*.3} L ${x-w*.12} ${y} L ${x-w*.9} ${y} L ${x-w*1.2} ${y-h*.3} Z" fill="#020406"/></g>`;
}
function beamSet(x, y, len, cls, wid, dir){ // one long soft ray from a lamp at (x, y); dir -1 points left
  const w = wid || 60, tri = (l, k) => `<polygon points="0,-2 ${l},${-w*k} ${l},${w*k} 0,2" fill="url(#gBeam)"/>`;
  return `<g transform="translate(${x} ${y}) scale(${dir || 1} 1)"><g class="${cls}" style="mix-blend-mode:screen"><g filter="url(#b22)" opacity=".7">${tri(len, 3)}</g><g filter="url(#b8)" opacity=".85">${tri(len*.92, 1.1)}</g><g filter="url(#b3)">${tri(len*.7, .3)}</g></g></g>`;
}   // swing: tl.fromTo(".bm1", { rotation: -14 }, { rotation: 9, svgOrigin: "0 0", duration: 4, ease: "sine.inOut", yoyo: true, repeat: N }, t0)
function reflect(x, y0, len, op){           // amber glints under a light, down the water or a wet floor
  let o = ""; for (let i = 0; i < 12; i++){ const w = 24 + i*7 + (i%3)*10; o += `<rect x="${x - w/2 + ((i*37)%30) - 15}" y="${y0 + i*(len/12)}" width="${w}" height="${5 + i*.6}" rx="3" fill="${AMB}" opacity="${((op||.5)*(1 - i/13)).toFixed(2)}"/>`; }
  return `<g style="mix-blend-mode:screen" filter="url(#b3)">${o}</g>`;
}
const glow = (x, y, r, cls) => `<g class="${cls}" style="mix-blend-mode:screen"><circle cx="${x}" cy="${y}" r="${r}" fill="url(#gGlow)"/></g>`;
const cloud = (cx, cy, rx, ry, op) => `<g class="cl" filter="url(#b22)"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#1b2e38" opacity="${op}"/></g>`;
const fogBand = (cx, cy, rx, ry, op) => `<g class="fg" style="mix-blend-mode:screen"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#gFog)" opacity="${op}"/></g>`;
function drift(host, t0, t1){ $$(".cl", host).forEach((g, i) => tl.to(g, { x: (i % 2 ? -1 : 1) * 150, duration: t1 - t0, ease: "none" }, t0));
  $$(".fg", host).forEach((g, i) => tl.to(g, { x: (i % 2 ? 90 : -90), duration: 4, ease: "sine.inOut", yoyo: true, repeat: Math.ceil((t1 - t0) / 4) }, t0)); }
```

## Typed evidence line

```js
function typeEv(t, lines, opts = {}){      // typeEv(0.35, ["PLACE NAME", "MONTH YEAR"], { hold: 2.2 }); first line cream, the rest amber
  const speed = opts.speed || 0.034, total = lines.reduce((a, l) => a + l.length, 0), st = { n: 0 }, el = $("#ev");
  const render = () => { let n = Math.round(st.n), out = "";
    lines.forEach((l, i) => { const take = Math.max(0, Math.min(l.length, n)); n -= l.length; if (take > 0 || i === 0) out += (i ? "\n" : "") + (i === 0 ? '<span class="k">' : "") + l.slice(0, take) + (i === 0 ? "</span>" : ""); });
    el.innerHTML = out + ((Math.floor(tl.time() * 3) % 2 === 0 || st.n < total) ? '<span class="c"></span>' : ""); };
  tl.set(el, { opacity: 1 }, t);
  tl.fromTo(st, { n: 0 }, { n: total, duration: total * speed, ease: "none", onUpdate: render, immediateRender: false }, t);
  vfrey.onFrame(render);   // onUpdate does not run when a render seeks
  const end = t + total * speed + (opts.hold || 1.6);
  tl.to(el, { opacity: 0, duration: 0.25, ease: "power2.in" }, end); tl.set(el, { opacity: 0 }, end + 0.26);
}
```

## Rain, dust, grain and flicker from timeline time

```js
const cv = $("#fx"), g2 = cv.getContext("2d"), FW = 540, FH = 960, R = rng(77);
const drops = Array.from({ length: 320 }, () => ({ x: R(), y: R(), s: .7 + R()*.8, l: .5 + R()*.8 }));
const dust = Array.from({ length: 110 }, () => ({ x: R(), y: R(), s: .2 + R()*.5, r: .8 + R()*1.8, p: R()*6.28 }));
const FXM = { s1: [.22, 0], s2: [1, 0], s3: [0, 1] };   // per shot: [rain, dust], 0 to 1
const fxAt = (t) => { let k = 0; for (let i = 0; i < S.length; i++) if (t >= S[i].at) k = i; return FXM[S[k].id] || [0, 0]; };
(function(){ const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"), im = g.createImageData(256, 256), rr = rng(4242);
  for (let i = 0; i < im.data.length; i += 4){ const v = rr() * 255; im.data[i] = im.data[i+1] = im.data[i+2] = v; im.data[i+3] = 255; }
  g.putImageData(im, 0, 0); $("#grain").style.backgroundImage = `url(${c.toDataURL()})`; $("#grain").style.backgroundSize = "256px 256px"; })();
function drawFx(){
  const t = tl.time(), m = fxAt(t); g2.clearRect(0, 0, FW, FH);
  if (m[0] > 0){ const n = Math.round(drops.length * Math.min(1, m[0])); g2.lineWidth = 1.2; g2.strokeStyle = `rgba(185,210,222,${(.16 + .22 * m[0]).toFixed(2)})`; g2.beginPath();
    for (let i = 0; i < n; i++){ const d = drops[i], y = ((d.y + t * d.s * 1.5) % 1) * (FH + 60) - 30, x = (((d.x - t * d.s * .22) % 1) + 1) % 1 * FW; g2.moveTo(x, y); g2.lineTo(x - 5 * d.l, y + 22 * d.l); } g2.stroke(); }
  if (m[1] > 0){ const n = Math.round(dust.length * m[1]);
    for (let i = 0; i < n; i++){ const p = dust[i], x = (((p.x + Math.sin(t * .4 + p.p) * .03 + t * .006 * p.s) % 1) + 1) % 1 * FW, y = (((p.y - t * .018 * p.s) % 1) + 1) % 1 * FH, a = (.25 + .35 * Math.sin(t * 1.3 + p.p * 3) ** 2).toFixed(2);
      g2.fillStyle = i % 4 === 0 ? `rgba(255,190,110,${a})` : `rgba(200,220,228,${(a * .8).toFixed(2)})`; g2.beginPath(); g2.arc(x, y, p.r, 0, 6.2832); g2.fill(); } }
  const f = Math.floor(t * 12);   // grain jumps 12 times a second, flicker 24
  $("#grain").style.transform = `translate(${(((f * 9301 + 49297) % 233280) / 233280 - .5) * 50 | 0}px, ${(((f * 4909 + 1234) % 233280) / 233280 - .5) * 50 | 0}px)`;
  const q = (((Math.floor(t * 24) * 2654435761) >>> 0) % 1000) / 1000; $("#flick").style.opacity = (q > .985 ? .2 : .035 * q).toFixed(3);
}
vfrey.onFrame(drawFx); drawFx();   // onFrame, not a tween's onUpdate: a render seeks with events suppressed
vfrey.captions("#captions", { style: "color", font: '"Playfair Display", Georgia, serif', size: 80, color: "#f4efe3", highlight: "#ffb347", stroke: "#000000", maxWords: 4, maxChars: 22 });
```
