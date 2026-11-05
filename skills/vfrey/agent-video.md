# Made by your agent (`--engine agent`)

Read this when the series engine is **Made by your agent** (`npx vfrey series kit <series>` shows it), or when the person asks you to make the whole video yourself: with your own video model, ffmpeg, Python (Manim, moviepy), a canvas recording or a desktop app's video tool. vfrey draws nothing for this engine. It writes the script's voice and timing into a brief folder, waits for your MP4, then adds the captions and the AI-GENERATED label, checks it and finishes the run.

## The steps

1. **Script.** Write `scripts/<idea>.json` as usual (read the series kit first).
2. **Start the run.** `npx vfrey tick --now --script scripts/<idea>.json` (a series whose engine is Made by your agent takes no `--engine`; for a no-series run add `--engine agent`). It stops with `Waiting for your agent's video` and prints `Make the video, then: npx vfrey attach <run> <file.mp4>`.
3. **Read `scenes/<idea>/agent/brief.md`.** It says the exact size, frame rate and length, the caption band and label corner to keep clear, the script with times, and the series style and characters. `frame.json`, `timing.json` and `voice.wav` are beside it. The shape, frame rate, voice and caption position come from the series; you cannot change them here.
4. **Make the MP4 with your own tools**, silent (vfrey joins its voice), at exactly the size and frame rate in `frame.json`, within half a second of its length. Leave the caption band and the label corner clear, do not draw the label, and do not draw text that repeats the captions. Save it as `scenes/<idea>/agent/video.mp4`.
5. **Attach it.** `npx vfrey attach <run> scenes/<idea>/agent/video.mp4 --tool "<what you used>"`. Add `--fit pad|trim|speed` when the length is off by more than half a second (pad holds the last frame, trim cuts the end, speed changes the pace), and `--keep-audio` only when your file's sound is the same voice as `voice.wav`. A refusal names the problem and a `Fix:`: make the change and attach again. A run takes one video; a second attach is refused.
6. **Tell them** what the summary says (checks, the final MP4, the tool you named). Posting follows `publish.md`, only with the person's yes.

## If you cannot make video

Say so plainly. Do not attach a slideshow of stills as if it were video, and do not fake it. Offer to switch: `npx vfrey desk series update --id <series> --engine vfrey-framey` for the series, or the desk's "Switch this run to ..." button (`npx vfrey desk job switch --id <run>`) for the waiting run, which makes the same script with the machine default engine.

A run that waits more than 7 days expires (not failed; nothing is posted). Run the script again to make a new one.
