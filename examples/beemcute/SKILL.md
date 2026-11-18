---
name: beemcute-launch-video
description: Beemcute launch-video playbook — story, brand, the style reference teardown, and the Remotion recipe for every move. Use when planning, scripting, storyboarding, building, reviewing or exporting any Beemcute launch, promo or product video.
---

# Beemcute launch video

The film: 30 seconds that leave a stranger knowing what Beemcute is (every business request in one tracked workspace) and wanting beemcute.com. The style is the user's reference, a studio-made AI launch film, torn down in [`reference-teardown.md`](reference-teardown.md): dark cinematic ground, luminous gradients, product UI floating in depth, kinetic type, music-driven pacing. Build Beemcute's own film in that language: our story, our screens, our palette and fonts, with nothing lifted from the reference's copy, imagery or logo.

Companion skills: `remotion-best-practices` (engine), `launch-video-sound` (music, effects, mix), `huashu-art-motion` (directing rules; its `references/动画语法/t2_keynote_ui.md` is the keynote product-UI grammar), `motion-react`/`animate` (easing judgement).

## Steps

1. **Brief.** Settle with the user: length, formats (16:9 master, 9:16 cut-down), voice-over or text-only, music source, call to action, where the Remotion project lives. Done when every item has an answer in the project's `brief.md`.
2. **Script.** Fill the story spine below, one row per shot: time, on-screen words (six or fewer per line), visual, move from [`moves.md`](moves.md), sound cue. Every claim and number traces to `<repo>/Beemcute_AI_Agent_Knowledge_Base.md` or the live landing page; confirm with the user that a feature has shipped before it appears (WhatsApp intake especially). Done when every shot row is complete and every claim has its source noted.
3. **Styleframes.** Build four or five key shots as stills (`npx remotion still`) and show them to the user before animating: this user approves direction from visuals. Done when the user approves the stills.
4. **Grid.** `launch-video-sound` steps 1–4, so every act boundary is a bar.
5. **Build** one file per act. Product screens are rebuilt as static React from the repo's own components and tokens, so they stay crisp under camera zoom; the 2× PNG exports serve wide shots only. Lay out from `useVideoConfig()` so the same scenes render 16:9 and 9:16. Done when the full timeline plays in Studio with every shot from the script.
6. **Review** against the checklist below, comparing a contact sheet of your render (one frame per 0.5 s) with `reference-frames/`. Done when every checklist item passes.
7. **Sound**: `launch-video-sound` steps 5–7.
8. **Export** H.264 + AAC, yuv420p, 30 fps: 1920×1080 and 1080×1920.

## Project

The film lives in `<repo>/launch-video/` (its README has the commands and file map; the root `tsconfig.json` excludes it so the Next build ignores it). Gotchas that cost a render each:

- Render with `--image-format=png --pixel-format=yuv420p --color-space=bt709`: the default JPEG frames produce full-range `yuvj420p`.
- Fonts load from `public/fonts` (`@remotion/fonts`): fetching Google Fonts at render time timed out once and killed a render.
- Two compositions share one component: `Launch` (1920×1080) and `LaunchVertical` (1080×1920). Scenes branch on `useLayout().portrait` (`src/layout.ts`); vertical keeps key content inside x 90–990, y 220–1600 (Reels/TikTok chrome), stacks statements onto two lines, and lets a camera push move the caption with the product so they never collide.
- `interpolate()` input ranges must be strictly increasing; overlapping keyframe groups throw at render time.
- The score is `sound/song.js` (animation-studio synth engine, vendored); its `EV` frames mirror the scene constants, so retiming a scene means retiming `EV`.
- Review by contact sheet after every half-scale render (`--scale=0.5`, about 80 s for the full film on this machine).

## Story spine (30 s = 900 frames at 30 fps, 120 BPM grid: bar = 2 s = 60 frames)

The film opens on a concrete scene, never a title card. Acts start on bars, so any 120 BPM track lines up.

| Time | Act | Picture | On-screen words |
|---|---|---|---|
| 0–6 s | Problem | Nine pings pile up on 16th notes with phone buzzes (overwhelming by 1 s), burst into a cloud as the camera pulls back; the cloud inhales in the stop-down | "Requests everywhere." (blur, by 1.3 s) → "Answers nowhere." (slam, 3.0 s) |
| 6 s | Signature | A big B's 16 slots appear as outlines; the nearest cards fly in **one per block**, top to bottom on a quickening run, each snapping with overshoot and a tick; the exact B locks on the frame-180 hit with a flash of its own shape (no radial glow) | "One place for every request." |
| 9–21 s | Product | Chat: push in on "Yes, create", tap ripple, `TCK-01042` confirmed · Route: the ticket rides the line at near full size from Funmi's WhatsApp message and lands on Tunde's card, which stepped forward to meet it; the assignee flips to Tunde and "WhatsApp alert sent" pops in its row · Dashboard: wide, push into Overdue, it flips red (+1) | Feature titles rise out of a mask (no blur); accent phrase in blue in every format |
| 21–26 s | Payoff | Resolved burst; the panel morphs into a grid of the opening's requests; three lines slam on beats; darkness; **the 15 resolved tickets build the same big B, one per block, locking on the frame-780 hit** | "Every request. One platform. Complete visibility." |
| 26–30 s | Close | The locked B glides into the lockup as the wordmark wipes in; offer; CTA; a pointer clicks the arrow and clears off | "Free for teams of 1–3 · unlimited tickets" · "Start free at beemcute.com" |

The B is the story: many requests become one mark at the turn, resolved work becomes it again at the end. The kit is `src/components/Assemble.tsx` (`bigB`, `GhostB`, `flight`, `Block`, `LockB`, `landAt`); `BLOCKS` in `Mark.tsx` holds the landing rects; the score's landing ticks mirror `landAt`.

WhatsApp intake is live: the assistant shows a draft (title, department, priority), the requester confirms, and the task is created as `TCK-#####` (`lib/channel-task-intake.ts`). The assistant's wording is generated, so write it in that shape rather than quoting a fixed string.

## Brand

- **Ground** near-black navy, ink `#08112a` → night `#0b1838`, lit by soft low-saturation ice light (`#dbe7ff` at low alpha). Saturated brand `#2563eb` and accent `#8cc2ff` go only on the focal object (a button, a check, an assignment). Product UI stays light: light UI glowing on a dark field is the look.
- **Product UI is Concept 2**, the app's dashboard design (`components/concepts/concept-two.css`, `concept-two-charts.tsx`, `Beemcute Concept 2 Dashboard Updated.png`). Every Beemcute surface in the film is built from the kit in `src/components/c2.tsx` (tokens `K`, `Frame`, `Ticks`, `Meter`, `Chip`, `hatched`): a grey frame with a heading row around a white inner card, titles and numbers at weight 500, neutral rounded-square avatars, dot chips for status and priority, tick meters, hatched bars. New UI starts from `Frame`, never a bespoke card. Third-party chrome (the WhatsApp window, OS notifications) keeps its own look.
- **Never** purple or violet hues, full-frame blue gradients, or neon glow: on a blue brand that reads as AI-template slop (huashu-art-motion's rule; its gate rejects films with more than 30% blue-purple ground frames).
- **Packaging budget** the template kit is gradient ground, glass cards, gradient text, centred blur-in text, decorative floating; use at most two (ours: the soft ground and word blur-in). Product shots carry the film: when UI is the subject it fills 80% or more of the frame width.
- **Type** Geist for everything, DM Mono for labels, code and timestamps, loaded from `public/fonts`. Concept 2's SF Pro is not bundled: UI text uses Geist at weight 400–450 in its place. Display tracking −0.04em; statements in solid white with one accent phrase in `#8cc2ff`.
- **Easing** entrances `cubic-bezier(0.23, 1, 0.32, 1)`, camera `cubic-bezier(0.77, 0, 0.175, 1)` (Concept 3 tokens in `components/site/concept-three/concept-three.css`).
- **Motif** the Concept 3 3D contour lines (`components/site/concept-three/contour-engine.ts`) as the ground texture, where the reference used grid lines.
- **Logo** `public/brand-logo-white.png`, `public/brand-mark-white.png`; the wordmark always comes from these files. The mark exists only as PNG: animating it block by block needs a traced SVG (simple rectangles and polygons) or the designer's vector. Tagline "built for better teamwork".
- **Assets** `ppt-assets/02-coded-visuals/` (2× UI exports: hero dashboard, scattered vs unified, workflow steps, features), `public/images/screen-*.png`, `hero-captures/*.mp4`.
- **Voice** plain and confident, rooted in Nigerian workplaces (a Lekki site team, a finance group chat, ₦ pricing).

## Camera

Every camera move answers: where should the eye be, is it readable at this size, is this a transition or an accent? Readable means hold: the camera rests while people read or while the UI itself animates.

| Move | Use | Duration |
|---|---|---|
| Hold | Reading, UI animating on its own | as long as the read |
| Slow push | Lead the eye to a detail until it is readable (10–40%) | 0.6–1.5 s, ease-in-out |
| Pull-back | Reveal the whole, close a section | 0.8–2 s, fast start, long settle |
| Glide | Move between items on the same surface | 0.5–0.9 s |
| Snap push | Accent: a reveal, the key number | 0.25–0.35 s, 18–32% |
| Slam | A word or number landing | 0.17 s, scale 1.55 → 0.94 → 1 |

Pushes come back out: never three pushes in a row; accents (snap, slam, whip) on a third of shots at most; a uniform slow push on every shot reads as a slideshow.

## Principles pass (Lasseter, SIGGRAPH 1987)

Run it on every review; the helpers live in `src/motion.ts` (`arc`, `stretch`, `settle`) and `src/components/Shell.tsx`.

- **Anticipation** before every big move: an inhale before an implode, a wind-up before a flight, a lift before a shrink, a small push before a pull-back. The faster the action, the bigger the preparation.
- **Arcs** for anything that travels; the path is its own curve, timed separately, so fast moves stay curved. Things that travel rotate a little.
- **Squash and stretch** only on soft things (avatars, pointers), volume preserved (`stretch`); product panels and cards stay rigid.
- **Timing** shows weight: near or big elements start later and move longer; small far ones go first.
- **Follow-through and overlap**: landings settle (`settle`), parts arrive a beat apart (badge after card, name after avatar), and no scene stops dead before a cut — `Shell` carries the motion through it.
- **Secondary action** stays subordinate: jostles, ripples, counters, a dip under a landing.
- **Exaggeration** goes to the essence of the moment ("resolved" shines), balanced across picture and sound.
- **Appeal**: no twins — break mirrored staggers with seeded wobble, and give the last beat of a repeated pattern its own weight.
- **Staging**: one idea at a time — a caption lands before the UI starts doing something worth reading.

## Lessons from the first outside review (scored 7/10)

- Hits land on the frame, or one or two before it, never after: a motion that *starts* on the hit reads mushy.
- The first second must already feel like the problem; a polite drip of UI is not a hook.
- Blur-in is for at most two hero lines; feature titles rise out of a mask; payoff lines slam on beats.
- Establish wide, then push in: a scene never opens on a crop, and counters only run where they can be read and never read zero.
- The highlighted number must agree with the line ("running late" → red, rising).
- Sound effects sit forward of the music (UI and FX buses about twice the bed) or nobody hears them.
- End cards drop the logo's tagline; the offer line carries the end.

## Lessons from the second review (16:9 scored 8/10, 9:16 7.5)

- A transformation must read at normal speed: show the target first (empty slots), go one piece per slot, in sequence, big enough to see, each landing with a snap. Correct-in-code but 0.4 s, tiny and under a glow reads as nothing.
- The hero object stays the largest thing in frame; supporting cards make way (dim, then leave).
- Exits leave fully and fade as they go: a static sliver at the frame edge reads as a layout bug, in vertical most of all.
- A pointer never rests on the key text; it clicks the side (the arrow) and clears off.
- One accent rule across formats: changing a caption's animation must not drop its accent phrase.
- 9:16 headlines start at about 320 px (below platform top chrome); push-in frames are chosen so the window edge falls in a gap between elements, never through text; charts start partly drawn.

## Lessons from the third review (16:9 scored 8.5, 9:16 8)

- When no push frames cleanly (the window's aspect never matches the row you push into), dim everything but the hero and keep it sharp: neighbours to about 45%, the cropped rows behind to about 10%, and neighbours that would leave a strip at the edge fade out. A light blur reads as a low-res export.
- On navy, dim light cards by darkening (`brightness`), not opacity: translucent white turns lavender.
- Product UI needs more contrast on video than in the app: `c2.tsx` darkens Concept 2's labels about 30% and sets titles and numbers at weight 500, which also brings the UI closer to the headline type.
- One box per idea: a card docked inside a card inside a card reads as empty white space. The hero lands on its target and replaces it.
- Numbers sell: the number that changes is never beside an equal one, and speed metrics show a small number falling (3.8h, ↓ 22 min, counting down).
- On a hit frame, the incoming element is fully visible on its first frame — a fade-in there is a one-frame blink.

## Review checklist

- Every shot has an event (something arrives, changes or is revealed); holds are for reading, never filler drift.
- Shots run 0.5–4 s, averaging about 2 s; each line stays up at least words ÷ 3 + 0.5 s.
- Camera table obeyed: no three pushes in a row, accents on a third of shots at most.
- Phone legibility: text at least 28 px at 1080p, statements at most two lines, broken by hand.
- One focal point per shot; everything else is depth-of-field blurred or dimmed.
- Colours come only from the brand list above.
- Every number and claim traces to the knowledge base.
- Act boundaries and the logo hit sit on bars from `beats.json`.
- The 9:16 render is laid out for portrait, with nothing cropped.
