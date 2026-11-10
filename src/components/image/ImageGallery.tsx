"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Close } from "@/components/Icons";
import { useLightbox } from "@/components/Lightbox";
import { useMotion } from "@/components/MotionProvider";
import type { ArchivePage, ImageFolder, ImageShape } from "@/content/imageArchive";
import type { ImageAsset } from "@/content/works";
import { CoverOrbit } from "./CoverOrbit";

const pad = (value: number, size = 2) => String(value).padStart(size, "0");

const SHAPE_LABEL: Record<ImageShape, string> = {
  square: "SQUARE",
  portrait: "RECTANGLE / PORTRAIT",
  landscape: "RECTANGLE / LANDSCAPE",
  wide: "RECTANGLE / WIDE",
};

type Tier = "desktop" | "tablet" | "mobile";

function useTier(): Tier {
  const [tier, setTier] = useState<Tier>("desktop");
  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setTier(width <= 760 ? "mobile" : width <= 1100 ? "tablet" : "desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return tier;
}

const MAX_COLS: Record<Tier, Record<ImageShape, number>> = {
  desktop: { square: 4, portrait: 6, landscape: 4, wide: 2 },
  tablet: { square: 4, portrait: 4, landscape: 3, wide: 2 },
  mobile: { square: 3, portrait: 3, landscape: 2, wide: 1 },
};

function splitRows(count: number, maxCols: number) {
  if (!count) return [];
  const rows = Math.ceil(count / maxCols);
  const base = Math.floor(count / rows);
  const extra = count % rows;
  return Array.from({ length: rows }, (_, index) => base + (index < extra ? 1 : 0));
}

function FolderCard({
  folder,
  index,
  onOpen,
}: {
  folder: ImageFolder;
  index: number;
  onOpen: (folder: ImageFolder, trigger: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      type="button"
      className="image-folder"
      style={{ "--order": index } as React.CSSProperties}
      aria-label={`打开 ${folder.letter} ${folder.zh}，${folder.count} 张图片`}
      onClick={(event) => onOpen(folder, event.currentTarget)}
      onPointerMove={(event) => {
        const element = ref.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        element.style.setProperty("--pointer-x", `${(x * 100).toFixed(2)}%`);
        element.style.setProperty("--pointer-y", `${(y * 100).toFixed(2)}%`);
        element.style.setProperty("--tilt-x", `${((0.5 - y) * 5.2).toFixed(2)}deg`);
        element.style.setProperty("--tilt-y", `${((x - 0.5) * 6.2).toFixed(2)}deg`);
      }}
      onPointerLeave={() => {
        const element = ref.current;
        if (!element) return;
        element.style.setProperty("--pointer-x", "50%");
        element.style.setProperty("--pointer-y", "38%");
        element.style.setProperty("--tilt-x", "0deg");
        element.style.setProperty("--tilt-y", "0deg");
      }}
    >
      <span className="image-folder__tab" aria-hidden="true">
        <span>{folder.letter}</span>
      </span>
      <span className="image-folder__body">
        <span className="image-folder__stack" aria-hidden="true">
          {folder.previews.map((asset, previewIndex) => (
            <span className="image-folder__photo" key={asset.key} style={{ "--preview": previewIndex } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.thumb || asset.src} alt="" loading="lazy" decoding="async" />
            </span>
          ))}
        </span>
        <span className="image-folder__front">
          <span className="image-folder__meta mono">
            <span>{folder.letter}</span>
            <span>{pad(folder.count, 3)}</span>
          </span>
          <span className="image-folder__zh">{folder.zh}</span>
          <span className="image-folder__en">{folder.en}</span>
        </span>
      </span>
    </button>
  );
}

function ArchiveCoverCollage({ folder }: { folder: ImageFolder }) {
  const seen = new Set<string>();
  const images: ImageAsset[] = [];
  folder.pages.forEach((page) => {
    page.items.forEach((item) => {
      if (seen.has(item.src) || images.length >= 5) return;
      seen.add(item.src);
      images.push(item);
    });
  });
  if (!images.length) images.push(folder.cover);

  return (
    <div className="archive-cover__photos">
      {images.map((item, index) => (
        <figure className="archive-cover__photo" key={item.key} style={{ "--cover-photo": index } as React.CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.thumb || item.src} alt="" loading="eager" decoding="async" />
        </figure>
      ))}
    </div>
  );
}

function ArchiveCover({ folder }: { folder: ImageFolder }) {
  return (
    <div className="archive-cover">
      <div className="archive-cover__identity">
        <span className="mono archive-cover__eyebrow">FOLDER {folder.letter}</span>
        <span className="archive-cover__letter display">{folder.letter}</span>
        <h2>{folder.zh}</h2>
        <span className="archive-cover__en">{folder.en}</span>
        <div className="archive-cover__stats mono">
          <span>{pad(folder.count, 3)} IMAGES</span>
          <span>{pad(folder.pages.length + 1)} PAGES</span>
        </div>
      </div>
      <div className="archive-cover__art" aria-hidden="true">
        <ArchiveCoverCollage folder={folder} />
      </div>
    </div>
  );
}

function GridPage({
  page,
  pageNumber,
  tier,
  onOpen,
}: {
  page: ArchivePage;
  pageNumber: number;
  tier: Tier;
  onOpen: (page: ArchivePage, index: number) => void;
}) {
  const maxCols = MAX_COLS[tier][page.shape];
  const rowSizes = useMemo(() => splitRows(page.items.length, maxCols), [maxCols, page.items.length]);
  let cursor = 0;

  return (
    <div className={`archive-page archive-page--${page.shape}`} data-shape={page.shape}>
      <header className="archive-page__head">
        <div className="archive-page__title">
          <span className="mono">{pad(pageNumber)}</span>
          <h2>{page.series}</h2>
        </div>
        <div className="archive-page__shape mono">
          <span>{SHAPE_LABEL[page.shape]}</span>
          <span>{pad(page.items.length)}</span>
        </div>
      </header>

      <div className="archive-page__grid" data-shape={page.shape} data-rows={rowSizes.length}>
        {rowSizes.map((size, rowIndex) => {
          const rowStart = cursor;
          const rowItems = page.items.slice(cursor, cursor + size);
          cursor += size;
          return (
            <div className="archive-page__row" key={`${page.id}-row-${rowIndex}`}>
              {rowItems.map((item, itemIndex) => {
                const imageIndex = rowStart + itemIndex;
                const contain = item.width / item.height > 2.4 || item.width / item.height < 0.52;
                return (
                  <button
                    type="button"
                    className={`archive-tile${contain ? " is-contain" : ""}`}
                    key={`${item.key}-${imageIndex}`}
                    onClick={() => onOpen(page, imageIndex)}
                    aria-label={`放大查看 ${page.series} ${pad(imageIndex + 1)}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumb || item.src} alt={`${page.series} ${pad(imageIndex + 1)}`} loading="eager" decoding="async" />
                    <span className="archive-tile__index mono">{pad(imageIndex + 1)}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <span className="archive-page__folio mono" aria-hidden="true">{pad(pageNumber)}</span>
    </div>
  );
}

function OrbitPage({
  page,
  pageNumber,
  onOpen,
}: {
  page: ArchivePage;
  pageNumber: number;
  onOpen: (page: ArchivePage, index: number) => void;
}) {
  return (
    <div className="archive-page archive-page--orbit" data-shape={page.shape}>
      <header className="archive-page__head">
        <div className="archive-page__title">
          <span className="mono">{pad(pageNumber)}</span>
          <h2>{page.series}</h2>
        </div>
        <div className="archive-page__shape mono">
          <span>RECTANGLE / ORBIT</span>
          <span>{pad(page.items.length)}</span>
        </div>
      </header>
      <CoverOrbit items={page.items} label={page.series} onOpen={(index) => onOpen(page, index)} />
      <span className="archive-page__folio mono" aria-hidden="true">{pad(pageNumber)}</span>
    </div>
  );
}

function Archive({
  folder,
  returnFocus,
  onClose,
}: {
  folder: ImageFolder;
  returnFocus: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const { open, isOpen: lightboxOpen } = useLightbox();
  const { reduced } = useMotion();
  const [pageIndex, setPageIndex] = useState(0);
  const [turn, setTurn] = useState<{ id: number; dir: 1 | -1 } | null>(null);
  const tier = useTier();
  const total = folder.pages.length + 1;
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const turnTimer = useRef<number | null>(null);
  const wheelLock = useRef<number | null>(null);
  const swipeRef = useRef<{ x: number; y: number; active: boolean; moved: boolean } | null>(null);
  const swipeMoved = useRef(false);

  const goTo = useCallback((next: number, dir: 1 | -1) => {
    const clamped = Math.max(0, Math.min(total - 1, next));
    if (clamped === pageIndex) return;
    setPageIndex(clamped);
    if (!reduced) {
      setTurn({ id: Date.now(), dir });
      if (turnTimer.current) window.clearTimeout(turnTimer.current);
      turnTimer.current = window.setTimeout(() => setTurn(null), 720);
    }
  }, [pageIndex, reduced, total]);

  const stepPage = useCallback((delta: 1 | -1) => {
    goTo(pageIndex + delta, delta);
  }, [goTo, pageIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => returnFocus.current?.focus?.({ preventScroll: true }), 40);
    };
  }, [returnFocus]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (document.querySelector(".lightbox")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepPage(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepPage(1);
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
  }, [goTo, onClose, stepPage, total]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      if (document.querySelector(".lightbox")) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 12) return;
      event.preventDefault();
      if (wheelLock.current) return;
      wheelLock.current = window.setTimeout(() => { wheelLock.current = null; }, 620);
      if (delta > 0) stepPage(1);
      else stepPage(-1);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      if (wheelLock.current) window.clearTimeout(wheelLock.current);
    };
  }, [stepPage]);

  useEffect(() => {
    return () => {
      if (turnTimer.current) window.clearTimeout(turnTimer.current);
      if (wheelLock.current) window.clearTimeout(wheelLock.current);
    };
  }, []);

  const openImage = (page: ArchivePage, index: number) => {
    const gallery = page.items.map((item, itemIndex) => ({
      src: item.src,
      alt: `${page.series} ${pad(itemIndex + 1)}`,
      caption: `${page.series} / ${item.key}`,
    }));
    open(gallery, index);
  };

  const page = pageIndex === 0 ? null : folder.pages[pageIndex - 1];
  const progress = total <= 1 ? 1 : (pageIndex + 1) / total;

  return (
    <div
      ref={overlayRef}
      className={`archive-overlay${lightboxOpen ? " is-behind-lightbox" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${folder.letter} ${folder.zh} 作品阅读层`}
      data-folder={folder.letter}
      inert={lightboxOpen || undefined}
      aria-hidden={lightboxOpen || undefined}
    >
      <header className="archive-bar">
        <button ref={closeRef} type="button" className="archive-bar__close" onClick={onClose} aria-label="关闭作品阅读层">
          <Close />
        </button>
        <div className="archive-bar__id">
          <span className="archive-bar__letter display">{folder.letter}</span>
          <span className="archive-bar__name">
            <b>{folder.zh}</b>
            <em>{folder.en}</em>
          </span>
        </div>
        <div className="archive-bar__meta mono">
          <span>{pad(folder.count, 3)} IMAGES</span>
          <span>{pad(pageIndex + 1)} — {pad(total)}</span>
        </div>
      </header>

      <div
        ref={stageRef}
        className="archive-stage"
        onPointerDown={(event) => {
          if ((event.target as Element).closest(".cover-orbit")) return;
          swipeMoved.current = false;
          swipeRef.current = { x: event.clientX, y: event.clientY, active: true, moved: false };
        }}
        onPointerMove={(event) => {
          const swipe = swipeRef.current;
          if (!swipe?.active) return;
          if (Math.abs(event.clientX - swipe.x) > 8) swipe.moved = true;
        }}
        onPointerUp={(event) => {
          const swipe = swipeRef.current;
          swipeRef.current = null;
          if (!swipe?.active) return;
          swipeMoved.current = swipe.moved;
          if (swipe.moved) window.setTimeout(() => { swipeMoved.current = false; }, 140);
          const deltaX = event.clientX - swipe.x;
          const deltaY = event.clientY - swipe.y;
          if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
            stepPage(deltaX < 0 ? 1 : -1);
          }
        }}
        onPointerCancel={() => { swipeRef.current = null; }}
        onClickCapture={(event) => {
          if (!swipeMoved.current) return;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div
          className={`archive-book${turn ? " is-turning" : ""}`}
          data-folder={folder.letter}
          data-page={pageIndex}
          style={{ "--turn-direction": turn?.dir ?? 1 } as React.CSSProperties}
        >
          <div className="archive-book__content" key={pageIndex}>
            {pageIndex === 0 ? <ArchiveCover folder={folder} /> : page?.kind === "orbit" ? (
              <OrbitPage page={page} pageNumber={pageIndex + 1} onOpen={openImage} />
            ) : page ? (
              <GridPage page={page} pageNumber={pageIndex + 1} tier={tier} onOpen={openImage} />
            ) : null}
          </div>
          {turn ? <span key={turn.id} className={`archive-turn ${turn.dir === 1 ? "is-next" : "is-prev"}`} aria-hidden="true" /> : null}
        </div>
      </div>

      <footer className="archive-nav">
        <button type="button" onClick={() => stepPage(-1)} disabled={pageIndex === 0} aria-label="上一页">
          <ChevronLeft />
        </button>
        <div className="archive-nav__progress">
          <span className="mono">{pad(pageIndex + 1)} / {pad(total)}</span>
          <i aria-hidden="true"><b style={{ transform: `scaleX(${progress})` }} /></i>
        </div>
        <button type="button" onClick={() => stepPage(1)} disabled={pageIndex === total - 1} aria-label="下一页">
          <ChevronRight />
        </button>
      </footer>
    </div>
  );
}

export function ImageGallery({ folders }: { folders: ImageFolder[] }) {
  const [selected, setSelected] = useState<ImageFolder | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = folders.reduce((sum, folder) => sum + folder.count, 0);
  const heroImages = [folders[0], folders[1], folders[2], folders[4], folders[5], folders[6]].filter(Boolean).map((folder) => folder.cover);

  return (
    <div
      ref={rootRef}
      className="image-index"
      onPointerMove={(event) => {
        const element = rootRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--mx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(2)}%`);
        element.style.setProperty("--my", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(2)}%`);
      }}
    >
      <section className="wrap image-masthead">
        <div className="image-masthead__title">
          <span className="mono image-masthead__eyebrow">CHAPTER 01 / IMAGE ARCHIVE</span>
          <h1>成象</h1>
          <span className="image-masthead__en display">IMAGE</span>
        </div>
        <div className="image-masthead__collage" aria-hidden="true">
          {heroImages.map((item, index) => (
            <figure className="image-masthead__photo" key={item.key} style={{ "--hero-photo": index } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumb || item.src} alt="" loading="eager" decoding="async" />
            </figure>
          ))}
        </div>
        <div className="image-masthead__counts mono">
          <div><b>{pad(folders.length)}</b><span>FOLDERS</span></div>
          <div><b>{pad(total, 3)}</b><span>IMAGES</span></div>
        </div>
      </section>

      <section className="wrap image-folders" aria-label="成象作品文件夹">
        {folders.map((folder, index) => (
          <FolderCard
            key={folder.letter}
            folder={folder}
            index={index}
            onOpen={(next, trigger) => {
              triggerRef.current = trigger;
              setSelected(next);
            }}
          />
        ))}
        <div className="image-folders__contact" aria-hidden="true">
          {folders.map((folder) => (
            <span key={folder.letter}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={folder.cover.thumb || folder.cover.src} alt="" loading="lazy" decoding="async" />
            </span>
          ))}
          <span className="is-blank" />
          <span className="is-blank" />
        </div>
      </section>

      {selected ? (
        <Archive
          folder={selected}
          returnFocus={triggerRef}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
