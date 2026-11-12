#!/usr/bin/env python3
"""Music bed and sound accents for the Data story style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV: a calm 96 bpm bed (sub pad, plucked eighth-note arpeggio, quiet ticks on the beat)
with short accents mixed in at the times you ask for. The same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film, with accents. Without --cues: a whoosh into every script line after the first
      and a blip on the last.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "whoosh",      "line": 2, "offset": -0.25}   the start of script line 2 (lines count from 0)
  {"sfx": "count",       "word": "billion", "offset": -0.05, "dur": 1.2}   the first time that word is spoken ("nth": 1 for the second)
  {"sfx": "blip",        "at": 3.2}                    a time in seconds
Optional: "gain" (1 is the default level). Sounds: whoosh (camera move or morph, rises), whoosh-down (a move that
settles or pulls away), blip (a shape completes, a number lands; "f" is the pitch in Hz), count (a run of rising
blips under dots pouring in or a bar filling; "dur", "n"), ticks (a burst of clicks under a counting number; "dur", "n").

Takes a few seconds. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey Data story style)", "volume": -14, "duck": true}
"""
import argparse
import json
import math
import random
import struct
import sys
import wave

SR = 44100
BPM = 96
# Am, F, C, G as MIDI notes: a bass root and three arpeggio notes per bar.
CHORDS = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]


def norm(text):
    return "".join(c for c in text.lower() if c.isalnum() or c == "-")


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
    cues = [{"sfx": "whoosh", "line": i, "offset": -0.25} for i in range(1, len(lines))]
    if lines:
        cues.append({"sfx": "blip", "line": len(lines) - 1, "offset": 0.3})
    return cues


def main():
    ap = argparse.ArgumentParser(description="Music bed and accents for the vfrey Data story style (standard library only).")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing file")
    ap.add_argument("--cues", help="a JSON list of accents; see the top of this file")
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

    n_total = int((dur + 0.5) * SR)
    buf = [0.0] * n_total
    rnd = random.Random(3)

    def add(t0, samples, gain=1.0):
        i0 = int(t0 * SR)
        for i, v in enumerate(samples):
            j = i0 + i
            if 0 <= j < n_total:
                buf[j] += v * gain

    midi = lambda m: 440 * 2 ** ((m - 69) / 12)

    def pluck(f, length=0.45):
        return [math.sin(2 * math.pi * f * k / SR) * math.exp(-k / SR * 7) + 0.3 * math.sin(4 * math.pi * f * k / SR) * math.exp(-k / SR * 12) for k in range(int(length * SR))]

    def pad(f, length):
        n = int(length * SR)
        return [(math.sin(2 * math.pi * f * k / SR) + 0.5 * math.sin(2 * math.pi * f * 1.005 * k / SR)) * min(1, k / SR / 0.8) * min(1, (n - k) / SR / 0.8) for k in range(n)]

    def blip_wave(f, length=0.09):
        return [math.sin(2 * math.pi * f * k / SR) * math.exp(-k / SR * 40) for k in range(int(length * SR))]

    def tick_wave():
        return [rnd.uniform(-1, 1) * math.exp(-k / SR * 300) for k in range(int(0.02 * SR))]

    def whoosh_wave(length, up):
        n = int(length * SR)
        out, lp = [], 0.0
        for k in range(n):
            x = k / n
            a = math.sin(math.pi * x) ** 2
            c = 0.02 + 0.25 * (x if up else 1 - x)
            lp += c * (rnd.uniform(-1, 1) - lp)
            out.append(lp * a * 3)
        return out

    def whoosh(t0, g=1.0, dur=1.0, **_):
        add(t0, whoosh_wave(dur, True), 0.22 * g)

    def whoosh_down(t0, g=1.0, dur=1.0, **_):
        add(t0, whoosh_wave(dur, False), 0.22 * g)

    def blip(t0, g=1.0, f=440, **_):
        add(t0, blip_wave(f / 2, 0.4), 0.3 * g)
        add(t0, blip_wave(f, 0.3), 0.2 * g)

    def count(t0, g=1.0, dur=1.6, n=8, f=600, **_):
        step = dur / max(1, int(n))
        for k in range(int(n)):
            add(t0 + k * step, blip_wave(f + k * 40), 0.1 * g)

    def ticks(t0, g=1.0, dur=1.4, n=14, **_):
        step = dur / max(1, int(n))
        for k in range(int(n)):
            add(t0 + k * step, tick_wave(), 0.15 * g)

    # The bed: one chord per bar.
    beat = 60 / BPM
    t = 0.0
    bar = 0
    while t < dur + 0.5:
        root, arp = CHORDS[bar % 4]
        add(t, pad(midi(root), beat * 4 + 0.4), 0.10)
        for j in range(8):
            m = arp[[0, 1, 2, 1, 2, 1, 0, 1][j]] + 12
            add(t + j * beat / 2, pluck(midi(m)), 0.11 if j % 2 == 0 else 0.07)
        for j in range(4):
            add(t + j * beat, tick_wave(), 0.05)
        t += beat * 4
        bar += 1

    sounds = {"whoosh": whoosh, "whoosh-down": whoosh_down, "blip": blip, "count": count, "ticks": ticks}
    placed, skipped = 0, []
    for cue in sorted(cues, key=lambda c: (cue_time(c, timing) is None, cue_time(c, timing) or 0)):
        tt = cue_time(cue, timing)
        fn = sounds.get(cue.get("sfx"))
        if tt is None or fn is None:
            skipped.append(cue)
            continue
        extra = {k: float(cue[k]) for k in ("dur", "f", "n") if k in cue}
        fn(max(0.0, tt), float(cue.get("gain", 1.0)), **extra)
        placed += 1

    fade_out = min(2.0, dur / 3)
    peak = max(abs(v) for v in buf) or 1.0
    frames = bytearray()
    for i, v in enumerate(buf):  # peak-normalise to 0.9, fade in 0.4 s and out
        s = i / SR
        fade = min(1, s / 0.4) * min(1, max(0.0, (n_total / SR - s) / fade_out))
        frames += struct.pack("<h", int(max(-1, min(1, v / peak * 0.9)) * fade * 32767))
    with wave.open(args.out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"make-bed: wrote {args.out} ({n_total / SR:.1f} s, {placed} accents)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
