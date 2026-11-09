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
