# Pictures & clips (`--engine pictures`)

Read this only when the person gives you their own photos or footage, or asks for a photo story, a slideshow or a "video from my pictures" (or asks you to make the pictures for one). Offer Pictures & clips (engine `pictures`; it is not "Made by your agent", which is engine `agent` and draws the whole picture itself) when your agent has its own image or video tool, or when the person asks for pictures or clips; otherwise use the series' engine (from `series kit`) or the default. Everything here is one video; the main steps are in `SKILL.md`.

You make the pictures. vfrey turns them into the finished video: motion, timing to the voice, captions, the AI-GENERATED label, covers, subtitles and the quality checks. The engine is Pictures & clips (`pictures`; the id `vfrey-media` is the same engine and still works). It is free, runs on this machine with ffmpeg alone (no Chrome), and costs no credits.

## The steps

1. **Script.** Write `scripts/<idea>.json` as usual. Each spoken line is one beat (more than eight lines share beats, so keep it to eight lines or fewer when you place shots by beat).
2. **Shot list.** Plan **12 to 20 shots for a 45 s video**: a new picture every 2 to 3 seconds, so each beat has two or three shots (`"beat": N` in `media.json`). One picture held for 5 s reads like a slideshow, and the viewer's thumb is already moving. For each shot write one sentence of what the viewer sees. Open on the most striking picture. Do not reuse one picture for most of the video (`media.variety` warns), and keep the average shot under 3.5 s (`media.pacing` warns).
3. **Keep one look, vary the rest.** Write one style line (medium, palette, light, lens) and paste it at the end of every prompt. Describe a recurring character the same way every time, word for word, and pass the first good picture as the reference when the tool takes one. **Keep the character and the style line constant; vary the location, the props, the time of day and the camera from video to video** (not the same desk and the same angle in every video), and inside a video give each shot its own distance.
   - **Mix the distances:** wide (where we are), medium (the person doing the thing), close-up (face or hands), detail (an object, a screen, a line of text). A rhythm such as wide, medium, close-up, detail, medium works.
   - **Insert breaks:** a text card (a plain graphic with one short line, or `text` on a shot) or a close-up of an object now and then, to reset the eye.
   - **If your image tool can make a short clip from a picture (image to video, 3 to 5 s), make clips for the shots that need real movement** and use stills for the rest. Clips cost more; use them for the hook and the turning point.
4. **Generate the pictures** with your agent's own image tool, such as Grok Imagine or Gemini image, or use the person's own files. Ask for the shape of the video (9:16 for 1080x1920, 4:5 for 1080x1350) or larger. Save them inside the project, for example `media/01.png`.
5. **Write `media.json`** next to the script (format below).
6. **Make it.** `npx vfrey tick --now --about "<subject>" --script scripts/<idea>.json --engine pictures [--aspect 4:5] [--thumbnail]` (for a series whose engine is not Pictures & clips, or whose shape is set, add `--override engine` / `--override aspect` only if the person asked for the one-off; a series set to Pictures & clips needs no `--engine`). `media.json` next to the script is found by itself; `--media FILE` names another. To check framing without a new run: `npx vfrey render --engine pictures --script scripts/<idea>.json` (it uses the voice an earlier run made for this script, or none).
7. **Look at it.** Open frames at a few moments; fix any `✗`/`Fix:` line and the warnings.

## `media.json`

```json
{
  "cutEvery": 2,
  "shots": [
    { "beat": 1, "file": "media/01.png", "source": "generated:grok-imagine", "motion": "push-in", "focus": { "x": 0.5, "y": 0.4 }, "text": "Honey never spoils" },
    { "beat": 1, "file": "media/02.png", "source": "generated:grok-imagine", "motion": "punch-in", "focus": { "x": 0.3, "y": 0.5 }, "transition": "whip" },
    { "beat": 2, "file": "media/03.mp4", "source": "own", "keepAudio": false, "start": 1.5, "fit": "contain", "duration": 2 },
    { "beat": 2, "file": "media/04.png", "source": "generated:grok-imagine", "motion": "pan-right", "transition": "fade" }
  ]
}
```

- `shots`: in order. Without `beat` there is exactly one shot per beat (a different count stops with a `✗` line that lists the beats). With `"beat": N` (counting from 1) on **every** shot, several shots may share a beat; each beat needs at least one, and they run in beat order. The beat's time is split between its shots.
- `duration` (optional, per shot): a weight, not seconds. A shot with `3` next to one with `1` on the same beat gets three times the time.
- `cutEvery` (optional, top level, seconds): for example `2`. A beat with fewer shots than its length divided by `cutEvery` re-uses its shots: each repeat is a different crop of the same picture, a quick `punch-in` to a detail near its `focus`, a push toward another part, then a pull-out, so the picture changes without a slideshow hold. Clips continue from where they left off. A beat with enough shots is left alone.
- `file` (required): PNG, JPG or WebP for a still; MP4, MOV or WebM for a clip. A relative path is read from the **project root** first, then from the folder `media.json` is in, so `media/01.png` works whether `media.json` is at the root or in `scripts/`; if neither has it, the `✗` line lists both places it looked. It must be inside the project; a path outside it, a link out of it or a web address is refused. vfrey never downloads media.
- `source` (required): where it came from, `generated:<tool>`, `own`, or `licensed:<where>`. It is recorded with the run. Use only your own, generated or licensed media; never scrape.
- `motion` (stills): `push-in`, `pull-out`, `pan-left`, `pan-right`, `pan-up`, `pan-down`, `still`, or `punch-in` (a quick 0.3 s zoom step to the `focus` point that then creeps slowly on; use it for a detail or a beat of emphasis). Default alternates push-in and pull-out. A clip plays as it is (its `motion` is ignored).
- `focus` `{ "x", "y" }` (0 to 1): the point to keep in frame when the picture is cropped and the point the move leans toward. Put it on the face or subject.
- `transition`: into the next shot: `cut` (default), `fade` (0.4 s), `dip` (0.6 s, through black), `whip` (0.25 s, a fast sideways slide with motion blur; the direction alternates, for an energetic change of place). It is centred on the moment the voice moves to the next beat. Ignored on the last shot.
- `text`: on-screen words, a string or `{ "text", "position": "top|middle|bottom" }`. Keep it to a title or label (up to 120 characters). It sits in the safe area, at the top unless the captions are at the top, and fades in and out. Beats shorter than 0.8 s drop it.
- `fit`: `cover` (default, crops to fill) or `contain` (the whole picture over a blurred copy of itself; use for wide pictures in a tall frame).
- `keepAudio` (clips): keep the clip's own sound under the voice. Default off. `start`: seconds into the clip where the shot begins; a clip a little shorter than its slot is slowed (at most 10 %), a shorter one is slowed and then holds its last frame, with a warning.
- `character`: a character of the series kit this shot shows, such as `"mia"` (`npx vfrey series kit <series>` lists them). Generate the image from the kit's style line (`style.md`) with the character's sheet as a reference image, and say so in `source`, for example `"generated:grok-imagine (style.md, sheet mia)"`. Otherwise the run gets a `media.character` warning (the video is still made).
- `cover`: `true` on the one shot the covers use (default: the shot playing at the hook).

## Motion that suits the shot

- Wide scene or reveal: `push-in` toward the subject (set `focus`). Detail, then context: `pull-out`.
- Tall subject (a tower, a person standing): `pan-up` or `pan-down`. Wide landscape or a row of things: `pan-left` or `pan-right`.
- A picture that already has a lot going on, or a graphic with text in it: `still`.
- Change the direction between neighbouring shots. Use `cut` for energy, `fade` for time passing, `dip` for a change of topic. Do not put a transition on every shot.

## Size and safe areas

- A picture smaller than the frame is scaled up with a warning; below half the frame size the run stops. 1080x1920 (9:16), 1080x1350 (4:5), 1080x1080 (1:1) and 1920x1080 (16:9) are the frames; the other shapes and `--size` work too.
- Captions sit in the bottom safe area by default (`captions.position` moves them: top, middle, bottom). In 9:16 keep faces and the point of the picture out of the top 200 px and the bottom 220 px; in 4:5 and 1:1, out of the top 7 % and bottom 10 %. The AI-GENERATED label is in the bottom right corner; do not rely on that corner.
- Captions, their position, right-to-left text and fonts follow `captions.md`.

## Checks

The usual ones run unchanged (readable, duration, pace, resolution, frame rate, black, frozen, label). Added: `media.pacing` warns when the average shot is over 3.5 s or any is over 6 s (estimated from the script before the voice exists; `vfrey render` measures the real timing) and says to add shots or set `cutEvery`; `media.variety` warns when one picture fills more than half of the shots; `media.source` records where each file came from. Run the output through the Checks list on the run page.

Not in Pictures & clips yet: music, generating the pictures inside vfrey, and the cloud render (`engine: pictures` in a cloud job is refused with a `Fix:` line; render it locally).
