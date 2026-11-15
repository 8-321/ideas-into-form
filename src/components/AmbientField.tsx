"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "./MotionProvider";

type Theme = "home" | "image" | "sound" | "experience";
type RGB = [number, number, number];

type Palette = {
  accent: RGB;
  ink: RGB;
  light: boolean;
};

const PALETTES: Record<Theme, Palette> = {
  home: { accent: [132, 147, 127], ink: [24, 24, 24], light: true },
  image: { accent: [132, 147, 127], ink: [24, 24, 24], light: true },
  sound: { accent: [201, 169, 106], ink: [239, 233, 220], light: false },
  experience: { accent: [147, 169, 181], ink: [233, 236, 238], light: false },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const rgba = (color: RGB, alpha: number) => `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;

function readTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  if (value === "image" || value === "sound" || value === "experience") return value;
  return "home";
}

export function AmbientField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let theme = readTheme();
    const pointer = { x: -2000, y: -2000, tx: -2000, ty: -2000, active: false };
    const motes = Array.from({ length: 44 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.52,
      drift: (Math.random() - 0.5) * 0.1,
    }));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const glow = (x: number, y: number, radius: number, alpha: number, palette: Palette) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, rgba(palette.accent, alpha));
      gradient.addColorStop(0.48, rgba(palette.accent, alpha * 0.26));
      gradient.addColorStop(1, rgba(palette.accent, 0));
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };

    const render = (now: number) => {
      if (!width || !height) return;
      if (!reduced) {
        if (!pointer.active) {
          pointer.tx = width * 0.74;
          pointer.ty = height * 0.2;
        }
        pointer.x += (pointer.tx - pointer.x) * 0.035;
        pointer.y += (pointer.ty - pointer.y) * 0.035;
      }
      const palette = PALETTES[theme];
      const driftX = Math.sin(now * 0.00011) * width * 0.025;
      const driftY = Math.cos(now * 0.00009) * height * 0.02;
      const x = pointer.active ? pointer.x : width * 0.74 + driftX;
      const y = pointer.active ? pointer.y : height * 0.2 + driftY;

      ctx.clearRect(0, 0, width, height);
      glow(x, y, Math.max(280, Math.min(width, height) * 0.56), palette.light ? 0.09 : 0.13, palette);
      glow(width * 0.12, height * 0.83, Math.max(220, Math.min(width, height) * 0.38), palette.light ? 0.035 : 0.06, palette);

      motes.forEach((mote) => {
        const mx = (mote.x * width + mote.drift * now * 0.006 + width) % width;
        const my = (mote.y * height + Math.sin(now * 0.00022 * mote.speed + mote.phase) * 18 + height) % height;
        const alpha = (palette.light ? 0.09 : 0.11) * (0.35 + 0.65 * Math.abs(Math.sin(now * 0.0007 * mote.speed + mote.phase)));
        ctx.globalAlpha = clamp(alpha * mote.z, 0, 0.12);
        ctx.fillStyle = rgba(palette.ink, 1);
        ctx.beginPath();
        ctx.arc(mx, my, 0.45 + mote.z * 0.55, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (pointer.active) {
        glow(pointer.x, pointer.y, Math.max(150, Math.min(width, height) * 0.22), palette.light ? 0.035 : 0.05, palette);
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (document.hidden) return;
      if (now - last > 32) {
        last = now;
        render(now);
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced) {
        render(0);
        return;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      if (reduced || event.pointerType === "touch") return;
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      pointer.active = true;
    };

    const onLeave = () => {
      pointer.active = false;
    };

    const onResize = () => {
      resize();
      render(performance.now());
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        start();
      }
    };

    const observer = new MutationObserver(() => {
      theme = readTheme();
      render(performance.now());
    });

    resize();
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div className="ambient-field" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}