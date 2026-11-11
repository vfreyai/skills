#!/usr/bin/env python3
"""Warm ambient pad + glassy accents for the soft-gradient style. Standard library only. Deterministic.
  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav
  python3 make-bed.py --duration 40 --out music/bed.wav      (bed only)
Accents: a soft 'glint' (two high sine partials with a fast decay) at each sentence start, a 'swell' (filtered noise rising)
before each big phase change, a 'chime' at the end. Pad: Fmaj9 - Cmaj7 - Am9 - Dm9, slow attack, detuned sines, gentle LFO."""
import argparse, json, math, random, struct, wave
SR = 44100; TAU = 2 * math.pi
CH = [[174.61, 220.0, 261.63, 329.63, 392.0], [130.81, 196.0, 246.94, 329.63, 392.0],
      [110.0, 164.81, 220.0, 261.63, 329.63, 392.0], [146.83, 220.0, 261.63, 329.63, 440.0]]
ARP = [523.25, 659.25, 783.99, 880.0, 987.77, 783.99, 659.25, 880.0]
ap = argparse.ArgumentParser(); ap.add_argument("--timing"); ap.add_argument("--duration", type=float, default=40); ap.add_argument("--out", required=True); a = ap.parse_args()
def _plain_error(kind, err, tb):
    print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues files exist, then run the same command again.", file=__import__('sys').stderr)
    raise SystemExit(1)
__import__('sys').excepthook = _plain_error
__import__('os').makedirs(__import__('os').path.dirname(__import__('os').path.abspath(a.out)), exist_ok=True)
sent = []
if a.timing:
    t = json.load(open(a.timing)); dur = t["durationSec"] + 1.5; cur = None
    for w in t["words"]:
        if cur is None: cur = w["start"]; sent.append([cur, w["end"]])
        sent[-1][1] = w["end"]
        if w["text"][-1:] in ".!?": cur = None
else: dur = a.duration
N = int(dur * SR); L = [0.0] * N; R = [0.0] * N; rnd = random.Random(4)
def add(t0, buf, pan=0.0, g=1.0):
    i0 = int(t0 * SR); gl = g * (1 - pan) ** .5; gr = g * (1 + pan) ** .5
    for k, v in enumerate(buf):
        j = i0 + k
        if j >= N: break
        L[j] += v * gl * .7; R[j] += v * gr * .7
# pad
SEG = 6.0
for s in range(int(dur / SEG) + 2):
    t0 = s * SEG - .5 if s else 0; ch = CH[s % 4]; n = int((SEG + 2.2) * SR); buf = [0.0] * n; ph = [rnd.random() * TAU for _ in ch]
    for fi, f in enumerate(ch):
        for dt in (-.9, .9):
            for k in range(n):
                tt = k / SR; env = min(1, tt / 1.8) * min(1, (n - k) / (1.8 * SR))
                lfo = 1 + .04 * math.sin(TAU * .17 * tt + fi)
                buf[k] += math.sin(TAU * f * (1 + dt * .0007) * tt + ph[fi]) * env * lfo * (.05 if f < 200 else .035)
    add(max(0, t0), buf)
# arpeggio, sparse glassy
beat = 60 / 72
for q in range(int(dur / beat)):
    if q % 2 == 0 and q * beat > 1:
        f = ARP[(q // 2) % len(ARP)]; n = int(1.6 * SR)
        buf = [(math.sin(TAU * f * k / SR) + .25 * math.sin(TAU * 2 * f * k / SR)) * math.exp(-k / SR * 2.6) * .028 * min(1, k / 200) for k in range(n)]
        add(q * beat, buf, pan=math.sin(q) * .5)
def glint(t0, f=1568, g=1.0):
    n = int(1.4 * SR); buf = [(math.sin(TAU * f * k / SR) + .5 * math.sin(TAU * f * 1.5 * k / SR) + .3 * math.sin(TAU * f * 2.01 * k / SR)) * math.exp(-k / SR * 4.2) * .09 * g * min(1, k / 80) for k in range(n)]
    add(t0, buf, pan=.2)
def swell(t0, d=1.4, g=1.0):
    n = int(d * SR); buf = []; lp = 0.0
    for k in range(n):
        x = k / n; c = .02 + .35 * x * x; lp += c * (rnd.uniform(-1, 1) - lp); buf.append(lp * math.sin(math.pi * x) ** 2 * .35 * g)
    add(t0, buf)
def chime(t0):
    for i, f in enumerate([783.99, 987.77, 1174.66, 1567.98]):
        n = int(3.2 * SR); buf = [math.sin(TAU * f * k / SR) * math.exp(-k / SR * 1.5) * .07 * min(1, k / 100) for k in range(n)]
        add(t0 + i * .11, buf, pan=-.3 + i * .2)
if sent:
    for i, (s, e) in enumerate(sent):
        glint(s + .05, [1318.5, 1567.98, 1760, 2093][i % 4]); swell(max(0, s - 1.2), 1.3, .7)
    chime(sent[-1][1] - .4)
else: glint(.4); chime(dur - 4)
pk = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1; sc = .85 / pk
f = int(1.0 * SR)
with wave.open(a.out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    out = bytearray()
    for i in range(N):
        e = min(1, i / f) * min(1, (N - i) / f)
        out += struct.pack("<hh", int(max(-1, min(1, L[i] * sc * e)) * 32000), int(max(-1, min(1, R[i] * sc * e)) * 32000))
    w.writeframes(bytes(out))
print("wrote", a.out, round(dur, 1), "s")
