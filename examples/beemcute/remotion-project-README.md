# Beemcute launch film

30-second launch video (1920×1080, 30 fps), built in code with Remotion. Picture and sound share one 120 BPM grid: 1 beat = 15 frames, 1 bar = 60 frames.

## Commands

```bash
npm i                 # once
npm run dev           # Remotion Studio: scrub and preview the film
node sound/song.js    # re-render the score → public/audio/score.wav (-14 LUFS)
npx remotion render Launch out/beemcute-launch-16x9.mp4 --crf=16 --image-format=png --pixel-format=yuv420p --color-space=bt709
npx remotion render LaunchVertical out/beemcute-launch-9x16.mp4 --crf=16 --image-format=png --pixel-format=yuv420p --color-space=bt709
```

Keep the render flags: with the default JPEG frames the file comes out full-range `yuvj420p`, which some platforms show washed out. Each full render takes about 6–7 minutes on this machine; add `--scale=0.5` for a quick preview.

Both formats come from the same scenes: `src/layout.ts` tells each scene whether it is portrait, and the vertical layouts keep key content clear of Reels/TikTok buttons (x 90–990, y 220–1600). Fonts are bundled in `public/fonts`, so renders work offline.

## Where things live

| Path | What |
|---|---|
| `src/timeline.ts` | Scene start frames, the stop-down and the logo hit |
| `src/scenes/` | One file per scene: Opening (problem + turn), Chat, Route, Dashboard, Payoff, Close |
| `src/components/` | Background, text reveals, the traced pixel-B mark and lockup, product UI pieces. `c2.tsx` is the Concept 2 kit (the app dashboard's design: frames, tick meters, chips); all Beemcute UI in the film is built from it |
| `sound/song.js` | The score: music and every effect, timed to the same frames as the picture |
| `sound/engine/` | Synth engine vendored from the animation-studio skill |
| `public/brand/` | Wordmark and tagline cropped from `public/brand-logo-white.png` |

Changing a scene's timing means changing the matching frame in `sound/song.js` (`EV`) too.

The logo is the signature move: notification cards land on the pixel-B's blocks at frame 180, and resolved tickets land on them again at frame 780, exactly where `Close` draws its mark (`BLOCKS` in `src/components/Mark.tsx`). Move the end lockup and the landing spots in `Payoff` must move with it.

## Music

`public/audio/score.wav` is an original score generated in code, so it is yours to use. For a fuller produced sound, swap in a licensed or ElevenLabs track at 120 BPM: act changes land on bars (frames 180, 780), so the cut already fits.
