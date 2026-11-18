// Beemcute launch film — the score. Renders music + effects in one pass to public/audio/score.wav.
//   node sound/song.js            (LUFS=-14 is the default master target)
// Timing: 30 fps, 120 BPM, offset 0 → bar n starts at frame 60n, a beat every 15 frames.
// Every event below mirrors a frame in src/scenes/* (and src/timeline.ts). Engine: vendored from the animation-studio skill.
const path = require('path');
const fs = require('fs');
const { SR, Bus, reverb, pingpong, rng } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const MU = require('./engine/music');
const { m } = MU;
const { random } = require('remotion');

const F = (f) => f / 30;
const t = F;
const clock = MU.makeClock({ bpm: 120, offset: 0 });
const { T, BEAT } = clock;
const DURATION = 30;
const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), lead = bus(), fx = bus(), ui = bus();
const verb = bus(), dly = bus();
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// Chat keystrokes exactly as src/components/Text.tsx computes them.
const keystrokes = (text, at, cps, fps) => {
  const times = [];
  let tt = at;
  for (let i = 0; i < text.length; i++) {
    const r = random(`key-${text}-${i}`);
    tt += (fps / cps) * (0.65 + 0.7 * r) * (text[i - 1] === ' ' ? 1.35 : 1);
    times.push(tt);
  }
  return times;
};

// ---------- events (global frames) ----------
const EV = {
  pile: [0, 4, 8, 11, 15, 19, 23, 26, 30], // Opening STACK_AT
  flood: Array.from({ length: 13 }, (_, k) => 38 + k * 2), // Opening fieldAt
  burst: 32,
  line1: 38,
  line2: 90,
  stopDown: 158,
  rush: 168,
  turn: 180,
  turnText: 195,
  chatIn: 270,
  keys: keystrokes('Generator tripping at Lekki site again', 12, 42, 30).map((k) => 270 + k),
  send: 315,
  draft: 330,
  pushYes: 334,
  yes: 345,
  yesBubble: 348,
  done: 360,
  routeLine: 400,
  pick: 408,
  depart: 420,
  dock: 450,
  toast: 465,
  dashPush: 538,
  flip: 570,
  resolve: 645,
  shrink: 660,
  slams: [675, 690, 705],
  clear: 728,
  gather: 732,
  logo: 780,
  word: 796,
  offer: 816,
  bMove: 784,
  // One tick per block landing (src/components/Assemble.tsx landAt): 16 into the 180 hit, 15 into the 780 hit.
  lands1: Array.from({ length: 16 }, (_, n) => Math.round(156 + 22 * Math.pow(n / 15, 0.85))),
  lands2: Array.from({ length: 15 }, (_, n) => Math.round(754 + 23 * Math.pow(n / 14, 0.85))),
  cta: 825,
  pointer: 835,
  tap: 855,
  cuts: [270, 390, 510, 630],
};

// ---------- a phone buzz (two short vibration pulses) ----------
const buzz = (len = 0.2, seed = 1) => {
  const out = new Float32Array(Math.ceil(len * SR));
  const w = rng(seed);
  for (let i = 0; i < out.length; i++) {
    const s = i / SR;
    const pulse = s < 0.07 || (s > 0.1 && s < 0.17) ? 1 : 0;
    const env = Math.min(1, s / 0.004) * pulse;
    out[i] = (Math.sin(2 * Math.PI * 168 * s) * 0.7 + Math.sin(2 * Math.PI * 336 * s) * 0.2 + w() * 0.08) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 31 * s)) * env;
  }
  return out;
};

// ---------- harmony: A minor tension → C major lift ----------
const CH = {
  Am: { notes: ['A3', 'C4', 'E4', 'G4'], bass: 'A1' },
  F: { notes: ['A3', 'C4', 'F4', 'E4'], bass: 'F1' },
  Dm: { notes: ['A3', 'D4', 'F4', 'C5'], bass: 'D2' },
  C: { notes: ['G3', 'C4', 'E4', 'D5'], bass: 'C2' },
  G: { notes: ['G3', 'B3', 'D4', 'A4'], bass: 'G1' },
};
const PROG = ['Am', 'F', 'Dm', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'C', 'C'];
const chordAt = (sec) => CH[PROG[Math.min(PROG.length - 1, Math.floor(sec / 2))]];
const silent = (sec) => sec >= t(EV.stopDown) && sec < t(EV.turn);

// ---------- drums ----------
const K = I.kick({ punch: 1.1 }), CL = I.clap(), SN = I.snare();
const HC = [I.hat(false, 11), I.hat(false, 12)], HO = I.hat(true, 14), CR = I.crash(18), SH = [I.shaker(1, 15), I.shaker(0.7, 16)];
const kicks = [];
const kick = (sec, g = 0.95) => { drums.addMono(K, sec, g); kicks.push(sec); };

// Problem: driving 16th hats from the first frame (the pile-up), no kick.
clock.eachStep(0, 3, 16, (sec, b, s) => {
  if (sec >= t(EV.stopDown)) return;
  drums.addMono(HC[s % 2], sec, s % 4 === 0 ? 0.17 : 0.08, s % 2 ? 0.35 : -0.35);
  if (s % 4 === 2) drums.addMono(SH[s % 2], sec, 0.12, 0.4);
});
// Turn: half-time.
kick(t(EV.turn), 1.0);
kick(T(3, 2), 0.7);
kick(T(4), 0.85);
kick(T(4, 2), 0.75);
// Product groove: four on the floor, claps on 2 & 4, offbeat open hats.
clock.eachStep(4, 12, 16, (sec, b, s) => {
  if (sec < t(EV.chatIn) - 0.001 || sec >= 22.4) return;
  if (s % 4 === 0) kick(sec, 0.9);
  if (s % 8 === 4) { drums.addMono(CL, sec, 0.55); verb.addMono(CL, sec, 0.22); }
  if (s % 4 === 2) drums.addMono(HO, sec, 0.1, 0.3);
  drums.addMono(HC[s % 2], sec, s % 2 ? 0.13 : 0.07, -0.25);
});
for (let i = 0; i < 8; i++) drums.addMono(SN, t(EV.slams[0]) - 1 + i * (BEAT / 4), 0.12 + i * 0.025, 0.05);
drums.addMono(CR, t(EV.turn), 0.45, -0.2);
drums.addMono(CR, t(EV.chatIn), 0.22, 0.2);
drums.addMono(CR, t(EV.logo), 0.5, 0.15);

// ---------- bass ----------
clock.eachStep(0, 3, 8, (sec) => {
  if (sec >= t(EV.stopDown)) return;
  const c = chordAt(sec);
  bass.addMono(I.bass(m(c.bass) + 12, BEAT / 2 * 0.7, { bright: 0.5, sub: 0.7 }), sec, 0.42);
});
clock.eachStep(3, 12, 8, (sec, b, s) => {
  if (sec >= 22.4) return;
  const c = chordAt(sec);
  const R = m(c.bass) + 12;
  if (sec < t(EV.chatIn)) {
    if (s === 0 || s === 3 || s === 6) bass.addMono(I.bass(R, BEAT * 0.9, { sub: 0.9, bright: 0.5 }), sec, 0.5);
  } else bass.addMono(I.bass(s % 2 ? R + 12 : R, BEAT / 2 * 0.8, { sub: 0.8 }), sec, 0.55);
});
for (const f of EV.slams) bass.addMono(I.bass(m('C2'), 0.45, { sub: 1, bright: 0.6 }), t(f), 0.7);
bass.addMono(I.bass(m('C2'), 3.5, { bright: 0.35, sub: 1 }), t(EV.logo), 0.6);

// ---------- pads ----------
for (let b = 0; b < 15; b++) {
  let s0 = T(b), s1 = T(b + 1);
  if (s0 < t(EV.stopDown) && s1 > t(EV.stopDown)) s1 = t(EV.stopDown);
  if (silent(s0)) continue;
  if (b === 12) s0 = Math.max(s0, t(EV.gather)); // the breath before the logo is held by the riser alone
  const c = CH[PROG[b]];
  for (const n of c.notes) {
    const { L, R } = I.padNote(m(n), Math.max(0.2, s1 - s0), b >= 3 ? { cutoff: b >= 4 && b < 11 ? 2400 : 1700, attack: 0.25, release: 1.0 } : { cutoff: 700, attack: 0.6, release: 0.6 });
    pad.addStereo(L, R, s0, b === 13 || b === 14 ? 0.08 : 0.065);
  }
}

// ---------- keys: pluck arpeggio through the product ----------
const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
clock.eachStep(4, 12, 16, (sec, b, s) => {
  if (sec < t(EV.chatIn) || sec >= 22.4) return;
  const c = chordAt(sec);
  const x = I.pluck(m(c.notes[ARP[s % 8]]) + 12, { decay: 0.12, cutoff: 2600 + 600 * Math.sin(s) });
  keys.addMono(x, sec, 0.11, s % 2 ? 0.35 : -0.35);
  dly.addMono(x, sec, 0.04);
});
// The blocks lock in: a quick rising glass run right on each hit.
const PENTA = ['C5', 'E5', 'G5', 'A5', 'C6', 'E6', 'G6'];
const lockIn = (f0, gain) => PENTA.forEach((n, i) => {
  const b = I.bell(hz(m(n)), 0.2, 1.3, 2.0);
  keys.addMono(b, t(f0) + 0.03 + i * 0.028, gain * (0.7 + 0.05 * i), i % 2 ? 0.3 : -0.3);
  verb.addMono(b, t(f0) + 0.03 + i * 0.028, gain * 0.5);
});
lockIn(EV.turn, 0.1);
lockIn(EV.logo, 0.11);

// ---------- lead stabs ----------
const stab = (sec, chord, dur, g) => {
  for (const n of CH[chord].notes) {
    const { L, R } = I.supersaw(m(n) + 12, dur, { cutoff: 4200, attack: 0.005, release: 0.35 });
    lead.addStereo(L, R, sec, g);
    verb.addStereo(L, R, sec, g * 0.5);
  }
};
stab(t(EV.turn), 'C', 0.5, 0.05);
stab(t(EV.slams[0]), 'Am', 0.35, 0.05);
stab(t(EV.slams[1]), 'F', 0.35, 0.05);
stab(t(EV.slams[2]), 'C', 0.6, 0.06);
stab(t(EV.logo), 'C', 1.6, 0.06);

// ---------- sound design, each tied to the picture ----------
// The pile-up: ping + phone buzz on every 16th, pitch climbing; the flood thinner and quieter.
const PING = ['A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'D7', 'E7'];
EV.pile.forEach((f, i) => {
  ui.addMono(I.ting(m(PING[i])), t(f), 0.3, i % 2 ? 0.3 : -0.3);
  if (i % 2 === 0) ui.addMono(buzz(0.2, i + 3), t(f), 0.22, 0);
  else ui.addMono(I.pop(1500 + i * 90, 40 + i), t(f), 0.2, 0.2);
});
EV.flood.forEach((f, i) => ui.addMono(I.ting(m(PING[i % 9]) - 5), t(f), 0.07, ((i * 37) % 9) / 4.5 - 1));
fx.addMono(I.noiseSweep(1.2, 3500, 300, { q: 0.8, pink: true }), t(EV.burst), 0.22); // the burst / pull-back
fx.addMono(I.subBoom(0.9, 70, 34), t(EV.line1), 0.3);
fx.addMono(I.subBoom(1.1, 64, 30), t(EV.line2), 0.45);
drums.addMono(CL, t(EV.line2), 0.45);
// Riser into the stop-down, a beat of silence, then the suck into the hit.
fx.addMono(I.noiseSweep(t(EV.stopDown) - t(EV.line2) + 0.05, 220, 9000, { q: 0.9, shape: (x) => x * x, pink: true }), t(EV.line2) + 0.05, 0.3);
fx.addMono(I.noiseSweep(t(EV.turn) - t(EV.rush), 900, 7000, { q: 0.7, shape: (x) => x * x * x, pink: true }), t(EV.rush), 0.25);
// Each card snapping into a block of the B: a tick climbing in pitch, quickening into the hit.
const landTicks = (frames, gain) => frames.forEach((lf, n) => { ui.addMono(I.woodTick(0.9 + 0.7 * (n / (frames.length - 1))), t(lf), gain, ((n % 3) - 1) * 0.3); ui.addMono(I.pop(1100 + n * 45, 60 + n), t(lf), gain * 0.6); });
landTicks(EV.lands1, 0.2);
landTicks(EV.lands2, 0.2);
fx.addMono(I.subBoom(2.4), t(EV.turn), 0.8);
// Chat: one tick per keystroke, send, bubbles, the push into the tap, the tap, the confirmation.
EV.keys.forEach((kf, k) => ui.addMono(I.woodTick(0.85 + ((k * 7) % 5) * 0.06), t(kf), 0.09, 0.15));
ui.addMono(I.noiseSweep(0.22, 900, 5000, { q: 1.2, pink: true }), t(EV.send) - 0.04, 0.2);
ui.addMono(I.pop(1700), t(EV.send) + 0.06, 0.32);
ui.addMono(I.pop(1300, 3), t(EV.draft), 0.3);
fx.addMono(I.noiseSweep(0.4, 600, 3000, { q: 1, pink: true }), t(EV.pushYes), 0.14);
ui.addMono(I.woodTick(1.25), t(EV.yes), 0.32);
ui.addMono(I.pop(1100, 9), t(EV.yes) + 0.01, 0.2);
ui.addMono(I.pop(1600, 5), t(EV.yesBubble), 0.24);
ui.addMono(I.bell(hz(m('E6')), 0.28, 1.2, 2), t(EV.done) + 0.03, 0.2);
ui.addMono(I.bell(hz(m('A6')), 0.36, 1.2, 2), t(EV.done) + 0.13, 0.2);
verb.addMono(I.bell(hz(m('A6')), 0.36, 1.2, 2), t(EV.done) + 0.13, 0.1);
// Route: line, pick, lift-off, tracking whoosh, dock, alert.
fx.addMono(I.noiseSweep(0.5, 600, 4200, { q: 1.4, pink: true }), t(EV.routeLine), 0.16);
ui.addMono(I.bell(hz(m('G6')), 0.25, 1.3, 2), t(EV.pick), 0.14);
fx.addMono(I.noiseSweep(1.0, 700, 4200, { q: 0.9, shape: (x) => Math.sin(Math.PI * x), pink: true }), t(EV.depart), 0.22);
ui.addMono(I.thud(100, 0.07), t(EV.dock), 0.35);
ui.addMono(I.pop(1250, 11), t(EV.dock) + 0.02, 0.3);
ui.addMono(I.ting(m('C6')), t(EV.toast), 0.24, 0.25);
// Dashboard: counters while wide, the push in, then the overdue "uh-oh".
for (let n = 1; n <= 12; n++) ui.addMono(I.woodTick(1.4 + n * 0.02), t(512 + 22 * (1 - Math.pow(1 - n / 12, 2))), 0.06);
fx.addMono(I.noiseSweep(1.0, 400, 3600, { q: 0.8, shape: (x) => Math.sin(Math.PI * x) * x, pink: true }), t(EV.dashPush), 0.2);
ui.addMono(I.bell(hz(m('E5')), 0.22, 1.6, 1.5), t(EV.flip), 0.24);
ui.addMono(I.bell(hz(m('C5')), 0.32, 1.6, 1.5), t(EV.flip) + 0.13, 0.24);
ui.addMono(I.thud(80, 0.08), t(EV.flip), 0.25);
// Payoff: the resolve ding, the shrink, the three hits, then the gather into the logo.
ui.addMono(I.bell(hz(m('C6')), 0.3, 1.2, 2), t(EV.resolve), 0.24);
ui.addMono(I.bell(hz(m('G6')), 0.42, 1.2, 2), t(EV.resolve) + 0.1, 0.24);
verb.addMono(I.bell(hz(m('G6')), 0.42, 1.2, 2), t(EV.resolve) + 0.1, 0.12);
fx.addMono(I.noiseSweep(0.75, 4000, 500, { q: 0.9, pink: true }), t(EV.shrink), 0.16);
for (const f of EV.slams) { kick(t(f), 1.0); drums.addMono(CL, t(f), 0.5); fx.addMono(I.subBoom(0.9, 66, 32), t(f), 0.42); verb.addMono(CL, t(f), 0.3); }
fx.addMono(I.noiseSweep(t(EV.logo) - t(EV.gather), 250, 11000, { q: 0.8, shape: (x) => x * x * x, pink: true }), t(EV.gather), 0.42);
for (let i = 0; i < 8; i++) drums.addMono(SN, t(EV.logo) - 1 + i * (BEAT / 4), 0.08 + i * 0.022, -0.05);
kick(t(EV.logo), 1.0);
fx.addMono(I.subBoom(2.6), t(EV.logo), 0.85);
fx.addMono(I.noiseSweep(1.4, 1800, 7000, { q: 0.6, shape: (x) => Math.exp(-3 * x) * Math.min(1, x * 20), pink: true }), t(EV.logo), 0.08);
// Close: the wordmark swish, the offer, the CTA, the pointer and its tap.
fx.addMono(I.noiseSweep(0.7, 2600, 600, { q: 0.9, pink: true }), t(EV.bMove), 0.1);
fx.addMono(I.noiseSweep(0.6, 700, 3500, { q: 1.1, pink: true }), t(EV.word), 0.1);
ui.addMono(I.pop(1300, 17), t(EV.offer), 0.14);
ui.addMono(I.pop(1500, 21), t(EV.cta), 0.28);
ui.addMono(I.bell(hz(m('E6')), 0.3, 1.1, 2), t(EV.cta) + 0.08, 0.16);
ui.addMono(I.bell(hz(m('C7')), 0.5, 1.1, 2), t(EV.cta) + 0.2, 0.14);
fx.addMono(I.noiseSweep(0.55, 2500, 900, { q: 1, pink: true }), t(EV.pointer), 0.08);
ui.addMono(I.woodTick(1.3), t(EV.tap) - 0.01, 0.28);
ui.addMono(I.pop(1900, 31), t(EV.tap), 0.28);
// Cut on action: an upward air swish carries each scene into the next.
for (const c of EV.cuts) fx.addMono(I.noiseSweep(0.36, 700, 6500, { q: 0.9, shape: (x) => Math.sin(Math.PI * x) * x, pink: true }), t(c) - 0.28, 0.24);

// ---------- mix ----------
MIX.sidechain([pad, bass, keys], kicks.filter((k) => k >= t(EV.chatIn) - 0.01), { depth: 0.45 });
const stems = {
  drums, bass, pad, keys, lead, fx, ui,
  verb: reverb(verb, { room: 0.86, damp: 0.3 }),
  dly: pingpong(dly, BEAT * 0.75, 0.32, 3600),
};
// Effects sit forward of the music: the reviewer could not hear them at the old balance.
const GAIN = { drums: 0.42, bass: 0.68, pad: 2.0, keys: 0.85, lead: 1.4, fx: 1.5, ui: 2.0, verb: 1, dly: 1 };
// The stop-down silences the music only; the block ticks carry through it.
for (const b of [stems.drums, stems.bass, stems.pad, stems.keys, stems.lead, stems.verb, stems.dly]) MIX.gate(b, t(EV.stopDown), t(EV.rush) - 0.004);
const mix = MIX.mixdown(stems, GAIN);
MIX.highpass(mix, 24);
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: parseFloat(process.env.LUFS || '-14') });
const outDir = path.join(__dirname, '..', 'public', 'audio');
fs.mkdirSync(outDir, { recursive: true });
MIX.writeWav(path.join(outDir, 'score.wav'), mix);
console.log(`wrote public/audio/score.wav (${DURATION}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);
