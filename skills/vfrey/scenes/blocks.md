# Scene blocks

Blocks are ready-made pieces (lower thirds, charts, code panels, chat cards, overlays, backgrounds, transitions) you copy into your own scene and restyle. They are ingredients, not templates: the scene around them is still yours. HTML scenes only; a Remotion scene (`index.tsx`) gets a `Fix:` line, so write the piece in React instead.

## Find one

```
npx vfrey scene blocks                       # name, category, size, duration, fit
npx vfrey scene blocks --category chart      # one category
npx vfrey scene blocks --json
```

Categories: `lower-third`, `chart`, `diagram`, `chat`, `code`, `overlay`, `background`, `title`, `transition`. Choose by what the picture needs at that beat, and do not reach for a block when drawing the thing yourself says it better. At most one or two blocks in a short.

## Add and place it

```
npx vfrey scene add lt-clean-bar scenes/my-idea
```

This copies `blocks/<name>/<name>.html` into the scene folder and prints a snippet. Paste its `<div>` inside `#root`, after your own content so it paints on top (or before, for a background). Adding twice is a no-op; an edited copy is not overwritten without `--force`. Each block can be mounted **once** per scene (its composition id is its name).

The snippet's inline `style` already places it by the block's fit:

| Fit | Meaning |
| --- | --- |
| `native` | at most 1080 wide, centered as drawn |
| `crop` | the 1920x1080 canvas at full size, only its left 1080 px show: for pieces anchored left or at the bottom (lower thirds). Change `top` to move it; keep it clear of the caption zone and the label (see `craft.md`) |
| `scale` | the canvas is scaled to the frame width, a band across the middle; change `top` to move it |
| `cover` | scaled to the frame height and cropped at the sides: backgrounds and full-frame overlays |

Move or resize the mount freely; a block is ordinary HTML.

## Time it

A block is a sub-composition with its own GSAP timeline, seeked from `data-start`. Without a call it starts at 0. Set when it starts, after `const tl = vfrey.timeline()`:

```js
vfrey.onLine(1, (tl, t) => vfrey.block("#block-lt-clean-bar", t));       // when line 1 is spoken
vfrey.at(3.5, (tl, t) => vfrey.block("#block-data-chart", t, 4));        // at 3.5 s, for 4 s
vfrey.onWord(5, (tl, t) => vfrey.block("#block-snow", t));         // at a word
```

`duration` is optional; each block plays for its own length otherwise. Do not start it after the film ends (voice length plus 0.3 s). If you need it again later, copy the folder under a different name or build a second instance yourself.

## Restyle it

Open `blocks/<name>/<name>.html`. Colors, fonts, sizes and text are plain CSS and markup:

- Replace the placeholder text ("Your Brand", "Track title", "@yourhandle") with words from the script. Never leave placeholder text or a real person's or company's name on screen.
- Swap its colors and fonts for your scene's variables (the local fonts are Baloo 2 with Noto faces for other scripts, Titan One, JetBrains Mono, Google Sans Flex, Playfair Display). A block that keeps its default look next to your palette is the most visible sign of a pasted-in piece.
- Change its timings with the `gsap` calls inside, but keep it self-contained: its own timeline, no network, no randomness, no clock.
- Do not add a CDN script, remote font or remote image; the render has no network.

## Checks

Render a still at the moment it shows (`--frame` a little after the cue) and look: is it where you want it, readable at phone size, clear of the captions and the label, not covering the focal element? Then a frame before the cue: it must not be visible yet.
