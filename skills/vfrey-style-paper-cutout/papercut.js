/* Paper cut-out toolkit for a vfrey HTML scene (vfrey-style-paper-cutout). Copy this file into the scene folder and load it
   after vfrey.js and gsap, before your own scenes script:  <script src="papercut.js"></script>
   Everything is seeded and deterministic (SVG + HTML, no images). The stage is a 1080x1920 drawing space scaled to the frame.
   Your scenes script starts with:  const tl = vfrey.timeline(); const stage = paperStage();  then mk(colour) per scene. */
const NS = "http://www.w3.org/2000/svg";
const C = { paper:"#f4ecd8", cream:"#ecdfc0", sand:"#dcbf88", ochre:"#c9923d", gold:"#dcae48", wheat:"#d9a93f", wheat2:"#c28f2f", wheat3:"#a97724",
  brick:"#b2523a", rust:"#8f402c", terra:"#c8623f", teal:"#5d8a86", deepteal:"#3f6664", olive:"#7f8752", ink:"#2d2a26", brown:"#7a5236",
  dkbrown:"#4f3626", pink:"#d9a090", dusk:"#c99a98", plum:"#7d5766", khaki:"#b09a5e", khaki2:"#8f7c46", skin:"#e2b48f", steel:"#3d4249", steel2:"#5d636d" };
function rng(seed){ let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const S = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const H = (tag, cls, parent, css) => { const e = document.createElement(tag); if (cls) e.className = cls; else e.style.position = "absolute"; if (css) Object.assign(e.style, css); if (parent) parent.appendChild(e); return e; };
const pstr = pts => pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
function poly(parent, pts, fill, o = {}) { return S("polygon", { points: pstr(pts), fill, class: o.plain ? "" : "cut" }, parent); }
function blobPts(cx, cy, rx, ry, n, r, j = 0.1, rot = 0) { const pts = []; for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2, k = 1 + (r() - .5) * 2 * j; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return pts; }
function blob(parent, cx, cy, rx, ry, fill, r, n = 10, j = 0.1) { return poly(parent, blobPts(cx, cy, rx, ry, n, r, j), fill); }
/* hills: straight-sided scissor ridge, or torn (many small steps + paper-white fibre edge under it) */
function ridge(svg, o) { const r = rng(o.seed || 1), step = o.step || 80, x0 = o.x0 ?? -200, x1 = o.x1 ?? 1280, bot = o.bot ?? 2120, amp = o.amp ?? 40, ph = o.ph || 0, jit = o.jit ?? 10;
  const pts = []; for (let x = x0; x <= x1 + step; x += step) pts.push([x, o.y + amp * (Math.sin(x / 230 + ph) * .7 + Math.sin(x / 97 + ph * 2) * .3) + (r() - .5) * jit]);
  const full = pts.concat([[x1 + step, bot], [x0, bot]]);
  if (o.torn) { S("polygon", { points: pstr(full.map(p => [p[0], p[1] - 7])), fill: "#f3ead6" }, svg); }
  return poly(svg, full, o.fill, { plain: !!o.torn }); }
function tuft(svg, x, y, s, fill, r) { for (let i = -2; i <= 2; i++) { const h = (34 + r() * 26) * s, lean = i * 9 * s + (r() - .5) * 8 * s; poly(svg, [[x + i * 7 * s - 5 * s, y], [x + i * 7 * s + 5 * s, y], [x + i * 7 * s + lean, y - h]], fill, { plain: true }); } }
function cloud(svg, x, y, w, fill, r) { const n = 4, pts = [[x, y]]; for (let i = 0; i < n; i++) { const rad = w / n * (0.62 + r() * 0.3) * (i === 0 || i === n - 1 ? .8 : 1.1), cx = x + w * (i + .5) / n, cy = y - rad * .45; for (let k = 0; k <= 6; k++) { const a = Math.PI + k / 6 * Math.PI; pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * .9]); } } pts.push([x + w, y]); return poly(svg, pts, fill); }
function sun(svg, cx, cy, rs, fills, seed) { const r = rng(seed); rs.forEach((rad, i) => blob(svg, cx, cy, rad, rad, fills[i], r, 40, .01)); }
function starburst(parent, cx, cy, ro, ri, n, fill, r) { const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rad = (i % 2 ? ri : ro) * (1 + (r() - .5) * .12); pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); } return poly(parent, pts, fill); }

/* joints: static translate on the outer g (never animated), inner g is what GSAP rotates about its own origin */
function J(parent, x, y) { const o = S("g", { transform: `translate(${x},${y})` }, parent), i = S("g", {}, o); gsap.set(i, { svgOrigin: "0 0" }); return i; }
function root(parent, x, y, s, flip) { const pos = S("g", { transform: `translate(${x},${y}) scale(${flip ? -s : s},${s})` }, parent), mv = S("g", {}, pos), bl = S("g", {}, mv); gsap.set([mv, bl], { svgOrigin: "0 0" }); return { pos, mv, bl, j: {} }; }

/* stepped stop-motion driver */
function steps(t0, t1, fps, fn) { const dt = 1 / fps; let k = 0; for (let t = t0; t < t1 - 1e-6; t += dt, k++) fn(k, t); }

/* PERSON puppet, facing right, feet at y=0, about 300 tall. Options: x, y, s, flip, seed, shirt, pants, skin, overalls, medals, moustache, hat ("straw" or default brimmed), book, flag.
   Copy its shape to build any other puppet: root() for the body, J() per joint, draw each piece around its joint, nest child joints in parents. */
function Person(parent, o = {}) {
  const r = rng(o.seed || 4), P = root(parent, o.x || 0, o.y || 0, o.s || 1, o.flip), bl = P.bl, j = P.j;
  const shirt = o.shirt || C.khaki, pants = o.pants || C.khaki2, skin = o.skin || C.skin;
  const leg = (dark) => { const hip = J(bl, 0, -106); poly(hip, [[-14, -2], [14, -2], [11, 54], [-11, 54]], dark ? shade(pants) : pants);
    const knee = J(hip, 0, 52); poly(knee, [[-10, 0], [10, 0], [8, 50], [-8, 50]], dark ? shade(pants) : pants); poly(knee, [[-9, 44], [28, 48], [30, 62], [-9, 62]], "#3a2d24"); return { hip, knee }; };
  const arm = (dark) => { const sh = J(bl, 4, -196); poly(sh, [[-10, -6], [10, -6], [8, 48], [-8, 48]], dark ? shade(shirt) : shirt); const el = J(sh, 0, 46); poly(el, [[-8, 0], [8, 0], [7, 40], [-7, 40]], dark ? shade(shirt) : shirt); S("circle", { cx: 0, cy: 44, r: 10, fill: skin, class: "cut" }, el); return { sh, el }; };
  j.legB = leg(true); j.armB = arm(true);
  j.torso = J(bl, 0, -150); poly(j.torso, [[-30, -56], [30, -56], [36, 44], [-36, 44]], shirt); poly(j.torso, [[-36, 30], [36, 30], [36, 44], [-36, 44]], "#5e4630", { plain: true });
  if (o.overalls) { poly(j.torso, [[-30, -4], [30, -4], [36, 44], [-36, 44]], o.overalls, { plain: true }); poly(j.torso, [[-22, -56], [-12, -56], [-14, -4], [-24, -4]], o.overalls, { plain: true }); }
  else { S("circle", { cx: 10, cy: -30, r: 3.5, fill: "#6f5c33" }, j.torso); S("circle", { cx: 10, cy: -8, r: 3.5, fill: "#6f5c33" }, j.torso); }
  if (o.medals) { poly(j.torso, [[14, -32], [28, -32], [28, -10], [21, -17], [14, -10]], C.brick, { plain: true }); S("circle", { cx: 21, cy: -6, r: 7, fill: C.gold, class: "cut" }, j.torso); }
  j.legA = leg(false);
  j.head = J(bl, 6, -222); poly(j.head, [[-8, 0], [10, 0], [10, 20], [-6, 20]], skin, { plain: true });
  poly(j.head, blobPts(2, -20, 28, 30, 12, r, 0.04), skin);
  S("circle", { cx: 14, cy: -22, r: 4.2, fill: C.ink }, j.head); poly(j.head, [[8, -34], [22, -31], [22, -29], [8, -30]], C.dkbrown, { plain: true });
  poly(j.head, [[22, -18], [31, -10], [22, -9]], shade(skin), { plain: true }); S("path", { d: "M6 -7 Q15 -1 22 -7", stroke: C.dkbrown, "stroke-width": 2.4, fill: "none", "stroke-linecap": "round" }, j.head);
  if (o.moustache) poly(j.head, [[2, -12], [30, -12], [34, -6], [20, -9], [6, -6]], "#3a2c22", { plain: true });
  j.hat = J(j.head, 4, -42);
  if (o.hat === "straw") { poly(j.hat, blobPts(0, 0, 74, 13, 14, r, 0.04), "#e0c070"); poly(j.hat, blobPts(0, -20, 38, 28, 10, r, 0.04), "#e0c070"); poly(j.hat, [[-38, -12], [38, -12], [38, -2], [-38, -2]], C.brick, { plain: true }); }
  else { poly(j.hat, [[-62, 4], [-30, -8], [60, -8], [66, 2], [40, 12], [-40, 12]], C.khaki2); poly(j.hat, [[-62, 4], [-52, -26], [-30, -8]], C.khaki2); poly(j.hat, blobPts(2, -20, 38, 28, 10, r, 0.04), C.khaki2); poly(j.hat, [[-36, -12], [40, -12], [41, -4], [-37, -4]], "#4f4326", { plain: true }); }
  j.armA = arm(false);
  if (o.book) { const g = j.armA.el; poly(g, [[-2, 30], [26, 26], [30, 62], [2, 66]], "#f4ecd8"); poly(g, [[-2, 30], [4, 30], [8, 66], [2, 66]], C.brick, { plain: true }); }
  if (o.flag) { const g = j.armA.el; poly(g, [[-3, 40], [3, 40], [3, -190], [-3, -190]], "#6b4a2f"); j.flagCloth = J(g, 3, -188); poly(j.flagCloth, [[0, 0], [110, 6], [96, 30], [112, 56], [0, 64]], "#fbf6e8"); }
  return P; }
function shade(hex, f = .82) { const n = parseInt(hex.slice(1), 16); return "#" + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.min(255, Math.round(v * f)).toString(16).padStart(2, "0")).join(""); }
function personPose(P, v, t) { const j = P.j, set = (el, p) => tl.set(el, p, t);
  if (v.hA !== undefined) { set(j.legA.hip, { rotation: v.hA }); set(j.legA.knee, { rotation: v.kA || 0 }); set(j.legB.hip, { rotation: v.hB }); set(j.legB.knee, { rotation: v.kB || 0 }); }
  if (v.aA !== undefined) { set(j.armA.sh, { rotation: v.aA }); set(j.armA.el, { rotation: v.fA || 0 }); }
  if (v.aB !== undefined) { set(j.armB.sh, { rotation: v.aB }); set(j.armB.el, { rotation: v.fB || 0 }); }
  if (v.head !== undefined) set(j.head, { rotation: v.head });
  if (v.torso !== undefined) set(j.torso, { rotation: v.torso });
  if (v.bob !== undefined) set(P.bl, { y: v.bob }); }
function personWalk(P, t0, t1, o = {}) { const fps = o.fps || 8, cyc = o.cycle || 8, rn = rng((o.seed || 5) + 3);
  steps(t0, t1, fps, (k, t) => { const p = k / cyc * Math.PI * 2, s = Math.sin(p), c = Math.cos(p), s2 = -s, c2 = -c;
    personPose(P, { hA: -26 * s, kA: 34 * Math.max(0, c) * -1 * -1, hB: -26 * s2, kB: 34 * Math.max(0, c2), aA: o.armA ?? (22 * s), fA: o.foreA ?? 8, aB: -22 * s, fB: 8, bob: -5 * Math.abs(s) + (rn() - .5) * 2, head: 2 * Math.sin(p * 2) }, t);
    tl.set(P.bl, { rotation: (rn() - .5) * 2.4 }, t); }); }
function personIdle(P, t0, t1, o = {}) { const rn = rng((o.seed || 8)); steps(t0, t1, o.fps || 6, (k, t) => { const s = Math.sin(k * .8); personPose(P, { hA: 2, kA: 0, hB: -2, kB: 0, aA: o.aA ?? 10, fA: o.fA ?? -50, aB: 6, fB: 10, head: 3 * s, bob: (rn() - .5) * 2.4 }, t); tl.set(P.bl, { rotation: (rn() - .5) * 2 }, t); }); }

/* RANSOM-NOTE lettering: every letter its own scrap of paper */
const CHIP = [["#f4ecd8", "#2d2a26", "Titan One"], ["#b2523a", "#f4ecd8", "Titan One"], ["#5d8a86", "#f4ecd8", "Baloo 2"], ["#dcae48", "#2d2a26", "Baloo 2"], ["#2d2a26", "#f4ecd8", "Titan One"], ["#e7c9b4", "#7a2f22", "Playfair Display"], ["#7f8752", "#f4ecd8", "Baloo 2"]];
function ransom(host, text, o) { const r = rng(o.seed || 7), wrap = H("div", "ransom", host, { left: o.x + "px", top: o.y + "px", width: o.w + "px", fontSize: o.size + "px" }), chips = []; let last = -1;
  text.split(" ").forEach((word, wi) => { const w = H("span", "rw", wrap); [...word].forEach(ch => { let k; do { k = Math.floor(r() * (o.pal ? o.pal.length : CHIP.length)); } while (k === last); last = k; const cc = (o.pal || CHIP)[k];
      const c = H("span", "chip", w, { background: cc[0], color: cc[1], fontFamily: `"${cc[2]}", "Baloo 2", sans-serif`, fontWeight: cc[2] === "Playfair Display" ? 900 : 400, clipPath: `polygon(${(r() * 3).toFixed(1)}% ${(r() * 5).toFixed(1)}%, ${(97 + r() * 3).toFixed(1)}% ${(r() * 4).toFixed(1)}%, ${(98 + r() * 2).toFixed(1)}% ${(96 + r() * 4).toFixed(1)}%, ${(r() * 3).toFixed(1)}% ${(97 + r() * 3).toFixed(1)}%)` });
      c.textContent = ch; gsap.set(c, { rotation: (r() - .5) * 9, y: (r() - .5) * 0.07 * o.size, scale: 0.9 + r() * 0.2, autoAlpha: 0 }); chips.push(c); }); wrap.appendChild(document.createTextNode(" ")); });
  return { wrap, chips }; }
function popChips(chips, t, gap = 0.055) { chips.forEach((c, i) => { const tt = t + i * gap; tl.set(c, { autoAlpha: 1, scale: 1.3 }, tt).set(c, { scale: 1 }, tt + 0.1); }); }
/* a torn paper tag / label plate */
function plate(host, x, y, w, h, fill, seed, rotDeg) { const r = rng(seed || 2), d = H("div", "plate", host, { left: x + "px", top: y + "px", width: w + "px", height: h + "px", background: fill });
  const pts = []; const n = 14; for (let i = 0; i <= n; i++) pts.push([i / n * 100, r() * 2.4]); for (let i = 1; i <= 5; i++) pts.push([100 - r() * 1.5, i / 6 * 100]); for (let i = n; i >= 0; i--) pts.push([i / n * 100, 100 - r() * 2.4]); for (let i = 5; i >= 1; i--) pts.push([r() * 1.5, i / 6 * 100]);
  d.style.clipPath = "polygon(" + pts.map(p => p[0].toFixed(1) + "% " + p[1].toFixed(1) + "%").join(",") + ")"; gsap.set(d, { rotation: rotDeg || 0 }); return d; }

/* layers: each depth plane its own SVG so paper shadows fall between planes. data-d feeds the parallax camera */
function layer(sc, d, o = {}) { const div = H("div", "ly" + (o.shadow === false ? "" : " sh"), sc); if (d !== null && d !== undefined && !o.fixed) div.dataset.d = d;
  if (o.html) return { div, svg: null }; const svg = S("svg", { width: 1480, height: 2320, viewBox: "-200 -200 1480 2320" }, div); svg.style.cssText = "position:absolute;left:-200px;top:-200px;overflow:visible"; return { div, svg }; }
function cam(sc, t, dur, A, B, ease = "sine.inOut", origin = "540px 700px") { sc.querySelectorAll(".ly[data-d]").forEach(l => { const d = +l.dataset.d;
  tl.fromTo(l, { x: A.x * d, y: A.y * d, scale: 1 + A.z * d, transformOrigin: origin }, { x: B.x * d, y: B.y * d, scale: 1 + B.z * d, duration: dur, ease, immediateRender: true }, t); }); }

/* foreground strata: torn paper ridges with rocks, tufts and an optional fence, nearer than the characters (depth 1.2 / 1.55) */
function fore(sc, o) { const r = rng(o.seed || 5), y1 = o.y1 || 1300, y2 = o.y2 || 1490, out = [];
  const A = layer(sc, 1.2); ridge(A.svg, { y: y1, amp: 14, step: 70, fill: o.c1, seed: (o.seed || 5) + 1, torn: true, jit: 9 });
  if (o.fence) for (let i = 0; i < 9; i++) { const x = -60 + i * 150 + r() * 20; poly(A.svg, [[x, y1 + 40], [x + 14, y1 + 40], [x + 12, y1 - 70 - r() * 14], [x - 2, y1 - 62]], o.fence, { plain: true }); }
  if (o.fence) { poly(A.svg, [[-200, y1 - 38], [1280, y1 - 46], [1280, y1 - 30], [-200, y1 - 22]], o.fence, { plain: true }); poly(A.svg, [[-200, y1 - 6], [1280, y1 - 14], [1280, y1 + 4], [-200, y1 + 8]], o.fence, { plain: true }); }
  [[90, 1], [430, .8], [760, 1.1], [1010, .9]].forEach(([x, s]) => { tuft(A.svg, x + (r() - .5) * 40, y1 + 22, 1.5 * s, shade(o.c1, .72), r); });
  [[250, 44], [680, 36], [940, 52]].forEach(([x, w]) => blob(A.svg, x, y1 + 46, w, w * .55, shade(o.c1, 1.25), r, 7, .16));
  const B = layer(sc, 1.55); ridge(B.svg, { y: y2, amp: 18, step: 80, fill: o.c2, seed: (o.seed || 5) + 2, torn: true, jit: 11 });
  [[40, 2.6], [560, 2.2], [1040, 2.8]].forEach(([x, s]) => tuft(B.svg, x, y2 + 30, s, shade(o.c2, .7), r));
  [[200, 70], [840, 84]].forEach(([x, w]) => blob(B.svg, x, y2 + 70, w, w * .5, shade(o.c2, 1.35), r, 7, .16));
  [A, B].forEach(l => { const first = [...sc.children].find(c => c.classList.contains("ly") && !c.dataset.d); if (first) sc.insertBefore(l.div, first); });
  return { A, B }; }

/* stage and scenes: every scene is a full sheet of paper (.sc); later sheets sit above earlier ones */
const SC = [], TD = 0.82;
function paperStage() { const st = document.getElementById("stage"); st.style.transform = `scale(${vfrey.frame.width / 1080})`; return st; }
function mk(bg) { const st = document.getElementById("stage"), d = H("div", "sc", st, { background: bg }); if (SC.length) { gsap.set(d, { autoAlpha: 0 }); d.style.zIndex = 10 + SC.length; }
  d._shade = H("div", "", d, { inset: "0", background: "#1d130a", opacity: 0, zIndex: 40, pointerEvents: "none" }); SC.push(d); return d; }
const STEP = (dur, fps = 8) => `steps(${Math.max(1, Math.round(dur * fps))})`;   // a stop-motion ease for travel: tl.to(P.mv, { x: 300, duration: 2, ease: STEP(2) }, t)

/* paper transitions into scene i at time t (start them about 0.62 s before the beat). Call after every scene is built. */
function slide(i, t, from = "right") { const n = SC[i], o = SC[i - 1], v = from === "bottom" ? { y: 1920 } : { x: from === "left" ? -1080 : 1080 };
  tl.set(n, { autoAlpha: 1 }, t).fromTo(n, Object.assign({ rotation: from === "bottom" ? 0 : 1.6 }, v), { x: 0, y: 0, rotation: 0, duration: TD, ease: "power3.inOut" }, t);
  tl.to(o, from === "bottom" ? { y: -260, duration: TD, ease: "power3.inOut" } : { x: from === "left" ? 260 : -260, duration: TD, ease: "power3.inOut" }, t); tl.to(o._shade, { opacity: .5, duration: TD }, t); tl.set(o, { autoAlpha: 0 }, t + TD + .02); }
function fold(i, t) { const n = SC[i], o = SC[i - 1]; tl.set(n, { autoAlpha: 1 }, t).set(o, { zIndex: 50 }, t);
  tl.fromTo(o, { rotationX: 0, transformPerspective: 1500, transformOrigin: "50% 0%" }, { rotationX: -104, duration: TD, ease: "power2.in" }, t); tl.to(o._shade, { opacity: .75, duration: TD, ease: "power2.in" }, t); tl.set(o, { autoAlpha: 0 }, t + TD + .02); }
const _tj = (() => { const q = rng(77), a = []; for (let i = 0; i <= 30; i++) a.push((q() - .5) * 38); return a; })();
const _tornClip = (Y) => `polygon(${_tj.map((j, i) => `${(i / 30 * 1080).toFixed(0)}px ${(Y + j).toFixed(0)}px`).join(",")}, 1080px 2200px, 0px 2200px)`;   // same point count at both ends, so GSAP can interpolate
let _tornBand = null;
function tear(i, t) { const n = SC[i], o = SC[i - 1];
  if (!_tornBand) { const d = H("div", "", document.getElementById("stage"), { left: "0px", top: "0px", width: "1080px", height: "60px", zIndex: 60, pointerEvents: "none" }), sv = S("svg", { width: 1080, height: 80, viewBox: "0 0 1080 80" }, d);
    sv.style.cssText = "overflow:visible;position:absolute;left:0;top:0;filter:drop-shadow(0 -8px 8px rgba(30,20,10,.45))";
    S("polygon", { points: pstr(_tj.map((j, k) => [k / 30 * 1080, j]).concat(_tj.map((j, k) => [k / 30 * 1080, j + 14 + ((k * 7) % 5)]).reverse())), fill: "#f6efdd" }, sv); gsap.set(d, { y: 2100, autoAlpha: 0 }); _tornBand = d; }
  tl.set(n, { autoAlpha: 1, clipPath: _tornClip(2100) }, t).to(n, { clipPath: _tornClip(-60), duration: TD + .1, ease: "power2.inOut" }, t);
  tl.set(_tornBand, { autoAlpha: 1, y: 2100 }, t).to(_tornBand, { y: -60, duration: TD + .1, ease: "power2.inOut" }, t).set(_tornBand, { autoAlpha: 0 }, t + TD + .12); tl.set(o, { autoAlpha: 0 }, t + TD + .14); tl.set(n, { clipPath: "none" }, t + TD + .14); }
