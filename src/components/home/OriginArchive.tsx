"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/MotionProvider";

type LeafSpec = {
  src: string;
  alt: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

const LEAVES: LeafSpec[] = [
  {
    src: "/media/image/panda/panda-original@thumb.webp",
    alt: "小含熊猫 IP",
    width: 800,
    height: 800,
    position: [0.1, 0.08, 0.2],
    rotation: [0.015, 0.06, -0.012],
    scale: 1,
  },
  {
    src: "/media/image/soundCovers/cover-main@thumb.webp",
    alt: "万丈红尘声音封面",
    width: 1194,
    height: 1193,
    position: [-1.82, 0.34, -0.36],
    rotation: [0.01, 0.42, 0.026],
    scale: 0.86,
  },
  {
    src: "/media/image/campus/arch-01@thumb.webp",
    alt: "长理建筑线稿",
    width: 1284,
    height: 828,
    position: [1.72, 1.02, -1.02],
    rotation: [-0.015, -0.34, -0.03],
    scale: 0.84,
  },
  {
    src: "/media/image/days/02-14@thumb.webp",
    alt: "100 天实验封面",
    width: 260,
    height: 371,
    position: [1.18, -1.62, -1.18],
    rotation: [-0.025, -0.2, 0.04],
    scale: 0.9,
  },
  {
    src: "/media/image/mbti/enfj-port@thumb.webp",
    alt: "ENFJ 人格封面",
    width: 941,
    height: 1672,
    position: [-1.35, -1.72, -0.92],
    rotation: [0.03, 0.3, -0.035],
    scale: 0.78,
  },
];

const FALLBACK = LEAVES.slice(0, 3);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
};
const damp = (current: number, target: number, lambda: number, delta: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * delta));

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
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
      } catch {
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
      camera.position.set(0, 0, 8.9);

      const archive = new THREE.Group();
      scene.add(archive);

      scene.add(new THREE.AmbientLight(0xfffbf2, 1.65));
      const key = new THREE.DirectionalLight(0xfff2d9, 2.1);
      key.position.set(4.5, 5.5, 7);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xaed2c0, 0.8);
      fill.position.set(-5, -1, 4);
      scene.add(fill);

      const loader = new THREE.TextureLoader();
      const leaves: {
        group: import("three").Group;
        spec: LeafSpec;
        velocity: number;
        phase: number;
      }[] = [];

      const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const paper = new THREE.MeshStandardMaterial({
        color: 0xe9e5da,
        roughness: 0.82,
        metalness: 0.02,
      });
      const paperEdge = new THREE.MeshStandardMaterial({
        color: 0xd2ccbe,
        roughness: 0.92,
        metalness: 0,
      });
      const paperSide = new THREE.MeshStandardMaterial({
        color: 0xc7bfad,
        roughness: 0.96,
        metalness: 0,
      });
      const bodyMaterials = [paperSide, paperSide, paperSide, paperSide, paper, paper];

      LEAVES.forEach((spec, index) => {
        const ratio = spec.width / spec.height;
        const maxW = 2.06;
        const maxH = 2.12;
        const imageW = ratio < 1 ? maxH * ratio : maxW;
        const imageH = ratio < 1 ? maxH : maxW / ratio;
        const pad = 0.09;
        const frameW = imageW + pad * 2;
        const frameH = imageH + pad * 2;

        const group = new THREE.Group();
        group.position.set(...spec.position);
        group.rotation.set(...spec.rotation);
        group.scale.setScalar(spec.scale);

        const body = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameH, 0.14), bodyMaterials);
        body.castShadow = false;
        body.receiveShadow = false;
        group.add(body);

        const edge = new THREE.Mesh(
          new THREE.PlaneGeometry(frameW - 0.014, frameH - 0.014),
          paperEdge
        );
        edge.position.z = 0.0705;
        group.add(edge);

        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(imageW, imageH),
          new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
        );
        face.position.z = 0.0742;
        group.add(face);

        const texture = loader.load(
          spec.src,
          (loaded) => {
            if (cancelled) {
              loaded.dispose();
              return;
            }
            loaded.colorSpace = THREE.SRGBColorSpace;
            loaded.anisotropy = maxAnisotropy;
            loaded.minFilter = THREE.LinearMipmapLinearFilter;
            loaded.magFilter = THREE.LinearFilter;
            const material = face.material as import("three").MeshBasicMaterial;
            material.map = loaded;
            material.needsUpdate = true;
            root.dataset.loaded = String(Number(root.dataset.loaded ?? 0) + 1);
          },
          undefined,
          () => {
            const material = face.material as import("three").MeshBasicMaterial;
            material.color.set(0xe8e4da);
          }
        );

        group.userData.texture = texture;
        archive.add(group);
        leaves.push({
          group,
          spec,
          velocity: 0.16 + index * 0.033,
          phase: index * 1.37,
        });
      });

      const spine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 4.7, 12),
        new THREE.MeshStandardMaterial({ color: 0x9e8c68, roughness: 0.45, metalness: 0.58 })
      );
      spine.position.set(-0.02, 0.1, -2.24);
      archive.add(spine);

      const origin = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0x171715, roughness: 0.35, metalness: 0.32 })
      );
      origin.position.set(-0.02, 0.1, -2.15);
      archive.add(origin);

      const hero = canvas.closest(".hero") as HTMLElement | null;
      let width = 0;
      let height = 0;
      let dpr = 1;
      let raf = 0;
      let last = 0;
      let introStart = performance.now();
      let visible = true;
      let readyFrames = 0;
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const current = { rx: 0, ry: 0, px: 0, py: 0, spread: 0 };

      const resize = () => {
        const rect = root.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        dpr = Math.min(window.innerWidth < 760 ? 1.35 : 1.65, window.devicePixelRatio || 1);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const mobile = window.innerWidth < 760;
        archive.scale.setScalar(mobile ? 0.74 : width < 980 ? 0.9 : 1);
        if (reduced) draw(performance.now(), true, true);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (reduced) return;
        pointer.tx = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
        pointer.ty = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
      };

      const draw = (now: number, force = false, still = false) => {
        if (!width || !height) return;
        if (!force && !visible) return;

        let p = 0;
        if (hero) {
          const rect = hero.getBoundingClientRect();
          const total = Math.max(1, hero.offsetHeight - window.innerHeight);
          p = clamp(-rect.top / total, 0, 1);
          hero.style.setProperty("--p", p.toFixed(4));
        }

        const delta = Math.min(0.05, (now - last) / 1000 || 0.016);
        last = now;
        if (!still) {
          pointer.x = damp(pointer.x, pointer.tx, 4.5, delta);
          pointer.y = damp(pointer.y, pointer.ty, 4.5, delta);
        } else {
          pointer.x = 0;
          pointer.y = 0;
        }

        const spreadTarget = smoothstep(0.18, 0.84, p);
        const intro = still ? 1 : smoothstep(0, 0.9, (now - introStart) / 1000);
        current.spread = damp(current.spread, spreadTarget, still ? 100 : 3.8, delta);
        current.rx = damp(current.rx, -pointer.y * 0.075, 4.2, delta);
        current.ry = damp(current.ry, pointer.x * 0.13 + current.spread * 0.18, 4.2, delta);

        archive.rotation.x = 0.028 + current.rx;
        archive.rotation.y = -0.075 + current.ry;
        archive.rotation.z = -0.018 + current.spread * 0.018;
        archive.position.y = (1 - intro) * -0.18 + (still ? 0 : Math.sin(now * 0.00024) * 0.035);

        const mobile = window.innerWidth < 760;
        leaves.forEach((leaf, index) => {
          const [bx, by, bz] = leaf.spec.position;
          const depth = 1 - index * 0.07;
          const dirX = bx === 0 ? 0 : Math.sign(bx);
          const dirY = by === 0 ? 0 : Math.sign(by);
          const targetX = bx + dirX * current.spread * 0.28 * depth;
          const targetY = by + dirY * current.spread * 0.16 * depth;
          const targetZ = bz - current.spread * (0.12 + index * 0.025);
          const float = still ? 0 : Math.sin(now * 0.00052 * leaf.velocity + leaf.phase) * 0.026;
          leaf.group.position.x = targetX + pointer.x * 0.045 * depth;
          leaf.group.position.y = targetY + float - pointer.y * 0.03 * depth;
          leaf.group.position.z = targetZ;
          leaf.group.rotation.x = leaf.spec.rotation[0] + pointer.y * 0.018;
          leaf.group.rotation.y =
            leaf.spec.rotation[1] +
            pointer.x * 0.05 +
            current.spread * dirX * 0.075 -
            (mobile ? 0.02 : 0);
          leaf.group.rotation.z =
            leaf.spec.rotation[2] + (still ? 0 : Math.sin(now * 0.00037 + leaf.phase) * 0.008);
          const targetScale = leaf.spec.scale * (0.94 + intro * 0.06);
          leaf.group.scale.x = damp(leaf.group.scale.x, targetScale, 7, delta);
          leaf.group.scale.y = leaf.group.scale.x;
          leaf.group.scale.z = leaf.group.scale.x;
        });

        camera.position.x = pointer.x * 0.16;
        camera.position.y = -pointer.y * 0.08;
        camera.lookAt(0, 0, 0);
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
          draw(performance.now(), true, true);
          setLive(true);
          return;
        }
        if (!raf) raf = requestAnimationFrame(loop);
      };

      resize();
      introStart = performance.now() + 160;
      if (reduced) {
        draw(performance.now(), true, true);
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

      const resizeObserver = new ResizeObserver(() => resize());
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
        leaves.forEach(({ group }) => {
          const texture = group.userData.texture as import("three").Texture | undefined;
          texture?.dispose();
          group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              const material = child.material;
              if (Array.isArray(material)) material.forEach((item) => item.dispose());
              else material.dispose();
            }
          });
        });
        paper.dispose();
        paperEdge.dispose();
        paperSide.dispose();
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
        {FALLBACK.map((leaf, index) => (
          <figure key={leaf.src} className={`origin-archive__still origin-archive__still--${index + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={leaf.src} alt="" loading="eager" decoding="async" />
          </figure>
        ))}
      </div>
      <canvas ref={canvasRef} className="origin-archive__canvas" />
    </div>
  );
}