# How the sound was made

The film's music and every sound effect are **code**: one JavaScript file (`beemcute-score.example.js`) synthesises the whole soundtrack, sample by sample, and writes a mastered WAV. No samples, no DAW, no stock music. Because the score uses the same frame numbers as the scenes, every ping, whoosh and hit lands exactly on its visual.

## 1. Research (before writing any sound)

- **Measured the reference film's audio**: about 100 BPM, one track throughout. The big story turns start on musical section changes, on bar lines. The music **drops out for about one beat** just before each turn. There are risers building into sections and shimmer hits on reveals. Individual shot cuts were *not* beat-locked; only the act turns were. That became the rule: **turns on bars, everything else free.**
- **Searched for sound skills and sources**: ElevenLabs' official agent skills (`music`, `sound-effects`), royalty-free SFX libraries (Kenney CC0 packs through soundcn, Remotion's hosted samples), and licensing for library music (Artlist, Epidemic Sound), ElevenLabs music (the free plan is non-commercial) and Remotion.
- **Wrote the `launch-video-sound` skill** from that research (in `skills/`): music-source table, beat-grid script, SFX palette with gains and timing, mix rules, and a −14 LUFS mastering target.
- **Picked the engine**: no licensed track was available, so the score was synthesised with the engine from the open-source [animation-studio](https://github.com/i-afaqrashid/claude-animation-studio) skill (MIT, by Afaq Rashid), vendored here in `engine/` with its licence.

## 2. How the score is built

1. **One grid.** 30 fps and 120 BPM, so 1 beat = 15 frames and 1 bar = 60 frames. Act changes sit on bars (the logo hits at frames 180 and 780).
2. **An event list (`EV`)** copies every on-screen moment's frame number from the scenes: each notification, keystroke, tap, card landing, cut and logo hit. Retime a scene, retime `EV`.
3. **Music that follows the story.** A minor (tension) in the problem, lifting to C major after the turn. Nervous 16th-note hats with no kick during the chaos, a half-time beat on the turn, four-on-the-floor with claps through the product, pluck arpeggios, and supersaw stabs on the three payoff lines.
4. **Sound design for each action.** The pings climb in pitch as the stress builds, with phone buzzes in between. A riser goes into a **one-beat silence** before the turn. Each card snapping into the logo gets a wood tick climbing in pitch. Keystrokes are timed from the same random seed as the typing animation. There's a two-note chime on success, an "uh-oh" bell when a card goes overdue, a sub boom and crash on the logo, and an air swish that carries each scene into the next.
5. **Mix.** Separate buses (drums, bass, pad, keys, lead, fx, ui) with sidechain pump on the kick, reverb and ping-pong delay sends. **Effects sit about twice as loud as the music bed**: the first critique couldn't hear them.
6. **Master** to −14 LUFS integrated (the target for social), checked with ffmpeg's `ebur128` filter.

## 3. Use it

```bash
cp -R engine score.template.js  <your-remotion-project>/sound/
cd <your-remotion-project>
node sound/score.template.js        # → public/audio/score.wav, about 15 s to render
```

In Remotion: `<Audio src={staticFile('audio/score.wav')} />` at the root of the composition. Then edit `EV` to match your scenes' frames, and change the chords, drums and sounds to taste. Or ask Claude: *"Write the score for this film in code with the engine in sound/engine, timed to every event in the scenes, following the launch-video-sound skill."*

| File | What |
|---|---|
| `engine/` | The synth engine: `dsp.js` (oscillators, filters, reverb), `instruments.js` (kick, hats, bass, pads, plucks, bells, pings, whooshes, sub booms…), `mix.js` (sidechain, gates, master, LUFS, WAV), `music.js` (beat clock, note names) |
| `score.template.js` | A runnable 30 s starter with the same structure as the real score |
| `beemcute-score.example.js` | The actual Beemcute launch score (needs the Remotion project because it imports `random` from `remotion`) |
| `beemcute-ad10.example.js` | The 10 s social ad's score |

To upgrade later: keep the sound-effect layer from code, and swap the music for a licensed or ElevenLabs track at the same BPM. The act changes already sit on bars, so the cut still fits.
