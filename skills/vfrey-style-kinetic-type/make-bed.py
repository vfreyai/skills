#!/usr/bin/env python3
"""Sound bed for the kinetic type style. Python standard library plus ffmpeg (which vfrey already needs): no downloads.

It writes one stereo 16-bit WAV made only from ffmpeg's own sine and noise sources: a low D-minor drone, a quiet pad with
an echo and a breath of air, with accents at the times you ask for: a "slam" (a deep thud, a click and a noise burst)
for a word that lands, a "whoosh" for a wipe and a "tick" for a small tag. Every noise source has a fixed seed, so the
same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      As long as the film, with accents. Without --cues: a slam as every script line starts and a whoosh into every line after the first.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "slam",   "word": "never", "offset": -0.04}  the first time that word is spoken ("line": 2 limits it to a line)
  {"sfx": "whoosh", "line": 2, "offset": -0.1}         the start of script line 2 (lines count from 0), minus a tenth of a second
  {"sfx": "tick",   "line": 0, "edge": "end"}          the end of a line
  {"sfx": "slam",   "at": 31.5}                        a time in seconds
Optional: "gain" (1 is the default level). Sounds: slam (a word or block of type lands; put it 0.04 s before the word),
whoosh (a wipe or a whip off screen; it starts 0.3 s before the time you give, so the time is when the wipe covers the frame),
tick (a small tag or counter appears).

Takes a second or two. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey kinetic type style, ffmpeg)", "volume": -12, "duck": true}
"""
import argparse
import json
import re
import shutil
import subprocess
import sys

RATE = 44100


def norm(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def moment(cue, timing):
    """Seconds for one cue, or None when its word or line is not in the timing."""
    offset = float(cue.get("offset", 0))
    if "at" in cue:
        return float(cue["at"]) + offset
    if timing is None:
        return None
    edge = "end" if cue.get("edge") == "end" else "start"
    if "word" in cue:
        want = norm(str(cue["word"]))
        hits = [w for w in timing["words"] if norm(w["text"]) == want and ("line" not in cue or w.get("line") == cue["line"])]
        nth = int(cue.get("nth", 0))
        return hits[nth][edge] + offset if nth < len(hits) else None
    if "line" in cue:
        lines = timing.get("lines", [])
        i = int(cue["line"])
        return lines[i][edge] + offset if 0 <= i < len(lines) else None
    return None


def default_cues(timing):
    lines = timing.get("lines", []) if timing else []
    cues = [{"sfx": "slam", "line": i, "offset": -0.04} for i in range(len(lines))]
    cues += [{"sfx": "whoosh", "line": i, "offset": -0.1} for i in range(1, len(lines))]
    return cues


def main():
    ap = argparse.ArgumentParser(description="Sound bed for the vfrey kinetic type style (ffmpeg filters only).")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing file")
    ap.add_argument("--cues", help="a JSON list of slams, whooshes and ticks; see the top of this file")
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
    cues = json.load(open(args.cues)) if args.cues else default_cues(timing)

    graph, names = [], []

    def source(name, expr, chain):
        graph.append(f"{expr},{chain}[{name}]")
        names.append(name)

    def one_shot(name, expr, chain, t):
        ms = int(max(0.0, t) * 1000)
        graph.append(f"{expr},{chain},adelay={ms}|{ms},apad=whole_dur={dur}[{name}]")
        names.append(name)

    # Drone: D2, a slightly sharp D2 that beats against it, A2 and D3, with a slow tremolo.
    parts = []
    for i, (freq, vol) in enumerate([(73.42, 0.55), (73.9, 0.35), (110.0, 0.30), (146.83, 0.16)]):
        graph.append(f"sine=f={freq}:d={dur}:r={RATE},volume={vol}[dr{i}]")
        parts.append(f"[dr{i}]")
    graph.append("".join(parts) + "amix=inputs=4:normalize=0,lowpass=f=420,tremolo=f=0.2:d=0.4,afade=t=in:d=1.5[drone]")
    names.append("drone")
    # Pad: D3 F3 A3 D4 with a slow tremolo and an echo.
    parts = []
    for i, (freq, vol) in enumerate([(146.83, 0.05), (174.61, 0.045), (220.0, 0.05), (293.66, 0.025)]):
        graph.append(f"sine=f={freq}:d={dur}:r={RATE},volume={vol}[pd{i}]")
        parts.append(f"[pd{i}]")
    graph.append("".join(parts) + "amix=inputs=4:normalize=0,tremolo=f=0.25:d=0.6,aecho=0.8:0.6:420|700:0.35|0.25,afade=t=in:d=2[pad]")
    names.append("pad")
    source("air", f"anoisesrc=c=pink:a=0.3:d={dur}:r={RATE}:s=21", "highpass=f=600,lowpass=f=3200,tremolo=f=0.13:d=0.6,volume=0.025")

    placed, skipped = 0, []
    for i, cue in enumerate(cues):
        t = moment(cue, timing)
        kind = cue.get("sfx")
        if t is None or kind not in ("slam", "whoosh", "tick") or t >= dur:
            skipped.append(cue)
            continue
        g = float(cue.get("gain", 1.0))
        if kind == "slam":
            one_shot(f"c{i}thud", f"sine=f=55:d=0.9:r={RATE}", f"afade=t=out:st=0.02:d=0.85,volume={1.1 * g:.3f}", t)
            one_shot(f"c{i}click", f"sine=f=140:d=0.18:r={RATE}", f"afade=t=out:st=0.005:d=0.17,volume={0.5 * g:.3f}", t)
            one_shot(f"c{i}burst", f"anoisesrc=c=brown:a=1:d=0.35:r={RATE}:s={100 + i}", f"lowpass=f=900,afade=t=out:st=0.01:d=0.33,volume={0.8 * g:.3f}", t)
        elif kind == "whoosh":
            one_shot(f"c{i}whoosh", f"anoisesrc=c=white:a=0.5:d=0.5:r={RATE}:s={100 + i}", f"bandpass=f=1800:w=1.2,afade=t=in:d=0.2,afade=t=out:st=0.2:d=0.3,volume={0.35 * g:.3f}", t - 0.3)
        else:
            one_shot(f"c{i}tick", f"sine=f=1760:d=0.06:r={RATE}", f"afade=t=out:st=0.004:d=0.05,volume={0.12 * g:.3f}", t)
        placed += 1

    graph.append(
        "".join(f"[{n}]" for n in names)
        + f"amix=inputs={len(names)}:normalize=0,alimiter=limit=0.9,afade=t=in:d=0.4,"
        + f"afade=t=out:st={max(0.0, dur - 2.2):.3f}:d=2.1,aformat=sample_fmts=s16:channel_layouts=stereo[out]"
    )
    cmd = ["ffmpeg", "-v", "error", "-y", "-filter_complex", ";".join(graph), "-map", "[out]", "-t", f"{dur:.3f}", "-fflags", "+bitexact", "-flags:a", "+bitexact", "-c:a", "pcm_s16le", args.out]
    done = subprocess.run(cmd, capture_output=True, text=True)
    if done.returncode != 0:
        sys.exit(f"make-bed: ffmpeg failed: {done.stderr.strip()[-400:]}")
    print(f"make-bed: wrote {args.out} ({dur:.1f} s, {placed} accents)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
