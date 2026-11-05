# Brand kit

Read this when the project has a `brand.json`, or the person talks about their brand, colours, fonts, logo, or "make it look like us". Everything here is about how a video looks; the main steps are in `SKILL.md`.

## Read it first, design inside it

If `brand.json` is in the project folder, read it before you write a scene or choose a look. It is the person's identity: use their palette, their fonts and their logo, and follow `voiceStyle` and `notes` (words to avoid, tone, claims never to make) in the script as well. Do not invent a new palette for a brand that has one. Run `npx vfrey brand check` to see a preview card (`.vfrey/brand-preview.png`) and to catch a bad file; fix any `✗` line before rendering.

No `brand.json`: vfrey's own look is used. If the person says "use my logo/colours", write one (`npx vfrey brand init` writes a commented starter), put their files in the project (`assets/`), fill it in, and run `brand check`.

## The file

```json
{
  "name": "Acme",
  "colors": { "primary": "#1A73E8", "accent": "#FFB300", "ink": "#FFFFFF", "background": "#0B1020" },
  "fonts": {
    "display": { "file": "assets/Inter-Bold.woff2", "weight": 700, "source": "SIL Open Font License, fonts.google.com/specimen/Inter" },
    "body": { "family": "Liberation Sans" }
  },
  "logo": { "file": "assets/logo.png", "position": "top-right", "size": 14, "opacity": 1, "source": "the person's own logo" },
  "captions": { "style": "color", "color": "#FFFFFF", "highlight": "#FFB300", "font": "display" },
  "voiceStyle": "warm and unhurried",
  "notes": "Never say 'revolutionary'."
}
```

- `colors`: hex. `primary`, `accent`, `ink` (text) and `background` always exist (vfrey's own fill in what is left out); add up to 8 more names of the person's.
- `fonts.display` / `fonts.body`: `family` for a font vfrey has (Baloo 2, Titan One, JetBrains Mono, Google Sans Flex, Playfair Display), or `file` (ttf, otf, woff, woff2, inside the project) with `source`. **A font file must say where it came from and its licence** (`source`); use only fonts the person may embed in a video. A file outside the project, or a missing `source`, is a `✗` with a `Fix:`.
- `logo`: png, jpg or webp inside the project (a transparent PNG is best; export an SVG as PNG). `position`: `top-left`, `top-right`, `bottom-left` (the bottom right is the AI label). `size`: the widest it is drawn, percent of the frame width (4 to 40, default 14); its height is also capped at 6 % of the frame height. Record `source` like any asset.
- `music`: the default music bed `{ "file": "music/bed.mp3", "source": "own", "volume": -18, "duck": true }`. The file must be inside the project and `source` says where it came from (see `music.md`). A run's `--music`, the script's `music` and the series' `--music` all beat it.
- `captions`: `style` (`box`, `color`, `underline`, `pop`, `plain`), `color`, `highlight`, `highlightText`, `font` (`display`, `body` or a family). A script's own `captions` style still wins.
- Order, strongest first: `--brand FILE` on a run, the series' file (`npx vfrey desk series update --id ID --brand brands/kids.json`; `--brand default` clears it), the project's `brand.json`, vfrey's defaults. Colours merge name by name; fonts, logo and captions come whole from the strongest file that sets them.

## How every engine follows it

- **Default template** (no scene): the palette, the display font (Remotion's KineticType and EditorialSplit, and the HTML engines) and the logo.
- **Pictures & clips**: the logo is burned in, captions and on-screen text use the caption colours and the display font. Give it a font file for a font vfrey does not have; otherwise it draws in Baloo 2 and says so.
- **Covers** (`--thumbnail`): the plate, bar and title use the brand's background, primary, ink and display font. Pictures & clips covers also carry the logo, where the video draws it.
- **`scene init`** reads the brand: the starter scene uses `var(--vf-brand-*)` colours, the brand font and the logo (`vfrey/brand/`). `brand check` lists what follows the brand by itself (captions, covers, starters, Pictures & clips) and what does not (a scene you write or edit must use the variables and `vfrey.brand`).
- **Scenes you write**: vfrey writes `vfrey/brand.json`, `vfrey/brand.css` and the brand's files in `vfrey/brand/` at render time (do not edit them).
  - HTML: the render page already has `--vf-brand-primary`, `--vf-brand-accent`, `--vf-brand-ink`, `--vf-brand-background` (and any colour of the person's, in kebab case), `--vf-brand-display`, `--vf-brand-body` and an `@font-face` for each brand font file. Use `color: var(--vf-brand-primary)`, `font-family: var(--vf-brand-display)`. In script, `vfrey.brand` is `{ set, name, colors, fonts: { display, body }, logo, captions, voiceStyle, notes }`; draw the logo yourself with `<img src="vfrey/brand/logo.png">` (`vfrey.brand.logo.file`) where your layout wants it: the template burns no logo into a scene.
  - Remotion: `import { useBrand } from "@vfrey/scene"`; `useBrand().colors.primary`, `useBrand().fonts.display.css`, `staticFile("vfrey/brand/" + useBrand().logo.file)`.
  - `vfrey.captions(...)` and `<Captions/>` already use the brand's caption colours and font when you pass none.
  - `useBrand().set` / `vfrey.brand.set` is false when there is no brand file: the values are then vfrey's defaults, so the same code works either way.
- Check contrast yourself: `brand check` warns when `ink` on `background` is below 4.5:1.
