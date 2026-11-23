#!/usr/bin/env python3
"""Music bed and card sounds for the post and comments style. Python standard library only: no downloads, no ffmpeg.
It writes one mono 16-bit WAV: soft lo-fi electric-piano chords, a muffled kick and a brushed hat at about 82 BPM, with a
pop when a card comes in. The same arguments always give the same file.

  python3 make-bed.py --duration 45 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/bed.wav
      Bed as long as the film with accents. Without --cues: a pop on every spoken line after the first two.

cues.json is one object of lists of times in seconds, the same values the scene uses for its cards:
  {"pop": [..],      a card rising in
   "swish": [..],    the post folding up
   "tick": [..],     the last card
   "duration": 41.2} optional film length; --timing or --duration give it otherwise
"""
import argparse, json, math, os, random, struct, sys, wave

SR = 44100
ap = argparse.ArgumentParser(description="Music bed and card sounds for the vfrey post and comments style")
ap.add_argument("--timing"); ap.add_argument("--duration", type=float); ap.add_argument("--cues"); ap.add_argument("--out", required=True)
args = ap.parse_args()


def _plain_error(kind, err, tb):
    print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues files exist, then run the same command again.", file=sys.stderr)
    raise SystemExit(1)


sys.excepthook = _plain_error
os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
timing = json.load(open(args.timing)) if args.timing else None
cues = json.load(open(args.cues)) if args.cues else {}
film = cues.get("duration") or (timing["durationSec"] if timing else None) or args.duration
if not film:
    sys.exit("make-bed: pass --timing FILE, --duration SECONDS, or a cues file with a duration")
cues["duration"] = float(film)
if not args.cues and timing:
    cues["pop"] = [max(0.2, l["start"] - 0.1) for l in timing.get("lines", [])[2:]]
N = int((cues["duration"] + 1.0) * SR)
L = [0.0] * N
rnd = random.Random(11)


def add(t, samples, gain=1.0):
    i0 = int(t * SR)
    for i, v in enumerate(samples):
        j = i0 + i
        if 0 <= j < N:
            L[j] += v * gain


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def epiano(f, d):
    n = int(d * SR); o = []
    for i in range(n):
        t = i / SR
        e = math.exp(-t * 1.6) * min(1, i / (0.004 * SR)) * (1 if i < n - 0.2 * SR else max(0, (n - i) / (0.2 * SR)))
        v = math.sin(2 * math.pi * f * t + 0.6 * math.sin(2 * math.pi * f * 2 * t) * math.exp(-t * 3))
        o.append(v * e)
    return o


def kick():
    n = int(0.32 * SR); o = []
    for i in range(n):
        t = i / SR
        o.append(math.sin(2 * math.pi * (48 + 70 * math.exp(-t * 28)) * t) * math.exp(-t * 9))
    return o


def hat():
    n = int(0.06 * SR); o = []; y = 0.0; prev = 0.0
    for i in range(n):
        x = rnd.uniform(-1, 1); y = x - prev; prev = x
        o.append(y * math.exp(-i / SR * 70))
    return o


def pop(f=820):
    n = int(0.16 * SR); o = []
    for i in range(n):
        t = i / SR
        o.append(math.sin(2 * math.pi * f * (1 + 0.5 * math.exp(-t * 35)) * t) * math.exp(-t * 26))
    return o


def swish(d=0.45):
    n = int(d * SR); y = 0.0; o = []
    for i in range(n):
        p = i / n
        y += (0.04 + 0.35 * p) * (rnd.uniform(-1, 1) - y)
        o.append(y * math.sin(math.pi * p) ** 1.4)
    return o


# Bed: Dm9 - G13 - Cmaj9 - Am9, one chord per 4 s bar (2 beats of 82 BPM is about 1.46 s; the bar is 4 s for calm).
chords = [[50, 57, 60, 64, 65], [43, 53, 57, 59, 64], [48, 55, 59, 62, 64], [45, 55, 59, 60, 64]]
bar = 4.0; beat = 60 / 82
t = 0.0; k = 0
total = cues["duration"] + 1.0
while t < total:
    for j, m in enumerate(chords[k % 4]):
        add(t + j * 0.012, epiano(hz(m + 12), bar + 0.3), 0.045 if j else 0.06)
    t += bar; k += 1
b = 0.0; i = 0
while b < total:
    if i % 4 in (0, 2):
        add(b, kick(), 0.22)
    add(b + beat / 2, hat(), 0.05)
    b += beat; i += 1

for t in cues.get("pop", []):
    add(t, pop(), 0.30)
for t in cues.get("swish", []):
    add(t - 0.1, swish(), 0.30)
for t in cues.get("tick", []):
    add(t, pop(1320), 0.18)

mx = max(abs(v) for v in L) or 1
scale = 0.9 / mx
with wave.open(args.out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v * scale)) * 32767)) for v in L))
print("wrote", args.out, round(N / SR, 1), "s")
