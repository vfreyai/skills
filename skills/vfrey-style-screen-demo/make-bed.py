#!/usr/bin/env python3
"""Music bed and UI sounds for the screen demo style. Python standard library only: no downloads, no ffmpeg.
It writes one mono 16-bit WAV: light pad chords, a sparse pluck arpeggio and a soft pulse, with UI accents at the
times you give. The same arguments always give the same file.

  python3 make-bed.py --duration 40 --out music/bed.wav
      Bed only. vfrey trims it to the film and fades it.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/bed.wav
      Bed as long as the film with accents. Without --cues: a whoosh into every spoken sentence and a success chime
      at the end.

cues.json is one object of lists of times in seconds, the same constants the scene uses for its clicks and camera moves:
  {"click": [..],        a mouse click
   "tick": [..],         a hover
   "whoosh": [..],       a camera move (put it on each one)
   "pop": [..],          a callout or tracker pill appearing
   "swell": [..],        a spotlight dimming the page
   "chime_alert": [..],  a warning toast (two falling plucks)
   "chime_ok": [..],     a success toast (a rising triad)
   "type": [start, end, n],   n key ticks typing between two times
   "duration": 36.4}     optional film length; --timing or --duration give it otherwise
"""
import argparse, json, math, random, struct, sys, wave
SR = 44100
ap = argparse.ArgumentParser(description="Music bed and UI sounds for the vfrey screen demo style")
ap.add_argument("--timing"); ap.add_argument("--duration", type=float); ap.add_argument("--cues"); ap.add_argument("--out", required=True)
args = ap.parse_args()
def _plain_error(kind, err, tb):
    print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues files exist, then run the same command again.", file=__import__('sys').stderr)
    raise SystemExit(1)
__import__('sys').excepthook = _plain_error
__import__('os').makedirs(__import__('os').path.dirname(__import__('os').path.abspath(args.out)), exist_ok=True)
timing = json.load(open(args.timing)) if args.timing else None
cues = json.load(open(args.cues)) if args.cues else {}
film = cues.get("duration") or (timing["durationSec"] if timing else None) or args.duration
if not film: sys.exit("make-bed: pass --timing FILE, --duration SECONDS, or a cues file with a duration")
cues["duration"] = float(film); out = args.out
if not args.cues and timing:   # a default sheet: a whoosh into each sentence, a chime at the end
    starts, cur = [], None
    for w in timing["words"]:
        if cur is None: cur = w["start"]; starts.append(cur)
        if w["text"][-1:] in ".!?": cur = None
    cues["whoosh"] = [max(0.1, t - 0.1) for t in starts]; cues["chime_ok"] = [max(0.5, timing["durationSec"] - 1.8)]
N = int((cues["duration"] + 1.0) * SR)
L = [0.0] * N
rnd = random.Random(7)

def add(t, samples, gain=1.0):
    i0 = int(t * SR)
    for i, v in enumerate(samples):
        j = i0 + i
        if 0 <= j < N: L[j] += v * gain

def env(n, a, r):
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    return [min(1, i / na) * (1 if i < n - nr else max(0, (n - i) / nr)) for i in range(n)]

def tone(f, d, a=.005, r=.1, shape="sine", det=0.0):
    n = int(d * SR); e = env(n, a, r); o = []
    for i in range(n):
        ph = 2 * math.pi * f * i / SR
        v = math.sin(ph)
        if shape == "tri": v = 2 / math.pi * math.asin(math.sin(ph))
        if det: v = (v + math.sin(ph * (1 + det))) / 2
        o.append(v * e[i])
    return o

def pluck(f, d=0.9):
    n = int(d * SR); o = []
    for i in range(n):
        t = i / SR
        v = math.sin(2*math.pi*f*t) * math.exp(-t * 5.5) + .35 * math.sin(2*math.pi*f*2*t) * math.exp(-t * 9) + .12 * math.sin(2*math.pi*f*3.01*t) * math.exp(-t*14)
        o.append(v * min(1, i / (.003 * SR)))
    return o

def noise(d, lp=1.0):
    n = int(d * SR); o = []; y = 0.0
    for i in range(n):
        y += lp * (rnd.uniform(-1, 1) - y); o.append(y)
    return o

def hz(m): return 440 * 2 ** ((m - 69) / 12)

# ---- bed: slow pad chords + sparse pluck arpeggio + soft pulse -----
chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]  # Cmaj7 Am7 Fmaj7 G7sus-ish
bar = 4.6; t = 0.0; k = 0
total = cues["duration"] + 1.0
while t < total:
    ch = chords[k % 4]
    for m in ch:
        add(t, tone(hz(m - 12), bar + .6, .9, 1.1, "tri", .004), .030)
        add(t, tone(hz(m), bar + .4, 1.0, 1.2, "sine", .003), .020)
    # arpeggio: 8 plucks per bar, pattern with rests
    step = bar / 8
    pat = [0, 2, 1, 3, 2, 1, 3, 2]
    for s in range(8):
        if s in (3, 7) and k % 2 == 0: continue
        add(t + s * step, pluck(hz(ch[pat[s]] + 12)), .060 if s % 4 == 0 else .042)
    # soft low pulse each half bar
    for s in (0, 4):
        add(t + s * step, tone(hz(ch[0] - 24), .5, .01, .4), .09)
    t += bar; k += 1

# ---- accents (louder than the bed so they read) ----
def click():
    o = noise(.012, .9); e = env(len(o), .0005, .01)
    b = tone(2100, .035, .0005, .03)
    return [o[i] * e[i] * .7 + (b[i] if i < len(b) else 0) * .5 for i in range(len(o))] + [0.0] * 0
for t in cues.get("click", []):
    add(t, click(), .55); add(t + .09, tone(1400, .05, .001, .04), .12)
for t in cues.get("tick", []):
    add(t, tone(1800, .03, .0005, .025), .22)
def whoosh(d=.55, up=True):
    n = int(d * SR); y = 0.0; o = []
    for i in range(n):
        p = i / n; p = p if up else 1 - p
        lp = .03 + .5 * p * p
        y += lp * (rnd.uniform(-1, 1) - y)
        o.append(y * math.sin(math.pi * i / n) ** 1.5)
    return o
for t in cues.get("whoosh", []): add(t - .1, whoosh(.55), .55)
def pop(f=900):
    n = int(.14 * SR); o = []
    for i in range(n):
        tt = i / SR; fr = f * (1 + .6 * math.exp(-tt * 40))
        o.append(math.sin(2*math.pi*fr*tt) * math.exp(-tt * 30))
    return o
for t in cues.get("pop", []): add(t, pop(780), .35)
for t in cues.get("swell", []):
    add(t, [v * .5 for v in whoosh(.8)], .35)
def chime(notes, gap=.11, f=1.0):
    out = []
    for j, m in enumerate(notes):
        out.append((j * gap, [v for v in pluck(hz(m), 1.2)]))
    return out
for t in cues.get("chime_alert", []):
    for dt, s in chime([79, 74]): add(t + dt, s, .30)
    add(t, tone(150, .25, .002, .2), .12)
for t in cues.get("chime_ok", []):
    for dt, s in chime([72, 76, 79], .09): add(t + dt, s, .34)
if "type" in cues:
    a, b, n = cues["type"]
    for j in range(int(n)):
        add(a + (b - a) * j / n, tone(1500 + 120 * (j % 3), .02, .0004, .018), .25)

mx = max(abs(v) for v in L) or 1
scale = .9 / mx
with wave.open(out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v * scale)) * 32767)) for v in L))
print("wrote", out, round(N / SR, 1), "s")
