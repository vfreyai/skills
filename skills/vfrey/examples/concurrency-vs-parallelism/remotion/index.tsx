// "What's the difference?" for Remotion: the same scene as framey/index.html, written as a React component.
// vfrey provides the voice (it plays it for you), the timing (useTiming), the frame (useFrame) and the captions (<Captions/>).
// Layout is relative: u is one 1080th of the shorter side, so every number below is "N units" and the scene keeps its
// proportions at 9:16 whatever the pixel size. It is a portrait arrangement; for a wide or square frame plan a new one
// (scenes/craft.md, section 2) and branch on useFrame().orientation.
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Captions, useFrame, useTime, useTiming } from "@vfrey/scene";

const lerp = (a: number, b: number, mix: number) => a + (b - a) * mix;
const POSE = ["shrug", "point-left", "point-left", "point-right", "point-left", "point-right", "idea"];

export default function Scene() {
  const timing = useTiming();
  const t = useTime();
  const { width, vmin, safe } = useFrame();
  const u = vmin / 1080; // one unit
  // The opening (big question, shrug) lasts while the first line is spoken, then the layout settles.
  const first = timing.lines[0]!;
  const openingEnd = Math.min(3, Math.max(2.2, first.end + 0.25));
  const mix = interpolate(t, [openingEnd, openingEnd + 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // One pose per spoken line; the last line has the idea.
  let pose = "shrug";
  if (t >= openingEnd) {
    timing.lines.forEach((line, i) => {
      if (line.start <= t) pose = i === timing.lines.length - 1 ? "idea" : POSE[i] ?? "shrug";
    });
  }
  const label = (text: string, left: string) => (
    <div style={{ position: "absolute", left, top: lerp(118, 70, mix) * u, width: "50%", textAlign: "center", whiteSpace: "nowrap", lineHeight: 1, fontSize: lerp(60, 52, mix) * u }}>{text}</div>
  );
  const pic = (src: string, side: "left" | "right") => (
    <div style={{ position: "absolute", top: lerp(268, 172, mix) * u, [side]: lerp(60, 110, mix) * u, width: lerp(420, 320, mix) * u, height: lerp(500, 300, mix) * u }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  );
  const figWidth = lerp(360, 500, mix) * u;
  return (
    <AbsoluteFill style={{ background: "#fff", color: "#000", fontFamily: '"Baloo 2", "Noto Sans Arabic", "Noto Sans Bengali", "Noto Sans JP", sans-serif' }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: 700 * u, background: "linear-gradient(180deg, rgba(0,0,0,.22), rgba(0,0,0,.1) 20%, rgba(0,0,0,.03) 48%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: width / 2 - 3.5 * u, top: 70 * u, width: 7 * u, height: 400 * u, borderRadius: 4 * u, background: "#000", opacity: mix }} />
      {label("CONCURRENCY", "0%")}
      {label("PARALLELISM", "50%")}
      {pic("cook-one.svg", "left")}
      {pic("cook-two.svg", "right")}
      <div style={{ position: "absolute", left: 0, width: "100%", top: 760 * u, textAlign: "center", lineHeight: 1.05, fontSize: 104 * u, opacity: 1 - mix * 1.6 }}>
        What's the<br />difference?
      </div>
      <div style={{ position: "absolute", left: width / 2 - figWidth / 2, top: lerp(1010, 640, mix) * u, width: figWidth, height: figWidth * 1.3 }}>
        <Img src={staticFile(`vfrey/assets/stick-${pose}.svg`)} style={{ width: "100%", height: "100%" }} />
      </div>
      <Captions captionStyle="box" style={{ position: "absolute", left: safe.left, right: safe.right, bottom: safe.captionBottom, height: 250 * u }} />
    </AbsoluteFill>
  );
}
