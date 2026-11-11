#!/usr/bin/env python3
"""Sound bed for the low-poly 3D style. Python standard library only: no downloads, no numpy, no ffmpeg.

It writes one stereo 16-bit WAV: a light, toy-like bed (kalimba plucks over a soft pad and a round bass, C major,
96 beats a minute) plus accents at the moments you ask for. Same arguments, same file (the noise is seeded).

  python3 make-bed.py --duration 40 --out music/bed.wav
      Bed only; vfrey trims and fades it.
  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/bed.wav
      As long as the film, with accents.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "chime", "word": "angle", "line": 3}        the first time that word is spoken (in that script line, lines count from 0)
  {"sfx": "pop", "line": 2, "offset": -0.2}           the start of a script line, a little early
  {"sfx": "whoosh", "at": 5.4, "dur": 1.0}            a time in seconds
  {"sfx": "buzz", "at": 7.2, "dur": 1.6, "rate": 6.5} a wing buzz that throbs "rate" times a second
  {"sfx": "soft", "at": 5.5, "dur": 21}               not a sound: the bed goes mellow (an interior, a close-up) for that long
Optional on any cue: "gain" (1 is the default level). Sounds: pop (something appears), chime (a fact lands),
whoosh (the camera travels or a panel grows), buzz (an insect, a motor, a vibration), soft (section change).

Then in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey low-poly style)", "volume": -14, "duck": true}
"""
import argparse
import json
import math
import random
import re
import struct
import sys
import wave

RATE = 44100
BPM = 96.0
BEAT = 60.0 / BPM
TAU = math.tau
# one chord per bar: C, Am, F, G (root, and the pentatonic notes the plucks walk through), as MIDI notes
BARS = [(48, [72, 76, 79, 84, 79, 76, 81, 79]), (45, [69, 72, 76, 81, 76, 72, 79, 76]), (41, [69, 72, 77, 81, 77, 72, 76, 72]), (43, [67, 71, 74, 79, 74, 71, 76, 74])]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def norm(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def moment(cue, timing):
    off = float(cue.get("offset", 0))
    if "at" in cue:
        return float(cue["at"]) + off
    if timing is None:
        return None
    words = timing["words"]
    if "word" in cue:
        hits = [w for w in words if norm(w["text"]) == norm(str(cue["word"])) and ("line" not in cue or w.get("line") == cue["line"])]
        return hits[0]["start"] + off if hits else None
    if "line" in cue:
        hits = [w for w in words if w.get("line") == int(cue["line"])]
        return hits[0]["start"] + off if hits else None
    return None


class Mix:
    def __init__(self, seconds):
        self.n = int(seconds * RATE)
        self.l = [0.0] * self.n
        self.r = [0.0] * self.n

    def add(self, t0, samples, gain=1.0, pan=0.0):
        i0 = int(t0 * RATE)
        gl, gr = gain * (1 - max(0, pan)), gain * (1 + min(0, pan))
        l, r, n = self.l, self.r, self.n
        for k, s in enumerate(samples):
            i = i0 + k
            if 0 <= i < n:
                l[i] += s * gl
                r[i] += s * gr


def pluck(freq, dur=0.9, bright=1.0):   # kalimba: a sine, a quiet octave and a short knock of the 4th partial
    n = int(dur * RATE)
    w = TAU * freq / RATE
    out = []
    for i in range(n):
        t = i / RATE
        a = min(1.0, i / 90.0)
        out.append(a * (math.exp(-4.2 * t) * math.sin(w * i) + 0.28 * bright * math.exp(-7 * t) * math.sin(2 * w * i) + 0.2 * bright * math.exp(-22 * t) * math.sin(4.02 * w * i)))
    return out


def bass(freq, dur):
    n = int(dur * RATE)
    w = TAU * freq / RATE
    return [min(1.0, i / 400.0) * math.exp(-1.6 * i / RATE) * (math.sin(w * i) + 0.25 * math.sin(2 * w * i)) for i in range(n)]


def pad(freqs, dur):   # slow swell of slightly detuned sines
    n = int(dur * RATE)
    out = [0.0] * n
    for f in freqs:
        for det in (0.997, 1.004):
            w = TAU * f * det / RATE
            for i in range(n):
                out[i] += math.sin(w * i)
    att, rel = int(0.5 * RATE), int(0.7 * RATE)
    for i in range(n):
        out[i] *= min(1.0, i / att, (n - i) / rel) / (2 * len(freqs))
    return out


def chime(freq=1318.5, dur=1.6):
    n = int(dur * RATE)
    parts = [(1.0, 1.0, 3.0), (2.76, 0.45, 5.0), (5.4, 0.2, 8.0)]
    return [min(1.0, i / 60.0) * sum(g * math.exp(-d * i / RATE) * math.sin(TAU * freq * r * i / RATE) for r, g, d in parts) for i in range(n)]


def pop(dur=0.16):   # a sine that jumps up in pitch
    n = int(dur * RATE)
    out, ph = [], 0.0
    for i in range(n):
        t = i / RATE
        ph += TAU * (320 + 900 * t / dur) / RATE
        out.append(math.sin(ph) * math.exp(-18 * t) * min(1.0, i / 40.0))
    return out


def whoosh(dur, seed):   # noise through a low-pass that opens and closes
    rnd = random.Random(seed)
    n = int(dur * RATE)
    out, y = [], 0.0
    for i in range(n):
        u = i / n
        env = math.sin(math.pi * u) ** 2
        k = 0.02 + 0.22 * env
        y += k * (rnd.uniform(-1, 1) - y)
        out.append(y * env * 2.2)
    return out


def buzz(dur, rate=6.5, freq=232.0):   # a soft sawtooth wing tone that throbs
    n = int(dur * RATE)
    out = []
    for i in range(n):
        t = i / RATE
        ph = (freq * (1 + 0.012 * math.sin(TAU * 31 * t)) * t) % 1.0
        saw = sum(math.sin(TAU * h * ph) / h for h in (1, 2, 3, 4, 5))
        throb = 0.5 + 0.5 * math.sin(TAU * rate * t)
        out.append(saw * (0.25 + 0.75 * throb) * min(1.0, t / 0.06, (dur - t) / 0.1) * 0.5)
    return out


def main():
    ap = argparse.ArgumentParser(description="Sound bed for the vfrey low-poly 3D style (pure Python).")
    ap.add_argument("--timing")
    ap.add_argument("--duration", type=float)
    ap.add_argument("--cues")
    ap.add_argument("--out", required=True)
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
    cues = json.load(open(args.cues)) if args.cues else []
    placed = []
    for c in cues:
        t = moment(c, timing)
        if t is None:
            print(f"make-bed: skipped {json.dumps(c)} (its word or line is not in the timing)", file=sys.stderr)
        else:
            placed.append((max(0.0, t), c))
    soft = [(t, t + float(c.get("dur", 4))) for t, c in placed if c.get("sfx") == "soft"]
    is_soft = lambda t: any(a - 0.2 <= t < b for a, b in soft)

    mix = Mix(dur)
    bar_len, bar = 4 * BEAT, 0
    while bar * bar_len < dur:
        t0 = bar * bar_len
        root, notes = BARS[bar % 4]
        mellow = is_soft(t0 + 0.3)
        mix.add(t0, pad([hz(root + 12), hz(root + 19), hz(root + 24)], bar_len + 0.6), 0.16 if mellow else 0.12)
        mix.add(t0, bass(hz(root - 12 if root > 44 else root), bar_len * 0.9), 0.34)
        mix.add(t0 + 2.5 * BEAT, bass(hz(root), BEAT), 0.2)
        for k, m in enumerate(notes):   # eighth notes; the mellow section plays every other note, an octave down
            if mellow and k % 2:
                continue
            swing = 0.03 if k % 2 else 0.0
            mix.add(t0 + k * BEAT / 2 + swing, pluck(hz(m - 12 if mellow else m), 0.9, 0.5 if mellow else 1.0), (0.2 if mellow else 0.24) * (1.0 if k % 4 == 0 else 0.75), pan=0.35 * math.sin(k * 1.9 + bar))
        bar += 1
    for n, (t, c) in enumerate(placed):
        kind, g = c.get("sfx"), float(c.get("gain", 1.0))
        if kind == "chime":
            mix.add(t, chime(float(c.get("freq", 1318.5))), 0.2 * g, pan=-0.2)
        elif kind == "pop":
            mix.add(t, pop(), 0.4 * g)
        elif kind == "whoosh":
            mix.add(t, whoosh(float(c.get("dur", 1.0)), 11 + n), 0.5 * g)
        elif kind == "buzz":
            mix.add(t, buzz(float(c.get("dur", 1.0)), float(c.get("rate", 6.5))), 0.11 * g, pan=0.15)
        elif kind != "soft":
            print(f"make-bed: skipped {json.dumps(c)} (unknown sound)", file=sys.stderr)

    peak = max(max(abs(x) for x in mix.l), max(abs(x) for x in mix.r), 1e-9)
    k = 0.7 / peak
    fade = int(0.4 * RATE)
    with wave.open(args.out, "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(RATE)
        buf = bytearray()
        for i in range(mix.n):
            e = min(1.0, i / fade, (mix.n - i) / (3 * fade))
            buf += struct.pack("<hh", int(max(-1, min(1, mix.l[i] * k * e)) * 32767), int(max(-1, min(1, mix.r[i] * k * e)) * 32767))
        f.writeframes(bytes(buf))
    print(f"make-bed: wrote {args.out} ({dur:.1f} s, {sum(1 for _, c in placed if c.get('sfx') != 'soft')} accents)")


if __name__ == "__main__":
    main()
