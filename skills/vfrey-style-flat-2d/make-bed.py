#!/usr/bin/env python3
"""Music bed and sound accents for the 2D flat style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV: a light 96 bpm bed (soft pad, bass, plucked arpeggio, offbeat ticks) with short
accents mixed in at the times you ask for. The same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film, with accents. Without --cues: a whoosh into every script line and a chime on the last.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "whoosh", "line": 2, "offset": -0.45}     the start of script line 2 (lines count from 0)
  {"sfx": "ting",   "word": "seven", "offset": 0.1} the first time that word is spoken ("nth": 1 for the second time)
  {"sfx": "pop",    "at": 3.2}                      a time in seconds
Optional: "gain" (1 is the default level). Sounds: whoosh (a wipe), pop (a badge or chip pops in), ting (a small
object lands), thud (a stamp or a heavy drop), glide (something grows: a bar, a meter; "dur" seconds), chime (payoff).

Takes a few seconds. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey 2D flat style)", "volume": -17, "duck": true}
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
# Am, F, C, G as MIDI notes: three pad notes and a bass note per bar.
CHORDS = [([57, 60, 64], 45), ([53, 57, 60], 41), ([48, 52, 55], 48), ([55, 59, 62], 43)]


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
    cues = [{"sfx": "pop", "at": 0.15}]
    cues += [{"sfx": "whoosh", "line": i, "offset": -0.5} for i in range(1, len(lines))]
    if lines:
        cues.append({"sfx": "chime", "line": len(lines) - 1, "offset": 0.4})
    return cues


def main():
    ap = argparse.ArgumentParser(description="Music bed and accents for the vfrey 2D flat style (standard library only).")
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
    rnd = random.Random(4)

    def add(t0, samples, gain=1.0):
        i0 = int(t0 * SR)
        for i, v in enumerate(samples):
            j = i0 + i
            if 0 <= j < n_total:
                buf[j] += v * gain

    def tone(freq, length, tau, harm=((1, 1.0), (2, 0.25), (3, 0.08)), attack=0.004):
        out = []
        for i in range(int(length * SR)):
            t = i / SR
            a = min(1, t / attack) * math.exp(-t / tau)
            out.append(a * sum(h * math.sin(2 * math.pi * freq * m * t) for m, h in harm))
        return out

    def ting(t0, g=1.0, f=1568, **_):
        add(t0, tone(f, 0.55, 0.12, ((1, 1), (2.76, 0.35), (5.4, 0.12))), 0.5 * g)
        add(t0 + 0.06, tone(f * 1.5, 0.5, 0.1, ((1, 0.6),)), 0.3 * g)

    def whoosh(t0, g=1.0, dur=0.6, **_):
        n = int(dur * SR)
        out, lp = [], 0.0
        for i in range(n):
            u = i / n
            lp += (0.02 + 0.45 * u * u) * (rnd.uniform(-1, 1) - lp)  # a low-pass that opens as it goes
            out.append(lp * math.sin(math.pi * u) ** 1.5 * 3.2)
        add(t0, out, 0.35 * g)

    def pop(t0, g=1.0, f0=330, f1=720, **_):
        n = int(0.22 * SR)
        out, ph = [], 0.0
        for i in range(n):
            u = i / n
            ph += 2 * math.pi * (f0 + (f1 - f0) * u) / SR
            out.append(math.sin(ph) * math.exp(-u * 6))
        add(t0, out, 0.4 * g)

    def thud(t0, g=1.0, **_):
        n = int(0.35 * SR)
        out, ph = [], 0.0
        for i in range(n):
            u = i / n
            ph += 2 * math.pi * (120 - 70 * u) / SR
            out.append(math.sin(ph) * math.exp(-u * 7) + 0.3 * rnd.uniform(-1, 1) * math.exp(-u * 30))
        add(t0, out, 0.55 * g)

    def glide(t0, g=1.0, dur=1.2, f0=280, f1=850, **_):
        n = int(dur * SR)
        out, ph = [], 0.0
        for i in range(n):
            u = i / n
            ph += 2 * math.pi * f0 * (f1 / f0) ** u / SR
            out.append(math.sin(ph) * math.sin(math.pi * u) ** 1.2)
        add(t0, out, 0.18 * g)

    def chime(t0, g=1.0, **_):
        for k, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
            add(t0 + k * 0.09, tone(f, 1.2, 0.35, ((1, 1), (2, 0.2))), 0.5 * g)

    # The bed: one chord per bar.
    beat = 60 / BPM
    midi = lambda m: 440 * 2 ** ((m - 69) / 12)
    for bar in range(int((dur + 0.5) / (4 * beat)) + 1):
        notes, bass = CHORDS[bar % 4]
        t0 = bar * 4 * beat
        for m in notes:  # pad: two slightly detuned sines, slow in and out
            out = []
            for i in range(int(4 * beat * SR)):
                t = i / SR
                a = min(1, t / 0.6) * min(1, (4 * beat - t) / 0.5)
                out.append(a * (math.sin(2 * math.pi * midi(m) * t) + 0.5 * math.sin(2 * math.pi * midi(m) * 1.005 * t)) * 0.05)
            add(t0, out)
        add(t0, tone(midi(bass), 4 * beat * 0.95, 1.4, ((1, 1), (2, 0.3))), 0.12)
        for e, step in enumerate([0, 1, 2, 1, 2, 1, 0, 1]):  # plucked eighth notes, an octave up
            add(t0 + e * beat / 2, tone(midi(notes[step] + 12), 0.5, 0.16, ((1, 1), (2, 0.2), (3, 0.06))), 0.09)
        for e in range(4):  # a soft tick on each offbeat
            add(t0 + e * beat + beat / 2, [rnd.uniform(-1, 1) * math.exp(-i / SR / 0.008) for i in range(int(0.04 * SR))], 0.02)

    sounds = {"whoosh": whoosh, "pop": pop, "ting": ting, "thud": thud, "glide": glide, "chime": chime}
    placed, skipped = 0, []
    for cue in sorted(cues, key=lambda c: (cue_time(c, timing) is None, cue_time(c, timing) or 0)):
        t = cue_time(cue, timing)
        fn = sounds.get(cue.get("sfx"))
        if t is None or fn is None:
            skipped.append(cue)
            continue
        extra = {k: float(cue[k]) for k in ("dur", "f", "f0", "f1") if k in cue}
        fn(max(0.0, t), float(cue.get("gain", 1.0)), **extra)
        placed += 1

    frames = bytearray()
    for i, v in enumerate(buf):  # soft limit, then fade in and out
        v = math.tanh(v * 1.6) * 0.7
        fade = min(1, i / SR / 0.5) * min(1, (n_total - i) / SR / 1.2)
        frames += struct.pack("<h", int(v * fade * 32000))
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
