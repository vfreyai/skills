---
name: vfrey-style-kinetic-type
description: "Use when the chosen video style is Kinetic type (vfrey-style-kinetic-type), or the person asks for a kinetic typography, title-sequence, words-fill-the-screen or lyric-video look. Teaches how to draw, compose, animate and score that look in a vfrey HTML scene, for any topic: giant serif words that slam, stretch, rotate, stack and fill with marble in time with the voice, three colours, two typefaces, vfrey's own captions switched off and a generated drone and hit bed."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 2.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Kinetic type
  style-summary: Huge words that fill the screen and move with the voice, like the opening titles of a film.
  style-best-for: motivation, quotes, philosophy, poetry, book summaries, opinion, speeches
  style-poster: kinetic-type.jpg
  style-preview: kinetic-type.mp4
---
> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Kinetic type

Start from `starter.html` next to this file (`npx vfrey styles start kinetic-type scenes/<idea>` creates the folder with it as `index.html`{W}): replace its placeholder words, render one frame, run `measure-type.cjs`, then build the shots. Code to copy is in `helpers.md`; the type-measuring script is `measure-type.cjs`; the sound script is `make-bed.py`. This file teaches a look, never a topic: apply it to the scene you write (`scenes/<idea>/index.html`, HTML + GSAP, engine `vfrey-render`). The vfrey skill's `scenes/craft.md` still holds for everything not said here. Use it for ideas that live in the sentence (a quote, a principle, an opinion, a speech, a book's argument; six to ten words a shot). Not for anything that needs a picture of a thing, a chart, a map, a product or a face.

## 1. The look in three sentences, and the signature traits

The words are the picture: giant condensed serif lettering in ink, bone and one hot red slams, stretches, rotates and stacks to the beat of the voice on flat colour grounds. There is no illustration at all; every frame must work as a poster, like the opening titles of a film. A little marble inside the biggest letters is the only texture, and vfrey's own captions are switched off.

Signature traits (each one checkable on a frame):
1. Exactly three colours: ink `#0e0d0c`, bone `#ece6d8`, red `#e8391d`. Nothing else is on screen except a marble made from them.
2. One giant word per shot, 60 to 100% of the frame width, stretched vertically up to about 3x (condensed look), against one small mono line.
3. Playfair Display 900, upright caps for slams; 900 italic lowercase for soft words; nothing else in the headline.
4. Flat colour grounds, one per shot, alternating ink, bone, red so no two cuts in a row look alike. No gradients, no shadows, no images.
5. Words stacked in a block of 3 to 5 rows, each row fitted to the same width and a different height, that fills the frame from top safe edge to bottom.
6. Outline copies (hollow letters, 3 to 5 px stroke) used as echoes above, below or behind a solid word.
7. Marble fill (veins) inside at most one or two huge words per shot, never on small type.
8. A small JetBrains Mono caps tag (tracked wide) with a counter (`01`, `02`) or a source, top of the frame or on a solid plate.
9. Solid colour blocks (plates, bands, bars) behind lines of type; rectangles only, square corners.
10. Slanted double-slab wipes between shots (10 degrees); a slam with a jolt of the whole shot on every landing word.
11. No caption band: the lettering carries the words (`"captions": "off"`).
12. Faint paper grain over everything (multiply, opacity .10).

## 2. Palette

| Role | Hex | Use |
| --- | --- | --- |
| Ink | `#0e0d0c` | ground, solid type, plates and bands |
| Bone | `#ece6d8` | ground, solid type, outline strokes |
| Red | `#e8391d` | ground, one accent row or word per shot, blocks, rings |
| Marble red | base `#e8391d`, vein `#5a0f06`, highlight `#ff8a6a` | huge words only |
| Marble ink | base `#14110f`, vein `#e8391d`, highlight `#6b6459` | huge words on bone or red |
| Marble bone | base `#ece6d8`, vein `#2a2420`, highlight `#e8391d` | huge words on ink |

- Ratios per frame: the ground is 35 to 100% of the frame; type is 40 to 70%; the third colour (the one that is neither ground nor main type) is at most 25%. Red as ground means type is ink or bone only.
- Type on a ground is always one of the other two colours (bone on ink, ink on bone, ink or bone on red; red on ink or bone). Red type on a red ground never.
- If `brand.json` has an accent it replaces the red everywhere, still only one accent.
- Never: gradients on grounds (they band), drop shadows, glows, a fourth colour, pure `#000` or `#fff`, translucency over type other than the ghost echoes at .25 to .8 opacity.

## 3. Shapes and line

- Outline type: `-webkit-text-stroke` 4 to 5 px at 1080 wide (3 px for small echoes), `color: transparent`. Outline copies repeat the solid word at the same width and height and step by one row (about 265 to 300 px).
- Blocks: plates are rectangles with square corners, 8 to 14 px rules or 130 to 370 px tall bands, flat fill. A coloured plate sits tight behind one line (padding 20 to 40 px). Red ring behind a giant glyph: `border-radius:50%` border 3 to 4 px, scaling out.
- Edge treatment: none. Letters are crisp vector; no blur, no grain on letters themselves.
- Texture recipe, marble (seeded canvas, built once, `background-clip:text`): 384 px canvas, value-noise fbm 5 octaves at scale `1/70`, veins `pow(1 - |sin((x/N*2.2 + y/N*1.3 + n*3.2) * pi)|, 7)`, a second finer vein set `pow(..., 12)` at `x/N*3.1 - y/N*.8 + n*5.5` blended at 0.55 as highlight. Background drift 5% to 95% sideways while the word shows. Built by `marble(base, vein, hi, seed)` in the starter.
- Grain recipe: a 270x480 canvas of random grey 150 to 255 scaled to the frame, `mix-blend-mode: multiply`, opacity .10, drawn once with a seeded random.
- Light: there is none. No shadows, no highlight except the marble's. Depth only comes from scale, overlap and the tunnel's perspective.

## 4. Characters and objects

Letters are the characters. Construct them like this:
- Every word is `div.wd` (GSAP moves x, y, scale, rotation) around an absolute `span.in` with `line-height:.71` and `transform: translate(-50%,-50%) scale(1, sy)`, so `y` is the visual centre of the caps.
- Cap height is `0.708 * font-size` (Playfair) or `0.73 * font-size` (mono). `sy = targetCapHeight / capHeight`. Font size comes from `targetWidth / measuredWidth * 100`.
- Stretch limits: upright caps up to 3x; italic lowercase up to 2.1x; beyond that split the word (TOR / MENT) or rotate it 90 degrees.
- Letter-spacing: `-.02em` caps, `-.025em` italic, `.14em` mono. Lining numerals on caps.

Stock moves (the props of this style), each a few lines in the starter or `helpers.md`:
1. Stack: 3 to 5 words fitted to 900 px wide, heights 330 / 420 / 400 px, y centres 330, 760, 1180 (and 1600 for the tag).
2. Wall: five identical rows 940 x 268 px at y = 245 + 300 i, alternating in from the sides; one row in the accent.
3. Rotated word: `rot -90`, width 1760, `sy` 1.5, three copies at x 300 / 590 / 870 (ink fill, bone outline, ink outline).
4. Outline echo: 2 to 4 hollow copies above and below a solid centre row.
5. Numeral or glyph as a shape: `2000`, `?`, `%` at 940 wide and 500 to 760 tall, marble fill, band under it.
6. Spiral: a repeated phrase on an SVG `<textPath>` along an inward spiral, font 82 px italic red, rotating 240 degrees.
7. Tunnel: words at `z = -600 k` in a `perspective:1000px` world; the camera flies through.
8. Split screen: two colour blocks (top red, bottom bone) scaling in, one word on each.

## 5. Typography

- Giant words: Playfair Display 900 caps, fitted width 880 to 940 px (full-width) or 430 px (a short word beside a plate), cap height 235 to 540 px; colour bone, ink or red (or marble).
- Soft words: Playfair Display 900 italic lowercase, width 880 to 1760, `sy` 1.1 to 2.1.
- Labels, tags, counters, sources: JetBrains Mono 500, caps, tracked .14em, `fs` 36 to 62 px (counters `01` at 54), wide mono lines fitted to 900 px. Colour: the ground's opposite.
- Numbers: Playfair caps with `lining-nums`, giant, marble if one per shot.
- Both faces are in `vfrey/fonts`; local fallbacks `Georgia` and `Menlo` are only for a measure table that fails.
- Caption plate: none (captions off). If the person turns captions on: a solid ink or bone block 1000 x 190 px at y 1336 to 1526, centred, padding 40 px, one or two lines, the spoken word on a red chip; never over a giant word.

## 6. Composition

There is no caption band (`"captions": "off"`), but `--vf-caption-at` still marks the lower zone; the giant words stay large and run to the bottom edge of the frame.

- Safe area: x 60 to 1020, y 150 to 1750 for type; the bottom-right corner (x > 686, y > 1800) stays clear of the `AI-GENERATED` label; small text stays out of the right 13% in the lower half.
- Grid: type rows sit on a 5-row grid at y = 245 + 300 i (rows 268 px high with 32 px gaps) or a 3-row grid at y 330 / 760 / 1180. Full-width words span x 70 to 1010.
- Subject scale: the giant word is a third to a half of the frame height (640 to 960 px) and 80 to 100% of its width.
- Layers: ground flat; type in the middle; a grain over all. No foreground/background beyond the tunnel and the outline echoes behind a solid word (echo opacity .25 to .8).
- Depth cue: only scale, overlap and the 3D tunnel (perspective 1000 px, origin 50% 46%).
- Frames more than half flat colour for over 0.7 s need a ghost, an outline echo or a colour block growing under the next word.

Named shot types:

```
STACK            WALL            NUMERAL          ROTATED ECHO     TAG+PLATE
+----------+     +----------+    +----------+     +----------+     +----------+
|WE  [tag] |     |REALITY   |    | 01 TAG   |     | |  |  |  |     | SMALL    |
|SUFFER    |     |REALITY   |    | ======== |     | |  |  |  |     |          |
|MORE      |     |REALITY*  |    |  2000    |     | s  s  s  |     |[PLATE   ]|
|OFTEN     |     |REALITY   |    |  (marble)|     | |  |  |  |     | MORE     |
| small    |     |REALITY   |    |[ BAND   ]|     | |  |  |  |     |SMALL TAG |
+----------+     +----------+    +----------+     +----------+     +----------+
```

and a spiral/tunnel shot for fast speech or a "falling into it" idea.

## 7. Motion

- Feel: smooth, snappy, no stepping. Everything is a GSAP tween on the one `vfrey.timeline()`.
- Entrances: slam = `fromTo` scale 1.9 to 2.6 (opacity 0) to 1, 260 to 350 ms `expo.out`, paired with `shake` of the whole shot (`y: 14 to 24` to 0, 320 ms `elastic.out(1,.5)`). Slide in from off-frame `power4.out` 340 to 400 ms. Mask reveal `rise`: clip-path `inset(0 0 100% 0)` to `inset(-10% -5% -20% -5%)`, y 60 to 0, 300 to 550 ms `power4.out`. Small tag: fade up 40 px, 250 ms `power3.out`.
- Emphasis: marble drift 5% to 95% over the word's life (`ease: none`); skewX -8 over the shot (`sine.inOut`); rows drift +-26 px against each other.
- Exits: whip up `y: "-=2300"` 300 ms `power3.in` with stagger .02 to .04; or a colour flood `inset(100% 0 0 0)` to `inset(0)` 260 to 300 ms `power3.inOut`.
- Holds: a word holds for its spoken duration (0.3 to 1.2 s) and must have a second motion (push or drift) during pauses.
- Camera: `push` on every shot: scale 1 to 1.05 or 1.08 over the shot, `power1.inOut`, origin near the key word. Titles land dead still; the world moves around them. Tunnel camera: `#world` z moves to `600 k` at each word's start (`none` under 0.45 s, `sine.inOut` longer).
- Cut on the voice: a word lands 0.04 s before it is spoken; a shot starts at its first word minus 0.1 s.
- Forbidden: a fade (opacity-only) as the main entrance, a linear tween on anything but marble drift, bounce on type except the shake, zoom-out camera moves, rotation of small tags.

## 8. Transitions

Allowed, with code in `helpers.md` and the starter:
1. Slab wipe (the default): two slabs (`skewX(-10deg)`, 150% wide, left -160%), accent then incoming ground; they move to `xPercent 90` in 140 and 160 ms (`power3.in`), swap behind them, exit to 190 in 260 and 280 ms (`power3.out`), then reset with `tl.set` 0.5 s later.
2. Colour flood inside a shot: clip-path `inset(100% 0 0 0)` to `inset(0)` in 300 ms, or a growing `circle(0% at 50% 42%)` to `circle(150%)`.
3. Whip: the old words fly up with `power3.in` while the next ground is already behind.
4. Band grow: a plate scales from one side (`scaleX 0 to 1`, 350 ms `power4.out`).
Never crossfade, never a zoom blur, never a page flip.

## 9. Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). The bed: a low D-minor drone (73.4, 73.9, 110, 146.8 Hz, lowpass 420 Hz, tremolo .2 Hz), a quiet pad (146.8 / 174.6 / 220 / 293.7 Hz with an echo), pink-noise air, about 70 bpm feel (nothing metrical). Accents: a `slam` (55 Hz thud 0.9 s, 140 Hz click, brown-noise burst) on each landing word, a `whoosh` (band-passed noise starting 0.3 s early) on each wipe, a `tick` (1760 Hz) on each mono tag. Mix: bed volume -12, duck under the voice; result about -14 LUFS, true peak under -1 dBTP. `make-bed.py` next to this file writes it with `python3` and `ffmpeg` only and no downloads.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (format at the top of `make-bed.py`), then from the project folder: `python3 "$(npx vfrey styles path kinetic-type)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey kinetic type style, ffmpeg)", "volume": -12, "duck": true}` and render again with `--rerender`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render. No `python3` on the machine: leave `music` out, say so, install nothing.

## 10. Shot plan template (32 to 40 s, 6 to 9 shots)

| Time | Beat | Shot type | Ground | Moves |
| --- | --- | --- | --- | --- |
| 0 to 6 s | Hook: the claim in 4 words | STACK | ink | slam each word, tag fades up, whip up + red flood |
| 6 s to 11 s | Who or where it comes from | ROTATED ECHO then WALL | red then bone | three echoes, wall rows alternate |
| 11 to 17 s | The turn: a number or date | NUMERAL | bone | marble numeral slams, band grows, italic echo |
| 17 to 24 s | Three parts of the idea | TAG+PLATE x3 | ink, red, bone | `01 / 02 / 03` counters, outline rows, floods |
| 24 to 30 s | Question or spiral for the problem | SPIRAL or TUNNEL | ink | spiral collapses to a glyph |
| 30 to 36 s | Payoff in 2 to 4 words | STACK | red or bone | big slam, longest hold, source tag |
| last 2 s | Hold | any | last ground | push only |

Script rules: set `lineGap` (0.25 to 0.4; Kokoro's default pause is about a second; `voice.md` in the vfrey skill) and do not merge lines to avoid the pause; use each pause for a second motion. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; about 2.8 words a second (measured; the `series kit` Pace line has your voice's own figure) at lineGap 0.3. Set `"captions": "off"`. Words on screen are the script's words; a source, name or date goes in a mono tag only if you can cite it; never invent a quote or statistic.

## 11. Reference frames

- `ref-1.jpg`: STACK on ink. Copy the three-row block fitted to one width, bone / red / bone, and the red plate with the mono tag.
- `ref-2.jpg`: WALL on bone. Copy five identical rows, the one red row, and the red source bar at the bottom edge.
- `ref-3.jpg`: outline echo on ink. Copy the solid row over a hollow row (5 px stroke) and the `01` counter with its mono line.
- `ref-4.jpg`: marble and plate. Copy the red marble words, the red plate behind the white word and the mono line tracked wide beneath.

## 12. Reference implementation

`starter.html` is a working three-shot scene (stack, numeral with marble and band, wall) with the slab wipes and grain, built from the showcase film. Start it with `npx vfrey styles start kinetic-type scenes/<idea>`, replace the placeholder strings (`FIRST`, `SECOND`, `THIRD`, `SMALL TAG`, `2000`, `YEARS AGO`, `WALL`, `echo`, the source line) with the script's words, add shots by copying a block, and check it with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame 3 out.png`. After the first render, run `node "$(npx vfrey styles path kinetic-type)/measure-type.cjs" scenes/<idea>` (and again whenever a string changes); strings that reach `W()` from a list go in a `/* meas U: A | B */` comment. The starter reads `vfrey.timing.words` through `ws(i)`; it clamps indices, but cue each shot to the real word numbers.

## 13. Do and Don't, and the final checklist

Do:
1. Do fit every giant word from the measured table, never at run time.
2. Do alternate grounds (ink, bone, red) so no two cuts in a row look alike.
3. Do pair every giant word with one small mono line.
4. Do slam a word 0.04 s before it is spoken and jolt the whole shot.
5. Do give every shot a push-in and a second motion in pauses.
6. Do keep the last row or tag in the lower third, where a caption band would be.
7. Do use outline copies as echoes behind or beside solid words.
8. Do use marble on at most one or two huge words per shot.
9. Do cut with the slanted slabs, set back with `tl.set` afterwards.
10. Do keep the bottom-right corner clear for the label.
11. Do split words past 3x stretch or rotate them.

Don't:
1. Don't add illustrations, icons, images or photos.
2. Don't use a fourth colour, gradients on grounds, shadows or glows.
3. Don't crossfade between shots.
4. Don't put marble on small words.
5. Don't measure fonts in the scene (they load after the build).
6. Don't stretch upright caps past 3x.
7. Don't turn on vfrey's captions over giant words.
8. Don't tween opacity on 3D tunnel layers that an `onUpdate` also writes.
9. Don't leave a wipe slab on screen after its use.
10. Don't use a mono line bigger than a fifth of the giant word's height.
11. Don't invent quotes, dates or statistics.

Final checklist: render, make a 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`), look at it phone-sized, and tick each line:
- [ ] Only ink, bone, red (and marble made of them) in every tile.
- [ ] Each tile has one giant word at 60 to 100% width and one small mono line.
- [ ] Grounds alternate; no two cuts in a row on the same ground.
- [ ] Giant words are condensed serif caps or italic lowercase, stretched at most 3x.
- [ ] No tile is more than half flat colour for over 0.7 s.
- [ ] At least one stack, one outline echo, one marble word and one block or band across the film.
- [ ] No illustration, no caption band, no text in the bottom-right corner.
- [ ] Mono tags are caps, tracked wide, with a counter or a source.
- [ ] No word is cropped by the frame; nothing past the safe edges.
- [ ] Every word on screen is in the script; every source or date can be cited; `"captions": "off"` and the `.srt` is written.
- [ ] Every number on screen matches the number the voice says (digits, units and rounding); read the contact sheet against the script.

## Pitfalls

- Measuring fonts in the scene: use the offline table and rerun `measure-type.cjs` after any text change; a missing string logs `no meas`.
- Slab wipe: with `left:-160%; width:150%`, full cover needs `xPercent` 90 and the exit goes to 190. Set it back with `tl.set` after.
- `yPercent` does nothing on a zero-height wrapper; tween `y:"-=N"` in px.
- GSAP opacity tweens and an `onUpdate` that writes `style.opacity` fight; give 3D layers only the updater (also called from `vfrey.onFrame`) and keep rotated layers about 80% of the frame width.
- A `frames.text-overlap` warning on stretched stacked words is expected (their boxes overlap, the glyphs do not).
- A `captions.style` in the script does nothing when captions are off; this style is always a scene.
