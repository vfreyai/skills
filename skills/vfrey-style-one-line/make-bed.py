#!/usr/bin/env python3
"""Sound bed for the One-line minimal style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV (22.05 kHz): a slow warm pad (Am9, Fmaj7, Cmaj7, Gadd9, about 8.5 s a chord,
with a slow tremolo), under soft bell plucks, a pen scratch and a rising shimmer, all with a light echo.
The same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Pad only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Pad as long as the film, with sounds. Without --cues: a bell at the start of every script line and a
      resolve on the last line.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "bell",    "line": 2, "offset": 0.4}         the start of script line 2 (lines count from 0), plus a second
  {"sfx": "scratch", "word": "write", "offset": -0.1}  the first time that word is spoken ("nth": 1 for the second time)
  {"sfx": "bell",    "line": 1, "edge": "end"}         the end of a line
  {"sfx": "rise",    "at": 12.5}                       a time in seconds
Optional: "gain" (1 is the default level), "note" (a MIDI number for bell), "dur" (seconds, for scratch).
Sounds: bell (a new object arrives and the line reaches it), scratch (a pen or the line itself draws, "dur" 1.6 s),
rise (a rising run of notes: something loosens, opens, resolves), open (one unresolved note: a question left hanging),
resolve (the end: a low warm note that holds to the end of the film, then a high bell two seconds later).

Takes a few seconds. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey one-line style)", "volume": -16, "duck": true}
"""
import argparse
import json
import math
import random
import re
import struct
import sys
import wave

SR = 22050
CHORDS = [[57, 60, 64, 71], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 69]]  # Am9, Fmaj7, Cmaj7, Gadd9
BELL_NOTES = [81, 79, 76, 74]  # soft pentatonic, taken in turn


def norm(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def cue_time(cue, timing):
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
    cues = [{"sfx": "bell", "line": i, "offset": 0.5} for i in range(len(lines))]
    if lines:
        cues.append({"sfx": "resolve", "line": len(lines) - 1, "offset": 0.6})
    return cues


def main():
    ap = argparse.ArgumentParser(description="Sound bed for the vfrey one-line style (standard library only).")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing file")
    ap.add_argument("--cues", help="a JSON list of sounds; see the top of this file")
    ap.add_argument("--out", required=True, help="the WAV file to write")
    args = ap.parse_args()
    def _plain_error(kind, err, tb):
        print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues files exist, then run the same command again.", file=__import__('sys').stderr)
        raise SystemExit(1)
    __import__('sys').excepthook = _plain_error
    __import__('os').makedirs(__import__('os').path.dirname(__import__('os').path.abspath(args.out)), exist_ok=True)
    timing = json.load(open(args.timing)) if args.timing else None
    if timing is None and not args.duration:
        sys.exit("make-bed: pass --timing FILE or --duration SECONDS")
    dur = (float(timing["durationSec"]) if timing else float(args.duration)) + 1.0
    cues = json.load(open(args.cues)) if args.cues else (default_cues(timing) if timing else [])

    n_total = int(SR * dur)
    buf = [0.0] * n_total
    rnd = random.Random(7)
    hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

    def tone(t0, length, f, amp, att=0.01, rel=0.5, harm=(1.0, 0.25, 0.08), decay=None, trem=0.0):
        i0 = int(t0 * SR)
        for k in range(int(length * SR)):
            i = i0 + k
            if i < 0 or i >= n_total:
                continue
            t = k / SR
            env = min(1.0, t / att) if att > 0 else 1.0
            if decay:
                env *= math.exp(-t / decay)
            if t > length - rel:
                env *= max(0.0, (length - t) / rel)
            v = sum(a * math.sin(2 * math.pi * f * h * t) for h, a in enumerate(harm, 1))
            if trem:
                v *= 1 - trem + trem * math.sin(2 * math.pi * 0.23 * t)
            buf[i] += amp * env * v

    # The pad: slow overlapping chords, each about 8.5 s, with a low root an octave down.
    t, ci = -1.0, 0
    while t < dur:
        for m in CHORDS[ci % 4]:
            tone(t, 10.5, hz(m), 0.035, att=3.0, rel=3.5, harm=(1.0, 0.18, 0.05), trem=0.25)
        tone(t, 10.5, hz(CHORDS[ci % 4][0] - 12), 0.05, att=3.0, rel=3.5, harm=(1.0, 0.1), trem=0.2)
        t += 8.5
        ci += 1

    bell_n = [0]

    def bell(t0, g=1.0, note=None, **_):
        m = int(note) if note else BELL_NOTES[bell_n[0] % len(BELL_NOTES)]
        bell_n[0] += 1
        tone(t0, 2.6, hz(m), 0.10 * g, att=0.004, rel=0.4, harm=(1.0, 0.0, 0.0, 0.18, 0.0, 0.05), decay=0.7)
        tone(t0, 2.6, hz(m + 12), 0.035 * g, att=0.004, rel=0.4, harm=(1.0,), decay=0.45)

    def scratch(t0, g=1.0, dur=1.6, **_):  # high-passed noise with a flutter, like a pen on paper
        i0, n, lp = int(t0 * SR), int(dur * SR), 0.0
        for k in range(n):
            i = i0 + k
            if i < 0 or i >= n_total:
                continue
            x = rnd.uniform(-1, 1)
            lp += 0.35 * (x - lp)
            buf[i] += 0.04 * g * (x - lp) * math.sin(math.pi * k / n) * (0.6 + 0.4 * math.sin(k / SR * 38))

    def rise(t0, g=1.0, **_):  # a pentatonic run climbing
        for j, m in enumerate([62, 66, 69, 74, 78, 81, 86]):
            tone(t0 + 0.3 * j, 1.8, hz(m), 0.06 * g, att=0.004, rel=0.3, harm=(1.0, 0.0, 0.0, 0.15), decay=0.6)

    def open_note(t0, g=1.0, **_):  # an unresolved interval
        tone(t0, 1.8, hz(70), 0.06 * g, att=0.005, rel=0.3, harm=(1.0, 0.1), decay=0.5)

    def resolve(t0, g=1.0, **_):  # low warm note held to the end, then a high soft bell
        tone(t0, max(1.0, dur - t0), hz(45), 0.10 * g, att=1.2, rel=1.5, harm=(1.0, 0.2, 0.05))
        tone(t0 + 2.0, 3.0, hz(88), 0.08 * g, att=0.004, rel=0.5, harm=(1.0, 0.0, 0.0, 0.18), decay=0.9)

    sounds = {"bell": bell, "scratch": scratch, "rise": rise, "open": open_note, "resolve": resolve}
    placed, skipped = 0, []
    timed = [(cue_time(c, timing), i, c) for i, c in enumerate(cues)]
    for t, _, cue in sorted(timed, key=lambda x: (x[0] is None, x[0] or 0, x[1])):
        fn = sounds.get(cue.get("sfx"))
        if t is None or fn is None or t >= dur:
            skipped.append(cue)
            continue
        extra = {k: float(cue[k]) for k in ("dur", "note") if k in cue}
        fn(max(0.0, t), float(cue.get("gain", 1.0)), **extra)
        placed += 1

    # A light echo, then fades and normalising.
    dl = int(0.37 * SR)
    for i in range(dl, n_total):
        buf[i] += 0.28 * buf[i - dl]
    fi, fo = int(1.5 * SR), int(2.5 * SR)
    for i in range(min(fi, n_total)):
        buf[i] *= i / fi
    for i in range(min(fo, n_total)):
        buf[n_total - 1 - i] *= i / fo
    pk = max(abs(x) for x in buf) or 1.0
    with wave.open(args.out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, x / pk * 0.85)) * 32767)) for x in buf))
    print(f"make-bed: wrote {args.out} ({dur:.1f} s, {placed} sounds)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
