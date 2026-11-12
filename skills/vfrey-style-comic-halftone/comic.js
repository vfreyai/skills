/* Comic halftone toolkit for a vfrey HTML scene (vfrey-style-comic-halftone). Copy this file into the scene folder and load it
   after vfrey.js and gsap, before your own scene script:  <script src="comic.js"></script>
   Everything is seeded and deterministic (inline SVG + divs, no images). Coordinates are in a 1080x1920 drawing space (9:16).
   Your scene script starts with:  const tl = vfrey.timeline();  then builds `html` from panel(...) strings, sets #root, and
   calls setupPage(), slam(...), the pop/flash/shake/push helpers and finally ticker(). */
"use strict";
const INK = "#16111C", PAPER = "#F4E7C5", RED = "#E8272F", YEL = "#FFD11A", CY = "#18B2E8", BL = "#1658C6", NAVY = "#0F2F7C",
  MAG = "#E8368F", ORG = "#FF8A1F", WH = "#FFFBEF";   // print inks; add a hero accent colour of your own (and a darker tone for its dots)
const WD = vfrey.timing.words, DUR = vfrey.timing.durationSec;
const $ = (s) => document.querySelector(s);
const f1 = (n) => Math.round(n * 10) / 10;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const sstep = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
let _s = 12345; const rnd = () => { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; };   // seeded: never Math.random
const ambient = [];   // functions of time (seconds) that redraw attribute-driven art; run by ticker()

/* ---------- word anchors: found by text, so a re-timed voice still lines up ---------- */
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9-]/g, "");
const find = (w, from = 0) => { for (let i = from; i < WD.length; i++) if (norm(WD[i].text) === w) return i; throw new Error("word not found: " + w); };
// anchors([["key", "word"], ...]) walks the spoken words in order (so a repeated word is the next one) and returns { key: start seconds }
function anchors(pairs) { const T = {}; let p = 0; pairs.forEach(([k, w]) => { p = find(w, p); T[k] = WD[p].start; }); return T; }

/* ---------- drawing helpers ---------- */
let _id = 0;
const E = (cx, cy, rx, ry) => `M${f1(cx - rx)} ${f1(cy)}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`;
const RR = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
// THE look: colour fill printed slightly off register under an un-shifted ink outline; o.shade = a halftone pattern id clipped to the shape
const P = (d, fill, o = {}) => {
  const sw = o.sw ?? 7, off = o.off ?? [5, 4]; let mid = "";
  if (o.shade) { const k = "k" + ++_id; const r = o.sr || [-999, -999, 2000, 2000];
    mid = `<clipPath id="${k}"><path d="${d}"/></clipPath><g clip-path="url(#${k})"><rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="url(#${o.shade})"/></g>`; }
  return `<path d="${d}" fill="${fill}" transform="translate(${off[0]} ${off[1]})"/>${mid}<path d="${d}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
};
// an inked stroke (limbs, antennae, rays): ink underneath, colour on top
const LN = (d, w, col, ink = true) => (ink ? `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round" stroke-linejoin="round"/>` : "") + `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
// halftone as ONE path of circles whose radius follows fn(x,y) -> 0..1 (a gradient made of dots). sp 16-26, rMax about 0.6 x sp
const ht = (w, h, sp, ang, rMax, fn) => {
  let d = ""; const ca = Math.cos(ang), sa = Math.sin(ang), R = Math.hypot(w, h) / 2 + sp;
  for (let u = -R; u < R; u += sp) for (let v = -R; v < R; v += sp) {
    const x = w / 2 + u * ca - v * sa, y = h / 2 + u * sa + v * ca;
    if (x < -sp || x > w + sp || y < -sp || y > h + sp) continue;
    const k = fn(x, y); if (k <= 0.05) continue; const r = f1(rMax * Math.min(1, k));
    d += `M${f1(x - r)} ${f1(y)}a${r} ${r} 0 1 0 ${f1(2 * r)} 0a${r} ${r} 0 1 0 ${f1(-2 * r)} 0z`;
  }
  return d;
};
const burstD = (cx, cy, R, r, n, rot = 0) => { let d = ""; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n; const rr = (i % 2 ? r : R) * (i % 2 ? 1 : 0.86 + 0.28 * rnd()); d += (i ? "L" : "M") + f1(cx + Math.cos(a) * rr) + " " + f1(cy + Math.sin(a) * rr); } return d + "z"; };
// impact burst: ink offset copy, outer burst, dotted shade, inner burst. Put the number or word inside.
const burst = (cx, cy, R, c1 = YEL, c2 = RED, n = 13) => {
  const rot = rnd() * 3; const d1 = burstD(cx, cy, R, R * 0.62, n, rot), d2 = burstD(cx, cy, R * 0.74, R * 0.46, n, rot + 0.1);
  return `<path d="${d1}" fill="${INK}" transform="translate(12 14)"/>` + P(d1, c1, { sw: 9 }) + `<path d="${d1}" fill="url(#dkR)" opacity=".45"/>` + P(d2, c2, { sw: 7 });
};
// hand-lettered sound effect: per-letter jitter, ink extrusion, off-register colour, white halftone highlight.
// Wrap-friendly: returns <g id><g transform>, so GSAP can pop the outer group. Needs Titan One.
const sfx = (txt, x, y, size, rot, fill, id, o = {}) => {
  const ch = [...txt]; let prev = 0; const dys = ch.map(() => { const j = (rnd() - 0.5) * size * 0.2; const dd = j - prev; prev = j; return f1(dd); }).join(" ");
  const rots = ch.map(() => f1((rnd() - 0.5) * 12)).join(" ");
  const a = `x="0" y="0" font-size="${size}" text-anchor="middle" dy="${dys}" rotate="${rots}"`;
  const col2 = o.col2 || WH;
  return `<g id="${id}"><g transform="translate(${x} ${y}) rotate(${rot}) skewX(${o.skew ?? -7})">
    <text ${a} fill="${INK}" stroke="${INK}" stroke-width="${f1(size * 0.3)}" stroke-linejoin="round" transform="translate(${f1(size * 0.07)} ${f1(size * 0.1)})">${txt}</text>
    <text ${a} fill="${fill}" stroke="${INK}" stroke-width="${f1(size * 0.17)}" stroke-linejoin="round" paint-order="stroke" transform="translate(${f1(size * 0.025)} ${f1(size * 0.03)})">${txt}</text>
    <text ${a} fill="${col2}" stroke="none" transform="translate(${f1(-size * 0.02)} ${f1(-size * 0.025)})" opacity=".3">${txt}</text>
    <text ${a} fill="url(#dkW)" stroke="none" opacity=".9">${txt}</text></g></g>`;
};
// comic caption or label box: hard ink offset rect, printed fill, uppercase Baloo 2 text (class bl)
const box = (txt, x, y, w, h, size = 46, fill = YEL, tc = INK, id = "", rot = -2) =>
  `<g id="${id}"><g transform="translate(${x} ${y}) rotate(${rot})"><rect x="9" y="11" width="${w}" height="${h}" fill="${INK}"/>${P(`M0 0H${w}V${h}H0Z`, fill, { sw: 7, off: [4, 3] })}
   <text class="bl" x="${w / 2}" y="${f1(h / 2 + size * 0.34)}" text-anchor="middle" font-size="${size}" fill="${tc}" letter-spacing="1">${txt}</text></g></g>`;
// radial speed lines: tapered triangles from a focus point (r0 inner, r1 outer, n rays, spread = ray width in radians)
const speedRadial = (cx, cy, r0, r1, n, col, seedRot = 0, spread = 0.05, op = 1) => { let d = ""; for (let i = 0; i < n; i++) { const a = seedRot + i * 2 * Math.PI / n + (rnd() - 0.5) * 0.12; const ra = r0 + rnd() * r0 * 0.4, rb = r1 * (0.85 + rnd() * 0.3), s = spread * (0.5 + rnd());
  d += `M${f1(cx + Math.cos(a - s) * rb)} ${f1(cy + Math.sin(a - s) * rb)}L${f1(cx + Math.cos(a) * ra)} ${f1(cy + Math.sin(a) * ra)}L${f1(cx + Math.cos(a + s) * rb)} ${f1(cy + Math.sin(a + s) * rb)}z`; }
  return `<path d="${d}" fill="${col}" opacity="${op}"/>`; };
// horizontal motion streaks trailing behind a moving thing: ys = the rows, from x0 (tail) to x1 (the thing)
const streaks = (x0, x1, ys, th, col) => { let d = ""; ys.forEach((y) => { const l = x0 + (x1 - x0) * (0.15 + rnd() * 0.5), t = th * (0.5 + rnd()); d += `M${f1(x1)} ${f1(y)}L${f1(l)} ${f1(y - t / 2)}L${f1(x0 - rnd() * 60)} ${f1(y)}L${f1(l)} ${f1(y + t / 2)}z`; }); return `<path d="${d}" fill="${col}"/>`; };
// a round shiny thing (bubble, bead, lens): pale fill, ink ring, white glint
const bubble = (id, cx, cy, r) => `<g id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#CFF3FF" fill-opacity=".5" stroke="${INK}" stroke-width="${f1(Math.max(3, r * 0.14))}"/><path d="M${f1(cx - r * 0.55)} ${f1(cy - r * 0.15)}a${f1(r * 0.6)} ${f1(r * 0.6)} 0 0 1 ${f1(r * 0.35)} ${f1(-r * 0.45)}" fill="none" stroke="#fff" stroke-width="${f1(Math.max(3, r * 0.16))}" stroke-linecap="round"/></g>`;
// a round gauge: face, green and red arcs from angle a0 to a1 (degrees, redFrom = fraction where red starts), ticks, a needle <g id>
function dial(id, cx, cy, r, a0, a1, ticks, redFrom, green = "#2FBF62") {
  let t = "";
  for (let i = 0; i <= ticks; i++) { const a = (a0 + (a1 - a0) * i / ticks) * Math.PI / 180, big = i % 2 === 0, r0 = r - (big ? 40 : 26);
    t += `<path d="M${f1(cx + Math.cos(a) * r0)} ${f1(cy + Math.sin(a) * r0)}L${f1(cx + Math.cos(a) * (r - 8))} ${f1(cy + Math.sin(a) * (r - 8))}" stroke="${INK}" stroke-width="${big ? 9 : 5}" stroke-linecap="round"/>`; }
  const arc = (A, B, col) => { const rr = r - 62, x1 = cx + Math.cos(A * Math.PI / 180) * rr, y1 = cy + Math.sin(A * Math.PI / 180) * rr, x2 = cx + Math.cos(B * Math.PI / 180) * rr, y2 = cy + Math.sin(B * Math.PI / 180) * rr;
    return `<path d="M${f1(x1)} ${f1(y1)}A${rr} ${rr} 0 0 1 ${f1(x2)} ${f1(y2)}" fill="none" stroke="${col}" stroke-width="22"/>`; };
  const rf = a0 + (a1 - a0) * redFrom;
  return `<path d="${E(cx, cy, r, r)}" fill="${INK}" transform="translate(10 12)"/>` + P(E(cx, cy, r, r), WH, { sw: 10 }) + arc(a0, rf, green) + arc(rf, a1, RED) + t +
    `<g id="${id}"><path d="M${cx - 18} ${cy}L${cx} ${cy - 18}L${cx + r - 36} ${cy}L${cx} ${cy + 18}z" fill="${RED}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/></g><circle cx="${cx}" cy="${cy}" r="24" fill="${YEL}" stroke="${INK}" stroke-width="8"/>`;
}

/* ---------- print texture: halftone patterns, paper grain, dot grid ---------- */
// <svg>...hidden defs</svg>: put this FIRST in html. Pattern ids: dk ink, dkS small ink, dkW white, dkR red, dkO orange, dkB blue, dkM magenta, dkH hero accent.
const defs = (heroDots = "#127A3E") => `<svg width="0" height="0" style="position:absolute"><defs>
  <pattern id="dk" width="15" height="15" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><circle cx="7.5" cy="7.5" r="3.4" fill="${INK}"/></pattern>
  <pattern id="dkS" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><circle cx="4.5" cy="4.5" r="2" fill="${INK}"/></pattern>
  <pattern id="dkW" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><circle cx="6.5" cy="6.5" r="2.5" fill="#fff"/></pattern>
  <pattern id="dkR" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="6" cy="6" r="2.9" fill="${RED}"/></pattern>
  <pattern id="dkO" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="6" cy="6" r="3" fill="${ORG}"/></pattern>
  <pattern id="dkB" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="7" cy="7" r="3.4" fill="${BL}"/></pattern>
  <pattern id="dkM" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="6" cy="6" r="3" fill="${MAG}"/></pattern>
  <pattern id="dkH" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="6" cy="6" r="3.3" fill="${heroDots}"/></pattern>
</defs></svg>`;
// a 256 px paper tile drawn with a seeded generator; returns a data: url for #paper (multiply, opacity .25 or less)
function paperUrl() {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  g.fillStyle = "#F7EBCB"; g.fillRect(0, 0, 256, 256); let s = 99;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(120,90,40,${0.04 + r() * 0.1})`; g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); }
  for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(110,80,30,${0.03 + r() * 0.06})`; g.beginPath(); const x = r() * 256, y = r() * 256; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 24, y + (r() - 0.5) * 24); g.stroke(); }
  return c.toDataURL();
}

/* ---------- layout around the caption band, panels, the page shell ---------- */
// The caption plate and the captions follow vfrey's band (--vf-caption-at, --vf-caption-h). VB turns frame pixels into 1080x1920 units.
const VB = 1920 / vfrey.frame.height, CAP_TOP = vfrey.captionBox.top * VB, CAP_H = vfrey.captionBox.height * VB, CAP_BOTTOM = CAP_TOP + CAP_H;
const M = 36;   // paper margin
// rows of panels above (row A) and below (row B) the plate; row A is null when the plate is near the top
const ROW_A = CAP_TOP - 32 - 64 > 260 ? { x: M, y: 64, w: 1080 - 2 * M, h: Math.round(CAP_TOP - 32 - 64) } : null;
const ROW_B = { x: M, y: Math.round(CAP_BOTTOM + 38), w: 1080 - 2 * M, h: Math.round(1882 - (CAP_BOTTOM + 38)) };
// panel(id, x, y, w, h, poly, body, {z}): a div with a slanted clip polygon (poly = [[u,v],...] in 0..1), 13 px ink border, hard shadow.
// body is SVG in panel units. Groups sk-<id> (shake) and in-<id> (slow push-in) wrap the body: animate those, never one group for both.
function panel(id, x, y, w, h, poly, body, o = {}) {
  const pts = poly.map(([a, b]) => `${f1(a * w)},${f1(b * h)}`).join(" ");
  return `<div class="panel" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${o.z || 10}">
    <svg viewBox="-24 -24 ${w + 48} ${h + 48}" style="left:-24px;top:-24px;width:${w + 48}px;height:${h + 48}px">
      <defs><clipPath id="cp-${id}"><polygon points="${pts}"/></clipPath></defs>
      <polygon points="${pts}" fill="${INK}" transform="translate(11 13)"/>
      <g clip-path="url(#cp-${id})"><g id="sk-${id}"><g id="in-${id}">${body}</g></g></g>
      <polygon points="${pts}" fill="none" stroke="${INK}" stroke-width="13" stroke-linejoin="miter"/>
    </svg></div>`;
}
// the page body: put this in #root.innerHTML after the panels, and call setupPage(paperOpacity) once it is set
const shell = (panels) => `<div class="cam" id="cam">${panels}</div><div id="paper"></div><div id="dots"></div><div id="flash"></div><div id="capplate"></div><div id="captions"></div><div id="fontwarm">Aa</div>`;
function setupPage() {
  $("#paper").style.backgroundImage = `url(${paperUrl()})`;
  return vfrey.captions("#captions", { style: "box", size: 66, color: INK, highlight: RED, highlightText: WH, font: '"Baloo 2","Arial Black",sans-serif', maxWords: 3 });
}

/* ---------- pages slam in, the old page is shoved out ---------- */
// pages = [{ t: seconds, ids: [panel ids] }, ...]; entry = { panelId: "l"|"r"|"t"|"b" } (the side it comes from). Page 0 is simply there at t = 0.
function slam(pages, entry) {
  const OPP = { l: "r", r: "l", t: "b", b: "t" }, TILT = [-3, 2.4, -2, 3, -2.4, 3.2, -2.8, 2];
  // How far a panel must travel to be fully outside the frame: its own size plus the frame, never a fixed number. A tall panel
  // that leaves downward by 1500 px still has its top inside a 1920 px frame and covers the next page. SAFE covers the tilt, the
  // 13 px border, the hard shadow and the 1.06 camera scale.
  const FRAME_W = 1080, FRAME_H = 1920, SAFE = 160;
  const off = (id, side) => {
    const st = $("#" + id).style, L = parseFloat(st.left) || 0, T = parseFloat(st.top) || 0, W = parseFloat(st.width) || 0, H = parseFloat(st.height) || 0;
    return side === "l" ? [-(L + W + SAFE), 0] : side === "r" ? [FRAME_W - L + SAFE, 0] : side === "t" ? [0, -(T + H + SAFE)] : [0, FRAME_H - T + SAFE];
  };
  pages.forEach((pg, pi) => {
    pg.ids.forEach((id, k) => {
      const el = "#" + id, d = entry[id], v = off(id, d);
      if (pi > 0) {
        tl.set(el, { x: v[0], y: v[1], rotation: TILT[(pi + k) % 8] * 1.6 }, 0);
        tl.to(el, { x: 0, y: 0, rotation: ((pi + k) % 3 - 1) * 0.35, duration: 0.36, ease: "back.out(1.25)" }, pg.t + k * 0.06);
      }
      const next = pages[pi + 1];
      if (next) { const ev = off(id, OPP[d]); tl.to(el, { x: ev[0], y: ev[1], rotation: -TILT[(pi + k) % 8], duration: 0.28, ease: "power3.in" }, next.t + 0.06 + k * 0.04); }
    });
    if (pi > 0) tl.fromTo("#cam", { y: 12, x: -6 }, { y: 0, x: 0, duration: 0.35, ease: "elastic.out(1,.4)" }, pg.t + 0.34);   // camera jolt on arrival
  });
  tl.fromTo("#cam", { scale: 1.06 }, { scale: 1, duration: 0.5, ease: "power3.out" }, 0);
  tl.set("#flash", { opacity: 0 }, 0);
}

/* ---------- pops, flashes, shakes, push-ins ---------- */
const hide = (sel) => tl.set(sel, { opacity: 0 }, 0);                  // call for every popped element, before its pop
const pop = (sel, t, o = {}) => { const [ox, oy] = o.at || [0, 0]; tl.fromTo(sel, { scale: 0, rotation: o.r0 ?? -14, svgOrigin: `${ox} ${oy}`, opacity: 1 }, { scale: 1, rotation: 0, duration: o.d ?? 0.34, ease: "back.out(2.2)" }, t); };
// white flash on impact: set then to. NEVER fromTo on a shared overlay (its FROM state is applied at build and stays lit)
const flash = (t, a = 0.9, d = 0.2) => { tl.set("#flash", { opacity: a }, t); tl.to("#flash", { opacity: 0, duration: d, ease: "power2.out" }, t + 0.001); };
const shake = (sel, t, amp = 14, n = 7, dur = 0.5) => { for (let i = 0; i < n; i++) { const k = 1 - i / n; tl.to(sel, { x: (i % 2 ? 1 : -1) * amp * k, y: (i % 3 - 1) * amp * 0.6 * k, duration: dur / n, ease: "none" }, t + (i * dur) / n); } tl.to(sel, { x: 0, y: 0, duration: 0.05 }, t + dur); };   // sel = "#sk-<panel>"
const push = (id, t0, t1, s0, s1, ox, oy) => tl.fromTo("#in-" + id, { scale: s0, svgOrigin: `${ox} ${oy}` }, { scale: s1, duration: Math.max(0.2, t1 - t0), ease: "sine.inOut" }, t0);

/* ---------- jointed limbs with a smear, and the one ticker ---------- */
// keyframes: [[t, a1, a2, ease?], ...] with ease "in" (cubic), "lin", "snap" (fast out) or default smooth; a1 and a2 are joint angles in degrees
const poseAt = (kf, t) => {
  if (t <= kf[0][0]) return [kf[0][1], kf[0][2]];
  for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) { const a = kf[i - 1], b = kf[i]; let u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]); u = b[3] === "in" ? u * u * u : b[3] === "lin" ? u : b[3] === "snap" ? 1 - Math.pow(1 - u, 4) : sstep(u); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
  const l = kf[kf.length - 1]; return [l[1], l[2]];
};
// A limb is two nested groups: <g id="pU" (rotates about the shoulder)><g id="pF" transform="translate(len 0)"> (rotates about the elbow)</g></g>,
// plus three ghost copies <g id="pG1..3" opacity="0"> holding the same art in pale colours with ids pg1U, pg1F, ... .
// Each frame the ghosts are posed from t - lag, 2 lag, 3 lag and shown in proportion to speed: that is the 2 to 3 frame smear.
function wireLimb(p, kfFn, o = {}) {
  const kf = kfFn().sort((a, b) => a[0] - b[0]), len = o.len ?? 118, lag = o.lag ?? 0.045;
  const U = $("#" + p + "U"), F = $("#" + p + "F");
  const gh = [1, 2, 3].map((k) => ({ box: $("#" + p + "G" + k), U: $("#" + p + "g" + k + "U"), F: $("#" + p + "g" + k + "F") }));
  ambient.push((t) => {
    const [a1, a2] = poseAt(kf, t);
    U.setAttribute("transform", `rotate(${f1(a1)})`); F.setAttribute("transform", `translate(${len} 0) rotate(${f1(a2)})`);
    gh.forEach((g, k) => { const [b1, b2] = poseAt(kf, t - (k + 1) * lag), sp = Math.abs(b1 - a1) + Math.abs(b2 - a2);
      g.U.setAttribute("transform", `rotate(${f1(b1)})`); g.F.setAttribute("transform", `translate(${len} 0) rotate(${f1(b2)})`);
      g.box.setAttribute("opacity", f1(clamp((sp - 14) / 40) * (0.85 - k * 0.2))); });
  });
}
// the ONE ticker: redraws every attribute-driven thing from time, so seeking is deterministic. Call last.
// vfrey.onFrame, not a tween's onUpdate: a render seeks the timeline with events suppressed, so an onUpdate loop would freeze in the film.
function ticker() { const draw = (t) => ambient.forEach((f) => f(t)); vfrey.onFrame(draw); draw(0); }
