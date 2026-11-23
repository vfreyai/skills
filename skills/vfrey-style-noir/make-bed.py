#!/usr/bin/env python3
"""Sound bed for the silhouette noir style. Python standard library plus ffmpeg (which vfrey already needs): no downloads.

It writes one stereo 16-bit WAV made only from ffmpeg's own noise and sine sources: wind, rain, a low beating drone,
and optionally a sea swell, with "stings" (a low thump under a faint uneasy tone) and thunder at the times you ask
for. Every noise source has a fixed seed, so the same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Atmosphere only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      As long as the film, with stings. Without --cues: one sting as the hook line ends and one on the last line.

  --layers wind,rain,drone        the continuous layers (default). Add "swell" for a scene at sea; drop "rain" indoors.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "sting",   "word": "door"}                 the first time that word is spoken ("line": 2 limits it to a line)
  {"sfx": "thunder", "line": 2, "offset": 1.0}       the start of script line 2 (lines count from 0), plus a second
  {"sfx": "sting",   "line": 0, "edge": "end"}       the end of a line
  {"sfx": "sting",   "at": 31.5}                     a time in seconds
Sounds: sting (a reveal: something is missing, shut, found), thunder (put it on a lightning flash).

Takes a second or two. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey noir style, ffmpeg)", "volume": -10, "duck": true}
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
    if not lines:
        return []
    cues = [{"sfx": "sting", "line": 0, "edge": "end", "offset": 0.3}]
    if len(lines) > 1:
        cues.append({"sfx": "sting", "line": len(lines) - 1, "offset": 0.2})
    return cues


def main():
    ap = argparse.ArgumentParser(description="Sound bed for the vfrey noir style (ffmpeg filters only).")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing file")
    ap.add_argument("--cues", help="a JSON list of stings and thunder; see the top of this file")
    ap.add_argument("--layers", default="wind,rain,drone", help="continuous layers, comma separated: wind, rain, drone, swell")
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
    layers = [name.strip() for name in args.layers.split(",") if name.strip()]
    unknown = [name for name in layers if name not in ("wind", "rain", "drone", "swell")]
    if unknown or not layers:
        sys.exit(f"make-bed: --layers takes wind, rain, drone and swell (got {args.layers!r})")

    graph, names = [], []

    def source(name, expr, chain):
        graph.append(f"{expr},{chain}[{name}]")
        names.append(name)

    def noise(color, amp, seed, length=dur):
        return f"anoisesrc=c={color}:a={amp}:d={length}:r={RATE}:s={seed}"

    # Continuous layers. tremolo is the slow swell of each one (ffmpeg refuses a tremolo slower than 0.1 Hz).
    if "wind" in layers:
        source("wind", noise("brown", 0.9, 11), "highpass=f=50,lowpass=f=520,tremolo=f=0.11:d=0.55,volume=1.6")
    if "swell" in layers:
        source("swell", noise("pink", 0.5, 12), "lowpass=f=800,highpass=f=80,tremolo=f=0.16:d=0.85,volume=0.9")
    if "rain" in layers:
        source("rain", noise("white", 0.5, 13), "highpass=f=2500,lowpass=f=9000,tremolo=f=0.1:d=0.3,volume=0.10")
    if "drone" in layers:
        parts = []
        for i, (freq, vol) in enumerate([(55, 0.5), (55.45, 0.5), (82.4, 0.22), (110.3, 0.1)]):  # 55 against 55.45 beats slowly
            graph.append(f"sine=f={freq}:d={dur}:r={RATE},volume={vol}[dr{i}]")
            parts.append(f"[dr{i}]")
        graph.append("".join(parts) + "amix=inputs=4:normalize=0,tremolo=f=0.1:d=0.35,lowpass=f=260,afade=t=in:d=2[drone]")
        names.append("drone")

    def one_shot(name, expr, chain, t):
        ms = int(max(0.0, t) * 1000)
        graph.append(f"{expr},{chain},adelay={ms}|{ms},apad=whole_dur={dur}[{name}]")
        names.append(name)

    placed, skipped = 0, []
    for i, cue in enumerate(cues):
        t = moment(cue, timing)
        kind = cue.get("sfx")
        if t is None or kind not in ("sting", "thunder") or t >= dur:
            skipped.append(cue)
            continue
        if kind == "sting":  # the tone starts 0.4 s early so the thump lands on the word
            one_shot(f"c{i}thump", f"sine=f=46:d=1.6:r={RATE}", "afade=t=in:d=0.02,afade=t=out:st=0.05:d=1.5,volume=1.0", t)
            one_shot(f"c{i}tone", f"sine=f=233.08:d=3:r={RATE}", "tremolo=f=5:d=0.25,afade=t=in:d=1.2,afade=t=out:st=1.2:d=1.8,volume=0.05,aecho=0.8:0.7:240|480:0.45|0.3", t - 0.4)
        else:
            one_shot(f"c{i}thunder", noise("brown", 1, 100 + i, 3.2), "lowpass=f=170,afade=t=in:d=0.5,afade=t=out:st=0.6:d=2.5,volume=3.2", t)
        placed += 1

    graph.append(
        "".join(f"[{n}]" for n in names)
        + f"amix=inputs={len(names)}:normalize=0,aecho=0.7:0.4:900:0.25,alimiter=limit=0.85,"
        + f"afade=t=in:d=1.5,afade=t=out:st={max(0.0, dur - 2.5):.3f}:d=2.4,aformat=sample_fmts=s16:channel_layouts=stereo[out]"
    )
    cmd = ["ffmpeg", "-v", "error", "-y", "-filter_complex", ";".join(graph), "-map", "[out]", "-t", f"{dur:.3f}", "-fflags", "+bitexact", "-flags:a", "+bitexact", "-c:a", "pcm_s16le", args.out]
    done = subprocess.run(cmd, capture_output=True, text=True)
    if done.returncode != 0:
        sys.exit(f"make-bed: ffmpeg failed: {done.stderr.strip()[-400:]}")
    print(f"make-bed: wrote {args.out} ({dur:.1f} s, layers {', '.join(layers)}, {placed} cues)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
