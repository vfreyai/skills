---
name: vfrey-style-noir
description: "Use when the chosen video style is Silhouette noir (vfrey-style-noir), or the person asks for a noir, dark, moody, eerie, cinematic, silhouette, foggy, 'true crime' or 'unsolved mystery' look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: near-black layered silhouettes, one amber light, beams, fog, rain and grain, typed evidence lines, full-frame layout around the caption band and a generated atmosphere bed."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Silhouette noir
  style-summary: Dark, foggy scenes of black shapes lit by one warm light, like the opening of a mystery film.
  style-best-for: mystery, true crime, eerie history, unsolved cases, suspense stories
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Silhouette noir

Near-black layered SVG silhouettes against a cold blue-teal night, lit by exactly one warm amber source: a lamp, a lantern, a window of light. Fog, rain, dust, film grain and a faint flicker sit over every shot, a slow camera creeps in, and the words arrive as typewriter evidence lines and big cream serif subtitles with the spoken word in amber. If a frame has a second accent colour, a flat well-lit scene, a visible face, or a pure black void, it is not this style.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + inline SVG + a canvas + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. **Start from `starter.html` next to this file** (copy it to `scenes/<idea>/index.html`, then replace the PLACEHOLDER silhouettes and evidence text: it already renders three shots with `vfrey render --frame`). Code to copy is also in `helpers.md` next to this file; the music script is `make-bed.py` next to this file. Four reference frames, `ref-1.jpg` to `ref-4.jpg`, live in the package copy of this style (section 11); they are not installed into projects.

## When to use it, when not

- Use it for mysteries, unsolved cases, eerie true stories, disappearances, "what really happened", slow-burn thrillers: anything that is told in shadows and silhouettes.
- Not for upbeat or comic subjects, for anything that needs bright detail, charts or products, and not for stories that would have to invent folk-legend details: typed evidence and subtitles carry only facts you can source (dates, coordinates, names).

## Plan before coding

1. Write 6 or 7 lines for 40 s (one or two sentences each; the music bed fills the gaps between lines). Cue shots at line starts minus 0.1 s and story events at spoken words found by text.
2. One shot per beat, each with one clear focal light (lamp, lantern, moon break behind a silhouette, lit ship windows, a window shaft). Decide where the evidence lines and the one tally or underline go.
3. Pace the script for the voice. Kokoro's default pause is about a second; set `lineGap` in the script (0.25 to 0.4 is brisk, `voice.md` in the vfrey skill) and do not merge lines to avoid the pause. Do not trust a word budget: sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; typical Kokoro af_heart with lineGap 0.3 is about 3 words a second. A gritty free voice such as am_fenrir suits this style.

## 1. The look in three sentences, and the signature traits

A cold, foggy, rain-streaked night in which everything that is not light is a silhouette. One warm lamp is the only colour, its beam and glow cutting through blue-grey haze. The camera moves slowly toward the thing the story looks at, and absence is drawn as an amber dashed outline of what is missing.

Signature traits (each checkable on one frame):
1. Silhouettes are near-black (`#020406` to `#04080b`), flat, with no interior detail and no faces.
2. One accent only: lantern amber `#ffb347` on the light source, evidence text, the spoken word and one underline.
3. The sky and sea are cold blue-teal gradients lifted off black (`#03070b` to `#34505d`, `#1d3a47` to `#03080b`).
4. A radial moon or glow sits behind a dark silhouette so its outline pops.
5. Fog bands (screen blend) drift across the lower half; blurred cloud ellipses fill the sky.
6. Rain streaks and dust motes drift on a canvas above the art, density set per shot.
7. Film grain (overlay, 8.5%) jumps 12 times a second; a faint flicker dips the frame 24 times a second.
8. A long thin beam of amber light (three blurred layers) swings or points; amber glints reflect under it.
9. Evidence captions are typed in amber mono on a dark plate at the top, with a blinking block cursor.
10. Subtitles are large Playfair Display, cream with the spoken word amber, black stroke, on a soft dark shade.
11. The lower third is filled with sea, floor, fog and reflections, never an empty black bar.
12. Absence is an amber dashed outline of the missing thing.

## 2. Palette

| Role | Hex | Use | Ratio of frame |
| --- | --- | --- | --- |
| ground black | `#010204`, `#02050a`, `#07111a` | far dark, sky top | 30 to 50% |
| silhouette | `#020406` to `#04080b` | rocks, towers, figures, furniture | 15 to 40% |
| horizon and sea lifts | `#1c2f39`, `#34505d`, `#1d3a47`, `#12303c` | sky bottom, sea top, the `#lift` layer | 15 to 30% |
| cold neutrals | `#5b7782`, `#9fb8c2`, `#cfe0e6` | fog, moon, rim light, window light (not accents) | 3 to 12% |
| accent amber | `#ffb347` (glow `#ffd08a`, shadow `#a24a08`) | the light source, evidence text, spoken word, one underline | at most 6% |
| text | `#f4efe3` cream | subtitles | under 4% |

Never use a second hue, pure `#000` fills across big areas (it bands: use near-black gradients), a bright flat sky, saturated red, or an accent that is not light or text. Lift the blacks (a `#lift` screen layer at 13% and a vignette at .8 at the edges): pure black reads as murk on a phone.

## 3. Shapes and line

- Silhouettes are filled paths with no stroke and no outline. Rocks and ruins are seeded jagged polygons (`rock(cx, by, w, h, seed)`); towers are trapezoids with a gallery rectangle and a cone roof; a figure is a head circle, a hat, a coat path with two leg notches (`person(x, y, h)`); a ship is a hull wedge, a bridge box and lit window dots.
- Edges: soft where blurred (`b3`, `b8`, `b22` Gaussian filters at 3, 8 and 22 px), hard where black meets light. Water crests carry a 2 px pale blurred rim line at 25 to 50% opacity.
- Texture recipes: grain is a 256 px seeded noise tile as an overlay div (`mix-blend-mode: overlay`, opacity 0.085, translated to a new offset 12 times a second); rain is 320 seeded streaks (length 22 px at canvas scale, alpha .16 to .38) on a 540 x 960 canvas scaled by CSS with `mix-blend-mode: screen`; dust is 110 seeded dots, a quarter of them amber.
- Light and shadow: light is the amber source; its glow is a radial gradient (`#ffd08a` .95 to `#ff8a1f` 0). Rim light on silhouettes is cold (`#9fb8c2`). Beams are one long thin triangle (apex width 4, end width 60 to 140, 1200 to 1500 long) with a four-stop gradient to 0, stacked three times (b22 halo at 70%, b8 body at 85%, b3 core), never a thick cone (it reads as a megaphone).
- Fog is a radial-gradient ellipse (`#5b7782` .55 to 0) in screen blend.

## 4. Characters and objects

Characters are anonymous silhouettes: no faces, no hands, no detail. A standing figure is 300 to 330 units tall in the shot, head about one eighth of the height, a brimmed hat, a long coat that flares at the hem, two leg notches. Groups stand at slightly different heights and spacing (a row of three at x 300, 450, 610, heights 300, 330, 310). Objects are as flat: a tower with a lit lamp room, a rock, a ship with a few warm windows, a bed, a table, a chair, a doorway.

```js
// a standing figure, feet at (x, y)
const w = h * .115, r = h * .062;
`<circle cx="${x}" cy="${y - h + r}" r="${r}" fill="#020406"/>
 <path d="M ${x - w} ${y - h * .84} Q ${x} ${y - h * .9} ${x + w} ${y - h * .84} L ${x + w * 1.2} ${y - h * .3} L ${x + w * .9} ${y} L ${x + w * .12} ${y} L ${x + w * .06} ${y - h * .3} L ${x - w * .06} ${y - h * .3} L ${x - w * .12} ${y} L ${x - w * .9} ${y} L ${x - w * 1.2} ${y - h * .3} Z" fill="#020406"/>`
```

Stock objects: 1. lighthouse on a rock with a lit lamp; 2. figure in coat and hat; 3. ship with lit windows; 4. room with a window of cold light and a shaft; 5. bed and furniture silhouettes; 6. empty coat hooks drawn as an amber dashed outline (absence); 7. a slate or notebook page with scrawled amber lines; 8. a doorway; 9. a cliff edge with a path; 10. a table with a lantern.

## 5. Typography

| Role | Font | Size (px at 1080 wide) | Colour |
| --- | --- | --- | --- |
| subtitles | Playfair Display 700 (fallback Georgia, serif) | 80, max 4 words, 22 characters | cream `#f4efe3`, spoken word `#ffb347`, black stroke, soft shade behind |
| evidence lines | JetBrains Mono 500 (fallback monospace) | 44 (`vmin * .041`), line height 1.28 | first line cream `#f1ece0`, others amber `#ffb347`, on a 62% black plate with a left amber bar |
| tags | JetBrains Mono 500 | 30 to 36 | amber |

Sentence case in subtitles, upper case in evidence lines (about 28 characters per line at most), tracking 0 (mono 0.02em). Evidence is typed at 0.034 s per character with a blinking block cursor, held 1 to 2 s, then faded out in 0.25 s. Caption block: `top: var(--vf-caption-at)` low in the frame (about y 1440, height 250), a soft radial black shade behind it (`#capshade`, 72% to 0), the script's `captions.style` set to `"color"` as well (the script overrides the scene).

## 6. Composition

- Safe area: evidence lines at the top left under the top 10% (about y 205), the subtitle block low (y about 1440 to 1690, above the AI label at y over 1800 and clear of the right rail).
- Frame grid: horizon on the lower third line (y about 1040 to 1100); the focal light on the upper third (y 500 to 800) or at the vertical centre of the hero zone; the silhouette hero centred or on a third line.
- Subject scale: the hero silhouette is large, 40 to 60% of the frame height (a tower 520 units on a 1920 frame); figures 300 to 330 units; a wide shot keeps the hero at 25%.
- Depth: sky, moon glow, cloud blur, far waves, hero silhouette, fog, glow, beam, near waves (darker, larger amplitude), near fog. Each layer darker and bigger toward the viewer.
- Captions always sit on a plate: the dark shade behind the subtitle block, never over the beam or the focal light. Fill the lower third to the bottom edge with sea, floor, fog and reflections so it is not an empty black bar.

Shot types:
```
WIDE LAMP              TOWER CLOSE            INTERIOR SHAFT         SHORE FIGURES          DETAIL / EVIDENCE
+------------+         +------------+         +------------+         +------------+         +------------+
|[ev typed]  |         |[ev typed]  |         |  [window]  |         |  moon      |         |  [page]    |
|  moon  .   |         |     (*)--->|         |   \\ shaft  |         |        (*) |         |  ~~~~~~~   |
|      (*)>> |         |     ||     |         | ..\\.. dust |         |  o o o  /\\ |         |  ~~~~~~~   |
|  rock/sea  |         |    /||\\    |         | bed  [ ]   |         | figures    |         |  amber     |
|~~fog glints|         |~~fog sea~~~|         |~~floor fog~|         |~~fog sea~~~|         |~~dark fog~~|
|[ subtitle ]|         |[ subtitle ]|         |[ subtitle ]|         |[ subtitle ]|         |[ subtitle ]|
+------------+         +------------+         +------------+         +------------+         +------------+
```

## 7. Motion

- Feel: slow and smooth, 30 fps, nothing snaps; everything idles.
- Camera: each shot gets one slow `scale` 1.04 to 1.1 growing to 1.22 to 1.6 with a small x/y drift, `power1.inOut`, over the whole shot, with `transform-origin` on the thing the story looks at; the base scale is above 1 so the drift never shows an edge (keep |x| below `origin% * (scale - 1) * width`).
- Ambient: waves scroll by exactly one period and bob (`sine.inOut`, 2.4 to 4 s), fog bands drift yoyo over 4 s, clouds drift linearly, glow breathes 0.7 to 1 opacity over 1.3 to 1.5 s, dust floats, beam swings -14 to +9 degrees over 4 s `sine.inOut`, the dashed outline pulses 1.1 s.
- Events land on spoken words found by text (`wordT(line, /^storms$/)`); shots cut at `line start - 0.15 s`. Entrances are slow fades of light, not pops; the hook beat ends with the lamp flickering out on the last words of line 0; the final shot ends with the figures dissolving and the light going out.
- Lightning: a `#flash` div (screen blend) set to 0.5 to 0.9 and eased to 0 over 0.5 s, only where something violent is named.
- Forbidden: bouncy easing, fast cuts, shake, bright pops, anything that does not drift, text that appears all at once (evidence is typed).

```js
tl.fromTo(".bm1", { rotation: -14 }, { rotation: 9, svgOrigin: "0 0", duration: 4, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(D / 4) }, 0);
vfrey.onFrame(drawFx);   // rain, dust, grain and flicker are pure functions of tl.time(); a render seeks with events suppressed
```

## 8. Transitions

Three kinds only, each with a cause:
1. dip: a black overlay up in 0.2 s (`power2.in`), swap, down in 0.45 s: the default.
2. flash: lightning white (`#cfe4ec` at 0.9), swap on the peak, 0.5 s decay: where something violent is named.
3. fog wipe: a 170%-wide blurred radial blob crosses the frame (`xPercent 0 to 170`, 1.3 s, `power2.inOut`, starting 0.65 s before the cut, swap at its centre, then back off-screen).
Forbidden: slides, spins, zooms through, hard cuts without a cause, a wipe blob left on screen (always `set` it back and check the later frames).

## 9. Sound

Bed (ffmpeg filters only, no downloads): continuous wind (brown noise low-passed at 520 Hz with a slow tremolo), sea swell (pink noise low-passed at 800 Hz, tremolo 0.16 Hz depth 0.85), rain (white noise high-passed at 2.5 kHz at volume 0.10), a drone of sines at 55, 55.45 (beating), 82.4 and 110.3 Hz through a 260 Hz low-pass with tremolo 0.1 Hz. One-shots at story beats: a 46 Hz sine thump (fast attack, 1.5 s tail) plus a quiet 233 Hz tone with tremolo and `aecho` starting 0.4 s earlier (the sting) at each reveal; thunder as brown noise low-passed at 170 Hz with a 3 s swell at lightning flashes. Dark, cold, patient. Mix: `volume: -10`, `duck: true`; global `aecho=0.7:0.4:900:0.25`, `alimiter`, fade in 1.5 s and out 2.4 s.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file needs only `python3` (standard library, no downloads, ffmpeg for the filters) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` with the accents (the format is at the top of `make-bed.py`; times are words or lines, the same ones the scene uses), then from the project folder: `python3 .agents/skills/vfrey-style-noir/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey noir style)", "volume": -10, "duck": true}` and make it again with `--rerender`. vfrey ducks it under the voice, fades it and sets the loudness.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change, because the times move. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (30 to 40 s)

| Time | Beat | Shot type | Content |
| --- | --- | --- | --- |
| 0 to 4 s | hook | TOWER CLOSE or WIDE LAMP | the lamp in the dark, evidence line types the place and date, last words flicker the lamp |
| 4 to 12 s | setting | WIDE LAMP | the place in its fog and rain, a ship or a path, evidence with coordinates |
| 12 to 20 s | the night | INTERIOR SHAFT | the room, the window shaft, dust, the absence as an amber dashed outline |
| 20 to 27 s | the clue | DETAIL / EVIDENCE | a slate, a note or a door, typed amber evidence, a flash if something violent is named |
| 27 to 34 s | the search | SHORE FIGURES | silhouettes of the searchers, the lamp far away, fog wipe in |
| 34 to 40 s | the question | WIDE LAMP | the open question, the light going out as the last line ends |

## 11. Reference frames

Saved in this style's package folder (not installed into projects): look at them before drawing.
- `ref-1.jpg` the hook: copy the tower silhouette with its amber lamp room and glow, the long thin beam to the right, the blue-teal sky and the cream serif subtitle with an amber word.
- `ref-2.jpg` the setting: copy the steamer with a few lit windows on a dark sea, the low rock, the moon glow behind the mast, the rain and the typed amber evidence line at the top.
- `ref-3.jpg` the evidence: copy the slate with scrawled lines in a warm amber tint, the typed evidence block with its left amber bar and the dark plate behind the subtitle.
- `ref-4.jpg` the close: copy the figure silhouettes against the lit tower far away, the fog, the soft shade under the subtitle, and the empty-but-filled lower third.

## 12. Reference implementation

`starter.html` next to this file: the page shell (shots, grain, vignette, lift, flicker, flash, dip, wipe, caption shade, evidence block), the gradients and blur filters, three shots (a lamp on a rock with a swinging beam, a room with a window shaft and an amber dashed absence, three figures on a shore), waves, fog, glints, rain and dust on the canvas, the typewriter evidence lines, the dip and fog-wipe transitions, the slow cameras, and the serif subtitles. Replace the silhouettes, `INPUTS` evidence text and cue lines, keep the layers and atmosphere. It renders with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 4 out.png`.

## 13. Do, don't and the final checklist

Do:
1. Keep one amber accent on the light source, the evidence and the spoken word only.
2. Put a glow or moon behind every dark silhouette so its outline pops.
3. Lift the blacks (gradients, a `#lift` layer, a light vignette).
4. Stack the beam in three blurred layers from one long thin triangle.
5. Type evidence lines with a cursor and only facts you can source.
6. Fill the lower third with sea, floor, fog and glints.
7. Give every shot one slow camera move with a purposeful origin.
8. Draw rain, dust, grain and flicker as pure functions of time, repainted from `vfrey.onFrame`.
9. Set `captions.style` to `"color"` in both the scene and the script.
10. Check later frames after a wipe to be sure the blob left.

Don't:
1. Use a second accent colour or saturated red.
2. Fill big areas with pure `#000`.
3. Draw faces or interior detail on silhouettes.
4. Build the beam as a fat cone with a `scaleX` sweep.
5. Let camera drift exceed the edge margin.
6. Let grain exceed 0.09 opacity (the bitrate explodes).
7. Leave an empty black bar at the bottom.
8. Show typed text all at once.
9. Use folk-legend details or unverifiable claims.
10. Use bouncy easing, shakes or fast cuts.
11. Cover the focal light or the beam with captions.

Final checklist, run on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; an even sample can land inside a dip or wipe, so also check stills at the beat times with `--frame <t>`). One line per signature trait:
- Silhouettes near-black, flat, faceless.
- Amber is the only accent, and only on light, evidence and the spoken word.
- Sky and sea are lifted cold blue-teal gradients, not black.
- A moon or glow sits behind each dark silhouette.
- Fog bands visible in the lower half.
- Rain or dust visible in at least half the tiles.
- Grain and vignette present, faint.
- A thin amber beam or a window shaft is the focal light in every tile.
- Evidence lines are typed, amber mono, top left, with the left bar.
- Subtitles are large cream serif with an amber word on a soft shade.
- The lower third is filled with sea, floor, fog or glints.
- Absence is shown as an amber dashed outline where the script names something missing.

Pitfalls from real runs: a beam built from a thick polygon with a `scaleX` sweep reads as a megaphone, so use the long thin triangle and swing it with `rotation` and `svgOrigin`; camera drift with a `transform-origin` near an edge exposes a black strip when the drift exceeds the margin; a decorative wipe blob that does not travel far enough stays on screen for half the film; the script's `captions.style` beats the scene's options (it must be `"color"` or no highlight shows); a series voice beats the script voice; `tick` starts a dashboard unless it is disabled for the run; grain is the real cost for file size.
