// Beemcute 10 s ad: stress (WhatsApp pings) → relief (clean groove) → logo hit. Events mirror src/ad/Ad10.tsx frames.
//   FFMPEG=<ffmpeg> node sound/ad10.js → public/audio/ad10.wav
const path = require('path');
const fs = require('fs');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const { m } = require('./engine/music');
const t = (f) => f / 30;
const DUR = 10, N = Math.ceil(DUR * SR);
const B = () => new Bus(N);
const drums = B(), bass = B(), keys = B(), pad = B(), fx = B(), ui = B(), verb = B();
const hz = (x) => 440 * Math.pow(2, (x - 69) / 12);

// 1. chaos: a low drone that tightens, and a WhatsApp ping per unanswered message
const drone = I.padNote(m('D2'), 2.6, { cutoff: 700, attack: 0.6, release: 0.3, seed: 2 });
pad.addStereo(drone.L, drone.R, 0, 0.5);
const dr2 = I.padNote(m('Eb2'), 1.6, { cutoff: 900, attack: 0.9, release: 0.2, seed: 3 });
pad.addStereo(dr2.L, dr2.R, 1.0, 0.35);
[4, 13, 21, 29, 37, 45, 53, 60].forEach((f, i) => {
  ui.addMono(I.pop(1700 + i * 60, 40 + i), t(f), 0.32, (i % 2 ? 0.25 : -0.25));
  ui.addMono(I.pop(2500 + i * 60, 60 + i), t(f) + 0.07, 0.24, (i % 2 ? 0.25 : -0.25));
});
fx.addMono(I.noiseSweep(0.55, 600, 6000, { q: 1.1, seed: 5 }), t(75) - 0.4, 0.35); // riser into the cut

// 2. relief: a clean 120 BPM groove from the cut to the CTA
const BEAT = 0.5, S0 = t(75);
const chords = [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'A4']];
const roots = ['C2', 'A1', 'F1', 'G1'];
const KICK = I.kick({ punch: 0.9, tail: 0.25, seed: 7 });
for (let b = 0; b < 12; b++) {
  const at = S0 + b * BEAT;
  if (at >= t(228)) break;
  const bar = Math.floor(b / 4) % 4;
  drums.addMono(KICK, at, 0.6);
  drums.addMono(I.hat(false, 9 + b), at + BEAT / 2, 0.18, 0.3);
  if (b % 2) drums.addMono(I.clap({ seed: 11 + b }), at, 0.22);
  if (b % 4 === 0) {
    bass.addMono(I.bass(m(roots[bar]), BEAT * 3.5, { bright: 0.6 }), at, 0.42);
    chords[bar].forEach((n, i) => keys.addMono(I.epiano(m(n), BEAT * 3.6, { index: 1.2, decay: 1.2 }), at + i * 0.008, 0.1, (i - 1.5) * 0.3));
  }
  chords[bar].forEach((n, i) => { if (i === b % 4) keys.addMono(I.pluck(m(n) + 12, { decay: 0.18 }), at + BEAT / 2, 0.08, 0.4); });
}
fx.addMono(I.subBoom(0.9, 70, 34), t(75), 0.45);
drums.addMono(KICK, t(75), 0.8);
// product beats
[77, 112, 150].forEach((f) => ui.addMono(I.woodTick(1.3), t(f), 0.22));
ui.addMono(I.pop(1500, 3), t(88), 0.25);
for (let f = 112; f < 150; f += 3) ui.addMono(I.woodTick(1 + (f - 112) / 60), t(f), 0.06);
[['E6', 0], ['B6', 0.09]].forEach(([n, d]) => { ui.addMono(I.bell(hz(m(n)), 0.35, 1.1, 2), t(150) + d, 0.18); verb.addMono(I.bell(hz(m(n)), 0.35, 1.1, 2), t(150) + d, 0.1); });
ui.addMono(I.pop(2200, 8), t(152), 0.2);
fx.addMono(I.noiseSweep(0.35, 4000, 900, { q: 1.1, seed: 6 }), t(178) - 0.15, 0.18);
[192, 202].forEach((f, i) => { ui.addMono(I.bell(hz(m(i ? 'G6' : 'E6')), 0.25, 1.1, 2), t(f), 0.14); ui.addMono(I.woodTick(1.4), t(f), 0.12); });

// 4. CTA: wipe, logo hit, a held chord ringing out
fx.addMono(I.noiseSweep(0.5, 700, 5200, { q: 1.1, seed: 8 }), t(228) - 0.25, 0.3);
fx.addMono(I.subBoom(1.6, 66, 30), t(268), 0.55);
drums.addMono(KICK, t(268), 0.7);
verb.addMono(I.clap({ seed: 21 }), t(268), 0.2);
['C4', 'E4', 'G4', 'B4', 'D5'].forEach((n, i) => { keys.addMono(I.epiano(m(n), 2.0, { index: 1.1, decay: 1.6 }), t(268) + i * 0.012, 0.11, (i - 2) * 0.25); });
const fin = I.padNote(m('C3'), 2.2, { cutoff: 1500, attack: 0.15, release: 0.6, seed: 9 });
pad.addStereo(fin.L, fin.R, t(268), 0.3);
ui.addMono(I.pop(1800, 12), t(276), 0.18);

const stems = { drums, bass, keys, pad, fx, ui, verb: reverb(verb, { room: 0.84, damp: 0.3 }) };
const mix = MIX.mixdown(stems, { drums: 0.7, bass: 0.7, keys: 1.0, pad: 0.9, fx: 1.0, ui: 1.0, verb: 0.9 });
MIX.highpass(mix, 26);
MIX.fadeOut(mix, DUR - 0.5, DUR);
const M = MIX.master(mix, 0.8, undefined, { lufs: -14 });
const out = path.join(__dirname, '..', 'public', 'audio', 'ad10.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
MIX.writeWav(out, mix);
console.log(`wrote ${out} (${M.lufs.toFixed(1)} LUFS)`);
