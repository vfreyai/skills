# Shapes, frame rates, covers, long videos, voices

Read this when the person asks for a different shape (YouTube 16:9, a square, a feed post), a frame rate, a thumbnail or cover, a video longer than a minute, or when the voice fails on Linux. The main steps are in `SKILL.md`; how to lay a scene out is in `scenes/craft.md`.

## Shape and frame rate

Default: 9:16, 1080x1920, 30 fps. Choose per run with flags, or keep a choice in `vfrey.json` (the project) or on a series.

| `--aspect` | Size | For |
| --- | --- | --- |
| `9:16` (default) | 1080x1920 | Shorts, Reels, TikTok |
| `4:5` | 1080x1350 | Instagram and Facebook feed |
| `1:1` | 1080x1080 | square posts |
| `16:9` | 1920x1080 | YouTube, the web |
| `2:3` | 1080x1620 | Pinterest |
| `3:4` | 1080x1440 | Instagram portrait |
| `4:3` | 1440x1080 | classic slides and presentations |
| `5:4` | 1350x1080 | landscape feed |
| `21:9` | 2520x1080 | cinematic wide |

- `--size 1440x1800` for any other size: even numbers, 360 to 4096 on each side. `--aspect` and `--size` are one choice, never both. `--fps 24|30|60`.
- Order of precedence: the run's flags, then the series (`npx vfrey desk series update --id S --aspect 16:9 --fps 24`; `default` clears it), then `vfrey.json` (`{ "aspect": "16:9", "fps": 24 }` or `"size": "1440x1800"`; `npx vfrey init --aspect 16:9` writes them), then 9:16 at 30 fps. A bad value gets a `✗` line and a `Fix:` line.
- Use the same flags everywhere for one video: `scene init`, the `--frame` preview, `scene inspect`, `scene studio`, `render` and `tick`. `scene init` writes the frame into `vfrey/timing.json` (`width`, `height`, `fps`); a render takes the frame from the flags and `vfrey.json`, not from the file.
- The scene reads its frame from `vfrey.frame` / `useFrame()`: `{ width, height, fps, aspect, orientation, vmin, safe }`. Lay out with `100%`, `vmin` fractions and the safe areas, never 1080 or 1920. A scene that names `1080px` and `1920px` while the frame is another shape gets a warning at render time.
- The quality checks compare the finished file with the frame you asked for (`frames.resolution`, `frames.fps`).
- At 60 fps every frame is drawn, so a render takes longer. Subtitles (SRT and VTT) are in seconds and do not depend on the frame rate.
- Time-based motion (GSAP seconds) looks the same at every rate. In Remotion count in seconds (`useTime()`), not frames.

## Covers (thumbnails)

`npx vfrey tick ... --thumbnail` (or `"thumbnail": true` in the script, or `{ "at": 2.5, "title": "Words" }`; `"title": false` for none) writes two PNGs next to the MP4, under its name: `<title>.thumbnail.png` in the video's own shape and `<title>.thumbnail-youtube.png` at 1280x720. The frame is the hook moment (halfway through the first spoken line) unless you give `--thumbnail-at SECONDS`; the title on it is the video's title unless you give `--thumbnail-title "Words"` (or `none`). `--json` has `thumbnail: { cover, youtube, at, title }` and the run page shows both with download links. `render --scene DIR --thumbnail` does the same for a preview render. Pick a frame where the picture is clear and the title is short.

## Long videos

Speech may run 6 to 180 s (about 2.6 words a second: 16 to 468 words); a script allows 4 to 30 lines of up to 220 characters. A 172 s video was rendered on the default engine in 77 s with about 3 GB of memory, the same as a 20 s one, so length costs time (about 0.45 s per second of video) and not memory. For a long video write more lines, not longer ones, and give each section its own picture change.

## Voice

For English the natural voice (Kokoro) speaks first once `npx vfrey voice install` has run; other languages use the multilingual voice once `npx vfrey voice install --language <code>` has run (Vietnamese, French, Spanish, German and others, 31 languages, English included); everything below is the system voice that speaks when neither is installed (and for languages neither reads, such as Chinese).

macOS uses `say`. Native Windows (beta, no WSL needed) uses its built-in SAPI voices through PowerShell: it picks an installed voice for the script's language, or the series' rotation among the English ones; `TTS_PROVIDER=sapi` asks for it, and Piper still wins when it is set up. On Windows install the tools with `winget install OpenJS.NodeJS.LTS` and `winget install Gyan.FFmpeg`, open a new terminal, and run `npx vfrey doctor --render`; the background service and the scene network block are not available there (run `npx vfrey worker --all-projects` in a terminal). With no `TTS_PROVIDER` on Linux, vfrey uses Piper when the `piper` program and `PIPER_MODEL` (the path to a voice `.onnx` file) are there, else `espeak-ng`. `TTS_PROVIDER=say|sapi|espeak-ng|piper|openai|none` chooses one. If none is found the run stops with the install lines (`sudo apt install espeak-ng`, and the Piper steps); relay them. Word times come from the audio, so every voice captions the same way.
