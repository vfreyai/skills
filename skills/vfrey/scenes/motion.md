# Motion recipes

Copy the idea, not the numbers; change the ease, distance and timing for the idea at hand. All of this runs inside the single `const tl = vfrey.timeline()` and is cued with `vfrey.onLine`, `vfrey.onWord` or `vfrey.at`. Elements start hidden in CSS. A `gsap.set(...)` made while the scene builds (also inside `vfrey.onLine`) applies at once, even under `gsap.defaults({ immediateRender: false })`, so the full MP4 and `render --frame` show the same frame.

## Arrivals (choose a different one per beat)

```js
// Per-word blur-in (split the headline into spans yourself, no random)
const words = [...document.querySelectorAll("#head span")];
vfrey.onLine(0, (tl, t) =>
  tl.fromTo(words, { opacity: 0, filter: "blur(6px)" },
    { opacity: 1, filter: "blur(0px)", duration: 0.16, ease: "power2.out", stagger: 0.08 }, t));

// Mask wipe from the left
vfrey.onLine(1, (tl, t) =>
  tl.fromTo("#bar", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "power3.inOut" }, t));

// Drop with a squash (position and size may bounce)
vfrey.onLine(2, (tl, t) => {
  tl.fromTo("#ball", { y: -300, scaleY: 1 }, { y: 0, duration: 0.45, ease: "power3.in" }, t)
    .to("#ball", { scaleY: 0.78, transformOrigin: "50% 100%", duration: 0.08 }, t + 0.45)
    .to("#ball", { scaleY: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" }, t + 0.53);
});

// Line that draws itself (SVG path)
const path = document.querySelector("#arrow path");
const len = path.getTotalLength();
gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
vfrey.onLine(3, (tl, t) => tl.to(path, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, t));
```

## Numbers and bars

```js
// Count-up: tween a plain object, write text in onUpdate (deterministic: no clock)
const n = { v: 0 };
vfrey.onWord(4, (tl, t) =>
  tl.to(n, { v: 87, duration: 0.9, ease: "power3.out",
    onUpdate: () => (document.getElementById("num").textContent = Math.round(n.v)) }, t));

// Bar to a value: scale a full-size bar, do not animate height
tl.fromTo("#fill", { scaleY: 0 }, { scaleY: 0.64, transformOrigin: "50% 100%", duration: 0.7, ease: "power4.out" }, t);
```

Only show a number that is in the script or that you are certain of. A chart is a picture of what the voice says, not new claims.

## Camera moves on a wrapper

Put the whole scene (or a stage) in `#world` and move that. A punch-in: `tl.to("#world", { scale: 1.12, x: -40, y: -60, duration: 0.5, ease: "power2.inOut" }, t)`. A hard cut inside a scene is a punch-in plus a content swap on the same frame, with matching direction on both sides. Transform-origin is set once, in CSS.

## Transitions

| Idea | How |
| --- | --- |
| Object becomes the world | a circle or card scales past the frame (0.6 s, `power2.inOut`); its fill is the next ground; the new content fades in while it still grows |
| Color flood | the hero stays; the ground changes color in about 0.4 s (`power2.inOut`) |
| Whip | a 0.15 to 0.3 s horizontal slide with a `blur(12px)` that sharpens on landing |
| Blur swap on one stage | out: opacity to 0 with `blur(8px)` in 0.15 s; in: blur to 0 in 0.15 s; the ground never changes |
| Iris | `clipPath: "circle(0% at 50% 60%)"` to `"circle(150% at 50% 60%)"` onto the next stage |
| Dip | darken the old frame by about 40 % for 3 frames (0.1 s) before a hard cut |

Mirror eases across a seam: `power3.in` going out, `power3.out` coming in.

### Shader transitions between shots (HTML scenes only)

GPU transitions (glitch, zoom blur, warp, iris, light leak and more) between full-frame shots; `npx vfrey scene transitions` lists them. Stack the shots as sibling `<div>`s in `#root` (each fills the frame), load `<script src="vfrey/transitions.js"></script>` before `vfrey/vfrey.js`, then cue each seam. Calls chain (shot A to B, then B to C), may not overlap, and are driven by the scene's timeline, so frames are the same on every render:

```js
vfrey.transition("#shot-a", "#shot-b", { type: "cross-warp-morph", at: 3.2, duration: 0.7 });
vfrey.transition("#shot-b", "#shot-c", { type: "glitch", at: 7.5, duration: 0.5 });
```

Place `at` with `vfrey.line(i).start` to cut on a spoken line. Animate each shot's contents as usual on `tl` (both shots keep playing through the seam). Use a type per seam with a cause, about 0.4 to 0.8 s, never every beat; `crossfade` is the quiet one. A `--frame` of a scene with transitions renders the clip up to that frame, so it takes about as long as a short render. Remotion scenes cannot use them (`✗` with a Fix); use `interpolate()` there.

## Exits

One smooth motion, 40 to 50 % shorter than the entrance: blur-and-fade 0.13 to 0.25 s, or move with the scene's own transition. Finish with a hard kill so no stale frame lingers: `tl.set("#panel", { opacity: 0 }, end)`.

## Common faults

| Symptom | Usual cause |
| --- | --- |
| Blank first frame, then pop | initial state not in CSS; tween built after the page loaded |
| A canvas or three.js scene is frozen in the render but moves in the preview | it is drawn from a tween's `onUpdate`, which a seek does not fire: draw from `vfrey.onFrame((t) => ...)` (`craft.md` section 11) |
| Jitter or drift between renders | layout measured in `onUpdate`; two tweens on the same property; `left/top` animated |
| Text clipped at the edge after it scales | `overflow: hidden` on a parent, or `translateX(-50%)` centering |
| Everything lands at once | every cue uses the same `t`; stagger or use different lines |
| A block shows too early | `vfrey.block` never called for it (it plays from `data-start` 0) |
| Nothing visible in the still at 2.5 s | the element's entrance is later than that; render a frame after its cue |
| An SVG group jumps to the top-left corner when it moves | it has its own `transform` attribute, which GSAP replaces |

To animate inline SVG art, put the position on a parent `<g transform>` and animate the child; animating a group that has a `transform` attribute throws it to the origin.
