# Sound-effect palette for launch films

Every visible action gets one sound from this table, quieter than you think: effects punctuate, the music carries. Gains are starting points relative to a music bed sitting near −16 LUFS.

| On-screen event | Sound | Gain | Timing |
|---|---|---|---|
| Camera whip, zoom-through, fast push | Whoosh / swish | −14 dB | Lead: start 6–10 frames early so its peak lands on the fastest frame |
| Big word focus-pull (blur → sharp) | Low "whoomp", soft sub hit | −16 dB | Peak on the frame the word is sharp |
| Word-by-word reveal | Airy breath or nothing | −30 dB | Optional; skip when the music is busy |
| Typewriter text, prompt typing | Soft key ticks, pitch randomised ±2 semitones | −30 dB | One tick per 1–2 characters |
| Button press, click, toggle | Crisp UI click | −20 dB | On the press frame (scale-down), never after |
| Card or chip pops in | Soft pop / bubble | −24 dB | On the frame it reaches full size |
| Status turns "Resolved", success | Bright two-note chime | −20 dB | On the check's last stroke |
| Notification arrives | Short ping | −22 dB | On first frame visible |
| Section turn (light wash, implode) | Riser or reverse cymbal into an impact | Riser −18 dB, impact −10 dB | Riser ends exactly on the bar; impact on the bar |
| Numbers counting up | Fast soft ticks, thinning out | −28 dB | Ends with the count |
| Logo resolve | Impact plus shimmer tail | −8 dB | On the downbeat chosen for the logo; tail rings out |

## Where to get them

- **Free (CC0 / MIT):** soundcn — github.com/kapishdima/soundcn, 800+ files, mostly Kenney's CC0 packs (`assets/kenney_interface-sounds/` for clicks, toggles, pops; impact packs for hits).
- **Remotion's hosted samples:** `https://remotion.media/{whoosh,whip,mouse-click,switch,ding,page-turn}.wav`. Download into `public/audio/sfx/` before rendering, and confirm their terms for commercial use.
- **Generated (ElevenLabs `sound-effects`, model `eleven_text_to_sound_v3`, 0.5–30 s):** prompts that work for this palette:
  - "Clean modern UI whoosh, airy, short, no tail" (0.8 s)
  - "Deep cinematic sub boom with soft low rumble, single hit" (1.5 s)
  - "Rising tension riser, filtered white noise sweeping up, ends abruptly" (exact bar length)
  - "Soft glassy UI click, subtle, high quality" (0.3 s, prompt_influence 0.8)
  - "Bright pleasant two-note success chime, minimal" (0.8 s)
  - "Shimmering sparkle tail, airy, fades out" (2 s)
  - "Soft mechanical keyboard typing, single key" (0.2 s; generate 5 and rotate)
  Paid plans carry the commercial licence; the free plan requires attribution.

## Placement in Remotion

```tsx
import {Audio} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';
import {cues} from './cues';

export const Sfx = () => (
  <>
    {cues.map((c, i) => (
      <Sequence key={i} from={c.frame - (c.leadFrames ?? 0)} layout="none">
        <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={10 ** (c.gainDb / 20)} />
      </Sequence>
    ))}
  </>
);
```
