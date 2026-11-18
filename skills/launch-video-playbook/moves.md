# Moves

Each move the film uses, with the Remotion code that makes it. Times are frames at 30 fps. Engine details (install commands, `<Sequence>`, transitions, fonts) live in `remotion-best-practices`; this file is the Beemcute look.

```tsx
// src/motion.ts — shared by every scene
import {Easing, interpolate} from 'remotion';
export const OUT = Easing.bezier(0.23, 1, 0.32, 1);   // entrances (Concept 3 ease-out)
export const CAM = Easing.bezier(0.77, 0, 0.175, 1);  // camera and big moves (Concept 3 ease-in-out)
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ramp = (f: number, start: number, len: number, easing = OUT) =>
  interpolate(f, [start, start + len], [0, 1], {...clamp, easing});
```

Fonts: `loadFont()` from `@remotion/google-fonts/Geist` and `@remotion/google-fonts/DMMono`; if the installed version lacks either, load the files with `@remotion/fonts`. Formats: read `width`/`height` from `useVideoConfig()`, set `portrait = height > width`, and scale type by `Math.min(width, height) / 1080`.

## 1. Ground: drifting light, grain, vignette

```tsx
export const Ground = () => {
  const frame = useCurrentFrame();
  const t = frame / useVideoConfig().fps;
  const a = `${32 + 8 * Math.sin(t * 0.35)}% ${22 + 6 * Math.cos(t * 0.28)}%`;
  const b = `${74 + 7 * Math.cos(t * 0.31)}% ${72 + 5 * Math.sin(t * 0.42)}%`;
  return (
    <AbsoluteFill style={{background: `radial-gradient(55% 50% at ${a}, rgba(219,231,255,.10), transparent 70%),
      radial-gradient(45% 40% at ${b}, rgba(140,194,255,.07), transparent 70%), linear-gradient(180deg, #0b1838, #08112a)`}}>
      <svg width="100%" height="100%" style={{position: 'absolute', opacity: 0.07, mixBlendMode: 'overlay'}}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(80% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.55))'}} />
    </AbsoluteFill>
  );
};
```
One `Ground` per composition (the filter id is global). Add the contour-line motif as a layer above the gradients at 10–16% opacity.

## 2. Word blur-in

```tsx
export const Words = ({text, at, stagger = 3, style}: {text: string; at: number; stagger?: number; style?: React.CSSProperties}) => {
  const frame = useCurrentFrame();
  return (
    <div style={style}>
      {text.split(' ').map((w, i) => {
        const p = ramp(frame, at + i * stagger, 16);
        return <span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: p,
          filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 0.35}em)`}}>{w}</span>;
      })}
    </div>
  );
};
```

## 3. Typewriter with caret

```tsx
export const Typed = ({text, at, cps = 22}: {text: string; at: number; cps?: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - at) / fps) * cps)));
  const caretOn = (n > 0 && n < text.length) || Math.floor((frame - at) / 15) % 2 === 0;
  return (
    <span>
      {text.slice(0, n)}
      <span style={{display: 'inline-block', width: '0.06em', height: '1em', marginLeft: '0.04em',
        verticalAlign: '-0.12em', background: 'currentColor', opacity: caretOn ? 1 : 0}} />
    </span>
  );
};
```
The caret stays solid while typing and blinks while waiting. Typing-tick cues: one every two characters, at `at + (2k / cps) * fps`.

## 4. Focus-pull statement

A giant word sharpens out of heavy blur; two-tone statements put the accent phrase in `#8cc2ff` (solid colour, not a gradient fill).

```tsx
const p = ramp(frame, at, 22);
<div style={{fontSize: 260, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 0.95, color: '#fff', opacity: p,
  filter: `blur(${(1 - p) * 30}px)`, transform: `scale(${1.1 - 0.1 * p})`}}>Requests</div>
// two-tone: <span style={{color: '#fff'}}>Every request.</span> <span style={{color: '#8cc2ff'}}>One platform.</span>
```

## 5. Depth stage: floating UI, camera dolly, depth of field

```tsx
type Layer = {x: number; y: number; z: number; rot?: number; node: React.ReactNode};
export const DepthStage = ({layers, camZ, focusZ = 0}: {layers: Layer[]; camZ: number; focusZ?: number}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{perspective: 1400}}>
      {layers.map((l, i) => {
        const z = l.z + camZ;
        return (
          <div key={i} style={{position: 'absolute', left: '50%', top: '50%',
            transform: `translate(-50%, -50%) translate3d(${l.x}px, ${l.y + 6 * Math.sin(frame / 40 + i)}px, ${z}px) rotateY(${l.rot ?? 0}deg)`,
            filter: `blur(${Math.min(18, Math.abs(z - focusZ) / 45)}px)`, opacity: z > 1200 ? 0 : 1}}>
            {l.node}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
// camZ = interpolate(frame, [0, 120], [0, 700], {...clamp, easing: CAM}) flies the camera forward through the layers.
```
Deterministic scatter for the Problem act: `x = (random(`x${i}`) - 0.5) * 1800`, `z = -random(`z${i}`) * 1600`. Keep blurred layers under about 20 per frame; blur is the slowest thing to render.

## 6. Camera on a screen: push-in, hold-drift, pull-back

The screen is laid out at 1920×1080 "screen pixels"; keyframes give the point to centre (`cx`, `cy`) and the zoom `s`.

```tsx
const keys = [{f: 0, cx: 960, cy: 540, s: 1}, {f: 40, cx: 520, cy: 300, s: 2.2}, {f: 90, cx: 520, cy: 300, s: 2.35}, {f: 120, cx: 960, cy: 540, s: 1}];
const k = (prop: 'cx' | 'cy' | 's') => interpolate(frame, keys.map((q) => q.f), keys.map((q) => q[prop]), {...clamp, easing: CAM});
<div style={{position: 'absolute', transformOrigin: '0 0',
  transform: `translate(${width / 2}px, ${height / 2}px) scale(${k('s')}) translate(${-k('cx')}px, ${-k('cy')}px)`}}>
  <DashboardScreen />
</div>
```
The 40–90 segment is the hold: zoom keeps creeping so the frame never freezes. Wrap only the fast segments in `<HtmlInCanvasMotionBlur samples={10} shutterAngle={180}>` (see `remotion-best-practices` → motion-blur).

## 7. Glow button press with ripple

```tsx
const scale = interpolate(frame, [press - 4, press, press + 10], [1, 0.94, 1], {...clamp, easing: OUT});
const ring = ramp(frame, press, 26);
const pulse = 0.5 + 0.5 * Math.sin(frame / 9);
<div style={{transform: `scale(${scale})`, padding: '26px 54px', borderRadius: 22, background: '#2563eb', color: '#fff',
  fontSize: 56, fontWeight: 600, boxShadow: `0 0 ${60 + 30 * pulse}px rgba(37,99,235,.65), inset 0 1px 0 rgba(255,255,255,.25)`}}>Assign</div>
<div style={{position: 'absolute', inset: -40, borderRadius: 40, border: '2px solid #8cc2ff',
  opacity: frame < press ? 0 : (1 - ring) * 0.8, transform: `scale(${0.7 + ring})`}} />
```
The click cue sits on `press`, the frame of the squash.

## 8. Chat bubble becomes a ticket

A WhatsApp-style bubble types its message (`Typed`), then its box interpolates `width`, `height`, `borderRadius` and `background` over 18 frames with `CAM` into a ticket card while the fields (Owner, Priority, Due) arrive with `Words`, stagger 4. Animating layout properties is safe here: every frame renders on its own.

## 9. Routing flight

The ticket travels a curve to the right person's avatar: `t = ramp(frame, at, 24, CAM)`, position `(1-t)²·A + 2(1-t)t·C + t²·B` with control point `C` above the straight line; motion blur on the flight; on landing an "Assigned · IT · Sarah M." chip pops with `spring({frame: frame - land, fps, config: {damping: 18, stiffness: 160}})`.

## 10. Numbers and status

```tsx
const v = interpolate(frame, [at, at + 36], [0, 1284], {...clamp, easing: OUT});
<span style={{fontVariantNumeric: 'tabular-nums'}}>{Math.round(v).toLocaleString('en-US')}</span>
// status chip: background interpolateColors(frame, [at, at + 8], ['#fef3c7', '#dcfce7']); text swaps at at + 4
// check mark draws: strokeDasharray={30} strokeDashoffset={30 * (1 - ramp(frame, at, 14))}
```
Numbers on screen are the dashboard's demo figures; label them as an example workspace, never as customer results.

## 11. Implode: chaos becomes one point

Each Problem fragment `i` collapses from its scattered `{x, y, z, r}`: `p = ramp(frame, at + i * 1.5, 20, CAM)`, transform `translate3d(x(1-p), y(1-p), z(1-p)) rotate(r(1-p)) scale(1 - 0.8p)`, blur `10p`. At the collapse frame a 6-frame centre flash of `#8cc2ff`, then the workspace scales 0.92 → 1 under the "One place for every request." line. The stop-down sits on the beat before; the impact lands on the collapse.

## 12. Light-wash transition

`lightLeak()` from `@remotion/effects` in a `<TransitionSeries.Overlay>` (see `remotion-best-practices` → light-leaks) with `hueShift` toward blue, or by hand:
```tsx
const w = interpolate(frame, [cut - 8, cut, cut + 10], [0, 0.9, 0], clamp);
<AbsoluteFill style={{background: 'radial-gradient(70% 70% at 50% 50%, #8cc2ff, #2563eb 60%, #0b1838)', opacity: w, mixBlendMode: 'screen'}} />
```
Once per film, before the payoff or the close.

## 13. Logo resolve

Trace the pixel-B mark into SVG rectangles and polygons (or use the designer's vector). Each block springs in from an offset, `spring({frame: frame - at - i * 3, fps, config: {damping: 16, stiffness: 140}})`, the last block landing on the logo downbeat. The wordmark (`brand-logo-white.png`) wipes in with `clipPath: inset(0 ${(1 - p) * 100}% 0 0)`, `p = ramp(frame, at + 12, 18)`; tagline with `Words`; the URL arrives last and holds at least 1.5 s.

## 14. Scripted cursor (optional)

Keyframed `x`/`y` with `CAM`, a 4-frame squash to 0.85 and a ripple (as in 7) on each click frame. For a full browser-chrome stage and cursor, digitalsamba/claude-code-video-toolkit's `synthetic-ui-demo` skill and `lib/components` (MIT) are a worked implementation.
