#!/usr/bin/env python3
"""Music bed and paper sounds for the paper cut-out style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV: a small plucked-string storybook loop (C, Am, F, G at 104 bpm: bass, an eighth-note
arpeggio, a little melody, woodblock ticks) with paper sounds mixed in at the times you ask for. The same arguments
always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film, with sounds. Without --cues: a paper slide into every script line.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "slide", "line": 1, "offset": -0.62}       the start of script line 1 (lines count from 0), a little early
  {"sfx": "tear",  "word": "^army", "line": 3}       the first word on line 3 that matches (a regular expression, case ignored)
  {"sfx": "thump", "at": 12.4}                       a time in seconds
Optional: "gain" (1 is the default level), "nth" (1 for the second match). Sounds: slide (a sheet slides in), fold (a
sheet folds away: a swoosh, then a soft thud), tear (a sheet is torn: a run of crackles), thump (a stop-motion pop:
a puppet lands, a number appears). Give each transition the sound of its kind, at the transition's start time.

Takes a few seconds. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey paper cut-out style)", "volume": -18, "duck": true}
"""
import argparse
import json
import math
import random
import re
import struct
import sys
import wave

SR = 44100
BPM = 104
NOTE = {"C": 261.63, "D": 293.66, "E": 329.63, "F": 349.23, "G": 392.0, "A": 440.0, "B": 493.88}
CHORDS = [("C", ["C", "E", "G"]), ("A", ["A", "C", "E"]), ("F", ["F", "A", "C"]), ("G", ["G", "B", "D"])]


def moment(cue, timing):
    """Seconds for one cue, or None when its word or line is not in the timing."""
    offset = float(cue.get("offset", 0))
    if "at" in cue:
        return float(cue["at"]) + offset
    if timing is None:
        return None
    if "word" in cue:
        rx = re.compile(str(cue["word"]), re.I)
        hits = [w for w in timing["words"] if rx.search(w["text"]) and ("line" not in cue or w.get("line") == cue["line"])]
        nth = int(cue.get("nth", 0))
        return hits[nth]["start"] + offset if nth < len(hits) else None
    if "line" in cue:
        lines = timing.get("lines", [])
        i = int(cue["line"])
        return lines[i]["start"] + offset if 0 <= i < len(lines) else None
    return None


def main():
    ap = argparse.ArgumentParser(description="Music bed and paper sounds for the vfrey paper cut-out style (standard library only).")
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
    if args.cues:
        cues = json.load(open(args.cues))
    elif timing:
        cues = [{"sfx": "slide", "line": i, "offset": -0.62} for i in range(1, len(timing.get("lines", [])))]
    else:
        cues = []

    n_total = int(dur * SR)
    buf = [0.0] * n_total
    rnd = random.Random(7)
    fr = lambda name, octave: NOTE[name] * (2 ** (octave - 4))

    def pluck(t, freq, length, amp, bright=0.5):
        """A Karplus-Strong plucked string: a burst of noise in a short loop that is averaged as it goes round."""
        n = int(SR / freq)
        loop = [rnd.uniform(-1, 1) * (1 - bright) + rnd.uniform(-1, 1) * bright for _ in range(n)]
        s0, total, i = int(t * SR), int(length * SR), 0
        for k in range(total):
            j = s0 + k
            if j >= n_total:
                break
            y = 0.5 * (loop[i] + loop[(i + 1) % n]) * 0.997
            loop[i] = y
            i = (i + 1) % n
            if j >= 0:
                buf[j] += y * amp * min(1.0, k / 60) * (1 - k / total) ** 1.2

    def tick(t, amp):  # a woodblock-like click
        s0 = int(t * SR)
        for k in range(int(0.05 * SR)):
            if 0 <= s0 + k < n_total:
                buf[s0 + k] += math.sin(2 * math.pi * 1700 * k / SR) * math.exp(-k / (SR * 0.008)) * amp

    def noise(t, length, amp, lowpass, shape, seed):  # filtered noise under an envelope: every paper sound is this
        r = random.Random(seed)
        s0, total, y = int(t * SR), int(length * SR), 0.0
        for k in range(total):
            if s0 + k >= n_total:
                break
            y += (r.uniform(-1, 1) - y) * lowpass
            if s0 + k >= 0:
                buf[s0 + k] += y * amp * shape(k / total)

    # The bed, one bar at a time.
    beat = 60 / BPM
    for bar in range(int(dur / (4 * beat)) + 1):
        root, tones = CHORDS[bar % 4]
        t0 = bar * 4 * beat
        pluck(t0, fr(root, 2), 1.2, 0.30, 0.3)
        pluck(t0 + 2 * beat, fr(tones[2], 2), 1.0, 0.22, 0.3)
        for e, step in enumerate([0, 1, 2, 1, 0, 1, 2, 1]):
            pluck(t0 + e * beat / 2, fr(tones[step], 4), 0.55, 0.13 if e % 2 else 0.17)
        if bar >= 1:  # a little tune on top
            tune = [("E", 5), ("G", 5), ("E", 5), ("D", 5)] if bar % 2 == 0 else [("C", 5), ("E", 5), ("D", 5), ("C", 5)]
            for m, (name, octave) in enumerate(tune):
                pluck(t0 + m * beat + (0.5 * beat if m % 2 else 0), fr(name, octave), 0.8, 0.10, 0.6)
        tick(t0 + beat, 0.10)
        tick(t0 + 3 * beat, 0.10)

    placed, skipped = 0, []
    for k, cue in enumerate(cues):
        t = moment(cue, timing)
        kind = cue.get("sfx")
        g = float(cue.get("gain", 1.0))
        if t is None or kind not in ("slide", "fold", "tear", "thump"):
            skipped.append(cue)
            continue
        if kind == "slide":
            noise(t, 0.8, 0.55 * g, 0.12, lambda p: math.sin(math.pi * p) ** 1.5, 100 + k)
        elif kind == "fold":
            noise(t, 0.8, 0.5 * g, 0.08, lambda p: math.sin(math.pi * p * 0.9) ** 2, 200 + k)
            noise(t + 0.62, 0.12, 0.6 * g, 0.05, lambda p: (1 - p) ** 2, 300 + k)
        elif kind == "tear":
            r = random.Random(400 + k)
            for c in range(26):
                noise(t + c * 0.03 + r.uniform(0, 0.02), 0.03, 0.5 * g * r.uniform(0.4, 1), 0.5, lambda p: 1 - p, 500 + k * 40 + c)
        else:
            pluck(max(0.0, t), 98, 0.35, 0.35 * g, 0.1)
        placed += 1

    peak = max(abs(x) for x in buf) or 1.0
    fade = int(1.5 * SR)
    frames = bytearray()
    for i, x in enumerate(buf):
        f = min(1.0, (n_total - i) / fade)
        frames += struct.pack("<h", int(max(-1.0, min(1.0, x / peak * 0.9 * f)) * 32767))
    with wave.open(args.out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"make-bed: wrote {args.out} ({dur:.1f} s, {placed} sounds)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
