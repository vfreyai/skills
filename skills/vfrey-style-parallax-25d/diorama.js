/* diorama.js: the 2.5D pixel diorama toolkit for vfrey-style-parallax-25d. Plain WebGL2, no packages, no network.
   A real 3D stage (boxes, gable roofs, planes, cylinders) with pixel-art textures drawn on small canvases, flat pixel sprites that
   stand in it as camera-facing billboards, one low sun with a soft shadow map, cool ambient light, point lamps, light shafts through
   the haze, floating dust, tilt-shift depth of field, bloom, a warm grade and a vignette. A perspective camera only.
   Everything is a pure function of the time you pass to render(): no clock, no state kept from the last frame, seeded randomness.
   Read helpers.md next to the style's SKILL.md for every call. */
(function () {
  "use strict";
  // ---------- small maths ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = (s) => { s = clamp(s); return s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2; };   // in-out cubic, the house curve
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  function mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
  function perspective(fovDeg, aspect, near, far) { const f = 1 / Math.tan((fovDeg * Math.PI) / 360), nf = 1 / (near - far); return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]); }
  function ortho(l, r, b, t, n, f) { return new Float32Array([2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1]); }
  function model(n) { const r = n.rot.map((d) => d * Math.PI / 180), [cx, cy, cz] = r.map(Math.cos), [sx, sy, sz] = r.map(Math.sin), [kx, ky, kz] = n.scale;
    // T * Ry * Rx * Rz * S
    const R = [cy * cz + sy * sx * sz, cx * sz, -sy * cz + cy * sx * sz, -cy * sz + sy * sx * cz, cx * cz, sy * sz + cy * sx * cz, sy * cx, -sx, cy * cx];
    return new Float32Array([R[0] * kx, R[1] * kx, R[2] * kx, 0, R[3] * ky, R[4] * ky, R[5] * ky, 0, R[6] * kz, R[7] * kz, R[8] * kz, 0, n.pos[0], n.pos[1], n.pos[2], 1]); }
  const IDENT = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  function lookAt(eye, at, up) { const z = norm(sub(eye, at)), x = norm(cross(up, z)), y = cross(z, x); return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]); }

  // ---------- colour ----------
  const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const toHex = (c) => "#" + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
  const shade = (h, k) => toHex(hex(h).map((v) => v * k));
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => lerp(v, y[i], t))); };
  const lin = (h, k = 1) => hex(h).map((v) => Math.pow(v / 255, 2.2) * k);   // a hex colour as linear light, times k

  // ---------- pixel canvases: textures and sprites are drawn here, at low resolution, then shown with hard edges ----------
  /** A w x h pixel canvas. draw(p, r) gets a painter: p.rect(x, y, w, h, colour), p.dot(x, y, colour), p.ctx, and a seeded r(). */
  function pix(w, h, draw, seed = 1) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d"); ctx.imageSmoothingEnabled = false;
    const p = { w, h, ctx,
      rect(x, y, ww, hh, col) { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); },
      dot(x, y, col) { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); },
      clear(x = 0, y = 0, ww = w, hh = h) { ctx.clearRect(x, y, ww, hh); } };
    draw(p, rng(seed));
    return c;
  }
  /** A sprite from equal-length strings: "." is transparent, every other letter a key of `map` (a hex colour). */
  function sprite(rows, map) {
    return pix(rows[0].length, rows.length, (p) => { rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const k = row[x]; if (k !== "." && map[k]) p.dot(x, y, map[k]); } }); });
  }
  /** Frames side by side in one strip (the sprite's walk or idle loop). */
  function strip(frames) {
    const w = frames[0].width, h = frames[0].height;
    const c = pix(w * frames.length, h, (p) => frames.forEach((f, i) => p.ctx.drawImage(f, i * w, 0)));
    c.frames = frames.length; return c;
  }

  /** person(look, pose): a 16 x 26 px pixel character, side view, with a 1 px dark outline. Poses: "walk" (4 frames), "carry" (4 frames,
      a tray held over the head), "work" (2 frames, an arm reaching forward, with look.tool in the hand) and "stand" (2 frames, breathing).
      look: { skin, hair, top, trim, bottom, dress, hat, apron, tool } as hex colours. Flip it for walking left (sprite .flip). */
  function person(c, pose = "walk") {
    const n = pose === "work" || pose === "stand" ? 2 : 4;
    return strip([...Array(n).keys()].map((f) => pix(16, 26, (p) => {
      const o = 2, bob = pose === "stand" ? (f ? 1 : 0) : f % 2, sw = pose === "walk" || pose === "carry" ? [2, 0, -2, 0][f] : 0;
      const Y = (y) => y + o - (pose === "stand" ? 0 : bob);
      p.rect(6, Y(3), 5, 5, c.skin); p.rect(5, Y(2), 6, 2, c.hair); p.rect(5, Y(3), 2, 3, c.hair); p.dot(9, Y(5), "#2a1c1c");
      if (c.hat) p.rect(4, Y(1), 8, 2, c.hat);
      p.rect(5, Y(8), 6, 7, c.top); p.rect(5, Y(8), 6, 1, c.trim || c.top); if (c.apron) p.rect(8, Y(10), 3, 9, c.apron);
      const arm = shade(c.top, 0.78);
      if (pose === "carry") { p.rect(6, Y(-1), 2, 9, arm); p.rect(9, Y(-1), 2, 9, arm); p.rect(2, Y(-2), 13, 1, "#7a4a2a"); p.rect(3, Y(-4), 4, 2, "#ecd9b0"); p.rect(8, Y(-4), 4, 2, "#ecd9b0"); }
      else if (pose === "work") { const ay = f ? 11 : 10, ax = f ? 13 : 12; p.rect(8, Y(ay), ax - 8, 2, arm); p.rect(ax, Y(ay), 2, 2, c.skin); if (c.tool) p.rect(ax + 1, Y(ay - 3), 1, 6, c.tool); }
      else { p.rect(7 + Math.round(sw / 2), Y(9), 2, 5, arm); p.rect(7 + Math.round(sw / 2), Y(14), 2, 1, c.skin); }
      if (c.dress) { p.rect(4, Y(15), 8, 22 + o - Y(15), c.bottom); p.rect(4 + (f % 2 ? 2 : 5), 24 + o - 1, 3, 1, "#3a2620"); }
      else { p.rect(6, Y(15), 4, 2, c.bottom); p.rect(6 + sw, Y(17), 2, 23 + o - 1 - Y(17), c.bottom); p.rect(8 - sw, Y(17), 2, 23 + o - 1 - Y(17), shade(c.bottom, 0.8)); p.rect(6 + sw, 22 + o + 1, 3, 1, "#3a2620"); p.rect(8 - sw, 22 + o + 1, 3, 1, "#2a1c18"); }
      outline(p, c.outline || "#281a26");
    })));
  }
  /** outline(p, colour): a 1 px dark outline around everything drawn on a pixel canvas (call it last in the draw function). */
  function outline(p, col) {
    const w = p.w, h = p.h, [r, g, b] = hex(col), img = p.ctx.getImageData(0, 0, w, h), d = img.data, out = new Uint8ClampedArray(d);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3]) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X >= 0 && Y >= 0 && X < w && Y < h && d[(Y * w + X) * 4 + 3]; })) { out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255; } }
    p.ctx.putImageData(new ImageData(out, w, h), 0, 0);
  }

  // ---------- stock pixel textures: every one is drawn here from the palette you pass, never loaded ----------
  const TEX = {
    /** Cobbles: rounded stones in offset rows, a dark joint, a lit top-left edge on each stone. */
    cobbles(pal, seed = 3, size = 32) {
      return pix(size, size, (p, r) => {
        p.rect(0, 0, size, size, pal.joint);
        for (let row = 0; row < size / 4; row++) {
          let x = row % 2 ? -2 : 0;
          while (x < size) { const w = 3 + Math.floor(r() * 3), tone = [pal.a, pal.b, pal.c][Math.floor(r() * 3)], lit = mix(tone, "#ffffff", 0.2), dk = shade(tone, 0.78);
            for (const ox of [0, size, -size]) { const X = x + ox + 1, Y = row * 4 + 1; p.rect(X, Y, w - 1, 3, tone); p.rect(X + 1, Y, w - 3, 1, lit); p.dot(X, Y + 1, lit); p.rect(X + 1, Y + 2, w - 2, 1, dk);
              p.dot(X, Y, pal.joint); p.dot(X + w - 2, Y, pal.joint); p.dot(X, Y + 2, pal.joint); p.dot(X + w - 2, Y + 2, pal.joint); }
            x += w; }
        }
      }, seed);
    },
    /** Packed earth or dirt with specks and small stones. */
    dirt(pal, seed = 4, size = 32) {
      return pix(size, size, (p, r) => { p.rect(0, 0, size, size, pal.a); for (let i = 0; i < size * 6; i++) p.dot(r() * size, r() * size, r() < 0.5 ? pal.b : pal.c); for (let i = 0; i < 6; i++) { const x = r() * size, y = r() * size; p.rect(x, y, 2, 1, pal.c); p.dot(x, y - 1, mix(pal.c, "#ffffff", 0.25)); } }, seed);
    },
    /** Grass: two greens and tufts of a third. */
    grass(pal, seed = 5, size = 32) {
      return pix(size, size, (p, r) => { p.rect(0, 0, size, size, pal.a); for (let i = 0; i < size * 7; i++) p.dot(r() * size, r() * size, pal.b); for (let i = 0; i < 18; i++) { const x = r() * size, y = r() * size; p.dot(x, y, pal.c); p.dot(x + 1, y - 1, pal.c); p.dot(x - 1, y - 1, pal.c); } }, seed);
    },
    /** Plaster or stucco on a storey-high tile: a speckled wash, a few cracks, a darker damp band at the foot. */
    plaster(pal, seed = 6, w = 32, h = 48) {
      return pix(w, h, (p, r) => { p.rect(0, 0, w, h, pal.a); for (let i = 0; i < w * h * 0.12; i++) p.dot(r() * w, r() * h, r() < 0.6 ? pal.b : mix(pal.a, "#ffffff", 0.12)); p.rect(0, h - 5, w, 5, pal.b); for (let i = 0; i < 2; i++) { let x = r() * w, y = r() * h * 0.7; for (let k = 0; k < 5; k++) { p.dot(x, y, pal.c); x += r() < 0.5 ? 1 : 0; y += 1; } } }, seed);
    },
    /** Half-timbered wall: plaster panels framed by dark beams with a diagonal brace, one storey a tile. */
    timber(pal, seed = 7, w = 32, h = 48) {
      return pix(w, h, (p, r) => { p.rect(0, 0, w, h, pal.a); for (let i = 0; i < w * h * 0.08; i++) p.dot(r() * w, r() * h, pal.b);
        const beam = pal.beam, lit = mix(beam, "#ffffff", 0.15);
        p.rect(0, 0, w, 3, beam); p.rect(0, h - 3, w, 3, beam); p.rect(0, 0, 3, h, beam); p.rect(w / 2 - 1, 0, 3, h, beam); p.rect(0, 0, w, 1, lit);
        for (let k = 0; k < w / 2 - 2; k++) { p.rect(3 + k, 3 + k * ((h - 6) / (w / 2 - 2)), 2, 3, beam); } }, seed);
    },
    /** Dressed stone blocks in courses, each block a little different, lit on its top edge. */
    stone(pal, seed = 8, w = 32, h = 32) {
      return pix(w, h, (p, r) => { p.rect(0, 0, w, h, pal.joint); for (let row = 0; row < h / 8; row++) { let x = row % 2 ? -5 : 0; while (x < w) { const bw = 8 + Math.floor(r() * 6), tone = [pal.a, pal.b, pal.c][Math.floor(r() * 3)];
        for (const ox of [0, w, -w]) { p.rect(x + ox + 1, row * 8 + 1, bw - 1, 7, tone); p.rect(x + ox + 1, row * 8 + 1, bw - 1, 1, mix(tone, "#ffffff", 0.16)); for (let i = 0; i < 4; i++) p.dot(x + ox + 1 + r() * (bw - 2), row * 8 + 2 + r() * 5, shade(tone, 0.85)); }
        x += bw; } } }, seed);
    },
    /** Roof tiles in rows (terracotta coppi or slate): a lit ridge on each row, a dark gap under it. Repeats along the slope. */
    tiles(pal, seed = 9, w = 32, h = 16) {
      return pix(w, h, (p, r) => { for (let row = 0; row < h / 4; row++) { p.rect(0, row * 4, w, 4, pal.a); p.rect(0, row * 4 + 3, w, 1, pal.c); for (let x = (row % 2) * 2; x < w; x += 4) { p.rect(x, row * 4, 1, 3, pal.b); p.dot(x + 2, row * 4, mix(pal.a, "#ffffff", 0.2)); if (r() < 0.2) p.rect(x + 1, row * 4 + 1, 2, 2, pal.b); } } }, seed);
    },
    /** Wood planks, vertical or horizontal grain. */
    planks(pal, seed = 10, w = 16, h = 32) {
      return pix(w, h, (p, r) => { p.rect(0, 0, w, h, pal.a); for (let x = 0; x < w; x += 4) { p.rect(x, 0, 1, h, pal.c); for (let i = 0; i < 4; i++) p.rect(x + 1 + Math.floor(r() * 3), r() * h, 1, 3, pal.b); } }, seed);
    },
    /** Water with small light ripples; animate it with mat.scroll. */
    water(pal, seed = 11, size = 32) {
      return pix(size, size, (p, r) => { p.rect(0, 0, size, size, pal.a); for (let i = 0; i < 26; i++) { const x = r() * size, y = r() * size; p.rect(x, y, 3, 1, pal.b); if (r() < 0.4) p.rect(x + 1, y, 1, 1, pal.c); } }, seed);
    },
    /** One flat colour with a little pixel noise (a sill, a beam end, a market awning). */
    flat(col, seed = 12, size = 8, noise = 0.08) {
      return pix(size, size, (p, r) => { p.rect(0, 0, size, size, col); for (let i = 0; i < size * size * 0.3; i++) p.dot(r() * size, r() * size, shade(col, 1 - noise + r() * noise * 2)); }, seed);
    },
  };

  // ---------- GL plumbing ----------
  function compile(gl, vs, fs) {
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, "#version 300 es\nprecision highp float;\nprecision highp int;\nprecision highp sampler2DShadow;\n" + src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error("shader: " + gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("program: " + gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i), name = info.name.replace(/\[0\]$/, ""); u[name] = gl.getUniformLocation(p, info.name); }
    return { p, u };
  }
  function target(gl, w, h, { depth = false, msaa = 0, linear = true } = {}) {
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    const t = { fb, w, h };
    if (msaa) {
      t.rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, t.rb); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, msaa, gl.RGBA8, w, h); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, t.rb);
      const d = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, d); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, msaa, gl.DEPTH_COMPONENT24, w, h); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, d);
    } else if (depth === "shadow") {
      t.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t.tex); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, t.tex, 0);
    } else {
      t.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t.tex); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, w, h);
      const f = linear ? gl.LINEAR : gl.NEAREST; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
    }
    return t;
  }

  // ---------- shaders ----------
  const LIGHTS = 8;
  const COMMON = `
uniform mat4 uVP; uniform mat4 uLVP; uniform vec3 uEye;
uniform sampler2DShadow uShadow; uniform float uShadowTexel;
uniform vec3 uSunDir; uniform vec3 uSun; uniform vec3 uSky; uniform vec3 uGround;
uniform vec3 uHaze; uniform float uFog; uniform float uFogStart; uniform float uShafts;
uniform vec4 uPL[${LIGHTS}]; uniform vec4 uPC[${LIGHTS}];
uniform vec3 uFocus; // focus distance, sharp half-range, blur ramp
uniform float uTime;
const vec2 POI[12] = vec2[](vec2(-.326,-.406),vec2(-.840,-.074),vec2(-.696,.457),vec2(-.203,.621),vec2(.962,-.195),vec2(.473,-.480),vec2(.519,.767),vec2(.185,-.893),vec2(.507,.064),vec2(.896,.412),vec2(-.322,-.933),vec2(-.792,-.598));
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float shadowAt(vec3 wp, float soft){
  vec4 l = uLVP * vec4(wp, 1.0); vec3 s = l.xyz / l.w * 0.5 + 0.5;
  if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0 || s.z > 1.0) return 1.0;
  float a = ign(gl_FragCoord.xy) * 6.2831; mat2 R = mat2(cos(a), sin(a), -sin(a), cos(a)); float sum = 0.0;
  for (int i = 0; i < 12; i++) sum += texture(uShadow, vec3(s.xy + R * POI[i] * uShadowTexel * soft, s.z - 0.0012));
  return sum / 12.0;
}
float shadowHard(vec3 wp){ vec4 l = uLVP * vec4(wp, 1.0); vec3 s = l.xyz / l.w * 0.5 + 0.5; if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0 || s.z > 1.0) return 1.0; return texture(uShadow, vec3(s.xy, s.z - 0.002)); }
vec3 points(vec3 wp, vec3 n){ vec3 c = vec3(0.0); for (int i = 0; i < ${LIGHTS}; i++){ vec3 d = uPL[i].xyz - wp; float r = uPL[i].w; if (r <= 0.0) continue; float dist = length(d); float att = pow(clamp(1.0 - dist / r, 0.0, 1.0), 2.0); c += uPC[i].rgb * att * (0.35 + 0.65 * max(dot(n, d / max(dist, 1e-3)), 0.0)); } return c; }
vec4 finish(vec3 lit, vec3 wp){
  float dist = length(wp - uEye);
  // light shafts: march from the eye to the point through the shadow map; lit haze adds sun colour
  float shaft = 0.0; if (uShafts > 0.0) { float j = ign(gl_FragCoord.xy + 7.0); for (int i = 0; i < 16; i++) { vec3 p = mix(uEye, wp, (float(i) + j) / 16.0); shaft += shadowHard(p); } shaft /= 16.0; }
  float fog = 1.0 - exp(-max(dist - uFogStart, 0.0) * uFog);
  vec3 c = mix(lit, uHaze, fog) + uSun * uShafts * shaft * (1.0 - exp(-dist * 0.02));
  float d = dist - uFocus.x; float coc = clamp((abs(d) - uFocus.y) / uFocus.z, 0.0, 1.0);
  return vec4(pow(max(c, 0.0), vec3(1.0 / 2.2)), 0.5 + 0.5 * sign(d) * coc);   // alpha carries the signed blur amount
}`;
  const MESH_VS = `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNrm; layout(location=2) in vec2 aUv; layout(location=3) in float aAo;
uniform mat4 uVP; uniform mat4 uModel; uniform vec2 uScroll; uniform float uTime;
out vec3 vPos; out vec3 vNrm; out vec2 vUv; out float vAo;
void main(){ vec4 wp = uModel * vec4(aPos, 1.0); vPos = wp.xyz; vNrm = mat3(uModel) * aNrm; vUv = aUv + uScroll * uTime; vAo = aAo; gl_Position = uVP * wp; }`;
  const MESH_FS = COMMON + `
in vec3 vPos; in vec3 vNrm; in vec2 vUv; in float vAo;
uniform sampler2D uTex; uniform vec3 uTint; uniform float uEmit;
out vec4 o;
void main(){
  vec4 tx = texture(uTex, vUv); if (tx.a < 0.5) discard;
  vec3 alb = pow(tx.rgb, vec3(2.2)) * uTint; vec3 n = normalize(vNrm);
  float ndl = max(dot(n, uSunDir), 0.0); float sh = ndl > 0.0 ? shadowAt(vPos + n * 0.03, 2.2) : 0.0;
  vec3 amb = mix(uGround, uSky, n.y * 0.5 + 0.5) * vAo;
  vec3 lit = alb * (amb + uSun * ndl * sh + points(vPos, n)) + alb * uEmit;
  o = finish(lit, vPos);
}`;
  const SHADOW_VS = `
layout(location=0) in vec3 aPos; layout(location=2) in vec2 aUv; uniform mat4 uLVP; uniform mat4 uModel; out vec2 vUv;
void main(){ vUv = aUv; gl_Position = uLVP * uModel * vec4(aPos, 1.0); }`;
  const SHADOW_FS = `in vec2 vUv; uniform sampler2D uTex; out vec4 o; void main(){ if (texture(uTex, vUv).a < 0.5) discard; o = vec4(1.0); }`;
  // A billboard: a unit quad stood up at uBase, facing uFace (the camera, or the sun in the shadow pass), uSize = width and height.
  const BB_VS = `
layout(location=0) in vec2 aQ; uniform mat4 uVP; uniform mat4 uLVP; uniform vec3 uBase; uniform vec2 uSize; uniform vec3 uRight; uniform int uShadowPass;
uniform vec4 uFrame; out vec2 vUv; out vec3 vPos;
void main(){ vec3 p = uBase + uRight * (aQ.x - 0.5) * uSize.x + vec3(0.0, aQ.y * uSize.y, 0.0); vPos = p;
  vUv = vec2(uFrame.x + aQ.x * uFrame.z, uFrame.y + (1.0 - aQ.y) * uFrame.w);
  gl_Position = (uShadowPass == 1 ? uLVP : uVP) * vec4(p, 1.0); }`;
  const BB_FS = COMMON + `
in vec2 vUv; in vec3 vPos; uniform sampler2D uTex; uniform vec3 uTint; uniform float uEmit; uniform int uShadowPass; uniform vec3 uFaceN;
out vec4 o;
void main(){ vec4 tx = texture(uTex, vUv); if (tx.a < 0.5) discard; if (uShadowPass == 1) { o = vec4(1.0); return; }
  vec3 alb = pow(tx.rgb, vec3(2.2)) * uTint; float sh = shadowAt(vPos + vec3(0.0, 0.05, 0.0) + uSunDir * 0.12, 1.6);
  float wrap = 0.55 + 0.45 * max(dot(uFaceN, uSunDir), 0.0);
  vec3 lit = alb * (mix(uGround, uSky, 0.7) + uSun * sh * wrap * 0.9 + points(vPos, uFaceN)) + alb * uEmit;
  o = finish(lit, vPos); }`;
  const SKY_VS = `layout(location=0) in vec2 aQ; out vec2 vUv; void main(){ vUv = aQ; gl_Position = vec4(aQ * 2.0 - 1.0, 0.9999, 1.0); }`;
  const SKY_FS = `in vec2 vUv; uniform vec3 uTop; uniform vec3 uBot; out vec4 o; void main(){ o = vec4(mix(uBot, uTop, smoothstep(0.0, 1.0, vUv.y)), 1.0); }`;
  // Soft round blobs: contact shadows (multiplied) and glows (added). Flat on the ground, or standing as a billboard.
  const BLOB_FS = `in vec2 vUv; in vec3 vPos; uniform vec4 uCol; uniform int uMode; out vec4 o;
void main(){ float r = length(vUv * 2.0 - 1.0); float a = pow(clamp(1.0 - r, 0.0, 1.0), 1.6) * uCol.a; if (uMode == 0) o = vec4(mix(vec3(1.0), uCol.rgb, a), 1.0); else o = vec4(uCol.rgb * a, 1.0); }`;
  const BLOB_VS = `layout(location=0) in vec2 aQ; uniform mat4 uVP; uniform vec3 uBase; uniform vec3 uU; uniform vec3 uV; out vec2 vUv; out vec3 vPos;
void main(){ vUv = aQ; vec3 p = uBase + uU * (aQ.x * 2.0 - 1.0) + uV * (aQ.y * 2.0 - 1.0); vPos = p; gl_Position = uVP * vec4(p, 1.0); }`;
  // Dust and pollen: points that drift with time, grow into soft discs where they are out of focus.
  const DUST_VS = `layout(location=0) in vec4 aSeed; uniform mat4 uVP; uniform vec3 uEye; uniform vec3 uMin; uniform vec3 uMax; uniform float uTime; uniform vec3 uFocus; uniform float uPx;
out float vA;
void main(){ vec3 span = uMax - uMin; vec3 p = aSeed.xyz * span + uMin;
  p += vec3(sin(uTime * 0.31 + aSeed.w * 40.0) * 0.6, uTime * 0.12 * (0.4 + aSeed.w), cos(uTime * 0.23 + aSeed.w * 17.0) * 0.6);
  p = uMin + mod(p - uMin, span);
  float d = length(p - uEye); float coc = clamp((abs(d - uFocus.x) - uFocus.y) / uFocus.z, 0.0, 1.0);
  vA = (0.55 + 0.45 * sin(uTime * 1.7 + aSeed.w * 30.0)) / (1.0 + coc * 5.0);
  gl_PointSize = (uPx / d) * (1.0 + coc * 7.0); gl_Position = uVP * vec4(p, 1.0); }`;
  const DUST_FS = `in float vA; uniform vec3 uCol; out vec4 o; void main(){ float r = length(gl_PointCoord * 2.0 - 1.0); float a = smoothstep(1.0, 0.55, r) * vA; o = vec4(uCol * a, 0.0); }`;
  // Post: full-screen passes.
  const FS_VS = `layout(location=0) in vec2 aQ; out vec2 vUv; void main(){ vUv = aQ; gl_Position = vec4(aQ * 2.0 - 1.0, 0.0, 1.0); }`;
  const BLUR_FS = `in vec2 vUv; uniform sampler2D uSrc; uniform vec2 uDir; out vec4 o;
const float W[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
void main(){ vec4 c = texture(uSrc, vUv) * W[0]; for (int i = 1; i < 5; i++) { c += texture(uSrc, vUv + uDir * float(i)) * W[i]; c += texture(uSrc, vUv - uDir * float(i)) * W[i]; } o = c; }`;
  const BRIGHT_FS = `in vec2 vUv; uniform sampler2D uSrc; uniform float uThr; out vec4 o; void main(){ vec3 c = texture(uSrc, vUv).rgb; float l = max(c.r, max(c.g, c.b)); o = vec4(c * smoothstep(uThr, 1.0, l), 1.0); }`;
  const COMP_FS = `in vec2 vUv; uniform sampler2D uSharp; uniform sampler2D uB1; uniform sampler2D uB2; uniform sampler2D uBloom;
uniform float uBloomK; uniform float uVig; uniform vec3 uCool; uniform vec3 uWarm; uniform float uSat; uniform float uExpo; uniform float uDim; uniform float uBlurAll; out vec4 o;
void main(){ vec4 s = texture(uSharp, vUv), b1 = texture(uB1, vUv), b2 = texture(uB2, vUv);
  float c = abs(s.a - 0.5) * 2.0; float nearBleed = clamp((0.5 - b2.a) * 2.0, 0.0, 1.0); c = max(max(c, nearBleed), uBlurAll);
  vec3 col = mix(s.rgb, b1.rgb, smoothstep(0.0, 0.4, c)); col = mix(col, b2.rgb, smoothstep(0.4, 1.0, c));
  col += texture(uBloom, vUv).rgb * uBloomK;
  col *= uExpo; float l = dot(col, vec3(0.299, 0.587, 0.114));
  col += uCool * (1.0 - smoothstep(0.0, 0.55, l)) + uWarm * smoothstep(0.45, 1.0, l);   // split tone: cool shadows, warm light
  col = mix(vec3(l), col, uSat);
  vec2 q = vUv - 0.5; q.x *= 0.75; col *= 1.0 - uVig * smoothstep(0.25, 0.75, length(q));
  o = vec4(clamp(col * (1.0 - uDim), 0.0, 1.0), 1.0); }`;

  // ---------- the toolkit ----------
  /** create({ canvas, width, height }): one renderer for the whole film. Holds any number of worlds (places). */
  function create(opts) {
    const canvas = typeof opts.canvas === "string" ? document.querySelector(opts.canvas) : opts.canvas;
    const W = opts.width, H = opts.height; canvas.width = W; canvas.height = H;
    const gl = canvas.getContext("webgl2", { antialias: false, preserveDrawingBuffer: true, alpha: false, powerPreference: "high-performance" });
    if (!gl) throw new Error("WebGL2 is not available in this browser, so the diorama cannot draw. This style needs a machine with a graphics chip.");
    const P = { mesh: compile(gl, MESH_VS, MESH_FS), shadow: compile(gl, SHADOW_VS, SHADOW_FS), bb: compile(gl, BB_VS, BB_FS), sky: compile(gl, SKY_VS, SKY_FS), blob: compile(gl, BLOB_VS, BLOB_FS), dust: compile(gl, DUST_VS, DUST_FS), blur: compile(gl, FS_VS, BLUR_FS), bright: compile(gl, FS_VS, BRIGHT_FS), comp: compile(gl, FS_VS, COMP_FS) };
    const quad = gl.createVertexArray(); gl.bindVertexArray(quad);
    const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null);
    const SHADOW = opts.shadowSize || 4096;
    const T = { shadow: target(gl, SHADOW, SHADOW, { depth: "shadow" }), msaa: target(gl, W, H, { msaa: 4 }), sharp: target(gl, W, H, { linear: false }),
      h1: target(gl, W >> 1, H >> 1), h2: target(gl, W >> 1, H >> 1), q1: target(gl, W >> 2, H >> 2), q2: target(gl, W >> 2, H >> 2), e1: target(gl, W >> 3, H >> 3), e2: target(gl, W >> 3, H >> 3) };
    const texCache = new Map();
    function glTex(img, { mips = true } = {}) {
      if (texCache.has(img)) return texCache.get(img);
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);   // hard pixel edges, always
      if (mips) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); }
      else { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); }
      texCache.set(img, t); return t;
    }

    /** mat(canvas, { density, tint, emit, scroll }): a surface. density = texels per metre (16 is the house scale). */
    function mat(img, o = {}) { return { img, tex: glTex(img), density: o.density || 16, tint: o.tint ? lin(o.tint) : [1, 1, 1], emit: o.emit || 0, scroll: o.scroll || [0, 0] }; }

    /** world(settings): one place (a square, a workshop, a tower at dusk) with its own light. */
    function world(s = {}) {
      const w = { mats: [], sprites: [], blobs: [], glows: [], lights: [], dust: [], built: false,
        sun: s.sun || { azimuth: 235, elevation: 24, color: "#ffd2a0", power: 3.2 },
        ambSky: s.sky || "#6f7fb8", ambGround: s.ground || "#4a3e52", ambient: s.ambient ?? 0.55,
        haze: s.haze || "#e8c9a6", fog: s.fog ?? 0.018, fogStart: s.fogStart ?? 18, shafts: s.shafts ?? 0.08,
        skyTop: s.skyTop || "#8fb0d8", skyBottom: s.skyBottom || "#f2d2a8",
        bounds: s.bounds || [-24, -24, 24, 24, 0, 16], grade: Object.assign({ bloom: 0.55, threshold: 0.72, vignette: 0.42, cool: "#0c1030", warm: "#2a1606", sat: 1.08, exposure: 1.0 }, s.grade || {}) };
      let into = w.mats;   // where faces go: the world's static batches, or a node's own while node() builds it
      const add = (m, v) => { let b = into.find((x) => x.m === m); if (!b) { b = { m, verts: [] }; into.push(b); } b.verts.push(...v); };   // one batch per material
      w.nodes = [];
      /** node(build): geometry that moves (a swinging bell, a door, loaves that appear, a growing patch). build(w) adds faces
          around the origin; set node.pos, node.rot (degrees, [x, y, z]), node.scale and node.visible every frame. Still real 3D,
          lit and shadowed like the rest. node(build, { castOnly: true }) only casts shadow: a roof or ceiling over a cut-away room that
          the camera looks through, so the room keeps its shade. */
      w.node = (build, o = {}) => { const n = { mats: [], pos: [0, 0, 0], rot: [0, 0, 0], scale: [1, 1, 1], visible: true, castOnly: !!o.castOnly }; const prev = into; into = n.mats; try { build(w); } finally { into = prev; } w.nodes.push(n); return n; };
      // A quad from four corners (counter-clockwise seen from the front), uv from world size along its two edges.
      function face(m, p0, p1, p2, p3, ao = [1, 1, 1, 1], uOff = 0, vOff = 0) {
        const P4n = [p0, p1, p2, p3], nn = [0, 0, 0]; for (let i = 0; i < 4; i++) { const a = P4n[i], b = P4n[(i + 1) % 4]; nn[0] += (a[1] - b[1]) * (a[2] + b[2]); nn[1] += (a[2] - b[2]) * (a[0] + b[0]); nn[2] += (a[0] - b[0]) * (a[1] + b[1]); }
        const n = norm(nn), k = m.density;   // Newell's normal: right for triangles and poles too
        const uw = Math.hypot(...sub(p1, p0)) * k / m.img.width, vh = Math.hypot(...sub(p3, p0)) * k / m.img.height, u0 = uOff * k / m.img.width, v0 = vOff * k / m.img.height;
        const P4 = [p0, p1, p2, p3], UV = [[u0, v0 + vh], [u0 + uw, v0 + vh], [u0 + uw, v0], [u0, v0]];
        for (const i of [0, 1, 2, 0, 2, 3]) add(m, [...P4[i], ...n, ...UV[i], ao[i]]);
      }
      // uv along x for walls facing z and along z for walls facing x, v measured up from the ground: storeys and doors line up.
      w.face = face;
      /** box(x, y, z, sx, sy, sz, mat | { side, top, bottom, front }): x and z are the centre, y the base. */
      w.box = (x, y, z, sx, sy, sz, m, o = {}) => {
        const M = m.img ? { side: m, top: m } : m, side = M.side, top = M.top || side, front = M.front || side;
        const x0 = x - sx / 2, x1 = x + sx / 2, z0 = z - sz / 2, z1 = z + sz / 2, y0 = y, y1 = y + sy;
        const aoB = o.ao ?? (y < 0.05 ? 0.55 : 0.8), A = [aoB, aoB, 1, 1];
        face(front, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], A, x0, -y1);   // +z (front, toward the default camera)
        face(side, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], A, -x1, -y1);   // -z
        face(side, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], A, -z1, -y1);   // +x
        face(side, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], A, z0, -y1);   // -x
        if (!o.noTop) face(top, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [1, 1, 1, 1], x0, -z1);
        if (y > 0.05 && !o.noBottom) face(M.bottom || side, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0.6, 0.6, 0.6, 0.6]);
        if (y < 0.05 && !o.noContact) w.contact(x, z, sx * 0.62 + 0.35, sz * 0.62 + 0.35, o.contact ?? 0.35);
      };
      /** gable(x, y, z, sx, h, sz, roofMat, wallMat, { along: "x" | "z", over }): a pitched roof on a box top at height y. */
      w.gable = (x, y, z, sx, h, sz, roof, wall, o = {}) => {
        const ov = o.over ?? 0.35, alongX = (o.along || "x") === "x";
        if (alongX) {
          const x0 = x - sx / 2 - ov, x1 = x + sx / 2 + ov, z0 = z - sz / 2 - ov, z1 = z + sz / 2 + ov, yr = y + h, yo = y - ov * (h / (sz / 2));
          face(roof, [x0, yo, z1], [x1, yo, z1], [x1, yr, z], [x0, yr, z]); face(roof, [x1, yo, z0], [x0, yo, z0], [x0, yr, z], [x1, yr, z]);
          face(roof, [x0, yo + 0.12, z1], [x0, yo + 0.12, z0], [x0, yo, z0], [x0, yo, z1]);
          const gx0 = x - sx / 2, gx1 = x + sx / 2, gz0 = z - sz / 2, gz1 = z + sz / 2;
          face(wall, [gx1, y, gz1], [gx1, y, gz0], [gx1, yr, z], [gx1, yr, z], [1, 1, 1, 1], -gz1, -yr); face(wall, [gx0, y, gz0], [gx0, y, gz1], [gx0, yr, z], [gx0, yr, z], [1, 1, 1, 1], gz0, -yr);
        } else {
          const z0 = z - sz / 2 - ov, z1 = z + sz / 2 + ov, x0 = x - sx / 2 - ov, x1 = x + sx / 2 + ov, yr = y + h, yo = y - ov * (h / (sx / 2));
          face(roof, [x1, yo, z1], [x1, yo, z0], [x, yr, z0], [x, yr, z1]); face(roof, [x0, yo, z0], [x0, yo, z1], [x, yr, z1], [x, yr, z0]);
          const gx0 = x - sx / 2, gx1 = x + sx / 2, gz0 = z - sz / 2, gz1 = z + sz / 2;
          face(wall, [gx0, y, gz1], [gx1, y, gz1], [x, yr, gz1], [x, yr, gz1], [1, 1, 1, 1], gx0, -yr); face(wall, [gx1, y, gz0], [gx0, y, gz0], [x, yr, gz0], [x, yr, gz0], [1, 1, 1, 1], -gx1, -yr);
        }
      };
      /** hip(x, y, z, sx, h, sz, roofMat): a four-sided roof (towers, a pavilion). */
      w.hip = (x, y, z, sx, h, sz, roof, o = {}) => {
        const ov = o.over ?? 0.3, x0 = x - sx / 2 - ov, x1 = x + sx / 2 + ov, z0 = z - sz / 2 - ov, z1 = z + sz / 2 + ov, a = [x, y + h, z];
        face(roof, [x0, y, z1], [x1, y, z1], a, a); face(roof, [x1, y, z1], [x1, y, z0], a, a); face(roof, [x1, y, z0], [x0, y, z0], a, a); face(roof, [x0, y, z0], [x0, y, z1], a, a);
      };
      /** cyl(x, y, z, r, h, mat, { sides, top, inner }): a round basin, a well, a column, an oven. */
      w.cyl = (x, y, z, r, h, m, o = {}) => {
        const n = o.sides || 16;
        for (let i = 0; i < n; i++) { const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, p = (a) => [x + Math.cos(a) * r, z - Math.sin(a) * r];
          const [ax, az] = p(a0), [bx, bz] = p(a1); face(m, [ax, y, az], [bx, y, bz], [bx, y + h, bz], [ax, y + h, az], [0.6, 0.6, 1, 1], (i / n) * Math.PI * 2 * r, -(y + h));
          if (o.top !== false) { const tm = o.top || m; face(tm, [x, y + h, z], [ax, y + h, az], [bx, y + h, bz], [x, y + h, z]); } }
        if (y < 0.05 && !o.noContact) w.contact(x, z, r * 1.3 + 0.3, r * 1.3 + 0.3, 0.35);
      };
      /** cone(x, y, z, r, h, mat, { sides }): a spire, a cypress tier, a market tent top. */
      w.cone = (x, y, z, r, h, m, o = {}) => { const n = o.sides || 12;
        for (let i = 0; i < n; i++) { const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
          face(m, [x + Math.cos(a0) * r, y, z - Math.sin(a0) * r], [x + Math.cos(a1) * r, y, z - Math.sin(a1) * r], [x, y + h, z], [x, y + h, z], [0.7, 0.7, 1, 1], (i / n) * Math.PI * 2 * r, y); } };
      /** ball(x, y, z, rx, ry, rz, mat, { seg }): a low, faceted round volume (a tree crown, a bush, a bell body, a loaf). */
      w.ball = (x, y, z, rx, ry, rz, m, o = {}) => { const sg = o.seg || 8, st = Math.max(4, Math.round(sg * 0.6)), P = (i, j) => { const th = (j / st) * Math.PI, ph = (i / sg) * Math.PI * 2; return [x + Math.sin(th) * Math.cos(ph) * rx, y + Math.cos(th) * ry, z - Math.sin(th) * Math.sin(ph) * rz]; };
        for (let j = 0; j < st; j++) for (let i = 0; i < sg; i++) { const ao = (jj) => 0.62 + 0.38 * (1 - jj / st);
          face(m, P(i, j + 1), P(i + 1, j + 1), P(i + 1, j), P(i, j), [ao(j + 1), ao(j + 1), ao(j), ao(j)], (i / sg) * 2 * Math.PI * Math.max(rx, rz), (1 - j / st) * Math.PI * ry); }
        if (o.contact !== false && y - ry < 0.4) w.contact(x, z, rx * 1.1, rz * 1.1, 0.4); };
      /** tree(x, z, { h, r, trunk, leaf, seed }): a 3D tree, a trunk cylinder and 3 faceted crowns. Never a flat sprite. */
      w.tree = (x, z, o = {}) => { const r = rng(o.seed || Math.round(x * 13 + z * 7)), h = o.h || 4.2, cr = o.r || 1.6;
        w.cyl(x, 0, z, 0.18 * (h / 4), h * 0.55, o.trunk, { sides: 6 });
        for (let i = 0; i < 3; i++) { const a = r() * 6.28, d = i ? cr * 0.45 : 0; w.ball(x + Math.cos(a) * d, h * (0.62 + 0.12 * (i ? r() : 1)), z + Math.sin(a) * d, cr * (i ? 0.72 : 1), cr * (i ? 0.62 : 0.85), cr * (i ? 0.72 : 1), o.leaf, { seg: 9, contact: false }); }
        w.contact(x, z, cr * 1.1, cr * 1.1, 0.3); };
      /** cypress(x, z, { h, r, trunk, leaf }): a tall narrow 3D cypress of two stacked faceted volumes. */
      w.cypress = (x, z, o = {}) => { const h = o.h || 6, r = o.r || 0.6; w.cyl(x, 0, z, 0.12, h * 0.15, o.trunk, { sides: 5 });
        w.ball(x, h * 0.42, z, r, h * 0.34, r, o.leaf, { seg: 8, contact: false }); w.cone(x, h * 0.62, z, r * 0.78, h * 0.38, o.leaf, { sides: 8 }); w.contact(x, z, r * 1.6, r * 1.6, 0.3); };
      /** awning(x, y, z, sx, sz, drop, mat): a sloped cloth or plank canopy over a stall, falling toward +z. */
      w.awning = (x, y, z, sx, sz, drop, m) => { const x0 = x - sx / 2, x1 = x + sx / 2, z0 = z - sz / 2, z1 = z + sz / 2;
        face(m, [x0, y - drop, z1], [x1, y - drop, z1], [x1, y, z0], [x0, y, z0]); face(m, [x1, y - drop, z1], [x0, y - drop, z1], [x0, y - drop - 0.25, z1], [x1, y - drop - 0.25, z1]); };
      /** house(x, z, sx, sz, storeys, mats, { along, face, door, lit }): a house of 3 m storeys with a tiled gable roof, and on one face
          (face "+z", "+x" or "-x") windows with shutters and sills, and a door. mats: { wall, roof, glass, dark, shutter, door, sill }.
          lit lists the windows that glow (storey * 10 + index), for dusk. */
      w.house = (x, z, sx, sz, storeys, m, o = {}) => {
        const h = storeys * 3, along = o.along || "x", fc = o.face || "+z";
        w.box(x, 0, z, sx, h, sz, { side: m.wall, top: m.wall }); w.gable(x, h, z, sx, (along === "x" ? sz : sx) * 0.42, sz, m.roof, m.wall, { along });
        const span = fc === "+z" ? sx : sz, nWin = Math.max(1, Math.floor(span / 2.3)), lit = o.lit || [];
        const put = (c, dx, y, dz, a, b, hh, mm) => { if (fc === "+z") w.box(x + c + dx, y, z + sz / 2 + dz, a, hh, b, mm, { noContact: true }); else { const sg = fc === "+x" ? 1 : -1; w.box(x + sg * (sx / 2 + dz), y, z - sg * (c + dx), b, hh, a, mm, { noContact: true }); } };
        for (let s = 0; s < storeys; s++) for (let i = 0; i < nWin; i++) {
          const c = -span / 2 + (span - (nWin - 1) * 2.3) / 2 + i * 2.3, wy = s * 3 + (s ? 0.8 : 1.0);
          if (s === 0 && i === (o.door ?? 0)) { put(c, 0, 0, 0.05, 1.2, 0.12, 2.2, m.door); put(c, 0, 2.2, 0.08, 1.5, 0.2, 0.18, m.sill); continue; }
          put(c, 0, wy, 0.03, 0.8, 0.08, 1.2, lit.includes(s * 10 + i) ? m.glass : m.dark);
          put(c, -0.62, wy, 0.1, 0.42, 0.08, 1.2, m.shutter); put(c, 0.62, wy, 0.1, 0.42, 0.08, 1.2, m.shutter); put(c, 0, wy - 0.14, 0.12, 1.0, 0.24, 0.14, m.sill);
        }
      };
      /** ground(x0, z0, x1, z1, mat, y): a flat floor. */
      w.ground = (x0, z0, x1, z1, m, y = 0) => face(m, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], [1, 1, 1, 1], x0, -z1);
      /** stairs(x, y, z, width, steps, rise, run, mat, dir): steps climbing toward -z (dir 1) or +z (dir -1). */
      w.stairs = (x, y, z, sx, steps, rise, run, m, dir = 1) => { for (let i = 0; i < steps; i++) w.box(x, y, z - dir * i * run - dir * run / 2, sx, rise * (i + 1), run, m, { noContact: i > 0 }); };
      /** contact(x, z, rx, rz, strength): a soft dark blob on the ground under anything that stands (the ambient occlusion feel). */
      w.contact = (x, z, rx, rz, k = 0.35, y = 0.012) => w.blobs.push({ base: [x, y, z], u: [rx, 0, 0], v: [0, 0, rz], col: [0.22, 0.2, 0.36, k], mode: 0 });
      /** glow(x, y, z, r, colour, k): a soft additive halo (a lamp, a window, an oven mouth). It blooms. Return it to animate .k. */
      w.glow = (x, y, z, r, col, k = 1) => { const g = { pos: [x, y, z], r, col: lin(col), k }; w.glows.push(g); return g; };
      /** light(x, y, z, colour, range, power): a point lamp (no shadow). Return it to animate .power or .pos. Up to 8 per world. */
      w.light = (x, y, z, col, range = 6, power = 2) => { const l = { pos: [x, y, z], col: lin(col), range, power }; w.lights.push(l); return l; };
      /** dust(n, [x0, y0, z0, x1, y1, z1], colour): floating dust or pollen that drifts with time and catches the light. */
      w.dust = (n, box, col = "#ffe3b0", px = 90) => { const r = rng(w.dust.length * 13 + 7), d = new Float32Array(n * 4); for (let i = 0; i < n * 4; i++) d[i] = r();
        const vao = gl.createVertexArray(); gl.bindVertexArray(vao); const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null);
        w.dustSets = w.dustSets || []; w.dustSets.push({ vao, n, box, col: lin(col), px }); };
      /** sprite(strip, { x, z, y, height, tint }): a character (a person or an animal, nothing else) as a flat pixel billboard that faces the camera and casts a shadow.
          Returns a handle: set .x .y .z .frame .flip .visible every frame. Sprite textures never get mipmaps: their pixels stay crisp. */
      w.sprite = (img, o = {}) => { const s = { img, tex: glTex(img, { mips: false }), frames: img.frames || 1, x: o.x || 0, y: o.y || 0, z: o.z || 0, height: o.height || 1.7, frame: 0, flip: false, visible: true, tint: o.tint ? lin(o.tint) : [1, 1, 1], emit: o.emit || 0, shadow: o.shadow !== false, contact: o.contact ?? 0.4 }; w.sprites.push(s); return s; };
      w.build = () => {
        for (const m of [...w.mats, ...w.nodes.flatMap((n) => n.mats)]) { const d = new Float32Array(m.verts); m.count = d.length / 9; m.vao = gl.createVertexArray(); gl.bindVertexArray(m.vao);
          const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
          gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 36, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 36, 12);
          gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 36, 24); gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 36, 32); gl.bindVertexArray(null); m.verts = null; }
        w.built = true; return w;
      };
      return w;
    }

    /** camera({ target, yaw, pitch, dist, fov }): a perspective camera looking down at the target. yaw 0 looks toward -z. */
    function camera(c) { const yaw = (c.yaw || 0) * Math.PI / 180, pitch = (c.pitch ?? 35) * Math.PI / 180, d = c.dist ?? 26, t = c.target || [0, 1, 0];
      const eye = [t[0] + Math.sin(yaw) * Math.cos(pitch) * d, t[1] + Math.sin(pitch) * d, t[2] + Math.cos(yaw) * Math.cos(pitch) * d];
      return { eye, target: t, fov: c.fov ?? 34, focus: c.focus ?? d, sharp: c.sharp ?? d * 0.07, ramp: c.ramp ?? d * 0.22 }; }
    /** move(a, b, t0, t1, t): one camera move between two cameras (as camera() settings) on the house curve, eased in and out. */
    function move(a, b, t0, t1, t) { const s = ease((t - t0) / Math.max(1e-6, t1 - t0)), o = {};
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = a[k] ?? b[k], y = b[k] ?? a[k]; o[k] = Array.isArray(x) ? x.map((v, i) => lerp(v, y[i], s)) : lerp(x, y, s); }
      return camera(o); }

    let view = null;
    /** project([x, y, z]): where a world point is on the frame, in px, for the last rendered frame (for DOM labels beside a thing). */
    function project(p) { if (!view) return { x: 0, y: 0, z: 1 }; const m = view; const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], wv = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15], z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
      return { x: (x / wv * 0.5 + 0.5) * W, y: (0.5 - y / wv * 0.5) * H, z: z / wv }; }

    function setCommon(prog, w, cam, VP, LVP, t) {
      const u = prog.u, sun = w.sunVec;
      gl.uniformMatrix4fv(u.uVP, false, VP); if (u.uLVP) gl.uniformMatrix4fv(u.uLVP, false, LVP); if (u.uEye) gl.uniform3fv(u.uEye, cam.eye);
      if (u.uShadow) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T.shadow.tex); gl.uniform1i(u.uShadow, 1); gl.uniform1f(u.uShadowTexel, 1 / SHADOW); }
      if (u.uSunDir) { gl.uniform3fv(u.uSunDir, sun); gl.uniform3fv(u.uSun, lin(w.sun.color, w.sun.power)); gl.uniform3fv(u.uSky, lin(w.ambSky, w.ambient)); gl.uniform3fv(u.uGround, lin(w.ambGround, w.ambient));
        gl.uniform3fv(u.uHaze, lin(w.haze)); gl.uniform1f(u.uFog, w.fog); gl.uniform1f(u.uFogStart, w.fogStart); gl.uniform1f(u.uShafts, w.shafts);
        const pl = new Float32Array(LIGHTS * 4), pc = new Float32Array(LIGHTS * 4); w.lights.slice(0, LIGHTS).forEach((l, i) => { pl.set([...l.pos, l.range], i * 4); pc.set([...l.col.map((v) => v * l.power), 0], i * 4); });
        gl.uniform4fv(u.uPL, pl); gl.uniform4fv(u.uPC, pc); }
      if (u.uFocus) gl.uniform3fv(u.uFocus, [cam.focus, cam.sharp, cam.ramp]);
      if (u.uTime) gl.uniform1f(u.uTime, t);
    }
    function pass(prog, dst, setup) { gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null); gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H); gl.useProgram(prog.p); setup(prog.u); gl.bindVertexArray(quad); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    const bindTex = (u, name, tex, unit) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(u[name], unit); };
    function blur(src, a, b, steps = 1, spread = 1) { let s = src; for (let i = 0; i < steps; i++) { pass(P.blur, a, (u) => { bindTex(u, "uSrc", s.tex, 0); gl.uniform2f(u.uDir, spread / a.w, 0); }); pass(P.blur, b, (u) => { bindTex(u, "uSrc", a.tex, 0); gl.uniform2f(u.uDir, 0, spread / b.h); }); s = b; } return b; }
    function drawSprite(s, w, right, faceN, shadowPass) {
      const u = P.bb.u, fw = 1 / s.frames, f = Math.floor(s.frame) % s.frames, aspect = (s.img.width / s.frames) / s.img.height;
      gl.uniform3fv(u.uBase, [s.x, s.y, s.z]); gl.uniform2f(u.uSize, s.height * aspect, s.height); gl.uniform3fv(u.uRight, right); gl.uniform3fv(u.uFaceN, faceN);
      gl.uniform4fv(u.uFrame, s.flip ? [(f + 1) * fw, 0, -fw, 1] : [f * fw, 0, fw, 1]); bindTex(u, "uTex", s.tex, 0); gl.uniform3fv(u.uTint, s.tint); gl.uniform1f(u.uEmit, s.emit); gl.uniform1i(u.uShadowPass, shadowPass ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /** render(world, cam, t, { blurAll, dim }): draws one frame. blurAll (0..1) blurs the whole picture (a focus-pull transition), dim darkens it. */
    function render(w, cam, t, fx = {}) {
      if (!w.built) w.build();
      const az = w.sun.azimuth * Math.PI / 180, el = w.sun.elevation * Math.PI / 180;
      w.sunVec = norm([Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]);
      const [bx0, bz0, bx1, bz1, by0, by1] = w.bounds, cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2, R = Math.hypot(bx1 - bx0, bz1 - bz0, by1 - by0) / 2 + 2;
      const LV = lookAt([cx + w.sunVec[0] * R * 2, w.sunVec[1] * R * 2, cz + w.sunVec[2] * R * 2], [cx, (by0 + by1) / 4, cz], [0, 1, 0]);
      const LVP = mul(ortho(-R, R, -R, R, 0.1, R * 4), LV);
      const V = lookAt(cam.eye, cam.target, [0, 1, 0]), VP = mul(perspective(cam.fov, W / H, 0.3, 400), V); view = VP;
      const camRight = norm([V[0], 0, V[8]]), camN = norm([-camRight[2], 0, camRight[0]]);
      const sunRight = norm([-w.sunVec[2], 0, w.sunVec[0]]), sunN = norm([w.sunVec[0], 0, w.sunVec[2]]);
      // 1. shadow map from the sun: the stage, then the sprites turned to face the sun so their shadows have their full shape
      gl.bindFramebuffer(gl.FRAMEBUFFER, T.shadow.fb); gl.viewport(0, 0, SHADOW, SHADOW); gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 3);
      gl.useProgram(P.shadow.p); gl.uniformMatrix4fv(P.shadow.u.uLVP, false, LVP);
      const batches = [...w.mats.map((b) => [b, IDENT]), ...w.nodes.filter((n) => n.visible && n.scale.every((k) => Math.abs(k) > 1e-4)).flatMap((n) => { const M = model(n); return n.mats.map((b) => { b.castOnly = n.castOnly; return [b, M]; }); })];
      for (const [b, Mx] of batches) { gl.uniformMatrix4fv(P.shadow.u.uModel, false, Mx); bindTex(P.shadow.u, "uTex", b.m.tex, 0); gl.bindVertexArray(b.vao); gl.drawArrays(gl.TRIANGLES, 0, b.count); }
      gl.useProgram(P.bb.p); gl.uniformMatrix4fv(P.bb.u.uVP, false, VP); gl.uniformMatrix4fv(P.bb.u.uLVP, false, LVP); gl.bindVertexArray(quad);
      for (const s of w.sprites) if (s.visible && s.shadow) drawSprite(s, w, sunRight, sunN, true);
      gl.disable(gl.POLYGON_OFFSET_FILL);
      // 2. the lit picture, 4x multisampled
      gl.bindFramebuffer(gl.FRAMEBUFFER, T.msaa.fb); gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.useProgram(P.sky.p); gl.uniform3fv(P.sky.u.uTop, hex(w.skyTop).map((v) => v / 255)); gl.uniform3fv(P.sky.u.uBot, hex(w.skyBottom).map((v) => v / 255));
      gl.bindVertexArray(quad); gl.colorMask(true, true, true, false); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.colorMask(true, true, true, true);
      gl.clearColor(0, 0, 0, 1); // the sky keeps alpha 1 = far and fully blurred
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
      gl.useProgram(P.mesh.p); setCommon(P.mesh, w, cam, VP, LVP, t);
      for (const [b, Mx] of batches) { if (b.castOnly) continue; const m = b.m; gl.uniformMatrix4fv(P.mesh.u.uModel, false, Mx); bindTex(P.mesh.u, "uTex", m.tex, 0); gl.uniform3fv(P.mesh.u.uTint, m.tint); gl.uniform1f(P.mesh.u.uEmit, m.emit); gl.uniform2fv(P.mesh.u.uScroll, m.scroll); gl.bindVertexArray(b.vao); gl.drawArrays(gl.TRIANGLES, 0, b.count); }
      gl.useProgram(P.bb.p); setCommon(P.bb, w, cam, VP, LVP, t); gl.bindVertexArray(quad);
      for (const s of w.sprites) if (s.visible) drawSprite(s, w, camRight, camN, false);
      // contact shadows (multiply) and glows (add): colour only, the blur amount in alpha stays the surface's
      gl.depthMask(false); gl.enable(gl.BLEND); gl.colorMask(true, true, true, false); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -4);
      gl.useProgram(P.blob.p); gl.uniformMatrix4fv(P.blob.u.uVP, false, VP); gl.bindVertexArray(quad);
      gl.blendFunc(gl.DST_COLOR, gl.ZERO); gl.uniform1i(P.blob.u.uMode, 0);
      for (const b of w.blobs) { gl.uniform3fv(P.blob.u.uBase, b.base); gl.uniform3fv(P.blob.u.uU, b.u); gl.uniform3fv(P.blob.u.uV, b.v); gl.uniform4fv(P.blob.u.uCol, b.col); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      for (const s of w.sprites) if (s.visible && s.contact > 0 && s.y < 0.3) { const r = s.height * 0.22; gl.uniform3fv(P.blob.u.uBase, [s.x, 0.015, s.z]); gl.uniform3fv(P.blob.u.uU, [r, 0, 0]); gl.uniform3fv(P.blob.u.uV, [0, 0, r * 0.6]); gl.uniform4fv(P.blob.u.uCol, [0.2, 0.18, 0.34, s.contact]); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.blendFunc(gl.ONE, gl.ONE); gl.uniform1i(P.blob.u.uMode, 1);
      for (const g of w.glows) { gl.uniform3fv(P.blob.u.uBase, g.pos); gl.uniform3fv(P.blob.u.uU, camRight.map((v) => v * g.r)); gl.uniform3fv(P.blob.u.uV, [0, g.r, 0]); gl.uniform4fv(P.blob.u.uCol, [...g.col, g.k]); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      if (w.dustSets) { gl.useProgram(P.dust.p); const u = P.dust.u; gl.uniformMatrix4fv(u.uVP, false, VP); gl.uniform3fv(u.uEye, cam.eye); gl.uniform1f(u.uTime, t); gl.uniform3fv(u.uFocus, [cam.focus, cam.sharp, cam.ramp]);
        for (const d of w.dustSets) { gl.uniform3fv(u.uMin, d.box.slice(0, 3)); gl.uniform3fv(u.uMax, d.box.slice(3)); gl.uniform3fv(u.uCol, d.col); gl.uniform1f(u.uPx, d.px); gl.bindVertexArray(d.vao); gl.drawArrays(gl.POINTS, 0, d.n); } }
      gl.disable(gl.BLEND); gl.colorMask(true, true, true, true); gl.depthMask(true); gl.disable(gl.DEPTH_TEST);
      // 3. resolve, blur at half and quarter size for the tilt-shift, bloom at an eighth, then grade
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, T.msaa.fb); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, T.sharp.fb); gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, T.sharp.fb); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, T.h2.fb); gl.blitFramebuffer(0, 0, W, H, 0, 0, W >> 1, H >> 1, gl.COLOR_BUFFER_BIT, gl.LINEAR);
      const b1 = blur(T.h2, T.h1, T.h2, 1, 1.4);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, b1.fb); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, T.q2.fb); gl.blitFramebuffer(0, 0, W >> 1, H >> 1, 0, 0, W >> 2, H >> 2, gl.COLOR_BUFFER_BIT, gl.LINEAR);
      const b2 = blur(T.q2, T.q1, T.q2, 2, 1.6);
      pass(P.bright, T.e2, (u) => { bindTex(u, "uSrc", b2.tex, 0); gl.uniform1f(u.uThr, w.grade.threshold); });
      const bl = blur(T.e2, T.e1, T.e2, 2, 1.5);
      const G = w.grade;
      pass(P.comp, null, (u) => { bindTex(u, "uSharp", T.sharp.tex, 0); bindTex(u, "uB1", b1.tex, 1); bindTex(u, "uB2", b2.tex, 2); bindTex(u, "uBloom", bl.tex, 3);
        gl.uniform1f(u.uBloomK, G.bloom); gl.uniform1f(u.uVig, G.vignette); gl.uniform3fv(u.uCool, hex(G.cool).map((v) => v / 255)); gl.uniform3fv(u.uWarm, hex(G.warm).map((v) => v / 255));
        gl.uniform1f(u.uSat, G.sat); gl.uniform1f(u.uExpo, G.exposure); gl.uniform1f(u.uDim, fx.dim || 0); gl.uniform1f(u.uBlurAll, fx.blurAll || 0); });
    }
    return { gl, W, H, mat, world, camera, move, render, project };
  }

  window.Diorama = { create, pix, sprite, strip, person, outline, TEX, rng, clamp, lerp, sm, ease, shade, mix, hex };
})();
