/** Original Yozaver ambient loop. Run: node scripts/generate-ambient.mjs */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const rate = 22050;
const variants = [
  {
    id: "sokin-ohang",
    seconds: 24,
    transpose: 1,
    pattern: [0, 2, 1, 3, 2, 1, 3, 2],
    noise: 0,
    beat: false,
  },
  {
    id: "tong",
    seconds: 21.3333,
    transpose: 1.259921,
    pattern: [0, 1, 2, 3, 2, 3, 1, 2],
    noise: 0,
    beat: false,
  },
  {
    id: "tun",
    seconds: 32,
    transpose: 0.749154,
    pattern: [0, 3, 1, 2, 0, 2, 1, 3],
    noise: 0,
    beat: false,
  },
  {
    id: "yomgir",
    seconds: 28,
    transpose: 1.122462,
    pattern: [3, 1, 2, 0, 3, 2, 1, 0],
    noise: 0.045,
    beat: false,
  },
  {
    id: "dengiz",
    seconds: 32,
    transpose: 0.890899,
    pattern: [0, 2, 3, 1, 2, 0, 1, 3],
    noise: 0.11,
    beat: false,
  },
  {
    id: "lofi",
    seconds: 24,
    transpose: 0.943874,
    pattern: [0, 2, 1, 2, 3, 1, 2, 1],
    noise: 0,
    beat: true,
  },
];
for (const variant of variants) {
  const seconds = variant.seconds;
  const length = Math.round(rate * seconds);
  const samples = new Float64Array(length);
  const tau = Math.PI * 2;
  const chords = [
    [130.8128, 164.8138, 195.9977, 246.9417],
    [110, 130.8128, 164.8138, 195.9977],
    [87.3071, 130.8128, 174.6141, 220],
    [97.9989, 146.8324, 195.9977, 261.6256],
  ];
  const pattern = variant.pattern;
  const beatLength = seconds / 32;

  // Wrap note/reverb tails into the beginning for a continuous loop.
  function mix(start, duration, frequency, amplitude, pad = false) {
    const offset = Math.round(start * rate);
    for (let i = 0; i < Math.round(duration * rate); i++) {
      const time = i / rate;
      const envelope = pad
        ? Math.min(1, time / 0.8) * Math.min(1, (duration - time) / 1.4)
        : (1 - Math.exp(-time * 65)) *
          Math.exp(-time * 1.45) *
          Math.min(1, (duration - time) / 0.18);
      const phase = tau * frequency * variant.transpose * time;
      const tone =
        Math.sin(phase) +
        (pad ? 0.06 : 0.22) * Math.sin(2 * phase) +
        (pad ? 0 : 0.055) * Math.sin(3 * phase);
      samples[(offset + i) % length] += tone * envelope * amplitude;
    }
  }
  for (let bar = 0; bar < 4; bar++) {
    const chord = chords[bar];
    for (const frequency of chord.slice(0, 3))
      mix(
        bar * beatLength * 8,
        beatLength * 10,
        frequency,
        variant.id === "tun" ? 0.075 : 0.052,
        true,
      );
    for (let beat = 0; beat < 8; beat++) {
      const frequency = chord[pattern[beat]] * 2;
      const start = bar * beatLength * 8 + beat * beatLength;
      mix(start, 3, frequency, 0.19);
      mix(start + 0.375, 3, frequency, 0.045);
      mix(start + 0.75, 3, frequency, 0.018);
    }
  }
  let seed = 743;
  const noise = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2147483648 - 1;
  };
  let previous = 0;
  for (let i = 0; i < length; i++) {
    const t = i / rate;
    previous = 0.98 * previous + 0.02 * noise();
    if (variant.noise) {
      const shape =
        variant.id === "dengiz"
          ? 0.25 + 0.75 * Math.pow(Math.sin((Math.PI * t) / (seconds / 4)), 2)
          : 0.65 + 0.35 * Math.sin(((tau * t) / seconds) * 5) ** 2;
      samples[i] += previous * variant.noise * 12 * shape;
    }
    if (variant.beat) {
      const pos = t % (beatLength * 2);
      samples[i] +=
        0.17 *
        Math.sin(tau * (55 * pos + 1.5 * (1 - Math.exp(-pos * 30)))) *
        Math.exp(-pos * 17);
      const hat = t % beatLength;
      samples[i] += 0.028 * noise() * Math.exp(-hat * 90);
    }
  }
  let sum = 0,
    peak = 0;
  for (const sample of samples) {
    sum += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }
  const gain = Math.min(0.17 / Math.sqrt(sum / length), 0.78 / peak);
  const wav = Buffer.alloc(44 + length * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + length * 2, 4);
  wav.write("WAVE", 8);
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(length * 2, 40);
  for (let i = 0; i < length; i++)
    wav.writeInt16LE(Math.round(samples[i] * gain * 32767), 44 + i * 2);
  const output = new URL(`../public/audio/${variant.id}.wav`, import.meta.url);
  mkdirSync(fileURLToPath(new URL(".", output)), { recursive: true });
  writeFileSync(output, wav);
  console.log(
    JSON.stringify({
      file: fileURLToPath(output),
      seconds,
      bytes: wav.length,
      rms: Math.sqrt(sum / length) * gain,
      peak: peak * gain,
    }),
  );
}
