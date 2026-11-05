# vfrey skill

Make short videos by asking your coding agent. This is the vfrey skill for Claude Code, Codex, Cursor, Gemini CLI and Grok. It tells the agent how to write the script, build the scenes, add captions, voice and music, and render the video on your own machine.

Version 1.0.0-beta.2. Generated from the vfrey release; do not edit by hand.

## Install

Pick the agent you use.

| Agent | Command |
| --- | --- |
| Any (Claude Code, Codex, Cursor, Gemini CLI, Grok) | `npx skills add vfreyai/skills` |
| Claude Code plugin | `claude plugin marketplace add vfreyai/skills` then `claude plugin install vfrey@vfrey` |
| Codex, Cursor | add the plugin from `vfreyai/skills` in the agent's plugin manager |
| Gemini CLI | `gemini extensions install https://github.com/vfreyai/skills` |

Restart the agent after installing so it sees the skill.

## Try it

Open any folder and ask your agent:

> Make me a 30-second explainer about how tides work.

If the folder has no vfrey project yet, the agent offers to create one and asks you first.

## What you need

- Node 22.13 or newer
- ffmpeg on your PATH

## What is free

The skill, the command line and rendering on your own machine are free. You pay only for the services you choose to connect, such as a voice or model provider, with your own keys.

## Docs

https://vfrey.ai/docs/quickstart
