---
name: vfrey-style-soft-gradient
description: "Use when the chosen video style is Soft gradient (vfrey-style-soft-gradient), or the person asks for a calm frosted-glass, mesh-gradient, glossy-icon or wellness-app look. Teaches how to build, compose, animate and score that look in a vfrey HTML scene, for any topic: drifting pastel colour fields that change with the story, frosted glass cards over bokeh, glossy gradient icons, spring entrances, captions on a glass plate around vfrey's caption band and a generated pad."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Soft gradient
  style-summary: Drifting pastel colour fields with frosted glass cards and glossy icons that float in gently.
  style-best-for: health, wellness, sleep, mindfulness, lifestyle, finance basics, app explainers
---

> **This style is for making videos with vfrey.** It teaches the look only; vfrey does the rest (script, voice, render). If vfrey is not installed here (there is no `vfrey` skill loaded, and `npx vfrey doctor` or `npx @vfrey/vfrey doctor` fails), tell the person and, with their yes, install it: `npx skills add vfreyai/skills --skill vfrey`, then create a project with `npm create vfrey@beta <name>` (see https://vfrey.ai/docs/quickstart). Then continue with this style.

# Video style: Soft gradient

A calm, bright "glass UI" look: a mesh-gradient background that drifts and changes colour with the story, frosted glass cards and pills floating over it in gentle parallax, glossy gradient icons, spring-eased entrances, light film grain and captions on a glass plate.

This file teaches a look, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html` plus `scene.js`, HTML + CSS + inline SVG + GSAP, engine `vfrey-render`); the script, voice and facts are yours as always. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Code to copy is in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

## When to use it, when not

- Use it for gentle, reassuring subjects: health, sleep, mindfulness, habits, lifestyle, beauty, finance basics, app and product explainers. Rounded forms are right here.
- Not for loud, gritty, urgent or data-dense topics, not for anything that needs exact diagrams or small text, and not for a machine where `backdrop-filter` is missing (the glass goes clear).

## Plan before coding

1. Write the script as 4 to 6 lines. Pick 3 to 5 moods that match the story beats (dawn, day, dusk, night or your own) and one hero card per beat.
2. Each sentence is one widget entering with a spring, living with a sway and leaving as the next one arrives. A shared object (a sun, a dial) can travel across scenes to link them.
3. Plan the dock: four small icons that mark the current mood, parked low in the frame.
4. Subject on screen within 0.3 s of each sentence starting; the last picture holds 1.5 s.
5. State facts in words on cards; only numbers you can cite go on screen.

## Palette and type

- Phase backgrounds, all pastel and never black: dawn `#ffe3cf` to `#ffc4a8` to `#ffb3b3`, day `#d6ecff` to `#a3d0ff` to `#b9c4ff`, dusk `#4a3596` to `#a45aa8` to `#ff9d7c`, night `#15123c` to `#2b2270` to `#5a3a9e`. Swap them for the story's moods and for the brand.
- Ink for text and line icons is indigo `#2a2060` or darker (faint pastel text on pastel is unreadable). Warm accent `#ffab3d`, cool `#6a56dc`. No pure black, no pure white fills (white at 20 to 90% alpha).
- Google Sans Flex, weights 600 to 750. No monospace, no serif.

## Drawing approach

- The background is N stacked `.ph` layers, each a linear base plus 5 or 6 big radial-gradient blobs (900 to 1250 px) that drift on their own `sine.inOut` loops (amplitude 130 to 220 px). Change mood by fading the next layer in over 1.8 to 2.4 s. Blobs are radial, never a full-screen linear gradient alone (it bands). Always add a grain overlay (an SVG feTurbulence tile, `mix-blend-mode: soft-light`, opacity .13) and a faint vignette.
- Glass is `.glass` in `helpers.md`: a translucent gradient fill, `backdrop-filter: blur(26px) saturate(1.5)`, a 2 px light border, a long soft shadow, an inner top highlight and a gloss `::after`. Crisp-edged bokeh discs behind the glass give the frosting something to blur.
- Glossy icon recipe: a radial body lit from the top left (near-white, bright mid, deeper rim), a second darker radial at the bottom for volume, a 3 px white 55% rim stroke and a white-to-clear ellipse highlight at the top left. Every icon (sun, moon, eye, brain, cloud, lamp) follows it; characters are rounded rectangles with the same gradients.
- Diagrams: a 24 h dial is a conic-gradient ring masked to an annulus and revealed by a CSS variable (`--p` tweened 0 to 360); curves are SVG paths revealed by `stroke-dashoffset`.
- Widget pattern: an outer point (placed, entered, moved) holding an inner point (floats and sways) with children around it. Tween opacity only on the children, never on the widget: an ancestor with opacity or a filter turns `backdrop-filter` off.

## Full frame around the caption band

vfrey draws its captions in a band (`--vf-caption-at`, `--vf-caption-h`; near 70% of a 9:16 frame when the position is bottom).

- The art sits in the top 62%: a hero card 700 to 1000 px wide between y 250 and 1100, so subjects are large. The frosted dock pill row sits low (about y 1655) and 2 or 3 large glass beads drift at the edges down to the bottom edge. Backgrounds fill all 1920 px; no area is empty.
- Captions sit on a plate: one near-white frosted plate (`rgba(255,255,255,.9)`, backdrop blur, radius 48) on `.vf-grp.on::before`, deep indigo words, the spoken word in an indigo pill with white text, `style: "box"`, size 66, `maxWords: 4`, the same place all film. Captions never sit over a hero card: aim the art above the band.
- Keep the bottom-right corner clear for the `AI-GENERATED` label.

## Motion rules

- Entrances: `elastic.out(1, 0.9)`, scale .84 to 1, y +70 to 0, rotationX 14 to 0 (with `transformPerspective: 1500`), children fading in with a .05 s stagger. Exits: `power2.in`, scale .9, y -60, 0.5 s.
- Ambient everywhere: every widget sways (`sine.inOut` yoyo, y of 12, rotationY of 5, between 3.6 and 6 s), glows pulse, stars twinkle, bokeh drifts. Finite repeats, `Math.ceil(DUR / d)`, never `repeat: -1`, never a negative position.
- No camera zoom: parallax only (stage 9 px, bokeh 18 px the opposite way).
- Time everything from `vfrey.timing.words`: sentence starts and key words found by their text.

## Transitions

Only two: the background mood cross-fade, and a widget exiting down and back while the next springs up. A shared object travelling across scenes links them. Nothing else.

## Sound

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` next to this file writes a warm detuned-sine pad (Fmaj9, Cmaj7, Am9, Dm9, 6 s a chord) with a sparse glassy arpeggio and automatic accents: a high glint at every sentence start, a filtered-noise swell just before it and a chime at the end. It takes no cue sheet. It needs only `python3` (standard library, no downloads) and always writes the same file for the same input. It takes about 20 seconds to run.

1. Make the video once without music, so the scene's `vfrey/timing.json` holds the real voice times.
2. From the project folder (there is no cue sheet; the accents come from the sentence times): `python3 .agents/skills/vfrey-style-soft-gradient/make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/<idea>-bed.wav`
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey soft gradient style)", "volume": -14, "duck": false}` and make it again with `--rerender`. If the run warns `audio.voice-clear`, lower `volume`.

One pass instead: `--duration 60` with no `--timing` writes the bed with no accents before the first render; vfrey trims it. Run it again after any script change. No `python3` on the machine (`python3 --version` fails): leave `music` out, say the video has no music and why, and do not install anything unasked.

## Checks before you call it done

1. Render, then make a 12-frame contact sheet and look at it: `ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`. Also check stills at the sentence starts (`npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`).
2. In every tile: is the hero card large and above the band, does colour reach the bottom edge, are the captions readable on their plate?
3. Is the glass frosted (not clear) in every shot, with bokeh behind it?
4. Is the ink dark enough on every pastel? Is any text under 40 px?
5. Does each mood change cross-fade and each widget spring in, and is the picture never a bare gradient?

## Pitfalls

- Stacking: give `#bg` `isolation: isolate; z-index: 0`, `#bokeh` 1, `#stage` 2, `#fore` 3, or the background layers paint over every card and the stage vanishes after the first mood change.
- A `const` helper used by `phase()` (the dock, an index table) must be defined before the first `phase()` call, or the script dies silently and the scene ends up a bare gradient. Run the scene once in headless Chromium (args `--use-mock-keychain --password-store=basic`, never the owner's browser) and read `pageerror`.
- `backdrop-filter` plus an ancestor with opacity gives clear glass: fade children only.
- Blur filters on moving groups make the render crawl: use radial gradients for glow.
- `tl.call` does not run when the renderer seeks: use `tl.set`. Put `immediateRender: false` on every `fromTo`.
- The overlap check can flag a number and its unit inside one label ("24" over "hours"): a false positive, rename the unit or ignore it.
