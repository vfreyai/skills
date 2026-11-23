#!/usr/bin/env python3
"""Music bed for the footage split style, and the clips' own sound ducked under the voice. Python standard library only:
no downloads, no ffmpeg. It writes one mono 16-bit WAV. The same arguments always give the same file.

  python3 make-bed.py --duration 45 --out music/bed.wav
      Bed only: a soft kick, a clap on 2 and 4, a round bass and a warm pad at about 96 BPM. vfrey trims and fades it.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --out music/bed.wav
      Bed as long as the film, with a soft tick on each spoken line (or the times in --cues).

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --footage-audio music/<idea>-footage.wav --out music/<idea>-bed.wav
      The clips' own sound (prep-footage.py --audio keep; the person's own sound only) mixed under the bed and ducked
      while the voice speaks: 0 dB in the gaps, -18 dB under the voice, 0.25 s ramps. Add --no-bed for that sound alone.

cues.json is one object of lists of times in seconds:
  {"tick": [..],      a new sentence
   "duration": 41.2}  optional film length; --timing or --duration give it otherwise
"""
import argparse, json, math, os, random, struct, sys, wave

SR = 44100
ap = argparse.ArgumentParser(description="Music bed for the vfrey footage split style")
ap.add_argument("--timing"); ap.add_argument("--duration", type=float); ap.add_argument("--cues"); ap.add_argument("--out", required=True)
ap.add_argument("--footage-audio", help="a mono or stereo 16-bit WAV of the clips' own sound (prep-footage.py --audio keep)")
ap.add_argument("--no-bed", action="store_true", help="only the ducked footage sound, no music")
args = ap.parse_args()


def _plain_error(kind, err, tb):
    print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues/--footage-audio files exist, then run the same command again.", file=sys.stderr)
    raise SystemExit(1)


sys.excepthook = _plain_error
os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
timing = json.load(open(args.timing)) if args.timing else None
cues = json.load(open(args.cues)) if args.cues else {}
film = cues.get("duration") or (timing["durationSec"] if timing else None) or args.duration
if not film:
    sys.exit("make-bed: pass --timing FILE, --duration SECONDS, or a cues file with a duration")
if args.no_bed and not args.footage_audio:
    sys.exit("make-bed: --no-bed needs --footage-audio FILE")
cues["duration"] = float(film)
if not args.cues and timing:
    cues["tick"] = [max(0.05, l["start"] - 0.05) for l in timing.get("lines", [])]
N = int((cues["duration"] + 1.0) * SR)
L = [0.0] * N
rnd = random.Random(23)


def add(t, samples, gain=1.0):
    i0 = int(t * SR)
    for i, v in enumerate(samples):
        j = i0 + i
        if 0 <= j < N:
            L[j] += v * gain


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def kick():
    n = int(0.3 * SR)
    return [math.sin(2 * math.pi * (45 + 80 * math.exp(-i / SR * 30)) * i / SR) * math.exp(-i / SR * 10) for i in range(n)]


def clap():
    n = int(0.18 * SR); o = []; y = 0.0
    for i in range(n):
        y += 0.6 * (rnd.uniform(-1, 1) - y)
        t = i / SR
        o.append(y * (math.exp(-t * 30) + 0.5 * math.exp(-max(0, t - 0.012) * 30) * (t > 0.012)))
    return o


def bass(f, d):
    n = int(d * SR)
    return [(math.sin(2 * math.pi * f * i / SR) + 0.2 * math.sin(4 * math.pi * f * i / SR)) * min(1, i / (0.01 * SR)) * math.exp(-i / SR * 2.2) for i in range(n)]


def pad(f, d):
    n = int(d * SR); a = int(0.8 * SR); r = int(0.8 * SR)
    return [math.sin(2 * math.pi * f * i / SR + 0.3 * math.sin(2 * math.pi * 0.3 * i / SR)) * min(1, i / a) * min(1, max(0, (n - i) / r)) for i in range(n)]


def tick():
    n = int(0.05 * SR)
    return [math.sin(2 * math.pi * 1600 * i / SR) * math.exp(-i / SR * 80) for i in range(n)]


if not args.no_bed:
    beat = 60 / 96
    prog = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]  # Am F C G
    bar = beat * 4
    t = 0.0; k = 0
    while t < cues["duration"] + 1.0:
        root, chord = prog[k % 4]
        for m in chord:
            add(t, pad(hz(m), bar + 0.5), 0.035)
        for b in range(4):
            add(t + b * beat, kick(), 0.30 if b in (0, 2) else 0.12)
            if b in (1, 3):
                add(t + b * beat, clap(), 0.10)
            add(t + b * beat, bass(hz(root), beat * 0.9), 0.16)
        t += bar; k += 1
    for t in cues.get("tick", []):
        add(t, tick(), 0.10)

if args.footage_audio:
    with wave.open(args.footage_audio, "rb") as w:
        ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        if sw != 2:
            sys.exit("make-bed: --footage-audio must be 16-bit PCM (prep-footage.py --audio keep writes one)")
        raw = w.readframes(n)
    vals = struct.unpack(f"<{n * ch}h", raw)
    mono = [sum(vals[i * ch:(i + 1) * ch]) / ch / 32768 for i in range(n)]
    step = sr / SR
    # The voice's spans from timing.json (lines, else words): the footage sound dips under them.
    spans = [(l["start"], l["end"]) for l in (timing or {}).get("lines", [])] or [(w_["start"], w_["end"]) for w_ in (timing or {}).get("words", [])]
    low, ramp = 10 ** (-18 / 20), 0.25

    def gain(t):
        g = 1.0
        for a, b in spans:
            if a - ramp <= t <= b + ramp:
                inside = 1.0 if a <= t <= b else max(0.0, 1 - min(abs(t - a), abs(t - b)) / ramp)
                g = min(g, 1 - (1 - low) * inside)
        return g

    level = 0.55 if not args.no_bed else 0.9
    cur = 0
    for i in range(N):
        j = int(i * step)
        if j >= len(mono):
            break
        if i % 441 == 0:
            cur = gain(i / SR)
        L[i] += mono[j] * cur * level

mx = max(abs(v) for v in L) or 1
scale = 0.9 / mx
with wave.open(args.out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v * scale)) * 32767)) for v in L))
print("wrote", args.out, round(N / SR, 1), "s")
