---
name: launch-video-sound
description: Sound for launch and promo videos built in code (Remotion) — choosing or generating the music, a beat grid that puts story turns on bars, a sound-effect cue sheet, and the loudness master. Use when picking or generating music, syncing scenes to music, adding sound effects, or mixing and mastering a video's audio.
---

# Launch video sound

Sound carries half of a launch film. Measured on a studio-made reference (a ~100 BPM track): the big story turns start on musical section changes, on bar lines; the music **stops down** (drops out for about one beat) just before a turn; shots inside a section cut freely. The rule this skill enforces: **turns on bars, everything else free.**

## Steps

1. **Choose the order.** *Music-first* with a library track: lock the track, grid it, then time the storyboard to its bars. *Picture-first* when generating: fix each act's length in the storyboard, then generate to those lengths (ElevenLabs `music` skill, composition-plan chunks of 3 s or more) or score the finished silent cut with `video_to_music` (`add_sfx` and `separate_tracks` return music and effects as separate stems). Done when the project's brief names the order and the source.

2. **Source the music** from the table below, under a licence that covers commercial use in ads and on social. Done when the file is in `public/audio/` and `public/audio/CREDITS.md` names its source and licence.

3. **Grid it.** Decode and run the bundled script:
   ```bash
   npx remotion ffmpeg -i public/audio/music.mp3 -ac 1 -ar 22050 -c:a pcm_s16le /tmp/music.wav
   python3 ~/.claude/skills/launch-video-sound/scripts/beat_grid.py /tmp/music.wav --fps 30 --out src/beats.json
   ```
   It needs `numpy` (a throwaway venv works). Done when the printed BPM matches tapping along, the first downbeat sounds like "one" (confidence under ~1.0 means check by ear), and `src/beats.json` holds bars, sections and drop-outs.

4. **Time the turns.** Every act boundary, hero reveal and the logo hit starts on a bar (a listed section change is the strongest choice). One helper is the single source of musical time:
   ```ts
   import grid from './beats.json';
   export const bar = (n: number, beat = 0) =>
     Math.round(grid.bars[n].frame + beat * grid.beat_frames);
   ```
   Done when every act boundary in the timeline is a `bar(n)` call, with no frame literals.

5. **Cue the effects.** Write each on-screen event into `src/cues.ts` as `{frame, file, gainDb}` using `sfx-palette.md`, and render all effects from that one list. Done when every visible action the palette names has a cue and every cue's file exists in `public/audio/sfx/`.

6. **Mix.** Automate the music with `<Audio volume={(f) => …}>`: the stop-down before each turn (to 0 over 2 frames, one beat long, back on the downbeat with an impact), and a −10 dB duck under any voice. The film ends on a sting or hit on the logo frame, letting its tail ring out. Done when a Studio playthrough has every cue audible over the music and no clipping.

7. **Master and measure.**
   ```bash
   npx remotion ffmpeg -i out/video.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
   ```
   Target −14 LUFS integrated (±1) and true peak ≤ −1 dBTP. Out of range: run two-pass `loudnorm=I=-14:TP=-1:LRA=11` on the audio and remux with `-c:v copy`. Done when the measured numbers are in range.

## Music sources

| Source | Best for | Licence |
|---|---|---|
| Library: Artlist, Epidemic Sound, Musicbed | The hero track; what studios use | Subscription; check the plan covers ads |
| ElevenLabs `music` (composition plan) | A track cut exactly to the storyboard's act lengths | Paid plan for commercial use; free tier is non-commercial with attribution |
| ElevenLabs `video_to_music` | Scoring a finished silent cut, with effect stems | Same as above |
| Synthesised in code (`engine/` from the open-source animation-studio skill, MIT) | Free, no account, every sound exactly on its frame; how the Beemcute film was scored (see the kit's `sound/README.md`) | Yours |

When scoring in code: put every on-screen event's frame in one `EV` list copied from the scenes, write music per act (tension before the turn, lift after), give each visible action one synthesised sound from `sfx-palette.md`, mix on separate buses with effects about twice the bed, and master to −14 LUFS in the same script.

Feeds autoplay muted, so the on-screen text tells the whole story; sound is the reward for unmuting.
