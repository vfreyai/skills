# Vintage newspaper: code to copy

Paste what you need into `scenes/<idea>/index.html` and change the art. Coordinates are in a `0 0 1080 1920` drawing space (the page is 1080 x 1920 and scales to the frame); these numbers are for 9:16. `tl` is `vfrey.timeline()`. Everything is code: SVG patterns, SVG filters, GSAP. No images.

## Page shell, caption plate, paper

`#root` needs `data-composition-id="main" data-start="0"`. Load `vfrey/fonts/fonts.css`, `vfrey/gsap.min.js`, `vfrey/vfrey.js` as in every scene.

```css
:root { --ink:#21170f; --red:#c63a22; --pap:#e9dbb0; }
#root { position:relative; width:1080px; height:1920px; overflow:hidden; background:#2b1f14; color:var(--ink); font-family:"Playfair Display",Georgia,serif; }
#stage { position:absolute; inset:0; perspective:2600px; perspective-origin:50% 50%; }
.page { position:absolute; inset:0; overflow:hidden; visibility:hidden; opacity:0; backface-visibility:hidden;
  background:radial-gradient(ellipse 90% 80% at 50% 45%,#efe2b8 0%,#e9dbb0 55%,#dcc994 100%); box-shadow:0 -40px 70px rgba(30,15,0,.55); }
.thump, .cam { position:absolute; inset:0; }
.shade { position:absolute; inset:0; background:#1a0f05; opacity:0; pointer-events:none; }
.bgsvg { position:absolute; inset:0; width:1080px; height:1920px; display:block; }
.art { position:absolute; left:60px; width:960px; overflow:hidden; clip-path:inset(0 0 100% 0); display:block; }
.tx { position:absolute; left:0; width:1080px; text-align:center; }
.hl { font-weight:900; line-height:.96; text-transform:uppercase; filter:url(#roughK); }
.hl .ln { display:block; white-space:nowrap; transform:scaleX(.82); transform-origin:50% 50%; }
.w { display:inline-block; transform-origin:50% 62%; }
.hl em { font-style:normal; color:var(--red); }
.deck { font-style:italic; font-weight:500; font-size:34px; filter:url(#rough); }
.deck b { font-weight:800; font-style:normal; letter-spacing:.16em; font-size:26px; color:var(--red); }
/* the paper: LIGHT and COARSE (see Pitfalls). The speckle is the costly part. */
#paperfx { position:absolute; inset:0; mix-blend-mode:multiply; pointer-events:none; opacity:.3; }
#yellow { position:absolute; inset:0; pointer-events:none; mix-blend-mode:multiply;
  background: linear-gradient(90deg,transparent 49.4%,rgba(70,40,5,.16) 50%,transparent 50.6%),
              linear-gradient(180deg,transparent 49.6%,rgba(70,40,5,.12) 50%,transparent 50.4%),
              radial-gradient(ellipse 80% 70% at 50% 46%,rgba(255,235,170,0) 45%,rgba(140,80,15,.42) 100%); }
#flash { position:absolute; inset:0; background:#fff3d8; opacity:0; pointer-events:none; mix-blend-mode:screen; }
.wipe { position:absolute; left:0; width:1080px; height:3840px; top:1920px; pointer-events:none; will-change:transform; }
/* the caption plate: a printed strip placed from vfrey's caption band, never from typed pixels */
#capstrip { position:absolute; left:calc(var(--vf-safe-left) - 30px); right:calc(var(--vf-safe-left) - 30px); top:calc(var(--vf-caption-at) - 26px); height:calc(var(--vf-caption-h) + 52px);
  background:#f1e5bd; border:5px solid var(--ink); box-shadow:inset 0 0 0 9px #f1e5bd, inset 0 0 0 11px var(--ink), 9px 11px 0 rgba(33,23,15,.38); }
#captab { position:absolute; left:34px; top:-31px; background:var(--red); color:#f6ead0; font-weight:800; font-size:24px; letter-spacing:.22em; padding:4px 18px 4px 22px; border:3px solid var(--ink); box-shadow:4px 4px 0 var(--ink); }
#captions { position:absolute; left:var(--vf-safe-left); right:var(--vf-safe-left); top:var(--vf-caption-at); height:var(--vf-caption-h); align-items:center; font-weight:800; }
#captions.vf-captions { justify-content:center !important; }
#captions .vf-w { padding:2px 8px 6px; }
#captions .vf-w.on { text-shadow:3px 2px 0 rgba(198,58,34,.28); }
```

Root children in this order: `#stage`, two `.wipe` layers (`#wipeR`, `#wipeK`), `#paperfx` (below), `#yellow`, `#capstrip` (with `#captab` inside), `#captions`, any stamps, `#flash`. Stamps are `position:absolute; visibility:hidden; border:7px double var(--red); color:var(--red); font-weight:900; text-transform:uppercase; mix-blend-mode:multiply; filter:url(#rough); transform:rotate(-6deg)` boxes placed in the art area, never over the plate.

Paper speckle, one filter on one rect (coarser and lighter than the first build, which cost 22 Mbps):

```html
<svg id="paperfx" width="1080" height="1920" viewBox="0 0 1080 1920">
  <filter id="pf" x="0" y="0" width="1" height="1">
    <feTurbulence type="fractalNoise" baseFrequency=".32" numOctaves="1" seed="7" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 .32  0 0 0 0 .22  0 0 0 0 .09  0 0 0 1.1 -.5" result="speck"/>
    <feTurbulence type="fractalNoise" baseFrequency=".006 .32" numOctaves="2" seed="2" result="f"/>
    <feColorMatrix in="f" type="matrix" values="0 0 0 0 .5  0 0 0 0 .36  0 0 0 0 .15  0 0 0 1 -.42" result="fib"/>
    <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="21" result="b"/>
    <feColorMatrix in="b" type="matrix" values="0 0 0 0 .55  0 0 0 0 .35  0 0 0 0 .1  0 0 0 .9 -.38" result="blot"/>
    <feMerge><feMergeNode in="blot"/><feMergeNode in="fib"/><feMergeNode in="speck"/></feMerge>
  </filter>
  <rect width="1080" height="1920" filter="url(#pf)"/>
</svg>
```

## Shared defs: hatch patterns, tone masks, ink roughness

One hidden `<svg width="0" height="0"><defs>` at the top of the body. Hatch bars are 2.6, 1.6 and 0.9 px thick; diagonals use `patternTransform`; the dots are for spot red and ink halftone.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <pattern id="hA" width="6" height="5" patternUnits="userSpaceOnUse"><rect width="6" height="2.6" fill="#21170f"/></pattern>
  <pattern id="hB" width="6" height="5" patternUnits="userSpaceOnUse"><rect width="6" height="1.6" fill="#21170f"/></pattern>
  <pattern id="hC" width="6" height="5" patternUnits="userSpaceOnUse"><rect width="6" height="0.9" fill="#21170f"/></pattern>
  <pattern id="vA" width="5" height="6" patternUnits="userSpaceOnUse"><rect width="2.4" height="6" fill="#21170f"/></pattern>
  <pattern id="dA" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.9" height="6" fill="#21170f"/></pattern>
  <pattern id="dB" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="1.9" height="6" fill="#21170f"/></pattern>
  <pattern id="dotL" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="6" cy="6" r="3.9" fill="#c63a22"/></pattern>
  <pattern id="dotS" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3.5" cy="3.5" r="1.3" fill="#c63a22"/></pattern>
  <pattern id="dotK" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="4.5" cy="4.5" r="2.1" fill="#21170f"/></pattern>
  <linearGradient id="gTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
  <linearGradient id="gBot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>
  <radialGradient id="gRad"><stop offset=".25" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
  <radialGradient id="gRadI"><stop offset="0" stop-color="#fff"/><stop offset=".95" stop-color="#000"/></radialGradient>
  <mask id="mTop" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#gTop)"/></mask>
  <mask id="mBot" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#gBot)"/></mask>
  <mask id="mRad" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#gRad)"/></mask>
  <mask id="mRadI" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#gRadI)"/></mask>
  <filter id="rough" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="roughK" x="-3%" y="-6%" width="106%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".55"/></filter>
</defs></svg>
```

## Setup, drawing helpers

```js
const tl = vfrey.timeline();
const T = vfrey.timing, D = T.durationSec;
const INK = "#21170f", RED = "#c63a22", PAP = "#e9dbb0";
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const L = (i) => vfrey.line(i).start;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
// start of a spoken word on a line; falls back to the line start so a changed script never throws
const wt = (line, re) => { const w = T.words.find((w) => w.line === line && re.test(norm(w.text))); return w ? w.start : L(line); };
const R = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };   // seeded random only
const f1 = (n) => (+n).toFixed(1);
const loopN = (dur) => Math.max(1, Math.ceil(D / dur) + 1);   // finite repeats: a paused timeline is seek-driven
// the caption band in page units: the art frame ends above it, the columns start below it
const VB = 1920 / vfrey.frame.height, CAP_TOP = vfrey.captionBox.top * VB, CAP_BOTTOM = CAP_TOP + vfrey.captionBox.height * VB;
const FRAME_BOTTOM = Math.round(CAP_TOP - 62), COLS_TOP = Math.round(CAP_BOTTOM + 56);

const hatch = (pat, x, y, w, h, mask, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${pat})"${mask ? ` mask="url(#${mask})"` : ""}${extra || ""}/>`;
// greeked column: justified word-blocks as one path, ragged paragraph ends
function greek(x, y, w, rows, seed, lh = 15.5) {
  const r = R(seed); let d = "", yy = y;
  for (let i = 0; i < rows; i++) {
    const para = r() < .13, full = para ? w * (.25 + r() * .55) : w; let xx = x; const end = x + full;
    while (xx < end - 4) { const ww = Math.min(end - xx, 14 + r() * 46); d += `M${f1(xx)} ${f1(yy)}h${f1(Math.max(4, ww - 5))}v6.2h-${f1(Math.max(4, ww - 5))}z`; xx += ww; }
    yy += lh; if (para) yy += lh * .55;
  }
  return `<path d="${d}" fill="${INK}" opacity=".82"/>`;
}
// starburst: red halftone disc, paper core, 12 ink/red rays; animate the .cls group
function spark(cx, cy, r, cls, seed) {
  const q = R(seed || 5); let s = `<g transform="translate(${cx} ${cy})"><g class="${cls}"><circle r="${r * .95}" fill="url(#dotL)" opacity=".9"/><circle r="${r * .42}" fill="${PAP}"/>`;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283 + q() * .4, r1 = r * .3, r2 = r * (.75 + q() * .9);
    s += `<line x1="${f1(Math.cos(a) * r1)}" y1="${f1(Math.sin(a) * r1)}" x2="${f1(Math.cos(a) * r2)}" y2="${f1(Math.sin(a) * r2)}" stroke="${i % 3 ? INK : RED}" stroke-width="${i % 3 ? 3 : 4.5}" stroke-linecap="round"/>`; }
  return s + `</g></g>`;
}
function zig(x1, y1, x2, y2, seed, n = 9, amp = 22) {   // a zigzag path for arcs and lightning
  const q = R(seed); let d = `M${x1} ${y1}`;
  for (let i = 1; i < n; i++) { const t = i / n; d += `L${f1(x1 + (x2 - x1) * t + (q() - .5) * amp * 1.4)} ${f1(y1 + (y2 - y1) * t + (q() - .5) * amp)}`; }
  return d + `L${x2} ${y2}`;
}
const frameRect = (x, y, w, h) => `<rect x="${x - 9}" y="${y - 9}" width="${w + 18}" height="${h + 18}" fill="none" stroke="${INK}" stroke-width="6"/><rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" fill="none" stroke="${INK}" stroke-width="2"/>`;
// a corona or sun: an outer group rotated slowly, a paper disc, 100+ thin radial hatch lines, a heavy outline
function sun(cx, cy, r) {
  let s = `<g transform="translate(${cx} ${cy})"><circle r="${r * 2.4}" fill="url(#dotS)" mask="url(#mRadI)" opacity=".7"/><g class="corona">`;
  for (let i = 0; i < 56; i++) { const a = i / 56 * 6.283, r1 = r * 1.05, r2 = r1 + (i % 2 ? r * .5 : r * .95); s += `<line x1="${f1(Math.cos(a) * r1)}" y1="${f1(Math.sin(a) * r1)}" x2="${f1(Math.cos(a) * r2)}" y2="${f1(Math.sin(a) * r2)}" stroke="${INK}" stroke-width="${i % 2 ? 2 : 3.4}" stroke-linecap="round"/>`; }
  s += `</g><circle r="${r}" fill="${PAP}"/>`;
  for (let i = 0; i < 110; i++) { const a = i / 110 * 6.283, r1 = r * .3 + (i % 5) * 10; s += `<line x1="${f1(Math.cos(a) * r1)}" y1="${f1(Math.sin(a) * r1)}" x2="${f1(Math.cos(a) * r * .97)}" y2="${f1(Math.sin(a) * r * .97)}" stroke="${INK}" stroke-width=".9" opacity=".65"/>`; }
  return s + `<circle r="${r}" fill="none" stroke="${INK}" stroke-width="4"/></g>`;
}
```

## The art: one function per picture

Each engraving is `ART[n](H)` returning an SVG string in local 960 x H coordinates, placed in `<svg class="art" viewBox="0 0 960 H">`, which clips itself. Engrave tone with hatch masks: heavy lines at the edges, clear toward the light. Solids are ink with a thin paper rim; mid tones are `dA` plus `dB` cross-hatch; light faces are paper with `hB` along one side.

```js
const ART = {};
ART[0] = (H) => {   // an example shape only: a hatched sky, a sun, a skyline. Draw your own subject.
  let s = hatch("hA", 0, 0, 960, H * .7, "mRad") + hatch("hC", 0, 0, 960, H * .7, "mTop", ` opacity=".9"`);
  s += sun(500, 290, 124);
  s += `<path d="M0 ${H}V${H * .8}H120V${H * .72}H200V${H * .8}H340V${H * .66}H420V${H * .8}H960V${H}Z" fill="${INK}"/>`;   // runs to the frame's bottom edge
  return s;
};
```

## Page builder: masthead, headline, deck, art, columns to the bottom edge

Invent the masthead: `MASTHEAD` is a made-up name, never a real paper. `PAGES[0]` is the front page (masthead, art from 690); the others use a slim running header and art from 520. Headline sizes are per line: about 0.59 em per capital after the squeeze, so 960 px holds about 15 letters at 104 px or 9 at 150 px.

```js
const MASTHEAD = "THE DAILY SPARROW";   // invented: say it is fictional in the plan
const PAGES = [
  { kind: "front", art: 0, top: 690, hl: [["Short", 150], ["lines <em>win</em>", 130]], deck: "<b>EXTRA</b> &nbsp;A sourced deck line" },
  { art: 0, top: 520, hl: [["Second", 150], ["<em>story</em>", 150]], deck: "A sourced deck line" }
];
const stage = $("#stage");
PAGES.forEach((p, i) => {
  const front = p.kind === "front", H = FRAME_BOTTOM - p.top, headTop = front ? 340 : 150;
  let bg = "";
  if (front) bg += `<rect x="40" y="28" width="1000" height="7" fill="${INK}"/><rect x="40" y="40" width="1000" height="2.5" fill="${INK}"/><rect x="40" y="276" width="1000" height="2.5" fill="${INK}"/><rect x="40" y="326" width="1000" height="7" fill="${INK}"/><rect x="40" y="336" width="1000" height="2.5" fill="${INK}"/>`;
  else bg += `<rect x="40" y="26" width="1000" height="7" fill="${INK}"/><rect x="40" y="38" width="1000" height="2.5" fill="${INK}"/><rect x="40" y="124" width="1000" height="2.5" fill="${INK}"/><rect x="40" y="130" width="1000" height="6" fill="${INK}"/>`;
  bg += frameRect(60, p.top, 960, H);
  bg += `<rect x="40" y="${COLS_TOP - 28}" width="1000" height="4" fill="${INK}"/><rect x="40" y="${COLS_TOP - 20}" width="1000" height="1.6" fill="${INK}"/>`;
  [40, 372, 706].forEach((x, k) => { bg += greek(x + 4, COLS_TOP, 312, Math.ceil((1960 - COLS_TOP) / 15.5), 100 + i * 7 + k); if (k) bg += `<rect x="${x - 10}" y="${COLS_TOP - 8}" width="2" height="${1960 - COLS_TOP}" fill="${INK}"/>`; });   // columns run off the bottom edge
  bg += `<rect x="44" y="${COLS_TOP + 2}" width="38" height="38" fill="${INK}"/>`;   // drop-cap block
  if (!front) bg += `<g transform="translate(540 ${p.top - 30})"><path d="M-470 0H-40M40 0H470" stroke="${INK}" stroke-width="2"/><path d="M0 -9L9 0L0 9L-9 0Z" fill="${RED}"/></g>`;
  let hl = "", y = headTop;
  p.hl.forEach((ln) => { const words = ln[0].split(" ").map((w) => `<span class="w">${w}</span>`).join(" ");
    hl += `<span class="ln" style="font-size:${ln[1]}px;height:${Math.round(ln[1] * .96)}px;line-height:${Math.round(ln[1] * .96)}px">${words}</span>`; y += Math.round(ln[1] * .96); });
  const hh = y - headTop;
  const mast = front ? `<div class="tx" style="top:44px;height:240px"><h1 class="mh" style="margin:0;position:absolute;left:0;right:0;top:-2px;font-weight:900;font-size:206px;line-height:1;letter-spacing:-2px;white-space:nowrap;transform:scaleX(.8)">${MASTHEAD}</h1></div>
      <div class="tx" style="top:284px;height:44px;line-height:44px;font-weight:700;font-size:24px;letter-spacing:.2em">VOL. I, NO. 1, A DATE YOU CAN SOURCE</div>`
    : `<div class="tx" style="top:34px;height:88px;line-height:88px;font-weight:900;font-size:50px;letter-spacing:.34em;padding-left:.34em">${MASTHEAD}</div>`;
  stage.insertAdjacentHTML("beforeend", `<div class="page" id="p${i}"><div class="thump"><div class="cam" id="cam${i}">
    <svg class="bgsvg" viewBox="0 0 1080 1920">${bg}</svg>${mast}
    <div class="tx hl" id="hl${i}" style="top:${headTop}px;height:${hh}px">${hl}</div>
    <div class="tx deck" id="dk${i}" style="top:${headTop + hh + 8}px;height:46px;line-height:46px">${p.deck}</div>
    <svg class="art" id="art${i}" style="top:${p.top}px;height:${H}px" viewBox="0 0 960 ${H}">${ART[p.art](H)}</svg>
  </div></div><div class="shade" id="sh${i}"></div></div>`);
});
const P = PAGES.map((_, i) => $("#p" + i)), CAM = PAGES.map((_, i) => $("#cam" + i)), TH = P.map((p) => $(".thump", p));
gsap.set(P, { autoAlpha: 0 }); gsap.set(P[0], { autoAlpha: 1 });
```

## Press impact, headline words, art reveal, idle loops

`.thump` moves only in y; `.cam` carries scale and pan. Never put both on one element.

```js
const thump = (t, a = 7) => { tl.to(TH, { y: a, duration: .06, ease: "power2.out", overwrite: false }, t); tl.to(TH, { y: 0, duration: .32, ease: "elastic.out(1,.35)", overwrite: false }, t + .06); };
// each word lands: scale 1.3 down to 1, blur away, then the red offset shadow eases in; a thump on every second word
function pressHeadline(i, t0, gap = .2) {
  const ws = $$(".w", $("#hl" + i));
  ws.forEach((w, k) => { const t = t0 + k * gap;
    tl.fromTo(w, { autoAlpha: 0, scale: 1.3, y: -12, filter: "blur(5px)" }, { autoAlpha: 1, scale: 1, y: 0, filter: "blur(0px)", duration: .2, ease: "power3.in" }, t);
    tl.fromTo(w, { textShadow: "0px 0px 0px rgba(198,58,34,0)" }, { textShadow: "6px 5px 0px rgba(198,58,34,.45)", duration: .35, ease: "power2.out", immediateRender: false }, t + .12);
    if (k % 2 === 0) thump(t + .2, 5); });
  tl.fromTo("#dk" + i, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .5, ease: "power2.out" }, t0 + ws.length * gap + .1);
}
const revealArt = (i, t0, dur = .75) => tl.fromTo("#art" + i, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: dur, ease: "power2.inOut" }, t0);   // press wipe
// idle motion inside a frame; rotate with svgOrigin:"0 0" on a group inside an outer translate
const loop = (sel, vars, dur, at = 0) => tl.to(sel, Object.assign({ duration: dur, repeat: loopN(dur), ease: "sine.inOut" }, vars), at);
// a stamp slams in on a spoken word: scale 2 to 1, rotation -14 to -6, then thump and flash
function stampIn(sel, t, big = 14) {
  tl.fromTo(sel, { autoAlpha: 0, scale: 2, rotation: -14 }, { autoAlpha: .92, scale: 1, rotation: -6, duration: .22, ease: "power4.in" }, t); thump(t + .2, big);
  tl.fromTo("#flash", { opacity: 0 }, { opacity: .5, duration: .05 }, t + .18).to("#flash", { opacity: 0, duration: .45 }, t + .23);
}
// toggled zigzag arcs at about 12 fps: .arc0 .arc1 .arc2 are pre-built zig() paths
function arcs(sel, t0, t1) { for (let t = t0, n = 0; t < t1; t += .085, n++) { tl.set(sel + " .arc", { opacity: 0 }, t); tl.set(sel + " .arc" + (n % 3), { opacity: 1 }, t); } }
```

## Transitions, camera

Start each transition about 0.8 s before the next line; it ends as the line starts. Reveal the next page's headline and frame at the transition start, so no frame shows an empty sheet.

```js
function turn(a, b, t0, dur = .85) {   // page turn: needs #stage perspective
  tl.set(P[b], { autoAlpha: 1, zIndex: 1 }, t0); tl.set(P[a], { zIndex: 2 }, t0);
  tl.fromTo(P[a], { rotationY: 0 }, { rotationY: -118, duration: dur, ease: "power2.in", transformOrigin: "0% 50%" }, t0);
  tl.fromTo("#sh" + a, { opacity: 0 }, { opacity: .8, duration: dur, ease: "power1.in" }, t0);
  tl.fromTo(P[b], { scale: 1.05 }, { scale: 1, duration: dur, ease: "power2.out" }, t0);
  tl.set(P[a], { autoAlpha: 0, rotationY: 0, zIndex: 0 }, t0 + dur); tl.set("#sh" + a, { opacity: 0 }, t0 + dur);
}
function slide(a, b, t0, dur = .8) {   // sheet stack: the next sheet rises over the old one
  tl.set(P[b], { autoAlpha: 1, zIndex: 3 }, t0);
  tl.fromTo(P[b], { yPercent: 102, rotation: 2.6, transformOrigin: "50% 100%" }, { yPercent: 0, rotation: 0, duration: dur, ease: "power3.out" }, t0);
  tl.fromTo(P[a], { scale: 1 }, { scale: .955, duration: dur, ease: "power2.out" }, t0);
  tl.fromTo("#sh" + a, { opacity: 0 }, { opacity: .5, duration: dur }, t0);
  tl.set(P[a], { autoAlpha: 0, scale: 1, zIndex: 0 }, t0 + dur); tl.set("#sh" + a, { opacity: 0 }, t0 + dur); tl.set(P[b], { zIndex: 1 }, t0 + dur);
}
function flood(a, b, t0, dur = 1.0) {   // ink flood: red leads, black 0.14 s behind; swap at the midpoint; reset after
  tl.fromTo("#wipeR", { y: 0 }, { y: -5760, duration: dur, ease: "power2.inOut" }, t0 - .06);
  tl.fromTo("#wipeK", { y: 0 }, { y: -5760, duration: dur, ease: "power2.inOut" }, t0 + .08);
  tl.set(P[b], { autoAlpha: 1, zIndex: 1 }, t0 + dur * .5); tl.set(P[a], { autoAlpha: 0, zIndex: 0 }, t0 + dur * .5);
  tl.set(["#wipeR", "#wipeK"], { y: 0 }, t0 + dur + .3);
}
function wipeSvg(col, seed) {   // a 3840-tall ragged-edged ink layer with halftone edges; put it in #wipeR / #wipeK
  const r = R(seed); let d = "M0 400";
  for (let x = 0; x <= 1080; x += 18) d += `L${x} ${f1(300 + (r() - .5) * 70 + Math.sin(x / 90) * 28)}`;
  d += `L1080 3540`;
  for (let x = 1080; x >= 0; x -= 18) d += `L${x} ${f1(3520 + (r() - .5) * 70 + Math.sin(x / 70) * 30)}`;
  const dot = col === INK ? "url(#dotK)" : "url(#dotL)";
  return `<svg width="1080" height="3840" viewBox="0 0 1080 3840"><path d="${d}Z" fill="${col === INK ? "#1b120a" : col}"/><rect y="130" width="1080" height="190" fill="${dot}" mask="url(#mBot)"/><rect y="3520" width="1080" height="190" fill="${dot}" mask="url(#mTop)"/></svg>`;
}
$("#wipeR").innerHTML = wipeSvg(RED, 3); $("#wipeK").innerHTML = wipeSvg(INK, 8);
// example: turn(0, 1, L(1) - .8); slide(1, 2, L(2) - .8); flood(2, 3, L(3) - 1.0, 1.0);
// camera: front page starts at 1.14 on the masthead and pulls out; others alternate pull-out, push-in and a slow drift
tl.fromTo(CAM[0], { scale: 1.14, y: 0, transformOrigin: "50% 7%" }, { scale: 1, duration: 3.6, ease: "power3.inOut" }, 0);
tl.fromTo(CAM[1], { scale: 1.02, transformOrigin: "50% 52%" }, { scale: 1.12, y: -50, duration: 5.4, ease: "sine.inOut" }, L(1) - .3);
tl.fromTo("#yellow", { opacity: .92 }, { opacity: 1, duration: 3, repeat: loopN(3), yoyo: true, ease: "sine.inOut" }, 0);   // the yellowing breathes
```

## Captions on the printed strip

`#capstrip` is the plate and stays on every page; the captions sit on it. The script's `captions.style` is `color` too (a style in the script beats the scene's).

```js
vfrey.captions("#captions", { style: "color", font: '"Playfair Display", Georgia, serif', size: 64, color: INK, highlight: RED, maxWords: 4, maxChars: 24 });
```
