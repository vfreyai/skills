#!/usr/bin/env python3
"""Music-box lullaby bed plus story accents for the storybook watercolour style.

Pure python (standard library only, no downloads). Same input, same file.

  python3 make-bed.py --timing scenes/<idea>/vfrey/timing.json --cues scenes/<idea>/cues.json --out music/<idea>-bed.wav
  python3 make-bed.py --duration 40 --out music/bed.wav          # bed only, before the first render

cues.json is a list of accents. Each has a "type" and a time, given one of these ways:
  {"type": "page",  "t": 1.3}                         seconds
  {"type": "plop",  "word": "plop"}                   start of the first spoken word that begins with these letters
  {"type": "plop",  "word": "another", "nth": 2}      the 2nd such word; "from": "plop" starts the search at that word
  {"type": "page",  "line": 2, "offset": -0.78}       start of script line 2 (0-based), shifted
  {"type": "chime", "end": 4, "offset": 0.1}          end of script line 4
Optional: "gain" (default 1), "edge": "end" with "word" to use the word's end, "count" with "every" (seconds) to
repeat an accent, or "count" with "to": {another time} to spread the repeats evenly up to that moment.

Types: page (paper turning), plop (something drops into water), drip (a small plop), chime (an idea, a sparkle),
twinkle (stars), flap (wings), hop (a soft landing), sip (little gulps), hush (a low warm goodnight chord).
"""
import argparse, json, math, random, struct, wave

SR = 44100
A4 = 440.0


def hz(n):  # midi note -> Hz
    return A4 * 2 ** ((n - 69) / 12)


class Mix:
    def __init__(self, seconds):
        self.n = int(seconds * SR) + SR
        self.L = [0.0] * self.n
        self.R = [0.0] * self.n

    def add(self, t, samples, gain=1.0, pan=0.0):
        i0 = int(t * SR)
        gl = gain * math.cos((pan + 1) * math.pi / 4)
        gr = gain * math.sin((pan + 1) * math.pi / 4)
        L, R, n = self.L, self.R, self.n
        for k, s in enumerate(samples):
            i = i0 + k
            if 0 <= i < n:
                L[i] += s * gl
                R[i] += s * gr


def tine(freq, dur=1.6, bright=1.0):
    """One music-box tooth: a sine with a soft octave and a short inharmonic 'tink' on the attack."""
    n = int(dur * SR)
    w = 2 * math.pi * freq / SR
    out = []
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 3.2) * min(1.0, i / 60)
        tink = math.exp(-t * 26) * 0.34 * bright
        out.append(env * (math.sin(w * i) + 0.22 * math.sin(2 * w * i + 0.4) + 0.06 * math.sin(3.01 * w * i))
                   + tink * math.sin(5.43 * w * i))
    return out


def pad(freqs, dur):
    """Slow warm chord under the box: sines with a long fade in and out."""
    n = int(dur * SR)
    out = [0.0] * n
    for f in freqs:
        w = 2 * math.pi * f / SR
        for i in range(n):
            t = i / SR
            env = min(1.0, t / (dur * 0.35)) * min(1.0, (dur - t) / (dur * 0.4))
            out[i] += env * (math.sin(w * i) + 0.3 * math.sin(2 * w * i)) / len(freqs)
    return out


def noise_burst(dur, lo, hi, rnd, shape=2.0):
    """Filtered noise whose band slides from lo to hi Hz: paper, wings, air."""
    n = int(dur * SR)
    out, y1, y2 = [], 0.0, 0.0
    for i in range(n):
        p = i / n
        env = math.sin(math.pi * p) ** shape
        fc = lo + (hi - lo) * p
        a = min(0.99, 2 * math.pi * fc / SR)
        x = rnd.uniform(-1, 1)
        y1 += a * (x - y1)          # low-pass
        y2 += a * 0.25 * (y1 - y2)  # remove rumble
        out.append(env * (y1 - y2))
    return out


def sweep(f0, f1, dur, decay=18.0, attack=40):
    """A sine that slides in pitch: plops, thumps, bubbles."""
    n = int(dur * SR)
    out, ph = [], 0.0
    for i in range(n):
        p = i / n
        f = f0 * (f1 / f0) ** p
        ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-i / SR * decay) * min(1.0, i / attack))
    return out


def accent(mix, kind, t, gain, rnd):
    if kind == "page":
        mix.add(t, noise_burst(0.55, 900, 5200, rnd, 1.6), 0.5 * gain, -0.3)
        mix.add(t + 0.42, noise_burst(0.3, 4200, 1500, rnd, 1.2), 0.3 * gain, 0.3)
        mix.add(t + 0.78, sweep(170, 95, 0.12, 30), 0.25 * gain, 0.0)
    elif kind == "plop":
        mix.add(t, sweep(560, 170, 0.16, 16), 0.85 * gain, 0.15)
        mix.add(t + 0.09, sweep(320, 1150, 0.11, 22), 0.5 * gain, 0.15)
        mix.add(t, noise_burst(0.2, 2500, 6000, rnd, 1.0), 0.16 * gain, 0.15)
    elif kind == "drip":
        f = rnd.choice([620, 700, 780, 880])
        mix.add(t, sweep(f, f * 0.42, 0.1, 24), 0.4 * gain, rnd.uniform(-0.3, 0.3))
        mix.add(t + 0.06, sweep(f * 0.7, f * 2.1, 0.07, 30), 0.22 * gain, 0.1)
    elif kind == "chime":
        for k, m in enumerate([84, 88, 91, 96]):
            mix.add(t + k * 0.085, tine(hz(m), 1.4, 1.3), 0.3 * gain, -0.4 + k * 0.25)
    elif kind == "twinkle":
        for k in range(7):
            m = rnd.choice([84, 86, 89, 91, 93, 96])
            mix.add(t + k * 0.27 + rnd.uniform(0, 0.08), tine(hz(m), 1.2, 1.2), 0.16 * gain, rnd.uniform(-0.8, 0.8))
    elif kind == "flap":
        for k in range(5):
            mix.add(t + k * 0.26, noise_burst(0.2, 500, 1700, rnd, 1.5), 0.3 * gain, -0.6 + k * 0.25)
    elif kind == "hop":
        mix.add(t, sweep(190, 85, 0.1, 30), 0.45 * gain, 0.0)
    elif kind == "sip":
        for k in range(3):
            mix.add(t + k * 0.42, sweep(260, 520, 0.09, 20), 0.3 * gain, 0.1)
    elif kind == "hush":
        mix.add(t, pad([hz(41), hz(53), hz(57), hz(60)], 4.0), 0.3 * gain, 0.0)


def lullaby(mix, total, rnd):
    """A slow waltz in F for a music box: broken chords underneath, a simple tune on top, a pad for warmth."""
    bars = max(4, round((total - 1.6) / 2.76))
    bar = (total - 1.6) / bars
    beat = bar / 3
    # chords as (root midi, third, fifth); tune as (beat, midi, length in beats) per bar
    prog = [(53, 57, 60), (50, 53, 57), (46, 50, 53), (48, 52, 55), (53, 57, 60), (45, 48, 52), (46, 50, 53), (48, 52, 55)]
    tune = [[(0, 69, 2), (2, 72, 1)], [(0, 69, 1), (1, 65, 2)], [(0, 74, 2), (2, 70, 1)], [(0, 72, 3)],
            [(0, 69, 1), (1, 72, 1), (2, 77, 1)], [(0, 76, 2), (2, 72, 1)], [(0, 74, 1), (1, 70, 1), (2, 67, 1)], [(0, 65, 3)]]
    for b in range(bars):
        t0 = 0.25 + b * bar
        last = b == bars - 1
        root, third, fifth = (53, 57, 60) if last else prog[b % 8]
        mix.add(t0, pad([hz(root - 12), hz(fifth - 12), hz(third)], bar * 1.25), 0.11, 0.0)
        if last:  # a rolled last chord, left to ring
            for k, m in enumerate([53, 57, 60, 65, 69, 72, 77]):
                mix.add(t0 + k * 0.11, tine(hz(m), 2.6, 0.8), 0.2, -0.5 + k * 0.16)
            break
        arp = [root, fifth, third + 12, fifth, third + 12, fifth]
        for k, m in enumerate(arp):
            mix.add(t0 + k * beat / 2 + rnd.uniform(-0.006, 0.006), tine(hz(m), 1.3, 0.7), 0.13 if k else 0.17, -0.35 + 0.1 * (k % 3))
        second = b >= 8
        for (bt, m, ln) in tune[b % 8]:
            if second and ln == 1 and bt == 1:
                continue  # the repeat leaves a few notes out, like a box winding down
            mix.add(t0 + bt * beat + rnd.uniform(-0.008, 0.008), tine(hz(m + 12), 1.9, 1.0), 0.27, 0.3)
            if second:
                mix.add(t0 + bt * beat + beat / 2, tine(hz(m + 24), 1.2, 1.2), 0.07, 0.6)


def room(mix):
    """A small soft room: three feedback echoes."""
    for buf in (mix.L, mix.R):
        for d, g in ((int(0.071 * SR), 0.22), (int(0.113 * SR), 0.17), (int(0.197 * SR), 0.13)):
            for i in range(d, mix.n):
                buf[i] += buf[i - d] * g
    return mix


def cue_time(c, timing):
    words, lines = timing.get("words", []), timing.get("lines", [])
    off = float(c.get("offset", 0))
    if "t" in c:
        return float(c["t"]) + off
    if "line" in c:
        return lines[min(int(c["line"]), len(lines) - 1)]["start"] + off
    if "end" in c:
        return lines[min(int(c["end"]), len(lines) - 1)]["end"] + off
    if "word" in c:
        clean = lambda s: "".join(ch for ch in s.lower() if ch.isalpha())
        start = 0
        if "from" in c:
            for w in words:
                if clean(w["text"]).startswith(c["from"].lower()):
                    start = w["i"]
                    break
        hits = [w for w in words if w["i"] >= start and clean(w["text"]).startswith(c["word"].lower())]
        if not hits:
            return None
        w = hits[min(int(c.get("nth", 1)), len(hits)) - 1]
        return (w["end"] if c.get("edge") == "end" else w["start"]) + off
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timing")
    ap.add_argument("--cues")
    ap.add_argument("--duration", type=float)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    def _plain_error(kind, err, tb):
        print(f"make-bed: {err}. Fix: check the --out path is a folder you can write to and that the --timing/--cues files exist, then run the same command again.", file=__import__('sys').stderr)
        raise SystemExit(1)
    __import__('sys').excepthook = _plain_error
    __import__('os').makedirs(__import__('os').path.dirname(__import__('os').path.abspath(a.out)), exist_ok=True)
    timing = json.load(open(a.timing)) if a.timing else {}
    total = a.duration or timing.get("durationSec") or 40.0
    rnd = random.Random(14)
    mix = Mix(total)
    lullaby(mix, total, rnd)
    room(mix)
    if a.cues and a.timing:
        acc = Mix(total)
        for c in json.load(open(a.cues)):
            t = cue_time(c, timing)
            if t is None:
                continue
            count = int(c.get("count", 1))
            every = float(c.get("every", 0.3))
            if "to" in c and count > 1:  # spread the repeats evenly up to a second time
                t2 = cue_time(c["to"], timing)
                if t2 is not None:
                    every = (t2 - t) / count
            for k in range(count):
                tt = t + k * every
                if 0 <= tt < total:
                    accent(acc, c["type"], tt, float(c.get("gain", 1)), rnd)
        for i in range(mix.n):
            mix.L[i] += acc.L[i]
            mix.R[i] += acc.R[i]
    n = int(total * SR)
    peak = max(1e-9, max(max(abs(x) for x in mix.L[:n]), max(abs(x) for x in mix.R[:n])))
    g = 0.89 / peak
    fade = int(0.02 * SR)
    with wave.open(a.out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for i in range(n):
            f = min(1.0, i / fade, (n - i) / (fade * 40))
            frames += struct.pack("<hh", int(mix.L[i] * g * f * 32767), int(mix.R[i] * g * f * 32767))
        w.writeframes(bytes(frames))
    print(f"wrote {a.out}: {total:.2f} s, peak gain {g:.2f}")


if __name__ == "__main__":
    main()
