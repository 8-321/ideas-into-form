"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/MotionProvider";

type V3 = [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
const RAW: V3[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];
const FACES = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];
const VERTS: V3[] = RAW.map((v) => {
  const len = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / len, v[1] / len, v[2] / len];
});
const EDGES: [number, number][] = [];
FACES.forEach((face) => {
  for (let i = 0; i < 3; i++) {
    const a = face[i];
    const b = face[(i + 1) % 3];
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!EDGES.some(([x, y]) => (x < y ? `${x}-${y}` : `${y}-${x}`) === key)) EDGES.push([a, b]);
  }
});

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

function rotate(v: V3, rx: number, ry: number): V3 {
  const [x, y, z] = v;
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const y1 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  return [x1, y1, z2];
}

export function OriginCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const hero = canvas.closest(".hero") as HTMLElement | null;
    const stage = canvas.parentElement;

    let w = 0, h = 0, dpr = 1;
    let raf = 0;
    let start = performance.now();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const panda = new Image();
    panda.src = "/media/image/panda/panda-original@thumb.webp";
    let pandaReady = false;
    panda.onload = () => { pandaReady = true; };
    const days = new Image();
    days.src = "/media/image/days/02-14@thumb.webp";
    let daysReady = false;
    days.onload = () => { daysReady = true; };

    const resize = () => {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(1.75, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      pointer.ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const draw = (now: number) => {
      if (!w || !h) return;
      if (!reduced) {
        pointer.x += (pointer.tx - pointer.x) * 0.045;
        pointer.y += (pointer.ty - pointer.y) * 0.045;
      }

      let p = 0;
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const total = Math.max(1, hero.offsetHeight - window.innerHeight);
        p = Math.min(1, Math.max(0, -rect.top / total));
        hero.style.setProperty("--p", p.toFixed(4));
      }

      const t = reduced ? 1200 : now - start;
      const intro = reduced ? 1 : easeOut(Math.min(1, t / 1700));
      const scatter = smooth(0.46, 0.98, p);
      const reveal = smooth(0.6, 0.94, p);
      const sculp = 1 - smooth(0.5, 0.88, p);

      ctx.clearRect(0, 0, w, h);

      const mobile = w < 760;
      const cx = mobile ? w * 0.5 : w * 0.54;
      const cy = mobile ? h * 0.46 : h * 0.49;
      const R = Math.min(w, h) * (mobile ? 0.26 : 0.29);

      const ry = (reduced ? 0.55 : t * 0.00009) + pointer.x * (reduced ? 0 : 0.55) + p * 0.6;
      const rx = -0.18 + pointer.y * (reduced ? 0 : 0.38) + Math.sin(t * 0.00018) * 0.05;

      const project = (v: V3) => {
        const r = rotate(v, rx, ry);
        const f = 2.5 / (2.5 - r[2]);
        return { x: cx + r[0] * R * f, y: cy + r[1] * R * f, z: r[2], f };
      };

      const pts = VERTS.map((v, i) => {
        const base = project(v);
        const ang = i * 2.399 + 0.7;
        const mag = scatter * R * (0.9 + (i % 4) * 0.18);
        return {
          ...base,
          x: base.x + Math.cos(ang) * mag + scatter * pointer.x * 22,
          y: base.y + Math.sin(ang) * mag + scatter * pointer.y * 16,
        };
      });

      // faint coordinate crosses
      ctx.save();
      ctx.strokeStyle = "rgba(24,24,24,.16)";
      ctx.lineWidth = 0.7;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 6; j++) {
          const x = (w / 10) * (i + 0.5) + pointer.x * (i - 4) * 2.2;
          const y = (h / 7) * (j + 0.8) + pointer.y * (j - 2.5) * 2.2;
          const s = 2.2;
          ctx.beginPath();
          ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
          ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
          ctx.stroke();
        }
      }
      ctx.restore();

      // rings
      const rings = [
        { axis: 0, tilt: 0.12, radius: 1.55, alpha: 0.24 },
        { axis: 1, tilt: 1.05, radius: 1.78, alpha: 0.16 },
        { axis: 2, tilt: 2.1, radius: 2.02, alpha: 0.1 },
      ];
      rings.forEach((ring, ri) => {
        ctx.beginPath();
        const count = 84;
        for (let i = 0; i <= count; i++) {
          const a = (i / count) * Math.PI * 2;
          let v: V3 = [Math.cos(a) * ring.radius, Math.sin(a) * ring.radius, 0];
          if (ring.axis === 0) v = [v[0], v[1] * Math.cos(ring.tilt) - v[2] * Math.sin(ring.tilt), v[1] * Math.sin(ring.tilt) + v[2] * Math.cos(ring.tilt)];
          if (ring.axis === 1) v = [v[0] * Math.cos(ring.tilt) + v[2] * Math.sin(ring.tilt), v[1], -v[0] * Math.sin(ring.tilt) + v[2] * Math.cos(ring.tilt)];
          if (ring.axis === 2) v = [v[0] * Math.cos(ring.tilt) - v[1] * Math.sin(ring.tilt), v[0] * Math.sin(ring.tilt) + v[1] * Math.cos(ring.tilt), v[2]];
          const pt = project(v);
          const scaleOut = 1 + scatter * (1.4 + ri * 0.2);
          const x = cx + (pt.x - cx) * scaleOut;
          const y = cy + (pt.y - cy) * scaleOut;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(24,24,24,${ring.alpha * intro * (1 - scatter * 0.8)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // faces
      const faces = FACES.map((face) => ({ face, z: (VERTS[face[0]][2] + VERTS[face[1]][2] + VERTS[face[2]][2]) / 3 }))
        .sort((a, b) => a.z - b.z);
      faces.forEach(({ face }) => {
        const a = pts[face[0]], b = pts[face[1]], c = pts[face[2]];
        const depth = (a.z + b.z + c.z) / 3;
        const alpha = (0.035 + Math.max(0, depth) * 0.11) * intro * sculp;
        if (alpha <= 0.002) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = `rgba(165,203,185,${alpha})`;
        ctx.fill();
      });

      // edges
      EDGES.forEach(([ai, bi]) => {
        const a = pts[ai], b = pts[bi];
        const alpha = (0.13 + ((a.z + b.z) / 2 + 1) * 0.11) * intro * (1 - scatter * 0.92);
        if (alpha <= 0.003) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(24,24,24,${alpha})`;
        ctx.lineWidth = 0.8 + intro * 0.25;
        ctx.stroke();
      });

      // vertices
      pts.forEach((pt, i) => {
        const alpha = intro * (1 - scatter * 0.9);
        if (alpha <= 0.01) return;
        const r = (i % 3 === 0 ? 2.5 : 1.6) * (0.4 + intro * 0.6);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 === 0 ? "rgba(110,156,136,.9)" : `rgba(24,24,24,${0.5 * alpha})`;
        ctx.fill();
        if (scatter > 0.15) {
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x + Math.cos(i * 2.1) * 24 * scatter, pt.y + Math.sin(i * 2.1) * 24 * scatter);
          ctx.strokeStyle = `rgba(24,24,24,${0.14 * scatter})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      });

      // center origin
      const pulse = reduced ? 0 : (Math.sin(t * 0.0018) + 1) / 2;
      const centerAlpha = intro * (1 - scatter * 0.95);
      if (centerAlpha > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, 12 + pulse * 16, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110,156,136,${0.26 * centerAlpha * (1 - pulse * 0.6)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5 + pulse * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(24,24,24,${0.9 * centerAlpha})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244,242,236,${centerAlpha})`;
        ctx.fill();
      }

      // image reveal
      if (reveal > 0.001) {
        const imgR = (mobile ? Math.min(w, h) * 0.34 : R * 1.5) * easeOut(reveal);
        const ix = mobile ? cx : cx + R * 0.92;
        const iy = mobile ? cy + R * 0.35 : cy;
        const drawCircle = (img: HTMLImageElement, ready: boolean, x: number, y: number, r: number, alpha: number) => {
          if (!ready || r <= 0) return;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.globalAlpha = alpha;
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, x - r, y - r, r * 2, r * 2);
          ctx.restore();
        };
        ctx.save();
        ctx.beginPath();
        ctx.arc(ix, iy, imgR + 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(244,242,236,.9)";
        ctx.fill();
        ctx.restore();
        drawCircle(panda, pandaReady, ix, iy, imgR, 0.96 * reveal);
        ctx.beginPath();
        ctx.arc(ix, iy, imgR + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(24,24,24,${0.24 * reveal})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ix, iy, imgR + 22 + Math.sin(t * 0.0012) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165,203,185,${0.75 * reveal})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        const smallR = imgR * 0.38;
        const sx2 = ix - imgR * 1.35;
        const sy2 = iy + imgR * 0.72;
        drawCircle(days, daysReady, sx2, sy2, smallR * reveal, 0.92 * reveal);
        ctx.beginPath();
        ctx.arc(sx2, sy2, smallR * reveal + 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(24,24,24,${0.18 * reveal})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    if (reduced) draw(performance.now() + 1700);
    else loop(performance.now());

    const ro = new ResizeObserver(() => { resize(); if (reduced) draw(performance.now()); });
    if (stage) ro.observe(stage);
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={ref} className="origin-canvas" aria-hidden="true" />;
}