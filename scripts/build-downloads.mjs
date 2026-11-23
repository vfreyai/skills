#!/usr/bin/env node
// Builds the downloadable zips of the skills repo (vfreyai/skills) into dist/downloads/. Runs inside the export (README.md, skills/ next to it),
// copied there by scripts/export-skills.mjs, and has no dependencies beyond Node.
//   node scripts/build-downloads.mjs [--skills DIR] [--out DIR]
// One zip per style (vfrey-style-<name>.zip), every style (vfrey-styles-all.zip), the vfrey skill with every style (vfrey-complete.zip) and a few
// themed bundles (vfrey-bundle-<theme>.zip), plus SHA256SUMS.txt. Zips are deterministic (sorted entries, fixed time, fixed permissions), so the
// same files always give the same hashes. A zip holds whole skill folders, so unzipping it into an agent's skills folder just works. Like an
// install, it leaves out a style's poster, preview video and reference frames (they are for the picture gallery, an agent never reads them).
import { createHash } from "node:crypto";
import { crc32, deflateRawSync } from "node:zlib";
import { mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CORE_SKILL = "vfrey";
export const STYLE_PREFIX = "vfrey-style-";
/** Style skills that exist in skills/ but are not published yet. Remove a slug here to export it (the README, zips, GIFs and manifest follow). */
export const UNPUBLISHED_STYLES = ["footage-split", "parallax-25d", "post-comments"];
/** The stable download address of the newest release. GitHub's `latest` skips pre-releases, so the release itself must not be one. */
export const DOWNLOAD_BASE = "https://github.com/vfreyai/skills/releases/latest/download";

/** The themed bundles: every style appears in exactly one. Slugs are the folder name without `vfrey-style-`. */
export const BUNDLES = [
  { theme: "illustrated", title: "Illustrated", blurb: "Drawn, painted and cut-paper looks.", styles: ["flat-2d", "storybook", "paper-cutout", "comic-halftone", "whiteboard-sketch", "one-line", "soft-gradient"] },
  { theme: "3d", title: "3D and worlds", blurb: "Cameras that fly through lit objects, toy worlds and maps.", styles: ["real-3d", "low-poly", "isometric", "map-documentary"] },
  { theme: "data", title: "Data and explainers", blurb: "Charts, screens, drafting sheets and big moving words.", styles: ["data-story", "screen-demo", "blueprint", "terminal", "kinetic-type"] },
  { theme: "retro", title: "Retro and moody", blurb: "Pixels, neon, old newsprint and dark mystery.", styles: ["pixel-art", "neon-synthwave", "vintage-newspaper", "noir"] },
];

const fixedTime = 0; // 00:00:00
const fixedDate = (0 << 9) | (1 << 5) | 1; // 1980-01-01, the earliest a zip can say

/** A zip (deflate, UTF-8 names, mode 0644) of [path, Buffer] pairs, written in sorted order so the bytes never depend on the machine. */
export function makeZip(entries) {
  const sorted = [...entries].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const parts = [];
  const central = [];
  let offset = 0;
  for (const [name, data] of sorted) {
    const nameBuf = Buffer.from(name, "utf8");
    const packed = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(fixedTime, 10);
    local.writeUInt16LE(fixedDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    parts.push(local, nameBuf, packed);
    const head = Buffer.alloc(46);
    head.writeUInt32LE(0x02014b50, 0);
    head.writeUInt16LE((3 << 8) | 20, 4);
    head.writeUInt16LE(20, 6);
    head.writeUInt16LE(0x0800, 8);
    head.writeUInt16LE(8, 10);
    head.writeUInt16LE(fixedTime, 12);
    head.writeUInt16LE(fixedDate, 14);
    head.writeUInt32LE(crc, 16);
    head.writeUInt32LE(packed.length, 20);
    head.writeUInt32LE(data.length, 24);
    head.writeUInt16LE(nameBuf.length, 28);
    head.writeUInt32LE(((0o100644 << 16) >>> 0), 38);
    head.writeUInt32LE(offset, 42);
    central.push(head, nameBuf);
    offset += 30 + nameBuf.length + packed.length;
  }
  const dir = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(sorted.length, 8);
  end.writeUInt16LE(sorted.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, dir, end]);
}

function walk(dir, rel = "") {
  const out = [];
  for (const entry of readdirSync(path.join(dir, rel), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const next = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(dir, next));
    else if (entry.isFile()) out.push(next);
  }
  return out;
}

/** The flat `key: value` lines of a SKILL.md front matter (metadata keys included). */
export function frontMatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const out = {};
  for (const line of (match?.[1] ?? "").split(/\r?\n/)) {
    const kv = /^\s*([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) out[kv[1]] = kv[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  return out;
}

/** Slugs of the style skills in a skills folder, sorted. */
export function styleSlugs(skillsDir) {
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(STYLE_PREFIX))
    .map((e) => e.name.slice(STYLE_PREFIX.length))
    .sort();
}

/** The files of one skill as they go into a zip: `<skill>/<file>`. Throws unless the SKILL.md name equals the folder name. */
export function skillEntries(skillsDir, skill) {
  const dir = path.join(skillsDir, skill);
  const front = frontMatter(readFileSync(path.join(dir, "SKILL.md"), "utf8"));
  if (front.name !== skill) throw new Error(`${skill}/SKILL.md: front matter name is "${front.name}", the folder is ${skill}`);
  const skip = new Set([front["style-poster"], front["style-preview"]].filter(Boolean));
  const isStyle = skill.startsWith(STYLE_PREFIX);
  return walk(dir)
    .filter((rel) => !skip.has(rel) && !(isStyle && /^ref-\d+\.jpg$/.test(rel)))
    .map((rel) => [`${skill}/${rel}`, readFileSync(path.join(dir, rel))]);
}

/** Every download: file name, a plain description, and the skills (folders) inside. */
export function downloadPlan(skillsDir) {
  return planFor(styleSlugs(skillsDir));
}

/** The same plan from a list of style slugs (the README builds it without the folder). */
export function planFor(slugs) {
  const known = new Set(BUNDLES.flatMap((b) => b.styles));
  for (const slug of known) if (!slugs.includes(slug)) throw new Error(`bundle names a style that is not exported: ${slug}`);
  const style = (slug) => `${STYLE_PREFIX}${slug}`;
  return [
    { file: "vfrey-complete.zip", title: "Complete", blurb: `The vfrey skill and all ${slugs.length} styles.`, skills: [CORE_SKILL, ...slugs.map(style)] },
    { file: "vfrey-styles-all.zip", title: "All styles", blurb: `All ${slugs.length} styles, without the vfrey skill.`, skills: slugs.map(style) },
    ...BUNDLES.map((b) => ({ file: `vfrey-bundle-${b.theme}.zip`, title: b.title, blurb: `${b.blurb} ${b.styles.length} styles.`, skills: b.styles.map(style) })),
    ...slugs.map((slug) => ({ file: `${style(slug)}.zip`, title: slug, blurb: `The ${slug} style alone.`, skills: [style(slug)] })),
  ];
}

/** Builds every zip and SHA256SUMS.txt into outDir; returns [{ file, bytes, sha256, skills }]. */
export function buildDownloads(skillsDir, outDir) {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const built = [];
  for (const item of downloadPlan(skillsDir)) {
    const zip = makeZip(item.skills.flatMap((skill) => skillEntries(skillsDir, skill)));
    writeFileSync(path.join(outDir, item.file), zip);
    built.push({ file: item.file, bytes: zip.length, sha256: createHash("sha256").update(zip).digest("hex"), skills: item.skills });
  }
  built.sort((a, b) => (a.file < b.file ? -1 : 1));
  writeFileSync(path.join(outDir, "SHA256SUMS.txt"), built.map((b) => `${b.sha256}  ${b.file}\n`).join(""));
  return built;
}

function main() {
  const args = process.argv.slice(2);
  const flag = (name, fallback) => (args.includes(name) ? path.resolve(args[args.indexOf(name) + 1] ?? "") : fallback);
  const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const skillsDir = flag("--skills", path.join(here, "skills"));
  const outDir = flag("--out", path.join(here, "dist", "downloads"));
  const built = buildDownloads(skillsDir, outDir);
  for (const b of built) console.log(`${b.file}  ${(b.bytes / 1024).toFixed(0)} KB`);
  console.log(`${built.length} zips and SHA256SUMS.txt in ${outDir}`);
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) main();
