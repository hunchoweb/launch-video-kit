# Launch Video Kit

How the Beemcute 30-second launch film was made with Claude Code, packaged so you can make your own.

## The short version

The whole film is **code**: a [Remotion](https://www.remotion.dev) (React) project, written by Claude Code from a reference video and the product's own repo. No After Effects, no editing timeline. The music and every sound effect sit on the same 120 BPM grid as the picture, so the big moments land on the beat.

## The process

1. **Reference teardown.** Claude extracted frames from a studio-made launch film I liked, measured the shot lengths, BPM and where cuts hit the bars, and wrote down what to take, what to translate to my brand, and what to leave alone.
2. **Research + skills.** Claude searched for how these films are made and for published skills, vetted and installed them, and wrote two new ones (the playbook and the sound skill in this kit).
3. **Story.** Problem (chaos) → signature move (the chaos assembles into the logo) → three product features following one real ticket → payoff → logo + CTA.
4. **Build.** Product screens rebuilt in React from the app's real UI code, so they stay sharp when the camera pushes in. One set of scenes renders both 16:9 and 9:16.
5. **Sound, also in code.** Claude measured the reference's audio (tempo, drop-outs before each turn, risers), researched sound skills and licensing, and wrote the sound skill. Then it wrote a script that synthesises the whole score and every effect, timed to the same frames as the picture and mastered to −14 LUFS. Full story in `sound/README.md`.
6. **Critique loop.** Three rounds of outside critique (7 → 8 → 8.5/10), each checked by Claude before fixing. The lessons are written into the playbook so you start ahead.

## What's in here

| Path | What |
|---|---|
| `KICKSTART.md` | The one prompt to start your own film |
| `PROMPTS.md` | The prompts I used, in order, as fill-in templates, plus the critique prompt |
| `INSTALL.md` | Install commands for every skill and the licences to check |
| `skills/launch-video-playbook/` | Generic playbook: steps, story spine, camera, principles, lessons, review checklist; `moves.md` has Remotion code for each move |
| `skills/launch-video-sound/` | Music sourcing, beat-grid script, SFX palette, mixing and mastering |
| `sound/` | How the sound was made, the synth engine (MIT), a runnable starter score, and the real Beemcute scores |
| `examples/beemcute/` | My actual project skill, reference teardown and Remotion project README, as a worked example |

## Start

Open **[KICKSTART.md](KICKSTART.md)**, fill in four blanks, and paste it into Claude Code in your product's repo along with a reference video. Claude installs the kit itself.

Expect a few hours of back-and-forth and several renders, not one prompt.
