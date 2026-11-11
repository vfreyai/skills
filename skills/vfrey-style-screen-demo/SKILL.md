---
name: vfrey-style-screen-demo
description: "Use when the chosen video style is Screen demo (vfrey-style-screen-demo), or the person asks for a software walkthrough, product demo, app tutorial, how-to or 'screen recording' look. Teaches how to build, compose, animate and score that look in a vfrey HTML scene, for any topic: an invented app window, a gliding cursor with click ripples, camera zooms keyed to the voice, spotlight, loupe, callouts and toasts, a caption plate at vfrey's caption band and a generated sound bed."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Screen demo
  style-summary: A clean, light fake app on screen where a cursor clicks and zooms in on the exact detail the voice is explaining.
  style-best-for: tech tips, online safety, how-to, software tutorials, app explainers, product walkthroughs
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Screen demo

A bright, modern fake app window that fills the whole 9:16 frame: soft shadows, one accent colour, a real-looking cursor that glides on curved paths, hovers and clicks with a ripple, and a camera that zooms and pans to the exact detail the voice is explaining.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html` plus `scene.js`, HTML + CSS + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file. Every name, brand, domain and person in the window is invented (`example.com` domains).

## When to use it, when not

- Use it for tech tips, online safety, how-to and software tutorials, app explainers and product walkthroughs: anything where the point is "look at this part of the screen".
- Not for stories without an interface, not for charts (use the data story style), not for real products or real logos: build a plausible app with invented names instead.

## Plan before coding

1. Pick the one app surface the idea needs (mail, chat, settings, a form, a dashboard, a checkout). Build it as ONE window 1020 px wide at world position (30, 150), tall enough (2400+) that no frame shows its bottom edge. Two views at most (a list, then a detail) joined by one slide.
2. Decide 3 to 5 focus moments, one per spoken sentence. Each is a camera shot, a cursor target and one overlay (spotlight, loupe, callout, tooltip or toast).
3. Everything the viewer must read sits in the upper 60% of the screen. The caption plate owns the band; never aim a focus there.
4. A progress tracker (3 numbered pills fixed at the top) shows which tell you are on.
5. Keep a table of click coordinates (view-local to world is +30, +214); it must be recomputed whenever you move any UI.

## Palette and type

- Ground `#e9edf6` with one radial accent glow and one white radial; window white, chrome `#f5f6fb`, hairlines `#e6e9f2`. Ink `#171c30`, muted `#6c7389`, ONE accent (here `#4f5df5`) for every highlight, pill, leader line and active state, its soft tint (`rgba(accent, .14)`) for hover fills, and a dark neutral `#1d2336` for the "bad" button. No second hue except avatar colours. `brand.json` wins for the accent.
- Google Sans Flex for all UI; JetBrains Mono only for addresses, URLs, code and countdowns. UI text is 25 to 46 px in world units (12 to 18 pt on a phone at zoom 1.0 to 1.45), never below 24. Radius 20 to 40 on cards, full pills for chips.
- Shadows: `0 40px 110px rgba(30,40,90,.30)` for the window, `0 12px 30px rgba(accent,.45)` for callout pills.

## Drawing approach

- Camera and cursor are pure functions of time: keyframe lists `[t, focusX, focusY, zoom, screenY]` and waypoints `[tStart, tEnd, x, y]`, evaluated from `tl.time()` inside the update of one tween that spans the film (`helpers.md`). The cursor lives inside the camera group and is scaled by `1 / k^0.4` so it keeps a similar size.
- A click is a press (scale 0.8 for 0.2 s) plus a ripple circle (`scale .2` to `1.7`, opacity .95 to 0, 0.6 s) at the cursor's position at that time. A hover tweens a tint and a small lift.
- Spotlight: a div in world space with `box-shadow: 0 0 0 3000px rgba(18,22,44,.5)`, tweened by opacity only; one `.spot` per use (a class, never an id: CSS keyed to an id is lost on a clone).
- Callout: a pill, a leader path revealed by `stroke-dashoffset` and an end dot popping with `back.out(3)`; the pill sits in empty space near its target.
- Loupe: a stadium with a thick accent border, a gloss strip and a handle, showing the same text at 1.3 to 1.4x with the key part in the accent, over a highlight box on the real text. Tooltip: a dark bar with mono text under the hovered control. Toast: a white card with an accent icon square parked off screen right.
- Typewriter text and countdowns are functions of time (`slice(0, round(f * len))`), never timers.

## Full frame around the caption band

vfrey's caption band (`--vf-caption-at`, `--vf-caption-h`) is centred near 70% of a 9:16 frame when the position is bottom. This style puts a plate there and aims every focus above it.

- The window runs to the bottom edge and past it in every shot (2400+ tall, filler rows or a "more in your inbox" list under the content): no flat empty band, no shot that shows the window's end.
- Subjects are large: keep full-width content at zoom 1.06 or less (the window is 1020 wide); go up to 1.45 only on left-aligned small things and focus on their x.
- Captions sit on a plate: white and rounded (`rgba(255,255,255,.97)`, radius 40, soft shadow), placed from `vfrey.captionBox` (its bottom edge minus 180, 205 tall), `vfrey.captions("#captions", {style: "box", maxWords: 3})` so one line holds, the same place all film. `frames.text-overlap` warns because the plate covers UI rows beneath it; that is intended.
- Tracker at the top (y 70). Keep the bottom-right corner (about 322 x 58) clear for the `AI-GENERATED` label.

## Motion rules

- One camera move per sentence, `power2.inOut`, 0.7 to 1.2 s, starting slightly before the sentence; hold steady between moves, no continuous drift.
- The cursor arrives 0.2 to 0.4 s before the spoken word it illustrates; clicks land on the word.
- Overlays enter in under 0.5 s, stay for the phrase and leave in 0.25 to 0.35 s; never two callouts at once.
- Ambient: unread dots pulse, the backdrop glow breathes (parallax at 6 to 8% of the camera), a countdown ticks, a caret blinks. Finite repeats only, never `repeat: -1`, never a negative position.

## Transitions

Between views, the old view slides left 420 px and fades while the new one slides in from the right (`power3.inOut`, 0.8 s) under a simultaneous camera pull-out to zoom 1.0. Between tells, a tracker pill pulse and a camera pan. No cuts.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes light pad chords (4.6 s bars), a sparse pluck arpeggio and a soft pulse, plus accents: `click`, `tick` (hover), `whoosh` (each camera move), `pop` (a callout or pill), `swell` (a spotlight), `chime_alert` (a warning toast), `chime_ok` (a success toast) and `type` (key ticks between two times). It needs only `python3` (standard library, no downloads) and always writes the same file for the same input.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. Write `scenes/<idea>/cues.json` (one object of lists of times, built from the same constants the scene uses; the format is at the top of `make-bed.py`), then from the project folder: `python3 .agents/skills/vfrey-style-screen-demo/make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey screen demo style)", "volume": -12, "duck": false}` and make it again with `--rerender`. If the run warns `audio.voice-clear`, lower `volume`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the sentence starts (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: is the point of the shot above the plate, is the UI text readable at phone size, does the window reach the bottom edge?
3. Does the cursor reach its target before the word, and does each click show a ripple?
4. Is only one overlay on screen at a time, and is the accent the only hue?
5. Is any invented name a real brand? Is the AI label corner clear?

## Pitfalls

- Fonts load slowly: lay out with fixed pixel boxes and never rely on measured text width, except to centre a callout pill.
- `cloneNode` loses id-based CSS: use classes for anything cloned.
- Do not use `tl.call`; the renderer seeks. Everything is a tween or a pure function of time.
- A mid-expand panel moves the content below it: move the camera focus only after it settles.
- A window shorter than the tallest camera shot shows its edge: check the lowest focus.
