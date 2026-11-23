#!/usr/bin/env python3
"""Music bed and sound accents for the 2.5D pixel diorama style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV: a gentle little-town theme, the kind a role-playing game plays in a village (a plucked lute arpeggio
over a soft pad and a low drone, chords D, G, A, D and Bm, G, A, D at 92 bpm, and a simple recorder-like tune every other phrase)
with accents mixed in at the times you ask for. The same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film, with accents. Without --cues: a whoosh into every script line after the first.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "whoosh", "line": 1, "offset": -0.7}        the start of script line 1 (lines count from 0), a little early
  {"sfx": "rumble", "word": "^magma", "line": 2}      the first word on line 2 that matches (a regular expression, case ignored)
  {"sfx": "thud",   "at": 12.4}                       a time in seconds
Optional: "gain" (1 is the default level), "nth" (1 for the second match), "dur" (seconds, for whoosh and rumble). Sounds: whoosh (a
camera move or a fly-through transition), rumble (a low tremor under a tense beat), thud (something lands or gives way), chime (a
reveal, a payoff), bell (a church bell, for a tower or a call to work). Give each transition a whoosh at its start time; use rumble and thud sparingly.

Takes a few seconds. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey 2.5D pixel diorama style)", "volume": -17, "duck": true}
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
BPM = 92
NOTE = {"C": 261.63, "C#": 277.18, "D": 293.66, "E": 329.63, "F#": 369.99, "G": 392.0, "A": 440.0, "B": 493.88}
CHORDS = [("D", ["D", "F#", "A"]), ("G", ["G", "B", "D"]), ("A", ["A", "C#", "E"]), ("D", ["D", "F#", "A"]),
          ("B", ["B", "D", "F#"]), ("G", ["G", "B", "D"]), ("A", ["A", "C#", "E"]), ("D", ["D", "F#", "A"])]
# The tune: (note, octave, beats) per bar, played over bars 4 to 7 of every eight.
TUNE = [[("F#", 5, 1.5), ("E", 5, 0.5), ("D", 5, 1), ("A", 4, 1)], [("B", 4, 1), ("D", 5, 1), ("G", 5, 2)],
        [("E", 5, 1.5), ("F#", 5, 0.5), ("E", 5, 1), ("C#", 5, 1)], [("D", 5, 3), ("A", 4, 1)]]


def moment(cue, timing):
    """Seconds for one cue, or None when its word or line is not in the timing."""
    offset = float(cue.get("offset", 0))
    if "at" in cue:
        return float(cue["at"]) + offset
    if timing is None:
        return None
    if "word" in cue:
        rx = re.compile(str(cue["word"]), re.I)
        hits = [w for w in timing["words"] if rx.search(w["text"]) and ("line" not in cue or w.get("line") == cue["line"])]
        nth = int(cue.get("nth", 0))
        return hits[nth]["start"] + offset if nth < len(hits) else None
    if "line" in cue:
        lines = timing.get("lines", [])
        i = int(cue["line"])
        return lines[i]["start"] + offset if 0 <= i < len(lines) else None
    return None


def main():
    ap = argparse.ArgumentParser(description="Music bed and accents for the vfrey 2.5D pixel diorama style (standard library only).")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing file")
    ap.add_argument("--cues", help="a JSON list of sounds; see the top of this file")
    ap.add_argument("--out", required=True, help="the WAV file to write")
    args = ap.parse_args()

    def _plain_error(kind, err, tb):
        print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues files exist, then run the same command again.", file=sys.stderr)
        raise SystemExit(1)

    sys.excepthook = _plain_error
    import os
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    timing = json.load(open(args.timing)) if args.timing else None
    if timing is None and not args.duration:
        sys.exit("make-bed: pass --timing FILE or --duration SECONDS")
    dur = (float(timing["durationSec"]) if timing else float(args.duration)) + 1.0
    if args.cues:
        cues = json.load(open(args.cues))
    elif timing:
        cues = [{"sfx": "whoosh", "line": i, "offset": -0.7} for i in range(1, len(timing.get("lines", [])))]
    else:
        cues = []

    n_total = int(dur * SR)
    buf = [0.0] * n_total
    rnd = random.Random(11)
    fr = lambda name, octave: NOTE[name] * (2 ** (octave - 4))

    def pad(t, freq, length, amp):
        """A soft pad voice: three detuned sines with a slow attack and release."""
        s0, total = int(t * SR), int(length * SR)
        for k in range(total):
            j = s0 + k
            if j >= n_total:
                break
            if j < 0:
                continue
            p = k / total
            env = min(1.0, k / (SR * 0.9)) * (1 - p) ** 1.4
            x = k / SR
            buf[j] += amp * env * (math.sin(2 * math.pi * freq * x) + 0.5 * math.sin(2 * math.pi * freq * 1.003 * x) + 0.5 * math.sin(2 * math.pi * freq * 0.997 * x)) / 2

    def pluck(t, freq, length, amp, bright=0.4):
        """A Karplus-Strong plucked string."""
        n = int(SR / freq)
        loop = [rnd.uniform(-1, 1) * (1 - bright) + rnd.uniform(-1, 1) * bright for _ in range(n)]
        s0, total, i = int(t * SR), int(length * SR), 0
        for k in range(total):
            j = s0 + k
            if j >= n_total:
                break
            y = 0.5 * (loop[i] + loop[(i + 1) % n]) * 0.996
            loop[i] = y
            i = (i + 1) % n
            if j >= 0:
                buf[j] += y * amp * min(1.0, k / 80) * (1 - k / total) ** 1.3

    def noise(t, length, amp, lowpass, shape, seed):
        """Filtered noise under an envelope: whoosh and rumble are this."""
        r = random.Random(seed)
        s0, total, y = int(t * SR), int(length * SR), 0.0
        for k in range(total):
            if s0 + k >= n_total:
                break
            y += (r.uniform(-1, 1) - y) * lowpass
            if s0 + k >= 0:
                buf[s0 + k] += y * amp * shape(k / total)

    def flute(t, freq, length, amp):
        """A soft recorder-like voice: a sine with a breathy attack and a slow vibrato."""
        s0, total = int(t * SR), int(length * SR)
        for k in range(total):
            j = s0 + k
            if not 0 <= j < n_total:
                continue
            x = k / SR
            env = min(1.0, k / (SR * 0.06)) * min(1.0, (total - k) / (SR * 0.12))
            vib = 1 + 0.004 * math.sin(2 * math.pi * 5.2 * x) * min(1.0, x / 0.3)
            buf[j] += amp * env * (math.sin(2 * math.pi * freq * vib * x) + 0.18 * math.sin(4 * math.pi * freq * vib * x))

    def bell(t, freq, amp):
        """A church bell: inharmonic partials that ring and fade."""
        for ratio, a, dec in ((0.5, 0.5, 3.0), (1.0, 1.0, 2.2), (1.19, 0.5, 1.6), (1.5, 0.35, 1.2), (2.0, 0.35, 1.0), (2.74, 0.2, 0.6)):
            sine(t, freq * ratio, 3.5, amp * a, dec)

    def sine(t, freq, length, amp, decay):
        s0 = int(t * SR)
        for k in range(int(length * SR)):
            if 0 <= s0 + k < n_total:
                buf[s0 + k] += math.sin(2 * math.pi * freq * k / SR) * math.exp(-k / (SR * decay)) * amp

    # The bed, one bar at a time: a drone under the root, a pad chord, a lute arpeggio, and the tune in the second half of each phrase.
    beat = 60 / BPM
    bar_len = 4 * beat
    for bar in range(int(dur / bar_len) + 1):
        root, tones = CHORDS[bar % 8]
        t0 = bar * bar_len
        pad(t0, fr(root, 2), bar_len * 1.1, 0.14)
        for tone in tones:
            pad(t0, fr(tone, 3), bar_len * 1.1, 0.05)
        steps = [0, 1, 2, 1, 0, 2, 1, 2]
        for e, step in enumerate(steps):
            pluck(t0 + e * beat / 2, fr(tones[step], 4 if step < 2 else 4), 0.8, 0.12 if e % 2 else 0.15, 0.55)
        pluck(t0, fr(root, 3), 1.6, 0.16, 0.3)
        if bar % 8 >= 4 and bar >= 4:
            at = t0
            for name, octave, beats in TUNE[bar % 4]:
                flute(at, fr(name, octave), beats * beat * 0.95, 0.07)
                at += beats * beat

    placed, skipped = 0, []
    for k, cue in enumerate(cues):
        t = moment(cue, timing)
        kind = cue.get("sfx")
        g = float(cue.get("gain", 1.0))
        if t is None or kind not in ("whoosh", "rumble", "thud", "chime", "bell"):
            skipped.append(cue)
            continue
        if kind == "whoosh":
            d = float(cue.get("dur", 1.2))
            noise(t, d, 0.5 * g, 0.16, lambda p: math.sin(math.pi * p) ** 1.6, 100 + k)
        elif kind == "rumble":
            d = float(cue.get("dur", 2.0))
            noise(t, d, 0.55 * g, 0.02, lambda p: math.sin(math.pi * p) ** 0.8, 200 + k)
        elif kind == "thud":
            sine(max(0.0, t), 55, 0.6, 0.6 * g, 0.12)
            noise(t, 0.18, 0.4 * g, 0.05, lambda p: (1 - p) ** 2, 300 + k)
        elif kind == "bell":
            bell(max(0.0, t), fr("D", 4), 0.32 * g)
        else:
            for m, f in enumerate([fr("D", 5), fr("A", 5), fr("D", 6)]):
                sine(max(0.0, t) + m * 0.09, f, 1.6, 0.16 * g, 0.5)
        placed += 1

    peak = max(abs(x) for x in buf) or 1.0
    fade = int(1.5 * SR)
    frames = bytearray()
    for i, x in enumerate(buf):
        f = min(1.0, (n_total - i) / fade)
        frames += struct.pack("<h", int(max(-1.0, min(1.0, x / peak * 0.9 * f)) * 32767))
    with wave.open(args.out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"make-bed: wrote {args.out} ({dur:.1f} s, {placed} sounds)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
