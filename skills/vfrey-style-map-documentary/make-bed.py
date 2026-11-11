#!/usr/bin/env python3
"""Map-documentary music bed: an orchestral-feeling string pad + cello drone + sparse harp plucks, with whooshes,
timpani hits and chimes at cue times. Pure python 3 standard library, own synthesis, no downloads. Deterministic.

usage: python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/bed.wav
       python3 make-bed.py --duration 40 --out music/bed.wav        (bed only, no accents)
--timing gives the film length ("durationSec"); --duration is the same by hand; "duration" inside cues.json wins if present.
cues.json = {"duration": 38.6,
             "whoosh": [{"t": 4.2, "dur": 1.1, "down": false}],   # camera moves, morphs (rising in, "down" falling out)
             "hit":    [20.1],                                      # timpani + low boom: the big reveal
             "chime":  [7.0, 36.0],                                 # a bright bell: a payoff or a number landing
             "swell":  [{"t": 19.5, "dur": 3.0}]}                   # a rising string swell into a reveal
"""
import argparse, json, math, random, struct, wave

SR = 44100
ap = argparse.ArgumentParser(); ap.add_argument("--timing"); ap.add_argument("--duration", type=float); ap.add_argument("--cues"); ap.add_argument("--out", required=True)
a = ap.parse_args(); cues = json.load(open(a.cues)) if a.cues else {}
def _plain_error(kind, err, tb):
    print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues files exist, then run the same command again.", file=__import__('sys').stderr)
    raise SystemExit(1)
__import__('sys').excepthook = _plain_error
__import__('os').makedirs(__import__('os').path.dirname(__import__('os').path.abspath(a.out)), exist_ok=True)
timing = json.load(open(a.timing)) if a.timing else {}
DUR = float(cues.get("duration") or timing.get("durationSec") or a.duration or 40.0); N = int(SR * (DUR + 1.5))
L = [0.0] * N; R = [0.0] * N; rnd = random.Random(11)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12.0)

def table(harm, size=2048):  # one cycle of a waveform made of harmonics [(n, amp), ...]
    return [sum(amp * math.sin(2 * math.pi * n * i / size) for n, amp in harm) for i in range(size)]
STRING = table([(1, 1.0), (2, 0.55), (3, 0.38), (4, 0.22), (5, 0.14), (6, 0.08)]); CELLO = table([(1, 1.0), (2, 0.6), (3, 0.3), (4, 0.15)])
SOFT = table([(1, 1.0), (2, 0.2)])

def voice(tab, f, t0, length, att, rel, vol, pan, detune=0.0, vib=0.0):
    i0 = int(t0 * SR); n = int(length * SR); ph = rnd.random() * len(tab); size = len(tab); lp = 0.0
    inc0 = f * (2 ** (detune / 1200.0)) * size / SR
    for k in range(n):
        j = i0 + k
        if j >= N: break
        t = k / SR; env = min(1.0, t / att) * min(1.0, (length - t) / rel)
        inc = inc0 * (1 + vib * math.sin(2 * math.pi * 5.1 * t + pan * 3))
        ph = (ph + inc) % size; v = tab[int(ph)] * env * vol
        lp += 0.35 * (v - lp)  # soft low-pass: warm, not buzzy
        L[j] += lp * (1 - pan) * 0.5 + lp * 0.5; R[j] += lp * (1 + pan) * 0.5 + lp * 0.5

# chords: Dm - Bb - Gm - A (tension) ... then D major for the payoff. One chord = 8 seconds.
CH = [(38, [50, 53, 57, 62]), (34, [46, 50, 53, 58]), (43, [55, 58, 62, 67]), (33, [52, 57, 61, 64]), (38, [50, 54, 57, 62]), (38, [50, 54, 57, 62])]
t = 0.0; ci = 0
while t < DUR + 0.5:
    root, notes = CH[min(ci, len(CH) - 1)]; ln = 8.4
    for m in notes:
        for d, pan in ((-7, -0.5), (6, 0.5)): voice(STRING, hz(m), t, ln, 2.0, 2.2, 0.075, pan, d, 0.004)
    voice(CELLO, hz(root), t, ln, 1.2, 2.0, 0.17, 0.0); voice(SOFT, hz(root - 12), t, ln, 1.0, 2.0, 0.16, 0.0)
    # sparse harp: an arpeggio every other beat of a slow 60 bpm pulse
    for b in range(8):
        if b % 2 == 0 or rnd.random() < 0.3:
            m = notes[[0, 2, 1, 3, 2, 1, 3, 2][b]] + 12; tt = t + b * 1.0 + 0.2
            for k in range(int(1.6 * SR)):
                j = int(tt * SR) + k
                if j >= N: break
                x = k / SR; v = (math.sin(2 * math.pi * hz(m) * x) + 0.3 * math.sin(4 * math.pi * hz(m) * x)) * math.exp(-x * 3.2) * 0.07
                L[j] += v * 0.8; R[j] += v * 1.0
    t += 8.0; ci += 1

def whoosh(t0, dur, down):
    n = int(dur * SR); i0 = int(t0 * SR); lp = 0.0; bp = 0.0
    for k in range(n):
        j = i0 + k
        if j >= N: break
        x = k / n; env = math.sin(math.pi * x) ** 2; c = 0.01 + 0.30 * ((1 - x) if down else x)
        w = rnd.random() * 2 - 1; lp += c * (w - lp); bp += 0.5 * c * (lp - bp); v = (lp - bp) * env * 2.6
        L[j] += v * (0.8 + 0.2 * x); R[j] += v * (1.0 - 0.2 * x)
def hit(t0):
    for k in range(int(2.0 * SR)):
        j = int(t0 * SR) + k
        if j >= N: break
        x = k / SR; f = 52 + 70 * math.exp(-x * 9); v = math.sin(2 * math.pi * f * x) * math.exp(-x * 2.4) * 0.5 + (rnd.random() * 2 - 1) * math.exp(-x * 40) * 0.15
        L[j] += v; R[j] += v
def chime(t0):
    for m, g in ((86, 1.0), (91, 0.6), (98, 0.35)):
        for k in range(int(2.2 * SR)):
            j = int(t0 * SR) + k
            if j >= N: break
            x = k / SR; v = math.sin(2 * math.pi * hz(m) * x) * math.exp(-x * 2.4) * 0.07 * g; L[j] += v; R[j] += v
def swell(t0, dur):
    for m, pan in ((62, -0.4), (69, 0.4), (74, 0.0)): voice(STRING, hz(m), t0, dur, dur * 0.85, 0.5, 0.06, pan, 0, 0.005)

for c in cues.get("whoosh", []): whoosh(c["t"], c.get("dur", 1.1), c.get("down", False))
for tt in cues.get("hit", []): hit(tt)
for tt in cues.get("chime", []): chime(tt)
for c in cues.get("swell", []): swell(c["t"], c.get("dur", 3.0))

# fade in / out, normalise to a peak of 0.85
for i in range(N):
    x = i / SR; g = min(1.0, x / 0.6) * min(1.0, max(0.0, (DUR + 0.8 - x) / 2.2)); L[i] *= g; R[i] *= g
pk = max(max(abs(v) for v in L), max(abs(v) for v in R)) or 1.0; sc = 0.85 / pk
with wave.open(a.out, "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<hh", int(max(-1, min(1, L[i] * sc)) * 32767), int(max(-1, min(1, R[i] * sc)) * 32767)) for i in range(N)))
print("wrote", a.out, round(N / SR, 1), "s")
