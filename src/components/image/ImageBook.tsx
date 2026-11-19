"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/Icons";
import { useLightbox } from "@/components/Lightbox";
import { useMotion } from "@/components/MotionProvider";
import type { ArchivePage, ImageFolder, ImageShape } from "@/content/imageArchive";
import { paletteForFolder } from "@/content/imagePalette";

const pad = (value: number, size = 2) => String(value).padStart(size, "0");
const CN_NUM = ["一", "二", "三", "四", "五", "六", "七"];
const cnFor = (letter: string) => CN_NUM[letter.charCodeAt(0) - 65] ?? letter;

const SHAPE_CLASS: Record<ImageShape, string> = {
  square: "square",
  portrait: "portrait",
  landscape: "landscape",
  wide: "wide",
};

type Turn = { id: number; dir: 1 | -1 } | null;

export function ImageBook({ folders }: { folders: ImageFolder[] }) {
  const { open } = useLightbox();
  const { reduced } = useMotion();
  const [folderIndex, setFolderIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [turn, setTurn] = useState<Turn>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef<number | null>(null);
  const turnTimer = useRef<number | null>(null);
  const preloaded = useRef(new Set<string>());
  const swipeRef = useRef<{ x: number; y: number; active: boolean; moved: boolean } | null>(null);
  const swipeMoved = useRef(false);
  const scrubbing = useRef(false);

  const folder = folders[folderIndex] ?? folders[0];
  const pages = folder?.pages ?? [];
  const total = pages.length;
  const page = pages[Math.min(pageIndex, total - 1)];
  const palette = paletteForFolder(folder?.letter ?? "A");
  const progress = total <= 1 ? 0 : pageIndex / (total - 1);

  const animateTurn = useCallback((dir: 1 | -1) => {
    if (reduced) return;
    setTurn({ id: Date.now(), dir });
    if (turnTimer.current) window.clearTimeout(turnTimer.current);
    turnTimer.current = window.setTimeout(() => setTurn(null), 640);
  }, [reduced]);

  const goTo = useCallback((next: number, dir: 1 | -1) => {
    if (!total) return;
    const clamped = Math.max(0, Math.min(total - 1, next));
    if (clamped === pageIndex) return;
    setPageIndex(clamped);
    animateTurn(dir);
  }, [animateTurn, pageIndex, total]);

  const stepPage = useCallback((delta: 1 | -1) => {
    goTo(pageIndex + delta, delta);
  }, [goTo, pageIndex]);

  const switchFolder = useCallback((next: number, nextPage = 0) => {
    if (next === folderIndex) return;
    setFolderIndex(next);
    setPageIndex(nextPage);
    animateTurn(next > folderIndex ? 1 : -1);
  }, [animateTurn, folderIndex]);

  const stepBook = useCallback((delta: 1 | -1) => {
    if (delta > 0 && pageIndex === total - 1 && folderIndex < folders.length - 1) {
      switchFolder(folderIndex + 1, 0);
      return;
    }
    if (delta < 0 && pageIndex === 0 && folderIndex > 0) {
      const previous = folders[folderIndex - 1];
      switchFolder(folderIndex - 1, Math.max(0, previous.pages.length - 1));
      return;
    }
    stepPage(delta);
  }, [folderIndex, folders, pageIndex, stepPage, switchFolder, total]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (document.querySelector(".lightbox")) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        stepBook(-1);
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        stepBook(1);
      } else if (event.key === "PageUp") {
        event.preventDefault();
        stepBook(-1);
      } else if (event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        stepBook(1);
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0, -1);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(total - 1, 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, stepBook, total]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (document.querySelector(".lightbox")) return;
      const target = event.target as Element | null;
      if (target?.closest("input, textarea, select")) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 8) return;
      if ((pageIndex === 0 && delta < 0 && folderIndex === 0) || (pageIndex === total - 1 && delta > 0 && folderIndex === folders.length - 1)) return;
      event.preventDefault();
      if (wheelLock.current) return;
      wheelLock.current = window.setTimeout(() => { wheelLock.current = null; }, 460);
      stepBook(delta > 0 ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (wheelLock.current) window.clearTimeout(wheelLock.current);
    };
  }, [folderIndex, folders.length, pageIndex, stepBook, total]);

  useEffect(() => {
    return () => {
      if (turnTimer.current) window.clearTimeout(turnTimer.current);
      if (wheelLock.current) window.clearTimeout(wheelLock.current);
    };
  }, []);

  useEffect(() => {
    if (!page) return;
    const neighbours = ([
      page,
      pages[pageIndex + 1],
      pages[pageIndex - 1],
      pageIndex === total - 1 ? folders[folderIndex + 1]?.pages[0] : undefined,
      pageIndex === 0 ? folders[folderIndex - 1]?.pages.at(-1) : undefined,
    ] as (ArchivePage | undefined)[]).filter((candidate): candidate is ArchivePage => Boolean(candidate));

    const timer = window.setTimeout(() => {
      neighbours.forEach((candidate) => {
        candidate.items.forEach((item) => {
          if (preloaded.current.has(item.src)) return;
          preloaded.current.add(item.src);
          const image = new window.Image();
          image.decoding = "async";
          image.src = item.src;
        });
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [folderIndex, folders, page, pageIndex, pages, total]);

  const openImage = useCallback((index: number) => {
    if (!page) return;
    const gallery = page.items.map((item, itemIndex) => ({
      src: item.src,
      alt: `${page.series} ${pad(itemIndex + 1)}`,
      caption: page.series,
    }));
    open(gallery, index);
  }, [open, page]);

  const setFromScrub = useCallback((clientX: number) => {
    const element = scrubRef.current;
    if (!element || total <= 1) return;
    const rect = element.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const next = Math.round(ratio * (total - 1));
    goTo(next, next > pageIndex ? 1 : -1);
  }, [goTo, pageIndex, total]);

  useEffect(() => {
    const onUp = () => { scrubbing.current = false; document.body.style.userSelect = ""; };
    const onMove = (event: PointerEvent) => { if (scrubbing.current) setFromScrub(event.clientX); };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
    };
  }, [setFromScrub]);

  const folderSpots = useMemo(() => folders.map((item) => ({
    letter: item.letter,
    zh: item.zh,
    count: item.count,
    pages: item.pages.length,
  })), [folders]);

  if (!folder || !page) return null;

  return (
    <div
      className="image-book"
      data-folder={folder.letter}
      style={{
        "--folder-accent": palette.accent,
        "--folder-deep": palette.deep,
        "--folder-wash": palette.wash,
        "--folder-paper": palette.paper,
        "--progress": progress,
      } as React.CSSProperties}
    >
      <div className="image-book__wash" aria-hidden="true" />

      <header className="image-book__top">
        <div className="image-book__brand">
          <h1>成象</h1>
        </div>
        <nav className="image-book__folders" aria-label="作品分类">
          {folderSpots.map((item, index) => (
            <button
              type="button"
              key={item.letter}
              className={index === folderIndex ? "is-active" : ""}
              aria-current={index === folderIndex ? "true" : undefined}
              onClick={() => switchFolder(index)}
            >
              <span className="mono">{cnFor(item.letter)}</span>
              <b>{item.zh}</b>
            </button>
          ))}
        </nav>
      </header>

      <div
        ref={stageRef}
        className="image-book__stage"
        data-dir={turn?.dir ?? 0}
        data-shape={page.shape}
        aria-live="polite"
        onDragStart={(event) => event.preventDefault()}
        onContextMenu={(event) => {
          event.preventDefault();
          stepBook(1);
        }}
        onPointerDown={(event) => {
          if ((event.target as Element).closest("[role='slider'], .image-book__arrow")) return;
          swipeMoved.current = false;
          swipeRef.current = { x: event.clientX, y: event.clientY, active: true, moved: false };
        }}
        onPointerMove={(event) => {
          const swipe = swipeRef.current;
          if (!swipe?.active) return;
          const dx = event.clientX - swipe.x;
          const dy = event.clientY - swipe.y;
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) swipe.moved = true;
          if (Math.abs(dx) > Math.abs(dy)) {
            stageRef.current?.style.setProperty("--drag-x", `${Math.max(-56, Math.min(56, dx * 0.35))}px`);
            stageRef.current?.style.setProperty("--drag-y", "0px");
          } else {
            stageRef.current?.style.setProperty("--drag-y", `${Math.max(-42, Math.min(42, dy * 0.3))}px`);
            stageRef.current?.style.setProperty("--drag-x", "0px");
          }
        }}
        onPointerUp={(event) => {
          const swipe = swipeRef.current;
          swipeRef.current = null;
          stageRef.current?.style.setProperty("--drag-x", "0px");
          stageRef.current?.style.setProperty("--drag-y", "0px");
          if (!swipe?.active) return;
          swipeMoved.current = swipe.moved;
          if (swipe.moved) window.setTimeout(() => { swipeMoved.current = false; }, 180);
          const dx = event.clientX - swipe.x;
          const dy = event.clientY - swipe.y;
          if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.1) {
            stepBook(dx < 0 ? 1 : -1);
          } else if (Math.abs(dy) > 62 && Math.abs(dy) > Math.abs(dx) * 1.1) {
            stepBook(dy < 0 ? 1 : -1);
          }
        }}
        onPointerCancel={() => {
          swipeRef.current = null;
          stageRef.current?.style.setProperty("--drag-x", "0px");
          stageRef.current?.style.setProperty("--drag-y", "0px");
        }}
        onClickCapture={(event) => {
          if (!swipeMoved.current) return;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className="image-book__page" key={`${folder.letter}-${page.id}`}>
          <div className="image-book__page-head">
            <h2>{page.series}</h2>
          </div>

          <div
            className={`image-book__plates is-${SHAPE_CLASS[page.shape]}${page.kind === "ribbon" ? " is-ribbon" : ""} count-${page.items.length}`}
          >
            {page.items.map((item, index) => (
              <button
                type="button"
                className="image-book__plate"
                key={`${item.key}-${index}`}
                onClick={() => openImage(index)}
                aria-label={`查看 ${page.series} 第 ${index + 1} 张`}
              >
                <span className="image-book__plate-art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={`${page.series} ${pad(index + 1)}`} loading="eager" decoding="async" draggable={false} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {turn && !reduced ? <span key={turn.id} className="image-book__sheet" aria-hidden="true" /> : null}
        <span className="image-book__glow" aria-hidden="true" />
      </div>

      <footer className="image-book__foot">
        <button type="button" className="image-book__arrow" onClick={() => stepBook(-1)} disabled={pageIndex === 0 && folderIndex === 0} aria-label="上一页">
          <ChevronLeft size={16} />
        </button>
        <div
          ref={scrubRef}
          className="image-book__scrub"
          role="slider"
          tabIndex={0}
          aria-label="拖动翻页"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={pageIndex + 1}
          onPointerDown={(event) => {
            scrubbing.current = true;
            document.body.style.userSelect = "none";
            setFromScrub(event.clientX);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); stepBook(-1); }
            if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); stepBook(1); }
          }}
        >
          <span className="image-book__scrub-track" aria-hidden="true">
            <i style={{ transform: `scaleX(${progress})` }} />
            {pages.map((item, index) => (
              <b
                key={item.id}
                className={index === pageIndex ? "is-active" : ""}
                style={{ left: `${total <= 1 ? 0 : (index / (total - 1)) * 100}%` }}
              />
            ))}
          </span>
          <span className="image-book__scrub-thumb" aria-hidden="true">
            <em className="mono">{pad(pageIndex + 1)}</em>
          </span>
        </div>
        <button type="button" className="image-book__arrow" onClick={() => stepBook(1)} disabled={pageIndex === total - 1 && folderIndex === folders.length - 1} aria-label="下一页">
          <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
}
