/* sketch.js: the whiteboard-sketch hand-drawing kit for a vfrey scene.
   Load it with <script src="sketch.js"></script> AFTER vfrey.js and gsap and AFTER `const tl = vfrey.timeline();`
   is defined in an earlier inline script (these functions read the globals `tl` and `gsap`), and put it inside <body>.
   Everything random comes from the seeded rnd(), so every seek renders the same picture. */
"use strict";
const NS = "http://www.w3.org/2000/svg";
const W = 1080, H = 1920;
const INK = "#23232b", BLUE = "#2458d6", RED = "#d8392b", BOARD = "#f4f2ea", PLATE = "#fff1a8";
const $ = (s) => document.querySelector(s);
const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
let _s = 90210;
const rnd = () => { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rr = (a, b) => a + (b - a) * rnd();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---- geometry helpers: everything gets a little human wobble ---- */
let SAMP = null, sp = null; // a hidden path used to measure and sample SVG path strings (made on first use)
function sample(d, step = 5) { if (!sp) { SAMP = el("svg", { width: 0, height: 0, style: "position:absolute;left:0;top:0" }, document.body); sp = el("path", {}, SAMP); } sp.setAttribute("d", d); const L = sp.getTotalLength(), n = Math.max(2, Math.ceil(L / step)), o = []; for (let i = 0; i <= n; i++) { const q = sp.getPointAtLength(L * i / n); o.push([q.x, q.y]); } return o; }
function dens(p, step = 6) { const o = [p[0]]; for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 1; k <= n; k++) o.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } return o; }
function wob(p, amp = 1.5, fr = 0.02) {
  const ph = [rr(0, 6.28), rr(0, 6.28), rr(0, 6.28)], n = p.length; let s = 0; const o = [];
  for (let i = 0; i < n; i++) {
    if (i) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const k = amp * (Math.sin(s * fr + ph[0]) * 0.6 + Math.sin(s * fr * 2.7 + ph[1]) * 0.3 + Math.sin(s * fr * 6 + ph[2]) * 0.1);
    o.push([p[i][0] - dy / l * k, p[i][1] + dx / l * k]);
  }
  return o;
}
function cr(P, seg = 9) {
  const o = [], n = P.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
    for (let k = 0; k < seg; k++) { const t = k / seg, t2 = t * t, t3 = t2 * t; const f = (j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3); o.push([f(0), f(1)]); }
  }
  o.push(P[n - 1]); return o;
}
const PL = (P, amp = 1.2) => wob(dens(P), amp);                     // polyline with corners
const CR = (P, amp = 1.2) => wob(dens(cr(P)), amp);                 // smooth curve through points
const LN = (x1, y1, x2, y2, amp = 1.1) => {                          // slightly bowed line with overshoot
  const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, o1 = rr(0, 5), o2 = rr(1, 7), b = rr(-1, 1) * Math.min(8, l * 0.025);
  const a = [x1 - ux * o1, y1 - uy * o1], c = [x2 + ux * o2, y2 + uy * o2], m = [(a[0] + c[0]) / 2 - uy * b, (a[1] + c[1]) / 2 + ux * b];
  return wob(dens(cr([a, m, c], 6)), amp);
};
const ELL = (cx, cy, rx, ry, o = {}) => {                            // not-quite-closed wobbly oval
  const a0 = o.a0 ?? rr(-3.1, 3.1), sw = o.sweep ?? rr(6.5, 7.0), n = Math.ceil((rx + ry) * 0.9) + 18, ph = rr(0, 6), pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + sw * t, f = 1 + 0.035 * Math.sin(a * 2 + ph) + 0.03 * t; pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]); }
  return wob(pts, o.amp ?? 1.1);
};
const RECT = (x, y, w, h, rot = 0) => {                              // hand-drawn rectangle, corners overshoot
  const c = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; const cx = x + w / 2, cy = y + h / 2, ca = Math.cos(rot), sa = Math.sin(rot);
  const tr = ([px, py]) => [cx + (px - cx) * ca - (py - cy) * sa, cy + (px - cx) * sa + (py - cy) * ca];
  const j = () => rr(-3, 3);
  const P = [[x - 4 + j(), y + j()], [x + w + 3 + j(), y + j()], [x + w + j(), y + h + 4 + j()], [x - 3 + j(), y + h + j()], [x + j() + 1, y - 6]].map(tr);
  return wob(dens(P), 1.0);
};
const STAR = (cx, cy, r) => { const P = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr_ = i % 2 ? r * 0.45 : r; P.push([cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_]); } P.push(P[1]); return PL(P, 0.8); };
const ARROW = (x1, y1, x2, y2, bow = 0.12, hs = 26) => {            // [shaft, head]
  const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, m = [(x1 + x2) / 2 - uy * l * bow, (y1 + y2) / 2 + ux * l * bow];
  const sh = CR([[x1, y1], m, [x2, y2]], 1.0), a = 0.5, ang = Math.atan2(y2 - m[1], x2 - m[0]);
  const h = PL([[x2 - Math.cos(ang - a) * hs, y2 - Math.sin(ang - a) * hs], [x2, y2], [x2 - Math.cos(ang + a) * hs, y2 - Math.sin(ang + a) * hs]], 0.6);
  return [sh, h];
};
const plen = (p) => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; };
function zig(poly, ang, gap) {                                       // marker hatching: one back-and-forth scribble clipped to a polygon
  const ca = Math.cos(ang), sa = Math.sin(ang), rp = poly.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca]);
  let mn = 1e9, mx = -1e9; rp.forEach((q) => { mn = Math.min(mn, q[1]); mx = Math.max(mx, q[1]); });
  const out = []; let flip = false;
  for (let y = mn + gap * 0.6; y < mx; y += gap) {
    const xs = []; for (let i = 0; i < rp.length; i++) { const a = rp[i], b = rp[(i + 1) % rp.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) { const x0 = xs[k] + rr(-2, 4), x1 = xs[k + 1] + rr(-4, 2); const seg = flip ? [[x1, y + rr(-1, 1)], [x0, y + rr(-1, 1)]] : [[x0, y], [x1, y]]; out.push(...seg); }
    flip = !flip;
  }
  return out.map(([x, y]) => [x * ca - y * sa, x * sa + y * ca]);
}
const HATCH = (poly, ang = 0.8, gap = 16) => PL(zig(poly, ang, gap), 1.2);
const OVAL_POLY = (cx, cy, rx, ry) => Array.from({ length: 20 }, (_, i) => [cx + Math.cos(i * Math.PI / 10) * rx, cy + Math.sin(i * Math.PI / 10) * ry]);
const RECT_POLY = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/* ---- single-stroke hand lettering (capitals, digits): path strings in a 100-unit-tall box ---- */
const GL = {
  A: [60, "M4 100 L30 4 L56 100", "M16 68 L46 66"], B: [52, "M8 100 L8 2", "M8 4 C42 0 48 30 10 48 C54 50 54 100 8 98"],
  C: [54, "M50 18 C34 -4 4 6 4 50 C4 94 34 104 50 82"], D: [56, "M8 100 L8 2", "M8 4 C58 0 58 100 8 98"],
  E: [46, "M44 4 L8 4 L8 98 L44 98", "M8 50 L36 50"], F: [44, "M42 4 L8 4 L8 100", "M8 50 L34 50"],
  G: [58, "M52 18 C38 -4 4 6 4 50 C4 96 46 106 52 62 L30 60"], H: [54, "M8 2 L8 100", "M46 2 L46 100", "M8 52 L46 50"],
  I: [26, "M13 2 L13 100"], J: [38, "M30 2 L30 74 C30 104 4 104 2 80"], K: [54, "M8 2 L8 100", "M48 2 L10 56 L52 100"],
  L: [44, "M8 2 L8 98 L42 98"], M: [74, "M6 100 L10 2 L37 70 L63 2 L68 100"], N: [58, "M8 100 L8 2 L50 98 L50 2"],
  O: [60, "M30 2 C-4 2 -2 100 30 100 C64 100 64 0 28 4"], P: [48, "M8 100 L8 2", "M8 4 C48 -2 54 44 8 48"],
  Q: [62, "M30 2 C-4 2 -2 100 30 100 C64 100 64 0 28 4", "M34 70 L58 106"], R: [52, "M8 100 L8 2", "M8 4 C48 -2 54 44 8 48", "M22 48 L48 100"],
  S: [48, "M44 14 C30 -4 4 6 10 30 C16 54 46 52 44 78 C40 104 8 102 4 84"], T: [54, "M2 4 L52 4", "M27 4 L27 100"],
  U: [56, "M8 2 L8 70 C10 108 48 106 48 70 L48 0"], V: [58, "M3 2 L29 100 L55 2"], W: [82, "M3 2 L18 100 L41 24 L64 100 L79 2"],
  X: [56, "M4 2 L52 100", "M52 2 L4 100"], Y: [56, "M3 2 L28 52 L53 2", "M28 52 L28 100"], Z: [52, "M6 4 L46 4 L6 98 L48 98"],
  "0": [48, "M24 2 C0 2 0 100 24 100 C48 100 48 0 22 4"], "1": [32, "M6 26 L19 2 L19 100"], "2": [48, "M6 22 C10 -4 44 0 42 28 C40 52 8 78 4 98 L46 98"],
  "3": [48, "M6 10 C24 -4 46 14 26 44 C54 52 46 108 4 90"], "4": [52, "M40 100 L40 2 L4 68 L50 68"], "5": [48, "M42 4 L10 4 L7 44 C34 34 50 60 42 82 C34 104 10 102 4 90"],
  "6": [48, "M40 8 C14 0 4 40 6 68 C8 106 46 104 44 72 C42 46 14 48 6 68"], "7": [48, "M4 4 L46 4 L18 100"],
  "8": [48, "M24 48 C0 40 6 2 24 2 C46 2 48 40 24 48 C-2 58 2 100 24 100 C50 100 50 58 24 48"], "9": [48, "M44 34 C42 62 6 62 5 32 C4 2 44 -2 44 34 C44 62 38 96 10 98"],
  "?": [42, "M4 24 C8 -2 40 0 38 26 C36 46 20 46 20 64", "M20 90 L20 94"], ".": [12, "M6 94 L6 98"], ",": [14, "M8 92 L4 108"], "'": [10, "M5 4 L3 22"],
  "-": [32, "M4 56 L28 54"], "!": [14, "M7 2 L7 70", "M7 92 L7 96"], "=": [46, "M4 36 L42 34", "M4 66 L44 64"], "+": [46, "M23 22 L23 78", "M4 50 L42 49"], "%": [64, "M8 4 L52 98", "M14 14 L14 18", "M48 84 L48 88"], "/": [30, "M26 2 L4 100"],
  ":": [12, "M6 30 L6 34", "M6 82 L6 86"], "(": [24, "M20 0 C0 30 0 70 20 100"], ")": [24, "M4 0 C24 30 24 70 4 100"],
};
const _gs = {};
const glyphPts = (ch) => (_gs[ch] || (_gs[ch] = GL[ch].slice(1).map((d) => sample(d, 4))));
/* TXT returns { strokes:[pts], width }. (x,y) = start of baseline (anchor start/middle/end), h = cap height, rot = radians about (x,y). */
function TXT(s, x, y, h, o = {}) {
  const k = h / 100, anchor = o.anchor || "start", track = o.track ?? 7, slant = o.slant ?? 0.09, rot = o.rot || 0, amp = o.amp ?? 0.9;
  let adv = 0; const raw = [];
  for (const ch0 of s.toUpperCase()) {
    if (ch0 === " ") { adv += 30 * k; continue; }
    const g = GL[ch0]; if (!g) { adv += 30 * k; continue; }
    const sc = rr(0.94, 1.06), dy = rr(-0.035, 0.035) * h, rt = rr(-0.06, 0.06), gw = g[0] * sc * k, a0 = adv;
    for (const p of glyphPts(ch0)) raw.push(p.map(([px, py]) => {
      const lx = px * sc * k - gw / 2, ly = (py - 50) * k, c = Math.cos(rt), sn = Math.sin(rt);
      return [a0 + gw / 2 + lx * c - ly * sn + (100 - py) * slant * k, dy - 50 * k + lx * sn + ly * c];
    }));
    adv += gw + track * k;
  }
  const width = adv - track * k, off = anchor === "middle" ? -width / 2 : anchor === "end" ? -width : 0, ca = Math.cos(rot), sa = Math.sin(rot);
  return { width, strokes: raw.map((st) => wob(st.map(([px, py]) => { const X = px + off, Y = py; return [x + X * ca - Y * sa, y + X * sa + Y * ca]; }), amp * 0.8, 0.05)) };
}

/* ====================== ink engine ====================== */
/* sketchDefs(): call once before the first layer(). It adds the roughness filter, the board gradient and #paperG (the opaque board every layer starts with). */
function sketchDefs() {
  const DEFS = el("svg", { width: 0, height: 0, style: "position:absolute;left:0;top:0" }, document.body);
  const dd = el("defs", {}, DEFS);
  dd.innerHTML = `
<filter id="rough" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="blur14"><feGaussianBlur stdDeviation="14"/></filter><filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
<radialGradient id="bgrad" cx="45%" cy="38%" r="85%"><stop offset="0" stop-color="#fbfaf5"/><stop offset="0.7" stop-color="${BOARD}"/><stop offset="1" stop-color="#e6e3d8"/></radialGradient>
<linearGradient id="penBody" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#e4e6ec"/><stop offset="1" stop-color="#b9bdc8"/></linearGradient>
<g id="paperG"><rect width="1080" height="1920" fill="url(#bgrad)"/><g id="smudges"></g><g id="ghosts"></g></g>`;
}

const LAYERS = {};
let _mid = 0;
function layer(id, z) {
  const svg = el("svg", { viewBox: "0 0 1080 1920", width: W, height: H, class: "layer" }); svg.id = id; svg.style.zIndex = z; document.querySelector("#cam").appendChild(svg);
  const defs = el("defs", {}, svg); el("use", { href: "#paperG" }, svg); const g = el("g", { filter: "url(#rough)" }, svg);
  return (LAYERS[id] = { svg, defs, g });
}
const PS = []; // pen registry
const ink = (L, pts, { c = INK, w = 8, t = 0, d = 0.4, ease = "power1.inOut", pen = true, g } = {}) => {
  const n = pts.length; if (n < 2) return; const cum = [0]; for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const len = cum[n - 1]; if (len < 1) return;
  const ph = rr(0, 6), left = [], right = []; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, u = i / (n - 1);
    const ww = w * (0.62 + 0.38 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.92 + 0.04)), 0.5)) * (1 + 0.1 * Math.sin(cum[i] * 0.045 + ph)) / 2, nx = -dy / l * ww, ny = dx / l * ww;
    left.push([pts[i][0] + nx, pts[i][1] + ny]); right.push([pts[i][0] - nx, pts[i][1] - ny]);
    x0 = Math.min(x0, pts[i][0]); y0 = Math.min(y0, pts[i][1]); x1 = Math.max(x1, pts[i][0]); y1 = Math.max(y1, pts[i][1]);
  }
  const f = (q) => q[0].toFixed(1) + " " + q[1].toFixed(1);
  const dpoly = "M" + left.map(f).join("L") + "L" + right.reverse().map(f).join("L") + "Z";
  const id = "mk" + _mid++, m = w * 2 + 6;
  const mask = el("mask", { id, maskUnits: "userSpaceOnUse", x: x0 - m, y: y0 - m, width: x1 - x0 + 2 * m, height: y1 - y0 + 2 * m }, L.defs);
  const mp = el("path", { d: "M" + pts.map(f).join("L"), fill: "none", stroke: "#fff", "stroke-width": w * 3, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": `${len + 10} ${2 * len + 300}` }, mask);
  el("path", { d: dpoly, fill: c, stroke: c, "stroke-width": w * 0.28, "stroke-linejoin": "round", mask: `url(#${id})`, opacity: 0.94 }, g || L.g);
  mp.style.strokeDashoffset = len + w * 4;
  tl.to(mp, { strokeDashoffset: 0, duration: d, ease }, t);
  if (pen) PS.push({ t0: t, d, ease: gsap.parseEase(ease), pts, cum, len, c });
};
const I = (pts, c = INK, w = 7) => ({ pts, c, w });
/* TI: hand-lettered text as strokes. Its first stroke carries the words, so build() can tell vfrey's checks what is on the board (vfrey.drew). */
const TI = (s, x, y, h, c = INK, o = {}) => { const out = TXT(s, x, y, h, o).strokes.map((p) => ({ pts: p, c, w: o.w || Math.max(4.5, h * 0.085) })); if (out[0]) out[0].said = s; return out; };
const SAID = []; let saidHooked = false;
function said(L, text, at) {
  SAID.push({ L, text, at });
  if (saidHooked || !window.vfrey || !vfrey.drew) return;
  saidHooked = true;
  vfrey.onFrame((t) => { for (const s of SAID) if (t >= s.at && s.L.svg.style.display !== "none") vfrey.drew(s.text); });
}
const TWID = (s, h, o = {}) => TXT(s, 0, 0, h, o).width;
/* lay a list of items out in time [t0,t1]; marker speed in px/s */
function build(L, items, t0, t1, { speed = 1500, maxK = 1.7, gap = 0.015, minD = 0.05, g } = {}) {
  const raw = items.map((it) => clamp(plen(it.pts) / speed, minD, 1.3)); const tot = raw.reduce((a, b) => a + b, 0) + gap * items.length;
  const k = Math.min(maxK, (t1 - t0) / tot); let t = t0;
  if ((t1 - t0) / tot < 0.55) console.warn("dense scene", L.svg.id, "needs k", ((t1 - t0) / tot).toFixed(2));
  items.forEach((it, i) => { const d = Math.max(0.035, raw[i] * k); if (it.said) said(L, it.said, t); ink(L, it.pts, { c: it.c, w: it.w, t, d, g }); t += d + gap * k; });
  return t;
}
const grp = (L) => el("g", {}, L.g);
/* a group faded in at time t (for things that appear rather than get drawn) */
const pop = (g, t, d = 0.25) => { gsap.set(g, { opacity: 0 }); tl.to(g, { opacity: 1, duration: d, ease: "power1.out" }, t); };
const fade = (g, t, d = 0.4, to = 0) => tl.to(g, { opacity: to, duration: d, ease: "power1.in" }, t);
