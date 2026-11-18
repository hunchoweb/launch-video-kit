# Kick-start prompt

Paste this into Claude Code as your **first message**, opened in your product's own repo (so it can use your real UI code, logo and copy). Before sending:

- Put a reference video you love in the repo (any studio-made launch film; a screen recording is fine) and change `@reference.mp4` to its name.
- Fill in the four `[brackets]`.
- Use the strongest model available and high effort. Plan for a few hours and several renders.

---

```text
I want a top-notch 30-second launch film for my product, built in code with Remotion. It should be clean, captivating motion design that makes people sign up and leaves a stranger knowing exactly what the product does.

Product: [name] — [one sentence on what it does and for whom]
Website / call to action: [e.g. "Start free at example.com"]
Brand: [colours, fonts, logo file paths — or "take them from this repo"]
Style reference: @reference.mp4

Set up first. Clone https://github.com/hunchoweb/launch-video-kit and follow its INSTALL.md: install its launch-video-playbook and launch-video-sound skills and the third-party skills it lists. Vet each one (read SKILL.md, scripts and licence) before installing. Read the kit's README.md, skills/launch-video-playbook/SKILL.md, moves.md and sound/README.md; the Beemcute example in examples/ is the quality bar. Load the skills for each step as you use them.

Then, before building anything:
1. Research. Search the web for how films like the reference are made (articles, breakdowns) and for any other published skills that would help. Tell me what you found, what you kept and why.
2. Tear down my reference. Extract frames into contact sheets, and measure shot lengths, BPM, where the turns land on bars, drop-outs and effects. Write reference-teardown.md with a Take / Translate / Leave section: take its grammar, translate its look to my brand, and copy none of its copy, imagery or logo.
3. Learn my product from this repo (docs, landing page, UI components). Every claim and number in the film must trace to a source here. Ask me before showing any feature you can't confirm is live.
4. Write brief.md and a shot-by-shot script on the playbook's story spine. The problem should feel overwhelming by 1 s. The chaos becomes the logo on the first big hit. Three features follow one real thread (one ticket, one order, one user). Then a payoff line landing one phrase per beat, and the logo with the CTA alone on the last frame. List the questions you need me to answer.

Stop there and wait for my answers.

When I approve:
5. Render 4–5 key shots as stills and show me before animating.
6. Build 16:9 (1920×1080) and 9:16 (1080×1920) from the same scenes. Rebuild product screens in React from my real UI code; no screenshots under camera moves.
7. Score it in code with the kit's sound engine, following launch-video-sound: turns on bars, a one-beat drop-out before each turn, one sound per visible action, effects forward of the music, mastered to −14 LUFS and measured.
8. Review loop. Render at half scale, make a contact sheet (one frame per 0.5 s) and check every item on the playbook's checklist and lessons. Then hand the render, the contact sheets and the audio measurements to a fresh subagent with no stake in the work. Prompt it as a senior motion designer: score out of 10, what's working, what's holding it back with timestamps, fixes by impact, and what it takes to reach 9. Verify each point against the frames, fix the real ones, and repeat until the reviewer gives 8.5 or more in both formats. Show me the score and the render after each round.
9. Export final H.264 MP4s with --image-format=png --pixel-format=yuv420p --color-space=bt709, plus a poster frame.
10. Save new lessons into the launch-video-playbook skill so the next film starts better.
```

---

## After that

- Answer its questions, approve the stills, and watch each render on your phone.
- Paste any outside feedback (a friend, another AI) as: *"Here's a critique. Is it correct? If so, fix what needs fixing."*
- More follow-up prompts (vertical-only tweaks, restyling to your real UI, social ad cut-downs, voice-over) are in `PROMPTS.md`.
- Check the licences in `INSTALL.md` (Remotion is free for teams of up to 3).
