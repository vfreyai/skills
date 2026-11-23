#!/usr/bin/env node
// Measures every word the scene sets with W() and writes scenes/<idea>/meas.js. It is vfrey's own command now:
//
//   npx vfrey styles measure scenes/<idea>
//
// which uses vfrey's fonts, headless Chrome and puppeteer (nothing to install in the project). This file stays for older
// instructions: it finds the project's vfrey and runs that command.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const scene = path.resolve(process.argv[2] || ".");
function vfreyBin() {
  // The project's own vfrey (node_modules/@vfrey/vfrey), from the scene folder up; else the package this file ships in.
  for (let d = scene; ; d = path.dirname(d)) {
    const bin = path.join(d, "node_modules", "@vfrey", "vfrey", "bin", "vfrey.mjs");
    if (fs.existsSync(bin)) return bin;
    if (path.dirname(d) === d) break;
  }
  for (let d = __dirname; ; d = path.dirname(d)) {
    const bin = path.join(d, "bin", "vfrey.mjs");
    if (fs.existsSync(bin) && fs.existsSync(path.join(d, "package.json"))) return bin;
    if (path.dirname(d) === d) break;
  }
  return null;
}
const bin = vfreyBin();
if (!bin) {
  console.error("measure-type: vfrey is not installed here. Fix: run it from your vfrey project: npx vfrey styles measure " + path.relative(process.cwd(), scene));
  process.exit(1);
}
const run = spawnSync(process.execPath, [bin, "styles", "measure", scene], { stdio: "inherit" });
process.exit(run.status === null ? 1 : run.status);
