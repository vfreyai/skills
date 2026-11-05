# Captions, subtitles, languages, assets, requests

Read this when the person talks about captions, subtitles, a language other than English, their own logo or images, or when `.vfrey/requests/` has a file. Everything here is about one video; the main steps are in `SKILL.md`.

## Caption controls (script `captions`)

Add `captions` to `scripts/<idea>.json`:

```json
{ "captions": "off" }
{ "captions": "on" }
{ "captions": { "position": "top", "style": "pop" } }
```

- `"on"` is the default (leave the field out). `"off"` draws no captions and the scene still renders. An object takes `mode` (`on` or `off`), `position` (`top`, `middle`, `bottom`) and `style` (`box`, `color`, `underline`, `pop`, `plain`). A bad value gets a `✗` line and a `Fix:` line.
- The setting is written into `vfrey/timing.json` as `captions: { mode, position?, style? }`. `vfrey.captions(...)` (HTML) and `<Captions/>` (Remotion) honour it for you: off draws nothing, position moves the block (the top safe edge, middle, or the bottom safe edge of the frame: 200 px from the top, or the block centred at 70 % of the height (452 px above the bottom, clear of TikTok's bottom 20 % and right 13 %) in 9:16, 7 % and 9 % of the height in 4:5 and 1:1, 8 % and 10 % in 16:9; never closer than 130 px to the bottom; a block the scene placed itself that is already in the right third of the frame stays where it is), style replaces the scene's own. If you draw captions yourself, read `vfrey.timing.captions` (or `useTiming().captions`) and do the same: when `mode` is `"off"`, draw no spoken-word text, and put it where `position` says.
- "Move the captions up", "no captions", "a different caption look": change this field and render again. The SRT and VTT files are written either way.
- The default template (no scene) is its own picture and ignores this.

## SRT and VTT

Every finished video has `<title>.srt` and `<title>.vtt` next to the MP4 (same name, in `videos/`), from the voice's word times: at most 2 lines of about 42 characters, never splitting a word. `tick --json` has `srt` and `vtt` paths; the run page has download links. Give them to the person for uploading to a platform; never edit them by hand, they are rewritten with the video.

## Languages and right-to-left text

The default display font (Baloo 2, with Noto faces behind it) covers Latin and Latin Extended (French, German, Polish, Turkish, Vietnamese and more), Devanagari (Hindi), Arabic (also Persian and Urdu), Hebrew, Thai, Bengali and Japanese. Write the lines in the person's language and the picture needs no font work. Arabic and Hebrew captions run right to left on their own (`dir` is set per group). If you set `font` yourself, end the stack with the default one: `"Baloo 2", "Noto Sans Arabic", "Noto Sans Hebrew", "Noto Sans Bengali", "Noto Sans Thai", "Noto Sans JP", sans-serif`. Text you draw yourself in Arabic needs `direction: rtl` on its element. Match the voice to the language: the free voice is picked by the script's language (set `"language"` in the script, or it is read from the text), a Mac uses an installed `say` voice for it (Majed for Arabic), and a language with no voice installed stops before the render with a `Fix:`; `--voice NAME` or `"voice"` in the script names one yourself; word times for Japanese are by word boundary, not by letter.

## The person's own logos, fonts and images

Put them in the scene folder (`scenes/<idea>/logo.png`) and `<img src="logo.png">`; a font goes in with an `@font-face` pointing at the file. A folder is at most 50 MB. The network is blocked while rendering, so a link to an image never loads. Use only the person's own files, images you generate, or properly licensed ones. Never hot-link or scrape images or footage, and never take them from a site you do not own the rights to. Record where each came from in `assets.json` in the scene folder:

```json
{ "assets": [{ "file": "logo.png", "source": "the person's own logo" }, { "file": "city.jpg", "source": "generated for this video" }] }
```

An asset with no `source` makes the `scene.asset-source` check say `Warning:` (the video still renders). Fix it by adding the entry.

A font vfrey does not bundle (the bundled serif is Playfair Display): put the file and its licence in the scene folder, load it with `@font-face { font-family: "My Face"; src: url("fonts/MyFace.woff2"); }`, and record it in `assets.json` as `{ "file": "fonts/MyFace.woff2", "source": "licensed:SIL Open Font License 1.1 (licence in fonts/OFL.txt)" }`. Only fonts the person may embed in a video (OFL, Apache, or their own licence).

## Disclosure: content credentials

Besides the burned `AI-GENERATED` label, every finished MP4 (all engines) is signed with an embedded C2PA manifest ("content credentials"): made by `vfrey <version>`, `c2pa.created` with `digitalSourceType` `trainedAlgorithmicMedia` (or `compositeWithTrainedAlgorithmicMedia` when any asset's `source` in `media.json` or `assets.json` is `own` or `licensed:...`), the engine, and each asset with its source. Platforms read it to set their "AI info" label; re-encoding the file elsewhere removes it, so upload the MP4 vfrey wrote. The compliance check `label.c2pa` reads it back; the run page shows "Content credentials: present". Be honest in `source`: it goes into the file. The signer is a per-machine self-signed certificate in `$VFREY_HOME/credentials/`, so validators show it as valid but untrusted; `VFREY_C2PA_CERT` and `VFREY_C2PA_KEY` (PEM files) replace it, `VFREY_C2PA=off` turns it off. Without the optional library the check is skipped with a reason.

## Requests from the desk

The person can press "Send to agent" in the dashboard; that saves `.vfrey/requests/<timestamp>.md`. At the start of a session in a project, list `.vfrey/requests/`. Read each one, do what it asks (it names the run id and has the commands to inspect it), tell the person what you changed, then delete the file once it is handled. Never leave a handled request behind. The "Copy prompt for your agent" button gives the person the same text to paste.
