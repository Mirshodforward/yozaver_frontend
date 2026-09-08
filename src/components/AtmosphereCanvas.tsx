"use client";
import { useEffect, useRef } from "react";

type Mode = "matrix" | "fireflies";
// Both scenes use absolute elapsed time, so pausing preserves the composition.
export function AtmosphereCanvas({
  mode,
  paused,
}: {
  mode: Mode;
  paused: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elapsedRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    let width = 1,
      height = 1,
      frame = 0,
      previous = 0;
    let seed = 819;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const particles = Array.from({ length: 64 }, () => ({
      x: random(),
      y: random(),
      phase: random() * Math.PI * 2,
      depth: random(),
      speed: 0.16 + random() * 0.18,
      warm: random() > 0.22,
    }));
    const alphabet = "YOZAVER01<>+*{}[]/UZ";
    const streams = Array.from({ length: 36 }, () => ({
      offset: random(),
      speed: 22 + random() * 29,
      length: 9 + Math.floor(random() * 11),
      glyphs: Array.from(
        { length: 28 },
        () => alphabet[Math.floor(random() * alphabet.length)],
      ),
    }));
    const sprites = ["255,205,121", "138,222,205"].map((color) => {
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = 64;
      const paint = sprite.getContext("2d");
      if (paint) {
        const glow = paint.createRadialGradient(32, 32, 0, 32, 32, 32);
        glow.addColorStop(0, `rgba(${color},1)`);
        glow.addColorStop(0.08, `rgba(${color},.95)`);
        glow.addColorStop(0.25, `rgba(${color},.3)`);
        glow.addColorStop(1, `rgba(${color},0)`);
        paint.fillStyle = glow;
        paint.fillRect(0, 0, 64, 64);
      }
      return sprite;
    });
    function drawRain(seconds: number) {
      if (!ctx) return;
      const columns = Math.max(8, Math.min(36, Math.floor(width / 37)));
      const cell = width / columns;
      const fontSize = width < 600 ? 13 : 15;
      ctx.font = `400 ${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let column = 0; column < columns; column++) {
        const stream = streams[column];
        const travel = height + stream.length * 23;
        const head = (seconds * stream.speed + stream.offset * travel) % travel;
        for (let row = 0; row < stream.length; row++) {
          const y = head - row * 23;
          if (y < -fontSize || y > height) continue;
          const opacity =
            row === 0 ? 0.7 : (1 - row / stream.length) ** 2 * 0.32;
          ctx.fillStyle =
            row === 0
              ? `rgba(194,251,219,${opacity})`
              : `rgba(94,188,147,${opacity})`;
          const glyph =
            stream.glyphs[
              (row + Math.floor(seconds * 0.6 + stream.offset * 20)) %
                stream.glyphs.length
            ];
          ctx.fillText(glyph, cell * (column + 0.5), y);
        }
      }
    }
    function drawFireflies(seconds: number) {
      if (!ctx) return;
      for (const particle of particles) {
        const t = seconds * particle.speed + particle.phase;
        const x = particle.x * width + Math.sin(t) * width * 0.065;
        const y = particle.y * height + Math.cos(t * 0.73) * height * 0.065;
        const size = 9 + particle.depth ** 2 * 33;
        const glow = (Math.sin(t * 1.5) + 1) * 0.17 + 0.26;
        ctx.globalAlpha = glow;
        ctx.drawImage(
          sprites[particle.warm ? 0 : 1],
          x - size * 0.5,
          y - size * 0.5,
          size,
          size,
        );
        if (particle.depth > 0.55) {
          ctx.globalAlpha = glow * 0.35;
          ctx.strokeStyle = particle.warm ? "#e9c58a" : "#8fd2c6";
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(
            x - Math.cos(t) * 8,
            y + Math.sin(t) * 8,
            x - Math.cos(t) * 17,
            y + Math.sin(t * 0.73) * 16,
          );
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    function draw(time: number) {
      if (!ctx) return;
      if (!paused && previous && time - previous < 1000 / 24) {
        frame = requestAnimationFrame(draw);
        return;
      }
      if (!paused && previous)
        elapsedRef.current += Math.min((time - previous) / 1000, 0.1);
      previous = time;
      ctx.clearRect(0, 0, width, height);
      if (mode === "matrix") drawRain(elapsedRef.current);
      else drawFireflies(elapsedRef.current);
      if (!paused) frame = requestAnimationFrame(draw);
    }
    function resize() {
      if (!canvas || !ctx) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      cancelAnimationFrame(frame);
      previous = 0;
      draw(performance.now());
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [mode, paused]);
  return (
    <canvas ref={canvasRef} className="atmosphere-canvas" data-scene={mode} />
  );
}
