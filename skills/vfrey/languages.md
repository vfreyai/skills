# Language versions

One idea, one video per language. vfrey has no model, so **you translate**: write one script file per language and vfrey renders each.

## Steps

1. Write the base script, `scripts/<idea>.json`, and design the scene as usual.
2. Translate it to `scripts/<idea>.<lang>.json` for each language (`.vi.json`, `.es.json`, `.ar.json`). Same JSON shape; set `"language"` to the code if you like (it must match the file's code).
3. Run `npx vfrey tick --now --about "<subject>" --script scripts/<idea>.json --scene scenes/<idea> --series <id> --languages vi,es,ar` (no `--engine`: the series' engine is used; see `series kit`). A language version may name its own `voice` for its language.
   - `--languages` lists the videos to make. The base script's own language uses the base file; list it too (`en,vi,es`) if you want the original as well.
   - A language whose file is missing stops the run before anything renders, with a `Fix:` line naming the file.
   - Do not pass `--voice`: each language gets its own free voice, chosen by its code. Put `"voice"` in a language file to choose one.
   - **Voice quality.** English uses Kokoro (`npx vfrey voice install`). Every other language the system voice reads sounds robotic; for a natural one install the free multilingual voice once, `npx vfrey voice install --language vi` (about 401 MB download, about 443 MB on disk, offline after), and it speaks Vietnamese, French, Spanish, German, Portuguese, Italian, Dutch, Russian, Japanese, Korean, Arabic, Hindi, Turkish, Polish, Indonesian, Ukrainian and others (31 languages, English included) by default. Chinese and Thai have no free local voice yet: the system voice reads them (ElevenLabs, with the person's own key, is the natural option there). If a run says `Voice: <name>, the system voice` for a non-English language, tell the person and offer that command first, ElevenLabs second.
   - Names: `supertonic:F1` to `F5` (female) and `M1` to `M5` (male); the same preset speaks every language. `npx vfrey voice list --language vi` shows what is ready and the default for that language.

## How to translate

- Keep every claim. Do not add, drop or strengthen one; do not invent a statistic, name or quote for the new language.
- Adapt idioms, jokes and examples so they read naturally, not word for word. Keep numbers, units and proper names right (convert units where the audience expects it).
- Keep the hook first and the same number of lines where you can. The scene is shared, so the beats should line up.
- The scene is shared, so it must not hard-code the title or any on-screen words: draw `vfrey.script.title` (HTML) or `useScript().title` (Remotion), which are this language's `title`. A scene that types "Why the sky is blue" shows that English title on the Vietnamese video too.
- Respect the length limits per language: 4 to 30 lines, at most 220 characters a line, 6 to 180 s of speech. Languages run longer or shorter than English (Spanish and Vietnamese often more words; Chinese and Japanese fewer characters); measure the speech, not the word count. Pace with the free multilingual voice (Supertonic) is about 2.5 to 3 words a second in Vietnamese and about 3 in French and Spanish, and a line break is a 0.4 s pause (the same as Kokoro's), so a 20 s video holds about 50 to 60 words: eight short lines of 5 to 7 words (about 13 s for 39 words) fit with room, and 10 to 12 lines of that size reach 20 s. Run `series kit` for the measured pace of your voice and language, and time a draft before the tick.
- Translate `title` (100 characters at most) and `hashtags` (start with `#`), and give each hashtag a form people in that language use. Add `"subject"` in the new language when the title does not carry the topic's key words.
- Right to left (Arabic, Hebrew, Persian, Urdu): write the lines normally; vfrey sets captions and the default template right to left. In your own scene use `dir="rtl"` text and test a frame with `--frame` (see `captions.md`).

## What you get

- One run per language, sharing the scene (and media plan), each with its own voice, timing, captions and covers.
- Files in `videos/`: `<date> <title>.<lang>.mp4` with `.srt`, `.vtt`, `.txt` beside each (all four are linked or copied there, whether the data folder is the project's or set by `VFREY_HOME`). The scene folder keeps each language's voice-anchored timing in `scenes/<idea>/vfrey/timing.<lang>.json`; `timing.json` is the base-language run.
- The dashboard shows them as one idea with a tab per language. `npx vfrey tick --json` has `language` and `ideaId` on each job.
- Check `script.language`: the lines must read as the file's language. A mismatch rejects that run (the others still render); fix the file or its name.
- Captions and music are inherited from the base script when a language file sets none.
