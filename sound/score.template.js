// Starter score: music + sound effects rendered in code, on the same grid as the picture.
//   node sound/score.template.js            → public/audio/score.wav at -14 LUFS
// Copy this file and the engine/ folder into your Remotion project's sound/ folder.
// The rule: every frame number in EV is copied from a scene in src/. Retime a scene, retime EV.
const path = require('path');
const fs = require('fs');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const MU = require('./engine/music');
const { m } = MU;

// ---------- grid: 30 fps, 120 BPM → 1 beat = 15 frames, 1 bar = 60 frames ----------
const FPS = 30;
const t = (frame) => frame / FPS;
const clock = MU.makeClock({ bpm: 120, offset: 0 });
const { T, BEAT } = clock; // T(bar, beat) → seconds
const DURATION = 30;
const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), fx = bus(), ui = bus(), verb = bus();

// ---------- events: frames copied from your scenes ----------
const EV = {
  pings: [0, 4, 8, 11, 15, 19, 23, 26, 30], // the problem piling up (16th notes)
  stopDown: 165, // music drops out one beat before the turn
  turn: 180, // act change on bar 3: the signature move
  clicks: [345, 855], // button taps
  success: [360, 645], // something resolves
  whooshes: [270, 390, 510, 630], // cuts between scenes
  logo: 780, // logo hit on bar 13
};

// ---------- harmony: minor tension in the problem, major lift after the turn ----------
const CH = {
  Am: { notes: ['A3', 'C4', 'E4', 'G4'], bass: 'A1' },
  F: { notes: ['A3', 'C4', 'F4', 'E4'], bass: 'F1' },
  C: { notes: ['G3', 'C4', 'E4', 'D5'], bass: 'C2' },
  G: { notes: ['G3', 'B3', 'D4', 'A4'], bass: 'G1' },
};
const PROG = ['Am', 'F', 'Am', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'C', 'C']; // one chord per bar
const chordAt = (sec) => CH[PROG[Math.min(PROG.length - 1, Math.floor(sec / clock.BAR))]];

// ---------- drums ----------
const K = I.kick({ punch: 1.1 }), CL = I.clap(), HC = I.hat(false, 11), HO = I.hat(true, 14), CR = I.crash(18);
const kicks = [];
const kick = (sec, g = 0.9) => { drums.addMono(K, sec, g); kicks.push(sec); };
// Problem: nervous 16th hats, no kick.
clock.eachStep(0, 3, 16, (sec, b, s) => { if (sec < t(EV.stopDown)) drums.addMono(HC, sec, s % 4 ? 0.07 : 0.16, s % 2 ? 0.3 : -0.3); });
// Product: four on the floor, claps on 2 and 4, offbeat open hats.
clock.eachStep(3, 13, 16, (sec, b, s) => {
  if (s % 4 === 0) kick(sec);
  if (s % 8 === 4) { drums.addMono(CL, sec, 0.5); verb.addMono(CL, sec, 0.2); }
  if (s % 4 === 2) drums.addMono(HO, sec, 0.1, 0.3);
});
drums.addMono(CR, t(EV.turn), 0.45);
drums.addMono(CR, t(EV.logo), 0.5);
kick(t(EV.logo), 1.0);

// ---------- bass, pads, plucks ----------
clock.eachStep(0, 15, 8, (sec, b, s) => {
  if (sec >= t(EV.stopDown) && sec < t(EV.turn)) return;
  if (b < 3 && s % 2) return;
  bass.addMono(I.bass(m(chordAt(sec).bass) + 12, BEAT * 0.4, { sub: 0.8, bright: 0.5 }), sec, 0.5);
});
for (let b = 0; b < 15; b++) {
  for (const n of CH[PROG[b]].notes) {
    const { L, R } = I.padNote(m(n), clock.BAR, { cutoff: b < 3 ? 800 : 2200, attack: 0.3, release: 0.8 });
    pad.addStereo(L, R, T(b), 0.06);
  }
}
const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
clock.eachStep(4, 12, 16, (sec, b, s) => {
  keys.addMono(I.pluck(m(chordAt(sec).notes[ARP[s % 8]]) + 12, { decay: 0.12, cutoff: 2800 }), sec, 0.1, s % 2 ? 0.35 : -0.35);
});

// ---------- sound design: one sound per visible action ----------
const PING = ['A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'D7', 'E7']; // pitch climbs with the stress
EV.pings.forEach((f, i) => ui.addMono(I.ting(m(PING[i % PING.length])), t(f), 0.3, i % 2 ? 0.3 : -0.3));
// Riser into the stop-down, then a sub boom on the turn.
fx.addMono(I.noiseSweep(t(EV.stopDown) - 2, 220, 9000, { q: 0.9, shape: (x) => x * x, pink: true }), t(EV.stopDown) - 2, 0.3);
fx.addMono(I.subBoom(2.4), t(EV.turn), 0.8);
for (const f of EV.whooshes) fx.addMono(I.noiseSweep(0.36, 700, 6500, { q: 0.9, shape: (x) => Math.sin(Math.PI * x) * x, pink: true }), t(f) - 0.28, 0.24); // lead in so the peak hits the cut
for (const f of EV.clicks) { ui.addMono(I.woodTick(1.25), t(f), 0.3); ui.addMono(I.pop(1600, f), t(f), 0.22); }
for (const f of EV.success) { ui.addMono(I.bell(440 * 2 ** ((m('E6') - 69) / 12), 0.28, 1.2, 2), t(f), 0.2); ui.addMono(I.bell(440 * 2 ** ((m('A6') - 69) / 12), 0.36, 1.2, 2), t(f) + 0.12, 0.2); }
fx.addMono(I.noiseSweep(2, 250, 11000, { q: 0.8, shape: (x) => x * x * x, pink: true }), t(EV.logo) - 2, 0.4); // riser into the logo
fx.addMono(I.subBoom(2.6), t(EV.logo), 0.85);

// ---------- mix and master ----------
MIX.sidechain([pad, bass, keys], kicks, { depth: 0.45 }); // the pump
const stems = { drums, bass, pad, keys, fx, ui, verb: reverb(verb, { room: 0.86, damp: 0.3 }) };
for (const b of [stems.drums, stems.bass, stems.pad, stems.keys, stems.verb]) MIX.gate(b, t(EV.stopDown), t(EV.turn) - 0.004); // the held breath
// Effects sit forward of the music (about twice the bed), or nobody hears them.
const mix = MIX.mixdown(stems, { drums: 0.42, bass: 0.68, pad: 2.0, keys: 0.85, fx: 1.5, ui: 2.0, verb: 1 });
MIX.highpass(mix, 24);
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: parseFloat(process.env.LUFS || '-14') });
const outDir = path.join(__dirname, '..', 'public', 'audio');
fs.mkdirSync(outDir, { recursive: true });
MIX.writeWav(path.join(outDir, 'score.wav'), mix);
console.log(`wrote public/audio/score.wav (${DURATION}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS` : ''})`);
