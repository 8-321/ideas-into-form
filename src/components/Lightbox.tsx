"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Close, Zoom } from "./Icons";

export type LightboxItem = {
  src: string;
  alt: string;
  caption?: string;
};

type Ctx = { open: (items: LightboxItem[], index?: number) => void };

const LightboxCtx = createContext<Ctx>({ open: () => {} });

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: "50%", y: "50%" });
  const closeRef = useRef<HTMLButtonElement>(null);
  const priorFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  const open = useCallback((next: LightboxItem[], start = 0) => {
    if (!next.length) return;
    priorFocus.current = document.activeElement as HTMLElement;
    setItems(next);
    setIndex(Math.max(0, Math.min(start, next.length - 1)));
    setZoom(false);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setItems([]);
    setZoom(false);
    document.body.style.overflow = "";
    priorFocus.current?.focus?.();
  }, []);

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + items.length) % items.length);
      setZoom(false);
    },
    [items.length]
  );

  useEffect(() => {
    if (!items.length) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
      if (event.key === " ") {
        event.preventDefault();
        setZoom((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, close, step]);

  const current = items[index];

  return (
    <LightboxCtx.Provider value={{ open }}>
      {children}
      {current ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="作品图片放大预览">
          <div className="lightbox__bar">
            <span className="mono">由意成形 / IMAGE VIEWER</span>
            <div className="lightbox__actions">
              <button
                type="button"
                className="lightbox__nav"
                onClick={() => setZoom((value) => !value)}
                aria-label={zoom ? "缩小图片" : "放大图片"}
              >
                <Zoom />
              </button>
              <button ref={closeRef} type="button" className="lightbox__close" onClick={close} aria-label="关闭预览">
                <Close />
              </button>
            </div>
          </div>
          <div
            className="lightbox__stage"
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
            onPointerDown={(event) => { touchX.current = event.clientX; }}
            onPointerUp={(event) => {
              if (touchX.current === null) return;
              const delta = event.clientX - touchX.current;
              if (Math.abs(delta) > 60) step(delta > 0 ? -1 : 1);
              touchX.current = null;
            }}
          >
            {items.length > 1 ? (
              <button type="button" className="lightbox__nav lightbox__nav--side" onClick={() => step(-1)} aria-label="上一张" style={{ position: "absolute", left: 10, zIndex: 2 }}>
                <ChevronLeft />
              </button>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.src}
              className={`lightbox__img${zoom ? " is-zoom" : ""}`}
              src={current.src}
              alt={current.alt}
              draggable={false}
              style={{ "--ox": origin.x, "--oy": origin.y } as React.CSSProperties}
              onClick={(event) => {
                const rect = (event.currentTarget as HTMLImageElement).getBoundingClientRect();
                setOrigin({ x: `${((event.clientX - rect.left) / rect.width) * 100}%`, y: `${((event.clientY - rect.top) / rect.height) * 100}%` });
                setZoom((value) => !value);
              }}
            />
            {items.length > 1 ? (
              <button type="button" className="lightbox__nav lightbox__nav--side" onClick={() => step(1)} aria-label="下一张" style={{ position: "absolute", right: 10, zIndex: 2 }}>
                <ChevronRight />
              </button>
            ) : null}
          </div>
          <div className="lightbox__foot">
            <div>
              <div className="lightbox__caption">{current.caption || current.alt}</div>
              <div className="mono muted" style={{ marginTop: 6, color: "rgba(241,239,233,.45)" }}>点击图片放大 · 方向键切换 · ESC 关闭</div>
            </div>
            <span className="lightbox__count">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      ) : null}
    </LightboxCtx.Provider>
  );
}

export const useLightbox = () => useContext(LightboxCtx);