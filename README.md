# vfrey skill

<img src="assets/logo.png" width="48" alt="vfrey">

Make short videos and research social media by asking your coding agent. This is the vfrey skill for Claude Code, Codex, Cursor, Gemini CLI and Grok. It tells the agent how to write the script, build the scenes, add captions, voice and music, and render the video on your own machine. It also runs vfrey search: creators, trends and competitors on TikTok, Instagram, YouTube and Reddit.

Version 1.0.0-beta.8. Generated from the vfrey release; do not edit by hand.

## Install

Three ways to get the same skills. Restart your agent after installing so it sees them.

| Way | Install | Remove |
| --- | --- | --- |
| The skills installer (any agent: Claude Code, Codex, Cursor, Gemini CLI, Grok; works before vfrey is installed) | `npx skills add vfreyai/skills`. One style: add `--skill vfrey-style-pixel-art`. See the list: add `--list`. | `npx skills remove vfrey` |
| From vfrey itself | `npx vfrey init` writes a project's skills; `npx vfrey skill install --agent claude` installs the vfrey skill (also `codex`, `grok`, `cursor`, `gemini`, `all`). The Kit tab of the dashboard picks a style from the ones that came with the project. | `npx vfrey skill uninstall` |
| A zip, no npx | Download a zip from [Downloads](#downloads), unzip it into your agent's skills folder and restart the agent. | Delete the folder |

Plugins: `claude plugin marketplace add vfreyai/skills` then `claude plugin install vfrey@vfrey` (Claude Code); `codex plugin marketplace add vfreyai/skills` then `codex plugin add vfrey@vfrey` (Codex); `gemini extensions install https://github.com/vfreyai/skills` (Gemini CLI). Cursor: `npx skills add vfreyai/skills -a cursor`. Plugins install the whole repository, so you get every style together with vfrey.

## Styles

A style is a look for your videos: the colours, the drawing, the camera and the music. vfrey makes every video in one style, and each style is its own small skill (`vfrey-style-<name>`) that you can install on its own, without the rest of vfrey. If vfrey is not installed, your agent offers to install it first, so a style installed alone still works. Click a picture for the style's folder and full preview video. All 23 are also on https://vfrey.ai/render/showcase.

| Preview | Style | Install | Download |
| --- | --- | --- | --- |
| <a href="skills/vfrey-style-flat-2d"><img src="assets/gifs/flat-2d.gif" width="80" alt="2D flat"></a> | **2D flat**<br>Friendly cartoon people, bold flat colours and charts that grow as the voice explains. | `npx skills add vfreyai/skills --skill vfrey-style-flat-2d` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-flat-2d.zip) |
| <a href="skills/vfrey-style-storybook"><img src="assets/gifs/storybook.gif" width="80" alt="Storybook watercolour"></a> | **Storybook watercolour**<br>A hand-painted picture book with soft watercolour pages that turn, a paper caption strip and a gentle lullaby. | `npx skills add vfreyai/skills --skill vfrey-style-storybook` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-storybook.zip) |
| <a href="skills/vfrey-style-paper-cutout"><img src="assets/gifs/paper-cutout.gif" width="80" alt="Paper cut-out"></a> | **Paper cut-out**<br>Scenes made of layered cut and torn paper, with puppets that move like stop-motion and titles of cut-out letters. | `npx skills add vfreyai/skills --skill vfrey-style-paper-cutout` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-paper-cutout.zip) |
| <a href="skills/vfrey-style-comic-halftone"><img src="assets/gifs/comic-halftone.gif" width="80" alt="Comic halftone"></a> | **Comic halftone**<br>A comic page that comes alive, with bold ink outlines, dotted shading, panels that smash in and loud sound-effect lettering. | `npx skills add vfreyai/skills --skill vfrey-style-comic-halftone` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-comic-halftone.zip) |
| <a href="skills/vfrey-style-whiteboard-sketch"><img src="assets/gifs/whiteboard-sketch.gif" width="80" alt="Whiteboard sketch"></a> | **Whiteboard sketch**<br>A marker draws everything live on a whiteboard, with hand lettering, doodles, arrows and eraser wipes. | `npx skills add vfreyai/skills --skill vfrey-style-whiteboard-sketch` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-whiteboard-sketch.zip) |
| <a href="skills/vfrey-style-one-line"><img src="assets/gifs/one-line.gif" width="80" alt="One-line minimal"></a> | **One-line minimal**<br>One unbroken ink line draws each idea in turn on warm paper, then flows on into the next. Calm and hypnotic. | `npx skills add vfreyai/skills --skill vfrey-style-one-line` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-one-line.zip) |
| <a href="skills/vfrey-style-soft-gradient"><img src="assets/gifs/soft-gradient.gif" width="80" alt="Soft gradient"></a> | **Soft gradient**<br>Drifting pastel colour fields with frosted glass cards and glossy icons that float in gently. | `npx skills add vfreyai/skills --skill vfrey-style-soft-gradient` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-soft-gradient.zip) |
| <a href="skills/vfrey-style-real-3d"><img src="assets/gifs/real-3d.gif" width="80" alt="Real 3D"></a> | **Real 3D**<br>A real 3D camera flying between glowing, lit objects in deep space, like a science documentary. | `npx skills add vfreyai/skills --skill vfrey-style-real-3d` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-real-3d.zip) |
| <a href="skills/vfrey-style-low-poly"><img src="assets/gifs/low-poly.gif" width="80" alt="Low-poly 3D"></a> | **Low-poly 3D**<br>A bright toy world made of flat coloured triangles, filmed by a camera that glides around a floating diorama. | `npx skills add vfreyai/skills --skill vfrey-style-low-poly` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-low-poly.zip) |
| <a href="skills/vfrey-style-isometric"><img src="assets/gifs/isometric.gif" width="80" alt="Isometric miniature world"></a> | **Isometric miniature world**<br>A tiny model world seen from above, with a glowing dot that travels through it as the voice explains. | `npx skills add vfreyai/skills --skill vfrey-style-isometric` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-isometric.zip) |
| <a href="skills/vfrey-style-map-documentary"><img src="assets/gifs/map-documentary.gif" width="80" alt="Map documentary"></a> | **Map documentary**<br>A hand-inked atlas the camera glides over, where a route draws itself and the flat map folds into a globe. | `npx skills add vfreyai/skills --skill vfrey-style-map-documentary` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-map-documentary.zip) |
| <a href="skills/vfrey-style-parallax-25d"><img src="assets/gifs/parallax-25d.gif" width="80" alt="2.5D Diorama"></a> | **2.5D Diorama**<br>Pixel-art characters in a lit 3D miniature town, with long sun shadows, a tilt-shift blur and a slow camera move. | `npx skills add vfreyai/skills --skill vfrey-style-parallax-25d` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-parallax-25d.zip) |
| <a href="skills/vfrey-style-data-story"><img src="assets/gifs/data-story.gif" width="80" alt="Data story"></a> | **Data story**<br>Animated maps and charts like a newspaper data desk, with counting numbers and dots that regroup into bars. | `npx skills add vfreyai/skills --skill vfrey-style-data-story` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-data-story.zip) |
| <a href="skills/vfrey-style-screen-demo"><img src="assets/gifs/screen-demo.gif" width="80" alt="Screen demo"></a> | **Screen demo**<br>A clean, light fake app on screen where a cursor clicks and zooms in on the exact detail the voice is explaining. | `npx skills add vfreyai/skills --skill vfrey-style-screen-demo` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-screen-demo.zip) |
| <a href="skills/vfrey-style-blueprint"><img src="assets/gifs/blueprint.gif" width="80" alt="Blueprint"></a> | **Blueprint**<br>A drafted engineering sheet on blueprint blue, drawn line by line, with colour-coded arrows showing how it works. | `npx skills add vfreyai/skills --skill vfrey-style-blueprint` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-blueprint.zip) |
| <a href="skills/vfrey-style-terminal"><img src="assets/gifs/terminal.gif" width="80" alt="Terminal / ASCII"></a> | **Terminal / ASCII**<br>A glowing old-school computer screen where everything is typed and drawn from text characters. | `npx skills add vfreyai/skills --skill vfrey-style-terminal` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-terminal.zip) |
| <a href="skills/vfrey-style-kinetic-type"><img src="assets/gifs/kinetic-type.gif" width="80" alt="Kinetic type"></a> | **Kinetic type**<br>Huge words that fill the screen and move with the voice, like the opening titles of a film. | `npx skills add vfreyai/skills --skill vfrey-style-kinetic-type` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-kinetic-type.zip) |
| <a href="skills/vfrey-style-post-comments"><img src="assets/gifs/post-comments.gif" width="80" alt="Post and comments"></a> | **Post and comments**<br>A public Reddit or Threads post and its top comments as clean cards, read aloud with captions and credited on screen. | `npx skills add vfreyai/skills --skill vfrey-style-post-comments` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-post-comments.zip) |
| <a href="skills/vfrey-style-footage-split"><img src="assets/gifs/footage-split.gif" width="80" alt="Footage split"></a> | **Footage split**<br>Your own footage in one half of a split screen (or behind everything), the key point and captions in the other. | `npx skills add vfreyai/skills --skill vfrey-style-footage-split` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-footage-split.zip) |
| <a href="skills/vfrey-style-pixel-art"><img src="assets/gifs/pixel-art.gif" width="80" alt="Pixel art"></a> | **Pixel art**<br>A retro video game look with chunky pixels, little animated characters and chiptune music. | `npx skills add vfreyai/skills --skill vfrey-style-pixel-art` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-pixel-art.zip) |
| <a href="skills/vfrey-style-neon-synthwave"><img src="assets/gifs/neon-synthwave.gif" width="80" alt="Neon synthwave"></a> | **Neon synthwave**<br>Glowing neon line drawings on a purple night sky with a striped sun, a drifting grid floor and VHS glitches. | `npx skills add vfreyai/skills --skill vfrey-style-neon-synthwave` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-neon-synthwave.zip) |
| <a href="skills/vfrey-style-vintage-newspaper"><img src="assets/gifs/vintage-newspaper.gif" width="80" alt="Vintage newspaper"></a> | **Vintage newspaper**<br>A yellowed old newspaper page where headlines are stamped in and the engraved pictures come alive, story by story. | `npx skills add vfreyai/skills --skill vfrey-style-vintage-newspaper` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-vintage-newspaper.zip) |
| <a href="skills/vfrey-style-noir"><img src="assets/gifs/noir.gif" width="80" alt="Silhouette noir"></a> | **Silhouette noir**<br>Dark, foggy scenes of black shapes lit by one warm light, like the opening of a mystery film. | `npx skills add vfreyai/skills --skill vfrey-style-noir` | [Download .zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-style-noir.zip) |

The showcase at https://vfrey.ai/render/showcase has 27 films: 22 use a style above, 5 are one-off looks the agent drew from scratch.

### About the sample films

The sample films and previews here were made by AI agents, mostly Claude Sonnet 5.5 at medium effort. Some were remade or edited by Claude Opus 5.5, and a few mix models; the showcase page credits each film: https://vfrey.ai/render/showcase. The result depends on the model your own agent runs and on the style, so yours can be better or worse than these.

## Downloads

- [vfrey-complete.zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-complete.zip): The vfrey skill and all 23 styles.
- [vfrey-styles-all.zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-styles-all.zip): All 23 styles, without the vfrey skill.
- [vfrey-bundle-illustrated.zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-bundle-illustrated.zip): Drawn, painted and cut-paper looks. 7 styles.
- [vfrey-bundle-3d.zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-bundle-3d.zip): Cameras that fly through lit objects, toy worlds and maps. 5 styles.
- [vfrey-bundle-data.zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-bundle-data.zip): Charts, screens, drafting sheets and big moving words. 5 styles.
- [vfrey-bundle-social.zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-bundle-social.zip): Reddit and Threads posts, and your own footage. 2 styles.
- [vfrey-bundle-retro.zip](https://github.com/vfreyai/skills/releases/latest/download/vfrey-bundle-retro.zip): Pixels, neon, old newsprint and dark mystery. 4 styles.
- [SHA256SUMS.txt](https://github.com/vfreyai/skills/releases/latest/download/SHA256SUMS.txt): check a file with `shasum -a 256 -c SHA256SUMS.txt --ignore-missing`

The 23 single styles are the Download .zip links above. Unzip into your agent's skills folder (a project's, or your home folder's, below) so each skill keeps its own folder, then restart the agent.

| Agent | Skills folder | After unzipping |
| --- | --- | --- |
| Claude Code | `.claude/skills/` (project) or `~/.claude/skills/` | Restart Claude Code. Plugin skills are namespaced as `vfrey:vfrey`. |
| Codex | `.agents/skills/` (project) or `~/.agents/skills/` | Codex picks up skills live; a plugin needs `codex plugin add`. |
| Cursor | `.agents/skills/` (project) or `~/.agents/skills/` (Cursor also reads `.cursor/skills/`) | Restart Cursor, or run Developer: Reload Window. |
| Gemini CLI | `.agents/skills/` (project) or `~/.agents/skills/` (the alias of `.gemini/skills/`) | Run `/skills reload` in Gemini CLI; an extension needs a restart. |
| Grok | `.agents/skills/` (project) or `~/.agents/skills/` (Grok also reads `.grok/skills/`) | Grok picks it up live. |
| Antigravity | `.agents/skills/` (project) or `~/.gemini/config/skills/` | Start a new conversation; in the CLI (`agy`) run `/skills reload`. |
| Kiro | `.kiro/skills/` (project, a link to the `.agents/skills` copy) or `~/.kiro/skills/` | Start a new session. |
| Cline | `.cline/skills/` (project, a link) or `~/.cline/skills/` | Cline picks it up by itself. |
| Continue | `.continue/skills/` (project, a link) or `~/.continue/skills/` | Restart Continue or `cn`. |
| Qwen Code, Junie, Augment (Auggie), GitHub Copilot, Roo Code, Kilo Code, OpenCode, goose, Amp, Zed, Crush, Factory Droid, Warp, Devin (Windsurf) | `.agents/skills/` (project) or `~/.agents/skills/` | Start a new session (Copilot CLI: `/skills reload`; Kilo Code: `/reload`; Qwen Code and Zed pick it up live). |

## What you need

- Node 22.13 or newer
- ffmpeg on your PATH

The skill runs the vfrey command line for you (`npx @vfrey/vfrey` the first time). Check the machine any time with `npx @vfrey/vfrey doctor`.

## What is free

The skill, the command line and rendering on your own machine are free. You pay only for the services you choose to connect, such as a voice or model provider, with your own keys, and for vfrey search and cloud features, which use credits and always ask first.

## Docs

https://vfrey.ai/docs/quickstart
