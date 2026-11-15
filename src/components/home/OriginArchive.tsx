"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/MotionProvider";

type Tile = {
  src: string;
  alt: string;
  lqip: string;
};

const TILES: Tile[] = [
  {
    src: "/media/image/panda/panda-poster-8@thumb.webp",
    alt: "小含熊猫竞赛科普插画",
    lqip: "data:image/webp;base64,UklGRhQBAABXRUJQVlA4IAgBAAAQBgCdASoWABwAPvVur1EqpiQiqAqpUB6JbACw7mwHXSHwW4Zt0rvDbGsorXykp2/vyckrwDXo0AAA/vHc3FFQQulKRvpbAQ6u360RYYe2zEmVS4WvwtwVpDy2UNK0wQ8AUCyYQaOyyqujDbqajcUtfNS1Kj8LKgVEl3aVgqtk0aUVHZzt6nrxytipxuUfEWyfLEw9iuDaW2hz/DDbNl9iZIlZ+bffR6HqLEo9ALHfVh7Njzjigv2d8rKRF0HJbfkYBuJJ/HCLbqLTPvc9TCZCgNXSB9avpzWyFoioGPsmwJTvtY/cr2GTrdMa62V7U5OjwTG9WYmIwe/Duzun+XAD+UwOhMiAAAA=",
  },
  {
    src: "/media/image/soundCovers/cover-main@thumb.webp",
    alt: "万丈红尘声音封面",
    lqip: "data:image/webp;base64,UklGRtwAAABXRUJQVlA4INAAAAAQBQCdASocABwAPulgp04pJaOiMAwBIB0JYgC07a7ELaQ8AaZsO3MKllHys3gRf06QAP73bbyLW/ouNZdUoloXgoDjOgUrhULNgR31BDCmkWwpAriBJcY9B+XvxX3xQAJaKObzBwlA9z8e2dCGp06YZ+5j4hiSAIl9JkPHcEyumsQyCdEztGQoThSHFB7B0hpwaguD/akUNVH92pyvQjRxg8adZZoNKbyloIPhsrKbJ8idRsBgAMRIYzzSKB6sDgUvQNeSZJAldRZih5F6BSAA",
  },
  {
    src: "/media/image/campus/arch-01@thumb.webp",
    alt: "长理建筑线稿",
    lqip: "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAADQBACdASocABIAPvVssVCqpaSiqAqpUB6JaQAFEARvos8gU//2tOcq7ZSNCZYM4AD+9OxTp2+dDeL57L0vkyEa5hdLY8O8nRTtBal1SV0FsZCp7kD237apWHULmG+vnoLOK/Fb5Xq2sOOYkjUjTdBAEy83cGAEMGAgAA==",
  },
  {
    src: "/media/image/drawing/draw-04@thumb.webp",
    alt: "绘画作品",
    lqip: "data:image/webp;base64,UklGRuoAAABXRUJQVlA4IN4AAADwBQCdASoYABwAPvVurVGqpiQiqAqpUB6JQBlAO6RvhnDvoJ6yfksqew12uxFvz9O90jvtITwYYAD+8dt8aeg+KS545ilEfcnGaBONC3jLugULyY4gqBa1sP/yy7sY+UzxJfrbHV849CuOl/wNdXkFZhUMeT4aZFm90u4FYEzdZWRIHp/DXrKCOuvo5IIbYe9HWyHvRESVwCDT5ee8jvkmV28sPGIQ2k1E8ncw2vVs+WBYgcAd3YCNtPjAr1zjHgy7JXN6QGFjZgi+QIk4JEw56RR58kt0ZNyvTDGKAAA=",
  },
];

export function OriginArchive() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reduced) {
      root.style.removeProperty("--mx");
      root.style.removeProperty("--my");
      return;
    }

    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const apply = () => {
      frame = 0;
      root.style.setProperty("--mx", nextX.toFixed(4));
      root.style.setProperty("--my", nextY.toFixed(4));
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      nextX = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2));
      nextY = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2));
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onPointerLeave = () => {
      nextX = 0;
      nextY = 0;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduced]);

  return (
    <div ref={rootRef} className="origin-archive" aria-label="作品预览">
      <div className="origin-archive__board">
        {TILES.map((tile) => (
          <figure
            key={tile.src}
            className="origin-archive__tile"
            style={{ "--lqip": `url("${tile.lqip}")` } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tile.src} alt={tile.alt} loading="eager" decoding="async" />
          </figure>
        ))}
      </div>
    </div>
  );
}