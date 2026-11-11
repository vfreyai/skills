# Screen demo: code to copy

A fake app window in world coordinates inside one camera group, with a cursor, overlays and a tracker on top. Paste the page shell, then the blocks as one `scene.js` (the last line of the shell loads it). `tl` is `vfrey.timeline()`. Every name, brand and address you put in the window is invented (`example.com` domains).

## Page shell

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="stylesheet" href="vfrey/fonts/fonts.css" />
<script src="vfrey/gsap.min.js"></script>
<script src="vfrey/vfrey.js"></script>
<style>
  :root { --acc:#4f5df5; --accSoft:rgba(79,93,245,.14); --ink:#171c30; --mut:#6c7389; --line:#e6e9f2; --bg:#e9edf6; }
  html,body{margin:0;width:100%;height:100%;overflow:hidden}
  *{box-sizing:border-box}
  #root{position:relative;width:100%;height:100%;background:var(--bg);font-family:"Google Sans Flex","Baloo 2",sans-serif;color:var(--ink);overflow:hidden}
  #backdrop{position:absolute;inset:-200px}
  .blob{position:absolute;border-radius:50%}
  #cam{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0}
  #win{position:absolute;left:30px;top:150px;width:1020px;height:2600px;background:#fff;border-radius:40px 40px 0 0;box-shadow:0 40px 110px rgba(30,40,90,.30),0 6px 22px rgba(30,40,90,.12);overflow:hidden}
  #titlebar{position:absolute;left:0;top:0;width:100%;height:64px;background:#f5f6fb;border-bottom:1px solid var(--line);z-index:5}
  .dot{position:absolute;top:23px;width:18px;height:18px;border-radius:50%;background:#d5d9e6}
  #apptitle{position:absolute;left:0;width:100%;top:15px;text-align:center;font-weight:700;font-size:26px;letter-spacing:.01em;color:var(--mut)}
  .view{position:absolute;left:0;top:64px;width:1020px;height:2536px;background:#fff;overflow:hidden}
  #inboxHead{position:absolute;left:40px;top:22px;font-size:54px;font-weight:800}
  #inboxSub{position:absolute;left:210px;top:41px;font-size:28px;color:var(--mut)}
  .rj{position:absolute;left:152px;top:70px;font-size:29px;font-weight:600;white-space:nowrap;color:#2a3047}
  .rp{position:absolute;left:152px;top:107px;font-size:25px;color:var(--mut);white-space:nowrap}
  #spotbase{display:none}.spot{position:absolute;left:0;top:0;width:100px;height:100px;border-radius:26px;box-shadow:0 0 0 3000px rgba(18,22,44,.5);opacity:0;pointer-events:none}
  .callout{position:absolute;left:0;top:0;opacity:0;pointer-events:none}
  .cpill{position:absolute;white-space:nowrap;background:var(--acc);color:#fff;font-weight:800;font-size:30px;padding:0 26px;height:64px;line-height:64px;border-radius:32px;box-shadow:0 12px 30px rgba(79,93,245,.45)}
  .cdot{position:absolute;width:22px;height:22px;border-radius:50%;background:var(--acc);border:4px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.25);margin:-11px 0 0 -11px}
  svg.lead{position:absolute;left:0;top:0;width:10px;height:10px;overflow:visible;pointer-events:none}
  #tip{position:absolute;opacity:0;background:#10142a;color:#fff;border-radius:18px;padding:0 24px;height:74px;line-height:74px;white-space:nowrap;font-family:"JetBrains Mono",monospace;font-size:24px;font-weight:600;box-shadow:0 20px 50px rgba(10,14,40,.5)}
  #tip b{color:#aab3ff;font-weight:800}
  #loupe{position:absolute;left:0;top:0;width:880px;height:170px;opacity:0;pointer-events:none}
  #lens{position:absolute;inset:0;border-radius:85px;background:rgba(255,255,255,.98);border:9px solid var(--acc);box-shadow:0 30px 80px rgba(20,30,90,.45),inset 0 0 40px rgba(79,93,245,.25);overflow:hidden}
  #lensTxt{position:absolute;left:0;right:0;top:0;bottom:0;text-align:center;font-family:"JetBrains Mono",monospace;font-size:36px;font-weight:800;line-height:150px;white-space:nowrap}
  #lensTxt span{color:var(--acc)}
  #lensShine{position:absolute;left:40px;top:10px;width:300px;height:44px;border-radius:30px;background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,0))}
  #handle{position:absolute;left:760px;top:130px;width:140px;height:32px;border-radius:16px;background:var(--acc);transform-origin:0 50%;transform:rotate(62deg);box-shadow:0 10px 22px rgba(20,30,90,.35);z-index:-1}
  #cursor{position:absolute;left:0;top:0;width:60px;height:60px;pointer-events:none;filter:drop-shadow(0 6px 8px rgba(0,0,0,.35));transform-origin:0 0}
  .ripple{position:absolute;left:0;top:0;width:100px;height:100px;margin:-50px 0 0 -50px;border-radius:50%;border:6px solid var(--acc);background:rgba(79,93,245,.25);opacity:0}
  #tracker{position:absolute;left:0;width:1080px;top:70px;height:96px}
  .tp{position:absolute;top:0;height:84px;border-radius:42px;background:#fff;box-shadow:0 14px 34px rgba(30,40,90,.28);font-weight:800;font-size:31px;line-height:84px;padding-left:84px;white-space:nowrap;color:var(--mut);overflow:hidden}
  .tp .n{position:absolute;left:14px;top:12px;width:60px;height:60px;border-radius:50%;background:#eef0f8;color:var(--mut);text-align:center;line-height:60px;font-size:32px}
  .tp .fillbg{position:absolute;inset:0;background:var(--acc);opacity:0}
  .tp .lbl{position:relative}
  #browser{position:absolute;left:150px;top:-160px;width:780px;height:108px;border-radius:54px;background:#fff;box-shadow:0 26px 70px rgba(25,32,80,.4);border:2px solid var(--line)}
  #lock{position:absolute;left:34px;top:46px;width:30px;height:24px;border-radius:5px;background:var(--acc)}
  #lock:before{content:"";position:absolute;left:5px;top:-14px;width:14px;height:16px;border:5px solid var(--acc);border-bottom:0;border-radius:12px 12px 0 0}
  #urlt{position:absolute;left:90px;top:0;line-height:104px;font-family:"JetBrains Mono",monospace;font-size:40px;font-weight:800;white-space:nowrap}
  #caret{display:inline-block;width:4px;height:44px;background:var(--acc);vertical-align:-8px;margin-left:3px}
  .toast{position:absolute;left:1100px;width:780px;height:150px;border-radius:30px;background:#fff;box-shadow:0 26px 70px rgba(25,32,80,.42);border:2px solid var(--line)}
  .toast .ti{position:absolute;left:26px;top:30px;width:90px;height:90px;border-radius:24px;background:var(--acc);color:#fff;text-align:center;line-height:90px;font-size:46px;font-weight:800}
  .toast .t1{position:absolute;left:140px;top:22px;font-size:22px;color:var(--mut);font-weight:700;letter-spacing:.06em}
  .toast .t2{position:absolute;left:140px;top:52px;font-size:34px;font-weight:800;white-space:nowrap}
  .toast .t3{position:absolute;left:140px;top:102px;font-size:24px;color:var(--mut);white-space:nowrap}
  #capPlate{position:absolute;left:36px;right:36px;border-radius:40px;background:rgba(255,255,255,.97);box-shadow:0 18px 60px rgba(25,32,80,.35),0 2px 8px rgba(25,32,80,.15)}
  #captions{position:absolute;left:var(--vf-safe-left);right:var(--vf-safe-right);top:var(--vf-caption-at);height:var(--vf-caption-h)}
  .view{position:absolute;left:0;top:64px;width:1020px;height:2536px;background:#fff;overflow:hidden}
  .row{position:absolute;left:0;width:1020px;height:150px;border-top:1px solid var(--line)}
  .rowbg{position:absolute;inset:0;background:var(--accSoft);opacity:0}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0">
  <div id="backdrop">
    <div class="blob" id="b1" style="left:60px;top:80px;width:900px;height:900px;background:radial-gradient(circle,rgba(79,93,245,.28),rgba(79,93,245,0) 65%)"></div>
    <div class="blob" id="b2" style="left:600px;top:1300px;width:1000px;height:1000px;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(255,255,255,0) 65%)"></div>
  </div>
  <div id="cam">
    <div id="win">
      <div id="titlebar"><div class="dot" style="left:30px"></div><div class="dot" style="left:60px"></div><div class="dot" style="left:90px"></div><div id="apptitle">Example App</div></div>
      <div class="view" id="main"></div>
    </div>
    <div id="callouts"></div>
    <div id="tip"></div>
    <div id="loupe"><div id="handle"></div><div id="lens"><div id="lensTxt"></div><div id="lensShine"></div></div></div>
    <svg id="cursor" viewBox="0 0 24 24"><path d="M3 2 L3 19 L8 14.5 L11.2 22 L14.2 20.7 L11 13.4 L18 13 Z" fill="#171c30" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
  </div>
  <div id="tracker"></div>
  <div class="toast" id="toast1" style="top:300px"><div class="ti">!</div><div class="t1">NEW</div><div class="t2">A notice arrives</div><div class="t3">Short line of detail</div></div>
  <div id="capPlate"></div><div id="captions"></div>
</div>
<script src="scene.js"></script>
</body>
</html>
```


## Setup, callout with leader line, spotlight

`P(lx, ly)` turns a view-local point into world coordinates. Use a class (`spot`), never an id, for anything you clone: CSS keyed to an id is lost on a clone.

```js
const tl = vfrey.timeline();
const DUR = vfrey.timing.durationSec;
const OX = 30, OY = 150, VY = OY + 64;
const $ = s => document.querySelector(s);
const E = n => gsap.parseEase(n);
const P = (lx,ly) => [OX+lx, VY+ly];

document.getElementById("main").innerHTML = [0, 1, 2, 3].map((i) => `<div class="row" id="row${i}" style="top:${100 + i * 150}px"><div class="rowbg"></div><div style="position:absolute;left:40px;top:50px;font-size:34px;font-weight:700">Row ${i + 1}</div></div>`).join("");
/* ---------- helpers ---------- */
function callout(id, text, px, py, tx, ty, t0, t1){
  const c=document.createElement("div"); c.className="callout"; c.id=id;
  c.innerHTML=`<svg class="lead"><path d="" fill="none" stroke="#4f5df5" stroke-width="6" stroke-linecap="round"/></svg><div class="cpill" style="left:${px}px;top:${py}px">${text}</div><div class="cdot" style="left:${tx}px;top:${ty}px"></div>`;
  $("#cam").insertBefore(c,$("#cursor"));
  const pill=c.querySelector(".cpill"), dot=c.querySelector(".cdot"), path=c.querySelector("path");
  const pw=pill.offsetWidth;
  const sx=Math.min(Math.max(tx,px+30),px+pw-30), sy=ty>py?py+64:py;
  path.setAttribute("d",`M${sx} ${sy} L${tx} ${ty}`);
  const L=Math.hypot(tx-sx,ty-sy); path.style.strokeDasharray=L; path.style.strokeDashoffset=L;
  tl.set(c,{opacity:0},0);
  tl.fromTo(c,{opacity:0},{opacity:1,duration:.12,immediateRender:false},t0);
  tl.fromTo(pill,{scale:.6,transformOrigin:"50% 50%"},{scale:1,duration:.4,ease:"back.out(2)",immediateRender:false},t0);
  tl.fromTo(path,{strokeDashoffset:L},{strokeDashoffset:0,duration:.4,ease:"power2.out",immediateRender:false},t0+.12);
  tl.fromTo(dot,{scale:0},{scale:1,duration:.3,ease:"back.out(3)",immediateRender:false},t0+.35);
  tl.to(c,{opacity:0,duration:.25},t1);
}
let spotN=0;
function spot(x,y,w,h,t0,t1){
  const s=document.createElement("div"); s.className="spot"; $("#cam").insertBefore(s,$("#callouts"));
  tl.set(s,{left:x,top:y,width:w,height:h,opacity:0},0);
  tl.fromTo(s,{opacity:0},{opacity:1,duration:.4,ease:"power2.out",immediateRender:false},t0);
  tl.to(s,{opacity:0,duration:.35},t1);
}
```


## Camera and cursor: pure functions of time

Keyframes `[t, focusX, focusY, zoom, screenY]` put the focus point at screen `(540, screenY)`; cursor waypoints `[tStart, tEnd, x, y]` travel on a curved eased path and rest otherwise. Both are evaluated from `tl.time()` inside the update of one tween that spans the whole timeline, so a seek always lands on the right frame.

```js
const kf = [ // [t, focusX, focusY, zoom, screenY]
 [0.0, 540, 560, 1.0, 640],
 [2.0, 540, 520, 1.06, 640],
 [4.0, 380, 500, 1.45, 520],
 [7.0, 520, 660, 1.12, 600],
 [DUR, 540, 760, 1.0, 660],
];
const cursorWp = [ // [tStart, tEnd, x, y]
 [0.0, 0.0, 930, 1180],
 [0.4, 2.2, 540, 396],
 [3.0, 3.9, 400, 430],
 [5.0, 6.2, 880, 760],
];
function camAt(t){
  let a=kf[0],b=kf[0];
  if(t>=kf[kf.length-1][0]){a=b=kf[kf.length-1];}
  else for(let i=0;i<kf.length-1;i++){ if(t>=kf[i][0]&&t<kf[i+1][0]){a=kf[i];b=kf[i+1];break;} }
  const f=(b[0]===a[0])?1:E("power2.inOut")((t-a[0])/(b[0]-a[0]));
  const m=(u,v)=>u+(v-u)*f;
  return {fx:m(a[1],b[1]),fy:m(a[2],b[2]),k:Math.exp(m(Math.log(a[3]),Math.log(b[3]))),cy:m(a[4],b[4])};
}
function curAt(t){
  let x=cursorWp[0][2],y=cursorWp[0][3];
  for(let i=1;i<cursorWp.length;i++){
    const w=cursorWp[i];
    if(t>=w[1]){x=w[2];y=w[3];continue;}
    if(t>w[0]){
      const f=E("power3.inOut")((t-w[0])/(w[1]-w[0]));
      const dx=w[2]-x,dy=w[3]-y,d=Math.hypot(dx,dy),s=(i%2?1:-1)*0.14*d;
      const cx=x+dx/2-dy/d*s,cy=y+dy/2+dx/d*s,u=1-f;
      return [u*u*x+2*u*f*cx+f*f*w[2],u*u*y+2*u*f*cy+f*f*w[3]];
    }
    break;
  }
  return [x,y];
}
const clicks = [3.9];                         // moments the cursor presses; ripples and the press-scale use them
const camEl = $("#cam"), curEl = $("#cursor"), bgEl = $("#backdrop");
function tick() {
  const t = tl.time(), c = camAt(t);
  camEl.style.transform = `translate(540px,${c.cy}px) scale(${c.k}) translate(${-c.fx}px,${-c.fy}px)`;
  bgEl.style.transform = `translate(${-(c.fx - 540) * .08}px,${-(c.fy - 960) * .06}px)`;   // backdrop parallax at 6 to 8%
  const [x, y] = curAt(t);
  let ps = 1; for (const ct of clicks) { if (t > ct - .02 && t < ct + .18) ps = .8; }
  const s = (1.3 / Math.pow(c.k, .4)) * ps;                                                // the cursor keeps a similar size at any zoom
  curEl.style.transform = `translate(${x - 3 * s}px,${y - 2 * s}px) scale(${s})`;
}
tl.to({}, { duration: DUR, onUpdate: tick, ease: "none" }, 0);
tl.eventCallback("onUpdate", tick);   // live preview
vfrey.onFrame(tick);                  // what a render runs: onUpdate does not fire when the film is sought
clicks.forEach((ct) => {                       // click ripples at where the cursor is at that time
  const [x, y] = curAt(ct);
  const r = document.createElement("div"); r.className = "ripple"; $("#cam").insertBefore(r, curEl);
  tl.set(r, { left: x, top: y, opacity: 0, scale: .2 }, 0);
  tl.fromTo(r, { scale: .2, opacity: .95 }, { scale: 1.7, opacity: 0, duration: .6, ease: "power2.out", immediateRender: false }, ct);
});
```


## Tracker pills, toast, loupe, caption plate

One tracker pill per tell, fixed at the top of the screen (`activate` fills the current one, `done` turns it into a check). The toast waits off screen at `left:1100` and slides in 910 px. The caption plate sits at the band vfrey reports, and the focus is always aimed above it.

```js
/* tracker (screen space) */
const trw=[330,260,330], trn=["First","Second","Third"];
(function(){ let x=(1080-(trw[0]+trw[1]+trw[2]+48))/2;
  trw.forEach((w,i)=>{ const d=document.createElement("div"); d.className="tp"; d.id="tp"+i; d.style.left=x+"px"; d.style.width=w+"px";
    d.innerHTML=`<div class="fillbg"></div><div class="n" id="tn${i}">${i+1}</div><span class="lbl" id="tl${i}">${trn[i]}</span>`; $("#tracker").appendChild(d); x+=w+24; }); })();
[0, 1, 2].forEach((i) => { tl.set("#tp" + i, { y: -160, opacity: 0 }, 0); tl.fromTo("#tp" + i, { y: -160, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: "back.out(1.6)", immediateRender: false }, 0.5 + i * .18); });
function activate(i, t) { tl.to("#tp" + i + " .fillbg", { opacity: 1, duration: .3 }, t); tl.to("#tl" + i, { color: "#fff", duration: .3 }, t); tl.to("#tn" + i, { backgroundColor: "rgba(255,255,255,.25)", color: "#fff", duration: .3 }, t); tl.fromTo("#tp" + i, { scale: 1 }, { scale: 1.08, duration: .2, yoyo: true, repeat: 1, immediateRender: false }, t); }
function done(i, t) { tl.to("#tp" + i + " .fillbg", { opacity: 0, duration: .3 }, t); tl.to("#tl" + i, { color: "#171c30", duration: .3 }, t); tl.set("#tn" + i, { innerHTML: "&#10003;" }, t); tl.to("#tn" + i, { backgroundColor: "#4f5df5", color: "#fff", duration: .3 }, t); }

/* a first tell: a row lights, a spotlight and a callout land on it, the cursor clicks it */
const A = P(40, 100);
tl.to("#row0 .rowbg", { opacity: 1, duration: .35 }, 2.0);
spot(OX, A[1] - 6, 1020, 162, 1.7, 5.0);
callout("c0", "Look here first", A[0] + 190, A[1] + 40, A[0] + 250, A[1] + 128, 2.0, 4.8);
activate(0, 1.0); done(0, 5.0); activate(1, 5.0);
tl.fromTo("#toast1", { x: 0 }, { x: -910, duration: .55, ease: "power3.out", immediateRender: false }, 6.0);
tl.to("#toast1", { x: 0, duration: .5, ease: "power3.in" }, 8.0);
tl.fromTo("#loupe", { opacity: 0, scale: .7, y: -50, transformOrigin: "50% 0%" }, { opacity: 1, scale: 1, y: 0, duration: .55, ease: "back.out(1.5)", immediateRender: false }, 9.0);
tl.to("#loupe", { opacity: 0, y: -30, duration: .4, ease: "power2.in" }, 11.0);
tl.set("#loupe", { left: P(70, 0)[0], top: P(0, 300)[1], opacity: 0 }, 0);

{ const cb = vfrey.captionBox; const p = $("#capPlate").style; p.top = (cb.top + cb.height - 180) + "px"; p.height = "205px"; }
vfrey.captions("#captions", { style: "box", color: "#171c30", highlight: "#4f5df5", maxWords: 3 });
tick();
```
