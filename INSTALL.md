# Install

You need: [Claude Code](https://claude.com/claude-code), Node 20+, Python 3 with `numpy` (for the beat grid), and git. ffmpeg comes bundled with Remotion (`npx remotion ffmpeg`).

## 1. The two skills in this kit

```bash
cp -R skills/launch-video-playbook skills/launch-video-sound ~/.claude/skills/
```

## 2. Third-party skills (install from the source, not from this zip)

```bash
mkdir -p /tmp/skill-src && cd /tmp/skill-src
git clone --depth 1 https://github.com/remotion-dev/skills remotion-skills
git clone --depth 1 https://github.com/elevenlabs/skills elevenlabs-skills
git clone --depth 1 https://github.com/alchaincyf/huashu-art-motion huashu-art-motion
cp -R remotion-skills/skills/remotion-best-practices ~/.claude/skills/
cp -R elevenlabs-skills/music elevenlabs-skills/sound-effects elevenlabs-skills/setup-api-key ~/.claude/skills/
cp -R huashu-art-motion ~/.claude/skills/ && rm -rf ~/.claude/skills/huashu-art-motion/.git
```

Folder names inside those repos can change; if a path is missing, look for the folder holding the matching `SKILL.md`.

| Skill | What it did for the film |
|---|---|
| `remotion-best-practices` (Remotion) | The engine: project setup, compositions, fonts, rendering |
| `huashu-art-motion` (alchaincyf, MIT) | Directing rules, keynote product-UI grammar, "AI slop" colour check |
| `launch-video-playbook` (this kit) | Story spine, camera rules, critique lessons, recipes for every move |
| `launch-video-sound` (this kit) | Beat grid, turns on bars, SFX cue sheet, −14 LUFS master |
| ElevenLabs `music` / `sound-effects` | Optional: generated music, effects and voice-over (needs an API key; the free plan is non-commercial) |

The score was synthesised in code with the engine from [animation-studio](https://github.com/i-afaqrashid/claude-animation-studio) (MIT). It's included in `sound/engine/` with its licence, so nothing else needs installing: see `sound/README.md`. For a more polished sound later, swap the music for a licensed library track (Artlist, Epidemic Sound) or ElevenLabs music at the same BPM.

Optional: in the Remotion skill's `SKILL.md` frontmatter, `model: sonnet` cut its usage a lot without hurting the film.

## 3. Licences to check

- **Remotion** is free for individuals and companies of up to 3 people; bigger companies need a company licence (remotion.pro).
- Music and voices must be licensed for commercial ads.
