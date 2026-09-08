"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { BackgroundEffect } from "@/lib/preferences";
import { AtmosphereCanvas } from "./AtmosphereCanvas";

// The scene is mounted only on the practice route and imported on demand.
export default function PremiumBackground({
  effect,
  reduced,
}: {
  effect: Exclude<BackgroundEffect, "none">;
  reduced: boolean;
}) {
  const [paused, setPaused] = useState(reduced);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(reduced || media.matches || document.hidden);
    update();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [reduced]);
  return (
    <div
      className={`premium-background scene-${effect}`}
      data-paused={paused}
      aria-hidden="true"
    >
      {effect === "aurora" && (
        <div className="aurora-curtains">
          <i />
          <i />
          <i />
        </div>
      )}
      {effect === "orbit" && (
        <div className="orbital-space">
          <div className="orbital-sun" />
          <div className="orbit-ring ring-one">
            <i />
          </div>
          <div className="orbit-ring ring-two">
            <i />
          </div>
          <div className="orbit-ring ring-three">
            <i />
          </div>
          <div className="orbital-dust" />
        </div>
      )}
      {effect === "waves" && (
        <div className="ocean-ribbons">
          {Array.from({ length: 5 }, (_, i) => (
            <i key={i} style={{ "--ribbon": i } as CSSProperties} />
          ))}
        </div>
      )}
      {effect === "prism" && (
        <div className="prism-space">
          {Array.from({ length: 4 }, (_, i) => (
            <div className={`prism-position prism-position-${i}`} key={i}>
              <div className="glass-prism">
                {Array.from({ length: 6 }, (_, face) => (
                  <i key={face} className={`prism-face face-${face}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {effect === "stars" && <Starfield paused={paused} />}
      {effect === "mercury" && (
        <div className="mercury-studio">
          <div className="mercury-horizon" />
          <div className="liquid-metal metal-one">
            <i />
          </div>
          <div className="liquid-metal metal-two">
            <i />
          </div>
          <div className="metal-orbit">
            <i />
          </div>
        </div>
      )}
      {effect === "tunnel" && (
        <div className="neon-perspective">
          <div className="neon-flight">
            {Array.from({ length: 12 }, (_, i) => (
              <i
                className="neon-gate"
                key={i}
                style={{ "--gate": i } as CSSProperties}
              />
            ))}
          </div>
        </div>
      )}
      {effect === "kinetic" && (
        <div className="kinetic-gallery">
          <div className="kinetic-halo" />
          <div className="kinetic-sculpture">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={{ "--hoop": i } as CSSProperties} />
            ))}
          </div>
          <div className="kinetic-reflection" />
        </div>
      )}
      {(effect === "matrix" || effect === "fireflies") && (
        <AtmosphereCanvas key={effect} mode={effect} paused={paused} />
      )}
      <div className="premium-vignette" />
    </div>
  );
}

function Starfield({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    let width = 1,
      height = 1,
      frame = 0,
      previous = 0;
    let seed = 714;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const stars = Array.from({ length: 120 }, () => ({
      x: random() * 2 - 1,
      y: random() * 2 - 1,
      z: random() * 0.9 + 0.1,
      radius: random() + 0.4,
    }));
    function draw(time: number) {
      if (!ctx) return;
      if (!paused && time - previous < 1000 / 30) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const delta = previous ? Math.min((time - previous) / 1000, 0.08) : 0;
      previous = time;
      ctx.clearRect(0, 0, width, height);
      const scale = Math.max(width, height) * 0.46;
      for (const star of stars) {
        if (!paused) {
          star.z -= delta * 0.018;
          if (star.z < 0.08) star.z = 1;
        }
        const x = width * 0.5 + (star.x * scale) / star.z;
        const y = height * 0.42 + (star.y * scale) / star.z;
        if (x < 0 || x > width || y < 0 || y > height) continue;
        ctx.beginPath();
        ctx.fillStyle = `rgba(201,218,255,${Math.min(0.7, (1 - star.z) * 0.8 + 0.1)})`;
        ctx.arc(
          x,
          y,
          Math.min(2.5, (star.radius / star.z) * 0.55),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
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
  }, [paused]);
  return <canvas ref={canvasRef} className="starfield-canvas" />;
}
