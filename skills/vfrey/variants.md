# Variants: two or three versions of one idea

Use this when the person wants to try a few hooks, titles or covers for the same video, or asks "which opening works better". vfrey renders each version as its own run and the desk shows them side by side.

1. Pick the one thing that varies: `hook`, `title` or `cover`. Never more than one per set, or nobody can tell what made the difference.
2. Write the first script as usual: `scripts/<idea>.json`.
3. Copy it to `scripts/<idea>.v2.json` (and, for a third version, `scripts/<idea>.v3.json`). In the copy change only the varied part:
   - `hook`: the `hook` field and `lines[0]` (the line that speaks it). Keep every other line.
   - `title`: the `title` field.
   - `cover`: the `thumbnail` field (`{ "at": 2, "title": "..." }`) in every script, v1 included; without it no covers are made.
4. Run `npx vfrey tick --now --script scripts/<idea>.json --variants hook` (or `title`, `cover`). Add the usual flags (`--scene`, `--engine`, `--voice`) once: all versions share them, so the picture and the voice are the same.
5. vfrey compares the scripts. If a copy differs anywhere else it prints `Warning:` with the fields (for example `lines[3]`) and a Fix line, and the report lists the warning under `variants.warnings`. The versions still render. Fix the copy and run again unless the difference is on purpose.
6. Tell the person the run pages (one `See it:` per version) and that the run page has a Variants panel: the versions side by side and a "Mark favourite" button. You can mark it for them with `npx vfrey desk job favourite --id <run id>` when they tell you which one they prefer.

Good variants change a real choice: a question against a claim, a number against a story, a close-up against a wide shot for a cover. Do not change one word and call it a variant. The versions are not compared with each other by the variation check, but each is compared with the channel's earlier videos as always.

A video published from a variant records its variant id (`v1`, `v2`, `v3`) with the publication. Views per variant are not shown yet.
