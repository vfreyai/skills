#!/usr/bin/env python3
"""Sound bed for the real 3D style. Python standard library plus ffmpeg (which vfrey already needs): no downloads.

It writes one stereo 16-bit WAV made only from ffmpeg's own sine and noise sources: a deep slow drone with a low
rumble, a "whoosh" for each fly-by and a "boom" for a hard cut, at the times you ask for. Every noise source has a
fixed seed, so the same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Drone only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      As long as the film. Without --cues: a whoosh into every script line after the first.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "whoosh", "word": "jupiter", "offset": -1.2, "dur": 1.8}   the first time that word is spoken, starting early
  {"sfx": "whoosh", "line": 2, "dur": 2.3, "bright": 3600}          the start of script line 2 (lines count from 0)
  {"sfx": "boom",   "at": 24.6}                                     a time in seconds
Optional: "gain" (1 is the default level), "nth" (1 for the second time the word is spoken). A whoosh takes "dur"
(seconds, default 1.8; it peaks a little past half way, so start it about half its length before the fly-by) and
"bright" (the low-pass in Hz, default 3200: lower is duller and bigger). Sounds: whoosh (the camera passes something,
or rushes a distance), boom (a hard cut, an arrival).

Takes a second or two. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey real 3D style, ffmpeg)", "volume": -9, "duck": true}
"""
import argparse
import json
import re
import shutil
import subprocess
import sys

RATE = 44100
# The drone: four low sines, each with its own slow swell.
DRONE = (
    "0.22*sin(2*PI*41*t)*(0.75+0.25*sin(2*PI*0.06*t))+0.16*sin(2*PI*55*t+1)*(0.7+0.3*sin(2*PI*0.09*t))"
    "+0.10*sin(2*PI*82.4*t)*(0.6+0.4*sin(2*PI*0.07*t+2))+0.05*sin(2*PI*123.5*t)*(0.5+0.5*sin(2*PI*0.05*t+1))"
    "+0.025*sin(2*PI*329.6*t)*(0.5+0.5*sin(2*PI*0.11*t))"
)


def norm(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def moment(cue, timing):
    """Seconds for one cue, or None when its word or line is not in the timing."""
    offset = float(cue.get("offset", 0))
    if "at" in cue:
        return float(cue["at"]) + offset
    if timing is None:
        return None
    if "word" in cue:
        want = norm(str(cue["word"]))
        hits = [w for w in timing["words"] if norm(w["text"]) == want and ("line" not in cue or w.get("line") == cue["line"])]
        nth = int(cue.get("nth", 0))
        return hits[nth]["start"] + offset if nth < len(hits) else None
    if "line" in cue:
        lines = timing.get("lines", [])
        i = int(cue["line"])
        return lines[i]["start"] + offset if 0 <= i < len(lines) else None
    return None


def main():
    ap = argparse.ArgumentParser(description="Sound bed for the vfrey real 3D style (ffmpeg filters only).")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing file")
    ap.add_argument("--cues", help="a JSON list of whooshes and booms; see the top of this file")
    ap.add_argument("--out", required=True, help="the WAV file to write")
    args = ap.parse_args()
    def _plain_error(kind, err, tb):
        print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues files exist, then run the same command again.", file=__import__('sys').stderr)
        raise SystemExit(1)
    __import__('sys').excepthook = _plain_error
    __import__('os').makedirs(__import__('os').path.dirname(__import__('os').path.abspath(args.out)), exist_ok=True)
    if not shutil.which("ffmpeg"):
        sys.exit("make-bed: ffmpeg is not on the PATH. Install it (npx vfrey doctor names how), or make the video without music.")
    timing = json.load(open(args.timing)) if args.timing else None
    if timing is None and not args.duration:
        sys.exit("make-bed: pass --timing FILE or --duration SECONDS")
    dur = (float(timing["durationSec"]) if timing else float(args.duration)) + 1.0
    if args.cues:
        cues = json.load(open(args.cues))
    elif timing:
        cues = [{"sfx": "whoosh", "line": i, "offset": -0.9} for i in range(1, len(timing.get("lines", [])))]
    else:
        cues = []

    inputs = ["-f", "lavfi", "-i", f"aevalsrc='{DRONE}':s={RATE}:d={dur}", "-f", "lavfi", "-i", f"anoisesrc=d={dur}:c=brown:a=0.5:r={RATE}:seed=2"]
    graph = ["[0:a]lowpass=f=700,aecho=0.8:0.7:120|520:0.4|0.28[bed]", "[1:a]lowpass=f=160,volume=0.5[rumble]"]
    labels = ["[bed]", "[rumble]"]
    placed, skipped = 0, []
    for n, cue in enumerate(cues):
        t = moment(cue, timing)
        kind = cue.get("sfx")
        if t is None or kind not in ("whoosh", "boom") or t >= dur:
            skipped.append(cue)
            continue
        ms = int(max(0.0, t) * 1000)
        gain = float(cue.get("gain", 1.0))
        k = len(inputs) // 4
        if kind == "whoosh":  # pink noise, band-limited, slow in and a quick exponential out, with a short echo
            length = float(cue.get("dur", 1.8))
            bright = float(cue.get("bright", 3200))
            inputs += ["-f", "lavfi", "-i", f"anoisesrc=d={length}:c=pink:a=0.9:r={RATE}:seed={n + 3}"]
            graph.append(
                f"[{k}:a]highpass=f=200,lowpass=f={bright},afade=t=in:d={length * 0.55:.2f}:curve=qsin,"
                f"afade=t=out:st={length * 0.55:.2f}:d={length * 0.45:.2f}:curve=exp,volume={0.8 * gain:.3f},aecho=0.7:0.6:60:0.3,adelay={ms}|{ms}[c{n}]"
            )
        else:  # a sine that falls from 46 Hz as it dies away
            inputs += ["-f", "lavfi", "-i", f"aevalsrc='0.9*sin(2*PI*(46-14*t)*t)*exp(-2.2*t)':s={RATE}:d=2.2"]
            graph.append(f"[{k}:a]volume={gain:.3f},adelay={ms}|{ms}[c{n}]")
        labels.append(f"[c{n}]")
        placed += 1
    graph.append(
        "".join(labels)
        + f"amix=inputs={len(labels)}:normalize=0,afade=t=in:d=1.2,atrim=0:{dur:.3f},afade=t=out:st={max(0.0, dur - 2.0):.3f}:d=2.0,"
        + "alimiter=limit=0.9,aformat=sample_fmts=s16:channel_layouts=stereo[out]"
    )
    cmd = ["ffmpeg", "-y", "-v", "error"] + inputs + ["-filter_complex", ";".join(graph), "-map", "[out]", "-fflags", "+bitexact", "-flags:a", "+bitexact", "-c:a", "pcm_s16le", args.out]
    done = subprocess.run(cmd, capture_output=True, text=True)
    if done.returncode != 0:
        sys.exit(f"make-bed: ffmpeg failed: {done.stderr.strip()[-400:]}")
    print(f"make-bed: wrote {args.out} ({dur:.1f} s, {placed} cues)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
