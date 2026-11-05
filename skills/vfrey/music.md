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

## What vfrey does

The track loops or trims to the film, fades in over 0.5 s and out over 1.5 s, and is ducked under the voice by sidechain compression. The finished sound is normalised in two passes to -14 LUFS with the true peak at or below -1 dBTP. The picture is copied, not re-encoded.

## Checks

- `music.source` (compliance, before the render): the source must be `own`, `licensed:<where>` or `generated:<tool>`, and the file must exist. The run record keeps the file, its source and its sha256.
- `audio.loudness` (warning, after): outside -16 to -12 LUFS. Fix: use a steadier track, or raise `volume` toward 0.
- `audio.voice-clear` (warning, after): the voice is less than 10 dB above the music while someone speaks. Fix: lower `volume`, leave `duck` on.

Relay a warning's Fix line to the person. The numbers (loudness, true peak, voice over music) are on the run page and in `npx vfrey tick --json`.
