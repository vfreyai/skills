#!/usr/bin/env python3
"""Chiptune bed and sound accents for the pixel art style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV in the sound of an 8-bit console: a pulse-wave lead playing a 4-bar melody, a stepped
triangle bass, and noise drums, with short game sounds mixed in at the times you ask for. The tempo can follow the
story (slow, speeding up, relaxing). The same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav [--bpm 120]
      Bed only, one tempo. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film. Without --cues: one tempo and a "coin" on the last sentence.

cues.json is a list. Each cue names a sound (or a tempo point) and one moment:
  {"sfx": "zap",   "word": "shoot"}                    the first time a word starting with that is spoken
  {"sfx": "boom",  "sentence": 3, "offset": 0.9}       the start of spoken sentence 3 (count from 0; a sentence ends at . ! ? ;)
  {"sfx": "coin",  "line": 2}   or   {"sfx": "blip", "at": 3.2}     a script line start, or a time in seconds
  {"sfx": "tempo", "sentence": 3, "bpm": 116}, {"sfx": "tempo", "sentence": 5, "bpm": 174}
      tempo points: the tempo moves in a straight line from one point to the next and holds after the last.
Optional: "gain" (1 is the default level). Sounds: blip (a cursor, a counter tick), zap (a shot), boom (a hit, an
explosion), coin (a pickup, a payoff), power (a rising power-up).

Takes a few seconds. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey pixel art style)", "volume": -20, "duck": true}
"""
import argparse
import json
import math
import random
import struct
import sys
import wave

SR = 22050  # a low rate is part of the sound
MELODY = [
    [69, 0, 72, 0, 76, 0, 72, 0, 69, 0, 72, 76, 81, 0, 76, 0],
    [65, 0, 69, 0, 72, 0, 69, 0, 65, 0, 69, 72, 77, 0, 72, 0],
    [67, 0, 72, 0, 76, 0, 72, 0, 67, 0, 72, 76, 79, 0, 76, 0],
    [67, 0, 71, 0, 74, 0, 71, 0, 67, 71, 74, 79, 78, 76, 74, 71],
]
BASS = [45, 41, 36, 43]
PAD = [72, 69, 72, 71]


def sentences(timing):
    out, cur = [], []
    for w in timing["words"]:
        cur.append(w)
        if w["text"][-1:] in ".!?;":
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


def moment(cue, timing):
    """Seconds for one cue, or None when its word, sentence or line is not in the timing."""
    offset = float(cue.get("offset", 0))
    if "at" in cue:
        return float(cue["at"]) + offset
    if timing is None:
        return None
    if "word" in cue:
        want = str(cue["word"]).lower()
        hits = [w for w in timing["words"] if w["text"].lower().startswith(want)]
        nth = int(cue.get("nth", 0))
        return hits[nth]["start"] + offset if nth < len(hits) else None
    if "sentence" in cue:
        s = sentences(timing)
        i = int(cue["sentence"])
        return s[i][0]["start"] + offset if 0 <= i < len(s) else None
    if "line" in cue:
        lines = timing.get("lines", [])
        i = int(cue["line"])
        return lines[i]["start"] + offset if 0 <= i < len(lines) else None
    return None


def main():
    ap = argparse.ArgumentParser(description="Chiptune bed and accents for the vfrey pixel art style (standard library only).")
    ap.add_argument("--timing", help="the scene's vfrey/timing.json (gives the length and the word times)")
    ap.add_argument("--duration", type=float, help="length in seconds when there is no timing file")
    ap.add_argument("--cues", help="a JSON list of accents and tempo points; see the top of this file")
    ap.add_argument("--bpm", type=float, default=120.0, help="tempo when the cues set none (default 120)")
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
    dur = (float(timing["durationSec"]) if timing else float(args.duration)) + 1.0
    if args.cues:
        cues = json.load(open(args.cues))
    elif timing:
        cues = [{"sfx": "coin", "sentence": len(sentences(timing)) - 1, "offset": 0.2}]
    else:
        cues = []

    n_total = int(SR * dur)
    buf = [0.0] * n_total
    rnd = random.Random(7)
    hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

    def add(t0, length, fn, vol):
        i0 = int(t0 * SR)
        for k in range(int(length * SR)):
            i = i0 + k
            if i >= n_total:
                break
            if i >= 0:
                buf[i] += fn(k / SR) * vol

    pulse = lambda f, duty: (lambda t: 1.0 if (t * f) % 1.0 < duty else -1.0)
    tri = lambda f: (lambda t: round((4 * abs((t * f) % 1.0 - 0.5) - 1) * 7) / 7.0)  # a 4-bit stepped triangle
    noise = lambda decay: (lambda t: (rnd.random() * 2 - 1) * max(0, 1 - t / decay))
    kick = lambda t: (1.0 if math.sin(2 * math.pi * (55 * t - 120 * t * t)) > 0 else -1.0) * max(0, 1 - t / 0.11)

    def env(fn, attack, decay, sustain, length):
        def shaped(t):
            e = min(1.0, t / attack) if attack > 0 else 1.0
            if t > attack:
                e = max(sustain, 1.0 - (t - attack) / decay * (1.0 - sustain))
            if t > length - 0.015:
                e *= max(0.0, (length - t) / 0.015)
            return fn(t) * e
        return shaped

    def sweep(f0, f1, length, duty=0.5):
        state = {"ph": 0.0, "last": 0.0}
        def fn(t):
            f = f0 * (f1 / f0) ** (t / length)
            state["ph"] += f * (t - state["last"])
            state["last"] = t
            return (1.0 if state["ph"] % 1.0 < duty else -1.0) * max(0.0, 1 - t / length)
        return fn

    # Tempo: straight lines between the tempo points, flat outside them.
    points, sounds_at, skipped = [], [], []
    for cue in cues:
        t = moment(cue, timing)
        if t is None:
            skipped.append(cue)
        elif cue.get("sfx") == "tempo" and "bpm" in cue:
            points.append((t, float(cue["bpm"])))
        else:
            sounds_at.append((t, cue))
    points.sort()

    def bpm(t):
        if not points:
            return args.bpm
        if t <= points[0][0]:
            return points[0][1]
        for (ta, ba), (tb, bb) in zip(points, points[1:]):
            if t < tb:
                return ba + (bb - ba) * (t - ta) / max(1e-6, tb - ta)
        return points[-1][1]

    # The bed, one sixteenth note at a time.
    t, s = 0.0, 0
    while t < dur:
        bar, sub = s // 16, s % 16
        b4 = bar % 4
        step = 60.0 / bpm(t) / 4
        if sub % 2 == 0:  # bass: root, with the octave on the last eighth of each half bar
            add(t, step * 1.9, env(tri(hz(BASS[b4] + (12 if sub % 8 == 6 else 0))), 0.002, 0.1, 0.7, step * 1.9), 0.36)
        if bar >= 1 and MELODY[b4][sub]:  # lead: a 25% pulse
            add(t, step * 0.95, env(pulse(hz(MELODY[b4][sub]), 0.25), 0.001, 0.1, 0.4, step * 0.95), 0.11)
        if bar >= 4 and sub in (0, 8):  # a thin held note from the second pass
            add(t, step * 7.5, env(pulse(hz(PAD[b4] - 12), 0.125), 0.01, 0.4, 0.5, step * 7.5), 0.05)
        if sub % 4 == 0 and (bar >= 1 or sub == 0):
            add(t, 0.11, kick, 0.24)
        if bar >= 1 and sub in (4, 12):
            add(t, 0.09, noise(0.09), 0.15)
        if sub % 2 == 1 or (bpm(t) > 150 and bar >= 1):
            add(t, 0.03, noise(0.03), 0.06)
        t += step
        s += 1

    def play(kind, t0, g):
        if kind == "blip":
            add(t0, 0.06, env(pulse(1320, 0.5), 0.001, 0.05, 0.2, 0.06), 0.16 * g)
        elif kind == "zap":
            add(t0, 0.16, sweep(1800, 300, 0.16, 0.25), 0.18 * g)
        elif kind == "boom":
            add(t0, 0.35, noise(0.35), 0.3 * g)
            add(t0, 0.2, sweep(160, 50, 0.2), 0.2 * g)
        elif kind == "coin":
            add(t0, 0.07, env(pulse(hz(83), 0.5), 0.001, 0.06, 0.6, 0.07), 0.16 * g)
            add(t0 + 0.07, 0.32, env(pulse(hz(88), 0.5), 0.001, 0.3, 0.0, 0.32), 0.16 * g)
        elif kind == "power":
            for k, m in enumerate([60, 64, 67, 72, 76, 79, 84]):
                add(t0 + k * 0.05, 0.06, env(pulse(hz(m), 0.25), 0.001, 0.05, 0.5, 0.06), 0.14 * g)
        else:
            return False
        return True

    placed = 0
    for t0, cue in sorted(sounds_at, key=lambda x: x[0]):
        if play(cue.get("sfx"), max(0.0, t0), float(cue.get("gain", 1.0))):
            placed += 1
        else:
            skipped.append(cue)

    peak = max(abs(x) for x in buf) or 1.0
    frames = bytearray()
    for i, x in enumerate(buf):
        tt = i / SR
        fade = max(0.0, (dur - tt) / 1.8) if tt > dur - 1.8 else 1.0
        frames += struct.pack("<h", int(max(-1.0, min(1.0, x / peak * 0.9 * fade)) * 32767))
    with wave.open(args.out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"make-bed: wrote {args.out} ({dur:.1f} s, {placed} accents, {len(points)} tempo points)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word, sentence or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
