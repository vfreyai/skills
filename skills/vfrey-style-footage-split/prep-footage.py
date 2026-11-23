#!/usr/bin/env python3
"""Prepare the person's own footage for a footage-split scene. Python standard library plus ffmpeg and ffprobe (vfrey already
needs both). It never downloads anything: it reads only files inside the footage folder you name.

RIGHTS: use only footage the person filmed, made or holds the rights to (their own gameplay capture, their own camera
clips, stock with a licence they hold). A clip cut from someone else's video, a stream or a film is not theirs to post,
and the platforms remove it or claim it.

It turns a folder of mixed clips (any size, shape, frame rate, phone rotation, with or without sound) into one silent clip
that fits the scene's slot exactly and is at least as long as the film:
  - scales and centre-crops each clip to cover the slot (or, with --fit blur, fits it whole over a blurred copy of itself),
  - converts every clip to one frame rate (--fps, default 30) and square pixels,
  - trims (--trim NAME=START-END), caps each clip's share (--segment SECONDS) and loops the list to the length,
  - mutes the original sound (default) or keeps it as a separate WAV you can duck under the voice (--audio keep),
  - stays under the scene folder's size budget (--max-mb, default 30; a scene folder is at most 50 MB).

  python3 prep-footage.py --footage footage --scene scenes/<idea> --duration 45 --slot top
  python3 prep-footage.py --footage footage --scene scenes/<idea> --timing scenes/<idea>/vfrey/timing.json --slot bottom \\
      --trim run1.mp4=12-40 --segment 6 --audio keep

Writes scenes/<idea>/footage/clip.webm (VP9, which the render browser can seek), footage.json, and the clip's entry in the scene's assets.json (what went in, from where, for how long); with --audio keep also
music/<idea>-footage.wav in the project. Run it again after you change the script: the clip must cover the whole film.
Slots: top and bottom are 1080x960 (one half of a 9:16 split screen), full is 1080x1920 (footage behind everything).
"""
import argparse, json, math, os, subprocess, sys

VIDEO = (".mp4", ".mov", ".m4v", ".webm", ".mkv")
IMAGE = (".jpg", ".jpeg", ".png", ".webp")
SLOTS = {"top": (1080, 960), "bottom": (1080, 960), "full": (1080, 1920)}

ap = argparse.ArgumentParser(description="Prepare the person's own footage for the vfrey footage-split style")
ap.add_argument("--footage", required=True, help="the footage folder (only files inside it are read)")
ap.add_argument("--scene", required=True, help="the scene folder, such as scenes/<idea>")
ap.add_argument("--duration", type=float, help="seconds of footage to make (the film's length or a little more)")
ap.add_argument("--timing", help="the scene's vfrey/timing.json: its durationSec is the length")
ap.add_argument("--slot", choices=sorted(SLOTS), default="top")
ap.add_argument("--fit", choices=["cover", "blur"], default="cover", help="cover crops to fill the slot; blur shows the whole clip over a blurred copy")
ap.add_argument("--fps", type=int, choices=[24, 25, 30, 60], default=30)
ap.add_argument("--trim", action="append", default=[], help="NAME=START-END in seconds, for one file (repeat for more)")
ap.add_argument("--order", help="comma-separated file names, in the order to use them (default: by name)")
ap.add_argument("--segment", type=float, default=0, help="use at most this many seconds of each clip per pass (0: whole clips)")
ap.add_argument("--still", type=float, default=4.0, help="seconds each photo stays on screen")
ap.add_argument("--audio", choices=["mute", "keep"], default="mute")
ap.add_argument("--max-mb", type=float, default=30)
args = ap.parse_args()


def die(message, fix):
    print(f"prep-footage: {message}\nFix: {fix}", file=sys.stderr)
    raise SystemExit(1)


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        die(f"ffmpeg failed: {p.stderr.strip().splitlines()[-1] if p.stderr.strip() else 'no message'}", "check the clip plays in a video player; leave a broken clip out with --order.")
    return p.stdout


for tool in ("ffmpeg", "ffprobe"):
    if subprocess.run([tool, "-version"], capture_output=True).returncode != 0:
        die(f"{tool} is not installed.", "install ffmpeg (it includes ffprobe), the same one vfrey renders with; `npx vfrey doctor` checks it.")

if "://" in args.footage:
    die("--footage is an address. vfrey never downloads footage.", "put the person's own clips in the project's footage/ folder and pass that folder.")
root = os.path.realpath(args.footage)
if not os.path.isdir(root):
    die(f"{args.footage} is not a folder.", "make the project's footage/ folder and put the person's own clips in it.")
scene = os.path.realpath(args.scene)
if not os.path.isdir(scene):
    die(f"{args.scene} is not a scene folder.", "start it first: npx vfrey styles start footage-split scenes/<idea>")

length = None
if args.timing:
    length = float(json.load(open(args.timing))["durationSec"])
elif args.duration:
    length = float(args.duration)
if not length or length <= 0:
    die("say how long the footage must be.", "pass --duration SECONDS (a little over the film), or --timing scenes/<idea>/vfrey/timing.json after the first render.")
length += 0.5

names = []
for base, dirs, files in os.walk(root):
    dirs[:] = [d for d in sorted(dirs) if not d.startswith(".")] if base == root else []
    for f in sorted(files):
        if f.lower().endswith(VIDEO + IMAGE) and not f.startswith("."):
            names.append(os.path.relpath(os.path.join(base, f), root))
if args.order:
    wanted = [n.strip() for n in args.order.split(",") if n.strip()]
    missing = [n for n in wanted if n not in names]
    if missing:
        die(f"not in {args.footage}: {', '.join(missing)}.", f"name files that are in the folder: {', '.join(names) or '(none)'}.")
    names = wanted
if not names:
    die(f"{args.footage} has no clips or photos (mp4, mov, m4v, webm, mkv, jpg, png, webp).", "put the person's own footage in it; vfrey never downloads footage.")

trims = {}
for t in args.trim:
    try:
        name, span = t.split("=", 1)
        a, b = (float(x) for x in span.split("-", 1))
        assert b > a >= 0
        trims[name.strip()] = (a, b)
    except Exception:
        die(f"--trim {t} is not NAME=START-END.", "write it like --trim run1.mp4=12-40 (seconds).")


def probe(path):
    out = run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path])
    data = json.loads(out)
    v = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
    a = any(s.get("codec_type") == "audio" for s in data.get("streams", []))
    if not v:
        return None
    w, h = int(v.get("width", 0)), int(v.get("height", 0))
    rot = 0
    for sd in v.get("side_data_list", []) or []:
        if "rotation" in sd:
            rot = int(float(sd["rotation"]))
    rot = rot or int(float((v.get("tags") or {}).get("rotate", 0)))
    if abs(rot) % 180 == 90:
        w, h = h, w
    num, _, den = (v.get("avg_frame_rate") or v.get("r_frame_rate") or "0/1").partition("/")
    fps = float(num) / float(den or 1) if float(den or 1) else 0
    dur = float(data.get("format", {}).get("duration") or v.get("duration") or 0)
    return {"w": w, "h": h, "fps": round(fps, 2), "dur": dur, "audio": a}


clips = []
for n in names:
    path = os.path.realpath(os.path.join(root, n))
    if not path.startswith(root + os.sep):
        die(f"{n} is outside the footage folder.", "use files inside it only (no links that point elsewhere).")
    image = n.lower().endswith(IMAGE)
    info = probe(path)
    if info is None:
        print(f"prep-footage: skipped {n}: no picture in it.", file=sys.stderr)
        continue
    a, b = 0.0, (args.still if image else info["dur"])
    if n in trims:
        a, b = trims[n][0], min(trims[n][1], b if not image else trims[n][1])
    if b - a < 0.5:
        print(f"prep-footage: skipped {n}: under half a second after trimming.", file=sys.stderr)
        continue
    clips.append({"name": n, "path": path, "image": image, "from": a, "to": b, **info})
if not clips:
    die("no usable clip is left.", "check the trims and that the files play.")

# The plan: each clip in turn (a --segment slice of it per pass), looping the list until the film is covered.
plan, at, cursor = [], 0.0, {c["name"]: c["from"] for c in clips}
guard = 0
while at < length and guard < 400:
    guard += 1
    for c in clips:
        if at >= length:
            break
        start = cursor[c["name"]]
        if start >= c["to"] - 0.25:
            start = c["from"]
        end = c["to"] if args.segment <= 0 else min(c["to"], start + args.segment)
        end = min(end, start + (length - at))
        if end - start < 0.25:
            continue
        plan.append({"name": c["name"], "from": round(start, 3), "to": round(end, 3), "at": round(at, 3)})
        cursor[c["name"]] = end
        at += end - start
by = {c["name"]: c for c in clips}

W, H = SLOTS[args.slot]
inputs, chains, achains, alabels = [], [], [], []
for i, p in enumerate(plan):
    c = by[p["name"]]
    d = p["to"] - p["from"]
    if c["image"]:
        inputs += ["-loop", "1", "-framerate", str(args.fps), "-t", f"{d:.3f}", "-i", c["path"]]
    else:
        inputs += ["-ss", f"{p['from']:.3f}", "-t", f"{d:.3f}", "-i", c["path"]]
    if args.fit == "cover":
        chains.append(f"[{i}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps={args.fps},format=yuv420p,setpts=PTS-STARTPTS[v{i}]")
    else:
        chains.append(f"[{i}:v]split[b{i}][f{i}];[b{i}]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30:2,eq=brightness=-0.12[bb{i}];"
                      f"[f{i}]scale={W}:{H}:force_original_aspect_ratio=decrease[ff{i}];[bb{i}][ff{i}]overlay=(W-w)/2:(H-h)/2,setsar=1,fps={args.fps},format=yuv420p,setpts=PTS-STARTPTS[v{i}]")
    if args.audio == "keep":
        if c["audio"] and not c["image"]:
            achains.append(f"[{i}:a]aresample=44100,aformat=sample_fmts=s16:channel_layouts=mono,apad,atrim=0:{d:.3f},asetpts=PTS-STARTPTS[a{i}]")
        else:
            achains.append(f"anullsrc=r=44100:cl=mono,atrim=0:{d:.3f},aformat=sample_fmts=s16:channel_layouts=mono[a{i}]")
        alabels.append(f"[a{i}]")
n = len(plan)
chains.append("".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[vout]")
if args.audio == "keep":
    achains.append("".join(alabels) + f"concat=n={n}:v=0:a=1[aout]")

out_dir = os.path.join(scene, "footage")
os.makedirs(out_dir, exist_ok=True)
clip = os.path.join(out_dir, "clip.webm")
# Two steps, so every piece reaches the encoder with the same size, rate and clock: each piece is cut and normalised on its own
# (near-lossless, in a temporary folder), then the joined pieces are encoded once as VP9 in WebM, which the browser that
# renders the scene (Chromium, no H.264) can seek for previews. Very busy footage (noise, confetti) can still miss the
# bitrate: then it is encoded again smaller (the scene scales it back up) until it fits the budget.
import shutil, tempfile
work = tempfile.mkdtemp(prefix="vfrey-footage-")
try:
    listing = []
    for i, p in enumerate(plan):
        c = by[p["name"]]
        d = p["to"] - p["from"]
        src = ["-loop", "1", "-framerate", str(args.fps), "-t", f"{d:.3f}", "-i", c["path"]] if c["image"] else ["-ss", f"{p['from']:.3f}", "-t", f"{d:.3f}", "-i", c["path"]]
        chain = chains[i].replace(f"[{i}:v]", "[0:v]").replace(f"[v{i}]", "[v]")
        piece = os.path.join(work, f"p{i:03d}.mp4")
        run(["ffmpeg", "-v", "error", "-y", *src, "-filter_complex", chain, "-map", "[v]", "-an", "-t", f"{d:.3f}", "-r", str(args.fps),
             "-c:v", "libx264", "-preset", "ultrafast", "-crf", "12", "-pix_fmt", "yuv420p", piece])
        listing.append(f"file '{piece}'")
    joined = os.path.join(work, "list.txt")
    open(joined, "w").write("\n".join(listing) + "\n")
    size = 0.0
    # Constant quality, stepped down until the clip fits the budget (a bitrate target banks the bits a still photo leaves
    # unused and spends them all on the next clip); last, a smaller picture the scene scales back up.
    for crf, shrink in ((32, 1.0), (38, 1.0), (44, 1.0), (44, 0.75), (48, 0.5)):
        vf = ["-vf", f"scale={int(W * shrink) // 2 * 2}:{int(H * shrink) // 2 * 2}"] if shrink != 1.0 else []
        run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", joined, *vf, "-an", "-r", str(args.fps),
             "-c:v", "libvpx-vp9", "-deadline", "good", "-cpu-used", "5", "-row-mt", "1", "-crf", str(crf), "-b:v", "0",
             "-g", str(args.fps), "-pix_fmt", "yuv420p", clip])
        size = os.path.getsize(clip) / 1024 / 1024
        if size <= args.max_mb:
            break
        print(f"prep-footage: {size:.1f} MB is over the {args.max_mb:g} MB budget (busy footage); encoding it again smaller.", file=sys.stderr)
finally:
    shutil.rmtree(work, ignore_errors=True)
audio_out = None
if args.audio == "keep":
    project = os.path.dirname(os.path.dirname(scene)) if os.path.basename(os.path.dirname(scene)) == "scenes" else os.getcwd()
    audio_out = os.path.join(project, "music", f"{os.path.basename(scene)}-footage.wav")
    os.makedirs(os.path.dirname(audio_out), exist_ok=True)
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(achains), "-map", "[aout]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", audio_out])

manifest = {
    "file": "footage/clip.webm", "slot": args.slot, "fit": args.fit, "width": W, "height": H, "fps": args.fps,
    "durationSec": round(at, 3), "segments": plan,
    "sources": [{"name": c["name"], "width": c["w"], "height": c["h"], "fps": c["fps"], "seconds": round(c["dur"], 2), "hadSound": c["audio"]} for c in clips],
    "audio": "muted" if not audio_out else os.path.relpath(audio_out, os.getcwd()),
    "rights": "The person's own footage, read from their footage folder. vfrey never downloads footage.",
}
json.dump(manifest, open(os.path.join(out_dir, "footage.json"), "w"), indent=2)
# The scene's assets.json records where the clip came from (the scene.asset-source check reads it); other entries are kept.
assets_file = os.path.join(scene, "assets.json")
try:
    assets = json.load(open(assets_file))
except Exception:
    assets = {}
items = [a for a in (assets.get("assets") or []) if isinstance(a, dict) and a.get("file") != "footage/clip.webm"]
items.append({"file": "footage/clip.webm", "source": "own file: the person's own footage from the project's footage folder (" + ", ".join(c["name"] for c in clips) + "), prepared by prep-footage.py"})
assets["assets"] = items
json.dump(assets, open(assets_file, "w"), indent=2)
print(f"wrote {os.path.relpath(clip)}: {W}x{H} at {args.fps} fps, {at:.1f} s from {len(clips)} file(s) in {n} piece(s), {size:.1f} MB")
if audio_out:
    print(f"wrote {os.path.relpath(audio_out)}: the clips' own sound, to duck under the voice (see the style's Sound section)")
if size > 45:
    print("prep-footage: the clip is over 45 MB; a scene folder is at most 50 MB. Run again with a lower --max-mb.", file=sys.stderr)
