# vfrey skill

Make short videos and research social media by asking your coding agent. This is the vfrey skill for Claude Code, Codex, Cursor, Gemini CLI and Grok. It tells the agent how to write the script, build the scenes, add captions, voice and music, and render the video on your own machine. It also runs vfrey search: creators, trends and competitors on TikTok, Instagram, YouTube and Reddit.

Version 1.0.0-beta.3. Generated from the vfrey release; do not edit by hand.

## Install

Pick the agent you use. Restart the agent after installing so it sees the skill.

| Agent | Install | Remove |
| --- | --- | --- |
| Any (Claude Code, Codex, Cursor, Gemini CLI, Grok) | `npx skills add vfreyai/skills` | `npx skills remove vfrey` |
| Claude Code plugin | `claude plugin marketplace add vfreyai/skills` then `claude plugin install vfrey@vfrey` | `claude plugin uninstall vfrey@vfrey` |
| Codex plugin | `codex plugin marketplace add vfreyai/skills` then `codex plugin add vfrey@vfrey` | `codex plugin remove vfrey@vfrey` |
| Cursor | `npx skills add vfreyai/skills -a cursor`, or copy this repository to `~/.cursor/plugins/local/vfrey` and reload the window | `npx skills remove vfrey` |
| Gemini CLI | `gemini extensions install https://github.com/vfreyai/skills` | `gemini extensions uninstall vfrey` |

A project that already uses vfrey gets the same skill from `npx vfrey skill install --agent <claude|codex|grok|cursor|gemini|all>`.

## Video styles

A style is a look for your videos: the colours, the drawing, the camera and the music. vfrey makes every video in one style, and each style is its own small skill (`vfrey-style-<name>`) that you can install on its own, without the rest of vfrey. Each one says so at the top: if vfrey is not installed, your agent offers to install it first, so a style installed alone still works.

| Style | What it looks like | Skill |
| --- | --- | --- |
| Blueprint | A drafted engineering sheet on blueprint blue, drawn line by line, with colour-coded arrows showing how it works. | `vfrey-style-blueprint` |
| Comic halftone | A comic page that comes alive, with bold ink outlines, dotted shading, panels that smash in and loud sound-effect lettering. | `vfrey-style-comic-halftone` |
| Data story | Animated maps and charts like a newspaper data desk, with counting numbers and dots that regroup into bars. | `vfrey-style-data-story` |
| 2D flat | Friendly cartoon people, bold flat colours and charts that grow as the voice explains. | `vfrey-style-flat-2d` |
| Isometric miniature world | A tiny model world seen from above, with a glowing dot that travels through it as the voice explains. | `vfrey-style-isometric` |
| Kinetic type | Huge words that fill the screen and move with the voice, like the opening titles of a film. | `vfrey-style-kinetic-type` |
| Low-poly 3D | A bright toy world made of flat coloured triangles, filmed by a camera that glides around a floating diorama. | `vfrey-style-low-poly` |
| Map documentary | A hand-inked atlas the camera glides over, where a route draws itself and the flat map folds into a globe. | `vfrey-style-map-documentary` |
| Neon synthwave | Glowing neon line drawings on a purple night sky with a striped sun, a drifting grid floor and VHS glitches. | `vfrey-style-neon-synthwave` |
| Silhouette noir | Dark, foggy scenes of black shapes lit by one warm light, like the opening of a mystery film. | `vfrey-style-noir` |
| One-line minimal | One unbroken ink line draws each idea in turn on warm paper, then flows on into the next. Calm and hypnotic. | `vfrey-style-one-line` |
| Paper cut-out | Scenes made of layered cut and torn paper, with puppets that move like stop-motion and titles of cut-out letters. | `vfrey-style-paper-cutout` |
| Pixel art | A retro video game look with chunky pixels, little animated characters and chiptune music. | `vfrey-style-pixel-art` |
| Real 3D | A real 3D camera flying between glowing, lit objects in deep space, like a science documentary. | `vfrey-style-real-3d` |
| Screen demo | A clean, light fake app on screen where a cursor clicks and zooms in on the exact detail the voice is explaining. | `vfrey-style-screen-demo` |
| Soft gradient | Drifting pastel colour fields with frosted glass cards and glossy icons that float in gently. | `vfrey-style-soft-gradient` |
| Storybook watercolour | A hand-painted picture book with soft watercolour pages that turn, a paper caption strip and a gentle lullaby. | `vfrey-style-storybook` |
| Terminal / ASCII | A glowing old-school computer screen where everything is typed and drawn from text characters. | `vfrey-style-terminal` |
| Vintage newspaper | A yellowed old newspaper page where headlines are stamped in and the engraved pictures come alive, story by story. | `vfrey-style-vintage-newspaper` |
| Whiteboard sketch | A marker draws everything live on a whiteboard, with hand lettering, doodles, arrows and eraser wipes. | `vfrey-style-whiteboard-sketch` |

Previews of all 20 are on https://vfrey.ai/examples.

### Install one style alone

Replace `vfrey-style-pixel-art` with any skill name from the table.

| Agent | Install one style | Remove |
| --- | --- | --- |
| Any (Claude Code, Codex, Cursor, Gemini CLI, Grok) | `npx skills add vfreyai/skills --skill vfrey-style-pixel-art` | `npx skills remove vfrey-style-pixel-art` |
| One agent only | `npx skills add vfreyai/skills --skill vfrey-style-pixel-art -a claude-code` (also `codex`, `cursor`, `gemini-cli`) | `npx skills remove vfrey-style-pixel-art -a claude-code` |
| Claude Code, Codex, Gemini CLI plugins | These install the whole repository, so you get every style together with vfrey. To get only one, use the row above. | |
| Copy by hand | Download the folder from https://github.com/vfreyai/skills/tree/main/skills (or the .zip on https://vfrey.ai/examples) into your agent's skills folder, for example `.claude/skills/` | Delete the folder |

To install several: `npx skills add vfreyai/skills --skill vfrey-style-pixel-art --skill vfrey-style-noir`. To see the list: `npx skills add vfreyai/skills --list`.

A project that already uses vfrey picks a style in the Kit tab of the dashboard; the style skills come with the project.

## Try it

Open any folder and ask your agent:

> Make me a 30-second explainer about how tides work.

If the folder has no vfrey project yet, the agent offers to create one and asks you first. Research needs no project:

> Find TikTok creators in Vietnam who review skincare.

The agent prices the search first and waits for your yes before it spends any credits.

## What you need

- Node 22.13 or newer
- ffmpeg on your PATH

The skill runs the vfrey command line for you (`npx @vfrey/vfrey@beta` the first time). Check the machine any time with `npx @vfrey/vfrey@beta doctor`.

## What is free

The skill, the command line and rendering on your own machine are free. You pay only for the services you choose to connect, such as a voice or model provider, with your own keys, and for vfrey search and cloud features, which use credits and always ask first.

## How each agent loads it

See `skills/vfrey/agents.md`.

## Docs

https://vfrey.ai/docs/quickstart
