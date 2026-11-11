#!/usr/bin/env python3
"""Music bed and sound accents for the Vintage newspaper style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV: a slow A-minor waltz (84 bpm; plucked bass, plucked chords on beats 2 and 3, a
music-box melody from the third bar) with short letterpress accents mixed in at the times you ask for. The same
arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film, with accents. Without --cues: a thump on the masthead, a page-turn whoosh and
      thump into every script line, a few press ticks at each line start, a stamp on the last line.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "whoosh", "line": 2, "offset": -0.8}      the start of script line 2 (lines count from 0)
  {"sfx": "stamp",  "word": "seven", "offset": 0.1} the first time that word is spoken ("nth": 1 for the second time)
  {"sfx": "thump",  "at": 3.2}                      a time in seconds
Optional: "gain" (1 is the default level), "dur" (seconds, for the long sounds). Sounds:
  press    a headline word landing: a soft noise tick, then a low thump ("words": 3 gives that many, 0.22 s apart)
  thump    a press impact or heavy drop ("f": pitch in Hz, default 62)
  stamp    a rubber stamp or ink stamp: a deep thump with a noise slap
  whoosh   a page turn or a sheet sliding in (dur about 0.85)
  flood    a low rumble that swells and falls, for a wipe of ink (dur about 1.1)
  clicks   telegraph or typewriter taps in short bursts for "dur" seconds
  crackle  a burst of random sparks for "dur" seconds
  zap      a falling-pitch spark with a deep boom (a flash)
  shimmer  three soft rising tones for a glow or an aurora (dur about 2.6)

Takes a few seconds. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey vintage newspaper style)", "volume": -12, "duck": true}
"""
import argparse
import json
import math
import random
import struct
import sys
import wave

SR = 44100
BEAT = 60 / 84
BAR = BEAT * 3
# Am, F, Dm, E: bass note, then three chord notes (Hz).
CHORDS = [(110.0, [220.0, 261.63, 329.63]), (87.31, [174.61, 261.63, 349.23]), (73.42, [146.83, 220.0, 293.66]), (82.41, [164.81, 246.94, 329.63])]
MELODY = [659.26, 523.25, 587.33, 659.26, 783.99, 659.26, 587.33, 523.25]


def norm(text):
    return "".join(c for c in text.lower() if c.isalnum())


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
    cues = [{"sfx": "thump", "at": 0.25, "f": 55, "gain": 1.2}, {"sfx": "press", "at": 0.5, "words": 3}]
    for i in range(1, len(lines)):
        cues.append({"sfx": "whoosh", "line": i, "offset": -0.8})
        cues.append({"sfx": "thump", "line": i, "offset": 0.0, "gain": 0.8})
        cues.append({"sfx": "press", "line": i, "offset": -0.4, "words": 3})
    if lines:
        cues.append({"sfx": "stamp", "line": len(lines) - 1, "offset": 0.2})
    return cues


def main():
    ap = argparse.ArgumentParser(description="Music bed and accents for the vfrey Vintage newspaper style (standard library only).")
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
    rnd = random.Random(7)
    tau = 2 * math.pi

    def add(t0, samples, gain=1.0):
        i0 = int(t0 * SR)
        for i, v in enumerate(samples):
            j = i0 + i
            if 0 <= j < n_total:
                buf[j] += v * gain

    def pluck(freq, length, bright):
        n = int(length * SR)
        out = []
        for k in range(n):
            t = k / SR
            v = sum(a * math.sin(tau * freq * h * t) * math.exp(-t * (1.5 + h * 1.6)) for h, a in ((1, 1.0), (2, 0.5 * bright), (3, 0.25 * bright), (4, 0.12 * bright), (5, 0.06 * bright)))
            out.append(v * math.exp(-t / 0.42) * min(1, k / 80))
        return out

    def bell(freq):
        n = int(1.4 * SR)
        out = []
        for k in range(n):
            t = k / SR
            v = math.sin(tau * freq * t) * math.exp(-t * 3.2) + 0.35 * math.sin(tau * freq * 2.76 * t) * math.exp(-t * 7) + 0.15 * math.sin(tau * freq * 5.4 * t) * math.exp(-t * 12)
            out.append(v * min(1, k / 40))
        return out

    def thump_wave(freq=62.0, length=0.28):
        return [math.sin(tau * (freq + 90 * math.exp(-k / (0.02 * SR))) * k / SR) * math.exp(-k / (0.07 * SR)) for k in range(int(length * SR))]

    def noise(length, lp=0.2, hp=0.0):
        y = z = 0.0
        out = []
        for _ in range(int(length * SR)):
            y += lp * (rnd.uniform(-1, 1) - y)
            if hp:
                z += hp * (y - z)
                out.append(y - z)
            else:
                out.append(y)
        return out

    def shaped(sig, fn):
        n = len(sig)
        return [v * fn(k / n) for k, v in enumerate(sig)]

    # sounds: fn(t0, gain, **extras)
    def thump(t0, g=1.0, f=62.0, **_):
        add(t0, thump_wave(f, 0.28), 0.55 * g)

    def press(t0, g=1.0, words=1, **_):
        for k in range(max(1, int(words))):
            t = t0 + k * 0.22
            add(t - 0.03, noise(0.05, 0.5), 0.22 * g)
            if k % 2 == 0:
                add(t, thump_wave(70, 0.22), 0.5 * g)

    def stamp(t0, g=1.0, **_):
        add(t0, thump_wave(40, 0.9), 1.0 * g)
        add(t0, noise(0.18, 0.3), 0.45 * g)

    def whoosh(t0, g=1.0, dur=0.85, **_):
        add(t0, shaped(noise(dur, 0.12, 0.02), lambda p: math.sin(math.pi * p) ** 1.5), 0.5 * g)

    def flood(t0, g=1.0, dur=1.1, **_):
        add(t0, shaped(noise(dur, 0.03), lambda p: math.sin(math.pi * p)), 1.4 * g)
        add(t0, shaped(noise(dur, 0.3, 0.02), lambda p: math.sin(math.pi * p) ** 1.5), 0.5 * g)

    def clicks(t0, g=1.0, dur=3.0, **_):
        pattern = [0, 0.16, 0.32, 0.62, 0.78, 1.08, 1.24, 1.4]
        start = t0
        while start < t0 + dur:
            for o in pattern:
                if start + o < t0 + dur:
                    n = int(0.012 * SR)
                    add(start + o, [math.sin(tau * 2300 * k / SR) * math.exp(-k / (0.0025 * SR)) + 0.4 * rnd.uniform(-1, 1) * math.exp(-k / (0.002 * SR)) for k in range(n)], 0.26 * g)
            start += 1.8

    def crackle(t0, g=1.0, dur=1.0, **_):
        for _i in range(int(dur * 40)):
            add(t0 + rnd.uniform(0, dur), [rnd.uniform(-1, 1) * math.exp(-k / (0.0015 * SR)) for k in range(int(0.006 * SR))], 0.5 * g * rnd.uniform(0.3, 1))

    def zap(t0, g=1.0, **_):
        n = int(0.35 * SR)
        add(t0, [math.sin(tau * (1800 * math.exp(-k / (0.05 * SR)) + 200) * k / SR) * math.exp(-k / (0.1 * SR)) for k in range(n)], 0.3 * g)
        add(t0, thump_wave(48, 0.6), 0.8 * g)

    def shimmer(t0, g=1.0, dur=2.6, **_):
        n = int(dur * SR)
        for j, f in enumerate((880.0, 1318.5, 1760.0)):
            add(t0 + j * 0.3, [math.sin(tau * (f + 14 * math.sin(k / SR * 3)) * k / SR) * math.sin(math.pi * k / n) ** 2 * 0.05 for k in range(n)], g)

    # The bed: a plucked bass on beat 1, plucked chords on beats 2 and 3, a music box from the third bar.
    cache = {}

    def note(kind, f, *rest):
        key = (kind, round(f, 2)) + rest
        if key not in cache:
            cache[key] = pluck(f, *rest) if kind == "pluck" else bell(f)
        return cache[key]

    total = dur + 0.5
    b, t = 0, 0.0
    while t < total - 0.4:
        bass, chord = CHORDS[b % 4]
        fade = min(1, t / 2.0) * min(1, (total - t) / 2.5)
        add(t, note("pluck", bass, 2.2, 0.6), 0.34 * fade)
        for k in (1, 2):
            for f in chord:
                add(t + k * BEAT + rnd.uniform(0, 0.012), note("pluck", f, 1.2, 0.8), 0.09 * fade)
        if b >= 2:
            add(t + BEAT, note("bell", MELODY[(b * 2) % 8]), 0.12 * fade)
            add(t + 2 * BEAT, note("bell", MELODY[(b * 2 + 1) % 8]), 0.10 * fade)
        t += BAR
        b += 1

    sounds = {"press": press, "thump": thump, "stamp": stamp, "whoosh": whoosh, "flood": flood, "clicks": clicks, "crackle": crackle, "zap": zap, "shimmer": shimmer}
    placed, skipped = 0, []
    for cue in sorted(cues, key=lambda c: (cue_time(c, timing) is None, cue_time(c, timing) or 0)):
        ct = cue_time(cue, timing)
        fn = sounds.get(cue.get("sfx"))
        if ct is None or fn is None:
            skipped.append(cue)
            continue
        extra = {k: float(cue[k]) for k in ("dur", "f", "words") if k in cue}
        fn(max(0.0, ct), float(cue.get("gain", 1.0)), **extra)
        placed += 1

    peak = max((abs(v) for v in buf), default=1.0) or 1.0
    scale = 0.85 / peak if peak > 0.85 else 1.0
    fade_out = int(min(2.2, total / 2) * SR)
    frames = bytearray()
    for i, v in enumerate(buf):
        v = v * scale
        if n_total - i < fade_out:
            v *= (n_total - i) / fade_out
        frames += struct.pack("<h", int(max(-1.0, min(1.0, v)) * 32000))
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
