"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/Icons";
import { useMotion } from "@/components/MotionProvider";
import type { ImageAsset } from "@/content/works";

const pad = (value: number, size = 3) => String(value).padStart(size, "0");
const wrap = (value: number, length: number) => ((value % length) + length) % length;

export function CoverOrbit({
  items,
  label,
  onOpen,
}: {
  items: ImageAsset[];
  label: string;
  onOpen: (index: number) => void;
}) {
  const total = items.length;
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; x: number; active: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const { reduced } = useMotion();

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "20%" });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const step = useCallback((delta: number) => {
    setActive((current) => wrap(current + delta, total));
  }, [total]);

  useEffect(() => {
    if (reduced || hover || dragging || !inView || total < 2) return;
    const timer = window.setInterval(() => setActive((current) => wrap(current + 1, total)), 3600);
    return () => window.clearInterval(timer);
  }, [dragging, hover, inView, reduced, total]);

  const activeItem = items[active];
  const range = narrow ? 2 : 4;

  return (
    <div
      ref={rootRef}
      className={`cover-orbit${dragging ? " is-dragging" : ""}`}
      data-auto={reduced ? "off" : "on"}
      data-active={active}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        } else if (event.key === "Enter" && activeItem) {
          event.preventDefault();
          onOpen(active);
        }
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHover(true);
      }}
      onPointerLeave={() => setHover(false)}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        dragRef.current = { id: event.pointerId, x: event.clientX, active, moved: false };
        setDragging(true);
        rootRef.current?.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag || drag.id !== event.pointerId) return;
        const delta = event.clientX - drag.x;
        if (Math.abs(delta) > 9) {
          drag.moved = true;
          suppressClick.current = true;
          const offset = Math.round(-delta / (narrow ? 52 : 76));
          setActive(wrap(drag.active + offset, total));
        }
      }}
      onPointerUp={(event) => {
        const drag = dragRef.current;
        if (!drag || drag.id !== event.pointerId) return;
        dragRef.current = null;
        setDragging(false);
        if (drag.moved) window.setTimeout(() => { suppressClick.current = false; }, 90);
      }}
      onPointerCancel={() => {
        dragRef.current = null;
        setDragging(false);
        suppressClick.current = false;
      }}
    >
      <div className="cover-orbit__stage">
        {Array.from({ length: range * 2 + 1 }, (_, order) => {
          const offset = order - range;
          const index = wrap(active + offset, total);
          const item = items[index];
          if (!item) return null;
          const distance = Math.abs(offset);
          const x = offset === 0 ? 0 : Math.sign(offset) * (distance * 0.56 - distance * distance * 0.018);
          const y = distance === 0 ? 0 : distance * distance * 0.026;
          const scale = Math.max(0.58, 1 - distance * 0.088);
          const opacity = distance === range ? (narrow ? 0.28 : 0.42) : Math.max(0.52, 1 - distance * 0.1);
          return (
            <button
              key={`${index}-${order}`}
              type="button"
              className={`cover-orbit__card${offset === 0 ? " is-active" : ""}`}
              style={{
                "--x": x,
                "--y": y,
                "--scale": scale,
                "--opacity": opacity,
                "--rot": offset * -7,
                zIndex: 50 - distance,
              } as React.CSSProperties}
              aria-label={`查看 ${item.key}${offset === 0 ? "，当前封面" : ""}`}
              aria-current={offset === 0 ? "true" : undefined}
              tabIndex={offset === 0 ? 0 : -1}
              onClick={() => {
                if (suppressClick.current || dragging) return;
                if (offset !== 0) {
                  setActive(index);
                  return;
                }
                onOpen(index);
              }}
            >
              <span className="cover-orbit__image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumb || item.src} alt={`${label} ${pad(index + 1)}`} loading="eager" decoding="async" draggable={false} />
              </span>
              {offset === 0 ? <span className="cover-orbit__date mono">{item.day ?? item.key}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="cover-orbit__foot">
        <button type="button" onClick={() => step(-1)} aria-label="上一张封面">
          <ChevronLeft />
        </button>
        <div className="cover-orbit__counter mono" aria-live="polite">
          <span>{pad(active + 1)}</span>
          <i aria-hidden="true" />
          <span>{pad(total)}</span>
        </div>
        <button type="button" onClick={() => step(1)} aria-label="下一张封面">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
