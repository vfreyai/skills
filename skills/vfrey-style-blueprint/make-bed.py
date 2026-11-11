#!/usr/bin/env python3
"""Music bed and drafting sounds for the blueprint style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV: a slow three-voice pad over A, F, C, G, a soft sine pluck pulse at 84 bpm, and
drafting accents at the moments you ask for. The same arguments always give the same file.

  python3 make-bed.py --duration 40 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film. Without --cues: a pencil scratch at the start of every spoken sentence and a
      stamp thump at the end of the last one.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "scratch", "word": "tension", "offset": 0.1}     the first time a word starting with that is spoken
  {"sfx": "slide",   "line": 1, "offset": -0.6, "dur": 1.2} the start of script line 1 (count from 0); a ruler or tool sliding
  {"sfx": "thump",   "sentence": 3, "edge": "end"}           the start or end of spoken sentence 3 (count from 0)
  {"sfx": "tick",    "at": 3.2, "n": 8, "every": 0.09}      a time in seconds; "n" ticks while lines draw
  {"sfx": "tone",    "at": 12.0, "freq": 880}               a short soft note: a dimension or value landing
Optional: "gain" (1 is the default level). Sounds: scratch (pencil on paper, one per label), slide (a ruler or
drafting tool moving), tick (lines drawing), thump (the closing stamp), tone (a soft sine note).
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


def sentences(timing):
    out, cur = [], None
    for w in timing.get("words", []):
        if cur is None:
            cur = {"start": w["start"], "end": w["end"]}
            out.append(cur)
        cur["end"] = w["end"]
        if re.search(r"[.!?][\"')]?$", w["text"]):
            cur = None
    return out


def moment(cue, timing):
    """Seconds for one cue, or None if the cue names something that is not in the timing."""
    off = float(cue.get("offset", 0))
    if "at" in cue:
        return float(cue["at"]) + off
    if "word" in cue and timing:
        key = re.sub(r"[^a-z0-9]", "", str(cue["word"]).lower())
        for w in timing["words"]:
            if re.sub(r"[^a-z0-9]", "", w["text"].lower()).startswith(key):
                return w["start"] + off
        return None
    if "line" in cue and timing:
        lines = timing.get("lines", [])
        i = int(cue["line"])
        if i < len(lines):
            return lines[i]["end" if cue.get("edge") == "end" else "start"] + off
        return None
    if "sentence" in cue and timing:
        s = sentences(timing)
        i = int(cue["sentence"])
        if i < len(s):
            return s[i]["end" if cue.get("edge") == "end" else "start"] + off
    return None


def main():
    ap = argparse.ArgumentParser(description="Music bed and drafting sounds for the vfrey blueprint style")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing")
    ap.add_argument("--cues", help="cues.json, a list of sounds and moments")
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
    N = int(dur * SR)
    buf = [0.0] * N

    def tone(t, f, d, amp, att=0.02, harm=(1, 0.3, 0.1)):
        s0, L = int(t * SR), int(d * SR)
        for k in range(L):
            j = s0 + k
            if j >= N or j < 0:
                break
            x = k / SR
            env = min(1, x / att) * (1 - k / L) ** 1.5
            buf[j] += sum(a * math.sin(2 * math.pi * f * (h + 1) * x) for h, a in enumerate(harm)) * env * amp

    def pad(t, f, d, amp):
        s0, L = int(t * SR), int(d * SR)
        for k in range(L):
            j = s0 + k
            if j >= N:
                break
            x = k / SR
            env = min(1, x / 1.5) * min(1, (L - k) / (1.5 * SR))
            buf[j] += sum(math.sin(2 * math.pi * f * (1 + dt) * x) for dt in (-0.003, 0, 0.003)) / 3 * env * amp

    def noise(t, d, amp, lp, shape, seed):
        r = random.Random(seed)
        s0, L = int(t * SR), int(d * SR)
        y = y2 = 0.0
        for k in range(L):
            if s0 + k >= N or s0 + k < 0:
                break
            y += (r.uniform(-1, 1) - y) * lp
            y2 += (y - y2) * lp
            buf[s0 + k] += (y - y2) * amp * shape(k / L)

    def tick(t, amp=0.12):
        s0 = int(t * SR)
        for k in range(int(0.03 * SR)):
            if 0 <= s0 + k < N:
                buf[s0 + k] += math.sin(2 * math.pi * 2400 * k / SR) * math.exp(-k / (SR * 0.005)) * amp

    def scratch(t, g=1.0, n=5, seed=1):
        r = random.Random(seed)
        for i in range(n):
            noise(t + i * 0.07, 0.06, 0.5 * g * r.uniform(0.6, 1), 0.35, lambda p: math.sin(math.pi * p), seed * 10 + i)

    def slide(t, g=1.0, d=1.1, seed=3):
        noise(t, d, 1.2 * g, 0.06, lambda p: math.sin(math.pi * p) ** 1.5, seed)
        for i in range(int(d * 14)):
            tick(t + i / 14, 0.05 * g)

    def thump(t, g=1.0):
        s0 = int(t * SR)
        for k in range(int(0.5 * SR)):
            if 0 <= s0 + k < N:
                buf[s0 + k] += math.sin(2 * math.pi * (90 - 40 * k / (0.5 * SR)) * k / SR) * math.exp(-k / (SR * 0.12)) * 0.8 * g

    # the bed: pad chords A-F-C-G, a pluck pulse at 84 bpm, a bass note per bar
    note = {"A": 220.0, "C": 261.63, "D": 293.66, "E": 329.63, "F": 349.23, "G": 392.0}
    beat = 60 / 84
    chords = [("A", "C", "E"), ("F", "A", "C"), ("C", "E", "G"), ("G", "D", "E")]
    for b in range(int(dur / (4 * beat)) + 1):
        c = chords[b % 4]
        t0 = b * 4 * beat
        for n in c:
            pad(t0, note[n], 4 * beat + 1, 0.05)
        for e in range(8):
            if (e + b) % 3 == 2:
                continue
            tone(t0 + e * beat / 2, note[c[e % 3]] * 2, 0.6, 0.07 if e % 2 else 0.1, 0.005, (1, 0.15, 0.05))
        tone(t0, note[c[0]] / 2, 1.8, 0.14, 0.05, (1, 0.1))

    cues = json.load(open(args.cues)) if args.cues else None
    if cues is None and timing:
        s = sentences(timing)
        cues = [{"sfx": "scratch", "sentence": i} for i in range(len(s))]
        if s:
            cues.append({"sfx": "thump", "sentence": len(s) - 1, "edge": "end", "offset": -0.3})
    for i, cue in enumerate(cues or []):
        t = moment(cue, timing)
        if t is None:
            print("make-bed: skipped cue %d, its moment is not in the timing: %s" % (i, cue), file=sys.stderr)
            continue
        g = float(cue.get("gain", 1))
        kind = cue.get("sfx")
        if kind == "scratch":
            scratch(t, g, int(cue.get("n", 5)), i + 1)
        elif kind == "slide":
            slide(t, g, float(cue.get("dur", 1.1)), i + 3)
        elif kind == "thump":
            thump(t, g)
        elif kind == "tick":
            for q in range(int(cue.get("n", 1))):
                tick(t + q * float(cue.get("every", 0.09)), 0.1 * g)
        elif kind == "tone":
            tone(t, float(cue.get("freq", 880)), 0.5, 0.1 * g, 0.005)
        else:
            print("make-bed: unknown sfx %r in cue %d" % (kind, i), file=sys.stderr)

    peak = max(abs(x) for x in buf) or 1
    with wave.open(args.out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, x / peak * 0.9)) * 32767)) for x in buf))
    print("wrote", args.out, round(dur, 1), "s")


if __name__ == "__main__":
    main()
