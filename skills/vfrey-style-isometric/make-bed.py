#!/usr/bin/env python3
"""Music bed and sound accents for the isometric miniature world style. Python standard library only: no downloads, no ffmpeg.

It writes one stereo 16-bit WAV: a calm bed (pad chords Am9, Fmaj7, Cmaj7, G6 with a sparse bell arpeggio at 90 bpm)
with short accents mixed in at the times you ask for, and an optional "muffle" that dulls the music while the
picture is under water or inside something. The same arguments always give the same file.

  python3 make-bed.py --duration 60 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it, so it can be made before the voice exists.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav [--cues scenes/<idea>/cues.json]
      Bed as long as the film, with accents. Without --cues: a whoosh into every sentence and a chime on the last.

cues.json is a list. Each cue names a sound and one moment:
  {"sfx": "whoosh", "sentence": 3, "offset": -0.4, "dur": 1.4}   the start of spoken sentence 3 (count from 0)
  {"sfx": "chime",  "sentence": 6, "edge": "end"}                the end of that sentence
  {"sfx": "thunk",  "word": "garden", "offset": -0.15}           the first time a word starting with that is spoken
  {"sfx": "blip",   "line": 1}   or   {"sfx": "click", "at": 3.2}   a script line start, or a time in seconds
Optional: "gain" (1 is the default level). Sounds: blip (the packet lifts off or arrives), chime (a decision, a
delivery), whoosh (a camera move or an iris; "dur" seconds, "down": true for a falling one), thunk (a heavy object
lands), click (something computes). Music muffle: {"sfx": "muffle", "at": 14.2, "until": 21.0} ("at" and "until"
take the same moment keys through "from": {...} and "to": {...}); accents stay bright.

Takes a few seconds. Then put the file in the script:
  "music": {"file": "music/bed.wav", "source": "generated:make-bed.py (vfrey isometric style)", "volume": -15, "duck": false}
"""
import argparse
import json
import math
import random
import struct
import sys
import wave

SR = 44100
TWO_PI = 2 * math.pi
CHORD_SEC = 5.333  # two bars at 90 bpm
CHORDS = [
    ([220.0, 261.63, 329.63, 392.0, 493.88], 55.0),
    ([174.61, 220.0, 261.63, 329.63, 392.0], 43.65),
    ([130.81, 196.0, 261.63, 329.63, 493.88], 65.41),
    ([196.0, 246.94, 293.66, 329.63, 392.0], 49.0),
]


def sentences(timing):
    out, cur = [], []
    for w in timing["words"]:
        cur.append(w)
        if w["text"][-1:] in ".!?":
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


def moment(cue, timing):
    """Seconds for one cue (or a "from"/"to" part of a muffle), or None when it is not in the timing."""
    offset = float(cue.get("offset", 0))
    if "at" in cue:
        return float(cue["at"]) + offset
    if timing is None:
        return None
    end = cue.get("edge") == "end"
    if "word" in cue:
        want = str(cue["word"]).lower()
        hits = [w for w in timing["words"] if w["text"].lower().startswith(want)]
        nth = int(cue.get("nth", 0))
        return hits[nth]["end" if end else "start"] + offset if nth < len(hits) else None
    if "sentence" in cue:
        s = sentences(timing)
        i = int(cue["sentence"])
        return (s[i][-1]["end"] if end else s[i][0]["start"]) + offset if 0 <= i < len(s) else None
    if "line" in cue:
        lines = timing.get("lines", [])
        i = int(cue["line"])
        return lines[i]["end" if end else "start"] + offset if 0 <= i < len(lines) else None
    return None


def default_cues(timing):
    n = len(sentences(timing))
    cues = [{"sfx": "blip", "at": 0.3}]
    cues += [{"sfx": "whoosh", "sentence": i, "offset": -0.4, "dur": 1.2} for i in range(1, n)]
    if n:
        cues.append({"sfx": "chime", "sentence": n - 1, "edge": "end", "offset": -0.2})
    return cues


def main():
    ap = argparse.ArgumentParser(description="Music bed and accents for the vfrey isometric style (standard library only).")
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

    n_total = int((dur + 1.0) * SR)
    music = [0.0] * n_total
    accents = [0.0] * n_total
    rnd = random.Random(7)

    def add(buf, t0, data, gain=1.0):
        i0 = int(t0 * SR)
        for k, v in enumerate(data):
            j = i0 + k
            if 0 <= j < n_total:
                buf[j] += v * gain

    def note(freq, length, kind="bell"):
        out = []
        for k in range(int(length * SR)):
            t = k / SR
            if kind == "bell":
                env = math.exp(-t * 5.5) * min(1, t * 400)
                v = math.sin(TWO_PI * freq * t) + 0.35 * math.sin(TWO_PI * freq * 2.01 * t) * math.exp(-t * 9) + 0.12 * math.sin(TWO_PI * freq * 3.99 * t) * math.exp(-t * 14)
            else:  # pad: slow attack and release, a detuned partner and a breathing octave
                env = max(0, min(1, t / 1.2) * min(1, (length - t) / 1.4))
                v = math.sin(TWO_PI * freq * t) + 0.5 * math.sin(TWO_PI * freq * 1.004 * t + 1) + 0.25 * math.sin(TWO_PI * freq * 2 * t) * (0.6 + 0.4 * math.sin(TWO_PI * 0.23 * t))
            out.append(v * env)
        return out

    # The bed: pads overlap by half a second so chords cross-fade; bells hit 62% of the eighth notes.
    step = 60 / 90 / 2
    for c in range(int(dur / CHORD_SEC) + 2):
        notes, bass = CHORDS[c % 4]
        t0 = c * CHORD_SEC - 0.5
        for freq, length, gain in [(f, CHORD_SEC + 1.4, 0.055) for f in notes] + [(bass * 2, CHORD_SEC + 1.2, 0.10)]:
            data = note(freq, length, "pad")
            add(music, max(0, t0), data if t0 >= 0 else data[int(0.5 * SR):], gain)
        arp = [f * 2 for f in notes] + [notes[2] * 4, notes[3] * 2]
        for b in range(int(CHORD_SEC / step)):
            if rnd.random() < 0.62:
                f = arp[(b * 3 + c) % len(arp)] * (2 if rnd.random() < 0.25 else 1)
                add(music, c * CHORD_SEC + b * step, note(f, 0.9, "bell"), 0.05)

    def blip(t, g=1.0, f0=1100, f1=1650, dur=0.14, **_):
        n = int(dur * SR)
        add(accents, t, [math.sin(TWO_PI * (f0 + (f1 - f0) * (k / n)) * k / SR) * math.exp(-k / SR * 22) * min(1, k / 60) for k in range(n)], 0.22 * g)

    def chime(t, g=1.0, **_):
        for i, f in enumerate((880, 1318.5, 1760)):
            add(accents, t + i * 0.11, note(f, 1.2, "bell"), 0.16 * g)

    def thunk(t, g=1.0, **_):
        n = int(0.22 * SR)
        add(accents, t, [math.sin(TWO_PI * (95 - 40 * k / n) * k / SR) * math.exp(-k / SR * 18) for k in range(n)], 0.5 * g)

    def whoosh(t, g=1.0, dur=1.2, down=False, **_):
        n = int(dur * SR)
        r = random.Random(int(t * 1000))
        y, out = 0.0, []
        for k in range(n):
            x = k / n
            cut = (300 + 4200 * ((1 - x) if down else x) ** 1.5) / SR * TWO_PI  # noise through a sweeping low-pass
            y += min(0.95, cut) * (r.uniform(-1, 1) - y)
            out.append(y * math.sin(math.pi * x) ** 1.6)
        add(accents, t, out, 0.45 * g)

    def click(t, g=1.0, **_):
        add(accents, t, [(1 if k % 40 < 20 else -1) * math.exp(-k / SR * 90) for k in range(int(0.03 * SR))], 0.12 * g)

    sounds = {"blip": blip, "chime": chime, "thunk": thunk, "whoosh": whoosh, "click": click}
    wet, placed, skipped = [], 0, []
    for cue in cues:
        kind = cue.get("sfx")
        if kind == "muffle":
            a = moment(cue.get("from", cue), timing)
            b = moment(cue["to"], timing) if "to" in cue else cue.get("until")
            if a is None or b is None:
                skipped.append(cue)
            else:
                wet.append((a, float(b)))
            continue
        t = moment(cue, timing)
        if t is None or kind not in sounds:
            skipped.append(cue)
            continue
        extra = {k: float(cue[k]) for k in ("dur", "f0", "f1") if k in cue}
        if cue.get("down"):
            extra["down"] = True
        sounds[kind](max(0.0, t), float(cue.get("gain", 1.0)), **extra)
        placed += 1

    # Muffle: a two-pole low-pass on the music only; the cutoff drops from 14 kHz to 700 Hz over 0.6 s and returns in 0.5 s.
    def cutoff(t):
        for a, b in wet:
            if a - 0.6 < t < b + 0.5:
                fin = min(1, max(0, (t - (a - 0.6)) / 0.6))
                fout = min(1, max(0, (b + 0.5 - t) / 0.5))
                return 14000 - 13300 * min(fin, fout)
        return 14000

    if wet:
        y1 = y2 = 0.0
        for i in range(n_total):
            a = min(0.99, TWO_PI * cutoff(i / SR) / SR)
            y1 += a * (music[i] - y1)
            y2 += a * (y1 - y2)
            music[i] = y2

    mix = [music[i] + accents[i] for i in range(n_total)]
    peak = max(abs(v) for v in mix) or 1.0
    delay = int(0.009 * SR)  # gentle stereo: the right channel is 9 ms late
    fade_out = int(1.0 * SR)
    frames = bytearray()
    for i in range(n_total):
        fade = min(1.0, (n_total - i) / fade_out)
        left = mix[i] / peak * 0.85 * fade
        right = mix[i - delay] / peak * 0.85 * fade if i >= delay else 0.0
        frames += struct.pack("<hh", int(left * 32000), int(right * 32000))
    with wave.open(args.out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"make-bed: wrote {args.out} ({n_total / SR:.1f} s, {placed} accents, {len(wet)} muffled spans)")
    for cue in skipped:
        print(f"make-bed: skipped {json.dumps(cue)} (unknown sound, or its word, sentence or line is not in the timing)", file=sys.stderr)


if __name__ == "__main__":
    main()
