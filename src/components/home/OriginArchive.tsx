"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/MotionProvider";

type Tile = {
  src: string;
  alt: string;
  index: string;
};

const TILES: Tile[] = [
  {
    src: "/media/image/filmCovers/guzheng-cover.webp",
    alt: "古筝演奏影像",
    index: "01",
  },
  {
    src: "/media/image/soundCovers/cover-main.webp",
    alt: "万丈红尘声音封面",
    index: "02",
  },
  {
    src: "/media/image/campus/arch-01.webp",
    alt: "长理建筑线稿",
    index: "03",
  },
  {
    src: "/media/image/game/game-cover.webp",
    alt: "快放电波游戏界面",
    index: "04",
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
      root.style.setProperty("--mx", nextX.toFixed(3));
      root.style.setProperty("--my", nextY.toFixed(3));
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
      <div className="origin-archive__strip">
        {TILES.map((tile) => (
          <figure className="origin-archive__tile" key={tile.src}>
            <span
              className="origin-archive__frame"
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty("--x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
                event.currentTarget.style.setProperty("--y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="origin-archive__base" src={tile.src} alt={tile.alt} loading="eager" decoding="async" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="origin-archive__color" src={tile.src} alt="" loading="eager" decoding="async" />
            </span>
            <figcaption className="mono">{tile.index}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

