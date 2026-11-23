#!/usr/bin/env python3
"""Music bed and sound accents for the whiteboard sketch style. Python standard library only: no downloads, no ffmpeg.

It writes one stereo 16-bit WAV: a gentle 84 bpm loop (soft pad, marimba plucks on a pentatonic scale, a brushed shaker,
a low marimba root) with marker and paper sounds mixed in at the times you ask for. The same arguments always give the
same file. It takes several seconds (pure Python).

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film, with sounds. Without --cues: marker scribbling under every script line, a page flick or
      an eraser rub (alternating) into each line after the first, and a rising chime on the last line.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "scribble", "line": 2}                          marker scribbling for the whole of script line 2 (lines count from 0)
  {"sfx": "scribble", "at": 5.0, "dur": 3.2}              scribbling from 5.0 s for 3.2 s
  {"sfx": "flick",  "line": 3, "offset": -0.4}            the start of line 3, minus 0.4 s
  {"sfx": "rub",    "word": "memory", "offset": -0.42}    the first time that word is spoken ("nth": 1 for the second time)
  {"sfx": "chime",  "word": "review", "note": 79}         "note" is a MIDI number (default 79)
Optional on any cue: "gain" (1 is the default level), "edge": "end" (the end of the line or word instead of the start).
Sounds: scribble (marker on board, needs a duration: "dur", or a "line"), flick (a page leaves), rub (an eraser wipe, "dur"
0.6 to 0.8), chime (an idea lands), thunk (a soft low marimba note: something is gone or counted), finale (a rising
four-note chime for the last word).

Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey whiteboard sketch style)", "volume": -12, "duck": true}
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
BPM = 84
# Cmaj7, Am7, Fmaj7, G as MIDI notes: (pad chord, pentatonic notes for the plucks)
CHORDS = [([48, 52, 55, 59], [60, 64, 67, 71, 72]), ([45, 48, 52, 55], [57, 60, 64, 67, 69]),
          ([41, 45, 48, 52], [57, 60, 64, 65, 69]), ([43, 47, 50, 53], [59, 62, 64, 67, 71])]
TAU = 6.2832


def norm(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def cue_span(cue, timing):
    """(start, end) seconds for one cue, or None when its word or line is not in the timing."""
    offset = float(cue.get("offset", 0))
    if "at" in cue:
        t = float(cue["at"]) + offset
        return t, t + float(cue.get("dur", 0))
    if timing is None:
        return None
    if "word" in cue:
        want = norm(str(cue["word"]))
        hits = [w for w in timing["words"] if norm(w["text"]) == want and ("line" not in cue or w.get("line") == cue["line"])]
        nth = int(cue.get("nth", 0))
        if nth >= len(hits):
            return None
        w = hits[nth]
        s, e = w["start"] + offset, w["end"] + offset
    elif "line" in cue:
        lines = timing.get("lines", [])
        i = int(cue["line"])
        if not 0 <= i < len(lines):
            return None
        s, e = lines[i]["start"] + offset, lines[i]["end"] + offset
    else:
        return None
    if cue.get("edge") == "end":
        s = e
    if "dur" in cue:
        e = s + float(cue["dur"])
    return s, e


def default_cues(timing):
    lines = timing.get("lines", []) if timing else []
    cues = [{"sfx": "scribble", "line": i} for i in range(len(lines))]
    for i in range(1, len(lines)):
        cues.append({"sfx": "flick" if i % 2 else "rub", "line": i, "offset": -0.42, "dur": 0.7})
    if lines:
        cues.append({"sfx": "finale", "line": len(lines) - 1, "edge": "end", "offset": -0.7})
    return cues


def main():
    ap = argparse.ArgumentParser(description="Music bed and sounds for the vfrey whiteboard sketch style (standard library only).")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing file")
    ap.add_argument("--cues", help="a JSON list of sounds; see the top of this file")
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
    dur = (float(timing["durationSec"]) if timing else float(args.duration)) + 0.6
    cues = json.load(open(args.cues)) if args.cues else (default_cues(timing) if timing else [])

    n_total = int(dur * SR)
    buf = [0.0] * n_total
    rnd = random.Random(11)

    def add(i, v):
        if 0 <= i < n_total:
            buf[i] += v

    def tone(t, f, length, amp, kind="mar"):
        i0 = int(t * SR)
        for k in range(int(length * SR)):
            x = k / SR
            if kind == "mar":  # marimba: a sine with a fast-dying 3.9x partial
                env = math.exp(-x * 7.0) * min(1, x * 400)
                s = math.sin(TAU * f * x) + 0.35 * math.sin(TAU * f * 3.9 * x) * math.exp(-x * 14) + 0.12 * math.sin(TAU * f * 9.2 * x) * math.exp(-x * 30)
            elif kind == "pad":
                env = min(1, x / 0.9) * min(1, (length - x) / 1.1) if length > 2 else 1
                s = math.sin(TAU * f * x + 0.3 * math.sin(TAU * 0.25 * x)) + 0.5 * math.sin(TAU * f * 2.003 * x) + 0.25 * math.sin(TAU * f * 0.4995 * x)
            else:  # chime
                env = math.exp(-x * 3.2) * min(1, x * 300)
                s = math.sin(TAU * f * x) + 0.4 * math.sin(TAU * f * 2.76 * x) * math.exp(-x * 5)
            add(i0 + k, s * env * amp)

    def noise(t, length, amp, lp=0.3, hp=0.02, shape=lambda u: math.sin(math.pi * u), mod=None):
        n = int(length * SR)
        i0 = int(t * SR)
        a = b = 0.0
        for k in range(n):
            u = k / n
            w = rnd.uniform(-1, 1)
            a += (w - a) * lp
            b += (a - b) * hp
            add(i0 + k, (a - b) * amp * shape(u) * (mod(k / SR) if mod else 1))

    midi = lambda m: 440 * 2 ** ((m - 69) / 12)
    beat = 60 / BPM
    bar = beat * 4

    # The bed: one chord per bar.
    for b in range(int(dur / bar) + 1):
        t = b * bar
        pad, arp = CHORDS[b % 4]
        for m in pad[:3]:
            tone(t, midi(m), bar + 0.4, 0.045, "pad")
        for pos in [0, 0.5, 1.5, 2, 3, 3.5]:
            if rnd.random() < 0.8:
                tone(t + pos * beat, midi(rnd.choice(arp)), 1.1, 0.075)
        for pos in [0.5, 1.5, 2.5, 3.5]:
            noise(t + pos * beat, 0.06, 0.05, lp=0.5, hp=0.15)
        tone(t, midi(pad[0] - 12), beat * 1.6, 0.07, "mar")

    def scribble(t0, t1, g=1.0):
        t = t0
        while t < t1:
            d = rnd.uniform(0.07, 0.3)
            noise(t, min(d, max(0.03, t1 - t)), 0.05 * g, lp=rnd.uniform(0.25, 0.5), hp=0.08, mod=lambda x: 0.6 + 0.4 * math.sin(x * 90))
            t += d + rnd.uniform(0.02, 0.18)

    def flick(t0, g=1.0, length=0.55):
        noise(t0, length, 0.22 * g, lp=0.18, hp=0.01, shape=lambda u: math.sin(math.pi * u) ** 1.5)

    def rub(t0, g=1.0, length=0.78):
        noise(t0, length, 0.2 * g, lp=0.1, hp=0.004, mod=lambda x: 0.55 + 0.45 * abs(math.sin(x * 6 * math.pi / length)))

    sounds = ("scribble", "flick", "rub", "chime", "thunk", "finale")
    placed, skipped = 0, []
    spans = [(cue, cue_span(cue, timing)) for cue in cues]
    for cue, span in sorted(spans, key=lambda cs: (cs[1] is None, cs[1][0] if cs[1] else 0)):
        kind = cue.get("sfx")
        if span is None or kind not in sounds or span[0] >= dur or (kind == "scribble" and span[1] <= span[0]):
            skipped.append(cue)
            continue
        t0, t1 = max(0.0, span[0]), span[1]
        g = float(cue.get("gain", 1.0))
        if kind == "scribble":
            scribble(t0, min(t1, dur), g)
        elif kind == "flick":
            flick(t0, g, float(cue.get("dur", 0.55)))
        elif kind == "rub":
            rub(t0, g, float(cue.get("dur", 0.78)))
        elif kind == "chime":
            tone(t0, midi(int(cue.get("note", 79))), 1.4, 0.16 * g, "chime")
        elif kind == "thunk":
            tone(t0, midi(60), 1.0, 0.1 * g, "mar")
        else:
            for i, m in enumerate((72, 76, 79, 84)):
                tone(t0 + 0.05 + i * 0.12, midi(m), 1.8, 0.14 * g, "chime")
        placed += 1

    fi, fo = int(0.8 * SR), int(2.0 * SR)
    pk = max(abs(x) for x in buf) or 1
    sc = 0.8 / pk
    frames = bytearray()
    for i in range(n_total):
        v = int(max(-1, min(1, buf[i] * sc * min(1, i / fi, (n_total - i) / fo))) * 32767)
        frames += struct.pack("<hh", v, v)
    with wave.open(args.out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"make-bed: wrote {args.out} ({dur:.1f} s, {placed} sounds)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
