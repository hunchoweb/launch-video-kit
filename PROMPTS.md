# Prompts

The real prompts behind the Beemcute launch film, in order, cleaned up into templates. Replace anything in `[brackets]`. Send them one at a time in Claude Code, from inside your product's repo so Claude can use your real assets and UI code.

## 1. Kick-off: research before building

> I want to make a launch video for my platform [name, one line on what it does]. It needs to be a very clean, captivating motion video, about 30 seconds, that will drive sign-ups, and after watching people should know what [name] is about. You have access to all the assets in this repo, so use them.
>
> I'm dropping a reference for how I want it to look: @[reference.mp4]. Before we create anything, I need you to understand how videos like this are made.
>
> For every single thing we need to make this output:
> - Go to the internet.
> - Find articles and breakdowns on how it's done.
> - Find skills other people have created and download them (vet them first).
>
> If we need our own skills (for sound, or anything else), create them. Then tell me what we need to make this work before you start.

Claude then tears the reference down, installs skills, writes the playbook and sound skills, and lists open questions (formats, music, CTA, which features are live).

## 2. Approve and point at extra skills

> [https://github.com/alchaincyf/huashu-art-motion] — use this too. Yes, [feature X] is live. Go ahead and create.

Ask to see stills of four or five key shots before the full build: approving direction from pictures is much cheaper than from renders.

## 2b. Sound

Covered by prompt 1 ("skills for sounds"). To ask for it directly:

> Write the soundtrack in code: copy `sound/engine` and `sound/score.template.js` from the kit into the project, then score the film with every sound timed to the scenes' frames, following the launch-video-sound skill. Turns on bars, a one-beat drop-out before each turn, one sound per visible action, effects forward of the music, master to −14 LUFS and measure it.

## 3. Vertical version + animation principles

> Let's make a vertical version. Also review John Lasseter's principles of animation and apply them where they help.

## 4. The critique loop (this is what took it from 7 to 8.5+)

Export the render and give it to a fresh reviewer (another AI chat that can watch video, or a motion designer). Prompt for the reviewer:

> You're a senior motion designer reviewing a 30 s product launch film for social. Go through it frame by frame, and measure the audio (BPM, where the hits land, loudness). Score it out of 10 and tell me: what's working, what's holding it back (with timestamps), fixes ordered by impact, and what it takes to reach 9. Be specific about the hook in the first 1.5 s, camera direction, type animation variety, whether motion lands on the music hits, legibility on a phone, and the 9:16 layout.

Then paste the critique back to Claude:

> [paste critique] This is the critique I got. Is this review correct? If so, fix what needs to be fixed.

Repeat for each round. Asking "is it correct" matters: Claude checks each point against the actual frames instead of blindly applying it.

## 5. Restyle to the real product UI

> Use our [dashboard design / file or folder] for the dashboard asset, and restyle every other product asset in the video to match that style.

## 6. Social ad cut-downs (optional)

> Create a clean ~10 s motion ad for [product] for WhatsApp and Facebook: captivating, relatable, puts people in the situation where they'd try it. Use the skills we already downloaded. No gradients. Generate assets if needed. Storyline: [your script lines].

> Make a version with a voice-over saying: [script], matched to what's on screen.

> The last frame should be the logo with the CTA alone.

## Tips that saved time

- Keep it in one session per film; when context fills, Claude summarises and continues.
- Ask Claude to save lessons from every critique into the playbook skill so the next film starts at 8/10, not 7.
- Say "render at half scale and show me a contact sheet" for quick checks; full renders take minutes.
