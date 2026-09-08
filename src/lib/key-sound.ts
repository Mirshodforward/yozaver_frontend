import type { KeySoundId } from "./preferences";
export class KeySoundPlayer {
  private context: AudioContext | null = null;
  private buffers = new Map<KeySoundId, AudioBuffer>();
  private active = new Set<AudioBufferSourceNode>();
  async play(id: KeySoundId, volume: number) {
    if (volume <= 0) return;
    if (!this.context || this.context.state === "closed") {
      this.context = new AudioContext();
      this.buffers.clear();
    }
    const context = this.context;
    if (context.state !== "running") await context.resume();
    if (context !== this.context || context.state !== "running") return;
    let buffer = this.buffers.get(id);
    if (!buffer) {
      const duration =
        id === "typewriter"
          ? 0.11
          : id === "bubble"
            ? 0.12
            : id === "digital"
              ? 0.07
              : 0.055;
      buffer = context.createBuffer(
        1,
        Math.round(context.sampleRate * duration),
        context.sampleRate,
      );
      const values = buffer.getChannelData(0);
      let seed = 351,
        filtered = 0;
      for (let i = 0; i < values.length; i++) {
        const t = i / context.sampleRate;
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const noise = seed / 2147483648 - 1;
        filtered = 0.65 * filtered + 0.35 * noise;
        const attack = Math.min(1, t / 0.0015);
        let value = 0;
        switch (id) {
          case "soft":
            value =
              (filtered * 0.7 + Math.sin(2 * Math.PI * 280 * t) * 0.15) *
              Math.exp(-t * 110);
            break;
          case "mechanical":
            value =
              (noise * 0.55 + Math.sin(2 * Math.PI * 1600 * t) * 0.2) *
              Math.exp(-t * 105);
            break;
          case "typewriter":
            value =
              (noise * 0.45 + Math.sin(2 * Math.PI * 2200 * t) * 0.18) *
              (Math.exp(-t * 130) +
                (t > 0.035 ? 0.5 * Math.exp(-(t - 0.035) * 100) : 0));
            break;
          case "wood":
            value =
              (Math.sin(2 * Math.PI * 430 * t) +
                0.25 * Math.sin(2 * Math.PI * 930 * t)) *
              Math.exp(-t * 90) *
              0.55;
            break;
          case "bubble":
            value =
              Math.sin(2 * Math.PI * (800 * t - 2300 * t * t)) *
              Math.exp(-t * 42) *
              0.65;
            break;
          case "digital":
            value =
              (Math.sin(2 * Math.PI * 1050 * t) +
                0.2 * Math.sin(2 * Math.PI * 2100 * t)) *
              Math.exp(-t * 65) *
              0.5;
            break;
        }
        values[i] = value * attack * Math.min(1, (duration - t) / 0.005);
      }
      this.buffers.set(id, buffer);
    }
    if (this.active.size >= 8) {
      const oldest = this.active.values().next().value;
      if (oldest) {
        oldest.stop();
        this.active.delete(oldest);
      }
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = Math.min(1, Math.max(0, volume)) * 0.55;
    source.connect(gain);
    gain.connect(context.destination);
    this.active.add(source);
    source.onended = () => {
      this.active.delete(source);
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }
  close() {
    for (const source of this.active) {
      try {
        source.stop();
      } catch {}
    }
    this.active.clear();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
    this.buffers.clear();
  }
}
