# How each coding agent loads this skill

Read this when the skill is not showing up, or when the agent you run in differs from Claude Code. Back to `SKILL.md`.

The skill is plain Agent Skills files: `SKILL.md` plus the files next to it. It never needs a particular tool name. Where it says "run", use your shell tool; where it says "read", use your file-reading tool; where it says "ask", ask the person in the conversation and wait. If your agent has no way to ask (a headless or one-shot run), stop and say what you would do instead of guessing.

| Agent | Where the skill lives | After installing |
| --- | --- | --- |
| Claude Code | `.claude/skills/vfrey/` (project) or `~/.claude/skills/vfrey/`; or the plugin `vfrey@vfrey` | Restart Claude Code. Plugin skills are namespaced as `vfrey:vfrey`. |
| Codex | `.agents/skills/vfrey/` (project) or `~/.agents/skills/vfrey/`; or the plugin `vfrey@vfrey` | Codex picks up skills live; a plugin needs `codex plugin add`. |
| Cursor | `.agents/skills/vfrey/` (project) or `~/.agents/skills/vfrey/` (Cursor also reads `.cursor/skills/`); or a plugin in `~/.cursor/plugins/local/vfrey` | Restart Cursor, or run Developer: Reload Window. |
| Gemini CLI | `.agents/skills/vfrey/` (project) or `~/.agents/skills/vfrey/` (the alias of `.gemini/skills/`); or the extension `vfrey` | Run `/skills reload` in Gemini CLI; an extension needs a restart. |
| Grok | `.agents/skills/vfrey/` (project) or `~/.agents/skills/vfrey/` (Grok also reads `.grok/skills/`) | Grok picks it up live. |
| Antigravity | `.agents/skills/vfrey/` (project) or `~/.gemini/config/skills/vfrey/` | Start a new conversation; in the CLI (`agy`) run `/skills reload`. |
| Kiro | `.kiro/skills/vfrey/` (project, a link to the `.agents/skills` copy) or `~/.kiro/skills/vfrey/` | Start a new session. |
| Cline | `.cline/skills/vfrey/` (project, a link) or `~/.cline/skills/vfrey/` | Cline picks it up by itself. |
| Continue | `.continue/skills/vfrey/` (project, a link) or `~/.continue/skills/vfrey/` | Restart Continue or `cn`. |
| Qwen Code, Junie, Augment (Auggie), GitHub Copilot, Roo Code, Kilo Code, OpenCode, goose, Amp, Zed, Crush, Factory Droid, Warp, Devin (Windsurf) | `.agents/skills/vfrey/` (project) or `~/.agents/skills/vfrey/` | Start a new session (Copilot CLI: `/skills reload`; Kilo Code: `/reload`; Qwen Code and Zed pick it up live). |

A project keeps one real copy of each skill in `.agents/skills/`, which most agents read; when Claude Code, Kiro, Cline or Continue is one of the project's agents, its own folder (`.claude/skills/`, `.kiro/skills/`, `.cline/skills/`, `.continue/skills/`) holds a link to that copy (one of them alone gets the copy in its own folder). The project's agents are listed in `vfrey.json` (`agents`): `npx vfrey agents` shows them, `npx vfrey agents add <agent>` or `remove <agent>` changes them, and `npx vfrey agents clean` removes vfrey's own unedited copies from folders no picked agent reads. `npx vfrey skill install --agent <agent|all>` (`npx vfrey skill --help` lists every agent name) installs into your home folder outside a project, and `npx vfrey skill uninstall` removes it. `npx vfrey doctor` says which agents a project is set up for and when an installed copy is older than the vfrey you run.

## Differences that matter

- Starter prompts: Codex shows three on the plugin page; the others have none. They are plain requests ("make a video about X", "find creators who review Y"), which is also how to test that the skill loads.
- Commands that wait: a render takes minutes. Run it in the foreground if your shell tool allows a long command, otherwise start it in the background and poll `npx vfrey videos`. Never start the dashboard any way but `npx vfrey open`.
- Images and video you make yourself: only the "Made by your agent" engine (`agent-video.md`) needs your own image or video tools. If your agent has none, say so and offer another engine (`engines.md`).
- Chat apps (ChatGPT, Claude.ai) cannot run commands. They use vfrey's MCP server instead (see `SKILL.md`, last paragraph).
- Gemini CLI: Google's docs say unpaid-tier and Google One users moved to Antigravity on 18 June 2026. If the person is on Antigravity, install the skill with `npx vfrey skill install --agent antigravity` (or `npx vfrey agents add antigravity` in a project) and check it loads.
