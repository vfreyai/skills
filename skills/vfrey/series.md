# Plan a series

Use this when the person says "plan a series" or "plan N videos for this channel", or gives a channel brief with several themes (for example "habits and career stuff").

1. Before choosing any topic, list the themes the brief names, one per line, in its own words.
2. Spread the planned videos across all of them (5 videos and 2 themes: 3 and 2, never 5 and 0). Write which theme each video covers next to its title in the plan.
3. Check the plan against the list before you start. A theme with no video is a gap: fix the plan, or tell the person why one was left out.

Do not let the first theme that comes to mind fill the whole plan.

## One channel, one project

Two channels (say a TikTok channel and an Instagram one) are two things to set up, not one. Do not put them in the same project with a shared `vfrey.json`: its engine, shape, voice and style would be shared too, and the second channel gets the first one's defaults.

1. **One channel is one project** (`npm create vfrey@beta <dir>`, one folder per channel). If the person wants a single folder anyway, then **one series per channel**, each with its own engine, shape and style: `npx vfrey desk series create --id <channel> --account <id> --niche "<theme>" --engine <id> --aspect 4:5 --fps 24`. Create the series for each channel before the first video, and pass `--series <id>` when you make its videos.
2. Set per channel in the desk (the series' Engine and Video shape, or `desk series update`): the engine (`vfrey-framey` unless the channel is the person's own photos and footage: then `pictures`) and the shape; they win over run flags, and `series kit` prints them first. Write down in its `AGENTS.md` or notes: the caption position and the style line that keeps its look.
3. Check with `npx vfrey engine list` that each channel's engine is ready, and look at one video from each before making the rest.


## The series kit

A series keeps what makes it look and sound like itself as plain files in the project, so a new session (yours or another agent's) makes the next video consistent with the rest.

```
series/<series>/kit/
  kit.md            guidelines: audience, tone, words to use or avoid, claims never to make, the look, what a good video is
  style.md          the style line every image or scene prompt reuses (medium, palette, light, lens) and negative prompts
  characters/<name>/  sheet.png (and more angles), about.md (appearance, wardrobe, personality, voice)
  references/       look and layout references (png, jpg, webp), captions in references.md
  prompts/          reusable prompt templates
  kit.json          the manifest: files, roles, captions, sources and the kit hash
```

- Read it first: `npx vfrey series kit <series>` (`--json` for the data, `--paths` for the image paths only). Every run records the kit hash it used; changing the kit never rewrites an old run.
- The brand (colours, fonts, logo, captions) stays in `brand.json`; the kit points at it.
- Every image records its source (`own`, `generated:<tool>`, `licensed:<where>`). Limits: png, jpg or webp up to 10 MB; md or txt up to 64 KB; 200 files. `npx vfrey series kit check <series>` finds anything over, missing a source, or not what its name says.
- In `media.json`, a shot may name a character (`"character": "mia"`); its image should be generated with the style line and the character's sheet, and its `source` says so (`generated:<tool>`).
- The person can edit the kit on the dashboard's Series page, Kit tab. Do not change it yourself unless they ask.
