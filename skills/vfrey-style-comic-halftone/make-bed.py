#!/usr/bin/env python3
"""Music bed and sound accents for the comic halftone style. Python standard library only: no downloads, no ffmpeg.

It writes one mono 16-bit WAV: a punchy 126 bpm bed (kick, snare, hat, saw bass riff, off-beat stabs, a pulse lead,
chords Am F G E7) with loud comic accents mixed in at the times you ask for. Accents sit above the music because vfrey
ducks the whole bed under the voice. The same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film, with accents. Without --cues: a pop on the title, a whoosh into every script line
      after the first (the page change) and a slam on the last line.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "whoosh", "line": 2, "offset": -0.12}      the start of script line 2 (lines count from 0)
  {"sfx": "hit",    "word": "punch", "offset": 0.0}   the first time that word is spoken ("nth": 1 for the second time)
  {"sfx": "pop",    "at": 3.2, "f": 520}              a time in seconds
Optional on every cue: "gain" (1 is the default level).
Sounds: whoosh (a page slams in; "down": true for a falling one, "dur" seconds), pop (a burst or label pops in; "f" Hz),
zip (a fast move), thwack (a hit; "big": true for a heavy one), hit (zip plus thwack), slam (heavy thwack plus boom: the
big impact), boom, bell (a ding), tick (a click; "hi": false for a lower one), blip (a bubble; "f" Hz), riser (rising
noise, "dur" seconds).
Two cues shape the music instead of adding a sound, and take "dur" seconds:
  {"sfx": "thin",  "at": 8.0, "dur": 5}     a sparser bed (no lead or snare, softer kick) under an explanation
  {"sfx": "build", "at": 20.0, "dur": 2.4}  a riser and a snare roll, then the bed drops out for 0.4 s and a slam lands
                                            at at+dur: put the build start on the word before the big moment.

Takes a few seconds. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey comic halftone style)", "volume": -14, "duck": true}
"""
import argparse
import json
import math
import random
import struct
import sys
import wave

SR = 32000
BPM = 126
CH = [(45, [0, 3, 7]), (41, [0, 4, 7]), (43, [0, 4, 7]), (40, [0, 4, 7, 10])]  # Am F G E7: bass note, chord intervals
SOUNDS = ("whoosh", "pop", "zip", "thwack", "hit", "slam", "boom", "bell", "tick", "blip", "riser")
SHAPES = ("thin", "build")


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
    cues = [{"sfx": "pop", "at": 0.12}]
    cues += [{"sfx": "whoosh", "line": i, "offset": -0.12} for i in range(1, len(lines))]
    if lines:
        cues.append({"sfx": "slam", "line": len(lines) - 1, "offset": 0.0})
    return cues


def main():
    ap = argparse.ArgumentParser(description="Music bed and accents for the vfrey comic halftone style (standard library only).")
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

    N = int(SR * (dur + 0.5))
    music = [0.0] * N
    acc = [0.0] * N
    rng = random.Random(7)

    def add(buf, t, samples, g=1.0):
        s0 = int(t * SR)
        for i, v in enumerate(samples):
            j = s0 + i
            if 0 <= j < N:
                buf[j] += v * g

    def mtof(m):
        return 440 * 2 ** ((m - 69) / 12)

    def noise(d):
        return [rng.random() * 2 - 1 for _ in range(int(d * SR))]

    def lowpass(x, a):
        y, o = 0.0, []
        for v in x:
            y += a * (v - y)
            o.append(y)
        return o

    def highpass(x, a):
        y, o = 0.0, []
        for v in x:
            y += a * (v - y)
            o.append(v - y)
        return o

    def tone(freq, d, shape="saw", a=0.005, decay=None):
        out, ph = [], 0.0
        decay = decay or d
        for i in range(int(d * SR)):
            t = i / SR
            ph += freq / SR
            x = ph % 1
            if shape == "saw":
                v = 2 * x - 1
            elif shape == "pulse":
                v = 1 if x < 0.28 else -1
            else:
                v = math.sin(2 * math.pi * ph)
            out.append(v * min(1, t / a) * math.exp(-t / decay * 3))
        return out

    # drum voices
    def kick():
        out, ph = [], 0.0
        for i in range(int(0.28 * SR)):
            t = i / SR
            ph += (45 + 110 * math.exp(-t * 28)) / SR
            out.append(math.sin(2 * math.pi * ph) * math.exp(-t * 11))
        return out

    def snare():
        n = highpass(noise(0.2), 0.3)
        return [(n[i] * 0.8 + math.sin(2 * math.pi * 190 * i / SR) * 0.5) * math.exp(-i / SR * 20) for i in range(len(n))]

    def hat():
        n = highpass(noise(0.04), 0.75)
        return [v * math.exp(-i / SR / 0.04 * 4) for i, v in enumerate(n)]

    # accent voices: each takes (t, gain, **cue options)
    def whoosh(t, g, dur=0.34, down=False, **_):
        n = int(dur * SR)
        x, y, out = noise(dur), 0.0, []
        for i in range(n):
            u = i / n
            y += (0.02 + 0.55 * (1 - u if down else u)) * (x[i] - y)
            out.append(y * math.sin(math.pi * u) ** 1.2)
        add(acc, t, out, 0.55 * g)

    def pop(t, g, f=520, **_):
        out, ph = [], 0.0
        for i in range(int(0.12 * SR)):
            tt = i / SR
            ph += f * (1 + 2.2 * tt * 8) / SR
            out.append(math.sin(2 * math.pi * ph) * math.exp(-tt * 28))
        add(acc, t, out, 0.6 * g)

    def zip_(t, g, **_):
        out, ph = [], 0.0
        for i in range(int(0.22 * SR)):
            tt = i / SR
            ph += (2600 * math.exp(-tt * 11) + 200) / SR
            out.append((math.sin(2 * math.pi * ph) * 0.6 + (rng.random() * 2 - 1) * 0.3) * math.exp(-tt * 9))
        add(acc, t, out, 0.8 * g)

    def thwack(t, g, big=False, **_):
        n = lowpass(noise(0.5 if big else 0.18), 0.25 if big else 0.5)
        out, ph = [], 0.0
        for i in range(len(n)):
            tt = i / SR
            ph += (70 * math.exp(-tt * 9) + 38) / SR
            out.append(n[i] * 1.2 * math.exp(-tt * (9 if big else 30)) + math.sin(2 * math.pi * ph) * 1.1 * math.exp(-tt * (5 if big else 14)))
        for i in range(int(0.004 * SR)):
            out[i] += (rng.random() * 2 - 1) * 1.3
        add(acc, t, out, (1.0 if big else 0.7) * g)

    def boom(t, g, dur=0.9, **_):
        out, ph = [], 0.0
        for i in range(int(dur * SR)):
            tt = i / SR
            ph += (95 * math.exp(-tt * 3) + 30) / SR
            out.append(math.sin(2 * math.pi * ph) * math.exp(-tt * 4.2))
        nz = lowpass(noise(dur), 0.08)
        add(acc, t, [out[i] + nz[i] * math.exp(-i / SR * 5) * 0.7 for i in range(len(out))], 0.9 * g)

    def bell(t, g, **_):
        out = []
        for i in range(int(1.6 * SR)):
            tt = i / SR
            out.append(0.5 * sum(a * math.sin(2 * math.pi * f * tt) * math.exp(-tt * d) for f, a, d in ((1568, 1, 2.4), (2093, .6, 3.2), (3136, .35, 4.5), (4186, .2, 6))))
        add(acc, t, out, 0.9 * g)

    def tick(t, g, hi=True, **_):
        f = 2400 if hi else 1700
        add(acc, t, [math.sin(2 * math.pi * f * i / SR) * math.exp(-i / SR * 150) for i in range(int(0.03 * SR))], 0.8 * g)

    def blip(t, g, f=600, **_):
        out, ph = [], 0.0
        for i in range(int(0.09 * SR)):
            tt = i / SR
            ph += f * (1 + 3 * tt * 6) / SR
            out.append(math.sin(2 * math.pi * ph) * math.exp(-tt * 36))
        add(acc, t, out, 0.45 * g)

    def riser(t, g, dur=0.5, **_):
        n = int(dur * SR)
        x, y, out = noise(dur), 0.0, []
        for i in range(n):
            u = i / n
            y += (0.03 + 0.8 * u * u) * (x[i] - y)
            out.append(y * u)
        add(acc, t, out, 0.5 * g)

    voices = {
        "whoosh": whoosh, "pop": pop, "zip": zip_, "thwack": thwack, "boom": boom, "bell": bell, "tick": tick, "blip": blip, "riser": riser,
        "hit": lambda t, g, **o: (zip_(t, g), thwack(t + 0.04, 0.8 * g)),
        "slam": lambda t, g, **o: (thwack(t, 1.1 * g, big=True), boom(t, g)),
    }

    # resolve every cue to a time once
    placed, skipped, plan = 0, [], []
    for cue in cues:
        t = cue_time(cue, timing)
        kind = cue.get("sfx")
        if t is None or kind not in SOUNDS + SHAPES or t >= dur + 0.5:
            skipped.append(cue)
            continue
        plan.append((max(0.0, t), kind, cue))
    plan.sort(key=lambda p: p[0])
    thins = [(t, t + float(c.get("dur", 4))) for t, k, c in plan if k == "thin"]
    builds = [(t, t + float(c.get("dur", 2.4))) for t, k, c in plan if k == "build"]

    def layers(t):
        d = {"kick": 1, "snare": 1, "hat": 1, "bass": 1, "stab": 1, "lead": 1}
        if any(a <= t < b for a, b in thins):
            d.update(lead=0, kick=0.6, snare=0.5, stab=0.5, hat=0.6)
        if any(a <= t < b for a, b in builds):
            d.update(kick=0, snare=0, stab=0, lead=0, bass=0.5, hat=0.4)
        if any(b - 0.02 <= t < b + 0.38 for a, b in builds):
            d = {k: 0 for k in d}
        return d

    # the bed: one chord per bar, eighth-note steps
    beat = 60 / BPM
    step = beat / 2
    for s in range(int((dur + 0.5) / step)):
        t = s * step
        bar, sub = (s // 8) % 4, s % 8
        root, chord = CH[bar]
        g = layers(t)
        if g["kick"] and sub in (0, 3, 4, 6 if (s // 8) % 2 else 7):
            add(music, t, kick(), 0.55 * g["kick"])
        if g["snare"] and sub in (2, 6):
            add(music, t, snare(), 0.32 * g["snare"])
        if g["hat"]:
            add(music, t, hat(), (0.16 if sub % 2 == 0 else 0.1) * g["hat"])
        if g["bass"]:
            riff = [0, 0, 12, 0, 0, 7, 0, 10]
            add(music, t, lowpass(tone(mtof(root + riff[sub]), step * 0.9, "saw", decay=step * 1.6), 0.12), 0.5 * g["bass"])
        if g["stab"] and sub in (3, 7):
            for iv in chord:
                add(music, t, lowpass(tone(mtof(root + 24 + iv), step * 0.7, "saw", a=0.003, decay=step * 0.8), 0.35), 0.075 * g["stab"])
        if g["lead"] and (s // 8) % 2 == 1 and sub in (0, 2, 3, 5, 6):
            pick = [0, 2, 3, 5, 6].index(sub)
            add(music, t, tone(mtof(root + 36 + chord[[0, 1, 2, 1, 2][pick] % len(chord)]), step * 0.8, "pulse", a=0.004, decay=step * 1.2), 0.09 * g["lead"])

    # accents, and the roll into each build
    for t, kind, cue in plan:
        gain = float(cue.get("gain", 1.0))
        if kind == "thin":
            placed += 1
        elif kind == "build":
            d = float(cue.get("dur", 2.4))
            riser(t, gain, dur=d)
            r, k = t + 0.2, 0
            while r < t + d - 0.05:
                add(music, r, snare(), 0.18 + 0.2 * (r - t) / d)
                r += max(0.06, 0.34 - 0.07 * k)
                k += 1
            voices["slam"](t + d, gain)
            placed += 1
        else:
            extra = {k: cue[k] for k in ("dur", "f") if k in cue}
            extra.update({k: bool(cue[k]) for k in ("big", "down", "hi") if k in cue})
            if "f" in extra:
                extra["f"] = float(extra["f"])
            if "dur" in extra:
                extra["dur"] = float(extra["dur"])
            voices[kind](t, gain, **extra)
            placed += 1

    # master: music and accents normalised apart, accents hotter, short fades, one peak limit
    pm = max(abs(v) for v in music) or 1
    pa = max(abs(v) for v in acc) or 1
    mix = [music[i] / pm * 0.55 + acc[i] / pa * 0.7 for i in range(N)]
    fi, fo = int(0.4 * SR), int(1.2 * SR)
    for i in range(min(fi, N)):
        mix[i] *= i / fi
    for i in range(min(fo, N)):
        mix[N - 1 - i] *= i / fo
    pk = max(abs(v) for v in mix) or 1
    mix = [max(-1.0, min(1.0, v / pk * 0.89)) for v in mix]
    with wave.open(args.out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(v * 32767)) for v in mix))
    print(f"make-bed: wrote {args.out} ({N / SR:.1f} s, {placed} accents)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
