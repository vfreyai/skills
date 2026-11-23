# Music bed

vfrey mixes a track under the voice, with ffmpeg alone, on every engine. You choose the track; vfrey does not have a catalogue and does not make music.

## Which music is allowed

- Only the person's **own** music, **licensed** music, or music **you generated** with a tool they use. Record which in `source`.
- Never download a track from YouTube or TikTok, and never rip one from a video or a streaming service.
- A licence does not stop a Content ID claim. Platforms can still match a licensed track to its owner and claim or mute the video. Tell the person this when you use licensed music, and keep the licence page or receipt with the track.
- No source, no video: a track with no `source` blocks the run (`music.source` is a compliance check).

## Ask for it

In the script (`scripts/<idea>.json`):

```json
"music": { "file": "music/bed.mp3", "source": "licensed:Pixabay licence", "volume": -18, "duck": true, "start": 0 }
```

- `file`: relative to the script's folder, then to the project folder. Put tracks in `music/`.
- `source`: `own`, `licensed:<where>` (say where: the library and the licence), or `generated:<tool>`.
- `volume`: dB under the voice before ducking (default -18). `duck`: dip the music under the voice (default true). `start`: second the music begins (default 0).
- Or on the command line: `npx vfrey tick --now --script scripts/<idea>.json --music music/bed.mp3 --music-source own`. `--music` beats the script's file.
- A default for every video: `npx vfrey desk series update --id ID --music music/bed.mp3 --music-source own` (`--music none` clears it), or a `music` object in `brand.json` (`{ "file", "source", "volume", "duck" }`, the file inside the project). Order, strongest first: `--music` on the run, the script's `music`, the series default, `brand.json`, none. A script that wants no music for one video cannot switch a default off; use a series without one.

## The music folder

The person's own tracks can live in the project's `music/` folder (or `music/<series>/` for one series; a series folder with tracks is used alone). **Only music the person owns or holds a licence for goes there; vfrey never downloads music and `music add` takes no links.** Never put a track you fetched from the web into the folder.

- `npx vfrey music list` shows the tracks, their source, moods and when each was last used. `npx vfrey music add <file> --source own` (or `--source licensed:<where>`, and `--mood calm,upbeat`) copies one in; dropping files into the folder works too (source `own`). `npx vfrey music remove <name>` deletes one. Tags: in the file name in square brackets (`Morning walk [calm].mp3`) or in `tracks.json` in the folder.
- A video that names no music (no `--music`, no script `music`, no series or `brand.json` default) gets one track from the folder: tagged with the mood asked for (`tick --music-mood calm`, or a plan row's `music_mood`) when any is, at least as long as the video when one is, and otherwise the one used longest ago. It is mixed like any bed (loop or trim, duck, -14 LUFS).
- When the folder has tracks, the person's own music wins over a style's generated bed (`music/<idea>-bed.wav`): **check `npx vfrey music list` before you make a bed.** With an empty folder, make the bed the style skill describes, as before. `--music` on the run always wins.

## What vfrey does

The track loops or trims to the film, fades in over 0.5 s and out over 1.5 s, and is ducked under the voice by sidechain compression. The finished sound is normalised in two passes to -14 LUFS with the true peak at or below -1 dBTP. The picture is copied, not re-encoded.

## Checks

- `music.source` (compliance, before the render): the source must be `own`, `licensed:<where>` or `generated:<tool>`, and the file must exist. The run record keeps the file, its source and its sha256.
- `audio.loudness` (after, every video, with or without music): the finished sound must be -14 LUFS within 1 LU (-15 to -13). vfrey normalises every video to -14 before it signs it, so a miss means that step did not run; Fix: run the tick again with `--rerender`.
- `audio.voice` (after, every video): a voice track that is silent or nearly so fails (Fix: hear it with `npx vfrey voice sample`, pick a voice that speaks the script's language). With `TTS_PROVIDER=none` and no sound at all it is a warning.
- `audio.voice-clear` (warning, after): the voice is less than 10 dB above the music while someone speaks. Fix: lower `volume`, leave `duck` on.

Relay a warning's Fix line to the person. The numbers (loudness, true peak, voice over music) are on the run page and in `npx vfrey tick --json`.
