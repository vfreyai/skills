# Footage split: helpers

Code patterns for `starter.html` next to this file, and the footage commands. Footage is always the person's own, from
`<project>/footage/`; vfrey never downloads any.

## Prepare the footage

```bash
# What is in the folder (size, frame rate, length, sound) before you plan the cuts:
for f in footage/*; do ffprobe -v error -select_streams v:0 -show_entries stream=width,height,avg_frame_rate:format=duration -of csv=p=0 "$f" | sed "s|^|$f: |"; done

# Top half, whole clips in name order, muted, as long as a 45 s film (run before the first render):
python3 "$(npx vfrey styles path footage-split)/prep-footage.py" --footage footage --scene scenes/<idea> --duration 45 --slot top

# After the first render, to the exact film length, in your order, trimmed, 6 s per clip per pass, their own sound kept:
python3 "$(npx vfrey styles path footage-split)/prep-footage.py" --footage footage --scene scenes/<idea> \
  --timing scenes/<idea>/vfrey/timing.json --slot top --order intro.mov,run1.mp4,run2.mp4 \
  --trim run1.mp4=12-40 --segment 6 --audio keep

# A gameplay loop of the person's own capture under the point (bottom half), wide footage shown whole over a blur:
python3 "$(npx vfrey styles path footage-split)/prep-footage.py" --footage footage/gameplay --scene scenes/<idea> --duration 45 --slot bottom --fit blur
```

`footage.json` next to the clip lists every piece (`segments[{name, from, to, at}]`): `at` is when that piece starts in
the film. A cut lands near a sentence start when `--segment` is about the length of a sentence (5 to 8 s), or order the
clips so each point gets its own.

Mixed sources are fine: phone clips (rotated), 16:9 screen captures, 24, 25, 30 and 60 fps, webm and mov, photos (each
held `--still` seconds). The clip is re-encoded at one frame rate with a key frame every half second, silent.

## Point at something in the footage

```js
// A yellow ring that pops on at a sentence and fades after it. x, y in frame pixels inside the footage half.
function ring(lineIndex, x, y, r = 90) {
  const el = document.createElement("div");
  Object.assign(el.style, { position: "absolute", left: x - r + "px", top: y - r + "px", width: 2 * r + "px", height: 2 * r + "px", borderRadius: "50%", border: "8px solid #ffd23f", boxShadow: "0 0 24px rgba(255,210,63,.6)", opacity: 0 });
  document.querySelector("#root").appendChild(el);
  const L = vfrey.line(lineIndex);
  tl.fromTo(el, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2.5)" }, L.start);
  tl.to(el, { opacity: 0, duration: 0.3 }, L.end);
}
```
Never put a ring or text over a face.

## An illustration in the panel instead of the key phrase

```html
<!-- In #panel: your own SVG for the idea, drawn to fit 980 x 220 above the caption band (top layout). -->
<svg id="art" viewBox="0 0 980 220" style="position:absolute;left:50px;top:1010px;width:890px;height:200px"> ... </svg>
```
Set `KEYS = []` with empty strings for the lines the drawing covers, and animate the drawing on `vfrey.line(i).start`.

## Full layout: keep the captions readable

The dark plate already carries the contrast. For bright footage add to the scrim: a band of `rgba(0,0,0,.35)` behind
the plate (`#scrim` gradient stops at the plate's top and bottom).

## Cues for the sound bed

```js
const cues = { tick: vfrey.timing.lines.map((l) => Math.max(0.05, l.start - 0.05)), duration: vfrey.timing.durationSec };
```

## Duck the footage's own sound with vfrey instead

```json
"music": { "file": "music/<idea>-footage.wav", "source": "own", "volume": -10, "duck": true }
```
Only for sound the person owns (their voice, their game audio); vfrey ducks it under the voice by itself.
