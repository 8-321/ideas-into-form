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
  home: { accent: [126, 176, 154], ink: [24, 24, 24], light: true },
  image: { accent: [126, 176, 154], ink: [24, 24, 24], light: true },
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
    const dust = Array.from({ length: 96 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.25 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 0.16,
      index,
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
      gradient.addColorStop(0.52, rgba(palette.accent, alpha * 0.34));
      gradient.addColorStop(1, rgba(palette.accent, 0));
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };

    const pointerTarget = () => ({
      x: pointer.active ? pointer.x : width * 0.76,
      y: pointer.active ? pointer.y : height * 0.2,
    });

    const drawPaper = (now: number, palette: Palette) => {
      const target = pointerTarget();
      glow(target.x, target.y, Math.max(240, Math.min(width, height) * 0.46), palette.light ? 0.085 : 0.12, palette);

      const spacing = width < 760 ? 30 : 42;
      const driftX = Math.sin(now * 0.00012) * 4;
      const driftY = Math.cos(now * 0.0001) * 3;
      const offsetX = ((now * 0.0022) % spacing) - spacing;
      const offsetY = ((now * -0.0015) % spacing) - spacing;

      for (let x = offsetX; x < width + spacing; x += spacing) {
        for (let y = offsetY; y < height + spacing; y += spacing) {
          const bx = x + driftX + Math.sin(y * 0.012 + now * 0.00036) * 2.2;
          const by = y + driftY + Math.cos(x * 0.011 - now * 0.0003) * 2.4;
          const dx = bx - pointer.x;
          const dy = by - pointer.y;
          const distance = Math.hypot(dx, dy);
          const pull = clamp(1 - distance / 250, 0, 1);
          const angle = Math.atan2(dy, dx);
          const px = bx + Math.cos(angle) * pull * pull * 20;
          const py = by + Math.sin(angle) * pull * pull * 20;
          const pulse = 0.5 + 0.5 * Math.sin(now * 0.0007 + (x + y) * 0.01);
          const alpha = 0.045 + pulse * 0.026 + pull * 0.12;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = pull > 0.12 ? rgba(palette.accent, 1) : rgba(palette.ink, 1);
          ctx.beginPath();
          ctx.arc(px, py, 0.75 + pull * 1.55, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      for (let line = 0; line < 5; line += 1) {
        ctx.beginPath();
        for (let x = -40; x <= width + 40; x += 22) {
          const base = height * (0.2 + line * 0.15);
          const y = base + Math.sin(x * 0.004 + now * 0.00029 + line * 0.8) * (14 + line * 3);
          if (x === -40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(palette.ink, 0.028 + line * 0.004);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      dust.slice(0, 54).forEach((dot) => {
        const x = (dot.x * width + dot.drift * now * 0.006 + width) % width;
        const y = (dot.y * height + Math.sin(now * 0.00032 * dot.speed + dot.phase) * 24 + height) % height;
        const flicker = 0.18 + 0.18 * Math.sin(now * 0.0012 * dot.speed + dot.phase);
        ctx.globalAlpha = flicker * dot.z;
        ctx.fillStyle = rgba(palette.ink, 1);
        ctx.beginPath();
        ctx.arc(x, y, 0.55 + dot.z * 0.55, 0, Math.PI * 2);
        ctx.fill();
      });

      if (pointer.active) {
        ctx.globalAlpha = 0.28;
        ctx.strokeStyle = rgba(palette.accent, 1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 24 + Math.sin(now * 0.002) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const drawSound = (now: number, palette: Palette) => {
      const baseX = width * (width < 760 ? 0.54 : 0.77);
      const baseY = height * (width < 760 ? 0.38 : 0.44);
      const px = pointer.active ? pointer.x : baseX;
      const py = pointer.active ? pointer.y : baseY;
      glow(px, py, Math.max(280, Math.min(width, height) * 0.62), 0.14, palette);

      const cx = baseX + (pointer.active ? (pointer.x - baseX) * 0.03 : 0);
      const cy = baseY + (pointer.active ? (pointer.y - baseY) * 0.03 : 0);
      const tilt = -0.12 + Math.sin(now * 0.00012) * 0.018;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.scale(1, 0.72);
      for (let ring = 0; ring < 22; ring += 1) {
        const radius = 38 + ring * (width < 760 ? 18 : 25) + Math.sin(now * 0.00045 + ring * 0.34) * 5;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(palette.accent, 0.026 + (ring % 5 === 0 ? 0.032 : 0));
        ctx.lineWidth = ring % 7 === 0 ? 1.1 : 0.7;
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(width * 0.03, height * 0.84);
      for (let line = 0; line < 2; line += 1) {
        ctx.beginPath();
        for (let x = 0; x <= width * 0.94; x += 12) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y = line * 18 + Math.sin(x * 0.018 + now * 0.0013 + line) * 8 * envelope;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(palette.accent, 0.1 - line * 0.035);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      dust.slice(0, 72).forEach((dot) => {
        const x = (dot.x * width + dot.drift * now * 0.008 + width) % width;
        const y = (dot.y * height + Math.sin(now * 0.00022 * dot.speed + dot.phase) * 32 + height) % height;
        ctx.globalAlpha = (0.13 + 0.18 * Math.sin(now * 0.0009 * dot.speed + dot.phase)) * dot.z;
        ctx.fillStyle = rgba(palette.accent, 1);
        ctx.beginPath();
        ctx.arc(x, y, 0.6 + dot.z * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      if (pointer.active) {
        ctx.globalAlpha = 0.24;
        ctx.strokeStyle = rgba(palette.accent, 1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 32 + Math.sin(now * 0.0018) * 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const drawExperience = (now: number, palette: Palette) => {
      const target = pointerTarget();
      glow(target.x, target.y, Math.max(260, Math.min(width, height) * 0.56), 0.14, palette);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let beam = 0; beam < 3; beam += 1) {
        const shift = Math.sin(now * 0.00016 + beam * 1.8) * width * 0.03;
        const gradient = ctx.createLinearGradient(width * 0.12 + shift, 0, width * 0.72 + shift, height * 0.78);
        gradient.addColorStop(0, rgba(palette.accent, 0.055));
        gradient.addColorStop(0.44, rgba(palette.accent, 0.012));
        gradient.addColorStop(1, rgba(palette.accent, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(width * (0.18 + beam * 0.045) + shift, -40);
        ctx.lineTo(width * (0.28 + beam * 0.045) + shift, -40);
        ctx.lineTo(width * (0.68 + beam * 0.03) + shift, height * 0.92);
        ctx.lineTo(width * (0.5 + beam * 0.03) + shift, height * 0.92);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      const scanGap = 30;
      const scanOffset = (now * 0.012) % scanGap;
      for (let y = -scanGap + scanOffset; y < height + scanGap; y += scanGap) {
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = rgba(palette.accent, 1);
        ctx.fillRect(0, y, width, 1);
      }

      for (let frame = 0; frame < 5; frame += 1) {
        const fw = width * (0.075 + frame * 0.007);
        const fh = fw * 0.62;
        const fx = width * (0.7 + (frame % 3) * 0.065) + Math.sin(now * 0.00014 + frame) * 10;
        const fy = height * (0.12 + frame * 0.145) + Math.cos(now * 0.00011 + frame) * 8;
        ctx.globalAlpha = 0.028 + frame * 0.006;
        ctx.strokeStyle = rgba(palette.ink, 1);
        ctx.lineWidth = 1;
        ctx.strokeRect(fx, fy, fw, fh);
        ctx.globalAlpha = 0.018;
        ctx.fillStyle = rgba(palette.accent, 1);
        ctx.fillRect(fx, fy, fw, fh);
      }

      dust.slice(0, 76).forEach((dot) => {
        const x = (dot.x * width + Math.sin(now * 0.0002 * dot.speed + dot.phase) * 18 + width) % width;
        const y = (dot.y * height + Math.cos(now * 0.00023 * dot.speed + dot.phase) * 22 + height) % height;
        ctx.globalAlpha = (0.1 + 0.12 * Math.sin(now * 0.0011 * dot.speed + dot.phase)) * dot.z;
        ctx.fillStyle = rgba(palette.ink, 1);
        ctx.beginPath();
        ctx.arc(x, y, 0.5 + dot.z * 0.65, 0, Math.PI * 2);
        ctx.fill();
      });

      if (pointer.active) {
        const hx = pointer.x;
        const hy = pointer.y;
        ctx.globalAlpha = 0.16;
        ctx.strokeStyle = rgba(palette.accent, 1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx - 18, hy);
        ctx.lineTo(hx + 18, hy);
        ctx.moveTo(hx, hy - 18);
        ctx.lineTo(hx, hy + 18);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const render = (now: number) => {
      if (!width || !height) return;
      if (!reduced) {
        if (!pointer.active) {
          pointer.tx = width * 0.76;
          pointer.ty = height * 0.2;
        }
        pointer.x += (pointer.tx - pointer.x) * 0.035;
        pointer.y += (pointer.ty - pointer.y) * 0.035;
      }
      const palette = PALETTES[theme];
      ctx.clearRect(0, 0, width, height);
      if (theme === "sound") drawSound(now, palette);
      else if (theme === "experience") drawExperience(now, palette);
      else drawPaper(now, palette);
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
      if (reduced) return;
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      pointer.active = true;
    };

    const onLeave = () => {
      pointer.active = false;
      pointer.tx = width * 0.76;
      pointer.ty = height * 0.2;
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
