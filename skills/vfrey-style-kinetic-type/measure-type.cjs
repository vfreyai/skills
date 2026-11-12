#!/usr/bin/env node
// Measures every word the scene sets with W() at font-size 100px and writes scenes/<idea>/meas.js (const MEAS = {"U|WORD": width}).
// The scene loads that table with <script src="meas.js"></script>, so type can be fitted to the frame while the timeline is
// built (fonts load later than the scene script runs, so the scene must never measure at run time).
//
//   node "$(npx vfrey styles path kinetic-type)/measure-type.cjs" scenes/<idea>
//
// It reads <scene>/index.html and collects the strings of every  W(parent, "TEXT", "U" | "I" | "M", ...)  call. Words that
// reach W() from a variable or a list are named in a comment instead:  /* meas U: LET | THE | REST */  (also I and M).
// Needs: puppeteer-core and the headless Chrome vfrey downloads on its first render (both live in the project's
// node_modules), and <scene>/vfrey/fonts/fonts.css, which vfrey writes on the first render or preview of the scene.
// Run it again whenever a string in a W() call changes. Set CHROME_PATH to use another Chrome.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");

const scene = path.resolve(process.argv[2] || ".");
const html = path.join(scene, "index.html");
const fontsCss = path.join(scene, "vfrey", "fonts", "fonts.css");
if (!fs.existsSync(html)) { console.error("measure-type: no index.html in " + scene); process.exit(1); }
if (!fs.existsSync(fontsCss)) { console.error("measure-type: " + fontsCss + " is missing. Render one frame of the scene first (vfrey writes the fonts on the first render)."); process.exit(1); }

// The three styles W() sets. They must match the .stU, .stI and .stM rules in the scene's CSS.
const STYLES = {
  U: 'font-family:"Playfair Display",serif;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;font-variant-numeric:lining-nums',
  I: 'font-family:"Playfair Display",serif;font-weight:900;font-style:italic;letter-spacing:-.025em',
  M: 'font-family:"JetBrains Mono",monospace;font-weight:500;text-transform:uppercase;letter-spacing:.14em',
};

const source = fs.readFileSync(html, "utf8");
const items = new Map();
const add = (st, text) => { if (STYLES[st] && text) items.set(st + "|" + text, [st, text]); };
for (const m of source.matchAll(/\bW\(\s*[^,]+,\s*(["'`])((?:\\.|(?!\1).)*)\1\s*,\s*["']([UIM])["']/g)) add(m[3], m[2].replace(/\\(.)/g, "$1"));
for (const m of source.matchAll(/\/\*\s*meas\s+([UIM])\s*:\s*([\s\S]*?)\*\//g)) m[2].split("|").forEach((t) => add(m[1], t.trim()));
if (!items.size) { console.error("measure-type: found no W() calls in " + html); process.exit(1); }

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 6 || !fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (/^chrome-headless-shell(\.exe)?$/.test(e.name)) found.push(p);
    }
  };
  for (let d = scene; ; d = path.dirname(d)) {
    walk(path.join(d, "node_modules", ".remotion"), 0);
    if (found.length || path.dirname(d) === d) break;
  }
  return found[0];
}

(async () => {
  let puppeteer;
  try { puppeteer = require(require.resolve("puppeteer-core", { paths: [scene, process.cwd()] })); }
  catch { console.error("measure-type: puppeteer-core is not installed in this project's node_modules."); process.exit(1); }
  const exe = findChrome();
  if (!exe) { console.error("measure-type: no headless Chrome found under node_modules/.remotion. Render the scene once, or set CHROME_PATH."); process.exit(1); }
  const page = path.join(os.tmpdir(), "vfrey-measure-type.html");
  fs.writeFileSync(page, `<link rel="stylesheet" href="${pathToFileURL(fontsCss).href}"><body></body>`);
  const browser = await puppeteer.launch({ executablePath: exe, headless: "shell", args: ["--use-mock-keychain", "--password-store=basic", "--allow-file-access-from-files", "--no-sandbox"] });
  try {
    const p = await browser.newPage();
    await p.goto(pathToFileURL(page).href);
    await p.evaluate(async () => { await Promise.all(['900 100px "Playfair Display"', 'italic 900 100px "Playfair Display"', '500 100px "JetBrains Mono"'].map((f) => document.fonts.load(f, "Ag"))); });
    const out = await p.evaluate((list, styles) => {
      const r = {};
      for (const [st, w] of list) {
        const s = document.createElement("span");
        s.style.cssText = "position:absolute;white-space:pre;font-size:100px;line-height:1;" + styles[st];
        s.textContent = w; document.body.appendChild(s);
        r[st + "|" + w] = Math.round(s.getBoundingClientRect().width * 100) / 100; s.remove();
      }
      return r;
    }, [...items.values()], STYLES);
    fs.writeFileSync(path.join(scene, "meas.js"), "const MEAS=" + JSON.stringify(out) + ";\n");
    console.log("measure-type: wrote " + path.join(scene, "meas.js") + " (" + Object.keys(out).length + " strings)");
  } finally { await browser.close(); }
})().catch((e) => { console.error("measure-type: " + e.message); process.exit(1); });
