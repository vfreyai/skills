# Terminal / ASCII: code to copy

The whole film is one `<canvas>` of monospace cells that a pure `draw(t)` repaints for any time. Paste the page shell, then the blocks below as one `scene.js` (the last line of the shell loads it), plus a `cues.js` next to the page. `tl` is `vfrey.timeline()`.

## Page shell

```html
<!doctype html>
<!-- Terminal / ASCII: the whole film is one text-mode screen. A canvas draws a monospace character grid every frame as a
     pure function of timeline time: typed commands, ASCII-art objects, block-letter numbers, scrambling text, tmux-style panes.
     Box-drawing and block glyphs are drawn as rectangles (like a real terminal emulator does) so frames and bars join cleanly.
     Phosphor glow, scanlines and a slight barrel curve are added when the text layer is composited. -->
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script>
<script src="vfrey/vfrey.js"></script>
<script src="cues.js"></script>
<style>
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
  #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #010302; font-family: "JetBrains Mono", monospace; }
  #crt { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; }
  #scan { position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,.26) 3px, rgba(0,0,0,.26) 4px); }
  #vig { position: absolute; inset: 0; pointer-events: none; border-radius: 5.5% / 3.2%;
         box-shadow: inset 0 0 0 6px #050807, inset 0 0 90px 30px rgba(0,0,0,.72), inset 0 0 260px 60px rgba(0,0,0,.38); }
  #glare { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 70% 38% at 30% 6%, rgba(190,255,215,.055), rgba(190,255,215,0) 70%); }
  #fontwarm { position: absolute; left: -999px; top: 0; font: 500 33px "JetBrains Mono"; opacity: 0; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0">
  <canvas id="crt" width="1080" height="1920"></canvas>
  <div id="scan"></div><div id="glare"></div><div id="vig"></div>
  <span id="fontwarm">$ 0123 abc</span>
</div>
<script src="scene.js"></script>
</body>
</html>
```


## cues.js: the sheet the picture and `make-bed.py` both read

Anchor each cue on a script line or a spoken word (`word: [line, "prefix"]`) plus `off` seconds. `sfx` names the sound; `type` also gives the text and speed the picture types.

```js
// file: cues.js
window.CUES = [
  { "id": "s1cmd",  "line": 0, "off": 0.03, "sfx": "type", "text": "diceware --words 5", "cps": 34 },
  { "id": "s1word", "word": [0, "one"], "off": -0.05, "sfx": "beep" },
  { "id": "s1done", "line": 0, "off": 1.2, "sfx": "ok" },
  { "id": "t12",    "line": 1, "off": -0.5, "sfx": "whoosh" },
  { "id": "s2cmd",  "line": 1, "off": -0.2, "sfx": "type", "text": "echo $((94**8))", "cps": 34 },
  { "id": "s2big",  "line": 1, "off": 0.6, "sfx": "boom" }
];
```


## Grid, palette, easing, cue lookup

```js
const tl = vfrey.timeline();
const TM = vfrey.timing, DUR = TM.durationSec;
// ---------------------------------------------------------------- grid + palette
const W = 1080, H = 1920, COLS = 52, X0 = 20, CW = 20, CH = 40;     // base cell 20x40 px; scale 2 text is 40x80 (66 px type)
const C = { bg: "#020805", k: "#0b5c2c", d: "#149246", g: "#2ee872", h: "#d6ffe4", r: "#ff5038", rd: "#8f2417" };
const MAIN_ROWS = 32;                                                 // rows 0..31 = scene area; 32..37 caption pane; 38..45 system pane
const out = document.getElementById("crt"), octx = out.getContext("2d");
const layer = document.createElement("canvas"); layer.width = W; layer.height = H;
const g = layer.getContext("2d");
const comp = document.createElement("canvas"); comp.width = W; comp.height = H;
const cg = comp.getContext("2d");
const warp = document.createElement("canvas"); warp.width = W; warp.height = H;
const wg = warp.getContext("2d");
// ---------------------------------------------------------------- helpers (all deterministic)
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, p) => a + (b - a) * p;
const eo = (p) => 1 - Math.pow(1 - clamp(p), 3);                      // ease out
const eo5 = (p) => 1 - Math.pow(1 - clamp(p), 5);
const eio = (p) => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const back = (p) => { p = clamp(p); const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const pick = (arr, n) => arr[Math.floor(hash(n) * arr.length) % arr.length];
const NOISE = "#$%&@*+=<>?/\\|[]{}^~0123456789abcdefXYZKQW";
const noiseCh = (n) => NOISE[Math.floor(hash(n) * NOISE.length)];
const commas = (s) => String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// cues: seconds for an id, anchored on the voice timing
const LINES = TM.lines, WORDS = TM.words;
const lineStart = (i) => (LINES[Math.min(i, LINES.length - 1)] || { start: 0 }).start;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function wordStart(li, prefix) {
  const p = norm(prefix), w = WORDS.find((w) => w.line === li && norm(w.text).startsWith(p));
  return w ? w.start : lineStart(li);
}
const CUE = {};
for (const c of window.CUES) CUE[c.id] = Object.assign({}, c, { t: Math.max(0, (c.word ? wordStart(c.word[0], c.word[1]) : lineStart(c.line)) + (c.off || 0)) });
const cue = (id) => CUE[id].t;
```


## Glyphs, text placement, frames, scramble, block-letter numbers

Box-drawing and block characters are drawn as rectangles so lines join with no gaps at any scale; everything else is `fillText`. `put(x, y, str, {s, c, a, inv})` places by cell, `big` draws a 5x7 pixel font with a drop shadow.

```js
// ---------------------------------------------------------------- glyph drawing
const SEG = { "─": "lr", "│": "ud", "┌": "rd", "┐": "ld", "└": "ru", "┘": "lu", "├": "udr", "┤": "udl", "┬": "lrd", "┴": "lru", "┼": "lrud",
              "━": "LR", "┃": "UD", "┏": "RD", "┓": "LD", "┗": "RU", "┛": "LU" };
const EIGHTH = { "▁": 1, "▂": 2, "▃": 3, "▄": 4, "▅": 5, "▆": 6, "▇": 7 };
function glyph(ch, px, py, w, h) {
  const s = SEG[ch];
  if (s) {
    const heavy = s === s.toUpperCase(), th = Math.max(2, Math.round(w * (heavy ? 0.36 : 0.13))), cx = px + w / 2, cy = py + h / 2, d = s.toLowerCase();
    if (d.includes("l")) g.fillRect(px, cy - th / 2, w / 2 + th / 2, th);
    if (d.includes("r")) g.fillRect(cx - th / 2, cy - th / 2, w / 2 + th / 2, th);
    if (d.includes("u")) g.fillRect(cx - th / 2, py, th, h / 2 + th / 2);
    if (d.includes("d")) g.fillRect(cx - th / 2, cy - th / 2, th, h / 2 + th / 2);
    return;
  }
  if (ch === "█") return g.fillRect(px, py, w, h);
  if (ch === "▀") return g.fillRect(px, py, w, h / 2);
  if (ch === "▌") return g.fillRect(px, py, w / 2, h);
  if (ch === "▐") return g.fillRect(px + w / 2, py, w / 2, h);
  if (EIGHTH[ch]) { const e = h * EIGHTH[ch] / 8; return g.fillRect(px, py + h - e, w, e); }
  if (ch === "░" || ch === "▒" || ch === "▓") {                       // dither, 4 x 8 dots per cell
    const dw = w / 4, dh = h / 8;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) {
      const on = ch === "▒" ? (i + j) % 2 === 0 : ch === "░" ? (i % 2 === 0 && j % 2 === 0) : !(i % 2 === 1 && j % 2 === 1);
      if (on) g.fillRect(px + i * dw, py + j * dh, dw * 0.86, dh * 0.86);
    }
    return;
  }
  if (ch === "●") { g.beginPath(); g.ellipse(px + w / 2, py + h / 2, w * 0.42, w * 0.42, 0, 0, 7); g.fill(); return; }
  g.font = "500 " + (w / 0.6).toFixed(2) + 'px "JetBrains Mono", monospace';
  g.fillText(ch, px + w / 2, py + h * 0.755);
}
// put text at base-cell (x, y). o: c colour key, s scale, a alpha, inv inverse video
function put(x, y, str, o = {}) {
  const s = o.s || 1, w = CW * s, h = CH * s, col = C[o.c || "g"] || o.c;
  g.globalAlpha = o.a == null ? 1 : o.a; g.textAlign = "center"; g.textBaseline = "alphabetic";
  const chars = Array.from(String(str));
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i], px = Math.round(X0 + (x + i * s) * CW), py = Math.round(y * CH);
    if (o.bg) { g.fillStyle = C.bg; g.fillRect(px, py, w + 0.5, h); }
    if (o.inv) { g.fillStyle = col; g.fillRect(px, py, w + 0.5, h); if (ch !== " ") { g.fillStyle = C.bg; glyph(ch, px, py, w, h); } }
    else if (ch !== " ") { g.fillStyle = col; glyph(ch, px, py, w, h); }
  }
  g.globalAlpha = 1;
}
const cx = (str, s = 1) => (COLS - Array.from(String(str)).length * s) / 2;
const putC = (y, str, o = {}) => put(cx(str, o.s || 1), y, str, o);
const putR = (xr, y, str, o = {}) => put(xr - Array.from(String(str)).length * (o.s || 1), y, str, o);
function frame(x, y, w, h, o = {}, title) {                           // w, h in cells of scale s
  const s = o.s || 1;
  put(x, y, "┌" + "─".repeat(w - 2) + "┐", o); put(x, y + (h - 1) * s, "└" + "─".repeat(w - 2) + "┘", o);
  for (let j = 1; j < h - 1; j++) { put(x, y + j * s, "│", o); put(x + (w - 1) * s, y + j * s, "│", o); }
  if (title) put(x + 2 * s, y, " " + title + " ", Object.assign({}, o, { c: o.tc || o.c, bg: true }));
}
// scramble -> resolve, left to right. p 0..1
function scram(str, p, t, seed = 0) {
  const chars = Array.from(str), n = chars.length, k = p * (n + 1.5);
  return chars.map((c, i) => (c === " " || i < k - 1.5) ? c : noiseCh(i * 7.3 + seed + Math.floor(t * 18) * 1.7)).join("");
}
const blink = (t, hz = 2.2) => Math.floor(t * hz * 2) % 2 === 0;
function typedCue(id, t) { const c = CUE[id], n = t < c.t ? 0 : clamp(Math.floor((t - c.t) * c.cps) + 1, 0, c.text.length); return { n, txt: c.text.slice(0, n), done: t >= c.t + c.text.length / c.cps }; }

// block-letter ("figlet") numbers: 5x7 pixel font, each pixel one square block with a drop shadow
const PX = {
  "0": "01110,10001,10011,10101,11001,10001,01110", "1": "00100,01100,00100,00100,00100,00100,01110", "2": "01110,10001,00001,00010,00100,01000,11111",
  "3": "11110,00001,00001,01110,00001,00001,11110", "4": "00010,00110,01010,10010,11111,00010,00010", "5": "11111,10000,11110,00001,00001,10001,01110",
  "6": "00110,01000,10000,11110,10001,10001,01110", "7": "11111,00001,00010,00100,01000,01000,01000", "8": "01110,10001,10001,01110,10001,10001,01110",
  "9": "01110,10001,10001,01111,00001,00010,01100", ".": "00,00,00,00,00,11,11", ",": "00,00,00,00,11,01,10",
  "Y": "10001,10001,01010,00100,00100,00100,00100", "E": "11111,10000,10000,11110,10000,10000,11111", "A": "01110,10001,10001,11111,10001,10001,10001",
  "R": "11110,10001,10001,11110,10100,10010,10001", "S": "01111,10000,10000,01110,00001,00001,11110"
};
for (const k in PX) PX[k] = PX[k].split(",");
const bigW = (str, p) => Array.from(str).reduce((a, c) => a + (PX[c][0].length + 1) * p, -p);
// x in px (left), y in base rows. o: p pixel px, c colour, rows 0..7 revealed, a alpha
function big(xpx, y, str, o = {}) {
  const p = o.p || 30, col = C[o.c || "h"], rows = o.rows == null ? 7 : o.rows, y0 = Math.round(y * CH);
  let x = Math.round(xpx);
  for (const ch of Array.from(str)) {
    const gl = PX[ch];
    for (let pass = 0; pass < 2; pass++) for (let j = 0; j < 7; j++) {
      if (j >= rows) break;
      for (let i = 0; i < gl[j].length; i++) if (gl[j][i] === "1") {
        if (pass === 0) { if (o.shadow === false) continue; g.globalAlpha = (o.a == null ? 1 : o.a) * 0.6; g.fillStyle = C[o.sc || "k"]; g.fillRect(x + i * p + p * 0.34, y0 + j * p + p * 0.34, p - 2, p - 2); }
        else { g.globalAlpha = o.a == null ? 1 : o.a; g.fillStyle = col; g.fillRect(x + i * p, y0 + j * p, p - 2, p - 2); }
      }
    }
    x += (gl[0].length + 1) * p;
  }
  g.globalAlpha = 1;
}
const bigC = (y, str, o = {}) => big((W - bigW(str, o.p || 30)) / 2, y, str, o);
```


## Scenes, transitions, caption pane, chrome

A scene is `function(t)` that draws into `g` with `put`/`big`/`frame`. `TR` lists a transition per scene change (`clear`, `scroll`, `split`), each started by a cue about 0.5 s before the line. The caption groups type each word into the `voice` pane at its `start` time. Replace `LOG` and `TABS` with your own.

```js
function demo1(t) {
  const c = typedCue("s1cmd", t);
  put(1, 3, "$ " + c.txt + (c.done ? "" : "█"), { s: 1.5, c: "h" });
  frame(1, 6, 50, 14, { c: "d" }, "words");
  ["maple", "orbit", "candle", "river", "flint"].forEach((w, i) => put(4, 8 + i * 2, scram(w, eo((t - 0.6 - i * 0.2) / 0.5), t, i), { s: 1.2, c: "g" }));
  bigC(22, "73,279", { p: 30, c: "h" });
}
function demo2(t) {
  const c = typedCue("s2cmd", t);
  put(1, 3, "$ " + c.txt, { s: 1.5, c: "h" });
  bigC(10, "6.0E15".replace("E", "."), { p: 30, c: "g" });
}
// ---------------------------------------------------------------- chrome: tabs, caption prompt, system pane, status line
const TABS = ["one", "two"];
const SCENES = [demo1, demo2];
const TR = [null, { id: "t12", kind: "clear" }];
const TRD = 0.42;
function sceneAt(t) { let k = 0; for (let i = 1; i < TR.length; i++) if (t >= cue(TR[i].id)) k = i; return k; }
// caption groups: at most 2 rows of 22 characters, never across a script line
const CAPC = 22, groups = [];
(() => {
  let cur = null;
  const flush = () => { if (cur) groups.push(cur); cur = null; };
  WORDS.forEach((w) => {
    if (cur && cur.line !== w.line) flush();
    if (!cur) cur = { line: w.line, rows: [[]], start: w.start, end: w.end };
    let row = cur.rows[cur.rows.length - 1];
    const len = row.reduce((a, x) => a + x.text.length + 1, 0);
    if (row.length && len + w.text.length > CAPC) {
      if (cur.rows.length === 2) { flush(); cur = { line: w.line, rows: [[]], start: w.start, end: w.end }; }
      else cur.rows.push([]);
      row = cur.rows[cur.rows.length - 1];
    }
    row.push(w); cur.end = w.end;
  });
  flush();
  groups.forEach((gr, i) => { const nx = groups[i + 1]; gr.until = nx ? Math.min(nx.start - 0.04, gr.end + 1.6) : DUR + 1; });
})();
function captions(t) {
  const on = !(TM.captions && TM.captions.mode === "off");
  put(0, 32, "├" + "─".repeat(50) + "┤", { c: "d" });
  for (let j = 0; j < 6; j++) { put(0, 33 + j, "│", { c: "d" }); put(51, 33 + j, "│", { c: "d" }); }
  put(2, 32, " voice ", { c: "g" });
  put(1.6, 33.4, ">", { s: 2, c: "g" });
  if (!on) return;
  const gr = groups.find((x) => t >= x.start - 0.04 && t < x.until);
  if (!gr) { if (blink(t)) put(5, 33.4, "█", { s: 2, c: "g" }); return; }
  let cxp = 5, cyp = 33.4;
  gr.rows.forEach((row, r) => {
    let x = 5; const y = 33.4 + r * 2.2;
    row.forEach((w) => {
      if (t >= w.start - 0.04) {
        const n = clamp(Math.ceil((t - w.start + 0.04) / 0.022), 0, w.text.length), cur = t < w.end + 0.03;
        put(x, y, w.text.slice(0, n), { s: 2, c: "h" });
        if (cur) { g.fillStyle = C.g; g.fillRect(X0 + x * CW, (y + 1.9) * CH, n * 2 * CW, 5); }
        cxp = x + n * 2; cyp = y;
      }
      x += (w.text.length + 1) * 2;
    });
  });
  if (blink(t, 3) && cxp < 49) put(cxp + 0.3, cyp, "█", { s: 2, c: "g" });
}
const LOG = [[0, "tty1: session open"], ["s1cmd", "run: diceware"], ["s2cmd", "calc: 94^8"]].map(([a, m]) => ({ t: typeof a === "number" ? a : cue(a), m })).sort((a, b) => a.t - b.t);
function chrome(t, k) {
  // tab row
  let x = 1;
  TABS.forEach((nm, i) => { const s = " " + (i + 1) + ":" + nm + " "; put(x, 1.1, s, { c: i === k ? "g" : "d", inv: i === k }); x += s.length + 0.6; });
  put(0, 2.05, "─".repeat(52), { c: "k" });
  // system pane: log tail + level meter
  put(0, 38.6, "├" + "─".repeat(50) + "┤", { c: "d" }); put(2, 38.6, " log ", { c: "g" }); put(30, 38.6, "┬", { c: "d" }); put(32, 38.6, " load ", { c: "g" });
  for (let j = 0; j < 6; j++) { put(0, 39.6 + j, "│", { c: "d" }); put(51, 39.6 + j, "│", { c: "d" }); put(30, 39.6 + j, "│", { c: "d" }); }
  const tail = LOG.filter((e) => e.t <= t).slice(-5);
  tail.forEach((e, j) => {
    const last = j === tail.length - 1, n = last ? Math.floor((t - e.t) * 60) : 99;
    put(1.5, 39.8 + j, ("> " + e.m).slice(0, Math.min(n + 2, 28)), { c: last ? "g" : "d", a: last ? 1 : 0.6 + j * 0.1 });
  });
  for (let i = 0; i < 19; i++) {
    const v = 0.5 + 0.5 * Math.sin(t * (2.1 + hash(i) * 3) + i * 1.7) * Math.sin(t * 0.9 + i * 0.5), lv = 1 + Math.floor(clamp(v * 0.6 + 0.4 * hash(i * 9 + Math.floor(t * 6))) * 4.99);
    for (let r = 0; r < lv; r++) put(31.5 + i, 44.4 - r, r === lv - 1 ? "▄" : "█", { c: r === lv - 1 ? "g" : r > 1 ? "d" : "k" });
  }
  // status line (the AI label sits to its right)
  put(0.4, 45.7, " term ", { c: "g", inv: true });
  const mm = String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(Math.floor(t % 60)).padStart(2, "0");
  put(7.4, 45.7, (k + 1) + "/" + SCENES.length + " " + TABS[k], { c: "g" }); put(19, 45.7, mm, { c: "d" });
  put(25.5, 45.7, "█".repeat(Math.round(clamp(t / DUR) * 6)).padEnd(6, "░"), { c: "d" });
}
```


## The frame: scene switching and the CRT finish

One tween drives the setter, so every frame is a pure function of timeline time. The composite adds a faint green glow, the text layer, phosphor bloom (the same layer blurred 7 px and 26 px, added), a slow refresh band and a slight barrel curve; the scanlines, vignette and glare are the CSS in the shell. Keep scanline alpha at or under .26.

```js
function clipRows(y0, y1) { g.beginPath(); g.rect(0, y0 * CH, W, (y1 - y0) * CH); g.clip(); }
function draw(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  const k = sceneAt(t), tr = TR[k], top = 2.4, bot = MAIN_ROWS - 0.05;
  const p = tr ? (t - cue(tr.id)) / TRD : 2;
  if (p >= 1) { g.save(); clipRows(top, bot); SCENES[k](t); g.restore(); }
  else if (tr.kind === "scroll") {
    const e = eio(p), d = (bot - top) * CH;
    g.save(); clipRows(top, bot); g.translate(0, -e * d); SCENES[k - 1](t); g.restore();
    g.save(); clipRows(top, bot); g.translate(0, (1 - e) * d); SCENES[k](t); g.restore();
  } else if (tr.kind === "split") {
    const e = eio(p), mid = 17;
    g.save(); clipRows(top, bot); SCENES[k](t); g.restore();
    g.save(); clipRows(top, mid - e * (mid - top)); g.fillStyle = C.bg; g.globalCompositeOperation = "destination-out"; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "source-over"; g.translate(0, -e * (mid - top) * CH); SCENES[k - 1](t); g.restore();
    g.save(); clipRows(mid + e * (bot - mid), bot); g.globalCompositeOperation = "destination-out"; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "source-over"; g.translate(0, e * (bot - mid) * CH); SCENES[k - 1](t); g.restore();
    g.save(); clipRows(top, bot); put(0, mid - e * (mid - top) - 0.5, "━".repeat(52), { c: "h" }); put(0, mid + e * (bot - mid) - 0.5, "━".repeat(52), { c: "h" }); g.restore();
  } else {                                                             // clear: a bright line redraws the screen top to bottom
    const row = lerp(top, bot + 1, eio(p));
    g.save(); clipRows(row, bot); SCENES[k - 1](t); g.restore();
    g.save(); clipRows(top, row); SCENES[k](t); g.restore();
    g.save(); clipRows(top, bot); put(0, row - 0.5, "█".repeat(52), { c: "h" }); put(0, row - 1.5, "▓".repeat(52), { c: "g", a: 0.7 }); put(0, row - 2.5, "░".repeat(52), { c: "d", a: 0.7 }); g.restore();
  }
  chrome(t, k);
  captions(t);

  // composite: ground, text, phosphor bloom, slow refresh band, then a slight barrel curve
  cg.globalCompositeOperation = "source-over"; cg.filter = "none"; cg.globalAlpha = 1;
  cg.fillStyle = C.bg; cg.fillRect(0, 0, W, H);
  const rg = cg.createRadialGradient(W / 2, H * 0.42, 100, W / 2, H * 0.42, 1250);
  rg.addColorStop(0, "rgba(22,80,44,.30)"); rg.addColorStop(1, "rgba(2,8,5,0)");
  cg.fillStyle = rg; cg.fillRect(0, 0, W, H);
  cg.drawImage(layer, 0, 0);
  cg.globalCompositeOperation = "lighter";
  cg.filter = "blur(7px)"; cg.globalAlpha = 0.62; cg.drawImage(layer, 0, 0);
  cg.filter = "blur(26px)"; cg.globalAlpha = 0.34; cg.drawImage(layer, 0, 0);
  cg.filter = "none"; cg.globalAlpha = 1;
  const by = ((t * 210) % (H + 500)) - 250, bgd = cg.createLinearGradient(0, by - 180, 0, by + 180);
  bgd.addColorStop(0, "rgba(120,255,170,0)"); bgd.addColorStop(0.5, "rgba(120,255,170,.045)"); bgd.addColorStop(1, "rgba(120,255,170,0)");
  cg.fillStyle = bgd; cg.fillRect(0, by - 180, W, 360);
  cg.globalCompositeOperation = "source-over";
  const KB = 0.022, SL = 8;
  wg.fillStyle = "#010302"; wg.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += SL) { const v = (y + SL / 2 - H / 2) / (H / 2), f = 1 - KB * v * v; wg.drawImage(comp, 0, y, W, SL, (W - W * f) / 2, y, W * f, SL); }
  octx.fillStyle = "#010302"; octx.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += SL) { const u = (x + SL / 2 - W / 2) / (W / 2), f = 1 - KB * 0.6 * u * u; octx.drawImage(warp, x, 0, SL, H, x, (H - H * f) / 2, SL, H * f); }
}
// one tween drives every frame: the setter redraws for whatever time the renderer seeks to
let lastT = 0;
const clock = { get t() { return lastT; }, set t(v) { lastT = v; draw(v); } };
tl.to(clock, { t: DUR, duration: DUR, ease: "none" }, 0);
draw(0);
if (document.fonts && document.fonts.load) document.fonts.load('500 33px "JetBrains Mono"').then(() => draw(lastT));
```
