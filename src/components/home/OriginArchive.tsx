"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/MotionProvider";

type CardSpec = {
  src: string;
  alt: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

const CARD_WIDTH = 2.26;
const CARD_HEIGHT = 2.86;
const CARD_DEPTH = 0.13;
const ART_WIDTH = 1200;
const ART_HEIGHT = 1520;

const CARDS: CardSpec[] = [
  {
    src: "/media/image/panda/panda-original@thumb.webp",
    alt: "小含熊猫角色",
    position: [0.62, -0.02, 0.14],
    rotation: [0.008, -0.025, 0.012],
  },
  {
    src: "/media/image/soundCovers/cover-main@thumb.webp",
    alt: "万丈红尘声音封面",
    position: [0.02, 0.08, -0.08],
    rotation: [0.012, 0.005, -0.016],
  },
  {
    src: "/media/image/campus/arch-01@thumb.webp",
    alt: "长理建筑线稿",
    position: [-0.58, 0.18, -0.3],
    rotation: [0.018, 0.03, -0.03],
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
};
const damp = (current: number, target: number, lambda: number, delta: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * delta));

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Image failed: ${src}`));
    image.src = src;
  });
}

async function makeMatteTexture(
  THREE: typeof import("three"),
  src: string,
  anisotropy: number
): Promise<import("three").CanvasTexture> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = ART_WIDTH;
  canvas.height = ART_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");

  context.fillStyle = "#f7f3e9";
  context.fillRect(0, 0, ART_WIDTH, ART_HEIGHT);
  context.fillStyle = "#fbf8f1";
  context.fillRect(54, 54, ART_WIDTH - 108, ART_HEIGHT - 108);
  context.strokeStyle = "rgba(28, 27, 24, 0.12)";
  context.lineWidth = 2;
  context.strokeRect(54, 54, ART_WIDTH - 108, ART_HEIGHT - 108);

  const boxX = 118;
  const boxY = 132;
  const boxW = ART_WIDTH - 236;
  const boxH = ART_HEIGHT - 264;
  const scale = Math.min(boxW / image.naturalWidth, boxH / image.naturalHeight);
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;
  const drawX = (ART_WIDTH - drawW) / 2;
  const drawY = (ART_HEIGHT - drawH) / 2;
  context.drawImage(image, drawX, drawY, drawW, drawH);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

export function OriginArchive() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const liveRef = useRef(false);
  const [live, setLive] = useState(false);
  const { reduced } = useMotion();

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const init = async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        return;
      }
      if (cancelled) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      } catch {
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
      camera.position.set(0, 0, 7.9);

      const archive = new THREE.Group();
      archive.position.set(0.12, -0.1, 0);
      archive.rotation.set(0.025, -0.13, -0.018);
      scene.add(archive);

      scene.add(new THREE.AmbientLight(0xfffbf1, 1.9));
      const key = new THREE.DirectionalLight(0xfff4df, 2.15);
      key.position.set(4.2, 5.2, 6.5);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xb8cbb8, 0.72);
      fill.position.set(-5, -2.5, 4);
      scene.add(fill);

      const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      let textures: import("three").CanvasTexture[] = [];
      try {
        textures = await Promise.all(CARDS.map((card) => makeMatteTexture(THREE, card.src, anisotropy)));
      } catch {
        renderer.dispose();
        return;
      }
      root.dataset.loaded = String(textures.length);
      if (cancelled) {
        textures.forEach((texture) => texture.dispose());
        renderer.dispose();
        return;
      }

      const sharedPaper = new THREE.MeshStandardMaterial({ color: 0xf3eee4, roughness: 0.9, metalness: 0 });
      const sharedEdge = new THREE.MeshStandardMaterial({ color: 0xd4cdbf, roughness: 0.96, metalness: 0 });
      const geometry = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);
      const frontMaterials = textures.map(
        (texture) => new THREE.MeshStandardMaterial({ map: texture, roughness: 0.86, metalness: 0 })
      );

      const cards = CARDS.map((spec, index) => {
        const materials = [sharedEdge, sharedEdge, sharedEdge, sharedEdge, frontMaterials[index], sharedPaper];
        const mesh = new THREE.Mesh(geometry, materials);
        const group = new THREE.Group();
        group.position.set(...spec.position);
        group.rotation.set(...spec.rotation);
        group.add(mesh);
        archive.add(group);
        return { group, spec, phase: index * 1.17 };
      });

      const pointer = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };
      let raf = 0;
      let visible = true;
      let last = performance.now();
      let introStart = performance.now() + 120;
      let readyFrames = 0;
      let width = 1;
      let height = 1;

      const resize = () => {
        const rect = root.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
      };

      const draw = (now: number, still = false) => {
        const delta = Math.min(0.05, (now - last) / 1000 || 0.016);
        last = now;
        const intro = still ? 1 : smoothstep(0, 1, (now - introStart) / 1100);

        current.x = damp(current.x, pointer.x, 3.4, delta);
        current.y = damp(current.y, pointer.y, 3.4, delta);

        archive.rotation.x = 0.025 - current.y * 0.052;
        archive.rotation.y = -0.13 + current.x * 0.1;
        archive.rotation.z = -0.018 + current.x * 0.012;
        archive.position.x = 0.12 + current.x * 0.025;
        archive.position.y = -0.1 - (1 - intro) * 0.12 + (still ? 0 : Math.sin(now * 0.00024) * 0.008);

        cards.forEach(({ group, spec, phase }, index) => {
          const depth = 1 - index * 0.08;
          const targetScale = (0.965 + intro * 0.035) * (1 - index * 0.008);
          group.scale.x = damp(group.scale.x, targetScale, 6.5, delta);
          group.scale.y = group.scale.x;
          group.scale.z = group.scale.x;
          group.position.x = spec.position[0] + (1 - intro) * (0.22 + index * 0.045) + current.x * 0.028 * depth;
          group.position.y = spec.position[1] + (1 - intro) * -0.08 - current.y * 0.026 * depth;
          group.position.z = spec.position[2] - (1 - intro) * 0.08;
          group.rotation.x = spec.rotation[0] - current.y * 0.012;
          group.rotation.y = spec.rotation[1] + current.x * 0.018 + (still ? 0 : Math.sin(now * 0.0002 + phase) * 0.003);
          group.rotation.z = spec.rotation[2] + current.x * 0.006;
        });

        camera.position.x = current.x * 0.07;
        camera.position.y = -current.y * 0.035;
        camera.lookAt(0, -0.05, 0);
        renderer.render(scene, camera);

        if (!liveRef.current && ++readyFrames > 1) {
          liveRef.current = true;
          setLive(true);
        }
      };

      const loop = (now: number) => {
        raf = 0;
        if (document.hidden || !visible) return;
        draw(now);
        raf = requestAnimationFrame(loop);
      };

      const start = () => {
        if (reduced) {
          draw(performance.now(), true);
          setLive(true);
          return;
        }
        if (!raf) raf = requestAnimationFrame(loop);
      };

      resize();
      introStart = performance.now() + 140;
      if (reduced) {
        draw(performance.now(), true);
        setLive(true);
      } else {
        raf = requestAnimationFrame(loop);
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !reduced) start();
          else if (!visible) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        },
        { threshold: 0.02 }
      );
      observer.observe(root);

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(root);

      const onVisibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (!reduced) {
          last = performance.now();
          start();
        }
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);

      cleanupRef.current = () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
        resizeObserver.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("visibilitychange", onVisibility);
        geometry.dispose();
        sharedPaper.dispose();
        sharedEdge.dispose();
        frontMaterials.forEach((material) => material.dispose());
        textures.forEach((texture) => texture.dispose());
        scene.clear();
        renderer.dispose();
      };
    };

    init();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [reduced]);

  return (
    <div ref={rootRef} className={`origin-archive${live ? " is-live" : ""}`} aria-hidden="true">
      <div className="origin-archive__fallback">
        {CARDS.map((card, index) => (
          <figure key={card.src} className={`origin-archive__still origin-archive__still--${index + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.src} alt="" loading="eager" decoding="async" />
          </figure>
        ))}
      </div>
      <canvas ref={canvasRef} className="origin-archive__canvas" />
    </div>
  );
}