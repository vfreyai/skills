# Data story: code to copy

Paste what you need into `scenes/<idea>/index.html`. Copy `datadesk.js` next to this file into `scenes/<idea>/` and load it with `<script src="datadesk.js"></script>` (generic helpers: dot fills, a globe projection, outlines from points, leader lines, axis, bars, dots that regroup, `fmt`). The stage is a 1080 x 1920 design space (9:16 numbers) scaled to the frame. `S` is the one state object, `tl` is `vfrey.timeline()`. Every value printed on screen comes from `INPUTS`, a table you fill with sourced numbers.

## Page shell: rail, headline, hero canvas, plate, scoreboard, source footer

```html
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script><script src="vfrey/vfrey.js"></script><script src="datadesk.js"></script>
<style>
  :root { --paper:#F2EEE4; --ink:#15171C; --accent:#E4432D; --mute:#6B6556; --rule:#CFC8B6; }
  html, body { margin:0; width:100%; height:100%; overflow:hidden; background:var(--paper); }
  #root { position:relative; width:100%; height:100%; overflow:hidden; color:var(--ink); font-family:"Google Sans Flex","Liberation Sans",Arial,sans-serif; }
  #stage { position:absolute; left:0; top:0; width:1080px; height:1920px; transform-origin:0 0; }
  .mono { font-family:"JetBrains Mono","Liberation Mono",monospace; font-weight:500; }   /* weight 500 only: faux bold smears */
  #top { position:absolute; left:60px; top:104px; width:960px; font-size:28px; letter-spacing:.08em; display:flex; justify-content:space-between; }
  #rail { position:absolute; left:60px; top:154px; width:960px; height:8px; display:flex; gap:10px; }
  #rail div { flex:1; background:var(--rule); position:relative; } #rail i { position:absolute; left:0; top:0; bottom:0; width:0; background:var(--ink); }
  #hdr { position:absolute; left:60px; top:206px; width:960px; text-wrap:balance; font-size:47px; line-height:1.1; font-weight:700; }
  #hdrRule { position:absolute; left:60px; top:314px; width:960px; height:4px; background:var(--ink); }
  #hero { position:absolute; left:0; top:322px; width:1080px; overflow:hidden; }       /* height is set in JS from the caption band */
  .lab { position:absolute; left:0; top:0; white-space:nowrap; opacity:0; transform-origin:0 0; }
  .tag { background:var(--paper); border-left:7px solid var(--accent); padding:5px 14px 6px 12px; font-size:34px; line-height:1.15; }
  .tag.big { font-size:58px; color:var(--accent); } .k { font-size:30px; letter-spacing:.05em; color:var(--mute); }
  .cell { position:absolute; width:320px; height:214px; border-top:5px solid var(--ink); }
  .cell .k { position:absolute; left:0; top:16px; font-size:28px; }
  .cell .v { position:absolute; left:0; top:78px; font-size:84px; line-height:1; letter-spacing:-.04em; white-space:nowrap; }
  .cell .v small { font-size:36px; letter-spacing:0; color:var(--mute); margin-left:6px; } .cell .v.acc { color:var(--accent); }
  #src { position:absolute; left:60px; width:610px; font-size:23px; line-height:1.3; color:var(--mute); }   /* the AI-GENERATED label owns the bottom-right */
  #capplate { position:absolute; left:40px; width:1000px; background:var(--ink); opacity:0; }
  #captions { position:absolute; left:72px; width:936px; display:flex; align-items:center; justify-content:center; }
  #captions.vf-captions { justify-content:center !important; }   /* vfrey sets the block to the bottom of its box; centre it on the plate */
</style>
<div id="root" data-composition-id="main" data-start="0"><div id="stage">
  <div id="top" class="mono"><span>KICKER</span><span>TOPIC</span></div>
  <div id="rail"><div><i></i></div><div><i></i></div><div><i></i></div><div><i></i></div></div>
  <div id="hdr"></div><div id="hdrRule"></div>
  <div id="hero"><canvas id="cv" width="1080" height="900"></canvas><!-- .lab elements go here --></div>
  <div id="capplate"></div><div id="captions"></div>
  <div id="cells"></div><div id="src" class="mono"></div>
</div></div>
```

## Setup: caption band, layout from it, scoreboard cells, footer

```js
const tl = vfrey.timeline(), $ = (id) => document.getElementById(id);
const WD = vfrey.timing.words, DUR = vfrey.timing.durationSec;
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9-]/g, "");
const at = (word, nth = 0) => { let n = 0; for (const w of WD) if (norm(w.text) === word && n++ === nth) return w.start; throw new Error("word not found: " + word); };
const sc = vfrey.frame.width / 1080; $("stage").style.transform = `scale(${sc})`;
$("hdr").textContent = vfrey.script.title;                                    // never typed
// INPUTS: every number the film shows or says, with the source you can name. Computed values come from these, never typed beside them.
const INPUTS = { total: { v: 100, src: "<publisher, table, year>" }, part: { v: 42, src: "<publisher, table, year>" } };
const share = INPUTS.part.v / INPUTS.total.v;                                 // derived in the scene
// the caption band in stage units, from the real setting
const CAP_TOP = vfrey.captionBox.top / sc, CAP_H = vfrey.captionBox.height / sc, HERO_TOP = 322;
const bottom = vfrey.captionBox.position === "bottom";
const HERO_H = Math.round(bottom ? CAP_TOP - 30 - HERO_TOP : 988);           // hero art stops above the plate
const CELL_TOP = Math.round(bottom ? CAP_TOP + CAP_H + 30 : 1566);           // scoreboard fills the space below the plate to the bottom edge
$("hero").style.height = HERO_H + "px"; $("cv").height = HERO_H;
$("src").style.top = Math.min(1822, CELL_TOP + 256) + "px"; $("src").textContent = "SOURCES: " + Object.values(INPUTS).map((i) => i.src).join("; ").toUpperCase();
for (const id of ["capplate", "captions"]) { $(id).style.top = CAP_TOP + "px"; $(id).style.height = CAP_H + "px"; }
$("cells").innerHTML = ["LABEL A", "LABEL B", "LABEL C"].map((k, n) => `<div class="cell" style="left:${60 + n * 320}px;top:${CELL_TOP}px"><div class="k mono">${k}</div><div class="v mono" id="v${n}">-</div></div>`).join("");
```

If `captionBox.position` is `top` or `middle`, move the plate there and shift the hero and scoreboard zones so nothing sits under it.

## One state object, one repaint

```js
const S = { R: 430, lon0: -25, lat0: 18, cx: 540, cy: HERO_H / 2, L: 1, v0: 0, on0: 0, prog: 0 };
const ctx = $("cv").getContext("2d"), CW = 1080, CH = HERO_H;
const to = (p, t, d, ease) => tl.to(S, Object.assign({ duration: d, ease: ease || "power2.inOut" }, p), t);
function setLab(id, x, y, op, centre) {   // a label that follows the picture: position and opacity written from S every frame
  const el = $(id); el.style.opacity = op.toFixed(3);
  if (op > 0.001) el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)` + (centre ? " translate(-50%,0)" : "");
}
function draw() {
  ctx.clearRect(0, 0, CW, CH);
  /* 1. the picture, from S: map, dots, bars (see below) */
  /* 2. labels: setLab("lbl1", x, y, S.a1) */
  $("v0").textContent = S.on0 > 0.01 ? S.v0.toFixed(1) : "-";                  // counters: text from the number
  $("v0").style.opacity = (0.25 + 0.75 * S.on0).toFixed(2);                    // grey dash until the number is spoken
  document.querySelectorAll("#rail i").forEach((el, k, all) => { const a = k * DUR / all.length, b = (k + 1) * DUR / all.length; el.style.width = (DD.clamp((S.prog - a) / (b - a)) * 100).toFixed(1) + "%"; });
}
tl.eventCallback("onUpdate", draw);                                            // the timeline's own onUpdate, never a clock tween's (live preview)
vfrey.onFrame(draw);                                                            // a render seeks with events suppressed: this is what repaints it
to({ prog: DUR }, 0, DUR, "none"); draw();
```

## A counter and a pour of dots, started on spoken words

```js
to({ on0: 1 }, at("billion") - 0.05, 0.3, "none");
to({ v0: INPUTS.part.v }, at("billion") - 0.05, 1.3, "power2.out");            // counts while the number is spoken
```

## Dots that regroup: pour in, sit on a map, become a bar, become rows

```js
const N = 80, UNIT = INPUTS.total.v / N;                                       // 1 dot = UNIT; say it in the legend
const dots = Array.from({ length: N }, (_, i) => ({ i, cat: i < N * share ? 0 : 1, g: DD.geo(/* lat */ 0, /* lon */ 0) /* schematic position, see below */ }));
const barXY = (k) => DD.gridPos(k, 103, 152, 4, 46);                           // 4 rows x 20 columns, pitch 46: a bar made of dots
const layouts = [                                                              // one function per chapter, each returns { x, y, r, a }
  (d, cam) => { const q = DD.project(d.g, cam); return { x: q[0], y: q[1], r: 12, a: q[2] > 0.04 ? 1 : 0 }; },   // on the globe
  (d) => { const p = barXY(d.i); return { x: p[0], y: p[1], r: 18, a: 1 }; },                                  // in a bar
];
function drawDots(cam) {   // S.L runs 1 -> 2 -> 3: the dots move from layout L to layout L + 1
  const k = DD.clamp(Math.floor(S.L), 1, layouts.length - 1), F = S.L - k;
  dots.forEach((d) => { const st = DD.regroup(d.i, layouts[k - 1](d, cam), layouts[k](d, cam), F); DD.dot(ctx, st, d.cat ? "#23262D" : "#E4432D", "#F2EEE4"); });
}
to({ L: 2 }, at("percent") - 0.25, 1.7, "none");                               // regroup into the bar
```

Start a morph about 0.25 s before the sentence it belongs to. Nothing cuts: the same dots persist and change role.

## Simplified outlines from points, and schematic positions

`datadesk.js` has no map data. You make your own outline and say so on screen:

1. Write each shape as a `[x, y]` list. For a map use `[lon, lat]` in degrees, traced by hand from a cited source at 1 to 3 degree accuracy, about 8 to 60 points a shape. For a country, a region or a floor plan use the same idea with your own units.
2. `DD.dotFill(shapes, holes, step)` fills the shapes with a dot grid; `DD.geoDots(shapes, holes, 1.7)` does it for a globe. Build them once at load (about 5,000 dots is fine). `DD.outline(ctx, shape, toXY, true)` strokes the plain outline.
3. People or item dots placed in "populated" spots are schematic: label them. `<div class="lab mono" id="legend">1 DOT = 100 MILLION PEOPLE, POSITIONS SCHEMATIC</div>` stays on while the dots show, and an outline you simplified gets "OUTLINE SIMPLIFIED" in the footer.
4. Dots on land show where land is, not density. Never colour them as if they were data.

A true circle on a sphere: `DD.destPoint(centre, km, bearing)` for bearing 0 to 360 in 3 degree steps, projected and stroked. Its area share on a sphere is `DD.capAreaShare(km)`: print the number it returns, rounded as the source rounds.

## Captions on the plate

```js
const groups = vfrey.captions("#captions", { style: "color", size: 62, color: "#F2EEE4", highlight: "#FF7358", maxWords: 4 });
tl.set("#capplate", { opacity: 0 }, 0);                                        // the plate exists only while words are on screen
groups.forEach((g, i) => { const prevEnd = i ? groups[i - 1].end : -9, nextStart = i < groups.length - 1 ? groups[i + 1].start : 99;
  if (g.start - prevEnd > 0.45) tl.to("#capplate", { opacity: 1, duration: 0.14, ease: "power2.out" }, Math.max(0, g.start - 0.08));
  if (nextStart - g.end > 0.45) tl.to("#capplate", { opacity: 0, duration: 0.16, ease: "power2.in" }, g.end + 0.12); });
```

Set the same `captions.style` in the script (`color` here), because the script overrides the scene.
