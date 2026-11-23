---
name: vfrey-style-footage-split
description: "Use when the chosen video style is Footage split (vfrey-style-footage-split), or the person asks for a split-screen short, 'put my clip on top and the text below', a gameplay loop under the voice, or their own footage behind the captions. Teaches how to use only the person's own footage from <project>/footage/ (vfrey never downloads footage), prepare mixed clips with prep-footage.py (size, crop, frame rate, trims, loops, muting or ducking the original sound), and compose, animate and score a 9:16 split screen or full-bleed footage scene in a vfrey HTML scene, for any topic."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Footage split
  style-summary: Your own footage in one half of a split screen (or behind everything), the key point and captions in the other.
  style-best-for: commentary, gameplay commentary, tips over b-roll, vlog explainers, reactions to your own clips, story time
  style-poster: footage-split.jpg
  style-preview: footage-split.mp4
---
<!-- style-bible: v2 -->

# Video style: Footage split

This file teaches a look and a footage rule, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + CSS + GSAP, engine `vfrey-render`); the script, voice and facts are yours, the footage is the person's. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Start from `starter.html` next to this file (`npx vfrey styles start footage-split scenes/<idea>` creates the folder with it as `index.html` and lists the footage it finds); prepare the clips with `prep-footage.py` next to this file; code patterns are in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

Script pace: size the script from a voice sample, as `voice.md` in the vfrey skill says (`lineGap`; sample with `npx vfrey voice sample <voice> --script <file> --no-browser` and size the script by the words a second that sample prints for your voice).

## The footage rule (read before anything else, and follow it)

1. **Only footage the person provides, in `<project>/footage/`.** Their own camera clips, their own screen or gameplay capture, their own renders, or stock they hold a licence for. Ask where a clip came from when you are not sure, and leave it out when the answer is "from someone's video".
2. **vfrey never downloads footage.** Never fetch a clip from YouTube, TikTok, Instagram, Twitch, a game trailer or any site, never record someone else's stream, never ask an image or video model to copy someone's footage. `prep-footage.py` refuses an address and reads only files inside the footage folder.
3. **Gameplay:** the person's own capture of a game they play is the common case; a game's publisher may still claim it (many allow it, some do not), so say so once. A "satisfying" or parkour loop from someone else's channel is not allowed.
4. **People in the footage:** only people who agreed to be filmed and posted; blur or leave out bystanders' faces and licence plates.
5. **Sound:** the original sound is muted by default. Keep it (`--audio keep`) only when it is the person's own (their voice, their game audio) and duck it under the voice; music inside a clip that the person does not own gets a Content ID claim.
6. Footage with no voice and no point is reused content on YouTube and TikTok: the voice and the panel carry the video, the footage supports it.

## Plan before coding

The three rules every vfrey style follows (a film that breaks them reads as dead air; `frames.still` fails an 8-second hold and `frames.numbers` a number the script does not say):
1. **Change the hero picture on every script line, and finish the change before that line ends.** No hold past 3 seconds; a long line gets a second or third beat. Do not plan in acts of several lines: one line, one change.
2. **The only numeral on a frame is the one that line says.** A count-up must not pass through other values while a different number is spoken: show the figure whole, on its line, and take it away before the next.
3. **Frame 0 already shows a whole word and a picture of the first noun.** Nothing is still entering: no half-typed title, no cut-off glyph, no counter at 0.

Keep scene graphics out of the bottom-right corner: the burned-in `AI-GENERATED` label owns it (about 322 x 58 px, right margin 72, bottom margin 56).

## 1. The look in three sentences, and the signature traits

The frame is cut in two at its middle: the person's own footage fills one half edge to edge, and a dark ink panel fills the other with the point of each sentence in huge bold capitals. A yellow seam glows between the halves, a yellow title tag sits at the top, and a row of dots counts the sentences. A dark caption plate holds the spoken words, the active one in yellow, in vfrey's caption band; in the full layout the footage runs behind everything under a soft scrim.

Signature traits (each checkable on a frame):
1. A hard horizontal split at y 960 (top and bottom layouts), each half 1080 x 960, no gap.
2. The footage fills its half to the frame edges: cropped to cover, never letterboxed (or blurred-fill with `--fit blur`).
3. A yellow `#ffd23f` seam 8 px with a soft glow on the split line.
4. The panel `#12151d` to `#1b2030` with one faint yellow glow; never flat black.
5. A yellow title tag (64 px pill) at y 214 with the script's title.
6. One key phrase per sentence, 72 to 92 px, 800 weight, uppercase, words rising in one after another.
7. A row of 16 px dots, one per sentence, the spoken one yellow.
8. A dark caption plate (`rgba(13,15,20,.92)`) with light text, the active word turning yellow.
9. The footage pushes in slowly (1.0 to 1.06) over the whole film; it is never frozen.
10. ONE accent, yellow; everything else ink, white and the footage's own colours.

## 2. Palette

| Role | Hex | Use |
|---|---|---|
| Panel | `#1b2030` to `#12151d` | the text half, top to bottom |
| Glow | `rgba(255,210,63,.10)` | one radial in the panel |
| Accent | `#ffd23f` | seam, tag, dots, the active caption word |
| Text | `#f4f5f8` | key phrase, captions |
| Muted | `#9aa3b8` | small labels |
| Ink | `#0d0f14` | text on the accent, the plate |
| Scrim | `rgba(0,0,0,.45 to .65)` | over footage where text sits (full layout, top of the top layout) |

Ratios: footage about 50% of the frame (100% in the full layout); accent at most 6%; panel and plate the rest. Never use: a second accent, colour grading the footage into neon, a white panel (it fights the footage). `brand.json` wins for the accent: swap the one value and its glow.

## 3. Shapes and line

- Halves: 1080 x 960 each, square corners, no border; the seam is the only line.
- Tag and plate are stadiums (radius 32 and 40); dots are circles. The plate has a 3 px `rgba(255,255,255,.12)` edge and a deep shadow.
- Light: the footage is the light; the panel glow sits top-right. Shadows only under the plate.

## 4. Characters and objects

The footage holds the people and things; the scene adds no characters. Objects: the title tag, the key phrase, the sentence dots, the seam, the caption plate. To point at something in the footage, use one yellow ring or arrow (see `helpers.md`), never a box over a face.

## 5. Typography

Google Sans Flex (fallback "Baloo 2", sans-serif) for everything.

| Role | px | weight | colour |
|---|---|---|---|
| Key phrase | 72 to 92 | 800 | text, uppercase, tracking -0.02em |
| Title tag | 30 | 800 | ink on accent |
| Caption | 62 | 800 | text, active word in the accent |
| Small label | 26 | 700 | muted |

Caption plate: `rgba(13,15,20,.92)`, radius 40, left/right 36, height 205, top = `captionBox.top + captionBox.height - 180`, one line (`maxWords: 3`).

## 6. Composition

- Layouts: `top` (footage above, the point below: the default for talking clips and b-roll), `bottom` (the point above, footage below: the gameplay-loop layout), `full` (footage behind everything with a scrim). Set `LAYOUT` in the starter and the same `--slot` in `prep-footage.py`.
- Safe area: the tag at y 214; key phrases inside x 50 to 940; nothing readable in the bottom 20% or the right 13%; the bottom-right 322 x 58 corner stays clear for the `AI-GENERATED` label.
- Full frame around the caption band: the plate sits at `--vf-caption-at`; the panel (or the footage) runs behind it to the bottom edge, so no band is empty.
- In the `top` layout the key phrase sits at y 1004, in the panel above the caption band; in `bottom` and `full` it sits at y 330. The subject of the footage stays in the middle of its half: trim and crop so it is not under the tag.
- Large type: a key phrase that does not fit two lines at 72 px is too long; cut it to two to four words.

Named shot types:
```
A  Top split (default)   B  Bottom split (loop)    C  Full bleed            D  Pointer
[ tag over footage ]     [ tag              ]      [ tag over footage ]     [ footage + ring ]
[ FOOTAGE          ]     [ KEY PHRASE       ]      [ KEY PHRASE       ]     [ seam             ]
[ ===== seam ===== ]     [ ===== seam ===== ]      [ footage          ]     [ KEY PHRASE       ]
[ KEY PHRASE       ]     [ FOOTAGE (loop)   ]      [ plate            ]     [ plate            ]
[ plate            ]     [ plate over it    ]      [ footage          ]     [ panel            ]
```

## 7. Motion

The footage moves by itself; the scene moves little.
- Key phrase: words rise 50 px and fade in, 0.45 s `power3.out`, 0.08 s apart, 0.1 s before the sentence; out 0.25 s `power2.in` before the next.
- Dots: the spoken one fills yellow with `back.out(3)`, 0.25 s.
- Tag in 0.5 s; seam draws from the left 0.6 s at the start.
- Footage: one push-in 1.0 to 1.06 on the inner wrapper (`#zoom`), linear, the whole film. Never animate the `<video>` element itself, never call `play()`, `pause()` or seek it.
- Forbidden: shaking the footage, speed ramps the person did not ask for, `repeat: -1`, flashes, more than one zoom.

## 8. Transitions

1. Clip to clip: `prep-footage.py` cuts between clips on the beat of `--segment`; the cut is the transition. Put cuts near sentence starts by choosing `--segment` (helpers has the rule).
2. Sentence to sentence: the key phrase swap. 3. Layout change mid-film: none; one layout per video.
Forbidden: wipes, zoom blur, glitch, spinning, a cut that leaves black.

## 9. Sound

The footage's own sound is muted unless it is the person's own. The bed is a steady, low-key beat: a soft kick and a clap on 2 and 4, a round bass, a warm pad, about 96 BPM. Accents: a soft `tick` on each new sentence. Mix: bed volume -16 in the script (vfrey normalises to -14 LUFS), quieter than the voice; if `audio.voice-clear` warns, lower `volume`.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` needs only `python3` (standard library) and always writes the same file for the same input.
1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. From the project folder: `python3 "$(npx vfrey styles path footage-split)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --out music/<idea>-bed.wav`. To keep the clips' own sound ducked under the voice, prepare with `--audio keep` and add `--footage-audio music/<idea>-footage.wav` (add `--no-bed` for that sound alone).
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey footage split style)", "volume": -16, "duck": false}` and make it again with `--rerender`.
One pass instead: `--duration 45` with no `--timing` writes a bed with no accents before the first render. No `python3` (`python3 --version` fails): leave `music` out, say the video has no music and why, install nothing unasked.

## 10. Shot plan template (30 to 45 s)

| Time | Beat | Shot | Footage |
|---|---|---|---|
| 0 to 3 s | Hook | A or B | the most active moment of the best clip |
| 3 to 12 s | Setup | A | the clip that shows the subject |
| 12 to 30 s | Points 1 to 3 | A or D | one clip (or segment) per point |
| 30 to 40 s | Payoff | A | the clip with the result |

Order the clips with `--order`, trim each with `--trim`, and size `--segment` so a cut lands near each sentence start.

## 11. Reference frames

Saved in this style's package folder, not installed into projects (the recipe in your project is `starter.html`): look at them before drawing.
- `ref-1.jpg`: top split. Copy the hard seam, the key phrase in the panel, the plate.
- `ref-2.jpg`: a later sentence, the dots filling, the footage cut to another clip.
- `ref-3.jpg`: the bottom split with a gameplay-style loop under the point.
- `ref-4.jpg`: full bleed with the scrim and the plate.

## 12. Reference implementation

`starter.html` next to this file is a working scene: footage slot, panel, seam, tag, key phrases, dots, caption plate. It plays `footage/clip.webm` in the scene folder, which `prep-footage.py` writes:
`python3 "$(npx vfrey styles path footage-split)/prep-footage.py" --footage footage --scene scenes/<idea> --duration 45 --slot top` (after the first render, use `--timing scenes/<idea>/vfrey/timing.json` so it covers the exact film). It scales and crops each clip to the slot, converts frame rates, follows phone rotation, trims, loops, mutes, and keeps the clip under 30 MB (a scene folder is at most 50 MB). Check a frame with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`.

## 13. Do, don't, and the final checklist

Do:
1. Use only the person's own footage from `footage/`, and ask when in doubt.
2. Prepare it with `prep-footage.py`; never put raw clips in the scene folder.
3. Keep the original sound muted unless it is the person's own; duck it under the voice.
4. Keep one key phrase of two to four words per sentence.
5. Keep the subject of the footage clear of the tag and the plate.
6. Match `LAYOUT` and `--slot`.
7. Captions sit on a plate: dark, same place all film.

Don't:
1. Download, record or copy anyone else's footage.
2. Letterbox a clip with black bars (crop it, or use `--fit blur`).
3. Animate or seek the `<video>` element.
4. Put text over faces in the footage.
5. Leave a clip shorter than the film (the last frame would freeze).
6. Use a second accent colour.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; also check stills at sentence starts):
- The footage fills its half in every tile, moving (different from tile to tile), no black bars.
- The seam is straight at the middle; the panel is dark with its glow.
- One large key phrase per tile, inside the safe area, above the plate.
- The plate is in the same place in every tile, the active word yellow.
- Nothing readable in the AI label corner; no one else's footage, logo or music.

Pitfalls: a clip shorter than the film freezes on its last frame (`frames.frozen` counts it): run `prep-footage.py` again with `--timing`. A scene folder over 50 MB is refused: lower `--max-mb`. Very dark footage under the plate is fine (the plate carries the contrast); bright footage under the tag needs the scrim.
- Numbers on screen match what the voice says (read each number on the contact sheet against the script).
