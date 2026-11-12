---
name: vfrey-style-vintage-newspaper
description: "Use when the chosen video style is Vintage newspaper (vfrey-style-vintage-newspaper), or the person asks for an old newspaper, letterpress, engraving, broadsheet, 'extra edition' or 19th-century print look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: a yellowed front page with stamped-in headlines, line-hatch engravings that move inside their frames, one spot red, page turns, a printed caption strip, full-frame layout around the caption band and a generated waltz bed."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Vintage newspaper
  style-summary: A yellowed old newspaper page where headlines are stamped in and the engraved pictures come alive, story by story.
  style-best-for: strange-but-true history, true crime, science and discovery, news explainers, on-this-day stories
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Vintage newspaper

This is an art-direction bible for one look. Start every scene from `starter.html` next to this file (section 12): copy it to `scenes/<idea>/index.html`, replace the masthead name, the PLACEHOLDER headlines and decks and redraw the engravings; keep the page engine (patterns, filters, page builder, press reveal, three transitions, caption strip). The script, voice and facts are yours; the rules below are topic-free but exact. The vfrey skill's `scenes/craft.md` still holds for everything not said here. `helpers.md` next to this file holds the full toolkit and `make-bed.py` is the sound script.

## 1. The look in three sentences

A 19th-century broadsheet front page, full bleed in 9:16: a condensed Victorian masthead, press-stamped headlines in capitals with one word in spot red, and an engraving drawn only with line hatching that stays alive inside its frame. Each story beat is one page of the same yellowed paper; pages turn, stack or get flooded with ink to change story. One red is printed slightly out of register, and the caption is a printed strip: it should look like old newsprint that someone set in motion.

Signature traits (each checkable on a frame):
1. Aged paper `#e9dbb0` with a brown vignette, a vertical and a horizontal fold crease, speckle and fibres.
2. Playfair Display 900 capitals for masthead and headlines, squeezed to `scaleX(.82)` to read as a condensed face.
3. Exactly one spot colour (red `#c63a22`), printed with a 5 to 6 px offset from the ink.
4. A double-ruled engraving frame, 960 px wide (outer 6 px rule, inner 2 px rule, 9 px apart).
5. Engravings made only of hatch patterns, halftone dots and solid ink with a thin paper rim: no outlines-only art, no greys, no gradients except as masks.
6. A masthead (front page, 206 px) with a dateline and "ONE CENT" ears, or a slim running header on other pages.
7. Greeked body text in three columns with column rules, a drop-cap block, to the bottom edge.
8. A printed-strip caption plate (cream, 5 px ink border, inner double rule, hard offset shadow) with a red "WIRE NEWS" tab.
9. Every headline word lands like a type slug: scale 1.3 to 1, blur 5 to 0 px, a thump of the page.
10. Ink-rough edges on headlines (`roughK` displacement 4.5) and stamps (`rough` 3).
11. Page changes by page turn, sheet stack or ink flood; never a fade.
12. Always-on motion inside the frame (rotating corona, twinkling stars, sparks, flares).

## 2. Palette

| Role | Hex | Use |
|---|---|---|
| paper | `#e9dbb0` (radial `#efe2b8` to `#dcc994`) | page ground |
| plate | `#f1e5bd` | caption strip, labels, stamp backing |
| ink | `#21170f` | all type, hatching, rules (never pure black) |
| spot red | `#c63a22` | one word per headline, halftone glows, stamps, tab |
| dark ground | `#1b120a` | ink-flood layer, dark engraving grounds |
| paper light | `#f6ecc8` | lamp and sun glow stops |

Ratios per frame: paper tones 55 to 65%, ink 25 to 35%, red at most 8%. The red is the only colour: halftone dots and one headline word, one tab, one stamp. Dark grounds in an engraving are ink; light marks on them are paper colour. Never use blue, green, grey `#888`, a second spot colour, photographs, or pure white/black. Overlay: `#paperfx` (SVG speckle + fibre + blotch turbulence, `mix-blend-mode: multiply`, opacity .7) and `#yellow` (vertical and horizontal crease lines `rgba(70,40,5,.16)` / `.12`, plus a radial brown vignette to `rgba(140,80,15,.42)`) above everything but the caption plate.

## 3. Shapes and line

- Rules: page edge rules 7 px with a 2.5 px companion; engraving frame outer 6 px, inner 2 px, 9 px apart; running-header rules 7 and 2.5 px; column rules 2 px; hairlines 1.6 px.
- Hatch patterns (define once in a hidden svg): `hA/hB/hC` horizontal bars 2.6 / 1.6 / 0.9 px every 5 px, `vA/vC` vertical, `dA/dB/dC` diagonals at +45 and -45 degrees (bars 1.9 / 1.9 / 1.2 px every 6 to 8 px), red halftone dots `dotL/dotM/dotS` (r 3.9 / 2.5 / 1.3 px on a 12 / 9 / 7 px pitch, rotated 30), ink dots `dotK` (r 2.1 on 9 px, rotated 15).
- Tone masks (objectBoundingBox gradients white to black): `mTop`, `mBot`, `mMid`, `mRad` (dense at the edges), `mRadI` (dense at the centre).

```js
const hatch = (pat, x, y, w, h, mask, extra) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${pat})"${mask ? ` mask="url(#${mask})"` : ""}${extra || ""}/>`;
s += hatch("hA", 0, 0, 960, 620, "mRad") + hatch("hC", 0, 0, 960, 620, "mTop");   // an engraved night sky
```

- Corners: square. Solid forms (rooftops, silhouettes, jars) are ink with a 1.4 to 2.6 px paper rim stroke; mid tones are diagonal hatch (`dA`, cross-hatched with `dB`); light faces are paper with `hB` along one side.
- Light direction: from the upper left; shadow hatch on the lower right of every form; suns and lamps are a paper disc with 100+ radial hairlines (.9 px, opacity .65), a 4 px outline and a corona of 56 radial lines (2 to 3.4 px).
- Edge treatment: headlines through `roughK` (turbulence `.05`, 3 octaves, displacement scale 4.5, blur .55), decks and stamps through `rough` (`.04`, 2 octaves, scale 3); static filters on small areas only.
- Misregistration: the red element is `mix-blend-mode: multiply` and the ink copy is offset 5 px: `text-shadow: 6px 5px 0 rgba(198,58,34,.45)` on headline words. Never duplicate a text node for this (text-overlap check).
- Greeked text: one path per column of justified blocks (`M x y h w v6.2 h-w z`), ink at .82, row pitch 15.5 px.

## 4. Characters and objects

Everything in an engraving is built from solids, hatch and halftone, in a local 960 x H space: an object is a silhouette in ink or paper with a rim, shaded with two hatch patterns on its shadow side and one red halftone dot cluster at most. Figures are bust-style (oval head r 112 x 150, hair as an ink cap, two dot eyes, a single line mouth, a red halftone cheek, an ink coat with a paper collar); hands are never drawn; crowds are rows of ink heads. Proportion: head one fifth of figure height. Detail count is low: a form is read by its silhouette at phone size.

```js
function spark(cx, cy, r, cls) {      // starburst: red halftone disc, paper core, 12 ink/red lines
  /* see helpers.md */ }
s += spark(500, 292, 70, "spk0");     // animated later: scale 0 to 1 (back.out), then yoyo 1 to .35
```

Stock engravings in `starter.html`: a sun/lamp with corona over layered rooftops (`city`), a portrait bust in an oval, a jar on a shelf with a spot-red label, plus helpers `star4` (twinkling star), `spark`, `zig` (electric arc), `palm`, `greek`, `frameRect`. Add in the same grammar: a telegraph pole with wires, a ship, a map with a dotted route, a telescope, a steam train, a crowd of heads, a document with a seal.

## 5. Typography

- Font: Playfair Display only (shipped); local fallback `Georgia, "Times New Roman", serif`. Mono and sans are not used.
- Masthead: 900, 206 px, `scaleX(.8)`, letter-spacing -2 px, a fictional paper name (never a real paper), width at most 15 letters at that size; ears 17 to 22 px 700 caps.
- Dateline: 700, 24 px, letter-spacing .2em, caps ("VOL. XIV . NO. 217 . MONTH 1900"), obviously fictional issue numbers.
- Running header (non-front pages): 900, 50 px, letter-spacing .34em, between double rules (y 26 to 136).
- Headlines: 900 caps, two lines, `scaleX(.82)`, font-size per line (about 0.59 em per capital after the squeeze: 15 letters at 104 px, 9 at 150 px, 960 px wide), `line-height .96`, one word in red.
- Deck: italic 500, 34 px, ink, with a red 800 caps kicker "EXTRA" at 26 px, letter-spacing .16em.
- Labels and tags: 800, 25 px, letter-spacing .16em, caps.
- Caption plate: cream `#f1e5bd`, 972 x 222 px at left 54, top 1436; 5 px ink border; inner double rule `inset 0 0 0 9px #f1e5bd, inset 0 0 0 11px #21170f`; hard shadow `9px 11px 0 rgba(33,23,15,.38)`; tab "WIRE NEWS" (red `#c63a22`, text `#f6ead0`, 24 px 800, letter-spacing .22em, 3 px ink border, 4 px offset shadow) at left 34 top -31; italic tab "Extra" top right. Text: `vfrey.captions("#captions", { style: "color", font: '"Playfair Display"', size: 64, color: ink, highlight: red, maxWords: 4, maxChars: 24 })`, `#captions` at top 1462, height 170, weight 800, spoken word red with a faint red offset shadow `3px 2px 0 rgba(198,58,34,.28)`.

## 6. Composition

Captions sit on a plate (the printed strip), never over a subject; vfrey draws them in a band (`--vf-caption-at`) and the large engraving runs behind it.

- Page anatomy (1080 x 1920, identical on every page so captions never move): front page: masthead y 44 to 284, dateline y 284, headline from y 340, engraving y 690 to 1400. Other pages: running header y 26 to 136, headline from y 150 (two lines of 104 to 150 px), engraving y 520 to 1400. Caption strip y 1436 to 1658. Greeked columns y 1688 to 1920.
- Safe area: art to the frame edge (no empty ground inside the frame); the AI label sits over the columns near y 1800, which is fine.
- Frame grid: 960 px frame centred (x 60 to 1020); three columns at x 40, 372, 706 (312 px each); headline centred.
- Subject scale: the engraving is 37 to 46% of the frame height; its subject fills 50 to 70% of the frame width.
- Layers: paper and rules (back), engraving art (frame), headline and deck, caption strip, paper overlay and fold creases, flash.
- Depth cues: hatch density on far elements, overlapping rooftops, a page shadow `0 -40px 70px rgba(30,15,0,.55)` between stacked sheets.

Shot types:

```
FRONT PAGE              STORY PAGE              STAMP PAGE
 THE GAZETTE             == header ==            == header ==
 dateline                BIG WORDS               BIG WORDS
 BIG WORDS (red)         deck                    deck
 +--engraving--+         +---engraving---+       +--engraving--+
 [ caption strip ]       [ caption strip ]       |  STAMP  -7deg|
 ||| ||| ||| cols        ||| ||| ||| cols        [ caption strip ]
```

```
PORTRAIT                INK FLOOD (mid)         MAP / DIAGRAM
 header, headline        red then black          engraving with dotted
 +--( bust oval )--+     bands rise over page    route, two label boxes
```

## 7. Motion

- Feel: smooth 30 fps; every headline word lands as a discrete slug; idle loops are slow and sine-eased.
- Easing: headline word `power3.in` 0.2 s; frame reveal `power2.inOut`; stamp `power4.in`; thump `elastic.out(1, .35)`; sparks `back.out(2)`; idle `sine.inOut`.
- Durations: headline words 0.22 s apart (0.2 to 0.22 gap), red offset shadow easing in over 0.35 s, deck in 0.5 s, engraving reveal as a press wipe `clip-path: inset(0 0 100% 0)` to `0%` in 0.6 to 0.7 s; stamp slam 0.22 s from scale 2 / rotation -14 to rotation -7 with a thump of 14 px and a screen-blend flash at .45; flash 0.06 s up and back.
- Holds: start the headline and the frame reveal with the transition, not after it; a page is never empty.
- Camera (`.cam`, slow): front page starts at scale 1.14 on the masthead and pulls out over 3.6 s; other pages alternate pull-out (1.16 to 1.0), push-in (1.0 to 1.12 with y -50) and a drift (x 56 to -56 at scale 1.1); `.thump` moves only in y: 5 to 22 px in 0.06 s then elastic.
- Secondary and ambient: corona rotation (one turn in 36 to 50 s), prominence `stroke-dashoffset` 420 to 0, sparks scale to 1 then yoyo to .35 while rotating, star twinkles (opacity 1 to .25), electric arcs toggled at 12 fps, props sway; `#yellow` breathing between .92 and 1.
- Forbidden: both camera and thump on one element, infinite repeats (use `repeat: ceil(D / dur) + 1`), animating big filtered areas, fades between pages, motion that outlasts the page.

## 8. Transitions

Three, each used where it fits, each starting 0.8 s before the next line (end of the transition = start of the line):

```js
// page turn: outgoing page swings on its left edge (stage has perspective: 2600px)
tl.fromTo(P[a], { rotationY: 0 }, { rotationY: -118, duration: .85, ease: "power2.in", transformOrigin: "0% 50%" }, t0);
tl.fromTo("#sh" + a, { opacity: 0 }, { opacity: .8, duration: .85 }, t0);       // dark shade
tl.fromTo(P[b], { scale: 1.05 }, { scale: 1, duration: .85, ease: "power2.out" }, t0);
```

- Sheet stack (0.8 s): the next page enters `yPercent 102` to 0 with `rotation 2.6` to 0 (origin 50% 100%, `power3.out`); the old page scales to .955 and darkens.
- Ink flood (1.0 s): two 3840 px tall ragged-edged layers (red leads, black 0.14 s behind) rise `y 0` to -5760 with `power2.inOut`; swap pages at 0.5 s; reset the layers after.

Forbidden: cross-fade, zoom, any wipe that is not ink, a transition over 1.1 s.

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes the bed: an A-minor waltz at 84 bpm (plucked piano bass on beat 1, chord on beats 2 and 3, a music-box bell melody from bar 3) plus accents synced to the scene: a low thump and noise tick per headline word, band-limited noise whooshes for page turns and slides, a low rumble for the ink flood, 2.3 kHz 12 ms clicks in Morse-like patterns for telegraph or typing shots, crackle bursts for sparks, a falling-pitch zap and a 48 Hz boom at a flash, shimmering glissandi for a glow, thump and noise at each stamp. Mix: `volume -12`, `duck: true` (vfrey masters to about -14 LUFS). Standard library only, always the same file for the same input, about 10 s to run.

1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (the format is at the top of `make-bed.py`), then from the project folder: `python3 .agents/skills/vfrey-style-vintage-newspaper/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey vintage newspaper style)", "volume": -12, "duck": true}` and make it again with `--rerender`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render. No `python3` on the machine: leave `music` out, say the video has no music and why, and do not install anything unasked.

## 10. Shot plan template (38 to 40 s, 7 lines)

Pace: set `lineGap` in the script (0.25 to 0.4, `voice.md`) and do not merge lines to hide the pause: keep the page moving. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window (Kokoro af_fenrir suits news; af_heart with lineGap 0.3 is about 3 words a second).

| Beat | Time | Shot type | Content | Transition into it |
|---|---|---|---|---|
| Hook | 0 to 6 s | front page | masthead stamp, headline, hero engraving, first spark | none |
| Beat 1 | 6 s to 12 s | portrait | the person or the first fact, dateline, source | page turn |
| Beat 2 | 12 to 19 s | story page | the event, arcs and sparks | sheet stack |
| Beat 3 | 19 to 26 s | story page / map | the surprise, a route or a diagram | ink flood |
| Beat 4 | 26 to 32 s | story page | the spread or consequence, wide engraving | page turn |
| Payoff | 32 to 40 s | stamp page | the open question, a sourced figure, a red stamp ("EXPERT CONCERN - NOT A PREDICTION" style) | sheet stack |

## 11. Reference frames

Four frames of the showcase film, 540 x 960, in this folder (not copied into installed projects):
- `ref-1.jpg`: the front page with masthead and red headline word; copy the masthead scale and the page anatomy.
- `ref-2.jpg`: a story page with the engraving and the caption strip; copy the hatching density and the strip.
- `ref-3.jpg`: a map engraving with a red dotted route and label boxes; copy the halftone red and the tag style.
- `ref-4.jpg`: the closing page with a sourced figure label; copy the mixed red and ink and the label plate.

## 12. Reference implementation

`starter.html` is a working three-page film (front page with sun and rooftops, portrait page, object page with a stamp) with the whole engine: patterns, filters, `hatch`, `greek`, `city`, `spark`, `star4`, page builder, press headlines, `turn` and `slide` and `flood`, cameras and thump, paper overlay, caption strip. Start from it: `cp .agents/skills/vfrey-style-vintage-newspaper/starter.html scenes/<idea>/index.html`, replace the masthead name and each PLACEHOLDER, redraw `ART[n]` per beat, edit `PAGES`. Keep `data-composition-id="main" data-start="0"` on `#root`. Check a frame with `npx vfrey render --scene scenes/<idea> --engine vfrey-render --script scripts/<idea>.json --frame 3 out.png`.

## 13. Do / Don't, and the final checklist

Do:
1. Do draw every engraving with hatch patterns, halftone and solid ink only.
2. Do use exactly one spot colour, offset 5 px from the ink.
3. Do squeeze headlines to `scaleX(.82)` and fit by font size per line.
4. Do keep the caption strip, masthead zone and columns at the same positions on every page.
5. Do reveal headline and frame as the transition starts.
6. Do put an outer static `<g transform>` and an inner animated `<g>` with `svgOrigin: "0 0"` on every moving group.
7. Do use finite repeats: `Math.ceil(D / dur) + 1`.
8. Do keep a fictional masthead name and obviously fictional issue numbers.
9. Do source every on-screen fact, and mark a speculation with a stamp.
10. Do thump the page on every second headline word and on each stamp.

Don't:
1. Don't use any colour besides ink, paper tones and the one red.
2. Don't use a real newspaper's name, logo or layout.
3. Don't duplicate a text node for the offset print (use `text-shadow` or `drop-shadow`).
4. Don't filter big animated areas; filter headlines and stamps only.
5. Don't put both camera and thump on one element.
6. Don't leave a page empty for a beat.
7. Don't cross-fade between pages.
8. Don't draw a prop across the subject: keep props beside it.
9. Don't use fine comb-like lines for sky effects: thin (2.2 to 3.6 px), 150+ lines, smooth lengths.
10. Don't put art or stamps over the caption strip.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`):
- Paper: yellowed, vignetted, creased, speckled?
- Masthead / header: fictional name, dateline, ears, or a slim header?
- Headline: Victorian capitals, squeezed, one red word with an offset?
- Engraving: only hatch, halftone and ink, in a double-ruled frame?
- Red: the only colour, under 8% of the frame?
- Caption strip: cream plate with a red tab at the same place on every page?
- Columns: greeked text to the bottom edge?
- Motion: something alive inside every engraving (corona, sparks, stars)?
- Transitions: page turn, sheet stack or ink flood, nothing else?
- Facts: every label sourced, speculation stamped?
- Numbers: every number on screen matches the number the voice says (digits, units, rounding), read against the script?

## Pitfalls

- `data-composition-id="main" data-start="0"` must be on `#root` or vfrey says there is nothing to render.
- `svgOrigin` is in the parent's coordinate space: put position on an outer `<g transform>`; `transformOrigin` on SVG groups uses the bbox.
- Start the headline and frame reveal with the transition, not the line, or a page shows empty.
- Full-frame grain makes the raw render about 24 Mbps (vfrey warns `frames.bitrate`): keep `#paperfx` at opacity .7 or lower.
- Two identical text nodes trigger `frames.text-overlap`.
- A tween's `onUpdate` does not run when the renderer seeks: use `tl.set` per frame or `vfrey.onFrame` for attribute-driven art.
