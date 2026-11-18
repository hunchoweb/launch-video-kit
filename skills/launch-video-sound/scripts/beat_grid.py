"""Beat grid for a music track: tempo, beats, bars, section changes and drop-outs, in seconds and frames.

Decode the track to 16-bit mono WAV first (Remotion ships ffmpeg):
    npx remotion ffmpeg -i music.mp3 -ac 1 -ar 22050 -c:a pcm_s16le music.wav
Then:
    python3 beat_grid.py music.wav --fps 30 --out src/beats.json

Needs numpy only. Assumes a steady tempo (true of library and generated tracks);
a live or rubato recording will drift off the grid, so check it against the waveform.
"""
import argparse
import json
import wave

import numpy as np

p = argparse.ArgumentParser()
p.add_argument("wav")
p.add_argument("--fps", type=float, default=30.0)
p.add_argument("--bpm-min", type=float, default=80.0)
p.add_argument("--bpm-max", type=float, default=170.0)
p.add_argument("--beats-per-bar", type=int, default=4)
p.add_argument("--out")
args = p.parse_args()

with wave.open(args.wav, "rb") as w:
    if w.getsampwidth() != 2:
        raise SystemExit("expected 16-bit PCM WAV: decode with -c:a pcm_s16le")
    sr, ch = w.getframerate(), w.getnchannels()
    y = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float32) / 32768
y = y.reshape(-1, ch).mean(axis=1)
dur = len(y) / sr

HOP, NFFT = 256, 2048
env_fps = sr / HOP
frames = np.lib.stride_tricks.sliding_window_view(np.pad(y, NFFT // 2), NFFT)[::HOP] * np.hanning(NFFT)
spec = np.abs(np.fft.rfft(frames, axis=1))
freqs = np.fft.rfftfreq(NFFT, 1 / sr)
logspec = np.log1p(100 * spec)


def flux(band):
    d = np.maximum(0, np.diff(logspec[:, band], axis=0)).sum(axis=1)
    d = np.concatenate([[0], d])
    return (d - d.mean()) / (d.std() + 1e-9)


onset = flux(slice(None))
low_onset = flux(freqs < 200)  # kick drum region, used for downbeats

# Tempo: autocorrelation peak inside the allowed range, refined by parabola.
ac = np.correlate(onset, onset, mode="full")[len(onset) - 1:]
lag_min = int(60 * env_fps / args.bpm_max)
lag_max = int(60 * env_fps / args.bpm_min) + 1
lag = lag_min + int(np.argmax(ac[lag_min:lag_max]))
a, b, c = ac[lag - 1], ac[lag], ac[lag + 1]
period0 = (lag + 0.5 * (a - c) / (a - 2 * b + c)) / env_fps


def grid_score(period, offset):
    idx = np.round(np.arange(offset, dur, period) * env_fps).astype(int)
    return onset[idx[idx < len(onset)]].sum()


# Joint search of period (+-1.5%) and phase so the grid stays on beat to the end of the track.
best = (-1e18, period0, 0.0)
for period in period0 * np.linspace(0.985, 1.015, 61):
    for off in np.arange(0, period, 0.004):
        s = grid_score(period, off)
        if s > best[0]:
            best = (s, period, off)
_, period, offset = best
beats = np.arange(offset, dur, period)

# Downbeat: the beat phase (mod beats-per-bar) with the strongest low-frequency onsets.
n = args.beats_per_bar
bi = np.clip(np.round(beats * env_fps).astype(int), 0, len(low_onset) - 1)
phase_strength = [low_onset[bi[k::n]].mean() for k in range(n)]
down = int(np.argmax(phase_strength))
spread = np.std(phase_strength) + 1e-9
down_conf = float((max(phase_strength) - np.mean(phase_strength)) / spread)
bars = beats[down::n]

# Loudness per bar, and section changes where the bar-to-bar timbre (24 log bands) shifts most.
# Mastered tracks are compressed flat, so timbre finds drops and breakdowns that loudness misses.
frame_rms = np.sqrt((frames ** 2).mean(axis=1))
frame_db = 20 * np.log10(frame_rms + 1e-9)
edges = np.geomspace(60, min(11000, sr / 2 - 1), 25)
band_of = np.digitize(freqs, edges) - 1
bands = np.stack([logspec[:, band_of == k].mean(axis=1) for k in range(24)], axis=1)
bar_db, bar_vec = [], []
for i, t in enumerate(bars):
    t2 = bars[i + 1] if i + 1 < len(bars) else dur
    lo, hi = int(t * env_fps), max(int(t2 * env_fps), int(t * env_fps) + 1)
    bar_db.append(float(np.median(frame_db[lo:hi])))
    bar_vec.append(bands[lo:hi].mean(axis=0))
bar_db = np.array(bar_db)
v = np.array(bar_vec)
v = v / (np.linalg.norm(v, axis=1, keepdims=True) + 1e-9)
novelty = 1 - (v[1:] * v[:-1]).sum(axis=1)
thresh = novelty.mean() + 1.25 * novelty.std() if len(novelty) else 99
sections = [0.0] + [float(bars[i + 1]) for i, nv in enumerate(novelty) if nv >= thresh]

# Drop-outs: stretches >= 60 ms more than 25 dB under the median level (stop-downs, breaks).
quiet = frame_db < (np.median(frame_db) - 25)
dropouts, start = [], None
for i, q in enumerate(np.append(quiet, False)):
    t = i / env_fps
    if q and start is None:
        start = t
    elif not q and start is not None:
        if t - start >= 0.06:
            dropouts.append((round(start, 3), round(t, 3)))
        start = None

fps = args.fps
fr = lambda t: int(round(t * fps))  # noqa: E731
out = {
    "fps": fps,
    "duration_s": round(dur, 3),
    "bpm": round(60 / period, 2),
    "beat_s": round(period, 4),
    "beat_frames": round(period * fps, 3),
    "downbeat_confidence": round(down_conf, 2),
    "beats": [{"t": round(float(t), 3), "frame": fr(t)} for t in beats],
    "bars": [{"t": round(float(t), 3), "frame": fr(t), "db": round(float(d), 1)} for t, d in zip(bars, bar_db)],
    "sections": [{"t": round(t, 3), "frame": fr(t)} for t in sections],
    "dropouts": [{"start": s, "end": e, "frame": fr(s)} for s, e in dropouts],
}
print(f"{args.wav}: {dur:.2f}s, {out['bpm']} BPM, beat {period*1000:.0f} ms = {period*fps:.2f} frames @ {fps:g} fps")
print(f"first downbeat {bars[0]:.3f}s (confidence {down_conf:.1f}; under ~1.0 means check by ear)")
print("bars:", " ".join(f"{b['t']:.2f}" for b in out["bars"]))
print("section changes:", " ".join(f"{s['t']:.2f}" for s in out["sections"]))
print("drop-outs:", " ".join(f"{d['start']:.2f}-{d['end']:.2f}" for d in out["dropouts"]) or "none")
if args.out:
    with open(args.out, "w") as f:
        json.dump(out, f, indent=1)
    print("wrote", args.out)
