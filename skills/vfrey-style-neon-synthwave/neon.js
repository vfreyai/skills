/* Neon synthwave toolkit: light-tube drawing, chrome titles, sky + striped sun + mountains + drifting grid, glitch cuts.
   Copy this file into scenes/<idea>/ and load it after vfrey.js and before your scene code:
     <script src="neon.js"></script>
   Needs <div id="frame"><div id="world"></div> ...</div> and <div id="fx"></div> from the page shell in helpers.md.
   It defines globals: S, rng, C, tl, LN, WD, DUR, world, HY, K, glowStr, glowG, neon, draw, drawAll, show, jit, pulse,
   chrome, mono, ambient, hud, bloom, circlePath, buildBackground, makeScenes, glitchCut, vhsAmbient.
   Everything is a function of timeline time; random numbers are seeded. */
const NS = "http://www.w3.org/2000/svg";
const S = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
function rng(seed) { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const tl = vfrey.timeline();
const LN = i => vfrey.line(i).start;                       // start of script line i
const WD = (i, re, nth = 0) => { const rx = new RegExp(re.source, "i"), ws = vfrey.timing.words.filter(w => w.line === i && rx.test(w.text)); return ws.length ? ws[Math.min(nth, ws.length - 1)].start : LN(i); };   // start of a spoken word
const DUR = vfrey.timing.durationSec;
/* The design space is 1080 x 1920 (9:16); #frame is scaled to the real frame. K converts real pixels to design units. */
const K = vfrey.frame.width / 1080;
document.getElementById("frame").style.transform = `scale(${K})`;
const world = document.getElementById("world");
const C = { mag: "#ff2bd6", cya: "#27f0ff", pink: "#ff4f9a", yel: "#ffe14a", pur: "#a66bff", red: "#ff3b5c", ink: "#0b0224", white: "#ffffff" };
/* Horizon sits a little above the caption band, read from vfrey (design units). */
const HY = Math.round(vfrey.captionBox.top / K - 220);

/* ---------- glow: ONE filter per colour group, never per path ---------- */
const glowStr = c => `drop-shadow(0 0 3px ${c}) drop-shadow(0 0 12px ${c}) drop-shadow(0 0 30px ${c}88)`;
function glowG(par, col) { const g = S("g", {}, par); g.style.filter = glowStr(col); return g; }

/* ---------- light tubes ---------- */
/* A coloured wide stroke plus a white-hot thin core, both with pathLength=1 so they can draw on.
   Put the result's .g inside a glowG group. o: { w, fill, fa } (fill = faint body colour, fa = its final opacity). */
function neon(par, d, col, o = {}) {
  const w = o.w || 7, g = S("g", {}, par);
  let f = null;
  if (o.fill) f = S("path", { d, fill: o.fill, stroke: "none", opacity: 0 }, g);
  const a = S("path", { d, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1 }, g);
  const b = S("path", { d, fill: "none", stroke: "#fff", "stroke-width": w * 0.36, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-opacity": .92, pathLength: 1 }, g);
  const paths = [a, b]; gsap.set(paths, { strokeDasharray: "1 1", strokeDashoffset: 1 }); gsap.set(g, { autoAlpha: 0 });
  return { g, paths, f, fa: o.fa ?? .22, col };
}
function draw(N, t, dur = .5, ease = "power2.inOut") {
  tl.set(N.g, { autoAlpha: 1 }, t);
  tl.fromTo(N.paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease }, t);
  if (N.f) tl.to(N.f, { opacity: N.fa, duration: .3 }, t + dur * .7);
  const e = t + dur;   // the tube flickers as it strikes
  tl.set(N.g, { opacity: .45 }, e + .02).set(N.g, { opacity: 1 }, e + .07).set(N.g, { opacity: .6 }, e + .11).set(N.g, { opacity: 1 }, e + .15);
}
function drawAll(list, t, dur, stagger, ease) { list.forEach((n, i) => draw(n, t + i * stagger, dur, ease)); }
function show(el, t) { tl.set(el, { autoAlpha: 1 }, t); }
/* x-jitter frames at 30 fps, decaying: use on a chrome word as it lands. */
function jit(el, t, n = 5, amp = 18, seed = 1) { const r = rng(seed); for (let k = 0; k < n; k++) tl.set(el, { x: (r() - .5) * 2 * amp * (1 - k / n) }, t + k / 30); tl.set(el, { x: 0 }, t + n / 30); }
function pulse(el, t, from = 1, to = 1.12, dur = .5, rep = 1) { tl.fromTo(el, { scale: from }, { scale: to, duration: dur, yoyo: true, repeat: rep * 2 - 1, ease: "sine.inOut" }, t); }
/* A circle as two arcs (a single arc with a near-zero chord is ambiguous). */
const circlePath = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
/* A ring that blooms outward (state set with tl.set, then tweened; no early flash). */
function bloom(par, cx, cy, col, t, r1 = 360, dur = .8) {
  const ring = S("circle", { cx, cy, r: 30, fill: "none", stroke: col, "stroke-width": 6, opacity: 0 }, par); ring.style.filter = glowStr(col);
  tl.set(ring, { opacity: .9, attr: { r: 40 } }, t); tl.to(ring, { attr: { r: r1 }, opacity: 0, duration: dur, ease: "power2.out" }, t); return ring;
}

/* ---------- lettering ---------- */
/* Chrome title: outer <g> carries the static transform, the returned inner <g> is the one to animate.
   The shadow is a filter (a duplicated text trips vfrey's text-overlap check). Leave 40 px between stacked titles. */
function chrome(par, txt, x, y, size, o = {}) {
  const outer = S("g", { transform: `translate(${x},${y}) skewX(${o.skew ?? -8})` }, par), g = S("g", {}, outer);
  const base = { "font-family": '"Titan One", sans-serif', "font-size": size, "text-anchor": o.anchor || "middle", "letter-spacing": o.ls ?? 4 };
  S("text", { ...base, x: 0, y: 0, fill: "url(#chrome)", stroke: o.stroke || C.mag, "stroke-width": size * .045, "paint-order": "stroke", "stroke-linejoin": "round" }, g).textContent = txt;
  outer.style.filter = `drop-shadow(5px 7px 0 #2a0670) drop-shadow(0 0 10px ${o.stroke || C.mag}) drop-shadow(0 0 26px ${o.stroke || C.mag}99)`;
  gsap.set(g, { autoAlpha: 0, transformOrigin: "50% 50%" }); return g;
}
/* Small tag or readout text with its own glow (use for labels, dates, units). */
function mono(par, txt, x, y, size, col, o = {}) {
  const t = S("text", { x, y, "font-family": '"JetBrains Mono", monospace', "font-size": size, "text-anchor": o.anchor || "middle", fill: col, "letter-spacing": o.ls ?? 3, "font-weight": 500 }, par);
  t.textContent = txt; t.style.filter = `drop-shadow(0 0 6px ${col}) drop-shadow(0 0 16px ${col}88)`; gsap.set(t, { autoAlpha: 0 }); return t;
}
/* Drifting "+" sparks: cheap life on every scene. */
function ambient(par, seed, cols, n = 10) {
  const r = rng(seed), g = S("g", {}, par), items = [];
  for (let i = 0; i < n; i++) { const x = 70 + r() * 940, y = 210 + r() * 900, s = 8 + r() * 10, c = cols[i % cols.length];
    items.push(S("path", { d: `M${-s},0 H${s} M0,${-s} V${s}`, stroke: c, "stroke-width": 3, "stroke-linecap": "round", transform: `translate(${x},${y})`, opacity: .55 }, g)); }
  tl.to(items, { y: "-=60", opacity: .15, duration: 3, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(DUR / 6) + 1, stagger: .17 }, 0); return g;
}
/* HUD readout: a box under the caption plate with a mono label and a dashed wave that scrolls.
   y is the top of the box (design units). Keep y + 186 above 1760 so the AI-GENERATED label stays clear. */
function hud(par, txt, col, t, y) {
  y = Math.min(y ?? Math.round((vfrey.captionBox.top + vfrey.captionBox.height) / K + 30), 1760 - 186);
  const g = S("g", {}, par), L = glowG(g, col), mid = y + 126;
  const box = S("path", { d: `M70,${y} H1010 V${y + 186} H70 Z M70,${y + 58} H1010`, stroke: col, "stroke-width": 3, fill: C.ink, "fill-opacity": .7, opacity: 0 }, L);
  let d = `M100,${mid}`; for (let x = 100; x <= 980; x += 8) d += ` L${x},${(mid + Math.sin(x / 38) * 20 * Math.sin(x / 190 + 1)).toFixed(1)}`;
  const wave = S("path", { d, stroke: col, "stroke-width": 4, fill: "none", "stroke-dasharray": "34 14", opacity: 0 }, L);
  const tx = mono(L, txt, 540, y + 42, 36, col);
  tl.to(box, { opacity: .85, duration: .3 }, t + .1); tl.to(wave, { opacity: .9, duration: .3 }, t + .25);
  tl.fromTo(wave, { strokeDashoffset: 0 }, { strokeDashoffset: -480, duration: Math.max(40, DUR), ease: "none" }, t);
  tl.fromTo(tx, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: .35, ease: "power2.out" }, t + .2);
  return g;
}

/* ---------- the persistent background ---------- */
/* Sky, 70 stars, striped sun, wireframe mountains, horizon line, perspective grid that drifts toward the viewer.
   Returns { bg, defs, sunG, gridColour(t, colour) }. Horizontals are rewritten every frame with tl.set (no onUpdate). */
function buildBackground() {
  world.insertAdjacentHTML("beforeend", `<svg id="bg" viewBox="0 0 1080 1920" width="1080" height="1920"></svg>`);
  const bg = document.getElementById("bg"), defs = S("defs", {}, bg);
  const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, units) => { const g = S("linearGradient", { id, x1, y1, x2, y2, ...(units ? { gradientUnits: units } : {}) }, defs); stops.forEach(([o, c, op], i) => S("stop", { offset: o, "stop-color": c, "stop-opacity": op ?? 1, id: id + i }, g)); return g; };
  lg("sky", [[0, "#04010f"], [.45, "#16043f"], [.8, "#4a0c78"], [1, "#a0147f"]]);
  lg("sunG", [[0, "#fff35c"], [.45, "#ff9a3c"], [1, "#ff1f8e"]]);
  lg("chrome", [[0, "#ffffff"], [.44, "#aee6ff"], [.5, "#3a2a9e"], [.54, "#ff3dd0"], [1, "#ffc2f2"]]);   // hard step in the middle
  lg("gg", [[0, "#ff2bd6", 0], [1, "#ff2bd6", 1]], 0, HY, 0, 1920, "userSpaceOnUse");                      // grid fades toward the horizon
  lg("hz", [[0, "#ff2bd6", 0], [1, "#ff2bd6", .55]]);
  S("rect", { width: 1080, height: 1920, fill: "url(#sky)" }, bg);
  S("rect", { y: HY, width: 1080, height: 1920 - HY, fill: "#0a0120" }, bg);
  /* stars: 3 groups twinkling on yoyo tweens */
  const r0 = rng(77), starGs = [S("g", {}, bg), S("g", {}, bg), S("g", {}, bg)];
  for (let i = 0; i < 70; i++) S("circle", { cx: r0() * 1080, cy: 40 + r0() * (HY - 250), r: .8 + r0() * 2, fill: i % 5 === 0 ? "#9fe9ff" : "#fff", opacity: .85 }, starGs[i % 3]);
  starGs.forEach((g, i) => tl.to(g, { opacity: .25, duration: 1 + i * .35, yoyo: true, repeat: Math.ceil(DUR / 1.5), ease: "sine.inOut" }, i * .3));
  /* striped sun: a mask whose black stripes slide down and thicken */
  const sunG = S("g", {}, bg), sunY = HY - 210, sunR = 282;
  const sunMask = S("mask", { id: "sunmask", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 1080, height: 1920 }, defs);
  S("rect", { x: 0, y: 0, width: 1080, height: HY, fill: "#fff" }, sunMask);
  const stripes = S("path", { fill: "#000" }, sunMask);
  const halo = S("circle", { cx: 540, cy: sunY, r: sunR + 48, fill: "#ff2bd6", opacity: .38 }, sunG); halo.style.filter = "blur(30px)";   // one blurred circle, not a full-frame blur
  S("circle", { cx: 540, cy: sunY, r: sunR, fill: "url(#sunG)", mask: "url(#sunmask)" }, sunG);
  /* wireframe mountains on both sides */
  const mtn = (pts, flip) => { const g = S("g", {}, bg), p = pts.map(([x, y]) => [flip ? 1080 - x : x, y - (1010 - HY)]), d = "M" + p.map(q => q.join(",")).join(" L");
    S("path", { d: d + ` L${p[p.length - 1][0]},${HY} L${p[0][0]},${HY} Z`, fill: "#0e0235", stroke: "none" }, g);
    const l = S("path", { d, fill: "none", stroke: C.cya, "stroke-width": 3.5, "stroke-linejoin": "round" }, g); l.style.filter = glowStr(C.cya);
    S("path", { d: p.map(([x, y], i) => i % 2 ? `M${x},${y} L${x + (flip ? 40 : -40)},${HY}` : "").join(" "), fill: "none", stroke: C.cya, "stroke-width": 1.6, opacity: .5 }, g); };
  mtn([[-40, 1010], [40, 880], [105, 930], [190, 800], [265, 905], [330, 860], [420, 1010]], false);
  mtn([[-60, 1010], [20, 930], [80, 900], [170, 960], [240, 840], [310, 940], [380, 1010]], true);
  /* horizon glow and line */
  S("rect", { y: HY - 150, width: 1080, height: 150, fill: "url(#hz)" }, bg);
  S("rect", { y: HY - 3, width: 1080, height: 6, fill: "#ffd6fb" }, bg).style.filter = glowStr(C.mag);
  /* perspective grid: verticals static, horizontals recomputed per frame; three passes (wide dim, mid, thin bright) */
  const gridG = S("g", {}, bg), passes = [[9, .2], [4.5, .38], [1.9, 1]];
  const hP = passes.map(([w, o]) => S("path", { fill: "none", stroke: "url(#gg)", "stroke-width": w, "stroke-opacity": o }, gridG));
  let vd = ""; for (let j = -18; j <= 18; j++) vd += `M540,${HY} L${540 + j * 170},1930 `;
  passes.forEach(([w, o]) => S("path", { d: vd, fill: "none", stroke: "url(#gg)", "stroke-width": w, "stroke-opacity": o }, gridG));
  const SPEED = 0.42, DZ = .5, F = 910;
  const gridD = t => { const fr = (t * SPEED) % 1; let d = ""; for (let k = 0; k < 44; k++) { const z = 1 + (k - fr) * DZ; if (z < .98) continue; const y = HY + F / z; if (y > 1935) continue; d += `M-120,${y.toFixed(1)} H1200 `; } return d; };
  const stripeD = t => { const ph = (t * .16) % 1, N = 7, top = sunY - sunR, span = 212; let d = ""; for (let k = 0; k < N; k++) { const f = (k + ph) / N, y = top + (sunR + 10) + f * span, h = 3 + f * 24; d += `M0,${y.toFixed(1)} h1080 v${h.toFixed(1)} h-1080 Z `; } return d; };
  for (let k = 0, n = Math.ceil(DUR * 30) + 1; k < n; k++) { const t = k / 30; tl.set(hP, { attr: { d: gridD(t) } }, t); if (k % 2 === 0) tl.set(stripes, { attr: { d: stripeD(t) } }, t); }
  tl.fromTo(sunG, { scale: 1, svgOrigin: `540 ${HY}` }, { scale: 1.09, duration: DUR, ease: "none" }, 0);   // slow forward drift
  return { bg, defs, sunG, gridColour: (t, c) => [0, 1].forEach(k => tl.set(`#gg${k}`, { attr: { "stop-color": c } }, t)) };
}

/* ---------- scenes and cuts ---------- */
/* n scene <svg>s stacked in #world; scene 0 visible. cuts[i] is when scene i starts (cuts[0] = 0).
   Each gets a slow 1 -> to scale drift over its own span. */
function makeScenes(cuts, to = 1.05) {
  const sc = cuts.map((_, i) => { const s = S("svg", { viewBox: "0 0 1080 1920", width: 1080, height: 1920, class: "sc" }, world); if (i) gsap.set(s, { autoAlpha: 0 }); return s; });
  sc.forEach((s, i) => tl.fromTo(s, { scale: 1 }, { scale: to, duration: (i < cuts.length - 1 ? cuts[i + 1] : DUR) - cuts[i] + .4, ease: "none" }, cuts[i]));
  return sc;
}
/* VHS glitch cut, 0.36 s: displacement filter on #world, x/skew jitter, six screen-blend bars, swap scenes at the middle m.
   Call once per cut with m = the cut time (about 0.16 s before the next line starts). Then restore the always-on #ca filter. */
const _bars = []; const _rg = rng(123);
function glitchCut(sc, i, m) {
  const fx = document.getElementById("fx");
  if (!_bars.length) for (let k = 0; k < 6; k++) { const b = document.createElement("div"); b.className = "gb"; b.style.background = k % 2 ? "#27f0ff" : "#ff2bd6"; fx.appendChild(b); _bars.push(b); }
  const t0 = m - .2, n = 12;
  tl.set(world, { filter: "url(#gl)" }, t0);
  tl.fromTo("#dmap", { attr: { scale: 0 } }, { attr: { scale: 110 }, duration: .2, ease: "power2.in" }, t0).to("#dmap", { attr: { scale: 0 }, duration: .2, ease: "power2.out" }, t0 + .2);
  for (let k = 0; k < n; k++) { const t = t0 + k / 30, a = Math.sin(Math.PI * k / n);
    tl.set(world, { x: (_rg() - .5) * 70 * a, skewX: (_rg() - .5) * 8 * a }, t);
    _bars.forEach(b => { if (_rg() < .55) tl.set(b, { top: Math.round(_rg() * 1800), height: 14 + Math.round(_rg() * 90), opacity: .18 + _rg() * .35, x: (_rg() - .5) * 120 }, t); else tl.set(b, { opacity: 0 }, t); }); }
  tl.set(world, { x: 0, skewX: 0, filter: "url(#ca)" }, t0 + n / 30); _bars.forEach(b => tl.set(b, { opacity: 0 }, t0 + n / 30));
  tl.set(sc[i - 1], { autoAlpha: 0 }, m); tl.set(sc[i], { autoAlpha: 1 }, m);
}
/* Tracking band rolling down the frame at the given times, and a mild frame flicker (a 0.04 s dip, 18 % chance every 0.1 s). */
function vhsAmbient(bandTimes) {
  bandTimes.forEach(t => { tl.fromTo("#band", { top: -170, opacity: .9, skewX: 0 }, { top: 2000, duration: 1.5, ease: "none" }, t); tl.set("#band", { opacity: 0 }, t + 1.55); });
  const rf = rng(55); for (let t = 0; t < DUR; t += .1) if (rf() < .18) { tl.set(world, { opacity: .93 + rf() * .05 }, t); tl.set(world, { opacity: 1 }, t + .04); }
}
