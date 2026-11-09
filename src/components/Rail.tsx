"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "./Icons";

export function Rail({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const value = max <= 0 ? 0 : el.scrollLeft / max;
    setProgress(value);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(max <= 0 || el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    update();
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update]);

  const move = (direction: number) => {
    const el = viewport.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.78, behavior: "smooth" });
  };

  return (
    <div className={`rail ${className}`}>
      <div
        className="rail__viewport"
        ref={viewport}
        aria-label={label}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") return;
          drag.current = { x: event.clientX, left: viewport.current?.scrollLeft ?? 0, moved: false };
        }}
        onPointerMove={(event) => {
          if (!drag.current || !viewport.current) return;
          const delta = event.clientX - drag.current.x;
          if (Math.abs(delta) > 6) drag.current.moved = true;
          if (drag.current.moved) viewport.current.scrollLeft = drag.current.left - delta;
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerLeave={() => { drag.current = null; }}
        onClickCapture={(event) => {
          if (drag.current?.moved) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {children}
      </div>
      <div className="rail__controls">
        <button type="button" className="rail__btn" onClick={() => move(-1)} disabled={atStart} aria-label="向左滚动">
          <ChevronLeft />
        </button>
        <div className="rail__track" aria-hidden="true"><i style={{ transform: `scaleX(${Math.max(0.08, progress || 0.08)})` }} /></div>
        <button type="button" className="rail__btn" onClick={() => move(1)} disabled={atEnd} aria-label="向右滚动">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}