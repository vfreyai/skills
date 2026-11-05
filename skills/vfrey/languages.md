# Language versions

One idea, one video per language. vfrey has no model, so **you translate**: write one script file per language and vfrey renders each.

## Steps

1. Write the base script, `scripts/<idea>.json`, and design the scene as usual.
2. Translate it to `scripts/<idea>.<lang>.json` for each language (`.vi.json`, `.es.json`, `.ar.json`). Same JSON shape; set `"language"` to the code if you like (it must match the file's code).
3. Run `npx vfrey tick --now --about "<subject>" --script scripts/<idea>.json --scene scenes/<idea> --series <id> --languages vi,es,ar` (no `--engine`: the series' engine is used; see `series kit`). A language version may name its own `voice` for its language.
   - `--languages` lists the videos to make. The base script's own language uses the base file; list it too (`en,vi,es`) if you want the original as well.
   - A language whose file is missing stops the run before anything renders, with a `Fix:` line naming the file.
   - Do not pass `--voice`: each language gets its own free voice, chosen by its code. Put `"voice"` in a language file to choose one.

## How to translate

- Keep every claim. Do not add, drop or strengthen one; do not invent a statistic, name or quote for the new language.
- Adapt idioms, jokes and examples so they read naturally, not word for word. Keep numbers, units and proper names right (convert units where the audience expects it).
- Keep the hook first and the same number of lines where you can. The scene is shared, so the beats should line up.
- Respect the length limits per language: 4 to 30 lines, at most 220 characters a line, 6 to 180 s of speech. Languages run longer or shorter than English (Spanish and Vietnamese often more words; Chinese and Japanese fewer characters); measure the speech, not the word count.
- Translate `title` (100 characters at most) and `hashtags` (start with `#`), and give each hashtag a form people in that language use. Add `"subject"` in the new language when the title does not carry the topic's key words.
- Right to left (Arabic, Hebrew, Persian, Urdu): write the lines normally; vfrey sets captions and the default template right to left. In your own scene use `dir="rtl"` text and test a frame with `--frame` (see `captions.md`).

## What you get

- One run per language, sharing the scene (and media plan), each with its own voice, timing, captions and covers.
- Files in `videos/`: `<date> <title>.<lang>.mp4` with `.srt`, `.vtt`, `.txt` beside each.
- The dashboard shows them as one idea with a tab per language. `npx vfrey tick --json` has `language` and `ideaId` on each job.
- Check `script.language`: the lines must read as the file's language. A mismatch rejects that run (the others still render); fix the file or its name.
- Captions and music are inherited from the base script when a language file sets none.
