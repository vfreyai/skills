#!/usr/bin/env python3
"""Synthwave bed and cue sounds for the neon synthwave style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV: 100 bpm, Am - F - C - G, a plucked saw arpeggio in sixteenths, sub bass on eighths,
a soft pad, kick on every beat, light snare and hat, with cue sounds mixed in at the times you ask for. The same
arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film, with cues. Without --cues: a glitch into every script line after the first
      (0.36 s early, where the scene's glitch cut starts) and a rising sweep on the last line.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "glitch", "line": 2, "offset": -0.36}   the start of script line 2 (lines count from 0), 0.36 s early
  {"sfx": "zap",    "word": "moth"}               the first time that word is spoken ("nth": 1 for the second time)
  {"sfx": "ping",   "at": 12.4}                   a time in seconds
Optional: "gain" (1 is the default level). Sounds: glitch (a VHS cut: noise burst, random plucks, low thump),
zap (a downward sweep on a reveal), ping (a pair of high pings: a label or tape lands), rise (a rising sweep for
the finale or a build), thump (a low hit for a heavy landing).

Takes up to a minute for a long film. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey neon synthwave style)", "volume": -14, "duck": true}
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
BPM = 100
# Am, F, C, G: root (MIDI) and the four notes of the chord.
PROG = [(57, [57, 60, 64, 67]), (53, [53, 57, 60, 65]), (48, [48, 52, 55, 60]), (55, [55, 59, 62, 67])]
ARP = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 1, 3, 2]


def norm(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def cue_time(cue, timing):
    """Seconds for one cue, or None when its word or line is not in the timing."""
    offset = float(cue.get("offset", 0))
    if "at" in cue:
        return float(cue["at"]) + offset
    if timing is None:
        return None
    if "word" in cue:
        want = norm(str(cue["word"]))
        hits = [w for w in timing["words"] if norm(w["text"]) == want and ("line" not in cue or w.get("line") == cue["line"])]
        nth = int(cue.get("nth", 0))
        return hits[nth]["start"] + offset if nth < len(hits) else None
    if "line" in cue:
        lines = timing.get("lines", [])
        i = int(cue["line"])
        return lines[i]["start"] + offset if 0 <= i < len(lines) else None
    return None


def default_cues(timing):
    lines = timing.get("lines", []) if timing else []
    cues = [{"sfx": "glitch", "line": i, "offset": -0.36} for i in range(1, len(lines))]
    if lines:
        cues.append({"sfx": "rise", "line": len(lines) - 1, "offset": 0.3})
    return cues


def main():
    ap = argparse.ArgumentParser(description="Synthwave bed and cue sounds for the vfrey neon synthwave style (standard library only).")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing file")
    ap.add_argument("--cues", help="a JSON list of cue sounds; see the top of this file")
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
    dur = float(timing["durationSec"]) if timing else float(args.duration)
    cues = json.load(open(args.cues)) if args.cues else (default_cues(timing) if timing else [])

    n_total = int((dur + 1.0) * SR)
    buf = [0.0] * n_total
    rnd = random.Random(11)

    def saw(ph):
        return 2.0 * (ph - math.floor(ph + .5))

    def hz(m):
        return 440.0 * 2 ** ((m - 69) / 12)

    def note(t0, f, d, amp, kind="saw", lp=0.18):
        s0 = int(t0 * SR)
        n = int(d * SR)
        y = 0.0
        for k in range(n):
            j = s0 + k
            if j >= n_total:
                break
            t = k / SR
            if kind == "pad":
                env = min(1.0, t / .6) * (min(1.0, (d - t) / .6) if d - t < .6 else 1.0)
                x = saw(f * t) * .5 + saw(f * 1.006 * t) * .5
            else:
                env = min(1.0, k / 120) * math.exp(-t * (6.0 if kind == "pluck" else 1.2))
                x = math.sin(2 * math.pi * f * t) + .3 * saw(f * t) if kind == "sub" else saw(f * t) + saw(f * 1.004 * t)
            y += (x - y) * lp
            buf[j] += y * amp * env

    def kick(t0):
        s0 = int(t0 * SR)
        for k in range(int(.28 * SR)):
            if s0 + k >= n_total:
                break
            t = k / SR
            buf[s0 + k] += math.sin(2 * math.pi * (45 + 120 * math.exp(-t * 28)) * t) * math.exp(-t * 9) * .55

    def noise(t0, d, amp, lp, shape, seed):
        r = random.Random(seed)
        s0 = int(t0 * SR)
        y = 0.0
        n = int(d * SR)
        for k in range(n):
            if s0 + k >= n_total:
                break
            y += (r.uniform(-1, 1) - y) * lp
            buf[s0 + k] += y * amp * shape(k / n)

    def sweep(t0, f0, f1, d, amp):
        s0 = int(t0 * SR)
        ph = 0.0
        for k in range(int(d * SR)):
            if s0 + k >= n_total:
                break
            p = k / (d * SR)
            ph += f0 * (f1 / f0) ** p / SR
            buf[s0 + k] += saw(ph) * amp * (1 - p) ** 1.5

    # Cue sounds. Each takes the time, a gain and ignores extras.
    def glitch(t, g=1.0):
        noise(t, .34, .32 * g, .5, lambda p: math.sin(math.pi * p) ** .7, 900 + int(t * 100) % 97)
        for q in range(5):
            note(t + q * .045, 220 * (1 + rnd.random() * 5), .05, .12 * g, "pluck", lp=.6)
        note(t + .2, hz(33), .5, .4 * g, "sub", lp=.1)

    def zap(t, g=1.0):
        sweep(t, 1800, 220, .5, .28 * g)

    def ping(t, g=1.0):
        sweep(t, 900, 1400, .12, .2 * g)
        sweep(t + .22, 900, 1400, .12, .2 * g)

    def rise(t, g=1.0):
        sweep(t, 300, 1500, .9, .18 * g)

    def thump(t, g=1.0):
        sweep(t, 140, 600, .3, .3 * g)
        note(t, hz(33), .5, .35 * g, "sub", lp=.1)

    sounds = {"glitch": glitch, "zap": zap, "ping": ping, "rise": rise, "thump": thump}

    # The bed: one chord per bar.
    beat = 60 / BPM
    step = beat / 4
    for b in range(int((dur + 1.0) / (beat * 4)) + 1):
        root, chord = PROG[b % 4]
        t = b * beat * 4
        for q in range(4):
            kick(t + q * beat)
        for q in (1, 3):
            noise(t + q * beat, .16, .16, .35, lambda p: (1 - p) ** 2, 100 + b * 7 + q)
        for e in range(8):
            noise(t + e * beat / 2 + beat / 4, .04, .05, .8, lambda p: (1 - p), 300 + e + b * 11)
            note(t + e * beat / 2, hz(root - 12), beat / 2 * .9, .30, "sub", lp=.12)
        for c in chord[:3]:
            note(t, hz(c), beat * 4, .035, "pad", lp=.06)
        for s in range(16):
            m = chord[ARP[s] % 4] + 12 + (12 if s % 8 >= 4 else 0)
            note(t + s * step, hz(m), step * 1.8, .09, "pluck", lp=.22)

    placed, skipped = 0, []
    timed = [(cue_time(c, timing), c) for c in cues]
    for t, cue in sorted(timed, key=lambda p: (p[0] is None, p[0] or 0)):
        fn = sounds.get(cue.get("sfx"))
        if t is None or fn is None or t >= dur + 1.0:
            skipped.append(cue)
            continue
        fn(max(0.0, t), float(cue.get("gain", 1.0)))
        placed += 1

    pk = max(abs(x) for x in buf) or 1.0
    frames = bytearray()
    for i, v in enumerate(buf):  # normalise, then fade in and out
        fade = min(1, i / SR / 0.4) * min(1, (n_total - i) / SR / 1.2)
        frames += struct.pack("<h", int(max(-1, min(1, v / pk * .7)) * fade * 32767))
    with wave.open(args.out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"make-bed: wrote {args.out} ({n_total / SR:.1f} s, {placed} cues)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
