#!/usr/bin/env python3
"""Music bed and sound accents for the terminal / ASCII style. Python standard library only: no downloads, no ffmpeg.

It writes one stereo 16-bit WAV: a low synth bed (A-minor drone, slow pad, a quiet sixteenth-note pulse at 96 bpm)
with keyboard clicks and soft beeps mixed in at the moments the scene draws them. The same input always gives the
same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.js --out music/bed.wav
      Bed as long as the film, with accents from the scene's own cue sheet.

The cue sheet is the file the scene loads with <script src="cues.js">: `window.CUES = [ ...JSON... ];`
(a plain .json list works too). Each cue has one anchor and one sound:
  anchor  "line": 2            the start of script line 2 (count from 0)
          "word": [2, "seven"] the first word of line 2 that starts with "seven"
          "at": 3.2            a time in seconds
          "off": -0.2          seconds added to the anchor
  "sfx"   type   one key click per character of "text", "cps" characters a second
          tick   "n" soft ticks, "every" seconds apart (slots locking, list items landing)
          roll   a dice / shuffle rattle for "dur" seconds
          beep   one soft beep            ok     two rising beeps (a good result)
          alert  two falling buzzes (the one alert moment)   boom  a low thump under a headline number
          whoosh a noise sweep for a screen clear, scroll or pane split
  optional "gain" (1 is the default level).
"""
import argparse
import json
import math
import random
import re
import struct
import wave

SR = 44100
ap = argparse.ArgumentParser(description="Music bed and accents for the vfrey terminal style.")
ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
ap.add_argument("--duration", type=float, help="length in seconds when there is no --timing")
ap.add_argument("--cues", help="the scene's cues.js (or a .json list)")
ap.add_argument("--out", required=True, help="the WAV file to write")
args = ap.parse_args()
def _plain_error(kind, err, tb):
    print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues files exist, then run the same command again.", file=__import__('sys').stderr)
    raise SystemExit(1)
__import__('sys').excepthook = _plain_error
__import__('os').makedirs(__import__('os').path.dirname(__import__('os').path.abspath(args.out)), exist_ok=True)

timing = json.load(open(args.timing)) if args.timing else None
dur = (timing["durationSec"] if timing else (args.duration or 60.0)) + 0.5
N = int(dur * SR)
Lb = [0.0] * N
Rb = [0.0] * N
rng = random.Random(15)


def add(t0, data, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    gl = gain * (1.0 - max(0.0, pan))
    gr = gain * (1.0 + min(0.0, pan))
    for k, v in enumerate(data):
        i = i0 + k
        if 0 <= i < N:
            Lb[i] += v * gl
            Rb[i] += v * gr


def env(k, n, a, r):
    """linear attack of a samples, release of r samples"""
    if k < a:
        return k / a
    if k > n - r:
        return max(0.0, (n - k) / r)
    return 1.0


def tone(freq, length, shape="sine", attack=0.005, release=0.05, decay=0.0, sweep=None):
    n = int(length * SR)
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    out = []
    ph = 0.0
    for k in range(n):
        f = freq if sweep is None else freq + (sweep - freq) * (k / n)
        ph += 2 * math.pi * f / SR
        if shape == "sine":
            v = math.sin(ph)
        elif shape == "soft":      # a rounded square: the first odd harmonics
            v = math.sin(ph) + 0.33 * math.sin(3 * ph) + 0.12 * math.sin(5 * ph)
        else:                      # "buzz"
            v = math.sin(ph) + 0.5 * math.sin(2 * ph) + 0.33 * math.sin(3 * ph) + 0.2 * math.sin(4 * ph)
        e = env(k, n, a, r)
        if decay:
            e *= math.exp(-k / (decay * SR))
        out.append(v * e)
    return out


def noise(length, lo=0.0, hi=1.0, decay=0.0, sweep=None):
    """one-pole filtered noise; hi and lo are smoothing amounts 0..1 (hi: 1 = bright)"""
    n = int(length * SR)
    out = []
    y = 0.0
    z = 0.0
    for k in range(n):
        h = hi if sweep is None else hi + (sweep - hi) * (k / n)
        x = rng.uniform(-1, 1)
        y += h * (x - y)          # low-pass
        z += lo * (y - z)         # what to take away again (high-pass)
        e = env(k, n, int(0.002 * SR) + 1, int(0.3 * n) + 1)
        if decay:
            e *= math.exp(-k / (decay * SR))
        out.append((y - z) * e)
    return out


# ---- accents
def key_click(t, g=1.0):
    pan = rng.uniform(-0.35, 0.35)
    add(t, noise(0.022, lo=0.5, hi=0.75, decay=0.005), 0.5 * g, pan)                    # the tick
    add(t + 0.002, tone(rng.uniform(150, 210), 0.05, decay=0.014), 0.42 * g, pan)       # the thock


def sfx_type(t, c):
    text, cps = c.get("text", "x" * 8), float(c.get("cps", 12))
    for i, ch in enumerate(text):
        jit = rng.uniform(-0.25, 0.25) / cps
        key_click(t + i / cps + (jit if i else 0), c.get("gain", 1.0) * (0.75 if ch == " " else rng.uniform(0.8, 1.0)))


def sfx_tick(t, c):
    for i in range(int(c.get("n", 1))):
        add(t + i * float(c.get("every", 0.2)), tone(1240 + i * 60, 0.05, "sine", decay=0.016), 0.2 * c.get("gain", 1.0), -0.3 + 0.6 * (i % 2))
        key_click(t + i * float(c.get("every", 0.2)), 0.5)


def sfx_roll(t, c):
    d = float(c.get("dur", 1.0))
    k = 0.0
    while k < d:
        add(t + k, tone(rng.uniform(900, 1700), 0.03, "sine", decay=0.008), 0.11 * c.get("gain", 1.0), rng.uniform(-0.5, 0.5))
        add(t + k, noise(0.018, lo=0.6, hi=0.8, decay=0.004), 0.24 * c.get("gain", 1.0), rng.uniform(-0.5, 0.5))
        k += rng.uniform(0.045, 0.09)


def sfx_beep(t, c):
    add(t, tone(880, 0.11, "soft", attack=0.004, release=0.05), 0.11 * c.get("gain", 1.0))


def sfx_ok(t, c):
    add(t, tone(660, 0.09, "soft", release=0.04), 0.1 * c.get("gain", 1.0), -0.2)
    add(t + 0.1, tone(990, 0.2, "soft", release=0.14), 0.1 * c.get("gain", 1.0), 0.2)


def sfx_alert(t, c):
    add(t, tone(392, 0.13, "buzz", release=0.03), 0.12 * c.get("gain", 1.0))
    add(t + 0.16, tone(294, 0.26, "buzz", release=0.1), 0.12 * c.get("gain", 1.0))


def sfx_boom(t, c):
    add(t, tone(120, 0.7, "sine", attack=0.003, release=0.3, decay=0.22, sweep=38), 0.75 * c.get("gain", 1.0))
    add(t, noise(0.25, lo=0.02, hi=0.25, decay=0.06), 0.35 * c.get("gain", 1.0))
    add(t, tone(1320, 0.3, "sine", decay=0.09), 0.06 * c.get("gain", 1.0))


def sfx_whoosh(t, c):
    d = float(c.get("dur", 0.5))
    add(t, noise(d, lo=0.05, hi=0.04, sweep=0.5), 0.34 * c.get("gain", 1.0), -0.25)
    add(t + 0.03, noise(d, lo=0.05, hi=0.03, sweep=0.4), 0.34 * c.get("gain", 1.0), 0.25)


SFX = {"type": sfx_type, "tick": sfx_tick, "roll": sfx_roll, "beep": sfx_beep, "ok": sfx_ok, "alert": sfx_alert, "boom": sfx_boom, "whoosh": sfx_whoosh}


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def moment(c):
    if "at" in c:
        return float(c["at"]) + c.get("off", 0)
    lines, words = timing["lines"], timing["words"]
    if "word" in c:
        li, pre = c["word"]
        for w in words:
            if w["line"] == li and norm(w["text"]).startswith(norm(pre)):
                return w["start"] + c.get("off", 0)
        return lines[min(li, len(lines) - 1)]["start"] + c.get("off", 0)
    return lines[min(c.get("line", 0), len(lines) - 1)]["start"] + c.get("off", 0)


# ---- the bed: drone + pad + pulse, 96 bpm, two bars a chord
BPM = 96.0
BEAT = 60.0 / BPM
CHORDS = [  # (root for the drone, pad notes, arpeggio notes) in Hz
    (55.00, (110.00, 130.81, 164.81), (220.00, 261.63, 329.63, 440.00)),   # Am
    (55.00, (110.00, 130.81, 164.81), (220.00, 329.63, 261.63, 493.88)),   # Am(add9)
    (43.65, (87.31, 130.81, 174.61), (174.61, 261.63, 349.23, 440.00)),    # F
    (49.00, (98.00, 123.47, 146.83), (196.00, 293.66, 246.94, 392.00)),    # G
]
span = 8 * BEAT   # two bars
nch = int(dur / span) + 1
for ci in range(nch):
    root, pad, arp = CHORDS[ci % len(CHORDS)]
    t0 = ci * span
    n = int((span + 0.6) * SR)
    a = int(0.9 * SR)
    r = int(1.1 * SR)
    seg_l, seg_r = [], []
    for k in range(n):
        t = k / SR
        e = env(k, n, a, r)
        trem = 0.8 + 0.2 * math.sin(2 * math.pi * 0.21 * (t0 + t))
        d = 0.5 * math.sin(2 * math.pi * root * t) + 0.22 * math.sin(2 * math.pi * root * 2.005 * t) + 0.1 * math.sin(2 * math.pi * root * 3 * t)
        pl = pr = 0.0
        for j, f in enumerate(pad):
            pl += math.sin(2 * math.pi * f * 1.003 * t + j) + 0.25 * math.sin(2 * math.pi * f * 2 * t)
            pr += math.sin(2 * math.pi * f * 0.997 * t + j * 1.7) + 0.25 * math.sin(2 * math.pi * f * 2.004 * t)
        seg_l.append((d * 0.36 + pl * 0.075 * trem) * e)
        seg_r.append((d * 0.36 + pr * 0.075 * trem) * e)
    add(t0, seg_l, 1.0, -1.0)   # pan -1 keeps only the left gain
    add(t0, seg_r, 1.0, 1.0)
    for s in range(32):          # sixteenth-note pulse; it thins out every fourth step
        ts = t0 + s * BEAT / 4
        if ts > dur:
            break
        if s % 8 == 0:
            add(ts, tone(62, 0.3, "sine", attack=0.002, decay=0.09, sweep=40), 0.5)                 # soft kick
        if s % 4 == 3 and ci % 2 == 0:
            continue
        f = arp[(s * 3 + ci) % 4] * (2 if s % 16 == 10 else 1)
        add(ts, tone(f, 0.14, "soft", attack=0.003, decay=0.045), 0.05 if s % 2 else 0.075, -0.45 if s % 2 else 0.45)
        if s % 4 == 2:
            add(ts, noise(0.03, lo=0.7, hi=0.9, decay=0.006), 0.07, 0.3)                            # hat

if timing and args.cues:
    raw = open(args.cues).read()
    start = raw.index("[", raw.index("window.CUES")) if "window.CUES" in raw else raw.index("[")
    cues = json.loads(raw[start: raw.rindex("]") + 1])
    for c in cues:
        fn = SFX.get(c.get("sfx"))
        if fn:
            fn(max(0.0, moment(c)), c)

# ---- write, with a gentle limiter and short fades
peak = max(max(abs(v) for v in Lb), max(abs(v) for v in Rb), 1e-9)
g = 0.89 / peak
fade = int(0.4 * SR)
with wave.open(args.out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for i in range(N):
        f = min(1.0, i / 2000.0, (N - i) / fade)
        frames += struct.pack("<hh", int(max(-1, min(1, Lb[i] * g * f)) * 32767), int(max(-1, min(1, Rb[i] * g * f)) * 32767))
    w.writeframes(bytes(frames))
print("wrote %s  %.1f s  peak gain %.2f" % (args.out, dur, g))
