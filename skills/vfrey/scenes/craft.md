# Scene craft

Read this before you design a scene. It is about the picture, not the commands (those are in `../SKILL.md`). Numbers are given for 9:16 (1080x1920) and as fractions of the frame, because the frame is the person's choice (`--aspect`, `--size`; `../formats.md`). Never hard-code 1080 or 1920: size the root with `100%`, size type and shapes from `var(--vf-vmin)` (the shorter side; `vfrey.frame.vmin`, `useFrame().vmin`), and keep to the safe areas `vfrey.js` sets (`--vf-safe-top/right/bottom/left`, `--vf-caption-top/bottom`). These are defaults: the idea in front of you can break one on purpose, but know which.

## 1. Plan before you write HTML

1. Read the script aloud in your head and mark the **picture moments**: the hook, each claim, the turn, the last line. A short is 15 to 45 seconds; something on screen should change at every beat (`vfrey.timing.beats`), and nothing should sit unchanged for more than about 3 s.
2. Pick **one idea for the picture** that is not a text slide: a comparison drawn as two objects, a counter, a diagram that builds, a stick figure acting it out. Words are already in the voice and the captions; the picture must add something the words do not.
3. Write down the look as numbers before coding: ground color, ink color, one accent, one display font, one body font, a corner radius. Put them in CSS variables on `#root` and use only those.
4. Sketch the layout as three bands (below), then build it in that order: ground, big shapes, text, then motion.

## 2. The frame: bands and safe areas

Read the frame, then plan. `vfrey.frame` (HTML) and `useFrame()` (Remotion) give `{ width, height, fps, aspect, orientation, vmin, safe }`; the same numbers are CSS variables in HTML (`--vf-vmin`, `--vf-safe-*`, `--vf-caption-top`, `--vf-caption-bottom`, and `--vf-caption-at`, `--vf-caption-h`, `--vf-caption-position` for the caption block).

```
9:16 (tall)                          16:9 (wide)
top margin   0-10 %  platform UI     top margin   0-6 %
hero zone    10-63 %                 hero zone    6-75 %   (picture left or centre, headline beside or above it)
caption zone 63-77 % (centre 70 %)   caption zone 75-90 %  (bottom 130 px or more)
no text      80-100 % platform UI    label zone   90-100 % (bottom right)
             right 13 %: button rail
```

| Ratio | Safe top | Safe bottom | Sides | Captions `top` / `bottom` | Arrange |
| --- | --- | --- | --- | --- | --- |
| 9:16 | 10.4 % (200 px) | 20 % (384 px) | 4.6 % left / 13 % right (140 px) | 200 px / 452 px (the block centred at 70 %) | stack: picture, headline, captions |
| 4:5, 3:4, 2:3 | 6 % | 10 % | 5 % | 7 % / 9 % of the height | stack, shorter bands |
| 1:1 | 6 % | 9 % | 6 % | 7 % / 9 % | one focal element, captions under it |
| 16:9, 4:3, 5:4, 21:9 | 6 % | 9 % | 5.5 % | 8 % / 10 % | side by side: picture one side, words the other |

Every ratio keeps its bottom edge at least 130 px clear for the label. 9:16 is TikTok-safe: its bottom 20 % (the platform's caption and handle) and right 13 % (the like, comment and share rail) carry no text, so the bottom caption block sits with its centre at about 70 % of the height. Other ratios keep the numbers above. `captions.position` (`top`, `middle`, `bottom`) in the script uses these edges for the frame in use, so a scene that calls `vfrey.captions` follows it with no extra work.

**Where the captions go: the effective position.** It is the script's `captions.position`, else the series' (`npx vfrey desk series update --id S --caption-position top`; `default` clears it), else `vfrey.json` (`{ "captions": { "position": "top" } }`), else `bottom` (the scene decides). vfrey gives the scene the result, so place the block from these and it moves with the setting, in every ratio:

| HTML (CSS variable / `vfrey.*`) | Remotion | Meaning |
| --- | --- | --- |
| `--vf-caption-at` (`vfrey.captionBox.top`) | `useCaptionBox().top` | top edge of the caption block for the effective position, px |
| `--vf-caption-h` (`vfrey.captionBox.height`) | `useCaptionBox().height` | height of the block, a quarter of vmin (23 %) |
| `--vf-caption-position` (`vfrey.captionBox.position`) | `useCaptionBox().position` | `top`, `middle` or `bottom` |
| `--vf-caption-top`, `--vf-caption-bottom` (`vfrey.frame.safe.captionTop` / `captionBottom`) | `useFrame().safe.captionTop` / `captionBottom` | fixed edge distances for `top` and `bottom`; they do NOT change with the position |

`#captions { position: absolute; left: var(--vf-safe-left); right: var(--vf-safe-right); top: var(--vf-caption-at); height: var(--vf-caption-h); }` is the whole recipe. Do not write `top: var(--vf-caption-top)` or `bottom: var(--vf-caption-bottom)` and expect the block to follow the script: those two always mean "the top edge" and "the bottom edge". (vfrey still moves a block that `vfrey.captions` / `<Captions>` draws to the effective position, but a wrapper with its own transform or a different positioned parent can break that. A block you placed by hand is left where it is when its centre is already in the third of the frame the position means (top, middle or bottom third): `#captions { top: 65%; height: 11% }` stays put under `bottom`. It is moved only when it sits in another third. In Remotion that counts for a `style` with a numeric `height` and `top` or `bottom`.) Lay the rest of the scene out around `--vf-caption-position`: when it is `top` keep the headline below the block, when `bottom` keep it above, when `middle` keep the picture clear of the middle band.

`npx vfrey scene inspect DIR --script SCRIPT.json` checks it: when the effective position is set and the captions element's box is outside the band for it (top third, middle third, bottom third of the frame), it prints a warning with a Fix line.

- Plan by orientation. Portrait: bands stacked top to bottom. Landscape: two columns (picture and words), the caption line along the bottom. Square: one centred element. In HTML use media queries on the frame, for example `@media (min-aspect-ratio: 6/5) { ... }` for wide and `@media (max-aspect-ratio: 3/5) { ... }` for 9:16; in Remotion branch on `useFrame().orientation`. `examples/octopus-facts` does this.
- Side margin 5 % of the width minimum for anything that must be read; nothing important within 4 % of an edge.
- vfrey burns the `AI-GENERATED` label on top at the bottom right (about 322x58, right margin 72 px, bottom margin 56 px) in every ratio. Keep your own content out of that corner. Never try to cover it.
- Captions are yours to place (`vfrey.captions("#captions", ...)`); put the block at `top: var(--vf-caption-at); height: var(--vf-caption-h)` (about 23 % of vmin tall; it follows `captions.position`). If you move them up, keep the box clear of the label and never over the focal point. Do not run a second block of text through the caption zone while captions are showing.
- Phones crop and overlay the lower right of a tall short. Put the single most important thing in the upper two thirds, centred. On a wide frame keep it in the middle third.
- On tall shapes (9:16, 2:3, 3:4) use the middle third. Do not leave a wide empty band between a headline at the top and captions at the bottom: put the diagram, number or figure there and scale it to fill the width (60 to 90 % of it). If the hero is small, make it bigger before adding a second element. After a render, the checks warn when two texts overlap (`frames.text-overlap`, with a Fix naming both and the time); give each text its own band.
- Use full-width absolutely positioned containers with `text-align: center`. Avoid `left: 50%` plus `translateX(-50%)` on an element GSAP also transforms.
- Do not hard-code a height for text you fill from the script; size by `max-width` and let it wrap, then check a frame in each ratio you will render.

## 3. Type

Sizes are fractions of `vmin` (`calc(var(--vf-vmin) * 0.2)`); the pixel figure is for a 1080 frame.

| Role | Size | Notes |
| --- | --- | --- |
| Hero word or number | 20 to 39 % (220 to 420 px) | one per beat, fills 60 to 90 % of the width |
| Headline | 8 to 12 % (90 to 130 px) | at most 2 lines, 3 to 7 words |
| Support line / label | 4.4 to 6 % (48 to 64 px) | never below 4 % (44 px): it is unreadable on a phone |
| Captions | 6 to 8 % (64 to 88 px) | set through `vfrey.captions` options; the default follows vmin |
| Small chrome (units, tags) | 3.3 to 4 % (36 to 44 px) | decoration only, never the message |

- Use the supplied fonts: Baloo 2 (loud rounded display; it and the Noto faces behind it cover Latin and Latin Extended (French, German, Polish, Turkish, Vietnamese), Devanagari, Arabic, Hebrew, Thai, Bengali and Japanese, so the default stack never shows tofu), Titan One (Latin only), Google Sans Flex (clean body, many weights), JetBrains Mono (numbers, code, labels; Latin only, so put the Noto stack behind it for other scripts), Playfair Display (an editorial serif for archival, literary and history looks; weights 400 to 900 and an italic, Latin, Latin Extended and Vietnamese: `font-family: "Playfair Display", "Noto Sans Arabic", Georgia, serif`). Pair one display with one body; do not add a third. No Google Fonts link, the network is blocked.
- Line height 1.0 to 1.1 for display, 1.25 for body. Tight tracking (-0.01em) for big type, wide (0.08em) for small uppercase tags.
- Contrast ratio at least 4.5:1 against the ground right behind the text. White text on a mid-tone gets a dark scrim or a solid chip, not a drop shadow.
- Keep the same type scale for the whole film. Vary size by role, not at random.
- Highlight one word per line in the accent color. Two accents on one line fight.

## 4. Color

- A ground, an ink, one accent, and at most one support color. Choose them from the subject (its era, materials, the place it lives), not from a default palette. Pure white grounds with blue accents and dark purple gradients with neon are where unprompted scenes land; use them only when the idea is that.
- Full-screen linear gradients on dark grounds band after video compression. Use a solid fill, a radial gradient, or a solid with a local glow.
- An accent at 5 % opacity vanishes in compression: 15 to 25 % for atmosphere, full strength for the focal element.
- Change the ground color between acts of the story (hook, explanation, payoff) with a quick flood, so the film has chapters.

## 5. Motion principles

The timeline is `vfrey.timeline()`, one paused GSAP timeline. Cue with `vfrey.onLine(i, (tl, t) => ...)`, `vfrey.onWord(i, ...)` or `vfrey.at(sec, ...)`; every tween takes its position `t` so it lands on the spoken moment. Frames are a function of timeline time, so never use `Date.now`, `requestAnimationFrame`, CSS animations or `Math.random()` (use a seeded generator written inline if you need scatter).

- **Ease by role.** Arrivals: long tail (`power4.out`, `expo.out`). Camera moves and color floods: `power2.inOut`. Exits and zooms-through: `power3.in`. Linear only for rotation, progress and constant speed. The same `power2.out` at 0.5 s on everything is what makes a scene look generated.
- **Durations.** A fast move 0.3 to 0.6 s. Landing is slower than leaving; an exit is 40 to 50 % shorter than its entrance. Under 0.2 s reads as a glitch unless it is a deliberate whip.
- **Overlap.** Start the next element when the previous is 30 to 50 % done. Fully sequential looks robotic; everything at once looks cheap. Stagger: letters one frame apart, words 60 to 120 ms, list items 40 to 80 ms.
- **Springs.** `back.out(1.4)` or `elastic.out(1, 0.5)` for position and size only. Opacity and color never bounce. Bounce on UI reads as a toy; keep it for characters and objects.
- **Titles land dead still.** Once a title has arrived it stops. Move the next element, or the world behind it, instead. Do not let a headline creep with a slow scale, breathe, float or pulse; those are fillers.
- **Vary the entrance.** Not every element fades and slides up. Mix: per-word blur-in (`filter: blur(6px)` to 0, 0.13 s, 0.07 s apart), a mask or `clip-path` reveal, a wipe from a shape, a drop with a squash, a count-up, a line that draws itself (animate `strokeDashoffset`).
- **Motion that earns its place:** an object doing the thing the line says (the pieces assembling, the bar growing to its value, the figure walking), a slow push on a background (3 to 5 degrees or 2 to 4 % scale over several seconds), a diagram building step by step.
- **Hold to read.** A line of text the viewer must read holds about 0.5 s plus 0.3 s per word. The last line holds at least 1.5 s before the film ends (the film is voice length plus 0.3 s, so end your final tween before then).
- **Transitions have a cause**: a shape grows to become the next ground, the old content blurs out as the new blurs in on the same stage, a color floods across, the figure pushes the old panel off. Pick two or three kinds for a short, not a different one per beat. Do not crossfade between unrelated scenes.
- **Move with transforms.** Tween `x`, `y`, `scale`, `rotation`, `opacity`, `clipPath`, `filter`. Do not animate `left`, `top`, `width` or `height`; they relayout and jitter.
- **Never fight the timeline.** One tween per property per element at a time; use `fromTo` rather than `from` when an element is shown twice; a `tl.set(el, { opacity: 0 }, end)` hard-kills a hidden element so no stale frame stays; do not tween `visibility` with `.to` (use `set`).

## 6. Pacing to the voice

- `vfrey.timing.lines[i]` and `words[j]` carry `start` and `end` in seconds. Anchor each *picture change* to the start of its line (`onLine`) or to the key word (`onWord`), so the picture lands as the claim is spoken, not before and not after. Slight lead (0.05 to 0.15 s before the word) feels in sync.
- Number or object a line names should appear with the word that names it. A statistic appearing a beat after the voice says it looks like a mistake.
- Hook (line 0): something moving within the first 0.3 s, the hero element on screen by 1 s. No logo sting, no empty frame.
- Beats of one second or less: one element. Beats of three to six seconds: a small sequence, with motion inside the beat so it never sits still.
- Contrast speeds: a fast montage of three to five quick changes, then a held frame, then the payoff. Hold 0.3 to 0.7 s before the payoff.
- Layout changes on a bar-sized unit (a new line of the script), small accents on word beats.

## 7. Structure that survives a render

- One `#root` that fills the frame (`width: 100%; height: 100%`, `data-composition-id="main"`; vfrey sets its `data-width`, `data-height` and `data-fps` from the frame), children absolutely positioned. Put every initial state in CSS (hidden things `opacity: 0`) so the first frame is right before the timeline runs.
- Build every animation synchronously, in the same script that calls `vfrey.timeline()`. No `await`, no `setTimeout`, no `fetch`: the timeline must be complete when the page loads.
- Grain, paper fibre or noise over the whole frame changes every pixel every frame and compresses badly: platforms re-encode it harder. Keep such a texture faint (opacity about 0.1) or still. After a render the `frames.bitrate` check says `Warning:` when the MP4 is unusually heavy for its size (over 12 Mbps at 1080x1920, scaled for other shapes); the video still finishes.
- Draw art as inline SVG or SVG files in the scene folder (`<img src="octopus.svg">`) and the supplied `vfrey/assets/` stick figures and glyphs. Nothing from the network; no remote image, font or script.
- To animate inline SVG art, put the position on a parent `<g transform>` and animate the child; animating a group that has a `transform` attribute throws it to the origin. The `scene.svg-transform` check warns when a tween in index.html moves an element with that attribute.
- Prefix ids by area (`#hero-title`, `#cmp-left`) so selectors do not collide with a block's ids.
- When a scene is long, build it as functions per beat (`function beat3(t) { ... }`) called from `vfrey.onLine`, so each beat reads on its own.

## 8. Mistakes that make a scene look generated

- An empty first frame: the title or the first diagram is on screen from frame 1 (animate within it); `frames.opening` warns when the first half second is mostly background.
- A text slide: the headline in the middle with a fade, then the next headline with the same fade.
- The same entrance on every element; everything fades and slides up 40 px.
- Captions over the picture's focal point, or a second text block in the caption zone.
- Content near the label (bottom right) or hugging an edge.
- Text under 44 px, or low contrast against a busy picture.
- Looping decoration (pulsing dots, floating shapes) used in place of meaning.
- Elements that never leave: the picture fills up with old content. Exit what is done, in one motion.
- A palette of five accent colors, or a default blue on white because no choice was made.
- Copying an example. Read one for the mechanics, then design for this idea.
- Reusing the previous video's scene with new text.

## 9. Check your own work

Render a still in each ratio you will use (`--aspect`), at the hook (`--frame 1`), a middle beat (`--frame` at a line start from `timing.lines`), and the last second, and look at each (`../SKILL.md` has the command). For each ask: is the focal element obvious in one glance? Is anything under the label or crossing the caption zone? Is any text under 4 % of the shorter side? Does the picture change at the beat? Fix, rerender, look again. Do not stop at one frame. Previews are timed by an estimate from your script until a voice exists (always pass `--script`; the `Timing:` line says which). **After the first full render, look again**: re-render the frames at the beat times from the real `timing.json` (`render --scene ... --script ... --frame <beat start>`); the preview now uses the real voice, so beats may land where the first previews did not show. Fix and render again.

## 10. Change just this

When the person says "make the title red" or "the chart appears too late", do not rewrite the scene. Find the exact element, rule and tween, change those, and look again:

```
npx vfrey scene inspect my-scene --at 2.5 --text "the title words"      # or --selector '#title'; add --json for everything
```

It loads the scene in the same headless Chrome as `render --frame` (network blocked), seeks the timeline to `--at`, and prints for each match: the selector path, the opening tag at `file:line:col`, its box in the frame, computed color, background, font, opacity and transform, the CSS declarations behind them (`*` marks the one that wins; a value inherited from an ancestor says so) and the GSAP tweens that move it, each with start, duration, end, ease, properties, the line that wrote it and the `vfrey.at`, `onLine`, `onWord`, `block` or `transition` cue that ran it. Pick `--at` where the problem shows.

Then edit only what it names: "red" is that one declaration (or the winning one, if two rules fight, or the tween if GSAP sets `color`); "too late" is the tween's position argument or the `onLine`/`at` time of its cue; "too slow" is its duration. Do not touch other rules, tweens or elements. Then check with `render --frame` at the same `--at` (and `scene inspect` again if you moved timing). HTML scenes only: for a Remotion scene it prints a `Fix:` line; use `--frame` and edit `index.tsx`.

More: `motion.md` (recipes for GSAP moves, transitions, count-ups, draw-on lines), `blocks.md` (ready-made pieces such as lower thirds, charts, code and overlays to restyle).
