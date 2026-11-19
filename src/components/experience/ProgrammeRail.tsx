"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { FilmArtwork } from "@/components/experience/FilmArtwork";

export type ProgrammeItem = {
  key: string;
  label: string;
  still?: string;
  portrait: boolean;
  ratio: number;
  tone: string;
  total: number;
  count: number;
};

const fmt = (value: number) => {
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export function ProgrammeRail({ items }: { items: ProgrammeItem[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; pointerId: number; moved: boolean } | null>(null);
  const moved = useRef(false);
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const element = railRef.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    setProgress(max > 0 ? element.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    const element = railRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      const delta = event.deltaX;
      if (Math.abs(delta) < 8) return;
      const max = element.scrollWidth - element.clientWidth;
      if ((element.scrollLeft <= 0 && delta < 0) || (element.scrollLeft >= max - 1 && delta > 0)) return;
      event.preventDefault();
      element.scrollLeft += delta * 1.18;
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    updateProgress();
    return () => element.removeEventListener("wheel", onWheel);
  }, [updateProgress]);

  return (
    <div className="programme-rail">
      <div
        ref={railRef}
        className="programme-rail__viewport"
        role="list"
        aria-label="节目单，可左右拖动"
        tabIndex={0}
        onScroll={updateProgress}
        onPointerDown={(event) => {
          const element = event.currentTarget;
          drag.current = { x: event.clientX, left: element.scrollLeft, pointerId: event.pointerId, moved: false };
          moved.current = false;
        }}
        onPointerMove={(event) => {
          const element = event.currentTarget;
          const current = drag.current;
          if (!current) return;
          const dx = event.clientX - current.x;
          if (Math.abs(dx) > 6) {
            current.moved = true;
            moved.current = true;
            if (!element.hasPointerCapture?.(current.pointerId)) {
              element.setPointerCapture?.(current.pointerId);
            }
            element.scrollLeft = current.left - dx;
          }
        }}
        onPointerUp={() => {
          drag.current = null;
          window.setTimeout(() => { moved.current = false; }, 80);
        }}
        onPointerCancel={() => { drag.current = null; moved.current = false; }}
        onClickCapture={(event) => {
          if (!moved.current) return;
          event.preventDefault();
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          const element = event.currentTarget;
          const card = element.querySelector<HTMLElement>(".programme-card");
          const step = (card?.offsetWidth ?? 360) + 14;
          if (event.key === "ArrowLeft") { event.preventDefault(); element.scrollBy({ left: -step, behavior: "smooth" }); }
          if (event.key === "ArrowRight") { event.preventDefault(); element.scrollBy({ left: step, behavior: "smooth" }); }
          if (event.key === "Home") { event.preventDefault(); element.scrollTo({ left: 0, behavior: "smooth" }); }
          if (event.key === "End") { event.preventDefault(); element.scrollTo({ left: element.scrollWidth, behavior: "smooth" }); }
        }}
      >
        {items.map((item, index) => (
          <article
            className="programme-card"
            role="listitem"
            key={item.key}
            data-orientation={item.portrait ? "portrait" : "landscape"}
            style={{ "--ratio": item.ratio, "--tone": item.tone } as CSSProperties}
          >
            <a
              href="#b-screenings"
              className="programme-card__link"
              draggable={false}
              data-cinema-group={item.key}
              data-group={item.key}
              data-artwork={item.still}
              aria-label={`进入${item.label}放映`}
            >
              <span className="programme-card__head">
                <b className="display">{String(index + 1).padStart(2, "0")}</b>
                <span className="mono">{item.count} 段 / {fmt(item.total)}</span>
              </span>
              <span className="programme-card__still">
                {item.still ? <FilmArtwork src={item.still} alt={`${item.label}封面`} portrait={item.portrait} loading={index < 3 ? "eager" : "lazy"} /> : null}
              </span>
              <span className="programme-card__meta">
                <h3 className="serif">{item.label}</h3>
                <span className="mono">进入放映室</span>
              </span>
            </a>
          </article>
        ))}
      </div>
      <div className="programme-rail__progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${0.22 + progress * 0.78})` }} />
      </div>
    </div>
  );
}
