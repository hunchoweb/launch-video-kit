---
name: launch-video-playbook
description: Product launch-video playbook — brief, reference teardown, story spine, styleframes, beat grid, Remotion build, critique loop and export for a 30 s motion film. Use when planning, scripting, storyboarding, building, reviewing or exporting a launch, promo or product video in code.
---

# Launch video playbook

The film: about 30 seconds that leave a stranger knowing what the product does and wanting to visit the site. Built in code with Remotion, so every frame, number and sound is exact and re-renderable.

Companion skills: `remotion-best-practices` (engine), `launch-video-sound` (music, effects, mix), `huashu-art-motion` (directing rules; `references/动画语法/t2_keynote_ui.md` is the keynote product-UI grammar). Copy-paste recipes for every move are in [`moves.md`](moves.md) (written for the first film, a dark-navy SaaS look; swap the colours and fonts for your brand).

## Steps

1. **Research first.** Before building, search the web for how this kind of film is made (articles, breakdowns) and for published skills; vet any skill before installing (read SKILL.md, scripts, licence). Report what you found, what you kept and why, and what you still need from the user.
2. **Tear down the reference.** If the user gives a reference video, extract frames (one every ~1.5 s into contact-sheet grids), measure shot lengths, BPM, where cuts land on bars, drop-outs and effects. Write `reference-teardown.md` with a **Take / Translate / Leave** section: take the grammar, translate the palette and motifs to the brand, leave its copy, imagery and logo.
3. **Brief.** Settle length, formats (16:9 master + 9:16), voice-over or text-only, music source, call to action, project location. Record it in `brief.md`.
4. **Script** one row per shot: time, on-screen words (six or fewer per line), visual, move, sound cue. Every claim and number must trace to a real source (docs, landing page); confirm a feature has shipped before it appears.
5. **Styleframes.** Render four or five key shots as stills (`npx remotion still`) and get approval before animating.
6. **Grid.** `launch-video-sound` steps 1–4: every act boundary lands on a bar.
7. **Build** one file per act. Rebuild product screens as React from the app's own components and tokens (crisp under camera zoom) instead of screenshots. Lay out from `useVideoConfig()` so the same scenes render 16:9 and 9:16.
8. **Review** with a contact sheet (one frame per 0.5 s) against the checklist below and the reference frames.
9. **Sound**: `launch-video-sound` steps 5–7.
10. **Critique loop.** Hand the render to an outside reviewer (a person or another AI, see `PROMPTS.md`), then ask Claude to verify each point before fixing it. Record lessons in this skill so they stick.
11. **Export** H.264 + AAC, yuv420p, 30 fps: 1920×1080 and 1080×1920.

## Story spine (30 s, 120 BPM: bar = 2 s = 60 frames)

Open on a concrete scene, never a title card.

| Time | Act | Picture |
|---|---|---|
| 0–6 s | Problem | The pain, overwhelming by 1 s (e.g. notifications piling up on 16th notes); two short lines ("X everywhere." / "Y nowhere.") |
| 6 s | Signature | The chaos *becomes the logo* on the bar hit: show empty target slots, then pieces fly in one per slot and snap |
| 9–21 s | Product | Three features, one real thread running through them (one ticket, one order, one user), camera-directed |
| 21–26 s | Payoff | Resolved state; a three-part line landing one phrase per beat; a beat of darkness |
| 26–30 s | Close | Logo lockup (repeat the signature move), offer line, CTA URL; a pointer clicks beside the URL and clears |

## Brand rules that worked

- Dark ground with low-saturation light; saturated brand colour only on the focal object. Product UI stays light: light UI on a dark field is the look.
- Avoid purple/violet, full-frame brand gradients and neon glow: they read as AI-template output.
- Use at most two "template" tricks (gradient ground, glass cards, gradient text, centred blur-in, decorative floating). When UI is the subject it fills 80%+ of frame width.
- One display font plus one mono for labels, bundled locally in `public/fonts`.
- Easing: entrances `cubic-bezier(0.23, 1, 0.32, 1)`, camera `cubic-bezier(0.77, 0, 0.175, 1)`.

## Camera

| Move | Use | Duration |
|---|---|---|
| Hold | Reading, UI animating on its own | as long as the read |
| Slow push | Lead the eye to a detail (10–40%) | 0.6–1.5 s, ease-in-out |
| Pull-back | Reveal the whole | 0.8–2 s |
| Glide | Between items on one surface | 0.5–0.9 s |
| Snap push | Accent: the key number | 0.25–0.35 s, 18–32% |
| Slam | A word landing | 0.17 s, scale 1.55 → 0.94 → 1 |

Never three pushes in a row; accents on a third of shots at most.

## Principles pass (Lasseter, SIGGRAPH 1987)

Anticipation before big moves · arcs for anything that travels · squash/stretch only on soft things (cards stay rigid) · big things move later and longer · follow-through: landings settle, parts arrive a beat apart, no scene stops dead before a cut · secondary action stays subordinate · exaggerate the essence · no mirrored twins · one idea at a time.

## Lessons from three rounds of outside critique (7 → 8 → 8.5+/10)

- Hits land on the frame or 1–2 frames before, never after.
- The first second must already feel like the problem.
- Blur-in for at most two hero lines; feature titles rise out of a mask; payoff lines slam on beats.
- Establish wide, then push in; counters only run where they can be read.
- The highlighted number must agree with the line ("running late" → red, rising). Never put two equal numbers side by side; speed metrics show a small number falling.
- Sound effects sit forward of the music (about twice the bed) or nobody hears them.
- A transformation must read at normal speed: target first, one piece per slot, in sequence, big enough, each with a snap.
- The hero object stays the largest thing in frame; exits leave fully (no slivers at the edge).
- A pointer never rests on key text.
- One accent rule across formats. In 9:16, headlines start ~320 px down and key content stays inside x 90–990, y 220–1600.
- Dim background cards by darkening and keep them sharp; a light blur reads as a low-res export.
- Product UI needs more contrast on video than in the app: darker labels, heavier numbers.
- One box per idea: no card inside a card inside a card.
- On a hit frame the incoming element is fully visible on its first frame.

## Render gotchas

- `--image-format=png --pixel-format=yuv420p --color-space=bt709`, or the default JPEG frames give washed-out full-range `yuvj420p`.
- Load fonts from local files; fetching Google Fonts at render time can time out.
- `interpolate()` input ranges must be strictly increasing.
- Preview with `--scale=0.5`; keep the score's event frames in sync with scene timings.

## Review checklist

- Every shot has an event; shots 0.5–4 s, averaging ~2 s; each line up at least words ÷ 3 + 0.5 s.
- Text ≥ 28 px at 1080p, statements ≤ 2 lines.
- One focal point per shot; colours only from the brand list.
- Every claim traces to a source; act boundaries and the logo hit on bars.
- 9:16 is a real relayout, nothing cropped. Loudness −14 LUFS, true peak ≤ −1 dBTP.
