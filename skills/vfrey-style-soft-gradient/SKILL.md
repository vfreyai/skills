---
name: vfrey-style-soft-gradient
description: "Use when the chosen video style is Soft gradient (vfrey-style-soft-gradient), or the person asks for a calm frosted-glass, mesh-gradient, glossy-icon or wellness-app look. Teaches how to build, compose, animate and score that look in a vfrey HTML scene, for any topic: drifting pastel colour fields that change with the story, frosted glass cards over bokeh, glossy gradient icons, spring entrances, captions on a glass plate around vfrey's caption band and a generated pad."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Soft gradient
  style-summary: Drifting pastel colour fields with frosted glass cards and glossy icons that float in gently.
  style-best-for: health, wellness, sleep, mindfulness, lifestyle, finance basics, app explainers
  style-poster: soft-gradient.jpg
  style-preview: soft-gradient.mp4
---
> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Soft gradient

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + CSS + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours; the vfrey skill's `scenes/craft.md` still holds. Start from `starter.html` next to this file (`npx vfrey styles start soft-gradient scenes/<idea>` creates the folder with it as `index.html`, whichever agent folder this skill was installed in) (mesh-gradient moods, a glass card with a glossy sun, a dial, a dock, beads, the glass caption plate; replace PLACEHOLDER text and the beat times, keep the structure); more code is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file. Use it for calm, reassuring subjects (health, wellness, sleep, mindfulness, lifestyle, beauty, money basics, apps and product explainers); not for loud, gritty, urgent or data-dense topics. Rounded forms are right here.

Script pace: do not trust a word budget. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser`; Kokoro af_heart with lineGap 0.3 speaks about 2.8 words a second (measured; the `series kit` Pace line has your voice's own figure).

## 1. The look in three sentences, and the signature traits

A calm, bright "glass UI" world: a mesh-gradient background that drifts and changes colour with the story, with frosted glass cards, pills and beads floating over it in gentle parallax. Glossy gradient icons sit on the glass, everything springs in softly and sways forever, and light film grain ties it together. Words sit on a near-white frosted caption plate above a glass dock.

Signature traits:
1. Mesh-gradient field (5 to 6 radial blobs of 900 to 1250 px) that slowly drifts, never a lone linear gradient.
2. Mood changes (dawn, day, dusk, night) as 1.8 to 2.4 s cross-fades.
3. Frosted glass: translucent white fill, 26 px backdrop blur, 2 px light border, inner top highlight, long soft shadow.
4. Crisp bokeh discs behind the glass (so the frosting has something to blur).
5. Glossy icons: radial body lit top-left, rim stroke, white highlight ellipse.
6. Large radii: 64 px cards, full-round beads and pills.
7. Spring entrances (elastic), sway forever (y plus or minus 12, rotationY plus or minus 5).
8. A glass dock pill at y 1655 with 4 mood icons and a sliding highlight.
9. Glass beads drifting at the edges down to the bottom.
10. Grain overlay (soft-light, 13%) and a faint vignette.
11. Near-white glass caption plate, deep indigo words, the spoken word in an indigo pill.
12. Parallax only: no camera zoom.

## 2. Palette

| Role | Hex |
|---|---|
| Dawn | `#ffe3cf -> #ffc4a8 -> #ffb3b3`, blobs `#ff9a76 #ffd67a #ffb5d6 #fff0dc #c7a6ff` |
| Day | `#d6ecff -> #a3d0ff -> #b9c4ff`, blobs `#63adff #a8f1ff #ffffff #b4bcff #ffe9b8` |
| Dusk | `#4a3596 -> #a45aa8 -> #ff9d7c`, blobs `#6c46cf #3a2c93 #ff7ea6 #c063c9 #ffb46b` |
| Night | `#15123c -> #2b2270 -> #5a3a9e`, blobs `#6a4be0 #2b49b8 #b266d9 #ff8fb0 #2a1f7a` |
| Ink (text, line icons) | indigo `#2a2060`, `#3a2c93`; muted `#4a3f8a` |
| Accents | warm `#ffab3d`, cool `#6a56dc`, caption highlight `#4a36c8` |
| Glass | white at 12 to 46% (card), 66 to 90% (pill, plate) |
| Sun body | `#fffdf0 #ffdc66 #ffa63a #f58a2a` |

Pick 3 to 5 moods that match the story beats. Ratios: glass at most 55% of the frame; one accent colour per scene; warm and cool never at equal strength in one mood. Never use: pure black, pure white fills (use white at 20 to 90% alpha), neon, hard shadows, flat grey, saturated red.

## 3. Shapes and line

- Glass card CSS (exact):
```css
.glass{border-radius:64px;background:linear-gradient(145deg,rgba(255,255,255,.46),rgba(255,255,255,.20) 46%,rgba(255,255,255,.12));
 backdrop-filter:blur(26px) saturate(1.5);border:2px solid rgba(255,255,255,.62);
 box-shadow:0 36px 80px rgba(46,30,110,.22),0 6px 18px rgba(46,30,110,.10),inset 0 2.5px 0 rgba(255,255,255,.85)}
.glass::after{content:"";position:absolute;left:5%;right:5%;top:2.5%;height:34%;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.34),transparent)}
```
- Radii: card 64, caption plate 48, pill 38, dock 68, beads and orbs 50%. Borders 2 px white at 62 to 95%. Dial ring stroke band 48 px.
- Light comes from the top-left: gradients are lit `cx 36% cy 30%`; shadows fall down (`0 36px 80px`), purple-tinted `rgba(46,30,110,.22)`, never black.
- Grain: SVG feTurbulence tile as a data URI (`baseFrequency .85`, 2 octaves, 360 px), `mix-blend-mode: soft-light; opacity .13`; vignette `radial-gradient(ellipse at 50% 42%, rgba(255,255,255,.07), transparent 45%, rgba(30,20,80,.16))`.
- Blob recipe: `radial-gradient(closest-side, c f2 0%, c b0 34%, c 40 68%, c 00 100%)`, 900 to 1250 px, drift amplitude 130 to 220 px on `sine.inOut` yoyo over 5.5 to 10 s.

## 4. Characters and objects

Characters are rounded rectangles and circles with the same gradients as the icons (no faces needed; if a face, two dots and a smile at 8% of the head). Glossy recipe (SVG): radial body (near-white to bright mid to deeper rim), a second bottom radial at 40% alpha for volume, a 3 px white 55% rim stroke, a white-to-transparent elliptical highlight top-left. Stock objects (see `starter.html` and `helpers.md`):
1. Sun orb with 12 rays (the starter's `sunBody` and `sunRays`).
2. Moon (clipped shadow circle plus craters).
3. Cloud (stacked circles, white gradient).
4. Dial: glass disc, ring masked to an annulus with `--p` conic reveal, glass hub with counter, knob with a glow.
5. Eye, brain, lamp (line icons in indigo with a gradient fill).
6. Frosted pill tag, 76 px tall, 40 px 650 weight.
7. Meter: inset track with a gradient fill that scales in.
8. Curve card: glass panel, white path drawn with `stroke-dashoffset`, dotted ghost curve.
9. Dock: glass pill, 4 icons 80 px, sliding white segment.
10. Bead: glass circle 300 to 340 px at the edge.

## 5. Typography

Google Sans Flex only (no monospace, no serif), weights 600 to 750, sentence case, tracking -.02 to .01 em.

| Role | px | weight | colour |
|---|---|---|---|
| Big number | 150 | 750 | `#2a2060` |
| Headline in card | 46 to 56 | 700 | `#2a2060` |
| Pill / label | 40 | 650 | `#2a2060` |
| Unit / sub | 44 | 600 | `#4a3f8a` |
| Caption | 66 | 700 | `#221a52`, spoken word white on `#4a36c8` |

Caption plate: `vfrey.captions("#captions", { style: "box", size: 66, color: "#221a52", highlight: "#4a36c8", highlightText: "#ffffff", maxWords: 4 })`, plate on `.vf-grp.on::before` (`rgba(255,255,255,.90)` to `.76`, blur 30, radius 48, padding 24/30/28), at `top: var(--vf-caption-at)`, same place all film, at most 2 lines. Faint pastel text on pastel is unreadable: ink is always `#2a2060` or darker.

## 6. Composition

- Art in the top 62%: hero card 700 to 1000 px wide at y 250 to 1100; the caption plate at `--vf-caption-at`; the dock at y 1655; 2 to 3 large glass beads at the edges run to the bottom edge so no area is empty; keep the bottom-right corner clear for `AI-GENERATED`.
- Grid: centre column, hero at x 540; secondary widgets on a thirds diagonal (upper left sun or moon, lower right card).
- Subject scale: hero card 40 to 55% of frame height; icon orb 20% of height.
- Layers: background (z 0, isolated), bokeh (1), stage (2), foreground dock and beads (3), soft vignette and grain (59, 60), captions (50).
- Depth: bokeh drifts opposite the stage (plus or minus 18 px versus 9 px).

Shot types:
```
A Hero card        B Dial / diagram     C Pair of cards       D Curve panel         E Door / scene
[ glow, sun    ]   [ small sun  ]       [ eye card  ]         [ glass panel     ]   [ arch door   ]
[ [ glass card ]]  [  (  dial  ) ]      [ brain card]         [  ~ white curve  ]   [ figure+light ]
[  headline    ]   [  ring+hub  ]       [  pill tags ]        [  tags            ]  [ sun orb      ]
[ plate ]          [ plate ]            [ plate ]             [ plate ]             [ plate ]
[ dock ]           [ dock ]             [ dock ]              [ dock ]              [ dock ]
```
F Mood change: only the background cross-fades while a widget exits down and the next springs up.

## 7. Motion

Smooth and springy; parallax only, no camera zoom.
- Entrances: `elastic.out(1,0.9)`, scale .84 to 1, y +70 to 0, rotationX 14 to 0 (`transformPerspective: 1500`), 1.25 s; children fade with a .05 s stagger over .6 s.
- Exits: `power2.in`, scale .9, y -60, 0.5 s (or y +220 for a card leaving down and back).
- Holds: a widget stays 2.5 to 6 s; the subject is on screen within 0.3 s of each sentence.
- Ambient everywhere: sway (`sine.inOut` yoyo, y plus or minus 12, rotationY plus or minus 5, rotation plus or minus .7, between 3.6 and 6 s), glows pulse, stars twinkle (1.1 to 2.7 s), bokeh drifts (4 to 8 s). Finite `repeat: Math.ceil(DUR / d)`, never `repeat: -1`.
- Sweeps: dial ring and hand with `power2.inOut`, 1.8 to 2.8 s; counters are functions of time; the dock segment `elastic.out(1,0.8)` 1.1 s.
- Time everything from `vfrey.timing.words` (`S(i)`, `WD(/regex/)`).
- Forbidden: camera zoom, hard cuts, linear easing on entrances, shake, blur-filtering moving groups (render crawls; use radial gradients for glow).

## 8. Transitions

1. Mood cross-fade: the next `.ph` layer fades in over 1.8 to 2.4 s (`tl.set(L,{zIndex:++z})` then `fromTo` opacity, `sine.inOut`), the old one is set to 0 after.
2. Widget swap: the old widget exits down and back while the next springs up.
3. Shared object: one object (a sun) shrinks into a corner and travels across scenes to link them.
Forbidden: wipes, slides, zooms, glitch, hard cuts.

## 9. Sound

Warm and slow: a detuned-sine pad (Fmaj9, Cmaj7, Am9, Dm9, 6 s a chord), a sparse glassy arpeggio, a high glint at every sentence start, a filtered-noise swell just before, and a chime at the end; about 60 BPM feel, major and dreamy. Mix `"volume": -14`, `"duck": false`; if `audio.voice-clear` warns, lower `volume`.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` needs only `python3` (standard library), is deterministic and takes about 20 s.
1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. From the project folder (there is no cue sheet; accents come from the sentence times): `python3 "$(npx vfrey styles path soft-gradient)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey soft gradient style)", "volume": -14, "duck": false}` and make it again with `--rerender`.
One pass instead: `--duration 60` with no `--timing`. No `python3` (`python3 --version` fails): leave `music` out, say the video has no music and why, install nothing unasked.

## 10. Shot plan template (30 to 40 s)

| Time | Beat | Shot and mood |
|---|---|---|
| 0 to 5 s | Hook: the reassuring promise | A hero card, dawn (or night for sleep) |
| 5 to 12 s | The key idea with an icon and a number | B dial, mood change to day |
| 12 to 20 s | How it works: two linked cards | C pair of cards; eye/brain-style icons |
| 20 to 28 s | The effect over time | D curve panel, dusk or night |
| 28 to 36 s | What to do, and the calm ending | E door/scene or A card; final mood, chime |
Each sentence gets one new widget or one change; dock icon follows the mood.

## 11. Reference frames

- `ref-1.jpg`: night hero card. Copy the frosted card on the dark violet mesh, the moon icon, the bokeh and the dock.
- `ref-2.jpg`: the dial. Copy the glass disc, conic ring, glass hub with the big number, the glowing knob and the corner sun.
- `ref-3.jpg`: the dusk curve panel. Copy the large glass panel, white curve with dotted ghost, the pill tags.
- `ref-4.jpg`: the closing dial at night/dawn. Copy the mood blend, the orb and the spring-lit hub.

## 12. Reference implementation

`starter.html` next to this file (about 9 to 12 s): dawn to day to night moods, glass hero card with a glossy sun and meter, dial with a counting hub and ring sweep, dock, beads, bokeh, grain, vignette and the glass caption plate. Start it with `npx vfrey styles start soft-gradient scenes/<idea>`, replace the PLACEHOLDER text, the moods and the beat times (use `S(i)` and `WD(/re/)`), and check it with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`. Stacking needs `#bg{isolation:isolate;z-index:0}`, `#bokeh{z-index:1}`, `#stage{z-index:2}`, `#fore{z-index:3}`.

## 13. Do, don't, and the final checklist

Do:
1. Build backgrounds from radial blobs, always with grain and a faint vignette.
2. Tween opacity only on a widget's children, never on the widget (backdrop-filter dies under an ancestor with opacity or filter).
3. Put crisp bokeh discs behind glass.
4. Use the glossy recipe for every icon.
5. Spring things in; let everything sway.
6. Keep ink `#2a2060` or darker on pastel.
7. Keep art in the top 62% and fill below with the dock and beads down to the bottom edge.
8. Define `const` helpers before the first `phase()` call (TDZ errors leave a bare gradient).
9. Use `tl.set` and `immediateRender: false`, never `tl.call`.
10. Time moods and widgets from the voice.
11. Captions sit on a plate: frosted near-white, same place all film.

Don't:
1. Use pure black or pure white fills.
2. Zoom the camera or cut.
3. Use `repeat: -1` or negative positions.
4. Blur-filter moving groups.
5. Put faint pastel text on pastel.
6. Leave an empty band at the bottom.
7. Use a lone linear gradient background (it bands).
8. Mix more than one accent per scene.
9. Make hard-edged, black or saturated shadows.
10. Use serif or monospace type.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- Mesh-gradient background in every tile, moods changing through the film.
- Frosted glass visibly blurs bokeh behind it (no clear glass).
- Icons glossy with a highlight; no flat fills.
- Radii large; no square corners anywhere.
- Dock at the bottom with the mood icon active; beads reach the bottom edge.
- Caption plate frosted near-white with an indigo pill on the spoken word.
- Ink readable (indigo on pastel).
- Grain and vignette present; AI label corner clear.
- Pitfall: the whole stage vanishing after a mood change means the stacking order is wrong.
- Numbers shown on screen match what the voice says (read each number on the contact sheet against the script).
