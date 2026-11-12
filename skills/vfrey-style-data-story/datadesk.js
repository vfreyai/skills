// Data story helpers: generic, no topic data. Copy next to scenes/<idea>/index.html and load with <script src="datadesk.js"></script>.
// Everything is a pure function of its inputs: no Math.random, no Date.now, no requestAnimationFrame.
(function (g) {
  const D2R = Math.PI / 180, EARTH_KM = 6371;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const eio = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);   // ease in-out on 0..1
  const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixRgb = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const rgb = (a) => `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})`;
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");   // 4000 -> "4,000"

  // ---- outlines: a shape is a list of [x, y] points (for a map: [lon, lat] in degrees). You write them yourself, see helpers.md.
  function pip(poly, x, y) {   // point in polygon, ray casting
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  const prep = (p) => ({ p, x0: Math.min(...p.map((q) => q[0])), x1: Math.max(...p.map((q) => q[0])), y0: Math.min(...p.map((q) => q[1])), y1: Math.max(...p.map((q) => q[1])) });
  const inAny = (list, x, y) => list.some((q) => x >= q.x0 && x <= q.x1 && y >= q.y0 && y <= q.y1 && pip(q.p, x, y));

  // A flat dot-matrix fill: dots on a grid wherever a point is inside a shape and not inside a hole. Returns [[x, y], ...] in the shapes' units.
  function dotFill(shapes, holes, step) {
    const S = shapes.map(prep), H = (holes || []).map(prep), out = [];
    const x0 = Math.min(...S.map((s) => s.x0)), x1 = Math.max(...S.map((s) => s.x1)), y0 = Math.min(...S.map((s) => s.y0)), y1 = Math.max(...S.map((s) => s.y1));
    for (let y = y0, r = 0; y <= y1; y += step, r++) for (let x = x0 + (r % 2 ? step / 2 : 0); x <= x1; x += step) if (inAny(S, x, y) && !inAny(H, x, y)) out.push([x, y]);
    return out;
  }

  // The same for a globe: shapes in [lon, lat] degrees, rows every `stepDeg` of latitude, fewer dots per row towards the poles (equal-area look).
  function geoDots(shapes, holes, stepDeg) {
    const S = shapes.map(prep), H = (holes || []).map(prep), out = [];
    for (let lat = -80; lat <= 84; lat += stepDeg) {
      const n = Math.max(1, Math.round((360 * Math.cos(lat * D2R)) / stepDeg)), off = (Math.round((lat + 90) / stepDeg) % 2) * 0.5;
      for (let k = 0; k < n; k++) { const lon = -180 + ((k + off) * 360) / n; if (inAny(S, lon, lat) && !inAny(H, lon, lat)) out.push(geo(lat, lon)); }
    }
    return out;
  }

  // ---- sphere maths. geo() caches sines and cosines; camera = { cx, cy, R, lon0, lat0 } in px and degrees.
  const geo = (lat, lon) => ({ lat, lon, sl: Math.sin(lat * D2R), cl: Math.cos(lat * D2R), sO: Math.sin(lon * D2R), cO: Math.cos(lon * D2R) });
  function camera(c) { const lo = c.lon0 * D2R, la = c.lat0 * D2R; return { cx: c.cx, cy: c.cy, R: c.R, cO0: Math.cos(lo), sO0: Math.sin(lo), sp0: Math.sin(la), cp0: Math.cos(la) }; }
  function project(d, c) {   // orthographic: [x, y, depth]; visible when depth > 0
    const cd = d.cO * c.cO0 + d.sO * c.sO0, sd = d.sO * c.cO0 - d.cO * c.sO0;
    return [c.cx + c.R * d.cl * sd, c.cy - c.R * (c.cp0 * d.sl - c.sp0 * d.cl * cd), c.sp0 * d.sl + c.cp0 * d.cl * cd];
  }
  function distKm(d, c) { return Math.acos(clamp(c.sl * d.sl + c.cl * d.cl * (d.cO * c.cO + d.sO * c.sO), -1, 1)) * EARTH_KM; }
  function destPoint(c, km, bearingDeg) {   // the point `km` away from c along a bearing: sample 0..360 for a true circle on the sphere
    const dl = km / EARTH_KM, th = bearingDeg * D2R, la1 = c.lat * D2R, lo1 = c.lon * D2R;
    const la2 = Math.asin(Math.sin(la1) * Math.cos(dl) + Math.cos(la1) * Math.sin(dl) * Math.cos(th));
    const lo2 = lo1 + Math.atan2(Math.sin(th) * Math.sin(dl) * Math.cos(la1), Math.cos(dl) - Math.sin(la1) * Math.sin(la2));
    return geo(la2 / D2R, lo2 / D2R);
  }
  const capAreaShare = (km) => (1 - Math.cos(km / EARTH_KM)) / 2;   // share of a sphere's surface inside a circle of radius km: compute it, do not type it

  // ---- drawing on a 2D canvas context
  function outline(ctx, shape, toXY, close) {   // stroke a simplified outline from points; toXY maps a point to [x, y] or null when hidden
    ctx.beginPath(); let pen = false;
    shape.forEach((p) => { const q = toXY(p); if (q) { if (!pen) { ctx.moveTo(q[0], q[1]); pen = true; } else ctx.lineTo(q[0], q[1]); } else pen = false; });
    if (close) ctx.closePath(); ctx.stroke();
  }
  function graticule(ctx, c, col, w) {   // lines every 30 degrees on a globe
    ctx.strokeStyle = col; ctx.lineWidth = w;
    const run = (pts) => { ctx.beginPath(); let pen = false; pts.forEach((p) => { const q = project(geo(p[0], p[1]), c); if (q[2] > 0) { if (!pen) { ctx.moveTo(q[0], q[1]); pen = true; } else ctx.lineTo(q[0], q[1]); } else pen = false; }); ctx.stroke(); };
    for (let lo = -180; lo < 180; lo += 30) { const a = []; for (let la = -85; la <= 85; la += 5) a.push([la, lo]); run(a); }
    for (let la = -60; la <= 60; la += 30) { const a = []; for (let lo = -180; lo <= 180; lo += 5) a.push([la, lo]); run(a); }
  }
  function leader(ctx, pts, p, col, w) {   // a polyline drawn on to fraction p (0..1): the line from a dot to its label
    let tot = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
    let rem = tot * p; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && rem > 0; i++) { const l = seg[i - 1], f = Math.min(1, rem / l); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); rem -= l; }
    ctx.stroke();
  }
  function axis(ctx, x, y, w, ticks, o) {   // a horizontal axis with ticks: ticks = [[fraction 0..1, "label"], ...]; o = { col, font }
    ctx.strokeStyle = o.col; ctx.fillStyle = o.col; ctx.lineWidth = 2; ctx.font = o.font; ctx.textAlign = "center";
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ticks.forEach((t) => { ctx.moveTo(x + w * t[0], y); ctx.lineTo(x + w * t[0], y + 10); }); ctx.stroke();
    ticks.forEach((t) => ctx.fillText(t[1], x + w * t[0], y + 36));
  }
  function bar(ctx, x, baseY, w, value, perPx, col) {   // a solid bar from a value: height = value / perPx; returns the top y for a label
    const h = value / perPx; ctx.fillStyle = col; ctx.fillRect(x, baseY - h, w, h); return baseY - h;
  }

  // ---- dots that regroup. Give every dot an index i, a category, and one layout function per chapter that returns { x, y, r, a }.
  const gridPos = (k, x0, y0, rows, pitch) => [x0 + Math.floor(k / rows) * pitch, y0 + (k % rows) * pitch];   // column-major: fills a bar from the left
  const dotDelay = (i) => (i * 0.618034) % 1;                                                              // a spread of delays 0..1 that never clumps
  function regroup(i, A, B, F) {   // A, B: layouts of dot i; F: progress 0..1 of this segment. Eases per dot, with a sideways bulge so the swarm flows
    const f = eio(clamp((F - dotDelay(i) * 0.5) / 0.5)), dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
    const bul = Math.min(150, len * 0.2) * Math.sin(Math.PI * f) * (i % 2 ? 1 : -1);
    return { x: lerp(A.x, B.x, f) - (dy / len) * bul, y: lerp(A.y, B.y, f) + (dx / len) * bul, r: lerp(A.r, B.r, f), a: lerp(A.a, B.a, f), f };
  }
  function dot(ctx, st, fill, ring) {   // draw one dot with a thin ring in the ground colour, so dots on dots stay separate
    ctx.globalAlpha = clamp(st.a); ctx.fillStyle = fill; ctx.strokeStyle = ring; ctx.lineWidth = Math.max(2, st.r * 0.2);
    ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.2832); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
  }

  g.DD = { D2R, EARTH_KM, clamp, lerp, eio, hexRgb, mixRgb, rgb, fmt, pip, prep, inAny, dotFill, geoDots, geo, camera, project, distKm, destPoint, capAreaShare, outline, graticule, leader, axis, bar, gridPos, dotDelay, regroup, dot };
})(window);
