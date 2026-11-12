# Video styles

vfrey ships a library of video styles (2D flat, pixel art, isometric, paper cut-out, silhouette noir, real 3D, and more). **Each style is its own skill**, a folder `vfrey-style-<name>/` with a `SKILL.md`. Only the styles the project uses (its default and its series' styles) are installed, next to the vfrey skill in the project's skill folder; choosing a style installs it. Any other style is one `npx vfrey styles show <style>` away. A style teaches a look: palette, drawing approach, motion rules, caption treatment, transitions, pitfalls and key code patterns. It never teaches a topic, so any style works for any subject.

## See what exists

- `npx vfrey styles list` (`--json` for data): every style with a one-line description and what it is best for. `*` marks the project's default.
- `npx vfrey styles show <style>` prints a style's skill, so you can read it even if your agent did not load the skill folder. `npx vfrey styles path <style>` prints the folder its files are in. `npx vfrey styles start <style> scenes/<idea>` creates a scene folder from the style's starter with its companion scripts.

## Who chooses

The person, in the desk. A project default lives in Settings (stored as `videoStyle` in `vfrey.json`); each series can override it on its Kit tab (`desk series update --id <series> --video-style <style|none|default>`). On a series, `default` means this series follows the project's style; `none` means no fixed style, on purpose. A series style wins over the project, so set both to none if the whole channel should have no fixed style. With no style set anywhere, you decide the look.

The choice reaches you in four places: the `Style:` line in the Settings block of `npx vfrey series kit <series>`, the `Style:` line of the tick summary, the "Video style" section of an agent brief (`scenes/<idea>/agent/brief.md`), and `AGENTS.md`.

## What you do

1. Before writing scenes, find the chosen style. When one is chosen, load its skill (or run `npx vfrey styles show <style>`) and follow it for every scene. The brand (`brand.json`) still sets colours, fonts and the logo; the style says how to draw and move inside them. Where the two disagree, the brand wins and the style adapts.
2. When the person asks in plain words ("make it pixel art"), match the request to a style in the list and say which you chose. Make it the default with `npx vfrey styles use <style>`, or for one series with `desk series update`. Do not change a setting the person did not ask to change.
3. A style folder holds more than its `SKILL.md`: code helpers (a helpers page, and sometimes script files to copy into the scene folder) and a sound script that writes that style's music bed for the script's `music` field (`music.md`). The style's Sound section has the exact command; `npx vfrey styles show <style>` lists the files. **Start a scene with `npx vfrey styles start <style> scenes/<idea>`**: it creates the folder with the starter as `index.html` plus every companion script it loads (`papercut.js`, `sketch.js`, `comic.js`, `datadesk.js` and `land.js`), refuses a folder that already has files unless `--force`, prints what it copied and the next step (render a frame), and supports `--json`. The 3D styles (real-3d, low-poly) get their source in `src/<idea>/` and the exact esbuild bundle commands printed; it never installs three.js. For any other file, **copy from the folder `npx vfrey styles path <style>` prints**, never from a path you guess: the one real copy sits in `.agents/skills/` (Codex, Cursor, Gemini CLI, Grok), `.claude/skills/` links to it when Claude Code is one of the agents (or holds it when Claude Code is the only one), and a style the project does not use is only in the package. So: `cp "$(npx vfrey styles path noir)/starter.html" scenes/<idea>/index.html`, `python3 "$(npx vfrey styles path noir)/make-bed.py" ...`.
4. **Any shape, never stretched.** Every starter is drawn as a 9:16 design in 1080x1920 px and fitted into the real frame by `vfrey.fitStage("#root")` (or the starter's own fit: an SVG `viewBox` with `slice`, or a layout from `vfrey.frame`): at 16:9 the whole 9:16 design shows, centred, with the page background on both sides, never stretched or cut off. For a wide video (`--aspect 16:9`, or a series set to 16:9) re-lay the scene out wide: call `vfrey.fitStage("#root", { width: 1920, height: 1080 })`, place the shots side by side in that 1920x1080 design, and keep the style's palette, type and motion rules. Check both moments with `render --frame` before the tick.
5. When no style is chosen, choose the look yourself, as before.
6. A style that was removed is reported (`not installed`) and the run goes on with no fixed style. Never fail a video for it.

## Adding a style

Drop one more folder into the skills folder of the package (`skills/vfrey-style-<slug>/SKILL.md`), then `npx vfrey skill install` (and `npx vfrey init` in a project, which also adds missing style skills). Front matter:

```
---
name: vfrey-style-<slug>            # must equal the folder name
description: "Use when the chosen video style is <Name> ... "   # so agents load it when the style is chosen or asked for
metadata:
  style-name: <Name>                # shown in the desk
  style-summary: <one line>         # shown under the name
  style-best-for: explainer, story  # genres, comma separated (optional)
  style-poster: <slug>.jpg          # optional: a png, jpg or webp inside the folder
  style-preview: <slug>.mp4         # optional: a short mp4 or webm inside the folder
---
```
