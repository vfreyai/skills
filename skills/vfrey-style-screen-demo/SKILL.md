---
name: vfrey-style-screen-demo
description: "Use when the chosen video style is Screen demo (vfrey-style-screen-demo), or the person asks for a software walkthrough, product demo, app tutorial, how-to or 'screen recording' look. Teaches how to build, compose, animate and score that look in a vfrey HTML scene, for any topic: an invented app window, a gliding cursor with click ripples, camera zooms keyed to the voice, spotlight, loupe, callouts and toasts, a caption plate at vfrey's caption band and a generated sound bed."
allowed-tools: Bash(python3:*) Bash(ffmpeg:*) Bash(ffprobe:*) Bash(npx vfrey:*) Bash(npx @vfrey/vfrey:*) Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Screen demo
  style-summary: A clean, light fake app on screen where a cursor clicks and zooms in on the exact detail the voice is explaining.
  style-best-for: tech tips, online safety, how-to, software tutorials, app explainers, product walkthroughs
  style-poster: screen-demo.jpg
  style-preview: screen-demo.mp4
---
> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

<!-- style-bible: v2 -->

# Video style: Screen demo

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html` plus `scene.js`, HTML + CSS + GSAP, engine `vfrey-render`); the script, voice and facts are yours. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Start from `starter.html` next to this file (`npx vfrey styles start screen-demo scenes/<idea>` creates the folder with it as `index.html`, whichever agent folder this skill was installed in) (replace every PLACEHOLDER and `APP NAME`, keep the structure); code blocks to paste are in `helpers.md` next to this file; the music script is `make-bed.py` next to this file. Every name, brand, domain and person in the window is invented (`example.com` domains). Use it for tech tips, online safety, how-to, software tutorials, app explainers and product walkthroughs; not for stories without an interface, not for charts, never for a real product or logo.

Script pace: do not trust a word budget. Sample the script with `npx vfrey voice sample <voice> --script <file> --no-browser` and aim at the middle of the length window; Kokoro af_heart with lineGap 0.3 speaks about 2.8 words a second (measured; the `series kit` Pace line has your voice's own figure).

## 1. The look in three sentences, and the signature traits

A bright, modern, invented app window fills the whole 9:16 frame on a pale blue-grey ground, with soft shadows and exactly one accent colour. A real-looking arrow cursor glides on curved paths, hovers and clicks with a ripple, while the camera zooms and pans to the exact detail the voice is explaining. Overlays (spotlight, loupe, callout, toast) point at that detail one at a time, and a white caption plate holds the words in the same place all film.

Signature traits (each checkable on a frame):
1. A white window with a 40 px top radius, a 64 px chrome bar with three grey dots and a centred app title, running to the bottom edge of the frame.
2. Ground `#e9edf6` with a soft indigo glow top-left and a white glow bottom-right, never flat.
3. ONE accent `#4f5df5`; no second hue except avatar circles.
4. A black arrow cursor with a white outline and drop shadow, visible in almost every frame.
5. A click ripple (accent ring, tinted fill) wherever a click lands.
6. Zoom between 1.0 and 1.45; UI text is readable at phone size.
7. A dimming spotlight (50% navy) with a clear rounded cut-out on the subject of the sentence.
8. An accent pill callout with a leader line and a dot on its target.
9. A numbered 3-pill tracker at the top (y 70), active pill filled with the accent.
10. A white rounded caption plate in the caption band with bold dark text and the active word on an accent chip.
11. Light UI, dark neutral `#1d2336` for the "bad"/primary button.
12. JetBrains Mono only for addresses, URLs, code and countdowns.

## 2. Palette

| Role | Hex | Use |
|---|---|---|
| Ground | `#e9edf6` | backdrop, with radial glows |
| Window | `#ffffff` | the app surface |
| Chrome | `#f5f6fb` | title bar, bars, panels `#f3f5fb` |
| Hairline | `#e6e9f2` | row borders, card borders |
| Ink | `#171c30` | text, cursor fill |
| Muted | `#6c7389` | labels, timestamps, inactive pills |
| Accent | `#4f5df5` | every highlight, pill, leader, active state, caption chip |
| Accent tint | `rgba(79,93,245,.14)` | hover fills, highlight boxes |
| Dark button | `#1d2336` | the "bad" or primary button |
| Dim | `rgba(18,22,44,.5)` | spotlight |
| Avatars | `#e48a5c #5aa6a0 #9a7bd8 #d0698a #5c8fd6 #7aa35a` | only on avatar circles |

Ratios: accent at most 8% of the frame; white or near-white at least 60%; dim at most 55% of the frame. Never use: a second accent hue, red or green status colours (use the dark button and the accent), black backgrounds, gradients on UI controls, real brand colours. `brand.json` wins for the accent: swap the one value and its tint.

## 3. Shapes and line

- Window: left 30, top 150, width 1020, radius `40px 40px 0 0`, height 2600 (no frame shows its end). Shadow `0 40px 110px rgba(30,40,90,.30), 0 6px 22px rgba(30,40,90,.12)`.
- Cards and panels radius 20 to 30; buttons 24; chips and pills full radius; avatars circles 84 px. Hairlines 1 px, controls' borders 2 to 3 px, callout leader 6 px round caps, loupe border 9 px, ripple border 6 px.
- Light comes from above: shadows fall down only, soft and wide, never hard offset. Callout pill `0 12px 30px rgba(79,93,245,.45)`; toast `0 26px 70px rgba(25,32,80,.42)`.
- Texture: none on the window (clean). The backdrop has two radial glows 900 to 1000 px; `#b1` breathes scale 1 to 1.12 over the film.
- Spotlight cut-out: `box-shadow: 0 0 0 3000px rgba(18,22,44,.5)` on a rounded div (radius 26).

## 4. Characters and objects

There are no characters; people are 84 px avatar circles with one capital letter (white, 800 weight, 38 px) on a muted colour. Props, all built from divs:
1. List row: 150 px tall, avatar, bold sender 34 px, subject 29 px, preview 25 px muted, time right.
2. Search field: 300 x 56 pill `#f0f2f8`.
3. Primary button: 620 x 122, radius 24, `#1d2336`, white 38 px 800 text.
4. Outline button: 3 px accent border, white fill, accent text (fills with accent on click).
5. Info card: `#f3f5fb`, 2 px hairline, label muted left, mono value right.
6. Details panel: expands by tweening `height` 0 to N and shifting the group below by the same amount.
7. Toast: 780 x 150 white card, 90 px accent icon square, tiny caps source, bold headline, muted detail.
8. Tooltip: dark `#10142a` bar, mono 24 px, accent-tint bold key part.
9. Loupe: 700 to 880 x 170 stadium, 9 px accent border, gloss strip, handle rotated 62 degrees, text at 1.3 to 1.4x with the key part in the accent.
10. Cursor (24 x 24 viewBox):
```html
<svg id="cursor" viewBox="0 0 24 24"><path d="M3 2 L3 19 L8 14.5 L11.2 22 L14.2 20.7 L11 13.4 L18 13 Z" fill="#171c30" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
```

## 5. Typography

Google Sans Flex (fallback "Baloo 2", sans-serif) for all UI; JetBrains Mono (fallback monospace) only for addresses, URLs, code, countdowns. World-unit sizes (zoom 1.0 to 1.45 gives 12 to 18 pt on a phone), never below 24:

| Role | px | weight | colour |
|---|---|---|---|
| View title / headline | 46 to 54 | 800 | ink |
| Body | 36 | 400 | ink |
| Row sender / subject / preview | 34 / 29 / 25 | 700 / 600 / 400 | ink / `#2a3047` / muted |
| Callout pill | 30 | 800 | white on accent |
| Tracker pill | 31 | 800 | muted, white when active |
| Mono value | 40 to 44 | 800 | ink |
| Caption | 62 | 800 | ink, active word white on accent chip |

Sentence case, tracking 0 (0.06 to 0.08 em only on tiny caps labels). Caption plate: `rgba(255,255,255,.97)`, radius 40, left/right 36, height 205, top = `captionBox.top + captionBox.height - 180`, one line (`maxWords: 3`), padding from the 36 px sides, highlight `#4f5df5`.

## 6. Composition

- Safe area: everything the viewer must read sits in the upper 60% (y under about 1150); the plate owns the caption band at `--vf-caption-at`; the bottom-right 322 x 58 corner stays clear for the `AI-GENERATED` label.
- Grid: focus point lands on screen x 540, y 520 to 740 (upper-middle third). The window is 1020 wide, so full-width content needs zoom at most 1.06; zoom to 1.45 only on left-aligned small things and focus on their x.
- Subject scale: the key element (row, button, address) 15 to 30% of frame height at zoom 1.0, up to 50% in a loupe shot.
- Foreground: cursor and overlays. Midground: the window content. Background: the blurred-feeling ground glows (parallax 6 to 8% of camera). Depth cues: shadows and the dim.
- Large type and large targets: a point that is not large enough to read on a phone gets a higher zoom or a loupe, not smaller UI.

Named shot types (the starter has 1, 2, 3):
```
A  List hook           B  Detail + loupe       C  Toast / button      D  Wide pull-out
[ tracker ]            [ tracker ]             [ tracker ]            [ tracker ]
[ row  <- spot ]       [ title           ]     [ toast  ->     ]     [ whole window  ]
[ row  ][ pill ]       [ (loupe)         ]     [ key card      ]     [ small, 1.0    ]
[ row ...          ]   [ button ...      ]     [ button        ]     [ rows ...      ]
[ plate ]              [ plate ]               [ plate ]              [ plate ]
E  Typing field: a pill browser bar drops in from y -160 and types a mono URL with a caret.
F  Click close-up: zoom 1.4 on a small control, ripple, state change (fill, label swap), toast.
   A close-up frames a control, never a paragraph: text lines the zoom pushes past the frame edge fail `frames.off-frame`; over a text column keep the push-in near 1.1 and centred.
```

## 7. Motion

Smooth, never stepped. Camera and cursor are pure functions of time (keyframe lists in `starter.html`), evaluated in the update of one tween spanning the film.
- Camera: `power2.inOut`, 0.7 to 1.2 s, one move per sentence, starts 0.1 to 0.3 s before the sentence; hold still between moves; zoom interpolated in log space. Pan speed under 700 world px per second.
- Cursor: curved path (control point offset 14% of distance, alternating sides), `power3.inOut`, 0.8 to 1.3 s per leg, arrives 0.2 to 0.4 s before the spoken word, rests between legs. Scale `1 / k^0.4`; press scale 0.8 for 0.2 s.
- Click ripple: scale .2 to 1.7, opacity .95 to 0, 0.6 s `power2.out`.
- Entrances: callout pill `back.out(2)` 0.4 s, leader draw 0.4 s `power2.out`, dot `back.out(3)` 0.3 s, toast `x -910` `power3.out` 0.55 s, loupe `back.out(1.5)` 0.55 s then bob 10 px. Emphasis: scale 1.06 to 1.1 yoyo 0.25 s. Exits: 0.25 to 0.35 s fade, toast `power3.in` 0.5 s.
- Holds: an overlay stays for its phrase (1.2 to 3 s); never two callouts at once.
- Ambient: unread dots pulse (finite repeats), glow breathes, countdown ticks, caret blinks.
- Forbidden: continuous camera drift, shake, `repeat: -1`, negative positions, bounce on the window, cuts.

## 8. Transitions

1. View change: the old view slides left 420 px and fades while the new view slides in from the right, `power3.inOut` 0.8 s, with a camera pull-out to zoom 1.0 in the same moment.
2. Tell change: the tracker pill pulses (`scale 1.08` yoyo) and the camera pans.
3. Overlay swap: previous overlay exits (0.3 s) before the next enters.
4. Panel expand: height tween 0 to N in 0.6 s `power3.out`, content below shifts the same amount; move the camera focus only after it settles.
Forbidden: hard cuts, wipes, zoom-blur, spins, glitch.

## 9. Sound

A light, modern product-video bed: pad chords on 4.6 s bars, a sparse pluck arpeggio, a soft low pulse; major or lydian mood, about 100 BPM feel. Accents fire on action: `click` on every click, `tick` on hover, `whoosh` on each camera move, `pop` on a callout or pill, `swell` before a spotlight, `chime_alert` on a warning toast, `chime_ok` on a success toast, `type` across typing. Mix: bed volume -12 in the script (vfrey normalises to -14 LUFS), accents quieter than the voice; if `audio.voice-clear` warns, lower `volume`.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` needs only `python3` (standard library) and always writes the same file for the same input.
1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (lists of times from the same constants the scene uses; format at the top of `make-bed.py`), then from the project folder: `python3 "$(npx vfrey styles path screen-demo)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey screen demo style)", "volume": -12, "duck": false}` and make it again with `--rerender`.
One pass instead: `--duration 60` with no `--timing` writes a bed with no accents before the first render. No `python3` (`python3 --version` fails): leave `music` out, say the video has no music and why, install nothing unasked.

## 10. Shot plan template (30 to 40 s)

| Time | Beat | Shot | Overlay and cursor |
|---|---|---|---|
| 0 to 5 s | Hook: the claim | A list hook | spotlight on the key row, callout "looks like...", cursor drifts to it |
| 5 to 6.5 s | Open it | Transition 1 | click row, slide to detail, pull-out |
| 6.5 to 16 s | Tell / step 1 | B detail + loupe | highlight box, loupe on the key text, callout |
| 16 to 22 s | Tell / step 2 | F click close-up | hover lift, tooltip, spotlight, callout |
| 22 to 30 s | Tell / step 3 | C toast / card | countdown or toast, callout, tracker done |
| 30 to 36 s | Payoff / action | E typing or F click | typed address or final click, success toast, tracker complete |
Each sentence gets one camera move, one cursor target, one overlay.

## 11. Reference frames

Copy these in the skill folder (`ref-1.jpg` to `ref-4.jpg`, 540 x 960):
- `ref-1.jpg`: list hook. Copy the spotlight cut-out on one row, the pill callout above it, the tracker, the plate.
- `ref-2.jpg`: loupe shot. Copy the stadium loupe with accent border and the highlight box on the real text.
- `ref-3.jpg`: hover tooltip. Copy the dark mono tooltip, the lifted button, the "It really goes here" pill.
- `ref-4.jpg`: toast. Copy the white toast sliding in from the right over a dimmed-free window and the done pills.

## 12. Reference implementation

`starter.html` next to this file is a working scene (about 8 to 12 s): list view, detail view, tracker, cursor, ripple, spotlight, callout, loupe, toast, caption plate, with placeholders. Start from it: copy to `scenes/<idea>/index.html`, change the text, the keyframe tables `kf` and `cursorWp` and the click times, keep all helpers. Check it with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`. Recompute click coordinates whenever you move UI (view-local to world is +30, +214).

## 13. Do, don't, and the final checklist

Do:
1. Aim every focus above the plate, in the upper 60%.
2. Keep ONE accent; tint it for hover and highlight fills.
3. Let the cursor arrive 0.2 to 0.4 s before the word.
4. Add a ripple to every click.
5. Fill below the content with filler rows so the window reaches the bottom edge.
6. Keep full-width content at zoom at most 1.06.
7. Use classes, not ids, for anything cloned.
8. Make camera, cursor, typewriter and countdown pure functions of time.
9. Keep UI text 24 px or larger in world units.
10. Show one overlay at a time.
11. Invent every name, brand and `example.com` address.
12. Captions sit on a plate: white, same place all film.

Don't:
1. Show the window's bottom edge or a flat empty band.
2. Use a real brand, logo or product UI.
3. Use `tl.call`, timers or `repeat: -1`.
4. Drift the camera continuously.
5. Add a second hue, red alerts or green success colours.
6. Rely on measured text width except to centre a callout pill.
7. Cut between views.
8. Put a focus under the caption band or the AI label corner.
9. Show two callouts or two spotlights together.
10. Let the loupe or toast crop at the screen edge.
11. Move the camera while a panel is still expanding.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; also check stills at sentence starts):
- Window is white, radius top, reaches the bottom edge in every tile.
- Ground is pale blue-grey with glows, not flat.
- Exactly one accent hue; avatars the only other colour.
- Cursor visible; each click shows a ripple.
- Zoom readable at phone size; text at least 24 px.
- The point of each shot is above the plate; spotlight cut-out is clear.
- At most one overlay per tile; leader line ends on a dot on its target.
- Tracker pills at the top, active one filled.
- Caption plate white, same place in every tile, active word on an accent chip.
- AI label corner clear; no real brand.

Pitfalls: fonts load slowly (fixed pixel boxes); `cloneNode` loses id CSS; a window shorter than the tallest camera shot shows its edge; `frames.text-overlap` warns because the plate covers UI rows (intended).
- Numbers shown on screen match what the voice says (read each number on the contact sheet against the script).
